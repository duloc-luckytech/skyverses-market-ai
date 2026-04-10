#!/bin/bash
# =============================================================
# gen_imagegen_landing.sh
# Gen 13 thumbnail images for image-generator landing page:
#   - 3 ModesSection cards (Single, Batch, Upscale)
#   - 6 UseCasesSection/Features cards
#   - 4 WorkflowSection steps
# Parallel polling, Cloudflare upload
# =============================================================

API="https://api.skyverses.com/image-jobs"
TOKEN="Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiI2OWM4ZGE4M2M0YjAzYTQyNGYxNjE3YTEiLCJlbWFpbCI6ImR1bG9jMjcwOEBnbWFpbC5jb20iLCJyb2xlIjoidXNlciIsIm5hbWUiOiJMb2MgRFYiLCJpYXQiOjE3NzU3MDg4MjEsImV4cCI6MTc3NjMxMzYyMX0.zI71Th5RO0s0AfJf99CiRvN76fgM1_6sC2hb0dwYCQM"
CF_ACCOUNT="9ab75114b3032bf3e6ff9386815e4554"
CF_TOKEN="Yp_Ark78qShS4E5bc04KIiLLOZjats0kgt5ragdx"
CF_API="https://api.cloudflare.com/client/v4/accounts/${CF_ACCOUNT}/images/v1"
IMG_DIR="public/assets/imagegen-landing"
OUTPUT="scripts/imagegen_landing_cdn.sh"
mkdir -p "$IMG_DIR"

NAMES=(); PROMPTS=()

# ── ModesSection — 3 cards (wide 2:1) ───────────────────────

NAMES+=("mode-single")
PROMPTS+=("Abstract digital illustration of AI single image generation concept: one large beautifully rendered portrait photo emerging from a dark screen with glowing UI frame, surrounding controls panel with sliders and resolution settings. Neon rose/fuchsia accent colors on dark background. Minimal clean tech aesthetic. No readable text. 600x300.")

NAMES+=("mode-batch")
PROMPTS+=("Abstract digital illustration of AI batch image generation: multiple image cards arranged in a 3x3 grid, each showing different AI generated scenes (landscape, portrait, abstract) simultaneously appearing with glowing progress indicators. Dark background with electric blue/rose accent lights. Tech dashboard aesthetic. No text. 600x300.")

NAMES+=("mode-upscale")
PROMPTS+=("Abstract digital illustration of AI image upscaling: left side shows blurry low-resolution pixelated image, right side shows crystal clear ultra-HD 4K version of same image with sharp details. Magnifying lens transition effect between them. Purple/indigo glow aesthetic, dark background. Resolution labels (1K → 12K) visible as abstract badges. No readable text. 600x300.")

# ── UseCasesSection — 6 feature cards (16:9) ────────────────

NAMES+=("feat-model-selector")
PROMPTS+=("Abstract visualization of AI model family selection interface: multiple AI model cards floating in dark space, each glowing with different accent colors (rose, blue, purple, amber), showing family names as abstract badges. Central spotlight highlighting selected model. Futuristic model comparison dashboard aesthetic. No readable text. 600x338.")

NAMES+=("feat-config-settings")
PROMPTS+=("Abstract visualization of flexible image configuration: multiple sliders and setting panels showing aspect ratio options (squares, rectangles, portraits), resolution steps, and generation modes as glowing UI elements. Dark interface with neon rose accent. Clean minimal settings dashboard aesthetic. No readable text. 600x338.")

NAMES+=("feat-credits-system")
PROMPTS+=("Abstract illustration of credit payment system: digital credit coins (glowing golden tokens) flowing into an AI generation machine, output showing high quality images. Credit counter display with pricing tiers shown as gentle light bars. Dark fintech aesthetic with gold and rose accents. No readable text. 600x338.")

