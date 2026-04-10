#!/bin/bash
# =============================================================
# gen_image_restorer_extra.sh
# Generate 9 ảnh còn thiếu cho landing /product/ai-image-restorer
#
# Sections:
#   WorkflowSection — step 1, 2, 3 thumbnails (step 4 đã có)
#   FeaturesSection — 6 card nhỏ thumbnails
#
# Total: 9 ảnh
# =============================================================

API="https://api.skyverses.com/image-jobs"
TOKEN="Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiI2OWM4ZGE4M2M0YjAzYTQyNGYxNjE3YTEiLCJlbWFpbCI6ImR1bG9jMjcwOEBnbWFpbC5jb20iLCJyb2xlIjoidXNlciIsIm5hbWUiOiJMb2MgRFYiLCJpYXQiOjE3NzU3MDg4MjEsImV4cCI6MTc3NjMxMzYyMX0.zI71Th5RO0s0AfJf99CiRvN76fgM1_6sC2hb0dwYCQM"
CF_ACCOUNT="9ab75114b3032bf3e6ff9386815e4554"
CF_TOKEN="Yp_Ark78qShS4E5bc04KIiLLOZjats0kgt5ragdx"
CF_API="https://api.cloudflare.com/client/v4/accounts/${CF_ACCOUNT}/images/v1"

IMG_DIR="public/assets/image-restorer-extra"
OUTPUT_FILE="scripts/image_restorer_extra_cdn_urls.sh"
mkdir -p "$IMG_DIR"

declare -a NAMES PROMPTS WIDTHS HEIGHTS

# ══════════════════════════════════════════════════════════════
# 1. WORKFLOW — step thumbnails (step 4 đã có rồi)
# ══════════════════════════════════════════════════════════════

# Step 1 — Upload ảnh cũ
NAMES+=("workflow-step1-upload")
WIDTHS+=(800); HEIGHTS+=(500)
PROMPTS+=("Flat lay photo of old damaged vintage photographs spread on a wooden desk. Several old Vietnamese family photos from the 1950s-60s, black and white, visibly deteriorated with scratches, fading, water stains, torn edges. A hand holding one damaged photo up to light. Warm desk lamp light. Clean minimal composition. Soft shadow. Professional product photography style.")

# Step 2 — AI Phân Tích
NAMES+=("workflow-step2-scan")
WIDTHS+=(800); HEIGHTS+=(500)
PROMPTS+=("Futuristic AI photo scanning interface visualization. Old black and white Vietnamese portrait displayed on a sleek dark screen, overlaid with glowing cyan grid lines and analysis markers. Face detection bounding boxes in neon green around facial features. Damage detection heat map overlay showing red zones on scratches. Neural network node visualization in corner. High-tech dark UI, professional AI scanner aesthetic. Cinematic blue-green lighting.")

# Step 3 — Tái Tạo 4K
NAMES+=("workflow-step3-upscale")
WIDTHS+=(800); HEIGHTS+=(500)
PROMPTS+=("Abstract visualization of AI image upscaling technology. A pixelated low-resolution blurry image on the left transforming progressively into ultra-sharp 4K on the right. Glowing pixel grid expanding and sharpening. Crystal clear face details emerging from blur. Dynamic energy particles flowing from left to right showing data transformation. Deep blue and purple background with bright white and gold light streaks. Futuristic tech aesthetic, cinematic composition.")

# ══════════════════════════════════════════════════════════════
# 2. FEATURES — 6 card nhỏ thumbnails (featured: false)
# ══════════════════════════════════════════════════════════════

# Scratch Removal
NAMES+=("feat-scratch-removal")
WIDTHS+=(600); HEIGHTS+=(400)
PROMPTS+=("Close-up macro photograph showing AI scratch removal restoration. Half the image shows a vintage photo surface with deep white scratch lines and fold creases crossing over it. The other half shows the same surface perfectly clean and restored with no scratches visible. Sharp transition line in center. Texture detail of photo paper visible. Professional before-after micro comparison. Teal and warm tone color grading.")

# Noise Reduction
NAMES+=("feat-noise-reduction")
WIDTHS+=(600); HEIGHTS+=(400)
PROMPTS+=("Side-by-side comparison of AI noise reduction. Left side: heavily grainy film photograph of a Vietnamese face with visible ISO noise, grain texture, and digital compression artifacts blurring facial details. Right side: same face perfectly denoised and sharp, crystal clear skin texture, clean smooth tones, every eyelash visible. Sharp vertical dividing line in center. Professional macro portrait photography quality. Cool clinical aesthetic.")

# 8K Upscaling
NAMES+=("feat-8k-upscaling")
WIDTHS+=(600); HEIGHTS+=(400)
PROMPTS+=("Dramatic split comparison of AI 8K upscaling. Left half: tiny low-resolution 100px thumbnail of a Vietnamese landscape, visibly pixelated and blocky, each pixel clearly square and chunky. Right half: same image upscaled to stunning 8K ultra-sharp — every leaf, rock texture, water ripple crystal clear. Bold text label '8K' glowing on right side. Dark background, cinematic lighting. Technology showcase aesthetic.")

