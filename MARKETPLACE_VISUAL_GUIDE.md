# Marketplace Architecture - Visual Guide

## 1. Product Data Structure Hierarchy

```
Solution (Frontend Type)
│
├─ Identification
│  ├─ id: "STORYBOARD-STUDIO"
│  └─ slug: "storyboard-studio"
│
├─ Localized Fields (LocalizedString: { en, vi, ko, ja })
│  ├─ name
│  ├─ category
│  ├─ description
│  └─ features
│
├─ Display Control
│  ├─ isActive: true/false
│  ├─ featured: true/false
│  ├─ homeBlocks: ["video_studio", "top_trending"]
│  └─ order: 0
│
├─ Content
│  ├─ imageUrl
│  ├─ gallery: []
│  ├─ demoType: "video" | "image" | "text" | "automation"
│  └─ tags: []
│
├─ AI/Technical
│  ├─ models: ["model1", "model2"]
│  ├─ neuralStack: [{ name, version, capability }]
│  └─ complexity: "Standard" | "Advanced" | "Enterprise"
│
├─ Metadata
│  ├─ problems: []
│  ├─ industries: []
│  └─ platforms: ["web", "ios", "android"]
│
└─ Pricing
   ├─ priceCredits: 100
   ├─ isFree: false
   └─ priceReference: "100 CR / project"
```

---

## 2. Product Lifecycle Flow

```
┌────────────────────────────────────────────────────────────┐
│              PRODUCT LIFECYCLE - STORYBOARD STUDIO         │
└────────────────────────────────────────────────────────────┘

CREATION / MANAGEMENT
┌─────────────────────────────────────────────────────────────┐
│ Admin Panel / MongoDB Direct / Seed Scripts                 │
│ - Create MarketItem document                                │
│ - Set: id, slug, name (localized), category, homeBlocks     │
│ - Upload: imageUrl, features, neuralStack                   │
│ - Set: isActive: true, featured: true (optional)            │
└────────────────┬──────────────────────────────────────────┘
                 │
STORAGE          │
┌────────────────▼─────────────────────────────────────────┐
│ MongoDB (skyverses-backend)                              │
│ Collection: MarketItem                                   │
│ Document:                                                │
│ {                                                        │
│   id: "STORYBOARD-STUDIO",                              │
│   slug: "storyboard-studio",                            │
│   name: { en: "Storyboard Studio", vi: "...", ... },    │
│   homeBlocks: ["video_studio"],                         │
│   isActive: true,                                       │
│   ...                                                    │
│ }                                                        │
└────────────────┬─────────────────────────────────────────┘
                 │
API              │
┌────────────────▼─────────────────────────────────────────┐
│ Express Routes: /market                                  │
│ GET /market?q=...&category=...&lang=en                 │
│ GET /market/random/featured                            │
│ POST/PUT/DELETE /market/:id (admin)                    │
└────────────────┬─────────────────────────────────────────┘
                 │
FRONTEND         │
FETCHING    ┌────▼───────────────────────────────────────────┐
            │ marketApi.getSolutions()                       │
            │ marketApi.getRandomFeatured()                  │
            └────┬───────────────────────────────────────────┘
                 │
            ┌────▼───────────────────────────────────────────┐
            │ Response: { success, data: Solution[] }        │
            │ Cache: 2 min (solutions), 5 min (featured)     │
            └────┬───────────────────────────────────────────┘
                 │
DISPLAY    ┌─────┴──────────────────────────────────────────┐
           │ Rendered by:                                    │
           ├─ MarketPage (home with categories)             │
           ├─ CategoryPage (filtered by /category/:id)      │
           ├─ MarketsPage (advanced browsing)               │
           ├─ SolutionCard (individual card)                │
           └─ StoryboardStudioPage (dedicated page)         │
                 │
INTERACTION┌─────▼──────────────────────────────────────────┐
           │ User Actions:                                   │
           ├─ Click card → route to /product/storyboard-... │
           ├─ Bookmark → save to localStorage               │
           ├─ Like/Heart → update local state              │
           └─ Search → filter and re-render                 │
                 │
DESTINATION└─────►  /product/storyboard-studio
                     └─ StoryboardStudioPage component
                     └─ Full product page with features
```

