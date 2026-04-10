# Marketplace Quick Reference Guide

## File Locations

### Core Type Definitions
- **Types:** `/types.ts` (Solution, HomeBlock, Language interfaces)
- **Config:** `/constants/market-config.tsx` (HOME_BLOCK_OPTIONS)

### Frontend Pages
- **Home:** `/pages/MarketPage.tsx` (main marketplace)
- **Browsing:** `/pages/MarketsPage.tsx` (advanced filters)
- **Categories:** `/pages/CategoryPage.tsx` (by category)
- **Product:** `/pages/videos/StoryboardStudioPage.tsx` (example product)

### Components
- **Card:** `/components/market/SolutionCard.tsx`
- **Header:** `/components/market/MarketSectionHeader.tsx`
- **Featured:** `/components/market/FeaturedSection.tsx`
- **List:** `/components/market/SolutionList.tsx`

### APIs
- **Market API:** `/apis/market.ts` (getSolutions, getRandomFeatured, CRUD)
- **Config API:** `/apis/config.ts` (getSystemConfig)

### Backend
- **Model:** `/skyverses-backend/src/models/MarketItem.model.ts` (MongoDB schema)
- **Routes:** `/skyverses-backend/src/routes/market.ts` (API endpoints)

### Routing
- **Routes:** `/App.tsx` (all route definitions)

---

## Product Definition Structure

### Minimal Required Fields
```typescript
{
  id: "STORYBOARD-STUDIO",
  slug: "storyboard-studio",
  name: { en: "Storyboard Studio", vi: "...", ko: "...", ja: "..." },
  category: { en: "Video", vi: "..." },
  description: { en: "...", vi: "..." },
  imageUrl: "https://...",
  demoType: "video",
  tags: ["storyboard", "video"],
  features: ["Feature 1", "Feature 2"],
  complexity: "Standard",
  priceReference: "100 CR / project"
}
```

### Display Control Fields
```typescript
{
  isActive: true,          // Show in marketplace?
  featured: false,         // Show in featured section?
  homeBlocks: ["video_studio", "top_trending"],  // Which sections?
  order: 0                 // Sort order
}
```

### Pricing Fields
```typescript
{
  priceCredits: 100,       // Cost in credits
  isFree: false,           // Is it free?
  priceReference: "100 CR / project"  // Display text
}
```

---

## Categories System

### Home Blocks (Primary Categories)
```
- top-choice       → Featured products
- top-image        → Image Studio
- top-video        → Video Studio ← Storyboard Studio here
- top-ai-agent     → AI Agent Workflow
- events           → Events/Festivals
- app-other        → Other apps
```

### Secondary Categories (in category field)
```
- Image
- Video
- Audio
- Music
- Enhancement
- Automation
- 3D
- ...
```

### How They Work Together

Products use **both**:
1. `homeBlocks` array → Where to display (top-level sections)
2. `category` field → What type it is (for filtering)

Example:
```typescript
{
  slug: "storyboard-studio",
  category: { en: "Video" },        // Type
  homeBlocks: ["video_studio"]      // Display in Video section
}
```

---

## Key API Endpoints

### Frontend (TypeScript)
```typescript
// Get solutions with filters
marketApi.getSolutions({
  q: "storyboard",           // Search query
  category: "Video",         // Category filter
  lang: "en"                 // Language
})

// Get 5 random featured items
marketApi.getRandomFeatured()
```

### Backend (Express)
```
GET  /market?q=...&category=...&lang=...
GET  /market/random/featured
GET  /market/:slug
POST /market (admin)
PUT  /market/:id (admin)
DELETE /market/:id (admin)
POST /market/:id/active (admin)
```

---

## Routing

### Public Routes
```
/                    → MarketPage (home)
/category/:id        → CategoryPage (e.g., /category/top-video)
/markets             → MarketsPage (advanced browsing)
/product/:slug       → SolutionDetail (generic product page)
/product/storyboard-studio → StoryboardStudioPage (specific)
```

### Route Priority
1. **Specific routes** checked first → `/product/storyboard-studio`
2. **Generic routes** checked second → `/product/:slug`

This ensures storyboard-studio uses its dedicated component.

---

## Filtering Logic

### MarketPage (Home)
```
User enters query
  ↓
API call: getSolutions({ q, category, lang })
  ↓
Backend filters by: name, description, tags, models
  ↓
Frontend filters by: homeBlocks array
  ↓
Display grouped by HomeBlock sections
```

### CategoryPage
```
URL param: /category/:id
  ↓
Fetch all solutions
  ↓
Filter: sol.homeBlocks?.includes(id)
  ↓
Additional client-side search by name/slug/tags
```

### MarketsPage
```
Multiple independent filters:
- Category (Video, Image, Audio, etc.)
- Complexity (Standard, Advanced, Enterprise)
- Platform (Web, iOS, Android, Extension)
- Price (Free, Paid)
- Sort (Popular, Newest, Name A-Z)
  ↓
Pagination: 12 items per page
```

---

## Display Components

