#!/bin/bash
# =============================================================
# poll_and_upload_showcase.sh
# Poll 15 jobs đã submit + download + upload Cloudflare
# =============================================================

CF_ACCOUNT="9ab75114b3032bf3e6ff9386815e4554"
CF_TOKEN="Yp_Ark78qShS4E5bc04KIiLLOZjats0kgt5ragdx"
CF_API="https://api.cloudflare.com/client/v4/accounts/${CF_ACCOUNT}/images/v1"
API="https://api.skyverses.com/image-jobs"
TOKEN="Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiI2OWM4ZGE4M2M0YjAzYTQyNGYxNjE3YTEiLCJlbWFpbCI6ImR1bG9jMjcwOEBnbWFpbC5jb20iLCJyb2xlIjoidXNlciIsIm5hbWUiOiJMb2MgRFYiLCJpYXQiOjE3NzU3MDg4MjEsImV4cCI6MTc3NjMxMzYyMX0.zI71Th5RO0s0AfJf99CiRvN76fgM1_6sC2hb0dwYCQM"
IMG_DIR="public/assets/showcase-banners"
OUTPUT_FILE="scripts/socialbanner_showcase_cdn.sh"
mkdir -p "$IMG_DIR"

# Job IDs từ lần submit trước
declare -A JOBS=(
  [showcase-flash-sale-1111]="69d7df1d52739385c7bf6d3f"
  [showcase-grand-opening]="69d7df1f52739385c7bf6d48"
  [showcase-tuyen-dung]="69d7df2252739385c7bf6d59"
  [showcase-product-launch-ig]="69d7df2452739385c7bf6d6a"
  [showcase-webinar-linkedin]="69d7df2652739385c7bf6d73"
  [showcase-new-collection-story]="69d7df2852739385c7bf6d7c"
  [showcase-tet-sale]="69d7df2a52739385c7bf6d85"
  [showcase-coffee-promo]="69d7df2b52739385c7bf6d90"
  [showcase-gym-fitness]="69d7df2d52739385c7bf6d99"
  [showcase-realestate-linkedin]="69d7df2f52739385c7bf6da2"
  [showcase-food-delivery]="69d7df3152739385c7bf6dab"
  [showcase-beauty-brand-story]="69d7df3352739385c7bf6dba"
  [showcase-tech-gadget]="69d7df3452739385c7bf6dc3"
  [showcase-travel-agency]="69d7df3652739385c7bf6dcc"
  [showcase-elearning]="69d7df3852739385c7bf6dd5"
)

# Thứ tự hiển thị
ORDERED=(
  showcase-flash-sale-1111
  showcase-grand-opening
  showcase-tuyen-dung
  showcase-product-launch-ig
  showcase-webinar-linkedin
  showcase-new-collection-story
  showcase-tet-sale
  showcase-coffee-promo
  showcase-gym-fitness
  showcase-realestate-linkedin
  showcase-food-delivery
  showcase-beauty-brand-story
  showcase-tech-gadget
  showcase-travel-agency
  showcase-elearning
)

echo "⏳ Polling 15 showcase jobs..."
echo ""

for NAME in "${ORDERED[@]}"; do
  # Skip nếu đã download rồi
  if [ -f "${IMG_DIR}/${NAME}.png" ]; then
    echo "  ✓ $NAME (already downloaded)"
    continue
  fi

  JID="${JOBS[$NAME]}"
  [ -z "$JID" ] && echo "❌ $NAME: no job ID" && continue

  echo -n "  ⏳ $NAME ... "
  for attempt in $(seq 1 60); do
    sleep 5
    SR=$(curl -s "$API/$JID" -H "Authorization: $TOKEN")
    ST=$(echo "$SR" | python3 -c "import sys,json; print(json.load(sys.stdin)['data']['status'])" 2>/dev/null)

    if [ "$ST" = "done" ]; then
      URL=$(echo "$SR" | python3 -c "import sys,json; print(json.load(sys.stdin)['data']['result']['images'][0])" 2>/dev/null)
      echo "✅"
      echo "     → $URL"
      curl -sL -o "${IMG_DIR}/${NAME}.png" "$URL"
      break
    elif [ "$ST" = "failed" ] || [ "$ST" = "error" ]; then
      echo "❌ FAILED"; break
    else
      printf "(%d)..." "$attempt"
    fi
  done
done

echo ""
echo "☁️  Uploading to Cloudflare Images..."
echo ""

# Metadata cho từng ảnh
declare -A LABELS=(
  [showcase-flash-sale-1111]="Flash Sale 11.11"
  [showcase-grand-opening]="Khai Trương Chi Nhánh Mới"
  [showcase-tuyen-dung]="Tuyển Dụng Tech Startup"
  [showcase-product-launch-ig]="Ra Mắt Sản Phẩm Mới"
  [showcase-webinar-linkedin]="Hội Thảo Trực Tuyến"
  [showcase-new-collection-story]="BST Thu Đông Mới"
  [showcase-tet-sale]="Sale Tết Nguyên Đán"
  [showcase-coffee-promo]="Khuyến Mãi Cà Phê"
  [showcase-gym-fitness]="Thách Thức 30 Ngày Gym"
  [showcase-realestate-linkedin]="Dự Án Chung Cư Luxury"
  [showcase-food-delivery]="Ưu Đãi Giao Đồ Ăn"
  [showcase-beauty-brand-story]="BST Trang Điểm Mùa Hè"
  [showcase-tech-gadget]="Ra Mắt Tai Nghe Wireless"
  [showcase-travel-agency]="Tour Du Lịch Đà Nẵng"
  [showcase-elearning]="Khoá Học Data Science"
)

cat > "$OUTPUT_FILE" << 'HEADER'
#!/bin/bash
# AUTO-GENERATED: Social Banner Showcase — Cloudflare CDN URLs
HEADER

UPLOADED=0
declare -A CDN_URLS

for NAME in "${ORDERED[@]}"; do
  FILE="${IMG_DIR}/${NAME}.png"
  [ ! -f "$FILE" ] && echo "⚠️  Skip $NAME (not downloaded)" && continue

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
    print(next((v for v in variants if v.endswith('/public')), variants[0] if variants else ''))
except:
    print('')
" 2>/dev/null)

  if [ "$SUCCESS" = "True" ] && [ -n "$URL" ]; then
    echo "✅  $URL"
    CDN_URLS[$NAME]="$URL"
    echo "CDN_${NAME//-/_}=\"${URL}\"" >> "$OUTPUT_FILE"
    UPLOADED=$((UPLOADED + 1))
  else
    echo "❌  $(echo "$RESPONSE" | python3 -c "import sys,json; d=json.load(sys.stdin); print(d.get('errors','?'))" 2>/dev/null)"
  fi
  sleep 0.3
done

# Cleanup
rm -rf "$IMG_DIR"

echo ""
echo "═══════════════════════════════════════════════════════════"
echo "✅ Uploaded: $UPLOADED/15 → Cloudflare CDN"
echo "📋 URLs saved to: $OUTPUT_FILE"
echo ""
echo "📌 Copy URLs vào ShowcaseSection.tsx:"
echo ""
for NAME in "${ORDERED[@]}"; do
  URL="${CDN_URLS[$NAME]}"
  LABEL="${LABELS[$NAME]}"
  [ -n "$URL" ] && echo "  { id: '${NAME#showcase-}', label: '${LABEL}', url: '${URL}' }"
done
echo "═══════════════════════════════════════════════════════════"
