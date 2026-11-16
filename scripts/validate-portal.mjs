import { readFileSync } from "node:fs";

const checks = [
  { page: "account.html", script: "scripts/account.js" },
  { page: "portal.html", script: "scripts/portal.js" }
];
const errors = [];

for (const { page, script } of checks) {
  const html = readFileSync(page, "utf8");
  const js = readFileSync(script, "utf8");
  const ids = [...html.matchAll(/\bid=["']([^"']+)["']/g)].map(match => match[1]);
  const idSet = new Set(ids);
  const duplicates = [...new Set(ids.filter((id, index) => ids.indexOf(id) !== index))];
  for (const id of duplicates) errors.push(page + " -> duplicate id: " + id);

  const selectors = [...new Set([...js.matchAll(/\$\(["']#([^"' ]+)["']\)/g)].map(match => match[1]))];
  for (const id of selectors) {
    if (!idSet.has(id)) errors.push(script + " -> selector references missing #" + id + " in " + page);
  }

  if (!/<html\b[^>]*\blang=["'][^"']+["']/i.test(html)) errors.push(page + " -> document language is missing");
  if (!/<meta\b[^>]*name=["']viewport["']/i.test(html)) errors.push(page + " -> viewport metadata is missing");
  if (!/<title>[^<]+<\/title>/i.test(html)) errors.push(page + " -> page title is missing");
  if (!js.includes("config.authRedirectsConfigured===true")) {
    errors.push(script + " -> account creation and password reset must remain gated on confirmed redirect configuration");
  }
  if (!js.includes("emailRedirectTo:location.origin+") || !js.includes("redirectTo:location.origin+")) {
    errors.push(script + " -> auth email and password-reset redirects must use the current site origin");
  }
}

const publicConfig = readFileSync("scripts/portal-config.js", "utf8");
if (/service[_-]?role|secret[_-]?key|sb_secret_/i.test(publicConfig)) {
  errors.push("scripts/portal-config.js -> possible privileged/secret key in browser configuration");
}

if (errors.length) {
  console.error("Portal contract checks failed:");
  for (const error of errors) console.error(" - " + error);
  process.exitCode = 1;
} else {
  console.log("Portal contract checks passed: account/portal DOM selectors, unique IDs, document metadata, auth redirect gates and public-key configuration.");
}
