# Seller and administrator portal

The portal is available at `portal.html`. It is a browser client for the Supabase schema and moderation functions, not a live service until a Supabase project is configured.

## Configure it

1. Create a Supabase project.
2. Apply `supabase/schema.sql`.
3. Apply `supabase/migrations/20261109_admin_and_seller_workflows.sql`.
4. In Supabase Authentication, enable email/password sign-in and set the Site URL and redirect URL to the deployed portal URL (and local development URL if needed).
5. Add the Supabase Project URL and anon/publishable key to `scripts/portal-config.js`. The anon/publishable key is public by design; never add a service-role key.
6. Sign up with the founder email, confirm it, then add the founder's Auth user UUID to `public.admin_users` from the Supabase SQL Editor. The admin membership table is not writable through the browser.
7. Test with separate admin, seller and ordinary user accounts before inviting applicants.

## Portal capabilities

- Email/password sign-in, sign-up, sign-out and password reset.
- Server-verified admin role using the `is_marketplace_admin` database function.
- Admin application review, seller activation/suspension and product moderation.
- Seller claiming for an approved application using the same verified email address.
- Active sellers can submit product listings, which remain pending until approved.
- Seller catalogue and read-only order-item visibility.

## Current limitations

- The portal does not provision seller accounts automatically from Netlify form submissions. Seller applications must be present in `public.seller_applications` for the admin queue and claim workflow. An approved applicant signs up using the same email address, then claims the application ID.
- Product images are entered as existing HTTPS URLs. A managed upload bucket and file-type/size validation still need to be configured.
- Orders are read-only. There is no checkout, payment collection, refund, payout, or shipping action.
- Seller order-item rows show item information only; customer addresses and payment details are not exposed.
- This portal has not been connected to a live Supabase project or production domain yet.

## Security notes

UI visibility is not the security boundary. Row-level security and the SQL moderation functions enforce data access and admin-only actions. Do not weaken those policies to make the dashboard appear to work. The browser must only use the anon/publishable key. All payment, refund, order creation, settlement and payout writes must be implemented in trusted server-side code with provider webhooks.
