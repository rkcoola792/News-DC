CREATE UNIQUE INDEX content_fingerprint_unique ON content_items(content_fingerprint) WHERE content_fingerprint IS NOT NULL;
