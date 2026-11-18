-- Keep internal moderation notes out of applicant-visible Data API reads.
-- Portal callers select explicit safe columns; the claim RPC is narrowed
-- so it does not require SELECT on reviewer_notes.

revoke select on table public.seller_applications from authenticated;
grant select (
  id, applicant_id, business_name, contact_name, email, country_code,
  website_url, category, description, status, reviewed_at, created_at
) on table public.seller_applications to authenticated;

-- The claim RPC needs only the applicant-visible fields it consumes. Avoid SELECT *.
create or replace function public.claim_approved_seller(
  p_application_id uuid,
  p_store_slug text
) returns uuid
language plpgsql
security invoker
set search_path = public
as $$
declare
  v_application_id uuid;
  v_business_name text;
  v_description text;
  v_country_code char(2);
  v_status text;
  v_slug text;
  v_seller_id uuid;
begin
  if auth.uid() is null then
    raise exception 'Sign in is required' using errcode = '28000';
  end if;

  select id, business_name, description, country_code, status
    into v_application_id, v_business_name, v_description, v_country_code, v_status
    from public.seller_applications
   where id = p_application_id
     and applicant_id = (select auth.uid());

  if not found or v_status <> 'approved' then
    raise exception 'No approved application is available to claim' using errcode = '42501';
  end if;

  v_slug := trim(both '-' from regexp_replace(lower(coalesce(p_store_slug, '')), '[^a-z0-9]+', '-', 'g'));
  if length(v_slug) < 3 or length(v_slug) > 70 then
    raise exception 'Store URL must be between 3 and 70 letters or numbers';
  end if;

  insert into public.sellers (
    owner_user_id, application_id, store_name, slug, description, country_code, status
  )
  values (
    (select auth.uid()), v_application_id, v_business_name, v_slug,
    v_description, v_country_code, 'pending'
  )
  returning id into v_seller_id;

  return v_seller_id;
exception
  when unique_violation then
    raise exception 'This application has already been claimed or the store URL is taken';
end;
$$;

-- Review decisions update private notes but return no application row.
drop function public.review_seller_application(uuid, text, text);
create function public.review_seller_application(
  p_application_id uuid,
  p_decision text,
  p_reviewer_notes text default null
) returns void
language plpgsql
security invoker
set search_path = public
as $$
begin
  if not public.is_marketplace_admin() then
    raise exception 'Administrator access required' using errcode = '42501';
  end if;
  if p_decision is null or p_decision not in ('under_review', 'approved', 'rejected') then
    raise exception 'Invalid application decision';
  end if;

  update public.seller_applications
     set status = p_decision,
         reviewer_notes = nullif(left(coalesce(p_reviewer_notes, ''), 2000), ''),
         reviewed_at = now()
   where id = p_application_id
     and status in ('pending', 'under_review');

  if not found then
    raise exception 'Application not found or no longer reviewable';
  end if;
end;
$$;

revoke all on function public.claim_approved_seller(uuid, text) from public, anon;
grant execute on function public.claim_approved_seller(uuid, text) to authenticated;
revoke all on function public.review_seller_application(uuid, text, text) from public, anon;
grant execute on function public.review_seller_application(uuid, text, text) to authenticated;
