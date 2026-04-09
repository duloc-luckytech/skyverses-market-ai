#!/bin/bash
# =============================================================
# upload_realestate_to_cdn.sh
# Upload ảnh BĐS → Cloudflare Images CDN (multipart, không base64)
# Output: scripts/realestate_cdn_urls.sh — mapping name → CDN URL
# =============================================================

CF_ACCOUNT="9ab75114b3032bf3e6ff9386815e4554"
CF_TOKEN="Yp_Ark78qShS4E5bc04KIiLLOZjats0kgt5ragdx"
CF_API="https://api.cloudflare.com/client/v4/accounts/${CF_ACCOUNT}/images/v1"

IMG_DIR="public/assets/realestate"
OUTPUT_FILE="scripts/realestate_cdn_urls.sh"

echo "☁️  Uploading BĐS landing images → Cloudflare Images CDN..."
echo ""

# Header output file
cat > "$OUTPUT_FILE" << 'HEADER'
#!/bin/bash
# AUTO-GENERATED: Cloudflare CDN URLs for real estate landing page images
# Source: bash scripts/realestate_cdn_urls.sh
# Usage: update FeaturesSection.tsx, WorkflowSection.tsx, UseCasesSection.tsx

HEADER

UPLOADED=0
FAILED=0

for FILE in "$IMG_DIR"/*.png; do
  NAME=$(basename "$FILE" .png)
  echo -n "  ⬆  $NAME ... "

  RESPONSE=$(curl -s -X POST "$CF_API" \
    -H "Authorization: Bearer $CF_TOKEN" \
    -F "file=@${FILE}" \
    -F "requireSignedURLs=false")

  SUCCESS=$(echo "$RESPONSE" | python3 -c "import sys,json; print(json.load(sys.stdin).get('success', False))" 2>/dev/null)
  URL=$(echo "$RESPONSE" | python3 -c "
import sys, json
try:
    d = json.load(sys.stdin)
    variants = d.get('result', {}).get('variants', [])
    url = next((v for v in variants if v.endswith('/public')), variants[0] if variants else '')
    print(url)
except:
    print('')
" 2>/dev/null)

  if [ "$SUCCESS" = "True" ] && [ -n "$URL" ]; then
    echo "✅"
    echo "     → $URL"
    VAR_NAME="CDN_${NAME//-/_}"
    echo "${VAR_NAME}=\"${URL}\"" >> "$OUTPUT_FILE"
    UPLOADED=$((UPLOADED + 1))
  else
    ERR=$(echo "$RESPONSE" | python3 -c "import sys,json; d=json.load(sys.stdin); print(d.get('errors', d))" 2>/dev/null)
    echo "❌  $ERR"
    FAILED=$((FAILED + 1))
  fi

  sleep 0.3
done

# Append usage notes
cat >> "$OUTPUT_FILE" << 'FOOTER'

# ── USAGE ────────────────────────────────────────────────────────
# FeaturesSection.tsx — featured card thumbnails:
#   thumbnail: CDN_features_render_kien_truc_4k
#   thumbnail: CDN_features_video_tour_ai
#
# WorkflowSection.tsx — bước 4 result:
#   CDN_RESULT_THUMB = CDN_workflow_result_thumb
#
# UseCasesSection.tsx — add thumbnail field per use case:
#   CDN_usecase_chu_dau_tu
#   CDN_usecase_moi_gioi_bds
#   CDN_usecase_agency_marketing
#   CDN_usecase_kien_truc_su
#   CDN_usecase_homebuyer
#   CDN_usecase_developer_website
#
# Hero masonry (community explorer — cần publish lên Explorer API):
#   CDN_hero_sample_villa_exterior
#   CDN_hero_sample_luxury_apartment
#   CDN_hero_sample_shophouse_rendering
#   CDN_hero_sample_interior_staging
#   CDN_hero_sample_office_render
#   CDN_hero_sample_penthouse_view
FOOTER

echo ""
echo "═══════════════════════════════════════════════════════════"
echo "✅ Uploaded: $UPLOADED  ❌ Failed: $FAILED"
echo "📋 CDN URLs saved to: $OUTPUT_FILE"
echo ""
echo "Next: copy URLs từ $OUTPUT_FILE → update landing page components"
echo "═══════════════════════════════════════════════════════════"

# Cleanup local PNGs (không lưu trong source)
if [ $UPLOADED -gt 0 ]; then
  echo ""
  echo "🗑  Xoá local PNGs..."
  rm -rf "$IMG_DIR"
  echo "   ✅ Đã xoá public/assets/realestate/ khỏi source"
fi
