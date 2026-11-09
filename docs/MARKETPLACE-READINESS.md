# Marketplace readiness and launch gates

## What is already implemented in the preview branch

- Responsive public storefront, category browsing, search, filters, sorting and product detail pages.
- Seller storefront pages that resolve approved live listings when Supabase is configured.
- Browser-local preview bag and wishlist. These are not orders and do not collect payment.
- Customer account page with email/password authentication, private profile, account wishlist and read-only order history.
- Seller/admin portal with application review, seller activation/suspension, product moderation, product creation and image uploads.
- Seller inventory controls: edit listing details (returns the listing to moderation), update stock without unpublishing, archive without deleting history and restore to pending review.
- Supabase/PostgreSQL schema and migrations for account, seller, admin, product-image and inventory workflows.
- Netlify Forms markup for seller interest, contact, support and feedback.
- Server-side integration workspace reserved under `netlify/functions/`; no payment, order, delivery or email handlers are active.
- Founder handoff materials, including the integration registry and low-cost pre-launch roadmap.
- GitHub Actions checks for JavaScript syntax, local links/assets/forms and selected Supabase security guardrails.

## What this does not mean

This repository is a pre-launch implementation, not a live operating marketplace.

- No production Supabase project is configured and no migration has been applied to a live database.
- No verified production seller accounts, suppliers, product catalogue, live stock or customer orders exist.
- No payment merchant account, settlement destination, delivery provider, transactional email provider or analytics property is connected.
- The preview bag does not create orders. Checkout, payment collection, refunds, settlement and payouts are disabled.
- Netlify form markup still requires deployment and test-submission verification.
- No production deployment has been triggered by this work.
- Passing CI checks syntax and repository guardrails; it does not replace browser QA, database security review, provider sandbox tests or legal/compliance review.

Illustrative catalogue content, sample prices, discounts and imagery are design previews. They are not offers, verified stock, seller endorsements, customer reviews or delivery promises.

## Integration order

Use `docs/FOUNDER-HANDOFF-CHECKLIST.md` as the master handoff record and `docs/INTEGRATION-REGISTRY.md` as the provider-specific destination map.

1. **Founder-owned basics:** confirm business/contact details, brand assets, policies and intended operating model. Do not publish personal home-address or identity information by default.
2. **Supply validation:** obtain written supplier permission, real product data, current prices, stock ownership/update process and fulfilment/returns terms.
3. **Database and identity:** create a Supabase project, review and apply migrations in the documented order, configure Auth redirects, add the founder admin UUID through trusted SQL, and test separate customer/seller/admin accounts.
4. **Preview hosting:** configure the hosting project and domain, deploy only to a preview environment, verify Netlify Forms and all routes, and complete mobile/accessibility/browser QA.
5. **Order operations:** agree who confirms stock, invoices, dispatches, handles customer support, returns, refunds and disputes. Keep the first workflow manual if that is safer.
6. **Payments:** only after business and merchant onboarding are approved, implement server-side order creation, payment initiation, signed webhooks, idempotency, refunds and reconciliation. Use sandbox credentials first.
7. **Delivery and communications:** connect providers only after coverage, rates, service levels, sender-domain ownership and support responsibilities are confirmed.
8. **Launch review:** complete security, privacy, consumer, tax, animal-welfare and category-specific compliance checks before any real transaction.

## Supabase setup order

1. `supabase/schema.sql`
2. `supabase/migrations/20261109_admin_and_seller_workflows.sql`
3. `supabase/migrations/20261109_product_image_storage.sql`
4. `supabase/migrations/20261109_seller_inventory_management.sql`

Review the SQL and policies before applying them. Follow `docs/PORTAL-SETUP.md` for Auth, admin bootstrap and account testing. Never put a service-role key in browser code or Git.

## Definition of ready to accept real orders

- Business and applicable legal/tax obligations reviewed.
- Supplier identities, written listing permissions and commercial/fulfilment terms recorded.
- Product data, images, prices and stock verified and kept current.
- Customer-facing privacy, delivery, cancellation, returns, refund and complaint policies approved.
- Supabase RLS and RPC permissions reviewed and tested with separate accounts.
- Server-side order/payment workflows implemented; webhook signatures, replay protection, idempotency and reconciliation tested.
- Merchant account and settlement route approved by the provider.
- Delivery coverage, rates, tracking and failed-delivery process tested.
- Support mailbox, escalation owner and incident process operational.
- Mobile, accessibility, security, forms and browser QA completed.
- Regulated veterinary products and live-animal transactions excluded unless their exact legal, welfare, supplier, payment and transport requirements have been cleared.

Until these gates are met, present the site as a pre-launch showcase and enquiry channel, not as a checkout-ready marketplace.
