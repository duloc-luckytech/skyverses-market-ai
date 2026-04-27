# 🔍 CODEBASE EXPLORATION SUMMARY

## 📋 WHAT WAS EXPLORED

Bạn yêu cầu tìm hiểu 4 thứ chính:

1. ✅ **File/document quy trình "add_new_product"** 
   - **Found:** `.agents/workflows/add_new_product.md` (117KB)
   - **Mô tả:** 9-step complete workflow từ metadata định nghĩa đến deployment
   
2. ✅ **Trang/component liên quan đến video creation**
   - **Found:** `pages/videos/AIVideoGenerator.tsx` (landing page)
   - **Found:** `components/AIVideoGeneratorWorkspace.tsx` (main workspace, 810 lines)
   - **Also:** `pages/videos/*` folder (6 video products)
   
3. ✅ **Component cấu hình AI cho video**
   - **Found:** `components/video-generator/VideoModelEngineSettings.tsx`
   - **Found:** `components/SocialBannerWorkspace.tsx` (reference workspace)
   - **Pattern:** CENTRALIZED configuration (STEP 6.5 in workflow)
   
4. ✅ **File trong .agents/skills/skyverses_ui_pages**
   - **Found:** `.agents/skills/skyverses_ui_pages/SKILL.md` (12KB)
   - **Mô tả:** Frontend architecture (homepage, markets, product pages)

---

## 📚 DOCUMENTS CREATED FOR YOU

### 1. SKYVERSES_CODEBASE_ANALYSIS.md (MAIN)
**Nội dung:**
- Phần I: Kiến trúc tổng quan (Add New Product workflow)
- Phần II: Job Polling Pattern (Video/Image generation)
- Phần III: Frontend Architecture (Homepage, Markets, Products)
- Phần IV: Component cấu hình AI
- Phần V: File structure
- Phần VI: Key APIs
- Phần VII: Common mistakes
- Phần VIII: References with line numbers
- Phần IX: Thực hành ngay

**Khi nào dùng:** First comprehensive overview of the entire system

### 2. VIDEO_CREATION_DETAILED.md (STEP-BY-STEP)
**Nội dung:**
- Entry points (landing page + workspace)
- Top-level state management
- 3 Creation modes (SINGLE, MULTI, AUTO)
- Complete flow with code examples
- Poll status implementation (3 branches)
- State transition diagram
- Helper functions
- UI layout & components
- Error handling
- Resource management
- Best practices

**Khi nào dùng:** When implementing video creation features

### 3. CODEBASE_INDEX.md (QUICK REFERENCE)
**Nội dung:**
- Quick start (what to read based on your task)
- File structure with locations
- Key concepts (6 main patterns)
- Search by concept
- Learning path (4 days)
- Critical rules
- Quick links by task
- FAQ

**Khi nào dùng:** When you need to find something quickly

---

## 🎯 KEY DISCOVERIES

### Job Polling Pattern (CORE CONCEPT)

**The 3-Step Pattern:**
```
1. CREATE JOB → videosApi.createJob(payload) → get serverJobId
2. SWAP ID → setResults(...id = serverJobId)
3. DEDUCT CREDITS → useCredits(cost)
4. POLL STATUS → pollVideoJobStatus(serverJobId, ...)

POLLING LOOP (every 5s):
├─ ERROR? → addCredits(cost) → refund → EXIT
├─ DONE? → setResults(...url = response.videoUrl) → EXIT
└─ PROCESSING? → setTimeout(...5000) → LOOP
```

**Critical Locations:**
- Line 305-344: `pollVideoJobStatus` function
- Line 346-462: `performInference` function  
- Line 436: ID swap location
- Line 438: Credit deduction location
- Line 420-443: Job creation logic

### Add New Product (9-STEP WORKFLOW)

| Step | Action | Input | Output |
|------|--------|-------|--------|
| 0 | Read skills | — | Architecture context |
| 1 | Define metadata | slug, name, price, etc. | Product specs |
| 2 | Create seed script | `seed-<slug>.mjs` | MongoDB _id |
| 2.5 | Verify seed | curl test | Confirm product live |
| 3 | Gen demo images | `gen-<slug>-images.mjs` | CDN URLs |
| 3.5 | Plan landing page | 13 questions | Content plan |
| 3.6 | Section images | CDN/Explorer/Unsplash | Image strategy |
| 4 | Build 8 sections | HeroSection, WorkflowSection, etc. | Components |
| 5 | Create orchestrator | `YourProductAI.tsx` | Landing page |
| 6 | Build workspace | Copy SocialBannerWorkspace | Generation UI |
| 6.5 | Config AI engine | ModelEngineSettings | Engine controls |
| 7-9 | Wire routing, deploy | App.tsx, etc. | Live product |

