#!/bin/bash
# =============================================================
# gen_socialbanner_landing_images.sh
# Tạo + Upload → Cloudflare CDN toàn bộ hình landing Social Banner AI
# Run: bash scripts/gen_socialbanner_landing_images.sh
# =============================================================

API="https://api.skyverses.com/image-jobs"
TOKEN="Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiI2OWM4ZGE4M2M0YjAzYTQyNGYxNjE3YTEiLCJlbWFpbCI6ImR1bG9jMjcwOEBnbWFpbC5jb20iLCJyb2xlIjoidXNlciIsIm5hbWUiOiJMb2MgRFYiLCJpYXQiOjE3NzU3MDg4MjEsImV4cCI6MTc3NjMxMzYyMX0.zI71Th5RO0s0AfJf99CiRvN76fgM1_6sC2hb0dwYCQM"
CF_ACCOUNT="9ab75114b3032bf3e6ff9386815e4554"
CF_TOKEN="Yp_Ark78qShS4E5bc04KIiLLOZjats0kgt5ragdx"
CF_API="https://api.cloudflare.com/client/v4/accounts/${CF_ACCOUNT}/images/v1"

IMG_DIR="public/assets/socialbanner"
OUTPUT_FILE="scripts/socialbanner_cdn_urls.sh"

declare -a NAMES
declare -a PROMPTS

mkdir -p "$IMG_DIR"

# ═══════════════════════════════════════════════════════════════
# SECTION: FeaturesSection — 2 featured card thumbnails
# Size: 800x320 wide banner
# ═══════════════════════════════════════════════════════════════

NAMES+=("features-platform-dimensions")
PROMPTS+=("A sleek flat-lay mockup showing multiple social media banners arranged on a dark matte surface: Facebook cover banner (wide blue), X/Twitter header (black minimal), Instagram square post, LinkedIn banner. Perfect pixel alignment, premium graphic design studio aesthetic. Professional product photography. No people. No text labels. Wide banner 800x320.")

NAMES+=("features-ai-copy-generator")
PROMPTS+=("Futuristic AI text generation visualization: glowing cyan typewriter cursor on a dark screen, with holographic floating text blocks appearing — headlines, taglines, CTA buttons — materializing out of thin air with particle effects. Premium dark background, electric blue and purple gradients, glassmorphism panels. No readable text. Wide banner 800x320.")

# ═══════════════════════════════════════════════════════════════
# SECTION: WorkflowSection — step 4 result thumbnail
# Size: 400x200
# ═══════════════════════════════════════════════════════════════

NAMES+=("workflow-result-banner")
PROMPTS+=("A beautifully designed social media banner displayed on a laptop and phone screen mockup on a clean desk: the banner shows a vibrant flash sale promotion with bold typography, gradient background, and a clear CTA button. The mockup shows professional graphic design output. Minimal clean desk background. No visible text on screens. Wide 400x200.")

# ═══════════════════════════════════════════════════════════════
# SECTION: UseCasesSection — 6 use case card thumbnails
# Size: 600x400
# ═══════════════════════════════════════════════════════════════

NAMES+=("usecase-cua-hang-online")
PROMPTS+=("A vibrant e-commerce flash sale social media banner design displayed on a phone screen: bold 'SALE 50%' layout, red and gold colors, product images floating around, festive confetti, premium graphic design. Vietnamese online shopping aesthetic. No actual readable text. Clean product mockup. 600x400.")

NAMES+=("usecase-agency-marketing")
PROMPTS+=("A creative marketing agency workspace: multiple social media banner designs spread across dual monitors, showing Facebook covers, Instagram posts, and X headers for different brands — fashion, food, tech. Busy professional creative studio. Warm lighting, organized chaos. No people visible. 600x400.")

NAMES+=("usecase-nha-hang-fb")
PROMPTS+=("A beautiful Vietnamese restaurant Facebook cover banner design mockup on a screen: lush food photography banner with steaming pho bowl, warm amber lighting, elegant Vietnamese typography placement areas, premium restaurant branding aesthetic. Appetizing and luxurious. No readable text. 600x400.")

NAMES+=("usecase-thuong-hieu-thoi-trang")
PROMPTS+=("A premium fashion brand Instagram banner collection displayed on a sleek dark phone: clean minimalist layout with model silhouette, brand color palette swatches, seasonal campaign typography placement. High fashion editorial aesthetic. Luxury clothing brand vibes. No readable text. 600x400.")

NAMES+=("usecase-giao-duc-khoa-hoc")
PROMPTS+=("A professional education and online course Facebook banner mockup: graduation cap and diploma illustration, clean blue and white gradient, certification badge graphic, webinar announcement layout. Academic and trustworthy design. Premium e-learning aesthetic. No readable text. 600x400.")

NAMES+=("usecase-kol-creator")
PROMPTS+=("A YouTube and social media content creator channel art banner mockup on screen: vibrant personal brand banner with microphone, camera, and play button icons, subscriber count milestone celebration design, bold colorful typography placement areas. Modern influencer aesthetic. No readable text. 600x400.")