---

## 3. Category & Filtering System

```
┌─────────────────────────────────────────────────────────┐
│           CATEGORY STRUCTURE (TWO-LEVEL)                │
└─────────────────────────────────────────────────────────┘

LEVEL 1: HOME BLOCKS (Primary Organization)
┌──────────────────────────────────────────────────────────┐
│ Defined in: /constants/market-config.tsx                 │
│ stored in: SystemConfig.marketHomeBlock                  │
│                                                          │
│  ┌─ top-choice (Featured Products)                      │
│  │   └─ Featured = true products                         │
│  │                                                       │
│  ├─ top-image (Image Studio)                            │
│  │   ├─ AI Image Generator                              │
│  │   ├─ Image Upscale AI                                │
│  │   └─ ... other image products                        │
│  │                                                       │
│  ├─ top-video (Video Studio)                            │
│  │   ├─ AI Video Generator                              │
│  │   ├─ Storyboard Studio ◄── TARGET                    │
│  │   ├─ Avatar Lipsync AI                               │
│  │   └─ ... other video products                        │
│  │                                                       │
│  ├─ top-ai-agent (AI Agent Workflow)                    │
│  │   ├─ AI Agent Workflow                               │
│  │   └─ ... other automation products                   │
│  │                                                       │
│  ├─ events (Events/Festivals)                           │
│  │   ├─ AI Birthday Generator                           │
│  │   ├─ AI Wedding Generator                            │
│  │   └─ ... event-specific products                     │
│  │                                                       │
│  └─ app-other (Other Apps)                              │
│      ├─ Various misc products                            │
│      └─ ...                                              │
│                                                          │
└──────────────────────────────────────────────────────────┘

LEVEL 2: CATEGORY FIELD (Secondary Classification)
┌──────────────────────────────────────────────────────────┐
│ Defined in: Solution.category (LocalizedString)         │
│ Used for: MarketsPage filtering                          │
│                                                          │
│  Video, Image, Audio, Music, Automation,                │
│  Enhancement, 3D, Sky Partners, ...                      │
│                                                          │
│ Example for storyboard-studio:                          │
│ category: { en: "Video", vi: "Video", ko: "Video", ... }│
│                                                          │
└──────────────────────────────────────────────────────────┘

HOW THEY WORK TOGETHER:
┌──────────────────────────────────────────────────────────┐
│ storyboard-studio Product:                               │
│                                                          │
│ homeBlocks: ["video_studio"]  ◄── WHERE to display     │
│    ↓                                                     │
│    Shows in: MarketPage → Video Studio section          │
│              CategoryPage /category/top-video           │
│                                                          │
│ category: { en: "Video" }  ◄── WHAT type              │
│    ↓                                                     │
│    Filterable on: MarketsPage                           │
│    Displayed as: "Video" badge on card                  │
│                                                          │
│ Both must be set correctly for product to be findable!  │
│                                                          │
└──────────────────────────────────────────────────────────┘
```

---

## 4. Page Architecture

