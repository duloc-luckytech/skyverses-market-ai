---
description: Add a new AI product to Skyverses marketplace — full flow from seed to PRO landing page + smart workspace
---

# Add New Product to Skyverses Marketplace

// turbo-all — chỉ thị cho Claude agent chạy toàn bộ steps không dừng hỏi giữa chừng

Follow every step in order. Do NOT skip steps.

---

## STEP 0 — Read skills first

Before starting, read:
- `.agents/skills/skyverses_architecture/SKILL.md`
- `.agents/skills/skyverses_ui_pages/SKILL.md`

---

## STEP 1 — Define product metadata

Xác định trước khi làm bất cứ thứ gì:
- **slug**: e.g. `social-banner-ai`
- **id** (SCREAMING_SNAKE): e.g. `SOCIAL-BANNER-AI`
- **name** (4 langs: en/vi/ko/ja)
- **category** (4 langs)
- **description** (4 langs)
- **features** array (4 langs each)
- **priceCredits**: number
- **complexity**: `Standard` | `Advanced` | `Enterprise`
- **homeBlocks**: e.g. `['top_trending']`
- **tags**: array

---

## STEP 2 — Create seed script

Create `seed-<slug>.mjs` theo pattern `seed-products.mjs`:

```js
const API = 'https://api.skyverses.com/market';
const TOKEN = '<ADMIN_JWT_TOKEN>';
const product = {
  id: 'YOUR-ID',
  slug: 'your-slug',
  name: { en: '...', vi: '...', ko: '...', ja: '...' },
  category: { en: '...', vi: '...', ko: '...', ja: '...' },
  description: { en: '...', vi: '...', ko: '...', ja: '...' },
  problems: [...],
  industries: [...],
  imageUrl: 'https://images.unsplash.com/...', // placeholder
  demoType: 'image',
  tags: [...],
  features: [{ en: '...', vi: '...', ko: '...', ja: '...' }],
  complexity: 'Standard',
  priceReference: '120 CR / lần',
  isActive: true, isFree: false,
  priceCredits: 120, featured: true,
  homeBlocks: ['top_trending'],
};
async function seed() {
  const res = await fetch(API, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${TOKEN}` },
    body: JSON.stringify(product)
  });
  const data = await res.json();
  console.log(data.success ? `✅ _id=${data.data?._id}` : `❌ ${data.message}`);
}
seed();
```

```bash
node seed-<slug>.mjs
# → Ghi lại _id trả về
```

---

## STEP 2.5 — Verify seed

Sau khi seed, confirm product đã live:

```bash
curl https://api.skyverses.com/market/<slug>
# → Phải trả về { success: true, data: { slug, name, imageUrl, ... } }
```

Nếu 404 → kiểm tra lại TOKEN hoặc slug conflict.

---

## STEP 3 — Generate & update demo images (3-5 images per platform)

Tạo `gen-<slug>-images.mjs` — gen **NHIỀU ảnh** theo từng platform/use-case:

```js
const API = 'https://api.skyverses.com/market';
const TOKEN = '<SKV_API_TOKEN>';   // CMS Admin > API Clients
const PRODUCT_ID = '<_id từ STEP 2>';

// Định nghĩa 3-5 prompts theo từng platform phù hợp product
const DEMO_PROMPTS = [
  { platform: 'thumbnail',  prompt: 'main hero banner, cinematic premium quality, ...' },
  { platform: 'instagram',  prompt: 'instagram square 1:1 post, vibrant, ...' },
  { platform: 'facebook',   prompt: 'facebook landscape 16:9 banner, professional, ...' },
  { platform: 'story',      prompt: 'portrait 9:16 story format, mobile-first, ...' },
  { platform: 'wide',       prompt: 'ultrawide 21:9 cinematic cover, premium, ...' },
];

// Điều chỉnh DEMO_PROMPTS cho phù hợp loại product:
// - Image/Poster product → các định dạng banner phổ biến
// - Video product → các frame đại diện video (key frames)
// - Transform product (remove bg, upscale) → before/after pairs
// - Social product → platform-specific formats (IG, FB, TikTok, LinkedIn)

async function genAndUpload(item, index) {
  // 1. Gen ảnh qua Skyverses AI API
  const genRes = await fetch('https://api.skyverses.com/generate', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${TOKEN}` },
    body: JSON.stringify({ prompt: item.prompt, size: '1024x1024' })
  });
  const { imageUrl } = await genRes.json();

  if (index === 0) {
    // Ảnh đầu tiên = imageUrl chính của product
    await fetch(`${API}/${PRODUCT_ID}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${TOKEN}` },
      body: JSON.stringify({ imageUrl })
    });
    console.log(`✅ [${item.platform}] thumbnail → ${imageUrl}`);
  } else {
    // Ảnh còn lại → thêm vào demoImages array
    await fetch(`${API}/${PRODUCT_ID}/demo-images`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${TOKEN}` },
      body: JSON.stringify({ platform: item.platform, url: imageUrl })
    });
    console.log(`✅ [${item.platform}] demo → ${imageUrl}`);
  }
  return { platform: item.platform, url: imageUrl };
}

async function seed() {
  const results = [];
  for (let i = 0; i < DEMO_PROMPTS.length; i++) {
    const r = await genAndUpload(DEMO_PROMPTS[i], i);
    results.push(r);
  }
  console.log('\n📋 Tất cả CDN URLs (dùng cho STEP 3.5):');
  results.forEach(r => console.log(`  ${r.platform}: ${r.url}`));
}
seed();
```

```bash
node gen-<slug>-images.mjs
# Pipeline: Skyverses AI → Cloudflare CDN → PUT/PATCH /market/:id
# → Ghi lại TẤT CẢ CDN URLs trả về để dùng trong STEP 3.5
```

> ⚠️ `SKV_API_TOKEN` expired → hỏi user lấy token mới từ CMS Admin Tab "API Clients"

> **🚨 QUAN TRỌNG: Phải chạy luôn script ngay sau khi tạo — KHÔNG bỏ qua bước này.**
> Claude phải tự `node gen-<slug>-images.mjs` trước khi sang STEP 3.5.
> Ghi lại tất cả URL output để dùng làm `beforeSrc`/`afterSrc` (BeforeAfterSlider) hoặc platform grid.

---

## STEP 3.2 — Gen landing page block images (bash scripts)

> Tạo **3 bash scripts** để gen + upload Cloudflare CDN toàn bộ hình ảnh cho các khối block landing page.
> Làm **trước STEP 3.5** để có CDN URLs điền vào plan (câu 13 — Section Image Plan).
>
> **Tham chiếu pattern thực tế (đọc các file này trước khi tạo script mới):**
> - `scripts/gen_socialbanner_landing_images.sh` → FeaturesSection thumbs + WorkflowSection result + UseCasesSection cards + HeroSection demo
> - `scripts/gen_socialbanner_showcase.sh` → ShowcaseSection 15 example banners
> - `scripts/gen_socialbanner_feature_thumbs.sh` → FeaturesSection 6 non-featured cards
> - `scripts/gen_storyboard_landing.sh` → Full pipeline hoàn chỉnh nhất (parallel poll + auto CF upload)
> - `scripts/gen_aislide_landing_images.sh` → Pattern mới nhất: auto-detect size theo prefix naming (hero/features/step/usecase)
> - `scripts/gen_aislide_showcase.sh` → Pattern showcase MỚI: sinh cả `scripts/<slug>-showcase-cdn.sh` **VÀ** `src/constants/<slug>-showcase-cdn.ts` tự động
>
> **CDN URL output pattern (quan trọng — giữ nhất quán):**
> - Bash registry file: `scripts/<slug>-showcase-cdn.sh` → biến `CDN_showcase_<name>="https://imagedelivery.net/..."`
> - TypeScript constants: `src/constants/<slug>-showcase-cdn.ts` → export array `PRODUCT_SHOWCASE` để React import trực tiếp
>
> **🚨 Bắt buộc: ShowcaseSection PHẢI dùng real CDN images sau khi script chạy xong.**
> Không chấp nhận CSS gradient placeholder trong production.
> Khi CDN URLs có sẵn → cập nhật ShowcaseSection để import từ `@/constants/<slug>-showcase-cdn`.

> **⏱ Nếu script 3.2 chưa xong khi bắt đầu build STEP 4:**
> → Dùng Unsplash placeholder tạm (`https://images.unsplash.com/...`) để build sections trước.
> → Đánh dấu `// TODO: replace with CDN` tại mỗi URL placeholder.
> → Sau khi script chạy xong → find/replace toàn bộ `TODO: replace with CDN` bằng CDN URLs thực.

---

### Script 1 — `gen-<slug>-landing-images.sh` (main landing blocks)

> Gen tất cả hình cho: FeaturesSection (featured cards), WorkflowSection (step kết quả), UseCasesSection (cards), HeroSection (demo preview).

```bash
#!/bin/bash
# gen-<slug>-landing-images.sh
# Gen + Upload → Cloudflare CDN toàn bộ hình landing <ProductName>
# Run: bash scripts/gen-<slug>-landing-images.sh

API="https://api.skyverses.com/image-jobs"
TOKEN="Bearer <SKV_API_TOKEN>"          # CMS Admin > API Clients
CF_ACCOUNT="<CF_ACCOUNT_ID>"
CF_TOKEN="<CF_API_TOKEN>"
CF_API="https://api.cloudflare.com/client/v4/accounts/${CF_ACCOUNT}/images/v1"

IMG_DIR="public/assets/<slug>"
OUTPUT_FILE="scripts/<slug>-cdn-urls.sh"
mkdir -p "$IMG_DIR"

declare -a NAMES
declare -a PROMPTS

# ─── FeaturesSection — 2 featured card thumbnails (800x320) ─────────────────
# Naming: features-<feature-keyword>
NAMES+=("features-<feature-1-keyword>")
PROMPTS+=("<describe the visual for featured feature 1, relevant to product, premium dark aesthetic, no readable text, wide banner 800x320>")

NAMES+=("features-<feature-2-keyword>")
PROMPTS+=("<describe the visual for featured feature 2, relevant to product, premium dark aesthetic, no readable text, wide banner 800x320>")

# ─── WorkflowSection — step kết quả thumbnail (400x200) ──────────────────────
# Naming: workflow-result
NAMES+=("workflow-result")
PROMPTS+=("<show the product output displayed on a device mockup, professional quality, no readable text, 400x200>")

# ─── UseCasesSection — 4-6 use case cards (600x400) ──────────────────────────
# Naming: usecase-<industry-keyword>
# → Mỗi use case từ STEP 3.5 câu 10 cần 1 ảnh tương ứng
NAMES+=("usecase-<industry-1>")
PROMPTS+=("<visual for industry 1 use case, relevant to the specific industry context, no readable text, 600x400>")

NAMES+=("usecase-<industry-2>")
PROMPTS+=("<visual for industry 2 use case, 600x400>")

NAMES+=("usecase-<industry-3>")
PROMPTS+=("<visual for industry 3 use case, 600x400>")

NAMES+=("usecase-<industry-4>")
PROMPTS+=("<visual for industry 4 use case, 600x400>")

# Thêm usecase-5, usecase-6 nếu có thêm use cases

# ─── HeroSection — demo preview thumbnail (1200x630) ─────────────────────────
# Naming: hero-demo-<slug>
NAMES+=("hero-demo-<slug>")
PROMPTS+=("<a stunning 2x2 or 3-column grid collage of 3-4 example outputs from this product, pixel-perfect, premium quality, no readable text visible, 1200x630>")

# ═══════════════════════════════════════════════════════════════
# SUBMIT JOBS
# ═══════════════════════════════════════════════════════════════

JOBIDS=()
echo "🎨 <ProductName> Landing — Tạo ${#NAMES[@]} hình ảnh..."
echo ""

for i in "${!NAMES[@]}"; do
  NAME="${NAMES[$i]}"
  P="${PROMPTS[$i]}"

  # Auto-detect size theo prefix naming convention
  if   [[ "$NAME" == features-* ]]; then W=800;  H=320; RATIO="16:5"
  elif [[ "$NAME" == workflow-*  ]]; then W=400;  H=200; RATIO="2:1"
  elif [[ "$NAME" == usecase-*   ]]; then W=600;  H=400; RATIO="3:2"
  elif [[ "$NAME" == hero-*      ]]; then W=1200; H=630; RATIO="16:9"
  else                                    W=800;  H=450; RATIO="16:9"
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

cat > "$OUTPUT_FILE" << 'HEADER'
#!/bin/bash
# AUTO-GENERATED: Cloudflare CDN URLs for <ProductName> landing page
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
import sys, json
try:
    d = json.load(sys.stdin)
    v = d.get('result', {}).get('variants', [])
    print(next((x for x in v if x.endswith('/public')), v[0] if v else ''))
except: print('')
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

rm -rf "$IMG_DIR"
echo ""
echo "═══════════════════════════════════════════════════════════"
echo "✅ Uploaded: $UPLOADED/${#NAMES[@]} → Cloudflare CDN"
echo "📋 URLs saved to: $OUTPUT_FILE"
echo "🗑  Deleted: $IMG_DIR"
echo "═══════════════════════════════════════════════════════════"
cat "$OUTPUT_FILE"
```

```bash
bash scripts/gen-<slug>-landing-images.sh
# → Ghi lại CDN URLs (CDN_features_*, CDN_workflow_result, CDN_usecase_*, CDN_hero_demo_*)
# → Dùng cho STEP 3.5 câu 13 (Section Image Plan)
```

---

### Script 2 — `gen-<slug>-showcase.sh` (ShowcaseSection — 10-15 example outputs)

> Gen 10-15 banner/output ví dụ thực tế để hiển thị trong ShowcaseSection marquee.
> Mỗi ảnh minh hoạ một use case/platform output khác nhau của product.

```bash
#!/bin/bash
# gen-<slug>-showcase.sh
# Gen 10-15 showcase example outputs cho ShowcaseSection
# Run: bash scripts/gen-<slug>-showcase.sh

API="https://api.skyverses.com/image-jobs"
TOKEN="Bearer <SKV_API_TOKEN>"
CF_ACCOUNT="<CF_ACCOUNT_ID>"
CF_TOKEN="<CF_API_TOKEN>"
CF_API="https://api.cloudflare.com/client/v4/accounts/${CF_ACCOUNT}/images/v1"

IMG_DIR="public/assets/<slug>-showcase"
OUTPUT_FILE="scripts/<slug>-showcase-cdn.sh"
mkdir -p "$IMG_DIR"

# Format: NAMES / PROMPTS / LABELS / DESCS / WIDTHS / HEIGHTS
declare -a NAMES PROMPTS LABELS DESCS WIDTHS HEIGHTS

# ── 1. <Example output type 1 — e.g. Flash Sale banner> ────────────────
NAMES+=("<slug>-example-01")
WIDTHS+=(1200); HEIGHTS+=(630)
LABELS+=("<Label tiếng Việt ngắn — VD: Flash Sale 11.11>")
DESCS+=("<Mô tả ngắn use case tiếng Việt — VD: Banner sale lớn nhất năm với AI>")
PROMPTS+=("<Full English prompt describing a realistic, premium-quality output example for this product. Specific industry/use case context. No readable text in image. Appropriate dimensions.>")

# ── 2. <Example output type 2> ─────────────────────────────────────────
NAMES+=("<slug>-example-02")
WIDTHS+=(820); HEIGHTS+=(312)
LABELS+=("<Label 2>")
DESCS+=("<Desc 2>")
PROMPTS+=("<Prompt 2>")

# ... thêm 8-13 examples nữa, đa dạng industry/use case/size
# Quy tắc:
# - Mỗi example phải khác industry hoặc format (đừng gen cùng 1 kiểu)
# - Mix sizes: 1200x630 (FB post), 820x312 (FB cover), 1080x1080 (IG), 1080x1920 (story), 1200x675 (X post)
# - Label + Desc tiếng Việt rõ ràng để hiển thị trong metadata

# ═══════════════════════════════════════════════════════════════
# SUBMIT ALL JOBS
# ═══════════════════════════════════════════════════════════════

JOBIDS=()
echo "🎨 Generating ${#NAMES[@]} showcase examples..."
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

# POLL (sequential)
echo ""
echo "⏳ Polling results (~30s/image)..."

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

# UPLOAD → CLOUDFLARE (with full metadata)
echo ""
echo "☁️  Uploading to Cloudflare Images..."
echo ""

cat > "$OUTPUT_FILE" << 'HEADER'
#!/bin/bash
# AUTO-GENERATED: <ProductName> Showcase CDN URLs + metadata
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
    v = d.get('result', {}).get('variants', [])
    print(next((x for x in v if x.endswith('/public')), v[0] if v else ''))
except: print('')
" 2>/dev/null)

  if [ "$SUCCESS" = "True" ] && [ -n "$URL" ]; then
    echo "✅  $URL"
    cat >> "$OUTPUT_FILE" << ENTRY
SHOWCASE_${NAME//-/_}=(
  url="${URL}"
  label="${LABELS[$i]}"
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

rm -rf "$IMG_DIR"
echo ""
echo "═══════════════════════════════════════════════════════════"
echo "✅ Uploaded: $UPLOADED/${#NAMES[@]} → Cloudflare CDN"
echo "📋 Metadata saved to: $OUTPUT_FILE"
echo "═══════════════════════════════════════════════════════════"
```

```bash
bash scripts/gen-<slug>-showcase.sh
# → Output 1: scripts/<slug>-showcase-cdn.sh   (bash registry — CDN_showcase_<name>="...")
# → Output 2: src/constants/<slug>-showcase-cdn.ts  (TS export array để React import trực tiếp)
# → ShowcaseSection.tsx PHẢI import từ constants file sau khi có CDN URLs:
#   import { PRODUCT_SHOWCASE } from '@/constants/<slug>-showcase-cdn';
#   // Thay thế CSS gradient placeholder bằng real <img src={item.cdnUrl} />
```

> **Pattern mới nhất:** Xem `scripts/gen_aislide_showcase.sh` làm reference — script này tự động
> sinh cả bash registry **VÀ** TypeScript constants file trong 1 lần chạy.
> Không cần copy URL thủ công.

---

### Script 3 — `gen-<slug>-feature-thumbs.sh` (FeaturesSection non-featured cards)

> Gen 4-6 thumbnail nhỏ (600x300) cho các feature card thường (non-featured) trong FeaturesSection.
> Mỗi thumb minh hoạ concept của 1 tính năng cụ thể — abstract, minimal, no text.

```bash
#!/bin/bash
# gen-<slug>-feature-thumbs.sh
# Gen 4-6 thumbnails cho non-featured feature cards (600x300)
# Run: bash scripts/gen-<slug>-feature-thumbs.sh

API="https://api.skyverses.com/image-jobs"
TOKEN="Bearer <SKV_API_TOKEN>"
CF_ACCOUNT="<CF_ACCOUNT_ID>"
CF_TOKEN="<CF_API_TOKEN>"
CF_API="https://api.cloudflare.com/client/v4/accounts/${CF_ACCOUNT}/images/v1"

IMG_DIR="public/assets/<slug>-feature-thumbs"
OUTPUT="scripts/<slug>-feature-thumbs-cdn.sh"
mkdir -p "$IMG_DIR"

NAMES=(); PROMPTS=()

# Naming: feat-<feature-keyword>
# Mỗi prompt: abstract illustration của feature concept, dark background, no text, 600x300

NAMES+=("feat-<feature-1>")
PROMPTS+=("<abstract visual concept for feature 1 — minimal, dark background, no text, 600x300 wide>")

NAMES+=("feat-<feature-2>")
PROMPTS+=("<abstract visual concept for feature 2 — 600x300 wide>")

NAMES+=("feat-<feature-3>")
PROMPTS+=("<abstract visual concept for feature 3 — 600x300 wide>")

NAMES+=("feat-<feature-4>")
PROMPTS+=("<abstract visual concept for feature 4 — 600x300 wide>")

# Thêm feat-5, feat-6 nếu cần

echo "🚀 Submitting ${#NAMES[@]} feature thumb jobs..."
JOBIDS=()

for i in "${!NAMES[@]}"; do
  R=$(curl -s -X POST "$API" \
    -H "Content-Type: application/json" \
    -H "Authorization: $TOKEN" \
    -d "{\"type\":\"text_to_image\",\"input\":{\"prompt\":\"${PROMPTS[$i]}\"},\"config\":{\"width\":600,\"height\":300,\"aspectRatio\":\"2:1\",\"seed\":0,\"style\":\"\"},\"engine\":{\"provider\":\"gommo\",\"model\":\"google_image_gen_4_5\"},\"enginePayload\":{\"prompt\":\"${PROMPTS[$i]}\",\"privacy\":\"PRIVATE\",\"projectId\":\"default\"}}")
  JID=$(echo "$R" | python3 -c "import sys,json; print(json.load(sys.stdin)['data']['jobId'])" 2>/dev/null)
  JOBIDS+=("$JID")
  echo "  [$((i+1))/${#NAMES[@]}] ${NAMES[$i]} → $JID"
  sleep 0.5
done

echo ""
echo "⏳ Polling in parallel..."

poll_job() {
  local NAME="$1" JID="$2" OUTDIR="$3" TK="$4"
  for attempt in $(seq 1 60); do
    sleep 5
    SR=$(curl -s "https://api.skyverses.com/image-jobs/$JID" -H "Authorization: $TK")
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
  poll_job "${NAMES[$i]}" "${JOBIDS[$i]}" "$IMG_DIR" "$TOKEN" &
  PIDS+=($!)
done
for PID in "${PIDS[@]}"; do wait "$PID"; done

echo ""
echo "☁️  Uploading to Cloudflare..."

cat > "$OUTPUT" << 'HDR'
#!/bin/bash
# AUTO-GENERATED: <ProductName> Feature Thumbnails CDN
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
  else echo "❌"; fi
  sleep 0.3
done

rm -rf "$IMG_DIR"
echo ""
echo "════════════════════════════════════"
echo "✅ Uploaded: $UPLOADED/${#NAMES[@]} → Cloudflare"
echo "📋 Saved: $OUTPUT"
echo "════════════════════════════════════"
cat "$OUTPUT"
```

