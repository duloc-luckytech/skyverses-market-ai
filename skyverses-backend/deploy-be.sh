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
LOG="/root/skyverses-market-ai/deploy-be.log"
exec > >(tee -a "$LOG") 2>&1

echo "=============================================="
echo "🚀 BACKEND DEPLOY STARTED $(date)"
echo "Node: $(node -v)"

# =====================================================
# PROJECT CONFIG
# =====================================================
APP_DIR="/root/skyverses-market-ai"
BE_DIR="/root/skyverses-market-ai/skyverses-backend"
BRANCH="main"
PM2_APP_NAME="skyverses-api"

cd "$APP_DIR"
echo "PWD: $(pwd)"

# =====================================================
# GIT (pull from root)
# =====================================================
echo "📥 Fetch & pull latest code"
git fetch origin
git checkout "$BRANCH"
git pull origin "$BRANCH"

# =====================================================
# INSTALL DEPENDENCIES (Backend)
# =====================================================
cd "$BE_DIR"
echo "📦 Install backend deps"
npm install

# =====================================================
# BUILD (if needed)
# =====================================================
echo "🏗️ Build backend"
npm run build || true

# =====================================================
# RESTART SERVICE
# =====================================================
echo "♻️ Restart PM2 process"
pm2 restart "$PM2_APP_NAME" || echo "⚠️ PM2 process $PM2_APP_NAME not found"
pm2 save

echo "✅ BACKEND DEPLOY DONE $(date)"