CREATE TABLE ai_output_cache (
 key text PRIMARY KEY, kind text NOT NULL, payload jsonb NOT NULL,
 created_at timestamptz NOT NULL DEFAULT now(), expires_at timestamptz NOT NULL
);
CREATE INDEX ai_output_cache_expiry_idx ON ai_output_cache(expires_at);
CREATE TABLE app_settings (
 key text PRIMARY KEY, value jsonb NOT NULL,
 updated_at timestamptz NOT NULL DEFAULT now()
);
