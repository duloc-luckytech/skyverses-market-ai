#!/bin/bash
# =============================================================
# gen_aislide_landing_images.sh
# Tạo + Upload → Cloudflare CDN toàn bộ hình landing AI Slide Creator
# Gen: 1 hero, 6 features, 4 workflow steps, 6 use cases
# Pattern: scripts/gen_storyboard_landing.sh
# Run: bash scripts/gen_aislide_landing_images.sh
# =============================================================

API="https://api.skyverses.com/image-jobs"
TOKEN="Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiI2OWM4ZGE4M2M0YjAzYTQyNGYxNjE3YTEiLCJlbWFpbCI6ImR1bG9jMjcwOEBnbWFpbC5jb20iLCJyb2xlIjoidXNlciIsIm5hbWUiOiJMb2MgRFYiLCJpYXQiOjE3NzU3MDg4MjEsImV4cCI6MTc3NjMxMzYyMX0.zI71Th5RO0s0AfJf99CiRvN76fgM1_6sC2hb0dwYCQM"            # CMS Admin > API Clients tab
CF_ACCOUNT="9ab75114b3032bf3e6ff9386815e4554"
CF_TOKEN="Yp_Ark78qShS4E5bc04KIiLLOZjats0kgt5ragdx"
CF_API="https://api.cloudflare.com/client/v4/accounts/${CF_ACCOUNT}/images/v1"

IMG_DIR="public/assets/aislide-landing"
OUTPUT_FILE="scripts/aislide_landing_cdn.sh"
mkdir -p "$IMG_DIR"

NAMES=(); PROMPTS=()

# ═══════════════════════════════════════════════════════════════
# HERO — 1 image (1200x630, 16:9)
# ═══════════════════════════════════════════════════════════════

NAMES+=("hero-main")
PROMPTS+=("Professional AI presentation studio: an ultra-wide dark workspace showing 5 elegant slide panels arranged in a staggered cascade, each slide featuring different professional content layouts — corporate pitch deck with data charts, marketing campaign with bold typography, educational content with diagrams, healthcare conference visuals, startup funding presentation. Each slide has a unique AI-generated background image: futuristic cityscape, abstract geometric, nature landscape, medical clean room, tech circuit. Electric blue glow connecting the slides suggesting AI generation pipeline. Premium SaaS product aesthetic. No readable text. Ultra-wide 1200x630.")

# ═══════════════════════════════════════════════════════════════
# FEATURES — 6 images (800x320, 16:5)
# feat-ai-content, feat-live-edit, feat-ai-suggest, feat-5-layouts, feat-export, feat-ai-bg
# ═══════════════════════════════════════════════════════════════

NAMES+=("features-ai-content")
PROMPTS+=("Abstract AI content generation visualization: floating text outline skeleton transforming into polished professional slide content — bullet points organizing themselves, title snapping into place, body paragraphs auto-formatting. Blue AI neural particles connecting title to body to conclusion. Dark premium background, 800x320 wide banner. No readable text.")

NAMES+=("features-live-edit")
PROMPTS+=("Abstract inline text editing visualization: a presentation slide with a glowing cursor positioned inside the title text, soft selection highlight around editable content areas, smooth contentEditable UI feel. Blue focus ring around the active text block. Dark minimal premium interface aesthetic. Wide banner 800x320. No readable text.")

NAMES+=("features-ai-suggest")
PROMPTS+=("Abstract AI content suggestion panel visualization: three alternative content cards floating beside a slide, each card glowing with a different color — blue, violet, emerald — suggesting three AI-generated title/body alternatives. Sparkle particles emitting from each option. Dark premium background. Wide banner 800x320. No readable text.")

NAMES+=("features-5-layouts")
PROMPTS+=("Abstract slide layout selection visualization: five mini slide layout previews arranged in a row, each showing a different arrangement — center-aligned text on full background, left-aligned text with right space, split 50-50 text and image, full-screen dramatic title only, two equal columns. Blue selection highlight on active layout. Dark premium UI. Wide banner 800x320. No readable text.")

NAMES+=("features-export")
PROMPTS+=("Abstract multi-format export visualization: a completed presentation deck icon radiating three output streams — a PowerPoint document icon glowing gold, a PDF icon glowing red, a PNG stack icon glowing teal. Download arrows with smooth trails. Emerald completion checkmarks. Dark background with premium tech delivery aesthetic. Wide banner 800x320. No readable text.")

NAMES+=("features-ai-bg")
PROMPTS+=("Abstract per-slide AI background generation: three slide thumbnails side by side, each with a different AI-generated background image loading in sequence — landscape fog scene, abstract gradient, urban night — each progressively completing with circular progress ring. Blue generation energy radiating from processing core above. Dark premium background. Wide banner 800x320. No readable text.")

# ═══════════════════════════════════════════════════════════════
# WORKFLOW STEPS — 4 images (600x338, 16:9)
# step-topic-input, step-ai-outline, step-bg-gen, step-export-done
# ═══════════════════════════════════════════════════════════════

NAMES+=("step-topic-input")
PROMPTS+=("Abstract presentation topic input visualization: glowing dark text input field with a prompt being typed — sparkle AI particles appearing as each word is entered, style selector chips (Modern, Bold, Minimal, Corporate) floating nearby. Language flags. Soft blue focus glow around input. Dark minimal SaaS UI aesthetic. 600x338. No readable text.")

