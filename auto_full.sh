#!/bin/bash
set -e

echo "[1/5] Pulling latest changes..."
git pull origin main || echo "No updates from remote."

echo "[2/5] Generating sitemap.xml..."
cat <<'XML' > sitemap.xml
<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>https://beths-pet-store.netlify.app/\</loc\>
    <priority>1.0</priority>
  </url>
</urlset>
XML

echo "[3/5] Optimizing images..."
find ./images -type f \( -iname "*.jpg" -o -iname "*.png" \) | while read img; do
  cwebp -q 80 "$img" -o "${img%.*}.webp" || echo "Skipped: $img"
done

echo "[4/5] Configuring Netlify forms & analytics..."
cat <<'TOML' > netlify.toml
[build]
  publish = "."

[[plugins]]
  package = "@netlify/plugin-lighthouse"

[[plugins]]
  package = "@netlify/plugin-sitemap"

[[redirects]]
  from = "/contact"
  to = "/contact.html"
  status = 200

[functions]
  node_bundler = "esbuild"
TOML

git add .
git commit -m "Auto: SEO, images, forms & analytics" || echo "No changes to commit"
git push origin main

echo "[5/5] Deploying to Netlify..."
netlify deploy --prod --dir="."

echo "🚀 Fully automated deployment complete!"
