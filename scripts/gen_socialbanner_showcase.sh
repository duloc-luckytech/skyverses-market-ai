#!/bin/bash
# =============================================================
# gen_socialbanner_showcase.sh
# Tạo 15 ví dụ banner thực tế cho ShowcaseSection
# Mỗi ảnh: 1200x630 (Facebook post standard) hoặc các tỷ lệ chuẩn
# Gen + upload Cloudflare in one script
# =============================================================

API="https://api.skyverses.com/image-jobs"
TOKEN="Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiI2OWM4ZGE4M2M0YjAzYTQyNGYxNjE3YTEiLCJlbWFpbCI6ImR1bG9jMjcwOEBnbWFpbC5jb20iLCJyb2xlIjoidXNlciIsIm5hbWUiOiJMb2MgRFYiLCJpYXQiOjE3NzU3MDg4MjEsImV4cCI6MTc3NjMxMzYyMX0.zI71Th5RO0s0AfJf99CiRvN76fgM1_6sC2hb0dwYCQM"
CF_ACCOUNT="9ab75114b3032bf3e6ff9386815e4554"
CF_TOKEN="Yp_Ark78qShS4E5bc04KIiLLOZjats0kgt5ragdx"
CF_API="https://api.cloudflare.com/client/v4/accounts/${CF_ACCOUNT}/images/v1"

IMG_DIR="public/assets/showcase-banners"
OUTPUT_FILE="scripts/socialbanner_showcase_cdn.sh"
mkdir -p "$IMG_DIR"

# Format: NAMES / PROMPTS / LABELS / DESCS / PLATFORMS / SIZES
declare -a NAMES PROMPTS LABELS DESCS PLATFORMS WIDTHS HEIGHTS

# ── 1. Flash Sale 11.11 – Facebook Post ─────────────────────
NAMES+=("showcase-flash-sale-1111")
WIDTHS+=(1200); HEIGHTS+=(630)
LABELS+=("Flash Sale 11.11")
PLATFORMS+=("Facebook Post · 1200×630")
DESCS+=("Chiến dịch sale lớn nhất năm — AI tạo banner Flash 11.11 nền đỏ rực, số nổi bật, năng lượng cao trong 30 giây")
PROMPTS+=("A high-energy Vietnamese e-commerce flash sale banner for 11.11 Singles Day. Bold red background (#CC0000) with golden yellow accent bursts. Giant '11.11' date numbers in center glowing with sparkle effects. 'FLASH SALE 50% OFF' text in white sans-serif, very large. Confetti streamers and star particles exploding from center. Vietnamese shopping cart and gift box icons at bottom corners. Bottom bar with red-to-gold gradient showing countdown timer placeholder. Premium graphic design quality. No actual price text visible. Ultra vibrant, festive, cinematic lighting. 1200x630 wide.")

# ── 2. Grand Opening – Facebook Cover ───────────────────────
NAMES+=("showcase-grand-opening")
WIDTHS+=(820); HEIGHTS+=(312)
LABELS+=("Khai Trương Chi Nhánh Mới")
PLATFORMS+=("Facebook Cover · 820×312")
DESCS+=("Banner khai trương cửa hàng mới — AI tự phối màu thương hiệu và layout phù hợp Facebook Cover")
PROMPTS+=("A festive grand opening Facebook cover banner for a Vietnamese retail store. Warm gold and red color scheme with fireworks and lantern decorations. 'KHAI TRUONG' text in large elegant Vietnamese serif font, center aligned. Ribbon cutting ceremony illustration silhouette at bottom. Confetti rain, golden firework burst in background, traditional Vietnamese festive atmosphere. Store exterior illustrated in minimal line art at right side. Premium mall-store opening aesthetic. Wide banner 820x312.")

# ── 3. Job Hiring – X Header ────────────────────────────────
NAMES+=("showcase-tuyen-dung")
WIDTHS+=(1500); HEIGHTS+=(500)
LABELS+=("Tuyển Dụng Tech Startup")
PLATFORMS+=("X/Twitter Header · 1500×500")
DESCS+=("Banner tuyển dụng tech startup — AI gen header X chuẩn 1500×500 với brand identity hiện đại")
PROMPTS+=("A modern tech startup job recruitment X (Twitter) header banner. Deep dark navy background (#0d1117) with electric blue (#0090ff) and neon green accent nodes. Abstract tech circuit board pattern in background. Center left: geometric isometric office icons floating in 3D space — laptop, code brackets, coffee cup, rocket. Right side: abstract human figures collaborating. Bold modern sans-serif font layout areas for 'WE ARE HIRING'. Purple-to-blue gradient energy beam dividing the composition. Premium futuristic tech company aesthetic. No actual text. 1500x500.")