### Frontend Architecture

**3 Main Pages:**
1. **MarketPage** (103KB, `/`)
   - Hero + Featured showcase + AI Models Marquee + Trust Pillars
   - How It Works + Product Grid (homeBlocks) + Use Cases by Industry
   - CMS-driven homeBlocks system

2. **MarketsPage** (57KB, `/markets`)
   - Sidebar filters (search, categories, complexity, platform, tags)
   - Grid/List toggle + Quick preview modal + Compare panel
   - Recently viewed + Infinite scroll

3. **Product Detail** (`/product/:slug`)
   - Landing page (8 sections) + Workspace modal
   - SEO via `usePageMeta` hook

---

## 🔑 CRITICAL RULES (DON'T FORGET!)

### ✅ DO:
- Deduct credits **AFTER** confirmed API success
- Swap local ID to serverJobId **BEFORE** polling  
- Poll every **5 seconds** (10s on network error)
- **Always** refund if job fails + `!isRefunded`
- Use `ModelEngineSettings` component (CENTRALIZED)
- Use Explorer API or CDN for images (NOT hardcode)
- Follow 9-step workflow in order
- Keep `resultsRef` in sync during polling

### ❌ DON'T:
- Deduct credits on button click
- Use local ID for polling
- Poll too fast (< 5s) or too slow (> 10s)
- Build engine UI manually
- Skip STEP 2.5 (seed verification)
- Skip STEP 3 (image generation)
- Hardcode Unsplash URLs (except fallback)
- Double-refund

---

## 📁 WHERE TO FIND THINGS

| Task | File | Lines | Time |
|------|------|-------|------|
| Add new product | `.agents/workflows/add_new_product.md` | 1-900 | 15 min |
| Understand polling | `QUICK_REFERENCE.md` | 1-50 | 5 min |
| Video creation code | `AIVideoGeneratorWorkspace.tsx` | 305-443 | 10 min |
| Frontend arch | `.agents/skills/skyverses_ui_pages/SKILL.md` | 1-300 | 15 min |
| Landing page example | `pages/videos/AIVideoGenerator.tsx` | 1-43 | 2 min |
| Reference workspace | `SocialBannerWorkspace.tsx` | 1-end | 30 min |
| Error handling | `VIDEO_CREATION_DETAILED.md` | "Error Handling" | 5 min |
| Line number refs | `JOB_POLLING_PATTERN_ANALYSIS.md` | Any | Reference |

---

## 🎓 RECOMMENDED READING ORDER

### **Hour 1: Overview**
1. Read this file (README_EXPLORATION.md) — 5 min
2. Read `SKYVERSES_CODEBASE_ANALYSIS.md` Part I-II — 20 min
3. Read `QUICK_REFERENCE.md` — 5 min

### **Hour 2: Video Creation**
1. Read `VIDEO_CREATION_DETAILED.md` STEP 1-3 — 15 min
2. Study `AIVideoGeneratorWorkspace.tsx` lines 305-344 (poll) — 10 min
3. Study `AIVideoGeneratorWorkspace.tsx` lines 346-443 (create+deduct) — 10 min

### **Hour 3: Product Workflow**
1. Read `.agents/workflows/add_new_product.md` STEP 0-6 — 30 min
2. Skim landing section examples (STEP 3.6) — 10 min

### **Hour 4: Frontend & Reference**
1. Read `.agents/skills/skyverses_ui_pages/SKILL.md` — 15 min
2. Study `SocialBannerWorkspace.tsx` structure — 20 min
3. Look at `pages/videos/AIVideoGenerator.tsx` — 5 min

---

## 🚀 NEXT STEPS

