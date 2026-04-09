#!/bin/bash
# =============================================================
# gen_showcase_remaining.sh  
# Gen 11 ảnh còn thiếu, poll song song, upload CF
# 4 ảnh đã có: flash-sale, grand-opening, tuyen-dung, product-launch-ig
# =============================================================

API="https://api.skyverses.com/image-jobs"
TOKEN="Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiI2OWM4ZGE4M2M0YjAzYTQyNGYxNjE3YTEiLCJlbWFpbCI6ImR1bG9jMjcwOEBnbWFpbC5jb20iLCJyb2xlIjoidXNlciIsIm5hbWUiOiJMb2MgRFYiLCJpYXQiOjE3NzU3MDg4MjEsImV4cCI6MTc3NjMxMzYyMX0.zI71Th5RO0s0AfJf99CiRvN76fgM1_6sC2hb0dwYCQM"
CF_ACCOUNT="9ab75114b3032bf3e6ff9386815e4554"
CF_TOKEN="Yp_Ark78qShS4E5bc04KIiLLOZjats0kgt5ragdx"
CF_API="https://api.cloudflare.com/client/v4/accounts/${CF_ACCOUNT}/images/v1"
IMG_DIR="public/assets/showcase-banners"
OUTPUT="scripts/socialbanner_showcase_cdn.sh"
mkdir -p "$IMG_DIR"

# --- JOBS TO GENERATE (11 remaining) ---
NAMES=()
WIDTHS=()
HEIGHTS=()
PROMPTS=()

NAMES+=("showcase-webinar-linkedin")
WIDTHS+=(1584); HEIGHTS+=(396)
PROMPTS+=("A professional LinkedIn company banner for an online business webinar event. Clean corporate blue and white. Left: abstract geometric network nodes. Center: professional conference background. Right: speaker podium silhouette. Large sans-serif text layout area center. Date badge in accent color. Bottom with CTA. Corporate executive design. Ultra-wide 1584x396.")

NAMES+=("showcase-new-collection-story")
WIDTHS+=(1080); HEIGHTS+=(1920)
PROMPTS+=("High-fashion Instagram Story for autumn-winter clothing collection. Vertical 1080x1920. Muted dusty rose and dark charcoal palette. Editorial flowing fabric texture background. Top: brand area. Center: large thin serif 'NEW COLLECTION' typography. Bottom: 4 clothing silhouettes grid. Swipe-up CTA. Fashion magazine aesthetic. Portrait vertical.")

NAMES+=("showcase-tet-sale")
WIDTHS+=(1200); HEIGHTS+=(630)
PROMPTS+=("Vietnamese Lunar New Year Tet sale Facebook banner. Vermillion red, gold, deep green palette. Red lanterns and cherry blossoms bokeh background. Dragon illustration coiling around sale graphics. Bold red text area for TET SALE with golden outline. Peach flower branches at corners. Lucky coins scattered. Red ribbon strip with CTA. Traditional festive design. 1200x630.")

NAMES+=("showcase-coffee-promo")
WIDTHS+=(1200); HEIGHTS+=(630)
PROMPTS+=("Warm Vietnamese coffee shop promotion Facebook banner. Coffee brown and cream palette. Blurred warm cafe interior bokeh background. Beautiful latte art coffee cup with heart pattern center, steam wisps rising. Left: BUY 1 GET 1 FREE badge in brushed gold circular stamp. Right: coffee bean pattern and minimal plant. Bottom: store CTA. Warm artisan aesthetic. 1200x630.")

NAMES+=("showcase-gym-fitness")
WIDTHS+=(1200); HEIGHTS+=(675)
PROMPTS+=("High-energy fitness gym challenge X Twitter banner. Dark matte black background with electric lime green and white accents. Left: dramatic gym dumbbells and weight plates with volumetric light cutting through. Right: bold geometric typography area for 30-DAY CHALLENGE. Lightning bolt elements and diagonal speed lines. Muscle fiber texture overlay. Motivational athletic design. 1200x675.")

