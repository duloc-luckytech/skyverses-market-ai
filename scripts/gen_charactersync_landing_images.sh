#!/bin/bash
# =============================================================
# gen_charactersync_landing_images.sh
# Tạo + Upload → Cloudflare CDN toàn bộ hình landing Character Sync AI
# Gen 20 images: 1 hero, 1 problem, 6 features, 4 workflow, 6 use cases, 2 testimonials
# Run: bash scripts/gen_charactersync_landing_images.sh
# =============================================================

API="https://api.skyverses.com/image-jobs"
TOKEN="Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiI2OWM4ZGE4M2M0YjAzYTQyNGYxNjE3YTEiLCJlbWFpbCI6ImR1bG9jMjcwOEBnbWFpbC5jb20iLCJyb2xlIjoidXNlciIsIm5hbWUiOiJMb2MgRFYiLCJpYXQiOjE3NzU3MDg4MjEsImV4cCI6MTc3NjMxMzYyMX0.zI71Th5RO0s0AfJf99CiRvN76fgM1_6sC2hb0dwYCQM"
CF_ACCOUNT="9ab75114b3032bf3e6ff9386815e4554"
CF_TOKEN="Yp_Ark78qShS4E5bc04KIiLLOZjats0kgt5ragdx"
CF_API="https://api.cloudflare.com/client/v4/accounts/${CF_ACCOUNT}/images/v1"

IMG_DIR="public/assets/charactersync-landing"
OUTPUT_FILE="scripts/charactersync_cdn_urls.sh"
mkdir -p "$IMG_DIR"

NAMES=(); PROMPTS=()

# ═══════════════════════════════════════════════════════════════
# SECTION: HERO — 1 image (1200x630, 16:9)
# Nền video/hero lớn: AI character identity showcase
# ═══════════════════════════════════════════════════════════════

NAMES+=("hero-main")
PROMPTS+=("Cinematic AI character identity system visualization: a central holographic character profile panel in dark purple-violet space, showing a consistent anime-style female character face rendered from 4 different angles — front, side, three-quarter, back — all perfectly identical in features, hair, and expression. Glowing purple-violet DNA helix strands connecting the four portraits to a central identity anchor node. Particle constellation effects in deep space background. Premium purple and violet gradient atmosphere with fuchsia accent particles. Advanced AI identity technology aesthetic. Ultra-wide 1200x630. No readable text.")

# ═══════════════════════════════════════════════════════════════
# SECTION: PROBLEM — 1 image (900x500, 16:9)
# Minh hoạ broken identity: characters inconsistent
# ═══════════════════════════════════════════════════════════════

NAMES+=("problem-broken-identity")
PROMPTS+=("Visual chaos of AI character inconsistency: a 3x2 grid of portrait cards on dark surface, each showing the 'same' character but with completely different faces, hairstyles, and features — some blonde, some dark hair, different nose shapes, completely different eye styles. Red error glitch overlays on the images, digital artifacts, scan-line distortion effects. Warning symbols and X marks in red overlaid. The horror of AI character drift visualized. Dark moody background, red and gray color palette. No readable text. 900x500.")

# ═══════════════════════════════════════════════════════════════
# SECTION: FEATURES — 6 images (600x338, 16:9)
# ═══════════════════════════════════════════════════════════════

NAMES+=("feat-dna-anchoring")
PROMPTS+=("Abstract AI DNA visual identity anchoring: glowing purple double helix DNA strand transforming into facial recognition biometric patterns — a stylized portrait face materializing from DNA code sequences, with anchoring lock icons securing identity nodes at key feature points. Dark background with violet and indigo gradient energy. Premium biometric AI tech aesthetic. No readable text. 600x338.")

NAMES+=("feat-semantic-binding")
PROMPTS+=("Abstract semantic AI binding visualization: floating name tag 'Luna' in elegant typography connected by glowing semantic neural pathways to a holographic character silhouette, with screenplay text fragments and directorial cue words materializing around her. Purple blue gradient energy flows. Director's clapboard shadow in background. Premium AI film tech aesthetic. No readable text. 600x338.")

NAMES+=("feat-context-memory")
PROMPTS+=("Abstract AI long-term memory visualization: a glowing purple memory core sphere surrounded by orbiting character trait data points — personality tags, relationship nodes, visual characteristic chips — all connected by neural network lines forming a persistent memory constellation. Timeline scroll effect suggesting cross-session memory. Deep dark background with violet accent gradients. No readable text. 600x338.")

NAMES+=("feat-zero-drift")
PROMPTS+=("Abstract zero-drift identity stability visualization: identical character face shown at 6 different camera angles and poses — looking left, looking right, three-quarter, tilted, smiling, serious — each face perfectly pixel-matched with green stability checkmarks. A horizontal stability flatline graph below showing zero deviation. Violet purple premium aesthetic, dark background. Identity lock shield icon glowing. No readable text. 600x338.")

