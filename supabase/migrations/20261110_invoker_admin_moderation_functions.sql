-- Admin membership lookup can run as the caller because admins may read only their own membership row.
drop policy if exists "admin users read own membership" on public.admin_users;
create policy "admin users read own membership" on public.admin_users
for select to authenticated
using (user_id = (select auth.uid()));

create or replace function public.is_marketplace_admin()
returns boolean
language sql
stable
security invoker
set search_path = public
as $$ select exists(select 1 from public.admin_users where user_id = auth.uid()); $$;

-- These moderation RPCs rely on the caller's RLS-protected admin membership.
-- SECURITY INVOKER keeps the database row policies as the actual authorization boundary.
create or replace function public.review_seller_application(
  p_application_id uuid,
  p_decision text,
  p_reviewer_notes text default null
) returns public.seller_applications
language plpgsql
security invoker
set search_path = public
as $$
declare v_application public.seller_applications;
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

create or replace function public.set_seller_moderation_status(
  p_seller_id uuid,
  p_status text
) returns public.sellers
language plpgsql
security invoker
set search_path = public
as $$
declare v_seller public.sellers;
begin
  if not public.is_marketplace_admin() then
    raise exception 'Administrator access required' using errcode = '42501';
  end if;
  if p_status is null or p_status not in ('active', 'paused', 'suspended', 'pending') then
    raise exception 'Invalid seller status';
  end if;
  update public.sellers set status = p_status where id = p_seller_id returning * into v_seller;
  if not found then raise exception 'Seller not found'; end if;
  return v_seller;
end;
$$;

create or replace function public.review_marketplace_product(
  p_product_id uuid,
  p_decision text
) returns public.products
language plpgsql
security invoker
set search_path = public
as $$
declare v_product public.products;
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
  update public.products set status = p_decision where id = p_product_id returning * into v_product;
  if not found then raise exception 'Product not found'; end if;
  return v_product;
end;
$$;
