#!/bin/bash
API="https://api.skyverses.com/image-jobs"
TOKEN="Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiI2OWM4ZDhjYWQ4MWZhNWRlN2JkMTA2MTYiLCJyb2xlIjoiYWRtaW4iLCJlbWFpbCI6ImFkbWluQHNreXZlcnNlcy5jb20iLCJpYXQiOjE3Nzc5NjIyNTksImV4cCI6MTc3ODU2NzA1OX0.zaXcxMq8jNYmrrNRm-MiL6mla233xnn5N3ARokDr-nk"
OUT="public/assets/homepage"

declare -a NAMES
declare -a PROMPTS

# ── Hero card: All-in-One AI Creative Platform ──
NAMES+=("gold-tools-hero")
PROMPTS+=("A grand golden command center for AI creation, multiple golden holographic screens displaying image generation, video editing, script writing, and 3D modeling simultaneously, ornate baroque golden frame surrounding the workspace, glowing golden particles connecting all tools, dark luxurious background with warm amber light, cinematic renaissance aesthetic meets futuristic technology, no text, 9:16")

# ── Card 1: AI Script & Prompt ──
NAMES+=("gold-tools-script")
PROMPTS+=("A luxurious golden writer's desk with AI-powered script creation, ornate golden quill pen writing glowing text on a floating golden scroll, holographic storyboard panels arranged in golden frames, baroque gold decorative elements, warm amber light illuminating creative text flowing like golden ribbons, dark rich background, renaissance meets digital aesthetic, no text, 16:10")

# ── Card 2: Image Generation ──
NAMES+=("gold-tools-image")
PROMPTS+=("A magnificent golden AI art studio, a luminous canvas being painted by streams of golden light particles forming a stunning portrait, golden paintbrushes and palette floating with baroque ornate frames, 4K quality masterpiece emerging from golden mist, dark premium background with dramatic chiaroscuro lighting, no text, 16:10")

# ── Card 3: Video Creation ──
NAMES+=("gold-tools-video")
PROMPTS+=("A cinematic golden film production studio, golden film reels spinning with holographic video frames showing movie scenes, ornate baroque camera equipment adorned with gold filigree, timeline glowing with amber light, dramatic golden spotlights cutting through dark atmosphere, renaissance cinematography aesthetic, no text, 16:10")

# ── Card 4: Marketing Tools ──
NAMES+=("gold-tools-marketing")
PROMPTS+=("A golden marketing command center, floating golden social media cards and ad creatives arranged in an elegant grid, ornate golden megaphone emitting golden light particles, product photos in baroque golden frames, campaign analytics displayed on golden holographic charts, dark luxurious background with warm amber glow, no text, 16:10")

# ── Card 5: Upscale & Enhance ──
NAMES+=("gold-tools-upscale")
PROMPTS+=("A golden transformation chamber for image enhancement, a blurry image entering from one side and emerging crystal clear on the other through a golden portal, magnifying glass with ornate baroque golden frame showing enhanced details, golden light particles representing AI processing, before-and-after comparison in golden frames, dark rich background, no text, 16:10")

# ── Card 6: 3D Generation ──
NAMES+=("gold-tools-3d")
PROMPTS+=("A magnificent golden 3D modeling workshop, a flat golden image transforming into a detailed 3D model rotating in space, golden wireframe mesh glowing with warm amber light, ornate baroque golden pedestals displaying textured 3D assets, golden geometric particles floating, dark luxurious background with dramatic lighting, no text, 16:10")

JOBIDS=()

echo "🎨 Creating ${#NAMES[@]} tool section image jobs..."
for i in "${!NAMES[@]}"; do
  P="${PROMPTS[$i]}"
  P_ESC=$(echo "$P" | sed 's/"/\\"/g')

  # Determine aspect ratio from prompt
  if echo "$P" | grep -q "9:16"; then
    W=576; H=1024; AR="9:16"
  else
    W=1024; H=640; AR="16:10"
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
echo "⏳ Polling results..."

RESULTS_FILE="/tmp/gold_tools_results.txt"
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

      # Download and compress
      curl -sL "$URL" -o "$OUT/${NAME}.webp"
      sips -Z 1200 "$OUT/${NAME}.webp" >/dev/null 2>&1
      echo "   📥 Saved to $OUT/${NAME}.webp"
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
echo "🏁 Done! Now update MarketPage.tsx image paths:"
echo "  Hero card:     /assets/homepage/gold-tools-hero.webp"
echo "  Script:        /assets/homepage/gold-tools-script.webp"
echo "  Image:         /assets/homepage/gold-tools-image.webp"
echo "  Video:         /assets/homepage/gold-tools-video.webp"
echo "  Marketing:     /assets/homepage/gold-tools-marketing.webp"
echo "  Upscale:       /assets/homepage/gold-tools-upscale.webp"
echo "  3D:            /assets/homepage/gold-tools-3d.webp"
