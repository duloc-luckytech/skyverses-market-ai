# Key Code Sections — Marketplace Sorting

## 1. SORT OPTIONS DEFINITION
**File:** `pages/MarketsPage.tsx` (Lines 66-71)

```typescript
const SORT_OPTIONS = [
  { key: 'popular', label: 'Phổ biến nhất' },
  { key: 'newest', label: 'Mới nhất' },
  { key: 'name', label: 'Tên A-Z' },
  { key: 'relevant', label: 'Liên quan nhất' },
];
```

---

## 2. DEFAULT SORT INITIALIZATION
**File:** `pages/MarketsPage.tsx` (Line 535)

```typescript
const [sortBy, setSortBy] = useState(searchParams.get('sort') || 'popular');
```

✅ **Default:** `'popular'`  
⚠️ **Issue:** No actual "popular" logic implemented

---

## 3. MAIN FILTERING & SORTING LOGIC
**File:** `pages/MarketsPage.tsx` (Lines 698-742)

```typescript
const filteredSolutions = useMemo(() => {
  let filtered = solutions.filter(sol => {
    const q = deferredSearch.trim().toLowerCase();
    const matchSearch = !q ||
      sol.name[currentLang]?.toLowerCase().includes(q) ||
      sol.description[currentLang]?.toLowerCase().includes(q) ||
      sol.tags?.some(t => t.toLowerCase().includes(q));
    
    const catKey = activeCategory.trim().toLowerCase();
    const matchCat = activeCategory === 'ALL' ||  // ← ALL PRODUCTS MATCH
      (activeCategory === 'Sky Partners'
        ? sol.tags?.some(t => t === 'Sky Partners')
        : (
            sol.category[currentLang]?.trim().toLowerCase().includes(catKey) ||
            sol.category.en?.trim().toLowerCase().includes(catKey) ||
            sol.tags?.some(t => t.trim().toLowerCase().includes(catKey)) ||
            sol.demoType?.trim().toLowerCase() === catKey
          )
      );
    
    const matchFree = !showFreeOnly || sol.isFree;
    const matchFeatured = !showFeaturedOnly || sol.featured;
    const matchComplexity = !activeComplexity || sol.complexity === activeComplexity;
    const matchTags = activeTags.length === 0 || activeTags.every(at => sol.tags?.some(st => st.toLowerCase() === at.toLowerCase()));
    const matchPlatform = activePlatform === 'ALL' || !sol.platforms || sol.platforms.length === 0 || sol.platforms.includes(activePlatform);
    
    return matchSearch && matchCat && matchFree && matchFeatured && matchComplexity && matchTags && matchPlatform;
  });

  // ❌ SORT LOGIC PROBLEMS START HERE
  if (sortBy === 'relevant' && deferredSearch.trim()) {
    // ✅ WORKS: Relevance scoring
    filtered = filtered
      .map(sol => ({ sol, score: getRelevanceScore(sol, deferredSearch.trim(), currentLang) }))
      .sort((a, b) => b.score - a.score)
      .map(({ sol }) => sol);
  } else if (sortBy === 'name') {
    // ✅ WORKS: Alphabetical by localized name
    filtered.sort((a, b) => (a.name[currentLang] || '').localeCompare(b.name[currentLang] || ''));
  } else if (sortBy === 'newest') {
    // ❌ BROKEN: Simply reverses array (not date-based!)
    filtered.reverse();
  }
  // If sortBy === 'popular', NO SORTING APPLIED (uses API order)

  // Force Sky Partners to end when viewing ALL
  if (activeCategory === 'ALL') {
    filtered.sort((a, b) => {
      const aIsPartner = a.tags?.includes('Sky Partners') ? 1 : 0;
      const bIsPartner = b.tags?.includes('Sky Partners') ? 1 : 0;
      return aIsPartner - bIsPartner;
    });
  }

  return filtered;
}, [solutions, deferredSearch, activeCategory, sortBy, showFreeOnly, showFeaturedOnly, activeComplexity, activeTags, currentLang, activePlatform]);
```

---

## 4. "TẤT CẢ" (ALL) CATEGORY DEFINITION
**File:** `pages/MarketsPage.tsx` (Line 48)

```typescript
const STATIC_CATEGORIES = [
  { key: 'ALL', label: 'Tất cả', icon: LayoutGrid },  // ← THIS ONE
  { key: 'Video', label: 'Video AI', icon: Video },
  // ... other categories
];
```

---

## 5. SOLUTION INTERFACE (MISSING DATE FIELDS)
**File:** `types.ts` (Lines 45-72)

