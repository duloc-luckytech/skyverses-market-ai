---
description: Add a new AI product to Skyverses marketplace — full flow from seed to PRO landing page + smart workspace
---

# Add New Product to Skyverses Marketplace

// turbo-all

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

## STEP 3.5 — Plan PRO landing page (Claude Code tự phân tích)

> **Không dùng script external.** Claude Code tự plan content phù hợp business của product.

### A. Phân tích product → chọn Hero Visual Type:

| Visual Type | Dùng khi | Component |
|-------------|----------|-----------|
| `ImageMasonryGrid` | Product tạo/chỉnh ảnh | `<ImageMasonryGrid type="image" />` |
| `VideoReelGrid` | Product tạo/xử lý video | `<VideoReelGrid fetchFromExplorer />` |
| `BeforeAfterSlider` | Product transform ảnh (xóa nền, restore, upscale) | `<BeforeAfterSlider beforeSrc afterSrc />` |
| `PlatformMockupGrid` | Product tạo banner/content cho mạng xã hội | custom platform grid |
| `Custom` | Nếu không có template phù hợp | Tự code right column |

### B. Phân tích product → trả lời 5 câu hỏi:

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

5. SHOWCASE SECTION:
   Explorer API type: 'image' | 'video'
   Caption theme: mô tả ngắn để hiển thị trên ảnh showcase

6. SEO:
   Title tag + meta description phù hợp tìm kiếm tiếng Việt

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
    → Dùng cho `UseCasesSection.tsx` (section mới — thêm sau FeaturesSection)
    → Cũng dùng để define INDUSTRIES trong STEP 6 Workspace

11. SHOWCASE FILTER:
    Explorer API type: 'image' | 'video'
    productSlug để filter showcase (nếu API hỗ trợ tag filter)
    Caption theme: mô tả ngắn để hiển thị trên ảnh showcase

12. SECTION IMAGE PLAN (MỚI):
    Mỗi section nên có ít nhất 1 hình ảnh minh hoạ từ CDN hoặc Explorer API.
    Trả lời từng section:
    → HeroSection: dùng Visual Type nào? (từ câu 1) → import component tương ứng từ ProHeroVisuals
    → WorkflowSection: có CDN URL để thêm result thumbnail vào step cuối không? (optional)
    → FeaturesSection: featured cards nào nên có thumbUrl? Map CDN URL cho mỗi featured feature.
    → ShowcaseSection: type="image" hay type="video"?
    → Xem hướng dẫn chi tiết tại "Section Image Guidelines" (STEP 3.6) bên dưới.
```

---

## STEP 3.6 — Section Image Guidelines (MỚI)

> Mỗi section landing page cần có hình ảnh để tăng visual weight và trust.
> Dùng CDN URLs từ STEP 3, hoặc fetch từ Explorer API, hoặc Unsplash fallback.

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

Tạo **6 file riêng** trong `components/landing/<slug>/`:

```
HeroSection.tsx          ← ProHeroVisuals + GradientMesh + scroll animations
WorkflowSection.tsx      ← StaggerChildren + timeline connector
ShowcaseSection.tsx      ← ShowcaseImageStrip từ Explorer (nhận productSlug prop)
FeaturesSection.tsx      ← Bento-grid + StaggerChildren + hover expand
UseCasesSection.tsx      ← NEW: 4-6 use case cards theo ngành (sau FeaturesSection)
FinalCTA.tsx             ← Animated CTA
```

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
import { WorkflowSection } from '../../components/landing/your-slug/WorkflowSection';
import { ShowcaseSection } from '../../components/landing/your-slug/ShowcaseSection';
import { FeaturesSection } from '../../components/landing/your-slug/FeaturesSection';
import { UseCasesSection } from '../../components/landing/your-slug/UseCasesSection';
import { FinalCTA } from '../../components/landing/your-slug/FinalCTA';
import { usePageMeta } from '../../hooks/usePageMeta';

const YourProductAI = () => {
  usePageMeta({
    title: '...',
    description: '...',
    keywords: '...',
    canonical: '/product/slug',
    // jsonLd tuỳ chọn — thêm nếu product có image/video output để boost SEO:
    // jsonLd: { '@type': 'SoftwareApplication', name: '...', applicationCategory: 'MultimediaApplication' }
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
      <WorkflowSection />
      <ShowcaseSection productSlug="your-slug" />  {/* ← pass productSlug */}
      <FeaturesSection />
      <UseCasesSection />                           {/* ← NEW */}
      <FinalCTA onStartStudio={() => setIsStudioOpen(true)} />
    </div>
  );
};
export default YourProductAI;
```

