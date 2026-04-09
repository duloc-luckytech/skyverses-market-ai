---
description: Add a new AI product to Skyverses marketplace — full flow from seed to landing page
---

# Add New Product to Skyverses Marketplace

// turbo-all

This workflow documents the **complete, correct flow** to add a new AI product tool to the marketplace.  
Follow every step in order. Do NOT skip architectural rule checks.

---

## STEP 0 — Read skills first

Before starting, read these skills:
- `.agents/skills/skyverses_architecture/SKILL.md`
- `.agents/skills/skyverses_ui_pages/SKILL.md`

---

## STEP 1 — Define product metadata

Determine:
- **slug**: e.g. `social-banner-ai`
- **id** (SCREAMING_SNAKE): e.g. `SOCIAL-BANNER-AI`
- **category** (4 langs: en/vi/ko/ja)
- **name** (4 langs)
- **description** (4 langs)
- **features** array (4 langs each)
- **priceCredits**: number
- **complexity**: `Standard` | `Advanced` | `Enterprise`
- **homeBlocks**: which homepage blocks to appear in (e.g. `['top_trending', 'marketing_tools']`)
- **tags**: array of strings

---

## STEP 2 — Create seed script

Create `seed-<slug>.mjs` in project root following the **exact pattern** of `seed-products.mjs`.

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
  priceReference: '120 CR / banner',
  isActive: true,
  isFree: false,
  priceCredits: 120,
  featured: true,
  homeBlocks: ['top_trending'],
};
async function seed() {
  const res = await fetch(API, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${TOKEN}` },
    body: JSON.stringify(product)
  });
  const data = await res.json();
  console.log(data.success ? `✅ ${product.slug}: _id=${data.data?._id}` : `❌ ${data.message}`);
}
seed();
```

Run the seed:
```bash
node seed-<slug>.mjs
```
Note the returned `_id`.

---

## STEP 3 — Generate & update product banner image

### 3a. Add prompt to `update-product-images.mjs` promptMap:
```js
// In buildPrompt() → promptMap:
'YOUR-ID': `A premium AI studio scene for <your product>. Dark tech aesthetic, cinematic 4K.`,
```

### 3b. Create `gen-<slug>-image.mjs` following pattern of `gen-social-banner-image.mjs`:
- Copy the script
- Update `BANNER_PROMPT` with a cinematic, premium AI studio description for the product
- Update `SKV_API_TOKEN` (get new token from admin if needed)

The token system:
- `SKV_API_TOKEN`: starts with `skv_` — stored on user model field `apiToken`
  - If expired (401), ask user for new token OR call `POST /api-client/generate-token` with admin token
- `ADMIN_TOKEN`: JWT from `POST /auth/admin/login` with `{ username, password }`

Run:
```bash
node gen-<slug>-image.mjs
```

Pipeline: Skyverses AI → Cloudflare CDN → PUT `/market/:id` update `imageUrl`

---

## STEP 3.5 — Generate landing page content with Claude AI (TRƯỚC KHI CODE)

> **Luôn chạy bước này trước** khi viết HeroSection, WorkflowSection, FeaturesSection.  
> Claude Sonnet sẽ đề xuất nội dung phù hợp với business của từng product cụ thể.

```bash
node gen-landing-content.mjs \
  --slug "your-slug" \
  --name "Your Product Name" \
  --desc "Mô tả ngắn về product, chức năng chính" \
  --category "Category (VD: Social Media Tools, AI Image, E-commerce...)"
```

Output: file `landing-content-<slug>.json` gồm:
- `hero.badge` — badge text nhỏ trên heading
- `hero.headline` — mảng dòng heading
- `hero.tagline` — tagline mô tả
- `hero.specs` — 4 spec cards
- `hero.heroVisualIdea` — **ý tưởng visual cho right column của hero** (đây là phần quan trọng nhất — mỗi product phải khác nhau)
- `workflow.steps` — 4 bước sử dụng
- `features.items` — 6-8 tính năng
- `finalCta` — CTA section
- `seo` — title, description, keywords

**Sau khi có JSON → đọc `heroVisualIdea` và implement hero visual phù hợp.**

> API: `https://ezaiapi.com/v1/messages` · Model: `claude-sonnet-4-5`  
> Key lưu trong `gen-landing-content.mjs` → cập nhật nếu 401.


### Structure (MANDATORY — follow `AIImageGenerator.tsx` pattern exactly):

```
components/landing/<product-name>/
  HeroSection.tsx
  WorkflowSection.tsx
  FeaturesSection.tsx     (or UseCasesSection.tsx)
  FinalCTA.tsx
```

#### Rules:
1. **HeroSection** — **VISUAL PHẢI PHÙ HỢP VỚI PRODUCT, KHÔNG COPY NGUYÊN XI**:

   > The `image-generator/HeroSection.tsx` dùng Explorer API image grid vì product đó liên quan đến tạo hình.  
   > **Mỗi product cần hero visual riêng phản ánh đúng business của nó.**

   | Product | Hero visual phù hợp |
   |---------|---------------------|
   | AI Image Generator | Scrolling Explorer image grid |
   | Social Banner AI | Platform mockup grid (X cover, FB post, IG story, LI banner) |
   | Background Removal | Before/after split-screen image |
   | Fashion AI | Model + outfit showcase grid |
   | Video Generator | Video thumbnail reel |
   | Poster Marketing | Marketing poster showcase |

   **Tham khảo từ `image-generator/HeroSection.tsx`:**
   - ✅ Layout: `grid grid-cols-1 lg:grid-cols-12`
   - ✅ Left col: badge → h1 → description → specs grid → CTA button
   - ✅ Right col: product-relevant visual (custom per product)
   - ✅ BG glows: `brand-blue/[0.04]` + `purple/[0.03]`
   - ✅ Back link to `/market`
   - ✅ `motion.div` entry animation
   - ❌ KHÔNG dùng `getExplorerUrl` unless product là image/video explorer

   **Specs grid (bottom-left)** — 4 cards showing key product metrics:
   ```tsx
   <div className="grid grid-cols-2 gap-2">
     {SPECS.map(s => (
       <div className="p-3 bg-black/[0.02] dark:bg-white/[0.02] border border-black/[0.06] dark:border-white/[0.04] rounded-xl flex items-start gap-2.5 ...">
   ```

2. **WorkflowSection** — 4 steps, exact same card style as `image-generator/WorkflowSection.tsx`:
   ```tsx
   className="p-5 rounded-xl border border-black/[0.06] dark:border-white/[0.04] bg-black/[0.01] dark:bg-white/[0.015]"
   ```

3. **FeaturesSection** — grid of feature cards, same style as `image-generator/UseCasesSection.tsx`

4. **FinalCTA** — minimal, same as `image-generator/FinalCTA.tsx`:
   ```tsx
   className="px-6 lg:px-16 py-20 border-t border-black/[0.06] dark:border-white/[0.04]"
   ```

> Key stored in script — update nếu 401 (lấy từ dashboard ezaiapi.com).

---

## STEP 4 — Create landing page sections

`pages/images/YourProductAI.tsx` — **thin orchestrator only**, no JSX logic:

```tsx
import React, { useState } from 'react';
import YourWorkspace from '../../components/YourWorkspace';
import { HeroSection } from '../../components/landing/your-product/HeroSection';
import { WorkflowSection } from '../../components/landing/your-product/WorkflowSection';
import { FeaturesSection } from '../../components/landing/your-product/FeaturesSection';
import { FinalCTA } from '../../components/landing/your-product/FinalCTA';
import { usePageMeta } from '../../hooks/usePageMeta';

const YourProductAI = () => {
  usePageMeta({ title: '...', description: '...', keywords: '...', canonical: '/product/your-slug' });
  const [isStudioOpen, setIsStudioOpen] = useState(false);

  if (isStudioOpen) {
    return (
      <div className="fixed inset-0 z-[500] bg-white dark:bg-[#0a0a0c] animate-in fade-in duration-500">
        <YourWorkspace onClose={() => setIsStudioOpen(false)} />
      </div>
    );
  }

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

## STEP 6 — Create the Workspace component

Reference: `components/PosterStudioWorkspace.tsx` (782 lines — THE canonical workspace)

### Mandatory workspace structure:

```
1. TOP NAV bar (h-14)
   - Left: "Phiên hiện tại" / "Thư viện (N)" tabs
   - Right: Credits badge + X close button

2. SIDEBAR (w-[380px], left)
   - Product-specific picker (Category / Platform / Format / etc.)
   - Prompt textarea + AI Boost button
   - Optional title/subtitle inputs
   - Reference image upload (grid 3-col, max 6 images)
   - AI Config grid: MODEL | STYLE | MODE | RESOLUTION | QUANTITY
   - Advanced section (collapsible): Brand name, Brand colors, text overlay toggle

3. VIEWPORT (flex-grow, right)
   - Generate button bar (top) with status indicator + credit cost
   - Result area: shows aspect-ratio locked preview when done
   - Library grid when viewMode === 'library'
```

### State pattern (copy from PosterStudioWorkspace):
```tsx
const [isGenerating, setIsGenerating] = useState(false);
const [isEnhancing, setIsEnhancing] = useState(false);
const [showAdvanced, setShowAdvanced] = useState(false);
const [viewMode, setViewMode] = useState<'current' | 'library'>('current');
const [showLowCreditAlert, setShowLowCreditAlert] = useState(false);
const [sessions, setSessions] = useState<Session[]>([]);
```

### Credit check pattern:
```tsx
const CREDIT_COST = 120; // per generation
const totalCost = CREDIT_COST * quantity;
if (credits < totalCost) { setShowLowCreditAlert(true); return; }
const successful = useCredits(totalCost);
if (!successful) throw new Error('Insufficient credits');
```

### localStorage key: `skyverses_<product_id>_vault`

---

## STEP 7 — Wire routing

### `App.tsx`:
```tsx
// 1. Add to pageImports object:
yourProduct: () => import('./pages/images/YourProductAI'),

// 2. Add lazy component:
const YourProductAI = React.lazy(pageImports.yourProduct);

// 3. Add route (inside Suspense):
<Route path="/product/your-slug" element={<YourProductAI />} />
```

### `components/market/ProductToolModal.tsx` (WORKSPACE_MAP):
```tsx
'your-slug': React.lazy(() => import('../YourWorkspace') as Promise<{ default: React.ComponentType<WorkspaceProps> }>),
```

---

## STEP 8 — TypeScript check

```bash
npx tsc --noEmit 2>&1 | head -40
```

Must exit with code 0 (no errors) before considering the task complete.

---

## STEP 9 — Git push

```bash
# Run /push workflow or:
git add -A && git commit -m "feat: add <product-name> product — landing + workspace + seed + banner" && git push origin main
```

---

## Common Mistakes to Avoid

| ❌ Wrong | ✅ Correct |
|---|---|
| Landing page as single monolithic file | Thin orchestrator + separate section components in `components/landing/<name>/` |
| Inventing new color accents | Use `brand-blue` consistently |
| Hardcoding Unsplash images in hero | Fetch live from Explorer API via `getExplorerUrl()` |
| One big JSX workspace from scratch | Copy `PosterStudioWorkspace.tsx` structure, only change the picker section |
| Missing Low Credit modal | Always implement `showLowCreditAlert` state + modal |
| Missing ProductToolModal entry | Always add to WORKSPACE_MAP so quick-view modal works |
| Token `skv_` expired (401 error) | Ask user for new token or call `POST /api-client/generate-token` |