NAMES+=("showcase-realestate-linkedin")
WIDTHS+=(1200); HEIGHTS+=(630)
PROMPTS+=("Premium Vietnamese real estate luxury condominium Facebook banner. Midnight navy background with gold accent lines. Left 60 percent: photorealistic CGI of modern luxury high-rise tower at dusk with amber window lights and rooftop pool. Right 40 percent: elegant typography layout with amenities icons in minimal icon style. Developer logo area and CTA. Premium brochure quality. 1200x630.")

NAMES+=("showcase-food-delivery")
WIDTHS+=(1080); HEIGHTS+=(1080)
PROMPTS+=("Mouth-watering food delivery app promotion Instagram square. Warm orange and bright yellow gradient background. Center: dramatic overhead shot of Vietnamese food spread - pho bowl, banh mi, spring rolls, rice - professional food photography lighting. Top left: delivery scooter icon badge in circular white bubble. Bottom: promotional offer text area with discount badge. Energetic food brand. 1080x1080.")

NAMES+=("showcase-beauty-brand-story")
WIDTHS+=(1080); HEIGHTS+=(1920)
PROMPTS+=("Luxury beauty brand summer makeup Instagram Story. Soft coral peach to champagne white gradient background. Vertical 1080x1920. Floating beauty product illustrations: lipstick tubes, eyeshadow compact, mascara wand, blush brush. Rose petals and gold leaf accents. Center: thin elegant serif text area for SUMMER GLOW COLLECTION. Color swatches in summer palette. High-end K-beauty aesthetic. Portrait.")

NAMES+=("showcase-tech-gadget")
WIDTHS+=(820); HEIGHTS+=(312)
PROMPTS+=("Premium tech product Facebook cover for wireless earbuds launch. Pure gloss black background. Center: dramatic 3D product render of sleek white wireless earbuds case floating in space with cinematic rim lighting, perfect reflection on black mirror surface. Blue-to-purple light aura behind product. Small spec callout badges: ANC, 30H Battery, Hi-Fi Sound - in glowing pill labels. Apple product launch quality. Wide banner 820x312.")

NAMES+=("showcase-travel-agency")
WIDTHS+=(1200); HEIGHTS+=(630)
PROMPTS+=("Stunning Vietnamese travel agency Da Nang tour Facebook banner. Full-bleed panoramic sunset beach view from above: turquoise ocean, white sand, Dragon Bridge silhouette, purple-orange sunset sky. Warm cinematic color grade. Left overlay: translucent frosted glass card with tour details layout. Top: agency logo badge. Bottom: price tag badge coral red, duration icons, BOOK NOW CTA button. Wanderlust travel editorial. 1200x630.")

NAMES+=("showcase-elearning")
WIDTHS+=(1200); HEIGHTS+=(630)
PROMPTS+=("Professional e-learning Data Science Facebook banner. Deep indigo to electric blue gradient background. Center left: abstract data visualization graphic - flowing line charts, bar graphs, neural network nodes, Python code fragments - in glowing neon blue. Right: glassmorphism frosted glass course info panel with title placeholder, 4-star rating, enrollment badge. ENROLL NOW CTA in amber. Certificate badge icon. Corporate education premium. 1200x630.")

# --- SUBMIT ALL JOBS IN PARALLEL ---
echo "🚀 Submitting ${#NAMES[@]} jobs..."
JOBIDS=()
for i in "${!NAMES[@]}"; do
  NAME="${NAMES[$i]}"
  P="${PROMPTS[$i]}"
  W="${WIDTHS[$i]}"
  H="${HEIGHTS[$i]}"

  R=$(curl -s -X POST "$API" \
    -H "Content-Type: application/json" \
    -H "Authorization: $TOKEN" \
    -d "{\"type\":\"text_to_image\",\"input\":{\"prompt\":\"$P\"},\"config\":{\"width\":$W,\"height\":$H,\"aspectRatio\":\"${W}:${H}\",\"seed\":0,\"style\":\"\"},\"engine\":{\"provider\":\"gommo\",\"model\":\"google_image_gen_4_5\"},\"enginePayload\":{\"prompt\":\"$P\",\"privacy\":\"PRIVATE\",\"projectId\":\"default\"}}")

  JID=$(echo "$R" | python3 -c "import sys,json; print(json.load(sys.stdin)['data']['jobId'])" 2>/dev/null)
  JOBIDS+=("$JID")
  echo "  [$((i+1))/${#NAMES[@]}] $NAME → $JID"
  sleep 0.5
