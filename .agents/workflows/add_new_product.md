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

## STEP 4 — Create landing page sections

### Structure (MANDATORY — follow `AIImageGenerator.tsx` pattern exactly):

```
components/landing/<product-name>/
  HeroSection.tsx
  WorkflowSection.tsx
  FeaturesSection.tsx     (or UseCasesSection.tsx)
  FinalCTA.tsx
```

#### Rules:
1. **HeroSection** must:
   - Import `getExplorerUrl` from `../../../apis/config` and fetch real images from Explorer API
   - Show scrolling image masonry grid (same as `image-generator/HeroSection.tsx`)
   - Show product spec pills/badges (platform, format counts, key specs)
   - CTA button calls `onStartStudio()`
   - Back arrow link to `/market`

2. **WorkflowSection** — 4 steps, exact same card style as `image-generator/WorkflowSection.tsx`:
   ```tsx
   className="p-5 rounded-xl border border-black/[0.06] dark:border-white/[0.04] bg-black/[0.01] dark:bg-white/[0.015]"
   ```

3. **FeaturesSection** — grid of feature cards, same style as `image-generator/UseCasesSection.tsx`

4. **FinalCTA** — minimal, same as `image-generator/FinalCTA.tsx`:
   ```tsx
   className="px-6 lg:px-16 py-20 border-t border-black/[0.06] dark:border-white/[0.04]"
   ```

#### Color accent rule:
- DO NOT invent new colors. Use `text-brand-blue` / `bg-brand-blue` / `border-brand-blue` consistently.
- Reference pages like `BackgroundRemovalAI.tsx` use their own accent (rose) — Social Banner AI uses `brand-blue`.

---

## STEP 5 — Create the landing page file

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
