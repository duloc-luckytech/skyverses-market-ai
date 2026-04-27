# 📑 SKYVERSES MARKET AI - CODEBASE INDEX

Hướng dẫn tìm kiếm nhanh các file và khái niệm trong codebase.

---

## 🚀 QUICK START (5 phút)

### Bạn muốn...

#### Hiểu "add new product" workflow
→ Đọc `.agents/workflows/add_new_product.md` (117KB)
→ Xem STEP 1-9: seed → image gen → landing page → workspace → routing

#### Hiểu job polling pattern (video/image generation)
→ Đọc `QUICK_REFERENCE.md` (5 phút)
→ Sau đó: `VIDEO_CREATION_DETAILED.md` (10 phút)
→ Nếu cần detail: `JOB_POLLING_PATTERN_ANALYSIS.md` (15 phút)

#### Tạo page mới (landing page)
→ Đọc `.agents/skills/skyverses_ui_pages/SKILL.md`
→ Xem STEP 3.5-4 trong `add_new_product.md`
→ Copy structure từ `pages/videos/AIVideoGenerator.tsx`

#### Thêm workspace (video/image generation)
→ Xem `VIDEO_CREATION_DETAILED.md` (complete implementation guide)
→ Copy từ `components/AIVideoGeneratorWorkspace.tsx`
→ Follow STEP 6-6.5 trong `add_new_product.md`

#### Hiểu frontend (homepage, markets page, filters)
→ Đọc `.agents/skills/skyverses_ui_pages/SKILL.md`
→ Xem `pages/MarketPage.tsx` (103KB)
→ Xem `pages/MarketsPage.tsx` (57KB)

#### Cấu hình AI engine cho ảnh/video
→ Xem `.agents/workflows/add_new_product.md` STEP 6.5
→ Xem `components/video-generator/VideoModelEngineSettings.tsx`
→ Xem `components/SocialBannerWorkspace.tsx` (reference workspace)

#### Debug job polling issue
→ Xem `QUICK_REFERENCE.md` "Common Mistakes"
→ Xem `JOB_POLLING_PATTERN_ANALYSIS.md` line numbers
→ Xem `VIDEO_CREATION_DETAILED.md` "Error Handling"

---

## 📂 FILE STRUCTURE & LOCATIONS

### DOCUMENTATION FILES (Project Root)
```
SKYVERSES_CODEBASE_ANALYSIS.md    ← 🌟 Main overview (start here)
VIDEO_CREATION_DETAILED.md         ← 🎬 Video generation logic
CODEBASE_INDEX.md                  ← 📑 This file (navigation)
QUICK_REFERENCE.md                 ← ⚡ Job polling copy-paste template
START_HERE.md                       ← 📚 Job polling introduction
JOB_POLLING_PATTERN_ANALYSIS.md    ← 🔍 Detailed analysis with line numbers
VIDEO_vs_IMAGE_PATTERN.md          ← 📊 Pattern comparison
FILES_CREATED.md                   ← 📋 Summary of docs
```

### WORKFLOW FILES (`.agents/workflows/`)
```
add_new_product.md      ← 117KB — Full 9-step workflow for adding products
cms_style_guide.md      ← CMS page/tab creation guide
new_chat_starter.md     ← Chat initialization templates
push.md                 ← Git push workflow
```

### SKILL FILES (`.agents/skills/*/SKILL.md`)
```
skyverses_ui_pages/SKILL.md        ← Frontend architecture (homepage, markets, products)
skyverses_business_flows/SKILL.md  ← Payment, AI generation, credits logic
skyverses_architecture/SKILL.md    ← System architecture overview
skyverses_cms/SKILL.md             ← CMS admin tabs/drawers
```

