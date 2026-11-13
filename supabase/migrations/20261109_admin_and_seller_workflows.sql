-- Beth's Pet Store: admin moderation and approved seller claiming.
-- Apply after supabase/schema.sql in the Supabase SQL editor.
-- No service-role key or payment credentials are used by browser clients.

-- Moderators can review applications without exposing them to other sellers.
drop policy if exists "admin read seller applications" on public.seller_applications;
create policy "admin read seller applications"
  on public.seller_applications for select to authenticated
  using (public.is_marketplace_admin());

drop policy if exists "admin update seller applications" on public.seller_applications;
create policy "admin update seller applications"
  on public.seller_applications for update to authenticated
  using (public.is_marketplace_admin())
  with check (public.is_marketplace_admin());

drop policy if exists "admin read all sellers" on public.sellers;
create policy "admin read all sellers"
  on public.sellers for select to authenticated
  using (public.is_marketplace_admin());

drop policy if exists "admin update sellers" on public.sellers;
create policy "admin update sellers"
  on public.sellers for update to authenticated
  using (public.is_marketplace_admin())
  with check (public.is_marketplace_admin());

drop policy if exists "admin read all products" on public.products;
create policy "admin read all products"
  on public.products for select to authenticated
  using (public.is_marketplace_admin());

drop policy if exists "admin moderate products" on public.products;
create policy "admin moderate products"
  on public.products for update to authenticated
  using (public.is_marketplace_admin())
  with check (public.is_marketplace_admin());

drop policy if exists "admin read orders" on public.orders;
create policy "admin read orders"
  on public.orders for select to authenticated
  using (public.is_marketplace_admin());

drop policy if exists "admin read payment transactions" on public.payment_transactions;
create policy "admin read payment transactions"
  on public.payment_transactions for select to authenticated
  using (public.is_marketplace_admin());

drop policy if exists "admin read seller ledger" on public.seller_ledger_entries;
create policy "admin read seller ledger"
  on public.seller_ledger_entries for select to authenticated
  using (public.is_marketplace_admin());

drop policy if exists "admin read seller payouts" on public.seller_payouts;
create policy "admin read seller payouts"
  on public.seller_payouts for select to authenticated
  using (public.is_marketplace_admin());

drop policy if exists "admin read payout references" on public.seller_payout_accounts;
create policy "admin read payout references"
  on public.seller_payout_accounts for select to authenticated
  using (public.is_marketplace_admin());

-- Review decisions are made only by authenticated users listed in admin_users.
create or replace function public.review_seller_application(
  p_application_id uuid,
  p_decision text,
  p_reviewer_notes text default null
) returns public.seller_applications
language plpgsql
security definer
set search_path = public
as $$
declare
  v_application public.seller_applications;
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
     and status in ('pending', 'under_review')
   returning * into v_application;

  if not found then
    raise exception 'Application not found or no longer reviewable';
  end if;
  return v_application;
end;
$$;

-- Applicants submit interest before an account exists. After approval they can
-- sign up with the same email address and claim their approved seller profile.
create or replace function public.claim_approved_seller(
  p_application_id uuid,
  p_store_slug text
) returns uuid
language plpgsql
security definer
set search_path = public, auth
as $$
declare
  v_application public.seller_applications;
  v_user_email text;
  v_email_confirmed_at timestamptz;
  v_slug text;
  v_seller_id uuid;
begin
  if auth.uid() is null then
    raise exception 'Sign in is required' using errcode = '28000';
  end if;

  select lower(email), email_confirmed_at
    into v_user_email, v_email_confirmed_at
    from auth.users
   where id = auth.uid();

  if v_email_confirmed_at is null then
    raise exception 'Confirm your email address before claiming an approved seller application' using errcode = '42501';
  end if;

  select * into v_application
    from public.seller_applications
   where id = p_application_id
   for update;

  if not found or v_application.status <> 'approved' then
    raise exception 'No approved application is available to claim';
  end if;
  if lower(v_application.email) <> coalesce(v_user_email, '')
     or (v_application.applicant_id is not null and v_application.applicant_id <> auth.uid()) then
    raise exception 'Sign in with the email address used on the approved application' using errcode = '42501';
  end if;

  v_slug := trim(both '-' from regexp_replace(lower(coalesce(p_store_slug, '')), '[^a-z0-9]+', '-', 'g'));
  if length(v_slug) < 3 or length(v_slug) > 70 then
    raise exception 'Store URL must be between 3 and 70 letters or numbers';
  end if;

  insert into public.sellers (
    owner_user_id, application_id, store_name, slug, description,
    country_code, status
  ) values (
    auth.uid(), v_application.id, v_application.business_name, v_slug,
    v_application.description, v_application.country_code, 'pending'
  ) returning id into v_seller_id;

  update public.seller_applications
     set applicant_id = auth.uid()
   where id = v_application.id;

  return v_seller_id;
exception
  when unique_violation then
    raise exception 'This application has already been claimed or the store URL is taken';
end;
$$;

-- Seller activation is deliberately separate from application approval:
-- a human moderator must verify the seller profile before its store is public.
create or replace function public.set_seller_moderation_status(
  p_seller_id uuid,
  p_status text
) returns public.sellers
language plpgsql
security definer
set search_path = public
as $$
declare
  v_seller public.sellers;
begin
  if not public.is_marketplace_admin() then
    raise exception 'Administrator access required' using errcode = '42501';
  end if;
  if p_status is null or p_status not in ('active', 'paused', 'suspended', 'pending') then
    raise exception 'Invalid seller status';
  end if;

  update public.sellers
     set status = p_status
   where id = p_seller_id
   returning * into v_seller;

  if not found then
    raise exception 'Seller not found';
  end if;
  return v_seller;
end;
$$;

create or replace function public.review_marketplace_product(
  p_product_id uuid,
  p_decision text
) returns public.products
language plpgsql
security definer
set search_path = public
as $$
declare
  v_product public.products;
begin
  if not public.is_marketplace_admin() then
    raise exception 'Administrator access required' using errcode = '42501';
  end if;
  if p_decision is null or p_decision not in ('active', 'rejected', 'pending', 'archived') then
    raise exception 'Invalid product decision';
  end if;
  if p_decision = 'active' and not exists (
    select 1 from public.products p
    join public.sellers s on s.id = p.seller_id
    where p.id = p_product_id and s.status = 'active'
  ) then
    raise exception 'Activate and verify the seller before publishing products';
  end if;

  update public.products
     set status = p_decision
   where id = p_product_id
   returning * into v_product;

  if not found then
    raise exception 'Product not found';
  end if;
  return v_product;
end;
$$;

revoke all on function public.review_seller_application(uuid, text, text) from public, anon;
revoke all on function public.claim_approved_seller(uuid, text) from public, anon;
revoke all on function public.set_seller_moderation_status(uuid, text) from public, anon;
revoke all on function public.review_marketplace_product(uuid, text) from public, anon;
grant execute on function public.review_seller_application(uuid, text, text) to authenticated;
grant execute on function public.claim_approved_seller(uuid, text) to authenticated;
grant execute on function public.set_seller_moderation_status(uuid, text) to authenticated;
grant execute on function public.review_marketplace_product(uuid, text) to authenticated;
