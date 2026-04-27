# Skyverses Marketplace Products & Categories - Complete Exploration

## Executive Summary

This document provides a thorough exploration of how the Skyverses marketplace system works, including:
- Product/Solution definitions and structure
- Category system and filtering
- The specific "storyboard-studio" product
- How MarketPage and MarketsPage display and filter products
- Routing configuration

---

## 1. Product Definition Architecture

### 1.1 Core Data Structure: `Solution` Interface

**Location:** `/types.ts` (lines 45-72)

```typescript
export interface Solution {
  _id?: string;                              // MongoDB Internal ID
  id: string;                                // Business ID (e.g., 'STORYBOARD-STUDIO')
  slug: string;                              // URL slug (e.g., 'storyboard-studio')
  name: LocalizedString;                     // Multi-language name (en, vi, ko, ja)
  category: LocalizedString;                 // Multi-language category
  description: LocalizedString;              // Multi-language description
  problems: string[];                        // Problems it solves
  industries: string[];                      // Target industries
  models?: string[];                         // AI models used (gpt3.5, midjourney, etc.)
  priceCredits?: number;                     // Credit cost
  isFree?: boolean;                          // Free or paid
  imageUrl: string;                          // Product thumbnail/hero image
  gallery?: string[];                        // Additional images
  neuralStack?: NeuralStackItem[];          // AI models with versions
  demoType: 'text' | 'image' | 'video' | 'automation';  // Demo type
  tags: string[];                            // Search tags
  features: (string | LocalizedString)[];   // Feature list
  complexity: 'Standard' | 'Advanced' | 'Enterprise';
  priceReference: string;                    // Price display text
  isActive?: boolean;                        // Visibility in marketplace (default: true)
  order?: number;                            // Display order
  featured?: boolean;                        // Featured product flag
  status?: string;                           // System status
  homeBlocks?: string[];                     // Display positions (e.g., ['video_studio', 'top_trending'])
  platforms?: string[];                      // Platforms: 'web', 'ios', 'android'
}
```

### 1.2 Backend Model: `IMarketItem`

**Location:** `/skyverses-backend/src/models/MarketItem.model.ts`

The backend MongoDB schema mirrors the Solution interface with:
- Indexed fields: `id`, `slug`, `homeBlocks`, `isActive`
- Default values: `isActive=true`, `featured=false`, `order=0`
- Timestamps: `createdAt`, `updatedAt`

---

## 2. Products Overview

### 2.1 Product Information Sources

Products are managed through:

1. **Backend Database (MongoDB)** - Primary source via `/market` API
2. **Frontend Types** - Defined in `/types.ts`
3. **Seed Scripts** - `/seed-products.mjs` (used for initial data)
4. **Update Scripts** - `/update-product-images.mjs` (for image generation)

### 2.2 Known Products

From data.ts and backend routes, the marketplace includes products like:

- `background-removal-ai` - Enhancement category
- `ai-agent-workflow` - Automation category
- `ai-image-generator` - Image Studio
- `ai-video-generator` - Video Studio
- `qwen-chat-ai` - Chat/Automation
- `voice-design-ai` - Audio
- `ai-music-generator` - Audio/Music
- `poster-marketing-ai` - Image/Marketing
- `image-upscale-ai` - Enhancement
- `fibus-video-studio` - Video Studio
- **`storyboard-studio`** - Video Studio (detailed below)
- Many others...

---

## 3. The "Storyboard Studio" Product - Complete Analysis

### 3.1 Product Definition

**ID:** `STORYBOARD-STUDIO` (or similar)
**Slug:** `storyboard-studio`
**Route:** `/product/storyboard-studio`
**Component:** `StoryboardStudioPage` (lazy-loaded from `/pages/videos/StoryboardStudioPage.tsx`)

### 3.2 Where Storyboard Studio is Defined