### PAGES (Frontend Entry Points)
```
pages/videos/
├── AIVideoGenerator.tsx           ← Video creation landing page (thin orchestrator)
├── AvatarLipsyncAI.tsx
├── FibusVideoStudio.tsx
├── GenyuProduct.tsx
├── StoryboardStudioPage.tsx
└── VideoAnimateAI.tsx

pages/images/
├── AIImageGenerator.tsx           ← Image creation landing page
├── AIImageRestoration.tsx
├── AIStylistPage.tsx
├── BackgroundRemovalAI.tsx
├── EventStudioPage.tsx
├── FashionCenterAI.tsx
├── ImageUpscaleAI.tsx
├── PosterMarketingAI.tsx
├── Product6Image.tsx
├── Product7Comic.tsx
├── ProductImage.tsx
└── RealEstateVisualAI.tsx

pages/audio/
├── MusicGenerator.tsx
├── TextToSpeech.tsx
├── VoiceDesignAI.tsx
└── VoiceStudio.tsx

pages/ (Main)
├── MarketPage.tsx                 ← Homepage (103KB)
├── MarketsPage.tsx                ← Markets page with filters (57KB)
├── SolutionDetail.tsx             ← Product detail page
├── AboutPage.tsx
├── LoginPage.tsx
├── CreditsPage.tsx
├── CreditUsagePage.tsx
└── ... (other pages)
```

### COMPONENTS (Main Business Logic)

#### Video Generation
```
components/
├── AIVideoGeneratorWorkspace.tsx  ← 🔴 MAIN (810 lines, job polling implementation)
├── TextToVideoWorkspace.tsx       ← Text-to-video specific
├── VideoAnimateWorkspace.tsx      ← Animation specific
├── ArticleToVideoWorkspace.tsx    ← Article-based
├── AudioToVideoWorkspace.tsx      ← Audio-based
├── video-generator/
│   ├── VideoModelEngineSettings.tsx ← AI engine config dropdown
│   ├── VideoCard.tsx                ← Result card display
│   └── SidebarLeft.tsx              ← Input sidebar
└── landing/video-generator/         ← 8 section files
    ├── HeroSection.tsx
    ├── WorkflowSection.tsx
    ├── ModesSection.tsx
    ├── UseCasesSection.tsx
    └── FinalCTA.tsx
```

#### Image Generation
```
components/
├── PosterStudioWorkspace.tsx      ← Reference image workspace (OLD — has AISuggestPanel)
├── SocialBannerWorkspace.tsx      ← Canonical workspace (NEW — best reference)
├── RealEstateVisualWorkspace.tsx  ← Multi-output workspace (image + video)
├── ProductImageWorkspace.tsx
├── FashionStudioWorkspace.tsx
├── UpscaleWorkspace.tsx           ← Transform (no polling)
└── image-generator/               ← Similar to video-generator/
    ├── ImageModelEngineSettings.tsx
    ├── ImageCard.tsx
    └── ...
```

#### Shared Components
```
components/
├── workspace/
│   ├── AISuggestPanel.tsx         ← AI prompt suggestions (4 tabs: Ideas, Styles, Templates, Smart Fill)
│   └── ... (other workspace-specific)
├── market/
│   ├── ProductToolModal.tsx       ← Router for workspace selection
│   ├── SolutionCard.tsx           ← Product card on homepage/markets
│   └── ...
├── landing/
│   ├── _shared/
│   │   ├── SectionAnimations.tsx  ← Shared animation components (FadeInUp, CountUp, etc.)
│   │   └── ProHeroVisuals.tsx     ← Shared hero visual components (ImageMasonryGrid, BeforeAfterSlider, etc.)
│   └── <slug>/                    ← Landing sections per product
└── common/
    ├── ResourceAuthModal.tsx      ← Credits vs Personal Key modal
    ├── JobLogsModal.tsx           ← Job status logs viewer
    └── ...
```

### APIS & SERVICES
```
apis/
├── videos.ts                      ← VideosApi { createJob, getJobStatus, ... }
├── images.ts                      ← ImagesApi { createJob, getJobStatus, ... }
├── pricing.ts                     ← PricingApi { getModels, ... }
└── ... (other APIs)

services/
├── gemini.ts                      ← Demo video/image generation (NOT for production)
├── storage.ts                     ← GCS upload
└── ... (other services)

hooks/
├── useAuth.ts                     ← useAuth() { credits, useCredits, addCredits, ... }
├── useLanguage.ts
├── useTheme.ts
└── ... (other hooks)
```