NAMES+=("feat-auto-refund")
PROMPTS+=("Abstract illustration of automatic credit refund system: circular arrow representing automatic refund process, credit tokens returning to user wallet, error detection shield icon, green checkmark for successful resolution. Dark background with emerald and rose accent glow. Clean tech illustration. No readable text. 600x338.")

NAMES+=("feat-auto-download")
PROMPTS+=("Abstract visualization of auto-download feature: multiple AI-generated images appearing on screen and automatically flowing downward into a device download folder with animated arrows. Progress completion indicators glowing. Dark background with blue accent. Tech download process aesthetic. No readable text. 600x338.")

NAMES+=("feat-production-log")
PROMPTS+=("Abstract visualization of production log and monitoring: terminal-style dark panel showing animated progress steps (Pipeline init, Resource auth, Polling, Complete) as glowing code lines, status indicators in green/amber/red. Matrix-inspired dark aesthetic with rose accent. Professional developer tool look. No readable text. 600x338.")

# ── WorkflowSection — 4 steps (16:9) ────────────────────────

NAMES+=("step-prompt-input")
PROMPTS+=("Abstract illustration of entering an AI image prompt: a glowing text input field with creative description being typed, sparkle/magic wand icons around it, abstract creative ideas floating as gentle symbols (mountain, face, abstract shape). Dark minimal UI. Rose/pink accent lights. Creative AI tool concept. No readable text. 600x338.")

NAMES+=("step-model-choice")
PROMPTS+=("Abstract illustration of choosing an AI model family: comparison grid of model capability cards arranged in clean layout, each with performance indicator bars, speed/quality tradeoff visualization. Tech selection interface with rose highlight on chosen model. Dark minimal aesthetic. No readable text. 600x338.")

NAMES+=("step-config-tune")
PROMPTS+=("Abstract visualization of fine-tuning image generation configuration: dual column of settings showing aspect ratio preview shapes (different rectangles and squares), resolution dial from low to high, and quality mode toggles. All glowing softly in dark interface. Rose/fuchsia accent. No readable text. 600x338.")

NAMES+=("step-generate-manage")
PROMPTS+=("Abstract illustration of AI image generation result grid: dark studio interface showing a 3x2 grid of beautifully generated AI images appearing with fade-in animation, fullscreen preview button glowing on hover, download progress bar completing. Rose/fuchsia accent lights. Professional AI studio monitor view. No readable text. 600x338.")

# ══════════════════════════════════════════════════════════════

echo "🚀 Submitting ${#NAMES[@]} jobs in parallel..."
JOBIDS=()
WIDTHS=()
HEIGHTS=()

for i in "${!NAMES[@]}"; do
  if [[ "${NAMES[$i]}" == mode-* ]]; then
    W=600; H=300
  else
    W=600; H=338
  fi
  WIDTHS+=($W); HEIGHTS+=($H)

  R=$(curl -s -X POST "$API" \
    -H "Content-Type: application/json" \
    -H "Authorization: $TOKEN" \
    -d "{\"type\":\"text_to_image\",\"input\":{\"prompt\":\"${PROMPTS[$i]}\"},\"config\":{\"width\":$W,\"height\":$H,\"aspectRatio\":\"${W}:${H}\",\"seed\":0,\"style\":\"\"},\"engine\":{\"provider\":\"gommo\",\"model\":\"google_image_gen_4_5\"},\"enginePayload\":{\"prompt\":\"${PROMPTS[$i]}\",\"privacy\":\"PRIVATE\",\"projectId\":\"default\"}}")
  JID=$(echo "$R" | python3 -c "import sys,json; print(json.load(sys.stdin)['data']['jobId'])" 2>/dev/null)
  JOBIDS+=("$JID")
  echo "  [$((i+1))/${#NAMES[@]}] ${NAMES[$i]} → $JID"
  sleep 0.4
done

echo ""
echo "⏳ Polling all ${#NAMES[@]} jobs in parallel..."