#### 3.2.1 Backend (MongoDB)
- **Model:** `MarketItem` collection
- **Fields:**
  - `id`: "STORYBOARD-STUDIO"
  - `slug`: "storyboard-studio"
  - `category`: { en: "Video", vi: "Video" } (likely)
  - `homeBlocks`: ["video_studio"] (likely included in video_studio category)
  - `isActive`: true
  - `featured`: Could be true (appears to be a featured product)

#### 3.2.2 Frontend Code
- **Page Component:** `/pages/videos/StoryboardStudioPage.tsx` (31,930 bytes, Apr 10 14:34)
- **Route Definition:** `/App.tsx` line 236
  ```tsx
  <Route path="/product/storyboard-studio" element={<StoryboardStudioPage />} />
  ```
- **Lazy Loading:** `/App.tsx` line 56
  ```tsx
  storyboard: () => import('./pages/videos/StoryboardStudioPage'),
  ```

### 3.3 Storyboard Studio Page Details

**Location:** `/pages/videos/StoryboardStudioPage.tsx`

The page features:
1. **CDN Image Constants** - Pre-generated images for UI/marketing
2. **Features Section** (lines 39-82):
   - AI Script Splitting
   - Visual Character Anchoring
   - Batch Image Generation
   - AI Video Rendering
   - Visual Timeline
   - Export & Pipeline

3. **Workflow Steps** (lines 84+):
   - 01: Script Input
   - 02: AI Scene Splitting
   - 03: Generate Images & Videos
   - 04: Export & Download

4. **Demo Samples** (`STORYBOARD_SAMPLES` in `/data.ts` lines 17-43):
   - Dragon Ball: Ultra Instinct Rise
   - Naruto: Final Valley Clash
   - One Piece: Gear 5 Joyboy
   - Marvel: Avengers Assemble
   - Avatar: Way of Water

### 3.4 Image Generation for Storyboard Studio

**Location:** `/update-product-images.mjs`

Contains a prompt for generating the product hero image:
```
'STORYBOARD-STUDIO': `A cinematic storyboard creation scene — film script text transforming into beautifully drawn storyboard panels. Floating camera angle indicators and shot composition guides. Warm cinematic lighting on dark background, gold film reel accents, cinematic 4K.`
```

---

## 4. Categories System

### 4.1 Home Blocks (Primary Categorization)

**Location:** `/constants/market-config.tsx` (lines 13-62)

The marketplace uses `HOME_BLOCK_OPTIONS` to organize products:

```typescript
export const HOME_BLOCK_OPTIONS: HomeBlockOption[] = [
  { id: 'top-choice',     label: 'Top Choice' },      // Featured products
  { id: 'top-image',      label: 'Image Studio' },     // Image creation tools
  { id: 'top-video',      label: 'Video Studio' },     // Video creation tools
  { id: 'top-ai-agent',   label: 'AI Agent Workflow' }, // Automation
  { id: 'events',         label: 'Lễ hội & Sự kiện' }, // Events/Festivals
  { id: 'app-other',      label: 'App khác' },         // Other apps
];
```

### 4.2 Secondary Categories (Category Field)

Each Solution has a `category` field (LocalizedString) such as:
- "Image Studio"
- "Video Studio"
- "Enhancement"
- "Automation"
- "Audio"
- etc.

### 4.3 Category Filtering Flow

```
User Views MarketPage
  ↓
MarketPage fetches with: `marketApi.getSolutions({ category, lang })`
  ↓
Backend filters by: `category.${lang}` regex match
  ↓
Solutions filtered by `homeBlocks` array
  ↓
Grouped by HomeBlock sections for display
```

### 4.4 MarketsPage Categories

**Location:** `/pages/MarketsPage.tsx` (lines 38-47)

```typescript
const CATEGORIES = [
  { key: 'ALL', label: 'Tất cả' },
  { key: 'Video', label: 'Video AI' },
  { key: 'Image', label: 'Hình ảnh AI' },
  { key: 'Audio', label: 'Giọng nói' },
  { key: 'Music', label: 'Nhạc AI' },
  { key: 'Automation', label: 'Tự động hóa' },
  { key: '3D', label: '3D & Game' },
  { key: 'Sky Partners', label: 'Sky Partners' },
];
```