```
┌─────────────────────────────────────────────────────────────┐
│               MARKETPLACE PAGE LAYOUTS                       │
└─────────────────────────────────────────────────────────────┘

MarketPage (/)
┌───────────────────────────────────────────────────────────┐
│ PURPOSE: Main homepage with hero & categorized products  │
│ COMPONENTS:                                               │
│                                                           │
│  ┌─ Hero Section                                          │
│  │  └─ Featured products carousel (5 items)              │
│  │                                                        │
│  ├─ Search Bar                                           │
│  │  └─ Query + Primary category dropdown                 │
│  │                                                        │
│  ├─ Category Sections (HomeBlocks)                       │
│  │  ├─ Top Choice                                        │
│  │  ├─ Image Studio                                      │
│  │  ├─ Video Studio   ◄── Storyboard Studio here        │
│  │  │   ├─ SolutionCard (Storyboard Studio)             │
│  │  │   ├─ SolutionCard (AI Video Generator)            │
│  │  │   └─ ...                                           │
│  │  ├─ AI Agent Workflow                                │
│  │  ├─ Events                                            │
│  │  └─ Other Apps                                        │
│  │                                                        │
│  └─ Footer Info                                          │
│                                                           │
└───────────────────────────────────────────────────────────┘

CategoryPage (/category/:id)
┌───────────────────────────────────────────────────────────┐
│ PURPOSE: View all products in one category               │
│ EXAMPLE: /category/top-video                             │
│                                                           │
│  ┌─ Category Header                                       │
│  │  ├─ Icon (Video)                                      │
│  │  ├─ Title (Video Studio)                              │
│  │  └─ Subtitle                                          │
│  │                                                        │
│  ├─ Featured Product Showcase                            │
│  │  └─ Large featured item from category                │
│  │                                                        │
│  ├─ Search Within Category                               │
│  │  └─ Filter by name/slug/tags                          │
│  │                                                        │
│  ├─ Solution List                                        │
│  │  ├─ SolutionCard (Video Generator)                    │
│  │  ├─ SolutionCard (Storyboard Studio)   ◄── Here      │
│  │  ├─ SolutionCard (Avatar Lipsync AI)                 │
│  │  └─ ... more products                                │
│  │                                                        │
│  └─ Explore More Section                                 │
│                                                           │
└───────────────────────────────────────────────────────────┘

MarketsPage (/markets)
┌───────────────────────────────────────────────────────────┐
│ PURPOSE: Advanced browsing with filters & pagination     │
│                                                           │
│  ┌─ Trending Slider                                       │
│  │  └─ Top 5 trending products                            │
│  │                                                        │
│  ├─ Recently Viewed                                       │
│  │  └─ Last 5 products viewed                             │
│  │                                                        │
│  ├─ Filters (Sidebar)                                     │
│  │  ├─ Category: Video, Image, Audio, ...               │
│  │  ├─ Complexity: Standard, Advanced, Enterprise        │
│  │  ├─ Platform: Web, iOS, Android, Extension           │
│  │  └─ Price: Free, Paid                                │
│  │                                                        │
│  ├─ Sort Options                                         │
│  │  └─ Popular, Newest, Name A-Z                         │
│  │                                                        │
│  ├─ Results Grid (12 items per page)                     │
│  │  ├─ SolutionCard (varied)                             │
│  │  ├─ SolutionCard (might include Storyboard)          │
│  │  └─ ... paginated results                             │
│  │                                                        │
│  └─ Pagination Controls                                  │
│     └─ Previous / Page numbers / Next                    │
│                                                           │
└───────────────────────────────────────────────────────────┘

StoryboardStudioPage (/product/storyboard-studio)
┌───────────────────────────────────────────────────────────┐
│ PURPOSE: Dedicated product showcase page                 │
│                                                           │
│  ┌─ Hero Section                                          │
│  │  ├─ Large product image/video                         │
│  │  └─ Call-to-action buttons                            │
│  │                                                        │
│  ├─ Product Info                                         │
│  │  ├─ Title: Storyboard Studio                          │
│  │  ├─ Description                                       │
│  │  └─ Stats (users, engagement)                         │
│  │                                                        │
│  ├─ Features Section (6 features)                        │
│  │  ├─ AI Script Splitting (with image)                 │
│  │  ├─ Visual Character Anchoring                        │
│  │  ├─ Batch Image Generation                            │
│  │  ├─ AI Video Rendering                                │
│  │  ├─ Visual Timeline                                   │
│  │  └─ Export & Pipeline                                 │
│  │                                                        │
│  ├─ Workflow Steps (4 steps)                             │
│  │  ├─ 01 Script Input                                   │
│  │  ├─ 02 AI Scene Splitting                             │
│  │  ├─ 03 Generate Images & Videos                       │
│  │  └─ 04 Export & Download                              │
│  │                                                        │
│  ├─ Demo Samples                                         │
│  │  ├─ Dragon Ball (sample)                              │
│  │  ├─ Naruto (sample)                                   │
│  │  ├─ One Piece (sample)                                │
│  │  ├─ Marvel (sample)                                   │
│  │  └─ Avatar (sample)                                   │
│  │                                                        │
│  ├─ Use Cases / Testimonials                             │
│  │                                                        │
│  ├─ Pricing / Subscription Info                          │
│  │                                                        │
│  ├─ Interactive Demo Workspace                           │
│  │                                                        │
│  └─ Related Products Section                             │
│     └─ Other video products                              │
│                                                           │
└───────────────────────────────────────────────────────────┘
```