### DATA & SCRIPTS
```
data.ts                            ← Product data definitions
seed-products.mjs                  ← Seed multiple products
seed-<slug>.mjs                    ← Seed single product (create with pattern)
gen-<slug>-images.mjs              ← Generate + upload demo images
update-product-images.mjs          ← Regenerate all product images
scripts/                           ← Utility scripts
```

---

## 🔑 KEY CONCEPTS

### 1. Job Polling Pattern (Video/Image Generation)
**Where:** `AIVideoGeneratorWorkspace.tsx` (lines 305-344, 346-462)
**When:** Async API creation → polling
**3 Branches:** ERROR (refund) | SUCCESS (done) | PROCESSING (poll again)
**Files:**
- `QUICK_REFERENCE.md` — Copy-paste template
- `JOB_POLLING_PATTERN_ANALYSIS.md` — Detailed reference
- `VIDEO_CREATION_DETAILED.md` — Complete implementation guide

### 2. Add New Product Workflow
**Where:** `.agents/workflows/add_new_product.md`
**9 Steps:** Metadata → Seed → Gen images → Plan → Build sections → Create workspace → Config AI → Wire routing → Deploy
**Key file:** `add_new_product.md` (117KB, 900+ lines)

### 3. Frontend Architecture
**Where:** `.agents/skills/skyverses_ui_pages/SKILL.md`
**Key Pages:**
- MarketPage (homepage) — Featured showcase, homeBlocks, product grid
- MarketsPage (browse) — Filters, grid/list toggle, compare panel
- Product detail — Landing page + workspace modal

### 4. UI Component Patterns
**Landing Pages:** Thin orchestrator (page file) + 8 separate section files
**Sections:** HeroSection, WorkflowSection, ShowcaseSection, FeaturesSection, UseCasesSection, FAQSection, FinalCTA, LiveStatsBar
**Animations:** SectionAnimations (FadeInUp, CountUp, GradientMesh, etc.)
**Visuals:** ProHeroVisuals (ImageMasonryGrid, BeforeAfterSlider, VideoReelGrid, etc.)

### 5. Workspace Architecture
**Pattern:** Sidebar (inputs) + Viewport (preview) + Results rail (history)
**Components:** SidebarLeft, ResultsMain, VideoCard
**Features:** AI Suggest Panel, Industry picker, Model/Engine/Mode selectors
**State:** Results array (not single result), Ref to avoid stale closure in polling

### 6. CMS-Driven System
**HomeBlocks:** Product grid sections on homepage (top_trending, video_studio, image_studio, etc.)
**Product Metadata:** Name, category, description, features, pricing, tags, complexity
**Demo Images:** CDN URLs for landing page visuals

---

## 🔍 SEARCH BY CONCEPT

### Credit Management
- **Where:** `useAuth()` hook returns `{ credits, useCredits, addCredits }`
- **Deduct timing:** After successful API call (line 438 video)
- **Refund logic:** On job failure, check `isRefunded` flag (line 320 video)
- **Low credit check:** Before generating (line 354 video)
- **Files:** `context/AuthContext.tsx`, AIVideoGeneratorWorkspace.tsx

### ID Swapping (Local → Server)
- **Why:** API returns serverJobId, must replace local ID before polling
- **Location:** Line 436 (AIVideoGeneratorWorkspace.tsx)
- **Pattern:** `setResults(prev => prev.map(r => r.id === task.id ? { ...r, id: serverJobId } : r))`
- **When:** Immediately after successful job creation

### Logging & Debugging
- **Function:** `addLogToTask(taskId, message)` (line 286)
- **Format:** `[PHASE] Message` (SYSTEM, UPLINK, NODE_INIT, API_READY, POLLING, STATUS, SUCCESS, ERROR, NETWORK)
- **Storage:** In `VideoResult.logs` array
- **UI:** `JobLogsModal.tsx` shows full log history

