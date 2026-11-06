-- User requested removing application spending/daily caps. Preserve usage history.
ALTER TABLE ai_provider_budget DROP CONSTRAINT ai_provider_budget_reserved_microusd_check;
ALTER TABLE ai_provider_budget ADD CHECK (reserved_microusd >= 0);
ALTER TABLE ai_provider_daily DROP CONSTRAINT ai_provider_daily_requests_check;
ALTER TABLE ai_provider_daily ADD CHECK (requests >= 0);
