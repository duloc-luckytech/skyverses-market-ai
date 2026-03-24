#!/bin/bash
# ============================================================
# 🔍 Debug MongoDB Migration — Check từng bước
# ============================================================
# Usage: bash scripts/debug-migration.sh
# ============================================================

set -e

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

# ═══ CONFIG ═══
SOURCE_URI="mongodb://sky_user2:duloc123@209.74.65.102:27017/skyverses-dev"
SOURCE_DB="skyverses-dev"

LOCAL_HOST="127.0.0.1"
LOCAL_PORT="27017"
LOCAL_DB="skyverses-dev"
LOCAL_USER="sky_admin"
LOCAL_PASS="SkyVerses@2026!Secure"
LOCAL_AUTH_DB="admin"

DUMP_DIR="/tmp/debug_mongodump_$(date +%Y%m%d_%H%M%S)"

echo ""
echo "════════════════════════════════════════════════════"
echo "  🔍 Debug MongoDB Migration"
echo "════════════════════════════════════════════════════"
echo ""

# ═══════════════════════════════════════════════════════
# TEST 1: Check tools installed
# ═══════════════════════════════════════════════════════
echo -e "${YELLOW}[TEST 1] Checking tools...${NC}"
for cmd in mongosh mongodump mongorestore; do
  if command -v $cmd &>/dev/null; then
    VERSION=$($cmd --version 2>&1 | head -1)
    echo -e "  ${GREEN}✅ $cmd${NC} → $VERSION"
  else
    echo -e "  ${RED}❌ $cmd NOT FOUND${NC}"
    echo "  Run: sudo apt install mongodb-database-tools mongodb-mongosh"
    exit 1
  fi
done

# ═══════════════════════════════════════════════════════
# TEST 2: Check remote DB reachable
# ═══════════════════════════════════════════════════════
echo ""
echo -e "${YELLOW}[TEST 2] Testing remote DB connection...${NC}"
echo -e "  URI: ${BLUE}mongodb://sky_user2:***@209.74.65.102:27017/skyverses-dev${NC}"

