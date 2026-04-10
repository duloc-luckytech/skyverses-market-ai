# Marketplace Exploration - Complete Summary

## Documents Created

This exploration has generated three comprehensive documents:

1. **MARKETPLACE_EXPLORATION.md** (900 lines)
   - In-depth architectural analysis
   - Complete type definitions
   - All components and their roles
   - Backend model structure
   - Full API documentation

2. **MARKETPLACE_QUICK_REFERENCE.md** (450+ lines)
   - Quick lookup guide
   - File locations
   - Common tasks
   - API endpoints
   - Debugging tips

3. **MARKETPLACE_VISUAL_GUIDE.md** (600+ lines)
   - Visual diagrams and hierarchies
   - Data flow sequences
   - Component hierarchies
   - State management
   - File organization

---

## Key Findings - Executive Summary

### 1. How Products Are Defined

**Location:** MongoDB (MarketItem collection)

**Essential Fields:**
- `id` - Unique business identifier (e.g., "STORYBOARD-STUDIO")
- `slug` - URL-safe identifier (e.g., "storyboard-studio")
- `name` - Localized name (en, vi, ko, ja)
- `category` - Product type for filtering
- `homeBlocks` - Array defining which marketplace sections to display in
- `isActive` - Boolean controlling visibility

**All products accessed via:** `marketApi.getSolutions()`

---

### 2. How Categories Work

**Two-Level System:**

**Level 1: Home Blocks** (Primary Organization)
- Defined in `/constants/market-config.tsx`
- Examples: `top-choice`, `top-image`, `top-video`, `top-ai-agent`, `events`, `app-other`
- Stored in: `Solution.homeBlocks` array
- Controls where product appears on MarketPage

**Level 2: Category Field** (Secondary Classification)
- Stored in: `Solution.category` (LocalizedString)
- Examples: Video, Image, Audio, Music, Automation, Enhancement, 3D
- Used for MarketsPage filtering

**Example - Storyboard Studio:**
```typescript
homeBlocks: ["video_studio"]    // Display in Video Studio section
category: { en: "Video" }        // Categorized as Video
```

---

### 3. Where Storyboard Studio Is Defined

**Backend:**
- MongoDB Collection: `MarketItem`
- Document ID: `STORYBOARD-STUDIO`
- Slug: `storyboard-studio`

**Frontend:**
- Route: `/product/storyboard-studio` (Line 236, App.tsx)
- Component: `StoryboardStudioPage.tsx` (32 KB)
- Lazy load: `storyboard: () => import('./pages/videos/StoryboardStudioPage')`
- Demo samples: `STORYBOARD_SAMPLES` in `/data.ts` (5 anime examples)

**Features:**
1. AI Script Splitting
2. Visual Character Anchoring
3. Batch Image Generation
4. AI Video Rendering
5. Visual Timeline
6. Export & Pipeline

---

### 4. MarketPage - Homepage

**Location:** `/pages/MarketPage.tsx` (104 KB)

**Architecture:**
```
1. Featured Section (5 random featured products)
   ↓
2. Category Sections (grouped by homeBlocks)
   ├─ Top Choice
   ├─ Image Studio
   ├─ Video Studio (includes Storyboard Studio)
   ├─ AI Agent Workflow
   ├─ Events
   └─ Other Apps
   ↓
3. Each section has SolutionCard components
   ↓
4. Searching filters by homeBlocks + category match
```

**Data Flow:**
```
User sees home → Fetches config (homeBlocks) → Fetches solutions
              → Filters by homeBlocks → Groups by category
              → Renders SolutionCard for each product
```

---

### 5. MarketsPage - Advanced Browsing

**Location:** `/pages/MarketsPage.tsx` (58 KB)

**Unique Features:**
- Multiple filter dimensions (Category, Complexity, Platform, Price)
- Pagination (12 items per page)
- Sort options (Popular, Newest, Name A-Z)
- Trending slider
- Recently viewed history (localStorage)
- Grid and list view modes

**Categories on MarketsPage:**
```
Video, Image, Audio, Music, Automation, 3D, Sky Partners
```

---

### 6. Routing

