# Beth's Pet Store — low-cost pre-launch roadmap

This plan is for a founder who is not yet CAC-registered and has no startup budget. It is a preparation plan, not legal permission to trade. Do not accept customer payments or represent the preview catalogue as live inventory until the business, supplier, payment, consumer-protection and fulfilment requirements have been checked.

## Stage 0 — Prepare without spending (now)

- Keep the existing marketplace branch as a draft; do not merge or deploy it to production without an explicit go-ahead.
- Use a dedicated business email and a business-owned phone number when available. Do not publish a personal home address.
- Prepare a one-page supplier introduction and a spreadsheet with supplier name, public business contact, category, location/service area, catalogue date, stock update method, wholesale/commission terms, delivery method, evidence checked, follow-up date and status.
- Ask suppliers for permission before copying their product photos, descriptions, logos or prices.
- Build social profiles only when the founder can complete email/phone verification and retain account recovery access.
- Publish educational content and a transparent "coming soon / supplier applications welcome" message. Do not advertise unverified stock, animals, medicines or delivery promises.

## Stage 1 — Validate the supply network

- Approach at least five established pet-supply businesses and ask for a catalogue, current trade prices, stock update frequency, order cut-off times, fulfilment location, dispatch options, returns policy and permission to list.
- Prefer a referral/commission or supplier-direct fulfilment pilot that requires no inventory purchase.
- Get written terms before publishing listings: who owns the stock, who confirms availability, who invoices, who collects payment, who ships, who handles returns and refunds, who bears loss/damage, and when Beth earns commission.
- Verify business identity and any relevant sector permits. Keep an internal record of the evidence and the date checked.
- Start with non-regulated accessories, cages, carriers, grooming tools and general pet supplies from verifiable suppliers.

## Stage 2 — CAC and legal readiness (when funds permit)

- Review the current CAC Business Name process and official fees directly on the CAC portal; fees can change. The official CAC says an individual proprietor can register a business name without hiring a lawyer, accountant or chartered secretary.
- Do not assume an unregistered trading name has the same legal status as a registered business. Before taking orders or signing supplier/payment agreements, obtain local legal/accounting guidance on the correct structure, tax, consumer rights, privacy and recordkeeping.
- Use only the official CAC portal: https://icrp.cac.gov.ng/ and official CAC information: https://www.cac.gov.ng/services/business-name
- Do not send BVN, NIN, ID scans, bank credentials or passwords in chat. Submit identity and financial information only through the official provider's secure onboarding flow.

## Stage 3 — Order operations before checkout

1. Customer submits an order enquiry or request-to-order.
2. Beth checks the listing is current and asks the supplier to confirm stock, condition, price, delivery cost and dispatch estimate.
3. Customer receives the confirmed total, fulfilment party, expected delivery window and cancellation/refund terms.
4. Only after the business/payment arrangement is approved should the platform collect payment using a compliant provider.
5. Supplier dispatches; tracking or proof of handover is recorded.
6. Beth updates the customer, handles support and records the supplier settlement/commission.

For the initial pilot, use manual confirmation and a secure business-owned workflow. Do not take payment into an unrelated person's account or ask customers to pay a supplier whose identity and terms have not been verified.

## Stage 4 — Website backend and payments

- Create Supabase only when ready to configure and secure it; apply the schema after a security review.
- Implement authentication, role permissions, seller approval, listing moderation, inventory timestamps and audit logs.
- Use server-side payment initiation and verified payment webhooks. Never put secret keys in browser code or Git.
- Agree commissions, settlement timing, refunds, disputes, chargebacks, taxes, shipping and seller responsibilities before enabling checkout.
- Run sandbox tests and a controlled pilot before public launch.

## Stage 5 — Regulated categories

Keep veterinary medicines, vaccines, biologics, prescription products and animal-health claims out of the live catalogue until the exact products, suppliers, advertising, storage, transport and marketplace role have been checked with NAFDAC and qualified Nigerian counsel. NAFDAC's Veterinary Medicine and Allied Products Directorate regulates veterinary drugs and related products: https://nafdac.gov.ng/about-nafdac/nafdac-organisation/directorates/veterinary-medicine-and-allied-products/

Do not offer dosing advice, diagnosis or treatment recommendations. Direct customers to a registered veterinarian. Temperature-sensitive products need validated cold-chain handling.

Animal listings require seller verification, welfare standards, veterinary/health records, lawful movement and transport arrangements. Start with local, carefully verified partners; do not promise international live-animal delivery until import/export and welfare requirements are confirmed.

## Stage 6 — Marketing

- Begin with organic posts: useful pet-care education, supplier introductions (with permission), product demonstrations, founder progress and clear calls to join a waitlist or enquire.
- Collect consent before sending marketing messages. Do not buy contact lists or scrape personal details.
- Start paid campaigns only after the site has verified listings, a tested enquiry/order path, customer support, a refund policy and proven fulfilment.
- Test small, measurable campaigns on Google Ads, TikTok Ads and Meta Ads only after checking each platform's current country, category, account and payment rules. Veterinary medicines and animal sales may face additional ad restrictions.
- Measure qualified enquiries, supplier-confirmed orders, fulfilment rate, cancellations, customer acquisition cost and contribution margin—not just clicks or followers.

## Definition of "ready to accept real orders"

- Legal structure and business obligations reviewed.
- Supplier agreements and listing permissions recorded.
- Real, timestamped stock and prices.
- Clear shipping, returns, cancellations and privacy terms.
- Payment account approved and settlement tested.
- Order support and dispute owner assigned.
- Regulated categories excluded unless specifically cleared.
- Mobile, accessibility, security and form-submission QA passed.

Until these are true, the site is a pre-launch showcase and enquiry channel, not an operating checkout marketplace.
