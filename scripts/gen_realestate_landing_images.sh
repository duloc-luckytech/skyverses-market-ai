#!/bin/bash
# =============================================================
# gen_realestate_landing_images.sh
# Tạo toàn bộ hình ảnh còn thiếu cho landing page BĐS AI
# Sections: Features (thumbnail), Workflow (result thumb),
#           UseCases (per use-case bg), Hero (masonry samples)
# =============================================================

API="https://api.skyverses.com/image-jobs"
TOKEN="Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiI2OWM4ZGE4M2M0YjAzYTQyNGYxNjE3YTEiLCJlbWFpbCI6ImR1bG9jMjcwOEBnbWFpbC5jb20iLCJyb2xlIjoidXNlciIsIm5hbWUiOiJMb2MgRFYiLCJpYXQiOjE3NzU3MDg4MjEsImV4cCI6MTc3NjMxMzYyMX0.zI71Th5RO0s0AfJf99CiRvN76fgM1_6sC2hb0dwYCQM"

declare -a NAMES
declare -a PROMPTS

# ═══════════════════════════════════════════════════════════════
# SECTION: FeaturesSection thumbnails (col-span-2 featured cards)
# Size: 800x320 landscape — hiển thị bên trên card nội dung
# ═══════════════════════════════════════════════════════════════

NAMES+=("features-render-kien-truc-4k")
PROMPTS+=("Ultra-premium photorealistic architectural render of a modern luxury Vietnamese townhouse exterior. Golden hour lighting, perfect shadows, 4K quality. Glass facade, clean lines, tropical landscaping with palm trees. Swimming pool reflection. Cinematic depth of field. Professional real estate photography style. No people. No text. Aspect ratio 800x320 wide banner crop.")

NAMES+=("features-video-tour-ai")
PROMPTS+=("A dramatic wide-angle cinematic still frame from a luxury real estate video tour. Interior of a high-end Vietnamese apartment: open floor plan, floor-to-ceiling windows overlooking city skyline at sunset, marble floors, modern furniture, warm ambient lighting. Motion blur hints suggesting a slow camera dolly. Cinematic color grade, teal and orange LUT. 4K quality. No people. No text. Wide banner 800x320.")

NAMES+=("features-staging-noi-that-ao")
PROMPTS+=("Side-by-side real estate virtual staging transformation. Left half: empty room with bare concrete walls and raw flooring. Right half: same room transformed into a beautiful modern living space with couch, coffee table, artwork, plants, warm lighting. Sharp dividing line in center. Professional interior design photography. 4K quality. No text. Wide 800×320 banner.")

# ═══════════════════════════════════════════════════════════════
# SECTION: WorkflowSection — bước 4 result thumbnail
# Size: 400x200 — thumbnail nhỏ trong card "Tải Về & Dùng Ngay"
# ═══════════════════════════════════════════════════════════════

NAMES+=("workflow-result-thumb")
PROMPTS+=("Photorealistic architectural render result displayed on a laptop screen and printed brochure, placed on a clean white desk. The render shows a premium modern apartment building exterior at dusk with warm interior lights glowing through floor-to-ceiling windows and a rooftop pool. Professional product mockup style. Light background, minimal. No text on image. 400x200.")

NAMES+=("workflow-result-thumb-v2")
PROMPTS+=("A premium collection of real estate AI-generated images fanned out like cards on a light marble surface — showing exterior render, interior staging, aerial view, and floor plan visualization. Professional product photography flat lay style. High-key lighting, minimal shadows. No text. 400x200 ratio.")

# ═══════════════════════════════════════════════════════════════
# SECTION: UseCasesSection — background thumbnail per use case
# Size: 600x400 — card background / icon bg
# ═══════════════════════════════════════════════════════════════

NAMES+=("usecase-chu-dau-tu")
PROMPTS+=("Photorealistic bird's-eye view architectural concept render of a mixed-use real estate development project in Vietnam. Multiple residential towers, commercial podium, green spaces, pedestrian promenade. Daytime, blue sky with soft clouds. Futuristic city planning aesthetic. Investment brochure quality. No people. No text. 600x400.")

