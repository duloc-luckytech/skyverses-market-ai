#!/bin/bash
# ═══════════════════════════════════════════════════════════════════════
# Upload ALL Prompt Market images + videos to Cloudflare (from URLs)
# Reads /tmp map files → uploads via URL → overwrites map files with CF URLs
# ═══════════════════════════════════════════════════════════════════════
set -euo pipefail

CF_ACCOUNT_ID="cf3d665aec0eda633986d008ba66c967"
CF_IMAGES_TOKEN="${CF_IMAGES_TOKEN:?set CF_IMAGES_TOKEN}"
CF_STREAM_TOKEN="${CF_STREAM_TOKEN:?set CF_STREAM_TOKEN}"
CF_STREAM_SUBDOMAIN="customer-xq04fu0u3x"

IMG_API="https://api.cloudflare.com/client/v4/accounts/${CF_ACCOUNT_ID}/images/v1"
STREAM_API="https://api.cloudflare.com/client/v4/accounts/${CF_ACCOUNT_ID}/stream"

# Image map files
IMG_FILES=(
  "/tmp/pm_showcase_covers.txt"
  "/tmp/pm_v4extra_covers.txt"
  "/tmp/pm_showcase_examples.txt"
  "/tmp/pm_v4extra_examples.txt"
)

# Video map file
VID_FILE="/tmp/pm_v4extra_videos.txt"

TOTAL_IMG=0
TOTAL_VID=0
FAIL_IMG=0
FAIL_VID=0

