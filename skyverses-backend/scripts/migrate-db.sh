#!/bin/bash
# ============================================================
# 🔄 MongoDB Migration Script — Full Pipeline
# ============================================================
# Flow:
#   1. Disable auth trên local MongoDB
#   2. Tạo database + user trên local
#   3. Dump toàn bộ dữ liệu từ remote URI
#   4. Restore vào local MongoDB
#   5. Enable auth lại
#   6. Cập nhật .env.prod với URI local
#
# Usage: bash scripts/migrate-db.sh
# Chạy trên Linux server nơi MongoDB local sẽ chạy
# ============================================================

set -e

# ═══════════════════════════════════════════════════════
# CONFIG — Chỉnh sửa phần này
# ═══════════════════════════════════════════════════════

# Source (remote) database
SOURCE_URI="mongodb://sky_user2:duloc123@209.74.65.102:27017/skyverses-dev"
SOURCE_DB="skyverses-dev"

# Local MongoDB config
LOCAL_HOST="127.0.0.1"
LOCAL_PORT="27017"
LOCAL_DB="skyverses-dev"
LOCAL_USER="sky_admin"
LOCAL_PASS="SkyVerses@2026!Secure"
LOCAL_AUTH_DB="admin"

# Paths
DUMP_DIR="/tmp/mongodump_migration_$(date +%Y%m%d_%H%M%S)"
MONGOD_CONF="/etc/mongod.conf"
ENV_FILE="$(dirname "$0")/../.env.prod"

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

log()  { echo -e "${GREEN}[✅ $(date +%H:%M:%S)]${NC} $1"; }
warn() { echo -e "${YELLOW}[⚠️  $(date +%H:%M:%S)]${NC} $1"; }
err()  { echo -e "${RED}[❌ $(date +%H:%M:%S)]${NC} $1"; exit 1; }
info() { echo -e "${BLUE}[ℹ️  $(date +%H:%M:%S)]${NC} $1"; }

# ═══════════════════════════════════════════════════════
# PRE-FLIGHT CHECKS
# ═══════════════════════════════════════════════════════

echo ""
echo "════════════════════════════════════════════════════"
echo "  🔄 MongoDB Migration — Remote → Local"
echo "════════════════════════════════════════════════════"
echo ""
info "Source: ${SOURCE_URI}"
info "Target: mongodb://${LOCAL_USER}:***@${LOCAL_HOST}:${LOCAL_PORT}/${LOCAL_DB}"
info "Dump dir: ${DUMP_DIR}"
echo ""

# Check tools
for cmd in mongosh mongodump mongorestore systemctl; do
  if ! command -v $cmd &> /dev/null; then
    err "$cmd is required but not installed. Install mongodb-database-tools and mongosh."
  fi
done
log "All required tools found"

# Confirm
read -p "$(echo -e ${YELLOW}'Tiếp tục migration? (y/N): '${NC})" confirm
if [[ "$confirm" != "y" && "$confirm" != "Y" ]]; then
  echo "Cancelled."
  exit 0
fi

# ═══════════════════════════════════════════════════════
# STEP 1: DISABLE AUTH trên local MongoDB
# ═══════════════════════════════════════════════════════

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
info "STEP 1: Disable authentication"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

# Backup config
if [ -f "$MONGOD_CONF" ]; then
  sudo cp "$MONGOD_CONF" "${MONGOD_CONF}.bak.$(date +%Y%m%d_%H%M%S)"
  log "Backed up mongod.conf"
fi

# Disable auth (comment out security.authorization)
if grep -q "authorization:" "$MONGOD_CONF" 2>/dev/null; then
  sudo sed -i 's/^  authorization: enabled/  authorization: disabled/' "$MONGOD_CONF"
  sudo sed -i 's/^security:/#security:/' "$MONGOD_CONF"
  sudo sed -i 's/^  authorization:/#  authorization:/' "$MONGOD_CONF"
  log "Auth disabled in config"
else
  warn "No authorization line found — auth may already be disabled"
fi

# Restart MongoDB
sudo systemctl restart mongod
sleep 3

