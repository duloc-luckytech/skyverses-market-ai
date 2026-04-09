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
import { FadeInUp, StaggerChildren, GradientMesh, HoverCard, SectionLabel } from '../_shared/SectionAnimations';
import { ImageMasonryGrid, BeforeAfterSlider, VideoReelGrid, FloatingBadge, AIBadge, ShowcaseImageStrip } from '../_shared/ProHeroVisuals';
```

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

**Right column** — dùng ProHeroVisuals component theo STEP 3.5:
```tsx
// Wrap với FloatingBadge overlays:
<div className="lg:col-span-7 relative">
  <[VisualComponent] />              // từ ProHeroVisuals.tsx
  <FloatingBadge                     // top-right: AI Generated
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
    {/* Nếu API hỗ trợ filter by tag: truyền tag={productSlug} */}
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
  { title: '...', desc: '...', icon: ..., featured: true },
  { title: '...', desc: '...', icon: ..., featured: false },
  // ...
];

<StaggerChildren className="grid grid-cols-2 md:grid-cols-4 gap-4 auto-rows-fr">
  {features.map(f => (
    <HoverCard
      key={f.title}
      className={`p-5 ${f.featured ? 'col-span-2' : 'col-span-1'} bg-black/[0.01] dark:bg-white/[0.015]`}
    >
      <motion.div whileHover={{ rotate: [0, -5, 5, 0] }} transition={{ duration: 0.4 }}>
        <f.icon size={22} className="text-brand-blue mb-3" />
      </motion.div>
      <h3 className="text-sm font-semibold mb-1">{f.title}</h3>
      <p className="text-[12px] text-slate-500">{f.desc}</p>
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
  usePageMeta({ title: '...', description: '...', keywords: '...', canonical: '/product/slug' });
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

> **Reference:** `components/PosterStudioWorkspace.tsx` — đây là canonical workspace.
> Copy structure, chỉ thay:
> 1. Phần picker (Category → Platform/Format/etc.) phù hợp với product
> 2. Thêm **Industry Picker** phía trên AISuggestPanel
> 3. Thêm `AISuggestPanel` phía trên prompt textarea
> 4. Define product-specific STYLES và FEATURED_TEMPLATES

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

// State:
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
// Industry label để Gemini hiểu context khi suggest
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
// Prepend industry context vào finalPrompt
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

### Layout cố định (giống PosterStudioWorkspace):
```
TOP NAV (h-14)
├── Left: [Phiên hiện tại] [Thư viện (N)]
└── Right: [Credits badge] [X close]

SIDEBAR (w-[380px]) ── flex-grow VIEWPORT
│ Product-specific picker          │ Generate button bar (top)
│ ─── INDUSTRY PICKER ───          │   status dot · CR cost · button
│ 8-12 industry chip buttons       │
│ ─── AI SUGGEST PANEL ───         │ Current: aspect-ratio result
│ Prompt textarea                  │   + download/fullscreen overlay
│ AI Boost button                  │
│ Title / Subtitle (optional)      │ Library: grid of past sessions
│ Reference images (3-col, max 6)  │
│ ─────────────────────────────    │
│ MODEL  │ STYLE                   │
│ MODE   │ RESOLUTION              │
│ ─ QUANTITY · N CR ─              │
│ ─ Advanced (collapsible) ─       │
```

### Credit check (bắt buộc):
```tsx
const CREDIT_COST = 120;
if (credits < CREDIT_COST * quantity) { setShowLowCreditAlert(true); return; }
```

### localStorage: `skyverses_<PRODUCT-ID>_vault`

---

## STEP 7 — Wire routing

```tsx
// App.tsx — 3 chỗ:
yourProduct: () => import('./pages/images/YourProductAI'), // pageImports
const YourProductAI = React.lazy(pageImports.yourProduct); // lazy
<Route path="/product/your-slug" element={<YourProductAI />} /> // route

// components/market/ProductToolModal.tsx — WORKSPACE_MAP:
'your-slug': React.lazy(() => import('../YourWorkspace') as Promise<{default: React.ComponentType<WorkspaceProps>}>),
```

---

## STEP 8 — TypeScript check

```bash
npx tsc --noEmit 2>&1 | head -40
# Must exit 0
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
| Copy Explorer image grid cho mọi product | Dùng ProHeroVisuals template đúng loại |
| Tự ý dùng màu accent mới | Dùng `brand-blue` nhất quán |
| Workspace viết từ đầu | Copy structure `PosterStudioWorkspace.tsx` |
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

---

## Shared Components Reference

```
components/landing/_shared/
  SectionAnimations.tsx     → FadeInUp, StaggerChildren, ParallaxSection, 
                               CountUp, GradientMesh, SectionLabel, 
                               HoverCard, TimelineConnector
  ProHeroVisuals.tsx        → ImageMasonryGrid, BeforeAfterSlider, 
                               VideoReelGrid, ShowcaseImageStrip,
                               FloatingBadge, AIBadge

components/workspace/
  AISuggestPanel.tsx        → Tab: Prompt Ideas | Style Presets | Templates | Smart Fill
                               Props: productSlug, productName, styles[], 
                                      onPromptSelect, onApply, historyKey,
                                      productContext (truyền activeIndustry), featuredTemplates

components/PosterStudioWorkspace.tsx
                            → Canonical workspace reference
                               Pattern: ALL_CATEGORIES → dùng để thiết kế INDUSTRIES (thu gọn 8-12 items)
```

## Landing Page Section Order (chuẩn)

```
HeroSection          ← ProHeroVisuals + GradientMesh
WorkflowSection      ← 4 bước + StaggerChildren
ShowcaseSection      ← ShowcaseImageStrip (productSlug prop)
FeaturesSection      ← Bento-grid
UseCasesSection      ← 4-6 industry use cases  ← NEW
FinalCTA             ← Animated button
```