done

# --- POLL ALL IN PARALLEL (background processes) ---
echo ""
echo "⏳ Polling all jobs in parallel..."

poll_job() {
  NAME="$1"; JID="$2"; OUTDIR="$3"
  TOKEN_LOCAL="Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiI2OWM4ZGE4M2M0YjAzYTQyNGYxNjE3YTEiLCJlbWFpbCI6ImR1bG9jMjcwOEBnbWFpbC5jb20iLCJyb2xlIjoidXNlciIsIm5hbWUiOiJMb2MgRFYiLCJpYXQiOjE3NzU3MDg4MjEsImV4cCI6MTc3NjMxMzYyMX0.zI71Th5RO0s0AfJf99CiRvN76fgM1_6sC2hb0dwYCQM"
  API_L="https://api.skyverses.com/image-jobs"
  for attempt in $(seq 1 60); do
    sleep 6
    SR=$(curl -s "$API_L/$JID" -H "Authorization: $TOKEN_LOCAL")
    ST=$(echo "$SR" | python3 -c "import sys,json; print(json.load(sys.stdin)['data']['status'])" 2>/dev/null)
    if [ "$ST" = "done" ]; then
      URL=$(echo "$SR" | python3 -c "import sys,json; print(json.load(sys.stdin)['data']['result']['images'][0])" 2>/dev/null)
      echo "✅ $NAME → $URL"
      curl -sL -o "${OUTDIR}/${NAME}.png" "$URL"
      return 0
    elif [ "$ST" = "failed" ] || [ "$ST" = "error" ]; then
      echo "❌ $NAME FAILED"
      return 1
    fi
  done
  echo "⏰ $NAME TIMEOUT"
  return 1
}

export -f poll_job

# Launch all polls in background
PIDS=()
for i in "${!NAMES[@]}"; do
  poll_job "${NAMES[$i]}" "${JOBIDS[$i]}" "$IMG_DIR" &
  PIDS+=($!)
done

# Wait for all
for PID in "${PIDS[@]}"; do
  wait "$PID"
done

echo ""
echo "📥 Download complete. Files:"
ls -la "$IMG_DIR/"

# --- UPLOAD ALL TO CLOUDFLARE ---
echo ""
echo "☁️  Uploading to Cloudflare..."
cat > "$OUTPUT" << 'HEADER'
#!/bin/bash
# AUTO-GENERATED: Social Banner Showcase CDN URLs
HEADER

UPLOADED=0
for FILE in "$IMG_DIR"/*.png; do
  NAME=$(basename "$FILE" .png)
  echo -n "  ⬆  $NAME ... "

  RESPONSE=$(curl -s -X POST "$CF_API" \
    -H "Authorization: Bearer $CF_TOKEN" \
    -F "file=@${FILE}" \
    -F "requireSignedURLs=false")

  SUCCESS=$(echo "$RESPONSE" | python3 -c "import sys,json; print(json.load(sys.stdin).get('success', False))" 2>/dev/null)
  URL=$(echo "$RESPONSE" | python3 -c "
import sys,json
try:
    d=json.load(sys.stdin)
    v=d.get('result',{}).get('variants',[])
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
echo "═════════════════════════════════════════"
echo "✅ Uploaded: $UPLOADED → Cloudflare CDN"
echo "📋 Saved: $OUTPUT"
echo "═════════════════════════════════════════"
cat "$OUTPUT"
