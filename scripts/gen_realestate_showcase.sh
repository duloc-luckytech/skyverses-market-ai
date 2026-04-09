#!/bin/bash
# =============================================================
# gen_realestate_showcase.sh
# Gen 9 ảnh BĐS showcase + 1 ảnh thiếu (social banner giáo dục)
# Parallel polling
# =============================================================

API="https://api.skyverses.com/image-jobs"
TOKEN="Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiI2OWM4ZGE4M2M0YjAzYTQyNGYxNjE3YTEiLCJlbWFpbCI6ImR1bG9jMjcwOEBnbWFpbC5jb20iLCJyb2xlIjoidXNlciIsIm5hbWUiOiJMb2MgRFYiLCJpYXQiOjE3NzU3MDg4MjEsImV4cCI6MTc3NjMxMzYyMX0.zI71Th5RO0s0AfJf99CiRvN76fgM1_6sC2hb0dwYCQM"
CF_ACCOUNT="9ab75114b3032bf3e6ff9386815e4554"
CF_TOKEN="Yp_Ark78qShS4E5bc04KIiLLOZjats0kgt5ragdx"
CF_API="https://api.cloudflare.com/client/v4/accounts/${CF_ACCOUNT}/images/v1"
IMG_DIR="public/assets/realestate-showcase"
OUTPUT="scripts/realestate_showcase_cdn.sh"
mkdir -p "$IMG_DIR"

NAMES=(); WIDTHS=(); HEIGHTS=(); PROMPTS=()

# ── 1. Villa Exterior Render – 16:9 ─────────────────────────
NAMES+=("re-villa-exterior")
WIDTHS+=(1200); HEIGHTS+=(675)
PROMPTS+=("Photorealistic exterior CGI render of a luxury Vietnamese villa at golden hour. White modern colonial architecture with dark wood accents and large glass windows. Tropical landscaping: palm trees, manicured hedges, bougainvillea flowers. Swimming pool visible at side with blue water reflection. Driveway with polished stone pavers. Dramatic sky with warm orange-purple sunset clouds. Cinematic architectural photography quality. No people visible. 1200x675.")

# ── 2. Luxury Apartment Interior Staging ────────────────────
NAMES+=("re-apartment-staging")
WIDTHS+=(1200); HEIGHTS+=(675)
PROMPTS+=("Photorealistic interior staging render of a luxury Vietnamese high-rise apartment living room. Floor-to-ceiling glass windows with panoramic city view of Ho Chi Minh City skyline at dusk. Contemporary furniture: cream linen sofa, marble coffee table, designer floor lamp. Herringbone oak parquet flooring. Accent wall in warm terracotta. Fresh flowers in ceramic vase. Professional architectural interior photography quality. Soft evening ambient lighting. No people. 1200x675.")

# ── 3. Shophouse Facade Render ───────────────────────────────
NAMES+=("re-shophouse-facade")
WIDTHS+=(1200); HEIGHTS+=(675)
PROMPTS+=("Photorealistic CGI render of a modern Vietnamese shophouse exterior in an urban setting. 5-floor shophouse with ground floor retail glass facade showing cozy cafe interior. Upper floors with balconies and subtropical plants. Facade combines exposed brick, painted concrete and dark steel accents. Street-level perspective with sidewalk, parked scooters, street trees. Late afternoon warm light casting long shadows. Premium architectural visualization. No people. 1200x675.")

# ── 4. Office Space Render ───────────────────────────────────
NAMES+=("re-office-space")
WIDTHS+=(1200); HEIGHTS+=(675)
PROMPTS+=("Photorealistic CGI render of a premium co-working office interior in Ho Chi Minh City. Open-plan layout with pod workstations, glass meeting rooms, exposed concrete ceiling with industrial pendant lights. Biophilic design: vertical green wall panel, potted plants throughout. City skyline view through full-height windows. Reception desk in white marble. Brand signage area on wall. Corporate yet creative atmosphere. Professional architectural quality. No people. 1200x675.")

# ── 5. Penthouse Rooftop Pool ────────────────────────────────
NAMES+=("re-penthouse-pool")
WIDTHS+=(1200); HEIGHTS+=(675)
PROMPTS+=("Photorealistic CGI render of a penthouse rooftop infinity pool in a luxury Ho Chi Minh City high-rise tower. Infinity pool edge merging with city skyline at blue hour twilight. Pool water in vivid aquamarine. Surrounding: teak loungers, parasols, fire pit, outdoor bar counter. Glass balustrade. Adjacent indoor-outdoor living lounge with retractable glass walls visible. City lights and river view in background. Dramatic architectural photography quality. No people. 1200x675.")

# ── 6. Before/After Interior Renovation ─────────────────────
NAMES+=("re-before-after-staging")
WIDTHS+=(1200); HEIGHTS+=(675)
PROMPTS+=("Split-screen photorealistic visualization showing interior staging transformation: left half shows empty unfurnished apartment bedroom with bare concrete walls, plain flooring, harsh lighting — realistic but uninspiring. Right half shows same room AI-staged with premium furniture: king bed with linen headboard, nightstands with warm lamp glow, artwork on wall, area rug, plants — same camera angle, flooded with warm beautiful light. Clean dividing line in center. 1200x675.")

