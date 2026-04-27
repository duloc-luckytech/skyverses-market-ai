# Marketplace Quick Reference Card

## 🎯 WHAT YOU ASKED FOR

### 1. MarketPage Component File ✅
**Location:** `/pages/MarketPage.tsx` (Main home marketplace)  
**Alternative:** `/pages/MarketsPage.tsx` (Full marketplace with filters)

### 2. How Products Are Loaded ✅
**Primary:** API-based from backend  
**Fallback:** Hardcoded in `/data.ts`

```javascript
// API Call (Primary)
marketApi.getSolutions({ lang, q?, category? })
  → GET /market?q=...&category=...&lang=...
  → 2-min cache

// Hardcoded Data (Fallback)
import { SOLUTIONS } from './data.ts'
```

### 3. Current Product Data ✅

**Hardcoded Products (data.ts):**
- ✅ `paperclip-ai-agents` (Paperclip — AI Org Orchestrator)
- ❌ NO "storyboard" product in data.ts
- ❌ NO "ai agent perclip" exact match

**Total in data.ts:** 11 products

### 4. Market Config Files ✅
**Location:** `/constants/market-config.tsx`

Contains `HOME_BLOCK_OPTIONS` for homepage sections:
- Top Choice
- Image Studio
- Video Studio
- AI Agent Workflow
- Festivals & Events
- Other Apps

### 5. Types Definition ✅
**Location:** `/types.ts`

Key interfaces:
```typescript
interface Solution { ... }           // Product type
interface LocalizedString { ... }    // i18n strings
type Language = 'en' | 'vi' | 'ko' | 'ja'
```

---

## 📋 QUICK FACTS

| Aspect | Details |
|--------|---------|
| **Home Marketplace** | `/pages/MarketPage.tsx` (1000+ lines) |
| **Full Marketplace** | `/pages/MarketsPage.tsx` (1000+ lines) |
| **Product Data File** | `/data.ts` (495 lines, 11 products) |
| **Product Type Definition** | `/types.ts` (Solution interface) |
| **Market Config** | `/constants/market-config.tsx` |
| **API Endpoint** | `GET /market?q=...&category=...&lang=...` |
| **API File** | `/apis/market.ts` |
| **Caching** | 2 min (solutions), 5 min (featured) |
| **Languages** | English, Vietnamese, Korean, Japanese |
| **Product Count** | 11 in data.ts (backend has more) |

---

## 🔍 CRITICAL FINDING

### Storyboard Status
- ✅ Route exists: `/product/storyboard-studio`
- ✅ Page component exists: `/pages/videos/StoryboardStudioPage.tsx`
- ❌ **NOT in `/data.ts` SOLUTIONS array**

**Interpretation:** Storyboard is managed backend-only (not in hardcoded fallback data)

---

## 📝 PRODUCT DATA STRUCTURE

Every product (Solution) must have:

```typescript
{
  id: string,                    // Unique ID
  slug: string,                  // URL slug
  name: { en, vi, ko, ja },      // Multi-language
  category: { en, vi, ko, ja },  // Product category
  description: { en, vi, ko, ja },
  imageUrl: string,              // Thumbnail
  demoType: 'text|image|video|automation',
  tags: string[],                // Search tags
  features: [],                  // Feature list
  complexity: 'Standard|Advanced|Enterprise',
  
  // Optional but common
  priceCredits?: number,         // Cost in credits
  isFree?: boolean,              // Free flag
  featured?: boolean,            // Featured flag
  isActive?: boolean,            // Visibility
  platforms?: ['web', 'ios', 'android']
}
```

---

## 🎨 COMPONENTS YOU'LL USE

### If Modifying Marketplace Display
- `ProductCardGrid` - Grid product cards
- `ProductCardList` - List product cards
- `MarketSectionHeader` - Section headers
- `ProductToolModal` - Quick view modal
- `ComparePanel` - Comparison footer

### If Managing Products
- `marketApi.getSolutions()` - Fetch products
- `marketApi.createSolution()` - Add product
- `marketApi.updateSolution()` - Edit product
- `marketApi.toggleActive()` - Show/hide product

---

## 🔑 KEY FEATURES OF MARKETPLACE

✅ Real-time search (Ctrl+K)  
✅ Category filtering  
✅ Product comparison (max 3)  
✅ Favorites/bookmarks  
✅ Recently viewed history  
✅ Grid & list view toggle  
✅ Multi-language support  
✅ Responsive mobile design  
✅ URL bookmarkable filters  
✅ Animated statistics  

---

## 📁 WHERE TO FIND THINGS

**Need to...**

| Task | File/Location |
|------|---------------|
| Add new product | `/data.ts` → SOLUTIONS array |
| Change product display | `/components/market/ProductCard*.tsx` |
| Modify home page layout | `/pages/MarketPage.tsx` (line 220+) |
| Modify full marketplace | `/pages/MarketsPage.tsx` (line 362+) |
| Add home section | `/constants/market-config.tsx` |
| Change product type | `/types.ts` → Solution interface |
| Make API calls | `/apis/market.ts` |
| Add storyboard to marketplace | Create SOLUTIONS entry for `storyboard-studio` |
| Change cache times | `/apis/market.ts` → TTL parameters |

---

## 🚀 NEXT STEPS

1. **Confirm product names** - Search backend for "AI Agent PerClip"
2. **Check storyboard status** - Is it managed backend-only?
3. **Add storyboard to marketplace** - If needed, add SOLUTIONS entry
4. **Modify filters** - Categories, complexity, platforms are all configurable
5. **Update product data** - Via API endpoint or data.ts file

---

## ⚡ DEBUGGING TIPS

### Products not showing?
1. Check `isActive` field (must be `true` or not set)
2. Check API response: `marketApi.getSolutions()`
3. Check browser console for fetch errors
4. Clear cache: `localStorage.clear()`

### Filter not working?
1. Products must have matching `tags` or `category`
2. Categories auto-detect from products
3. Tags must match exactly (case-sensitive in logic)

### Adding new product?
1. Add to SOLUTIONS array in `/data.ts`
2. Or POST to `/market` API endpoint
3. Set `isActive: true` to show in marketplace

---

Generated: April 12, 2026
