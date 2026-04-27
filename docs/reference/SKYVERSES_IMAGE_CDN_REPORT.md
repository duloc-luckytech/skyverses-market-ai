# Skyverses Market AI Codebase — Comprehensive Image CDN Architecture Report

**Date:** April 11, 2026  
**Project:** `skyverses-market-ai`  
**Repository:** `/Users/duloc/Desktop/SKYVERSES/ai-skyverses/skyverses-market-ai/`

---

## EXECUTIVE SUMMARY

The Skyverses Market AI project uses a **well-structured CDN image pipeline** combining:
- **Cloudflare Images** as the primary CDN provider
- **Generated scripts** (bash + Node.js) for image generation, upload, and URL management
- **Hardcoded CDN URLs** in landing page components (not dynamically fetched)
- **Real, production-ready CDN images** on all existing landing pages
- **Complete automation workflow** for adding new products with images

**Current Status:** 
- ✅ Image handling is **well-documented** and **partially automated**
- ⚠️ `add_new_product` workflow **documents the flow but doesn't auto-handle images** — manual script execution required
- ✅ All landing pages use **real Cloudflare CDN URLs**, not placeholders

---

## 1. SOCIALBANNER_SHOWCASE_CDN.SH — Primary Reference Script

**Path:** `/scripts/socialbanner_showcase_cdn.sh` (18 lines, AUTO-GENERATED)

### File Content:
```bash
#!/bin/bash
# AUTO-GENERATED: Social Banner Showcase CDN URLs
CDN_showcase_beauty_brand_story="https://imagedelivery.net/eCWooK4EUyalJ6a-Nut5cw/87f819af-339e-4144-e17a-5ecdc1282900/public"
CDN_showcase_coffee_promo="https://imagedelivery.net/eCWooK4EUyalJ6a-Nut5cw/2b41a1fc-4ab5-48ef-edf2-40300c3ecb00/public"
CDN_showcase_elearning="https://imagedelivery.net/eCWooK4EUyalJ6a-Nut5cw/0c531e63-958f-4157-764c-de57228d9400/public"
CDN_showcase_flash_sale_1111="https://imagedelivery.net/eCWooK4EUyalJ6a-Nut5cw/856429ad-d3fc-4708-7a4e-6a04c59fa900/public"
CDN_showcase_food_delivery="https://imagedelivery.net/eCWooK4EUyalJ6a-Nut5cw/2fd23fdf-d600-4a0a-8ef1-6aebed612100/public"
CDN_showcase_grand_opening="https://imagedelivery.net/eCWooK4EUyalJ6a-Nut5cw/53366c5d-e1d3-4a4e-c7ea-25519c88ea00/public"
CDN_showcase_gym_fitness="https://imagedelivery.net/eCWooK4EUyalJ6a-Nut5cw/fa52e689-1ff4-4810-2927-6d7dd9424100/public"
CDN_showcase_new_collection_story="https://imagedelivery.net/eCWooK4EUyalJ6a-Nut5cw/76082522-f991-4176-f321-1d4d09339d00/public"
CDN_showcase_product_launch_ig="https://imagedelivery.net/eCWooK4EUyalJ6a-Nut5cw/3aebbfd3-4095-4cc8-770f-a4efcb998e00/public"
CDN_showcase_realestate_linkedin="https://imagedelivery.net/eCWooK4EUyalJ6a-Nut5cw/2bf39eed-6a95-44a5-fcea-380501b54700/public"
CDN_showcase_tech_gadget="https://imagedelivery.net/eCWooK4EUyalJ6a-Nut5cw/3940688f-5827-4f42-f9a4-b82dba06ef00/public"
CDN_showcase_tet_sale="https://imagedelivery.net/eCWooK4EUyalJ6a-Nut5cw/c9a676ed-fc4b-4404-9833-275e90dbc300/public"
CDN_showcase_travel_agency="https://imagedelivery.net/eCWooK4EUyalJ6a-Nut5cw/39c7bbea-121b-4f0e-4c30-c42b0cde4100/public"
CDN_showcase_tuyen_dung="https://imagedelivery.net/eCWooK4EUyalJ6a-Nut5cw/b2a1b759-4b62-4d6c-a4a7-db43b9a8bf00/public"
CDN_showcase_webinar_linkedin="https://imagedelivery.net/eCWooK4EUyalJ6a-Nut5cw/52735b7f-a10b-4d4d-37a9-4a5d4db9a100/public"
```

