# 🎯 Codebase Exploration — Quick Findings

## ✅ FOUND: add_new_product Workflow

**Location:** `.agents/workflows/add_new_product.md` (45,561 tokens)

This is a **comprehensive AI agent workflow** that guides the creation of new AI products from blueprint to deployment.

---

## 📊 Codebase Statistics

| Metric | Count |
|--------|-------|
| React Components | 75+ |
| Pages | 36 |
| Custom Hooks | 26 |
| API Modules | 17 |
| Context Providers | 7 |
| Product Workspace Components | 60+ |
| Supported Languages | 4 (EN, VI, KO, JA) |

---

## 🗂️ Key File Locations

### Types & Data
- **Core Types:** `/types.ts` (102 lines)
  - `Solution` interface (product definition)
  - `LocalizedString` interface (4-language strings)
  - `ProductSubmission` (form data interface in hook)

### Products & Marketplace
- **Main Marketplace:** `/pages/MarketPage.tsx` (104 KB)
- **Markets Overview:** `/pages/MarketsPage.tsx` (73 KB)
- **Product Card:** `/components/market/SolutionCard.tsx`
- **Product Submission Form:** `/components/apps/SubmissionFormSteps.tsx`

### APIs & Hooks
- **Market API:** `/apis/market.ts`
  - `getSolutions()`, `createSolution()`, `updateSolution()`, `deleteSolution()`, `toggleActive()`
- **Product Submission Hook:** `/hooks/useAppsPage.ts`
  - Full form logic with multi-step validation

### Routing
- **Main Router:** `/App.tsx`
  - 50+ lazy-loaded routes
  - Code-splitting for performance

---

## 💡 Key Patterns Found

### 1. **Product Definition (Solution Interface)**
```typescript
interface Solution {
  id: string;
  name: LocalizedString;        // Multi-language
  category: LocalizedString;
  description: LocalizedString;
  imageUrl: string;
  priceCredits?: number;
  isFree?: boolean;
  complexity: 'Standard' | 'Advanced' | 'Enterprise';
  platforms?: string[];         // web, ios, android
  isActive?: boolean;           // Visibility toggle
  // ... 15+ more fields
}
```

### 2. **Product Submission Form (4 Steps)**
- **Step 1:** Product Info (name, slug, category, complexity)
- **Step 2:** Media & Pricing (thumbnail, gallery, pricing)
- **Step 3:** Technical (AI models, features, API)
- **Step 4:** Creator Info & Review

### 3. **API Caching Strategy**
```typescript
apiCache.wrap(cacheKey, async () => {
  // Fetch product data
}, 2 * 60 * 1000);  // 2-minute TTL
```

### 4. **Multi-Step Form with Animation**
```typescript
export const Step1ProductInfo = ({ formData, updateField }) => (
  <motion.div key="step1" variants={stepVariants} 
    initial="enter" animate="center" exit="exit">
    {/* Form fields with INPUT_CLASS styling */}
  </motion.div>
);
```

---

## 🛠️ Technology Stack

| Layer | Technologies |
|-------|--------------|
| **Frontend** | React 19, TypeScript 5.4, Vite 5.3 |
| **Styling** | Tailwind CSS 3.4, Framer Motion 12.23 |
| **Routing** | React Router DOM 7.11 |
| **Icons** | Lucide React 0.562 (75+ icons) |
| **3D** | Three.js 0.173 |
| **Export** | JSPDF, PPTXGenJS, jszip |
| **State** | Context API, potentially Zustand |

---

## 🎯 Product Management Features

✅ **Create** — Add new products via `/apps` page  
✅ **Read** — Display on marketplace with caching  
✅ **Update** — Edit product metadata (title, price, etc.)  
✅ **Delete** — Remove products from marketplace  
✅ **Toggle** — Show/hide products (isActive flag)  
✅ **Search** — Filter by name + category + language  
✅ **Multi-Language** — All content in 4 languages  
✅ **Pricing** — Credits-based or free tier  

---

## 📍 Quick Navigation

| Need | File |
|------|------|
| Add new product type | `/types.ts` |
| Create product form | `/components/apps/SubmissionFormSteps.tsx` |
| Product card display | `/components/market/SolutionCard.tsx` |
| API operations | `/apis/market.ts` |
| Form logic | `/hooks/useAppsPage.ts` |
| Routing | `/App.tsx` |
| AI workflow guide | `.agents/workflows/add_new_product.md` |

---

## 🚀 Recommended Next Steps

1. **Read the workflow:** `.agents/workflows/add_new_product.md`
2. **Review types:** `/types.ts` (understand Solution interface)
3. **Check form pattern:** `/components/apps/SubmissionFormSteps.tsx`
4. **Explore API:** `/apis/market.ts` (CRUD operations)
5. **Check routing:** `/App.tsx` (add new product routes)
6. **Create component:** Follow existing workspace patterns

---

**Report Generated:** April 13, 2026  
**Codebase Size:** ~200MB (with node_modules)  
**Language:** TypeScript + React  
**Status:** ✅ Ready for new product development
