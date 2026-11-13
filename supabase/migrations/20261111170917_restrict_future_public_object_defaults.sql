-- New public-schema objects must be exposed intentionally.
-- This affects future objects created by postgres; existing table/function grants are unchanged.
-- The Data API uses anon/authenticated/service_role grants, so keep them absent by default.

alter default privileges for role postgres in schema public
  revoke all on tables from anon, authenticated, service_role;

alter default privileges for role postgres in schema public
  revoke all on sequences from anon, authenticated, service_role;

alter default privileges for role postgres in schema public
  revoke all on functions from anon, authenticated, service_role;

-- PostgreSQL grants EXECUTE on new functions to PUBLIC by default.
-- Remove that default too; migrations must grant execution to intended roles explicitly.
alter default privileges for role postgres
  revoke execute on functions from public;
