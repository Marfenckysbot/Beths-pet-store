# Server-side integration workspace

Netlify Functions are the appointed location for trusted backend adapters. The directory is configured in `netlify.toml`; this README is not an active endpoint and no payment or external API handler is enabled yet.

## Planned function boundaries

| Function area | Intended responsibility | Required protections |
| --- | --- | --- |
| `payments-create-intent` | Validate cart and create a provider checkout/payment intent | Authenticated customer, server-side price lookup, idempotency, merchant account checks |
| `payments-webhook` | Verify provider payment events and mark orders paid | Signature verification, replay protection, idempotency, immutable transaction audit |
| `orders-create` | Create pending orders from server-validated products and stock | Server-side price/stock validation, atomic inventory reservation, customer ownership |
| `delivery-quote` | Request delivery options and prices | Validated addresses, provider limits, no secret exposure |
| `delivery-webhook` | Receive tracking and delivery state changes | Signature verification, event deduplication |
| `transactional-email` | Send account/order/seller notifications | Verified sender domain, consent and template escaping |

## Server environment variables (names only)

Configure secrets in the Netlify site environment, never in Git or browser code:
- `SUPABASE_URL`
- `SUPABASE_SERVICE_ROLE_KEY` (server functions only; never expose to clients)
- `PAYMENT_PROVIDER_SECRET_KEY`
- `PAYMENT_WEBHOOK_SECRET`
- `DELIVERY_PROVIDER_API_KEY`
- `DELIVERY_WEBHOOK_SECRET`
- `EMAIL_PROVIDER_API_KEY`

Use only the variables needed by the selected provider. Do not send secret values in chat. The founder can configure them directly in the hosting provider's encrypted environment settings and tell us the variable names that are ready.

## Implementation rules

1. All money, stock, permissions and order totals must be recalculated on the server.
2. Browser redirects and client-submitted success flags are never proof of payment.
3. Verify webhook signatures before parsing trusted event data; make handlers idempotent.
4. Keep provider-specific code behind small adapters so payment, delivery and email vendors can be replaced without rewriting storefront pages.
5. Log event IDs and safe operational metadata, never passwords, full payment credentials or unnecessary personal data.
6. Keep checkout disabled until sandbox, failure, refund, duplicate-webhook and low-value live tests pass.

No function handlers are intentionally created yet: there is no Supabase project, approved merchant account, delivery provider or email provider to configure. This folder is ready for those integrations when the founder has the required accounts and credentials.
