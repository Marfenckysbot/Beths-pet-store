-- Cache auth.uid() once per statement in RLS predicates for better query plans.
drop policy if exists "profiles read own" on public.profiles;
create policy "profiles read own" on public.profiles for select to authenticated using (id = (select auth.uid()));
drop policy if exists "profiles insert own" on public.profiles;
create policy "profiles insert own" on public.profiles for insert to authenticated with check (id = (select auth.uid()));
drop policy if exists "profiles update own" on public.profiles;
create policy "profiles update own" on public.profiles for update to authenticated using (id = (select auth.uid())) with check (id = (select auth.uid()));

drop policy if exists "applicant read own" on public.seller_applications;
create policy "applicant read own" on public.seller_applications for select to authenticated using (applicant_id = (select auth.uid()));
drop policy if exists "applicant submit own" on public.seller_applications;
create policy "applicant submit own" on public.seller_applications for insert to authenticated with check (applicant_id = (select auth.uid()) and status = 'pending');

drop policy if exists "seller owner read own" on public.sellers;
create policy "seller owner read own" on public.sellers for select to authenticated using (owner_user_id = (select auth.uid()));

drop policy if exists "seller read own products" on public.products;
create policy "seller read own products" on public.products for select to authenticated using (exists (select 1 from public.sellers s where s.id = seller_id and s.owner_user_id = (select auth.uid())));
drop policy if exists "seller create pending products" on public.products;
create policy "seller create pending products" on public.products for insert to authenticated with check (status = 'pending' and exists (select 1 from public.sellers s where s.id = seller_id and s.owner_user_id = (select auth.uid()) and s.status = 'active'));
drop policy if exists "seller edit own products pending" on public.products;
create policy "seller edit own products pending" on public.products for update to authenticated using (exists (select 1 from public.sellers s where s.id = seller_id and s.owner_user_id = (select auth.uid()))) with check (status = 'pending' and exists (select 1 from public.sellers s where s.id = seller_id and s.owner_user_id = (select auth.uid())));
drop policy if exists "seller delete own pending products" on public.products;
create policy "seller delete own pending products" on public.products for delete to authenticated using (status = 'pending' and exists (select 1 from public.sellers s where s.id = seller_id and s.owner_user_id = (select auth.uid())));

drop policy if exists "customer read own orders" on public.orders;
create policy "customer read own orders" on public.orders for select to authenticated using (customer_id = (select auth.uid()));
drop policy if exists "customer read own order items" on public.order_items;
create policy "customer read own order items" on public.order_items for select to authenticated using (exists (select 1 from public.orders o where o.id = order_id and o.customer_id = (select auth.uid())));
drop policy if exists "seller read own order items" on public.order_items;
create policy "seller read own order items" on public.order_items for select to authenticated using (exists (select 1 from public.sellers s where s.id = seller_id and s.owner_user_id = (select auth.uid())));

drop policy if exists "buyer create verified review" on public.reviews;
create policy "buyer create verified review" on public.reviews for insert to authenticated with check (customer_id = (select auth.uid()) and exists (select 1 from public.order_items oi join public.orders o on o.id = oi.order_id where oi.id = order_item_id and oi.product_id = reviews.product_id and o.customer_id = (select auth.uid()) and o.status = 'delivered'));

drop policy if exists "favorites owner only" on public.favorites;
create policy "favorites owner only" on public.favorites for all to authenticated using (user_id = (select auth.uid())) with check (user_id = (select auth.uid()));

drop policy if exists "seller reads own ledger" on public.seller_ledger_entries;
create policy "seller reads own ledger" on public.seller_ledger_entries for select to authenticated using (exists (select 1 from public.sellers s where s.id = seller_id and s.owner_user_id = (select auth.uid())));
drop policy if exists "seller reads own payouts" on public.seller_payouts;
create policy "seller reads own payouts" on public.seller_payouts for select to authenticated using (exists (select 1 from public.sellers s where s.id = seller_id and s.owner_user_id = (select auth.uid())));
drop policy if exists "seller reads own payout reference" on public.seller_payout_accounts;
create policy "seller reads own payout reference" on public.seller_payout_accounts for select to authenticated using (exists (select 1 from public.sellers s where s.id = seller_id and s.owner_user_id = (select auth.uid())));
