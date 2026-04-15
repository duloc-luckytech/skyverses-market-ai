#!/bin/bash
# =============================================================
# gen_onboarding_slides.sh
# Gen 3 onboarding modal slide images → Cloudflare CDN
# Style: Avatar / cinematic comic
# Pattern: scripts/gen_aislide_showcase.sh
#
# Output: scripts/onboarding_slides_cdn.sh (CDN URLs)
#         src/constants/onboarding-slides-cdn.ts
#
# Run: bash scripts/gen_onboarding_slides.sh
# =============================================================

API="https://api.skyverses.com/image-jobs"
TOKEN="Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiI2OWM4ZGE4M2M0YjAzYTQyNGYxNjE3YTEiLCJlbWFpbCI6ImR1bG9jMjcwOEBnbWFpbC5jb20iLCJyb2xlIjoidXNlciIsIm5hbWUiOiJMb2MgRFYiLCJpYXQiOjE3NzU3MDg4MjEsImV4cCI6MTc3NjMxMzYyMX0.zI71Th5RO0s0AfJf99CiRvN76fgM1_6sC2hb0dwYCQM"
CF_ACCOUNT="9ab75114b3032bf3e6ff9386815e4554"
CF_TOKEN="Yp_Ark78qShS4E5bc04KIiLLOZjats0kgt5ragdx"
CF_API="https://api.cloudflare.com/client/v4/accounts/${CF_ACCOUNT}/images/v1"

IMG_DIR="public/assets/onboarding-slides"
OUTPUT_FILE="scripts/onboarding_slides_cdn.sh"
mkdir -p "$IMG_DIR"

NAMES=(); PROMPTS=(); WIDTHS=(); HEIGHTS=(); LABELS=(); DESCS=()

# ── Slide 1: Welcome to Skyverses ────────────────────────────────────────────
NAMES+=("onboarding-slide-1-welcome")
WIDTHS+=(800); HEIGHTS+=(500)
LABELS+=("Chào mừng đến Skyverses")
DESCS+=("Nền tảng AI sáng tạo hàng đầu")
PROMPTS+=("Epic cinematic digital art in Avatar movie style: a breathtaking alien bioluminescent world reinterpreted as a futuristic AI creative universe — vast glowing landscape with floating holographic islands connected by streams of light data, towering crystal spires emitting violet and cyan energy, Na'vi-inspired humanoid figures interacting with giant AI interfaces and glowing neural networks in the sky, dramatic volumetric god rays piercing through luminescent clouds, ultra-cinematic widescreen composition, deep teal and electric violet palette, photorealistic James Cameron Avatar aesthetic meets cyberpunk, no text, 800x500.")

# ── Slide 2: 30+ AI Products Showcase ───────────────────────────────────────
NAMES+=("onboarding-slide-2-products")
WIDTHS+=(800); HEIGHTS+=(500)
LABELS+=("30+ Công Cụ AI")
DESCS+=("Video · Ảnh · Voice · Music · Workflow")
PROMPTS+=("Stunning Avatar-style comic cinematic art: a futuristic AI marketplace hub floating in space — multiple holographic portal windows each showing a different AI creation: one portal shows cinematic video generation with glowing film frames, another shows stunning AI-painted images in swirling colors, another shows sound wave visualizations for voice AI, another shows music notes transforming into light, all portals arranged in a dramatic arc around a central glowing Skyverses energy core, deep space background with nebula clouds in purple and gold, Avatar meets Marvel concept art style, hyper-detailed, no text, 800x500.")

# ── Slide 3: Free Bonus Offer ────────────────────────────────────────────────
NAMES+=("onboarding-slide-3-bonus")
WIDTHS+=(800); HEIGHTS+=(500)
LABELS+=("50 Ảnh + 1,000 Credits Miễn Phí")
DESCS+=("Tặng ngay khi đăng ký hôm nay")
PROMPTS+=("Breathtaking gift and abundance cinematic illustration in Avatar comic style: a magical glowing gift chest opening in a bioluminescent forest clearing — thousands of golden light particles and glowing orbs exploding outward representing free credits and images, each orb contains a tiny beautiful AI-generated artwork, the chest is ornate with alien Na'vi carvings and emits violet and amber light rays upward into the starry sky, celebration energy with sparkles and light trails everywhere, dramatic cinematic lighting with deep shadows and brilliant highlights, lush Avatar-style vegetation glowing cyan around the scene, epic sense of wonder and generosity, no text, 800x500.")

# ═══════════════════════════════════════════════════════════════
# SUBMIT ALL JOBS
# ═══════════════════════════════════════════════════════════════

JOBIDS=()
echo "🎨 Onboarding Slides — Tạo ${#NAMES[@]} slide images (Avatar/comic style)..."
echo ""

