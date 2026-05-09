#!/bin/bash
# ═══════════════════════════════════════════════════════════════════════
# Generate 5 promo banner hero images + download + upload to Cloudflare
# Usage: bash scripts/gen_promo_banners.sh
# ═══════════════════════════════════════════════════════════════════════

API="https://api.skyverses.com/image-jobs"
TOKEN="Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiI2OWM4ZDhjYWQ4MWZhNWRlN2JkMTA2MTYiLCJyb2xlIjoiYWRtaW4iLCJlbWFpbCI6ImFkbWluQHNreXZlcnNlcy5jb20iLCJpYXQiOjE3Nzc5NjIyNTksImV4cCI6MTc3ODU2NzA1OX0.zaXcxMq8jNYmrrNRm-MiL6mla233xnn5N3ARokDr-nk"

# Cloudflare credentials
CF_ACCOUNT_ID="${CF_ACCOUNT_ID:-cf3d665aec0eda633986d008ba66c967}"
CF_IMAGES_TOKEN="${CF_IMAGES_TOKEN:-cfut_EqsuFJ2hEEz1Gkm5596aLAfnnLyn6sGzYuVDXFZjb59c46b5}"
CF_API="https://api.cloudflare.com/client/v4/accounts/${CF_ACCOUNT_ID}/images/v1"

OUT_DIR="public/assets/promo-banners"
mkdir -p "$OUT_DIR"

declare -a NAMES
declare -a PROMPTS

# ── 1: HOT DEAL — Pro upgrade 30% off ──
NAMES+=("promo-hot-deal")
PROMPTS+=("A dramatic premium golden promotional banner, a glowing golden crown hovering above golden price tags with percentage discount symbols, luxurious gold coins and credit tokens scattered around, deep black background with radiant golden light rays bursting outward, bokeh golden particles floating, baroque ornamental frame corners, high-end luxury marketplace aesthetic, no text, 16:9")

# ── 2: MỚI — Veo 3 cinematic video AI ──
NAMES+=("promo-veo3-new")
PROMPTS+=("A cinematic golden film production scene, golden movie camera with glowing lens capturing a holographic AI-generated video sequence, golden film strips and reels floating in air, sparkles of golden light forming a video frame, dramatic dark background with warm amber volumetric lighting, baroque golden decorative borders, futuristic meets classic cinema aesthetic, no text, 16:9")

# ── 3: FLASH SALE — Buy 500 credits get 100 bonus ──
NAMES+=("promo-flash-sale")
PROMPTS+=("An electrifying golden flash sale scene, golden lightning bolts striking a pile of shimmering golden AI credit coins, golden sparks and energy explosions, a glowing golden gift box bursting open with bonus coins flying out, dramatic dark background with intense golden electric atmosphere, luxury baroque frame elements, dynamic and energetic premium marketplace feel, no text, 16:9")

# ── 4: ƯU ĐÃI — Free 50 credits for new accounts ──
NAMES+=("promo-free-credits")
PROMPTS+=("A welcoming golden treasure scene, an ornate golden treasure chest slowly opening revealing glowing golden AI credit tokens inside, golden sparkles and magical dust rising upward, warm inviting golden light emanating from the chest, soft dark background with ambient golden glow, baroque decorative elements and golden vine patterns, premium generous gift aesthetic, no text, 16:9")

# ── 5: BUNDLE — Video + Music AI combo ──
NAMES+=("promo-bundle-combo")
PROMPTS+=("A harmonious golden multimedia fusion scene, golden video play button merging with golden musical notes and sound waves, holographic golden screens showing video and music waveforms intertwined, golden ribbons wrapping around both elements symbolizing a bundle deal, deep dark background with rich golden ambient lighting, baroque ornamental corners, premium creative production aesthetic, no text, 16:9")

JOBIDS=()

echo "============================================="
echo "  Generating ${#NAMES[@]} promo banner images"
echo "============================================="
echo ""