```bash
bash scripts/gen-<slug>-feature-thumbs.sh
# → Output: CDN_feat_<feature-1>="...", CDN_feat_<feature-2>="..."
# → Dùng URLs này làm thumbUrl cho feature objects trong FeaturesSection
```

---

### Bảng mapping: CDN URL → Dùng ở đâu

| CDN variable | Dùng trong | Cách dùng |
|---|---|---|
| `CDN_features_<keyword>` | `FeaturesSection.tsx` | `thumbUrl` của 2 featured cards (col-span-2) |
| `CDN_feat_<keyword>` | `FeaturesSection.tsx` | `thumbUrl` của non-featured cards (optional) |
| `CDN_workflow_result` | `WorkflowSection.tsx` | `CDN_RESULT_THUMB` — step cuối "Nhận kết quả" |
| `CDN_usecase_<industry>` | `UseCasesSection.tsx` | Nếu muốn thêm `imgUrl` vào use case card |
| `CDN_hero_demo_<slug>` | `HeroSection.tsx` | `CDN_DEMO` trong `StaticDemoMockup` visual type |
| `CDN_showcase_<name>` | `ShowcaseSection.tsx` | Từ bash registry `scripts/<slug>-showcase-cdn.sh` |
| `src/constants/<slug>-showcase-cdn.ts` | `ShowcaseSection.tsx` | **TS constants** — import trực tiếp vào React, thay CSS gradient placeholder bằng real `<img>` |

> **Thứ tự chạy scripts:**
> 1. `bash scripts/gen-<slug>-landing-images.sh`     ← main blocks (features, workflow, usecases, hero)
> 2. `bash scripts/gen-<slug>-showcase.sh`           ← sinh ra CẢ bash registry VÀ TS constants file
> 3. `bash scripts/gen-<slug>-feature-thumbs.sh`     ← non-featured cards thumbs (optional)
>
> Sau khi script 2 xong → update `ShowcaseSection.tsx`:
> ```tsx
> import { PRODUCT_SHOWCASE } from '@/constants/<slug>-showcase-cdn';
> // Thay mảng SLIDES hardcode thành PRODUCT_SHOWCASE
> // Dùng <img src={item.cdnUrl} className="w-full h-full object-cover" /> thay gradient div
> ```
>
> ⚠️ **Bắt buộc gitignore scripts chứa TOKEN:**
> ```bash
> echo "gen-*.sh" >> .gitignore   # hoặc move vào .gitignore theo slug
> ```
> → TOKEN trong scripts **không được commit lên git**.

---

### Quy tắc viết PROMPT cho block images

| Block | Size | Quy tắc prompt |
|-------|------|----------------|
| `features-*` | 800×320 | Abstract concept của tính năng. Dark matte BG. No text. Premium tool aesthetic. Wide. |
| `workflow-result` | 400×200 | Output của product trên device mockup. Professional. No text. Wide. |
| `usecase-*` | 600×400 | Visual đặc trưng ngành/context cụ thể. No text. Premium photography/illustration. |
| `hero-demo-*` | 1200×630 | Grid collage 3-4 output examples. Pixel-perfect. No readable text. Cinematic. |
| Showcase | Mixed | Realistic output example: đúng loại content product tạo ra. Từng cái khác industry. |
| `feat-*` | 600×300 | Abstract minimal concept. Dark BG. No text. 2:1 wide. |

---

## STEP 3.5 — Plan PRO landing page (Claude Code tự phân tích)

> **Không dùng script external.** Claude Code tự plan content phù hợp business của product.

---

### ⚠️ QUY TẮC QUAN TRỌNG — Xác định loại product trước khi plan

Trước khi làm bất cứ thứ gì trong STEP 3.5, xác định ngay:

| Loại product | Ví dụ | Bắt buộc |
|---|---|---|
| **Tạo ảnh** (image generation) | AI Image Generator, Poster Marketing, Social Banner | ✅ **PHẢI dùng `ModelEngineSettings`** ở STEP 6.5 |
| **Tạo video** (video generation) | AI Video Generator, Video Animate, Fibus Studio | ✅ **PHẢI dùng `ModelEngineSettings`** ở STEP 6.5 |
| **Transform ảnh** (không gen AI model) | Remove Background, Image Upscale, Restore | ❌ Bỏ qua STEP 6.5 |
| **Tool/Workflow** (không tạo media) | AI Agent, Qwen Chat, Automation | ❌ Bỏ qua STEP 6.5 |

> **Nếu product thuộc loại tạo ảnh hoặc tạo video:**
> → Đặt ghi chú ngay đây: `⚡ STEP 6.5 bắt buộc — dùng ModelEngineSettings`
> → TUYỆT ĐỐI KHÔNG tự build UI server/model/mode/resolution riêng trong workspace
> → Xem chi tiết pattern tại **STEP 6.5** bên dưới

---

### A. Phân tích product → chọn Hero Visual Type:

| Visual Type | Dùng khi | Component |
|-------------|----------|-----------|
| `ImageMasonryGrid` | Product tạo/chỉnh ảnh | `<ImageMasonryGrid type="image" />` |
| `VideoReelGrid` | Product tạo/xử lý video | `<VideoReelGrid fetchFromExplorer />` |
| `BeforeAfterSlider` | Product transform ảnh (xóa nền, restore, upscale) | `<BeforeAfterSlider beforeSrc afterSrc />` |
| `PlatformMockupGrid` | Product tạo banner/content cho mạng xã hội | custom platform grid |
| `Custom` | Nếu không có template phù hợp | Tự code right column |

### B. Phân tích product → trả lời 13 câu hỏi:

```
1. HERO VISUAL TYPE: [chọn từ bảng trên]
   → Import component từ components/landing/_shared/ProHeroVisuals.tsx

2. KEY SPECS (4 items):
   Số liệu / tính năng nổi bật nhất?
   VD: "14+ Formats", "4K Export", "AI Prompt Boost", "60s Processing"

3. WORKFLOW STEPS (4 bước):
   User dùng product theo flow nào? Liệt kê 4 bước tự nhiên.

4. FEATURES (6-8 items cho bento-grid):
   Phân loại: 1-2 "featured" (double size) + còn lại normal
   Featured = tính năng QUAN TRỌNG NHẤT

5. MEDIA OUTPUT TYPE:
   Explorer API type: 'image' | 'video'
   productSlug để filter showcase (nếu API hỗ trợ tag filter)
   Caption theme: mô tả ngắn hiển thị trên ảnh showcase
   → Dùng cho ShowcaseSection + FeaturesSection thumbUrl

6. SEO — Điền đầy đủ 5 trường sau (dùng thẳng vào `usePageMeta` ở STEP 5):

   **a. title** — Công thức: `{Tính năng chính} — {Keyword tìm kiếm} | Skyverses`
      - Độ dài: 50-60 ký tự (Google cắt sau ~60 ký tự)
      - Bắt đầu bằng từ khoá người Việt thực sự tìm kiếm
      - VD: `Tạo Banner AI — Thiết kế mạng xã hội tự động | Skyverses`
      - VD: `Xóa Nền Ảnh AI — Background Removal miễn phí | Skyverses`

   **b. description** — Công thức: `{Verb mạnh} + {tính năng 1} + {tính năng 2}. {Use case cụ thể}. {CTA ngắn}.`
      - Độ dài: 140-160 ký tự (Google cắt sau ~160 ký tự)
      - Bao gồm ít nhất 1 con số cụ thể (VD: "8K", "60s", "14 định dạng")
      - Tránh từ chung chung như "công cụ AI tốt nhất" — dùng lợi ích cụ thể
      - VD: `Tạo banner Facebook, Instagram, TikTok chỉ trong 60 giây bằng AI. Hỗ trợ 14+ định dạng, không cần kỹ năng thiết kế. Thử miễn phí ngay.`

   **c. keywords** — 6-10 từ khoá, phân cách bằng dấu phẩy
      - 3-4 từ khoá chính (tiếng Việt, người thực sự tìm)
      - 2-3 từ khoá dài (long-tail, intent cao)
      - 1-2 từ khoá thương hiệu
      - VD: `tạo banner AI, thiết kế mạng xã hội AI, social media banner tự động, AI banner generator, Skyverses banner AI`

   **d. canonical** — `/product/{slug}` (khớp với route trong App.tsx)

   **e. jsonLd** — SoftwareApplication schema (bắt buộc nếu product tạo output ảnh/video):
   ```json
   {
     "@type": "SoftwareApplication",
     "name": "{Tên product tiếng Anh}",
     "applicationCategory": "MultimediaApplication",
     "operatingSystem": "Web",
     "offers": {
       "@type": "Offer",
       "price": "{priceCredits}",
       "priceCurrency": "CREDITS"
     },
     "description": "{description tiếng Anh ngắn}",
     "url": "https://ai.skyverses.com/product/{slug}",
     "provider": {
       "@type": "Organization",
       "name": "Skyverses",
       "url": "https://ai.skyverses.com"
     }
   }
   ```
   → Dùng `"MultimediaApplication"` cho image/video product
   → Dùng `"BusinessApplication"` cho workflow/automation product
   → Dùng `"UtilitiesApplication"` cho utility tools (upscale, remove bg, convert)

7. WORKSPACE STYLE PRESETS (6 presets):
   Phù hợp với từng product — thay DEFAULT_STYLES trong AISuggestPanel
   VD video product: Cinematic, Motion, Story, Promo, Social, Artistic

8. FEATURED TEMPLATES (3-5 mẫu):
   Prompt templates cụ thể cho product này, user click dùng ngay

9. DEMO IMAGES (từ STEP 3 — CDN URLs đã gen):
   Liệt kê 3-5 CDN URLs đã gen → dùng cho HeroSection right column
   - Nếu Visual Type là `BeforeAfterSlider` → chọn 1 URL làm `beforeSrc` + 1 URL làm `afterSrc`
   - Nếu Visual Type là `PlatformMockupGrid` → map từng URL theo đúng `platform` key
   - Nếu Visual Type là `ImageMasonryGrid` → dùng ảnh từ Explorer API (không cần hardcode)

10. USE CASES (4-6 business scenarios):
    Ai sẽ dùng product này? Mô tả 4-6 use case theo ngành cụ thể:
    VD: { icon: Store, title: 'Cửa hàng online', desc: 'Tạo banner sale trong 60s, không cần designer' }
    VD: { icon: Building, title: 'Agency Marketing', desc: 'Scale content x10 với AI batch generation' }
    → Dùng cho `UseCasesSection.tsx` + define INDUSTRIES trong STEP 6 Workspace

11. LIVE STATS (cho LiveStatsBar — L2):
    3-4 con số social proof phù hợp product:
    VD image product: "Ảnh tạo hôm nay", "Người dùng", "Định dạng hỗ trợ", "Đánh giá TB"
    VD video product: "Video tạo hôm nay", "Người dùng", "Phút video", "Đánh giá TB"

12. FAQ (5-6 câu hỏi cho FAQSection — L3):
    Câu hỏi phổ biến nhất của người dùng mới về product này?
    Luôn bao gồm: quyền sở hữu ảnh/video, hết hạn credits, chất lượng output

13. SECTION IMAGE PLAN:
    Mỗi section nên có ít nhất 1 hình ảnh minh hoạ từ CDN hoặc Explorer API.
    → HeroSection: dùng Visual Type nào? (từ câu 1) → import component tương ứng từ ProHeroVisuals
    → WorkflowSection: có CDN URL để thêm result thumbnail vào step cuối không? (optional)
    → FeaturesSection: featured cards nào nên có thumbUrl? Map CDN URL cho mỗi featured feature.
    → ShowcaseSection: type="image" hay type="video"? (từ câu 5)
    → Xem hướng dẫn chi tiết tại "Section Image Guidelines" (STEP 3.6) bên dưới.
```

---

## STEP 3.6 — Section Image Guidelines — Code Patterns chi tiết

> Tham chiếu code patterns cho từng Visual Type đã chọn ở STEP 3.5 câu 1 + 13.
> Nguồn ảnh theo thứ tự ưu tiên: CDN STEP 3 → Explorer API (auto-fetch) → Unsplash placeholder.

### Bảng quyết định: Dùng ảnh loại nào ở đâu?

| Section | Loại ảnh nên dùng | Source | Pattern |
|---------|-------------------|--------|---------|
| **HeroSection** | Output mockup / platform preview grid | CDN từ STEP 3 hoặc Explorer API | Xem Hero Visual Types bên dưới |
| **WorkflowSection** | Icon-only + tuỳ chọn 1 result thumbnail ở step cuối | Lucide icons / CDN STEP 3 | Xem WorkflowSection Image Pattern |
| **ShowcaseSection** | Gallery thực từ community | Explorer API | `<ShowcaseImageStrip type="image" limit={20} />` |
| **FeaturesSection** | Icon-only + tuỳ chọn `thumbUrl` cho featured cards | Lucide icons / CDN STEP 3 | Xem Feature Image Pattern |
| **UseCasesSection** | Icon-only (không cần ảnh) | Lucide icons | `<uc.icon size={18} />` |
| **FinalCTA** | Không có ảnh — gradient mesh background | `<GradientMesh />` | Chỉ text + button |

---

### Hero Visual Types — Code Patterns

#### 1. `ImageMasonryGrid` — Product tạo/chỉnh ảnh
```tsx
// Import:
import { ImageMasonryGrid } from '../_shared/ProHeroVisuals';

// Usage (tự fetch từ Explorer API, không cần hardcode URL):
<div className="lg:col-span-7 relative">
  <ImageMasonryGrid type="image" limit={12} columns={3} />
  <FloatingBadge label="AI Generated" value="120 CR / lần" delay={0.8}
    className="absolute -bottom-3 -left-3" />
</div>

// Khi nào dùng: ai-image-generator, poster-marketing, product-image, fashion-center
```

#### 2. `BeforeAfterSlider` — Product transform ảnh
```tsx
// Import:
import { BeforeAfterSlider } from '../_shared/ProHeroVisuals';

// Usage (dùng CDN URLs từ STEP 3):
const BEFORE_URL = 'https://imagedelivery.net/.../before/public';  // URL từ STEP 3
const AFTER_URL  = 'https://imagedelivery.net/.../after/public';   // URL từ STEP 3

// Nếu chưa có CDN URLs → dùng Unsplash placeholder tạm:
const BEFORE_URL = 'https://images.unsplash.com/photo-XXXXX?auto=format&fit=crop&q=60&w=800';
const AFTER_URL  = 'https://images.unsplash.com/photo-XXXXX?auto=format&fit=crop&q=100&w=800';

<div className="lg:col-span-7 relative">
  <BeforeAfterSlider
    beforeSrc={BEFORE_URL}
    afterSrc={AFTER_URL}
    beforeLabel="Trước"
    afterLabel="Sau — AI"
    aspectRatio="4/3"
  />
  <FloatingBadge label="Chất lượng" value="4K Output" delay={0.8}
    className="absolute -bottom-3 -left-3" />
</div>

// Khi nào dùng: background-removal, image-restoration, image-upscale
```

#### 3. `VideoReelGrid` — Product video
```tsx
// Import:
import { VideoReelGrid } from '../_shared/ProHeroVisuals';

// Usage (tự fetch từ Explorer API):
<div className="lg:col-span-7 relative">
  <VideoReelGrid fetchFromExplorer limit={6} />
  <FloatingBadge label="Chất lượng" value="4K · 60fps" delay={0.8}
    className="absolute -bottom-3 -left-3" />
</div>

// Khi nào dùng: ai-video-generator, video-animate, fibus-video-studio
```

#### 4. `PlatformMockupGrid` — Product social banner/content
```tsx
// Tự build custom grid (không có sẵn component) — dùng CDN URLs từ STEP 3:
const CDN_URLS = {
  'fb-cover':  'https://imagedelivery.net/.../public',  // URL từ STEP 3
  'x-header':  'https://imagedelivery.net/.../public',
  'ig-post':   'https://imagedelivery.net/.../public',
};

<div className="lg:col-span-7 relative">
  <div className="space-y-3 rounded-2xl border border-black/[0.06] dark:border-white/[0.04] p-4">
    {/* Facebook row */}
    <div className="grid grid-cols-2 gap-2">
      <div className="aspect-[820/312] rounded-lg overflow-hidden relative">
        <img src={CDN_URLS['fb-cover']} className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 flex items-end p-2">
          <span className="text-[8px] text-white font-semibold">Facebook Cover 820×312</span>
        </div>
      </div>
      {/* ... more platform cards */}
    </div>
  </div>
  <FloatingBadge label="Pixel-perfect" value="80 CR / lần" delay={0.8}
    className="absolute -bottom-3 -left-3" />
</div>

// Khi nào dùng: social-banner-ai, poster-marketing
```

#### 5. Custom `StaticDemoMockup` — Product UI/Tool
```tsx
// Tự build app mockup (giống PosterMarketingAI hero) — dùng CDN URL từ STEP 3:
const CDN_DEMO = 'https://imagedelivery.net/.../public';  // URL từ STEP 3

<div className="lg:col-span-7 relative">
  <div className="aspect-[16/10] bg-white dark:bg-[#0a0a0c] border border-slate-200 dark:border-white/5 rounded-2xl p-4 shadow-2xl overflow-hidden group">
    {/* Fake app UI chrome */}
    <div className="flex gap-1.5 mb-3">
      <div className="w-2.5 h-2.5 rounded-full bg-red-400/60" />
      <div className="w-2.5 h-2.5 rounded-full bg-amber-400/60" />
      <div className="w-2.5 h-2.5 rounded-full bg-emerald-400/60" />
    </div>
    {/* Main demo image */}
    <div className="flex-1 rounded-xl overflow-hidden">
      <img src={CDN_DEMO} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
    </div>
  </div>
  <FloatingBadge label="Output" value="Ready to use" delay={0.8}
    className="absolute -bottom-3 -right-3" />
</div>

// Khi nào dùng: ai-agent-workflow, qwen-chat, automation tools
```

---

### Feature Image Pattern — Trong FeaturesSection

> Nếu product có output ảnh rõ ràng, 1-2 "featured" cards có thể kèm thumbnail nhỏ:

```tsx
// featured card có thể kèm ảnh minh hoạ:
const CDN_FEATURE_THUMB = 'https://imagedelivery.net/.../public';  // URL từ STEP 3

{features.map(f => (
  <HoverCard
    key={f.title}
    className={`p-5 ${f.featured ? 'col-span-2' : 'col-span-1'} bg-black/[0.01] dark:bg-white/[0.015]`}
  >
    {/* Featured card: icon + optional thumbnail */}
    {f.featured && f.thumbUrl && (
      <div className="w-full h-28 rounded-xl overflow-hidden mb-3 border border-black/[0.06] dark:border-white/[0.04]">
        <img src={f.thumbUrl} className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity" />
      </div>
    )}
    <f.icon size={22} className="text-brand-blue mb-3" />
    <h3 className="text-sm font-semibold mb-1">{f.title}</h3>
    <p className="text-[12px] text-slate-500 dark:text-[#666] leading-relaxed">{f.desc}</p>
  </HoverCard>
))}

// → Thêm thumbUrl?: string vào feature object khi cần
```

---

### WorkflowSection Image Pattern — Step kết quả (Optional)

> Nếu product tạo ra output ảnh rõ ràng (image-generator, banner, poster, restoration...), WorkflowSection có thể kèm 1 thumbnail nhỏ vào **step cuối** (Nhận kết quả) để tăng visual proof.

