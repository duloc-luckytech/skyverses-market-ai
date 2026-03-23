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
# LOG
# =====================================================
# =====================================================
# LOG (TERMINAL + FILE)
# =====================================================
LOG="/root/skyverses/skyverses-backend/deploy.log"
exec > >(tee -a "$LOG") 2>&1

echo "=============================================="
echo "🚀 DEPLOY STARTED $(date)"
echo "User: $(whoami)"
echo "Node path: $(which node)"
echo "Node version: $(node -v)"
echo "Yarn path: $(which yarn)"
echo "Yarn version: $(yarn -v)"

# =====================================================
# PROJECT CONFIG
# =====================================================
APP_DIR="/root/skyverses/skyverses-market-ai"
BRANCH="main"
PM2_APP_NAME="sky-fe"

cd "$APP_DIR"
echo "PWD: $(pwd)"

# =====================================================
# GIT
# =====================================================
echo "📥 Fetch & pull latest code"
git fetch origin
git checkout "$BRANCH"
git pull origin "$BRANCH"

# =====================================================
# INSTALL DEPENDENCIES
# ⚠️ QUAN TRỌNG:
# - Install = development (có devDependencies → tsc)
# - CI=false để giống manual build
# =====================================================
echo "📦 Install deps (LOCKED, WITH DEV)"
export NODE_ENV=development
export CI=false

if [ ! -f yarn.lock ]; then
  echo "❌ yarn.lock NOT FOUND – deploy aborted"
  exit 1
fi

yarn install --frozen-lockfile

# =====================================================
# BUILD
# - Build = production
# - Nhưng deps đã đầy đủ
# =====================================================
echo "🏗️ Build (production)"
export NODE_ENV=production
yarn build --mode production

# =====================================================
# RESTART SERVICE
# =====================================================
echo "♻️ Restart PM2 process"
pm2 restart "$PM2_APP_NAME"

echo "✅ DEPLOY DONE $(date)"