# H100 GPU Speed
NAMES+=("feat-h100-gpu")
WIDTHS+=(600); HEIGHTS+=(400)
PROMPTS+=("Cinematic photograph of NVIDIA H100 GPU data center. Rows of glowing server racks with blue and green LED lights in a dark cooled server room. Light trails suggesting extreme processing speed. Subtle overlay of a progress bar showing 100% complete in under 5 seconds. Futuristic high-tech atmosphere. Deep blue ambient lighting with bright accent colors. Professional data center photography.")

# Privacy Vault
NAMES+=("feat-privacy-vault")
WIDTHS+=(600); HEIGHTS+=(400)
PROMPTS+=("Abstract security and privacy visualization. A glowing golden padlock icon centered on dark background with subtle circuit board patterns. Green shield icon with checkmark. Data encryption visualization with flowing encrypted text streams around a protected photograph. VPC vault concept. Secure dark aesthetic with deep navy background, gold and green accent colors. Corporate security technology art direction.")

# History Sync
NAMES+=("feat-history-sync")
WIDTHS+=(600); HEIGHTS+=(400)
PROMPTS+=("Modern cloud sync interface mockup showing photo restoration history. Clean dark UI dashboard showing a timeline of restored Vietnamese family photos as thumbnails with timestamps. Sync arrows and cloud icons between mobile phone and laptop screens shown side by side. Soft gradient background in dark navy. Clean minimal UI design. Professional app screenshot aesthetic with subtle glow effects.")

# ══════════════════════════════════════════════════════════════
# SUBMIT ALL JOBS
# ══════════════════════════════════════════════════════════════

JOBIDS=()
echo "🎨 Submitting ${#NAMES[@]} image jobs..."
echo ""

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
  echo "  [$((i+1))/${#NAMES[@]}] $NAME (${W}x${H}) → jobId: $JID"
  sleep 1
done

# ══════════════════════════════════════════════════════════════
# POLL → DOWNLOAD
# ══════════════════════════════════════════════════════════════

echo ""
echo "⏳ Polling results..."
echo ""

for i in "${!NAMES[@]}"; do
  JID="${JOBIDS[$i]}"
  NAME="${NAMES[$i]}"
  [ -z "$JID" ] && echo "❌ $NAME: no job ID" && continue

  echo -n "  ⏳ $NAME ... "
  for attempt in $(seq 1 60); do
    sleep 5
    SR=$(curl -s "$API/$JID" -H "Authorization: $TOKEN")
    ST=$(echo "$SR" | python3 -c "import sys,json; print(json.load(sys.stdin)['data']['status'])" 2>/dev/null)

    if [ "$ST" = "done" ]; then
      URL=$(echo "$SR" | python3 -c "import sys,json; print(json.load(sys.stdin)['data']['result']['images'][0])" 2>/dev/null)
      echo "✅"
      echo "     → $URL"
      curl -sL -o "${IMG_DIR}/${NAME}.png" "$URL"
      break
    elif [ "$ST" = "failed" ] || [ "$ST" = "error" ]; then
      echo "❌ FAILED"; break
    else
      printf "(%d)..." "$attempt"
    fi
  done
done

# ══════════════════════════════════════════════════════════════
# UPLOAD → CLOUDFLARE CDN
# ══════════════════════════════════════════════════════════════

echo ""
echo "☁️  Uploading to Cloudflare Images..."
echo ""

cat > "$OUTPUT_FILE" << 'HEADER'
#!/bin/bash
# AUTO-GENERATED: AI Image Restorer Extra — Cloudflare CDN URLs
# Sections: Workflow steps 1-3, Features 6 small cards
HEADER

UPLOADED=0

for i in "${!NAMES[@]}"; do
  NAME="${NAMES[$i]}"
  FILE="${IMG_DIR}/${NAME}.png"
  [ ! -f "$FILE" ] && echo "⚠️  Skip $NAME (not downloaded)" && continue

  echo -n "  ⬆  $NAME ... "
  RESPONSE=$(curl -s -X POST "$CF_API" \
    -H "Authorization: Bearer $CF_TOKEN" \
    -F "file=@${FILE}" \
    -F "requireSignedURLs=false")

  SUCCESS=$(echo "$RESPONSE" | python3 -c "import sys,json; print(json.load(sys.stdin).get('success', False))" 2>/dev/null)
  URL=$(echo "$RESPONSE" | python3 -c "
import sys, json
try:
    d = json.load(sys.stdin)
    variants = d.get('result', {}).get('variants', [])
    print(next((v for v in variants if v.endswith('/public')), variants[0] if variants else ''))
except:
    print('')
" 2>/dev/null)

  if [ "$SUCCESS" = "True" ] && [ -n "$URL" ]; then
    echo "✅  $URL"
    echo "CDN_${NAME//-/_}=\"${URL}\"" >> "$OUTPUT_FILE"
    UPLOADED=$((UPLOADED + 1))
  else
    echo "❌  $(echo "$RESPONSE" | python3 -c "import sys,json; d=json.load(sys.stdin); print(d.get('errors','?'))" 2>/dev/null)"
  fi
  sleep 0.3
done

# Cleanup local PNGs
rm -rf "$IMG_DIR"

echo ""
echo "══════════════════════════════════════════════════════════"
echo "✅ Uploaded: $UPLOADED/${#NAMES[@]} → Cloudflare CDN"
echo "📋 URLs saved to: $OUTPUT_FILE"
echo "🗑  Deleted: $IMG_DIR"
echo ""
echo "Next: node scripts/apply_image_restorer_extra_cdn.cjs"
echo "══════════════════════════════════════════════════════════"
