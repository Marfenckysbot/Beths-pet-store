# Planned server-side integration workspace

This folder is retained as a legacy planning document from the earlier Netlify hosting setup. The live project is now deployed on Vercel, and **Netlify Functions in this folder do not execute on Vercel**.

When integrations are approved, implement the trusted server endpoints as Vercel Functions (for example under `api/`) or Supabase Edge Functions. Keep provider-specific code behind small adapters so vendors can be replaced without rewriting the storefront.

## Planned function boundaries

| Function area | Intended responsibility | Required protections |
| --- | --- | --- |
| `payments-create-intent` | Validate cart and create a provider checkout/payment intent | Authenticated customer, server-side price lookup, idempotency, merchant account checks |
| `payments-webhook` | Verify provider payment events and mark orders paid | Signature verification, replay protection, idempotency, immutable transaction audit |
| `orders-create` | Create pending orders from server-validated products and stock | Server-side price/stock validation, atomic inventory reservation, customer ownership |
| `delivery-quote` | Request delivery options and prices | Validated addresses, provider limits, no secret exposure |
| `delivery-webhook` | Receive tracking and delivery state changes | Signature verification, event deduplication |
| `transactional-email` | Send account/order/seller notifications | Verified sender domain, consent and template escaping |
| `site-inquiry` | Accept contact, support and feedback submissions | Strict schema validation, spam/rate controls, private storage, admin-only reads |

## Server environment variables (names only)

Configure secrets in the Vercel project's encrypted Environment Variables or Supabase Edge Function secrets, never in Git or browser code:
- `SUPABASE_URL`
- `SUPABASE_SERVICE_ROLE_KEY` (server functions only; never expose to clients)
- `PAYMENT_PROVIDER_SECRET_KEY`
- `PAYMENT_WEBHOOK_SECRET`
- `DELIVERY_PROVIDER_API_KEY`
- `DELIVERY_WEBHOOK_SECRET`
- `EMAIL_PROVIDER_API_KEY`

Use only the variables needed by the selected provider. Do not send secret values in chat. The founder can configure them directly in the provider's encrypted environment settings and tell us only which variable names are ready.

## Implementation rules

1. All money, stock, permissions and order totals must be recalculated on the server.
2. Browser redirects and client-submitted success flags are never proof of payment.
3. Verify webhook signatures before parsing trusted event data; make handlers idempotent.
4. Keep provider-specific code behind small adapters so payment, delivery and email vendors can be replaced without rewriting storefront pages.
5. Log event IDs and safe operational metadata, never passwords, full payment credentials or unnecessary personal data.
6. Keep checkout disabled until sandbox, failure, refund, duplicate-webhook and reconciliation tests pass.

## Current status

The Supabase project exists and its database schema/migrations are live. No payment, delivery or transactional email provider is connected. No server-side provider handlers are active. Contact, support and feedback forms are temporarily disabled because their old Netlify Forms backend does not work on Vercel. The site inquiry endpoint is a remaining pre-launch task.

Checkout, order creation, payment collection, refunds and payouts remain disabled.
