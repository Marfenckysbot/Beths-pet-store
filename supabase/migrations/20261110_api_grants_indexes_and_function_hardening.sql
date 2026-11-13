-- Restrict Data API object access and harden helper functions.
-- RLS controls rows; SQL grants control which roles can reach each object.
revoke all privileges on all tables in schema public from anon, authenticated;
grant select on public.categories, public.sellers, public.products, public.reviews to anon;
grant select on all tables in schema public to authenticated;
grant insert, update on public.profiles to authenticated;
grant insert on public.seller_applications to authenticated;
grant insert, update, delete on public.products to authenticated;
grant insert, update, delete on public.favorites to authenticated;

-- Admin membership is checked inside privileged functions, never exposed as a table API.
revoke all on function public.is_marketplace_admin() from public, anon;
grant execute on function public.is_marketplace_admin() to authenticated;
alter function public.touch_updated_at() set search_path = pg_catalog, public;

-- Index foreign keys and common listing / account access paths.
create index if not exists idx_seller_applications_applicant on public.seller_applications(applicant_id);
create index if not exists idx_products_category on public.products(category_id);
create index if not exists idx_products_seller_status_created on public.products(seller_id,status,created_at desc);
create index if not exists idx_orders_customer_created on public.orders(customer_id,created_at desc);
create index if not exists idx_order_items_order on public.order_items(order_id);
create index if not exists idx_order_items_product on public.order_items(product_id);
create index if not exists idx_order_items_seller on public.order_items(seller_id);
create index if not exists idx_payment_transactions_order on public.payment_transactions(order_id);
create index if not exists idx_reviews_customer on public.reviews(customer_id);
create index if not exists idx_reviews_product on public.reviews(product_id);
create index if not exists idx_favorites_product on public.favorites(product_id);
create index if not exists idx_seller_ledger_seller on public.seller_ledger_entries(seller_id);
create index if not exists idx_seller_ledger_order_item on public.seller_ledger_entries(order_item_id);
create index if not exists idx_seller_payouts_seller on public.seller_payouts(seller_id);

-- Keep trigger helper out of the public RPC surface.
revoke all on function public.touch_updated_at() from public, anon, authenticated;
