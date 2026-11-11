import { readFileSync, existsSync } from "node:fs";

const migrationPath = "supabase/migrations/20261109_admin_and_seller_workflows.sql";
const storagePath = "supabase/migrations/20261109_product_image_storage.sql";
const inventoryPath = "supabase/migrations/20261109_seller_inventory_management.sql";
const modelPath = "supabase/migrations/20261111_product_3d_models.sql";
const sellerClaimPath = "supabase/migrations/20261111_harden_seller_claim_rpc.sql";
const productGuardPath = "supabase/migrations/20261111_lock_down_product_update_permissions.sql";
const inventoryFixPath = "supabase/migrations/20261111_fix_invoker_inventory_rpc_columns.sql";
const writeGrantsPath = "supabase/migrations/20261111170539_tighten_customer_and_seller_write_grants.sql";
const defaultPrivilegesPath = "supabase/migrations/20261111170917_restrict_future_public_object_defaults.sql";
const productInsertPath = "supabase/migrations/20261111171018_restrict_product_insert_columns.sql";
const adminModerationGrantsPath = "supabase/migrations/20261111171234_restore_admin_moderation_column_grants.sql";
const schemaPath = "supabase/schema.sql";
const portalPath = "scripts/portal.js";
const cataloguePath = "scripts/marketplace.js";
const configPath = "scripts/portal-config.js";
const handoffPath = "docs/FOUNDER-HANDOFF-CHECKLIST.md";
const readinessPath = "docs/MARKETPLACE-READINESS.md";
const functionsReadmePath = "netlify/functions/README.md";
const errors = [];

for (const path of [migrationPath, storagePath, inventoryPath, modelPath, sellerClaimPath, productGuardPath, inventoryFixPath, writeGrantsPath, defaultPrivilegesPath, productInsertPath, adminModerationGrantsPath, schemaPath, portalPath, cataloguePath, configPath, "portal.html", "account.html", "scripts/account.js", handoffPath, readinessPath, functionsReadmePath]) {
  if (!existsSync(path)) errors.push("Missing required workflow or handoff file: " + path);
}