NAMES+=("usecase-moi-gioi-bds")
PROMPTS+=("Beautiful virtual staging of an empty Vietnamese apartment unit magically transformed. Before-and-after composition: Left shows bare room, right shows Scandinavian-style furnished living room with natural wood, white sofa, hanging plants, parquet floors, warm lighting. Real estate presentation quality. No text. 600x400.")

NAMES+=("usecase-agency-marketing")
PROMPTS+=("A professional real estate marketing content production setup: multiple social media posts, banner ads, and brochure designs spread across a light wooden table, all featuring the same luxury property render in different formats — square post, portrait story, landscape billboard. Flat lay photography. Clean, branded, professional. No text visible. 600x400.")

NAMES+=("usecase-kien-truc-su")
PROMPTS+=("An architect reviewing 3D architectural concept renders on a large monitor in a modern studio. The screen shows stunning photorealistic renders of a contemporary villa design — exterior perspective, interior living room, and floor plan. Bokeh background, creative professional environment. No personal faces visible. No text. 600x400.")

NAMES+=("usecase-homebuyer")
PROMPTS+=("A person browsing interior design options on a tablet showing a beautiful bedroom customization tool — different color schemes and furniture styles side by side for a Vietnamese apartment. Warm cozy lifestyle photography. Living room setting. Soft natural light. No face visible. No text. 600x400.")

NAMES+=("usecase-developer-website")
PROMPTS+=("A premium real estate developer project landing page displayed on a large iMac monitor and iPhone side by side. The page shows a stunning hero section with a photorealistic CGI render of a luxury high-rise condominium with a city skyline. Dark background, premium tech mockup style. No visible text. 600x400.")

# ═══════════════════════════════════════════════════════════════
# SECTION: Hero masonry grid — BĐS sample images (community feed)
# Size: 768x1024 portrait — suitable for masonry grid cells
# These simulate what users generate (community explorer feed)
# ═══════════════════════════════════════════════════════════════

NAMES+=("hero-sample-villa-exterior")
PROMPTS+=("Photorealistic 4K render of a premium modern tropical villa exterior in Vietnam. White render facade, dark wood accents, infinity pool, lush palm garden, golden hour warm light casting long shadows. Architectural photography composition. No people. No text. Portrait 768x1024.")

NAMES+=("hero-sample-luxury-apartment")
PROMPTS+=("Stunning photorealistic interior render of a luxury high-rise apartment in Ho Chi Minh City. Floor-to-ceiling windows with panoramic city night view, minimalist furniture, warm ambient lighting, marble kitchen island. Professional real estate photography. No people. Portrait 768x1024.")

NAMES+=("hero-sample-shophouse-rendering")
PROMPTS+=("Photorealistic street-level render of a row of modern Vietnamese shophouses. Ground floor commercial with glass storefronts, upper floors residential with balconies. Pedestrian street, day time, clean sky. Premium real estate developer CGI quality. No text. Portrait 768x1024.")

NAMES+=("hero-sample-interior-staging")
PROMPTS+=("Virtual staging of a modern Vietnamese living room. Empty space transformed with mid-century modern furniture: velvet sofa, marble coffee table, abstract wall art, pendant lights, indoor plants, parquet flooring. Natural daylight from large windows. No people. Portrait 768x1024.")

NAMES+=("hero-sample-office-render")
PROMPTS+=("Photorealistic render of a premium Grade A office lobby in Vietnam. Grand double-height space, marble floors, reception desk, green living wall, warm indirect lighting. Corporate real estate photography quality. No people visible. Portrait 768x1024.")

NAMES+=("hero-sample-penthouse-view")
PROMPTS+=("Dramatic photorealistic render of a penthouse rooftop terrace in a modern high-rise. Infinity-edge pool overlooking Ho Chi Minh City skyline at twilight. Luxury outdoor furniture, privacy screens, ambient lighting. Wide-angle composition. No people. Portrait 768x1024.")

