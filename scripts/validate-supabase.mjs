import { readFileSync, existsSync } from "node:fs";

const migrationPath = "supabase/migrations/20261109_admin_and_seller_workflows.sql";
const schemaPath = "supabase/schema.sql";
const errors = [];

for (const path of [migrationPath, schemaPath]) {
  if (!existsSync(path)) errors.push("Missing required SQL file: " + path);
}

if (!errors.length) {
  const migration = readFileSync(migrationPath, "utf8");
  const schema = readFileSync(schemaPath, "utf8");
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
  if (/service_role\\s*[:=]\\s*['"]|sk_live_[A-Za-z0-9]+|sk_test_[A-Za-z0-9]+/i.test(migration)) errors.push("Do not commit service-role or payment secrets");
  if (!migration.includes("v_application.email") || !migration.includes("auth.users")) errors.push("Seller claiming must verify the approved applicant's authenticated email");
  if (!migration.includes("auth.uid(), v_application.id") || !migration.includes("'pending'")) errors.push("New seller accounts must remain pending until manually activated");
}

if (errors.length) {
  console.error(errors.map(error => "✖ " + error).join("\n"));
  process.exit(1);
}

console.log("✓ Supabase schema and moderation workflow guardrails passed.");
