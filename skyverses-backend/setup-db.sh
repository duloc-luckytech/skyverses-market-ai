#!/bin/bash
# ═══════════════════════════════════════════════════════════
# Skyverses Market AI — MongoDB Setup with Authentication
#
# This script will:
#   1. Check MongoDB installation
#   2. Temporarily disable auth → restart MongoDB
#   3. Create app user for the database (data is NOT dropped)
#   4. Enable auth → restart MongoDB
#   5. Verify authenticated connection
#   6. Update skyverses-backend/.env (MONGO_URI)
#
# Usage:
#   sudo bash setup-db.sh              # Full setup
#   sudo bash setup-db.sh --reset      # Drop user & redo
#   sudo bash setup-db.sh --status     # Check current status
#
# NOTE: run from the skyverses-backend/ directory (where .env lives).
# ═══════════════════════════════════════════════════════════

set -e

DEPLOY_DIR="$(cd "$(dirname "$0")" && pwd)"
DB_NAME="skyverses-dev"

# ── Credentials ──
# App user lives on the `admin` auth database (authSource=admin) to match
# the existing backup-db.sh / migrate-db.sh convention. A fresh random
# password is generated on every full run — copy it from the summary.
MONGO_APP_USER="sky_admin"
MONGO_APP_PASS=$(openssl rand -hex 16)
MONGO_AUTH_DB="admin"

# ── Derived URIs ──
MONGO_URI_NO_AUTH="mongodb://127.0.0.1:27017/$DB_NAME"
MONGO_URI_AUTH="mongodb://$MONGO_APP_USER:$MONGO_APP_PASS@127.0.0.1:27017/$DB_NAME?authSource=$MONGO_AUTH_DB"

# ── mongod.conf location ──
MONGOD_CONF="/etc/mongod.conf"

# ── .env location ──
ENV_FILE="$DEPLOY_DIR/.env"

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
CYAN='\033[0;36m'
NC='\033[0m'

echo ""
echo "═══════════════════════════════════════════════════════"
echo -e "  ${CYAN}Skyverses Market AI — MongoDB Auth Setup${NC}"
echo "═══════════════════════════════════════════════════════"
echo ""

# ─────────────────────────────────────────
# Helper: Detect MongoDB shell command
# ─────────────────────────────────────────
detect_mongo_shell() {
    if command -v mongosh &> /dev/null; then
        echo "mongosh"
    elif command -v mongo &> /dev/null; then
        echo "mongo"
    else
        echo ""
    fi
}

# ─────────────────────────────────────────
# Helper: Restart MongoDB service
# ─────────────────────────────────────────
restart_mongod() {
    echo -e "   ${YELLOW}Restarting MongoDB...${NC}"
    sudo systemctl restart mongod
    sleep 3
    if systemctl is-active --quiet mongod; then
        echo -e "   ${GREEN}MongoDB restarted successfully${NC}"
    else
        echo -e "   ${RED}MongoDB failed to restart!${NC}"
        sudo systemctl status mongod --no-pager -l
        exit 1
    fi
}

# ─────────────────────────────────────────
# Helper: Enable/Disable auth in mongod.conf
# ─────────────────────────────────────────
set_auth() {
    local mode=$1  # "enabled" or "disabled"

    if [ ! -f "$MONGOD_CONF" ]; then
        echo -e "   ${RED}Config file not found: $MONGOD_CONF${NC}"
        exit 1
    fi

    # Remove existing security block (security: + indented lines after it)
    sudo cp "$MONGOD_CONF" "${MONGOD_CONF}.tmp"
    sudo awk '
        /^security:/ { skip=1; next }
        skip && /^[[:space:]]/ { next }
        skip { skip=0 }
        { print }
    ' "${MONGOD_CONF}.tmp" | sudo tee "$MONGOD_CONF" > /dev/null
    sudo rm -f "${MONGOD_CONF}.tmp"

    if [ "$mode" = "enabled" ]; then
        printf '\nsecurity:\n  authorization: enabled\n' | sudo tee -a "$MONGOD_CONF" > /dev/null
        echo -e "   ${GREEN}Authentication ENABLED${NC}"
    else
        echo -e "   ${YELLOW}Authentication DISABLED${NC}"
    fi
}

# ─────────────────────────────────────────
# Handle --status flag
# ─────────────────────────────────────────
if [ "$1" = "--status" ]; then
    echo -e "${CYAN}MongoDB Status:${NC}"
    echo ""

    if systemctl is-active --quiet mongod 2>/dev/null; then
        echo -e "   Service:  ${GREEN}Running${NC}"
    else
        echo -e "   Service:  ${RED}Stopped${NC}"
    fi

    if grep -q "authorization: enabled" "$MONGOD_CONF" 2>/dev/null; then
        echo -e "   Auth:     ${GREEN}Enabled${NC}"
    else
        echo -e "   Auth:     ${YELLOW}Disabled${NC}"
    fi

    MONGO_CMD=$(detect_mongo_shell)
    if [ -n "$MONGO_CMD" ]; then
        if [ -f "$ENV_FILE" ]; then
            SAVED_URI=$(grep '^MONGO_URI=' "$ENV_FILE" | cut -d'=' -f2-)
            if [ -n "$SAVED_URI" ] && $MONGO_CMD --quiet "$SAVED_URI" --eval "db.stats()" &>/dev/null; then
                echo -e "   DB:       ${GREEN}Connected OK${NC}"
            else
                echo -e "   DB:       ${RED}Cannot connect${NC}"
            fi
            echo "   URI:      $(echo "$SAVED_URI" | sed -E 's|://[^:]+:[^@]+@|://***:***@|')"
        fi
    fi

    echo ""
    exit 0
fi


