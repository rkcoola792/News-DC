CREATE TABLE publishers (
 id uuid PRIMARY KEY DEFAULT gen_random_uuid(), name text NOT NULL CHECK (length(trim(name)) > 0),
 domain text UNIQUE, homepage_url text,
 created_at timestamptz NOT NULL DEFAULT now(), updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE TABLE sources (
 id uuid PRIMARY KEY DEFAULT gen_random_uuid(), name text NOT NULL,
 source_type text NOT NULL CHECK (source_type IN ('RSS','API')), endpoint_url text NOT NULL,
 is_enabled boolean NOT NULL DEFAULT true, config jsonb NOT NULL DEFAULT '{}', last_fetched_at timestamptz,
 created_at timestamptz NOT NULL DEFAULT now(), updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE TABLE categories (slug text PRIMARY KEY, name text NOT NULL);
CREATE TABLE tags (id uuid PRIMARY KEY DEFAULT gen_random_uuid(), name text NOT NULL UNIQUE);
CREATE TABLE content_items (
 id uuid PRIMARY KEY DEFAULT gen_random_uuid(), source_id uuid REFERENCES sources(id),
 publisher_id uuid REFERENCES publishers(id), external_id text,
 content_type text NOT NULL CHECK (content_type IN ('ARTICLE','VIDEO','RESEARCH','DISCUSSION')),
 title text NOT NULL CHECK (length(trim(title)) > 0), description text,
 url text NOT NULL CHECK (url ~* '^https?://[^[:space:]]+$'), canonical_url text,
 author text, published_at timestamptz, thumbnail_url text,
 duration_seconds integer CHECK (duration_seconds >= 0), content_text text,
 ai_summary text, key_insights jsonb CHECK (jsonb_typeof(key_insights) = 'array'),
 intelligence_type text CHECK (intelligence_type IN ('NEWS','TECHNICAL_RESEARCH','INVESTMENT_INTELLIGENCE','ENGINEERING_IDEA','OTHER')),
 is_data_center_relevant boolean, relevance_confidence numeric CHECK (relevance_confidence BETWEEN 0 AND 1),
 relevance_score numeric CHECK (relevance_score BETWEEN 0 AND 100), quality_score numeric CHECK (quality_score BETWEEN 0 AND 100),
 ai_status text NOT NULL DEFAULT 'PENDING' CHECK (ai_status IN ('PENDING','PROCESSING','COMPLETED','FAILED','SKIPPED')),
 ai_model text, prompt_version text, ai_processed_at timestamptz,
 metadata jsonb NOT NULL DEFAULT '{}' CHECK (jsonb_typeof(metadata) = 'object'), content_fingerprint text,
 search_vector tsvector GENERATED ALWAYS AS (
   setweight(to_tsvector('english', coalesce(title,'')), 'A') ||
   setweight(to_tsvector('english', coalesce(description,'') || ' ' || coalesce(ai_summary,'') || ' ' || coalesce(content_text,'')), 'B')
 ) STORED,
 created_at timestamptz NOT NULL DEFAULT now(), updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE UNIQUE INDEX content_canonical_url_unique ON content_items(canonical_url) WHERE canonical_url IS NOT NULL;
CREATE INDEX content_published_idx ON content_items(published_at DESC);
CREATE INDEX content_type_published_idx ON content_items(content_type, published_at DESC);
CREATE INDEX content_relevant_status_idx ON content_items(is_data_center_relevant, ai_status);
CREATE INDEX content_search_idx ON content_items USING gin(search_vector);
CREATE INDEX content_fingerprint_idx ON content_items(content_fingerprint) WHERE content_fingerprint IS NOT NULL;
CREATE TABLE content_category_map (
 content_id uuid REFERENCES content_items(id) ON DELETE CASCADE,
 category_slug text REFERENCES categories(slug), PRIMARY KEY(content_id, category_slug)
);
CREATE INDEX category_content_idx ON content_category_map(category_slug, content_id);
CREATE TABLE content_tag_map (
 content_id uuid REFERENCES content_items(id) ON DELETE CASCADE,
 tag_id uuid REFERENCES tags(id), PRIMARY KEY(content_id, tag_id)
);
CREATE INDEX tag_content_idx ON content_tag_map(tag_id, content_id);
CREATE TABLE ingestion_runs (
 id uuid PRIMARY KEY DEFAULT gen_random_uuid(), source_id uuid NOT NULL REFERENCES sources(id),
 status text NOT NULL CHECK (status IN ('PENDING','RUNNING','COMPLETED','FAILED')),
 started_at timestamptz NOT NULL DEFAULT now(), ended_at timestamptz,
 fetched_count integer NOT NULL DEFAULT 0 CHECK (fetched_count >= 0),
 inserted_count integer NOT NULL DEFAULT 0 CHECK (inserted_count >= 0),
 skipped_count integer NOT NULL DEFAULT 0 CHECK (skipped_count >= 0),
 failed_count integer NOT NULL DEFAULT 0 CHECK (failed_count >= 0), error_summary text
);
CREATE TABLE content_processing_logs (
 id uuid PRIMARY KEY DEFAULT gen_random_uuid(), content_id uuid NOT NULL REFERENCES content_items(id) ON DELETE CASCADE,
 status text NOT NULL CHECK (status IN ('PENDING','PROCESSING','COMPLETED','FAILED','SKIPPED')),
 retry_count integer NOT NULL DEFAULT 0 CHECK (retry_count >= 0),
 model text, prompt_version text, started_at timestamptz NOT NULL DEFAULT now(), ended_at timestamptz, error_summary text
);
CREATE TABLE content_relations (
 content_id uuid REFERENCES content_items(id) ON DELETE CASCADE,
 related_content_id uuid REFERENCES content_items(id) ON DELETE CASCADE,
 score numeric CHECK (score BETWEEN 0 AND 100), reason text,
 PRIMARY KEY(content_id, related_content_id), CHECK (content_id <> related_content_id)
);
CREATE FUNCTION touch_updated_at() RETURNS trigger LANGUAGE plpgsql AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END;
$$;
CREATE TRIGGER content_updated BEFORE UPDATE ON content_items FOR EACH ROW EXECUTE FUNCTION touch_updated_at();
CREATE TRIGGER publisher_updated BEFORE UPDATE ON publishers FOR EACH ROW EXECUTE FUNCTION touch_updated_at();
CREATE TRIGGER source_updated BEFORE UPDATE ON sources FOR EACH ROW EXECUTE FUNCTION touch_updated_at();
