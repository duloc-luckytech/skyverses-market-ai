---
name: skyverses_ui_pages
description: >
  Frontend UI architecture for Skyverses Market AI.
  Read this when working on the homepage (MarketPage), markets browsing page (MarketsPage),
  product cards, filters, or any frontend page component. Covers sections layout,
  state management, HomeBlock CMS system, filter logic, and full product catalog.
---

# Skyverses UI Pages — Frontend Architecture Reference

## 1. HOMEPAGE (MarketPage.tsx — 103KB, route: `/`)

### Sections (top → bottom):
1. **Hero** — H1 title (i18n), gradient animated headline, 2 CTAs, animated stats (30+ products / 50+ models / 1000+ users)
2. **Featured Showcase** — Desktop: 1 spotlight card + 3 side cards auto-rotating every 5s. Mobile: horizontal snap scroll
3. **AI Models Marquee** — `<AIModelsMarquee />` scrolling ticker of supported AI model logos
4. **Trust Pillars** — 5 stats: 0.5s response, ~70% save, 100% secure, 4+ languages, 50+ models
5. **How It Works** — 3 steps (Step 01: Choose, Step 02: Input, Step 03: Get Result) with images from `/assets/homepage/hiw-*.webp`
6. **Product Grid** — `homeBlocks` from CMS → each block rendered as horizontal scroll sections
7. **Use Cases by Industry** — Marketing, E-commerce, Education, Real Estate, Fashion, Healthcare
8. **(More sections at bottom)** — Industry CTAs, stats counter, final CTA banner

### Key State & Logic:
```typescript
const [solutions, setSolutions] = useState<Solution[]>([]);        // all products
const [featuredSolutions, setFeaturedSolutions] = useState<[]>();  // random featured (GET /market/featured)
const [homeBlocks, setHomeBlocks] = useState<HomeBlock[]>([]);      // CMS-controlled sections
const [favorites, setFavorites] = useState<string[]>([]);          // localStorage: skyverses_favorites
const [featuredIdx, setFeaturedIdx] = useState(0);                 // auto-rotates every 5s
const { query, primary, secondary } = useSearch();                 // SearchContext
```

### Data Loading:
```typescript
// Init: load homeBlocks from /config + featured from /market/featured (parallel)
// Then: load all solutions from /market with { q, category, lang } params
// Search debounce: 500ms when query changes
// Prefetch SolutionDetail chunk on hover (requestIdleCallback pattern)
```

### HomeBlock System (CMS-Driven):
- Stored in `SystemSetting { key: "marketHomeBlock" }` or `MarketItem.homeBlocks[]`
- Each block: `{ key, title: LocalizedString, subtitle: LocalizedString, order, limit }`
- Block keys + icons: `top_trending` (Flame), `video_studio` (Video), `image_studio` (ImageIcon), `ai_agents` (Workflow), `festivals` (Gift), `others` (LayoutGrid)
- **Only `top_trending` block shows when no search query active** — other blocks hidden during search

### SolutionCard Component (`components/market/SolutionCard.tsx`):
- Displays: image, name (localized), category badge, `isFree` or `priceCredits`, fake stats
- Hover: prefetch SolutionDetail page chunk
- Click: if not authenticated → redirect `/login`, else → `/product/:slug`
- Favorites: toggled locally in localStorage key `skyverses_favorites`

### Background & Design:
```css
/* Page background */
bg-[#fcfcfd] dark:bg-[#030304]

/* Background decorations (static, no animation): */
- Brand-blue blob top right: bg-brand-blue/[0.04] rounded-full blur-[80px]
- Purple blob bottom left: bg-purple-500/[0.03] blur-[60px]
- Subtle aurora: bg-gradient-to-r from-transparent via-brand-blue/[0.04] to-transparent
- Grid overlay: linear-gradient rgba(0,144,255,0.3) on 80px grid, opacity ~2%
```

---

## 2. MARKETS PAGE (MarketsPage.tsx — 57KB, route: `/markets`)

Full browsing experience with sidebar filters + grid/list view.

### Layout: 2-column
- **Left sidebar**: `w-[260px]` sticky, hidden on mobile (drawer instead)
- **Right content**: flex-1, product grid or list

### Sidebar Filters:
| Filter | Options |
|--------|---------|
| Search | Text (⌘K shortcut focuses input) |
| Categories | ALL, Video, Image, Audio, Music, Automation, 3D |
| Complexity | Standard, Advanced, Enterprise |
| Platform | ALL, Web App, Mobile iOS, Android, Extension |
| Tags | Dynamic from all solutions |
| Toggles | Free Only, Featured Only |

