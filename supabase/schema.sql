-- Beth's Pet Store marketplace schema for Supabase / PostgreSQL.
-- Blueprint only: not deployed, no payment processing.
create extension if not exists pgcrypto;
create table if not exists public.profiles(id uuid primary key references auth.users(id) on delete cascade,display_name text,avatar_url text,country_code char(2),created_at timestamptz not null default now(),updated_at timestamptz not null default now());
create table if not exists public.admin_users(user_id uuid primary key references auth.users(id) on delete cascade,created_at timestamptz not null default now());
alter table public.admin_users enable row level security;
create or replace function public.is_marketplace_admin() returns boolean language sql stable security definer set search_path=public as $$ select exists(select 1 from public.admin_users where user_id=auth.uid()); $$;
create table if not exists public.seller_applications(id uuid primary key default gen_random_uuid(),applicant_id uuid references auth.users(id) on delete set null,business_name text not null,contact_name text not null,email text not null,country_code char(2),website_url text,category text not null,description text not null,status text not null default 'pending' check(status in ('pending','under_review','approved','rejected','withdrawn')),reviewer_notes text,reviewed_at timestamptz,created_at timestamptz not null default now());
create table if not exists public.sellers(id uuid primary key default gen_random_uuid(),owner_user_id uuid not null unique references auth.users(id) on delete restrict,application_id uuid unique references public.seller_applications(id),store_name text not null,slug text not null unique,description text,country_code char(2),logo_url text,status text not null default 'pending' check(status in ('pending','active','paused','suspended')),created_at timestamptz not null default now(),updated_at timestamptz not null default now());
create table if not exists public.categories(id uuid primary key default gen_random_uuid(),name text not null unique,slug text not null unique,description text,is_active boolean not null default true,sort_order integer not null default 0);
create table if not exists public.products(id uuid primary key default gen_random_uuid(),seller_id uuid not null references public.sellers(id) on delete restrict,category_id uuid references public.categories(id) on delete set null,name text not null,slug text not null,description text not null,price_usd numeric(12,2) not null check(price_usd>=0),compare_at_usd numeric(12,2) check(compare_at_usd is null or compare_at_usd>=price_usd),sku text,inventory_quantity integer not null default 0 check(inventory_quantity>=0),image_urls text[] not null default '{}',model_url text check(model_url is null or (length(model_url)<=2048 and model_url ~ '^https://')),status text not null default 'pending' check(status in ('pending','active','rejected','archived')),created_at timestamptz not null default now(),updated_at timestamptz not null default now(),unique(seller_id,slug),unique(seller_id,sku));
create table if not exists public.orders(id uuid primary key default gen_random_uuid(),customer_id uuid not null references auth.users(id) on delete restrict,order_number text not null unique,currency char(3) not null default 'USD' check(currency='USD'),subtotal numeric(12,2) not null check(subtotal>=0),shipping_total numeric(12,2) not null default 0 check(shipping_total>=0),grand_total numeric(12,2) not null check(grand_total>=0),status text not null default 'payment_pending' check(status in ('payment_pending','paid','processing','shipped','delivered','cancelled','refunded')),payment_provider text,provider_reference text,shipping_country char(2),shipping_region text,shipping_city text,shipping_address_encrypted text,created_at timestamptz not null default now());
create table if not exists public.order_items(id uuid primary key default gen_random_uuid(),order_id uuid not null references public.orders(id) on delete cascade,product_id uuid references public.products(id) on delete set null,seller_id uuid not null references public.sellers(id) on delete restrict,product_name_snapshot text not null,quantity integer not null check(quantity>0),unit_price_usd numeric(12,2) not null check(unit_price_usd>=0),created_at timestamptz not null default now());
create table if not exists public.payment_transactions(id uuid primary key default gen_random_uuid(),order_id uuid not null references public.orders(id) on delete restrict,provider text not null,provider_reference text not null unique,amount numeric(12,2) not null check(amount>=0),currency char(3) not null default 'USD' check(currency='USD'),status text not null check(status in ('initiated','succeeded','failed','refunded')),verified_at timestamptz,created_at timestamptz not null default now());
create table if not exists public.reviews(id uuid primary key default gen_random_uuid(),product_id uuid not null references public.products(id) on delete cascade,customer_id uuid not null references auth.users(id) on delete cascade,order_item_id uuid not null unique references public.order_items(id) on delete restrict,rating smallint not null check(rating between 1 and 5),body text,status text not null default 'pending' check(status in ('pending','published','rejected')),created_at timestamptz not null default now());
create table if not exists public.favorites(user_id uuid not null references auth.users(id) on delete cascade,product_id uuid not null references public.products(id) on delete cascade,created_at timestamptz not null default now(),primary key(user_id,product_id));
create or replace function public.touch_updated_at() returns trigger language plpgsql as $$ begin new.updated_at=now(); return new; end; $$;
create trigger profiles_touch before update on public.profiles for each row execute function public.touch_updated_at();
create trigger sellers_touch before update on public.sellers for each row execute function public.touch_updated_at();
create trigger products_touch before update on public.products for each row execute function public.touch_updated_at();
alter table public.profiles enable row level security; alter table public.seller_applications enable row level security; alter table public.sellers enable row level security; alter table public.categories enable row level security; alter table public.products enable row level security; alter table public.orders enable row level security; alter table public.order_items enable row level security; alter table public.payment_transactions enable row level security; alter table public.reviews enable row level security; alter table public.favorites enable row level security;
create policy "profiles read own" on public.profiles for select to authenticated using(id=auth.uid());
create policy "profiles insert own" on public.profiles for insert to authenticated with check(id=auth.uid());
create policy "profiles update own" on public.profiles for update to authenticated using(id=auth.uid()) with check(id=auth.uid());
create policy "applicant read own" on public.seller_applications for select to authenticated using(applicant_id=auth.uid());
create policy "applicant submit own" on public.seller_applications for insert to authenticated with check(applicant_id=auth.uid() and status='pending');
create policy "active sellers public" on public.sellers for select to anon,authenticated using(status='active');
create policy "seller owner read own" on public.sellers for select to authenticated using(owner_user_id=auth.uid());
create policy "active categories public" on public.categories for select to anon,authenticated using(is_active=true);
create policy "active products public" on public.products for select to anon,authenticated using(status='active' and exists(select 1 from public.sellers s where s.id=seller_id and s.status='active'));
create policy "seller read own products" on public.products for select to authenticated using(exists(select 1 from public.sellers s where s.id=seller_id and s.owner_user_id=auth.uid()));
create policy "seller create pending products" on public.products for insert to authenticated with check(status='pending' and exists(select 1 from public.sellers s where s.id=seller_id and s.owner_user_id=auth.uid() and s.status='active'));
create policy "seller edit own products pending" on public.products for update to authenticated using(exists(select 1 from public.sellers s where s.id=seller_id and s.owner_user_id=auth.uid())) with check(status='pending' and exists(select 1 from public.sellers s where s.id=seller_id and s.owner_user_id=auth.uid()));
create policy "seller delete own pending products" on public.products for delete to authenticated using(status='pending' and exists(select 1 from public.sellers s where s.id=seller_id and s.owner_user_id=auth.uid()));
create policy "customer read own orders" on public.orders for select to authenticated using(customer_id=auth.uid());
create policy "customer read own order items" on public.order_items for select to authenticated using(exists(select 1 from public.orders o where o.id=order_id and o.customer_id=auth.uid()));
create policy "seller read own order items" on public.order_items for select to authenticated using(exists(select 1 from public.sellers s where s.id=seller_id and s.owner_user_id=auth.uid()));
create policy "published reviews public" on public.reviews for select to anon,authenticated using(status='published');
create policy "buyer create verified review" on public.reviews for insert to authenticated with check(customer_id=auth.uid() and exists(select 1 from public.order_items oi join public.orders o on o.id=oi.order_id where oi.id=order_item_id and o.customer_id=auth.uid() and o.status='delivered'));
create policy "favorites owner only" on public.favorites for all to authenticated using(user_id=auth.uid()) with check(user_id=auth.uid());
-- No client policies for payment_transactions or admin_users. Payment creation, verification,
-- refunds, order creation and seller payouts must run in trusted server-side code.
-- Never expose service-role keys or payment secrets in browser JavaScript.

