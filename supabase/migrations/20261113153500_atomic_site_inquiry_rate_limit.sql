-- Make public inquiry submission and per-email throttling atomic.
-- The private limiter stores only a one-way email digest, not the submitted address.
create schema if not exists private;
revoke all on schema private from public, anon, authenticated, service_role;

create table if not exists private.site_inquiry_rate_limits (
  email_hash text primary key check (email_hash ~ '^[0-9a-f]{32}$'),
  window_started_at timestamptz not null,
  request_count integer not null check (request_count >= 1)
);
revoke all on table private.site_inquiry_rate_limits from public, anon, authenticated, service_role;

create or replace function public.submit_site_inquiry(
  p_category text,
  p_name text,
  p_email text,
  p_subject text,
  p_message text
)
returns void
language plpgsql
security definer
set search_path = ''
as $function$
declare
  v_request_count integer;
  v_now timestamptz := pg_catalog.clock_timestamp();
begin
  if current_setting('request.jwt.claim.role', true) is distinct from 'service_role' then
    raise insufficient_privilege using message = 'Service role required';
  end if;

  insert into private.site_inquiry_rate_limits as current_limit
    (email_hash, window_started_at, request_count)
  values (pg_catalog.md5(pg_catalog.lower(pg_catalog.btrim(p_email))), v_now, 1)
  on conflict (email_hash) do update
    set window_started_at = case
          when current_limit.window_started_at <= v_now - interval '1 hour' then v_now
          else current_limit.window_started_at
        end,
        request_count = case
          when current_limit.window_started_at <= v_now - interval '1 hour' then 1
          else current_limit.request_count + 1
        end
  returning request_count into v_request_count;

  if v_request_count > 3 then
    raise sqlstate 'PGRST'
      using message = pg_catalog.json_build_object(
        'message', 'Too many messages from this email address. Please try again later.'
      )::text,
      detail = pg_catalog.json_build_object('status', 429)::text;
  end if;

  insert into public.site_inquiries (category, name, email, subject, message)
  values (
    p_category,
    pg_catalog.btrim(p_name),
    pg_catalog.lower(pg_catalog.btrim(p_email)),
    pg_catalog.btrim(p_subject),
    pg_catalog.btrim(p_message)
  );

  delete from private.site_inquiry_rate_limits
  where window_started_at < v_now - interval '24 hours';
end;
$function$;

revoke all on function public.submit_site_inquiry(text, text, text, text, text)
  from public, anon, authenticated, service_role;
grant execute on function public.submit_site_inquiry(text, text, text, text, text)
  to service_role;
