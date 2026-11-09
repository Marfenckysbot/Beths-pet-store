-- Beth's Pet Store: seller inventory management.
-- Apply after the existing marketplace and image-storage migrations.
-- Sellers can update stock without unpublishing a listing. Content edits return
-- the product to pending review; archive/restore is ownership-checked server-side.

create or replace function public.seller_update_inventory(
  p_product_id uuid,
  p_inventory_quantity integer
) returns public.products
language plpgsql
security definer
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
     and s.owner_user_id = auth.uid()
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
security definer
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
     and s.owner_user_id = auth.uid()
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
