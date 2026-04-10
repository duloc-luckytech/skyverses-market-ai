#!/bin/bash
# =============================================================
# gen_storyboard_landing.sh
# Tạo + Upload → Cloudflare CDN toàn bộ hình landing Storyboard Studio
# Gen 20 images: 1 hero, 6 features, 4 workflow steps, 6 use cases, 3 scene demos
# Run: bash scripts/gen_storyboard_landing.sh
# =============================================================

API="https://api.skyverses.com/image-jobs"
TOKEN="Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiI2OWM4ZGE4M2M0YjAzYTQyNGYxNjE3YTEiLCJlbWFpbCI6ImR1bG9jMjcwOEBnbWFpbC5jb20iLCJyb2xlIjoidXNlciIsIm5hbWUiOiJMb2MgRFYiLCJpYXQiOjE3NzU3MDg4MjEsImV4cCI6MTc3NjMxMzYyMX0.zI71Th5RO0s0AfJf99CiRvN76fgM1_6sC2hb0dwYCQM"
CF_ACCOUNT="9ab75114b3032bf3e6ff9386815e4554"
CF_TOKEN="Yp_Ark78qShS4E5bc04KIiLLOZjats0kgt5ragdx"
CF_API="https://api.cloudflare.com/client/v4/accounts/${CF_ACCOUNT}/images/v1"

IMG_DIR="public/assets/storyboard-landing"
OUTPUT_FILE="scripts/storyboard_landing_cdn.sh"
mkdir -p "$IMG_DIR"

NAMES=(); PROMPTS=()

# ═══════════════════════════════════════════════════════════════
# SECTION: HERO — 1 image (1200x630, 16:9)
# ═══════════════════════════════════════════════════════════════

NAMES+=("hero-main")
PROMPTS+=("Cinematic AI filmmaking studio: multiple storyboard panels arranged in a dramatic sequence across a dark premium workspace surface, each panel showing different AI-rendered film scenes — wide establishing shot, close-up portrait, action sequence, atmospheric night scene. Blue electric light traces connecting the panels suggesting AI pipeline flow. Film-strip sprocket overlay at edges. Dark deep background with subtle bokeh. Professional cinematography production tool aesthetic. No text. Ultra-wide 1200x630.")

# ═══════════════════════════════════════════════════════════════
# SECTION: FEATURES — 6 images (600x338, 16:9)
# ═══════════════════════════════════════════════════════════════

NAMES+=("feat-script-split")
PROMPTS+=("Abstract AI screenplay analysis visualization: a film script document transforming into multiple floating scene cards, each card glowing with different cinematic scene concept — action, romance, dialogue. Blue digital rays scanning and decomposing the text into structured story beats. Dark premium background with electric blue accent. Tech AI pipeline aesthetic. No text. 600x338.")

NAMES+=("feat-char-lock")
PROMPTS+=("Abstract character visual consistency system: three versions of the same AI character face shown from different angles — front, side profile, three-quarter — all perfectly consistent in appearance, connected by blue identity anchoring lines. Holographic verification checkmarks overlaid. Dark background. Premium AI identity technology aesthetic. No text. 600x338.")

NAMES+=("feat-batch-image")
PROMPTS+=("Abstract batch AI image generation visualization: dark studio interface showing 6 scene panels animating simultaneously, each panel loading a different cinematic still — forest, cityscape, portrait, interior, night sky, underwater. Progress rings completing on each. Rose/blue parallel rendering energy. Professional AI render farm visual. No text. 600x338.")

NAMES+=("feat-video-render")
PROMPTS+=("Abstract AI video rendering visualization: film frame being processed by holographic AI engine, converting static storyboard panel into flowing cinematic video sequence. Motion blur trails behind animated frame. Purple-blue energy waves radiating from processing core. Premium dark background. Cinematic tech aesthetic. No text. 600x338.")

NAMES+=("feat-timeline")
PROMPTS+=("Abstract cinematic timeline editor visualization: horizontal timeline bar showing multiple scene thumbnails in sequence, each with duration markers, connected by smooth transition lines. Different colored scene types — dialogue, action, transition — highlighted. Dark premium film editing UI aesthetic. Blue and amber accents on dark background. No text. 600x338.")

NAMES+=("feat-export")
PROMPTS+=("Abstract export pipeline visualization: finished film reel and multiple output format icons (film frame, video file, image stack) flowing outward from a central AI processing node, downloading to various dark device screens. Emerald green checkmark particle effects. Premium dark background. Professional content delivery aesthetic. No text. 600x338.")

# ═══════════════════════════════════════════════════════════════
# SECTION: HOW IT WORKS — 4 step images (600x338, 16:9)
# ═══════════════════════════════════════════════════════════════

NAMES+=("step-script-input")
PROMPTS+=("Abstract creative screenplay input visualization: glowing textarea input with flowing Vietnamese script text being typed, sparkle AI magic particles appearing around word by word, reference image thumbnail appearing beside script panel. Dark minimal UI aesthetic. Blue creative energy accent. Cinematic script editor concept. No readable text. 600x338.")

NAMES+=("step-scene-split")
PROMPTS+=("Abstract AI scene decomposition visualization: screenplay text being analyzed by AI brain neural network, splitting into 6 distinct floating scene cards each showing different story beat — opening, development, climax, resolution. Golden AI decision tree lines connecting them. Dark Premium background. Analytical cinematic AI aesthetic. No text. 600x338.")

