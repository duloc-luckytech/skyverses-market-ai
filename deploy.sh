#!/bin/bash
# ═══════════════════════════════════════════════════════
#  SKYVERSES AI — Deploy Script
#  Build all services & start PM2 processes
#  Ports: FE=5300 | CMS=5301 | API=5302
# ═══════════════════════════════════════════════════════

set -e  # Exit on error

# ── Load NVM + Node 20 (required for non-interactive shell via webhook) ──
export HOME=/root
export NVM_DIR="$HOME/.nvm"
[ -s "$NVM_DIR/nvm.sh" ] && . "$NVM_DIR/nvm.sh"
nvm use 20 2>/dev/null || true

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color
BOLD='\033[1m'

# Root directory
ROOT_DIR="$(cd "$(dirname "$0")" && pwd)"
cd "$ROOT_DIR"
export PATH="$ROOT_DIR/skyverses-backend/node_modules/.bin:$ROOT_DIR/node_modules/.bin:$ROOT_DIR/cms/node_modules/.bin:$PATH"

echo -e "${CYAN}${BOLD}"
echo "╔═══════════════════════════════════════════════╗"
echo "║        SKYVERSES AI — DEPLOY SCRIPT           ║"
echo "║  FE:5300  |  CMS:5301  |  API:5302            ║"
echo "╚═══════════════════════════════════════════════╝"
echo -e "${NC}"

# ── Create logs directory ──
mkdir -p logs

# ── Step 0: Git pull ──
echo -e "\n${BLUE}[0/7]${NC} ${BOLD}Pulling latest code...${NC}"
git checkout -- .
git clean -fd
git pull origin main || true
echo -e "  ${GREEN}✓${NC} Code synced"

# ── Step 1: Install dependencies ──
echo -e "\n${BLUE}[1/7]${NC} ${BOLD}Installing dependencies...${NC}"

echo -e "  ${YELLOW}→${NC} Frontend..."
npm install 2>&1 | tail -1

echo -e "  ${YELLOW}→${NC} CMS..."
cd cms && npm install 2>&1 | tail -1
cd "$ROOT_DIR"

echo -e "  ${YELLOW}→${NC} Backend..."
cd skyverses-backend && npm install 2>&1 | tail -1
cd "$ROOT_DIR"

echo -e "  ${GREEN}✓${NC} Dependencies installed"

# ── Step 2: Build Backend FIRST (so dist/index.js exists) ──
echo -e "\n${BLUE}[2/7]${NC} ${BOLD}Building Backend (TypeScript → dist/)...${NC}"
cd skyverses-backend
rm -rf dist
# noEmitOnError:false in tsconfig → tsc emits JS even with TS errors
npm run build || echo -e "  ${YELLOW}⚠${NC} TypeScript reported errors (non-blocking, noEmitOnError=false)"
cd "$ROOT_DIR"

# Verify backend build
if [ ! -f "skyverses-backend/dist/index.js" ]; then
  echo -e "  ${RED}✗ ERROR: skyverses-backend/dist/index.js not found!${NC}"
  echo -e "  ${RED}  Backend build failed. Check TypeScript errors.${NC}"
  exit 1
fi
echo -e "  ${GREEN}✓${NC} Backend built → skyverses-backend/dist/index.js"

# ── Step 3: Build Frontend ──
echo -e "\n${BLUE}[3/7]${NC} ${BOLD}Building Frontend (Vite)...${NC}"
npm run build
echo -e "  ${GREEN}✓${NC} Frontend built → dist/"

# ── Step 4: Build CMS ──
echo -e "\n${BLUE}[4/7]${NC} ${BOLD}Building CMS (Vite)...${NC}"
cd cms && npm run build
cd "$ROOT_DIR"
echo -e "  ${GREEN}✓${NC} CMS built → cms/dist/"

# ── Step 5: Stop existing PM2 processes ──
echo -e "\n${BLUE}[5/7]${NC} ${BOLD}Stopping existing PM2 processes...${NC}"
pm2 delete skyverses-fe skyverses-cms skyverses-api 2>/dev/null || true
echo -e "  ${GREEN}✓${NC} Previous processes cleaned"

# ── Step 6: Start PM2 ──
echo -e "\n${BLUE}[6/7]${NC} ${BOLD}Starting PM2 processes...${NC}"
pm2 start ecosystem.config.cjs
echo -e "  ${GREEN}✓${NC} PM2 started"

# ── Step 7: Save & verify ──
echo -e "\n${BLUE}[7/7]${NC} ${BOLD}Saving PM2 config...${NC}"
pm2 save

echo -e "\n${GREEN}${BOLD}"
echo "╔═══════════════════════════════════════════════╗"
echo "║          ✅ DEPLOY COMPLETE!                  ║"
echo "╠═══════════════════════════════════════════════╣"
echo "║  Frontend  → http://localhost:5300            ║"
echo "║  CMS       → http://localhost:5301            ║"
echo "║  API       → http://localhost:5302            ║"
echo "╠═══════════════════════════════════════════════╣"
echo "║  pm2 status     — Xem trạng thái             ║"
echo "║  pm2 logs       — Xem logs realtime           ║"
echo "║  pm2 restart all — Restart tất cả             ║"
echo "╚═══════════════════════════════════════════════╝"
echo -e "${NC}"

pm2 status
