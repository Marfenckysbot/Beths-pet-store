-- Sellers create listings through the portal using only these fields.
-- Keep identifiers and timestamps database-managed; ownership and pending status
-- are still enforced by the products INSERT RLS policy.
revoke insert on table public.products from authenticated;
grant insert (
  seller_id, category_id, name, slug, description, price_usd,
  model_url, status, inventory_quantity, image_urls
) on table public.products to authenticated;
