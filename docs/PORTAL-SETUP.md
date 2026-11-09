# Seller and administrator portal

The portal is available at `portal.html`. It is a browser client for the Supabase schema and moderation functions, not a live service until a Supabase project is configured.

## Configure it

1. Create a Supabase project.
2. Apply `supabase/schema.sql`.
3. Apply `supabase/migrations/20261109_admin_and_seller_workflows.sql`.
4. Apply `supabase/migrations/20261109_product_image_storage.sql` to create the public product-image bucket and seller-owned upload policies.
5. Apply `supabase/migrations/20261109_seller_inventory_management.sql` to enable ownership-checked stock updates and safe archive/restore actions.
6. In Supabase Authentication, enable email/password sign-in, keep email confirmation enabled, and set the Site URL and redirect URL to the deployed portal URL (and local development URL if needed).
7. Add the Supabase Project URL and anon/publishable key to `scripts/portal-config.js`. The anon/publishable key is public by design; never add a service-role key.
8. Sign up with the founder email, confirm it, then add the founder's Auth user UUID to `public.admin_users` from the Supabase SQL Editor. The admin membership table is not writable through the browser.
9. Test with separate admin, seller and ordinary user accounts before inviting applicants.

## Portal capabilities

- Email/password sign-in, sign-up, sign-out and password reset.
- Server-verified admin role using the `is_marketplace_admin` database function.
- Admin application review, seller activation/suspension and product moderation.
- Seller claiming for an approved application using the same verified email address.
- Active sellers can submit product listings, which remain pending until approved.
- Seller photo uploads accept JPG, PNG and WebP, up to 5 MB each and five images per listing. Storage paths are scoped to the seller UUID; the product image bucket is public-read only.
- Seller catalogue management: edit product details, update stock without unpublishing, archive listings without deleting history, and restore archived listings to pending review.
- Product detail edits automatically return the listing to pending moderation; stock-only changes preserve the current moderation state.
- Seller catalogue and read-only order-item visibility.
- Approved seller products are fetched into the public marketplace and homepage highlights when Supabase is configured. The preview bag remains local-only and checkout is still disabled.

## Current limitations

- The portal accepts seller applications from signed-in accounts and stores them in `public.seller_applications`. Existing Netlify form submissions are not automatically imported; an administrator must transfer those applications through a controlled process before they can be reviewed and claimed in the portal. An approved applicant signs up using the same email address, then claims the application ID.
- Product photos use the public `product-images` bucket. Public image URLs are expected; do not upload private documents, customer information or identity records.
- Orders are read-only. There is no checkout, payment collection, refund, payout, or shipping action.
- Seller order-item rows show item information only; customer addresses and payment details are not exposed.
- This portal has not been connected to a live Supabase project or production domain yet.

## Security notes

UI visibility is not the security boundary. Row-level security and the SQL moderation functions enforce data access and admin-only actions. Do not weaken those policies to make the dashboard appear to work. The browser must only use the anon/publishable key. Seller stock and archive actions use narrowly scoped security-definer RPCs that verify the authenticated seller owns the product. Product content edits use the existing seller-owned row-level security policy and always set the product back to `pending`; no seller action can publish a listing directly. All payment, refund, order creation, settlement and payout writes must be implemented in trusted server-side code with provider webhooks.