### Purpose:
This is the **output file** (auto-generated) that contains **15 showcase banner URLs** for the Social Banner AI landing page.

---

## 2. CDN URL STRUCTURE ANALYSIS

### Cloudflare Images URL Format:
```
https://imagedelivery.net/{account-hash}/{image-id}/{variant}
```

**Example Breakdown:**
```
https://imagedelivery.net/eCWooK4EUyalJ6a-Nut5cw/856429ad-d3fc-4708-7a4e-6a04c59fa900/public
                         └─ Account Hash          └─ Image ID (UUID)              └─ Variant
```

### Account Details:
- **Account Hash:** `eCWooK4EUyalJ6a-Nut5cw` (consistent across all CDN URLs)
- **Image IDs:** UUID format (e.g., `856429ad-d3fc-4708-7a4e-6a04c59fa900`)
- **Variant:** `public` (allows unauthenticated access)

### Related CDN Scripts:
All located in `/scripts/`:
1. **`socialbanner_showcase_cdn.sh`** — 15 showcase banners (1200×630 / 1080×1920 / etc.)
2. **`socialbanner_cdn_urls.sh`** — 11 feature/usecase CDN URLs (hero, features, usecases)
3. **`gen_socialbanner_showcase.sh`** — Full generation pipeline (creates above file)
4. **`gen_socialbanner_landing_images.sh`** — Generates landing page images
5. **`gen_socialbanner_feature_thumbs.sh`** — Feature thumbnail generation
6. **`socialbanner_feature_thumbs_cdn.sh`** — Feature thumb CDN URLs

---

## 3. IMAGE GENERATION & UPLOAD PIPELINE

### Script: `gen_socialbanner_showcase.sh` (264 lines, PRODUCTION TEMPLATE)

**Full Pipeline Workflow:**

```
1. DEFINE 15 SHOWCASE ITEMS
   ├─ Each with: name, prompt, width, height, label, platform, description
   ├─ Example: Flash Sale 11.11 (1200×630), Khai Trương (820×312), etc.
   └─ Each has detailed, contextual AI prompt

2. SUBMIT IMAGE GENERATION JOBS
   ├─ API: https://api.skyverses.com/image-jobs
   ├─ Method: POST with ImageJobRequest (see below)
   ├─ Provider: "gommo"
   ├─ Model: "google_image_gen_4_5"
   └─ Returns: jobId (poll for status)

3. POLL JOB STATUS
   ├─ Endpoint: GET /image-jobs/{jobId}
   ├─ Status cycle: pending → processing → done
   ├─ Poll interval: 5 seconds
   ├─ Max wait: 300 seconds (60 attempts)
   └─ On success: Returns image URL

4. DOWNLOAD GENERATED IMAGES
   ├─ Local storage: public/assets/showcase-banners/
   └─ Format: {name}.png

5. UPLOAD TO CLOUDFLARE CDN
   ├─ API: https://api.cloudflare.com/client/v4/accounts/{CF_ACCOUNT}/images/v1
   ├─ Auth: Bearer token (CF_TOKEN)
   ├─ Option: requireSignedURLs=false (public access)
   └─ Returns: CDN URL variant /public

6. GENERATE OUTPUT SHELL SCRIPT
   ├─ File: scripts/socialbanner_showcase_cdn.sh
   ├─ Format: Bash variables (CDN_showcase_*)
   └─ Optional metadata: label, platform, desc, width, height (commented)
```

