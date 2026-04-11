#!/bin/bash
# =============================================================
# gen_aislide_showcase.sh
# Gen 12 AI Slide Creator showcase examples → Cloudflare CDN
# Pattern: scripts/gen_socialbanner_showcase.sh (socialbanner_showcase_cdn.sh output)
#
# Output: scripts/aislide_showcase_cdn.sh (CDN URLs)
# Usage in React: ShowcaseSection.tsx → replace CSS gradient cards with real <img>
#
# Run: bash scripts/gen_aislide_showcase.sh
# =============================================================

API="https://api.skyverses.com/image-jobs"
TOKEN="Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiI2OWM4ZGE4M2M0YjAzYTQyNGYxNjE3YTEiLCJlbWFpbCI6ImR1bG9jMjcwOEBnbWFpbC5jb20iLCJyb2xlIjoidXNlciIsIm5hbWUiOiJMb2MgRFYiLCJpYXQiOjE3NzU3MDg4MjEsImV4cCI6MTc3NjMxMzYyMX0.zI71Th5RO0s0AfJf99CiRvN76fgM1_6sC2hb0dwYCQM"            # CMS Admin > API Clients tab
CF_ACCOUNT="9ab75114b3032bf3e6ff9386815e4554"
CF_TOKEN="Yp_Ark78qShS4E5bc04KIiLLOZjats0kgt5ragdx"
CF_API="https://api.cloudflare.com/client/v4/accounts/${CF_ACCOUNT}/images/v1"

IMG_DIR="public/assets/aislide-showcase"
OUTPUT_FILE="scripts/aislide_showcase_cdn.sh"
mkdir -p "$IMG_DIR"

# Format arrays: NAMES / PROMPTS / WIDTHS / HEIGHTS / LABELS / DESCS
# Pattern: socialbanner_showcase_cdn.sh — each var = CDN_showcase_<name>
NAMES=(); PROMPTS=(); WIDTHS=(); HEIGHTS=(); LABELS=(); DESCS=()

# ── 1. Startup Pitch Deck ────────────────────────────────────────────────────
NAMES+=("showcase-startup-pitch")
WIDTHS+=(1200); HEIGHTS+=(675)
LABELS+=("Startup Pitch Deck")
DESCS+=("Series A fintech với AI-generated visuals")
PROMPTS+=("Professional startup pitch deck slide: dark navy premium presentation slide with venture capital aesthetic — abstract traction growth curve rendered as glowing blue neon chart, minimalist product UI mockup floating beside metrics, VC-ready clean typography spacing. Deep indigo and electric blue palette. No readable text. 1200x675.")

# ── 2. Marketing Campaign ───────────────────────────────────────────────────
NAMES+=("showcase-marketing-campaign")
WIDTHS+=(1200); HEIGHTS+=(675)
LABELS+=("Chiến Lược Marketing Q4")
DESCS+=("Campaign presentation với AI visuals")
PROMPTS+=("Bold marketing strategy presentation slide: vibrant slide with a dynamic product hero visual center-stage — abstract human silhouette surrounded by social media engagement particle effects, campaign KPI rings showing growth percentages as glowing donuts, hot magenta and sunset orange brand palette. Premium advertising agency quality. No readable text. 1200x675.")

# ── 3. Machine Learning Lecture ────────────────────────────────────────────
NAMES+=("showcase-ml-education")
WIDTHS+=(1200); HEIGHTS+=(675)
LABELS+=("Machine Learning 101")
DESCS+=("Course slide với AI-generated diagrams")
PROMPTS+=("Educational technology lecture slide: clean academic slide featuring an elegant neural network diagram visualization — interconnected nodes glowing in blue-teal gradient, data flowing through layers as light pulses, training progress curve above, minimal clean white space design with academic professionalism. STEM education aesthetic. No readable text. 1200x675.")