```tsx
// 1 CDN URL đại diện output đẹp nhất (từ STEP 3)
const CDN_RESULT_THUMB = 'https://imagedelivery.net/.../public';

{steps.map((step) => (
  <HoverCard key={step.n} className="p-5">
    {/* Chỉ step cuối mới có result thumbnail */}
    {step.n === steps.length && CDN_RESULT_THUMB && (
      <div className="w-full h-20 rounded-lg overflow-hidden mb-3 border border-black/[0.06] dark:border-white/[0.04]">
        <img
          src={CDN_RESULT_THUMB}
          alt="Kết quả AI"
          className="w-full h-full object-cover opacity-75"
          loading="lazy"
        />
      </div>
    )}
    <motion.div
      whileHover={{ rotate: 5, scale: 1.05 }}
      transition={{ type: 'spring', stiffness: 400, damping: 15 }}
      className="w-10 h-10 rounded-xl bg-brand-blue/10 text-brand-blue mb-3 flex items-center justify-center"
    >
      <step.icon size={20} />
    </motion.div>
    <p className="text-[10px] font-bold text-brand-blue mb-1">BƯỚC {step.n}</p>
    <h3 className="text-sm font-semibold mb-1">{step.title}</h3>
    <p className="text-xs text-slate-500 dark:text-[#666] leading-relaxed">{step.desc}</p>
  </HoverCard>
))}

// → Hoàn toàn optional. Nếu chưa có CDN URL → bỏ qua, icon-only vẫn ổn.
// → Không thêm cho WorkflowSection của product UI/tool (không có output ảnh rõ ràng)
```

---

### Nguồn ảnh — Fallback Priority

> Khi cần URL ảnh cho bất kỳ section nào, dùng theo thứ tự ưu tiên sau:

| Ưu tiên | Nguồn | Dùng khi | Ví dụ |
|---------|-------|----------|-------|
| **1** | **CDN từ STEP 3** (`imagedelivery.net`) | Đã chạy `node gen-<slug>-images.mjs` thành công | `https://imagedelivery.net/xxx/public` |
| **2** | **Explorer API** (tự fetch qua component) | Component tự fetch — không cần hardcode URL | `<ImageMasonryGrid />`, `<ShowcaseImageStrip />` |
| **3** | **Unsplash placeholder** | Chưa có CDN URL, cần ship demo nhanh | `https://images.unsplash.com/photo-XXXX?auto=format&fit=crop&q=80&w=800` |

```tsx
// Unsplash fallback — format chuẩn:
// ?auto=format&fit=crop&q=80&w=800  → cho thumbnail nhỏ (WorkflowSection, FeaturesSection)
// ?auto=format&fit=crop&q=80&w=1200 → cho ảnh lớn (HeroSection BeforeAfterSlider)
// Tìm ảnh phù hợp tại unsplash.com/s/photos/<keyword> trước khi chọn photo-ID
```

> ⚠️ **Unsplash chỉ là placeholder tạm** — nên thay bằng CDN từ STEP 3 trước khi production.

---

### ShowcaseSection — `ShowcaseImageStrip` (quan trọng)

`ShowcaseImageStrip` là component **auto-scrolling marquee** lấy ảnh từ Explorer API.
Import từ `ProHeroVisuals`, **không phải** từ `SectionAnimations`:

```tsx
// ✅ ĐÚNG:
import { ShowcaseImageStrip } from '../_shared/ProHeroVisuals';

// ❌ SAI:
import { ShowcaseImageStrip } from '../_shared/SectionAnimations'; // không có ở đây

// Usage trong ShowcaseSection.tsx:
<ShowcaseImageStrip type="image" limit={20} />   // cho product tạo ảnh
<ShowcaseImageStrip type="video" limit={12} />   // cho product tạo video

// Props đầy đủ:
interface ShowcaseImageStripProps {
  type: 'image' | 'video';
  limit?: number;       // default 20
  className?: string;
}
```

---

## STEP 4 — Build PRO landing sections

Tạo **8 file riêng** trong `components/landing/<slug>/`:

```
HeroSection.tsx          ← ProHeroVisuals + GradientMesh + inline demo widget (L5)
LiveStatsBar.tsx         ← CountUp social proof numbers (L2)
WorkflowSection.tsx      ← StaggerChildren + TimelineConnector
ShowcaseSection.tsx      ← ShowcaseImageStrip từ Explorer (nhận productSlug prop)
FeaturesSection.tsx      ← Bento-grid + StaggerChildren + hover expand
UseCasesSection.tsx      ← 4-6 use case cards theo ngành (sau FeaturesSection)
FAQSection.tsx           ← Accordion 5-6 câu hỏi (L3)
FinalCTA.tsx             ← Animated CTA + trust micro-copy (L1)
```

### Thứ tự sections — lý do cố định (KHÔNG được đảo):

```
1. HeroSection       — First impression: visual impact + value prop rõ ngay
2. LiveStatsBar      — Social proof sớm: số liệu tạo trust ngay sau hero
3. WorkflowSection   — Education: giải thích cách dùng trước khi thuyết phục
4. ShowcaseSection   — FOMO trigger: thấy người khác dùng → muốn thử
5. FeaturesSection   — Benefits deep-dive: sau khi đã quan tâm mới đọc features
6. UseCasesSection   — Relevance: "sản phẩm này dành cho mình không?"
7. FAQSection        — Objection handling: giải quyết lo ngại trước khi CTA cuối
8. FinalCTA          — Conversion push: CTA lúc user đã qua đủ trust signals
[Sticky mobile CTA]  — Persistent: luôn accessible khi scroll bất kỳ đâu
```

> **Nguyên tắc:** Awareness → Interest → Desire → Action (AIDA).
> Đừng đặt FeaturesSection trước WorkflowSection — user chưa hiểu cách dùng, đọc features không đọng.

### Imports chuẩn cho mọi section:

```tsx
// Animations (từ SectionAnimations):
import {
  FadeInUp,           // scroll fade + slide up
  FadeInScale,        // scroll fade + scale
  StaggerChildren,    // stagger entrance khi scroll
  ParallaxSection,    // subtle parallax depth
  CountUp,            // animated number counter
  GradientMesh,       // animated brand-blue/indigo blob background
  SectionLabel,       // uppercase section label pill (brand-blue/60)
  HoverCard,          // card với hover lift + blue glow border
  TimelineConnector,  // animated SVG line giữa workflow steps
} from '../_shared/SectionAnimations';

// Visuals (từ ProHeroVisuals):
import {
  ImageMasonryGrid,     // masonry grid fetch từ Explorer API
  BeforeAfterSlider,    // drag-to-reveal before/after comparison
  VideoReelGrid,        // bento grid video thumbnails
  ShowcaseImageStrip,   // two-row auto-scrolling marquee strip  ← PHẢI import từ đây
  FloatingBadge,        // animated stats badge overlay
  AIBadge,              // "AI Generated" sparkle badge top-right
} from '../_shared/ProHeroVisuals';
```

> ⚠️ `FloatingBadge` và `ShowcaseImageStrip` đều import từ `ProHeroVisuals`, **không phải** `SectionAnimations`.

### ParallaxSection — khi nào & cách dùng:

> `ParallaxSection` tạo hiệu ứng depth nhẹ khi scroll — dùng để wrap **toàn bộ một section** hoặc một **background element**, KHÔNG wrap từng card nhỏ.

```tsx
// ✅ Dùng cho: FeaturesSection background, hoặc ShowcaseSection wrapper
<ParallaxSection speed={0.15} className="relative py-24 overflow-hidden">
  <GradientMesh intensity="soft" />
  <div className="relative z-10 max-w-7xl mx-auto px-6">
    {/* Section content */}
  </div>
</ParallaxSection>

// ✅ Dùng cho: HeroSection — image column nhẹ nhàng scroll chậm hơn text
<ParallaxSection speed={0.08} className="lg:col-span-7">
  <ImageMasonryGrid productSlug={slug} />
</ParallaxSection>

// ❌ KHÔNG dùng: wrap từng card trong grid (gây layout jump + perf issue)
{features.map(f => (
  <ParallaxSection key={f.id}>  {/* ← SAI */}
    <HoverCard>...</HoverCard>
  </ParallaxSection>
))}
```

> `speed` prop: `0.05–0.10` cho effect nhẹ, `0.15–0.25` cho effect rõ hơn. Default: `0.1`.
> Tối đa **2 ParallaxSection** per landing page — quá nhiều gây motion sickness.

---

### HeroSection rules (QUAN TRỌNG):

**Left column** — theo đúng pattern `image-generator/HeroSection.tsx`:
```tsx
// Structure cố định:
<GradientMesh />                    // ← THÊM MỚI animated BG
<Link to="/market">← Trở lại</Link>
<badge>  // inline-flex, brand-blue/[0.08] bg, brand-blue text
<h1>
  dòng 1 <br/>
  <span brand-blue>
    Highlight
    <motion.span animated-underline />  // ← THÊM MỚI
  </span>
</h1>
<p> tagline </p>
<div grid-cols-2> // 4 spec cards (HoverCard wrapper)
<motion.button> CTA với gradient + shadow animation
```

**Right column** — dùng ProHeroVisuals component theo STEP 3.5 + STEP 3.6:
```tsx
// Wrap với FloatingBadge overlays:
<div className="lg:col-span-7 relative">
  <[VisualComponent] />              // từ ProHeroVisuals.tsx — xem STEP 3.6
  <FloatingBadge                     // bottom-left: price badge
    label="Pixel-perfect output"
    value="120 CR / lần"
    icon={<Coins size={14} />}
    className="absolute -bottom-3 -left-3"
    delay={0.8}
  />
</div>
```

**CSS cố định cho hero section:**
```tsx
// BG glows — dùng GradientMesh component thay vì hardcode
<div className="relative overflow-hidden">
  <GradientMesh intensity="soft" />
  ...content
</div>

// Grid container
<div className="max-w-[1400px] mx-auto grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center">
  <div className="lg:col-span-5 ...">  // Left copy
  <div className="lg:col-span-7 ...">  // Right visual
```

> **L7 — GradientMesh intensity:** `intensity` prop nhận `"soft"` (default) | `"medium"` | `"strong"`. Dùng `"soft"` cho hầu hết landing pages. Chỉ dùng `"strong"` cho FinalCTA section để tạo điểm nhấn visual kết thúc. **Không dùng hardcode `bg-gradient-to-*` hay inline blob divs** — luôn dùng `<GradientMesh />` component để đồng nhất.

---

### WorkflowSection rules (NÂNG CẤP):

```tsx
// Wrap toàn section với FadeInUp
// Dùng StaggerChildren cho cards
// Thêm TimelineConnector giữa các steps (hidden on mobile)

<FadeInUp>
  <SectionLabel>CÁCH HOẠT ĐỘNG</SectionLabel>
  <h2>4 bước đơn giản</h2>
</FadeInUp>

<StaggerChildren className="grid grid-cols-1 md:grid-cols-4 gap-4">
  {steps.map(step => (
    <HoverCard key={step.n} className="p-5">
      <motion.div
        whileHover={{ rotate: 5, scale: 1.05 }}
        className="w-10 h-10 rounded-xl bg-brand-blue/10 text-brand-blue mb-3 flex items-center justify-center"
      >
        <step.icon size={20} />
      </motion.div>
      <p className="text-[10px] font-bold text-brand-blue mb-1">BƯỚC {step.n}</p>
      <h3>{step.title}</h3>
      <p className="text-sm text-slate-500">{step.desc}</p>
    </HoverCard>
  ))}
</StaggerChildren>
```

---

### ShowcaseSection rules (MỚI — thêm giữa Workflow và Features):

```tsx
// Full-width dark section với image strip
// productSlug prop dùng để filter theo product nếu API hỗ trợ
interface ShowcaseSectionProps { productSlug?: string; }

export const ShowcaseSection: React.FC<ShowcaseSectionProps> = ({ productSlug }) => (
  <section className="py-20 bg-black/[0.02] dark:bg-white/[0.015] overflow-hidden">
    <div className="max-w-[1400px] mx-auto px-6 lg:px-12 mb-10">
      <FadeInUp>
        <SectionLabel>KẾT QUẢ THỰC TẾ</SectionLabel>
        <h2 className="text-3xl font-bold">Được tạo bởi AI Skyverses</h2>
        <p className="text-slate-500">Hàng nghìn kết quả từ cộng đồng người dùng</p>
      </FadeInUp>
    </div>
    {/* ShowcaseImageStrip import từ ProHeroVisuals — KHÔNG phải SectionAnimations */}
    <ShowcaseImageStrip type="image" limit={20} />
  </section>
);
```

---

### FeaturesSection rules (NÂNG CẤP → Bento Grid):

```tsx
// Bento grid: 1-2 "featured" cards (double width) + rest normal
// StaggerChildren entrance khi scroll vào view

const features = [
  // featured = true cho 1-2 tính năng quan trọng nhất
  // thumbUrl?: string — tuỳ chọn, dùng CDN URL từ STEP 3 cho featured cards
  { title: '...', desc: '...', icon: ..., featured: true,  thumbUrl: CDN_URL_1 },
  { title: '...', desc: '...', icon: ..., featured: false },
  // ...
];

<StaggerChildren className="grid grid-cols-2 md:grid-cols-4 gap-4 auto-rows-fr">
  {features.map(f => (
    <HoverCard
      key={f.title}
      className={`p-5 ${f.featured ? 'col-span-2' : 'col-span-1'} bg-black/[0.01] dark:bg-white/[0.015]`}
    >
      {/* Featured card: thêm thumbnail nếu có CDN URL */}
      {f.featured && f.thumbUrl && (
        <div className="w-full h-28 rounded-xl overflow-hidden mb-3 border border-black/[0.06] dark:border-white/[0.04]">
          <img src={f.thumbUrl} className="w-full h-full object-cover opacity-80" />
        </div>
      )}
      <motion.div whileHover={{ rotate: [0, -5, 5, 0] }} transition={{ duration: 0.4 }}>
        <f.icon size={22} className="text-brand-blue mb-3" />
      </motion.div>
      <h3 className="text-sm font-semibold mb-1">{f.title}</h3>
      <p className="text-[12px] text-slate-500 dark:text-[#666] leading-relaxed">{f.desc}</p>
    </HoverCard>
  ))}
</StaggerChildren>
```

---

### UseCasesSection rules (MỚI — thêm sau FeaturesSection, trước FinalCTA):

> Nội dung từ STEP 3.5 câu hỏi 10. Chọn 4-6 ngành phù hợp nhất với product.

```tsx
import { FadeInUp, StaggerChildren, HoverCard, SectionLabel } from '../_shared/SectionAnimations';
// Icons từ lucide-react: Store, Building, Shirt, GraduationCap, Heart, Coffee, etc.

interface UseCase {
  icon: React.ElementType;
  title: string;
  desc: string;
}

// Define 4-6 use cases phù hợp với product (từ STEP 3.5 phân tích câu 10)
const USE_CASES: UseCase[] = [
  { icon: Store,      title: 'Cửa hàng online',   desc: '...' },
  { icon: Building,   title: 'Agency Marketing',  desc: '...' },
  { icon: Shirt,      title: 'Thương hiệu thời trang', desc: '...' },
  { icon: GraduationCap, title: 'Giáo dục', desc: '...' },
  // ... tối đa 6
];

export const UseCasesSection: React.FC = () => (
  <section className="py-20 px-6 lg:px-12">
    <div className="max-w-[1400px] mx-auto">
      <FadeInUp className="mb-10">
        <SectionLabel>DÀNH CHO</SectionLabel>
        <h2 className="text-3xl font-bold mt-2">Phù hợp mọi lĩnh vực</h2>
        <p className="text-slate-500 mt-2 text-sm max-w-lg">
          Từ cửa hàng nhỏ đến agency lớn — AI giúp bạn tạo nội dung chuyên nghiệp trong vài giây.
        </p>
      </FadeInUp>

      <StaggerChildren className="grid grid-cols-2 md:grid-cols-3 gap-4">
        {USE_CASES.map((uc) => (
          <HoverCard key={uc.title} className="p-5 bg-black/[0.01] dark:bg-white/[0.015]">
            <motion.div
              whileHover={{ scale: 1.1, rotate: -3 }}
              transition={{ type: 'spring', stiffness: 400, damping: 15 }}
              className="w-9 h-9 rounded-xl bg-brand-blue/10 flex items-center justify-center text-brand-blue mb-3"
            >
              <uc.icon size={18} />
            </motion.div>
            <h3 className="text-sm font-semibold mb-1">{uc.title}</h3>
            <p className="text-[11px] text-slate-500 dark:text-[#666] leading-relaxed">{uc.desc}</p>
          </HoverCard>
        ))}
      </StaggerChildren>
    </div>
  </section>
);
```

---

## STEP 5 — Create landing page file (thin orchestrator)

```tsx
// pages/images/YourProductAI.tsx
import React, { useState } from 'react';
import YourWorkspace from '../../components/YourWorkspace';
import { HeroSection } from '../../components/landing/your-slug/HeroSection';
import { LiveStatsBar } from '../../components/landing/your-slug/LiveStatsBar';
import { WorkflowSection } from '../../components/landing/your-slug/WorkflowSection';
import { ShowcaseSection } from '../../components/landing/your-slug/ShowcaseSection';
import { FeaturesSection } from '../../components/landing/your-slug/FeaturesSection';
import { UseCasesSection } from '../../components/landing/your-slug/UseCasesSection';
import { FAQSection } from '../../components/landing/your-slug/FAQSection';
import { FinalCTA } from '../../components/landing/your-slug/FinalCTA';
import { usePageMeta } from '../../hooks/usePageMeta';

const YourProductAI = () => {
  // ─── SEO (từ STEP 3.5 câu 6) ─────────────────────────────────────────────
  // Quy tắc:
  //   title       → 50-60 ký tự, bắt đầu bằng keyword Việt, kết thúc "| Skyverses"
  //   description → 140-160 ký tự, có số liệu cụ thể + CTA ngắn
  //   keywords    → 6-10 từ khoá thực tế, gồm long-tail
  //   canonical   → '/product/{slug}' khớp route App.tsx
  //   jsonLd      → SoftwareApplication schema (bắt buộc cho image/video product)
  // ─────────────────────────────────────────────────────────────────────────
  usePageMeta({
    title: '{Tính năng chính} — {Keyword Việt} | Skyverses',
    description: '{Verb mạnh} + {tính năng}. {Con số cụ thể}. {CTA ngắn}.',
    keywords: '{keyword-1}, {keyword-2}, {long-tail-1}, {long-tail-2}, Skyverses {product-name}',
    canonical: '/product/{slug}',
    ogImage: 'https://ai.skyverses.com/assets/seo/seo-og-thumbnail-v2.png', // thay bằng CDN ảnh product từ STEP 3 nếu có
    jsonLd: {
      '@type': 'SoftwareApplication',          // MultimediaApplication | BusinessApplication | UtilitiesApplication
      name: '{Product Name EN}',
      applicationCategory: 'MultimediaApplication',
      operatingSystem: 'Web',
      offers: {
        '@type': 'Offer',
        price: '{priceCredits}',               // số credits, VD: 120
        priceCurrency: 'CREDITS',
      },
      description: '{Short description EN}',
      url: 'https://ai.skyverses.com/product/{slug}',
      provider: {
        '@type': 'Organization',
        name: 'Skyverses',
        url: 'https://ai.skyverses.com',
      },
    },
  });
  const [isStudioOpen, setIsStudioOpen] = useState(false);

  if (isStudioOpen) return (
    <div className="fixed inset-0 z-[500] bg-white dark:bg-[#0a0a0c] animate-in fade-in duration-500">
      <YourWorkspace onClose={() => setIsStudioOpen(false)} />
    </div>
  );

  return (
    <div className="bg-white dark:bg-[#0a0a0c] min-h-screen text-slate-900 dark:text-white font-sans overflow-x-hidden pt-16 transition-colors duration-300">
      <HeroSection onStartStudio={() => setIsStudioOpen(true)} />
      <LiveStatsBar />                                           {/* ← L2 */}
      <WorkflowSection />
      <ShowcaseSection productSlug="your-slug" />               {/* ← pass productSlug */}
      <FeaturesSection />
      <UseCasesSection />                                        {/* ← sau Features */}
      <FAQSection />                                             {/* ← L3, trước FinalCTA */}
      <FinalCTA onStartStudio={() => setIsStudioOpen(true)} />

      {/* Sticky mobile CTA — L4 */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 z-40 px-4 pb-4 pt-2 bg-gradient-to-t from-white dark:from-[#0a0a0c] via-white/95 dark:via-[#0a0a0c]/95 to-transparent">
        <button
          onClick={() => setIsStudioOpen(true)}
          className="w-full py-3.5 rounded-xl bg-gradient-to-r from-brand-blue to-blue-500 text-white text-[12px] font-bold uppercase tracking-widest shadow-lg shadow-brand-blue/30"
        >
          ✨ Tạo Ngay — Miễn phí thử
        </button>
      </div>
    </div>
  );
};
export default YourProductAI;
```

---

## STEP 6 — Create Workspace component (với AISuggestPanel + Industry Picker)