# ═══════════════════════════════════════════════════════════════
# HeroSection — update CDN_DEMO thumbnail
# Size: 1200x630 (16:9 demo preview)
# ═══════════════════════════════════════════════════════════════

NAMES+=("hero-demo-banner-preview")
PROMPTS+=("A stunning collection of 4 social media banner examples arranged in a 2x2 grid: top-left shows a bold red Vietnamese Flash Sale banner; top-right shows an elegant grand opening banner with fireworks; bottom-left shows a professional job recruitment banner with blue gradient; bottom-right shows a premium product launch banner with dark spotlight. Each banner is pixel-perfect with clean typography layouts. High-quality graphic design mockups. No actual readable text visible. 1200x630.")

# ═══════════════════════════════════════════════════════════════
# SUBMIT JOBS
# ═══════════════════════════════════════════════════════════════

JOBIDS=()
echo "📱 Social Banner AI Landing — Tạo ${#NAMES[@]} hình ảnh..."
echo ""

for i in "${!NAMES[@]}"; do
  NAME="${NAMES[$i]}"
  P="${PROMPTS[$i]}"

  if [[ "$NAME" == features-* ]]; then
    W=800; H=320; RATIO="16:5"
  elif [[ "$NAME" == workflow-* ]]; then
    W=400; H=200; RATIO="2:1"
  elif [[ "$NAME" == usecase-* ]]; then
    W=600; H=400; RATIO="3:2"
  elif [[ "$NAME" == hero-* ]]; then
    W=1200; H=630; RATIO="16:9"
  else
    W=800; H=450; RATIO="16:9"
  fi

  R=$(curl -s -X POST "$API" \
    -H "Content-Type: application/json" \
    -H "Authorization: $TOKEN" \
    -d "{\"type\":\"text_to_image\",\"input\":{\"prompt\":\"$P\"},\"config\":{\"width\":$W,\"height\":$H,\"aspectRatio\":\"$RATIO\",\"seed\":0,\"style\":\"\"},\"engine\":{\"provider\":\"gommo\",\"model\":\"google_image_gen_4_5\"},\"enginePayload\":{\"prompt\":\"$P\",\"privacy\":\"PRIVATE\",\"projectId\":\"default\"}}")

  JID=$(echo "$R" | python3 -c "import sys,json; print(json.load(sys.stdin)['data']['jobId'])" 2>/dev/null)
  JOBIDS+=("$JID")
  echo "  [$((i+1))/${#NAMES[@]}] $NAME (${W}x${H}) → $JID"
  sleep 1
done

# ═══════════════════════════════════════════════════════════════
# POLL & DOWNLOAD
# ═══════════════════════════════════════════════════════════════

echo ""
echo "⏳ Polling results..."

for i in "${!NAMES[@]}"; do
  JID="${JOBIDS[$i]}"
  NAME="${NAMES[$i]}"
  [ -z "$JID" ] && echo "❌ $NAME: no job ID" && continue

  for attempt in $(seq 1 60); do
    sleep 5
    SR=$(curl -s "$API/$JID" -H "Authorization: $TOKEN")
    ST=$(echo "$SR" | python3 -c "import sys,json; print(json.load(sys.stdin)['data']['status'])" 2>/dev/null)

    if [ "$ST" = "done" ]; then
      URL=$(echo "$SR" | python3 -c "import sys,json; print(json.load(sys.stdin)['data']['result']['images'][0])" 2>/dev/null)
      echo "✅ $NAME → $URL"
      curl -sL -o "${IMG_DIR}/${NAME}.png" "$URL"
      break
    elif [ "$ST" = "failed" ] || [ "$ST" = "error" ]; then
      echo "❌ $NAME FAILED"
      break
    else
      printf "  ⏳ %s (%d/60)\\r" "$NAME" "$attempt"
    fi
  done
done

# ═══════════════════════════════════════════════════════════════
# UPLOAD → CLOUDFLARE
# ═══════════════════════════════════════════════════════════════

echo ""
echo "☁️  Uploading to Cloudflare Images..."
echo ""

cat > "$OUTPUT_FILE" << 'HEADER'
#!/bin/bash
# AUTO-GENERATED: Cloudflare CDN URLs for Social Banner AI landing page
HEADER

UPLOADED=0

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
    print(next((v for v in variants if v.endswith('/public')), variants[0] if variants else ''))
except:
    print('')
" 2>/dev/null)

  if [ "$SUCCESS" = "True" ] && [ -n "$URL" ]; then
    echo "✅  $URL"
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
echo "✅ Uploaded: $UPLOADED files → Cloudflare CDN"
echo "📋 URLs saved to: $OUTPUT_FILE"
echo "🗑  Deleted: $IMG_DIR"
echo "═══════════════════════════════════════════════════════════"
cat "$OUTPUT_FILE"
