# Skyverses Market AI — Image CDN Quick Start Guide

**Last Updated:** April 11, 2026  
**Status:** ✅ Production Ready

---

## 🎯 What You Need to Know in 30 Seconds

| Question | Answer |
|----------|--------|
| **Where are showcase images stored?** | Cloudflare Images CDN (`imagedelivery.net`) |
| **How are URLs structured?** | `https://imagedelivery.net/eCWooK4EUyalJ6a-Nut5cw/{image-id}/public` |
| **Where are landing page images?** | Hardcoded in React components (`components/landing/`) |
| **How are images generated?** | Skyverses AI API → Cloudflare upload → URL returned |
| **Is image handling automated?** | Partially (generation API automated, URL management manual) |
| **Where's the full guide?** | `.agents/workflows/add_new_product.md` |

---

## 📁 Essential Files

### 1. **Main Reference Script** (Output)
```
/scripts/socialbanner_showcase_cdn.sh
├─ 15 CDN URLs for Social Banner AI showcase
├─ Format: Bash variables (CDN_showcase_*)
└─ AUTO-GENERATED (do not edit manually)
```

**Sample:**
```bash
CDN_showcase_flash_sale_1111="https://imagedelivery.net/eCWooK4EUyalJ6a-Nut5cw/856429ad-d3fc-4708-7a4e-6a04c59fa900/public"
CDN_showcase_coffee_promo="https://imagedelivery.net/eCWooK4EUyalJ6a-Nut5cw/2b41a1fc-4ab5-48ef-edf2-40300c3ecb00/public"
# ... 13 more URLs
```

### 2. **Generation Pipeline Script** (Production Template)
```
/scripts/gen_socialbanner_showcase.sh
├─ Full 6-step pipeline (264 lines)
├─ Defines 15 showcase items with detailed AI prompts
├─ Submits jobs, polls status, downloads, uploads to Cloudflare
└─ Generates output CDN URL shell script
```

**Usage:**
```bash
bash scripts/gen_socialbanner_showcase.sh
# → Generates showcase banners → uploads → creates socialbanner_showcase_cdn.sh
```

### 3. **Frontend API**
```
/apis/images.ts (123 lines)
├─ imagesApi.createJob(payload) — Create generation job
├─ imagesApi.getJobStatus(jobId) — Poll job status
└─ imagesApi.getJobs(params) — List user's jobs
```

**Core Types:**
- `ImageJobRequest` — engine, config, prompt, dimensions
- `ImageJobResponse` — status, jobId, result (images array)

### 4. **Real Usage Example**
```
/components/landing/social-banner-ai/ShowcaseSection.tsx (472 lines)
├─ 15 hardcoded CDN URLs
├─ 3-column masonry grid layout
├─ Hover effects + lightbox modal
└─ Copy this pattern for new products
```

**Data Structure:**
```typescript
const SHOWCASE_ITEMS: BannerItem[] = [
  {
    id: 'flash-sale-1111',
    url: 'https://imagedelivery.net/eCWooK4EUyalJ6a-Nut5cw/856429ad.../public',
    label: 'Flash Sale 11.11',
    platform: 'Facebook Post · 1200×630',
    desc: 'Chiến dịch sale lớn nhất năm...',
    tags: ['Sale', 'E-commerce', 'Facebook'],
  },
  // ... 14 more
];
```

### 5. **Full Documentation**
```
/.agents/workflows/add_new_product.md (300+ lines)
├─ STEP 0: Read skills
├─ STEP 1: Define product metadata
├─ STEP 2: Create seed script (product creation)
├─ STEP 3: Generate & upload demo images (3 bash scripts)
├─ STEP 4: Build landing page components
├─ STEP 5: Setup product workspace
└─ STEP 6: Add to home page
```

---

## 🔄 Image Generation Workflow (6 Steps)

```
┌─────────────────────┐
│  STEP 1: DEFINE     │  Define 15 showcase items (names, prompts, dimensions)
└──────────┬──────────┘
           │
           ▼
┌─────────────────────────────────────────────────────┐
│  STEP 2: SUBMIT JOBS                                │
│  POST https://api.skyverses.com/image-jobs          │
│  ├─ Provider: "gommo"                               │
│  ├─ Model: "google_image_gen_4_5"                   │
│  └─ Returns: jobId (save for polling)               │
└──────────┬──────────────────────────────────────────┘
           │
           ▼
┌─────────────────────────────────────────────────────┐
│  STEP 3: POLL STATUS                                │
│  GET /image-jobs/{jobId}                            │
│  ├─ Poll interval: 5 seconds                        │
│  ├─ Max attempts: 60 (5 minutes total)              │
│  └─ On done: Returns image URL                      │
└──────────┬──────────────────────────────────────────┘
           │
           ▼
┌─────────────────────────────────────────────────────┐
│  STEP 4: DOWNLOAD LOCALLY                           │
│  Save to: public/assets/showcase-banners/           │
│  Format: {name}.png                                 │
└──────────┬──────────────────────────────────────────┘
           │
           ▼
┌─────────────────────────────────────────────────────┐
│  STEP 5: UPLOAD TO CLOUDFLARE                       │
│  POST /cloudflare/.../images/v1                     │
│  ├─ Auth: Bearer {CF_TOKEN}                         │
│  ├─ Option: requireSignedURLs=false                 │
│  └─ Returns: CDN URL variant /public                │
└──────────┬──────────────────────────────────────────┘
           │
           ▼
┌─────────────────────────────────────────────────────┐
│  STEP 6: GENERATE OUTPUT SCRIPT                     │
│  File: scripts/socialbanner_showcase_cdn.sh         │
│  Format: CDN_showcase_{name}="https://..."          │
│  Status: AUTO-GENERATED (commit to git)             │
└─────────────────────────────────────────────────────┘
```

