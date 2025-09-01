#!/usr/bin/env bash
set -euo pipefail
IFS=$'\n\t'

# -------------------------
# deploy_all.sh
# Automates common setup, commit, push, and Netlify deploy tasks
# For Termux / Android environment used in this project.
#
# Usage:
#   1) Put this file in your project root (e.g. "/storage/emulated/0/Download/Beths pet store")
#   2) Edit variables below if needed (REPO_USER, REPO_NAME)
#   3) Make it executable: chmod +x deploy_all.sh
#   4) Run: ./deploy_all.sh
#
# Behavior:
# - Sets git user.name/email (non-destructive)
# - Removes duplicate Index.html (keeps lowercase index.html)
# - Adds & commits changes
# - Adds images folder if present
# - Pushes to GitHub using:
#     - HTTPS with GITHUB_TOKEN env var (if provided), or
#     - SSH (generates key if not present and prints public key to paste in GitHub)
# - Deploys to Netlify using netlify CLI if available
# - Checks for broken local image references in HTML
# -------------------------

# === CONFIG ===
REPO_USER="Marfenckysbot"
REPO_NAME="beths-pet-store"
GIT_USER_NAME="${GIT_USER_NAME:-Beth's Pet Store}"
GIT_USER_EMAIL="${GIT_USER_EMAIL:-marfenckys@yahoo.com}"
PUBLISH_DIR="."   # root of project
NETLIFY_SITE_ID="${NETLIFY_SITE_ID:-}"   # optional: set if known
# =================

echo
echo "=== Beth's Pet Store: automated deploy helper ==="
echo

# helper: command exists?
cmd_exists() { command -v "$1" >/dev/null 2>&1; }

# warn about possible leaked token
if [ -n "${GITHUB_TOKEN:-}" ]; then
  echo "⚠️  GITHUB_TOKEN is set in your environment. Make sure you generated it recently and it has the proper repo permissions."
  echo "If that token was previously leaked anywhere, revoke it on GitHub immediately: https://github.com/settings/tokens"
  echo
fi

# 1) Ensure we're in a git repo root (or initialize)
PROJECT_DIR="$(pwd)"
echo "Project directory: $PROJECT_DIR"

if [ ! -d ".git" ]; then
  echo "No .git directory found — initializing repository..."
  git init
else
  echo "Git repository detected."
fi

# 2) Configure git user (global)
echo "Setting git user.name and user.email (global)"
git config --global user.name "$GIT_USER_NAME"
git config --global user.email "$GIT_USER_EMAIL"

# 3) Normalize index filenames: keep lowercase index.html only
if [ -f "Index.html" ] && [ -f "index.html" ]; then
  echo "Removing duplicate 'Index.html' to avoid case-sensitivity issues..."
  # keep index.html (lowercase), remove uppercase from repo and disk
  git rm --cached "Index.html" 2>/dev/null || true
  rm -f "Index.html"
  echo "Index.html removed."
elif [ -f "Index.html" ] && [ ! -f "index.html" ]; then
  echo "Only 'Index.html' found. Renaming to 'index.html'..."
  git mv "Index.html" "index.html"
fi

# 4) Ensure images folder tracked if present
if [ -d "images" ]; then
  echo "Checking images folder..."
  # add images if any new
  git add --all images || true
fi

# 5) Add other common site assets if present
git add -A || true

# 6) Commit changes if needed
if git status --porcelain | grep -q .; then
  echo "Committing changes..."
  git commit -m "Automated commit: update site content and images"
else
  echo "No changes to commit."
fi

# 7) Ensure branch named main
current_branch="$(git rev-parse --abbrev-ref HEAD)"
if [ "$current_branch" != "main" ]; then
  echo "Renaming branch '$current_branch' to 'main' (if possible)..."
  git branch -M main || true
fi

# 8) Prepare remote URL and push strategy
# If GITHUB_TOKEN env var is set, use HTTPS with token (never echo token)
if [ -n "${GITHUB_TOKEN:-}" ]; then
  echo "Pushing to GitHub using HTTPS + provided GITHUB_TOKEN (stored only in env)..."
  remote_url="https://${REPO_USER}:${GITHUB_TOKEN}@github.com/${REPO_USER}/${REPO_NAME}.git"
  git remote remove origin 2>/dev/null || true
  git remote add origin "$remote_url"
  # push (force-resolve divergences by pulling first then pushing)
  set +e
  git pull origin main --allow-unrelated-histories
  set -e
  git push -u origin main