---

## 5. MarketPage Component - Detailed Analysis

### 5.1 Location
`/pages/MarketPage.tsx` (104,228 bytes)

### 5.2 Data Flow

1. **Initialization** (lines 116-140):
   ```tsx
   useEffect(() => {
     // 1. Fetch system config (home blocks)
     const configRes = await systemConfigApi.getSystemConfig();
     // 2. Fetch random featured solutions
     const featuredRes = await marketApi.getRandomFeatured();
   });
   ```

2. **Search & Filter** (lines 142-150):
   ```tsx
   const res = await marketApi.getSolutions({
     q: query,                              // Search query
     category: primary !== 'ALL' ? primary : undefined,  // Primary category
     lang: lang as Language
   });
   ```

3. **Filtering Logic** (lines 207-250):
   ```tsx
   const filteredSolutions = useMemo(() => {
     return solutions.filter(sol => {
       // Filter by search query and secondary category
       // Also respects 'homeBlocks' for section display
     });
   }, [solutions, query, primary, secondary, lang]);
   ```

### 5.3 Display Structure

**Home Blocks Iteration** (line 735):
```tsx
{homeBlocks.map((block) => {
  const blockSolutions = filteredSolutions.filter(
    s => s.homeBlocks?.includes(block.key)
  );
  // Render MarketSectionHeader + SolutionCards
})}
```

### 5.4 Category Filtering Variables

- `primary`: Main category (from HOME_BLOCK_OPTIONS)
- `secondary`: Sub-category filter
- `query`: Search query
- Filtered based on `homeBlocks` array in Solution

### 5.5 Component Composition

1. **Featured Section** - Top featured products (5 items)
2. **Trending/Category Sections** - Grouped by homeBlocks
3. **SolutionCard** - Individual product cards (see section 6.2)

---

## 6. SolutionCard Component

### 6.1 Location
`/components/market/SolutionCard.tsx`

### 6.2 Properties Displayed

```tsx
interface SolutionCardProps {
  sol: Solution;                    // Product data
  idx: number;                      // Index
  lang: string;                     // Language
  isLiked: boolean;                 // Heart icon state
  isFavorited: boolean;             // Bookmark state
  onToggleFavorite: callback;       // Bookmark handler
  onToggleLike: callback;           // Like handler
  onClick: (slug: string) => void;  // Navigate on click
  onQuickView?: callback;           // Modal view
  stats: { users: string; likes: string }; // Fake stats
  isGrid?: boolean;                 // Grid vs horizontal
}
```

### 6.3 Card Display Elements

1. **Image** (line 41-45): Product image with hover scale effect
2. **Category Badge** (lines 82-85): `sol.category[currentLang]`
3. **Title** (line 90): `sol.name[currentLang]`
4. **Description** (line 91): `sol.description[currentLang]` (quoted)
5. **Stats** (lines 95-96): Users & likes
6. **Price** (line 98): Free badge or credit cost
7. **Actions** (lines 48-72): Quick View & Detail buttons

---

## 7. MarketsPage Component - Detailed Analysis

### 7.1 Location
`/pages/MarketsPage.tsx` (58,232 bytes)

### 7.2 Unique Features

#### 7.2.1 Advanced Filtering
- **Categories** (line 38-47)
- **Complexity Levels** (line 48): Standard, Advanced, Enterprise
- **Platforms** (line 49-55): Web, iOS, Android, Extension
- **Sort Options** (line 56-60): Popular, Newest, Name A-Z

#### 7.2.2 Pagination
- `ITEMS_PER_PAGE = 12` (line 61)

#### 7.2.3 Recently Viewed Tracking
- Stores in `localStorage` key: `skyverses_recently_viewed`
- `MAX_RECENT = 5` items (line 63)

#### 7.2.4 Trending Slider
- `TrendingSlider` component (lines 85-120)
- Shows top-performing products
- Horizontal scroll with left/right navigation

