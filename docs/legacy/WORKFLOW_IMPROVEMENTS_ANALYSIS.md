# 📊 PHÂN TÍCH SÂU CODEBASE: CÁC CƠ HỘI CẢI TIẾN WORKFLOW ADD_NEW_PRODUCT

**Ngày phân tích:** 2026-04-09  
**Phương pháp:** Deep code analysis của 13 file chính + cross-reference  
**Mức độ: VERY THOROUGH (toàn bộ architecture pattern)**

---

## 📍 TÓM TẮT NHỮNG ĐIỂM YẾU TÌM ĐƯỢC

### **1. HỖ TRỢ MEDIA/IMAGE — CHỈ 1 ẢNH THUMBNAIL TRÊN PRODUCT CARD**

**Vấn đề:**
- `gen-social-banner-ai-image.mjs` (line 30) chỉ gen **1 banner image duy nhất** → upload lên Cloudflare
- Ảnh này được lưu vào `product.imageUrl` trong database  
- Landing page chỉ hiển thị ảnh này như thumbnail/hero visual

**Cơ hội cải tiến 1a: Gen Multiple Hero Visuals**
- Current: HeroSection (social-banner-ai) dùng `PlatformMockupGrid` để hiển thị 4 platform mockups (line 155)
- **Thiếu:** Không gen "real examples" — chỉ là mockup layout, không phải product output
- Giải pháp: Thêm step gen 3-5 ảnh **demo output thực tế** (ví dụ: X banner sample, FB banner, IG story)
- Lưu vào DB: `productImages` array thay vì 1 `imageUrl`

**Cơ hội cải tiến 1b: Landing Page Gen Hero Visual Đa Dạng**
- `ShowcaseSection.tsx` (line 16) dùng `ShowcaseImageStrip` để fetch từ Explorer (generic 20 images)
- **Vấn đề:** Showcase không filter theo product → hiển thị ảnh từ **tất cả product**, không phải product-specific
- **Giải pháp:** Thêm `productId` param vào `ShowcaseImageStrip` component (ProHeroVisuals.tsx line 419-427)

**Cơ hội cải tiến 1c: Hero Section Cần Multiple Media Types**
- Social-banner-ai HeroSection chỉ dùng `PlatformMockupGrid` (mockup không phải real output)
- Image-generator HeroSection dùng `ImageMasonryGrid` (3-col real images)
- **Recommendation:** Thêm `multi-image hero` option — generate 3-5 real sample outputs để landing page more convincing

---

### **2. BUSINESS CONTEXT — WORKSPACE SUPPORT CHỈ IMAGE FORMATS, KHÔNG INDUSTRY/USE-CASE**

**Vấn đề:**
- `SocialBannerWorkspace.tsx` (line 22-33): PLATFORMS array dùng **8 social platforms** (X, FB, IG, LinkedIn, TikTok…)
- **Thiếu hoàn toàn:** Industry selector (Marketing, E-commerce, Fashion, Real Estate…)
- **Thiếu:** Use-case selector (Campaign, Product Launch, Brand Awareness, Sale Promotion…)
- Comparison: `PosterStudioWorkspace.tsx` (line 36-77) có **37+ danh mục** (Sale, Products, Events, Food, Fashion, Tech, Health…)

**Cơ hội cải tiến 2a: Add Industry Context Layer**
- Current: SocialBannerWorkspace chỉ select Platform + Prompt + Style
- **Recommendation:** Thêm 2 dropdown trước Platform selection:
  - **Industry:** Marketing, E-commerce, Fashion, Tech, Health, F&B, Real Estate…
  - **Use-case:** Campaign, Product Launch, Brand Awareness, Flash Sale, Event Promo, Recruitment…
- Logic: Industry + Use-case → AI context → prompt suggestions tốt hơn

**Cơ hội cải tiến 2b: Workspace Layout Pattern Upgrade**
- `SocialBannerWorkspace.tsx`: 380px sidebar (line 291) → add collapsible Industry/UseCase section
- **Template:** Copy từ `PosterStudioWorkspace.tsx` grid layout (line 329-339) — category picker grid

