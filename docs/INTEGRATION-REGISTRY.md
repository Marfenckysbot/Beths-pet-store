# Beth's Pet Store integration registry

Use [the founder handoff checklist](FOUNDER-HANDOFF-CHECKLIST.md) as the master list of details to collect and launch gates. This registry identifies where each item belongs and how to handle it safely.

## 1. Database and authentication

| Item to provide later | Intended location | Handling |
| --- | --- | --- |
| Supabase project URL | `scripts/portal-config.js` | Public project URL; configured on the development branch |
| Supabase anon/publishable key | `scripts/portal-config.js` | Public browser key only; configured on the development branch |
| Base schema and migrations | Supabase database | Applied to project ref `moqbnaotzveoljeidsez`; migration history verified |
| Founder admin Auth user UUID | Supabase `admin_users` table | Still to be added through trusted SQL editor after founder account confirmation |
| Preview/production site URL and auth redirects | Supabase Auth URL configuration | Still to be configured against the actual preview/deployed site origin |

Never send or commit a Supabase service-role key, database password, recovery code or private credential in chat or repository files.

## 2. Hosting and server-side functions

The static site is designed for Netlify hosting. The `netlify/functions/` directory is the reserved trusted-server integration workspace; it currently contains documentation, not active provider handlers.

| Item | Intended location | Handling |
| --- | --- | --- |
| Hosting account/site and preview URL | Netlify project settings | Founder-owned account |
| Custom domain and DNS access | Hosting/domain registrar | Configure only after domain ownership is confirmed |
| Supabase server URL/key | Encrypted server environment | Service-role key server-side only |
| Provider secrets | Encrypted server environment | Add only when a provider is selected and approved |

See `netlify/functions/README.md` for planned server environment variable names and handler boundaries.

## 3. Payments and settlement — intentionally not connected

| Item to provide later | Integration area | Readiness gate |
| --- | --- | --- |
| Selected provider and approved merchant account | Server-side payment adapter | Merchant onboarding and business/category eligibility confirmed |
| Public checkout key, if required | Public site configuration | Provider-approved public key only |
| Private API secret and webhook signing secret | Encrypted server environment | Never place in browser code, Git or chat |
| Webhook endpoint and event list | Server-side webhook handler | Signature verification, idempotency and replay protection tested |
| Settlement currency, fees and beneficiary | Provider dashboard | Business-owned, verified settlement destination |
| Refund and chargeback procedure | Operations docs and trusted server workflow | Written policy and sandbox tests |

Checkout, order creation, refunds and payouts remain disabled until server-side payment verification and operational/legal checks are complete.

## 4. Delivery and fulfilment

| Item to provide later | Integration area | Needed before activation |
| --- | --- | --- |
| Delivery provider(s) and account | Server-side delivery adapter | Account and service coverage confirmed |
| Pickup/delivery zones and rates | Shipping rules configuration | Written rates and responsibilities |
| Tracking credentials / webhook secret | Encrypted server environment | Provider webhook verification |
| Packaging and fulfilment rules | Seller operations documentation | Seller agreement and exception handling |
| Returns, failed delivery and lost parcel process | Policies and support workflows | Clear customer-facing terms |

## 5. Communications and support

| Item to provide later | Intended location | Handling |
| --- | --- | --- |
| Official support email | Site contact and transactional email sender | Verify mailbox ownership |
| Business phone / WhatsApp contact | Contact page and support links | Publish only after confirming ownership |
| Transactional email provider | Server-side email adapter | API secret stays encrypted server-side |
| Sender domain and DNS records | Email provider / domain DNS | SPF, DKIM and DMARC verification |
| Support hours and escalation contact | Support policy | Founder supplies accurate details |

## 6. Business identity and policies

Founder-supplied details will be placed in relevant site configuration and policy pages only after verification:
- Legal/business name and any registration details.
- Public service area and any business address genuinely required.
- Tax details where applicable.
- Privacy contact and data-retention decisions.
- Customer support, delivery, cancellation, refund and complaint policies.
- Seller eligibility, product restrictions, supplier permissions and moderation rules.

Do not publish CAC numbers, tax identifiers, bank details, identity documents or personal contact data unless there is a clear legal/operational reason and an approved secure destination. Do not publish a home address by default.

## 7. Analytics, search and marketing

| Item to provide later | Integration area | Handling |
| --- | --- | --- |
| Analytics provider/account | Consent-aware analytics module | No personal data in URLs or event payloads |
| Search Console/webmaster verification | Site metadata or DNS | Verification token only in the appropriate owner-controlled location |
| Social profile URLs | Footer, contact and social starter kit | Only official accounts controlled by the founder |
| Brand assets and approved photography | `assets/` and catalogue | Confirm usage rights and image consent |

## 8. Supplier and catalogue records

For every supplier/listing, collect:
- Supplier legal/trading name and verified business contact.
- Written permission to publish products and images.
- Product name, SKU, category, description and accurate current price/currency.
- Stock owner and stock-update process.
- Fulfilment location, delivery coverage and handling times.
- Returns/warranty terms and product safety/compliance evidence.
- Product image rights and date last verified.

No supplier is considered a partner until the founder has contacted them and obtained clear agreement.

## 9. Product imagery and optional 3D models\n\n| Item | Intended location | Handling |\n| --- | --- | --- |\n| Product photos | Supabase product-images bucket or approved public image URL | JPG, PNG or WebP; seller confirms image rights |\n| Optional 3D model | `products.model_url` | Public HTTPS `.glb` or `.gltf` URL; seller confirms model rights; photos remain the fallback |\n\nThe storefront uses an interactive model viewer only when a valid model URL is present. No model files are bundled or assumed.\n\n## 10. Handoff process

1. Use `docs/FOUNDER-HANDOFF-CHECKLIST.md` to track what is ready.
2. Share non-secret details and identify the provider/account area.
3. Configure secrets directly in the provider's encrypted environment settings; share only the variable name and confirmation that it has been set.
4. Add the integration to its appointed adapter/configuration section, document it and test it in a preview environment.
5. Leave it inactive until its readiness gate is passed and the founder explicitly authorizes activation.

## Current status

- The connected Supabase project is initialized and its schema/migrations are applied.
- Public browser configuration is committed to the development branch only.
- Auth redirects remain pending; founder admin membership has been bootstrapped.
- No production deployment, payment merchant account, delivery account, email provider, analytics property or verified social account is configured.
- Do not accept real orders or payments based on these placeholders.
