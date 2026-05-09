#!/bin/bash
API="https://api.skyverses.com/image-jobs"
TOKEN="Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiI2OWM4ZDhjYWQ4MWZhNWRlN2JkMTA2MTYiLCJyb2xlIjoiYWRtaW4iLCJlbWFpbCI6ImFkbWluQHNreXZlcnNlcy5jb20iLCJpYXQiOjE3Nzc5NjIyNTksImV4cCI6MTc3ODU2NzA1OX0.zaXcxMq8jNYmrrNRm-MiL6mla233xnn5N3ARokDr-nk"

declare -a NAMES
declare -a PROMPTS

# ── Section 4: BUILD tab images (3) ──
NAMES+=("build-image-gen")
PROMPTS+=("A majestic golden AI art creation scene, ornate gold baroque frame elements, a luminous digital canvas displaying a stunning portrait being painted by golden light particles, rich dark background with amber and gold tones, luxurious renaissance aesthetic meets futuristic technology, dramatic chiaroscuro lighting, no text, 16:9")

NAMES+=("build-video-gen")
PROMPTS+=("A cinematic golden video production scene, golden film reels and camera equipment with ornate baroque decorative elements, holographic video timeline glowing with warm amber light, dark luxurious background, gold leaf accents, dramatic lighting like a Rembrandt painting, no text, 16:9")

NAMES+=("build-audio-creative")
PROMPTS+=("A luxurious golden music and audio creation scene, ornate golden musical instruments floating in space, sound waves rendered in shimmering gold particles, vintage microphone with baroque gold decorations, rich dark background with warm amber glow, renaissance meets digital art style, no text, 16:9")

# ── Section 5: CREATE cards (2) ──
NAMES+=("create-professionals")
PROMPTS+=("A prestigious golden professional workspace, ornate gold-framed monitors showing AI-generated masterpieces, golden desk accessories and luxury leather chair, dramatic lighting with gold and amber tones, baroque architectural elements in background, dark rich atmosphere like a royal study, no text, 16:9")

NAMES+=("create-creators")
PROMPTS+=("A magical golden creative studio, an artist surrounded by floating golden canvases with AI-generated artworks, paintbrushes and digital tools adorned with gold filigree, warm amber particles of creative energy, dark luxurious background with baroque elements, renaissance master's atelier aesthetic, no text, 16:9")

# ── Section 6: WHY SKYVERSES hero image (1) ──
NAMES+=("why-skyverses-hero")
PROMPTS+=("A grand golden gateway to AI technology, massive ornate golden double doors opening to reveal a luminous world of AI possibilities, golden light rays streaming through, baroque architectural columns with gold leaf details, floating golden geometric shapes representing AI, dramatic cinematic composition, dark rich background, no text, 16:9")

# ── Section 7: ENTERPRISE cards (3) ──
NAMES+=("ent-always-fresh")
PROMPTS+=("A luxurious golden fountain of innovation, streams of liquid gold flowing upward carrying glowing AI model icons, ornate baroque bowl catching new creations, sparkling golden particles, dark premium background with warm amber atmospheric glow, classical sculpture aesthetic, no text, 16:9")

NAMES+=("ent-team-ready")
PROMPTS+=("A golden collaborative workspace, ornate golden round table with multiple golden holographic displays, team of golden silhouettes working together, baroque ceiling with gold leaf patterns, warm amber candlelight atmosphere, dark luxurious environment like a royal war room, no text, 16:9")

NAMES+=("ent-volume-pricing")
PROMPTS+=("A magnificent golden treasury vault, stacks of golden credit coins with intricate engravings, ornate baroque golden arches and columns, volumetric golden light beams, treasure chest overflowing with golden tokens, dark rich background with warm amber glow, dramatic renaissance lighting, no text, 16:9")

# ── Section 9: TO THE CREATORS hero image (1) ──
NAMES+=("creators-hero")
PROMPTS+=("A heroic golden figure of a creator, standing atop a golden pedestal like a renaissance statue, wielding a glowing golden stylus that creates cascading golden artworks in the air, ornate baroque frame elements surrounding the scene, dramatic golden backlighting, dark rich background, classical sculpture meets futuristic AI aesthetic, no text, 16:9")

JOBIDS=()

echo "🎨 Creating ${#NAMES[@]} gold-themed image jobs..."
for i in "${!NAMES[@]}"; do
  P="${PROMPTS[$i]}"
  # Escape quotes in prompt for JSON
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

echo ""
echo "⏳ Polling results (this may take a few minutes)..."

RESULTS_FILE="/tmp/gold_image_results.txt"
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
echo "🏁 Done!"
