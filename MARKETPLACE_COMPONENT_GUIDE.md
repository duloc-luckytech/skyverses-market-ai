# Marketplace Component & Architecture Guide

## 🏗️ ARCHITECTURE OVERVIEW

```
┌─────────────────────────────────────────────────────────────┐
│                    App.tsx (Router)                         │
│  Routes: /product/storyboard-studio                         │
│          /product/paperclip-ai-agents                       │
│          /product/:slug (dynamic)                           │
└────────────┬────────────────────────────────────────────────┘
             │
    ┌────────┴────────┐
    │                 │
┌───▼───────┐  ┌─────▼──────┐
│ MarketPage│  │ MarketsPage│
│  (Home)   │  │  (Full)    │
└───────────┘  └────────────┘
    │                │
    └────┬───────────┘
         │
    ┌────▼─────────────────────────────────┐
    │    Market API (marketApi)            │
    │ GET /market?q=...&category=...      │
    │ GET /market/random/featured         │
    │ POST/PUT/DELETE /market/:id         │
    └────┬─────────────────────────────────┘
         │
    ┌────▼─────────────────┐
    │  Backend (Node.js)  │
    │  /market endpoints  │
    └──────────────────────┘
```

---

## 📦 COMPONENT TREE

### MarketPage (Home Marketplace)
```
MarketPage
├── Hero Section
│   ├── Featured Carousel
│   ├── Search Bar
│   └── CTA Buttons
├── Home Blocks (Dynamic)
│   └── [Block Name] (e.g., "Top Choice", "Video Studio")
│       ├── MarketSectionHeader
│       └── Horizontal Carousel
│           └── SolutionCard × N
├── ProductToolModal (Quick View)
└── AIModelsMarquee
```

### MarketsPage (Full Marketplace)
```
MarketsPage
├── Left Sidebar (Desktop)
│   ├── Search Input
│   ├── Categories Card
│   ├── Complexity Card
│   ├── Platform Card
│   ├── Tags Card
│   ├── Filters Card
│   ├── Reset Button
│   └── Stats Footer
├── Main Content (Right)
│   ├── Header
│   ├── Recently Viewed
│   ├── Trending Slider
│   ├── Toolbar
│   │   ├── View Mode Toggle (Grid/List)
│   │   └── Sort Dropdown
│   ├── Product Grid/List
│   │   ├── ProductCardGrid (Grid Mode)
│   │   │   └── (Repeats for each product)
│   │   │       ├── Image + Badges
│   │   │       ├── Preview Button (on hover)
│   │   │       ├── Compare Button (on hover)
│   │   │       ├── Favorite Button (on hover)
│   │   │       └── Title + Description
│   │   │
│   │   └── ProductCardList (List Mode)
│   │       └── (Same content, horizontal layout)
│   ├── Load More Button
│   ├── No Results Message
│   └── CTA Banner (Position 6)
├── Mobile Sidebar
│   └── (Same as left sidebar)
├── Compare Panel (Bottom Fixed)
│   └── 3-slot comparison
├── Back to Top Button
└── Quick Preview Modal
```

---

## 🔄 DATA FLOW DIAGRAM

### Initial Load
```
User visits /markets
    ↓
MarketsPage mounts
    ↓
useEffect triggers (empty deps)
    ↓
marketApi.getSolutions({ lang })
    ↓
API Cache check
    ├─ HIT (< 2min) → return cached data
    └─ MISS → fetch from backend
    ↓
setState(solutions)
    ↓
Render ProductCardGrid/List
```

### Search Flow
```
User types in search
    ↓
setInputValue(value)
    ↓
useDeferredValue → deferredSearch
    ↓
filteredSolutions.filter() re-runs
    ↓
UI re-renders with matching products
```

### Filter Flow
```
User clicks category
    ↓
setActiveCategory(category)
    ↓
URL params update
    ↓
filteredSolutions.filter() re-runs
    ↓
UI updates instantly
    ↓
(No new API call needed - uses existing solutions)
```

### Product Click Flow
```
User clicks product card
    ↓
saveRecentlyViewed(solution)
    ├─ Read localStorage
    ├─ Add to front of array
    ├─ Keep last 5 items
    └─ Save to localStorage
    ↓
handleNavigate(slug)
    ├─ Check isAuthenticated
    ├─ If false → redirect to /login
    └─ If true → navigate(/product/${slug})
    ↓
SolutionDetail component loads
```