> **Reference:** `components/SocialBannerWorkspace.tsx` — đây là canonical workspace MỚI NHẤT.
> (PosterStudioWorkspace là reference cũ — chưa có AISuggestPanel)

> ⚡ **Nhắc nhở:** Nếu product tạo ảnh hoặc tạo video → sau khi xây workspace xong, tiếp tục sang **STEP 6.5** để tích hợp `ModelEngineSettings`. KHÔNG tự build UI engine thủ công trong workspace.

---

### 🚨 MỤC TIÊU STEP 6 — LOGIC TRƯỚC, UI SAU

> **Workspace PHẢI implement đầy đủ logic nghiệp vụ. UI chỉ là phương tiện hiển thị.**
>
> Khi build workspace, ưu tiên theo thứ tự:
>
> 1. **✅ Logic bắt buộc phải đủ (KHÔNG được bỏ):**
>    - Job submission + Poll loop (createJob → pollJobStatus → markDone/markError)
>    - Credit deduction trước khi gọi API + refund khi job fail
>    - AbortController — huỷ job khi user bấm Hủy (isGenerating)
>    - Results state là **mảng tasks** (`REResult[]`) — KHÔNG dùng `useState<string | null>`
>    - localStorage persist: session history + prompt history (`STORAGE_KEY`)
>    - Starter prompts (4 cards 2×2 khi chưa có kết quả)
>    - Low Credit modal đầy đủ (thông báo + nút Nạp + nút Đóng)
>    - Status dot đổi màu (amber=processing, green=done, red=error)
>    - Tab "Phiên hiện tại" + "Thư viện (N)" toggle
>    - Industry context inject vào finalPrompt khi generate
>
> 2. **⚠️ UI chỉ là skeleton để gắn logic vào — KHÔNG tập trung polish UI ở bước này:**
>    - Layout (sidebar / viewport / task rail) → copy từ canonical, đừng tự thiết kế lại
>    - Pickers (platform, format, style) → thay nội dung cho đúng product, giữ nguyên pattern
>    - AISuggestPanel + Industry Picker → wire đúng props, không cần custom style
>
> **❌ Sai:** Build xong UI đẹp nhưng thiếu poll loop, thiếu credit refund, thiếu abort, thiếu localStorage.
> **✅ Đúng:** Logic hoàn chỉnh chạy được end-to-end, UI có thể rough nhưng tất cả tính năng phải hoạt động.

---

### ⚠️ RULE: Generate phải dùng Job+Poll — KHÔNG dùng `generateDemoImage` / `generateDemoVideo`

> `generateDemoImage` và `generateDemoVideo` từ `services/gemini` là **demo/mock service** — **KHÔNG dùng trong workspace production**.

#### Image generation → `imagesApi.createJob` + `pollImageJobStatus`
```ts
import { imagesApi, ImageJobRequest, ImageJobResponse } from '../apis/images';

// 1. Gọi createJob
const payload: ImageJobRequest = {
  type: references.length > 0 ? 'image_to_image' : 'text_to_image',
  input: { prompt: finalPrompt, images: references.length > 0 ? references : undefined },
  config: { width: 1024, height: 1024, aspectRatio: selectedRatio, seed: 0, style: 'cinematic' },
  engine: { provider: selectedEngine as 'gommo' | 'fxlab', model: selectedModel.raw.modelKey },
  enginePayload: { prompt: finalPrompt, privacy: 'PRIVATE', projectId: 'default', mode: selectedMode },
};
const apiRes = await imagesApi.createJob(payload);

// 2. Nếu thành công → trừ credits + bắt đầu poll
if (apiRes.success && apiRes.data.jobId) {
  useCredits(unitCost);
  pollImageJob(apiRes.data.jobId, taskId, unitCost);
}

// 3. Poll mỗi 5s (retry 10s nếu lỗi mạng)
const pollImageJob = async (jobId, taskId, cost) => {
  const res = await imagesApi.getJobStatus(jobId);
  if (res.data?.status === 'error' || res.data?.status === 'failed') {
    addCredits(cost);           // ← hoàn credits khi job fail
    markTaskError(taskId);
    return;
  }
  if (res.data?.status === 'done' && res.data.result?.images?.length) {
    markTaskDone(taskId, res.data.result.images[0]);
    refreshUserInfo();
    return;
  }
  setTimeout(() => pollImageJob(jobId, taskId, cost), 5000);    // processing → retry
  // catch: setTimeout(..., 10000)                               // network error → retry chậm hơn
};
```

#### Video generation → `videosApi.createJob` + `pollVideoJobStatus`
```ts
import { videosApi, VideoJobRequest, VideoJobResponse } from '../apis/videos';

const payload: VideoJobRequest = {
  type: 'text-to-video',           // hoặc 'image-to-video' nếu có reference
  input: { images: [null, null] },
  config: { duration: parseInt(duration), aspectRatio: ratio, resolution },
  engine: { provider: selectedEngine as any, model: selectedModelObj.modelKey as any },
  enginePayload: { accessToken: 'YOUR_GOMMO_ACCESS_TOKEN', prompt: finalPrompt,
                   privacy: 'PRIVATE', translateToEn: true, projectId: 'default', mode: selectedMode as any },
};
const res = await videosApi.createJob(payload);
const isSuccess = res.success === true || res.status?.toLowerCase() === 'success';

if (isSuccess && res.data.jobId) {
  useCredits(unitCost);
  pollVideoJob(res.data.jobId, taskId, unitCost);
}

// poll: kiểm tra res.data.result?.videoUrl khi status === 'done'
// error: addCredits(cost) + refund
// network error: setTimeout retry 10s
```

#### Results state pattern — danh sách tasks thay vì 1 result duy nhất

> **KHÔNG dùng** `const [result, setResult] = useState<string | null>(null)`
> **PHẢI dùng** mảng tasks — mỗi task có status riêng để render card list bên phải viewport

```ts
interface REResult {
  id: string;
  url: string | null;
  prompt: string;
  mode: 'image' | 'video';      // nếu workspace multi-mode
  status: 'processing' | 'done' | 'error';
  cost: number;
  isRefunded?: boolean;
  logs?: string[];              // optional — dùng để debug job pipeline
}

const [results, setResults] = useState<REResult[]>([]);
const [activeResultId, setActiveResultId] = useState<string | null>(null);

// Viewport chính hiển thị activeResult:
const activeResult = results.find(r => r.id === activeResultId) || results[0] || null;

// Right rail (panel bên phải viewport) = task list + history
// - Tác vụ (results): mỗi card click → setActiveResultId(task.id)
// - Lịch sử (sessions localStorage): xem lại kết quả cũ
```

#### Layout: Right rail task list + history (bắt buộc với workspace multi-output)

```
┌─────────────────────────────────────────────────────────────────┐
│  SIDEBAR (left, 380px)    │  VIEWPORT (center, flex-1)  │ TASKS │
│  - Pickers                │  - Active result preview    │ (220px)│
│  - Engine settings        │    (image / video / skel.)  │ Tasks  │
│  - AISuggestPanel         │                             │ tab +  │
│  - Prompt textarea        │                             │ History│
│  - Generate button        │                             │ tab    │
└─────────────────────────────────────────────────────────────────┘
```

> **Reference implementation:** `components/RealEstateVisualWorkspace.tsx`
> Copy pattern `pollImageJob` + `pollVideoJob` + `REResult[]` state từ file này.

---
> Copy structure SocialBannerWorkspace, chỉ thay:
> 1. Phần picker (Platform → Category/Format/etc.) phù hợp với product
> 2. INDUSTRIES list — giữ 8-12 items phù hợp nhất
> 3. PRODUCT_STYLES và FEATURED_TEMPLATES
> 4. Generate logic (prompt building, API call)

### Industry Picker (thêm vào sidebar, TRÊN AISuggestPanel):

```tsx
import { Store, Building, Shirt, GraduationCap, Heart, Coffee,
         Plane, Car, Music, Cpu, Dumbbell, MessageCircle } from 'lucide-react';

// Chỉ 8-12 industries PHỔ BIẾN NHẤT với product này
// KHÔNG copy toàn bộ 40+ items của PosterStudioWorkspace
// Lấy từ USE_CASES đã phân tích trong STEP 3.5 câu 10
const INDUSTRIES = [
  { id: 'social',      label: 'MXH',          icon: MessageCircle },
  { id: 'restaurant',  label: 'Nhà hàng',     icon: Coffee        },
  { id: 'fashion',     label: 'Thời trang',   icon: Shirt         },
  { id: 'realestate',  label: 'BĐS',          icon: Building      },
  { id: 'education',   label: 'Giáo dục',     icon: GraduationCap },
  { id: 'travel',      label: 'Du lịch',      icon: Plane         },
  { id: 'beauty',      label: 'Làm đẹp',      icon: Heart         },
  { id: 'tech',        label: 'Công nghệ',    icon: Cpu           },
  // Thêm hoặc bỏ tùy product — giữ 8-12 items tối đa
];

const [activeIndustry, setActiveIndustry] = useState('social');
```

**Đặt trong sidebar, TRÊN AISuggestPanel:**
```tsx
{/* ─── Industry Picker ─── */}
<div className="mb-3">
  <p className="text-[9px] font-semibold uppercase text-slate-400 dark:text-[#555] mb-2 tracking-widest">
    Lĩnh vực
  </p>
  <div className="flex flex-wrap gap-1.5">
    {INDUSTRIES.map((ind) => {
      const Icon = ind.icon;
      const isActive = activeIndustry === ind.id;
      return (
        <button
          key={ind.id}
          onClick={() => setActiveIndustry(ind.id)}
          className={`flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-[10px] font-medium border transition-all ${
            isActive
              ? 'bg-brand-blue text-white border-brand-blue shadow-sm shadow-brand-blue/20'
              : 'bg-black/[0.02] dark:bg-white/[0.02] border-black/[0.05] dark:border-white/[0.05] text-slate-500 dark:text-[#666] hover:border-brand-blue/30 hover:text-brand-blue'
          }`}
        >
          <Icon size={11} />
          {ind.label}
        </button>
      );
    })}
  </div>
</div>
```

**Truyền industry context vào AISuggestPanel:**
```tsx
const activeIndustryLabel = INDUSTRIES.find(i => i.id === activeIndustry)?.label || '';

<AISuggestPanel
  productSlug="your-slug"
  productName="Your Product Name"
  styles={PRODUCT_STYLES}
  onPromptSelect={(p) => setPrompt(prev => p + prev)}
  onApply={(cfg) => {
    if (cfg.prompt) setPrompt(cfg.prompt);
    if (cfg.style && PRODUCT_STYLES.find(s => s.label === cfg.style)) {
      setActiveStyle(cfg.style);
    }
    if (cfg.format) setActiveFormat(cfg.format);
  }}
  historyKey={STORAGE_KEY}
  featuredTemplates={FEATURED_TEMPLATES}
  // ← Industry context động theo picker
  productContext={`${productName} AI tool for ${activeIndustryLabel || 'general'} industry in Vietnam`}
/>
```

**Industry ảnh hưởng đến prompt khi generate:**
```tsx
const industryLabel = INDUSTRIES.find(i => i.id === activeIndustry)?.label;
const finalPrompt = industryLabel
  ? `[Lĩnh vực: ${industryLabel}] ${prompt}`
  : prompt;

// Dùng finalPrompt (không phải prompt) khi gọi generateDemoImage(finalPrompt, ...)
```

### AISuggestPanel integration (sau Industry Picker, trước prompt textarea):

```tsx
import AISuggestPanel, { StylePreset } from './workspace/AISuggestPanel';

// Define styles phù hợp product (overrides DEFAULT_STYLES)
const PRODUCT_STYLES: StylePreset[] = [
  { id: 'modern',    label: 'Hiện đại',   emoji: '⚡', description: 'Clean, bold',      promptPrefix: 'modern clean design, ' },
  { id: 'luxury',    label: 'Luxury',     emoji: '💎', description: 'Premium feel',     promptPrefix: 'luxury premium, ' },
  // ... 4-6 styles phù hợp product
];

// Featured templates phù hợp product
const FEATURED_TEMPLATES = [
  { label: 'Template phổ biến 1', prompt: '...', style: 'Hiện đại' },
  { label: 'Template phổ biến 2', prompt: '...', style: 'Luxury'   },
  { label: 'Template phổ biến 3', prompt: '...'                     },
];
```

### STORAGE_KEY convention:
```tsx
// Pattern: skyverses_<SCREAMING-SNAKE-ID>_vault  (dùng id viết HOA, khớp với canonical SocialBannerWorkspace)
const STORAGE_KEY = 'skyverses_SOCIAL-BANNER-AI_vault';
// ❌ Sai: 'skyverses_social-banner-ai_vault'  (slug viết thường — không nhất quán với code thực)
```

### Layout cố định (giống SocialBannerWorkspace — canonical mới):
```
TOP NAV (h-14)
├── Left: [Phiên hiện tại] [Thư viện (N)]
└── Right: [Credits badge] [X close]

SIDEBAR (w-[380px]) ── flex-grow VIEWPORT
│ Product-specific picker          │ Generate button bar (top)
│ ─── INDUSTRY PICKER ───          │   status dot · CR cost · button
│ 8-12 industry chip buttons       │
│ ─── AI SUGGEST PANEL ───         │ Current: result image
│ Prompt textarea                  │   + download/fullscreen overlay
│ AI Boost button (Wand2 lucide)   │
│ Title / Subtitle (optional)      │ Library: grid of past sessions
│ Reference images (3-col, max 6)  │
│ ─────────────────────────────    │
│ MODEL  │ STYLE                   │
│ MODE   │ RESOLUTION              │
│ ─ QUANTITY · N CR ─              │
│ ─ Advanced (collapsible) ─       │
```

> ⚠️ **Wand2 AI Boost button**: Import `Wand2` từ `lucide-react`. KHÔNG tự define inline SVG.

### Mobile Layout (bắt buộc — workspace phải responsive)

> Desktop (≥ 768px): layout sidebar + viewport như trên.
> Mobile (< 768px): sidebar ẩn, thay bằng bottom sheet trigger.

```tsx
// Outer container — đổi layout theo breakpoint
<div className="flex flex-col h-full md:flex-row">

  {/* Sidebar — ẩn trên mobile, hiện trên desktop */}
  <aside className="hidden md:flex flex-col w-[380px] border-r border-black/[0.05] dark:border-white/[0.05] overflow-y-auto">
    {/* Pickers, AISuggestPanel, prompt, settings */}
  </aside>

  {/* Viewport — full width trên mobile */}
  <div className="flex-1 flex flex-col min-w-0">

    {/* Mobile: nút mở settings bottom sheet (thay sidebar) */}
    <div className="md:hidden flex items-center gap-2 px-4 py-2 border-b border-black/[0.05] dark:border-white/[0.05]">
      <button
        onClick={() => setShowMobileSheet(true)}
        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-black/[0.04] dark:bg-white/[0.04] text-xs text-slate-600 dark:text-[#aaa]"
      >
        <Settings size={13} />
        Cài đặt
      </button>
      {/* Credits badge mobile */}
      <span className="text-xs text-slate-400 ml-auto">{credits} CR</span>
    </div>

    {/* Viewport content */}
    {/* ... result preview, task list ... */}

    {/* Mobile sticky generate button */}
    <div className="md:hidden fixed bottom-0 left-0 right-0 p-4 bg-white/90 dark:bg-[#111]/90 backdrop-blur-sm border-t border-black/[0.05] dark:border-white/[0.05]">
      <button
        onClick={handleGenerate}
        disabled={!prompt.trim() || isGenerating}
        className="w-full py-3 rounded-xl bg-brand-blue text-white text-sm font-semibold disabled:opacity-50"
      >
        {isGenerating ? 'Đang tạo...' : `Tạo — ${unitCost * quantity} CR`}
      </button>
    </div>
  </div>
</div>

{/* Mobile Settings Bottom Sheet — xem pattern S1 (line ~3296) */}
```

> Tham chiếu pattern bottom sheet đầy đủ: **S1 — Mobile bottom sheet** trong phần UX Patterns bên dưới.

### Error Boundary (bắt buộc — wrap toàn bộ Workspace)

> Workspace chứa nhiều API calls + state mutations. Nếu crash không có boundary → cả landing page crash.

```tsx
// components/landing/<slug>/<Slug>Page.tsx — trong thin orchestrator:
import { ErrorBoundary } from 'react-error-boundary';

function WorkspaceCrashFallback({ resetErrorBoundary }: { resetErrorBoundary: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center h-full gap-4 p-8 text-center">
      <p className="text-slate-500 dark:text-[#888] text-sm">
        Workspace gặp lỗi không mong muốn.
      </p>
      <button
        onClick={resetErrorBoundary}
        className="px-4 py-2 rounded-lg bg-brand-blue text-white text-sm"
      >
        Thử lại
      </button>
    </div>
  );
}

// Trong JSX của page:
<ErrorBoundary FallbackComponent={WorkspaceCrashFallback} onReset={() => {}}>
  <YourWorkspace onClose={() => setIsStudioOpen(false)} />
</ErrorBoundary>
```

> `react-error-boundary` đã có trong dự án — không cần cài thêm.
```tsx
const CREDIT_COST = 120;
if (credits < CREDIT_COST * quantity) { setShowLowCreditAlert(true); return; }
```

### localStorage: `skyverses_<SCREAMING-SNAKE-ID>_vault`

---

### ⚠️ Prompt Validation (bắt buộc trước khi gọi API)

```tsx
// 1. Không cho generate khi prompt rỗng
const trimmedPrompt = prompt.trim();
if (!trimmedPrompt) {
  toast.error('Vui lòng nhập mô tả trước khi tạo.');
  return;
}

// 2. Giới hạn độ dài — tránh oversized payload
const MAX_PROMPT_LENGTH = 2000;
if (trimmedPrompt.length > MAX_PROMPT_LENGTH) {
  toast.error(`Mô tả quá dài (tối đa ${MAX_PROMPT_LENGTH} ký tự).`);
  return;
}

// 3. Hiển thị character counter trong textarea
<div className="flex justify-between text-[10px] text-slate-400 mt-1">
  <span>{trimmedPrompt.length}/{MAX_PROMPT_LENGTH}</span>
  {trimmedPrompt.length > MAX_PROMPT_LENGTH * 0.9 && (
    <span className="text-amber-500">Gần đạt giới hạn</span>
  )}
</div>

// 4. Disable Generate button khi empty hoặc đang generate
<button
  disabled={!trimmedPrompt || isGenerating}
  ...
>
  Tạo
</button>
```

---

### ⚠️ Concurrent Generation Guard (bắt buộc)

> **Vấn đề:** User click "Tạo" 2 lần liền → 2 jobs submit → 2 credit deductions, conflict taskId.

```tsx
// isGenerating flag block duplicate submissions
const handleGenerate = async () => {
  if (isGenerating) return;          // ← guard đầu tiên
  if (!trimmedPrompt) return;        // ← prompt guard
  if (credits < unitCost * quantity) { setShowLowCreditAlert(true); return; }

  setIsGenerating(true);
  try {
    // ... submit job
  } finally {
    // KHÔNG setIsGenerating(false) ở đây
    // → chỉ set false khi job done/error (trong poll callback)
    // → tránh UI flicker khi poll chưa kịp bắt đầu
  }
};

// Trong poll callback — sau markDone hoặc markError:
setIsGenerating(false);
```

> **Lưu ý:** Nếu product support queue nhiều jobs (quantity > 1), `isGenerating` chỉ lock trong lúc submit.
> Sau khi submit xong → unlock để user có thể submit tiếp, poll chạy ngầm theo từng taskId riêng.

---

### ⚠️ Error Handling — 3 loại lỗi (bắt buộc phân biệt)

```tsx
// Loại 1 — API Error (job thất bại phía server)
if (res.data?.status === 'error' || res.data?.status === 'failed') {
  addCredits(cost);                  // ← hoàn credits
  markTaskError(taskId, 'API_ERROR');
  setIsGenerating(false);
  toast.error('Tạo không thành công. Credits đã được hoàn lại.');
  return;
}

// Loại 2 — Network Error (fetch throw exception)
try {
  const res = await imagesApi.getJobStatus(jobId);
  // ...
} catch (err) {
  // Retry chậm hơn — KHÔNG hoàn credits (job vẫn đang chạy phía server)
  retryCount++;
  if (retryCount >= MAX_RETRIES) {   // MAX_RETRIES = 5
    addCredits(cost);                // ← hoàn credits sau nhiều lần retry thất bại
    markTaskError(taskId, 'NETWORK_ERROR');
    setIsGenerating(false);
    toast.error('Lỗi kết nối. Credits đã được hoàn lại.');
    return;
  }
  setTimeout(() => pollImageJob(jobId, taskId, cost, retryCount), 10000); // retry 10s
  return;
}

// Loại 3 — Timeout (polling > 30 lần x 5s = 150s)
const MAX_POLL_ATTEMPTS = 30;
if (attempt >= MAX_POLL_ATTEMPTS) {
  addCredits(cost);                  // ← hoàn credits
  markTaskError(taskId, 'TIMEOUT');
  setIsGenerating(false);
  toast.error('Tạo quá lâu. Credits đã được hoàn lại. Thử lại sau.');
  return;
}
```