REMOTE_RESULT=$(mongosh "$SOURCE_URI" --quiet --eval '
  const colls = db.getCollectionNames();
  let total = 0;
  colls.forEach(c => { total += db[c].countDocuments(); });
  print("OK|" + colls.length + "|" + total);
  colls.forEach(c => {
    const count = db[c].countDocuments();
    print("  COL|" + c + "|" + count);
  });
' 2>&1)

if echo "$REMOTE_RESULT" | grep -q "^OK|"; then
  REMOTE_INFO=$(echo "$REMOTE_RESULT" | grep "^OK|")
  REMOTE_COLLS=$(echo "$REMOTE_INFO" | cut -d'|' -f2)
  REMOTE_DOCS=$(echo "$REMOTE_INFO" | cut -d'|' -f3)
  echo -e "  ${GREEN}✅ Remote reachable: ${REMOTE_COLLS} collections, ${REMOTE_DOCS} documents${NC}"
  echo ""
  echo "  Remote collections:"
  echo "$REMOTE_RESULT" | grep "^  COL|" | while IFS='|' read _ name count; do
    printf "    📄 %-35s %s docs\n" "$name" "$count"
  done
else
  echo -e "  ${RED}❌ Cannot connect to remote!${NC}"
  echo "  Error: $REMOTE_RESULT"
  echo ""
  echo -e "  ${YELLOW}Possible issues:${NC}"
  echo "    - Firewall blocking port 27017 from this server"
  echo "    - Wrong credentials"
  echo "    - Remote MongoDB not accepting external connections"
  echo ""
  echo "  Quick test: nc -zv 209.74.65.102 27017"
  nc -zv 209.74.65.102 27017 2>&1 || true
  exit 1
fi

# ═══════════════════════════════════════════════════════
# TEST 3: Test mongodump
# ═══════════════════════════════════════════════════════
echo ""
echo -e "${YELLOW}[TEST 3] Testing mongodump...${NC}"
mkdir -p "$DUMP_DIR"

echo "  Running: mongodump --uri=*** --out=$DUMP_DIR --gzip"
DUMP_OUTPUT=$(mongodump \
  --uri="$SOURCE_URI" \
  --out="$DUMP_DIR" \
  --gzip \
  2>&1)

DUMP_EXIT=$?
echo "$DUMP_OUTPUT" | tail -15

if [ $DUMP_EXIT -ne 0 ]; then
  echo -e "  ${RED}❌ mongodump FAILED (exit code: $DUMP_EXIT)${NC}"
  echo ""
  echo "  Full output:"
  echo "$DUMP_OUTPUT"
  exit 1
fi

# Check what was dumped
echo ""
echo "  Dump contents:"
if [ -d "$DUMP_DIR/$SOURCE_DB" ]; then
  BSON_COUNT=$(find "$DUMP_DIR/$SOURCE_DB" -name "*.bson.gz" 2>/dev/null | wc -l)
  DUMP_SIZE=$(du -sh "$DUMP_DIR/$SOURCE_DB" | cut -f1)
  echo -e "  ${GREEN}✅ Dump found: $DUMP_DIR/$SOURCE_DB${NC}"
  echo -e "  ${GREEN}   $BSON_COUNT .bson.gz files, total: $DUMP_SIZE${NC}"
  echo ""
  echo "  Files:"
  find "$DUMP_DIR/$SOURCE_DB" -type f | sort | while read f; do
    FSIZE=$(du -h "$f" | cut -f1)
    echo "    📦 $(basename "$f") ($FSIZE)"
  done
else
  echo -e "  ${RED}❌ No dump directory found at $DUMP_DIR/$SOURCE_DB${NC}"
  echo ""
  echo "  Listing $DUMP_DIR:"
  ls -la "$DUMP_DIR/" 2>/dev/null || echo "  (empty)"
  echo ""
  echo "  Looking for any subdirectories:"
  find "$DUMP_DIR" -type d | head -20
  echo ""
  
  # Maybe DB name is different
  ACTUAL_DIR=$(find "$DUMP_DIR" -maxdepth 1 -type d ! -name "$(basename $DUMP_DIR)" | head -1)
  if [ -n "$ACTUAL_DIR" ]; then
    echo -e "  ${YELLOW}⚠️ Found different DB name: $(basename $ACTUAL_DIR)${NC}"
    echo "  Update SOURCE_DB in migrate-db.sh to: $(basename $ACTUAL_DIR)"
  fi
  exit 1
fi

# ═══════════════════════════════════════════════════════
# TEST 4: Check local MongoDB
# ═══════════════════════════════════════════════════════
echo ""
echo -e "${YELLOW}[TEST 4] Checking local MongoDB...${NC}"

# Check service
if sudo systemctl is-active --quiet mongod 2>/dev/null; then
  echo -e "  ${GREEN}✅ mongod service running${NC}"
else
  echo -e "  ${RED}❌ mongod NOT running${NC}"
  echo "  Run: sudo systemctl start mongod"
  exit 1
fi

# Check auth status
NO_AUTH=$(mongosh --host $LOCAL_HOST --port $LOCAL_PORT --quiet --eval "db.runCommand({ping:1}).ok" 2>&1)
AUTH_OK=$(mongosh --host $LOCAL_HOST --port $LOCAL_PORT -u "$LOCAL_USER" -p "$LOCAL_PASS" --authenticationDatabase "$LOCAL_AUTH_DB" --quiet --eval "db.runCommand({ping:1}).ok" 2>&1)

if echo "$NO_AUTH" | grep -q "1"; then
  echo -e "  ${YELLOW}⚠️ Auth is DISABLED (no-auth login works)${NC}"
  CONNECT_ARGS="--host $LOCAL_HOST --port $LOCAL_PORT"
elif echo "$AUTH_OK" | grep -q "1"; then
  echo -e "  ${GREEN}✅ Auth is ENABLED, login OK${NC}"
  CONNECT_ARGS="--host $LOCAL_HOST --port $LOCAL_PORT -u $LOCAL_USER -p $LOCAL_PASS --authenticationDatabase $LOCAL_AUTH_DB"
else
  echo -e "  ${RED}❌ Cannot connect to local MongoDB at all${NC}"
  echo "  no-auth result: $NO_AUTH"
  echo "  auth result: $AUTH_OK"
  exit 1
fi

# ═══════════════════════════════════════════════════════
# TEST 5: Test mongorestore
# ═══════════════════════════════════════════════════════
echo ""
echo -e "${YELLOW}[TEST 5] Testing mongorestore...${NC}"

# Build restore command based on auth status
if echo "$NO_AUTH" | grep -q "1"; then
  # No auth
  echo "  Running: mongorestore --host=$LOCAL_HOST --port=$LOCAL_PORT --db=$LOCAL_DB --dir=$DUMP_DIR/$SOURCE_DB --gzip --drop"
  RESTORE_OUTPUT=$(mongorestore \
    --host="$LOCAL_HOST" \
    --port="$LOCAL_PORT" \
    --db="$LOCAL_DB" \
    --dir="$DUMP_DIR/$SOURCE_DB" \
    --gzip \
    --drop \
    2>&1)
else
  # With auth
  echo "  Running: mongorestore --host=$LOCAL_HOST --port=$LOCAL_PORT -u $LOCAL_USER -p *** --authenticationDatabase $LOCAL_AUTH_DB --db=$LOCAL_DB --dir=$DUMP_DIR/$SOURCE_DB --gzip --drop"
  RESTORE_OUTPUT=$(mongorestore \
    --host="$LOCAL_HOST" \
    --port="$LOCAL_PORT" \
    --username="$LOCAL_USER" \
    --password="$LOCAL_PASS" \
    --authenticationDatabase="$LOCAL_AUTH_DB" \
    --db="$LOCAL_DB" \
    --dir="$DUMP_DIR/$SOURCE_DB" \
    --gzip \
    --drop \
    2>&1)
fi

RESTORE_EXIT=$?
echo "$RESTORE_OUTPUT" | tail -20

if [ $RESTORE_EXIT -ne 0 ]; then
  echo -e "  ${RED}❌ mongorestore FAILED (exit code: $RESTORE_EXIT)${NC}"
  echo ""
  echo "  Full output:"
  echo "$RESTORE_OUTPUT"
  exit 1
else
  echo -e "  ${GREEN}✅ mongorestore completed${NC}"
fi

# ═══════════════════════════════════════════════════════
# TEST 6: Verify data in local
# ═══════════════════════════════════════════════════════
echo ""
echo -e "${YELLOW}[TEST 6] Verifying local data...${NC}"

mongosh $CONNECT_ARGS --quiet <<EOF
use ${LOCAL_DB};
const colls = db.getCollectionNames();
let total = 0;
print("");
print("  📊 Local DB: ${LOCAL_DB}");
print("  Collections: " + colls.length);
print("");
colls.sort().forEach(c => {
  const count = db[c].countDocuments();
  total += count;
  const pad = ' '.repeat(Math.max(0, 35 - c.length));
  print("    📄 " + c + pad + count + " docs");
});
print("");
print("  Total documents: " + total);
EOF

# ═══════════════════════════════════════════════════════
# CLEANUP
# ═══════════════════════════════════════════════════════
echo ""
echo -e "${YELLOW}Cleanup dump? (y/N): ${NC}"
read cleanup
if [[ "$cleanup" == "y" || "$cleanup" == "Y" ]]; then
  rm -rf "$DUMP_DIR"
  echo -e "${GREEN}✅ Cleaned $DUMP_DIR${NC}"
fi

echo ""
echo "════════════════════════════════════════════════════"
echo -e "  ${GREEN}✅ Debug complete${NC}"
echo "════════════════════════════════════════════════════"
echo ""
