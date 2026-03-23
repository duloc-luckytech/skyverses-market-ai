#!/bin/bash
# ═══════════════════════════════════════════════════════
#  SKYVERSES AI — Deploy Script
#  Build all services & start PM2 processes
#  Ports: FE=5300 | CMS=5301 | API=5302
# ═══════════════════════════════════════════════════════

set -e  # Exit on error

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

echo -e "${CYAN}${BOLD}"
echo "╔═══════════════════════════════════════════════╗"
echo "║        SKYVERSES AI — DEPLOY SCRIPT           ║"
echo "║  FE:5300  |  CMS:5301  |  API:5302            ║"
echo "╚═══════════════════════════════════════════════╝"
echo -e "${NC}"

# ── Create logs directory ──
mkdir -p logs

# ── Step 1: Install dependencies ──
echo -e "\n${BLUE}[1/6]${NC} ${BOLD}Installing dependencies...${NC}"

echo -e "  ${YELLOW}→${NC} Frontend..."
npm install --production=false 2>&1 | tail -1

echo -e "  ${YELLOW}→${NC} CMS..."
cd cms && npm install --production=false 2>&1 | tail -1
cd "$ROOT_DIR"

echo -e "  ${YELLOW}→${NC} Backend..."
cd skyverses-backend && npm install --production=false 2>&1 | tail -1
cd "$ROOT_DIR"

echo -e "  ${GREEN}✓${NC} Dependencies installed"

# ── Step 2: Build Frontend ──
echo -e "\n${BLUE}[2/6]${NC} ${BOLD}Building Frontend (Vite)...${NC}"
npm run build
echo -e "  ${GREEN}✓${NC} Frontend built → dist/"

# ── Step 3: Build CMS ──
echo -e "\n${BLUE}[3/6]${NC} ${BOLD}Building CMS (Vite)...${NC}"
cd cms && npm run build
cd "$ROOT_DIR"
echo -e "  ${GREEN}✓${NC} CMS built → cms/dist/"

# ── Step 4: Build Backend ──
echo -e "\n${BLUE}[4/6]${NC} ${BOLD}Building Backend (TypeScript)...${NC}"
cd skyverses-backend && npm run build
cd "$ROOT_DIR"
echo -e "  ${GREEN}✓${NC} Backend built → skyverses-backend/dist/"

# ── Step 5: Stop existing PM2 processes ──
echo -e "\n${BLUE}[5/6]${NC} ${BOLD}Stopping existing PM2 processes...${NC}"
pm2 delete skyverses-fe skyverses-cms skyverses-api 2>/dev/null || true
echo -e "  ${GREEN}✓${NC} Previous processes stopped"

# ── Step 6: Start PM2 ──
echo -e "\n${BLUE}[6/6]${NC} ${BOLD}Starting PM2 processes...${NC}"
pm2 start ecosystem.config.cjs
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
