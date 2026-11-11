# Founder handoff checklist

This is the master list of information Beth's Pet Store may need as the project moves from a preview into a real business. It is intentionally safe to prepare gradually. You do not need to buy every service or register every account now.

## How to use this document

- Share ordinary business details and non-secret provider choices here when ready.
- Never paste passwords, one-time codes, recovery codes, bank login details, private API keys, webhook secrets, service-role keys, BVN/NIN or identity-document scans into chat or GitHub.
- Configure secrets directly in the provider's encrypted environment settings. Tell us only the variable name and that it has been configured.
- If an item is not ready, leave it marked **Not ready**. Do not invent details to fill a blank.
- Each integration will be added to its appointed configuration, adapter or policy file, tested in preview, and left inactive until its readiness gates are met.

## A. Founder and brand information

- [ ] Legal/business name (when established) — business identity/policy pages.
- [ ] Approved public-facing brand name and short description — site metadata and About page.
- [ ] Logo, brand colours and approved image files with usage rights — `assets/`.
- [ ] Official support email — contact page and later transactional email sender.
- [ ] Business-owned phone/WhatsApp contact (optional) — contact page after ownership is verified.
- [ ] Public service area/country coverage — delivery and contact information.
- [ ] Official social profile URLs — footer/social links only after accounts are created.
- [ ] Domain name and DNS access (when available) — hosting and email verification.

## B. Business, policy and compliance details

- [ ] Business registration details, when applicable — private business records and approved public disclosure only.
- [ ] Tax/accounting guidance and obligations — internal operations.
- [ ] Privacy contact, data-retention decisions and customer-rights process — privacy policy.
- [ ] Approved terms of service and seller terms — terms page and seller onboarding.
- [ ] Delivery, cancellation, return, refund, warranty and complaint policies — policy pages and support workflow.
- [ ] Seller eligibility, prohibited products and moderation standards — seller rules and admin guidance.
- [ ] Animal welfare and regulated-product rules reviewed for any relevant category — category gates.
- [ ] Public address only if genuinely required; do not publish a home address by default.

## C. Supplier and catalogue information

For each supplier:
- [ ] Verified legal/trading name and public business contact.
- [ ] Written permission to list products, use images and display supplier branding.
- [ ] Commercial arrangement: wholesale, commission, referral or supplier-direct fulfilment.
- [ ] Who owns stock, confirms availability, invoices, collects payment and dispatches.
- [ ] Delivery coverage, dispatch timing, returns/warranty and failed-delivery responsibilities.
- [ ] Evidence checked and date last verified.

For each product:
- [ ] Accurate name, description, category, SKU and product identifiers.
- [ ] Current price, currency, stock owner and stock-update process.
- [ ] Approved product photos and usage rights.
- [ ] Product safety/compliance evidence where relevant.
- [ ] Fulfilment location, delivery restrictions, handling and returns terms.

Integration destination: seller portal/product records and the catalogue. Do not replace illustrative preview listings with invented supplier data.

## D. Database and customer identity

- [x] Supabase project URL — configured in `scripts/portal-config.js` on the development branch.
- [x] Supabase publishable key — configured in `scripts/portal-config.js` on the development branch.
- [x] Base schema and nine recorded migrations applied to the connected Supabase project; all 14 public tables have RLS enabled.
- [x] Founder Auth account and administrator membership — already provisioned; no password or secret is stored in the repository.
- [ ] Site URL and redirect allowlist — Supabase Auth settings; confirm the actual preview URL before saving and browser-testing redirects.
- [ ] Separate admin, seller and customer test accounts — security test plan.

Never put the Supabase service-role key or database password in browser configuration or repository files.

## E. Hosting and website

- [ ] Hosting provider account and site identifier — deployment settings.
- [ ] Preview URL and custom domain — hosting/DNS configuration.
- [ ] Netlify Forms verified with test submissions — hosting Forms dashboard.
- [ ] Environment variables configured for server functions — hosting encrypted settings.
- [ ] Mobile, desktop, accessibility and route QA completed — release checklist.
- [ ] Backup, restore and incident contacts documented — operations notes.

No production deployment is triggered by completing this checklist.

## F. Payments and finance (later stage)

- [ ] Selected provider and approved merchant account.
- [ ] Merchant onboarding/KYC and permitted business/category confirmation.
- [ ] Settlement currency, fees, settlement schedule and business-owned beneficiary.
- [ ] Provider sandbox account and test credentials.
- [ ] Secret key and webhook signing secret configured in encrypted server environment.
- [ ] Refund, dispute, chargeback and reconciliation process approved.

Destination: server-side payment/order adapters in `netlify/functions/`. Checkout remains disabled until the server validates prices and stock, verifies signed webhooks, handles retries idempotently and passes sandbox/failure/refund tests. Do not share secret values in chat.

## G. Delivery and fulfilment

- [ ] Delivery provider(s), account ownership and coverage.
- [ ] Rates, zones, pickup options, delivery estimates and exclusions.
- [ ] Tracking API and webhook setup (secrets configured server-side).
- [ ] Packaging, handover, lost/damaged parcel and failed-delivery procedure.
- [ ] Returns and reverse-logistics responsibilities.

Destination: server-side delivery adapter and approved shipping rules. Do not publish unverified rates or promises.

## H. Email, support and analytics

- [ ] Transactional email provider and verified sender domain.
- [ ] SPF, DKIM and DMARC records verified by provider.
- [ ] Support mailbox access and escalation owner.
- [ ] Analytics provider/property and consent/privacy decision.
- [ ] Search Console/webmaster verification (if used).

Destination: server-side email adapter, consent-aware analytics configuration and site contact details. Keep API keys in encrypted settings.

## I. Final release gates

- [ ] Supplier agreements and catalogue evidence complete.
- [ ] Business, tax, consumer, privacy and category-specific reviews complete.
- [ ] Database RLS/RPC review and cross-account security tests passed.
- [ ] Payment, order, delivery and email sandbox tests passed where applicable.
- [ ] Customer support, refund, dispute and incident processes staffed.
- [ ] Production preview reviewed on mobile and desktop.
- [ ] Explicit founder go-ahead for production deployment and any live transaction capability.

## Current project boundary

The repository is a feature-rich pre-launch preview in an open draft pull request. The connected Supabase project is initialized, the base schema plus nine migrations are applied, and the founder administrator membership is provisioned. Auth Site URL/redirect settings and browser role tests remain pending. No suppliers or payment/delivery/email providers are confirmed, and checkout is disabled. Completing a checklist item does not automatically authorize deployment, spending, account creation, payment activation or public disclosure.