poll_job() {
  local NAME="$1" JID="$2" OUTDIR="$3"
  local TK="Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiI2OWM4ZGE4M2M0YjAzYTQyNGYxNjE3YTEiLCJlbWFpbCI6ImR1bG9jMjcwOEBnbWFpbC5jb20iLCJyb2xlIjoidXNlciIsIm5hbWUiOiJMb2MgRFYiLCJpYXQiOjE3NzU3MDg4MjEsImV4cCI6MTc3NjMxMzYyMX0.zI71Th5RO0s0AfJf99CiRvN76fgM1_6sC2hb0dwYCQM"
  # 8s × 120 attempts = 16 minutes max
  for attempt in $(seq 1 120); do
    sleep 8
    SR=$(curl -s "https://api.skyverses.com/image-jobs/$JID" -H "Authorization: $TK")
    ST=$(echo "$SR" | python3 -c "import sys,json; print(json.load(sys.stdin)['data']['status'])" 2>/dev/null)
    if [ "$ST" = "done" ]; then
      URL=$(echo "$SR" | python3 -c "import sys,json; print(json.load(sys.stdin)['data']['result']['images'][0])" 2>/dev/null)
      echo "✅ $NAME → $URL"
      curl -sL -o "${OUTDIR}/${NAME}.png" "$URL"
      return 0
    elif [ "$ST" = "failed" ] || [ "$ST" = "error" ]; then
      echo "❌ $NAME → FAILED (status: $ST)"; return 1
    fi
    # Log progress every 6 attempts (~48s)
    [ $((attempt % 6)) -eq 0 ] && echo "  ⏳ $NAME ... ${attempt}/120 (${ST:-waiting})"
  done
  echo "⏰ $NAME → TIMEOUT (16 min exceeded)"; return 1
}
export -f poll_job

PIDS=()
for i in "${!NAMES[@]}"; do
  poll_job "${NAMES[$i]}" "${JOBIDS[$i]}" "$IMG_DIR" &
  PIDS+=($!)
done
for PID in "${PIDS[@]}"; do wait "$PID"; done

echo ""
echo "📥 Downloaded files:"
ls -lah "$IMG_DIR/"

# ── Upload to Cloudflare ─────────────────────────────────────
echo ""
echo "☁️  Uploading to Cloudflare Images..."
cat > "$OUTPUT" << 'HDR'
#!/bin/bash
# AUTO-GENERATED: Image Generator Landing Page — CDN URLs
# Sections: ModesSection, UseCasesSection, WorkflowSection
HDR

UPLOADED=0
for FILE in "$IMG_DIR"/*.png; do
  [ -f "$FILE" ] || continue
  NAME=$(basename "$FILE" .png)
  echo -n "  ⬆  $NAME ... "
  RESP=$(curl -s -X POST "$CF_API" \
    -H "Authorization: Bearer $CF_TOKEN" \
    -F "file=@${FILE}" \
    -F "requireSignedURLs=false")
  SUCCESS=$(echo "$RESP" | python3 -c "import sys,json; print(json.load(sys.stdin).get('success',False))" 2>/dev/null)
  URL=$(echo "$RESP" | python3 -c "
import sys,json
try:
  d=json.load(sys.stdin)
  v=d.get('result',{}).get('variants',[])
  print(next((x for x in v if x.endswith('/public')), v[0] if v else ''))
except: print('')
" 2>/dev/null)
  if [ "$SUCCESS" = "True" ] && [ -n "$URL" ]; then
    echo "✅  $URL"
    echo "CDN_${NAME//-/_}=\"${URL}\"" >> "$OUTPUT"
    UPLOADED=$((UPLOADED+1))
  else
    echo "❌  (upload failed)"
  fi
  sleep 0.3
done

rm -rf "$IMG_DIR"

echo ""
echo "════════════════════════════════════════════"
echo "✅ Uploaded: ${UPLOADED}/${#NAMES[@]} → Cloudflare CDN"
echo "📋 Registry saved: $OUTPUT"
echo "════════════════════════════════════════════"
echo ""
cat "$OUTPUT"