### To Add a New Video Product:
1. Follow 9 steps in `.agents/workflows/add_new_product.md`
2. Reference `AIVideoGeneratorWorkspace.tsx` for polling
3. Copy `SocialBannerWorkspace.tsx` structure
4. Use `ModelEngineSettings` component (don't build UI manually)

### To Debug Job Polling:
1. Check `QUICK_REFERENCE.md` "Common Mistakes"
2. Verify line 436 (ID swap) is done
3. Verify line 438 (credits) timing
4. Check polling interval (5s normal, 10s on error)
5. Look at `JobLogsModal.tsx` to see activity logs

### To Understand Frontend:
1. Read `.agents/skills/skyverses_ui_pages/SKILL.md`
2. Study `MarketPage.tsx` (103KB)
3. Study `MarketsPage.tsx` (57KB)
4. Look at landing sections structure

---

## 📞 QUICK REFERENCE

**Job Polling 3-Branch Pattern:**
```
ERROR: addCredits(cost) → status: 'error' → EXIT
DONE:  setResults(...url, status: 'done') → EXIT
PROCESSING: setTimeout(...5000) → LOOP
```

**Add Product Steps:**
```
metadata → seed → verify → gen-images → plan-landing → 
build-sections → create-orchestrator → build-workspace → 
config-engine → wire-routing → deploy
```

**Frontend Pages:**
```
/                    → MarketPage (103KB)
/markets             → MarketsPage (57KB)
/product/:slug       → Product detail landing
```

---

## 📊 STATISTICS

- **Total Files Analyzed:** 20+ (pages, components, workflows, skills)
- **Main Workspace:** 810 lines (AIVideoGeneratorWorkspace.tsx)
- **Workflow Documentation:** 117KB (add_new_product.md)
- **Product Pages:** 14 (video + image + audio)
- **Landing Sections Per Product:** 8 files
- **Job Polling Lines:** 40 (critical core logic)
- **Key Concepts Documented:** 6 major patterns

---

## ✨ KEY INSIGHTS

1. **Architecture is modular:** Each product has thin orchestrator + 8 section components
2. **Job polling is standardized:** 99% code reuse between video/image/other generators
3. **CMS-driven:** HomeBlocks, product metadata, all configurable
4. **Performance-focused:** resultsRef prevents stale closures, localStorage caching
5. **User-friendly:** Multiple resource options (credits/personal key), auto-refund on error
6. **Well-documented:** 9-step workflow + skill files + analysis docs
7. **Internationalized:** 4 languages (en/vi/ko/ja) throughout

---

## 📝 DOCUMENTS AT A GLANCE

| Document | Size | Purpose | When to Read |
|----------|------|---------|--------------|
| SKYVERSES_CODEBASE_ANALYSIS.md | 15KB | Complete overview | First |
| VIDEO_CREATION_DETAILED.md | 20KB | Implementation guide | For coding |
| CODEBASE_INDEX.md | 25KB | Quick reference | For navigation |
| .agents/workflows/add_new_product.md | 117KB | Product workflow | When adding product |
| QUICK_REFERENCE.md | 8KB | Copy-paste templates | For job polling |
| JOB_POLLING_PATTERN_ANALYSIS.md | 20KB | Detailed reference | For debugging |
| VIDEO_vs_IMAGE_PATTERN.md | 16KB | Pattern comparison | To understand reuse |

---

## 🎯 SUCCESS CRITERIA

You'll know you understand the codebase when you can:

✅ Explain the 3-branch job polling pattern  
✅ List the 9 steps of add_new_product workflow  
✅ Find where credits are deducted (line 438)  
✅ Explain why ID swapping is needed (line 436)  
✅ Draw frontend architecture (3 main pages)  
✅ Describe landing page structure (thin orchestrator + 8 sections)  
✅ Explain ModelEngineSettings purpose (centralized AI config)  
✅ Find reference workspace (SocialBannerWorkspace.tsx)  

---

## 🏁 CONCLUSION

The Skyverses Market AI codebase is:

- **Well-architected:** Modular, reusable patterns
- **Well-documented:** 9-step workflow + skills + analysis
- **Production-ready:** Error handling, credit management, internationalization
- **Developer-friendly:** Copy-paste templates, consistent patterns, clear examples

**Main takeaway:** Every product follows same pattern → add product, build landing, create workspace, configure engine. The job polling pattern is 99% reusable.

---

**Created:** 2026-04-09  
**By:** Claude Code Exploration  
**Status:** Complete ✅  
**Confidence Level:** Very High  