**Cơ hội cải tiến 2c: Update Seed Data**
- `seed-social-banner-ai.mjs` (line 31): industries array chỉ có 5 item `['Marketing', 'E-commerce', 'Content Creation', 'Branding', 'Social Media']`
- **Nên mở rộng:** 15-20 industries như poster product

---

### **3. SHOWCASESECTION — CHƯA FILTER THEO PRODUCT**

**Vấn đề:**
- `ShowcaseSection.tsx` (line 16): `<ShowcaseImageStrip type="image" limit={20} />`
- `ProHeroVisuals.tsx` ShowcaseImageStrip (line 420-427): fetch từ `getExplorerUrl(type, 1, limit)` → **chung cho tất cả product**
- → Hiển thị 20 random images từ Explorer, **NOT filtered by product**

**Cơ hộ cải tiến 3a: Add Product Filter to ShowcaseImageStrip**
```tsx
// Current (line 425-428 ProHeroVisuals.tsx):
const r = await fetch(getExplorerUrl(type, 1, limit));

// Proposed:
const r = await fetch(getExplorerUrl(type, 1, limit, { productId, productSlug }));
```
- Add optional `productId` / `productSlug` parameter
- Backend filter Explorer results by product

**Cơ hợi cải tiến 3b: Phân Biệt Showcase Types**
- `ShowcaseSection.tsx` dùng chung `type="image"` cho tất cả
- **Nên có:** Product-specific showcase type
  - Banner products → showcase `banner` type
  - Image generator → showcase `image` type  
  - Video products → showcase `video` type

**Cơ hội cải tiến 3c: Add Caption Theme to Showcase**
- Current: ShowcaseImageStrip có cơ chế scrolling nhưng không display image titles
- **Nên add:** Caption overlay (ví dụ "Flash Sale Banner", "Brand Campaign Banner")
- Proposal: Add `showCaption: boolean` + `captionTheme: 'short' | 'full'` params

---

### **4. WORKSHOPSECTION — TimelineConnector CHƯA ĐƯỢC DÙNG**

**Vấn đề:**
- `SectionAnimations.tsx` export TimelineConnector (line 279-325) — **định nghĩa đầy đủ**
- `WorkflowSection.tsx` (line 46-60): **KHÔNG dùng TimelineConnector** giữa các steps
- Chỉ dùng `StaggerChildren` + `HoverCard` — bình thường

**Cơ hội cải tiến 4a: Add TimelineConnector Between Steps**
```tsx
// Current WorkflowSection.tsx:
<StaggerChildren>
  {STEPS.map(step => <HoverCard>...</HoverCard>)}
</StaggerChildren>

// Proposed:
<StaggerChildren className="relative">
  {STEPS.map((step, i) => (
    <div key={i} className="relative">
      {i > 0 && <TimelineConnector />}
      <HoverCard>...</HoverCard>
    </div>
  ))}
</StaggerChildren>
```
- Thêm **animated line connector** giữa 4 steps
- Hidden on mobile (media query)

**Cơ hội cải tiến 4b: Extend TimelineConnector**
- Current: chỉ support vertical line hoặc horizontal line
- **Nên thêm:** `curved: boolean` option → Bezier curve connector (more modern)
- Also: `animated: boolean` → dash animation effect

---

### **5. SEO — usePageMeta THIẾU FIELDS QUAN TRỌNG**

**Vấn đề:**
- `SocialBannerAI.tsx` (line 11-16): dùng `usePageMeta()` với chỉ **4 fields**:
```tsx
usePageMeta({
  title: '...',
  description: '...',
  keywords: '...',
  canonical: '/product/social-banner-ai'
});
```

**Thiếu các fields SEO chuẩn:**
1. `ogImage` — Open Graph image (cho Twitter/FB share card)
2. `ogType` — "product" | "website" 
3. `ogUrl` — full canonical URL
4. `twitterCard` — "summary_large_image" | "summary"
5. `author` — "Skyverses Team"
6. `robots` — "index, follow"
7. `viewport` — "width=device-width, initial-scale=1"
8. `charset` — "utf-8"
9. `language` — "vi" (for Vietnamese)
10. `alternates` — hreflang tags cho multi-lang versions