```tsx
// markTaskError helper — set status + error type
const markTaskError = (taskId: string, errorType: 'API_ERROR' | 'NETWORK_ERROR' | 'TIMEOUT') => {
  setResults(prev => prev.map(r =>
    r.id === taskId ? { ...r, status: 'error', errorType, isRefunded: true } : r
  ));
};
```

---

### ⚠️ localStorage Quota Management (bắt buộc)

> **Giới hạn thực tế:** Safari iOS ≈ 5MB, Chrome ≈ 10MB. Session data (URLs, prompts) tích lũy nhanh.

```tsx
// Constants quản lý quota
const MAX_SESSIONS = 50;
const MAX_PROMPT_HISTORY = 10;
const LS_SIZE_WARNING_BYTES = 4 * 1024 * 1024;  // 4MB — warn trước khi hit limit

// Save session — tự động prune oldest
const saveSession = (session: BannerSession) => {
  try {
    const existing: BannerSession[] = (() => {
      try { return JSON.parse(localStorage.getItem(STORAGE_KEY + '_sessions') || '[]'); }
      catch { return []; }
    })();

    const updated = [session, ...existing].slice(0, MAX_SESSIONS); // giữ tối đa MAX_SESSIONS
    localStorage.setItem(STORAGE_KEY + '_sessions', JSON.stringify(updated));
  } catch (e) {
    // QuotaExceededError → xóa oldest half rồi thử lại
    if ((e as DOMException).name === 'QuotaExceededError') {
      pruneOldestSessions();
      try {
        localStorage.setItem(STORAGE_KEY + '_sessions', JSON.stringify([session]));
      } catch { /* ignore nếu vẫn fail */ }
    }
  }
};

const pruneOldestSessions = () => {
  try {
    const existing: BannerSession[] = JSON.parse(localStorage.getItem(STORAGE_KEY + '_sessions') || '[]');
    const half = existing.slice(0, Math.floor(existing.length / 2));
    localStorage.setItem(STORAGE_KEY + '_sessions', JSON.stringify(half));
  } catch { /* ignore */ }
};
```

---

### ⚠️ Reference Image Upload Flow

> Workspace sidebar có "Reference images (3-col, max 6)". Đây là flow chuẩn:

```tsx
// 1. Upload → base64 (không cần server upload riêng)
const handleReferenceUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
  const files = Array.from(e.target.files || []);
  const MAX_REF = 6;
  const MAX_SIZE_MB = 5;

  files.forEach(file => {
    // Validation
    if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) {
      toast.error('Chỉ hỗ trợ JPG, PNG, WebP');
      return;
    }
    if (file.size > MAX_SIZE_MB * 1024 * 1024) {
      toast.error(`Ảnh tối đa ${MAX_SIZE_MB}MB`);
      return;
    }
    if (references.length >= MAX_REF) {
      toast.error(`Tối đa ${MAX_REF} ảnh tham chiếu`);
      return;
    }

    const reader = new FileReader();
    reader.onload = (ev) => {
      const base64 = ev.target?.result as string;
      setReferences(prev => [...prev, { id: crypto.randomUUID(), base64, file }]);
    };
    reader.readAsDataURL(file);
  });
};

// 2. Xóa reference
const removeReference = (id: string) => {
  setReferences(prev => prev.filter(r => r.id !== id));
};

// 3. Truyền vào job payload
const payload: ImageJobRequest = {
  type: references.length > 0 ? 'image_to_image' : 'text_to_image',
  input: {
    prompt: finalPrompt,
    images: references.length > 0
      ? references.map(r => r.base64)
      : undefined
  },
  // ...
};
```

```tsx
// 4. UI — 3-column grid, drag-to-remove
<div className="grid grid-cols-3 gap-2 mb-3">
  {references.map(ref => (
    <div key={ref.id} className="relative aspect-square rounded-lg overflow-hidden group">
      <img src={ref.base64} alt="" className="w-full h-full object-cover" />
      <button
        onClick={() => removeReference(ref.id)}
        className="absolute top-1 right-1 bg-black/60 rounded-full p-0.5 opacity-0 group-hover:opacity-100 transition-opacity"
      >
        <X size={10} className="text-white" />
      </button>
    </div>
  ))}
  {references.length < 6 && (
    <label className="aspect-square rounded-lg border border-dashed border-slate-300 dark:border-[#333] flex items-center justify-center cursor-pointer hover:border-brand-blue transition-colors">
      <Plus size={16} className="text-slate-400" />
      <input type="file" accept="image/jpeg,image/png,image/webp" multiple className="hidden" onChange={handleReferenceUpload} />
    </label>
  )}
</div>
```

---

## STEP 6.5 — Cấu hình AI Engine (BẮT BUỘC nếu product tạo ảnh hoặc tạo video)

> ⚡ **Trigger:** Nếu bạn đã đánh dấu `⚡ STEP 6.5 bắt buộc` ở STEP 3.5 → thực hiện toàn bộ step này.
> **Chỉ bỏ qua** khi product là transform-only (xóa nền, upscale, restore) hoặc tool/workflow không tạo media.

---

### ⚠️ QUY TẮC BẮT BUỘC — Dùng đúng component theo loại media (KHÔNG tự build UI)

> **Mọi workspace tạo ảnh hoặc tạo video đều PHẢI dùng component dùng chung tương ứng:**
> - **Tạo ảnh** → `ModelEngineSettings` (`components/image-generator/ModelEngineSettings.tsx`)
> - **Tạo video** → `VideoModelEngineSettings` (`components/video-generator/VideoModelEngineSettings.tsx`)
>
> **TUYỆT ĐỐI KHÔNG** tự viết lại UI server / model / mode / resolution / ratio / quantity riêng trong workspace mới.
> Viết lại thủ công = sai kiến trúc, gây inconsistency toàn hệ thống.
>
> **Tham chiếu implementation thực tế:**
> - `components/SocialBannerWorkspace.tsx` — image generation workspace (canonical mới nhất)
> - `components/AIVideoGeneratorWorkspace.tsx` — video workspace canonical (dùng `VideoModelEngineSettings` qua `ConfigurationPanel`)
> - `components/video-generator/ConfigurationPanel.tsx` — wrapper collapsible chứa `VideoModelEngineSettings`

---

### A. Cấu hình AI — Tạo ảnh

#### 1. Import

```tsx
import { useImageModels } from '../hooks/useImageModels';
import { ModelEngineSettings } from './image-generator/ModelEngineSettings';
```

#### 2. Hook state (thay thế toàn bộ state engine thủ công)

```tsx
// Engine selector state (1 useState duy nhất)
const [imgEngine, setImgEngine] = useState('gommo');

// Tất cả state còn lại (model, family, mode, res, ratio, quantity, cost) — đến từ hook
const {
  availableModels,      // PricingModel[] — tất cả models của engine
  selectedModel,        // PricingModel | null — model đang chọn (object đầy đủ)
  setSelectedModel,
  selectedFamily,       // string — tên family đang chọn
  setSelectedFamily,
  selectedMode,         // string
  setSelectedMode,
  selectedRes,          // string — '1k' | '2k' | '4k' | ...
  setSelectedRes,
  selectedRatio,        // string — '16:9' | '1:1' | ...
  setSelectedRatio,
  familyList,           // string[] — danh sách family names
  familyModels,         // MappedImageModel[] — models của family đang chọn
  familyModes,          // string[] — modes của family đang chọn
  familyResolutions,    // string[] — resolutions của family đang chọn
  familyRatios,         // string[] — ratios của family đang chọn
  selectedModelCost,    // number — credit cost của model+mode+res đang chọn
} = useImageModels(imgEngine);

const [quantity, setQuantity] = useState(1);

// Credit check — dùng selectedModelCost (dynamic), KHÔNG hardcode
if (credits < selectedModelCost * quantity) { setShowLowCreditAlert(true); return; }
```

#### 3. JSX — đặt trong sidebar (sau picker, trước AISuggestPanel)

```tsx
<ModelEngineSettings
  availableModels={availableModels}
  selectedModel={selectedModel}
  setSelectedModel={setSelectedModel}
  selectedRatio={selectedRatio}
  setSelectedRatio={setSelectedRatio}
  selectedRes={selectedRes}
  setSelectedRes={setSelectedRes}
  quantity={quantity}
  setQuantity={setQuantity}
  selectedMode={selectedMode}
  setSelectedMode={setSelectedMode}
  selectedEngine={imgEngine}
  onSelectEngine={setImgEngine}
  activeMode="SINGLE"
  isGenerating={isGenerating}
  familyList={familyList}
  selectedFamily={selectedFamily}
  setSelectedFamily={setSelectedFamily}
  familyModels={familyModels.map(m => m.raw || m)}
  familyModes={familyModes}
  familyRatios={familyRatios}
  familyResolutions={familyResolutions}
/>
```

#### 4. Dùng trong generate payload

```tsx
const payload: ImageJobRequest = {
  type: references.length > 0 ? 'image_to_image' : 'text_to_image',
  input: { prompt: finalPrompt, images: references.length > 0 ? references : undefined },
  config: { width: 1024, height: 1024, aspectRatio: selectedRatio, seed: 0 },
  engine: {
    provider: imgEngine as 'gommo' | 'fxlab',
    model: selectedModel?.raw?.modelKey ?? selectedModel?.modelKey ?? '',
  },
  enginePayload: {
    prompt: finalPrompt,
    privacy: 'PRIVATE',
    projectId: 'default',
    mode: selectedMode,
  },
};
```

---

### B. Cấu hình AI — Tạo video

> Video workspace dùng **`VideoModelEngineSettings`** — component chuyên biệt cho video (đã tích hợp sẵn Duration + Sound + Variants).
> **KHÔNG dùng** `ModelEngineSettings` (image component) cho video workspace.
> Tham chiếu canonical: `components/AIVideoGeneratorWorkspace.tsx` + `components/video-generator/ConfigurationPanel.tsx`.

#### 1. Import

```tsx
import { VideoModelEngineSettings } from './video-generator/VideoModelEngineSettings';
import { pricingApi, PricingModel } from '../apis/pricing';
```

#### 2. State

```tsx
// ─── Video engine + models (fetch riêng, tool: 'video') ───
const [videoEngine, setVideoEngine] = useState('gommo');
const [videoAvailableModels, setVideoAvailableModels] = useState<PricingModel[]>([]);
const [videoSelectedModelObj, setVideoSelectedModelObj] = useState<PricingModel | null>(null);
const [videoSelectedFamily, setVideoSelectedFamily] = useState('');
const [videoSelectedMode, setVideoSelectedMode] = useState('relaxed');
const [videoResolution, setVideoResolution] = useState('720p');
const [videoRatio, setVideoRatio] = useState('16:9');
const [videoDuration, setVideoDuration] = useState('8s');
const [soundEnabled, setSoundEnabled] = useState(false);
const [videoQuantity, setVideoQuantity] = useState(1);

// KNOWN_FAMILIES (copy từ VideoModelEngineSettings hoặc AIVideoGeneratorWorkspace)
const KNOWN_FAMILIES = ['VEO', 'Kling', 'Hailuo', 'Grok', 'Sora', 'WAN', 'Wan', 'V-Fuse', 'OmniHuman', 'Seedance'];
const extractFamilyName = (name: string) => {
  for (const f of KNOWN_FAMILIES) {
    if (name.toLowerCase().startsWith(f.toLowerCase())) return f;
  }
  return name.split(/\s*-\s/)[0].split(/\s+/)[0] || 'Other';
};

// Fetch video models khi engine thay đổi
useEffect(() => {
  setVideoAvailableModels([]);
  pricingApi.getPricing({ tool: 'video', engine: videoEngine })
    .then(res => {
      if (res.success && res.data.length > 0) {
        setVideoAvailableModels(res.data);
        const def = res.data[0];
        setVideoSelectedFamily(extractFamilyName(def.name));
        setVideoSelectedModelObj(def);
      }
    })
    .catch(console.error);
}, [videoEngine]);

// Family groupings
const videoFamilies     = useMemo(() => {
  const groups: Record<string, PricingModel[]> = {};
  videoAvailableModels.forEach(m => {
    const fam = extractFamilyName(m.name);
    if (!groups[fam]) groups[fam] = [];
    groups[fam].push(m);
  });
  return groups;
}, [videoAvailableModels]);

const videoFamilyList   = useMemo(() => Object.keys(videoFamilies).sort(), [videoFamilies]);
const videoFamilyModels = useMemo(() => videoFamilies[videoSelectedFamily] || [], [videoFamilies, videoSelectedFamily]);
const videoFamilyModes  = useMemo(() => [...new Set(videoFamilyModels.flatMap(m => m.modes || []))], [videoFamilyModels]);
const videoFamilyRes    = useMemo(() => [...new Set(videoFamilyModels.flatMap(m => Object.keys(m.pricing || {})))], [videoFamilyModels]);
const videoFamilyRatios = useMemo(() => (
  [...new Set(videoFamilyModels.flatMap(m => m.aspectRatios || []))].filter(r => r && r !== 'auto')
), [videoFamilyModels]);

// isModeBased — true nếu pricing key là mode name (fast/quality), false nếu là duration (5s/8s/10s)
const isModeBased = useMemo(() => {
  const pricing = videoSelectedModelObj?.pricing ?? {};
  const keys = Object.keys(pricing);
  return keys.length > 0 && !keys[0].includes('s');
}, [videoSelectedModelObj, videoResolution]);

// Danh sách duration có thể chọn (chỉ khi không phải mode-based)
const availableVideoDurations = useMemo(() => {
  if (isModeBased || !videoSelectedModelObj?.pricing) return [];
  return Object.keys(videoSelectedModelObj.pricing);
}, [videoSelectedModelObj, videoResolution, isModeBased]);

const cycleDuration = () => {
  const idx = availableVideoDurations.indexOf(videoDuration);
  setVideoDuration(availableVideoDurations[(idx + 1) % availableVideoDurations.length] || videoDuration);
};

// Cost
const videoUnitCost = useMemo(() => {
  const pricing = videoSelectedModelObj?.pricing ?? {};
  const key = isModeBased ? videoSelectedMode : videoDuration;
  return (pricing as Record<string, number>)[key] ?? 0;
}, [videoSelectedModelObj, videoResolution, videoDuration, videoSelectedMode, isModeBased]);
```

#### 3. JSX — `VideoModelEngineSettings` (Duration + Sound đã tích hợp sẵn bên trong)

```tsx
{/* ─── AI Config — VideoModelEngineSettings (canonical video component) ─── */}
<VideoModelEngineSettings
  selectedEngine={videoEngine}
  onSelectEngine={setVideoEngine}
  availableModels={videoAvailableModels}
  selectedModelObj={videoSelectedModelObj}
  setSelectedModelObj={setVideoSelectedModelObj}
  familyList={videoFamilyList}
  selectedFamily={videoSelectedFamily}
  setSelectedFamily={setVideoSelectedFamily}
  familyModels={videoFamilyModels}
  familyModes={videoFamilyModes}
  familyResolutions={videoFamilyRes}
  familyRatios={videoFamilyRatios}
  selectedMode={videoSelectedMode}
  setSelectedMode={setVideoSelectedMode}
  ratio={videoRatio}
  setRatio={setVideoRatio}
  resolution={videoResolution}
  setResolution={setVideoResolution}
  isModeBased={isModeBased}
  duration={videoDuration}
  cycleDuration={cycleDuration}
  soundEnabled={soundEnabled}
  setSoundEnabled={setSoundEnabled}
  quantity={videoQuantity}
  setQuantity={setVideoQuantity}
  showQuantity={true}
  isGenerating={isGenerating}
/>
```

> ✅ `VideoModelEngineSettings` đã **tích hợp sẵn** Duration pill + Sound toggle bên trong — **không cần thêm row bên ngoài** như pattern cũ.

#### 4. Dùng trong generate payload

```tsx
const payload: VideoJobRequest = {
  type: 'text-to-video',
  input: { images: [null, null] },
  config: { duration: parseInt(videoDuration), aspectRatio: videoRatio, resolution: videoResolution },
  engine: {
    provider: videoEngine as any,
    model: videoSelectedModelObj?.modelKey as any,
  },
  enginePayload: {
    prompt: finalPrompt,
    privacy: 'PRIVATE',
    projectId: 'default',
    mode: videoSelectedMode as any,
    translateToEn: true,
  },
};
```

---

### C. Vị trí trong Sidebar Layout

```
SIDEBAR — Tạo ảnh
│ Product-specific picker (platform/format/etc.)
│ ─── INDUSTRY PICKER ───
│ ─── ✅ ModelEngineSettings (image component) ───
│     SERVER pills — live status
│     MODEL family dropdown + list modal
│     CHẾ ĐỘ pills
│     TỶ LỆ pills + P.GIẢI pills
│     # SL selector
│ ─── AI SUGGEST PANEL ───
│ Prompt textarea + AI Boost button
│ Reference images
│ ─────────────────────────────
│ Cost badge + Generate button

SIDEBAR — Tạo video
│ Product-specific picker
│ ─── INDUSTRY PICKER ───
│ ─── ✅ VideoModelEngineSettings (video component) ───
│     SERVER pills — live status
│     MODEL family dropdown + list modal
│     PHIÊN BẢN (variants) pills
│     CHẾ ĐỘ pills
│     TỶ LỆ + P.GIẢI + THỜI LƯỢNG + ÂM THANH  ← đã tích hợp sẵn
│     # SL selector
│ ─── AI SUGGEST PANEL ───
│ Prompt textarea + AI Boost button
│ Reference images
│ ─────────────────────────────
│ Cost badge + Generate button
```

---

### D. Common Mistakes

| ❌ Sai | ✅ Đúng |
|--------|---------|
| Tự build Server/Model/Mode/Res/SL UI thủ công | Dùng `<ModelEngineSettings>` (ảnh) hoặc `<VideoModelEngineSettings>` (video) |
| Dùng `ModelEngineSettings` cho video workspace | Dùng `VideoModelEngineSettings` từ `components/video-generator/` |
| Thêm Duration/Sound row bên ngoài `VideoModelEngineSettings` | Duration + Sound đã tích hợp sẵn bên trong component — không cần thêm |
| `const CREDIT_COST = 120` hardcode | Dùng `selectedModelCost` từ `useImageModels` hook (ảnh) / `videoUnitCost` (video) |
| `const MODELS = ['Nano Banana', ...]` hardcode | Fetch từ `pricingApi.getPricing({ tool: 'video', engine })` → `availableModels` |
| Không pass `familyModels={familyModels.map(m => m.raw \|\| m)}` | Luôn map `.raw` — `ModelEngineSettings` (image) cần raw PricingModel |
| Build Video settings UI từ đầu | Dùng `VideoModelEngineSettings` (xem canonical `AIVideoGeneratorWorkspace`) |
| `generateDemoImage` / `generateDemoVideo` từ `services/gemini` | Dùng `imagesApi.createJob` + poll / `videosApi.createJob` + poll |
| `useState<string\|null>(null)` — 1 result duy nhất | `useState<REResult[]>([])` — task list với status per-item |
| Không hoàn credits khi job thất bại | `addCredits(cost)` + set `isRefunded: true` khi `status === 'error'` |





**Đọc `AIImageGeneratorWorkspace.tsx` + hook `useImageGenerator`** trước khi code. Copy nguyên các phần sau:

> ⚠️ **Hook pattern:** `AIImageGeneratorWorkspace` dùng `useImageGenerator()` hook để quản lý toàn bộ state (engine, model, mode, res, ratio, quantity). Khi tạo workspace mới tạo ảnh, dùng cùng hook này thay vì tự quản lý state rời.

#### Engine list + Family + Model
```tsx
// Lấy từ hook — KHÔNG hardcode engines array
const g = useImageGenerator(); // đọc hook này từ canonical workspace
const { rawModels, engines, selectedEngine, setSelectedEngine } = g;
// engines = [{ id: string, label: string }, ...] — từ API, không hardcode

// Group models theo family
const families = useMemo(() => {
  const groups: Record<string, any[]> = {};
  rawModels.forEach((m: any) => {
    const fam = extractImageFamily(m.name); // copy hàm này từ AIImageGeneratorWorkspace
    if (!groups[fam]) groups[fam] = [];
    groups[fam].push(m);
  });
  return groups;
}, [rawModels]);

const familyList = useMemo(() => Object.keys(families).sort(), [families]);
const [selectedFamily, setSelectedFamily] = useState('');

// familyModels = list model objects của family đang chọn
const familyModels = useMemo(() => families[selectedFamily] || [], [families, selectedFamily]);

// selectedModel = object đầu tiên khớp với mode+res hiện tại (hoặc auto-select)
// Dùng pattern giống canonical: g.selectedModel từ hook
const selectedModel = g.selectedModel; // PricingModel object — có .pricing, .modes, .aspectRatios
```

