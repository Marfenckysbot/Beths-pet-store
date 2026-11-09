# Admin and seller operations

This is the implementation guide for the moderation migration in `supabase/migrations/20261109_admin_and_seller_workflows.sql`.

## Current status

The migration is committed to the `marketplace-foundation` branch. It is not applied to a Supabase project because Beth's Pet Store does not yet have a connected Supabase project. The website remains a static preview until authentication and server-side services are configured.

## Apply the database changes

1. Create a Supabase project for Beth's Pet Store.
2. Open the SQL Editor.
3. Apply `supabase/schema.sql` first.
4. Apply `supabase/migrations/20261109_admin_and_seller_workflows.sql` second.
5. Review the SQL output and confirm both scripts complete without errors.
6. Enable email authentication and configure the allowed site/redirect URLs before inviting any real users.

Do not paste a service-role key into HTML, browser JavaScript, GitHub commits, or public Netlify variables. A Supabase anon/publishable key is designed for browser use only when row-level security is correctly enabled.

## Bootstrap the first administrator

The schema intentionally does not make the first signed-up user an administrator.

1. Create the founder's account through Supabase Auth.
2. Confirm the email address.
3. In the Supabase SQL Editor, retrieve that account's UUID from Authentication > Users.
4. Insert that UUID into `public.admin_users` using the SQL Editor, for example:

```sql
insert into public.admin_users (user_id)
values ('REPLACE-WITH-FOUNDER-AUTH-USER-UUID')
on conflict (user_id) do nothing;
```

Only trusted project owners should be able to change `admin_users`. Never expose a client-side admin registration control.

## Seller application lifecycle

1. The public seller interest form collects business details only; it does not create a login or activate a shop.
2. An administrator reviews the application and records `under_review`, `approved` or `rejected` using `review_seller_application`.
3. An approved applicant creates an Auth account using the same email address submitted in the application.
4. After sign-in, the applicant claims the approved application using `claim_approved_seller` and a requested store URL slug.
5. The new seller record starts as `pending`. It is not publicly visible.
6. An administrator verifies the business and activates the seller using `set_seller_moderation_status`.
7. The seller can then submit products. New and edited products remain `pending` until reviewed with `review_marketplace_product`.

Approval of an application is not the same as approval of a public storefront. Both checks are deliberate.

## Before connecting the dashboard

- Configure Supabase URL and publishable/anon key as public site configuration; these are not secrets, but access is constrained by RLS.
- Implement sign-in, sign-out, password reset and session expiry handling.
- Build seller dashboard views using only the signed-in seller's RLS-visible records.
- Build an admin moderation screen that calls the four database functions; do not expose admin controls to unauthorised users.
- Test with separate customer, seller and administrator accounts.
- Verify that a seller cannot read another seller's applications, products, ledger or payout references.
- Verify that an unauthorised user cannot call moderation functions successfully.
- Keep orders, payment transactions, refunds, payout ledger writes and payment-provider webhooks on trusted server-side code. The migration does not enable checkout or money movement.

## Launch gate

Do not accept real orders until the Supabase project, authentication, moderation, server-side checkout, payment-provider KYC/settlement, shipping, returns, privacy and applicable legal requirements have been reviewed and tested.
