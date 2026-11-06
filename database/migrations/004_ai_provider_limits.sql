-- Persistent demo allowance: one shared OpenAI budget, never reset automatically.
CREATE TABLE ai_provider_budget (
 id text PRIMARY KEY,
 reserved_microusd integer NOT NULL DEFAULT 0 CHECK (reserved_microusd BETWEEN 0 AND 1000000)
);
CREATE TABLE ai_provider_daily (
 day text PRIMARY KEY,
 requests integer NOT NULL DEFAULT 0 CHECK (requests BETWEEN 0 AND 50)
);
CREATE TABLE ai_provider_calls (
 id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
 provider text NOT NULL CHECK (provider IN ('gemini', 'openai')),
 model text NOT NULL,
 status text NOT NULL DEFAULT 'RESERVED',
 reserved_microusd integer NOT NULL DEFAULT 0,
 input_tokens integer,
 output_tokens integer,
 error_code text,
 created_at timestamptz NOT NULL DEFAULT now(),
 ended_at timestamptz
);
CREATE INDEX ai_provider_calls_created_idx ON ai_provider_calls(created_at DESC);
