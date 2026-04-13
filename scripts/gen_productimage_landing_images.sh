#!/bin/bash
# =============================================================
# gen_productimage_landing_images.sh
# Tạo + Upload → Cloudflare CDN toàn bộ hình landing Product Image AI
# Run: bash scripts/gen_productimage_landing_images.sh
# =============================================================

API="https://api.skyverses.com/image-jobs"
TOKEN="Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiI2OWM4ZGE4M2M0YjAzYTQyNGYxNjE3YTEiLCJlbWFpbCI6ImR1bG9jMjcwOEBnbWFpbC5jb20iLCJyb2xlIjoidXNlciIsIm5hbWUiOiJMb2MgRFYiLCJpYXQiOjE3NzU5NzQ1NzcsImV4cCI6MTc3NjU3OTM3N30.3VYlj56NszbBVYAhTWvxUNqbRRDHsrZZZHqyvbBSnlA"
CF_ACCOUNT="9ab75114b3032bf3e6ff9386815e4554"
CF_TOKEN="Yp_Ark78qShS4E5bc04KIiLLOZjats0kgt5ragdx"
CF_API="https://api.cloudflare.com/client/v4/accounts/${CF_ACCOUNT}/images/v1"

IMG_DIR="public/assets/productimage"
OUTPUT_FILE="scripts/productimage_cdn_urls.sh"

declare -a NAMES
declare -a PROMPTS

mkdir -p "$IMG_DIR"

# ═══════════════════════════════════════════════════════════════
# SECTION: ModesSection — 3 mode card thumbnails
# Size: 600x300 (2:1)
# ═══════════════════════════════════════════════════════════════

NAMES+=("mode-generate")
PROMPTS+=("A breathtaking AI text-to-image generation concept: a glowing holographic portal materializing a stunning photorealistic landscape from pure light and particles — mountains, aurora borealis, futuristic cityscape emerging from a dark void. Electric blue and violet gradient energy streams, quantum particles, dark premium background, cinematic lighting. No text. Wide 600x300.")

NAMES+=("mode-edit")
PROMPTS+=("A before-and-after AI photo editing concept: split screen showing a raw blurry photo transforming into a crystal-clear enhanced masterpiece, with a glowing AI magic wand touching the dividing line, particle effects radiating from the touch point. Professional photo retouching studio aesthetics, dark background with teal accent glows. No text. Wide 600x300.")

NAMES+=("mode-upscale")
PROMPTS+=("An AI upscaling visualization: a pixelated low-resolution image on the left progressively becoming an ultra-sharp 8K crystal-clear detailed photograph on the right, with shimmering enhancement rays and zoom-in detail circles revealing incredible sharpness. Blue-white gradient energy, technical precision aesthetic. No text. Wide 600x300.")

# ═══════════════════════════════════════════════════════════════
# SECTION: FeaturesSection — thumbnails
# Size: 800x320 wide banner
# ═══════════════════════════════════════════════════════════════

NAMES+=("features-multi-model")
PROMPTS+=("A futuristic AI model family selection interface on a dark screen: glowing hexagonal model cards arranged in a grid — each representing a different AI family (Midjourney-style, photorealistic, anime, artistic) with neon accents and a selection cursor hovering. Premium dark UI with electric blue and purple gradients, glassmorphism panels. No readable text. Wide 800x320.")

NAMES+=("features-batch-export")
PROMPTS+=("A high-tech batch processing visualization: multiple images being generated simultaneously in a parallel pipeline — rows of image thumbnails flowing through processing stages with progress indicators, download arrows, and format badges (PNG, JPG, 4K). Dark terminal-style background with green and blue accents, organized and powerful aesthetic. No readable text. Wide 800x320.")

# ═══════════════════════════════════════════════════════════════
# SECTION: UseCasesSection — 6 use case card thumbnails
# Size: 600x400
# ═══════════════════════════════════════════════════════════════

NAMES+=("usecase-ecommerce")
PROMPTS+=("Premium e-commerce product photography: an elegantly arranged flatlay of luxury products — perfume bottle, leather wallet, sunglasses — on a clean white marble surface with dramatic studio lighting, soft shadows, color-accurate rendering. Professional commercial photography aesthetic. No text. 600x400.")

NAMES+=("usecase-social-media")
PROMPTS+=("Vibrant social media content creation workspace: a MacBook screen showing colorful AI-generated Instagram posts, Facebook banners, and story templates arranged in a content calendar grid. Colorful, modern, energetic creative studio atmosphere. No readable text on screens. 600x400.")

NAMES+=("usecase-creative-design")
PROMPTS+=("A stunning AI art studio concept: a fantasy landscape merging surreal and photorealistic elements — floating islands with waterfalls, bioluminescent forests, twin moons in a violet sky. Premium digital art aesthetic, cinematic composition, concept art quality. No text. 600x400.")

NAMES+=("usecase-fashion")
PROMPTS+=("A high fashion lookbook photography concept: editorial-style clothing mockup on a sleek minimalist background, garment displayed with professional lighting showing fabric texture and drape, color palette swatches beside it, luxury fashion brand presentation quality. No people. Clean white background. 600x400.")

# ═══════════════════════════════════════════════════════════════
# HeroSection — demo preview
# Size: 1200x630 (16:9)
# ═══════════════════════════════════════════════════════════════

NAMES+=("hero-studio-preview")
PROMPTS+=("A stunning 2x2 grid of AI-generated image examples showcasing diverse capabilities: top-left shows a photorealistic luxury product shot of a perfume bottle on marble; top-right shows a vibrant fantasy landscape with aurora and floating islands; bottom-left shows a fashion editorial with elegant clothing on minimal white background; bottom-right shows a futuristic cityscaped at blue hour with neon reflections. Each image is pixel-perfect, premium quality, cinematic lighting. Grid layout with thin dark separators. 1200x630.")

# ═══════════════════════════════════════════════════════════════
# SUBMIT JOBS
# ═══════════════════════════════════════════════════════════════

JOBIDS=()
echo "🖼  Product Image AI Landing — Tạo ${#NAMES[@]} hình ảnh..."
echo ""

for i in "${!NAMES[@]}"; do
  NAME="${NAMES[$i]}"
  P="${PROMPTS[$i]}"

  if [[ "$NAME" == mode-* ]]; then
    W=600; H=300; RATIO="2:1"
  elif [[ "$NAME" == features-* ]]; then
    W=800; H=320; RATIO="16:5"
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
# AUTO-GENERATED: Cloudflare CDN URLs for Product Image AI landing page
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
