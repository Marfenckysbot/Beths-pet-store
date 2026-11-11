-- Keep browser writes limited to fields used by the current customer and seller flows.
-- Row-level policies remain the ownership boundary; column grants are an additional guard.

-- Customer profile: users may create their own profile and edit only display name/country.
revoke insert, update on table public.profiles from authenticated;
grant insert (id, display_name, country_code) on table public.profiles to authenticated;
grant update (display_name, country_code) on table public.profiles to authenticated;

-- Wishlist: the browser only adds and removes rows; it never needs UPDATE.
revoke insert, update on table public.favorites from authenticated;
grant insert (user_id, product_id) on table public.favorites to authenticated;

-- Seller applications: applicants can submit application fields, but cannot edit
-- moderation metadata or change an existing application after submission.
revoke insert, update on table public.seller_applications from authenticated;
grant insert (
  applicant_id, business_name, contact_name, email, country_code,
  website_url, category, description, status
) on table public.seller_applications to authenticated;

-- Seller profile creation happens only through claim_approved_seller.
-- Moderation changes happen only through the guarded admin RPCs.
revoke insert, update on table public.sellers from authenticated;
grant insert (
  owner_user_id, application_id, store_name, slug, description,
  country_code, status
) on table public.sellers to authenticated;
