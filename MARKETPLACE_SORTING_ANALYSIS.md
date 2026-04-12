# Skyverses Marketplace Product Sorting Analysis

**Analysis Date:** April 12, 2026  
**App Location:** `/Users/duloc/Desktop/SKYVERSES/ai-skyverses/skyverses-market-ai/`

---

## 📋 Executive Summary

The Skyverses marketplace displays products on the **"Tất cả" (All)** tab with **limited sorting capabilities**. When viewing "all" products, the system uses a **default "popular" sort**, but the sorting logic is **incomplete** — there is **NO actual "newest first" implementation** based on date fields. Instead, there are only 4 sort modes, with "newest" using a reverse operation that doesn't reflect true temporal ordering.

---

## 🎯 Key Findings

| Finding | Status | Details |
|---------|--------|---------|
| **Newest First Sort** | ❌ NOT IMPLEMENTED | "Newest" simply reverses array order (line 731) — not date-based |
| **Default Sort Order** | ✅ FOUND | "popular" is the default (line 535) |
| **Date/CreatedAt Field** | ❌ NOT PRESENT | Product objects have no `createdAt`, `dateCreated`, or timestamp fields |
| **Order Field** | ⚠️ PARTIAL | `order?: number` exists (types.ts:67) but is **never used in sorting** |
| **Featured Sorting** | ✅ WORKING | `featured` boolean flag exists and affects default display |
| **Sky Partners Ordering** | ✅ WORKING | Partner items are always pushed to end when viewing "ALL" tab |

---

## 📁 File Paths

### Main Components
```
/pages/MarketsPage.tsx                    # Main marketplace page component (1,268 lines)
/types.ts                                 # Type definitions for Solution interface
/data.ts                                  # Static product data (30,437 bytes)
/apis/market.ts                           # API endpoints for fetching products
```

### Supporting Files
```
/context/LanguageContext.tsx              # Language context
/hooks/usePageMeta.tsx                    # Page metadata hook
```

---

## 🔍 Product Interface (Solution Type)

**Location:** `/types.ts` (lines 45-72)

```typescript
export interface Solution {
  _id?: string;                    // MongoDB Internal ID
  id: string;                      // Business ID
  slug: string;
  name: LocalizedString;           // Multi-language support
  category: LocalizedString;
  description: LocalizedString;
  problems: string[];
  industries: string[];
  models?: string[];               // AI models used
  priceCredits?: number;
  isFree?: boolean;
  imageUrl: string;
  gallery?: string[];              // Sub-thumbnails
  neuralStack?: NeuralStackItem[];
  demoType: 'text' | 'image' | 'video' | 'automation';
  tags: string[];
  features: (string | LocalizedString)[];
  complexity: 'Standard' | 'Advanced' | 'Enterprise';
  priceReference: string;
  isActive?: boolean;              // Visibility status
  order?: number;                  // ⚠️ DEFINED BUT UNUSED
  featured?: boolean;              // Used for featured flag
  status?: string;                 // System status field
  homeBlocks?: string[];           // Home page positioning
  platforms?: string[];            // Platform support
}
```

### ❌ Missing Date Fields
- No `createdAt` field
- No `dateCreated` field
- No `updatedAt` field
- No `publishedAt` field
- No timestamp field at all

---

## 🔄 Sort Options

**Location:** `/pages/MarketsPage.tsx` (lines 66-71)

```typescript
const SORT_OPTIONS = [
  { key: 'popular', label: 'Phổ biến nhất' },      // Most Popular (DEFAULT)
  { key: 'newest', label: 'Mới nhất' },            // Newest (NOT DATE-BASED)
  { key: 'name', label: 'Tên A-Z' },              // Name A-Z
  { key: 'relevant', label: 'Liên quan nhất' },    // Most Relevant (Search only)
];
```

---

## 🔧 Sorting Logic Analysis

### Location: `/pages/MarketsPage.tsx` (lines 698-742)

#### 1. **Filtering Phase** (lines 699-722)
Products are filtered based on:
- Search query (name, description, tags)
- Active category
- Free/Featured toggles
- Complexity level
- Platform compatibility
- Tag filters

#### 2. **Sorting Phase** (lines 723-741)

