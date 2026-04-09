#!/bin/bash
# gen_socialbanner_feature_thumbs.sh
# Gen 6 thumbnail nhỏ cho các non-featured feature cards
API="https://api.skyverses.com/image-jobs"
TOKEN="Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiI2OWM4ZGE4M2M0YjAzYTQyNGYxNjE3YTEiLCJlbWFpbCI6ImR1bG9jMjcwOEBnbWFpbC5jb20iLCJyb2xlIjoidXNlciIsIm5hbWUiOiJMb2MgRFYiLCJpYXQiOjE3NzU3MDg4MjEsImV4cCI6MTc3NjMxMzYyMX0.zI71Th5RO0s0AfJf99CiRvN76fgM1_6sC2hb0dwYCQM"
CF_ACCOUNT="9ab75114b3032bf3e6ff9386815e4554"
CF_TOKEN="Yp_Ark78qShS4E5bc04KIiLLOZjats0kgt5ragdx"
CF_API="https://api.cloudflare.com/client/v4/accounts/${CF_ACCOUNT}/images/v1"
IMG_DIR="public/assets/feature-thumbs"
OUTPUT="scripts/socialbanner_feature_thumbs_cdn.sh"
mkdir -p "$IMG_DIR"

NAMES=(); PROMPTS=()

NAMES+=("feat-brand-color")
PROMPTS+=("Abstract graphic design illustration showing brand color injection concept: colorful HEX color swatches (#FF5733, #0090FF, #FFD700, etc.) arranged in a elegant grid, with a stylized logo placeholder in center surrounded by color palette rings. Dark background with vibrant color chips glowing slightly. Minimal clean design tool aesthetic. No text. 600x300 wide.")

NAMES+=("feat-smart-text")
PROMPTS+=("Abstract visualization of smart text layout AI: clean white and dark composition showing typography hierarchy — varying font sizes arranged beautifully, contrast balance indicators shown as thin lines, text alignment guides in electric blue. Design tool interface aesthetic, minimal geometric. No readable text, just layout structure. 600x300 wide.")

NAMES+=("feat-batch-export")
PROMPTS+=("Abstract concept illustration of batch export: multiple overlapping file cards (PNG, JPG labels) arranged in a cascading fan layout, each glowing with soft color. Background is dark charcoal. Download arrows hovering over the cards with thin blue accent glow. Professional design tool minimal aesthetic. No readable text. 600x300 wide.")

NAMES+=("feat-auto-refund")
PROMPTS+=("Abstract illustration of automatic credit refund concept: circular refresh/retry arrow icon in electric blue center glow, surrounded by transparent credit coin tokens orbiting around it. Dark background. Clean minimal fintech iconographic style. Subtle particle sparkles. No text. 600x300 wide.")

NAMES+=("feat-speed-30s")
PROMPTS+=("Abstract speed concept illustration: bold '30' numeral in large neon blue glowing font center composition, surrounded by motion blur speed lines radiating outward. Lightning bolt accent. Dark background with electric energy. Digital stopwatch element suggestion. Fintech minimal aesthetic. No other text. 600x300 wide.")

NAMES+=("feat-security")
PROMPTS+=("Abstract privacy and security concept: shield icon in center with subtle lock symbol inside, surrounded by abstract network nodes and encrypted data streams in thin blue lines. Soft gradient dark background navy to black. Clean minimal cybersecurity aesthetic. No text. 600x300 wide.")

echo "🚀 Submitting 6 feature thumb jobs..."
JOBIDS=()
for i in "${!NAMES[@]}"; do
  R=$(curl -s -X POST "$API" \
    -H "Content-Type: application/json" \
    -H "Authorization: $TOKEN" \
    -d "{\"type\":\"text_to_image\",\"input\":{\"prompt\":\"${PROMPTS[$i]}\"},\"config\":{\"width\":600,\"height\":300,\"aspectRatio\":\"2:1\",\"seed\":0,\"style\":\"\"},\"engine\":{\"provider\":\"gommo\",\"model\":\"google_image_gen_4_5\"},\"enginePayload\":{\"prompt\":\"${PROMPTS[$i]}\",\"privacy\":\"PRIVATE\",\"projectId\":\"default\"}}")
  JID=$(echo "$R" | python3 -c "import sys,json; print(json.load(sys.stdin)['data']['jobId'])" 2>/dev/null)
  JOBIDS+=("$JID")
  echo "  [$((i+1))/6] ${NAMES[$i]} → $JID"
  sleep 0.5