#### Auto-sync khi family đổi (BẮT BUỘC)
```tsx
// Khi user đổi family → reset về model đầu tiên + mode/res đầu tiên của family mới
useEffect(() => {
  if (familyModels.length > 0) {
    // g.setSelectedModel(familyModels[0]) hoặc dùng setter tương đương của hook
    const firstModel = familyModels[0];
    g.setSelectedModel?.(firstModel);
    const firstMode = firstModel.modes?.[0] ?? '';
    const firstRes  = Object.keys(firstModel.pricing ?? {})[0] ?? '';
    g.setSelectedMode?.(firstMode);
    g.setSelectedRes?.(firstRes);
  }
}, [selectedFamily]); // eslint-disable-line react-hooks/exhaustive-deps
```

#### Mode + Resolution + Ratio (derived từ family)
```tsx
const familyModes = useMemo(
  () => [...new Set(familyModels.flatMap((m: any) => m.modes || []))],
  [familyModels]
);
const familyResolutions = useMemo(
  () => [...new Set(familyModels.flatMap((m: any) => Object.keys(m.pricing || {})))],
  [familyModels]
);
const familyRatios = useMemo(
  () => [...new Set(familyModels.flatMap((m: any) => m.aspectRatios || []))].filter((r: string) => r && r !== 'auto'),
  [familyModels]
);

// Dùng g.selectedMode, g.setSelectedMode, g.selectedRes, g.setSelectedRes, g.selectedRatio, g.setSelectedRatio từ hook
```

#### Quantity + Cost (dynamic từ selectedModel object)
```tsx
// g.quantity, g.setQuantity từ hook

// Cost = tra pricing matrix từ selectedModel object (KHÔNG phải family string)
const currentUnitCost = useMemo(() => {
  if (!selectedModel?.pricing) return 120; // fallback khi model chưa load
  const resMatrix = selectedModel.pricing[g.selectedRes?.toLowerCase() ?? ''];
  if (!resMatrix) return 120;
  // Ưu tiên mode-based, fallback sang key đầu tiên
  return resMatrix[g.selectedMode] ?? resMatrix[Object.keys(resMatrix)[0]] ?? 120;
}, [selectedModel, g.selectedRes, g.selectedMode]);

// Credit check — dùng currentUnitCost (dynamic), KHÔNG hardcode
if (credits < currentUnitCost * g.quantity) { setShowLowCreditAlert(true); return; }
```

#### UI — Sidebar Settings Block (đặt sau Industry Picker, trước AISuggestPanel)
```tsx
{/* ─── ENGINE ─── */}
<div className="grid grid-cols-2 gap-2 mb-3">
  <div>
    <p className="text-[9px] font-semibold uppercase text-slate-400 dark:text-[#555] mb-1.5 tracking-widest">Server</p>
    <select value={selectedEngine || ''} onChange={e => setSelectedEngine(e.target.value)}
      className="w-full px-2.5 py-1.5 rounded-lg bg-black/[0.03] dark:bg-white/[0.03] border border-black/[0.06] dark:border-white/[0.06] text-[11px] text-slate-700 dark:text-white/80">
      {engines.map(e => <option key={e.id} value={e.id}>{e.label}</option>)}
    </select>
  </div>
  <div>
    <p className="text-[9px] font-semibold uppercase text-slate-400 dark:text-[#555] mb-1.5 tracking-widest">Model</p>
    <select value={selectedFamily} onChange={e => setSelectedFamily(e.target.value)}
      className="w-full px-2.5 py-1.5 rounded-lg bg-black/[0.03] dark:bg-white/[0.03] border border-black/[0.06] dark:border-white/[0.06] text-[11px] text-slate-700 dark:text-white/80">
      {familyList.map(f => <option key={f} value={f}>{f}</option>)}
    </select>
  </div>
</div>

{/* ─── MODE + RESOLUTION ─── */}
<div className="grid grid-cols-2 gap-2 mb-3">
  <div>
    <p className="text-[9px] font-semibold uppercase text-slate-400 dark:text-[#555] mb-1.5 tracking-widest">Chế độ</p>
    <select value={selectedMode} onChange={e => setSelectedMode(e.target.value)}
      className="w-full px-2.5 py-1.5 rounded-lg bg-black/[0.03] dark:bg-white/[0.03] border border-black/[0.06] dark:border-white/[0.06] text-[11px] text-slate-700 dark:text-white/80">
      {familyModes.map(m => <option key={m} value={m}>{m}</option>)}
    </select>
  </div>
  <div>
    <p className="text-[9px] font-semibold uppercase text-slate-400 dark:text-[#555] mb-1.5 tracking-widest">Độ phân giải</p>
    <select value={selectedRes} onChange={e => setSelectedRes(e.target.value)}
      className="w-full px-2.5 py-1.5 rounded-lg bg-black/[0.03] dark:bg-white/[0.03] border border-black/[0.06] dark:border-white/[0.06] text-[11px] text-slate-700 dark:text-white/80">
      {familyResolutions.map(r => <option key={r} value={r}>{r}</option>)}
    </select>
  </div>
</div>

{/* ─── RATIO + QUANTITY ─── */}
<div className="flex items-center justify-between mb-3">
  <div className="flex gap-1.5 flex-wrap">
    {familyRatios.map(r => (
      <button key={r} onClick={() => setSelectedRatio(r)}
        className={`px-2.5 py-1 rounded-lg text-[10px] font-semibold border transition-all ${
          selectedRatio === r
            ? 'bg-brand-blue text-white border-brand-blue'
            : 'border-black/[0.06] dark:border-white/[0.06] text-slate-500 hover:border-brand-blue/40'
        }`}>
        {r}
      </button>
    ))}
  </div>
  <div className="flex items-center gap-1">
    {[1, 2, 3, 4].map(q => (
      <button key={q} onClick={() => setQuantity(q)}
        className={`w-7 h-7 rounded-lg text-[11px] font-bold transition-all ${
          quantity === q ? 'bg-brand-blue text-white' : 'bg-black/[0.03] dark:bg-white/[0.03] text-slate-500 hover:bg-brand-blue/10'
        }`}>
        {q}
      </button>
    ))}
  </div>
</div>
```

---

### B. Settings Combo — Tạo video (copy từ AIVideoGeneratorWorkspace)

**Đọc `AIVideoGeneratorWorkspace.tsx`** trước khi code. Copy nguyên các phần sau:

> ⚠️ **Không hardcode engines/models:** Cả engine list lẫn model list đều load từ API. Đọc canonical workspace để biết hook hoặc API call đang dùng (`useVideoGenerator` hoặc fetch trực tiếp).

#### Engine + Family + Model
```tsx
// engines = dynamic từ API (như canonical workspace) — KHÔNG tự định nghĩa array
// Đọc AIVideoGeneratorWorkspace để biết cách fetch engines

const [selectedEngine, setSelectedEngine] = useState('gommo'); // default từ canonical
const [selectedFamily, setSelectedFamily] = useState('VEO');   // default family
const [selectedModelObj, setSelectedModelObj] = useState<PricingModel | null>(null);

// Family extraction — copy hàm extractFamilyName từ AIVideoGeneratorWorkspace
const KNOWN_FAMILIES = ['VEO', 'Kling', 'Hailuo', 'Grok', 'Sora', 'WAN', 'Wan', 'V-Fuse', 'OmniHuman', 'Seedance'];
const extractFamilyName = (name: string): string => {
  const n = name.trim();
  for (const fam of KNOWN_FAMILIES) {
    if (n.toLowerCase().startsWith(fam.toLowerCase())) return fam;
  }
  return n.split(/\s*-\s/)[0].split(/\s+/)[0] || 'Other';
};

// Group raw models → families (rawModels từ API fetch)
const families = useMemo(() => {
  const groups: Record<string, PricingModel[]> = {};
  rawModels.forEach(m => {
    const fam = extractFamilyName(m.name);
    if (!groups[fam]) groups[fam] = [];
    groups[fam].push(m);
  });
  return groups;
}, [rawModels]);

const familyList    = useMemo(() => Object.keys(families).sort(), [families]);
const familyModels  = useMemo(() => families[selectedFamily] || [], [families, selectedFamily]);
const familyModes   = useMemo(() => [...new Set(familyModels.flatMap(m => m.modes || (m.mode ? [m.mode] : [])))], [familyModels]);
const familyResolutions = useMemo(() => [...new Set(familyModels.flatMap(m => Object.keys(m.pricing || {})))], [familyModels]);
const familyRatios  = useMemo(() => [...new Set(familyModels.flatMap(m => m.aspectRatios || []))].filter(r => r && r !== 'auto'), [familyModels]);
```

#### Auto-sync khi family đổi (BẮT BUỘC)
```tsx
// Khi user đổi family → reset model + mode + resolution về giá trị đầu tiên hợp lệ
useEffect(() => {
  if (familyModels.length > 0) {
    const first = familyModels[0];
    setSelectedModelObj(first);
    const firstMode = (Array.isArray(first.modes) ? first.modes[0] : first.mode) ?? 'relaxed';
    const firstRes  = Object.keys(first.pricing ?? {})[0] ?? '720p';
    setSelectedMode(firstMode);
    setResolution(firstRes);
  }
}, [selectedFamily]); // eslint-disable-line react-hooks/exhaustive-deps
```

#### Mode + Resolution + Ratio + Duration
> **Note:** Video workspace quản lý state trực tiếp (không qua hook như image). `familyModes`, `familyResolutions`, `familyRatios` đã được derive ở phần Family bên trên.
```tsx
// State riêng — không qua hook
const [selectedMode, setSelectedMode] = useState('relaxed');
const [resolution,   setResolution]   = useState('720p');
const [ratio,        setRatio]        = useState('16:9');
const [duration,     setDuration]     = useState('8s');
const [soundEnabled, setSoundEnabled] = useState(false);

// Detect pricing model type (mode-based vs duration-based)
const isModeBased = useMemo(() => {
  if (!selectedModelObj?.pricing) return false;
  const resMatrix = selectedModelObj.pricing[resolution.toLowerCase()];
  if (!resMatrix) return false;
  return Object.keys(resMatrix).every(k => isNaN(Number(k)));
}, [selectedModelObj, resolution]);

// Available durations — dynamic từ model pricing
const availableDurations = useMemo(() => {
  if (!selectedModelObj?.pricing) return ['5s', '8s', '10s'];
  const resMatrix = selectedModelObj.pricing[resolution.toLowerCase()];
  if (!resMatrix || isModeBased) return ['8s'];
  return Object.keys(resMatrix).map(d => `${d}s`);
}, [selectedModelObj, resolution, isModeBased]);

// Cycle helpers (dùng cho compact buttons)
const cycleRatio    = () => { const arr = familyRatios;    const i = arr.indexOf(ratio);    setRatio(arr[(i + 1) % arr.length]); };
const cycleDuration = () => { const arr = availableDurations; const i = arr.indexOf(duration); setDuration(arr[(i + 1) % arr.length]); };
const cycleSound    = () => setSoundEnabled(s => !s);
```

#### Cost calculation
```tsx
// Copy hàm getUnitCost từ AIVideoGeneratorWorkspace
const getUnitCost = (model: PricingModel | null, resKey: string, durStr: string, mode?: string): number => {
  if (!model?.pricing) return 1500;
  const resMatrix = model.pricing[resKey.toLowerCase()];
  if (!resMatrix) return 1500;
  if (mode && resMatrix[mode] != null) return resMatrix[mode];
  const durKey = durStr.replace('s', '');
  return resMatrix[durKey] ?? 1500;
};

const currentUnitCost = useMemo(
  () => getUnitCost(selectedModelObj, resolution, duration, selectedMode),
  [selectedModelObj, resolution, duration, selectedMode]
);

// Credit check — cost phụ thuộc quantity
if (credits < currentUnitCost * quantity) { setShowLowCreditAlert(true); return; }
```

#### UI — Sidebar Settings Block (video)
```tsx
{/* ─── ENGINE + FAMILY ─── */}
<div className="grid grid-cols-2 gap-2 mb-3">
  <div>
    <p className="text-[9px] font-semibold uppercase text-slate-400 dark:text-[#555] mb-1.5 tracking-widest">Server</p>
    <select value={selectedEngine} onChange={e => setSelectedEngine(e.target.value)}
      className="w-full px-2.5 py-1.5 rounded-lg bg-black/[0.03] dark:bg-white/[0.03] border border-black/[0.06] dark:border-white/[0.06] text-[11px] text-slate-700 dark:text-white/80">
      {engines.map(e => <option key={e.id} value={e.id}>{e.label}</option>)}
    </select>
  </div>
  <div>
    <p className="text-[9px] font-semibold uppercase text-slate-400 dark:text-[#555] mb-1.5 tracking-widest">Model</p>
    <select value={selectedFamily} onChange={e => setSelectedFamily(e.target.value)}
      className="w-full px-2.5 py-1.5 rounded-lg bg-black/[0.03] dark:bg-white/[0.03] border border-black/[0.06] dark:border-white/[0.06] text-[11px] text-slate-700 dark:text-white/80">
      {familyList.map(f => <option key={f} value={f}>{f}</option>)}
    </select>
  </div>
</div>

{/* ─── MODE + RESOLUTION ─── */}
<div className="grid grid-cols-2 gap-2 mb-3">
  <div>
    <p className="text-[9px] font-semibold uppercase text-slate-400 dark:text-[#555] mb-1.5 tracking-widest">Chế độ</p>
    <select value={selectedMode} onChange={e => setSelectedMode(e.target.value)}
      className="w-full px-2.5 py-1.5 rounded-lg bg-black/[0.03] dark:bg-white/[0.03] border border-black/[0.06] dark:border-white/[0.06] text-[11px] text-slate-700 dark:text-white/80">
      {familyModes.map(m => <option key={m} value={m}>{m}</option>)}
    </select>
  </div>
  <div>
    <p className="text-[9px] font-semibold uppercase text-slate-400 dark:text-[#555] mb-1.5 tracking-widest">Độ phân giải</p>
    <select value={resolution} onChange={e => setResolution(e.target.value)}
      className="w-full px-2.5 py-1.5 rounded-lg bg-black/[0.03] dark:bg-white/[0.03] border border-black/[0.06] dark:border-white/[0.06] text-[11px] text-slate-700 dark:text-white/80">
      {familyResolutions.map(r => <option key={r} value={r}>{r}</option>)}
    </select>
  </div>
</div>

{/* ─── RATIO · DURATION · SOUND (inline buttons) ─── */}
<div className="flex items-center gap-2 flex-wrap mb-3">
  <button onClick={cycleRatio}
    className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-black/[0.03] dark:bg-white/[0.03] border border-black/[0.06] dark:border-white/[0.06] text-[10px] font-semibold text-slate-600 dark:text-white/70 hover:border-brand-blue/40 transition-all">
    ⊡ {ratio}
  </button>
  {!isModeBased && (
    <button onClick={cycleDuration}
      className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-black/[0.03] dark:bg-white/[0.03] border border-black/[0.06] dark:border-white/[0.06] text-[10px] font-semibold text-slate-600 dark:text-white/70 hover:border-brand-blue/40 transition-all">
      ⏱ {duration}
    </button>
  )}
  <button onClick={cycleSound}
    className={`flex items-center gap-1 px-2.5 py-1.5 rounded-lg border text-[10px] font-semibold transition-all ${
      soundEnabled
        ? 'bg-brand-blue/10 border-brand-blue/30 text-brand-blue'
        : 'bg-black/[0.03] dark:bg-white/[0.03] border-black/[0.06] dark:border-white/[0.06] text-slate-400'
    }`}>
    {soundEnabled ? '🔊' : '🔇'} Âm thanh
  </button>
</div>

{/* ─── QUANTITY ─── */}
<div className="flex items-center gap-1 mb-3">
  <p className="text-[9px] font-semibold uppercase text-slate-400 dark:text-[#555] tracking-widest mr-2">Số lượng</p>
  {[1, 2, 3, 4].map(q => (
    <button key={q} onClick={() => setQuantity(q)}
      className={`w-7 h-7 rounded-lg text-[11px] font-bold transition-all ${
        quantity === q ? 'bg-brand-blue text-white' : 'bg-black/[0.03] dark:bg-white/[0.03] text-slate-500 hover:bg-brand-blue/10'
      }`}>
      {q}
    </button>
  ))}
</div>
```

---

### C. Vị trí trong Sidebar Layout

```
SIDEBAR
│ Product-specific picker (platform/format/etc.)
│ ─── INDUSTRY PICKER ───
│ ─── ✅ SETTINGS COMBO (6.5) ───
│     Server | Model (Family)
│     Chế độ | Độ phân giải
│     Ratio · Duration · Sound (video only)
│     Quantity buttons
│ ─── AI SUGGEST PANEL ───
│ Prompt textarea
│ AI Boost button
│ Reference images
│ ─────────────────────────────
│ Cost badge + Generate button
```

---

### D. Common Mistakes khi dùng Settings Combo

| Sai | Đúng |
|-----|------|
| Hardcode `CREDIT_COST = 120` khi dùng dynamic model | Dùng `currentUnitCost` từ pricing matrix |
| Copy MODELS array thủ công | Fetch dynamic từ API qua `useImageGenerator` / `useVideoGenerator` hook |
| Bỏ qua `isModeBased` detection | Nếu `isModeBased = true` → ẩn duration selector, dùng mode làm key pricing |
| Tự build family grouping logic | Copy `extractImageFamily` / `extractFamilyName` từ canonical workspace |
| Ratio/Duration là select dropdown | Dùng **cycle button** (như canonical video workspace) — nhỏ gọn hơn |
| Dùng `generateDemoImage` / `generateDemoVideo` từ `services/gemini` | Dùng `imagesApi.createJob` + poll / `videosApi.createJob` + poll |
| `const [result, setResult] = useState<string\|null>(null)` — 1 result duy nhất | `const [results, setResults] = useState<REResult[]>([])` — task list với status per-item |
| Không hoàn credits khi job thất bại | Khi `status === 'error'`: gọi `addCredits(cost)` + set `isRefunded: true` |
| Viewport chỉ hiển thị 1 ảnh, không có task list | Right rail: tab "Tác vụ" (results list) + tab "Lịch sử" (sessions localStorage) |
| Không sync selectedModel khi family đổi | Luôn có `useEffect([selectedFamily])` auto-select model đầu tiên của family |
| `engines` array tự hardcode | `engines` lấy từ hook — xem canonical workspace để biết tên biến chính xác |
| Dùng `selectedFamily` (string) vào `currentUnitCost` | Phải resolve `selectedFamily` → `selectedModel` object trước khi tính cost |

---

## STEP 7 — Wire routing

```tsx
// App.tsx — 3 chỗ:
yourProduct: () => import('./pages/images/YourProductAI'), // pageImports
const YourProductAI = React.lazy(pageImports.yourProduct); // lazy
<Route path="/product/your-slug" element={<YourProductAI />} /> // route — TRƯỚC catch-all /product/:slug

// components/market/ProductToolModal.tsx — WORKSPACE_MAP:
'your-slug': React.lazy(() => import('../YourWorkspace') as Promise<{default: React.ComponentType<WorkspaceProps>}>),
```

> **Kiểm tra `constants/market-config.tsx`:** Nếu file này có danh sách featured products, categories, hoặc homeBlocks config → thêm product mới vào đây để hiển thị đúng trên homepage/marketplace.

---

## STEP 8 — TypeScript check

```bash
npx tsc --noEmit 2>&1 | head -40
# Must exit 0 (no output)
```

---

## STEP 8.5 — Smoke test checklist

Trước khi push, tự kiểm tra nhanh các điểm sau:

**Landing page:**
- [ ] Mở `/product/your-slug` → Hero render đúng Visual Type
- [ ] LiveStatsBar hiển thị CountUp numbers
- [ ] ShowcaseSection load ảnh từ Explorer API (không blank)
- [ ] FAQSection accordion mở/đóng đúng
- [ ] Mobile: sticky bottom CTA hiện (`md:hidden`)

**Workspace:**
- [ ] Mở Studio → sidebar render đúng
- [ ] Industry picker chuyển tab → `productContext` cập nhật AISuggestPanel
- [ ] AISuggestPanel mở 4 tabs: Prompt Ideas / Style Presets / Templates / Smart Fill
- [ ] Nhập prompt → ⌘+Enter trigger generate
- [ ] Prompt rỗng → Generate button disabled, KHÔNG submit
- [ ] Credits < CREDIT_COST → Low Credit modal xuất hiện
- [ ] Generate thành công → credits trừ đúng, toast "thành công" hiện
- [ ] Generate thất bại → toast "credits chưa trừ" hiện, credits không đổi
- [ ] Polling timeout (> 150s) → credits hoàn lại, status dot đỏ
- [ ] Nút Hủy hiện khi đang generate, click abort đúng
- [ ] Click Generate 2 lần liền → chỉ 1 job submit (concurrent guard)
- [ ] Mobile: nút "Cài đặt" mở bottom sheet
- [ ] Reference image upload → preview 3-col, xóa được từng ảnh