if (!errors.length) {
  const migration = readFileSync(migrationPath, "utf8");
  const schema = readFileSync(schemaPath, "utf8");
  const portal = readFileSync(portalPath, "utf8");
  const catalogue = readFileSync(cataloguePath, "utf8");
  const storage = readFileSync(storagePath, "utf8");
  const inventory = readFileSync(inventoryPath, "utf8");
  const modelMigration = readFileSync(modelPath, "utf8");
  const sellerClaimMigration = readFileSync(sellerClaimPath, "utf8");
  const productGuardMigration = readFileSync(productGuardPath, "utf8");
  const inventoryFixMigration = readFileSync(inventoryFixPath, "utf8");
  const writeGrantsMigration = readFileSync(writeGrantsPath, "utf8");
  const defaultPrivilegesMigration = readFileSync(defaultPrivilegesPath, "utf8");
  const productInsertMigration = readFileSync(productInsertPath, "utf8");
  const adminModerationGrantsMigration = readFileSync(adminModerationGrantsPath, "utf8");
  const portalConfig = readFileSync(configPath, "utf8");
  const account = readFileSync("scripts/account.js", "utf8");
  const accountHtml = readFileSync("account.html", "utf8");
  const handoff = readFileSync(handoffPath, "utf8");
  const readiness = readFileSync(readinessPath, "utf8");
  const functionsReadme = readFileSync(functionsReadmePath, "utf8");
  const requiredFunctions = [
    "review_seller_application",
    "claim_approved_seller",
    "set_seller_moderation_status",
    "review_marketplace_product"
  ];

  for (const name of requiredFunctions) {
    if (!migration.includes("function public." + name)) errors.push("Missing workflow function: " + name);
    if (!migration.includes("grant execute on function public." + name)) errors.push("Missing authenticated execute grant: " + name);
  }

  if (!schema.includes("enable row level security")) errors.push("Base schema must enable row-level security");
  if (!schema.includes("model_url text") || !modelMigration.includes("products_model_url_https_check")) errors.push("Optional 3D model URLs must be represented in schema and HTTPS-constrained migration");
  if (!portal.includes("product-model-url") || !portal.includes("edit-product-model-url")) errors.push("Seller portal must expose optional 3D model URL fields");
  if (!catalogue.includes("model-viewer") || !catalogue.includes("model_url")) errors.push("Product details must support optional interactive 3D model viewing");
  if (!migration.includes("public.is_marketplace_admin()")) errors.push("Moderation migration must enforce administrator checks");
  if (!migration.includes("security definer")) errors.push("Workflow functions must use controlled security-definer execution");
  if (!migration.includes("revoke all on function")) errors.push("Workflow functions must revoke default public execution");
  if (/service_role\s*[:=]\s*['"]|sk_live_[A-Za-z0-9]+|sk_test_[A-Za-z0-9]+/i.test(migration)) errors.push("Do not commit service-role or payment secrets");
  if (!migration.includes("v_application.email") || !migration.includes("auth.users") || !migration.includes("email_confirmed_at")) errors.push("Legacy seller application bootstrap must verify confirmed email");
  if (!sellerClaimMigration.includes("security invoker") || !sellerClaimMigration.includes("applicant claim approved seller") || !sellerClaimMigration.includes("a.applicant_id = (select auth.uid())") || !sellerClaimMigration.includes("a.status = 'approved'")) errors.push("Seller claiming must use an invoker RPC and an RLS policy restricted to the applicant's own approved application");
  if (!sellerClaimMigration.includes("revoke all on function public.claim_approved_seller") || !sellerClaimMigration.includes("grant execute on function public.claim_approved_seller")) errors.push("Seller claim RPC must revoke public execution and grant authenticated execution only");
  if (!productGuardMigration.includes("revoke update on table public.products from authenticated") || !productGuardMigration.includes("grant update (category_id, name, slug, description, price_usd, model_url, status, inventory_quantity)")) errors.push("Product updates must use a restricted column-level grant");
  if (/grant update on public\.products to authenticated/i.test(productGuardMigration)) errors.push("Product guard migration must not restore table-wide UPDATE privileges");
  if (!productGuardMigration.includes("guard_product_seller_status_change") || !productGuardMigration.includes("new.status not in ('pending', 'archived')")) errors.push("Seller product status changes must be guarded against self-publication");
  if (!productGuardMigration.includes("security invoker") || !inventoryFixMigration.includes("security invoker")) errors.push("Seller inventory/archive RPCs must run as SECURITY INVOKER");
  if (inventoryFixMigration.includes("updated_at = now()")) errors.push("Invoker inventory RPCs must rely on the updated_at trigger rather than writing a protected column");
  if (!writeGrantsMigration.includes("revoke insert, update on table public.profiles from authenticated") || !writeGrantsMigration.includes("grant update (display_name, country_code) on table public.profiles to authenticated")) errors.push("Customer profile writes must be restricted to editable profile columns");
  if (!writeGrantsMigration.includes("revoke insert, update on table public.favorites from authenticated") || !writeGrantsMigration.includes("grant insert (user_id, product_id) on table public.favorites to authenticated")) errors.push("Wishlist writes must not allow UPDATE or caller-supplied timestamps");
  if (!writeGrantsMigration.includes("revoke insert, update on table public.seller_applications from authenticated") || !writeGrantsMigration.includes("revoke insert, update on table public.sellers from authenticated")) errors.push("Seller application and seller profile moderation fields must not be directly writable by authenticated clients");
  if (!migration.includes("auth.uid(), v_application.id") || !migration.includes("'pending'")) errors.push("New seller accounts must remain pending until manually activated");
  for (const fn of ["review_seller_application", "claim_approved_seller", "set_seller_moderation_status", "review_marketplace_product"]) {
    if (!portal.includes(`rpc("${fn}"`)) errors.push("Portal is missing moderation integration: " + fn);
  }
  if (!storage.includes("5242880") || !storage.includes("image/webp")) errors.push("Product image bucket must enforce size and image MIME limits");
  for (const name of ["seller_update_inventory", "seller_set_product_archived"]) {
    if (!inventory.includes("function public." + name)) errors.push("Missing seller inventory function: " + name);
    if (!inventory.includes("grant execute on function public." + name)) errors.push("Missing authenticated inventory grant: " + name);
    if (!inventory.includes("revoke all on function public." + name)) errors.push("Seller inventory function must revoke public execution: " + name);
  }
  if (!inventory.includes("s.owner_user_id = auth.uid()")) errors.push("Seller inventory functions must verify seller ownership");
  if (!inventory.includes("p_inventory_quantity < 0")) errors.push("Seller inventory updates must reject negative stock");
  if (!portal.includes('rpc("seller_update_inventory"') || !portal.includes('rpc("seller_set_product_archived"')) errors.push("Portal is missing seller inventory RPC integration");
  if (!portal.includes('status:"pending"')) errors.push("Product content edits must return listings to moderation");

  if (!storage.includes("storage.foldername(name)") || !storage.includes("s.owner_user_id = auth.uid()")) errors.push("Product image uploads must be scoped to the owning seller");
  if (!catalogue.includes('eq("status","active")') || !catalogue.includes("loadLiveProducts")) errors.push("Public catalogue must load approved seller products only");
  if (/service_role\s*[:=]\s*["']|sk_live_[A-Za-z0-9]+|sk_test_[A-Za-z0-9]+/i.test(portalConfig + portal)) errors.push("Do not expose privileged or payment credentials in browser files");
  if (!schema.includes("create table if not exists public.favorites") || !schema.includes("favorites owner only")) errors.push("Customer favorites must use owner-only row-level security");
  if (!schema.includes("profiles read own") || !schema.includes("profiles update own")) errors.push("Customer profiles must use owner-only row-level security");
  if (!accountHtml.includes('id="customer-profile-form"') || !accountHtml.includes('id="customer-orders"')) errors.push("Customer account page is missing profile or order-history sections");
  if (account.includes('.from("profiles").upsert') || !account.includes('.from("profiles").update(') || !account.includes('.from("profiles").insert(payload)')) errors.push("Customer profile saving must use separately scoped INSERT and UPDATE operations, not an upsert requiring broader privileges");
  if (/service_role\s*[:=]\s*["']|sk_live_[A-Za-z0-9]+|sk_test_[A-Za-z0-9]+/i.test(account)) errors.push("Do not expose privileged or payment credentials in customer account JavaScript");

  if (!handoff.includes("Never paste passwords") || !handoff.includes("encrypted server environment")) errors.push("Founder handoff must clearly explain secret handling");
  if (!readiness.includes("Definition of ready to accept real orders") || !readiness.includes("Checkout, payment collection")) errors.push("Marketplace readiness must document real-order launch gates");
  if (!functionsReadme.includes("SUPABASE_SERVICE_ROLE_KEY") || !functionsReadme.includes("server functions only")) errors.push("Server integration documentation must keep privileged keys server-side");
}

if (errors.length) {
  console.error(errors.map(error => "✖ " + error).join("\n"));
  process.exit(1);
}

console.log("✓ Supabase schema, seller-claim RLS, and moderation workflow guardrails passed.");