else
  # Prefer SSH: generate key if missing then instruct user to add to GitHub
  if ! cmd_exists ssh-agent || ! cmd_exists ssh-add; then
    echo "Note: ssh-agent/ssh-add not found. Installing OpenSSH might be required via pkg in Termux."
  fi

  SSH_KEY="$HOME/.ssh/id_ed25519"
  if [ ! -f "$SSH_KEY" ]; then
    echo "No SSH key found. Generating an ed25519 SSH key (no passphrase)..."
    ssh-keygen -t ed25519 -C "$GIT_USER_EMAIL" -f "$SSH_KEY" -N "" || true
    printf "\n--- PUBLIC KEY (copy this and add to GitHub: Settings → SSH and GPG keys → New SSH key) ---\n\n"
    cat "${SSH_KEY}.pub"
    printf "\n--- End public key ---\n\n"
    echo "After adding the key to GitHub, re-run this script to push via SSH. Or press enter to continue now and attempt push (may fail until key is added)."
    read -r -p "Press Enter to continue..."
  else
    echo "Existing SSH key found at $SSH_KEY"
  fi

  # attempt to start ssh-agent and add key
  if cmd_exists ssh-agent; then
    eval "$(ssh-agent -s)" >/dev/null 2>&1 || true
    ssh-add "$SSH_KEY" >/dev/null 2>&1 || true
  fi

  # set remote to SSH format
  ssh_remote="git@github.com:${REPO_USER}/${REPO_NAME}.git"
  git remote remove origin 2>/dev/null || true
  git remote add origin "$ssh_remote"
  # attempt git pull (may prompt)
  set +e
  git pull origin main --allow-unrelated-histories
  set -e
  # push
  echo "Attempting to push via SSH (this will succeed after you add the SSH public key in GitHub if not already added)..."
  git push -u origin main || {
    echo "Push via SSH failed — likely the SSH key is not yet added to GitHub or SSH agent not loaded. Please add the public key above into your GitHub account and re-run this script."
  }
fi

# 9) Netlify deploy (if netlify CLI installed)
if cmd_exists netlify; then
  echo
  echo "Netlify CLI found. Attempting a production deploy..."
  # if NETLIFY_AUTH_TOKEN env present, use it; else assume you are logged in via netlify login earlier
  if [ -n "${NETLIFY_SITE_ID:-}" ]; then
    echo "Using NETLIFY_SITE_ID=$NETLIFY_SITE_ID for deploy (if site linked)."
    netlify deploy --prod --dir="$PUBLISH_DIR" --site="$NETLIFY_SITE_ID" --message "Auto-deploy from deploy_all.sh"
  else
    # if site already linked to folder, this will succeed
    netlify deploy --prod --dir="$PUBLISH_DIR" --message "Auto-deploy from deploy_all.sh" || {
      echo "Netlify deploy failed or site not linked. If you haven't linked this folder to a Netlify site yet, run 'netlify init' or 'netlify link' and re-run this script."
    }
  fi
else
  echo "Netlify CLI not installed. To auto-deploy to Netlify, install: npm i -g netlify-cli"
fi

# 10) Quick check: find <img src="..."> references in HTML and report missing local files
echo
echo "Scanning HTML files for <img> references and reporting any local missing files..."
missing_count=0
# find HTML files (top-level and nested)
mapfile -t html_files < <(find . -type f -name "*.html" -print)
for f in "${html_files[@]}"; do
  # parse img src attributes
  while IFS= read -r src; do
    # remove leading ./ if present and ignore external URLs
    if [[ "$src" =~ ^https?:// ]]; then
      continue
    fi
    # normalize path
    norm="$src"
    # if src begins with '/', drop leading slash to treat as relative to repo root
    norm="${norm#/}"
    if [ ! -f "$norm" ]; then
      echo "MISSING: referenced in $f -> $src (file not found at $norm)"
      missing_count=$((missing_count+1))
    fi
  done < <(grep -oPh '<img[^>]+src="\K[^"]+' "$f" || true)
done

if [ "$missing_count" -eq 0 ]; then
  echo "No missing local images detected in HTML files."
else
  echo "Found $missing_count missing local images. Please add files to the repo images/ folder or fix the src paths."
fi

echo
echo "=== Script complete ==="
echo "- Git status: $(git status --short | wc -l) changed files (0 means none)"
echo "- To review: visit your GitHub repo: https://github.com/${REPO_USER}/${REPO_NAME}"
echo "- If you used HTTPS token, remember to revoke any token you exposed earlier and use a fresh token if needed."
echo