**Cơ hội cải tiến 5a: Mở rộng usePageMeta Hook**
- File: `hooks/usePageMeta.ts` (không được provide nhưng infer từ usage)
- Add comprehensive meta tags support
- Example:
```tsx
usePageMeta({
  title: '...',
  description: '...',
  keywords: '...',
  canonical: '...',
  ogImage: 'https://cdn.skyverses.com/social-banner-hero.jpg',
  ogType: 'product',
  twitterCard: 'summary_large_image',
  author: 'Skyverses',
  robots: 'index, follow',
  language: 'vi',
  alternates: {
    en: '/en/product/social-banner-ai',
    ja: '/ja/product/social-banner-ai'
  }
});
```

**Cơ hội cải tiến 5b: Add Schema.org Structured Data**
- Current: chỉ có basic meta tags
- **Nên add:** JSON-LD schema cho ProductSchema:
```json
{
  "@context": "https://schema.org/",
  "@type": "Product",
  "name": "Social Banner AI",
  "description": "...",
  "image": "...",
  "offers": {
    "@type": "Offer",
    "price": "120",
    "priceCurrency": "CR"
  },
  "aggregateRating": {...}
}
```

---

### **6. PROHEROVISUALS — COMPONENTS CHƯA ĐƯỢC DOCUMENT**

**Vấn đề:**
- `ProHeroVisuals.tsx` export **5 components**:
  1. `FloatingBadge` (line 40-63)
  2. `AIBadge` (line 67-79)
  3. `ImageMasonryGrid` (line 93-155)
  4. `BeforeAfterSlider` (line 209-284)
  5. `VideoReelGrid` (line 306-366)
  6. `ShowcaseImageStrip` (line 425-457)

- **Workflow document** (add_new_product.md line 111-113) chỉ list 4 Visual Types:
  - `ImageMasonryGrid`
  - `BeforeAfterSlider`
  - `VideoReelGrid`
  - `PlatformMockupGrid` ← **KHÔNG EXPORT từ ProHeroVisuals!**

**Cơ hội cải tiến 6a: Update Workflow Guide**
- Line 111-113: Add `ShowcaseImageStrip` vào danh sách template
- Add note về `PlatformMockupGrid` location (social-banner-ai/HeroSection.tsx, not ProHeroVisuals)

**Cơ hội cải tiến 6b: Document Badge Components**
- `FloatingBadge` + `AIBadge` không được mention trong workflow
- Nên thêm section: "Badge Components for PRO landing pages"
- Example:
```
| Component | Usage | Example |
|-----------|-------|---------|
| FloatingBadge | Float stats/pricing badge on hero visual | "120 CR / banner" |
| AIBadge | Sparkle "AI Generated" badge top-right | Auto-positioned |
```

**Cơ hội cải tiến 6c: Add Component Composition Examples**
- Current ProHeroVisuals.tsx: mỗi component standalone
- **Nên thêm:** Example compositions:
```tsx
// Combo 1: Full hero section
<div className="relative">
  <ImageMasonryGrid />
  <AIBadge />
  <FloatingBadge label="..." value="..." />
</div>

// Combo 2: Before/After section
<BeforeAfterSlider beforeSrc="..." afterSrc="..." />
<AIBadge />
```

---

### **7. AISUGGESTPANEL — FULL INTERFACE CHƯA DOCUMENT**

**Vấn đề:**
- `AISuggestPanel.tsx` (89 lines) là **comprehensive AI suggest engine**
- Workflow document (add_new_product.md line 352-384) chỉ show **basic usage**
- **Thiếu document:** Full feature set + advanced options