-- Seller commission ledger and payout references; raw bank/card data never belongs here.
create table if not exists public.seller_ledger_entries(id uuid primary key default gen_random_uuid(),seller_id uuid not null references public.sellers(id) on delete restrict,order_item_id uuid references public.order_items(id) on delete set null,entry_type text not null check(entry_type in ('sale','commission','refund','adjustment','payout')),amount_usd numeric(12,2) not null,description text,created_at timestamptz not null default now());
create table if not exists public.seller_payouts(id uuid primary key default gen_random_uuid(),seller_id uuid not null references public.sellers(id) on delete restrict,amount_usd numeric(12,2) not null check(amount_usd>0),currency char(3) not null default 'USD' check(currency='USD'),status text not null default 'pending' check(status in ('pending','processing','paid','failed','reversed')),provider text,provider_reference text,created_at timestamptz not null default now(),paid_at timestamptz);
create table if not exists public.seller_payout_accounts(id uuid primary key default gen_random_uuid(),seller_id uuid not null unique references public.sellers(id) on delete restrict,provider text not null,provider_recipient_reference text not null,status text not null default 'unverified' check(status in ('unverified','verified','disabled')),created_at timestamptz not null default now());
alter table public.seller_ledger_entries enable row level security;
alter table public.seller_payouts enable row level security;
alter table public.seller_payout_accounts enable row level security;
create policy "seller reads own ledger" on public.seller_ledger_entries for select to authenticated using(exists(select 1 from public.sellers s where s.id=seller_id and s.owner_user_id=auth.uid()));
create policy "seller reads own payouts" on public.seller_payouts for select to authenticated using(exists(select 1 from public.sellers s where s.id=seller_id and s.owner_user_id=auth.uid()));
create policy "seller reads own payout reference" on public.seller_payout_accounts for select to authenticated using(exists(select 1 from public.sellers s where s.id=seller_id and s.owner_user_id=auth.uid()));
drop policy if exists "buyer create verified review" on public.reviews;
create policy "buyer create verified review" on public.reviews for insert to authenticated with check(customer_id=auth.uid() and exists(select 1 from public.order_items oi join public.orders o on o.id=oi.order_id where oi.id=order_item_id and oi.product_id=reviews.product_id and o.customer_id=auth.uid() and o.status='delivered'));
insert into public.categories(name,slug,description,sort_order) values('Food & treats','food-treats','Pet food and treats',1),('Accessories & toys','accessories-toys','Collars, leads, toys and daily essentials',2),('Beds & comfort','beds-comfort','Rest and comfort products',3),('Habitats & aquatics','habitats-aquatics','Aquarium and habitat supplies',4),('Grooming & care','grooming-care','Grooming and everyday care',5) on conflict(slug) do nothing;
-- Payout rows, ledger entries, payment transactions and admin membership are writable only by trusted server-side code.


