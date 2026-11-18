-- Seller-submitted product photos must be secure HTTPS URLs.
-- Supabase Storage public URLs are HTTPS; reject insecure remote image links and
-- cap a listing at the five photos advertised in the seller portal.
alter table public.products
  drop constraint if exists products_image_urls_https_check;

alter table public.products
  add constraint products_image_urls_https_check
  check (
    cardinality(image_urls) <= 5
    and array_position(image_urls, null) is null
    and array_to_string(image_urls, E'\n') ~ '^(https://[^\n]+(\nhttps://[^\n]+){0,4})?$'
  );