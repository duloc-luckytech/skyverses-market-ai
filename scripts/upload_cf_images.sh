#!/bin/bash
# ═══════════════════════════════════════════════════════════════════════
# Upload all landing + showcase images to Cloudflare Images
# Outputs: /tmp/cf_upload_results.txt (id|variant_url|original_path)
# ═══════════════════════════════════════════════════════════════════════

set -euo pipefail

# Load from .env
CF_ACCOUNT_ID="${CF_ACCOUNT_ID:-cf3d665aec0eda633986d008ba66c967}"
CF_IMAGES_TOKEN="${CF_IMAGES_TOKEN:-cfut_EqsuFJ2hEEz1Gkm5596aLAfnnLyn6sGzYuVDXFZjb59c46b5}"

API="https://api.cloudflare.com/client/v4/accounts/${CF_ACCOUNT_ID}/images/v1"
RESULTS="/tmp/cf_upload_results.txt"
> "$RESULTS"

BASE_DIR="/Users/duloc/Desktop/SKYVERSES/ai-skyverses/skyverses-market-ai"

# ═══════════════════════════════════════════════════════════════════════
# Collect all image files
# ═══════════════════════════════════════════════════════════════════════
IMAGES=()

# 1. Showcase images (webp) — banano pro, veo3, fashion albums
while IFS= read -r f; do
  IMAGES+=("$f")
done < <(find "$BASE_DIR/public/assets/showcase" -type f \( -name "*.webp" -o -name "*.png" -o -name "*.jpg" -o -name "*.jpeg" \))

# 2. Landing images
while IFS= read -r f; do
  IMAGES+=("$f")
done < <(find "$BASE_DIR/landing-clone/www.atlascloud.ai/images" -type f \( -name "*.webp" -o -name "*.png" -o -name "*.jpg" -o -name "*.jpeg" -o -name "*.avif" \))

TOTAL=${#IMAGES[@]}
echo "============================================="
echo "  Uploading $TOTAL images to Cloudflare Images"
echo "============================================="
echo ""

DONE=0
FAIL=0
SKIP=0

for i in "${!IMAGES[@]}"; do
  FILE="${IMAGES[$i]}"

  # Generate a clean ID from the file path
  # showcase: bp-hayabusa-hero, album-elara-gown, etc.
  # landing: landing/home/bg, landing/gpu/icon, etc.
  FILENAME=$(basename "$FILE")
  NAME_NO_EXT="${FILENAME%.*}"

  if echo "$FILE" | grep -q "public/assets/showcase"; then
    CF_ID="showcase/${NAME_NO_EXT}"
  else
    # Landing: use relative path from images/ as ID
    REL=$(echo "$FILE" | sed "s|.*/images/||")
    REL_NO_EXT="${REL%.*}"
    CF_ID="landing/${REL_NO_EXT}"
  fi

  # Upload
  R=$(curl -s -X POST "$API" \
    -H "Authorization: Bearer $CF_IMAGES_TOKEN" \
    -F "file=@$FILE" \
    -F "id=$CF_ID" \
    -F "metadata={\"source\":\"skyverses-market\",\"original\":\"$FILENAME\"}" \
    2>/dev/null)

  SUCCESS=$(echo "$R" | python3 -c "import sys,json; print(json.load(sys.stdin).get('success', False))" 2>/dev/null)

  if [ "$SUCCESS" = "True" ]; then
    # Extract the public URL variant
    VARIANT=$(echo "$R" | python3 -c "
import sys, json
d = json.load(sys.stdin)['result']
variants = d.get('variants', [])
print(variants[0] if variants else d.get('id',''))
" 2>/dev/null)

    echo "  ✅ [$((i+1))/$TOTAL] $CF_ID → $VARIANT"
    echo "$CF_ID|$VARIANT|$FILE" >> "$RESULTS"
    DONE=$((DONE+1))
  else
    # Check if it's a duplicate (already exists)
    ERR_CODE=$(echo "$R" | python3 -c "
import sys, json
errors = json.load(sys.stdin).get('errors', [])
print(errors[0].get('code', 0) if errors else 0)
" 2>/dev/null)

    if [ "$ERR_CODE" = "5409" ]; then
      echo "  ⏭️  [$((i+1))/$TOTAL] $CF_ID (already exists)"
      SKIP=$((SKIP+1))
    else
      ERR_MSG=$(echo "$R" | python3 -c "
import sys, json
errors = json.load(sys.stdin).get('errors', [])
print(errors[0].get('message', 'unknown') if errors else 'unknown')
" 2>/dev/null)
      echo "  ❌ [$((i+1))/$TOTAL] $CF_ID FAILED: $ERR_MSG"
      FAIL=$((FAIL+1))
    fi
  fi

  # Rate limit: ~10 req/sec safe
  sleep 0.1
done

echo ""
echo "=================================================="
echo "  DONE: $DONE uploaded, $SKIP skipped, $FAIL failed (total: $TOTAL)"
echo "  Results: $RESULTS"
echo "=================================================="