# ── 4. Product Launch – Instagram Square ────────────────────
NAMES+=("showcase-product-launch-ig")
WIDTHS+=(1080); HEIGHTS+=(1080)
LABELS+=("Ra Mắt Sản Phẩm Mới")
PLATFORMS+=("Instagram Post · 1080×1080")
DESCS+=("Banner launch sản phẩm cho Instagram — spotlight trung tâm, nền tối premium, chuẩn brand cao cấp")
PROMPTS+=("A premium product launch Instagram square post banner. Near-black matte background (#0a0a0a). Center: dramatic studio spotlight lighting cone from above illuminating a floating luxury perfume bottle with golden reflections. Scattered golden bokeh particles and lens flares. Thin white line border frame. Top: minimalist brand logo placeholder. Bottom: elegant thin serif typography area. Rose gold and champagne accent colors. Very premium luxury brand aesthetic, Apple product launch style. Square 1080x1080.")

# ── 5. Webinar/Event – LinkedIn Banner ──────────────────────
NAMES+=("showcase-webinar-linkedin")
WIDTHS+=(1584); HEIGHTS+=(396)
LABELS+=("Hội Thảo Trực Tuyến")
PLATFORMS+=("LinkedIn Banner · 1584×396")
DESCS+=("Banner hội thảo online — AI cân bằng layout thông tin + hình ảnh theo chuẩn LinkedIn professional")
PROMPTS+=("A professional LinkedIn company banner for an online business webinar event. Clean corporate blue (#0A66C2) and white color scheme. Left 40%: abstract geometric pattern of connected network nodes suggesting business connectivity. Center: professional conference room bokeh background. Right 40%: speaker podium silhouette and audience outline in illustrated style. Large sans-serif text area for event title at center. Date/time badge in accent color. Bottom strip with company logo placeholder and CTA button. Corporate, trustworthy, executive-level design. Ultra-wide 1584x396.")

# ── 6. New Collection – Instagram Story ─────────────────────
NAMES+=("showcase-new-collection-story")
WIDTHS+=(1080); HEIGHTS+=(1920)
LABELS+=("BST Thu Đông Mới")
PLATFORMS+=("Instagram Story · 1080×1920")
DESCS+=("Banner story ra mắt BST thời trang — AI tạo layout dọc chuẩn 9:16 cho Instagram Story với phong cách editorial")
PROMPTS+=("A high-fashion Instagram Story banner for a new autumn-winter clothing collection launch. Vertical 1080x1920 format. Muted dusty rose and dark charcoal color palette. Full-bleed editorial fashion photography style background — abstract flowing fabric texture in warm earth tones. Top third: clean minimal brand wordmark area. Center: large dramatic typography layout 'NEW COLLECTION' in thin elegant serif. Bottom third: product grid placeholder showing 4 clothing item silhouettes. Swipe-up CTA button at very bottom. High-end fashion magazine editorial aesthetic. Vertical portrait.")

# ── 7. Tet Holiday Sale – Facebook Post ─────────────────────
NAMES+=("showcase-tet-sale")
WIDTHS+=(1200); HEIGHTS+=(630)
LABELS+=("Sale Tết Nguyên Đán")
PLATFORMS+=("Facebook Post · 1200×630")
DESCS+=("Banner sale Tết Nguyên Đán — AI hiểu văn hóa Việt và tạo visual festive đúng tone ngày Tết")
PROMPTS+=("A vibrant Vietnamese Lunar New Year (Tet) sale Facebook post banner. Traditional Vietnamese Tet color palette: vermillion red (#C41E3A), gold (#FFD700), deep green. Background: blurred bokeh of red lanterns and cherry blossoms (hoa dao). Center composition: large golden dragon illustration coiling around sale graphics. Giant bold red text area for 'TET SALE' with golden outline. Peach flower (hoa dao) branches decorating corners. Lucky coin (dong xu vang) scattered. Bottom: red ribbon banner strip with CTA area. Traditional yet modern graphic design. 1200x630.")

# ── 8. Coffee Shop Promotion – Facebook Post ────────────────
NAMES+=("showcase-coffee-promo")
WIDTHS+=(1200); HEIGHTS+=(630)
LABELS+=("Khuyến Mãi Cà Phê")
PLATFORMS+=("Facebook Post · 1200×630")
DESCS+=("Banner khuyến mãi quán cà phê — màu nâu ấm, hình ảnh latte art, phong cách cozy lifestyle")
PROMPTS+=("A warm cozy Vietnamese coffee shop promotion Facebook banner. Rich coffee brown (#4A2C2A) and cream (#FFF8F0) color palette. Background: blurred bokeh of warm cafe interior lights. Foreground: beautiful latte art coffee cup with heart pattern in center, steam wisps rising. Left side: 'BUY 1 GET 1 FREE' offer badge in brushed gold circular stamp style. Right side: coffee bean pattern and minimal plant illustration. Bottom: store name placeholder and CTA button in cream. Warm, inviting, artisan coffee shop brand aesthetic. 1200x630.")