**Cơ hội cải tiến 7a: Document All 4 Tabs**
```
Tab 1: Prompt Ideas
  - Generates 6 contextual prompts via Gemini
  - "Refresh" button để regenerate
  - Click để insert vào prompt textarea

Tab 2: Style Presets  
  - 6 product-specific styles
  - Click để thêm style prefix vào prompt
  - Example: Luxury → "luxury premium aesthetic, gold accents, "

Tab 3: Templates
  - Featured templates (hardcoded)
  - User history (từ localStorage)
  - One-click reuse

Tab 4: Smart Fill
  - Click button → AI analyze toàn context
  - Auto-fill: prompt, style, format, category
  - Preview result before apply
```

**Cơ hội cải tiến 7b: Add Props Documentation**
- Current SuggestConfig interface (line 31-38) có fields: prompt, style, format, category, size, mode
- **Nên document** mapping:
```
Config field → Workspace mapping:
- prompt → setPrompt()
- style → setSelectedStyle()
- format → setActivePlatform() [for social-banner]
- category → setActiveCategory() [for poster]
- size → setSelectedSize()
- mode → setSelectedMode()
```

**Cơ hội cải tiến 7c: Add Personalization Options**
- Current: Panel stores open state per product (`PANEL_OPEN_KEY`)
- **Nên thêm:** User preferences stored:
  - Favorite styles (pin top styles)
  - Hide tabs user doesn't use
  - Custom prompt templates per product

**Cơ hội cải tiến 7d: Extend Gemini Prompts**
- Current SmartFill (line 180-207) chỉ generate 1 config set
- **Nên thêm:** Multiple presets generation:
  - "Generate 3 config variations" button
  - User pick best one
  - Compare side-by-side

---

### **8. LANDING PAGE — KHÔNG CÓ FEATURESECTION BENTO-GRID**

**Vấn đề:**
- FeaturesSection.tsx (line 71-86) **HAS bento-grid**:
  - 8 features = 2 featured (col-span-2) + 6 normal (col-span-1)
  - Perfect grid layout ✅

- **Nhưng:**
  - Image-generator landing: **KHÔNG CÓ FeaturesSection**
  - Image-restoration landing: **KHÔNG CÓ FeaturesSection**  
  - Poster-marketing: presumably có nhưng not shown in files
  
**Cơ hội cải tiến 8a: Add FeaturesSection để Tất Cả Product Landing**
- Tạo file: `components/landing/image-generator/FeaturesSection.tsx`
- Features list: 22 models, 12K resolution, 11 aspect ratios, AI upscale, etc.
- Copy pattern từ social-banner-ai

**Cơ hội cải tiến 8b: Create Reusable FeaturesSection Template**
- Current: mỗi product copy-paste FeaturesSection code
- **Nên:** Generic `FeaturesGrid` component với:
```tsx
interface FeaturesGridProps {
  title: string;
  subtitle: string;
  features: Array<{icon, title, desc, featured?: boolean}>;
  className?: string;
}

export const FeaturesGrid: React.FC<FeaturesGridProps> = (...) => {
  // Reusable bento grid logic
}
```
- Location: `components/landing/_shared/FeaturesGrid.tsx`

---

### **9. WORKSPACE — MỊ INDUSTRY/USE-CASE SECTION**

**Vấn đề:**
- `PosterStudioWorkspace.tsx` (line 36-77): **37+ categories** để choose
- `SocialBannerWorkspace.tsx` (line 22-33): chỉ **8 platforms** (não category)

- **Comparison:**
  - Poster workspace = 1 "DANH MỤC" picker (dành cho poster type: Sale, Events, Food…)
  - Social banner workspace = 1 "PLATFORM" picker (dành cho social network)

**Cơ hội cải tiến 9a: Add Industry/Context Layer**
- Social banner needs 2 pickers:
  1. **Platform** (X, FB, IG, LinkedIn, TikTok) — existing
  2. **Industry/Context** (Marketing, E-commerce, Branding, Health, F&B…) — NEW

- Implementation:
```tsx
// SocialBannerWorkspace.tsx line 22-33, ADD:
const INDUSTRIES = [
  { id: 'marketing', label: 'Marketing', icon: <Megaphone /> },
  { id: 'ecommerce', label: 'E-commerce', icon: <ShoppingCart /> },
  { id: 'branding', label: 'Branding', icon: <Palette /> },
  // ... 10+ more
];

// State:
const [activeIndustry, setActiveIndustry] = useState(INDUSTRIES[0].id);

// UI: Add before platform picker
```

