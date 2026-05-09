#!/bin/bash
# ═══════════════════════════════════════════════════════════════════════
# Upload all showcase .mp4 videos to Cloudflare Stream
# Outputs: /tmp/cf_video_results.txt (cf_id|playback_url|original_path)
# ═══════════════════════════════════════════════════════════════════════

set -euo pipefail

CF_ACCOUNT_ID="${CF_ACCOUNT_ID:-cf3d665aec0eda633986d008ba66c967}"
CF_STREAM_TOKEN="${CF_STREAM_TOKEN:-cfut_XsUIDkiywAdh2plkf9B3lgkiNbQ7S4paAl8WwV5c3bc87cfa}"
CUSTOMER_SUBDOMAIN="${CF_STREAM_SUBDOMAIN:-customer-xq04fu0u3x}"

API="https://api.cloudflare.com/client/v4/accounts/${CF_ACCOUNT_ID}/stream"
RESULTS="/tmp/cf_video_results.txt"
> "$RESULTS"

BASE_DIR="/Users/duloc/Desktop/SKYVERSES/ai-skyverses/skyverses-market-ai"

# Collect all .mp4 files
VIDEOS=()
while IFS= read -r f; do
  VIDEOS+=("$f")
done < <(find "$BASE_DIR/public/assets/showcase" -type f -name "*.mp4" | sort)

TOTAL=${#VIDEOS[@]}
echo "============================================="
echo "  Uploading $TOTAL videos to Cloudflare Stream"
echo "============================================="
echo ""

DONE=0
FAIL=0
SKIP=0

for i in "${!VIDEOS[@]}"; do
  FILE="${VIDEOS[$i]}"
  FILENAME=$(basename "$FILE")
  NAME_NO_EXT="${FILENAME%.*}"

  echo -n "  [$((i+1))/$TOTAL] $NAME_NO_EXT ... "

  # Upload via direct upload
  R=$(curl -s -X POST "$API" \
    -H "Authorization: Bearer $CF_STREAM_TOKEN" \
    -F "file=@$FILE" \
    -F "meta={\"name\":\"$NAME_NO_EXT\",\"source\":\"skyverses-market\"}" \
    2>/dev/null)

  SUCCESS=$(echo "$R" | python3 -c "import sys,json; print(json.load(sys.stdin).get('success', False))" 2>/dev/null)

  if [ "$SUCCESS" = "True" ]; then
    # Extract the video UID
    UID_VAL=$(echo "$R" | python3 -c "
import sys, json
d = json.load(sys.stdin)['result']
print(d.get('uid', ''))
" 2>/dev/null)

    # Construct playback URL (direct mp4 download link)
    PLAYBACK="https://${CUSTOMER_SUBDOMAIN}.cloudflarestream.com/${UID_VAL}/downloads/default.mp4"

    echo "✅ → $UID_VAL"
    echo "$NAME_NO_EXT|$UID_VAL|$PLAYBACK|$FILE" >> "$RESULTS"
    DONE=$((DONE+1))
  else
    # Check error
    ERR_MSG=$(echo "$R" | python3 -c "
import sys, json
errors = json.load(sys.stdin).get('errors', [])
print(errors[0].get('message', 'unknown') if errors else 'unknown')
" 2>/dev/null)

    # Check if duplicate
    if echo "$ERR_MSG" | grep -qi "duplicate\|already exists"; then
      echo "⏭️  (already exists)"
      SKIP=$((SKIP+1))
    else
      echo "❌ $ERR_MSG"
      FAIL=$((FAIL+1))
    fi
  fi

  # Rate limit: be gentle with Stream API
  sleep 0.5
done

echo ""
echo "=================================================="
echo "  DONE: $DONE uploaded, $SKIP skipped, $FAIL failed (total: $TOTAL)"
echo "  Results: $RESULTS"
echo "=================================================="
