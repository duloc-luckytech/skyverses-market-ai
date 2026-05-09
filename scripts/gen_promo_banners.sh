#!/bin/bash
# ═══════════════════════════════════════════════════════════════════════
# Generate 5 promo banner hero images + download + upload to Cloudflare
# Usage: bash scripts/gen_promo_banners.sh
# ═══════════════════════════════════════════════════════════════════════

API="https://api.skyverses.com/image-jobs"
TOKEN="Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiI2OWM4ZDhjYWQ4MWZhNWRlN2JkMTA2MTYiLCJyb2xlIjoiYWRtaW4iLCJlbWFpbCI6ImFkbWluQHNreXZlcnNlcy5jb20iLCJpYXQiOjE3Nzc5NjIyNTksImV4cCI6MTc3ODU2NzA1OX0.zaXcxMq8jNYmrrNRm-MiL6mla233xnn5N3ARokDr-nk"
# Version: v3 — cinema / anime / time freestyle — 1:1 square

# Cloudflare credentials
CF_ACCOUNT_ID="${CF_ACCOUNT_ID:-cf3d665aec0eda633986d008ba66c967}"
CF_IMAGES_TOKEN="${CF_IMAGES_TOKEN:-cfut_EqsuFJ2hEEz1Gkm5596aLAfnnLyn6sGzYuVDXFZjb59c46b5}"
CF_API="https://api.cloudflare.com/client/v4/accounts/${CF_ACCOUNT_ID}/images/v1"

OUT_DIR="public/assets/promo-banners"
mkdir -p "$OUT_DIR"

declare -a NAMES
declare -a PROMPTS

# ── 1: HOT DEAL — Pro upgrade — cinematic sci-fi portal ──
NAMES+=("promo-hot-deal-v2")
PROMPTS+=("A breathtaking sci-fi scene, a massive glowing neon portal opening in a dark cyberpunk cityscape, swirling energy vortex with electric blue and magenta light streaks, holographic UI panels floating around the portal showing upgrade symbols, tiny silhouettes of people looking up in awe, volumetric fog and lens flares, cinematic wide shot, moody atmospheric lighting, no text, square composition")

# ── 2: MỚI — Veo 3 cinematic video AI — movie set ──
NAMES+=("promo-veo3-new-v2")
PROMPTS+=("A dramatic cinematic film set scene, a futuristic AI-powered movie camera on a crane shooting a fantasy landscape, the camera lens projects holographic film frames into the air showing different movie genres - action explosion, romantic sunset, sci-fi spaceship, film crew silhouettes in foreground, dramatic orange and teal color grading, volumetric light beams through haze, Spielberg-esque atmosphere, no text, square composition")

# ── 3: FLASH SALE — credits bonus — anime energy burst ──
NAMES+=("promo-flash-sale-v2")
PROMPTS+=("An epic anime-style energy explosion scene, a character in dynamic pose releasing a massive burst of colorful energy crystals and glowing orbs into the sky, Dragon Ball inspired power-up aura with electric lightning arcs, vibrant purple blue and cyan color palette, speed lines radiating outward, floating geometric crystal shards catching light, dramatic low angle perspective, Japanese animation art style with cinematic quality, no text, square composition")

# ── 4: ƯU ĐÃI — Free credits welcome — time/space gateway ──
NAMES+=("promo-free-credits-v2")
PROMPTS+=("A mesmerizing time-space gateway scene, an enormous ornate clockwork mechanism floating in a cosmic nebula, giant clock gears and astronomical rings slowly rotating, stardust and galaxies visible through the central opening, bioluminescent particles drifting like fireflies, deep indigo and warm amber color palette, a small astronaut floating toward the gateway, sense of wonder and infinite possibility, Interstellar movie inspired, no text, square composition")

# ── 5: BUNDLE — Video + Music combo — anime concert ──
NAMES+=("promo-bundle-combo-v2")
PROMPTS+=("A spectacular anime-style virtual concert scene, a holographic AI singer performing on a futuristic floating stage above a neon-lit cyberpunk city at night, massive holographic screens displaying music visualizers and video montages, crowd below with glowing lightsticks, cherry blossom petals mixed with digital particles floating upward, vibrant pink cyan and violet neon palette, Makoto Shinkai inspired lighting with lens flares, no text, square composition")

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
    -d "{\"type\":\"text_to_image\",\"input\":{\"prompt\":\"$P_ESC\"},\"config\":{\"width\":1024,\"height\":1024,\"aspectRatio\":\"1:1\",\"seed\":0,\"style\":\"\"},\"engine\":{\"provider\":\"gommo\",\"model\":\"google_image_gen_4_5\"},\"enginePayload\":{\"prompt\":\"$P_ESC\",\"privacy\":\"PRIVATE\",\"projectId\":\"default\"}}")
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
