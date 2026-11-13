-- Allow administrator moderation workflows to update seller applications and sellers.
-- RLS policies still restrict these updates to verified marketplace administrators.
grant update on public.seller_applications, public.sellers to authenticated;