# ── Step 1: Create jobs ──
echo "🎨 Creating image jobs..."
for i in "${!NAMES[@]}"; do
  P="${PROMPTS[$i]}"
  P_ESC=$(echo "$P" | sed 's/"/\\"/g')
  R=$(curl -s -X POST "$API" \
    -H "Content-Type: application/json" \
    -H "Authorization: $TOKEN" \
    -d "{\"type\":\"text_to_image\",\"input\":{\"prompt\":\"$P_ESC\"},\"config\":{\"width\":1024,\"height\":576,\"aspectRatio\":\"16:9\",\"seed\":0,\"style\":\"\"},\"engine\":{\"provider\":\"gommo\",\"model\":\"google_image_gen_4_5\"},\"enginePayload\":{\"prompt\":\"$P_ESC\",\"privacy\":\"PRIVATE\",\"projectId\":\"default\"}}")
  JID=$(echo "$R" | python3 -c "import sys,json; print(json.load(sys.stdin)['data']['jobId'])" 2>/dev/null)
  JOBIDS+=("$JID")
  echo "  [$((i+1))/${#NAMES[@]}] ${NAMES[$i]} → $JID"
  sleep 1
done

# ── Step 2: Poll results ──
echo ""
echo "⏳ Polling results..."

RESULTS_FILE="/tmp/promo_banner_results.txt"
> "$RESULTS_FILE"

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
      echo "$NAME|$URL" >> "$RESULTS_FILE"
      break
    elif [ "$ST" = "failed" ] || [ "$ST" = "error" ]; then
      echo "❌ $NAME FAILED"
      break
    else
      printf "  ⏳ %s: %s (%d/60)\r" "$NAME" "$ST" "$attempt"
    fi
  done
done

# ── Step 3: Download to public/assets/promo-banners/ ──
echo ""
echo "📥 Downloading images..."
while IFS="|" read -r name url; do
  DEST="$OUT_DIR/${name}.webp"
  curl -sL -o "$DEST" "$url"
  echo "  📁 $DEST ($(du -h "$DEST" | cut -f1))"
done < "$RESULTS_FILE"

# ── Step 4: Upload to Cloudflare Images ──
echo ""
echo "☁️  Uploading to Cloudflare Images..."

CF_RESULTS="/tmp/promo_banner_cf_results.txt"
> "$CF_RESULTS"

while IFS="|" read -r name url; do
  FILE="$OUT_DIR/${name}.webp"
  CF_ID="promo-banners/${name}"

  R=$(curl -s -X POST "$CF_API" \
    -H "Authorization: Bearer $CF_IMAGES_TOKEN" \
    -F "file=@$FILE" \
    -F "id=$CF_ID" \
    -F "metadata={\"source\":\"skyverses-market\",\"original\":\"${name}.webp\"}" \
    2>/dev/null)

  SUCCESS=$(echo "$R" | python3 -c "import sys,json; print(json.load(sys.stdin).get('success', False))" 2>/dev/null)

  if [ "$SUCCESS" = "True" ]; then
    VARIANT=$(echo "$R" | python3 -c "
import sys, json
d = json.load(sys.stdin)['result']
variants = d.get('variants', [])
print(variants[0] if variants else d.get('id',''))
" 2>/dev/null)
    echo "  ✅ $CF_ID → $VARIANT"
    echo "$CF_ID|$VARIANT|$FILE" >> "$CF_RESULTS"
  else
    ERR_CODE=$(echo "$R" | python3 -c "
import sys, json
errors = json.load(sys.stdin).get('errors', [])
print(errors[0].get('code', 0) if errors else 0)
" 2>/dev/null)
    if [ "$ERR_CODE" = "5409" ]; then
      echo "  ⏭️  $CF_ID (already exists)"
    else
      ERR_MSG=$(echo "$R" | python3 -c "
import sys, json
errors = json.load(sys.stdin).get('errors', [])
print(errors[0].get('message', 'unknown') if errors else 'unknown')
" 2>/dev/null)
      echo "  ❌ $CF_ID FAILED: $ERR_MSG"
    fi
  fi
  sleep 0.1
done < "$RESULTS_FILE"

echo ""
echo "============================================="
echo "  DONE!"
echo "============================================="
echo ""
echo "📋 Generated images:"
cat "$RESULTS_FILE"
echo ""
echo "📋 Cloudflare uploads:"
cat "$CF_RESULTS" 2>/dev/null
echo ""
echo "📁 Local files:"
ls -la "$OUT_DIR"/promo-* 2>/dev/null
echo ""
echo "🏁 All done!"
