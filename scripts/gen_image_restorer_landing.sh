#!/bin/bash
# =============================================================
# gen_image_restorer_landing.sh
# Generate 15 ảnh AI cho landing /product/ai-image-restorer
# Pattern: submit all → poll → download → upload Cloudflare
#
# Sections:
#   Hero     — 1 ảnh before (damaged) + 1 ảnh after (restored)
#   Showcase — 6 cặp before/after (portrait, wedding, colorize,
#              landscape, memorial, group)
#   Workflow — 1 result thumb (bước 4)
#   Features — 2 thumbnails (face enhancement, color synthesis)
#
# Total: 15 ảnh
# =============================================================

API="https://api.skyverses.com/image-jobs"
TOKEN="Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiI2OWM4ZGE4M2M0YjAzYTQyNGYxNjE3YTEiLCJlbWFpbCI6ImR1bG9jMjcwOEBnbWFpbC5jb20iLCJyb2xlIjoidXNlciIsIm5hbWUiOiJMb2MgRFYiLCJpYXQiOjE3NzU3MDg4MjEsImV4cCI6MTc3NjMxMzYyMX0.zI71Th5RO0s0AfJf99CiRvN76fgM1_6sC2hb0dwYCQM"
CF_ACCOUNT="9ab75114b3032bf3e6ff9386815e4554"
CF_TOKEN="Yp_Ark78qShS4E5bc04KIiLLOZjats0kgt5ragdx"
CF_API="https://api.cloudflare.com/client/v4/accounts/${CF_ACCOUNT}/images/v1"

IMG_DIR="public/assets/image-restorer"
OUTPUT_FILE="scripts/image_restorer_cdn_urls.sh"
mkdir -p "$IMG_DIR"

declare -a NAMES PROMPTS WIDTHS HEIGHTS

# ══════════════════════════════════════════════════════════════
# 1. HERO — BeforeAfterSlider
# ══════════════════════════════════════════════════════════════

# Hero Before — ảnh cũ hư hỏng
NAMES+=("hero-before")
WIDTHS+=(1280); HEIGHTS+=(720)
PROMPTS+=("Heavily damaged vintage Vietnamese family portrait photograph from the 1950s. Black and white, heavily scratched surface with deep white scratch lines across faces, large water stain damage on left side, torn and missing corner bottom-right, severe fading and yellowing, grainy deteriorated film scan texture, crumpled paper texture, age spots and brown foxing marks scattered across image, faces barely visible through damage. Ultra realistic damaged photo scan appearance. No color, sepia-brown tones only.")

# Hero After — phục chế 4K
NAMES+=("hero-after")
WIDTHS+=(1280); HEIGHTS+=(720)
PROMPTS+=("Beautifully restored Vietnamese family portrait photograph, crystal clear 4K quality. Warm natural color tones, professional photo restoration result. Sharp facial features of a Vietnamese family — grandparents, parents and children — all smiling, dressed in traditional Vietnamese clothes from the 1950s era. Clean white background, professional studio lighting. Every hair strand and skin texture is perfectly sharp. Photorealistic, high detail, warm golden-hour indoor lighting. Professional family portrait quality.")

# ══════════════════════════════════════════════════════════════
# 2. SHOWCASE — 6 cặp Before / After
# ══════════════════════════════════════════════════════════════

# Portrait before
NAMES+=("showcase-portrait-before")
WIDTHS+=(800); HEIGHTS+=(800)
PROMPTS+=("Old damaged black and white Vietnamese elderly woman portrait photograph from 1960s. Heavily scratched with multiple diagonal scratch lines. Face details faded and blurry. Brown water stains in upper-right corner. Torn paper edge on left. Grainy deteriorated film texture. Age spots scattered. Very low resolution blurry face. Dark vignetting around edges. Sepia-toned damaged photo scan.")

# Portrait after
NAMES+=("showcase-portrait-after")
WIDTHS+=(800); HEIGHTS+=(800)
PROMPTS+=("Beautifully restored Vietnamese elderly woman portrait in full natural color. Crystal clear 4K sharp. Warm brown eyes, gentle smile, silver hair neatly arranged. Traditional Vietnamese ao dai collar visible. Soft studio portrait lighting with warm catchlights in eyes. Natural skin texture perfectly rendered. Professional portrait photography quality. Clean neutral background.")

