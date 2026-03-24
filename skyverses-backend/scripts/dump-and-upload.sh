#!/bin/bash
# ============================================================
# 📤 Step 1: Dump local Mac DB → SCP to server
# ============================================================
# Chạy trên Mac
# Usage: bash scripts/dump-and-upload.sh
# ============================================================

set -eo pipefail

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

# ═══ CONFIG ═══
LOCAL_DB="skyverses-dev"
LOCAL_HOST="localhost"
LOCAL_PORT="27017"

# Server SSH info
SERVER_USER="root"
SERVER_HOST="209.74.65.102"
SERVER_PORT="22"
SERVER_DUMP_PATH="/tmp/skyverses_dump"

# Local dump path
DUMP_DIR="/tmp/skyverses_dump_$(date +%Y%m%d_%H%M%S)"

echo ""
echo "════════════════════════════════════════════════════"
echo "  📤 Dump Local Mac DB → Upload to Server"
echo "════════════════════════════════════════════════════"
echo ""
echo -e "${BLUE}Source:${NC} mongodb://${LOCAL_HOST}:${LOCAL_PORT}/${LOCAL_DB}"
echo -e "${BLUE}Target:${NC} ${SERVER_USER}@${SERVER_HOST}:${SERVER_DUMP_PATH}"
echo ""

# ═══ CHECK TOOLS ═══
for cmd in mongodump scp; do
  if ! command -v $cmd &>/dev/null; then
    echo -e "${RED}❌ $cmd not found. Install mongodb-database-tools${NC}"
    exit 1
  fi
done

# ═══ STEP 1: COUNT LOCAL DATA ═══
echo -e "${YELLOW}[1/3] Counting local data...${NC}"
mongosh --host $LOCAL_HOST --port $LOCAL_PORT --quiet --eval "
  use('${LOCAL_DB}');
  const colls = db.getCollectionNames();
  let total = 0;
  colls.forEach(c => { total += db[c].countDocuments(); });
  print('Collections: ' + colls.length + ' | Documents: ' + total);
"
echo ""

# ═══ STEP 2: MONGODUMP ═══
echo -e "${YELLOW}[2/3] Dumping database...${NC}"
mkdir -p "$DUMP_DIR"

mongodump \
  --host="$LOCAL_HOST" \
  --port="$LOCAL_PORT" \
  --db="$LOCAL_DB" \
  --out="$DUMP_DIR" \
  --gzip \
  2>&1

DUMP_EXIT=$?
if [ $DUMP_EXIT -ne 0 ]; then
  echo -e "${RED}❌ mongodump failed${NC}"
  exit 1
fi

# Show stats
DUMP_SIZE=$(du -sh "$DUMP_DIR/$LOCAL_DB" | cut -f1)
BSON_COUNT=$(find "$DUMP_DIR/$LOCAL_DB" -name "*.bson.gz" | wc -l | tr -d ' ')
echo ""
echo -e "${GREEN}✅ Dump complete: $DUMP_SIZE, $BSON_COUNT collections${NC}"
echo ""
echo "Files:"
find "$DUMP_DIR/$LOCAL_DB" -name "*.bson.gz" | sort | while read f; do
  FSIZE=$(du -h "$f" | cut -f1)
  BASENAME=$(basename "$f" .bson.gz)
  printf "  📄 %-35s %s\n" "$BASENAME" "$FSIZE"
done

# ═══ STEP 3: SCP TO SERVER ═══
echo ""
echo -e "${YELLOW}[3/3] Uploading to server...${NC}"
echo -e "  Destination: ${SERVER_USER}@${SERVER_HOST}:${SERVER_DUMP_PATH}"
echo ""

# Create remote dir
ssh -p $SERVER_PORT ${SERVER_USER}@${SERVER_HOST} "mkdir -p ${SERVER_DUMP_PATH}" 2>/dev/null

# SCP the dump
scp -r -P $SERVER_PORT "$DUMP_DIR/$LOCAL_DB" "${SERVER_USER}@${SERVER_HOST}:${SERVER_DUMP_PATH}/"

SCP_EXIT=$?
if [ $SCP_EXIT -ne 0 ]; then
  echo -e "${RED}❌ SCP failed${NC}"
  echo ""
  echo "Alternative: manual upload"
  echo "  scp -r $DUMP_DIR/$LOCAL_DB ${SERVER_USER}@${SERVER_HOST}:${SERVER_DUMP_PATH}/"
  exit 1
fi

echo ""
echo -e "${GREEN}✅ Upload complete!${NC}"
echo ""

# Cleanup local dump
rm -rf "$DUMP_DIR"
echo -e "${GREEN}✅ Local dump cleaned${NC}"

echo ""
echo "════════════════════════════════════════════════════"
echo -e "  ${GREEN}✅ DONE — Data uploaded to server${NC}"
echo "════════════════════════════════════════════════════"
echo ""
echo "  📌 Now SSH to server and run:"
echo "    bash skyverses-backend/scripts/restore-from-dump.sh"
echo ""
echo "════════════════════════════════════════════════════"