### Example Image Job Request (`imagesApi.createJob`):
```typescript
{
  type: "text_to_image",
  input: {
    prompt: "A high-energy Vietnamese e-commerce flash sale banner..."
  },
  config: {
    width: 1200,
    height: 630,
    aspectRatio: "1200:630",
    seed: 0,
    style: ""
  },
  engine: {
    provider: "gommo",
    model: "google_image_gen_4_5"
  },
  enginePayload: {
    prompt: "A high-energy Vietnamese e-commerce flash sale banner...",
    privacy: "PRIVATE",
    projectId: "default"
  }
}
```

---

## 4. IMAGES API — Frontend Integration

**Path:** `/apis/images.ts` (123 lines)

### Core Exported Functions:

```typescript
export const imagesApi = {
  /**
   * Create image generation job (POST /image-jobs)
   * Requires: Bearer token (from AuthContext)
   * Returns: { success, data: { status, jobId, result?: { images, imageId } } }
   */
  createJob: async (payload: ImageJobRequest): Promise<ImageJobResponse>

  /**
   * Poll job status (GET /image-jobs/:id)
   * Returns: { data: { status: "pending|processing|done|failed|error", jobId, result? } }
   */
  getJobStatus: async (jobId: string): Promise<ImageJobResponse>

  /**
   * List user's jobs (GET /image-jobs)
   * Params: { status?, page?, limit? }
   * Returns: { data: [], pagination: { page, limit, total } }
   */
  getJobs: async (params): Promise<ImageJobHistoryResponse>
}
```

### Key Interfaces:

```typescript
export interface ImageJobRequest {
  type: "text_to_image" | "image_to_image";
  input: { prompt: string; image?: string; images?: string[]; mask?: string };
  config: { width: number; height: number; aspectRatio: string; seed: number; style: string };
  engine: { provider: "gommo" | "fxlab"; model: string };
  enginePayload: { prompt: string; privacy: "PRIVATE"; projectId: "default"; mode?: string; ... };
}

export interface ImageJobResponse {
  success?: boolean;
  status?: string;
  data: {
    status: "pending" | "processing" | "done" | "failed" | "error";
    jobId: string;
    result?: {
      images: string[];      // Array of generated image URLs
      imageId: string;
      thumbnail: string;
      width?: number;
      height?: number;
    };
  };
  message?: string;
}
```

---

## 5. LANDING PAGE IMAGE USAGE — Two Case Studies

### Case 1: Social Banner AI Landing Page (`components/landing/social-banner-ai/`)

#### HeroSection.tsx (505 lines):
- **Demo mode:** Includes inline demo widget with **mock banners** (gradient placeholders, no real images)
- **Real output placeholder:** Shows animated 2×2 grid of mock cards until user generates
- **Image reference:** `BannerPlaceholder` component (lines 86-194) uses gradient backgrounds
- **No CDN URLs:** HeroSection doesn't hardcode CDN images

#### ShowcaseSection.tsx (472 lines):
- **15 Real Showcase Items** with **hardcoded Cloudflare CDN URLs** ✅
- **Data structure:**
```typescript
const SHOWCASE_ITEMS: BannerItem[] = [
  {
    id: 'flash-sale-1111',
    url: 'https://imagedelivery.net/eCWooK4EUyalJ6a-Nut5cw/856429ad-d3fc-4708-7a4e-6a04c59fa900/public',
    label: 'Flash Sale 11.11',
    platform: 'Facebook Post · 1200×630',
    desc: 'Chiến dịch sale lớn nhất năm...',
    tags: ['Sale', 'E-commerce', 'Facebook'],
  },
  // ... 14 more items
];
```

**UI Pattern:**
- **Desktop:** 3-column masonry grid with lazy loading
- **Mobile:** 2-column grid
- **Hover:** Zoom + info overlay (title, desc, tags)
- **Lightbox:** Full-screen modal with platform metadata

#### UseCasesSection.tsx:
- Uses **6 CDN URLs** for use case thumbnails (600×400)
- Examples: "Cửa hàng online", "Nhà hàng Facebook", "KOL/Creator", etc.
- All `imagedelivery.net` URLs

