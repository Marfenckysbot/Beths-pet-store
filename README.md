# Beth's Pet Store

A global pet marketplace foundation with an international storefront, independent seller tools, customer accounts and a documented path to future integrations. The founder is operating from Nigeria, but the product is not restricted to Nigeria; launch markets, currencies, shipping coverage and legal requirements will be configured deliberately rather than assumed.

## Project status

This repository is a pre-launch implementation, not a live checkout marketplace. The connected Supabase project is initialized with the base schema and 18 follow-up migrations (19 migration records total). The founder Auth account and administrator membership are provisioned. Auth redirect configuration and browser-based role testing remain to be completed. Contact, support and feedback submissions now use a private Supabase Edge Function and admin-only inbox; automatic email notifications are not configured. New sign-ups and password resets are temporarily paused until the redirect allowlist is saved; existing accounts can still sign in. A Git-connected Vercel project serves the earlier public project domain at https://beths-pet-store.vercel.app/. The latest unpromoted marketplace branch preview is at https://beths-pet-store-git-marketplace-foundation-ecohubngs-projects.vercel.app/; do not treat it as a production launch. No payment, delivery or transactional email provider is connected. The preview bag is local-only; order creation and payment collection are disabled.

The current work is maintained on the `marketplace-foundation` branch and proposed through open draft PR #1. Vercel deployments are being built from this branch; the PR remains unmerged. Treat the Vercel site as a pre-launch preview, not an approved commercial launch.

## Start here

- [Marketplace readiness and launch gates](docs/MARKETPLACE-READINESS.md)
- [Founder handoff checklist](docs/FOUNDER-HANDOFF-CHECKLIST.md)
- [Integration registry](docs/INTEGRATION-REGISTRY.md)
- [Low-cost pre-launch roadmap](docs/LOW-COST-PRELAUNCH-ROADMAP.md)

## Main experiences

- Public storefront: `index.html`, `shop.html`, `product.html`, `store.html`
- Seller and administrator portal: `portal.html`
- Customer account: `account.html`
- Interactive 3D pet-home showroom: `3d-showroom.html`
- Seller application information: `sell.html`

## Supabase setup

Read [Portal setup](docs/PORTAL-SETUP.md) and [Seller inventory management](docs/SELLER-INVENTORY-MANAGEMENT.md). The connected Supabase project ref is `moqbnaotzveoljeidsez`, and the browser configuration is `scripts/portal-config.js`. The database has 14 RLS-enabled public tables, five seeded categories, seller/admin workflows and the product image bucket. The founder administrator membership is already provisioned; do not create a second founder account. Finish Auth Site URL/redirect configuration and browser role testing before inviting users. Browser code uses only the public publishable key. Never commit a service-role key, database password or payment secret.

## Server-side integration boundary

Future trusted payment, order, delivery and transactional email handlers must be implemented using a Vercel-compatible serverless route (for example `api/`) or Supabase Edge Functions. The existing `netlify/functions/` folder is documentation/planning only; Netlify Functions do not execute on Vercel. No active provider handlers are included yet.

## Local validation

The GitHub Actions workflow runs:

- JavaScript syntax checks for marketplace, portal and customer account modules.
- Local link, asset and form-markup validation.
- Supabase workflow and credential/security guardrail validation.

A passing CI run is not a substitute for browser QA, live database/RLS review, provider sandbox testing or legal/compliance review.

## Safety and launch boundary

Do not accept real orders or payments until supplier permissions, accurate listings and stock, business and policy requirements, database security, merchant onboarding, server-side payment verification, fulfilment and customer support have all been reviewed and tested. Do not enable regulated veterinary products or live-animal transactions without the applicable specialist legal, welfare, supplier and transport checks.