# Verify MongoDB is running
if ! mongosh --host $LOCAL_HOST --port $LOCAL_PORT --eval "db.runCommand({ping:1})" --quiet &>/dev/null; then
  err "MongoDB failed to start after disabling auth"
fi
log "MongoDB restarted (no auth)"

# ═══════════════════════════════════════════════════════
# STEP 2: CREATE DATABASE & USER
# ═══════════════════════════════════════════════════════

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
info "STEP 2: Create database & user"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

mongosh --host $LOCAL_HOST --port $LOCAL_PORT --quiet <<EOF
// Switch to admin DB to create root-level user
use admin;

// Drop existing user if any (ignore errors)
try { db.dropUser("${LOCAL_USER}"); } catch(e) {}

// Create admin user with full access
db.createUser({
  user: "${LOCAL_USER}",
  pwd: "${LOCAL_PASS}",
  roles: [
    { role: "root", db: "admin" },
    { role: "readWrite", db: "${LOCAL_DB}" },
    { role: "dbAdmin", db: "${LOCAL_DB}" }
  ]
});

print("✅ User ${LOCAL_USER} created with root + readWrite + dbAdmin on ${LOCAL_DB}");

// Also create a specific user for the app
use ${LOCAL_DB};
try { db.dropUser("sky_app"); } catch(e) {}
db.createUser({
  user: "sky_app",
  pwd: "${LOCAL_PASS}",
  roles: [
    { role: "readWrite", db: "${LOCAL_DB}" }
  ]
});

print("✅ App user sky_app created for ${LOCAL_DB}");
EOF

if [ $? -ne 0 ]; then
  err "Failed to create users"
fi
log "Database users created successfully"

# ═══════════════════════════════════════════════════════
# STEP 3: DUMP FROM REMOTE URI
# ═══════════════════════════════════════════════════════

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
info "STEP 3: Dump data from remote database"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

mkdir -p "$DUMP_DIR"

mongodump \
  --uri="$SOURCE_URI" \
  --out="$DUMP_DIR" \
  --gzip \
  2>&1 | tail -5

if [ $? -ne 0 ]; then
  err "mongodump failed"
fi

# Show dump stats
DUMP_SIZE=$(du -sh "$DUMP_DIR" | cut -f1)
COLLECTIONS=$(find "$DUMP_DIR" -name "*.bson.gz" | wc -l)
log "Dump complete: ${DUMP_SIZE} · ${COLLECTIONS} collections"
echo ""
info "Collections dumped:"
find "$DUMP_DIR" -name "*.bson.gz" | while read f; do
  echo "  📄 $(basename "$f" .bson.gz)"
done

# ═══════════════════════════════════════════════════════
# STEP 4: RESTORE TO LOCAL MONGODB
# ═══════════════════════════════════════════════════════

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
info "STEP 4: Restore data to local MongoDB"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

# Drop existing DB first (clean restore)
mongosh --host $LOCAL_HOST --port $LOCAL_PORT --quiet --eval "use ${LOCAL_DB}; db.dropDatabase(); print('🗑️ Dropped existing ${LOCAL_DB}');"

mongorestore \
  --host="$LOCAL_HOST" \
  --port="$LOCAL_PORT" \
  --db="$LOCAL_DB" \
  --dir="$DUMP_DIR/$SOURCE_DB" \
  --gzip \
  --drop \
  2>&1 | tail -10

if [ $? -ne 0 ]; then
  err "mongorestore failed"
fi
log "Restore complete"

# Verify restoration
echo ""
info "Verifying data:"
mongosh --host $LOCAL_HOST --port $LOCAL_PORT --quiet <<EOF
use ${LOCAL_DB};
const collections = db.getCollectionNames();
print("📊 Total collections: " + collections.length);
collections.forEach(c => {
  const count = db[c].countDocuments();
  print("  📄 " + c + " → " + count + " documents");
});
EOF

# ═══════════════════════════════════════════════════════
# STEP 5: ENABLE AUTH
# ═══════════════════════════════════════════════════════

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
info "STEP 5: Enable authentication"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