### Case 2: Image Generator Landing Page (`components/landing/image-generator/`)

#### HeroSection.tsx (partial view):
- **6-cell mosaic placeholder** (IdleMosaic component)
- **Model families listed:** Nano Banana Pro, Seedream 5, Midjourney 7, Kling 3.0, etc.
- **Quick prompts:** 6 presets (landscape, portrait, urban, abstract, nature, culture)
- **Aspect ratios:** 1:1, 16:9, 9:16, 4:3
- **Optional real images array:** `images?: string[]` prop (for demo purposes)

---

## 6. CONSTANTS & MARKET CONFIG

**Path:** `/constants/market-config.tsx` (62 lines)

### Exported:
```typescript
export interface HomeBlockOption {
  id: string;
  label: string;
  title: string;
  subtitle: string;
  icon: React.ReactElement;
  color: string;
}

export const HOME_BLOCK_OPTIONS: HomeBlockOption[] = [
  { id: 'top-choice', label: 'Top Choice', title: 'Top Choice', subtitle: 'Lựa chọn hàng đầu...', icon: <Flame/>, color: 'text-orange-500' },
  { id: 'top-image', label: 'Image Studio', title: 'Image Studio', subtitle: 'Tổng hợp thị giác...', icon: <ImageIcon/>, color: 'text-brand-blue' },
  { id: 'top-video', label: 'Video Studio', ... },
  { id: 'top-ai-agent', label: 'AI Agent Workflow', ... },
  { id: 'events', label: 'Lễ hội & Sự kiện', ... },
  { id: 'app-other', label: 'App khác', ... },
];
```

**Note:** This defines **home page block categories**, not image URLs directly.

---

## 7. ADD_NEW_PRODUCT WORKFLOW — Documentation & Requirements

**Path:** `.agents/workflows/add_new_product.md` (300+ lines)

### Complete Flow Overview:

```
STEP 0: Read skills
├─ .agents/skills/skyverses_architecture/SKILL.md
└─ .agents/skills/skyverses_ui_pages/SKILL.md

STEP 1: Define product metadata
├─ slug, id (SCREAMING_SNAKE), name (4 langs)
├─ category, description, features (4 langs each)
├─ priceCredits, complexity, homeBlocks, tags
└─ Example: social-banner-ai, SOCIAL-BANNER-AI, etc.

STEP 2: Create seed script (seed-<slug>.mjs)
├─ POST to https://api.skyverses.com/market
├─ Create product with placeholder imageUrl
└─ Returns: _id (save for STEP 3)

STEP 2.5: Verify seed
├─ Confirm product live: GET https://api.skyverses.com/market/<slug>
├─ Check 404 or token issues
└─ Proceed to STEP 3 only after success

STEP 3: Generate & Update Demo Images
├─ STEP 3.1: Create gen-<slug>-images.mjs (product demo images, 3-5 per platform)
│   ├─ Gen via Skyverses AI API
│   ├─ Upload to Cloudflare CDN
│   ├─ PATCH /market/:id (main thumbnail)
│   └─ PATCH /market/:id/demo-images (additional platforms)
│
├─ STEP 3.2: Create 3 bash scripts for landing page blocks
│   ├─ gen-<slug>-landing-images.sh (FeaturesSection, WorkflowSection, UseCasesSection, HeroSection)
│   ├─ gen-<slug>-feature-thumbs.sh (6-8 feature card thumbnails)
│   └─ gen-<slug>-showcase.sh (15 showcase items, if applicable)
│
└─ STEP 3.5: Build landing page configuration & plan all sections
    ├─ 10 use cases with industry-specific visuals
    ├─ 6-8 features with detailed descriptions
    ├─ Workflow steps with example output images
    ├─ Showcase items (for applicable products)
    └─ CDN URLs collected from STEP 3.1 & 3.2

STEP 4: Build Landing Page Components
├─ Create components/landing/<slug>/
├─ Sections: Hero, Features, UseCase, Workflow, Showcase, FAQ, CTA
└─ Hardcode CDN URLs from STEP 3.5

STEP 5: Product Workspace (Smart Workspace) Setup
├─ Create tools/<slug>/
├─ Task templates, AI prompts, workflows
└─ AI Agent configuration

STEP 6: Add Product Card to Home
├─ Update HomeBlock CMS system
├─ Add to featured, top_trending, or category block
└─ Link to /product/<slug>
```

