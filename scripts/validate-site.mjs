import { readdirSync, readFileSync, existsSync } from "node:fs";
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
  }

  for (const match of html.matchAll(/<form\b([^>]*)>/gi)) {
    const attrs = match[1];
    if (/data-netlify=["']true["']/i.test(attrs)) {
      if (!/method=["']post["']/i.test(attrs)) errors.push(file + " -> Netlify form must use POST");
      if (!/name=["'][^"']+["']/i.test(attrs)) errors.push(file + " -> Netlify form needs a name");
    }
  }
}

const marketplace = readFileSync(join(root, "scripts/marketplace.js"), "utf8");
for (const match of marketplace.matchAll(/image:"([^"]+)"/g)) {
  if (!existsSync(join(root, match[1]))) errors.push("scripts/marketplace.js -> missing product image: " + match[1]);
}

const publicConfig = readFileSync(join(root, "scripts/site.config.js"), "utf8");
const activeFiles = htmlFiles.map(file => readFileSync(join(root, file), "utf8")).join("\n") + publicConfig;
for (const pattern of [/123 Pet Avenue/i, /G-XXXXXXXXXX/i, /6\.5244\s*,?\s*\/\//, /3\.3792\s*,?\s*\/\//, /\+1\s*\(555\)\s*123-4567/]) {
  if (pattern.test(activeFiles)) errors.push("Potential placeholder analytics, contact or private location data found: " + pattern);
}

if (errors.length) {
  console.error("Beth's Pet Store validation failed:");
  for (const error of errors) console.error(" - " + error);
  process.exitCode = 1;
} else {
  console.log("Beth's Pet Store checks passed: local links/assets, Netlify form markup and public-config privacy checks.");
}
