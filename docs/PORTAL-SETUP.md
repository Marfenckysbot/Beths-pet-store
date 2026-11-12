# Seller, administrator and customer account setup

The seller/admin workspace is `portal.html`; the customer account area is `account.html`. Both now point to the connected Beth's Pet Store Supabase project from the `marketplace-foundation` branch. The project is initialized, but account, seller, admin and live-catalogue workflows still require end-to-end testing.

## Connected Supabase project

- Project: `Marfenckysbot's Project`
- Project ref: `moqbnaotzveoljeidsez`
- Region: `us-east-1`
- Project URL: `https://moqbnaotzveoljeidsez.supabase.co`
- Browser config: `scripts/portal-config.js` (public URL and publishable key only)
- Applied migrations are recorded in the connected Supabase database.

## Applied database migrations

The connected Supabase project currently records the base schema plus 17 follow-up migrations (18 migration records total). The migration history was read directly from the live project and verified on 12 November 2026.

1. `20261110133916` — `beths_marketplace_base_schema`
2. `20261110134023` — `admin_and_seller_workflows`
3. `20261110134025` — `product_image_storage`
4. `20261110134032` — `seller_inventory_management`
5. `20261110134145` — `api_grants_indexes_and_function_hardening`
6. `20261110134247` — `seller_and_application_admin_update_grants`
7. `20261110134700` — `rls_auth_uid_initplan_optimization`
8. `20261110134850` — `invoker_admin_moderation_functions`
9. `20261111151217` — `product_3d_models`
10. `20261111160610` — `harden_seller_claim_rpc`
11. `20261111170013` — `lock_down_product_update_permissions`
12. `20261111170042` — `fix_invoker_inventory_rpc_columns`
13. `20261111170539` — `tighten_customer_and_seller_write_grants`
14. `20261111170917` — `restrict_future_public_object_defaults`
15. `20261111171018` — `restrict_product_insert_columns`
16. `20261111171234` — `restore_admin_moderation_column_grants`
17. `20261111191224` — `protect_seller_reviewer_notes`
18. `20261111191633` — `validate_product_image_urls`

All 14 public tables have RLS enabled. The initial category seed contains five categories. The founder account and administrator membership have been provisioned; no production sellers, verified products, customer orders or payment records are established.

## Remaining Supabase setup

1. Email/password sign-in is enabled and email confirmation is ON, as confirmed by the founder. The founder administrator account is already provisioned. Open [Supabase Auth URL Configuration](https://supabase.com/dashboard/project/moqbnaotzveoljeidsez/auth/url-configuration), set Site URL to `https://beths-pet-store.vercel.app`, and add these exact Redirect URLs:
   - `https://beths-pet-store.vercel.app/account.html`
   - `https://beths-pet-store.vercel.app/portal.html`
   This dashboard change is still outstanding. Until it is saved and verified, new sign-ups and password resets are deliberately paused in the website; existing account sign-in remains available. After successful configuration and testing, set `authRedirectsConfigured: true` in `scripts/portal-config.js`.
2. Open [Supabase Email Auth settings](https://supabase.com/dashboard/project/moqbnaotzveoljeidsez/auth/providers?provider=Email), find Password Security, and enable leaked-password protection (HaveIBeenPwned check). The current security advisor reports it is disabled.
3. Confirm the public project URL and publishable key in `scripts/portal-config.js`; never add a service-role key.
4. Sign in with the existing founder account and verify that the administrator dashboard opens.
5. Test with separate seller and ordinary customer accounts before inviting applicants. Do not create a second founder account.

## Portal capabilities

- Email/password sign-in, sign-up, sign-out and password reset.
- Server-verified administrator role using `is_marketplace_admin`.
- Admin application review, seller activation/suspension and product moderation.
- Seller claiming for an approved application using the same confirmed email address.
- Active sellers can submit product listings; new and edited listings remain pending until approved.
- Seller photo uploads accept JPG, PNG and WebP, up to 5 MB each and five images per listing. Sellers may optionally attach a public HTTPS `.glb` or `.gltf` 3D model URL; only models with appropriate usage rights should be submitted. Storage paths are scoped to the seller UUID; the product image bucket is public-read only.
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

- The Supabase schema and migrations are live in the connected project. Email confirmation is enabled and the founder admin membership exists, but Auth redirects, email delivery and role-based workflows have not yet been browser-tested.
- The founder administrator membership has been bootstrapped; sign-in and permission checks still need browser verification.
- No verified production seller accounts or real product catalogue exist.
- The legacy Netlify seller form was removed from the seller journey; applicants apply through the authenticated Supabase portal. Other legacy Netlify Forms (contact/support/feedback) do not process on Vercel and still need a Vercel-compatible submission endpoint.
- Product images are public-read. Never upload private documents, identity records or customer information.
- Orders are read-only. There is no checkout, payment collection, refund, payout, shipping action or order creation.
- Draft PR #1 remains unmerged. A Vercel deployment is active at `https://beths-pet-store.vercel.app`, but the site is still a pre-launch preview and checkout is disabled.

## Security boundaries

UI visibility is not the security boundary. Row-level security and SQL functions enforce access. The Data API grants have been narrowed so anonymous users can read only public catalogue/review data; authenticated access is still row-filtered by RLS. Do not weaken policies to make the dashboard appear to work. Browser code must use only the anon/publishable key. Seller stock and archive actions use narrowly scoped ownership-checking RPCs. The seller-claim RPC now runs as SECURITY INVOKER, with an RLS insert policy that only permits a user to claim their own approved application. Sellers cannot self-publish. All payment, refund, order creation, settlement and payout writes must run in trusted server-side code with verified provider webhooks.

See `docs/INTEGRATION-REGISTRY.md` for the safe handoff of later provider details and `docs/FOUNDER-HANDOFF-CHECKLIST.md` for the complete pre-launch checklist.
