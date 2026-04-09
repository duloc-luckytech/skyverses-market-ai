---
description: Add a new AI product to Skyverses marketplace — full flow from seed to landing page
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

## STEP 3 — Generate & update banner image

Tạo `gen-<slug>-image.mjs` theo pattern `gen-social-banner-image.mjs`:
- Copy script
- Update `BANNER_PROMPT` — cinematic premium AI studio description
- Update `SKV_API_TOKEN` (lấy từ CMS Admin > API Clients nếu 401)

```bash
node gen-<slug>-image.mjs
# Pipeline: Skyverses AI → Cloudflare CDN → PUT /market/:id
```

> ⚠️ `SKV_API_TOKEN` expired → hỏi user lấy token mới từ CMS Admin Tab "API Clients"

---

## STEP 3.5 — Plan landing page content (Claude Code tự làm)

> **Không dùng script external.** Claude Code tự plan content phù hợp business của product.

Trước khi code, Claude phải tự trả lời các câu hỏi sau về product:

```
1. HERO VISUAL IDEA:
   Product này demo được gì tốt nhất? → Đó là visual right column.
   Examples:
   - Social Banner AI → Platform mockup grid (X cover, FB post, IG story)
   - Background Removal → Before/after split-screen
   - Real Estate AI → Empty room vs AI-staged room 2x2 grid
   - Video Generator → Video thumbnail reel với play button
   - Poster Marketing → Marketing poster showcase grid

2. KEY SPECS (4 items):
   Số liệu / tính năng nổi bật nhất của product là gì?
   VD: "14+ Formats", "4 Platforms", "4K Export", "AI Prompt Boost"

3. WORKFLOW STEPS (4 bước):
   User dùng product theo flow nào? Liệt kê 4 bước tự nhiên.

4. FEATURES (6-8 items):
   Điểm khác biệt cụ thể so với tool thủy thủ khác?

5. SEO:
   Title tag + meta description phù hợp tìm kiếm tiếng Việt
```

---

## STEP 4 — Build landing sections

Tạo **4 file riêng** trong `components/landing/<slug>/`:

```
HeroSection.tsx      ← visual RIGHT column custom theo business
WorkflowSection.tsx  ← 4 bước sử dụng
FeaturesSection.tsx  ← 6-8 tính năng
FinalCTA.tsx         ← CTA đơn giản
```

### HeroSection rules (QUAN TRỌNG):

**Left column** — theo đúng pattern `image-generator/HeroSection.tsx`:
```tsx
// Structure cố định:
<Link to="/market">← Trở lại</Link>
<badge>  // inline-flex, brand-blue/[0.08] bg, brand-blue text
<h1> dòng 1 <br/><span brand-blue>Highlight</span> </h1>
<p> tagline </p>
<div grid-cols-2> // 4 spec cards
<button> CTA </button>
```

**Right column** — CUSTOM theo từng product, KHÔNG copy Explorer grid:

| Product | Hero visual |
|---------|------------|
| AI Image Generator | Scrolling Explorer image grid (có API `getExplorerUrl`) |
| Social Banner AI | Platform mockup grid (X/FB/IG/LI, đúng aspect ratio) |
| Background Removal | Before/after split-screen với divider |
| Real Estate AI | 2x2 grid: trống vs staged, day vs dusk |
| Video Generator | Video thumbnail reel với play button overlay |
| Poster Marketing | Grid poster showcase nhiều orientation |
| Fashion AI | Model outfit grid before/after |

**CSS cố định cho hero section:**
```tsx
// BG glows
<div className="absolute top-[-200px] right-[-200px] w-[800px] h-[800px] bg-brand-blue/[0.04] rounded-full blur-[200px]" />
<div className="absolute bottom-[-200px] left-[-200px] w-[600px] h-[600px] bg-purple-600/[0.03] rounded-full blur-[180px]" />

// Grid container
<div className="max-w-[1400px] mx-auto grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center">
  <div className="lg:col-span-5 ...">  // Left copy
  <div className="lg:col-span-7 ...">  // Right visual
```

### WorkflowSection, FeaturesSection, FinalCTA:

Follow **exact same card styles** as `image-generator/` equivalents:
```tsx
// WorkflowSection step card:
className="p-5 rounded-xl border border-black/[0.06] dark:border-white/[0.04] bg-black/[0.01] dark:bg-white/[0.015]"

// FeaturesSection feature card:  
className="p-5 rounded-xl border border-black/[0.06] dark:border-white/[0.04] bg-black/[0.01] dark:bg-white/[0.015]"

// Section label:
className="text-[10px] font-semibold uppercase tracking-widest text-brand-blue/60 mb-2"
```

---

## STEP 5 — Create landing page file (thin orchestrator)

```tsx
// pages/images/YourProductAI.tsx
import React, { useState } from 'react';
import YourWorkspace from '../../components/YourWorkspace';
import { HeroSection } from '../../components/landing/your-slug/HeroSection';
import { WorkflowSection } from '../../components/landing/your-slug/WorkflowSection';
import { FeaturesSection } from '../../components/landing/your-slug/FeaturesSection';
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
      <FeaturesSection />
      <FinalCTA onStartStudio={() => setIsStudioOpen(true)} />
    </div>
  );
};
export default YourProductAI;
```

---

## STEP 6 — Create Workspace component

> **Reference:** `components/PosterStudioWorkspace.tsx` — đây là canonical workspace.  
> Copy structure, chỉ thay phần picker (Category → Platform/Format/etc.)

### Layout cố định:
```
TOP NAV (h-14)
├── Left: [Phiên hiện tại] [Thư viện (N)]
└── Right: [Credits badge] [X close]

SIDEBAR (w-[380px]) ── flex-grow VIEWPORT
│ Product-specific picker          │ Generate button bar (top)
│ Prompt + AI Boost button         │   status dot · CR cost · button
│ Title / Subtitle (optional)      │
│ Reference images (3-col, max 6)  │ Current: aspect-ratio result
│ ─────────────────────────────    │   + download/fullscreen overlay
│ MODEL  │ STYLE                   │
│ MODE   │ RESOLUTION              │ Library: grid of past sessions
│ ─ QUANTITY · N CR ─              │
│ ─ Advanced (collapsible) ─       │
│   Brand name                     │
│   Brand colors picker            │
│   Text overlay toggle            │
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
git add -A && git commit -m "feat: add <product-name> — landing + workspace + seed + banner" && git push origin main
```

---

## ❌ Common Mistakes

| Sai | Đúng |
|-----|------|
| Landing page 1 file monolithic | Thin orchestrator + 4 section files riêng |
| Copy Explorer image grid cho mọi product | Custom visual phù hợp business của product |
| Tự ý dùng màu accent mới | Dùng `brand-blue` nhất quán |
| Workspace viết từ đầu | Copy structure `PosterStudioWorkspace.tsx` |
| Thiếu Low Credit modal | Luôn có `showLowCreditAlert` |
| Không add vào ProductToolModal | Luôn add vào `WORKSPACE_MAP` |
| Token `skv_` 401 | Hỏi user lấy token mới từ CMS Admin > API Clients |
