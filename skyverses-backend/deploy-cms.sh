#!/bin/bash
set -e

# =====================================================
# FORCE NODE 20 (ABSOLUTE PATH – NO NVM MAGIC)
# =====================================================
export HOME=/root

NODE_20_BIN_GLOB="/root/.nvm/versions/node/v20.*/bin"
NODE_BIN=$(ls -d $NODE_20_BIN_GLOB 2>/dev/null | head -n 1)

if [ ! -d "$NODE_BIN" ]; then
  echo "❌ Node 20 not found in NVM"
  exit 1
fi

export PATH="$NODE_BIN:/usr/local/bin:/usr/bin:/bin"

# =====================================================
# LOG (TERMINAL + FILE)
# =====================================================
LOG="/root/skyverses-market-ai/deploy-cms.log"
exec > >(tee -a "$LOG") 2>&1

echo "=============================================="
echo "🚀 CMS DEPLOY STARTED $(date)"
echo "Node: $(node -v) | Yarn: $(yarn -v)"

# =====================================================
# PROJECT CONFIG
# CMS is inside the same monorepo at /cms
# =====================================================
APP_DIR="/root/skyverses-market-ai"
CMS_DIR="/root/skyverses-market-ai/cms"
BRANCH="main"
PM2_APP_NAME="sky-cms"

cd "$APP_DIR"
echo "PWD: $(pwd)"

# =====================================================
# GIT (pull from root of monorepo)
# =====================================================
echo "📥 Fetch & pull latest code"
git fetch origin
git checkout "$BRANCH"
git pull origin "$BRANCH"

# =====================================================
# INSTALL DEPENDENCIES (CMS)
# =====================================================
cd "$CMS_DIR"
echo "📦 Install CMS deps"
export NODE_ENV=development
export CI=false

if [ -f yarn.lock ]; then
  yarn install --frozen-lockfile
elif [ -f package-lock.json ]; then
  npm ci
else
  npm install
fi

# =====================================================
# BUILD
# =====================================================
echo "🏗️ Build CMS (production)"
export NODE_ENV=production
yarn build --mode production || npm run build

# =====================================================
# RESTART SERVICE
# =====================================================
echo "♻️ Restart PM2 process"
pm2 restart "$PM2_APP_NAME" || echo "⚠️ PM2 process $PM2_APP_NAME not found"

echo "✅ CMS DEPLOY DONE $(date)"