**i18n:**
- [ ] Chuyển ngôn ngữ EN/VI/KO/JA → product name, category, description hiển thị đúng
- [ ] UI strings (label, placeholder) không có hardcode tiếng Việt trong key-value `t('...')` bị thiếu

**Performance (nhanh):**
- [ ] Landing page FCP < 3s trên 3G (Chrome DevTools → Throttle → Fast 3G)
- [ ] Ảnh CDN load không bị layout shift (có `width`/`height` hoặc `aspect-ratio`)
- [ ] Console không có red error sau load lần đầu

---

## STEP 9 — Dọn dẹp & Git push

```bash
# 1. Gitignore seed scripts (chứa TOKEN — không commit lên repo)
echo "seed-*.mjs" >> .gitignore
echo "gen-*.mjs" >> .gitignore
echo "update-*.mjs" >> .gitignore

# 2. Pre-commit safety check — phát hiện TOKEN lọt vào staged files
echo "🔒 Checking for tokens in staged files..."
if git diff --cached --name-only | xargs grep -l "TOKEN\s*=\s*['\"][a-zA-Z0-9_\-]\{20,\}" 2>/dev/null; then
  echo "❌ FAIL: Token tìm thấy trong staged files! Chạy lại gitignore và unstage."
  exit 1
fi
echo "✅ No tokens found."

# 3. Commit & push
git add -A && git commit -m "feat: add <product-name> — PRO landing + smart workspace + seed + banner" && git push origin main
```

> ⚠️ **Bắt buộc gitignore trước khi commit** — seed scripts chứa `TOKEN` admin, không được để lộ trong git history.

---

## ❌ Common Mistakes (updated)

| Sai | Đúng |
|-----|------|
| Quên gitignore seed scripts | `echo "seed-*.mjs" >> .gitignore` trước khi commit — TOKEN không được lộ |
| Không kiểm tra constants/market-config | Xem STEP 7 — thêm product vào featured/homeBlocks nếu cần |
| Landing page 1 file monolithic | Thin orchestrator + 8 section files riêng |
| Copy Explorer image grid cho mọi product | Dùng đúng Hero Visual Type từ STEP 3.6 |
| Tự ý dùng màu accent mới | Dùng `brand-blue` nhất quán |
| Reference `PosterStudioWorkspace` cho workspace mới | Reference `SocialBannerWorkspace` (canonical mới — có AISuggestPanel) |
| Workspace viết từ đầu | Copy structure `SocialBannerWorkspace.tsx` |
| Thiếu Low Credit modal | Luôn có `showLowCreditAlert` |
| Không add vào ProductToolModal | Luôn add vào `WORKSPACE_MAP` |
| Token `skv_` 401 | Hỏi user lấy token mới từ CMS Admin > API Clients |
| Quên ShowcaseSection | Luôn có `<ShowcaseSection productSlug="..." />` giữa Workflow và Features |
| Workspace không có AI suggest | Import `AISuggestPanel` từ `components/workspace/` |
| Dùng hardcode BG glow divs | Dùng `<GradientMesh />` component thay thế |
| Sections không có scroll animation | Wrap với `<FadeInUp>` / `<StaggerChildren>` |
| FeaturesSection uniform grid | Dùng bento-grid (1-2 featured cards chiếm col-span-2) |
| Quên UseCasesSection | Luôn có `<UseCasesSection />` sau FeaturesSection |
| Gen chỉ 1 ảnh thumbnail | Gen 3-5 ảnh theo platform trong STEP 3 |
| Bỏ qua STEP 3.2 (bash scripts) | Phải chạy `gen-<slug>-landing-images.sh` trước STEP 3.5 để có CDN URLs điền vào Section Image Plan |
| Không gen hình cho FeaturesSection featured cards | Mỗi product phải có `features-*` images — chạy Script 1 của STEP 3.2 |
| Không gen hình cho UseCasesSection | Chạy `gen-<slug>-landing-images.sh` — `usecase-*` images cần 1 ảnh/industry |
| Không gen showcase examples | Chạy `gen-<slug>-showcase.sh` cho 10-15 diverse output examples |
| Commit bash scripts chứa TOKEN | `echo "gen-*.sh" >> .gitignore` — TOKEN không được lộ trong git |
| Hardcode prompt quá chung chung | Prompt phải đặc tả industry/context cụ thể + size + no readable text |
| Industry picker copy 40+ items | Chỉ 8-12 industries phù hợp nhất với product |
| Không truyền industry vào AISuggestPanel | `productContext` phải include `activeIndustryLabel` |
| Industry picker không ảnh hưởng prompt | Prepend `[Lĩnh vực: ...]` vào `finalPrompt` khi generate |
| Import `ShowcaseImageStrip` từ SectionAnimations | Import từ `ProHeroVisuals` |
| Import `FloatingBadge` từ SectionAnimations | Import từ `ProHeroVisuals` |
| Sections không có ảnh minh hoạ | Featured cards trong FeaturesSection nên có `thumbUrl` từ CDN STEP 3 |
| Định nghĩa Wand2 inline SVG trong Workspace | Import `Wand2` từ `lucide-react` |
| STORAGE_KEY dùng slug viết thường | Dùng SCREAMING-SNAKE id: `skyverses_<ID>_vault` (VD: `skyverses_SOCIAL-BANNER-AI_vault`) |

---

## Shared Components Reference

```
components/landing/_shared/
  SectionAnimations.tsx     → FadeInUp, FadeInScale, StaggerChildren,
                               ParallaxSection, CountUp, GradientMesh,
                               SectionLabel, HoverCard, TimelineConnector

  ProHeroVisuals.tsx        → ImageMasonryGrid, BeforeAfterSlider,
                               VideoReelGrid, ShowcaseImageStrip,  ← import từ đây
                               FloatingBadge, AIBadge              ← import từ đây

components/workspace/
  AISuggestPanel.tsx        → Tab: Prompt Ideas | Style Presets | Templates | Smart Fill
                               Props: productSlug, productName, styles[],
                                      onPromptSelect, onApply, historyKey,
                                      productContext (truyền activeIndustry), featuredTemplates

components/SocialBannerWorkspace.tsx
                            → ✅ Canonical workspace reference (MỚI NHẤT)
                               Có: AISuggestPanel + Industry Picker + Platform Picker
                               Dùng thay cho PosterStudioWorkspace khi tạo workspace mới

components/PosterStudioWorkspace.tsx
                            → ⚠️ Reference cũ — chưa có AISuggestPanel
                               Chỉ dùng để tham khảo generate logic
```

## Landing Page Section Order (chuẩn)

> Khớp với `SocialBannerAI.tsx` — canonical mới nhất (2025-04).

```
HeroSection          ← ProHeroVisuals + GradientMesh (xem STEP 3.6 chọn visual type)
                       → hero-demo-* image: CDN từ STEP 3.2 Script 1
LiveStatsBar         ← CountUp social proof numbers (L2) — ngay sau Hero
WorkflowSection      ← 4 bước + StaggerChildren + TimelineConnector
                       → workflow-result: CDN từ STEP 3.2 Script 1
ShowcaseSection      ← ShowcaseImageStrip (import từ ProHeroVisuals)
                       → showcase examples: CDN từ STEP 3.2 Script 2
FeaturesSection      ← Bento-grid (featured cards kèm thumbUrl từ CDN STEP 3.2)
                       → features-* thumbs: CDN từ STEP 3.2 Script 1
                       → feat-* thumbs: CDN từ STEP 3.2 Script 3
UseCasesSection      ← 4-6 industry use cases + icons
                       → usecase-* thumbs: CDN từ STEP 3.2 Script 1 (optional)
FAQSection           ← Accordion 5-6 câu hỏi (L3) — trước FinalCTA
FinalCTA             ← Animated button + GradientMesh + trust micro-copy (L1)
[Sticky mobile CTA]  ← md:hidden fixed bottom bar (L4) — trong page file
```

> **Ghi chú:** Các product cũ (image-generator, video-generator, image-restoration) chưa có LiveStatsBar, ShowcaseSection, UseCasesSection, FAQSection — **không bắt buộc backport**, chỉ áp dụng cho product mới tạo từ workflow này.

---

## WORKSPACE UX PATTERNS (từ SocialBannerWorkspace — cập nhật 2025-04)

> Áp dụng cho **mọi workspace mới**. Copy từ `SocialBannerWorkspace.tsx` (canonical).

### W1 — ⌘+Enter shortcut

Thêm vào textarea của prompt:

```tsx
onKeyDown={e => {
  if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') {
    e.preventDefault();
    handleGenerate();
  }
  // Bonus: Arrow Up khi prompt trống → điền prompt đầu tiên từ history
  if (e.key === 'ArrowUp' && !prompt.trim()) {
    e.preventDefault();
    const hist = (() => { try { return JSON.parse(localStorage.getItem(STORAGE_KEY + '_prompts') || '[]'); } catch { return []; } })();
    if (hist[0]) setPrompt(hist[0]);
  }
}}
```

Thêm `⌘↵` tooltip vào nút Generate:
```tsx
<Sparkles size={14} /> Tạo <kbd className="ml-1 text-[9px] font-mono bg-white/20 px-1.5 py-0.5 rounded opacity-70 normal-case tracking-normal">⌘↵</kbd>
```

---

### W2 — Skeleton loading cards (thay empty generate state)

Khi `isGenerating === true`, thay empty state bằng 2×2 shimmer grid:

```tsx
) : isGenerating ? (
  <div className="w-full max-w-2xl space-y-3">
    <div className="grid grid-cols-2 gap-3">
      {[1,2,3,4].map(i => (
        <div key={i}
          className="aspect-video rounded-2xl bg-slate-200 dark:bg-white/[0.04] animate-pulse overflow-hidden relative"
          style={{ animationDelay: `${i * 0.1}s` }}
        >
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 dark:via-white/[0.05] to-transparent -translate-x-full animate-[shimmer_1.5s_infinite]" />
        </div>
      ))}
    </div>
    <p className="text-center text-[11px] text-slate-400 animate-pulse">AI đang tạo · thường mất 10–30 giây...</p>
  </div>
```

---

### W3 — Cancel button (abort generation)

State:
```tsx
const abortRef = useRef<AbortController | null>(null);
```

Trong handleGenerate:
```tsx
const controller = new AbortController();
abortRef.current = controller;
setIsGenerating(true);
try {
  // ... API call
  if (controller.signal.aborted) return;
} catch (err) {
  if (controller.signal.aborted) return;
} finally {
  if (!controller.signal.aborted) setIsGenerating(false);
  abortRef.current = null;
}
```

Cancel button (hiện bên cạnh CR cost khi đang generate):
```tsx
{isGenerating && (
  <button
    onClick={() => { abortRef.current?.abort(); setIsGenerating(false); setStatus('Đã hủy'); }}
    className="text-[10px] text-red-400 hover:text-red-500 font-semibold flex items-center gap-1"
  >
    <X size={11} /> Hủy
  </button>
)}
```

---

### W4 — Toast refund/success (credits chỉ trừ SAU khi API thành công)

**Credit deduction PHẢI đặt SAU khi API trả về thành công:**

```tsx
const imageUrl = await generateDemoImage(finalPrompt, references);
if (controller.signal.aborted) return;

if (imageUrl) {
  useCredits(totalCost);              // ← chỉ trừ khi có ảnh
  setResult(imageUrl);
  showToast('Banner tạo thành công!', 'success');
} else {
  setStatus('Lỗi tạo banner');
  showToast('Không tạo được — credits chưa bị trừ, thử lại nhé!', 'warning');
}
```

Lỗi exception:
```tsx
} catch (err) {
  if (controller.signal.aborted) return;
  setStatus('Lỗi hệ thống');
  showToast('Lỗi hệ thống — credits chưa bị trừ.', 'error');
}
```

Import toast:
```tsx
import { useToast } from '../context/ToastContext';
const { showToast } = useToast();
```

---

### W5 — Download + Fullscreen overlay trên result image

Khi có ảnh kết quả, hiện 2 action button overlay khi hover:

```tsx
{result && (
  <div className="relative group w-full max-w-2xl">
    <img src={result} className="w-full rounded-2xl shadow-xl" alt="AI result" />

    {/* Overlay actions — hiện khi hover */}
    <div className="absolute inset-0 rounded-2xl bg-black/0 group-hover:bg-black/30 transition-colors duration-200 flex items-end justify-end gap-2 p-3 opacity-0 group-hover:opacity-100">
      {/* Download */}
      <a
        href={result}
        download
        target="_blank"
        rel="noreferrer"
        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/90 dark:bg-black/80 text-[11px] font-semibold text-slate-700 dark:text-white hover:bg-white hover:scale-105 transition-all shadow-sm"
      >
        <Download size={13} /> Tải xuống
      </a>
      {/* Fullscreen */}
      <button
        onClick={() => setIsFullscreen(true)}
        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/90 dark:bg-black/80 text-[11px] font-semibold text-slate-700 dark:text-white hover:bg-white hover:scale-105 transition-all shadow-sm"
      >
        <Maximize2 size={13} /> Xem toàn màn hình
      </button>
    </div>
  </div>
)}

{/* Fullscreen lightbox */}
<AnimatePresence>
  {isFullscreen && result && (
    <motion.div
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="fixed inset-0 z-[600] bg-black/95 flex items-center justify-center p-4"
      onClick={() => setIsFullscreen(false)}
    >
      <img src={result} className="max-w-full max-h-full rounded-xl shadow-2xl object-contain" />
      <button
        className="absolute top-4 right-4 text-white/70 hover:text-white"
        onClick={() => setIsFullscreen(false)}
      >
        <X size={24} />
      </button>
    </motion.div>
  )}
</AnimatePresence>
```

State cần thêm:
```tsx
const [isFullscreen, setIsFullscreen] = useState(false);
```

Import icons: `Download`, `Maximize2`, `X` từ `lucide-react`.

---

### W6 — Empty state starter prompts

Khi không có ảnh và không đang generate → hiện 4 starter cards thay vì text đơn:

```tsx
) : (
  <div className="flex flex-col items-center gap-6 w-full max-w-md">
    <div className="text-center">
      <p className="text-sm font-semibold text-slate-400">Bắt đầu với một gợi ý</p>
      <p className="text-[11px] text-slate-300 mt-1">Nhấn vào mẫu bên dưới hoặc nhập mô tả của bạn</p>
    </div>
    <div className="grid grid-cols-2 gap-2.5 w-full">
      {STARTER_PROMPTS.map(sp => (
        <button key={sp.label} onClick={() => setPrompt(sp.prompt)}
          className="p-3.5 rounded-xl border border-black/[0.06] dark:border-white/[0.06] bg-white dark:bg-white/[0.02] text-left hover:border-brand-blue/40 hover:bg-brand-blue/[0.02] transition-all group"
        >
          <span className="text-xl">{sp.emoji}</span>
          <p className="text-[11px] font-semibold text-slate-700 dark:text-white/70 mt-1.5 group-hover:text-brand-blue transition-colors">{sp.label}</p>
        </button>
      ))}
    </div>
  </div>
)}
```

---

### W7 — Prompt history dropdown

State:
```tsx
const [promptHistory, setPromptHistory] = useState<string[]>([]);
const [showHistory, setShowHistory] = useState(false);
```

Load và save (max 10, dedup):
```tsx
// Load on mount
const saved = localStorage.getItem(STORAGE_KEY + '_prompts');
if (saved) { try { setPromptHistory(JSON.parse(saved)); } catch {} }

// Save on successful generate
const newHistory = [prompt, ...promptHistory.filter(p => p !== prompt)].slice(0, 10);
setPromptHistory(newHistory);
localStorage.setItem(STORAGE_KEY + '_prompts', JSON.stringify(newHistory));
```

Dropdown UI (đặt bên cạnh label "Mô tả"):
```tsx
<div className="relative">
  <button onClick={() => setShowHistory(v => !v)}
    className="flex items-center gap-1 text-[9px] font-semibold text-slate-400 hover:text-brand-blue transition-colors">
    <History size={10} /> Lịch sử ({promptHistory.length})
  </button>
  <AnimatePresence>
    {showHistory && (
      <motion.div initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -4 }}
        className="absolute right-0 top-5 z-50 w-72 bg-white dark:bg-[#111113] border border-black/[0.08] dark:border-white/[0.08] rounded-xl shadow-2xl overflow-hidden">
        <div className="max-h-52 overflow-y-auto">
          {promptHistory.map((p, i) => (
            <button key={i} onClick={() => { setPrompt(p); setShowHistory(false); }}
              className="w-full text-left px-3 py-2.5 text-[11px] text-slate-700 dark:text-white/70 hover:bg-brand-blue/[0.06] hover:text-brand-blue transition-colors line-clamp-2 border-b border-black/[0.03] dark:border-white/[0.03] last:border-0">
              {p}
            </button>
          ))}
        </div>
      </motion.div>
    )}
  </AnimatePresence>
</div>
```

---

### W8 — View Mode Toggle (Phiên hiện tại / Thư viện)

Top nav của workspace phải có 2 tab để switch giữa current result và session library:

```tsx
type ViewMode = 'current' | 'library';
const [viewMode, setViewMode] = useState<ViewMode>('current');
```

Toggle UI trong top nav (bên trái, sau logo/title):
```tsx
{/* View mode toggle */}
<div className="flex items-center bg-black/[0.04] dark:bg-white/[0.04] rounded-lg p-0.5">
  {(['current', 'library'] as ViewMode[]).map((mode) => {
    const label = mode === 'current' ? 'Phiên hiện tại' : `Thư viện (${sessions.length})`;
    return (
      <button
        key={mode}
        onClick={() => setViewMode(mode)}
        className={`px-3 py-1.5 rounded-md text-[10px] font-semibold transition-all ${
          viewMode === mode
            ? 'bg-white dark:bg-white/[0.08] text-slate-800 dark:text-white shadow-sm'
            : 'text-slate-400 dark:text-[#666] hover:text-slate-600 dark:hover:text-white/60'
        }`}
      >
        {label}
      </button>
    );
  })}
</div>
```

Viewport render theo viewMode:
```tsx
{viewMode === 'current' ? (
  // Result area — W2/W5 patterns
  <div className="flex-1 flex items-center justify-center ...">
    {/* skeleton / result image / empty state */}
  </div>
) : (
  // Library grid — W9 pattern
  <LibraryGrid sessions={sessions} onSelect={(s) => { setResult(s.imageUrl); setViewMode('current'); }} />
)}
```

---

### W9 — Session History (Library)

Mỗi lần generate thành công → save session vào localStorage. Library tab hiển thị grid các session cũ.

Interface:
```tsx
interface BannerSession {
  id: string;           // crypto.randomUUID() hoặc Date.now().toString()
  imageUrl: string;
  prompt: string;
  createdAt: number;    // Date.now()
  // Optional metadata phù hợp product:
  style?: string;
  format?: string;      // e.g. 'instagram', 'facebook'
  industry?: string;
}
```

Save sau generate thành công (ngay sau `useCredits()`):
```tsx
const newSession: BannerSession = {
  id: Date.now().toString(),
  imageUrl,
  prompt,
  createdAt: Date.now(),
  style: activeStyle,
  // ... thêm metadata phù hợp product
};
const updatedSessions = [newSession, ...sessions].slice(0, 50); // max 50
setSessions(updatedSessions);
localStorage.setItem(STORAGE_KEY + '_sessions', JSON.stringify(updatedSessions));
```

Load on mount:
```tsx
const [sessions, setSessions] = useState<BannerSession[]>([]);

useEffect(() => {
  try {
    const saved = localStorage.getItem(STORAGE_KEY + '_sessions');
    if (saved) setSessions(JSON.parse(saved));
  } catch {}
}, []);
```

Library grid component (inline trong workspace hoặc tách file):
```tsx
interface LibraryGridProps {
  sessions: BannerSession[];
  onSelect: (session: BannerSession) => void;
}

const LibraryGrid: React.FC<LibraryGridProps> = ({ sessions, onSelect }) => {
  if (sessions.length === 0) return (
    <div className="flex-1 flex flex-col items-center justify-center gap-3 text-slate-400">
      <p className="text-sm font-semibold">Thư viện trống</p>
      <p className="text-[11px]">Tạo ảnh đầu tiên để lưu vào thư viện</p>
    </div>
  );

  return (
    <div className="flex-1 overflow-y-auto p-4">
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
        {sessions.map((s) => (
          <button
            key={s.id}
            onClick={() => onSelect(s)}
            className="group relative aspect-video rounded-xl overflow-hidden border border-black/[0.06] dark:border-white/[0.06] hover:border-brand-blue/40 transition-all hover:shadow-lg hover:shadow-brand-blue/10"
          >
            <img src={s.imageUrl} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-2">
              <p className="text-[9px] text-white/90 line-clamp-2 leading-relaxed">{s.prompt}</p>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
};
```