for i in "${!NAMES[@]}"; do
  NAME="${NAMES[$i]}"
  P="${PROMPTS[$i]}"
  W="${WIDTHS[$i]}"
  H="${HEIGHTS[$i]}"

  R=$(curl -s -X POST "$API" \
    -H "Content-Type: application/json" \
    -H "Authorization: $TOKEN" \
    -d "{\"type\":\"text_to_image\",\"input\":{\"prompt\":\"$P\"},\"config\":{\"width\":$W,\"height\":$H,\"aspectRatio\":\"16:9\",\"seed\":0,\"style\":\"\"},\"engine\":{\"provider\":\"gommo\",\"model\":\"google_image_gen_4_5\"},\"enginePayload\":{\"prompt\":\"$P\",\"privacy\":\"PRIVATE\",\"projectId\":\"default\"}}")

  JID=$(echo "$R" | python3 -c "import sys,json; print(json.load(sys.stdin)['data']['jobId'])" 2>/dev/null)
  JOBIDS+=("$JID")
  echo "  [$((i+1))/${#NAMES[@]}] $NAME (${W}x${H}) → $JID"
  sleep 1
done

# ═══════════════════════════════════════════════════════════════
# PARALLEL POLL & DOWNLOAD
# ═══════════════════════════════════════════════════════════════

echo ""
echo "⏳ Polling ${#NAMES[@]} jobs in parallel..."

poll_job() {
  local NAME="$1" JID="$2" OUTDIR="$3"
  local TK="Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiI2OWM4ZGE4M2M0YjAzYTQyNGYxNjE3YTEiLCJlbWFpbCI6ImR1bG9jMjcwOEBnbWFpbC5jb20iLCJyb2xlIjoidXNlciIsIm5hbWUiOiJMb2MgRFYiLCJpYXQiOjE3NzU3MDg4MjEsImV4cCI6MTc3NjMxMzYyMX0.zI71Th5RO0s0AfJf99CiRvN76fgM1_6sC2hb0dwYCQM"
  [ -z "$JID" ] && echo "❌ $NAME: no job ID" && return 1
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
      echo "❌ $NAME → FAILED"; return 1
    fi
    [ $((attempt % 6)) -eq 0 ] && echo "  ⏳ $NAME ... ${attempt}/120 (${ST:-waiting})"
  done
  echo "⏰ $NAME → TIMEOUT"; return 1
}
export -f poll_job

PIDS=()
for i in "${!NAMES[@]}"; do
  poll_job "${NAMES[$i]}" "${JOBIDS[$i]}" "$IMG_DIR" &
  PIDS+=($!)
done
for PID in "${PIDS[@]}"; do wait "$PID"; done

echo ""
echo "📥 Downloaded:"
ls -lah "$IMG_DIR/"

# ═══════════════════════════════════════════════════════════════
# UPLOAD → CLOUDFLARE CDN
# ═══════════════════════════════════════════════════════════════

echo ""
echo "☁️  Uploading to Cloudflare Images..."

cat > "$OUTPUT_FILE" << 'HDR'
#!/bin/bash
# AUTO-GENERATED: Onboarding Slides CDN URLs
# Style: Avatar / cinematic comic
# Usage in React → GlobalEventBonusModal.tsx
HDR

TS_OUTPUT="src/constants/onboarding-slides-cdn.ts"
mkdir -p "$(dirname "$TS_OUTPUT")" 2>/dev/null || true
cat > "$TS_OUTPUT" << 'TS_HDR'
// AUTO-GENERATED: Onboarding Slides CDN URLs
// Style: Avatar / cinematic comic
// Re-run: bash scripts/gen_onboarding_slides.sh to regenerate

export interface OnboardingSlide {
  id: string;
  cdnUrl: string;
  label: string;
  desc: string;
}

export const ONBOARDING_SLIDES: OnboardingSlide[] = [
TS_HDR

UPLOADED=0

for i in "${!NAMES[@]}"; do
  NAME="${NAMES[$i]}"
  FILE="${IMG_DIR}/${NAME}.png"
  LABEL="${LABELS[$i]}"
  DESC="${DESCS[$i]}"
  [ ! -f "$FILE" ] && echo "⚠️  Skip $NAME (not downloaded)" && continue

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
    echo "CDN_${NAME//-/_}=\"${URL}\"" >> "$OUTPUT_FILE"
    cat >> "$TS_OUTPUT" << TSENTRY
  { id: '${NAME}', cdnUrl: '${URL}', label: '${LABEL}', desc: '${DESC}' },
TSENTRY
    UPLOADED=$((UPLOADED+1))
  else
    echo "❌  (upload failed)"
  fi
  sleep 0.3
done

echo "];" >> "$TS_OUTPUT"

rm -rf "$IMG_DIR"

echo ""
echo "════════════════════════════════════════════════════════"
echo "✅ Uploaded: ${UPLOADED}/${#NAMES[@]} → Cloudflare CDN"
echo "📋 Bash registry:  $OUTPUT_FILE"
echo "📘 TS constants:   $TS_OUTPUT"
echo "════════════════════════════════════════════════════════"
echo ""
echo "👉 GlobalEventBonusModal.tsx sẽ tự dùng real images từ:"
echo "   import { ONBOARDING_SLIDES } from '@/constants/onboarding-slides-cdn';"
echo ""
cat "$OUTPUT_FILE"