# ═══════════════════════════════════════════════════
# Upload images to Cloudflare Images (via URL)
# ═══════════════════════════════════════════════════
for MAP_FILE in "${IMG_FILES[@]}"; do
  if [[ ! -f "$MAP_FILE" ]]; then
    echo "⚠️  Skip missing: $MAP_FILE"
    continue
  fi

  echo ""
  echo "═══════════════════════════════════════════════════"
  echo "  Processing: $MAP_FILE"
  echo "═══════════════════════════════════════════════════"

  TMP_OUT="${MAP_FILE}.cf_new"
  > "$TMP_OUT"

  while IFS='|' read -r NAME URL || [[ -n "$NAME" ]]; do
    # Skip empty lines and FAILED entries
    [[ -z "$NAME" || -z "$URL" || "$URL" == "FAILED" ]] && continue

    ((TOTAL_IMG++))
    echo -n "  [$TOTAL_IMG] $NAME ... "

    # Upload via URL to Cloudflare Images
    RESP=$(curl -s -X POST "$IMG_API" \
      -H "Authorization: Bearer $CF_IMAGES_TOKEN" \
      -F "url=$URL" \
      -F "id=pm-market/$NAME" \
      --max-time 120 2>/dev/null || echo '{"success":false}')

    SUCCESS=$(echo "$RESP" | python3 -c "import sys,json; print(json.load(sys.stdin).get('success',False))" 2>/dev/null || echo "False")

    if [[ "$SUCCESS" == "True" ]]; then
      # Extract the public variant URL
      CF_URL=$(echo "$RESP" | python3 -c "
import sys, json
d = json.load(sys.stdin)
variants = d.get('result', {}).get('variants', [])
# Prefer 'public' variant
url = next((v for v in variants if '/public' in v), variants[0] if variants else '')
print(url)
" 2>/dev/null || echo "")

      if [[ -n "$CF_URL" && "$CF_URL" != "None" ]]; then
        echo "✅ ${CF_URL:0:70}..."
        echo "${NAME}|${CF_URL}" >> "$TMP_OUT"
      else
        echo "❌ no variant URL"
        echo "${NAME}|FAILED" >> "$TMP_OUT"
        ((FAIL_IMG++))
      fi
    else
      # Check if already exists (duplicate ID)
      ERR=$(echo "$RESP" | python3 -c "
import sys, json
d = json.load(sys.stdin)
errors = d.get('errors', [])
print(errors[0].get('message','') if errors else '')
" 2>/dev/null || echo "")

      if echo "$ERR" | grep -qi "already exists\|duplicate"; then
        # Image already uploaded — construct URL from ID
        CF_URL="https://imagedelivery.net/${CF_ACCOUNT_ID}/pm-market/${NAME}/public"
        echo "⏭️  already exists → $CF_URL"
        echo "${NAME}|${CF_URL}" >> "$TMP_OUT"
      else
        echo "❌ $ERR"
        echo "${NAME}|FAILED" >> "$TMP_OUT"
        ((FAIL_IMG++))
      fi
    fi

    sleep 0.5
  done < "$MAP_FILE"

  # Replace original with CF URLs
  mv "$TMP_OUT" "$MAP_FILE"
  echo "  → Updated $MAP_FILE"
done

# ═══════════════════════════════════════════════════
# Upload videos to Cloudflare Stream (via URL copy)
# ═══════════════════════════════════════════════════
echo ""
echo "═══════════════════════════════════════════════════"
echo "  Processing videos: $VID_FILE"
echo "═══════════════════════════════════════════════════"

if [[ -f "$VID_FILE" ]]; then
  TMP_OUT="${VID_FILE}.cf_new"
  > "$TMP_OUT"

  while IFS='|' read -r NAME URL || [[ -n "$NAME" ]]; do
    [[ -z "$NAME" || -z "$URL" || "$URL" == "FAILED" ]] && continue

    ((TOTAL_VID++))
    echo -n "  [$TOTAL_VID] $NAME ... "

    # Upload via URL copy to Cloudflare Stream
    RESP=$(curl -s -X POST "$STREAM_API/copy" \
      -H "Authorization: Bearer $CF_STREAM_TOKEN" \
      -H "Content-Type: application/json" \
      -d "{\"url\":\"$URL\",\"meta\":{\"name\":\"$NAME\"}}" \
      --max-time 30 2>/dev/null || echo '{"success":false}')

    SUCCESS=$(echo "$RESP" | python3 -c "import sys,json; print(json.load(sys.stdin).get('success',False))" 2>/dev/null || echo "False")

    if [[ "$SUCCESS" == "True" ]]; then
      UID_VAL=$(echo "$RESP" | python3 -c "import sys,json; print(json.load(sys.stdin)['result']['uid'])" 2>/dev/null || echo "")

      if [[ -n "$UID_VAL" && "$UID_VAL" != "None" ]]; then
        CF_VID_URL="https://${CF_STREAM_SUBDOMAIN}.cloudflarestream.com/${UID_VAL}/downloads/default.mp4"
        echo "✅ $CF_VID_URL"
        echo "${NAME}|${CF_VID_URL}" >> "$TMP_OUT"
      else
        echo "❌ no UID"
        echo "${NAME}|FAILED" >> "$TMP_OUT"
        ((FAIL_VID++))
      fi
    else
      ERR=$(echo "$RESP" | python3 -c "
import sys, json
d = json.load(sys.stdin)
errors = d.get('errors', [])
print(errors[0].get('message','') if errors else '')
" 2>/dev/null || echo "")
      echo "❌ $ERR"
      echo "${NAME}|FAILED" >> "$TMP_OUT"
      ((FAIL_VID++))
    fi

    sleep 1
  done < "$VID_FILE"

  mv "$TMP_OUT" "$VID_FILE"
  echo "  → Updated $VID_FILE"
else
  echo "  ⚠️  No video file found"
fi

echo ""
echo "═══════════════════════════════════════════════════"
echo "  Upload complete!"
echo "  Images: $TOTAL_IMG uploaded ($FAIL_IMG failed)"
echo "  Videos: $TOTAL_VID uploaded ($FAIL_VID failed)"
echo "═══════════════════════════════════════════════════"
echo ""
echo "  Next: re-run seed script to update database:"
echo "  cd skyverses-backend && npx ts-node src/scripts/seed-prompt-market-v4.ts"