---

## 🏗️ CDN URL Structure

### Format:
```
https://imagedelivery.net/{account-hash}/{image-id}/{variant}
```

### Breakdown:
| Component | Example | Purpose |
|-----------|---------|---------|
| Account Hash | `eCWooK4EUyalJ6a-Nut5cw` | Identifies Skyverses account |
| Image ID | `856429ad-d3fc-4708-7a4e-6a04c59fa900` | UUID of generated image |
| Variant | `public` | `/public` = unauthenticated access |

### Full Example:
```
https://imagedelivery.net/eCWooK4EUyalJ6a-Nut5cw/856429ad-d3fc-4708-7a4e-6a04c59fa900/public
```

---

## 🛠️ How to Add a New Product (Quick Version)

### Prerequisites:
- Product metadata defined (slug, name, description, etc.)
- AI prompts ready for showcase items (3-5 per platform)
- Cloudflare API token available

### Steps:

**1. Create product seed script** (`seed-social-banner-ai.mjs`):
```javascript
const product = {
  id: 'SOCIAL-BANNER-AI',
  slug: 'social-banner-ai',
  name: { en: 'Social Banner AI', vi: 'AI Tạo Banner Mạng Xã Hội', ... },
  imageUrl: 'https://images.unsplash.com/...', // placeholder
  // ... other metadata
};

fetch('https://api.skyverses.com/market', {
  method: 'POST',
  headers: { 'Authorization': `Bearer ${TOKEN}` },
  body: JSON.stringify(product)
});
```

**2. Run seed script:**
```bash
node seed-social-banner-ai.mjs
# → Returns: _id (save this)
```

**3. Create image generation script** (`gen-social-banner-ai-images.mjs`):
- Define 3-5 demo prompts (per platform)
- Gen images via Skyverses AI API
- Upload to Cloudflare CDN
- Update product with new imageUrl

**4. Create landing page image script** (`gen-social-banner-ai-landing-images.sh`):
- Gen images for FeaturesSection
- Gen images for UseCasesSection
- Gen images for WorkflowSection
- Gen HeroSection demo preview

**5. Collect all CDN URLs and hardcode into React components:**
```typescript
// components/landing/social-banner-ai/ShowcaseSection.tsx
const SHOWCASE_ITEMS = [
  { url: 'https://imagedelivery.net/...', label: '...', ... },
  // ... 14 more
];
```

**6. Build landing page components** using patterns from `social-banner-ai/`:
```
components/landing/social-banner-ai/
├─ HeroSection.tsx
├─ ShowcaseSection.tsx
├─ FeaturesSection.tsx
├─ UseCasesSection.tsx
├─ WorkflowSection.tsx
├─ FAQSection.tsx
└─ FinalCTA.tsx
```

**7. Add to home page:**
- Update `HOME_BLOCK_OPTIONS` (if new category)
- Add product to CMS homeBlocks system

---

## ⚠️ Known Issues & Gaps

### 1. **URLs are Hardcoded** ❌
- No centralized config file
- Each component has its own URL list
- **Fix:** Create `constants/landing-images.ts`

### 2. **Manual URL Collection** ❌
- Must manually copy URLs from API responses
- No automated collection script
- **Fix:** Build CLI script to auto-collect

### 3. **No Dynamic Image Updates** ❌
- Showcase images can't be updated without code redeploy
- No CMS backend for image management
- **Fix:** Implement API-driven image loading

### 4. **No Image Validation** ❌
- Build process doesn't test CDN URLs
- URLs could be broken without warning
- **Fix:** Add build-time URL health check

### 5. **Limited Image Metadata** ⚠️
- Missing alt text in some components
- Width/height not always in img tags
- No consistent lazy loading
- **Fix:** Add image optimization review

---

## 📚 Related Documentation

| Document | Purpose |
|----------|---------|
| `SKYVERSES_IMAGE_CDN_REPORT.md` | Full 12-section architectural deep-dive |
| `.agents/workflows/add_new_product.md` | Complete onboarding workflow |
| `CLAUDE.md` | Project conventions & context |
| `.agents/skills/skyverses_ui_pages/SKILL.md` | UI architecture reference |
| `.agents/skills/skyverses_architecture/SKILL.md` | Backend architecture reference |

---

## 🚀 Next Steps

### Immediate (Today):
1. Read this guide
2. Explore `gen_socialbanner_showcase.sh`
3. Check `components/landing/social-banner-ai/ShowcaseSection.tsx`

### Short-term (This Week):
1. Create `constants/landing-images.ts` (centralize URLs)
2. Add image validation to build
3. Document CDN account details securely

### Long-term (This Month):
1. Build `npm run generate-product-images` CLI
2. Implement CMS-driven image system
3. Add image performance analytics

---

## 💬 Questions?

- **How do I generate new showcase images?** → Run `bash scripts/gen_socialbanner_showcase.sh`
- **Where are CDN URLs stored?** → `scripts/socialbanner_showcase_cdn.sh` (and hardcoded in React)
- **How do I add a new product?** → Follow `.agents/workflows/add_new_product.md`
- **Can I update images without redeploy?** → Not currently (future enhancement)

---

**Document Version:** 1.0  
**Last Reviewed:** 2026-04-11  
**Maintained by:** Skyverses Engineering