### Advanced Features:
- **URL-synced filters**: all filter state lives in URLSearchParams (`?q=&category=&sort=&free=&tags=`) — shareable links
- **Grid/List toggle**: keyboard shortcut `G`, stored in `?view=list`
- **Quick Preview Modal**: Eye icon on hover → full product modal without navigating
- **Compare Panel**: Add up to 3 products → sticky bottom bar with side-by-side view
- **Recently Viewed**: localStorage `skyverses_recently_viewed` (max 5), shown at top of results
- **Trending Slider**: horizontal snap scrollable featured strip at top
- **Animated Counters**: total / free / featured count up on mount (RAF animation)
- **Infinite Scroll**: `visibleCount` starts at 12, +12 on "Load More"
- **Keyboard shortcuts**: `⌘K` = focus search, `G` = toggle grid/list

### Filter Logic (client-side, instant):
```typescript
filteredSolutions = solutions.filter(sol =>
  matchSearch &&      // name + description + tags (currentLang)
  matchCategory &&    // category[lang] OR tags OR demoType
  matchFree &&        // sol.isFree
  matchFeatured &&    // sol.featured
  matchComplexity &&  // sol.complexity === activeComplexity
  matchTags &&        // ALL activeTags must be in sol.tags
  matchPlatform       // sol.platforms includes activePlatform (or empty platforms = all)
)
// Sort: popular (default) | newest (array reversed) | name A-Z (localeCompare)
```

### Fake Stats (deterministic, hash-based):
```typescript
const getStats = (id: string) => {
  const h = id.split('').reduce((a, c) => a + c.charCodeAt(0), 0);
  return { users: h%900+100, likes: h%400+30, rating: (3.5 + (h%15)/10).toFixed(1) };
};
// Same product ID → always same "stats" — consistent across renders, NOT real data
```

### Product Card Variants:
- `ProductCardGrid` — thumbnail 160px, name + description + tags + fake stats
- `ProductCardList` — thumbnail 180px wide left strip, full info right, comparison support

### Mobile Sidebar:
- Hidden on `< lg` — replaced by `SlidersHorizontal` button → sliding drawer overlay

---

## 3. PRODUCT CATALOG (Known product slugs)

Route pattern: `/product/:slug`

```
video-animate-ai      → AI Video Animation Studio
image-upscale-ai      → AI Image Upscale
image-generator-ai    → AI Image Generator
video-generator-ai    → AI Video Generator
product-image-ai      → AI Product Image
image-restoration-ai  → AI Image Restoration
ai-music-generator    → AI Music Generator
text-to-speech        → Text to Speech AI
qwen-chat-ai          → Qwen Chat AI
background-removal-ai → Background Removal AI
studio-architect      → Studio Architect
ai-agent-workflow     → AI Agent Workflow
voice-design-ai       → Voice Design AI
poster-marketing-ai   → Poster Marketing AI
```

**Categories**: `Video` | `Image` | `Audio` | `Music` | `Automation` | `3D`
**demoType values**: `text_to_image` | `image` | `video` | `automation`
**Complexity levels**: `Standard` | `Advanced` | `Enterprise`
**Platform values**: `web` | `ios` | `android` | `extension`

> ⚠️ **Route ordering critical**: In `App.tsx`, specific slug routes like `/product/ai-image-generator` MUST be registered BEFORE the generic `/product/:slug` catch-all.

---

## 4. SHARED FE PATTERNS

### Navigation on Product Click:
```typescript
const handleNavigate = (slug: string) => {
  if (!isAuthenticated) navigate('/login');   // redirect to login first
  else navigate(`/product/${slug}`);
};
```

### Favorites (localStorage):
```typescript
localStorage.getItem('skyverses_favorites')  // string[] of sol.id
// Toggle: add/remove id, immediately persist to localStorage
```

### Recently Viewed (localStorage):
```typescript
localStorage.getItem('skyverses_recently_viewed')  // max 5 items
// Each: { id, slug, name, imageUrl, category }
// New views prepended, oldest dropped when > 5
```

### Prefetch on Hover:
```typescript
// Prefetch SolutionDetail page chunk on card hover to enable instant navigation
import('../pages/SolutionDetail').catch(() => {});
// Tracked via Set to avoid duplicate imports
```