> **Key:** `STORAGE_KEY + '_sessions'` (tách biệt với `STORAGE_KEY + '_prompts'` của W7)

---

### W11 — Status Message với Color Dot

Status message không chỉ là text — thêm dot màu để feedback tức thì:

State:
```tsx
const [status, setStatus] = useState('');
```

Status dot component (inline):
```tsx
// Hiển thị bên cạnh CR cost, trong generate button bar
{status && (
  <span className="flex items-center gap-1.5 text-[10px] text-slate-400 dark:text-[#666]">
    <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${
      status.includes('Lỗi') || status.includes('hủy')
        ? 'bg-red-400'
        : status.includes('thành công') || status.includes('xong')
          ? 'bg-emerald-400'
          : 'bg-amber-400 animate-pulse'   // ← processing state
    }`} />
    {status}
  </span>
)}
```

setStatus calls theo flow:
```tsx
// Trước khi gọi API:
setStatus('Đang xử lý...');

// Khi có kết quả:
setStatus('Tạo thành công!');

// Khi lỗi:
setStatus('Lỗi tạo ảnh');

// Khi hủy:
setStatus('Đã hủy');

// Clear sau 3 giây (optional):
setTimeout(() => setStatus(''), 3000);
```

> **Quy tắc màu dot:**
> - `bg-amber-400 animate-pulse` → đang processing (bất kỳ status nào không khớp 2 case dưới)
> - `bg-emerald-400` → thành công (status có "thành công" hoặc "xong")
> - `bg-red-400` → lỗi/hủy (status có "Lỗi" hoặc "hủy")

---

### S1 — Mobile bottom sheet (thay sidebar trên mobile)

**Sidebar ẩn trên mobile:**
```tsx
<div className="hidden md:flex w-[380px] ...">
```

**Trigger button trong top nav (mobile only):**
```tsx
<button onClick={() => setShowMobileSheet(true)}
  className="md:hidden flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-brand-blue/10 border border-brand-blue/20 text-brand-blue text-[10px] font-bold">
  <Sparkles size={12} /> Cài đặt
</button>
```

**Bottom sheet overlay (thêm vào AnimatePresence cuối component):**
```tsx
{showMobileSheet && (
  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
    className="md:hidden absolute inset-0 z-[300] bg-black/50 backdrop-blur-sm"
    onClick={() => setShowMobileSheet(false)}>
    <motion.div initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }}
      transition={{ type: 'spring', damping: 26, stiffness: 300 }}
      onClick={e => e.stopPropagation()}
      className="absolute bottom-0 left-0 right-0 bg-white dark:bg-[#0d0d0f] rounded-t-3xl shadow-2xl max-h-[85vh] flex flex-col">
      {/* Handle bar */}
      <div className="w-10 h-1 rounded-full bg-slate-300 dark:bg-white/20 mx-auto absolute left-1/2 -translate-x-1/2 top-3" />
      {/* Header */}
      <div className="flex items-center justify-between px-5 pt-5 pb-2 shrink-0">
        <p className="text-[12px] font-bold">Cài đặt</p>
        <button onClick={() => setShowMobileSheet(false)}><X size={16} /></button>
      </div>
      {/* Scrollable content: Platform, Industry, Style, Resolution, Quantity */}
      <div className="overflow-y-auto flex-1 px-4 pb-4 space-y-4">
        {/* ... same controls as sidebar ... */}
      </div>
      {/* Footer CTA */}
      <div className="shrink-0 p-4 border-t">
        <button onClick={() => { setShowMobileSheet(false); handleGenerate(); }}
          className="w-full py-3.5 rounded-xl bg-gradient-to-r from-brand-blue to-blue-500 text-white text-[12px] font-bold">
          Tạo — {CREDIT_COST * quantity} CR
        </button>
      </div>
    </motion.div>
  </motion.div>
)}
```

---

### S2 — AI Enhance diff preview (trước khi apply)

Thay vì auto-apply enhanced prompt, hiện "before/after" diff card để user confirm:

State:
```tsx
const [enhancedPreview, setEnhancedPreview] = useState<string | null>(null);
const [showEnhanceDiff, setShowEnhanceDiff] = useState(false);
```

handleEnhance:
```tsx
const handleEnhance = async () => {
  setIsEnhancing(true);
  setShowEnhanceDiff(false);
  setEnhancedPreview(null);
  try {
    const enhanced = await generateDemoText(`...system...\n\nPrompt gốc: "${prompt}"`);
    if (enhanced && !enhanced.includes('CONNECTION_TERMINATED')) {
      setEnhancedPreview(enhanced);
      setShowEnhanceDiff(true);       // ← show diff instead of applying directly
      setStatus('Xem trước prompt mới →');
    }
  } catch {} finally { setIsEnhancing(false); }
};
```

Diff card UI (ngay dưới AI Boost button):
```tsx
<AnimatePresence>
  {showEnhanceDiff && enhancedPreview && (
    <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}
      className="overflow-hidden mt-2">
      <div className="rounded-xl border border-brand-blue/25 bg-brand-blue/[0.03] overflow-hidden">
        <div className="flex items-center justify-between px-3 py-1.5 border-b border-brand-blue/15 bg-brand-blue/[0.04]">
          <span className="text-[9px] font-bold text-brand-blue uppercase flex items-center gap-1">
            <Wand2 size={9} /> Prompt đã được tối ưu
          </span>
          <div className="flex items-center gap-2">
            <button onClick={() => { setPrompt(enhancedPreview); setShowEnhanceDiff(false); showToast('Prompt đã được cập nhật!', 'success'); }}
              className="text-[9px] font-bold text-emerald-500">✓ Áp dụng</button>
            <button onClick={() => { setShowEnhanceDiff(false); setEnhancedPreview(null); }}
              className="text-[9px] text-slate-400 hover:text-red-400">✕ Bỏ</button>
          </div>
        </div>
        <div className="px-3 py-2 border-b border-dashed border-brand-blue/10">
          <p className="text-[8px] font-bold text-slate-400 uppercase mb-1">Trước</p>
          <p className="text-[10px] text-slate-500 line-clamp-2">{prompt}</p>
        </div>
        <div className="px-3 py-2">
          <p className="text-[8px] font-bold text-brand-blue uppercase mb-1">Sau</p>
          <p className="text-[10px] text-slate-700 dark:text-white/80 line-clamp-4">{enhancedPreview}</p>
        </div>
      </div>
    </motion.div>
  )}
</AnimatePresence>
```

---

## LANDING PAGE UX PATTERNS (từ SocialBannerAI — cập nhật 2025-04)

### L1 — Trust micro-copy (dưới CTA button)

Thêm vào **HeroSection** và **FinalCTA**, ngay dưới button CTA chính:

```tsx
<p className="text-[11px] text-slate-400 dark:text-[#555] flex items-center gap-2.5 flex-wrap">
  <span>🔒 Không cần thẻ tín dụng</span>
  <span className="opacity-30">·</span>
  <span>✓ Ảnh thuộc về bạn</span>
  <span className="opacity-30">·</span>
  <span>⚡ 100 CR miễn phí khi đăng ký</span>
</p>
```

Điều chỉnh nội dung theo product. Luôn giữ 3 micro-copy: no credit card + ownership + free credits.

---

### L2 — LiveStatsBar (social proof numbers)

Tạo `components/landing/<slug>/LiveStatsBar.tsx`:

```tsx
import { CountUp } from '../_shared/SectionAnimations';

export const LiveStatsBar: React.FC = () => (
  <div className="py-8 border-y border-black/[0.05] dark:border-white/[0.04]">
    <div className="max-w-[1400px] mx-auto px-6 lg:px-12">
      <div className="flex flex-wrap items-center justify-center gap-8 md:gap-16">
        <div className="text-center">
          <p className="text-2xl font-bold"><CountUp value={47291} suffix="+" /></p>
          <p className="text-[11px] text-slate-400 mt-0.5">Ảnh tạo hôm nay</p>
        </div>
        {/* separator */}
        <div className="hidden md:block w-px h-8 bg-black/[0.06] dark:bg-white/[0.06]" />
        <div className="text-center">
          <p className="text-2xl font-bold"><CountUp value={12400} suffix="+" /></p>
          <p className="text-[11px] text-slate-400 mt-0.5">Người dùng</p>
        </div>
        {/* ... repeat pattern for avg time + rating */}
        <div className="text-center">
          <p className="text-2xl font-bold text-brand-blue">4.9<span className="text-amber-400">★</span></p>
          <p className="text-[11px] text-slate-400 mt-0.5">Đánh giá TB</p>
        </div>
      </div>
    </div>
  </div>
);
```

Wire vào page ngay **sau** HeroSection:
```tsx
<HeroSection onStartStudio={() => setIsStudioOpen(true)} />
<LiveStatsBar />
<WorkflowSection />
```

---

### L3 — FAQSection (accordion)

Tạo `components/landing/<slug>/FAQSection.tsx`:

```tsx
const [openIndex, setOpenIndex] = useState<number | null>(0);

// 5-6 FAQ items — điều chỉnh theo product
const FAQ_ITEMS = [
  { q: 'Ảnh tạo ra có thuộc về tôi không?', a: 'Có — 100%. ...' },
  { q: 'Credits có hết hạn không?', a: 'Credits không bao giờ hết hạn. ...' },
  // ...
];

// Accordion pattern với AnimatePresence height animation
{FAQ_ITEMS.map((item, i) => (
  <div key={i} className="border border-black/[0.06] dark:border-white/[0.05] rounded-xl overflow-hidden">
    <button onClick={() => setOpenIndex(openIndex === i ? null : i)}
      className="w-full flex items-center justify-between gap-4 px-5 py-4 text-left hover:bg-brand-blue/[0.02]">
      <span className="text-[13px] font-semibold">{item.q}</span>
      <motion.div animate={{ rotate: openIndex === i ? 180 : 0 }} transition={{ duration: 0.2 }}>
        <ChevronDown size={16} />
      </motion.div>
    </button>
    <AnimatePresence initial={false}>
      {openIndex === i && (
        <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }}
          exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.22 }} className="overflow-hidden">
          <p className="px-5 pb-4 text-[13px] text-slate-500 dark:text-[#777] leading-relaxed">{item.a}</p>
        </motion.div>
      )}
    </AnimatePresence>
  </div>
))}
```

Wire vào page **trước FinalCTA**:
```tsx
<UseCasesSection />
<FAQSection />
<FinalCTA onStartStudio={() => setIsStudioOpen(true)} />
```

---

### L4 — Sticky mobile CTA bar

Thêm trực tiếp vào page file (`pages/images/YourProductAI.tsx`), **trong `return`**, sau FinalCTA:

```tsx
{/* Sticky mobile CTA */}
<div className="md:hidden fixed bottom-0 left-0 right-0 z-40 px-4 pb-4 pt-2 bg-gradient-to-t from-white dark:from-[#0a0a0c] via-white/95 dark:via-[#0a0a0c]/95 to-transparent">
  <button
    onClick={() => setIsStudioOpen(true)}
    className="w-full py-3.5 rounded-xl bg-gradient-to-r from-brand-blue to-blue-500 text-white text-[12px] font-bold uppercase tracking-widest shadow-lg shadow-brand-blue/30"
  >
    ✨ Tạo Ngay — Miễn phí thử
  </button>
</div>
```

---

### L5 — Inline Hero Demo widget

Thay right column mockup bằng mini-demo interactive widget. User có thể thử generate ngay trên landing page.

> **⚠️ Về credits & endpoint:**
> - Widget gọi `generateDemoImage()` từ `services/gemini` — đây là endpoint **server-side có cost** (Gemini API).
> - Widget **KHÔNG trừ credits của user** — chi phí tính vào server budget demo.
> - **Bắt buộc rate-limit phía server** (VD: max 3 lần/IP/ngày) để tránh lạm dụng.
> - Nếu server chưa có rate-limit → dùng phương án thay thế: **hiển thị ảnh CDN pre-generated từ STEP 3** (rotate qua 3-5 ảnh có sẵn) thay vì call API thật.

```tsx
// Phương án an toàn — rotate pre-generated CDN images (KHÔNG call API):
const DEMO_IMAGES = [
  'https://imagedelivery.net/.../img1/public',  // URLs từ STEP 3
  'https://imagedelivery.net/.../img2/public',
  'https://imagedelivery.net/.../img3/public',
];
const [demoIndex, setDemoIndex] = useState(0);
const runDemo = () => setDemoIndex(i => (i + 1) % DEMO_IMAGES.length);

// --- HOẶC phương án đầy đủ (nếu server ĐÃ có rate-limit): ---
// State trong HeroSection (convert từ () => sang function):
const [demoPrompt, setDemoPrompt] = useState(DEMO_PROMPTS[0]);
const [demoResult, setDemoResult] = useState<string | null>(null);
const [demoLoading, setDemoLoading] = useState(false);

const runDemo = async () => {
  if (demoLoading) return;
  setDemoLoading(true); setDemoResult(null);
  try { const url = await generateDemoImage(demoPrompt); setDemoResult(url ?? null); }
  catch {} finally { setDemoLoading(false); }
};

// Widget UI — app chrome mockup + preview area + prompt input + CTA pair:
<div className="rounded-2xl border border-black/[0.07] dark:border-white/[0.06] bg-white dark:bg-white/[0.02] overflow-hidden shadow-xl">
  {/* macOS-style window chrome */}
  <div className="flex items-center px-4 py-2.5 border-b border-black/[0.05] bg-slate-50/60">
    <div className="flex gap-1.5">
      <div className="w-2.5 h-2.5 rounded-full bg-red-400/80" />
      <div className="w-2.5 h-2.5 rounded-full bg-amber-400/80" />
      <div className="w-2.5 h-2.5 rounded-full bg-emerald-400/80" />
    </div>
    <span className="mx-auto text-[9px] font-bold text-slate-400 uppercase tracking-wider">Demo · Product AI</span>
  </div>
  
  {/* Preview area — loading skeleton or result */}
  <div className="aspect-video bg-slate-100 dark:bg-white/[0.03] relative">
    <AnimatePresence mode="wait">
      {demoLoading ? ( /* skeleton grid */ ) : demoResult ? (
        <motion.img src={demoResult} className="w-full h-full object-cover" ... />
      ) : ( /* placeholder with Sparkles icon */ )}
    </AnimatePresence>
  </div>

  {/* Input + CTA pair */}
  <div className="p-3 space-y-2">
    <input value={demoPrompt} onChange={e => setDemoPrompt(e.target.value)} onKeyDown={e => e.key === 'Enter' && runDemo()} className="..." />
    <div className="flex gap-2">
      <button onClick={runDemo} disabled={demoLoading} className="flex-1 py-2 rounded-lg bg-brand-blue text-white text-[11px] font-bold">
        {demoLoading ? 'Đang tạo...' : '✨ Thử Ngay (miễn phí)'}
      </button>
      <button onClick={onStartStudio} className="px-3 py-2 rounded-lg border border-brand-blue/30 text-brand-blue text-[11px] font-semibold">
        Mở Studio →
      </button>
    </div>
  </div>
</div>
```

Import generateDemoImage:
```tsx
import { generateDemoImage } from '../../../services/gemini';
```

> **💡 L6 — Demo Prompt Cycling (optional enhancement):** Nếu muốn widget không bị static, thêm `DEMO_PROMPTS` array và sau mỗi lần `runDemo()` cycle sang prompt tiếp theo: `setDemoPrompt(DEMO_PROMPTS[(demoIndex + 1) % DEMO_PROMPTS.length])`. Không cần section riêng — 3 dòng code là đủ.

---

### L8 — Low Credit Modal

STEP 6 có `setShowLowCreditAlert(true)` nhưng modal phải được implement đầy đủ — không chỉ là state.

State:
```tsx
const [showLowCreditAlert, setShowLowCreditAlert] = useState(false);
```

Modal UI (thêm vào `<AnimatePresence>` cuối component, tương tự fullscreen lightbox):
```tsx
<AnimatePresence>
  {showLowCreditAlert && (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[700] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4"
      onClick={() => setShowLowCreditAlert(false)}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        transition={{ type: 'spring', stiffness: 350, damping: 25 }}
        onClick={e => e.stopPropagation()}
        className="bg-white dark:bg-[#111113] rounded-2xl shadow-2xl p-6 max-w-sm w-full border border-black/[0.06] dark:border-white/[0.06]"
      >
        {/* Icon */}
        <div className="w-12 h-12 rounded-2xl bg-amber-100 dark:bg-amber-400/10 flex items-center justify-center mx-auto mb-4">
          <span className="text-2xl">⚡</span>
        </div>

        {/* Content */}
        <h3 className="text-[15px] font-bold text-center mb-1">Credits không đủ</h3>
        <p className="text-[12px] text-slate-500 dark:text-[#777] text-center leading-relaxed mb-5">
          Bạn cần <span className="font-semibold text-slate-700 dark:text-white">{CREDIT_COST * quantity} CR</span> để tạo.
          Hiện có <span className="font-semibold text-amber-500">{credits} CR</span>.
        </p>

        {/* Actions */}
        <div className="flex flex-col gap-2">
          <Link
            to="/credits"
            onClick={() => setShowLowCreditAlert(false)}
            className="w-full py-3 rounded-xl bg-gradient-to-r from-brand-blue to-blue-500 text-white text-[12px] font-bold text-center shadow-md shadow-brand-blue/20 hover:shadow-lg hover:shadow-brand-blue/30 transition-shadow"
          >
            ⚡ Nạp Credits ngay
          </Link>
          <button
            onClick={() => setShowLowCreditAlert(false)}
            className="w-full py-2.5 rounded-xl border border-black/[0.07] dark:border-white/[0.07] text-[11px] text-slate-500 dark:text-[#666] hover:bg-black/[0.02] dark:hover:bg-white/[0.02] transition-colors"
          >
            Đóng
          </button>
        </div>
      </motion.div>
    </motion.div>
  )}
</AnimatePresence>
```

Import cần thêm: `Link` từ `react-router-dom`, `credits` từ `useAuth()`.

> **Quy tắc hiển thị:** Modal chỉ trigger từ credit check trong `handleGenerate()`. **Không** tự dismiss sau timeout — user phải chủ động đóng hoặc click ra ngoài.

---

## Cập nhật ❌ Common Mistakes

| Sai | Đúng |
|-----|------|
| Credits trừ trước khi API call | Trừ credits **sau** khi API trả thành công (W4) |
| Result image không có action nào | Download + Fullscreen overlay khi hover (W5) |
| handleEnhance auto-replace prompt | Show diff card (before/after) → user confirm áp dụng (S2) |
| Empty viewport khi đang generate | Skeleton 2×2 shimmer grid (W2) |
| Không có keyboard shortcut | ⌘+Enter trigger generate (W1) |
| Sidebar chiếm màn hình mobile | `hidden md:flex` + bottom sheet với spring animation (S1) |
| Landing không có social proof | LiveStatsBar ngay sau Hero + CountUp numbers (L2) |
| Landing không trả lời FAQ | FAQSection accordion trước FinalCTA (L3) |
| Mobile user khó trigger CTA | Sticky bottom bar `md:hidden` fixed (L4) |
| Hero mockup static không interactive | InlineDemoWidget — rotate CDN images hoặc call API nếu đã có rate-limit (L5) |
| CTA không có trust signal | Trust micro-copy 3 items: no CC + ownership + free credits (L1) |
| Không có cancel khi đang generate | AbortController + Hủy button hiện khi isGenerating (W3) |
| Prompt history mất sau reload | Save lên localStorage `STORAGE_KEY + '_prompts'` (W7) |
| No starter prompts when empty | 4 starter prompt cards 2×2 grid khi không có ảnh (W6) |
| Workspace chỉ có 1 view (Current) | Luôn có tab "Phiên hiện tại" + "Thư viện (N)" toggle (W8) |
| Library tab rỗng sau generate | Save session vào localStorage sau mỗi lần generate thành công (W9) |
| Status message không có visual cue | Status dot đổi màu theo trạng thái: amber=processing, green=done, red=error (W11) |
| Low Credit modal chỉ là 1 dòng code | Modal đầy đủ: thông báo + nút Nạp Credits + nút Đóng (L8) |
| Product tạo ảnh/video hardcode CREDIT_COST | Dùng dynamic `currentUnitCost` từ pricing matrix model (STEP 6.5) |
| Workspace tạo ảnh/video tự build model list | Copy engine/family/model combo từ AIImageGeneratorWorkspace hoặc AIVideoGeneratorWorkspace (STEP 6.5) |
| Không có duration selector cho video workspace | Detect `isModeBased` — nếu false thì hiện duration cycle button (STEP 6.5B) |

---

