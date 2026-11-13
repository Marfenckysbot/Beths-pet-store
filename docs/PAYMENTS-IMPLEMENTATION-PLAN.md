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

**Initial operating assumption:** Beth's Pet Store is being prepared from Nigeria, and the founder has not yet registered a CAC business. The website itself remains international; this does not make the storefront Nigeria-only. First validate whether a Nigerian unregistered-business Starter account can accept direct payments for products genuinely sold by Beth's Pet Store. The provider must confirm the account category, KYC requirements, supported buyer currencies, settlement currency, product category, and any limits before live use. Do not claim that a Starter account is eligible for marketplace aggregation, split settlement, or third-party seller payouts unless Flutterwave confirms this in writing. If the provider requires registration for the intended activity, keep checkout in test mode until the business is eligible.

## Recommended rollout: first-party sales before marketplace payouts

**Phase A — Beth-owned products only.** The first live checkout, if approved, should cover only products that Beth's Pet Store actually owns or is authorized to sell as the merchant of record. Each item must have a real supplier/ownership basis, confirmed price, stock quantity, shipping origin, delivery coverage, returns terms, and product-safety/compliance checks. Do not publish the current four illustrative products as live stock. The current browser bag is local-only and must be replaced by server-created orders before any payment button is enabled. Start with one approved collection/settlement currency and make currency explicit in the order and payment model; do not assume the current USD-only schema is compatible with a Nigerian settlement account.

**Phase B — independent sellers.** Keep seller applications and storefront preparation separate from checkout. Do not collect customer money on behalf of third-party sellers, promise seller payouts, or activate split settlements until the provider explicitly approves the marketplace model, seller onboarding/KYC, subaccounts, fee allocation, refund/chargeback responsibilities, and payout timing for this exact merchant account. If the provider does not approve this, keep third-party listings as applications/coming-soon until a compliant payment arrangement is established.

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
- Confirm the founder's exact Nigerian onboarding category and the documents Flutterwave requires for an unregistered business; the owner completes all identity and bank verification directly with the provider.
- Confirm whether direct first-party pet-product sales are permitted for that account type, including product category, collection currencies, settlement currency, transaction limits, refunds and chargebacks.
- Separately confirm whether the provider will approve marketplace aggregation, third-party sellers, subaccounts and split settlement. Do not infer this from general split-payment documentation.
- Confirm the operating legal form and any registration, tax, consumer-protection or other obligations that apply before trading; provider onboarding acceptance is not a legal exemption.
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

## Inputs needed before real first-party checkout

The founder must supply the first genuine Beth-owned product catalogue: product name, description, confirmed selling price, available quantity, product images they have rights to use, shipping origin/coverage, and return terms. No placeholder product should be converted into live stock. The owner must also complete provider onboarding and enter credentials directly into encrypted hosting environment settings. These are the only owner-dependent gates; implementation and sandbox preparation can proceed without exposing credentials in chat.