### Error Handling
- **Insufficient credits:** `setShowLowCreditAlert(true)`
- **API failure:** Mark as error, NO refund (job never created)
- **Job failure:** Refund if `!isRefunded`
- **Network error:** Retry after 10s (not 5s)
- **File:** `VIDEO_CREATION_DETAILED.md` "Error Handling" section

### Model/Engine Configuration
- **Centralized UI:** `ModelEngineSettings` component (STEP 6.5)
- **DO NOT:** Build engine UI manually in workspace
- **Fields:** Model, Engine, Mode, Resolution, Ratio, Duration, Quantity
- **Reference:** `SocialBannerWorkspace.tsx`, `components/video-generator/VideoModelEngineSettings.tsx`

### AI Suggestion Panel
- **File:** `components/workspace/AISuggestPanel.tsx`
- **4 Tabs:** Prompt Ideas, Style Presets, Templates, Smart Fill
- **Props:** productSlug, productName, styles, onPromptSelect, featuredTemplates
- **Storage:** localStorage `skyverses_<ID>_vault`
- **Usage:** STEP 6 in add_new_product workflow

### Explorer API (Image/Video Gallery)
- **Components:** ImageMasonryGrid, VideoReelGrid, ShowcaseImageStrip
- **Import:** From `components/landing/_shared/ProHeroVisuals.tsx`
- **Auto-fetch:** Components fetch from backend (no hardcode URLs)
- **Props:** type ('image' | 'video'), limit, className
- **Usage:** HeroSection, ShowcaseSection, FeaturesSection (optional thumbs)

### Image Sources (Priority)
1. **CDN from STEP 3** (gen-<slug>-images.mjs) — Best quality, production
2. **Explorer API** (auto-fetch by component) — Community gallery
3. **Unsplash** (fallback) — Placeholder until CDN ready
4. **Format:** https://images.unsplash.com/photo-ID?auto=format&fit=crop&q=80&w=800

---

## 🎓 LEARNING PATH

### Day 1 (30 min)
1. Read `SKYVERSES_CODEBASE_ANALYSIS.md` (this document)
2. Read `QUICK_REFERENCE.md` (job polling overview)
3. Scan `START_HERE.md` (job polling intro)

### Day 2 (1 hour)
1. Read `VIDEO_CREATION_DETAILED.md` (complete flow)
2. Study `AIVideoGeneratorWorkspace.tsx` lines 305-344 (pollVideoJobStatus)
3. Study `AIVideoGeneratorWorkspace.tsx` lines 346-443 (performInference + job creation)

### Day 3 (2 hours)
1. Read `.agents/workflows/add_new_product.md` STEP 1-6 (product workflow)
2. Study `SocialBannerWorkspace.tsx` (reference workspace)
3. Look at `pages/videos/AIVideoGenerator.tsx` (landing page orchestrator)

### Day 4+ (Reference)
1. Use `JOB_POLLING_PATTERN_ANALYSIS.md` for exact line numbers
2. Use `VIDEO_vs_IMAGE_PATTERN.md` for pattern reuse
3. Reference `.agents/skills/skyverses_ui_pages/SKILL.md` for frontend

---

## ⚠️ CRITICAL RULES

### Job Polling
- ✅ Deduct credits **AFTER** API success
- ✅ Swap ID **BEFORE** polling
- ✅ Poll every **5s** (10s on network error)
- ✅ Refund if job fails (**CHECK isRefunded flag**)
- ❌ Do NOT deduct before API call
- ❌ Do NOT use local ID for polling

### Add New Product
- ✅ Follow 9 steps in order (STEP 0-9)
- ✅ Use ModelEngineSettings for image/video products (STEP 6.5)
- ✅ Copy landing structure (thin orchestrator + 8 sections)
- ✅ Use Explorer API or CDN for images (NOT hardcode Unsplash)
- ❌ Do NOT skip STEP 2.5 (seed verification)
- ❌ Do NOT skip STEP 3 (image gen) — critical for SEO
- ❌ Do NOT build model/engine UI manually (STEP 6.5)

