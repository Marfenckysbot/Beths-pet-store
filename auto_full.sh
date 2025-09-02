#!/bin/bash
set -e
echo "[1] Pulling and preparing..."
git pull origin main || true

# (existing SEO, images, sitemap steps are kept in your committed script)
# We'll keep the commit/push behavior but remove the local netlify deploy step.
git add .
git commit -m "Auto: prepare updates (no local deploy)" || echo "No changes"
git push origin main

echo "[Done] Pushed to GitHub. Netlify will build & deploy from GitHub (remote build)."