### SEO on Each Page (`usePageMeta` hook):
```typescript
usePageMeta({
  title: '...',
  description: '...',
  keywords: '...',
  canonical: '/',
  jsonLd: { '@type': 'ItemList', ... }
})
// Sets <title>, <meta description>, <link canonical>, <script type="application/ld+json">
```

---

## 5. PRO LANDING PAGE SYSTEM

### Shared Components (components/landing/_shared/)

**SectionAnimations.tsx** — Animation primitives (import in ALL sections):
```tsx
import {
  FadeInUp,            // scroll-triggered fade + slide up
  FadeInScale,         // scroll-triggered fade + scale
  StaggerChildren,     // wraps children, staggers their entrance
  ParallaxSection,     // subtle parallax depth on scroll
  CountUp,             // animated number counter
  GradientMesh,        // animated brand-blue/indigo blob background
  SectionLabel,        // uppercase section label pill (brand-blue)
  HoverCard,           // card with hover lift + blue glow border
  TimelineConnector,   // animated SVG line between workflow steps
} from '../_shared/SectionAnimations';
```

**ProHeroVisuals.tsx** — Visual templates for HeroSection right column:
```tsx
import {
  ImageMasonryGrid,    // masonry grid fetching from Explorer API
  BeforeAfterSlider,   // drag-to-reveal before/after comparison
  VideoReelGrid,       // bento grid of video thumbnails
  ShowcaseImageStrip,  // two-row auto-scrolling marquee strip
  FloatingBadge,       // animated stats badge overlay
  AIBadge,             // "AI Generated" sparkle badge (top-right)
} from '../_shared/ProHeroVisuals';
```

### Hero Visual Selection Guide:
| Product type | Visual component |
|-------------|-----------------|
| Image/Poster generator | `<ImageMasonryGrid type="image" />` |
| Video generator/animate | `<VideoReelGrid fetchFromExplorer />` |
| Background removal / restoration / upscale | `<BeforeAfterSlider beforeSrc afterSrc />` |
| Social banner / marketing content | Custom platform mockup grid |

### Section Structure (5 files per product):
```
components/landing/<slug>/
  HeroSection.tsx        — GradientMesh + ProHeroVisuals + FadeInUp left col
  WorkflowSection.tsx    — StaggerChildren + HoverCard + TimelineConnector
  ShowcaseSection.tsx    — ShowcaseImageStrip (always include this section)
  FeaturesSection.tsx    — Bento grid (1-2 featured col-span-2 + rest col-span-1)
  FinalCTA.tsx           — Animated CTA button
```

### Thin Orchestrator Pattern (pages/images/YourProductAI.tsx):
```tsx
// 5 sections in order:
<HeroSection onStartStudio={() => setIsStudioOpen(true)} />
<WorkflowSection />
<ShowcaseSection />    // ← always add between Workflow and Features
<FeaturesSection />
<FinalCTA onStartStudio={() => setIsStudioOpen(true)} />
```

---

## 6. AI SUGGEST WORKSPACE PANEL

**AISuggestPanel.tsx** (components/workspace/AISuggestPanel.tsx):

A collapsible AI-powered panel to add above the prompt textarea in any workspace.
Powered by Gemini (`generateDemoText`) — same key pool as image generation.

```tsx
import AISuggestPanel, { StylePreset, DEFAULT_STYLES } from './workspace/AISuggestPanel';

// Usage in any workspace sidebar, above prompt textarea:
<AISuggestPanel
  productSlug="poster-marketing-ai"
  productName="Poster Marketing AI"
  styles={PRODUCT_STYLES}       // optional: override DEFAULT_STYLES
  onPromptSelect={(p) => setPrompt(prev => p + prev)}
  onApply={(cfg) => {
    if (cfg.prompt) setPrompt(cfg.prompt);
    if (cfg.style)  setActiveStyle(cfg.style);
  }}
  historyKey={STORAGE_KEY}      // localStorage vault key for Templates tab
  featuredTemplates={[          // optional: hardcoded starter templates
    { label: 'Promo Sale', prompt: '...', style: 'Bold & Pop' },
  ]}
  productContext="Brief description for Gemini to understand the product"
/>
```

**4 Tabs:**
| Tab | Description |
|-----|-------------|
| Prompt Ideas | Gemini generates 6 contextual prompts on mount, refresh button |
| Style Presets | 6 style cards, click = prefix added to prompt |
| Templates | User history grid (from vault) + featured templates |
| Smart Fill | "Điền thông minh" button → Gemini fills all workspace fields at once |

**State persistence:** Panel open/close state → `localStorage skyverses_{slug}_suggest_panel_open`
