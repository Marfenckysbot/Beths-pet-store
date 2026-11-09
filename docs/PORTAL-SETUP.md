# Seller, administrator and customer account setup

The seller/admin workspace is `portal.html`; the customer account area is `account.html`. Both are browser clients for the Supabase schema and are not live services until a Supabase project is configured and the SQL is applied.

## Configure Supabase

1. Create a Supabase project in the business owner's control.
2. Review `supabase/schema.sql` and apply it in the Supabase SQL Editor.
3. Apply `supabase/migrations/20261109_admin_and_seller_workflows.sql`.
4. Apply `supabase/migrations/20261109_product_image_storage.sql`.
5. Apply `supabase/migrations/20261109_seller_inventory_management.sql`.
6. In Supabase Authentication, enable email/password sign-in, keep email confirmation enabled, and set the Site URL and redirect URLs to the preview/deployed account and portal routes.
7. Add the Supabase Project URL and anon/publishable key to `scripts/portal-config.js`. The anon/publishable key is public by design; never add a service-role key.
8. Sign up with the founder email and confirm it. Add the founder's Auth user UUID to `public.admin_users` through the trusted SQL Editor. Do not expose admin bootstrap through a public browser form.
9. Test with separate administrator, seller and ordinary customer accounts before inviting applicants.

## Portal capabilities

- Email/password sign-in, sign-up, sign-out and password reset.
- Server-verified administrator role using `is_marketplace_admin`.
- Admin application review, seller activation/suspension and product moderation.
- Seller claiming for an approved application using the same confirmed email address.
- Active sellers can submit product listings; new and edited listings remain pending until approved.
- Seller photo uploads accept JPG, PNG and WebP, up to 5 MB each and five images per listing. Storage paths are scoped to the seller UUID; the product image bucket is public-read only.
- Seller catalogue management: edit product details, update stock without unpublishing, archive listings without deleting history and restore archived listings to pending review.
- Seller product-content edits return the listing to pending moderation. Stock-only changes preserve moderation status.
- Seller catalogue and read-only order-item visibility.
- Customer accounts at `account.html` provide private profile fields, account wishlist and read-only order history; see `docs/CUSTOMER-ACCOUNT.md`.

## Test plan before inviting users

- Confirm an unconfigured portal/account page clearly disables account actions rather than pretending to save.
- Test sign-up, email confirmation, sign-in, sign-out and password reset redirects.
- Test customer profile read/write and verify a second customer cannot read or update the first customer's profile or favorites.
- Test seller A can manage only seller A's listings; seller B cannot read, edit, stock-update, archive or restore seller A's products.
- Verify negative stock is rejected by both UI and SQL/RPC.
- Verify stock-only updates preserve status; content edits set status to pending; archive hides a listing; restore returns it to pending.
- Verify sellers cannot activate themselves or publish their own pending products.
- Verify an admin can review applications and moderate only through admin-protected actions.
- Verify order rows remain read-only and customer/seller views reveal no payment secrets or unnecessary address data.

## Important limitations

- Netlify seller-form submissions are not automatically imported into Supabase. Existing submissions require a controlled manual review/import process.
- Product images are public-read. Never upload private documents, identity records or customer information.
- Orders are read-only. There is no checkout, payment collection, refund, payout, shipping action or order creation.
- This portal has not been connected to a live Supabase project or production domain. These steps are a setup plan, not evidence of a completed live integration.

## Security boundaries

UI visibility is not the security boundary. Row-level security and SQL functions enforce access. Do not weaken policies to make the dashboard appear to work. Browser code must use only the anon/publishable key. Seller stock and archive actions use narrowly scoped ownership-checking RPCs. Sellers cannot self-publish. All payment, refund, order creation, settlement and payout writes must be implemented in trusted server-side code with verified provider webhooks.

See `docs/INTEGRATION-REGISTRY.md` for the safe handoff of later provider details and `docs/FOUNDER-HANDOFF-CHECKLIST.md` for the complete pre-launch checklist.