```typescript
if (sortBy === 'relevant' && deferredSearch.trim()) {
  // Relevance scoring (only if searching)
  filtered = filtered
    .map(sol => ({ sol, score: getRelevanceScore(sol, deferredSearch.trim(), currentLang) }))
    .sort((a, b) => b.score - a.score)
    .map(({ sol }) => sol);
} else if (sortBy === 'name') {
  // A-Z alphabetical sort by localized name
  filtered.sort((a, b) => (a.name[currentLang] || '').localeCompare(b.name[currentLang] || ''));
} else if (sortBy === 'newest') {
  // ❌ PROBLEM: Simply reverses the array!
  filtered.reverse();
}
```

#### 3. **Partner Positioning** (lines 734-740)
When viewing "ALL" category:
```typescript
if (activeCategory === 'ALL') {
  filtered.sort((a, b) => {
    const aIsPartner = a.tags?.includes('Sky Partners') ? 1 : 0;
    const bIsPartner = b.tags?.includes('Sky Partners') ? 1 : 0;
    return aIsPartner - bIsPartner;
  });
}
```
**Effect:** Sky Partners are always moved to the end

---

## 🎨 Default Sort Behavior for "Tất cả" Tab

**Location:** `/pages/MarketsPage.tsx` (line 535)

```typescript
const [sortBy, setSortBy] = useState(searchParams.get('sort') || 'popular');
```

### When visiting `/markets` or `/markets?category=ALL`:
1. **Default sort:** `'popular'` (hard-coded fallback)
2. **No special ordering applied** — uses API-returned order (FIFO)
3. **Featured items:** Displayed via separate "Trending" slider component
4. **Recently viewed & Suggested:** Shown above main grid (personalization)

---

## 📊 Category Selection for "Tất cả"

**Location:** `/pages/MarketsPage.tsx` (lines 47-57)

```typescript
const STATIC_CATEGORIES = [
  { key: 'ALL', label: 'Tất cả', icon: LayoutGrid },          // ← THIS IS "ALL"
  { key: 'Video', label: 'Video AI', icon: Video },
  { key: 'Image', label: 'Hình ảnh AI', icon: ImageIcon },
  { key: 'Script', label: 'Kịch bản & Studio', icon: Film },
  { key: 'Audio', label: 'Giọng nói', icon: Mic },
  { key: 'Music', label: 'Nhạc AI', icon: Music },
  { key: 'Automation', label: 'Tự động hóa', icon: Zap },
  { key: '3D', label: '3D & Game', icon: Box },
  { key: 'Sky Partners', label: 'Sky Partners', icon: BadgeCheck, isPartner: true },
];
```

### Filter Logic for "ALL" Tab
**Location:** Lines 706-715

```typescript
const matchCat = activeCategory === 'ALL' ||  // ← Returns TRUE for all products
  (activeCategory === 'Sky Partners'
    ? sol.tags?.some(t => t === 'Sky Partners')
    : (sol.category[currentLang]?.trim().toLowerCase().includes(catKey) || ...)
  );
```

---

## 🔗 API Data Flow

**Location:** `/apis/market.ts`

```typescript
// Fetch all solutions (no server-side sorting specified)
getSolutions: async (params?: { q?: string; category?: string; lang?: Language })
  → GET /market?q=...&category=...&lang=...
  → Returns: { success: boolean; data: Solution[] }
```

**Important:** The API endpoint accepts category parameter, but **MarketsPage always fetches ALL solutions** with no category filter:

```typescript
// Line 627 in MarketsPage.tsx
const [solRes, featRes] = await Promise.all([
  marketApi.getSolutions({ lang: currentLang }),  // ← No category passed!
  marketApi.getRandomFeatured()
]);
```

---

## 📉 Default Display Order on Load

When page loads with **no URL parameters**:

1. **Data fetch:** All solutions returned from API (line 627-631)
2. **Initial sort:** "popular" (default from line 535)
3. **Actual ordering:** **Whatever order the API returns** (no reverse operation for "popular")
4. **Featured overlay:** Trending slider shows random featured items (separate component)
5. **Personalization:** 
   - Recently viewed section
   - Suggested based on category frequency
   - Main grid then follows

---

## 🚨 Issues & Limitations

### 1. **"Newest First" is Fake**
- Uses `filtered.reverse()` (line 731)
- Does NOT sort by date
- Without a `createdAt` field, true date-based sorting is impossible

### 2. **`order` Field is Unused**
- Defined in interface (types.ts:67)
- Never referenced in sorting logic
- Could be used for manual ordering but isn't