### Key Findings About Automation:

✅ **Automated:**
- Product seed via API
- Image generation via API
- Cloudflare CDN upload via API
- Job polling & status tracking

❌ **NOT Automated (Manual Steps Required):**
1. **Running bash scripts** — `node gen-<slug>-images.mjs`, `bash gen-<slug>-landing-images.sh`
2. **Collecting CDN URLs** — Must manually note URLs from API responses
3. **Hardcoding URLs into components** — Copy-paste into React components
4. **Landing page build** — Create TSX components manually
5. **Workspace setup** — Configure AI agent workflows manually

---

## 8. GAPS & OPPORTUNITIES

### Current Gaps:

#### 1. **Image URL Hardcoding** ❌
- CDN URLs are **hardcoded strings** in React components
- No **environment variables** or **config files** for CDN URLs
- **Implication:** Adding new products requires manual URL insertion

#### 2. **Manual Script Execution** ❌
- `add_new_product.md` **documents** the flow but doesn't **automate** it
- Requires human to: run `node seed-*.mjs`, `bash gen-*.sh`, collect URLs, edit files
- **Implication:** Error-prone, time-consuming for new products

#### 3. **No Dynamic Image Loading from CMS** ❌
- Landing page images are **not fetched from API**
- No CMS system to manage/update showcase images after deployment
- **Implication:** Cannot update showcase without code redeploy

#### 4. **No Image Fallbacks/Placeholders** ⚠️
- If CDN URL breaks, no graceful fallback
- No local placeholder system

#### 5. **No Image Optimization Metadata** ⚠️
- Width/height hardcoded in some places, not in img tags
- No `loading="lazy"` attributes consistently applied
- Missing alt text in some showcase components

### Opportunities for Improvement:

1. **Create unified image config file:**
   ```typescript
   // constants/landing-images.ts
   export const LANDING_IMAGES = {
     'social-banner-ai': {
       showcase: [
         { id: 'flash-sale-1111', url: 'https://...', label: '...' },
         // ...
       ],
       usecases: [
         { id: 'usecase-1', url: 'https://...', label: '...' },
         // ...
       ],
     },
   };
   ```

2. **Build image generation CLI:**
   ```bash
   npm run generate-product-images -- --product social-banner-ai
   ```
   This would:
   - Run all scripts in sequence
   - Collect URLs automatically
   - Update config file
   - Regenerate component imports

3. **Implement CMS-driven image system:**
   - Store showcase images in backend DB
   - Fetch on component mount
   - No redeploy needed to update images

4. **Add image validation:**
   - Test CDN URLs on build
   - Warn if images return 404

---

## 9. PROJECT STRUCTURE — IMAGE-RELATED FILES

