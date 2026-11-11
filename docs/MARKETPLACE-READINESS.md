# Marketplace readiness and launch gates



### Latest product media and storefront hardening
- Seller-entered product photo URLs must use HTTPS; the database enforces a maximum of five non-null HTTPS URLs per product.
- Storefront pages no longer assume an unspecified seller is in Nigeria; a country label is shown only when the seller supplied a country code.
- Product and seller detail pages update their document title, description, Open Graph metadata and canonical URL after the listing data loads. Search-engine rendering still requires preview/browser verification.
## What is already implemented in the preview branch

- Responsive public storefront, category browsing, search, filters, sorting and product detail pages.
- Seller storefront pages that resolve approved live listings when Supabase is configured.
- Browser-local preview bag and wishlist. These are not orders and do not collect payment.
- Customer account page with email/password authentication, private profile, account wishlist and read-only order history.
- Seller/admin portal with application review, seller activation/suspension, product moderation, product creation and image uploads.
- Seller inventory controls: edit listing details (returns the listing to moderation), update stock without unpublishing, archive without deleting history and restore to pending review.
- Supabase/PostgreSQL schema and fifteen recorded migrations in the connected project.
- Fourteen public tables with RLS enabled, five seeded categories, seller/admin workflow functions and product-image storage policies.
- Narrowed Data API grants and supporting indexes for marketplace access paths. Future public-schema objects created by `postgres` are not exposed to Data API roles by default; migrations must grant only the access they need.
- The website's public Supabase URL and publishable key are configured on the development branch.
- Email/password Auth is enabled and email confirmation is ON; the founder administrator membership is provisioned. The public Site URL and allowed redirect URLs still need to be saved and browser-tested.
- Founder admin membership is provisioned for the existing founder account; the account sign-in and role checks still require end-to-end browser verification.
- Optional 3D model URL support is available for seller listings. The product detail page loads an interactive model-viewer for seller-supplied HTTPS GLB/glTF files. A dedicated `3d-showroom.html` page now demonstrates a CC0 pet-home scene hosted by 3DAssets.dev; it is loaded remotely and is not bundled locally.
- Netlify Forms markup for seller interest, contact, support and feedback.
- Server-side integration workspace reserved under `netlify/functions/`; no payment, order, delivery or email handlers are active.
- Founder handoff materials, including the integration registry and low-cost pre-launch roadmap.
- GitHub Actions checks for JavaScript syntax, local links/assets/forms and selected Supabase security guardrails.

## What this does not mean

This repository is a pre-launch implementation, not a live operating marketplace.

- Supabase is initialized. Email/password and email-confirmation settings were confirmed by the founder; the Site URL/redirect configuration and browser-based role tests remain outstanding. The founder admin membership is provisioned.
- No verified production seller accounts, suppliers, product catalogue, live stock or customer orders exist.
- No payment merchant account, settlement destination, delivery provider, transactional email provider or analytics property is connected.
- The preview bag does not create orders. Checkout, payment collection, refunds, settlement and payouts are disabled.
- Netlify form markup still requires deployment and test-submission verification.
- No production deployment has been triggered by this work.
- Passing CI checks syntax and repository guardrails; it does not replace browser QA, database security review, provider sandbox tests or legal/compliance review.

Illustrative catalogue content, sample prices, discounts and imagery are design previews. The 3D showroom is an illustrative third-party CC0 model and depends on that provider's CDN; seller model files are not guaranteed. They are not offers, verified stock, seller endorsements, customer reviews or delivery promises.

## Integration order

Use `docs/FOUNDER-HANDOFF-CHECKLIST.md` as the master handoff record and `docs/INTEGRATION-REGISTRY.md` as the provider-specific destination map.

1. **Founder-owned basics:** confirm business/contact details, brand assets, policies and intended operating model. Do not publish personal home-address or identity information by default.
2. **Database and identity:** Supabase project is initialized. Configure Auth email/redirect settings, use the existing founder Auth account and provisioned admin membership; do not create a duplicate. Configure the Site URL/redirect allowlist only after verifying the preview origin, then test separate customer/seller accounts and the existing admin account.
3. **Supply validation:** obtain written supplier permission, real product data, current prices, stock ownership/update process and fulfilment/returns terms.
4. **Preview hosting:** configure the hosting project and domain, deploy only to a preview environment, verify Netlify Forms and all routes, and complete mobile/accessibility/browser QA.
5. **Order operations:** agree who confirms stock, invoices, dispatches, handles customer support, returns, refunds and disputes. Keep the first workflow manual if that is safer.
6. **Payments:** only after business and merchant onboarding are approved, implement server-side order creation, payment initiation, signed webhooks, idempotency, refunds and reconciliation. Use sandbox credentials first.
7. **Delivery and communications:** connect providers only after coverage, rates, service levels, sender-domain ownership and support responsibilities are confirmed.
8. **Launch review:** complete security, privacy, consumer, tax, animal-welfare and category-specific compliance checks before any real transaction.

## Supabase setup and migration record

The base schema and ten migrations have been applied to the connected Supabase project. The source of truth and exact order are documented in `docs/PORTAL-SETUP.md`. The project has 14 RLS-enabled public tables and five initial categories. Continue to review security/performance advisor findings and test access with separate accounts.

Never put a service-role key in browser code or Git. The website uses only the public publishable key.

## Definition of ready to accept real orders

- Business and applicable legal/tax obligations reviewed.
- Supplier identities, written listing permissions and commercial/fulfilment terms recorded.
- Product data, images, prices and stock verified and kept current.
- Customer-facing privacy, delivery, cancellation, returns, refund and complaint policies approved.
- Supabase Auth, founder admin bootstrap, RLS and RPC permissions reviewed and tested with separate accounts.
- Server-side order/payment workflows implemented; webhook signatures, replay protection, idempotency and reconciliation tested.
- Merchant account and settlement route approved by the provider.
- Delivery coverage, rates, tracking and failed-delivery process tested.
- Support mailbox, escalation owner and incident process operational.
- Mobile, accessibility, security, forms and browser QA completed.
- Regulated veterinary products and live-animal transactions excluded unless their exact legal, welfare, supplier, payment and transport requirements have been cleared.

Until these gates are met, present the site as a pre-launch showcase and enquiry channel, not as a checkout-ready marketplace.