### 3. **"Popular" Sort is Undefined**
- No actual "popular" sorting implementation
- Uses whatever order the API returns
- Could be based on view counts, likes, or random

### 4. **No True Newest-First Capability**
- Without timestamps, can't implement genuine "newest first"
- Current `reverse()` just flips array order (harmful if API returns pre-sorted data)

### 5. **Limited Sorting Options**
- Only 4 sort options (vs. common e-commerce platforms with 8-10)
- No "price ascending/descending"
- No "rating highest"
- No "most viewed"

---

## ✅ What Actually Works

| Feature | Status | Notes |
|---------|--------|-------|
| Name A-Z Sort | ✅ | Uses `localeCompare()` for proper localization |
| Relevance Sort | ✅ | Works when searching (uses relevance score algorithm) |
| Featured Filter | ✅ | Shows featured items via `featured: boolean` flag |
| Free Filter | ✅ | Uses `isFree: boolean` field |
| Category Filter | ✅ | Matches against `category[lang]` |
| Complexity Filter | ✅ | Matches `complexity: 'Standard'\|'Advanced'\|'Enterprise'` |
| Platform Filter | ✅ | Checks `platforms: string[]` array |
| Tag Filter | ✅ | Matches against `tags: string[]` array |
| Sky Partners | ✅ | Sorted to end via tag matching |

---

## 📋 Data Sample from data.ts

**Location:** `/data.ts` (lines 45-81)

```typescript
{
  id: 'BACKGROUND-REMOVE-AI',
  slug: 'background-removal-ai',
  name: { en: 'AI Background Remover', vi: 'Xóa Nền AI Pro', ... },
  category: { en: 'Enhancement', vi: 'Tối ưu & Phục chế', ... },
  description: { en: '...', vi: '...', ... },
  imageUrl: 'https://images.unsplash.com/...',
  demoType: 'image',
  tags: ['Remove BG', 'PNG', 'Masking', 'Product'],
  complexity: 'Standard',
  priceCredits: 50,
  isActive: true,
  featured: true,
  // ❌ NO: createdAt, dateCreated, updatedAt, order value
  neuralStack: [
    { name: 'Segment Edge v4', version: 'v4.2', capability: { ... } },
    ...
  ]
}
```

---

## 💡 Recommendations

### To Enable True "Newest First":
1. Add `createdAt: number` (timestamp) to Solution interface
2. Populate `createdAt` for all products
3. Change sort logic (line 730-731):
   ```typescript
   } else if (sortBy === 'newest') {
     filtered.sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));
   }
   ```

### To Enable Manual Ordering:
1. Populate `order: number` field for all products
2. Add to sort options: `{ key: 'manual', label: 'Đề xuất' }`
3. Use `order` for default sort (not "popular")

### To Improve UX:
1. Add more sort options (price, rating)
2. Show sort selection state more clearly
3. Add "Recently added" label to truly new products
4. Consider algorithmic sorting (engagement, views)

---

## 📝 Code References

### URL State Sync (Search & Sort)
- **Lines 552-580:** URL parameter synchronization
- **Line 535:** Default sort initialization
- **Line 534:** Default category initialization

### Filter Application
- **Lines 698-742:** Main filtering & sorting logic
- **Lines 114-127:** Relevance score calculation
- **Lines 747-764:** Category count calculations

### Component Rendering
- **Lines 1100-1104:** Sort selector UI
- **Lines 1145-1168:** Product grid/list rendering
- **Lines 1121-1142:** Loading skeleton

---

## 🔍 Summary Table

| Aspect | Implementation | Date-Based? | Order-Based? | Notes |
|--------|-----------------|------------|-------------|-------|
| **"Tất cả" Tab** | STATIC_CATEGORIES[0] | N/A | N/A | Default tab |
| **Default Sort** | 'popular' | N/A | ❌ No | Hard-coded fallback |
| **Newest Sort** | `reverse()` | ❌ NO | ❌ NO | Fake implementation |
| **Name Sort** | `localeCompare()` | N/A | ✅ YES | Works perfectly |
| **Featured Display** | Separate slider | N/A | N/A | Not in main grid sort |
| **Date Field** | ❌ MISSING | N/A | N/A | Cannot be added without migration |
| **Order Field** | Defined but unused | N/A | ❌ NO | Could be used but isn't |

---

**End of Analysis**