---

## 5. Routing Hierarchy

```
┌──────────────────────────────────────────────────────────┐
│          REACT ROUTER ROUTE PRIORITY ORDER              │
└──────────────────────────────────────────────────────────┘

Routes are evaluated top-to-bottom in /App.tsx

1. SPECIFIC ROUTES (Checked First)
   ├─ /login                          → LoginPage
   ├─ /product/background-removal-ai  → BackgroundRemovalAI
   ├─ /product/social-banner-ai       → SocialBannerAI
   ├─ /product/ai-agent-workflow      → ProductAIAgentWorkflow
   ├─ /product/storyboard-studio      → StoryboardStudioPage  ◄── EXACT MATCH
   ├─ /product/fibus-video-studio     → FibusVideoStudio
   ├─ ... more specific product routes ...
   │
   ▼ (If no specific match, continue)

2. GENERIC ROUTES (Checked Second)
   ├─ /                               → MarketPage
   ├─ /category/:id                   → CategoryPage
   ├─ /markets                        → MarketsPage
   ├─ /product/:slug                  → SolutionDetail ◄── FALLBACK
   │  (For products without specific routes)
   ├─ ... other generic routes ...
   │
   ▼ (If no match, continue)

3. CATCH-ALL ROUTE
   └─ *                               → Navigate to /

KEY POINTS:
- Specific routes are declared BEFORE generic routes
- /product/storyboard-studio is checked BEFORE /product/:slug
- Only the FIRST matching route is rendered
- This allows dedicated pages for important products
- Other products use generic /product/:slug with API fetch
```

---

## 6. Data Flow Sequence Diagram