### 7.3 Main Filter Logic

```typescript
// Filters solutions by:
// 1. Active status (isActive !== false)
// 2. Category match (category[lang] regex)
// 3. Complexity level
// 4. Platform availability
// 5. Free/Paid status
// 6. Search query

const filtered = solutions.filter(sol => {
  // Apply all filters
  if (selectedCategory !== 'ALL' && !matchesCategory(sol, selectedCategory)) return false;
  if (selectedComplexity && sol.complexity !== selectedComplexity) return false;
  if (searchQuery && !searchMatches(sol, searchQuery)) return false;
  // ... more filters
  return true;
});
```

### 7.4 Display Modes
- **Grid View** (default)
- **List View** (toggle available)

---

## 8. Routing Configuration

### 8.1 Root Route (`/`)

**Component:** `MarketPage`
**Location:** `/App.tsx` line 203

```tsx
<Route path="/" element={
  <Suspense fallback={<HomepageSkeleton />}>
    <MarketPage />
  </Suspense>
} />
```

### 8.2 Category Route (`/category/:id`)

**Component:** `CategoryPage`
**Location:** `/App.tsx` line 204

```tsx
<Route path="/category/:id" element={<CategoryPage />} />
```

Categories from HOME_BLOCK_OPTIONS:
- `/category/top-choice`
- `/category/top-image`
- `/category/top-video`
- `/category/top-ai-agent`
- `/category/events`
- `/category/app-other`

### 8.3 Markets Route (`/markets`)

**Component:** `MarketsPage`
**Location:** `/App.tsx` line 206

```tsx
<Route path="/markets" element={<MarketsPage />} />
```

### 8.4 Product Routes

**Generic Product Route** (`/product/:slug`)
**Location:** `/App.tsx` line 257

```tsx
<Route path="/product/:slug" element={<SolutionDetail />} />
```

**Specific Product Routes** (Storyboard Studio example):
**Location:** `/App.tsx` line 236

```tsx
<Route path="/product/storyboard-studio" element={<StoryboardStudioPage />} />
```

### 8.5 Route Priority

React Router processes routes in order:
1. Specific routes (`/product/storyboard-studio`) - Checked first
2. Generic routes (`/product/:slug`) - Fallback

This ensures storyboard-studio uses its dedicated component.

---

## 9. API Layer

### 9.1 Market API

**Location:** `/apis/market.ts`

```typescript
marketApi = {
  /**
   * GET /market?q=...&category=...&lang=...
   */
  getSolutions: async (params?: {
    q?: string;              // Search query
    category?: string;       // Category filter
    lang?: Language;         // Language
  }) => Promise<{ success: boolean; data: Solution[] }>

  /**
   * GET /market/random/featured
   */
  getRandomFeatured: async () => Promise<{ success: boolean; data: Solution[] }>

  /**
   * CRUD operations (admin)
   */
  updateSolution(id, payload)
  createSolution(payload)
  deleteSolution(id)
  toggleActive(id, isActive)
}
```

### 9.2 Backend Market Routes

**Location:** `/skyverses-backend/src/routes/market.ts`

```
GET  /market              - List all solutions (with filters)
GET  /market/random/featured - Get 5 random featured items
GET  /market/:slug        - Get single item by slug
POST /market              - Create (admin)
PUT  /market/:id          - Update (admin)
DELETE /market/:id        - Delete (admin)
POST /market/:id/active   - Toggle active status (admin)
POST /market/:id/status   - Update status (admin)
```

### 9.3 Backend Filter Logic

**Query Parameters:**
- `q` - Keyword search (name, description, tags, models, industries, neuralStack)
- `category` - Category name regex match
- `lang` - Language for localized fields
- `isActive` - Boolean filter
- `featured` - Boolean filter
- `isFree` - Boolean filter
- `status` - Status filter

---

## 10. Category Page (`/category/:id`)

### 10.1 Component

**Location:** `/pages/CategoryPage.tsx`

### 10.2 Flow

