#!/bin/bash
# ═══════════════════════════════════════════════════
#  Skyverses MongoDB Backup Script
#  Runs every 4 hours via cron
#  Keeps last 7 days of backups (42 total)
# ═══════════════════════════════════════════════════

# ─── Config ───
MONGO_URI="mongodb://sky_admin:SkyVerses%402026%21Secure@127.0.0.1:27017/skyverses-dev?authSource=admin"
DB_NAME="skyverses-dev"
BACKUP_DIR="/root/skyverses-market-ai/backups/mongodb"
RETENTION_DAYS=7
DATE=$(date +"%Y-%m-%d_%H-%M-%S")
BACKUP_PATH="${BACKUP_DIR}/${DB_NAME}_${DATE}"
LOG_FILE="${BACKUP_DIR}/backup.log"

# ─── Colors ───
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m'

# ─── Helpers ───
log() {
  local msg="[$(date '+%Y-%m-%d %H:%M:%S')] $1"
  echo -e "$msg"
  echo "$msg" >> "$LOG_FILE"
}

# ─── Create backup directory ───
mkdir -p "$BACKUP_DIR"

log "═══════════════════════════════════════════════"
log "🚀 Starting MongoDB backup: ${DB_NAME}"
log "═══════════════════════════════════════════════"

# ─── Step 1: Dump database ───
log "📦 Dumping database to: ${BACKUP_PATH}"

mongodump --uri="$MONGO_URI" --out="$BACKUP_PATH" 2>&1 | while read line; do
  log "   $line"
done

if [ ${PIPESTATUS[0]} -ne 0 ]; then
  log "${RED}❌ mongodump FAILED!${NC}"
  exit 1
fi

log "✅ Dump completed successfully"

# ─── Step 2: Compress backup ───
log "🗜️  Compressing backup..."

tar -czf "${BACKUP_PATH}.tar.gz" -C "$BACKUP_DIR" "${DB_NAME}_${DATE}" 2>&1

if [ $? -ne 0 ]; then
  log "${RED}❌ Compression FAILED!${NC}"
  exit 1
fi

# Remove uncompressed dump
rm -rf "$BACKUP_PATH"

FILESIZE=$(du -sh "${BACKUP_PATH}.tar.gz" | cut -f1)
log "✅ Compressed: ${BACKUP_PATH}.tar.gz (${FILESIZE})"

# ─── Step 3: Cleanup old backups ───
log "🧹 Cleaning up backups older than ${RETENTION_DAYS} days..."

DELETED=$(find "$BACKUP_DIR" -name "${DB_NAME}_*.tar.gz" -mtime +${RETENTION_DAYS} -print -delete | wc -l)
log "   Deleted ${DELETED} old backup(s)"

# ─── Step 4: Summary ───
TOTAL=$(find "$BACKUP_DIR" -name "${DB_NAME}_*.tar.gz" | wc -l)
TOTAL_SIZE=$(du -sh "$BACKUP_DIR" --exclude=backup.log 2>/dev/null | cut -f1)

log "═══════════════════════════════════════════════"
log "📊 Backup Summary"
log "   📁 File:      ${BACKUP_PATH}.tar.gz"
log "   📏 Size:      ${FILESIZE}"
log "   🗂️  Total:     ${TOTAL} backup(s)"
log "   💾 Disk used: ${TOTAL_SIZE:-N/A}"
log "   🕐 Next run:  $(date -d '+4 hours' '+%Y-%m-%d %H:%M:%S' 2>/dev/null || echo 'in 4 hours')"
log "═══════════════════════════════════════════════"
log "✅ Backup completed at $(date '+%Y-%m-%d %H:%M:%S')"
log ""