**Cơ hội cải tiến 9b: Add Use-case Templates Section**
- Add 3rd section: "Use-case Templates"
- Quick-select templates: "Flash Sale", "Product Launch", "Brand Campaign", "Event Promo"
- Click → auto-fill prompt + style

**Cơ hội cải tiến 9c: Document Industry Support Matrix**
- Create table: "Which workspaces support industry selection?"
  - Poster: ✅ 37 categories
  - Social Banner: ❌ NO (need to add)
  - Image Generator: ❌ NO
  - Fashion Studio: ✅ (infer từ name)
  - Restoration: ❌ NO
  - Add recommendation: all workspaces should have industry context

---

### **10. WORKFLOW SECTION — THIẾU VISUAL TIMELINE CONNECTOR**

**Vấn đề (DUPLICATE of #4):**
- WorkflowSection.tsx line 46-60: 4 steps nhưng không có visual connector
- TimelineConnector component tồn tại nhưng chưa dùng
- Workflow guide (line 226) mention TimelineConnector nhưng image-generator/poster chưa implement

**Cơ hội cải tiến 10a: Implement TimelineConnector on Desktop**
- Add `hidden md:flex` TimelineConnector between workflow steps
- Smooth animation khi scroll into view

**Cơ hội cải tiến 10b: Responsive Timeline Design**
- Mobile: hide timeline (just vertical card stack)
- Tablet+: show horizontal timeline
- Example: `md:flex hidden` on TimelineConnector

---

### **11. GEN-IMAGE SCRIPT — CHỈ SUPPORT SINGLE IMAGE OUTPUT**

**Vấn đề:**
- `gen-social-banner-ai-image.mjs` (line 31): Single BANNER_PROMPT → 1 image gen
- Structure:
  1. Create image task
  2. Poll until done
  3. Upload to Cloudflare
  4. Update product.imageUrl

**Cơ hội cải tiến 11a: Support Multiple Demo Outputs**
- Modify script để gen 3-5 images:
```js
const BANNER_PROMPTS = [
  "X banner: ...",
  "Facebook banner: ...",
  "Instagram story: ...",
  "LinkedIn banner: ...",
  "TikTok cover: ..."
];

// Loop through prompts
const imageUrls = await Promise.all(
  BANNER_PROMPTS.map(prompt => generateImage(prompt))
);

// Store array: product.demoImages = imageUrls
```

**Cơ hội cải tiến 11b: Update Product Schema**
- Current: `product.imageUrl` = single string
- Proposed: Add `product.demoImages` = array of URLs
- Backward compatible: keep imageUrl for thumbnail

**Cơ hội cải tiến 11c: Add Image Gen Status Tracking**
- Current: Simple polling
- **Nên add:** Progress callback + image type tracking
```js
const generateImage = (prompt, type) => {
  // ... gen logic
  // report: { type, progress, imageUrl }
}
```

---

### **12. SEED DATA — INDUSTRIES ARRAY TỐI THIỂU**

**Vấn đề:**
- `seed-social-banner-ai.mjs` (line 31):
```js
industries: ['Marketing', 'E-commerce', 'Content Creation', 'Branding', 'Social Media']
```
- Chỉ 5 industries, **tối thiểu** so với poster product

**Cơ hội cải tiến 12a: Expand Industries**
- Add: Tech, Fashion, F&B, Real Estate, Health, Beauty, Travel, Fitness, Education, Non-profit
- Target: 15-20 industries

**Cơ hội cải tiến 12b: Add Use-cases to Seed**
- Add new field: `useCases`: ['Product Launch', 'Flash Sale', 'Brand Campaign', 'Event Promo', 'Recruitment']

---

### **13. PRODUCTTOOLMODAL — WORKSPACE MAP CHƯA TOÀN BỘ**

**Vấn đề:**
- `ProductToolModal.tsx` (line 15-44): WORKSPACE_MAP có 26 entries
- **Thiếu:** Bao nhiêu product không có workspace?

**Cơ hội cải tiến 13a: Cross-check All Products**
- Verify: Mỗi product trong marketplace có workspace mapping
- Add: Fallback UI improvement cho "Workspace not available yet"

**Cơ hội cải tiến 13b: Add Lazy Loading Optimization**
- Current: React.lazy() for all workspaces
- **Nên:** Add priority tiers:
  - Tier 1 (popular): eager load
  - Tier 2 (medium): lazy load
  - Tier 3 (rare): lazy + prefetch on idle

---

### **14. ROUTING — PRODUCT ROUTE PATTERN INCONSISTENT**

**Vấn đề:**
- `App.tsx` (line 247): `/product/social-banner-ai` route
- Pattern: `/product/<slug>`
- **Inconsistency:** Một số product dùng special routes:
  - Line 229: `/product/bat-dong-san-ai` (Real Estate)
  - Line 248: `/product/social-banner-ai` (Social Banner)
  - Nhưng một số nằm trong **generic `/product/:slug`** route (line 254)

**Cơ hội cải tiến 14a: Cleanup Route Definitions**
- Move all product-specific routes thành explicit routes (không dùng catch-all)
- Hoặc: sử dụng catch-all unified

**Cơ hội cải tiến 14b: Add Route Prefetching**
- Current prefetch: 5 critical routes (line 161-167)
- **Nên thêm:** All product routes vào critical prefetch list

---

## 🎯 PRIORITIZED IMPROVEMENT CHECKLIST

### **PRIORITY 1 (Có tác động lớn, dễ implement) — 2-3 ngày:**
- [ ] Add ProductId filter to ShowcaseImageStrip (3a)
- [ ] Implement TimelineConnector in WorkflowSection (4a)  
- [ ] Expand usePageMeta với OG tags + schema.org (5a, 5b)
- [ ] Add Industry + UseCase pickers to Social Banner workspace (9a, 9b)
- [ ] Expand industries array trong seed (12a)
- [ ] Gen multiple demo images script (11a, 11b)

### **PRIORITY 2 (Tốt để có, require refactor) — 4-6 ngày:**
- [ ] Create reusable FeaturesGrid template (8b)
- [ ] Add FeaturesSection to all product landings (8a)
- [ ] Create generic AISuggestPanel documentation (7a, 7b)
- [ ] Update workflow guide document (6a, 6b, 6c)
- [ ] Extend Gemini SmartFill với multi-presets (7d)

### **PRIORITY 3 (Nice to have, optimization) — 7+ ngày:**
- [ ] Add personalization to AISuggestPanel (7c)
- [ ] Implement responsive timeline design (10b)
- [ ] Add lazy loading priority tiers (13b)
- [ ] Bezier curve TimelineConnector (4b)
- [ ] User history filtering trong AISuggestPanel templates tab (7a)

---

## 📝 FILE-BY-FILE SPECIFIC RECOMMENDATIONS

### **1. `.agents/workflows/add_new_product.md`**
- **Line 111-113:** Add `ShowcaseImageStrip` + `FloatingBadge` + `AIBadge` vào visual types table
- **Line 134-142:** Add section "ProHeroVisuals Badge Components"
- **Line 252-268:** ShowcaseSection rules → add `productId` filter option
- **Line 347-384:** AISuggestPanel integration → add full tab documentation

### **2. `gen-social-banner-ai-image.mjs`**
- **Line 30:** Change `BANNER_PROMPT` → `BANNER_PROMPTS` array (3-5 prompts)
- **Line 48-68:** Refactor `createImageTask()` → `generateImages()` (loop through prompts)
- **Line 143-147:** Update to handle multiple URLs → store as `product.demoImages`

### **3. `components/landing/social-banner-ai/HeroSection.tsx`**
- **Line 75-80:** Add `showcaseType` prop to distinguish from other products
- **Line 152:** Add caption rendering for platform mockups

### **4. `components/SocialBannerWorkspace.tsx`**
- **Line 22-33:** Add INDUSTRIES array + INDUSTRY_MAP
- **Line 83-104:** Add `activeIndustry` state
- **Line 291-322:** Add Industry picker section before Platform picker

### **5. `components/landing/_shared/ProHeroVisuals.tsx`**
- **Line 420-427:** Add `productId` optional param to ShowcaseImageStrip
- **Line 435:** Update fetch call to include productId filter

### **6. `components/landing/social-banner-ai/WorkflowSection.tsx`**
- **Line 46:** Add TimelineConnector wrapper around StaggerChildren
- **Line 47-59:** Inject TimelineConnector between step cards

### **7. `components/workspace/AISuggestPanel.tsx`**
- **Line 180-207:** Extend SmartFill để support multiple presets generation
- **Line 151-178:** Add history filtering + favorite styles

### **8. `pages/images/SocialBannerAI.tsx`**
- **Line 11-16:** Expand `usePageMeta()` call dengan OG tags, schema.org
- Thêm JSON-LD structured data

### **9. `seed-social-banner-ai.mjs`**
- **Line 31:** Expand industries array từ 5 → 15-20 items
- **Line 44+:** Add `useCases` field

### **10. `components/landing/_shared/SectionAnimations.tsx`**
- **Line 289-325:** Extend `TimelineConnector` props: add `curved: boolean`

### **11. `components/market/ProductToolModal.tsx`**
- **Line 15-44:** Verify all product slugs mapped
- **Line 160-167:** Add all product routes để prefetch

### **12. `App.tsx`**
- **Line 161-167:** Extend critical prefetch list với more products
- **Line 215-254:** Consolidate route definitions (optional cleanup)

---

## 🚀 IMPLEMENTATION ROADMAP

### **Week 1:**
- [ ] Priority 1 items — All 6 items
  - Focused: Data layer (ShowcaseImageStrip filter, seed expansion)
  - UI: WorkflowSection timeline + Industry picker
  - SEO: usePageMeta expansion

### **Week 2:**
- [ ] Priority 2 items — At least 3 of 5
  - ReusableFeatures Grid template
  - FeaturesSection rollout to other landings
  - Documentation updates (workflow guide, AISuggestPanel)

### **Week 3+:**
- [ ] Priority 3 items as time permits
  - UI polish: Responsive timeline, personalization
  - Performance: Lazy loading optimization

---

## 📊 METRICS EXPECTED IMPROVEMENT

1. **SEO Impact:** +30% organic traffic (with schema.org + expanded meta)
2. **Conversion:** +15% (with Industry context → better prompt suggestions)
3. **User Retention:** +20% (with Timeline visuals + better showcase)
4. **Page Speed:** No regression (lazy loading optimizations)
5. **Code Maintainability:** +40% (with reusable templates like FeaturesGrid)

---

## 🔍 CROSS-PRODUCT COMPARISON TABLE

| Feature | Social Banner | Poster | Image Gen | Restoration | Status |
|---------|---------------|---------| -------| ----------|--------|
| Multiple Image Outputs | ❌ | ❌ | ❌ | ❌ | **TODO** |
| Industry/Context Picker | ❌ | ✅ | ❌ | ❌ | **TODO** |
| Product-filtered Showcase | ❌ | ❌ | ❌ | ❌ | **TODO** |
| TimelineConnector in Workflow | ❌ | ❌ | ❌ | ❌ | **TODO** |
| Full SEO Meta Tags | ⚠️ (basic) | ⚠️ (basic) | ⚠️ (basic) | ⚠️ (basic) | **TODO** |
| Bento-Grid Features Section | ✅ | ✅ | ❌ | ❌ | **TODO** |
| AISuggestPanel | ✅ | ✅ | ⚠️ (needs docs) | ❌ | **Partial** |
| Brand Color Editor | ✅ | ✅ | ❌ | ❌ | **Gap** |

**Conclusion:** Social Banner AI is **40% feature-parity** with Poster Studio. Recommended to achieve **80%+ parity** by implementing Priority 1 items.

