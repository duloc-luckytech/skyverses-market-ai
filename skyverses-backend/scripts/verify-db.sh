#!/bin/bash
# ============================================================
# 🔍 Verify MongoDB Migration — Post-migration check
# ============================================================
# Usage: bash scripts/verify-db.sh
# ============================================================

set -e

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

# Config — must match migrate-db.sh
LOCAL_HOST="127.0.0.1"
LOCAL_PORT="27017"
LOCAL_DB="skyverses-dev"
LOCAL_USER="sky_admin"
LOCAL_PASS="SkyVerses@2026!Secure"
LOCAL_AUTH_DB="admin"

SOURCE_URI="mongodb://sky_user2:duloc123@209.74.65.102:27017/skyverses-dev"

echo ""
echo "════════════════════════════════════════════════════"
echo "  🔍 MongoDB Migration Verification"
echo "════════════════════════════════════════════════════"
echo ""

# ═══ 1. Check MongoDB service ═══
echo -e "${YELLOW}[1/5] MongoDB service${NC}"
if sudo systemctl is-active --quiet mongod; then
  echo -e "  ${GREEN}✅ mongod is running${NC}"
else
  echo -e "  ${RED}❌ mongod is NOT running${NC}"
  echo "  Run: sudo systemctl start mongod"
  exit 1
fi

# ═══ 2. Check auth login ═══
echo -e "${YELLOW}[2/5] Auth connection${NC}"
if mongosh --host $LOCAL_HOST --port $LOCAL_PORT -u "$LOCAL_USER" -p "$LOCAL_PASS" --authenticationDatabase "$LOCAL_AUTH_DB" --quiet --eval "db.runCommand({ping:1})" &>/dev/null; then
  echo -e "  ${GREEN}✅ Auth login OK${NC}"
else
  echo -e "  ${RED}❌ Auth login FAILED${NC}"
  exit 1
fi

# ═══ 3. Count local collections & docs ═══
echo -e "${YELLOW}[3/5] Local data count${NC}"
LOCAL_STATS=$(mongosh --host $LOCAL_HOST --port $LOCAL_PORT -u "$LOCAL_USER" -p "$LOCAL_PASS" --authenticationDatabase "$LOCAL_AUTH_DB" --quiet <<EOF
use ${LOCAL_DB};
const colls = db.getCollectionNames();
let total = 0;
colls.forEach(c => { total += db[c].countDocuments(); });
print(colls.length + "|" + total);
EOF
)
LOCAL_COLLS=$(echo "$LOCAL_STATS" | tail -1 | cut -d'|' -f1)
LOCAL_DOCS=$(echo "$LOCAL_STATS" | tail -1 | cut -d'|' -f2)
echo -e "  ${GREEN}✅ Local: ${LOCAL_COLLS} collections, ${LOCAL_DOCS} documents${NC}"

# ═══ 4. Count remote collections & docs ═══
echo -e "${YELLOW}[4/5] Remote data count (for comparison)${NC}"
REMOTE_STATS=$(mongosh "$SOURCE_URI" --quiet <<EOF
const colls = db.getCollectionNames();
let total = 0;
colls.forEach(c => { total += db[c].countDocuments(); });
print(colls.length + "|" + total);
EOF
) 2>/dev/null

if [ $? -eq 0 ]; then
  REMOTE_COLLS=$(echo "$REMOTE_STATS" | tail -1 | cut -d'|' -f1)
  REMOTE_DOCS=$(echo "$REMOTE_STATS" | tail -1 | cut -d'|' -f2)
  echo -e "  ${GREEN}✅ Remote: ${REMOTE_COLLS} collections, ${REMOTE_DOCS} documents${NC}"
  
  # Compare
  if [ "$LOCAL_COLLS" == "$REMOTE_COLLS" ]; then
    echo -e "  ${GREEN}✅ Collections match!${NC}"
  else
    echo -e "  ${YELLOW}⚠️ Collections mismatch: local=${LOCAL_COLLS} remote=${REMOTE_COLLS}${NC}"
  fi
else
  echo -e "  ${YELLOW}⚠️ Cannot connect to remote (may be firewalled)${NC}"
fi

# ═══ 5. Show collection details ═══
echo -e "${YELLOW}[5/5] Collection details${NC}"
mongosh --host $LOCAL_HOST --port $LOCAL_PORT -u "$LOCAL_USER" -p "$LOCAL_PASS" --authenticationDatabase "$LOCAL_AUTH_DB" --quiet <<EOF
use ${LOCAL_DB};
const colls = db.getCollectionNames().sort();
colls.forEach(c => {
  const count = db[c].countDocuments();
  const pad = ' '.repeat(Math.max(0, 35 - c.length));
  print("  📄 " + c + pad + count + " docs");
});
EOF

echo ""
echo "════════════════════════════════════════════════════"
echo -e "  ${GREEN}✅ Verification complete${NC}"
echo "════════════════════════════════════════════════════"
echo ""
