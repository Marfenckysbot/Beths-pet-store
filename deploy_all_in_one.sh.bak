# 1) (optional) back up the old script first
cp deploy_all_in_one.sh deploy_all_in_one.sh.bak

# 2) Overwrite with the fixed script
cat > deploy_all_in_one.sh <<'EOF'
#!/usr/bin/env bash
set -euo pipefail
IFS=$'\n\t'

# Simple, robust deploy helper for Beth's Pet Store
# - normalizes Index.html -> index.html
# - commits changes, pushes to origin/main
# - generates SSH key if none exists
# - creates basic netlify helpers (_redirects, netlify.toml, robots.txt, sitemap)
# - deploys with netlify CLI if available
# - tests Formspree endpoint (if configured)
#
# Edit the CONFIG section below if you want to tweak behaviour.

# --- CONFIG ---
REPO_USER="${REPO_USER:-Marfenckysbot}"
REPO_NAME="${R0
err(){ printf '\n\033[1;31m[ERROR]\033[0m %s\n' "$*"; exit 1; }
info(){ printf '\n\033[1;34m[INFO]\033[0m %s\n' "$*"; }
warn(){ printf '\n\033[1;33m[WARN]\033[0m %s\n' "$*"; }
err(){ printf '\n\033[1;31m[ERROR]\033[0m %s\n' "$*'"; exit 1; }
cmd_exists(){ command -v "$1" >/dev/null 2>&1; }

info "Working dir: $(pwd)"

# 1) Normalize index filename(s)
if [ -f "Index.html" ] && [ ! -f "index.html" ]; then
  info "Renaming Index.html -> index.html"
  mv "Index.html" "index.html"
fi

# 2) Set git user if not already set
if cmd_exists git; then
  git config user.name >/dev/null 2>&1 || git config --global user.name "$GIT_USER_NAME" || true
  git config user.email >/dev/null 2>&1 || git config --global user.email "$GIT_USER_EMAIL" || true
else
  warn "git not found in PATH. Install git in Termux if you want automatic commits."
fi

# 3) Stage common files
git add -A || true

# 4) Show status and commit if there are staged changes
if ! git diff --cached --quiet 2>/dev/null; then
  info "Committing staged changes"
  git commit -m "Automated commit: update site from deploy_all_in_one.sh" || true
else
  info "No staged changes to commit"
fi

# 5) Push to remote (assumes origin/main is set)
if cmd_exists git; then
  info "Pushing to origin main (non-interactive if auth is already set up)"
  # try a simple push; if it fails, warn
  if ! git push origin main; then
    warn "git push failed. Check credentials or add an SSH key (this script can help generate one)."
  fi
fi

# 6) Ensure SSH key exists (helpful for future SSH pushes)
if [ ! -f "${HOME}/.ssh/id_ed25519.pub" ]; then
  info "No SSH key found. Generating an ed25519 key (no passphrase)."
  ssh-keygen -t ed25519 -C "$GIT_USER_EMAIL" -f "${HOME}/.ssh/id_ed25519" -N "" || true
  eval "$(ssh-agent -s)" >/dev/null 2>&1 || true
  ssh-add "${HOME}/.ssh/id_ed25519" >/dev/null 2>&1 || true
  info "Public key (copy this to GitHub → Settings → SSH and GPG keys):"
  cat "${HOME}/.ssh/id_ed25519.pub" || true
fi

# 7) Create Netlify helper files if missing
if [ ! -f "_redirects" ]; then
  info "Creating _redirects (SPA fallback)"
  cat > _redirects <<EOF
/*    /index.html   200
EOF
  git add _redirects || true
fi

if [ ! -f "netlify.toml" ]; then
  info "Creating netlify.toml"
  cat > netlify.toml <<EOF
[build]
  publish = "."
  command = ""

[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200
EOF
  git add netlify.toml || true
fi

if [ ! -f "robots.txt" ]; then
  info "Creating robots.txt"
  cat > robots.txt <<EOF
User-agent: *
Allow: /

Sitemap: ${PUBLISH_URL}/sitemap.xml
EOF
  git add robots.txt || true
fi

# 8) Generate a basic sitemap.xml
info "Generating sitemap.xml"
cat > sitemap.xml <<EOF
<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
EOF

for p in *.html; do
  # skip hidden / temporary files
  [[ -f "$p" ]] || continue
  name="$(echo "$p" | tr 'A-Z' 'a-z')"
  printf '  <url><loc>%s/%s</loc></url>\n' "$PUBLISH_URL" "${name}" >> sitemap.xml
done

cat >> sitemap.xml <<EOF
</urlset>
EOF

git add sitemap.xml || true

# Commit new helper files if changed
if ! git diff --cached --quiet 2>/dev/null; then
  info "Committing helper files (redirects, netlify.toml, robots, sitemap)"
  git commit -m "Add netlify helpers: redirects, netlify.toml, robots, sitemap" || true
  git push origin main || true
fi

# 9) Try Netlify deploy if CLI present
if cmd_exists netlify; then
  info "Netlify CLI found. Attempting production deploy (uses current directory)."
  if [ -n "$NETLIFY_SITE_ID" ]; then
    netlify deploy --site="$NETLIFY_SITE_ID" --prod --dir="." || warn "Netlify deploy failed"
  else
    netlify deploy --prod --dir="." || warn "Netlify deploy failed"
  fi
else
  warn "Netlify CLI not installed. Install with: npm i -g netlify-cli"
fi

# 10) Test Formspree endpoint (if configured)
if [ -n "$FORMSPREE_ENDPOINT" ] && cmd_exists curl; then
  info "Testing Formspree endpoint"
  # simple test submission (no real email)
  http_code="$(curl -s -o /dev/null -w '%{http_code}' -X POST "$FORMSPREE_ENDPOINT" -H "Accept: application/json" -F "name=Auto Test" -F "email=test@example.com" -F "message=Test")" || true
  info "Formspree responded with HTTP status: $http_code"
fi

info "Done. Site should be at: ${PUBLISH_URL}"
EOF

# 3) Make executable
chmod +x deploy_all_in_one.sh

# 4) Syntax-check the script
bash -n deploy_all_in_one.sh && echo "Syntax OK" || echo "Syntax error reported"

# 5) Copy to home and run from there (to avoid noexec on /storage)
cp deploy_all_in_one.sh "$HOME/deploy_all_in_one.sh"
chmod +x "$HOME/deploy_all_in_one.sh"
echo
echo "Now run: bash ~/deploy_all_in_one.sh"
