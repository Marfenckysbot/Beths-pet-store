# Seller inventory management

The seller workspace at `portal.html` now includes a catalogue management table.

## Seller actions

- **Edit details:** update product name, description, price and category. Saving returns the product to `pending` so an administrator can review the changes before the listing is public again.
- **Update stock:** change the integer inventory quantity without changing the product's current moderation status. A stock value of zero is valid and should be treated as unavailable by the storefront.
- **Archive:** hide a listing without deleting its record or breaking historical order references.
- **Restore:** return an archived listing to `pending`; an administrator must approve it before it is public.

## Security model

- The browser never chooses a seller ID for these actions; the SQL functions derive ownership from `auth.uid()`.
- `seller_update_inventory(uuid, integer)` checks the signed-in user owns the product through an active seller profile and rejects negative quantities.
- `seller_set_product_archived(uuid, boolean)` checks product ownership and retains the product row.
- Product detail edits use seller-owned row-level security and force status back to `pending`. Sellers cannot self-publish through the portal.
- No service-role key is used in the browser. RPC execution is revoked from `public` and `anon`, then granted to `authenticated`.

## Apply and test

Apply the base schema, admin/seller workflow migration, product-image storage migration, then `20261109_seller_inventory_management.sql` in a Supabase project.

Test using two separate seller accounts:
1. Seller A can edit, stock-update and archive only Seller A's products.
2. Seller B cannot access Seller A's product IDs through either RPC.
3. Negative or fractional stock values are rejected by the interface; negative values are also rejected by SQL.
4. Stock updates preserve an active product's status.
5. Editing content changes status to pending; the public catalogue must stop showing it.
6. Archive hides the product; restore returns it to pending.
7. Existing order items remain intact after archive.

These workflows are implemented in the repository but are not live-tested until a Supabase project is configured and migrations are applied.