done

echo ""
echo "⏳ Polling in parallel..."

poll_job() {
  local NAME="$1" JID="$2" OUTDIR="$3"
  local TK="Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiI2OWM4ZGE4M2M0YjAzYTQyNGYxNjE3YTEiLCJlbWFpbCI6ImR1bG9jMjcwOEBnbWFpbC5jb20iLCJyb2xlIjoidXNlciIsIm5hbWUiOiJMb2MgRFYiLCJpYXQiOjE3NzU3MDg4MjEsImV4cCI6MTc3NjMxMzYyMX0.zI71Th5RO0s0AfJf99CiRvN76fgM1_6sC2hb0dwYCQM"
  for attempt in $(seq 1 60); do
    sleep 5
    SR=$(curl -s "https://api.skyverses.com/image-jobs/$JID" -H "Authorization: $TK")
    ST=$(echo "$SR" | python3 -c "import sys,json; print(json.load(sys.stdin)['data']['status'])" 2>/dev/null)
    if [ "$ST" = "done" ]; then
      URL=$(echo "$SR" | python3 -c "import sys,json; print(json.load(sys.stdin)['data']['result']['images'][0])" 2>/dev/null)
      echo "✅ $NAME → $URL"
      curl -sL -o "${OUTDIR}/${NAME}.png" "$URL"
      return 0
    elif [ "$ST" = "failed" ] || [ "$ST" = "error" ]; then
      echo "❌ $NAME FAILED"; return 1
    fi
  done
  echo "⏰ $NAME TIMEOUT"; return 1
}
export -f poll_job

PIDS=()
for i in "${!NAMES[@]}"; do
  poll_job "${NAMES[$i]}" "${JOBIDS[$i]}" "$IMG_DIR" &
  PIDS+=($!)
done
for PID in "${PIDS[@]}"; do wait "$PID"; done

echo ""
echo "☁️  Uploading to Cloudflare..."
cat > "$OUTPUT" << 'HDR'
#!/bin/bash
# AUTO-GENERATED: Social Banner Feature Thumbnails CDN
HDR

UPLOADED=0
for FILE in "$IMG_DIR"/*.png; do
  NAME=$(basename "$FILE" .png)
  echo -n "  ⬆  $NAME ... "
  RESP=$(curl -s -X POST "$CF_API" \
    -H "Authorization: Bearer $CF_TOKEN" \
    -F "file=@${FILE}" -F "requireSignedURLs=false")
  SUCCESS=$(echo "$RESP" | python3 -c "import sys,json; print(json.load(sys.stdin).get('success',False))" 2>/dev/null)
  URL=$(echo "$RESP" | python3 -c "
import sys,json
try:
  d=json.load(sys.stdin); v=d.get('result',{}).get('variants',[])
  print(next((x for x in v if x.endswith('/public')),v[0] if v else ''))
except: print('')
" 2>/dev/null)
  if [ "$SUCCESS" = "True" ] && [ -n "$URL" ]; then
    echo "✅  $URL"
    echo "CDN_${NAME//-/_}=\"${URL}\"" >> "$OUTPUT"
    UPLOADED=$((UPLOADED+1))
  else echo "❌"; fi
  sleep 0.3
done

rm -rf "$IMG_DIR"
echo ""
echo "════════════════════════════════════"
echo "✅ Uploaded: $UPLOADED/6 → Cloudflare"
echo "📋 Saved: $OUTPUT"
echo "════════════════════════════════════"
cat "$OUTPUT"
