# Customer account

The customer-facing account area is available at `account.html`.

## Included
- Email/password sign-in, sign-up, sign-out and password reset.
- Private profile name and ISO 3166-1 alpha-2 country code stored in `public.profiles`; the profile form accepts two-letter codes worldwide rather than a short hard-coded country list.
- Account wishlist stored in `public.favorites` with owner-only row-level security.
- A one-time import of valid live product UUIDs from the browser's `beths-preview-wishlist` when the customer opens the account page.
- Read-only order history using the customer's own order rows.
- Links back to product detail pages for saved active seller listings.

## Boundaries
- Preview sample products are not imported as customer favorites.
- A local wishlist item is only synced when its ID is a real product UUID; a product must still be active and visible to appear in the account list.
- Checkout, payment, address book, order creation, cancellation, refunds and delivery tracking are not enabled.
- No customer profile or order data is available until a Supabase project is configured and the schema is applied.

## Setup and test
Follow `docs/PORTAL-SETUP.md` to configure Supabase Auth and apply the base schema. Test profile read/write with country codes from different regions, favorite isolation between two accounts, local-wishlist import and read-only order visibility using separate customer accounts. The account page is code-complete but has not been live-tested against a configured Supabase project.