---

## 🔗 COMPONENT CONNECTIONS

### ProductCardGrid ← → ProductCardList
```typescript
interface ProductCardProps {
  sol: Solution                    // Product data
  lang: Language                   // Current language
  onNavigate: (slug) => void      // Navigate to product
  isFav: boolean                   // Is favorited
  onToggleFav: (e) => void        // Toggle favorite
  onPreview?: (e) => void         // Open preview modal
  isCompare?: boolean              // Is in comparison
  onToggleCompare?: (e) => void   // Toggle comparison
}
```

### QuickPreviewModal
```typescript
interface QuickPreviewModalProps {
  sol: Solution
  lang: Language
  onClose: () => void
  onNavigate: (slug) => void
}

Displays:
- Full product image
- Name & description
- Stats (users, rating)
- Features list
- Tags
- Price info
- Open button → navigate
```

### ComparePanel
```typescript
interface ComparePanelProps {
  items: Solution[]                // Selected products (up to 3)
  lang: Language
  onRemove: (id) => void           // Remove from comparison
  onClear: () => void              // Clear all
  onNavigate: (slug) => void
}

Shows:
- 3-slot card layout
- Product image, name, category, complexity
- Quick stats
- Remove button per product
- Clear all button
```

---

## 📊 STATE MANAGEMENT

### MarketsPage State
```typescript
// Data
const [solutions, setSolutions]              // All products
const [featuredSolutions, setFeaturedSolutions]
const [loading, setLoading]
const [favorites, setFavorites]              // localStorage

// Filters
const [inputValue, setInputValue]            // Search text
const [deferredSearch, setDeferredSearch]   // Deferred search
const [activeCategory, setActiveCategory]    // Selected category
const [sortBy, setSortBy]                    // Sort option
const [showFreeOnly, setShowFreeOnly]        // Free toggle
const [showFeaturedOnly, setShowFeaturedOnly]
const [activeComplexity, setActiveComplexity]
const [activeTags, setActiveTags]            // Selected tags
const [activePlatform, setActivePlatform]    // Selected platform

// UI
const [viewMode, setViewMode]                // 'grid' | 'list'
const [visibleCount, setVisibleCount]        // Pagination
const [showBackTop, setShowBackTop]          // Scroll position
const [mobileSidebar, setMobileSidebar]      // Mobile filter panel

// Advanced
const [previewSol, setPreviewSol]            // Preview modal product
const [compareIds, setCompareIds]            // Comparison product IDs
```

### localStorage Keys
```typescript
const RECENTLY_VIEWED_KEY = 'skyverses_recently_viewed'  // Last 5
const FAVORITES_KEY = 'skyverses_favorites'              // Bookmarked
```

---

## 🎨 RENDERING LOGIC

### Product Filtering (Memoized)
```typescript
const filteredSolutions = useMemo(() => {
  let filtered = solutions.filter(sol => {
    const matchSearch = checkSearch(sol, deferredSearch)
    const matchCat = checkCategory(sol, activeCategory)
    const matchFree = !showFreeOnly || sol.isFree
    const matchFeatured = !showFeaturedOnly || sol.featured
    const matchComplexity = !activeComplexity || sol.complexity === activeComplexity
    const matchTags = checkTags(sol, activeTags)
    const matchPlatform = checkPlatform(sol, activePlatform)
    return all above
  })
  
  // Sort
  if (sortBy === 'name') sort A-Z
  else if (sortBy === 'newest') reverse
  
  // Partner products to end (when viewing ALL)
  sort by partner status
  
  return filtered
}, [all dependencies])
```

### Pagination
```typescript
const paginatedSolutions = useMemo(() =>
  filteredSolutions.slice(0, visibleCount),
  [filteredSolutions, visibleCount]
)

const hasMore = visibleCount < filteredSolutions.length

// Load More button
onClick={() => setVisibleCount(prev => prev + ITEMS_PER_PAGE)}
```

---

## 🔌 API INTEGRATION

