#!/bin/bash
API="https://api.skyverses.com/image-jobs"
TOKEN="Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiI2OWM4ZDhjYWQ4MWZhNWRlN2JkMTA2MTYiLCJyb2xlIjoiYWRtaW4iLCJlbWFpbCI6ImFkbWluQHNreXZlcnNlcy5jb20iLCJpYXQiOjE3Nzc5NjIyNTksImV4cCI6MTc3ODU2NzA1OX0.zaXcxMq8jNYmrrNRm-MiL6mla233xnn5N3ARokDr-nk"

declare -a NAMES
declare -a PROMPTS

# ── Testimonials decorative background ──
NAMES+=("testimonials-bg")
PROMPTS+=("Abstract golden geometric pattern, interconnected gold wireframe nodes and lines forming a constellation network on pristine white background, subtle golden gradient accents, minimal elegant design, soft gold bokeh particles, luxury tech aesthetic, ultra clean composition, no text, 16:9")

# ── Enterprise CTA dark background ──
NAMES+=("enterprise-cta-bg")
PROMPTS+=("Dark luxurious abstract background with golden light rays streaming from center, deep navy black (#1a2330) base color, golden aurora borealis effect, scattered gold particle dust, subtle geometric gold grid lines fading into darkness, cinematic dramatic atmosphere, premium technology feel, no text, 16:9")

# ── Why Skyverses: 4 feature images ──
NAMES+=("feature-all-in-one")
PROMPTS+=("A golden unified dashboard concept, multiple golden floating screens showing different AI tools merging into one elegant golden interface, golden connecting lines and nodes, clean white background with subtle gold accents, isometric 3D illustration style, luxury minimal design, no text, 1:1")

NAMES+=("feature-pay-per-use")
PROMPTS+=("Golden credit coins floating in elegant arrangement, a single golden coin splitting into golden light particles, transparent golden piggy bank with visible gold coins inside, clean white background, luxury minimal isometric illustration, soft golden glow, no text, 1:1")

NAMES+=("feature-latest-models")
PROMPTS+=("A golden rocket or shooting star made of golden geometric shapes launching upward, trailing golden sparkle particles and light streaks, fresh golden calendar icon with star badge, clean white background, luxury minimal design, innovation concept, no text, 1:1")

NAMES+=("feature-lightning-fast")
PROMPTS+=("A golden lightning bolt made of intricate golden filigree and geometric patterns, speed lines of golden light, golden stopwatch showing fast time, clean white background, luxury minimal isometric illustration, energy and speed concept, no text, 1:1")

JOBIDS=()

echo "🎨 Creating ${#NAMES[@]} gold-themed image jobs (batch 2)..."
for i in "${!NAMES[@]}"; do
  P="${PROMPTS[$i]}"
  P_ESC=$(echo "$P" | sed 's/"/\\"/g')

  # Use 1024x576 for 16:9, 1024x1024 for 1:1
  NAME="${NAMES[$i]}"
  if [[ "$NAME" == feature-* ]]; then
    W=1024; H=1024; AR="1:1"
  else
    W=1024; H=576; AR="16:9"
  fi

  R=$(curl -s -X POST "$API" \
    -H "Content-Type: application/json" \
    -H "Authorization: $TOKEN" \
    -d "{\"type\":\"text_to_image\",\"input\":{\"prompt\":\"$P_ESC\"},\"config\":{\"width\":$W,\"height\":$H,\"aspectRatio\":\"$AR\",\"seed\":0,\"style\":\"\"},\"engine\":{\"provider\":\"gommo\",\"model\":\"google_image_gen_4_5\"},\"enginePayload\":{\"prompt\":\"$P_ESC\",\"privacy\":\"PRIVATE\",\"projectId\":\"default\"}}")
  JID=$(echo "$R" | python3 -c "import sys,json; print(json.load(sys.stdin)['data']['jobId'])" 2>/dev/null)
  JOBIDS+=("$JID")
  echo "  [$((i+1))/${#NAMES[@]}] ${NAMES[$i]} → $JID"
  sleep 1
done

echo ""
echo "⏳ Polling results (this may take a few minutes)..."

RESULTS_FILE="/tmp/gold_image_results_v2.txt"
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

echo ""
echo "📋 All results:"
cat "$RESULTS_FILE"
echo ""
echo "🏁 Done! Now download with:"
echo 'while IFS="|" read -r name url; do'
echo '  curl -L -o "public/assets/homepage/gold-${name}.webp" "$url"'
echo 'done < /tmp/gold_image_results_v2.txt'