NAMES+=("step-generate-assets")
PROMPTS+=("Abstract parallel AI visual generation: six scene cards arranged in 2x3 grid all loading simultaneously, each filling in with beautiful cinematic AI-rendered imagery — dramatic landscapes, character faces, action sequences, night scenes. Blue and purple generation energy pulsing. Dark studio aesthetic, professional AI render manager. No text. 600x338.")

NAMES+=("step-export-download")
PROMPTS+=("Abstract cinematic export and delivery: completed film project icon with all scenes assembled, arrow pointing to multiple output streams — video download, share icon, cloud storage, media player. Emerald success particles. Dark background with clean download progress bars completing. Premium tech delivery aesthetic. No text. 600x338.")

# ═══════════════════════════════════════════════════════════════
# SECTION: USE CASES — 6 images (600x400, 3:2)
# ═══════════════════════════════════════════════════════════════

NAMES+=("usecase-tvc")
PROMPTS+=("Cinematic commercial production storyboard mockup: professional TVC advertisement storyboard panels showing luxury car commercial — product shot, lifestyle scene, brand closeup, CTA frame. Polished golden-warm color grading across panels. Premium advertising agency production quality. Dark matte studio surface. No readable text. 600x400.")

NAMES+=("usecase-mv")
PROMPTS+=("Music video AI production storyboard: vibrant music video scene panels showing singer on stage with dynamic lighting, crowd energy, performance close-up, artistic abstract visuals. Electric neon purple and blue color palette across panels. Modern pop music aesthetic. Cinematic concert photography style. No readable text. 600x400.")

NAMES+=("usecase-short-film")
PROMPTS+=("Short film storyboard visualization: intimate story panels showing character journey — walking through rain, emotional dialogue scene, climactic moment, quiet resolution. Desaturated cinematic color palette with warm amber highlights. Film noir inspired. Artistic Vietnamese indie film aesthetic. No readable text. 600x400.")

NAMES+=("usecase-game-cutscene")
PROMPTS+=("Game cutscene storyboard panels: dramatic game narrative scenes showing epic battle, warrior character reveal, boss confrontation, victory aftermath. Cinematic letterbox format panels. Dark epic fantasy lighting with orange and purple energy effects. Premium AAA game cinematic aesthetic. No readable text. 600x400.")

NAMES+=("usecase-education")
PROMPTS+=("Educational video storyboard concept: clean professional infographic-style animated video panels showing learning journey — introduction concept, animated diagram, real-world application, knowledge check. Blue and white clean academic aesthetic. Professional e-learning production quality. Organized and trustworthy. No readable text. 600x400.")

NAMES+=("usecase-virtual-influencer")
PROMPTS+=("Virtual AI influencer content storyboard: hyper-realistic AI character performing for camera across multiple social media content panels — lifestyle shot, product review gesture, selfie pose, story segment. Vibrant pastel-neon aesthetic. Modern influencer marketing visual style. Beautiful AI avatar content creation. No readable text. 600x400.")

# ═══════════════════════════════════════════════════════════════
# SECTION: SCENE CARD DEMOS — 3 images (800x450, 16:9)
# ═══════════════════════════════════════════════════════════════

NAMES+=("scene-demo-landscape")
PROMPTS+=("Cinematic wide establishing shot scene card: dramatic aerial view of Vietnamese coastal city at golden hour, sun setting over ocean, city lights beginning to glow, silhouetted mountains in distance. Cinematic anamorphic lens flare. Ultra high quality film photography. Rich warm amber and deep blue color grading. No text. 800x450.")

NAMES+=("scene-demo-portrait")
PROMPTS+=("Cinematic close-up character portrait scene card: atmospheric close-up of a young Vietnamese woman's face, soft side lighting from window, determined expression, shallow depth of field blurring background rain through glass. Desaturated color palette with warm skin tones. Method acting drama aesthetic. Film grain texture. No text. 800x450.")

NAMES+=("scene-demo-action")
PROMPTS+=("Cinematic action sequence scene card: dynamic urban parkour chase through neon-lit narrow alley at night, blurred motion of runner jumping between rooftops, rain splashing, neon sign reflections on wet pavement below. Dramatic low angle shot. High contrast blue and orange color grading. Adrenaline energy. No text. 800x450.")

# ═══════════════════════════════════════════════════════════════
# SUBMIT ALL JOBS
# ═══════════════════════════════════════════════════════════════

JOBIDS=()
echo "🎬 Storyboard Studio Landing — Tạo ${#NAMES[@]} hình ảnh..."
echo ""

for i in "${!NAMES[@]}"; do
  NAME="${NAMES[$i]}"
  P="${PROMPTS[$i]}"

  if [[ "$NAME" == hero-* ]]; then
    W=1200; H=630; RATIO="16:9"
  elif [[ "$NAME" == feat-* ]]; then
    W=600; H=338; RATIO="16:9"
  elif [[ "$NAME" == step-* ]]; then
    W=600; H=338; RATIO="16:9"
  elif [[ "$NAME" == usecase-* ]]; then
    W=600; H=400; RATIO="3:2"
  elif [[ "$NAME" == scene-demo-* ]]; then
    W=800; H=450; RATIO="16:9"
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
# AUTO-GENERATED: Cloudflare CDN URLs for Storyboard Studio landing page
# Sections: Hero, Features, Workflow Steps, Use Cases, Scene Demos
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
echo "════════════════════════════════════════════"
echo "✅ Uploaded: ${UPLOADED}/${#NAMES[@]} → Cloudflare CDN"
echo "📋 Registry saved: $OUTPUT_FILE"
echo "════════════════════════════════════════════"
echo ""
cat "$OUTPUT_FILE"
