-- Optional seller-supplied 3D product model URL. The URL is public media only;
-- never use it for credentials or private files.
alter table public.products
  add column if not exists model_url text;

alter table public.products
  drop constraint if exists products_model_url_https_check;

alter table public.products
  add constraint products_model_url_https_check
  check (model_url is null or (length(model_url) <= 2048 and model_url ~ '^https://'));
