#!/bin/bash
# ═══════════════════════════════════════════════════════════════════════
# Generate 4 enterprise section images + download + upload to Cloudflare
# Usage: bash scripts/gen_enterprise_images.sh
# ═══════════════════════════════════════════════════════════════════════

API="https://api.skyverses.com/image-jobs"
TOKEN="Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiI2OWM4ZDhjYWQ4MWZhNWRlN2JkMTA2MTYiLCJyb2xlIjoiYWRtaW4iLCJlbWFpbCI6ImFkbWluQHNreXZlcnNlcy5jb20iLCJpYXQiOjE3Nzc5NjIyNTksImV4cCI6MTc3ODU2NzA1OX0.zaXcxMq8jNYmrrNRm-MiL6mla233xnn5N3ARokDr-nk"

# Cloudflare credentials
CF_ACCOUNT_ID="${CF_ACCOUNT_ID:-cf3d665aec0eda633986d008ba66c967}"
CF_IMAGES_TOKEN="${CF_IMAGES_TOKEN:-cfut_EqsuFJ2hEEz1Gkm5596aLAfnnLyn6sGzYuVDXFZjb59c46b5}"
CF_API="https://api.cloudflare.com/client/v4/accounts/${CF_ACCOUNT_ID}/images/v1"

OUT_DIR="public/assets/homepage"
mkdir -p "$OUT_DIR"

declare -a NAMES
declare -a PROMPTS

# ── Enterprise Section 8: 4 cards (gold baroque style) ──
NAMES+=("ent-build-app")
PROMPTS+=("A luxurious golden software development scene, ornate golden holographic screens showing app interfaces and code, golden circuit board patterns, a luminous golden laptop with AI application dashboard glowing, baroque gold frame elements, dark rich background with warm amber atmospheric glow, renaissance meets futuristic tech aesthetic, no text, 16:9")

NAMES+=("ent-deploy")
PROMPTS+=("A magnificent golden server room, rows of golden server racks with glowing amber lights, golden neural network connections flowing between servers, ornate baroque architectural columns, holographic AI model deployment visualization in gold, dark luxurious data center environment with dramatic golden backlighting, no text, 16:9")

NAMES+=("ent-maintain")
PROMPTS+=("A golden operations command center, ornate golden monitoring dashboards with real-time metrics and graphs glowing in amber, golden gears and clockwork mechanisms symbolizing maintenance, baroque decorative elements, a golden wrench tool beside holographic system health displays, dark premium background with warm golden atmosphere, no text, 16:9")

NAMES+=("ent-consult")
PROMPTS+=("A prestigious golden consulting boardroom, ornate golden round table with holographic AI strategy presentations glowing in amber, golden chess pieces symbolizing strategic planning, baroque ceiling with gold leaf patterns, warm candlelight atmosphere with golden silhouettes in discussion, dark luxurious environment like a royal advisory chamber, no text, 16:9")

JOBIDS=()

echo "============================================="
echo "  Generating ${#NAMES[@]} enterprise images"
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

RESULTS_FILE="/tmp/ent_image_results.txt"
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

# ── Step 3: Download to public/assets/homepage/ ──
echo ""
echo "📥 Downloading images..."
while IFS="|" read -r name url; do
  DEST="$OUT_DIR/gold-${name}.webp"
  curl -sL -o "$DEST" "$url"
  echo "  📁 $DEST ($(du -h "$DEST" | cut -f1))"
done < "$RESULTS_FILE"

# ── Step 4: Upload to Cloudflare Images ──
echo ""
echo "☁️  Uploading to Cloudflare Images..."

CF_RESULTS="/tmp/ent_cf_results.txt"
> "$CF_RESULTS"

while IFS="|" read -r name url; do
  FILE="$OUT_DIR/gold-${name}.webp"
  CF_ID="landing/gold-${name}"

  R=$(curl -s -X POST "$CF_API" \
    -H "Authorization: Bearer $CF_IMAGES_TOKEN" \
    -F "file=@$FILE" \
    -F "id=$CF_ID" \
    -F "metadata={\"source\":\"skyverses-market\",\"original\":\"gold-${name}.webp\"}" \
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
ls -la "$OUT_DIR"/gold-ent-* 2>/dev/null
echo ""
echo "🏁 All done!"