# ═══════════════════════════════════════════════════════════════
# SUBMIT JOBS
# ═══════════════════════════════════════════════════════════════

JOBIDS=()

echo "🏡 Skyverses BĐS Landing — Tạo ${#NAMES[@]} hình ảnh..."
echo ""

for i in "${!NAMES[@]}"; do
  NAME="${NAMES[$i]}"
  P="${PROMPTS[$i]}"

  # Xác định size dựa theo prefix tên
  if [[ "$NAME" == features-* ]]; then
    W=800; H=320; RATIO="16:5"
  elif [[ "$NAME" == workflow-* ]]; then
    W=400; H=200; RATIO="2:1"
  elif [[ "$NAME" == usecase-* ]]; then
    W=600; H=400; RATIO="3:2"
  elif [[ "$NAME" == hero-* ]]; then
    W=768; H=1024; RATIO="3:4"
  else
    W=1200; H=630; RATIO="1200:630"
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
# POLL & DOWNLOAD
# ═══════════════════════════════════════════════════════════════

echo ""
echo "⏳ Polling results..."
echo ""

mkdir -p public/assets/realestate

for i in "${!NAMES[@]}"; do
  JID="${JOBIDS[$i]}"
  NAME="${NAMES[$i]}"
  [ -z "$JID" ] && echo "❌ $NAME: no job ID" && continue

  for attempt in $(seq 1 60); do
    sleep 5
    SR=$(curl -s "$API/$JID" -H "Authorization: $TOKEN")
    ST=$(echo "$SR" | python3 -c "import sys,json; print(json.load(sys.stdin)['data']['status'])" 2>/dev/null)

    if [ "$ST" = "done" ]; then
      URL=$(echo "$SR" | python3 -c "import sys,json; print(json.load(sys.stdin)['data']['result']['images'][0])" 2>/dev/null)
      echo "✅ $NAME"
      echo "   🔗 $URL"
      curl -sL -o "public/assets/realestate/${NAME}.png" "$URL"
      echo "   📁 Saved: public/assets/realestate/${NAME}.png"
      break
    elif [ "$ST" = "failed" ] || [ "$ST" = "error" ]; then
      echo "❌ $NAME FAILED"
      break
    else
      printf "  ⏳ %s: %s (%d/60)\\r" "$NAME" "$ST" "$attempt"
    fi
  done
done

# ═══════════════════════════════════════════════════════════════
# SUMMARY
# ═══════════════════════════════════════════════════════════════

echo ""
echo "═══════════════════════════════════════════════════════════"
echo "📁 Ảnh đã tạo tại: public/assets/realestate/"
ls -la public/assets/realestate/ 2>/dev/null
echo ""
echo "🔗 Sau khi chọn ảnh tốt nhất, upload CDN và cập nhật:"
echo ""
echo "   FeaturesSection.tsx:"
echo "     features-render-kien-truc-4k  → thumbnail của 'Render Kiến Trúc 4K'"
echo "     features-video-tour-ai        → thumbnail của 'Tạo Video Tour AI'"
echo "     features-staging-noi-that-ao  → thumbnail cho staging card (optional)"
echo ""
echo "   WorkflowSection.tsx:"
echo "     workflow-result-thumb         → CDN_RESULT_THUMB (bước 4)"
echo ""
echo "   UseCasesSection.tsx:"
echo "     usecase-chu-dau-tu            → card Chủ Đầu Tư"
echo "     usecase-moi-gioi-bds          → card Môi Giới BĐS"
echo "     usecase-agency-marketing      → card Agency Marketing"
echo "     usecase-kien-truc-su          → card Kiến Trúc Sư"
echo "     usecase-homebuyer             → card Homebuyer"
echo "     usecase-developer-website     → card Developer Website"
echo ""
echo "   Masonry Hero Grid (upload to Explorer/community feed):"
echo "     hero-sample-*.png             → cần publish lên Explorer API"
echo ""
echo "═══════════════════════════════════════════════════════════"
echo "🏁 Done!"