---

## STEP 6 — Create Workspace component (với AISuggestPanel + Industry Picker)

> **Reference:** `components/SocialBannerWorkspace.tsx` — đây là canonical workspace MỚI NHẤT.
> (PosterStudioWorkspace là reference cũ — chưa có AISuggestPanel)
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
// Pattern: skyverses_<PRODUCT-SLUG>_vault  (dùng slug, không phải SCREAMING_SNAKE id)
const STORAGE_KEY = 'skyverses_social-banner-ai_vault';
// ❌ Sai: 'skyverses_SOCIAL-BANNER-AI_vault'
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

### Credit check (bắt buộc):
```tsx
const CREDIT_COST = 120;
if (credits < CREDIT_COST * quantity) { setShowLowCreditAlert(true); return; }
```

### localStorage: `skyverses_<product-slug>_vault`

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

---

## STEP 8 — TypeScript check

```bash
npx tsc --noEmit 2>&1 | head -40
# Must exit 0 (no output)
```

---

## STEP 9 — Git push

```bash
git add -A && git commit -m "feat: add <product-name> — PRO landing + smart workspace + seed + banner" && git push origin main
```

---

## ❌ Common Mistakes (updated)

| Sai | Đúng |
|-----|------|
| Landing page 1 file monolithic | Thin orchestrator + 6 section files riêng |
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
| Industry picker copy 40+ items | Chỉ 8-12 industries phù hợp nhất với product |
| Không truyền industry vào AISuggestPanel | `productContext` phải include `activeIndustryLabel` |
| Industry picker không ảnh hưởng prompt | Prepend `[Lĩnh vực: ...]` vào `finalPrompt` khi generate |
| Import `ShowcaseImageStrip` từ SectionAnimations | Import từ `ProHeroVisuals` |
| Import `FloatingBadge` từ SectionAnimations | Import từ `ProHeroVisuals` |
| Sections không có ảnh minh hoạ | Featured cards trong FeaturesSection nên có `thumbUrl` từ CDN STEP 3 |
| Định nghĩa Wand2 inline SVG trong Workspace | Import `Wand2` từ `lucide-react` |
| STORAGE_KEY dùng SCREAMING_SNAKE id | Dùng slug: `skyverses_<slug>_vault` |

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

```
HeroSection          ← ProHeroVisuals + GradientMesh (xem STEP 3.6 chọn visual type)
WorkflowSection      ← 4 bước + StaggerChildren + icons only
ShowcaseSection      ← ShowcaseImageStrip (import từ ProHeroVisuals)
FeaturesSection      ← Bento-grid (featured cards có thể kèm thumbUrl từ CDN)
UseCasesSection      ← 4-6 industry use cases + icons
FinalCTA             ← Animated button + GradientMesh
```

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

### W6 — Empty state starter prompts (W6)

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

Thay right column mockup bằng mini-demo interactive widget. User có thể thử generate ngay trên landing page (không cần credits).

```tsx
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
      <button onClick={onOpenStudio} className="px-3 py-2 rounded-lg border border-brand-blue/30 text-brand-blue text-[11px] font-semibold">
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

---

## Cập nhật ❌ Common Mistakes

| Sai | Đúng |
|-----|------|
| Credits trừ trước khi API call | Trừ credits **sau** khi API trả thành công (W4) |
| handleEnhance auto-replace prompt | Show diff card (before/after) → user confirm áp dụng (S2) |
| Empty viewport khi đang generate | Skeleton 2×2 shimmer grid (W2) |
| Không có keyboard shortcut | ⌘+Enter trigger generate (W1) |
| Sidebar chiếm màn hình mobile | `hidden md:flex` + bottom sheet với spring animation (S1) |
| Landing không có social proof | LiveStatsBar ngay sau Hero + CountUp numbers (L2) |
| Landing không trả lời FAQ | FAQSection accordion trước FinalCTA (L3) |
| Mobile user khó trigger CTA | Sticky bottom bar `md:hidden` fixed (L4) |
| Hero mockup static không interactive | InlineDemoWidget — user thử generate trực tiếp (L5) |
| CTA không có trust signal | Trust micro-copy 3 items: no CC + ownership + free credits (L1) |
| Không có cancel khi đang generate | AbortController + Hủy button hiện khi isGenerating (W3) |
| Prompt history mất sau reload | Save lên localStorage `STORAGE_KEY + '_prompts'` (W7) |
| No starter prompts when empty | 4 starter prompt cards 2×2 grid khi không có ảnh (W6) |

