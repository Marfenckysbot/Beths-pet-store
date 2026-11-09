import { readFileSync, existsSync } from "node:fs";

const migrationPath = "supabase/migrations/20261109_admin_and_seller_workflows.sql";
const storagePath = "supabase/migrations/20261109_product_image_storage.sql";
const inventoryPath = "supabase/migrations/20261109_seller_inventory_management.sql";
const schemaPath = "supabase/schema.sql";
const portalPath = "scripts/portal.js";
const cataloguePath = "scripts/marketplace.js";
const configPath = "scripts/portal-config.js";
const errors = [];

for (const path of [migrationPath, storagePath, inventoryPath, schemaPath, portalPath, cataloguePath, configPath, "portal.html", "account.html", "scripts/account.js"]) {
  if (!existsSync(path)) errors.push("Missing required SQL file: " + path);
}

if (!errors.length) {
  const migration = readFileSync(migrationPath, "utf8");
  const schema = readFileSync(schemaPath, "utf8");
  const portal = readFileSync(portalPath, "utf8");
  const catalogue = readFileSync(cataloguePath, "utf8");
  const storage = readFileSync(storagePath, "utf8");
  const inventory = readFileSync(inventoryPath, "utf8");
  const portalConfig = readFileSync(configPath, "utf8");
  const account = readFileSync("scripts/account.js", "utf8");
  const accountHtml = readFileSync("account.html", "utf8");
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
  if (!migration.includes("public.is_marketplace_admin()")) errors.push("Moderation migration must enforce administrator checks");
  if (!migration.includes("security definer")) errors.push("Workflow functions must use controlled security-definer execution");
  if (!migration.includes("revoke all on function")) errors.push("Workflow functions must revoke default public execution");
  if (/service_role\s*[:=]\s*['"]|sk_live_[A-Za-z0-9]+|sk_test_[A-Za-z0-9]+/i.test(migration)) errors.push("Do not commit service-role or payment secrets");
  if (!migration.includes("v_application.email") || !migration.includes("auth.users") || !migration.includes("email_confirmed_at")) errors.push("Seller claiming must verify the approved applicant's confirmed email");
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
  if (/service_role\s*[:=]\s*["']|sk_live_[A-Za-z0-9]+|sk_test_[A-Za-z0-9]+/i.test(account)) errors.push("Do not expose privileged or payment credentials in customer account JavaScript");

}

if (errors.length) {
  console.error(errors.map(error => "✖ " + error).join("\n"));
  process.exit(1);
}

console.log("✓ Supabase schema and moderation workflow guardrails passed.");