```
┌────────────────────────────────────────────────────────────┐
│      SEARCHING FOR "STORYBOARD" - SEQUENCE OF EVENTS      │
└────────────────────────────────────────────────────────────┘

USER TYPES "storyboard" IN SEARCH
        │
        ▼
   MarketPage.handleSearch()
        │
        ├─ setState({ query: "storyboard" })
        │
        ▼
   useEffect([query]) triggers
        │
        ├─ Call: marketApi.getSolutions({
        │         q: "storyboard",
        │         lang: "en"
        │       })
        │
        ▼
   Frontend API Client (/apis/market.ts)
        │
        ├─ Check cache: "market:solutions:q=storyboard&lang=en"
        ├─ Cache miss → proceed
        │
        ▼
   fetch("${API_BASE_URL}/market?q=storyboard&lang=en")
        │
        ▼
   Backend Express Route (/skyverses-backend/src/routes/market.ts)
        │
        ├─ GET /market?q=storyboard&lang=en
        │
        ├─ Parse query:
        │  └─ keyword: "storyboard"
        │  └─ lang: "en"
        │
        ├─ Build MongoDB filter:
        │  └─ $or: [
        │      { name.en: /storyboard/i },
        │      { description.en: /storyboard/i },
        │      { tags: /storyboard/i },
        │      { models: /storyboard/i },
        │      ...
        │    ]
        │
        ▼
   MongoDB Query
        │
        ├─ Find matching documents
        ├─ Results:
        │  └─ [
        │      {
        │        id: "STORYBOARD-STUDIO",
        │        slug: "storyboard-studio",
        │        name: "Storyboard Studio",
        │        homeBlocks: ["video_studio"],
        │        ...
        │      },
        │      ... other matches ...
        │    ]
        │
        ▼
   Response to Frontend
        │
        ├─ { success: true, data: [Solution[], ...] }
        │
        ▼
   API Cache Store (2 min TTL)
        │
        ├─ Cache key: "market:solutions:q=storyboard&lang=en"
        ├─ Value: response.data
        │
        ▼
   Frontend setState
        │
        ├─ setSolutions([...])
        │
        ▼
   useMemo(filteredSolutions)
        │
        ├─ Filter by:
        │  ├─ homeBlocks includes target category
        │  └─ search query match
        │
        ├─ Result: [
        │    {
        │      id: "STORYBOARD-STUDIO",
        │      slug: "storyboard-studio",
        │      name: "Storyboard Studio",
        │      homeBlocks: ["video_studio"],
        │      ...
        │    }
        │  ]
        │
        ▼
   Render SolutionCard Components
        │
        ├─ Display for each product:
        │  ├─ Image
        │  ├─ Category badge: "Video"
        │  ├─ Title: "Storyboard Studio"
        │  ├─ Description
        │  ├─ Stats
        │  ├─ Price
        │  └─ Action buttons
        │
        ▼
   USER SEES RESULTS
        │
        └─ Can click card to navigate to:
           /product/storyboard-studio
```

---

## 7. Component Hierarchy (MarketPage)

```
MarketPage
│
├─ GlobalToolsBar
│  └─ Search input (controlled by SearchContext)
│
├─ Featured Section (FeaturedSection)
│  └─ SolutionCard[] (5 featured products)
│
├─ HomeBlocks Loop
│  │  for each HomeBlock from systemConfig
│  │
│  ├─ MarketSectionHeader
│  │  ├─ Block title
│  │  └─ Scroll buttons (left/right)
│  │
│  └─ Horizontal Scroll Container
│     └─ SolutionCard[]
│        for each product in block.homeBlocks
│
└─ ProductToolModal (if opened)
   └─ Quick view modal for product details

KEY COMPONENT:
SolutionCard (Memoized)
├─ Receives: Solution, stats, callbacks
├─ Renders:
│  ├─ Image with hover zoom
│  ├─ Category badge
│  ├─ Title + Description
│  ├─ Stats (users/likes)
│  ├─ Price/Free badge
│  ├─ Favorite bookmark button
│  ├─ Like/Heart button
│  └─ Action buttons (Quick View, Detail)
├─ Handlers:
│  ├─ onClick: navigate to /product/:slug
│  ├─ onFavorite: save to localStorage
│  └─ onLike: update local state
```

---

## 8. Product Visibility Decision Tree

```
┌────────────────────────────────────────────────────┐
│  SHOULD "STORYBOARD-STUDIO" BE VISIBLE?           │
└────────────────────────────────────────────────────┘

START
  │
  ▼
Is isActive === true?
  ├─ NO  → HIDDEN (product disabled)
  └─ YES
      │
      ▼
    Is homeBlocks array non-empty?
      ├─ NO  → VISIBLE only via search/direct URL
      └─ YES
          │
          ▼
        Are any homeBlocks keys valid?
          (e.g., "video_studio", "top_choice", etc.)
          │
          ├─ NO  → VISIBLE only via search
          └─ YES
              │
              ▼
            Does current page/context match?
              ├─ MarketPage: Show if homeBlocks contain matching block
              ├─ CategoryPage /category/top-video:
              │  Show if homeBlocks contains "top-video"
              ├─ MarketsPage: Show if category matches & filters pass
              └─ Search results: Always show
                      │
                      ▼
                    Display Settings Applied
                    ├─ order: Display position
                    ├─ featured: Priority in featured section
                    └─ ... other display options
                      │
                      ▼
                    PRODUCT VISIBLE! ✓

FILTERS THAT HIDE PRODUCT:
- isActive: false
- No matching homeBlocks
- Category doesn't match filter
- Complexity doesn't match
- Platform unavailable
- Search query doesn't match
```