-- Private public-site enquiry storage (also maintained as a versioned migration).
create table if not exists public.site_inquiries (
  id uuid primary key default gen_random_uuid(),
  category text not null check (category in ('contact', 'support', 'feedback')),
  name text not null check (char_length(btrim(name)) between 2 and 100),
  email text not null check (email = lower(btrim(email)) and char_length(email) between 5 and 254),
  subject text not null check (char_length(btrim(subject)) between 3 and 120),
  message text not null check (char_length(btrim(message)) between 20 and 3000),
  created_at timestamptz not null default now()
);
create index if not exists site_inquiries_email_created_at_idx on public.site_inquiries (email, created_at desc);
create index if not exists site_inquiries_created_at_idx on public.site_inquiries (created_at desc);
alter table public.site_inquiries enable row level security;
revoke all on table public.site_inquiries from anon, authenticated, service_role;
grant select on table public.site_inquiries to authenticated;
grant select, insert on table public.site_inquiries to service_role;
drop policy if exists "Marketplace admins read site inquiries" on public.site_inquiries;
create policy "Marketplace admins read site inquiries" on public.site_inquiries for select to authenticated using ((select public.is_marketplace_admin()));

-- Make public inquiry submission and per-email throttling atomic.
-- The private limiter stores only a one-way email digest, not the submitted address.
create schema if not exists private;
revoke all on schema private from public, anon, authenticated, service_role;
grant usage on schema private to service_role;

create table if not exists private.site_inquiry_rate_limits (
  email_hash text primary key check (email_hash ~ '^[0-9a-f]{32}$'),
  window_started_at timestamptz not null,
  request_count integer not null check (request_count >= 1)
);
revoke all on table private.site_inquiry_rate_limits from public, anon, authenticated, service_role;
grant select, insert, update, delete on table private.site_inquiry_rate_limits to service_role;

create or replace function public.submit_site_inquiry(
  p_category text,
  p_name text,
  p_email text,
  p_subject text,
  p_message text
)
returns void
language plpgsql
security invoker
set search_path = ''
as $function$
declare
  v_request_count integer;
  v_now timestamptz := pg_catalog.clock_timestamp();
begin
  if current_setting('request.jwt.claim.role', true) is distinct from 'service_role' then
    raise insufficient_privilege using message = 'Service role required';
  end if;

  insert into private.site_inquiry_rate_limits as current_limit
    (email_hash, window_started_at, request_count)
  values (pg_catalog.md5(pg_catalog.lower(pg_catalog.btrim(p_email))), v_now, 1)
  on conflict (email_hash) do update
    set window_started_at = case
          when current_limit.window_started_at <= v_now - interval '1 hour' then v_now
          else current_limit.window_started_at
        end,
        request_count = case
          when current_limit.window_started_at <= v_now - interval '1 hour' then 1
          else current_limit.request_count + 1
        end
  returning request_count into v_request_count;

  if v_request_count > 3 then
    raise sqlstate 'PGRST'
      using message = pg_catalog.json_build_object(
        'message', 'Too many messages from this email address. Please try again later.'
      )::text,
      detail = pg_catalog.json_build_object('status', 429)::text;
  end if;

  insert into public.site_inquiries (category, name, email, subject, message)
  values (
    p_category,
    pg_catalog.btrim(p_name),
    pg_catalog.lower(pg_catalog.btrim(p_email)),
    pg_catalog.btrim(p_subject),
    pg_catalog.btrim(p_message)
  );

  delete from private.site_inquiry_rate_limits
  where window_started_at < v_now - interval '24 hours';
end;
$function$;

revoke all on function public.submit_site_inquiry(text, text, text, text, text)
  from public, anon, authenticated, service_role;
grant execute on function public.submit_site_inquiry(text, text, text, text, text)
  to service_role;
