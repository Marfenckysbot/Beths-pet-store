# Product detail and seller storefront preview

## Added in this milestone
- Product cards link to dedicated product.html?slug=... detail pages.
- Product detail pages include a photo gallery, description, price, category, availability note, preview-bag action and related listings.
- Approved Supabase products resolve by product slug and link to the approved seller storefront.
- Active approved sellers have dedicated store.html?slug=... pages with store description, country and approved product grid.
- Sample products remain clearly labelled as concept previews. No seller, stock, offer or availability is invented.
- Sample product details work without a database; live seller pages explain that they open after backend setup.

## Live data requirements
Add the Supabase project URL and public anon/publishable key to scripts/portal-config.js, then apply the base schema and required migrations in order. Public pages request active products and active sellers only.

## Boundaries
No checkout, payment, order creation, shipping promise or seller payout is enabled. Live data behavior is not production-tested until a real Supabase project is configured and tested.