# Wedding before
NAMES+=("showcase-wedding-before")
WIDTHS+=(800); HEIGHTS+=(800)
PROMPTS+=("Old damaged black and white Vietnamese wedding photograph from 1970s. Bride in white ao dai and groom in dark suit. Photo heavily faded, water damage stains on right side, multiple scratch lines crossing over subjects. Yellowed and deteriorated. Creased fold line diagonally. Grainy low-quality scan. Romantic but severely damaged vintage photograph.")

# Wedding after
NAMES+=("showcase-wedding-after")
WIDTHS+=(800); HEIGHTS+=(800)
PROMPTS+=("Beautifully colorized and restored Vietnamese wedding photograph from 1970s. Bride in pristine white ao dai with delicate embroidery, groom in navy-blue suit with boutonniere. Soft romantic warm lighting. Natural skin tones, vivid fabric colors. Crystal clear 4K sharp faces, no damage visible. Timeless romantic atmosphere preserved. Professional wedding photography quality.")

# Colorize before
NAMES+=("showcase-colorize-before")
WIDTHS+=(900); HEIGHTS+=(600)
PROMPTS+=("Classic black and white photograph of a Vietnamese street market scene from the 1960s. Women in ao dai carrying yoke baskets of fruits and vegetables. Traditional Vietnamese street with French colonial architecture in background. High contrast black and white, slightly grainy film, a few small scratches. Lively but monochrome scene.")

# Colorize after
NAMES+=("showcase-colorize-after")
WIDTHS+=(900); HEIGHTS+=(600)
PROMPTS+=("Vibrant colorized Vietnamese street market scene from the 1960s. Women in colorful silk ao dai — red, green, blue, yellow — carrying yoke baskets of tropical fruits. Rich emerald trees lining the street. Blue sky with white clouds. Warm golden afternoon sunlight. Photorealistic natural color synthesis, historically accurate Vietnamese color palette. Vivid and alive.")

# Landscape before
NAMES+=("showcase-landscape-before")
WIDTHS+=(900); HEIGHTS+=(600)
PROMPTS+=("Old faded low-resolution photograph of Ha Long Bay Vietnam from the 1980s. Limestone karst islands barely visible through heavy haze. Washed out colors, overexposed sky, grainy film noise, blurry details, scratched surface. Colors faded to near monochrome. A traditional Vietnamese junk boat silhouette in foreground. Deteriorated tourist photo.")

# Landscape after
NAMES+=("showcase-landscape-after")
WIDTHS+=(900); HEIGHTS+=(600)
PROMPTS+=("Stunning 4K ultra sharp Ha Long Bay Vietnam landscape. Dramatic emerald-green karst limestone towers rising from crystal turquoise water. Dramatic cloudy sky with golden light breaking through. Traditional red-sailed Vietnamese junk boat in foreground. Crystal clear water reflections. Ultra sharp details on rock textures, lush vegetation on cliffs. Professional nature photography quality.")

# Memorial before
NAMES+=("showcase-memorial-before")
WIDTHS+=(800); HEIGHTS+=(600)
PROMPTS+=("Heavily damaged old Vietnamese family reunion photograph from the 1960s. Multiple people sitting and standing in rows, faces barely visible. Large water stain damage covers center. Multiple deep scratch lines crossing entire image. Torn corner top-left. Paper is yellowed and foxed with brown age spots everywhere. Severe crease fold across middle. Deteriorated beyond recognition in places.")

# Memorial after
NAMES+=("showcase-memorial-after")
WIDTHS+=(800); HEIGHTS+=(600)
PROMPTS+=("Perfectly restored Vietnamese family reunion photograph from 1960s in warm natural color. Three generations of family — grandparents seated in center, parents standing behind, children in front. Everyone's face is crystal clear and sharp. Traditional Vietnamese clothing in natural colors. Courtyard garden setting with green plants visible. Clean, no damage visible. Warm family moment preserved forever in 4K quality.")

# ══════════════════════════════════════════════════════════════
# 3. WORKFLOW — step 4 result thumbnail
# ══════════════════════════════════════════════════════════════

NAMES+=("workflow-result-thumb")
WIDTHS+=(800); HEIGHTS+=(500)
PROMPTS+=("Split screen before-and-after photo restoration comparison. Left half: heavily damaged black and white old Vietnamese portrait with scratches, fading, and water stains. Right half: same portrait perfectly restored in beautiful 4K color — sharp face, natural skin tones, clean background. Center dividing line with a small circular icon. Professional photo restoration result showcase. Wide banner composition showing dramatic transformation.")