# ── 9. Gym/Fitness – X Post ─────────────────────────────────
NAMES+=("showcase-gym-fitness")
WIDTHS+=(1200); HEIGHTS+=(675)
LABELS+=("Thách Thức 30 Ngày Gym")
PLATFORMS+=("X/Twitter Post · 1200×675")
DESCS+=("Banner thách thức tập luyện — AI tạo visual động lực cao với năng lượng thể thao")
PROMPTS+=("A high-energy fitness gym challenge X (Twitter) post banner. Dark matte black background with electric lime green (#39FF14) and pure white accents. Left: dramatic low-angle view of gym dumbbells and weight plates with volumetric light cutting through. Right: bold geometric typography layout area for '30-DAY CHALLENGE'. Lightning bolt graphic elements and diagonal speed lines suggesting motion. Muscle fiber texture overlay at 10% opacity on background. Sweat droplet graphics. Motivational athletic design, aggressive and powerful. 1200x675. No people.")

# ── 10. Real Estate Agency – LinkedIn ───────────────────────
NAMES+=("showcase-realestate-linkedin")
WIDTHS+=(1200); HEIGHTS+=(630)
LABELS+=("Dự Án Chung Cư Luxury")
PLATFORMS+=("Facebook Post · 1200×630")
DESCS+=("Banner dự án BĐS cao cấp — AI render building CGI + overlay thông tin marketing theo chuẩn developer")
PROMPTS+=("A premium Vietnamese real estate luxury condominium project Facebook banner. Deep midnight navy (#0B1829) background with gold (#C9A84C) accent lines. Left 60%: photorealistic CGI render of a modern luxury high-rise tower at dusk with warm amber window lights and rooftop pool glowing. Right 40%: elegant typography layout with project name area, key amenities icons (pool, gym, parking, security) listed vertically in minimal icon style. Gold horizontal dividing line. Bottom: developer logo area and CTA button. Premium real estate brochure quality. 1200x630.")

# ── 11. Food Delivery App – Instagram Square ────────────────
NAMES+=("showcase-food-delivery")
WIDTHS+=(1080); HEIGHTS+=(1080)
LABELS+=("Ưu Đãi Giao Đồ Ăn")
PLATFORMS+=("Instagram Post · 1080×1080")
DESCS+=("Banner ưu đãi app giao đồ ăn — AI sắp xếp food photography stack đẹp mắt, màu sắc thèm ăn")
PROMPTS+=("A mouth-watering food delivery app promotion Instagram square post. Warm orange (#FF6B35) and bright yellow (#FFD23F) gradient background. Center: dramatic top-down overhead shot composition of a beautifully arranged Vietnamese food spread — pho bowl, banh mi, fresh spring rolls, rice dishes — all styled in professional food photography lighting style. Top left corner: delivery scooter icon badge in circular white bubble. Bottom: bold promotional offer text area with discount badge graphic. Scattered ingredient accents (herbs, chili, lime). Energetic and appetizing food service brand aesthetic. 1080x1080.")

# ── 12. Beauty Brand – Instagram Story ──────────────────────
NAMES+=("showcase-beauty-brand-story")
WIDTHS+=(1080); HEIGHTS+=(1920)
LABELS+=("BST Trang Điểm Mùa Hè")
PLATFORMS+=("Instagram Story · 1080×1920")
DESCS+=("Banner story beauty brand — AI tạo mood board makeup luxury với màu pastel premium, chuẩn editorial")
PROMPTS+=("A luxury beauty brand summer makeup collection Instagram Story banner. Soft coral peach (#F2A58E) fading to champagne white gradient background. Vertical layout 1080x1920. Scattered floating beauty product illustrations: lipstick tubes, eyeshadow compact, mascara wand, blush brush — arranged in a casual flat-lay style around center. Rose petals and gold leaf accent elements. Center: thin elegant serif text layout area for 'SUMMER GLOW COLLECTION'. Small color swatch dots in summer palette (coral, peach, gold, rose). Bottom: shop-now CTA with link sticker area. High-end K-beauty inspired aesthetic. Portrait vertical.")

# ── 13. Tech Gadget Launch – Facebook Cover ─────────────────
NAMES+=("showcase-tech-gadget")
WIDTHS+=(820); HEIGHTS+=(312)
LABELS+=("Ra Mắt Tai Nghe Wireless")
PLATFORMS+=("Facebook Cover · 820×312")
DESCS+=("Banner cover Facebook launch gadget — AI tạo product visualization 3D với lighting studio premium")
PROMPTS+=("A premium tech product launch Facebook cover banner for wireless earbuds. Pure gloss black background (#000000). Center: dramatic 3D product render of sleek white wireless earbuds case floating in space with cinematic studio rim lighting, reflection on black mirror surface below. Blue-to-purple gradient light aura behind the product. Small spec callout badges floating around product: 'ANC', '30H Battery', 'Hi-Fi Sound' in pill-shaped labels with blue glow. Apple/Sony product launch visual quality. Wide banner 820x312. No text in image.")