# Re-enable auth in mongod.conf
sudo tee "$MONGOD_CONF" > /dev/null <<'CONF'
# mongod.conf — Generated by migrate-db.sh

storage:
  dbPath: /var/lib/mongodb

systemLog:
  destination: file
  logAppend: true
  path: /var/log/mongodb/mongod.log

net:
  port: 27017
  bindIp: 0.0.0.0

processManagement:
  timeZoneInfo: /usr/share/zoneinfo

security:
  authorization: enabled
CONF

log "Auth enabled in config"

# Restart MongoDB with auth
sudo systemctl restart mongod
sleep 3

# Verify auth works
if mongosh --host $LOCAL_HOST --port $LOCAL_PORT -u "$LOCAL_USER" -p "$LOCAL_PASS" --authenticationDatabase "$LOCAL_AUTH_DB" --quiet --eval "db.runCommand({ping:1})" &>/dev/null; then
  log "Auth verified — login successful with ${LOCAL_USER}"
else
  err "Auth verification failed! Check user credentials."
fi

# Verify data still accessible with auth
mongosh --host $LOCAL_HOST --port $LOCAL_PORT -u "$LOCAL_USER" -p "$LOCAL_PASS" --authenticationDatabase "$LOCAL_AUTH_DB" --quiet <<EOF
use ${LOCAL_DB};
const count = db.getCollectionNames().length;
print("✅ ${LOCAL_DB} accessible: " + count + " collections");
EOF

# ═══════════════════════════════════════════════════════
# STEP 6: UPDATE .env.prod 
# ═══════════════════════════════════════════════════════

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
info "STEP 6: Update .env.prod with local URI"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

NEW_URI="mongodb://${LOCAL_USER}:${LOCAL_PASS}@${LOCAL_HOST}:${LOCAL_PORT}/${LOCAL_DB}?authSource=${LOCAL_AUTH_DB}"

if [ -f "$ENV_FILE" ]; then
  # Backup
  cp "$ENV_FILE" "${ENV_FILE}.bak.$(date +%Y%m%d_%H%M%S)"
  log "Backed up .env.prod"

  # Comment out old URI and add new one
  sed -i "s|^MONGO_URI=.*|# OLD: &\nMONGO_URI=${NEW_URI}|" "$ENV_FILE"
  log "Updated .env.prod"
  
  echo ""
  info "New MONGO_URI:"
  echo "  mongodb://${LOCAL_USER}:***@${LOCAL_HOST}:${LOCAL_PORT}/${LOCAL_DB}?authSource=${LOCAL_AUTH_DB}"
else
  warn ".env.prod not found at $ENV_FILE"
  echo ""
  info "Manually set MONGO_URI in your .env.prod:"
  echo "  MONGO_URI=${NEW_URI}"
fi

# ═══════════════════════════════════════════════════════
# CLEANUP
# ═══════════════════════════════════════════════════════

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
info "CLEANUP"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

read -p "$(echo -e ${YELLOW}'Xóa dump directory? (y/N): '${NC})" cleanup
if [[ "$cleanup" == "y" || "$cleanup" == "Y" ]]; then
  rm -rf "$DUMP_DIR"
  log "Dump directory cleaned"
else
  info "Dump kept at: $DUMP_DIR"
fi

# ═══════════════════════════════════════════════════════
# SUMMARY
# ═══════════════════════════════════════════════════════

echo ""
echo "════════════════════════════════════════════════════"
echo -e "  ${GREEN}✅ MIGRATION COMPLETE${NC}"
echo "════════════════════════════════════════════════════"
echo ""
echo "  Source:  $SOURCE_URI"
echo "  Target:  mongodb://${LOCAL_USER}:***@${LOCAL_HOST}:${LOCAL_PORT}/${LOCAL_DB}"
echo "  Auth:    ENABLED (authSource=$LOCAL_AUTH_DB)"
echo ""
echo "  📌 Next steps:"
echo "    1. Restart your Node.js app: pm2 restart all"
echo "    2. Verify app connects to local DB"
echo "    3. Monitor logs: pm2 logs"
echo ""
echo "════════════════════════════════════════════════════"
