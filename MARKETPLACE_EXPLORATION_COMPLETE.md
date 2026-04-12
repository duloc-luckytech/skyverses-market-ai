# Skyverses Marketplace - Complete Exploration Report

## 1. MARKETPAGE COMPONENT FILES

### Primary Files
- **MarketPage.tsx** - Home marketplace page (comprehensive with featured products, hero section)
- **MarketsPage.tsx** - Full marketplace with filtering, search, comparison features
- **StoryboardStudioPage.tsx** - Storyboard Studio product page (route: `/product/storyboard-studio`)
- **PaperclipAIAgents.tsx** - Paperclip AI Agents product page (route: `/product/paperclip-ai-agents`)

### Key Locations
```
/pages/MarketPage.tsx                    (1000+ lines, home marketplace)
/pages/MarketsPage.tsx                   (1000+ lines, full marketplace with filters)
/pages/videos/StoryboardStudioPage.tsx   (Storyboard product page)
/pages/images/PaperclipAIAgents.tsx      (Paperclip AI Agents product page)
```

---

## 2. PRODUCT DATA SOURCES

### Data Loading Architecture
**Two-tier approach:**

1. **API-Based Loading** (Primary)
   - Products fetched from backend API via `marketApi.getSolutions()`
   - Endpoint: `GET /market?q=...&category=...&lang=...`
   - Supports search, filtering, and language parameters
   - 2-minute cache TTL

2. **Hardcoded Data** (Fallback/Reference)
   - Located in `/data.ts` - contains 11 products
   - Used as seed data or fallback if API unavailable

### API Configuration
```typescript
// File: apis/market.ts
const marketApi = {
  getSolutions: async (params?: { 
    q?: string; 
    category?: string; 
    lang?: Language 
  }): Promise<{ success: boolean; data: Solution[] }>
  
  getRandomFeatured: async (): Promise<{ success: boolean; data: Solution[] }>
  
  updateSolution: async (id: string, payload: Partial<Solution>)
  createSolution: async (payload: Solution)
  deleteSolution: async (id: string)
  toggleActive: async (id: string, isActive: boolean)
}
```

---

## 3. HARDCODED PRODUCT DATA

### Location
File: `/data.ts` (495 lines total)

### Current Products in data.ts (11 total)

| # | Slug | Name (EN) | Category | Type | Price | Free | Featured |
|---|------|-----------|----------|------|-------|------|----------|
| 1 | `background-removal-ai` | AI Background Remover | Enhancement | image | 50 CR | ❌ | ✅ |
| 2 | `paperclip-ai-agents` | Paperclip — AI Org Orchestrator | Agent Automation | automation | 0 (Free) | ✅ | ✅ |
| 3 | `ai-agent-workflow` | Aether Flow Orchestrator | Automation | automation | 500 CR | ❌ | ✅ |
| 4 | `ai-birthday-generator` | AI Birthday Studio | Festivals | image | 150 CR | ❌ | ✅ |
| 5 | `ai-wedding-generator` | AI Wedding Studio | Generative Art | image | 150 CR | ❌ | ✅ |
| 6 | `ai-noel-generator` | AI Noel Studio | Festivals | image | TBD | ❌ | ✅ |
| 7 | `ai-tet-generator` | AI Tet Generator | Festivals | image | TBD | ❌ | ✅ |
| 8 | `image-upscale-ai` | Image Upscale AI | Enhancement | image | TBD | ❌ | ❌ |
| 9 | `nocode-export` | No-Code Export | Export | automation | 0 | ✅ | ❌ |
| 10 | `qwen-chat-ai` | Qwen Chat AI | AI Chat | text | 0 (Free) | ✅ | ✅ |
| 11 | `fibus-video-studio` | Fibus Video Studio | Video | video | License Key | ❌ | ✅ |

### Note
❌ **No "storyboard" product in data.ts hardcoded data**  
The `storyboard-studio` route exists but the product data is NOT in `/data.ts`. It appears to be:
- Route exists: `/product/storyboard-studio`
- Page file: `/pages/videos/StoryboardStudioPage.tsx`
- But NOT in the SOLUTIONS array in data.ts

This suggests:
1. Storyboard is either managed separately (backend-only)
2. Or it's a planned/archived product
3. Or it has its own dedicated page without marketplace listing

---

## 4. TYPES & INTERFACES

