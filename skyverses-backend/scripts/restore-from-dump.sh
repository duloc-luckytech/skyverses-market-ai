#!/bin/bash
# ============================================================
# 📥 Step 2: Restore dump on server
# ============================================================
# Chạy trên SERVER (sau khi dump-and-upload.sh đã upload)
# Usage: bash scripts/restore-from-dump.sh
# ============================================================

set -eo pipefail

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

# ═══ CONFIG ═══
LOCAL_DB="skyverses-dev"
LOCAL_HOST="127.0.0.1"
LOCAL_PORT="27017"
LOCAL_USER="sky_admin"
LOCAL_PASS="SkyVerses@2026!Secure"
LOCAL_AUTH_DB="admin"

DUMP_PATH="/tmp/skyverses_dump/skyverses-dev"

echo ""
echo "════════════════════════════════════════════════════"
echo "  📥 Restore Dump → Local MongoDB"
echo "════════════════════════════════════════════════════"
echo ""

# ═══ CHECK DUMP EXISTS ═══
if [ ! -d "$DUMP_PATH" ]; then
  echo -e "${RED}❌ Dump not found at: $DUMP_PATH${NC}"
  echo ""
  echo "  Available files in /tmp/skyverses_dump/:"
  ls -la /tmp/skyverses_dump/ 2>/dev/null || echo "  (directory not found)"
  echo ""
  echo "  Make sure you ran dump-and-upload.sh from Mac first."
  exit 1
fi

BSON_COUNT=$(find "$DUMP_PATH" -name "*.bson.gz" 2>/dev/null | wc -l)
DUMP_SIZE=$(du -sh "$DUMP_PATH" | cut -f1)
echo -e "${GREEN}✅ Dump found: $DUMP_SIZE, $BSON_COUNT collections${NC}"
echo ""

# ═══ CHECK MONGODB ═══
echo -e "${YELLOW}[1/3] Checking MongoDB...${NC}"

# Try with auth first
AUTH_OK=$(mongosh --host $LOCAL_HOST --port $LOCAL_PORT -u "$LOCAL_USER" -p "$LOCAL_PASS" --authenticationDatabase "$LOCAL_AUTH_DB" --quiet --eval "db.runCommand({ping:1}).ok" 2>/dev/null || echo "0")
NO_AUTH=$(mongosh --host $LOCAL_HOST --port $LOCAL_PORT --quiet --eval "db.runCommand({ping:1}).ok" 2>/dev/null || echo "0")

if echo "$AUTH_OK" | grep -q "1"; then
  echo -e "  ${GREEN}✅ MongoDB running (auth enabled)${NC}"
  RESTORE_AUTH="--username=$LOCAL_USER --password=$LOCAL_PASS --authenticationDatabase=$LOCAL_AUTH_DB"
  MONGOSH_AUTH="-u $LOCAL_USER -p $LOCAL_PASS --authenticationDatabase $LOCAL_AUTH_DB"
elif echo "$NO_AUTH" | grep -q "1"; then
  echo -e "  ${YELLOW}⚠️ MongoDB running (no auth)${NC}"
  RESTORE_AUTH=""
  MONGOSH_AUTH=""
else
  echo -e "  ${RED}❌ MongoDB not running${NC}"
  echo "  Run: sudo systemctl start mongod"
  exit 1
fi

# ═══ RESTORE ═══
echo ""
echo -e "${YELLOW}[2/3] Restoring data...${NC}"

mongorestore \
  --host="$LOCAL_HOST" \
  --port="$LOCAL_PORT" \
  $RESTORE_AUTH \
  --db="$LOCAL_DB" \
  --dir="$DUMP_PATH" \
  --gzip \
  --drop \
  2>&1 | tail -30

RESTORE_EXIT=${PIPESTATUS[0]}
if [ $RESTORE_EXIT -ne 0 ]; then
  echo -e "${RED}❌ Restore failed (exit: $RESTORE_EXIT)${NC}"
  exit 1
fi
echo -e "${GREEN}✅ Restore complete${NC}"

# ═══ VERIFY ═══
echo ""
echo -e "${YELLOW}[3/3] Verifying data...${NC}"
echo ""

mongosh --host $LOCAL_HOST --port $LOCAL_PORT $MONGOSH_AUTH --quiet <<EOF
use("${LOCAL_DB}");
const colls = db.getCollectionNames().sort();
let total = 0;
let withData = 0;
colls.forEach(c => {
  const count = db[c].countDocuments();
  total += count;
  if (count > 0) {
    withData++;
    const pad = ' '.repeat(Math.max(0, 35 - c.length));
    print("  ✅ " + c + pad + count + " docs");
  }
});
print("");
print("  📊 Total: " + colls.length + " collections, " + withData + " with data, " + total + " documents");

// Quick marketplace check
print("");
print("  === Marketplace Check ===");
const mi = db.marketitems.countDocuments();
print("  marketitems: " + mi);
if (mi > 0) {
  const sample = db.marketitems.findOne({}, {slug: 1, "name.en": 1, isActive: 1});
  print("  sample: " + JSON.stringify(sample));
}
EOF

# ═══ CLEANUP ═══
echo ""
read -p "$(echo -e ${YELLOW}'Xóa dump files? (y/N): '${NC})" cleanup
if [[ "$cleanup" == "y" || "$cleanup" == "Y" ]]; then
  rm -rf /tmp/skyverses_dump
  echo -e "${GREEN}✅ Dump cleaned${NC}"
fi

echo ""
echo "════════════════════════════════════════════════════"
echo -e "  ${GREEN}✅ RESTORE COMPLETE${NC}"
echo "════════════════════════════════════════════════════"
echo ""
echo "  📌 Restart app: pm2 restart all"
echo ""
