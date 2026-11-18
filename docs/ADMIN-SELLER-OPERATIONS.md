# Admin and seller operations

This is the implementation guide for the moderation migration in `supabase/migrations/20261109_admin_and_seller_workflows.sql`.

## Current status

The development branch is connected to the existing Supabase project. The founder account and administrator membership already exist, email confirmation is enabled, and the seller-claim hardening migration has been applied. The project currently has no seller, product or order records. Browser end-to-end testing and final redirect URL configuration are still outstanding. Do not create a second founder account.

## Apply the database changes

These steps are for a fresh, separate test environment only. The existing connected project is already provisioned; do not re-run the base schema or migrations there blindly. For a fresh environment, open the SQL Editor, apply the base schema first, then apply the migrations in chronological order and verify each completes. Configure email authentication and the real site's allowed redirect URLs before inviting test users.

Do not paste a service-role key into HTML, browser JavaScript, GitHub commits, or public Netlify variables. A Supabase anon/publishable key is designed for browser use only when row-level security is correctly enabled.

## Bootstrap the first administrator

The schema intentionally does not make the first signed-up user an administrator. The existing founder account and its administrator membership are already provisioned in the connected project. Do not repeat this bootstrap there. For a separate fresh test environment only:

```sql
insert into public.admin_users (user_id)
values ('REPLACE-WITH-FOUNDER-AUTH-USER-UUID')
on conflict (user_id) do nothing;
```

Only trusted project owners should be able to change `admin_users`. Never expose a client-side admin registration control.

## Seller application lifecycle

1. The public Seller Centre page directs applicants to the authenticated seller portal; it does not collect or store a separate Netlify form submission.
2. The applicant creates an Auth account, confirms the email address, signs in and submits the application inside the portal. The application is linked to that Auth user from the start.
3. An administrator reviews the application and records `under_review`, `approved` or `rejected` using `review_seller_application`.
4. An approved applicant claims the linked application using `claim_approved_seller` and a requested store URL slug.
5. The new seller record starts as `pending`. It is not publicly visible.
6. An administrator verifies the business and activates the seller using `set_seller_moderation_status`. Paused or suspended sellers can be reactivated by an administrator after a fresh review.
7. The seller can then submit products. New and edited products remain `pending` until reviewed with `review_marketplace_product`.

Approval of an application is not the same as approval of a public storefront. Both checks are deliberate. Internal reviewer notes are not exposed to applicants through the Data API.

## Before connecting the dashboard

- Configure Supabase URL and publishable/anon key as public site configuration; these are not secrets, but access is constrained by RLS.
- Implement sign-in, sign-out, password reset and session expiry handling.
- The seller and admin dashboards are connected to the existing portal; keep all queries limited to the signed-in user's RLS-visible records.
- The admin portal calls the four moderation functions; do not expose admin controls to unauthorised users.
- Test with separate customer, seller and administrator accounts.
- Verify that a seller cannot read another seller's applications, products, ledger or payout references.
- Verify that an unauthorised user cannot call moderation functions successfully.
- Keep orders, payment transactions, refunds, payout ledger writes and payment-provider webhooks on trusted server-side code. The migration does not enable checkout or money movement.

## Launch gate

Do not accept real orders until the Supabase project, authentication, moderation, server-side checkout, payment-provider KYC/settlement, shipping, returns, privacy and applicable legal requirements have been reviewed and tested.