### Solution Interface (Main Product Type)
```typescript
interface Solution {
  _id?: string;                          // MongoDB ID
  id: string;                            // Business ID
  slug: string;                          // URL slug
  name: LocalizedString;                 // Multi-language name
  category: LocalizedString;             // Product category
  description: LocalizedString;          // Product description
  problems: string[];                    // Problems solved
  industries: string[];                  // Target industries
  models?: string[];                     // AI models used
  priceCredits?: number;                 // Cost in credits
  isFree?: boolean;                      // Free product flag
  imageUrl: string;                      // Product thumbnail
  gallery?: string[];                    // Additional images
  neuralStack?: NeuralStackItem[];        // AI capabilities
  demoType: 'text' | 'image' | 'video' | 'automation';
  tags: string[];                        // Search tags
  features: (string | LocalizedString)[]; // Features list
  complexity: 'Standard' | 'Advanced' | 'Enterprise';
  priceReference: string;                // Price display text
  isActive?: boolean;                    // Marketplace visibility
  order?: number;                        // Sort order
  featured?: boolean;                    // Featured product flag
  status?: string;                       // System status
  homeBlocks?: string[];                 // Homepage sections
  platforms?: string[];                  // Supported platforms: 'web', 'ios', 'android'
}
```

### LocalizedString Interface
```typescript
interface LocalizedString {
  en: string;
  vi: string;
  ko: string;
  ja: string;
}
```

### Supported Languages
```typescript
type Language = 'en' | 'vi' | 'ko' | 'ja';
```

---

## 5. MARKETPLACE COMPONENTS & FEATURES

### MarketsPage.tsx Features (Full Marketplace)
✅ **Search & Filtering**
- Real-time search with Ctrl+K shortcut
- Category filtering with dynamic category detection
- Complexity levels: Standard, Advanced, Enterprise
- Platform filtering: Web, iOS, Android, Extension
- Tag-based filtering
- Free/Featured toggles

✅ **View Modes**
- Grid view (3 columns, responsive)
- List view (responsive)
- Toggle with 'G' keyboard shortcut

✅ **Sorting**
- Popular (default)
- Newest
- Name (A-Z)

✅ **Advanced Features**
- Product comparison panel (max 3 items)
- Quick preview modal
- Favorites/bookmarks (localStorage)
- Recently viewed items
- Trending slider
- CTA Banner (placement at position 6)
- Pagination (12 items per page)
- Mobile sidebar filters
- Back-to-top button
- URL parameter persistence (bookmarkable filters)

✅ **Statistics**
- Animated counter for total tools
- Free products count
- Featured products count
- Category counts

### MarketPage.tsx Features (Home Marketplace)
✅ **Hero Section**
- Featured product carousel (auto-rotates every 5s)
- Search bar with language support
- Call-to-action buttons

✅ **Home Blocks**
- Dynamic content sections (configured via backend)
- Categories: Top Choice, Image Studio, Video Studio, AI Agent Workflow, Events, Other Apps
- Horizontal scrolling product carousels

✅ **Components Used**
- SolutionCard component
- MarketSectionHeader
- CardSkeleton loading state
- ProductToolModal for quick view
- AIModelsMarquee
- GlobalToolsBar

---

## 6. MARKET CONFIGURATION

### File: `/constants/market-config.tsx`
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
  { 
    id: 'top-choice', 
    label: 'Top Choice',
    subtitle: 'Top choices for superior creative performance',
    icon: <Flame size={14}/>,
    color: 'text-orange-500'
  },
  { 
    id: 'top-image', 
    label: 'Image Studio',
    color: 'text-brand-blue'
  },
  { 
    id: 'top-video', 
    label: 'Video Studio',
    color: 'text-purple-500'
  },
  { 
    id: 'top-ai-agent', 
    label: 'AI Agent Workflow',
    color: 'text-emerald-500'
  },
  { 
    id: 'events', 
    label: 'Festivals & Events',
    color: 'text-rose-500'
  },
  { 
    id: 'app-other', 
    label: 'Other Apps',
    color: 'text-slate-500'
  }
]
```

---

## 7. ADDITIONAL DATA EXPORTS

### Storyboard Samples (data.ts)
```typescript
export const STORYBOARD_SAMPLES = [
  {
    id: 's-dbz',
    title: 'Dragon Ball: Ultra Instinct Rise',
    script: '...' // Anime scene descriptions
  },
  // 4 more samples: Naruto, One Piece, Marvel, Avatar
]
```

### Use Cases & Pricing
```typescript
export const USE_CASES: UseCase[]           // Real-world examples
export const PRICING_PACKAGES: PricingPackage[]  // Pricing tiers
```

---

## 8. ROUTING CONFIGURATION

### App.tsx Route Setup
```typescript
// Lazy-loaded product pages
const pageImports = {
  storyboard: () => import('./pages/videos/StoryboardStudioPage'),
  paperclipAIAgents: () => import('./pages/images/PaperclipAIAgents'),
  // ... other products
}

