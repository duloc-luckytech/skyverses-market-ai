#!/bin/bash
# ═══════════════════════════════════════════════════════
#  SKYVERSES AI — Deploy Script
#  Build all services & start PM2 processes
#  Ports: FE=5300 | CMS=5301 | API=5302 | BLOG=5303
# ═══════════════════════════════════════════════════════

# ── Load NVM + Node 20 (required for non-interactive shell via webhook) ──
export HOME=/root
export NVM_DIR="$HOME/.nvm"
[ -s "$NVM_DIR/nvm.sh" ] && . "$NVM_DIR/nvm.sh"
nvm use 20 2>/dev/null || true

# Root directory
ROOT_DIR="$(cd "$(dirname "$0")" && pwd)"
cd "$ROOT_DIR"

echo ""
echo "╔═══════════════════════════════════════════════╗"
echo "║        SKYVERSES AI — DEPLOY SCRIPT           ║"
echo "║  FE:5300 | CMS:5301 | API:5302 | BLOG:5303   ║"
echo "╚═══════════════════════════════════════════════╝"
echo ""

# ── Step 0: Git pull ──
echo "[0/7] Pulling latest code..."
git fetch origin main
git reset --hard origin/main
echo "  ✓ Code synced"

# ── Step 1: Install dependencies ──
echo ""
echo "[1/8] Installing dependencies..."

echo "  → Frontend..."
npm install --no-audit --no-fund 2>&1 || true

echo "  → CMS..."
cd cms && npm install --no-audit --no-fund 2>&1 || true
cd "$ROOT_DIR"

echo "  → Blog..."
cd blog && npm install --no-audit --no-fund 2>&1 || true
cd "$ROOT_DIR"

echo "  → Backend..."
cd skyverses-backend && npm install --no-audit --no-fund 2>&1 || true
cd "$ROOT_DIR"

echo "  ✓ Dependencies installed"

# ── Step 2: Build Backend FIRST (so dist/index.js exists) ──
echo ""
echo "[2/8] Building Backend (TypeScript → dist/)..."
cd skyverses-backend
rm -rf dist
if ! ./node_modules/.bin/tsc; then
  echo "  ✗ ERROR: Backend TypeScript build failed!"
  exit 1
fi
cd "$ROOT_DIR"

# Verify backend build
if [ ! -f "skyverses-backend/dist/index.js" ]; then
  echo "  ✗ ERROR: skyverses-backend/dist/index.js not found!"
  exit 1
fi
echo "  ✓ Backend built"

# ── Step 3: Build Frontend ──
echo ""
echo "[3/8] Building Frontend (Vite)..."
if ! npm run build; then
  echo "  ✗ ERROR: Frontend build failed!"
  exit 1
fi
echo "  ✓ Frontend built"

# ── Step 4: Build CMS ──
echo ""
echo "[4/8] Building CMS (Vite)..."
cd cms
if ! npm run build; then
  echo "  ✗ ERROR: CMS build failed!"
  cd "$ROOT_DIR"
  exit 1
fi
cd "$ROOT_DIR"
echo "  ✓ CMS built"

# ── Step 4.5: Build Blog ──
echo ""
echo "[5/8] Building Blog (Vite)..."
cd blog
if ! npm run build; then
  echo "  ✗ ERROR: Blog build failed!"
  cd "$ROOT_DIR"
  exit 1
fi
cd "$ROOT_DIR"
echo "  ✓ Blog built"

# ── Step 6: Stop existing PM2 processes ──
echo ""
echo "[6/8] Stopping existing PM2 processes..."
pm2 delete skyverses-fe skyverses-cms skyverses-api skyverses-blog 2>/dev/null || true
echo "  ✓ Previous processes cleaned"

# ── Step 6: Start PM2 ──
echo ""
echo "[7/8] Starting PM2 processes..."
pm2 start ecosystem.config.cjs
echo "  ✓ PM2 started"

# ── Step 8: Save & verify ──
echo ""
echo "[8/8] Saving PM2 config..."
pm2 save

echo ""
echo "╔═══════════════════════════════════════════════╗"
echo "║          ✅ DEPLOY COMPLETE!                  ║"
echo "╠═══════════════════════════════════════════════╣"
echo "║  Frontend  → http://localhost:5300            ║"
echo "║  CMS       → http://localhost:5301            ║"
echo "║  API       → http://localhost:5302            ║"
echo "║  Blog      → http://localhost:5303            ║"
echo "╚═══════════════════════════════════════════════╝"
echo ""

pm2 status