```
/scripts/
├─ gen_socialbanner_showcase.sh ............... [264 lines] Full pipeline (gen → upload)
├─ gen_socialbanner_landing_images.sh ........ [~300 lines] Landing page images
├─ gen_socialbanner_feature_thumbs.sh ........ Feature thumbnail generator
├─ socialbanner_showcase_cdn.sh .............. [18 lines] Output: showcase CDN URLs
├─ socialbanner_cdn_urls.sh .................. [11 lines] Output: feature CDN URLs
└─ socialbanner_feature_thumbs_cdn.sh ........ Feature thumb URL output

/apis/
├─ images.ts ................................ [123 lines] Image job API (createJob, getJobStatus, getJobs)
├─ config.ts ................................ API_BASE_URL, getHeaders()
└─ *.ts ..................................... Other APIs (market, credits, auth, etc.)

/constants/
├─ market-config.tsx ......................... [62 lines] Home block options (not image URLs)

/components/landing/
├─ social-banner-ai/
│  ├─ HeroSection.tsx ........................ [505 lines] Demo (mock banners, no CDN URLs)
│  ├─ ShowcaseSection.tsx ................... [472 lines] 15 items with hardcoded CDN URLs ✅
│  ├─ UseCasesSection.tsx ................... 6 use cases with CDN URLs ✅
│  ├─ FeaturesSection.tsx
│  ├─ WorkflowSection.tsx
│  └─ ...
├─ image-generator/
│  ├─ HeroSection.tsx ........................ [~500 lines] Mosaic placeholder
│  └─ ...
└─ [other products]/

/.agents/
├─ workflows/
│  ├─ add_new_product.md .................... [300+ lines] Full guide (mostly manual)
│  ├─ push.md
│  ├─ cms_style_guide.md
│  └─ new_chat_starter.md
└─ skills/
   ├─ skyverses_architecture/SKILL.md
   ├─ skyverses_ui_pages/SKILL.md
   ├─ skyverses_cms/SKILL.md
   └─ skyverses_business_flows/SKILL.md

CLAUDE.md ..................................... [94 lines] Project overview & conventions
```

---

## 10. SUMMARY TABLE

| Aspect | Status | Details |
|--------|--------|---------|
| **CDN Provider** | ✅ Live | Cloudflare Images (`imagedelivery.net`) |
| **CDN URL Format** | ✅ Standardized | `https://imagedelivery.net/{account}/{image-id}/public` |
| **Backend Image API** | ✅ Available | `imagesApi` (createJob, getJobStatus, getJobs) |
| **Generation Scripts** | ✅ Available | Bash + Node.js (gen_socialbanner_*.sh) |
| **Landing Page URLs** | ✅ Real CDN | Social Banner AI uses 15 real showcase URLs + 6 usecase URLs |
| **Image Generator Landing** | ⚠️ Placeholders | Mock gradient placeholders (no real images in HeroSection) |
| **add_new_product Workflow** | ⚠️ Semi-Auto | Documented but requires manual script execution & URL hardcoding |
| **Image Config Management** | ❌ None | URLs hardcoded in React components (no centralized config) |
| **CMS Integration** | ❌ Partial | `HomeBlockOptions` exist but not image-specific |
| **Image Optimization** | ⚠️ Basic | `loading="lazy"` applied in some places, inconsistent alt text |
| **Documentation** | ✅ Extensive | `.agents/workflows/add_new_product.md`, CLAUDE.md, SKILL files |

---

## 11. KEY FILES SUMMARY

### Must-Read Files:

1. **`gen_socialbanner_showcase.sh`** — Full production template for image pipeline
2. **`apis/images.ts`** — Frontend API for image job management
3. **`components/landing/social-banner-ai/ShowcaseSection.tsx`** — Real CDN usage example
4. **`.agents/workflows/add_new_product.md`** — Complete product onboarding guide
5. **`CLAUDE.md`** — Project conventions & context

### Configuration Files:

- `constants/market-config.tsx` — Home block categories
- `apis/config.ts` — API base URL & headers
- `.env` & `.env.production` — Environment variables

---

## 12. RECOMMENDATIONS

### Immediate (High Impact):

1. **Create `constants/landing-images.ts`** — Centralize all CDN URLs
2. **Add image validation to build process** — Test URLs exist
3. **Document CDN account details** — Store in secure location

### Short-term (Medium Impact):

4. **Build `npm run generate-product-images` CLI** — Automate script execution
5. **Create reusable image section components** — Reduce hardcoding
6. **Implement consistent alt text strategy** — Accessibility

### Long-term (Strategic):

7. **Migrate to CMS-driven images** — Backend manages showcase images
8. **Build image versioning system** — A/B test different showcase images
9. **Create analytics** — Track which showcase images drive conversions

---

**Report Generated:** 2026-04-11  
**Explored by:** Claude Code Exploration Suite