# ── 4. Corporate Quarterly Report ──────────────────────────────────────────
NAMES+=("showcase-quarterly-report")
WIDTHS+=(1200); HEIGHTS+=(675)
LABELS+=("Báo Cáo Q3 2025")
DESCS+=("Executive report với AI-generated charts")
PROMPTS+=("Executive corporate quarterly report slide: sophisticated dark slate presentation with premium data visualization — glowing amber revenue bar charts ascending upward, golden pie chart segment for market share, executive summary layout with generous white space. Warm gold and charcoal professional palette. Board meeting quality. No readable text. 1200x675.")

# ── 5. Product Launch ───────────────────────────────────────────────────────
NAMES+=("showcase-product-launch")
WIDTHS+=(1200); HEIGHTS+=(675)
LABELS+=("Ra Mắt Sản Phẩm SaaS")
DESCS+=("Product launch deck với AI visuals")
PROMPTS+=("SaaS product launch presentation slide: sleek dark product reveal slide — 3D isometric product interface mockup floating dramatically with soft shadows, feature highlight cards arranged in orbit around product, launch countdown energy effect, rose and violet premium palette. Modern tech product announcement aesthetic. No readable text. 1200x675.")

# ── 6. Medical Conference ───────────────────────────────────────────────────
NAMES+=("showcase-medical-conf")
WIDTHS+=(1200); HEIGHTS+=(675)
LABELS+=("Medical Conference 2025")
DESCS+=("Healthcare presentation với AI images")
PROMPTS+=("Medical conference academic presentation slide: clean premium healthcare slide — anatomical illustration rendered as blue holographic overlay on white medical diagram, clinical data scatter plot with teal accent, research summary layout with proper academic spacing. Teal and white authoritative medical aesthetic. No readable text. 1200x675.")

# ── 7. Real Estate Investment ──────────────────────────────────────────────
NAMES+=("showcase-realestate")
WIDTHS+=(1200); HEIGHTS+=(675)
LABELS+=("Real Estate Investment")
DESCS+=("Property deck với AI-generated renders")
PROMPTS+=("Luxury real estate investment presentation slide: premium property presentation with aerial view of modern urban development rendered in twilight golden hour light, investment return metrics floating as holographic overlays, floor plan schematic in corner, warm amber and premium dark background. High-end real estate developer aesthetic. No readable text. 1200x675.")

# ── 8. E-commerce Strategy ────────────────────────────────────────────────
NAMES+=("showcase-ecommerce")
WIDTHS+=(1200); HEIGHTS+=(675)
LABELS+=("Chiến Lược E-commerce")
DESCS+=("Online retail deck với AI visuals")
PROMPTS+=("E-commerce growth strategy presentation slide: vibrant retail-tech slide with stylized product grid showing diverse items with glow highlights, conversion funnel visualization in orange gradient, platform growth metrics displayed as dynamic icon badges. Energetic orange and white commerce aesthetic. Modern shopping platform style. No readable text. 1200x675.")

# ── 9. HR Recruitment ─────────────────────────────────────────────────────
NAMES+=("showcase-hr-recruitment")
WIDTHS+=(1200); HEIGHTS+=(675)
LABELS+=("Tuyển Dụng & Nhân Sự")
DESCS+=("HR presentation với modern design")
PROMPTS+=("Corporate HR recruitment presentation slide: modern talent acquisition slide with abstract interconnected people network visualization — diverse professional silhouettes connected by blue relationship lines, skills radar chart in corner, culture values icons in warm amber. Professional yet approachable HR aesthetic. No readable text. 1200x675.")

# ── 10. Fintech Demo Day ──────────────────────────────────────────────────
NAMES+=("showcase-fintech-demo")
WIDTHS+=(1200); HEIGHTS+=(675)
LABELS+=("Fintech Demo Day")
DESCS+=("Investor demo deck với AI backgrounds")
PROMPTS+=("Fintech startup demo day presentation slide: sophisticated financial technology slide — abstract blockchain network nodes connected by electric blue transaction lines over dark background, mobile payment interface mockup floating with dramatic shadows, cryptocurrency market chart in teal. Premium fintech venture aesthetic. No readable text. 1200x675.")

