-- Close seller product ownership reassignment and remove unnecessary SECURITY DEFINER inventory RPCs.
-- Sellers may edit their own listing fields and stock, but never transfer ownership
-- or self-publish/reject a product through the Data API.

-- Replace the table-wide UPDATE grant with explicit, required columns only.
revoke update on table public.products from authenticated;
grant update (category_id, name, slug, description, price_usd, model_url, status, inventory_quantity)
  on table public.products to authenticated;

-- A seller can move their own listing to pending (content edit) or archived,
-- but cannot self-publish or mark a listing rejected. Admins/service role retain
-- their moderation capability.
create or replace function public.guard_product_seller_status_change()
returns trigger
language plpgsql
security invoker
set search_path = public
as $$
begin
  if new.status is distinct from old.status
     and current_user not in ('service_role', 'postgres')
     and not public.is_marketplace_admin()
     and new.status not in ('pending', 'archived') then
    raise exception 'Sellers may only return listings to pending review or archive them'
      using errcode = '42501';
  end if;
  return new;
end;
$$;

revoke all on function public.guard_product_seller_status_change() from public, anon, authenticated;
drop trigger if exists products_guard_seller_status on public.products;
create trigger products_guard_seller_status
before update of status on public.products
for each row execute function public.guard_product_seller_status_change();

-- This policy allows an active seller to update stock while preserving the
-- current listing status, and to archive/restore their own listing. The trigger
-- above prevents status escalation even though the policy supports active rows.
drop policy if exists "active seller manage product inventory and archive" on public.products;
create policy "active seller manage product inventory and archive"
  on public.products for update to authenticated
  using (exists (
    select 1 from public.sellers s
    where s.id = products.seller_id
      and s.owner_user_id = (select auth.uid())
      and s.status = 'active'
  ))
  with check (
    status in ('pending', 'active', 'archived')
    and exists (
      select 1 from public.sellers s
      where s.id = products.seller_id
        and s.owner_user_id = (select auth.uid())
        and s.status = 'active'
    )
  );

-- These functions now execute under the caller's RLS and column grants.
create or replace function public.seller_update_inventory(
  p_product_id uuid,
  p_inventory_quantity integer
) returns public.products
language plpgsql
security invoker
set search_path = public
as $$
declare
  v_product public.products;
begin
  if auth.uid() is null then
    raise exception 'Sign in is required' using errcode = '28000';
  end if;
  if p_inventory_quantity is null or p_inventory_quantity < 0 then
    raise exception 'Stock quantity must be zero or greater';
  end if;

  update public.products p
     set inventory_quantity = p_inventory_quantity,
         updated_at = now()
    from public.sellers s
   where p.id = p_product_id
     and s.id = p.seller_id
     and s.owner_user_id = (select auth.uid())
     and s.status = 'active'
  returning p.* into v_product;

  if not found then
    raise exception 'Product not found or active seller access required' using errcode = '42501';
  end if;
  return v_product;
end;
$$;

create or replace function public.seller_set_product_archived(
  p_product_id uuid,
  p_archived boolean
) returns public.products
language plpgsql
security invoker
set search_path = public
as $$
declare
  v_product public.products;
begin
  if auth.uid() is null then
    raise exception 'Sign in is required' using errcode = '28000';
  end if;

  update public.products p
     set status = case when coalesce(p_archived, true) then 'archived' else 'pending' end,
         updated_at = now()
    from public.sellers s
   where p.id = p_product_id
     and s.id = p.seller_id
     and s.owner_user_id = (select auth.uid())
  returning p.* into v_product;

  if not found then
    raise exception 'Product not found or seller ownership could not be verified' using errcode = '42501';
  end if;
  return v_product;
end;
$$;

revoke all on function public.seller_update_inventory(uuid, integer) from public, anon;
revoke all on function public.seller_set_product_archived(uuid, boolean) from public, anon;
grant execute on function public.seller_update_inventory(uuid, integer) to authenticated;
grant execute on function public.seller_set_product_archived(uuid, boolean) to authenticated;
