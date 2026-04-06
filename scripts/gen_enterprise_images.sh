#!/bin/bash
API="https://api.skyverses.com/image-jobs"
TOKEN="Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiI2OWQwNzg0Yjc4MmI2MGZjMTYzZWIwOGQiLCJlbWFpbCI6ImNodXBldGVzdmFsZGl2aWV6NjExQGdtYWlsLmNvbSIsInJvbGUiOiJ1c2VyIiwibmFtZSI6IkNodXBldGVzIFZhbGRpdmlleiIsImlhdCI6MTc3NTI3MDQzMywiZXhwIjoxNzc1ODc1MjMzfQ.BN_jQp5dm7H5D8xnauY3lkRg0U1TJEC7RrS7T_rcUYE"

declare -a NAMES
declare -a PROMPTS

# Enterprise / Custom AI Solutions (4)
NAMES+=("ent-ai-strategy")
PROMPTS+=("A futuristic illustration of AI business strategy consulting, a holographic conference room with floating data charts analytics dashboards and AI neural network visualizations, executives looking at glowing AI roadmap hologram, blue and cyan corporate glow, dark premium background, cinematic lighting, no text, 16:9")

NAMES+=("ent-custom-tools")
PROMPTS+=("A futuristic illustration of custom AI tool development, multiple floating code editors with glowing purple syntax, robotic arms assembling modular AI pipeline blocks, holographic API endpoints connecting together, purple and magenta energy effects, dark premium background, cinematic, no text, 16:9")

NAMES+=("ent-api-integration")
PROMPTS+=("A futuristic illustration of AI API integration, glowing green data streams flowing between multiple enterprise systems servers and cloud platforms, webhook connections with emerald lightning bolts, server racks with holographic displays, emerald green glow effects, dark premium background, cinematic, no text, 16:9")

NAMES+=("ent-deploy-scale")
PROMPTS+=("A futuristic illustration of AI deployment and scaling, massive cloud infrastructure with auto-scaling servers, rocket launching from server room, golden amber energy trails, holographic metrics showing upward growth graphs, dark premium background, cinematic lighting, no text, 16:9")

JOBIDS=()

echo "🎨 Creating ${#NAMES[@]} enterprise image jobs..."
for i in "${!NAMES[@]}"; do
  P="${PROMPTS[$i]}"
  R=$(curl -s -X POST "$API" \
    -H "Content-Type: application/json" \
    -H "Authorization: $TOKEN" \
    -d "{\"type\":\"text_to_image\",\"input\":{\"prompt\":\"$P\"},\"config\":{\"width\":1024,\"height\":576,\"aspectRatio\":\"16:9\",\"seed\":0,\"style\":\"\"},\"engine\":{\"provider\":\"gommo\",\"model\":\"google_image_gen_4_5\"},\"enginePayload\":{\"prompt\":\"$P\",\"privacy\":\"PRIVATE\",\"projectId\":\"default\"}}")
  JID=$(echo "$R" | python3 -c "import sys,json; print(json.load(sys.stdin)['data']['jobId'])" 2>/dev/null)
  JOBIDS+=("$JID")
  echo "  [$((i+1))/${#NAMES[@]}] ${NAMES[$i]} → $JID"
  sleep 1
done

echo ""
echo "⏳ Polling results..."

for i in "${!NAMES[@]}"; do
  JID="${JOBIDS[$i]}"
  NAME="${NAMES[$i]}"
  [ -z "$JID" ] && echo "❌ $NAME: no job ID" && continue
  
  for attempt in $(seq 1 60); do
    sleep 4
    SR=$(curl -s "$API/$JID" -H "Authorization: $TOKEN")
    ST=$(echo "$SR" | python3 -c "import sys,json; print(json.load(sys.stdin)['data']['status'])" 2>/dev/null)
    
    if [ "$ST" = "done" ]; then
      URL=$(echo "$SR" | python3 -c "import sys,json; print(json.load(sys.stdin)['data']['result']['images'][0])" 2>/dev/null)
      echo "✅ $NAME → $URL"
      # Download
      mkdir -p public/assets/homepage
      curl -sL -o "public/assets/homepage/${NAME}.webp" "$URL"
      # Compress
      sips -Z 800 "public/assets/homepage/${NAME}.webp" --out "public/assets/homepage/${NAME}.webp" 2>/dev/null
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
echo "📁 Results:"
ls -la public/assets/homepage/ent-* 2>/dev/null
echo "🏁 Done!"
