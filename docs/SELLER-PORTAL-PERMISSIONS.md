# Seller portal permissions and test guide

This checklist is for the development branch. It does not authorize production deployment, payment activation, or account creation on behalf of the founder.

## Permission boundaries

- A signed-in user is not automatically an administrator or an active seller.
- The portal calls the database's `is_marketplace_admin` function before choosing the admin workspace. A failed permission check must fail closed.
- Seller workspace data is requested using the signed-in user's own seller record; product and order-item requests are additionally filtered by the seller ID.
- Database row-level security (RLS) remains the actual authorization boundary. Client-side filters and hidden buttons are usability measures, not security controls.
- Seller applications are created for the authenticated user's own account and start in `pending`.
- An approved application can be claimed only by its applicant. The resulting seller profile starts in `pending`; approval does not activate the shop.
- Product submissions start in `pending`. Only administrator moderation may publish a listing, and database logic must require an active seller.
- Stock and archive operations use `SECURITY INVOKER` database functions, RLS, and explicit column grants. The database denies authenticated users UPDATE access to `seller_id`; a trigger blocks sellers from changing status to `active` or `rejected`.
- Customer orders, seller order items, favorites, private profiles, payment transactions, and payout references must remain isolated by database policies.
- No browser code may contain a Supabase service-role key, database password, payment secret, or private provider credential.

## Manual role test matrix

Use separate test accounts only when the founder chooses to create them. Never share passwords, one-time codes, or private keys in chat.

| Test identity | Expected result |
|---|---|
| Signed out | Portal shows sign-in; private workspace is hidden |
| Ordinary customer | Cannot see admin queues or another user's seller data |
| Applicant with pending application | Sees application status; cannot claim a shop or list products |
| Applicant with approved application | Can claim only their own application; new shop remains pending |
| Pending/paused/suspended seller | Can see own shop status; cannot submit new products unless active |
| Active seller | Sees only own products and order items; can edit own listings and use permitted stock/archive actions |
| Administrator | Can review applications, sellers and products through protected database functions |
| Unrelated signed-in user | Direct API attempts against another seller's records must be denied by RLS/RPC ownership checks |

## Verification before launch

- [ ] Verify each role using distinct test accounts in a non-production test environment.
- [ ] Attempt direct Supabase API reads/writes across user and seller boundaries; confirm RLS denies them.
- [ ] Confirm an ordinary user cannot grant themselves admin membership or change seller status.
- [ ] Confirm only an approved applicant can claim a seller profile and only once.
- [ ] Confirm a non-active seller cannot create or publish products.
- [ ] Confirm product moderation cannot publish a product for a paused or suspended seller.
- [ ] Confirm stock/archive RPCs reject product IDs owned by another seller.
- [ ] Confirm authenticated users cannot UPDATE the `products.seller_id` column or use direct API calls to self-publish a listing.
- [ ] Confirm email confirmation, password reset, and redirect URLs on the actual deployed origin.
- [ ] Review Supabase security advisor findings and enable leaked-password protection.
- [ ] Run the repository validation workflow and test mobile and desktop browsers.

## Current scope

Checkout is preview-only. Payment collection, refunds, seller payouts, and production order creation are not enabled. This guide is a test plan, not evidence that every manual test has passed.