# ═══════════════════════════════════════════
# Detect MongoDB shell
# ═══════════════════════════════════════════
MONGO_CMD=$(detect_mongo_shell)
if [ -z "$MONGO_CMD" ]; then
    echo -e "   ${RED}mongosh/mongo not found${NC}"
    exit 1
fi
echo -e "   ${GREEN}Shell: $MONGO_CMD${NC}"


# ═══════════════════════════════════════════
# STEP 1: Disable auth & restart
# ═══════════════════════════════════════════
echo ""
echo -e "${CYAN}[1/5] Temporarily disabling auth...${NC}"

set_auth "disabled"
restart_mongod


# ═══════════════════════════════════════════
# STEP 2: Create app user (on admin auth db)
# ═══════════════════════════════════════════
echo ""
echo -e "${CYAN}[2/5] Creating app user...${NC}"

# Handle --reset
if [ "$1" = "--reset" ]; then
    echo -e "   ${YELLOW}--reset: dropping app user...${NC}"
    $MONGO_CMD --quiet "mongodb://127.0.0.1:27017/$MONGO_AUTH_DB" --eval "
        try { db.dropUser('$MONGO_APP_USER'); print('   Dropped app user'); } catch(e) {}
    " 2>/dev/null || true
fi

echo -e "   Showing existing collections in ${YELLOW}$DB_NAME${NC} (data is preserved):"
$MONGO_CMD --quiet "$MONGO_URI_NO_AUTH" --eval "
    print('   collections=' + db.getCollectionNames().length);
" 2>/dev/null || true

echo -e "   Creating user: ${YELLOW}$MONGO_APP_USER${NC} on authDb ${YELLOW}$MONGO_AUTH_DB${NC} (rw on ${YELLOW}$DB_NAME${NC})"
$MONGO_CMD --quiet "mongodb://127.0.0.1:27017/$MONGO_AUTH_DB" --eval "
    try { db.dropUser('$MONGO_APP_USER'); } catch(e) {}
    db.createUser({
        user: '$MONGO_APP_USER',
        pwd: '$MONGO_APP_PASS',
        roles: [
            { role: 'readWrite', db: '$DB_NAME' },
            { role: 'dbAdmin', db: '$DB_NAME' }
        ]
    });
    print('   App user created');
"


# ═══════════════════════════════════════════
# STEP 3: Enable auth & restart
# ═══════════════════════════════════════════
echo ""
echo -e "${CYAN}[3/5] Enabling authentication...${NC}"

set_auth "enabled"
restart_mongod


# ═══════════════════════════════════════════
# STEP 4: Verify connection
# ═══════════════════════════════════════════
echo ""
echo -e "${CYAN}[4/5] Verifying authenticated connection...${NC}"

if $MONGO_CMD --quiet "$MONGO_URI_AUTH" --eval "db.stats()" &>/dev/null; then
    echo -e "   ${GREEN}App user connection OK${NC}"
else
    echo -e "   ${RED}App user connection FAILED${NC}"
    echo "   URI: mongodb://$MONGO_APP_USER:***@127.0.0.1:27017/$DB_NAME?authSource=$MONGO_AUTH_DB"
    exit 1
fi


# ═══════════════════════════════════════════
# STEP 5: Update .env (MONGO_URI)
# ═══════════════════════════════════════════
echo ""
echo -e "${CYAN}[5/5] Updating .env...${NC}"

if [ -f "$ENV_FILE" ]; then
    cp "$ENV_FILE" "${ENV_FILE}.bak.$(date +%Y%m%d_%H%M%S)"
    echo -e "   ${GREEN}Backed up .env${NC}"

    if grep -q '^MONGO_URI=' "$ENV_FILE"; then
        sed -i "s|^MONGO_URI=.*|MONGO_URI=${MONGO_URI_AUTH}|" "$ENV_FILE"
        echo -e "   ${GREEN}Updated MONGO_URI${NC}"
    else
        echo "MONGO_URI=${MONGO_URI_AUTH}" >> "$ENV_FILE"
        echo -e "   ${GREEN}Added MONGO_URI${NC}"
    fi
else
    cat > "$ENV_FILE" << ENVEOF
# ── Generated by setup-db.sh ──
MONGO_URI=$MONGO_URI_AUTH
NODE_ENV=production
PORT=5302
ENVEOF
    echo -e "   ${GREEN}Created .env (fill remaining secrets manually)${NC}"
fi


# ═══════════════════════════════════════════
# Summary
# ═══════════════════════════════════════════
echo ""
echo "═══════════════════════════════════════════════════════"
echo -e "  ${GREEN}MongoDB Setup Complete — Authentication Enabled${NC}"
echo "═══════════════════════════════════════════════════════"
echo ""
echo -e "  Database:    ${CYAN}$DB_NAME${NC}"
echo -e "  Auth:        ${GREEN}Enabled${NC} (authSource=$MONGO_AUTH_DB)"
echo ""
echo -e "  ${YELLOW}App User:${NC}"
echo "    Username:  $MONGO_APP_USER"
echo "    Password:  $MONGO_APP_PASS"
echo ""
echo -e "  ${YELLOW}Connection URI:${NC}"
echo "    MONGO_URI=$MONGO_URI_AUTH"
echo ""
echo -e "  ${YELLOW}Commands:${NC}"
echo "    Check status:   bash setup-db.sh --status"
echo "    Reset user:     sudo bash setup-db.sh --reset"
echo "    Connect shell:  $MONGO_CMD '$MONGO_URI_AUTH'"
echo ""
echo -e "  ${RED}SAVE THE PASSWORD — it will not be shown again!${NC}"
echo -e "  ${YELLOW}Also update scripts/backup-db.sh MONGO_URI to match.${NC}"
echo ""
echo -e "  Next: ${CYAN}./deploy.sh${NC}"
echo ""
