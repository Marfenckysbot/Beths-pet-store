-- Let an authenticated applicant claim only their own approved application.
-- The table policy is the authorization boundary; the RPC no longer bypasses RLS.
grant insert on public.sellers to authenticated;

drop policy if exists "applicant claim approved seller" on public.sellers;
create policy "applicant claim approved seller" on public.sellers
for insert to authenticated
with check (
  owner_user_id = (select auth.uid())
  and status = 'pending'
  and exists (
    select 1
    from public.seller_applications a
    where a.id = application_id
      and a.applicant_id = (select auth.uid())
      and a.status = 'approved'
      and a.business_name = store_name
      and a.description is not distinct from sellers.description
      and a.country_code is not distinct from sellers.country_code
  )
);

create or replace function public.claim_approved_seller(
  p_application_id uuid,
  p_store_slug text
) returns uuid
language plpgsql
security invoker
set search_path = public
as $$
declare
  v_application public.seller_applications;
  v_slug text;
  v_seller_id uuid;
begin
  if auth.uid() is null then
    raise exception 'Sign in is required' using errcode = '28000';
  end if;

  select *
    into v_application
    from public.seller_applications
   where id = p_application_id
     and applicant_id = (select auth.uid());

  if not found or v_application.status <> 'approved' then
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
    (select auth.uid()), v_application.id, v_application.business_name, v_slug,
    v_application.description, v_application.country_code, 'pending'
  )
  returning id into v_seller_id;

  return v_seller_id;
exception
  when unique_violation then
    raise exception 'This application has already been claimed or the store URL is taken';
end;
$$;

revoke all on function public.claim_approved_seller(uuid, text) from public, anon;
grant execute on function public.claim_approved_seller(uuid, text) to authenticated;