1. **Get Category ID** from URL params
2. **Fetch Config** to get HomeBlock details
3. **Fetch All Solutions**
4. **Filter Solutions** by `homeBlocks?.includes(id)`
5. **Display** in category-specific UI

### 10.3 UI Mapping

**`CATEGORY_UI_MAP`** (lines 25-56):
```typescript
{
  top_trending: { icon: Flame, color: 'text-orange-500' },
  video_studio: { icon: Video, color: 'text-purple-500' },
  image_studio: { icon: ImageIcon, color: 'text-brand-blue' },
  ai_agents: { icon: Workflow, color: 'text-emerald-500' },
  festivals: { icon: Gift, color: 'text-rose-500' },
  others: { icon: LayoutGrid, color: 'text-slate-500' },
}
```

### 10.4 Search Within Category

```tsx
const filteredSolutions = useMemo(() => {
  return solutions.filter(sol => {
    const name = sol.name[lang] || sol.name.en;
    return (
      name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      sol.slug.toLowerCase().includes(searchQuery.toLowerCase()) ||
      sol.tags?.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
    );
  });
}, [solutions, searchQuery, lang]);
```

---

## 11. System Config & Home Blocks

### 11.1 Config API

**Location:** `/apis/config.ts` (referenced in MarketPage)

```typescript
systemConfigApi.getSystemConfig() 
  // Returns: { success, data: SystemConfig }
  // data.marketHomeBlock: HomeBlock[]
```

### 11.2 HomeBlock Interface

**Location:** `/types.ts` (lines 17-23)

```typescript
export interface HomeBlock {
  key: string;                    // e.g., 'video_studio'
  title: LocalizedString;         // Display title
  subtitle: LocalizedString;      // Display subtitle
  limit: number;                  // Max items to show
  order: number;                  // Sort order
}
```

### 11.3 Market Home Block Configuration

**Location:** `/skyverses-backend/src/routes/config.ts`

Likely contains default homeBlocks:
- top_trending
- video_studio
- image_studio
- ai_agents
- festivals
- others

---

## 12. Search & Discovery Flow

### 12.1 Search Architecture

**Primary Search** (MarketPage):
1. User enters query
2. Calls `marketApi.getSolutions({ q: query, ... })`
3. Backend returns filtered results
4. Frontend filters by `homeBlocks` for display

**Category Search** (CategoryPage):
1. URL param: `/category/:id`
2. Filter: `sol.homeBlocks?.includes(id)`
3. Additional client-side search by name/slug/tags

**Advanced Search** (MarketsPage):
1. Multiple filter dimensions
2. Category + Complexity + Platform + Price
3. Pagination (12 items/page)
4. Sort options

### 12.2 Search Context

**Location:** `/context/SearchContext.tsx` (referenced)

Provides:
- `query`: Current search string
- `primary`: Primary category
- `secondary`: Secondary category
- `reset()`: Clear filters
- `open`: Open search

---

## 13. Data Display Consistency

### 13.1 Localization

All user-facing content uses `LocalizedString`:
```typescript
type LocalizedString = { en, vi, ko, ja }
```

Current language from `useLanguage()`:
```tsx
const { lang, t } = useLanguage();
const currentLang = lang as Language;
sol.name[currentLang] || sol.name.en
```

### 13.2 Product Images

- **Thumbnail:** `sol.imageUrl` (required)
- **Gallery:** `sol.gallery[]` (optional)
- **Lazy Loading:** All `<img>` tags use `loading="lazy"`

### 13.3 Statistics Display

Fake stats generated from product ID hash:
```typescript
const getStats = (id: string) => {
  const h = id.split('').reduce((a, c) => a + c.charCodeAt(0), 0);
  return {
    users: (h % 900 + 100),
    likes: (h % 400 + 30),
    rating: (3.5 + (h % 15) / 10).toFixed(1)
  };
};
```

---

## 14. Product Navigation Flow

### 14.1 From Search to Product