NAMES+=("step-ai-outline")
PROMPTS+=("Abstract AI slide outline generation: AI brain neural network analyzing a topic prompt, generating 8 floating slide cards in a cascade — each card revealing a slide title one by one with typewriter effect, connected by golden decision-tree lines showing story structure. Dark premium background. 600x338. No readable text.")

NAMES+=("step-bg-gen")
PROMPTS+=("Abstract parallel AI image generation per slide: 6 slide thumbnails in 2x3 grid, each loading a unique AI-generated background image — forest mist, city skyline, abstract blue geometry, clean medical lab, startup office, cosmic nebula. Progress rings completing at different speeds showing async generation. Blue-purple generation energy. Premium dark background. 600x338. No readable text.")

NAMES+=("step-export-done")
PROMPTS+=("Abstract presentation export completion: a polished finished deck icon with all slides stacked neatly, three export option buttons glowing — PPTX in gold, PDF in red, PNG in teal. Success particles cascading. Download progress completing to 100%. Clean dark professional background. 600x338. No readable text.")

# ═══════════════════════════════════════════════════════════════
# USE CASES — 6 images (600x400, 3:2)
# usecase-business, usecase-education, usecase-marketing, usecase-startup, usecase-healthcare, usecase-ecommerce
# ═══════════════════════════════════════════════════════════════

NAMES+=("usecase-business")
PROMPTS+=("Professional corporate business pitch deck mockup: elegant dark navy presentation slide showing investment pitch — revenue growth chart, market opportunity visualization, professional team layout. Gold and navy color scheme. Premium boardroom aesthetic. No readable text, 600x400.")

NAMES+=("usecase-education")
PROMPTS+=("Educational course presentation mockup: clean academic slide with illustrated concept diagrams — mind map connecting learning topics, progress indicators, engaging visual learning layout. Blue and white clean educational aesthetic. Modern e-learning design. No readable text. 600x400.")

NAMES+=("usecase-marketing")
PROMPTS+=("Bold marketing campaign presentation mockup: vibrant slide with strong visual hierarchy — hero product image, bold campaign concept, social media channel icons. Magenta and gold energetic color palette. Modern advertising agency style. No readable text. 600x400.")

NAMES+=("usecase-startup")
PROMPTS+=("Startup funding pitch deck mockup: dark sleek slide showing traction metrics — user growth curve chart, product screenshots on device mockups, team avatars. Electric blue and deep dark color palette. Modern tech startup aesthetic. No readable text. 600x400.")

NAMES+=("usecase-healthcare")
PROMPTS+=("Medical conference presentation slide mockup: clean professional medical slide with anatomical diagram, clinical data chart, research findings layout. White and teal clean healthcare color scheme. Academic medical conference aesthetic. No readable text. 600x400.")

NAMES+=("usecase-ecommerce")
PROMPTS+=("E-commerce product launch presentation mockup: bright retail-style slide showing product showcase layout — product grid, pricing comparison table, promotional banner design. Orange and white vibrant retail aesthetic. Modern shopping platform style. No readable text. 600x400.")

# ═══════════════════════════════════════════════════════════════
# SUBMIT ALL JOBS
# ═══════════════════════════════════════════════════════════════

JOBIDS=()
echo "🎨 AI Slide Creator Landing — Tạo ${#NAMES[@]} hình ảnh..."
echo ""

for i in "${!NAMES[@]}"; do
  NAME="${NAMES[$i]}"
  P="${PROMPTS[$i]}"

  if   [[ "$NAME" == hero-*     ]]; then W=1200; H=630;  RATIO="16:9"
  elif [[ "$NAME" == features-* ]]; then W=800;  H=320;  RATIO="16:5"
  elif [[ "$NAME" == step-*     ]]; then W=600;  H=338;  RATIO="16:9"
  elif [[ "$NAME" == usecase-*  ]]; then W=600;  H=400;  RATIO="3:2"
  else                                   W=800;  H=450;  RATIO="16:9"
  fi

  R=$(curl -s -X POST "$API" \
    -H "Content-Type: application/json" \
    -H "Authorization: $TOKEN" \
    -d "{\"type\":\"text_to_image\",\"input\":{\"prompt\":\"$P\"},\"config\":{\"width\":$W,\"height\":$H,\"aspectRatio\":\"$RATIO\",\"seed\":0,\"style\":\"\"},\"engine\":{\"provider\":\"gommo\",\"model\":\"google_image_gen_4_5\"},\"enginePayload\":{\"prompt\":\"$P\",\"privacy\":\"PRIVATE\",\"projectId\":\"default\"}}")

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
# AUTO-GENERATED: Cloudflare CDN URLs for AI Slide Creator landing page
# Sections: Hero, Features (6), Workflow Steps (4), Use Cases (6)
# Usage: source scripts/aislide_landing_cdn.sh → use CDN_* vars in React components
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
echo "════════════════════════════════════════════════════════"
echo "✅ Uploaded: ${UPLOADED}/${#NAMES[@]} → Cloudflare CDN"
echo "📋 CDN registry saved: $OUTPUT_FILE"
echo "════════════════════════════════════════════════════════"
echo ""
echo "👉 Sau khi chạy xong, copy URLs vào:"
echo "   components/landing/ai-slide-creator/HeroSection.tsx     → CDN_hero_main"
echo "   components/landing/ai-slide-creator/FeaturesSection.tsx → CDN_features_*"
echo "   components/landing/ai-slide-creator/WorkflowSection.tsx → CDN_step_*"
echo "   components/landing/ai-slide-creator/UseCasesSection.tsx → CDN_usecase_*"
echo ""
cat "$OUTPUT_FILE"