# ── 14. Travel Agency – Facebook Post ───────────────────────
NAMES+=("showcase-travel-agency")
WIDTHS+=(1200); HEIGHTS+=(630)
LABELS+=("Tour Du Lịch Đà Nẵng")
PLATFORMS+=("Facebook Post · 1200×630")
DESCS+=("Banner tour du lịch — AI phối ảnh destination đẹp + layout thông tin tour theo chuẩn travel agency")
PROMPTS+=("A stunning Vietnamese travel agency Facebook post banner for Da Nang tour packages. Full-bleed panoramic background: golden hour photography style of Da Nang beach from above — turquoise ocean, white sand, Dragon Bridge silhouette in background, purple-orange sunset sky. Warm cinematic color grade. Left overlay: translucent frosted glass card with tour package details layout area. Top: travel agency logo area in pill badge. Bottom strip: price tag badge in coral red, duration icons, 'BOOK NOW' CTA button. Wanderlust-inducing travel editorial aesthetic. 1200x630.")

# ── 15. E-Learning Platform – LinkedIn ──────────────────────
NAMES+=("showcase-elearning")
WIDTHS+=(1200); HEIGHTS+=(630)
LABELS+=("Khoá Học Data Science")
PLATFORMS+=("Facebook Post · 1200×630")
DESCS+=("Banner khoá học online — AI thiết kế layout giáo dục chuyên nghiệp, tạo trust với brand corporate")
PROMPTS+=("A professional e-learning platform Facebook post banner for a Data Science course. Clean gradient background: deep indigo (#1e1b4b) to electric blue (#3b82f6). Center left: abstract data visualization graphic — flowing line charts, bar graphs, neural network nodes, Python code fragments — all in glowing neon blue style. Right side: course info card in glassmorphism style (frosted white glass panel) with course title placeholder, 4-star rating stars, enrollment badge. 'ENROLL NOW' CTA button in accent amber. Certificate badge icon. Corporate education trustworthy premium aesthetic. 1200x630.")

# ═══════════════════════════════════════════════════════════════
# SUBMIT ALL JOBS
# ═══════════════════════════════════════════════════════════════

JOBIDS=()
echo "🎨 Generating ${#NAMES[@]} showcase banners..."
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
  echo "  [$((i+1))/${#NAMES[@]}] ${NAME} (${W}x${H}) → $JID"
  sleep 1
done

# ═══════════════════════════════════════════════════════════════
# POLL
# ═══════════════════════════════════════════════════════════════

echo ""
echo "⏳ Polling results (tuần tự, ~30s/ảnh)..."

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
      echo "✅ $NAME → $URL"
      curl -sL -o "${IMG_DIR}/${NAME}.png" "$URL"
      break
    elif [ "$ST" = "failed" ] || [ "$ST" = "error" ]; then
      echo "❌ $NAME FAILED"; break
    else
      printf "  ⏳ %s (%d/60)\\r" "$NAME" "$attempt"
    fi
  done
done

# ═══════════════════════════════════════════════════════════════
# UPLOAD → CLOUDFLARE
# ═══════════════════════════════════════════════════════════════

echo ""
echo "☁️  Uploading to Cloudflare Images..."
echo ""

# Write output mapping with full metadata
cat > "$OUTPUT_FILE" << 'HEADER'
#!/bin/bash
# AUTO-GENERATED: Social Banner AI — Showcase CDN URLs + metadata

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
    # Write full metadata entry
    cat >> "$OUTPUT_FILE" << ENTRY
SHOWCASE_${NAME//-/_}=(
  url="${URL}"
  label="${LABELS[$i]}"
  platform="${PLATFORMS[$i]}"
  desc="${DESCS[$i]}"
  width="${WIDTHS[$i]}"
  height="${HEIGHTS[$i]}"
)
ENTRY
    UPLOADED=$((UPLOADED + 1))
  else
    echo "❌  $(echo "$RESPONSE" | python3 -c "import sys,json; d=json.load(sys.stdin); print(d.get('errors','?'))" 2>/dev/null)"
  fi
  sleep 0.3
done

# Cleanup
rm -rf "$IMG_DIR"

echo ""
echo "═══════════════════════════════════════════════════════════"
echo "✅ Uploaded: $UPLOADED/${#NAMES[@]} → Cloudflare CDN"  
echo "📋 Metadata saved to: $OUTPUT_FILE"
echo "🗑  Deleted: $IMG_DIR"
echo "═══════════════════════════════════════════════════════════"