**Specific Routes (Checked First):**
```
/product/storyboard-studio → StoryboardStudioPage (dedicated)
/product/background-removal-ai → BackgroundRemovalAI (dedicated)
... (many more specific routes)
```

**Generic Routes (Fallback):**
```
/ → MarketPage
/category/:id → CategoryPage
/markets → MarketsPage
/product/:slug → SolutionDetail (generic, uses API fetch)
```

**Key Point:** Specific routes are checked BEFORE generic routes, ensuring storyboard-studio uses its dedicated component.

---

### 7. SolutionCard Component

**Location:** `/components/market/SolutionCard.tsx`

**Displays:**
1. Product image with hover effects
2. Category badge (top-left)
3. Product title (blue, italic)
4. Product description (quoted)
5. Engagement stats (users, likes)
6. Price indicator (free badge or credits)
7. Action buttons (Quick View, Detail)
8. Bookmark/Favorite button (top-right)

**Event Handlers:**
- Click: Navigate to `/product/:slug`
- Favorite: Save to localStorage
- Like: Update local state
- Quick View: Open modal

---

### 8. API & Backend

**Frontend API:** `/apis/market.ts`
```typescript
marketApi.getSolutions({ q, category, lang })
marketApi.getRandomFeatured()
```

**Backend Routes:** `/skyverses-backend/src/routes/market.ts`
```
GET  /market?q=...&category=...&lang=...
GET  /market/random/featured
POST /market (admin)
PUT  /market/:id (admin)
DELETE /market/:id (admin)
```

**Backend Model:** `/skyverses-backend/src/models/MarketItem.model.ts`
- MongoDB schema matching Solution interface
- Indexed fields: id, slug, homeBlocks, isActive
- Default values: isActive=true, featured=false, order=0

---

### 9. Filtering & Search

**MarketPage Search:**
1. User types query
2. API called: `getSolutions({ q: "storyboard", lang: "en" })`
3. Backend searches: name, description, tags, models, industries, neuralStack
4. Frontend filters by homeBlocks array
5. Grouped by category section

**CategoryPage Filter:**
1. URL param: `/category/:id`
2. Fetch all solutions
3. Filter: `sol.homeBlocks?.includes(id)`
4. Additional client-side search by name/slug/tags

**MarketsPage Filter:**
1. Multiple independent filters
2. Category + Complexity + Platform + Price
3. Paginated results (12 per page)
4. Sort options applied

---

### 10. Localization

**Supported Languages:** en, vi, ko, ja

**Pattern:**
```typescript
type LocalizedString = {
  en: string,
  vi: string,
  ko: string,
  ja: string
}

// Access:
const name = product.name[lang] || product.name.en
```

**All User-Facing Strings:**
- Product names
- Category names
- Descriptions
- Features
- Error messages

---

## System Strengths

1. **Flexible Categorization** - Two-level system (homeBlocks + category)
2. **Efficient Caching** - 2-5 minute API cache
3. **Responsive Design** - Horizontal scroll, mobile-friendly
4. **Localization Support** - Full multi-language support
5. **Modular Architecture** - Reusable components
6. **Code Splitting** - Lazy-loaded pages
7. **User Preferences** - localStorage for favorites & history
8. **Advanced Filtering** - Multiple dimensions on MarketsPage
9. **SEO Optimized** - Meta tags and structured data
10. **Scalable Structure** - Easy to add products

---

## Common Workflows

### To Add a New Product

```
1. Create MongoDB document in MarketItem collection:
   {
     id: "NEW-PRODUCT",
     slug: "new-product",
     name: { en: "...", vi: "..." },
     category: { en: "Video", vi: "..." },
     description: { en: "...", vi: "..." },
     homeBlocks: ["video_studio"],
     imageUrl: "https://...",
     isActive: true,
     ... other fields
   }

2. Visible on:
   - MarketPage (in Video Studio section)
   - CategoryPage /category/top-video
   - MarketsPage (filtered by Video category)
   - Search results
```

### To Add Dedicated Product Page

```
1. Create component: /pages/CustomProductPage.tsx
2. Import in App.tsx
3. Add route: <Route path="/product/custom" element={<CustomProductPage />} />
4. Route will be checked before generic /product/:slug
```

### To Add New Category Section