```
MarketPage/MarketsPage
  ↓
User clicks SolutionCard
  ↓
onClick -> navigate(`/product/${slug}`)
  ↓
React Router matches route
  ↓
Specific route? → Load dedicated component (e.g., StoryboardStudioPage)
Generic route?  → Load SolutionDetail with API fetch
```

### 14.2 SolutionDetail Page

**Location:** `/pages/SolutionDetail.tsx` (referenced but not detailed)

Used as fallback for products without dedicated pages.

---

## 15. Favorites & Recently Viewed

### 15.1 Favorites (Bookmarks)

**Storage:** `localStorage` key: `skyverses_favorites`
**Value:** Array of product IDs

```tsx
const toggleFavorite = (e, solId) => {
  const newFavs = favorites.includes(solId)
    ? favorites.filter(id => id !== solId)
    : [...favorites, solId];
  setFavorites(newFavs);
  localStorage.setItem('skyverses_favorites', JSON.stringify(newFavs));
};
```

### 15.2 Recently Viewed

**Storage:** `localStorage` key: `skyverses_recently_viewed`
**Structure:** Array of `{ id, slug, name, imageUrl, category }`
**Max Items:** 5

```tsx
const saveRecentlyViewed = (sol: Solution) => {
  const stored = JSON.parse(localStorage.getItem(RECENTLY_VIEWED_KEY) || '[]');
  const filtered = stored.filter((s) => s.id !== sol.id);
  filtered.unshift({
    id: sol.id,
    slug: sol.slug,
    name: sol.name,
    imageUrl: sol.imageUrl,
    category: sol.category
  });
  localStorage.setItem(RECENTLY_VIEWED_KEY, JSON.stringify(filtered.slice(0, 5)));
};
```

---

## 16. Key Files Reference

| File | Purpose |
|------|---------|
| `/types.ts` | Type definitions (Solution, HomeBlock, etc.) |
| `/constants/market-config.tsx` | HOME_BLOCK_OPTIONS configuration |
| `/pages/MarketPage.tsx` | Main marketplace home page |
| `/pages/MarketsPage.tsx` | Advanced marketplace with filters |
| `/pages/CategoryPage.tsx` | Category-specific product listing |
| `/pages/videos/StoryboardStudioPage.tsx` | Storyboard Studio product page |
| `/components/market/SolutionCard.tsx` | Product card component |
| `/apis/market.ts` | Market API client |
| `/apis/config.ts` | Config API (home blocks) |
| `/App.tsx` | Route definitions |
| `/skyverses-backend/src/models/MarketItem.model.ts` | MongoDB schema |
| `/skyverses-backend/src/routes/market.ts` | Backend market routes |

---

## 17. Product Metadata Fields

### 17.1 Critical Fields

- `id` (string): Unique business identifier
- `slug` (string): URL-safe identifier
- `isActive` (boolean): Marketplace visibility
- `homeBlocks` (string[]): Category assignments

### 17.2 Display Fields

- `name` (LocalizedString): Product name
- `category` (LocalizedString): Category name
- `description` (LocalizedString): Short description
- `imageUrl` (string): Thumbnail image URL

### 17.3 Functional Fields

- `demoType`: 'text' | 'image' | 'video' | 'automation'
- `priceCredits`: Number of credits required
- `isFree`: Whether free to use
- `featured`: Appears in featured section
- `order`: Sort order (0-based)
- `complexity`: Skill level required
- `platforms`: Available platforms

### 17.4 Metadata Fields

- `tags`: Search keywords
- `models`: AI models used
- `features`: Product capabilities
- `neuralStack`: Specific AI implementations
- `problems`: Problems solved
- `industries`: Target industries

---

## 18. Storyboard Studio Complete Picture

### 18.1 Product Lifecycle

1. **Data Source**: Backend MongoDB (MarketItem collection)
2. **API Endpoint**: `GET /market?slug=storyboard-studio` or `GET /market/random/featured`
3. **Frontend Type**: `Solution` interface with all fields
4. **Category Assignment**: `homeBlocks: ['video_studio']` likely
5. **Route**: `/product/storyboard-studio`
6. **Component**: `StoryboardStudioPage.tsx`
7. **Display**:
   - Featured sections (if `featured: true`)
   - Video Studio category section
   - Search results