// Routes
<Route path="/product/storyboard-studio" element={<StoryboardStudioPage />} />
<Route path="/product/paperclip-ai-agents" element={<PaperclipAIAgents />} />
<Route path="/product/:slug" element={<SolutionDetail />} /> // Fallback for dynamic slugs
```

---

## 9. API & DATA FLOW

### Data Flow Diagram
```
MarketsPage Component
    ↓
    ├→ marketApi.getSolutions({ lang, q?, category? })
    │   ↓
    │   API Endpoint: GET /market
    │   ↓
    │   Response: { success, data: Solution[] }
    │   ↓
    │   Cache: 2 min TTL
    │
    ├→ marketApi.getRandomFeatured()
    │   ↓
    │   API Endpoint: GET /market/random/featured
    │   ↓
    │   Cache: 5 min TTL
    │
    └→ localStorage
        ├ skyverses_favorites (bookmarked products)
        ├ skyverses_recently_viewed (last 5 viewed)
        └ (other user preferences)
```

### Caching Strategy
```typescript
// apiCache.wrap(key, fetchFn, TTL)
'market:solutions:...' → 2 minutes
'market:featured' → 5 minutes
Automatic invalidation on CRUD operations
```

---

## 10. KEY FINDINGS

### ✅ Operational Features
1. **Two-tier product system**: Backend API + fallback hardcoded data
2. **Full marketplace page** with advanced filtering & search
3. **Home page** with featured products and category blocks
4. **Product comparison** feature (up to 3 products)
5. **Recent viewing history** and favorites management
6. **Multi-language support** (EN, VI, KO, JA)
7. **Mobile responsive** with sidebar filters
8. **URL persistence** for bookmarkable filter states

### ⚠️ Gaps & Observations
1. **"Storyboard" product is NOT in hardcoded data.ts**
   - Route exists but product data is backend-managed only
   - Suggests separate product management
   
2. **"Paperclip AI Agents" is product #2 in data.ts**
   - Featured: ✅
   - Free: ✅
   - Type: automation
   - Slug: `paperclip-ai-agents`

3. **No "AI Agent PerClip" exact match**
   - Might be renamed or different product
   - Search needed in backend or other files

4. **11 products in hardcoded data**
   - But backend likely has many more
   - API is primary source of truth

---

## 11. HOW PRODUCTS ARE RENDERED

### Grid View (Default)
```tsx
// ProductCardGrid component
- Image with hover overlay
- Free/Featured badges
- Preview & Compare buttons (on hover)
- Bookmark toggle
- Title, description, category
- Complexity level
- Stats: users, rating
- Click → navigate to product detail
```

### List View
```tsx
// ProductCardList component
- Thumbnail on left (180px wide)
- Content on right
- Same features as grid
- Horizontal layout
- Better for detailed comparisons
```

### Recently Viewed Section
```tsx
// Horizontal scroll container
- Last 5 viewed products
- Thumbnail + name + category
- Click to re-open
```

### Trending Slider
```tsx
// Featured products carousel
- Auto-scrolling with left/right buttons
- Position badges (#1, #2, etc)
- Limited to featured products
- Shows only if not searching
```

---

## 12. NEXT STEPS FOR INVESTIGATION

If you need to:
1. **Find "AI Agent PerClip"** → Search backend database or API responses
2. **Add storyboard to marketplace** → Add entry to data.ts SOLUTIONS array
3. **Modify product display** → Edit ProductCardGrid/ProductCardList components
4. **Add new product** → Use marketApi.createSolution() or add to data.ts
5. **Change product data** → Update data.ts or use API endpoints
6. **Add new category** → Categories auto-detect from API products

---

## File Structure Summary
```
/apis/
  └─ market.ts                    (API calls)

/constants/
  └─ market-config.tsx            (Home block options)

/pages/
  ├─ MarketPage.tsx               (Home marketplace ~1000 lines)
  ├─ MarketsPage.tsx              (Full marketplace ~1000 lines)
  ├─ /videos/
  │  └─ StoryboardStudioPage.tsx   (Product page)
  └─ /images/
     └─ PaperclipAIAgents.tsx      (Product page)

/components/market/
  ├─ SolutionCard.tsx             (Product card component)
  ├─ MarketSectionHeader.tsx
  ├─ MarketSkeleton.tsx
  ├─ ProductToolModal.tsx
  └─ MarketFiltersTab.tsx

/types.ts
  └─ Solution, LocalizedString, Language interfaces

/data.ts
  ├─ SOLUTIONS array (11 products)
  ├─ STORYBOARD_SAMPLES
  ├─ USE_CASES
  └─ PRICING_PACKAGES
```

