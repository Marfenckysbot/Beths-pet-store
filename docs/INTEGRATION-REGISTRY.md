# Beth's Pet Store integration registry

This is the handoff map for the details and credentials the founder can provide later. It is deliberately a checklist and placeholder register, not a request to publish secrets in GitHub.

## 1. Database and authentication

| Item to provide later | Intended location | Handling |
| --- | --- | --- |
| Supabase project URL | `scripts/portal-config.js` | Public project URL |
| Supabase anon/publishable key | `scripts/portal-config.js` | Public browser key only |
| Supabase database migrations | Supabase SQL Editor / migration workflow | Apply in documented order |
| Founder admin Auth user UUID | Supabase `admin_users` table | Add through trusted SQL editor; never through public UI |
| Production site URL and auth redirect URLs | Supabase Auth URL configuration | Must match deployed domain |

Never send or commit a Supabase service-role key, database password, recovery code or private credential in chat or repository files. If a secret is required, use the provider's server-side environment-variable settings.

## 2. Payments and settlement — intentionally not connected

| Item to provide later | Integration area | Readiness gate |
| --- | --- | --- |
| Chosen payment provider and approved merchant account | Server-side payment adapter | Merchant onboarding and eligibility confirmed |
| Public checkout key, if provider requires one | Public site configuration | Only provider-approved public key |
| Private API secret and webhook signing secret | Hosting provider's encrypted environment variables | Never place in browser code, Git or chat |
| Webhook endpoint and event list | Server-side webhook handler | Signature verification, idempotency and replay protection tested |
| Settlement currency, bank/recipient setup | Provider dashboard | Verified merchant/beneficiary details |
| Refund and chargeback procedure | Operations documentation and trusted server workflow | Written policy and manual test approval |

Checkout, order creation, refunds and payouts remain disabled until server-side payment verification and operational/legal checks are complete.

## 3. Delivery and fulfilment

| Item to provide later | Integration area | Needed before activation |
| --- | --- | --- |
| Delivery provider(s) and account | Server-side delivery adapter | Account and service coverage confirmed |
| Pickup/delivery zones and rates | Shipping rules configuration | Written rates and delivery responsibilities |
| Tracking credentials / webhook secret | Encrypted server environment | Provider webhook verification |
| Packaging and fulfilment rules | Seller operations documentation | Seller agreement and exception handling |
| Returns, failed delivery and lost parcel process | Policies and support workflows | Clear customer-facing terms |

## 4. Communications and support

| Item to provide later | Integration area | Handling |
| --- | --- | --- |
| Official support email | Site contact and transactional email sender | Verify mailbox ownership |
| Business phone / WhatsApp contact | Contact page and support links | Publish only after confirming the number |
| Transactional email provider | Server-side email adapter | API secret stays in encrypted hosting environment |
| Sender domain and DNS records | Email provider / domain DNS | SPF, DKIM and DMARC verification |
| Support hours and escalation contact | Support policy | Founder supplies accurate details |

## 5. Business identity and policies

Founder-supplied details will be placed in the relevant site configuration and policy pages only after verification:
- Legal/business name and any registration details.
- Official business address or service area (do not publish a home address by default).
- Tax details where applicable.
- Privacy contact and data-retention decisions.
- Customer support, delivery, cancellation, refund and complaint policies.
- Seller eligibility, product restrictions, supplier permissions and moderation rules.

Do not publish CAC numbers, tax identifiers, bank details, identity documents or personal contact data unless there is a clear legal/operational reason and an approved secure destination.

## 6. Analytics and marketing

| Item to provide later | Integration area | Handling |
| --- | --- | --- |
| Analytics provider/account | Consent-aware analytics module | No personal data in URLs or event payloads |
| Search Console / webmaster verification | Site metadata or DNS | Verification token only in the appropriate owner-controlled location |
| Social profile URLs | Footer, contact and social starter kit | Only official accounts controlled by the founder |
| Brand assets and approved photography | `assets/` and catalogue | Confirm usage rights and image consent |

## 7. Supplier and catalogue records

For every supplier/listing, collect:
- Supplier legal/trading name and verified contact.
- Written permission to publish products and images.
- Product name, SKU, category, description and accurate price.
- Stock owner and stock-update process.
- Fulfilment location, delivery coverage and handling times.
- Returns/warranty terms and product safety/compliance evidence.
- Product image rights and current availability.

No supplier is considered a partner until the founder has contacted them and obtained clear agreement.

## 8. Handoff process

When the founder has an item ready, provide the non-secret details and identify the provider/account area. For secrets, configure them directly in the provider's encrypted environment settings; share only the variable name and confirmation that it has been set. Each integration will be added to its appointed adapter/configuration section, documented, tested in a preview environment and left inactive until its readiness gate is passed.

## Current status

- The repository contains integration slots and documentation, not live provider connections.
- No production Supabase project, merchant account, delivery account, email provider, analytics property or verified social account is configured.
- Do not accept real orders or payments based on these placeholders.
