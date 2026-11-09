-- Public product image delivery with seller-owned upload paths.
-- Apply after supabase/schema.sql and the admin/seller workflow migration.

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'product-images',
  'product-images',
  true,
  5242880,
  array['image/jpeg','image/png','image/webp']
)
on conflict (id) do update
set public = excluded.public,
    file_size_limit = excluded.file_size_limit,
    allowed_mime_types = excluded.allowed_mime_types;

drop policy if exists "public read marketplace product images" on storage.objects;
create policy "public read marketplace product images"
  on storage.objects for select
  to anon, authenticated
  using (bucket_id = 'product-images');

drop policy if exists "active sellers upload own product images" on storage.objects;
create policy "active sellers upload own product images"
  on storage.objects for insert
  to authenticated
  with check (
    bucket_id = 'product-images'
    and exists (
      select 1
      from public.sellers s
      where s.id::text = (storage.foldername(name))[1]
        and s.owner_user_id = auth.uid()
        and s.status = 'active'
    )
  );

drop policy if exists "sellers update own product images" on storage.objects;
create policy "sellers update own product images"
  on storage.objects for update
  to authenticated
  using (
    bucket_id = 'product-images'
    and exists (
      select 1
      from public.sellers s
      where s.id::text = (storage.foldername(name))[1]
        and s.owner_user_id = auth.uid()
        and s.status = 'active'
    )
  )
  with check (
    bucket_id = 'product-images'
    and exists (
      select 1
      from public.sellers s
      where s.id::text = (storage.foldername(name))[1]
        and s.owner_user_id = auth.uid()
        and s.status = 'active'
    )
  );

drop policy if exists "sellers delete own product images" on storage.objects;
create policy "sellers delete own product images"
  on storage.objects for delete
  to authenticated
  using (
    bucket_id = 'product-images'
    and exists (
      select 1
      from public.sellers s
      where s.id::text = (storage.foldername(name))[1]
        and s.owner_user_id = auth.uid()
        and s.status = 'active'
    )
  );

drop policy if exists "admins moderate product images" on storage.objects;
create policy "admins moderate product images"
  on storage.objects for delete
  to authenticated
  using (bucket_id = 'product-images' and public.is_marketplace_admin());
