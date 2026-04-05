#!/bin/bash
API="https://api.skyverses.com/image-jobs"
TOKEN="Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiI2OWQwNzg0Yjc4MmI2MGZjMTYzZWIwOGQiLCJlbWFpbCI6ImNodXBldGVzdmFsZGl2aWV6NjExQGdtYWlsLmNvbSIsInJvbGUiOiJ1c2VyIiwibmFtZSI6IkNodXBldGVzIFZhbGRpdmlleiIsImlhdCI6MTc3NTI3MDQzMywiZXhwIjoxNzc1ODc1MjMzfQ.BN_jQp5dm7H5D8xnauY3lkRg0U1TJEC7RrS7T_rcUYE"

declare -a NAMES
declare -a PROMPTS

# How It Works (3)
NAMES+=("hiw-01-choose")
PROMPTS+=("A sleek futuristic dashboard showing AI tool selection, multiple floating holographic tiles of different AI tools like video, image, voice and music icons arranged in a grid, glowing blue brand color accents, dark premium UI background, glassmorphism cards, no text, 16:9")

NAMES+=("hiw-02-input")
PROMPTS+=("A creative futuristic illustration of AI content input, a hand typing on a holographic keyboard with purple glowing prompt text floating upward, an image being uploaded with a magic wand effect, dark premium background, purple and pink accents, no text, 16:9")

NAMES+=("hiw-03-result")
PROMPTS+=("A stunning futuristic illustration of AI output results, multiple high quality photos videos and audio waveforms floating out of a glowing portal, download arrows with sparkle effects, dark premium background, pink to amber gradient glow, rocket launch energy, no text, 16:9")

# Use Cases (6)
NAMES+=("uc-marketing")
PROMPTS+=("A futuristic illustration of AI-powered marketing agency workspace, multiple screens showing social media content video thumbnails and banner ads being generated automatically, blue and cyan glow, dark premium background, no text, 16:9")

NAMES+=("uc-ecommerce")
PROMPTS+=("A futuristic illustration of AI e-commerce product photography, multiple product items floating with automatic background removal effect, golden amber lighting, clean white product backgrounds emerging, dark scene, no text, 16:9")

NAMES+=("uc-creator")
PROMPTS+=("A futuristic illustration of AI content creation studio, a creator workspace with floating video timeline, music waveform, and voiceover microphone with purple energy effects, YouTube and TikTok style content floating, dark background, no text, 16:9")

NAMES+=("uc-realestate")
PROMPTS+=("A futuristic illustration of AI real estate visualization, a house interior being transformed by AI with green emerald energy effects, before-after staging comparison, holographic floor plan, dark premium background, no text, 16:9")

NAMES+=("uc-fashion")
PROMPTS+=("A futuristic illustration of AI fashion design, virtual clothing try-on with holographic mannequin, fabric textures floating, pink rose gold energy effects, lookbook pages materializing, dark premium background, no text, 16:9")

NAMES+=("uc-education")
PROMPTS+=("A futuristic illustration of AI education, a digital classroom with floating video lessons, podcast waveforms, and illustrated course materials being generated, indigo violet glow effects, dark premium background, no text, 16:9")

JOBIDS=()

echo "🎨 Creating ${#NAMES[@]} image jobs..."
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
ls -la public/assets/homepage/ 2>/dev/null
echo "🏁 Done!"