NAMES+=("feat-multi-actor")
PROMPTS+=("Abstract multi-character scene management visualization: three distinct character silhouettes standing in a cinematic dark scene — a warrior, a scholar, and a merchant — each surrounded by their own colored identity aura (purple, blue, teal), with labeled name tags floating above each, no visual blending between them. Premium dark cinematic background. AI director overhead view. No readable text. 600x338.")

NAMES+=("feat-shared-library")
PROMPTS+=("Abstract character library database visualization: premium dark UI panel showing a grid of glowing character portrait cards — diverse faces, fantasy, sci-fi, modern characters — organized in folders, with share/reuse arrows connecting cards to multiple project folder icons. Cloud sync indicator. Purple violet accent colors on dark background. Organized character registry UI aesthetic. No readable text. 600x338.")

# ═══════════════════════════════════════════════════════════════
# SECTION: WORKFLOW — 4 images (600x338, 16:9)
# ═══════════════════════════════════════════════════════════════

NAMES+=("step-upload")
PROMPTS+=("Abstract character DNA upload visualization: multiple portrait photos floating upward toward a glowing central upload portal, each photo wrapping into a DNA strand as it enters. Purple violet energy beam receiving the images. Identity profile panel assembling on the right. Dark premium background with violet gradient. Upload progress particles. No readable text. 600x338.")

NAMES+=("step-naming")
PROMPTS+=("Abstract character identity registration visualization: holographic character profile form filling in — name field, role descriptor, personality tags materializing as glowing text — all connecting to a central identity avatar icon. Purple glowing confirmation checkmark. Elegant dark UI aesthetic with violet accents. Character profile card forming. No readable text. 600x338.")

NAMES+=("step-scripting")
PROMPTS+=("Abstract AI screenplay with character reference visualization: screenplay text flowing onto a dark screen, with 'Luna' name highlighted in purple glow as AI automatically overlays the matching character portrait beside it. Script-to-visual connection neural beam. Premium dark scriptwriting UI. Violet and white accent on dark background. No readable text. 600x338.")

NAMES+=("step-output")
PROMPTS+=("Abstract AI image and video synthesis output visualization: completed character render panels appearing — portrait image, scene with character, comic panel strip, video thumbnail — all showing a consistent purple-aura character face. Quality check particles, completion sparkle effects. Export icons glowing. Premium dark tech aesthetic. No readable text. 600x338.")

# ═══════════════════════════════════════════════════════════════
# SECTION: USE CASES — 6 images (600x400, 3:2)
# ═══════════════════════════════════════════════════════════════

NAMES+=("usecase-manga-webtoon")
PROMPTS+=("AI manga webtoon panel spread: beautiful webtoon pages showing a consistent anime female protagonist character across multiple panels — dramatic action panel, emotional close-up, comedic moment, landscape scene. Clean manga line art with vibrant color fill. Korean webtoon aesthetic. Purple violet brand elements framing the mockup. No readable text. 600x400.")

NAMES+=("usecase-short-film")
PROMPTS+=("AI short film production storyboard: cinematic storyboard showing consistent AI-generated actor character across multiple film scenes — establishing shot walking city street, dramatic close-up in rain, dialogue scene in café, triumphant final scene. Consistent face across all panels. Film grain texture, warm color grading. Professional indie film aesthetic. No readable text. 600x400.")

NAMES+=("usecase-content-series")
PROMPTS+=("Social media content creator persona series: a grid of 6 Instagram-style post mockups all featuring the same beautiful AI virtual influencer character — morning routine post, product review, travel photo, foodie shot, motivational quote post, evening look. Consistent face and branding across all. Pastel pink and violet aesthetic. Modern creator brand. No readable text. 600x400.")

NAMES+=("usecase-game-npc")
PROMPTS+=("Video game NPC character consistency showcase: RPG game interface showing the same merchant NPC character in multiple game environment scenes — town market, indoor shop, night event, festival scene. Character maintains exact same appearance across environments. Fantasy RPG art style, purple violet UI elements. Premium game quality. No readable text. 600x400.")

NAMES+=("usecase-ai-anchor")
PROMPTS+=("AI virtual news anchor broadcast visualization: sleek news studio set mockup on screen showing a professional AI virtual female anchor character presenting news — consistent professional appearance across multiple broadcast scenes: breaking news, interview, weather segment. Clean broadcast TV aesthetic, blue and white professional color palette. No readable text. 600x400.")

