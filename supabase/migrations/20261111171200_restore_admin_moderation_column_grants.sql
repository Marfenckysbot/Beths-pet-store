-- SECURITY INVOKER moderation RPCs execute with the caller's database privileges.
-- Restore only the columns those RPCs must change; RLS admin policies and explicit
-- is_marketplace_admin() checks remain the row-level authorization boundary.
grant update (status, reviewer_notes, reviewed_at)
  on table public.seller_applications to authenticated;

grant update (status)
  on table public.sellers to authenticated;
