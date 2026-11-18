-- Defense in depth: the rate-limit table is private and has no client grants.
-- No anon/authenticated policies are intentionally created; service_role bypasses RLS.
ALTER TABLE private.site_inquiry_rate_limits ENABLE ROW LEVEL SECURITY;