### SolutionCard Props
```typescript
{
  sol: Solution,           // Product data
  idx: number,             // Index for styling
  lang: string,            // Current language
  isLiked: boolean,        // Heart icon state
  isFavorited: boolean,    // Bookmark state
  onToggleFavorite,        // Bookmark callback
  onToggleLike,            // Like callback
  onClick,                 // Navigate to product
  onQuickView,             // Modal view callback
  stats: { users, likes }, // Fake engagement stats
  isGrid: boolean          // Grid vs horizontal layout
}
```

### Card Display Order
1. Image (with hover effects)
2. Category badge
3. Title
4. Description (quoted)
5. Stats (users & likes)
6. Price (free badge or credits)
7. Actions (Quick View, Detail buttons)

---

## Storyboard Studio Specific

### Location
- **Page:** `/pages/videos/StoryboardStudioPage.tsx`
- **Route:** `/product/storyboard-studio`
- **ID:** `STORYBOARD-STUDIO`
- **Slug:** `storyboard-studio`

### Features
1. AI Script Splitting
2. Visual Character Anchoring
3. Batch Image Generation
4. AI Video Rendering
5. Visual Timeline
6. Export & Pipeline

### Demo Samples
- Dragon Ball: Ultra Instinct Rise
- Naruto: Final Valley Clash
- One Piece: Gear 5 Joyboy
- Marvel: Avengers Assemble
- Avatar: Way of Water

### Data Source
- **Frontend:** `/data.ts` (STORYBOARD_SAMPLES)
- **Backend:** MongoDB MarketItem document
- **Images:** CDN (Imagedelivery.net) with CDN constants

---

## Localization

### Supported Languages
- `en` - English
- `vi` - Vietnamese
- `ko` - Korean
- `ja` - Japanese

### Usage Pattern
```typescript
const { lang } = useLanguage();
const currentLang = lang as Language;

// Access localized string
const name = product.name[currentLang] || product.name.en;
```

---

## localStorage Keys

### Favorites
- **Key:** `skyverses_favorites`
- **Value:** Array of product IDs
- **Structure:** `["STORYBOARD-STUDIO", "AI-VIDEO-GENERATOR", ...]`

### Recently Viewed
- **Key:** `skyverses_recently_viewed`
- **Max Items:** 5
- **Structure:**
  ```typescript
  [{
    id: "STORYBOARD-STUDIO",
    slug: "storyboard-studio",
    name: { en: "...", vi: "..." },
    imageUrl: "https://...",
    category: { en: "Video", vi: "..." }
  }, ...]
  ```

---

## Common Development Tasks

### Add New Product
1. Create MongoDB document in `MarketItem` collection
2. Set fields: `id`, `slug`, `name`, `category`, `imageUrl`, etc.
3. Set `homeBlocks` to display categories
4. Set `isActive: true` to make visible

### Add New Category Section
1. Update `HOME_BLOCK_OPTIONS` in `/constants/market-config.tsx`
2. Add `key`, `label`, `icon`, `color`
3. Backend will return matching products via `homeBlocks` filter

### Create Dedicated Product Page
1. Create component in `/pages/` (e.g., `/pages/videos/CustomProductPage.tsx`)
2. Add lazy import in `/App.tsx`
3. Add specific route: `<Route path="/product/custom" element={<CustomProductPage />} />`
4. Route will be checked before generic `/product/:slug` route

### Search Implementation
1. User types query
2. Calls `marketApi.getSolutions({ q: query })`
3. Backend searches: name, description, tags, models, industries, neuralStack
4. Frontend receives filtered array
5. Display with SolutionCard components

---

## Performance Optimizations

### Code Splitting
- All pages are lazy-loaded using React.lazy()
- Routes loaded only when needed

### API Caching
- Market solutions cached for 2 minutes
- Featured items cached for 5 minutes

### Image Optimization
- All images use `loading="lazy"`
- Hover effects use CSS transitions (GPU accelerated)
- CDN-hosted images from imagedelivery.net

### Rendering
- `SolutionCard` is memoized (`React.memo()`)
- `useMemo` for filtered solutions
- Horizontal scroll for trending/categories

---

## Debugging Tips

### Check Product Visibility
1. Is `isActive: true`?
2. Is `homeBlocks` array populated?
3. Is `category` field set correctly?

### Check Routing
1. Does route exist in `/App.tsx`?
2. Check route priority (specific before generic)
3. Verify component is imported correctly

### Check Filtering
1. Verify `category` field matches filter criteria
2. Check `homeBlocks` includes the target category
3. Verify language (`lang`) matches expected values

### Check API Calls
1. Open DevTools → Network tab
2. Look for `/market` requests
3. Verify query parameters
4. Check response status (200 = success)

---

## File Sizes (as reference)

- MarketPage.tsx: 104 KB
- MarketsPage.tsx: 58 KB
- StoryboardStudioPage.tsx: 32 KB
- CategoryPage.tsx: ~30 KB
- SolutionCard.tsx: 6 KB
- market.ts (API): 4 KB

---

## Important Notes

1. **Product IDs must be unique** (indexed in MongoDB)
2. **Slugs must be unique** (URL identifiers)
3. **All user-facing strings should be localized** (LocalizedString)
4. **homeBlocks** array determines which sections a product appears in
5. **category** field is for filtering and display (second level)
6. **Specific routes** take priority over generic routes
7. **Featured products** appear in random featured section (5 items)

