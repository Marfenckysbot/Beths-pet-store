# Beth's Pet Store — payment provider and implementation plan

## Decision status

- Preferred provider to validate: **Flutterwave**.
- Intended model: marketplace checkout with a platform commission and vendor subaccount settlement (split payment), subject to merchant-category, country, and marketplace approval by Flutterwave.
- Environment: sandbox/test mode only until merchant onboarding, legal/compliance review, and end-to-end tests pass.
- No live merchant account, payment secret, checkout, real charge, or payout is enabled by this plan.

## Why Flutterwave is the first provider to validate

Flutterwave documents split payments for marketplace/aggregator use cases. A payment can allocate a commission to the platform and settle vendor shares to linked subaccounts. It supports one or multiple vendor subaccounts in a transaction. The platform owner is responsible for vetting merchants, and disputes/chargebacks can be logged against the platform account.

Official references:
- https://developer.flutterwave.com/docs/split-payments
- https://flutterwave.com/ng/support/onboarding/onboarding-requirements-for-using-flutterwave-in-nigeria
- https://www.flutterwave.com/ng/pricing

**Important country gate:** the merchant account must be opened for the actual country and legal entity that owns/operates Beth's Pet Store. If that entity is incorporated outside Nigeria, confirm Flutterwave supports that country, marketplace activity, settlement currencies, and split settlements for that account before committing. If it does not, compare a locally supported alternative (including Paystack only where eligible) before writing provider-specific production code.

## Recommended payout arrangement

1. Customer pays through the platform checkout.
2. Server validates current product price, stock, seller status, shipping and currency; browser-supplied totals are never trusted.
3. The platform creates an order and a pending payment record.
4. Flutterwave checkout is initialized server-side using a unique order/payment reference.
5. A signed provider webhook is verified server-side; the server also verifies the transaction with Flutterwave before marking an order paid.
6. Once verified, the order and immutable seller/commission ledger entries are committed idempotently.
7. Flutterwave split settlement allocates each vendor's agreed share and Beth's commission to approved provider subaccounts. Do not create vendor subaccounts until vendor identity and payout-account checks pass.
8. Refunds, cancellations, chargebacks, reconciliation, and failed/duplicate webhooks are handled through trusted server workflows and recorded in the ledger.

Do not describe this as escrow. Direct split settlement can pay a vendor according to the provider's settlement cycle; it does not guarantee that the vendor has fulfilled the order. Define seller fulfilment, refund, reserve, and dispute procedures before live use. If the business needs to delay payouts until delivery or a returns period ends, obtain provider approval for that model and legal advice before holding or controlling customer funds.

## Implementation phases

### Phase 0 — eligibility and commercial decisions (blocking)
- Confirm the country where the operating legal entity is incorporated/registered, its legal form, and the country of its settlement bank account.
- Confirm Flutterwave accepts the entity type, pet-product marketplace business model, intended seller categories, and countries of buyer/seller operation.
- Obtain provider approval for split payments and the proposed commission/payout model.
- Confirm currencies supported for collection, settlement and vendor subaccounts, and the provider's current fees, VAT, settlement timing, refund and chargeback rules.
- Approve seller onboarding/KYC, seller agreement, customer terms, privacy notice, shipping, cancellation, refund and dispute policies.

### Phase 1 — data model and server-side foundation
- Reconcile the current USD-only order schema with the actual checkout and settlement currencies. Store currency explicitly per order, item, payment and ledger entry; use integer minor units (or a carefully validated decimal strategy), never floating-point arithmetic for money.
- Add immutable order-item price, currency, seller, commission-rate and seller-net snapshots so later catalogue edits cannot rewrite a completed order.
- Add provider payment attempts, webhook event/idempotency records, refund records and reconciliation references with least-privilege RLS.
- Create a server-only Flutterwave adapter in a Supabase Edge Function or Vercel server function. Never expose secret keys or webhook secrets to browser code.
- Add server-side order creation and stock reservation; use a database transaction or atomic RPC to prevent overselling and duplicate orders.

### Phase 2 — checkout and verification
- Initialize checkout only from a trusted server endpoint.
- Use an unguessable, unique payment reference per attempt and bind it to the customer/order.
- Verify webhook signatures exactly as Flutterwave specifies, reject invalid signatures, persist event IDs, and make handlers idempotent.
- Independently verify the transaction with Flutterwave's API before marking an order paid.
- Verify amount, currency, reference, status, customer/order association and expected merchant account.
- Never treat a browser redirect or success screen as proof of payment.

### Phase 3 — vendor settlement and operations
- Create provider subaccounts only after seller identity, bank ownership and provider KYC checks.
- Apply the approved commission policy; show sellers gross sale, provider fees, platform commission, refunds and net settlement transparently.
- Implement refund/partial-refund and chargeback workflows, seller balance adjustments, payout failure handling and daily reconciliation.
- Keep an auditable ledger; do not store card numbers, CVVs, bank login credentials or identity documents in the marketplace database.
- Add admin controls for payment review and settlement exceptions, with audit logs and role checks.

### Phase 4 — sandbox QA and launch gates
- Test successful, declined, abandoned, delayed, duplicated and out-of-order webhook cases.
- Test wrong amount/currency/reference, invalid signatures, replayed webhooks, multiple sellers, out-of-stock races, partial refunds, full refunds and chargebacks.
- Test customer, seller and admin permissions separately; ensure sellers see only their own orders and ledger entries.
- Run security/performance advisors and browser/mobile QA.
- Activate live mode only after provider approval, verified settlement account, approved policies, signed-off seller agreements, and explicit owner authorization.

## Current repository implications

The existing storefront bag is explicitly a local preview and does not create orders. The current database order/payment schema is USD-only, while Flutterwave's Nigeria pricing and settlement are NGN-centric. This currency mismatch must be resolved before checkout is enabled. No payment integration should be bolted onto the preview bag as if it were a real order.

## Secrets and owner-only steps

When ready, add the provider's secret API key and webhook secret directly to the hosting provider's encrypted environment settings. Do not paste them into chat, GitHub, browser configuration, or source files. The owner must complete identity/business verification and approve the settlement account in the provider dashboard; an assistant cannot lawfully complete KYC or attest to ownership on the owner's behalf.

## Decision required before provider-specific implementation

Confirm the actual country of incorporation/registration for the legal entity that will own Beth's Pet Store. The word “other” is not enough to determine provider eligibility, onboarding category, settlement account requirements, or currency rules.