NAMES+=("usecase-virtual-model")
PROMPTS+=("AI virtual fashion model lookbook showcase: premium fashion editorial layout showing the same stunning AI virtual model character wearing different outfits across 4 panels — summer collection, evening gown, streetwear, formal suit. Exact same face, different styling. High fashion photography aesthetic. Clean white studio backgrounds. Luxury brand vibes. No readable text. 600x400.")

# ═══════════════════════════════════════════════════════════════
# SECTION: TESTIMONIALS — 2 avatar images (200x200, 1:1)
# ═══════════════════════════════════════════════════════════════

NAMES+=("testimonial-avatar-1")
PROMPTS+=("Professional headshot portrait: young Vietnamese male content creator, warm friendly smile, casual creative professional appearance, wearing modern stylish shirt, natural studio lighting with soft bokeh background. Clean professional avatar photo style. Authentic and approachable. 200x200.")

NAMES+=("testimonial-avatar-2")
PROMPTS+=("Professional headshot portrait: young Vietnamese female game developer or digital artist, confident expression, modern professional appearance, short stylish hair, creative tech industry aesthetic, natural warm lighting, soft background. Clean avatar photo for testimonial. 200x200.")

# ═══════════════════════════════════════════════════════════════
# SUBMIT ALL JOBS
# ═══════════════════════════════════════════════════════════════

JOBIDS=()
echo "🧬 Character Sync AI Landing — Tạo ${#NAMES[@]} hình ảnh..."
echo ""

for i in "${!NAMES[@]}"; do
  NAME="${NAMES[$i]}"
  P="${PROMPTS[$i]}"

  if [[ "$NAME" == hero-* ]]; then
    W=1200; H=630; RATIO="16:9"
  elif [[ "$NAME" == problem-* ]]; then
    W=900; H=500; RATIO="16:9"
  elif [[ "$NAME" == feat-* ]]; then
    W=600; H=338; RATIO="16:9"
  elif [[ "$NAME" == step-* ]]; then
    W=600; H=338; RATIO="16:9"
  elif [[ "$NAME" == usecase-* ]]; then
    W=600; H=400; RATIO="3:2"
  elif [[ "$NAME" == testimonial-* ]]; then
    W=200; H=200; RATIO="1:1"
  else
    W=600; H=338; RATIO="16:9"
  fi

  R=$(curl -s -X POST "$API" \
    -H "Content-Type: application/json" \
    -H "Authorization: $TOKEN" \
    -d "{\"type\":\"text_to_image\",\"input\":{\"prompt\":\"$P\"},\"config\":{\"width\":$W,\"height\":$H,\"aspectRatio\":\"$RATIO\",\"seed\":0,\"style\":\"\"},\"engine\":{\"provider\":\"gommo\",\"model\":\"google_image_gen_4_5\"},\"enginePayload\":{\"prompt\":\"$P\",\"privacy\":\"PRIVATE\",\"projectId\":\"default\"}}")

  JID=$(echo "$R" | python3 -c "import sys,json; print(json.load(sys.stdin)['data']['jobId'])" 2>/dev/null)
  JOBIDS+=("$JID")
  echo "  [$((i+1))/${#NAMES[@]}] $NAME (${W}x${H}) → $JID"
  sleep 0.5
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
      echo "❌ $NAME → FAILED"
      return 1
    fi
    [ $((attempt % 6)) -eq 0 ] && echo "  ⏳ $NAME ... ${attempt}/120 (${ST:-waiting})"
  done
  echo "⏰ $NAME → TIMEOUT"
  return 1
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

# ═══════════════════════════════════════════════════════════════
# UPLOAD → CLOUDFLARE CDN
# ═══════════════════════════════════════════════════════════════

echo ""
echo "☁️  Uploading to Cloudflare Images..."

cat > "$OUTPUT_FILE" << 'HDR'
#!/bin/bash
# AUTO-GENERATED: Cloudflare CDN URLs for Character Sync AI landing page
# Sections: Hero, Problem, Features (6), Workflow (4), Use Cases (6), Testimonials (2)
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
    echo "CDN_${NAME//-/_}=\"${URL}\"" >> "$OUTPUT_FILE"
    UPLOADED=$((UPLOADED+1))
  else
    echo "❌  (upload failed)"
  fi
  sleep 0.3
done

rm -rf "$IMG_DIR"

echo ""
echo "════════════════════════════════════════════════════════════"
echo "✅ Uploaded: ${UPLOADED}/${#NAMES[@]} → Cloudflare CDN"
echo "📋 Registry saved: $OUTPUT_FILE"
echo "🗑  Cleaned: $IMG_DIR"
echo "════════════════════════════════════════════════════════════"
echo ""
cat "$OUTPUT_FILE"
