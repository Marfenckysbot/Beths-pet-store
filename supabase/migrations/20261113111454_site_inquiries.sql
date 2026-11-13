create table if not exists public.site_inquiries (
  id uuid primary key default gen_random_uuid(),
  category text not null check (category in ('contact', 'support', 'feedback')),
  name text not null check (char_length(btrim(name)) between 2 and 100),
  email text not null check (email = lower(btrim(email)) and char_length(email) between 5 and 254),
  subject text not null check (char_length(btrim(subject)) between 3 and 120),
  message text not null check (char_length(btrim(message)) between 20 and 3000),
  created_at timestamptz not null default now()
);

create index if not exists site_inquiries_email_created_at_idx
  on public.site_inquiries (email, created_at desc);
create index if not exists site_inquiries_created_at_idx
  on public.site_inquiries (created_at desc);

alter table public.site_inquiries enable row level security;

revoke all on table public.site_inquiries from anon, authenticated, service_role;
grant select on table public.site_inquiries to authenticated;
grant select, insert on table public.site_inquiries to service_role;

drop policy if exists "Marketplace admins read site inquiries" on public.site_inquiries;
create policy "Marketplace admins read site inquiries"
  on public.site_inquiries
  for select
  to authenticated
  using ((select public.is_marketplace_admin()));