# ── 11. Travel & Tourism ──────────────────────────────────────────────────
NAMES+=("showcase-travel")
WIDTHS+=(1200); HEIGHTS+=(675)
LABELS+=("Du Lịch & Trải Nghiệm")
DESCS+=("Travel pitch với stunning AI landscapes")
PROMPTS+=("Travel and tourism business presentation slide: stunning destination marketing slide — panoramic aerial view of dramatic Vietnamese coastal landscape at golden hour as full-bleed background, travel package highlights overlaid as elegant floating cards with soft blur, adventure metric badges. Warm amber and deep teal wanderlust palette. No readable text. 1200x675.")

# ── 12. Tech Innovation Summit ────────────────────────────────────────────
NAMES+=("showcase-tech-summit")
WIDTHS+=(1200); HEIGHTS+=(675)
LABELS+=("Tech Innovation Summit")
DESCS+=("Conference deck với AI-generated concept art")
PROMPTS+=("Technology innovation summit keynote slide: dramatic conference keynote visual — abstract AI and robotics concept art showing humanoid figure interacting with floating data streams and holographic interfaces, electric blue and deep violet color palette, cinematic lighting. Premium tech conference aesthetic. No readable text. 1200x675.")

# ═══════════════════════════════════════════════════════════════
# SUBMIT ALL JOBS
# ═══════════════════════════════════════════════════════════════

JOBIDS=()
echo "🎨 AI Slide Creator Showcase — Tạo ${#NAMES[@]} ví dụ..."
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
# UPLOAD → CLOUDFLARE CDN (với metadata — pattern socialbanner_showcase_cdn.sh)
# ═══════════════════════════════════════════════════════════════

echo ""
echo "☁️  Uploading to Cloudflare Images..."

cat > "$OUTPUT_FILE" << 'HDR'
#!/bin/bash
# AUTO-GENERATED: AI Slide Creator Showcase CDN URLs
# Pattern: socialbanner_showcase_cdn.sh
# Usage in React → ShowcaseSection.tsx:
#   import { AISLIDE_SHOWCASE } from '@/constants/aislide-images';
#   <img src={item.cdnUrl} ... />
HDR

# Also generate a JS/TS constants file for direct import
TS_OUTPUT="src/constants/aislide-showcase-cdn.ts"
mkdir -p "$(dirname "$TS_OUTPUT")" 2>/dev/null || true
cat > "$TS_OUTPUT" << 'TS_HDR'
// AUTO-GENERATED: AI Slide Creator Showcase CDN URLs
// Source: scripts/aislide_showcase_cdn.sh
// Re-run: bash scripts/gen_aislide_showcase.sh to regenerate

export const AISLIDE_SHOWCASE: Array<{
  id: string;
  cdnUrl: string;
  label: string;
  desc: string;
}> = [
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
    # bash registry (pattern: socialbanner_showcase_cdn.sh)
    echo "CDN_${NAME//-/_}=\"${URL}\"" >> "$OUTPUT_FILE"
    # TypeScript constants
    cat >> "$TS_OUTPUT" << TSENTRY
  { id: '${NAME}', cdnUrl: '${URL}', label: '${LABEL}', desc: '${DESC}' },
TSENTRY
    UPLOADED=$((UPLOADED+1))
  else
    echo "❌  (upload failed)"
  fi
  sleep 0.3
done

# Close TS array
echo "];" >> "$TS_OUTPUT"

rm -rf "$IMG_DIR"

echo ""
echo "════════════════════════════════════════════════════════"
echo "✅ Uploaded: ${UPLOADED}/${#NAMES[@]} → Cloudflare CDN"
echo "📋 Bash registry:  $OUTPUT_FILE"
echo "📘 TS constants:   $TS_OUTPUT"
echo "════════════════════════════════════════════════════════"
echo ""
echo "👉 ShowcaseSection.tsx sẽ tự dùng real images từ:"
echo "   import { AISLIDE_SHOWCASE } from '@/constants/aislide-showcase-cdn';"
echo ""
cat "$OUTPUT_FILE"