### marketApi Functions
```typescript
// Fetch products
await marketApi.getSolutions({ 
  q: 'video',           // optional search
  category: 'Video',    // optional filter
  lang: 'en'            // language
})
→ { success, data: Solution[] }

// Get featured
await marketApi.getRandomFeatured()
→ { success, data: Solution[] }

// Admin operations
await marketApi.createSolution(payload)
await marketApi.updateSolution(id, payload)
await marketApi.deleteSolution(id)
await marketApi.toggleActive(id, isActive)
```

### Error Handling
```typescript
try {
  const res = await marketApi.getSolutions({ ... })
  if (res?.data) setSolutions(res.data)
} catch (error) {
  console.error('Market Fetch Error:', error)
  // Show fallback or empty state
} finally {
  setLoading(false)
}
```

---

## ⌨️ KEYBOARD SHORTCUTS

| Shortcut | Action |
|----------|--------|
| `Ctrl+K` or `Cmd+K` | Focus search input |
| `G` | Toggle grid/list view |

---

## 🎯 USER WORKFLOWS

### Workflow 1: Find Product
```
1. User lands on /markets
2. Sees hero, trending, featured
3. Types in search (Ctrl+K)
4. Results filter in real-time
5. Clicks product → detail page
```

### Workflow 2: Browse by Category
```
1. User clicks category in sidebar
2. URL updates (bookmarkable)
3. Products filter by category
4. Can combine with search/tags
```

### Workflow 3: Compare Products
```
1. User hovers product card
2. Clicks compare button (GitCompare icon)
3. Up to 3 products selected
4. Compare panel appears at bottom
5. Shows side-by-side comparison
6. Can remove or clear all
```

### Workflow 4: Manage Favorites
```
1. User clicks bookmark icon
2. Product added to favorites
3. Stored in localStorage
4. Favorite status persists
5. User can filter by recently viewed
```

---

## 🚀 PERFORMANCE OPTIMIZATIONS

### Used
- `useMemo()` - Filter, sort, pagination
- `useDeferredValue()` - Smooth typing experience
- `useCallback()` - Event handler memoization
- `React.lazy()` - Code splitting (product pages)
- API caching - 2-5 min TTL
- localStorage caching - User preferences
- Image lazy loading - `loading="lazy"`
- Skeleton loading states

### Not Implemented (Opportunities)
- Virtual scrolling (long lists)
- Image CDN optimization
- Service worker caching
- Compression (gzip/brotli)

---

## 📱 RESPONSIVE BREAKPOINTS

- **Mobile:** < 768px (sidebar hidden, overlay on tap)
- **Tablet:** 768px - 1024px (sidebar hidden, filters modal)
- **Desktop:** > 1024px (sidebar sticky, always visible)
- **Wide:** > 1500px (extra wide grid, max-width constraint)

---

## 🔐 AUTHENTICATION

```typescript
const { isAuthenticated } = useAuth()

// Navigation guard
const handleNavigate = (slug) => {
  if (!isAuthenticated) 
    navigate('/login')
  else 
    navigate(`/product/${slug}`)
}
```

---

## 📚 RELATED FILES

**Core**
- `/apis/market.ts` - API integration
- `/types.ts` - TypeScript interfaces
- `/data.ts` - Hardcoded seed data

**Components**
- `/components/market/SolutionCard.tsx`
- `/components/market/ProductToolModal.tsx`
- `/components/market/MarketSectionHeader.tsx`
- `/components/market/MarketSkeleton.tsx`

**Hooks**
- `useLanguage()` - Language context
- `useAuth()` - Authentication context
- `useSearch()` - Search context
- `usePageMeta()` - SEO meta tags

**Pages**
- `/pages/SolutionDetail.tsx` - Product detail (dynamic route)
- `/pages/videos/StoryboardStudioPage.tsx`
- `/pages/images/PaperclipAIAgents.tsx`

---

## 🐛 DEBUGGING

### Enable Detailed Logging
```javascript
// In browser console
localStorage.setItem('debug', 'true')
// Then check Network tab for API calls
```

### Check State
```javascript
// In React DevTools
- Click on MarketsPage component
- Check props and state values
- Watch hooks execution
```

### API Responses
```javascript
// In Network tab
1. Filter by /market endpoint
2. Check Request/Response
3. Verify cache headers
```

---

Generated: April 12, 2026