### Frontend
- ✅ Use `brand-blue` color consistently
- ✅ Use `GradientMesh` for animated backgrounds
- ✅ Import animations from `SectionAnimations.tsx`
- ✅ Import visuals from `ProHeroVisuals.tsx`
- ✅ Use `usePageMeta` for SEO on product landing pages
- ❌ Do NOT hardcode Unsplash URLs (except fallback)
- ❌ Do NOT create custom button/card styles (use HoverCard)
- ❌ Do NOT skip `ShowcaseSection` in landing pages

---

## 🔗 QUICK LINKS BY TASK

| Task | Main File | Alternative | Docs |
|------|-----------|-------------|------|
| Add new product | `.agents/workflows/add_new_product.md` | — | STEP 0-9 workflow |
| Implement video creation | `AIVideoGeneratorWorkspace.tsx` | `TextToVideoWorkspace.tsx` | `VIDEO_CREATION_DETAILED.md` |
| Understand job polling | `QUICK_REFERENCE.md` | `JOB_POLLING_PATTERN_ANALYSIS.md` | Start here for 5 min |
| Build landing page | `pages/videos/AIVideoGenerator.tsx` | STEP 4-5 in workflow | `.agents/workflows/add_new_product.md` |
| Create workspace | `SocialBannerWorkspace.tsx` | `AIVideoGeneratorWorkspace.tsx` | STEP 6 in workflow |
| Configure AI engine | `VideoModelEngineSettings.tsx` | — | STEP 6.5 in workflow |
| Understand frontend | `.agents/skills/skyverses_ui_pages/SKILL.md` | — | Section 1-3 |
| Debug polling | `JOB_POLLING_PATTERN_ANALYSIS.md` | — | Line numbers + common mistakes |
| Add AI suggestions | `AISuggestPanel.tsx` | — | STEP 6 in workflow |
| Create landing sections | `components/landing/video-generator/` | STEP 4 | STEP 3.6 examples |

---

## 📞 FAQ

**Q: Where's the video generation entry point?**
A: `pages/videos/AIVideoGenerator.tsx` → imports `AIVideoGeneratorWorkspace.tsx`

**Q: How's the job polling implemented?**
A: `AIVideoGeneratorWorkspace.tsx` lines 305-344 (`pollVideoJobStatus`), triggered from line 439

**Q: When do I deduct credits?**
A: Line 438: `if (!isAutoRetry) useCredits(task.cost);` — AFTER successful API call, NOT before

**Q: Where do I find the "Add New Product" workflow?**
A: `.agents/workflows/add_new_product.md` — 9-step complete process

**Q: Can I see the complete video generation flow?**
A: `VIDEO_CREATION_DETAILED.md` — STEP 1-3 with code examples

**Q: What files do I need to read first?**
A: 1. `SKYVERSES_CODEBASE_ANALYSIS.md` 2. `QUICK_REFERENCE.md` 3. `VIDEO_CREATION_DETAILED.md`

**Q: Where's the reference workspace I should copy?**
A: `SocialBannerWorkspace.tsx` (newest) or `AIVideoGeneratorWorkspace.tsx` (comprehensive)

---

## 🎯 NEXT STEPS

1. ✅ Read `SKYVERSES_CODEBASE_ANALYSIS.md`
2. ✅ Read `QUICK_REFERENCE.md` (5 min)
3. ✅ Bookmark `.agents/workflows/add_new_product.md`
4. ✅ Study `VIDEO_CREATION_DETAILED.md` when implementing
5. ✅ Use `JOB_POLLING_PATTERN_ANALYSIS.md` for debugging

---

**Last updated:** 2026-04-09
**By:** Claude Code Exploration
**Confidence:** High (deep codebase analysis)
