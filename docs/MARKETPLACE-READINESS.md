# Marketplace readiness

## Implemented in this preview branch
- Responsive storefront, category browsing, search, filters and sorting.
- CSS perspective, depth shadows and hover transforms for product-card imagery.
- Browser-local preview bag and wishlist; these do not create orders or take payment.
- Just-for-fun Pet Match quiz with a non-veterinary disclaimer.
- Netlify Forms markup for seller, contact, support and feedback forms.
- Human-review language for seller applications and future adoption partners.
- Supabase/PostgreSQL schema blueprint in supabase/schema.sql.
- Public configuration contains no private street address, coordinates, API keys or payment secrets.

## Important boundaries
Catalogue products, reference prices and discount percentages are illustrative design content, not offers for sale, confirmed inventory or real seller listings. No seller names, ratings, reviews, customer counts, stock levels, adoption animals or shipping promises are fabricated.

No payment provider, merchant account, bank settlement destination, database project or authentication provider is connected. The preview bag is browser-local and checkout is intentionally disabled. The SQL schema is not deployed.

## Before real orders can be accepted
1. Create a Supabase project and apply supabase/schema.sql. Review all row-level security policies before production.
2. Create the first admin account and add its user ID to public.admin_users using trusted SQL.
3. Connect Supabase Auth and server-side functions. Build secure seller onboarding, verification, moderation and product management.
4. Configure a payment provider account in the business owner's legal name, complete its KYC, connect settlement details, and store API secrets only in Netlify environment variables or trusted server code.
5. Implement server-side checkout and payment webhook verification. Never trust a browser success redirect as proof of payment.
6. Decide seller commission, payout schedule, refunds, disputes, chargebacks, tax, shipping and cross-border rules. Get appropriate legal/accounting advice.
7. Connect real inventory and fulfilment providers. Only display live availability and delivery promises returned by those systems.
8. Test using provider sandbox credentials, then conduct a controlled low-value live transaction before launch.

## Current form setup
Seller, contact, support and feedback forms use Netlify Forms markup. After a successful deploy, verify each form appears in Netlify's Forms dashboard and run a test submission. A static thank-you page cannot independently prove email delivery or response handling.

## Engineering milestones
- Supabase project, Auth, profile and seller application workflow.
- Admin review queue, approved seller storefronts, product upload and moderation.
- Inventory, customer accounts, secure cart and order model.
- Payment integration, webhooks, commission ledger and seller payout workflow.
- Delivery quotes, tracking, returns, support workflow and international compliance.
- Verified reviews, adoption partner feeds, editorial review and accessibility/performance QA.

Sample prices are shown in USD for design consistency. Replace every preview product with a real seller-supplied listing and verified price before enabling transactions.

## Automated checks
The repository includes a GitHub Actions workflow that checks the marketplace JavaScript syntax, local page and asset references, Netlify form markup and public configuration for known placeholder location/analytics values. A passing check does not replace visual, form-submission, security or payment-provider testing.


## Seller and administrator workflow migration

The follow-on SQL migration `supabase/migrations/20261109_admin_and_seller_workflows.sql` adds administrator-only review access, secure application decisions, email-matched claiming of approved applications, separate seller activation and product moderation functions. Apply it only after the base schema. Setup and test instructions are in [ADMIN-SELLER-OPERATIONS.md](ADMIN-SELLER-OPERATIONS.md). These database changes are committed but have not been applied to a live Supabase project.