```
1. Update /constants/market-config.tsx
2. Add to HOME_BLOCK_OPTIONS:
   { id: 'new-category', label: 'New Category', ... }
3. Set products' homeBlocks: ["new-category"]
4. Section appears on MarketPage
```

---

## Architecture Diagram

```
User Interface (Browser)
        │
        ├─ MarketPage (/)
        ├─ CategoryPage (/category/:id)
        ├─ MarketsPage (/markets)
        └─ StoryboardStudioPage (/product/storyboard-studio)
        │
        ▼ (All fetch via)
    
Frontend APIs (/apis/market.ts)
        │
        ├─ getSolutions({ q, category, lang })
        └─ getRandomFeatured()
        │
        ▼ (HTTP requests to)

Backend Express Server
        │
        ├─ GET /market
        ├─ GET /market/random/featured
        ├─ GET /market/:slug
        └─ ... admin routes
        │
        ▼ (Queries)

MongoDB Database
        │
        └─ MarketItem Collection
           ├─ id (indexed)
           ├─ slug (indexed)
           ├─ homeBlocks (indexed)
           ├─ isActive (indexed)
           ├─ name, category, description
           └─ ... other fields
```

---

## File Sizes & Reference

| Component | Size | Purpose |
|-----------|------|---------|
| MarketPage.tsx | 104 KB | Homepage with categories |
| MarketsPage.tsx | 58 KB | Advanced browsing & filters |
| CategoryPage.tsx | ~30 KB | Category-specific view |
| StoryboardStudioPage.tsx | 32 KB | Storyboard product page |
| SolutionCard.tsx | 6 KB | Product card component |
| market.ts | 4 KB | API client |
| MarketItem.model.ts | 3 KB | MongoDB schema |
| market.ts (backend) | 6 KB | API routes |

---

## Critical Fields Checklist

For products to work correctly:

✓ `id` - Must be unique
✓ `slug` - Must be unique and URL-safe
✓ `name` - All languages (en, vi, ko, ja)
✓ `category` - Set to appropriate value
✓ `homeBlocks` - Array of valid categories (top-choice, top-image, top-video, etc.)
✓ `imageUrl` - Valid image URL
✓ `isActive` - Set to true (default)
✓ `demoType` - video, image, text, or automation
✓ `features` - Array of feature strings/objects
✓ `priceCredits` - Numeric value or null for free
✓ `isFree` - Boolean

---

## Next Steps for Development

1. **Review** the three generated documents
2. **Reference** MARKETPLACE_QUICK_REFERENCE.md for common tasks
3. **Consult** MARKETPLACE_VISUAL_GUIDE.md for architecture questions
4. **Deep dive** MARKETPLACE_EXPLORATION.md for detailed implementation
5. **Test** API calls using `/markets` page advanced filters
6. **Verify** products visible in all marketplace pages
7. **Monitor** localStorage for favorites/recently viewed

---

## Questions Answered

### ✓ Where are products defined?
MongoDB MarketItem collection (backend), accessed via `/apis/market.ts`

### ✓ How are categories defined?
Two-level: homeBlocks (primary display location) + category field (secondary type)

### ✓ Where is "storyboard-studio"?
- Backend: MarketItem with id="STORYBOARD-STUDIO", slug="storyboard-studio"
- Frontend: `/pages/videos/StoryboardStudioPage.tsx`
- Route: `/product/storyboard-studio` (line 236 App.tsx)
- Category: "Video" with homeBlocks="video_studio"

### ✓ How are products displayed?
SolutionCard component showing: image, category, name, description, stats, price, actions

### ✓ How is routing configured?
React Router in App.tsx with specific routes checked before generic /product/:slug route

### ✓ How do filters work?
MarketPage: homeBlocks array filtering
MarketsPage: multi-dimensional filters (category, complexity, platform, price)
CategoryPage: homeBlocks.includes(id) matching

---

## Contact & Support

For questions about specific implementations, refer to:
- `MARKETPLACE_EXPLORATION.md` - Detailed architecture
- `MARKETPLACE_QUICK_REFERENCE.md` - Quick lookups
- `MARKETPLACE_VISUAL_GUIDE.md` - Visual diagrams

All source code locations are documented with full file paths.