### 18.2 Page Features

1. CDN-hosted images for all sections
2. Sample storyboards (Dragon Ball, Naruto, etc.)
3. Feature highlights (6 main features)
4. 4-step workflow description
5. Use case examples
6. Interactive demo workspace component

### 18.3 Navigation Paths

- **From home:** Search for "storyboard" → Results → Click → `/product/storyboard-studio`
- **From video category:** `/category/top-video` → Video Studio products → Click storyboard
- **From markets:** `/markets` → Filter by Video → Click storyboard
- **Direct:** User can navigate to `/product/storyboard-studio` directly

---

## 19. Summary Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                    MARKETPLACE FLOW                          │
└─────────────────────────────────────────────────────────────┘

BACKEND
┌──────────────────┐
│   MongoDB        │
│  MarketItem      │
│  Collection      │
└────────┬─────────┘
         │
    API: /market
         │
┌────────▼─────────┐
│  Express Routes  │
│  (market.ts)     │
└────────┬─────────┘

FRONTEND

┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│  /              │     │  /category/:id  │     │  /markets       │
│  MarketPage     │     │  CategoryPage   │     │  MarketsPage    │
│  (home)         │     │                 │     │  (advanced)     │
└────────┬────────┘     └────────┬────────┘     └────────┬────────┘
         │                       │                        │
         └───────────────────────┴────────────────────────┘
                                 │
                    ┌────────────▼──────────────┐
                    │   marketApi.getSolutions()│
                    └────────────┬──────────────┘
                                 │
                    ┌────────────▼──────────────┐
                    │   Filter by:              │
                    │   - homeBlocks[]          │
                    │   - category              │
                    │   - search query          │
                    └────────────┬──────────────┘
                                 │
         ┌───────────────────────┼───────────────────────┐
         │                       │                       │
    ┌────▼────┐          ┌──────▼──────┐         ┌──────▼──────┐
    │Featured │          │ By Category │         │ By Platform │
    │Section  │          │ or HomeBlock│         │ & Complexity│
    └────┬────┘          └──────┬──────┘         └──────┬──────┘
         │                       │                      │
         └───────────────────────┼──────────────────────┘
                                 │
                    ┌────────────▼──────────────┐
                    │  SolutionCard Component   │
                    │  - Display product info   │
                    │  - Show category badge    │
                    │  - Price/Free indicator   │
                    │  - Favorite/Like buttons  │
                    └────────────┬──────────────┘
                                 │
                        ┌────────▼────────┐
                        │ onClick: route  │
                        │ /product/:slug  │
                        └────────┬────────┘
                                 │
            ┌────────────────────┼────────────────────┐
            │                                         │
    ┌───────▼──────────────┐            ┌────────────▼────────────┐
    │ Specific Component   │            │ SolutionDetail Fallback │
    │ e.g.,                │            │ (API fetch required)    │
    │ StoryboardStudioPage │            │                         │
    └──────────────────────┘            └─────────────────────────┘
```

---

## Conclusion

The Skyverses marketplace system is a sophisticated, multi-layered architecture that:

1. **Centralizes** product data in MongoDB with a flexible schema
2. **Categorizes** products through `homeBlocks` and category fields
3. **Filters** intelligently across multiple dimensions (search, category, complexity, platform)
4. **Displays** through reusable components (SolutionCard, MarketPage, CategoryPage, MarketsPage)
5. **Routes** via React Router with both generic and specific product pages
6. **Tracks** user preferences through localStorage (favorites, recently viewed)
7. **Localizes** all content for multiple languages
8. **Optimizes** loading with lazy-loaded routes and API caching

The "storyboard-studio" product exemplifies this architecture as a featured Video Studio product with a dedicated page component, comprehensive feature showcase, and integration throughout the marketplace UI.

