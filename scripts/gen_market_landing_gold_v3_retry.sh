#!/bin/bash
API="https://api.skyverses.com/image-jobs"
TOKEN="Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiI2OWM4ZDhjYWQ4MWZhNWRlN2JkMTA2MTYiLCJyb2xlIjoiYWRtaW4iLCJlbWFpbCI6ImFkbWluQHNreXZlcnNlcy5jb20iLCJpYXQiOjE3Nzc5NjIyNTksImV4cCI6MTc3ODU2NzA1OX0.zaXcxMq8jNYmrrNRm-MiL6mla233xnn5N3ARokDr-nk"

declare -a NAMES
declare -a PROMPTS

# ── Enterprise CTA background (retry — softer prompt) ──
NAMES+=("enterprise-cta-bg")
PROMPTS+=("Abstract premium background with soft golden gradient light, elegant golden geometric lines and subtle hexagonal grid pattern, warm amber glow fading to deep indigo blue edges, smooth gradient transition, luxury technology aesthetic, minimalist composition, no text, 16:9")

# ── Feature: Pay-per-use (retry — no coins/money) ──
NAMES+=("feature-pay-per-use")
PROMPTS+=("A golden geometric crystal splitting into smaller golden light fragments, elegant faceted golden diamond shape dispersing into sparkle particles, clean white background with soft amber reflections, luxury minimal isometric illustration style, premium quality, no text, 1:1")

# ── Feature: Latest Models (retry — simpler prompt) ──
NAMES+=("feature-latest-models")
PROMPTS+=("A golden compass rose with intricate geometric patterns pointing upward, surrounded by small golden stars and orbital rings, elegant golden filigree details, clean white background, luxury minimal illustration style, innovation and discovery concept, no text, 1:1")

# ── Feature: Lightning Fast (retry — simpler prompt) ──
NAMES+=("feature-lightning-fast")
PROMPTS+=("An abstract golden speed symbol made of flowing golden ribbons and geometric shapes, dynamic motion lines in warm amber tones, elegant swoosh of golden light energy, clean white background, luxury minimal illustration style, premium quality, no text, 1:1")

JOBIDS=()

echo "🎨 Creating ${#NAMES[@]} gold-themed image jobs (retry batch)..."
for i in "${!NAMES[@]}"; do
  P="${PROMPTS[$i]}"
  P_ESC=$(echo "$P" | sed 's/"/\\"/g')

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

RESULTS_FILE="/tmp/gold_image_results_v3.txt"
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
echo "🏁 Done! Download with:"
echo 'while IFS="|" read -r name url; do'
echo '  curl -L -o "public/assets/homepage/gold-${name}.webp" "$url"'
echo 'done < /tmp/gold_image_results_v3.txt'