```typescript
export interface Solution {
  _id?: string;                    // MongoDB Internal ID
  id: string;                      // Business ID
  slug: string;
  name: LocalizedString;
  category: LocalizedString;
  description: LocalizedString;
  problems: string[];
  industries: string[];
  models?: string[];
  priceCredits?: number;
  isFree?: boolean;
  imageUrl: string;
  gallery?: string[];
  neuralStack?: NeuralStackItem[];
  demoType: 'text' | 'image' | 'video' | 'automation';
  tags: string[];
  features: (string | LocalizedString)[];
  complexity: 'Standard' | 'Advanced' | 'Enterprise';
  priceReference: string;
  isActive?: boolean;
  order?: number;                  // ⚠️ DEFINED BUT NEVER USED IN SORTING
  featured?: boolean;
  status?: string;
  homeBlocks?: string[];
  platforms?: string[];
  // ❌ MISSING: createdAt, dateCreated, updatedAt, publishedAt, timestamp
}
```

---

## 6. API FETCH (NO CATEGORY FILTER)
**File:** `pages/MarketsPage.tsx` (Lines 622-636)

```typescript
useEffect(() => {
  const fetchData = async () => {
    setLoading(true);
    try {
      const [solRes, featRes] = await Promise.all([
        marketApi.getSolutions({ lang: currentLang }),  // ← NO category param!
        marketApi.getRandomFeatured()
      ]);
      if (solRes?.data) setSolutions(solRes.data.filter((s: Solution) => s.isActive !== false));
      if (featRes?.data) setFeaturedSolutions(featRes.data);
    } catch (err) { console.error('Markets fetch:', err); }
    finally { setLoading(false); }
  };
  fetchData();
}, [currentLang]);
```

---

## 7. API ENDPOINT DEFINITION
**File:** `apis/market.ts` (Lines 11-31)

```typescript
getSolutions: async (params?: { q?: string; category?: string; lang?: Language }): Promise<{ success: boolean; data: Solution[] }> => {
  const queryParams = new URLSearchParams();
  if (params?.q) queryParams.append('q', params.q);
  if (params?.category && params.category !== 'ALL') queryParams.append('category', params.category);
  if (params?.lang) queryParams.append('lang', params.lang);
  // ⚠️ NOTE: No sorting parameters sent to API

  const cacheKey = `market:solutions:${queryParams.toString()}`;

  return apiCache.wrap(cacheKey, async () => {
    try {
      const url = `${API_BASE_URL}/market${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
      const response = await fetch(url, {
        method: 'GET',
        headers: getHeaders(),
      });
      return await response.json();
    } catch (error) {
      console.error('Market Fetch Error:', error);
      return { success: false, data: [] };
    }
  }, 2 * 60 * 1000); // 2 min cache TTL
};
```

---

## 8. SORT UI SELECTOR
**File:** `pages/MarketsPage.tsx` (Lines 1100-1104)

```typescript
<select value={sortBy} onChange={e => setSortBy(e.target.value)}
  className="text-[12px] px-3 py-1.5 bg-slate-50 dark:bg-white/[0.03] border border-black/[0.04] dark:border-white/[0.04] rounded-lg text-slate-600 dark:text-gray-300 outline-none cursor-pointer">
  {SORT_OPTIONS.map(o => <option key={o.key} value={o.key}>{o.label}</option>)}
</select>
```

---

## 9. PRODUCTS WITHOUT DATE IN DATA.TS
**File:** `data.ts` (Lines 45-81)

```typescript
export const SOLUTIONS: Solution[] = [
  {
    id: 'BACKGROUND-REMOVE-AI',
    slug: 'background-removal-ai',
    name: { 
      en: 'AI Background Remover', 
      vi: 'Xóa Nền AI Pro', 
      ko: 'AI 배경 제거기', 
      ja: 'AI背景削除' 
    },
    category: { en: 'Enhancement', vi: 'Tối ưu & Phục chế', ... },
    description: { en: '...', vi: '...', ... },
    imageUrl: 'https://images.unsplash.com/...',
    demoType: 'image',
    tags: ['Remove BG', 'PNG', 'Masking', 'Product'],
    complexity: 'Standard',
    priceCredits: 50,
    isActive: true,
    featured: true,
    // ❌ NO timestamps, no order value populated
    neuralStack: [
      { name: 'Segment Edge v4', version: 'v4.2', capability: { ... } },
      { name: 'Detail Recovery Node', version: 'v1.0', capability: { ... } }
    ]
  },
  // ... more products without dates
];
```

---

## Summary of Sorting Paths

```
User selects sort option
         ↓
sortBy state updates (line 535)
         ↓
filteredSolutions useMemo triggered (line 698)
         ↓
Apply category filter (matchCat check)
         ↓
Apply other filters (free, featured, complexity, tags, platform)
         ↓
SORT BRANCH:
├─ if sortBy === 'relevant' ✅ → score-based (search only)
├─ else if sortBy === 'name' ✅ → localeCompare()
├─ else if sortBy === 'newest' ❌ → reverse() [NOT DATE-BASED]
└─ else (sortBy === 'popular') ❌ → NO SORTING (API order)
         ↓
Force Sky Partners to end (activeCategory === 'ALL')
         ↓
Return filtered array
         ↓
Paginate with visibleCount (line 744)
         ↓
Render via ProductCardGrid/ProductCardList
```