---

## 9. State Management Flow

```
┌────────────────────────────────────────────────────┐
│      MARKETPAGE STATE MANAGEMENT (SIMPLIFIED)     │
└────────────────────────────────────────────────────┘

SearchContext (Global)
├─ query: string          ◄── User search input
├─ primary: string        ◄── Primary category filter
├─ secondary: string      ◄── Secondary category
└─ methods: setQuery(), setPrimary(), reset()

MarketPage Local State
│
├─ solutions: Solution[]           ◄── From API
├─ featuredSolutions: Solution[]   ◄── From featured API
├─ homeBlocks: HomeBlock[]         ◄── From config
├─ loading: boolean
├─ isSearching: boolean
│
├─ favorites: string[]             ◄── From localStorage
├─ likedItems: string[]            ◄── Local state
│
├─ isDemoOpen: boolean             ◄── Modal state
├─ featuredIdx: number             ◄── Carousel index
├─ toolModalSlug: string | null    ◄── Quick view modal
│
└─ Derived State (via useMemo)
   └─ filteredSolutions: Solution[]
      (filtered by homeBlocks, search query, etc.)

Effects
├─ useEffect([query, primary])
│  └─ Fetch solutions on query/filter change
│
├─ useEffect([], init)
│  └─ Fetch config & featured on mount
│
└─ useEffect([], favorites)
   └─ Sync favorites to localStorage

Data Flow:
User Input → SearchContext → useEffect → API Call → 
setSolutions → useMemo(filteredSolutions) → 
Render SolutionCard[]
```

---

## 10. File Organization Summary

```
skyverses-market-ai/
│
├─ App.tsx                         ◄── Route definitions
│
├─ types.ts                        ◄── Solution, HomeBlock types
│
├─ data.ts                         ◄── Sample data (STORYBOARD_SAMPLES)
│
├─ constants/
│  └─ market-config.tsx            ◄── HOME_BLOCK_OPTIONS
│
├─ apis/
│  ├─ market.ts                    ◄── getSolutions(), getRandomFeatured()
│  └─ config.ts                    ◄── getSystemConfig()
│
├─ contexts/
│  ├─ SearchContext.tsx            ◄── Global search state
│  ├─ LanguageContext.tsx          ◄── Language selection
│  └─ ...
│
├─ hooks/
│  ├─ usePageMeta.tsx              ◄── SEO metadata
│  └─ ...
│
├─ pages/
│  ├─ MarketPage.tsx               ◄── Homepage
│  ├─ MarketsPage.tsx              ◄── Advanced browsing
│  ├─ CategoryPage.tsx             ◄── Category view
│  ├─ SolutionDetail.tsx           ◄── Generic product page
│  │
│  └─ videos/
│     └─ StoryboardStudioPage.tsx   ◄── Dedicated storyboard page
│
├─ components/
│  ├─ market/
│  │  ├─ SolutionCard.tsx          ◄── Product card
│  │  ├─ MarketSectionHeader.tsx   ◄── Section header
│  │  ├─ FeaturedSection.tsx       ◄── Featured carousel
│  │  ├─ SolutionList.tsx          ◄── List wrapper
│  │  ├─ ProductQuickViewModal.tsx ◄── Quick view modal
│  │  ├─ ProductToolModal.tsx      ◄── Tool modal
│  │  └─ MarketSkeleton.tsx        ◄── Loading skeleton
│  │
│  └─ ...
│
└─ skyverses-backend/
   └─ src/
      ├─ models/
      │  └─ MarketItem.model.ts    ◄── MongoDB schema
      │
      └─ routes/
         └─ market.ts              ◄── API endpoints
```

