#!/bin/bash
set -e

echo "🚀 Deploy started at $(date)"

# ===== LOAD NVM =====
export NVM_DIR="$HOME/.nvm"
source "$NVM_DIR/nvm.sh"

nvm use 20

# ===== GO TO PROJECT =====
cd /root/skyverses/skyverses-backend

echo "📥 Pull source"
git pull origin main

echo "📦 Install dependencies"
npm install

echo "🏗 Build project"
npm run build || true

echo "♻ Restart PM2"
pm2 restart sky-be

pm2 save

echo "✅ Deploy finished"