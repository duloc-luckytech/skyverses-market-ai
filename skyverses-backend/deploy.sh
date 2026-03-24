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
LOG="/root/skyverses-market-ai/deploy-fe.log"
exec > >(tee -a "$LOG") 2>&1

echo "=============================================="
echo "🚀 FE DEPLOY STARTED $(date)"
echo "Node: $(node -v) | Yarn: $(yarn -v)"

# =====================================================
# PROJECT CONFIG
# =====================================================
APP_DIR="/root/skyverses-market-ai"
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
# =====================================================
echo "📦 Install deps (LOCKED, WITH DEV)"
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
echo "🏗️ Build (production)"
export NODE_ENV=production
yarn build --mode production || npm run build

# =====================================================
# RESTART SERVICE
# =====================================================
echo "♻️ Restart PM2 process"
pm2 restart "$PM2_APP_NAME" || echo "⚠️ PM2 process $PM2_APP_NAME not found"

echo "✅ FE DEPLOY DONE $(date)"