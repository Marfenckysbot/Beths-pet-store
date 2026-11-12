import { readdirSync, readFileSync, existsSync, statSync } from "node:fs";
import { dirname, join, resolve } from "node:path";

const root = process.cwd();
const errors = [];
const htmlFiles = readdirSync(root).filter(file => file.toLowerCase().endsWith(".html"));

for (const file of htmlFiles) {
  const html = readFileSync(join(root, file), "utf8");
  const refs = [...html.matchAll(/(?:src|href)=["']([^"']+)["']/gi)].map(match => match[1]);
  for (const ref of refs) {
    if (/^(https?:|mailto:|tel:|data:|javascript:)/i.test(ref) || ref.startsWith("#")) continue;
    const clean = decodeURIComponent(ref.split(/[?#]/)[0]);
    if (!clean) continue;
    const target = clean.startsWith("/")
      ? resolve(root, "." + clean)
      : resolve(root, dirname(file), clean);
    if (!target.startsWith(root) || !existsSync(target)) errors.push(file + " -> missing local reference: " + ref);
    else if (statSync(target).isFile() && statSync(target).size === 0) errors.push(file + " -> referenced file is empty: " + ref);
  }

  for (const match of html.matchAll(/<form\b([^>]*)>/gi)) {
    const attrs = match[1];
    if (/data-netlify=["']true["']/i.test(attrs)) {
      if (!/method=["']post["']/i.test(attrs)) errors.push(file + " -> Netlify form must use POST");
      if (!/name=["'][^"']+["']/i.test(attrs)) errors.push(file + " -> Netlify form needs a name");
    }
  }
}

const siteOrigin = "https://beths-pet-store.vercel.app";
for (const file of htmlFiles) {
  const html = readFileSync(join(root, file), "utf8");
  if (/data-netlify=["']true["']/i.test(html)) errors.push(file + " -> Netlify Forms are not supported by the Vercel deployment; use a Vercel-compatible endpoint");
  if (html.includes("https://beths-pet-store.netlify.app")) errors.push(file + " -> stale Netlify canonical/Open Graph URL remains");
}
for (const path of ["robots.txt", "sitemap.xml"]) {
  const content = readFileSync(join(root, path), "utf8");
  if (!content.includes(siteOrigin)) errors.push(path + " -> must reference the active Vercel origin");
  if (content.includes("beths-pet-store.netlify.app")) errors.push(path + " -> stale Netlify URL remains");
}
const siteConfigText = readFileSync(join(root, "scripts/site.config.js"), "utf8");
if (!siteConfigText.includes('marketLabel: "Global marketplace"')) errors.push("scripts/site.config.js -> marketplace positioning must remain global");

const marketplace = readFileSync(join(root, "scripts/marketplace.js"), "utf8");
for (const match of marketplace.matchAll(/image:"([^"]+)"/g)) {
  if (!existsSync(join(root, match[1]))) errors.push("scripts/marketplace.js -> missing product image: " + match[1]);
}

const publicConfig = readFileSync(join(root, "scripts/site.config.js"), "utf8");
const activeFiles = htmlFiles.map(file => readFileSync(join(root, file), "utf8")).join("\n") + publicConfig;
for (const pattern of [/123 Pet Avenue/i, /G-XXXXXXXXXX/i, /6\.5244\s*,?\s*\/\//, /3\.3792\s*,?\s*\/\//, /\+1\s*\(555\)\s*123-4567/]) {
  if (pattern.test(activeFiles)) errors.push("Potential placeholder analytics, contact or private location data found: " + pattern);
}



const publicBackupArtifacts = readdirSync(root).filter(file => /\.(?:bak|log)$/i.test(file));
for (const file of publicBackupArtifacts) {
  errors.push(file + " -> backup/log files must not be published from the site root");
}

const legacyDeployScripts = [
  "auto_deploy.sh",
  "deploy_all.sh",
  "deploy_all_in_one.sh",
  "deploy_all_in_one.sho",
  "auto_full.sh"
];
for (const path of legacyDeployScripts) {
  if (!existsSync(join(root, path))) continue;
  const script = readFileSync(join(root, path), "utf8");
  if (/^\s*git\s+push\b[^\n]*\bmain\b/gim.test(script)) {
    errors.push(path + " -> direct push to main is prohibited; use a reviewed pull request");
  }
  if (/^\s*netlify\s+deploy\b[^\n]*--prod/gim.test(script)) {
    errors.push(path + " -> production deployment must not be triggered by legacy scripts");
  }
}

if (errors.length) {
  console.error("Beth's Pet Store validation failed:");
  for (const error of errors) console.error(" - " + error);
  process.exitCode = 1;
} else {
  console.log("Beth's Pet Store checks passed: local links/assets, Vercel SEO and form-readiness checks, public-config privacy checks, deployment-script guardrails and public-artifact checks.");
}