# ── 7. Project Marketing Banner ─────────────────────────────
NAMES+=("re-project-marketing")
WIDTHS+=(1200); HEIGHTS+=(630)
PROMPTS+=("Premium Vietnamese real estate developer project marketing banner. Large luxury residential tower complex CGI master plan bird's eye view: multiple high-rise towers surrounded by parks, lake, retail podium, amenities pool complex. Lush tropical landscaping. Golden hour lighting. Bottom overlay: frosted glass panel with project name placeholder, key stats icons (floors, units, area). Skyline backdrop of city. Developer logo area. Premium real estate brochure quality. 1200x630.")

# ── 8. Virtual Tour Preview ──────────────────────────────────
NAMES+=("re-virtual-tour")
WIDTHS+=(1200); HEIGHTS+=(675)
PROMPTS+=("Photorealistic CGI render of a modern Vietnamese luxury condo bedroom with en-suite bathroom visible through open door. Master bedroom with platform bed, custom headboard, bedside tables with warm LED lamps. Walk-in wardrobe with open mirrored doors showing clothes inside. En-suite with freestanding bathtub visible. Floor-to-ceiling window with garden view. Warm cream and wood color palette. Elegant hotel-like atmosphere. Top interior design quality. No people. 1200x675.")

# ── 9. Aerial Bird Eye View ──────────────────────────────────
NAMES+=("re-aerial-project")
WIDTHS+=(1200); HEIGHTS+=(675)
PROMPTS+=("Photorealistic aerial drone view CGI of a luxury gated residential community in Vietnam. Bird's eye view of a master-planned estate: cluster of modern white villas with private pools, tree-lined internal roads, central clubhouse with large pool and tennis courts, water feature lake at center. Surrounded by lush tropical forest. Golden hour lighting casting long warm shadows. Premium real estate development visualization quality. 1200x675.")

# ── 10. Missing social banner (giáo dục) ────────────────────
NAMES+=("showcase-giao-duc-khoa-hoc")
WIDTHS+=(600); HEIGHTS+=(400)
PROMPTS+=("Professional education and online course Facebook banner mockup: graduation cap and diploma illustration, clean blue and white gradient, certification badge graphic, webinar announcement layout. Academic and trustworthy design. Bookshelf and laptop background blur. Premium e-learning aesthetic. No readable text. 600x400.")

# ── SUBMIT ALL ──────────────────────────────────────────────
echo "🚀 Submitting ${#NAMES[@]} jobs..."
JOBIDS=()
for i in "${!NAMES[@]}"; do
  R=$(curl -s -X POST "$API" \
    -H "Content-Type: application/json" \
    -H "Authorization: $TOKEN" \
    -d "{\"type\":\"text_to_image\",\"input\":{\"prompt\":\"${PROMPTS[$i]}\"},\"config\":{\"width\":${WIDTHS[$i]},\"height\":${HEIGHTS[$i]},\"aspectRatio\":\"${WIDTHS[$i]}:${HEIGHTS[$i]}\",\"seed\":0,\"style\":\"\"},\"engine\":{\"provider\":\"gommo\",\"model\":\"google_image_gen_4_5\"},\"enginePayload\":{\"prompt\":\"${PROMPTS[$i]}\",\"privacy\":\"PRIVATE\",\"projectId\":\"default\"}}")
  JID=$(echo "$R" | python3 -c "import sys,json; print(json.load(sys.stdin)['data']['jobId'])" 2>/dev/null)
  JOBIDS+=("$JID")
  echo "  [$((i+1))/${#NAMES[@]}] ${NAMES[$i]} → $JID"
  sleep 0.5
done

# ── PARALLEL POLL ───────────────────────────────────────────
echo ""
echo "⏳ Polling all in parallel..."

poll_job() {
  local NAME="$1" JID="$2" OUTDIR="$3"
  local TK="Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiI2OWM4ZGE4M2M0YjAzYTQyNGYxNjE3YTEiLCJlbWFpbCI6ImR1bG9jMjcwOEBnbWFpbC5jb20iLCJyb2xlIjoidXNlciIsIm5hbWUiOiJMb2MgRFYiLCJpYXQiOjE3NzU3MDg4MjEsImV4cCI6MTc3NjMxMzYyMX0.zI71Th5RO0s0AfJf99CiRvN76fgM1_6sC2hb0dwYCQM"
  local API_L="https://api.skyverses.com/image-jobs"
  for attempt in $(seq 1 60); do
    sleep 6
    SR=$(curl -s "$API_L/$JID" -H "Authorization: $TK")
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
echo "📥 Files downloaded:"
ls -la "$IMG_DIR/"

# ── UPLOAD → CF ─────────────────────────────────────────────
echo ""
echo "☁️  Uploading to Cloudflare..."
cat > "$OUTPUT" << 'HDR'
#!/bin/bash
# AUTO-GENERATED: Real Estate Showcase + missing social banner CDN URLs
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
  else
    echo "❌"
  fi
  sleep 0.3
done

rm -rf "$IMG_DIR"
echo ""
echo "════════════════════════════════════════"
echo "✅ Uploaded: $UPLOADED/${#NAMES[@]}"
echo "📋 Saved: $OUTPUT"
echo "════════════════════════════════════════"
cat "$OUTPUT"