# ══════════════════════════════════════════════════════════════
# 4. FEATURES — 2 featured thumbnails
# ══════════════════════════════════════════════════════════════

# Face Enhancement
NAMES+=("feat-face-enhancement")
WIDTHS+=(700); HEIGHTS+=(450)
PROMPTS+=("Close-up split comparison of AI face enhancement restoration. Left half: damaged blurry grainy black and white close-up face with scratches and fading, eyes barely visible. Right half: same face perfectly restored — eyes crystal clear with visible catchlights, skin texture natural and sharp, every facial feature reconstructed in beautiful detail, warm natural skin tones. Dramatic professional result. Tight face crop composition.")

# Color Synthesis
NAMES+=("feat-color-synthesis")
WIDTHS+=(700); HEIGHTS+=(450)
PROMPTS+=("AI colorization showcase banner. Left side: classic black and white Vietnamese family photograph — neutral monochrome tones. Right side: same photograph transformed with vivid natural colors — warm skin tones, colorful traditional Vietnamese ao dai in red and blue, lush green garden background, natural blue sky. Dramatic color transformation result. Side-by-side comparison with clean center divider line.")

# ══════════════════════════════════════════════════════════════
# SUBMIT ALL JOBS
# ══════════════════════════════════════════════════════════════

JOBIDS=()
echo "🎨 Submitting ${#NAMES[@]} image jobs..."
echo ""

for i in "${!NAMES[@]}"; do
  NAME="${NAMES[$i]}"
  P="${PROMPTS[$i]}"
  W="${WIDTHS[$i]}"
  H="${HEIGHTS[$i]}"

  R=$(curl -s -X POST "$API" \
    -H "Content-Type: application/json" \
    -H "Authorization: $TOKEN" \
    -d "{\"type\":\"text_to_image\",\"input\":{\"prompt\":\"$P\"},\"config\":{\"width\":$W,\"height\":$H,\"aspectRatio\":\"${W}:${H}\",\"seed\":0,\"style\":\"\"},\"engine\":{\"provider\":\"gommo\",\"model\":\"google_image_gen_4_5\"},\"enginePayload\":{\"prompt\":\"$P\",\"privacy\":\"PRIVATE\",\"projectId\":\"default\"}}")

  JID=$(echo "$R" | python3 -c "import sys,json; print(json.load(sys.stdin)['data']['jobId'])" 2>/dev/null)
  JOBIDS+=("$JID")
  echo "  [$((i+1))/${#NAMES[@]}] $NAME (${W}x${H}) → jobId: $JID"
  sleep 1
done

# ══════════════════════════════════════════════════════════════
# POLL → DOWNLOAD
# ══════════════════════════════════════════════════════════════

echo ""
echo "⏳ Polling results..."
echo ""

for i in "${!NAMES[@]}"; do
  JID="${JOBIDS[$i]}"
  NAME="${NAMES[$i]}"
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

# ══════════════════════════════════════════════════════════════
# UPLOAD → CLOUDFLARE CDN
# ══════════════════════════════════════════════════════════════

echo ""
echo "☁️  Uploading to Cloudflare Images..."
echo ""

cat > "$OUTPUT_FILE" << 'HEADER'
#!/bin/bash
# AUTO-GENERATED: AI Image Restorer — Cloudflare CDN URLs
# Sections: Hero (before/after), Showcase (6 pairs), Workflow, Features
HEADER

UPLOADED=0

for i in "${!NAMES[@]}"; do
  NAME="${NAMES[$i]}"
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
    echo "CDN_${NAME//-/_}=\"${URL}\"" >> "$OUTPUT_FILE"
    UPLOADED=$((UPLOADED + 1))
  else
    echo "❌  $(echo "$RESPONSE" | python3 -c "import sys,json; d=json.load(sys.stdin); print(d.get('errors','?'))" 2>/dev/null)"
  fi
  sleep 0.3
done

# Cleanup local PNGs
rm -rf "$IMG_DIR"

echo ""
echo "══════════════════════════════════════════════════════════"
echo "✅ Uploaded: $UPLOADED/${#NAMES[@]} → Cloudflare CDN"
echo "📋 URLs saved to: $OUTPUT_FILE"
echo "🗑  Deleted: $IMG_DIR"
echo ""
echo "Next: node scripts/apply_image_restorer_cdn.js"
echo "══════════════════════════════════════════════════════════"
