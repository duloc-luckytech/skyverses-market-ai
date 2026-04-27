# Exploration Index - Skyverses Market AI Codebase

**Generated:** April 13, 2026  
**Project:** `/Users/duloc/Desktop/SKYVERSES/ai-skyverses/skyverses-market-ai`

---

## 📚 Documentation Files Created

### 1. **CODEBASE_EXPLORATION_COMPLETE.md** ⭐
**Size:** ~50 KB | **Scope:** Comprehensive  

Complete exploration with:
- ✅ Search results for "add_new_product" → `scripts/add-market-product.ts`
- ✅ Full `types.ts` content with all interfaces
- ✅ Complete pages directory listing (62+ pages)
- ✅ Components/market directory inventory
- ✅ All routes in App.tsx (70+ routes)
- ✅ Form/wizard/stepper patterns found
- ✅ Hook patterns for product management
- ✅ API integrations
- ✅ Component directory structure (24 dirs)
- ✅ CLI script details with MarketProduct interface
- ✅ Summary table and key findings

**Use This For:** Deep dive into architecture

---

### 2. **TYPES_AND_INTERFACES.md** ⭐
**Size:** ~9 KB | **Scope:** TypeScript Types

Complete TypeScript type reference:
- Complete `types.ts` file (102 lines)
- `ProductSubmission` interface (all form fields)
- `ProductSubmissionPayload` (API payload)
- `MarketProduct` interface (admin script)
- Form configuration constants
- Home block categories
- Type relationships diagram
- Language support details
- Platform/demo type/complexity enums

**Use This For:** Type system reference, API contracts

---

### 3. **QUICK_START_GUIDE.md** ⭐
**Size:** ~9 KB | **Scope:** Practical

Step-by-step guide:
- Key files to know
- 2 methods for adding products (CLI + Web)
- Form structure with examples
- Home block categories
- Product routing
- Type definitions
- Validation rules
- API endpoints
- Directory structure
- Tips and best practices

**Use This For:** Getting started quickly

---

## 🔍 Key Findings Summary

### ✅ Product Management System Found

**CLI Script:** `scripts/add-market-product.ts`
- Add/update marketplace products via API
- Dry-run mode for testing
- Batch processing
- Product listing command

**Web Wizard:** `components/apps/SubmissionFormSteps.tsx`
- 4-step user submission form
- All form fields validated
- Auto-filled creator info
- Success overlay

**API:** `apis/product-submission.ts`
- POST `/product-submission` endpoint
- GET `/product-submission/mine` endpoint

**Form Hook:** `hooks/useAppsPage.ts`
- ProductSubmission interface (20+ fields)
- Form state management
- Auto-slug generation
- Platform toggle logic

---

## 📂 File Inventory

### Search Result: "add_new_product" Type Files
```
✅ FOUND: scripts/add-market-product.ts (221 lines)
✅ Related: hooks/useAppsPage.ts (200+ lines)
✅ Related: components/apps/SubmissionFormSteps.tsx (515 lines)
✅ Related: apis/product-submission.ts (67 lines)
❌ NOT FOUND: AddNewProduct.tsx, addNewProduct.ts (not in codebase)
```

### Types.ts Structure
```
8 Major Interfaces:
├── Language type
├── LocalizedString
├── NeuralStackItem
├── HomeBlock
├── GeminiKey
├── SystemConfig
├── Solution ⭐ (PRIMARY PRODUCT TYPE)
├── UseCase
├── PricingPackage
└── BookingFormData
```

### Pages Directory
```
62+ Files Total:
├── 36 Main pages (.tsx in root)
├── 16+ Image pages (pages/images/)
├── 6+ Video pages (pages/videos/)
├── 4+ Audio pages (pages/audio/)
└── Multiple other subdirectories
```

### Components/Market Directory
```
7 Files:
├── FeaturedSection.tsx
├── MarketSectionHeader.tsx
├── MarketSkeleton.tsx
├── ProductQuickViewModal.tsx ← Main product modal
├── ProductToolModal.tsx
├── SolutionCard.tsx
└── SolutionList.tsx
```

### Form/Wizard Patterns
```
2 Major Patterns:
├── OnboardingWizard.tsx (2-step video wizard)
└── SubmissionFormSteps.tsx (4-step product wizard) ⭐
    ├── Step1ProductInfo
    ├── Step2MediaPricing
    ├── Step3Technical
    ├── Step4ReviewSubmit
    ├── FormNavigation
    └── SuccessOverlay

1 Indicator:
└── StepIndicator.tsx (progress tracking)
```

---

## 🚀 Quick Command Reference

### Adding a Product - CLI Method
```bash
# Test first (dry run)
npx ts-node scripts/add-market-product.ts --slug my-product --dry-run

# Deploy
npx ts-node scripts/add-market-product.ts --slug my-product

# List all
npx ts-node scripts/add-market-product.ts --list
```

### Adding a Product - Web Method
```
Navigate to: /apps
Click: Submit New Product
Fill: 4-step form
Submit: Auto-validates each step
```

---

## 📊 Codebase Statistics

| Metric | Count | Location |
|--------|-------|----------|
| Pages (.tsx) | 62+ | `pages/` + subdirs |
| Routes | 70+ | `App.tsx` |
| Components | 100+ | `components/` |
| Component dirs | 24 | `components/*/` |
| Hook files | 30+ | `hooks/` |
| API files | 2+ | `apis/` |
| CLI scripts | 1 | `scripts/add-market-product.ts` |
| Type interfaces | 8 major | `types.ts` |
| Form steps | 4 | SubmissionFormSteps.tsx |
| Languages | 4 | en, vi, ko, ja |

---

## 🎯 Navigation Guide

### For Understanding Product Types
→ Start with: **TYPES_AND_INTERFACES.md**
→ Then read: `types.ts` (102 lines)
→ Review: Solution interface (primary type)

### For Adding New Products
→ Start with: **QUICK_START_GUIDE.md**
→ Choose method: CLI or Web
→ Reference: Form field definitions
→ Deploy: Using CLI or web form

### For Deep Architecture
→ Start with: **CODEBASE_EXPLORATION_COMPLETE.md**
→ Review: Routing in App.tsx
→ Study: Component organization
→ Understand: Data flow through hooks/APIs

### For Form Patterns
→ Read: `components/apps/SubmissionFormSteps.tsx`
→ Study: `hooks/useAppsPage.ts`
→ Reference: `QUICK_START_GUIDE.md` Form section

---

## 📋 Type Hierarchy

```
Solution (Marketplace Product)
├── Localized Fields
│   ├── name: LocalizedString
│   ├── category: LocalizedString
│   └── description: LocalizedString
├── Technical
│   ├── models: string[]
│   ├── neuralStack: NeuralStackItem[]
│   └── demoType: 'text'|'image'|'video'|'automation'
├── Marketplace
│   ├── homeBlocks: string[] (6 categories)
│   ├── order: number (sort)
│   ├── featured: boolean
│   └── isActive: boolean
├── Pricing
│   ├── priceCredits: number
│   └── isFree: boolean
└── Metadata
    ├── tags: string[]
    ├── complexity: 'Standard'|'Advanced'|'Enterprise'
    ├── platforms: ['web','ios','android']
    └── gallery: string[]

ProductSubmission (Form Data)
└── 4 Steps
    ├── Step 1: Basic info (name, slug, category, complexity, descriptions, tags)
    ├── Step 2: Media & Pricing (images, demo, credits, platforms)
    ├── Step 3: Technical (models, features, API, docs)
    └── Step 4: Creator (name, email, studio, website, telegram, notes)
```

---

## 🔗 Related Files

### Product Management Chain
```
1. User submits form → SubmissionFormSteps.tsx
2. Hook manages state → useAppsPage.ts
3. Form validates → ProductSubmission interface
4. API call → productSubmissionApi.submit()
5. Backend endpoint → POST /product-submission
6. Stored as → Solution type in database
```

### Admin Management Chain
```
1. Define product → scripts/add-market-product.ts
2. MarketProduct structure → MarketProduct interface
3. CLI processes → Dry run or deploy
4. API call → POST /market or PUT /market/:id
5. Stored as → Solution type in database
6. Display → SolutionCard, ProductQuickViewModal
```

---

## ✅ Exploration Checklist

- [x] Search for "add_new_product" → Found in `scripts/add-market-product.ts`
- [x] Read `types.ts` → All 8 major interfaces documented
- [x] List `pages/` directory → 62+ files inventoried
- [x] List `components/market/` → 7 files documented
- [x] Read `App.tsx` routes → 70+ routes mapped
- [x] Find form/wizard patterns → 2 wizards + 1 indicator
- [x] Search for "steps/wizard/stepper" → All patterns found
- [x] Document everything → 3 comprehensive guides created

---

## 📖 Documentation Map

```
START HERE
↓
QUICK_START_GUIDE.md (practical overview)
↓
Choose your path:
├─→ TYPES_AND_INTERFACES.md (for type system)
├─→ CODEBASE_EXPLORATION_COMPLETE.md (for architecture)
└─→ This file (for navigation)
```

---

## 🎓 Learning Path

### Beginner (30 minutes)
1. Read QUICK_START_GUIDE.md (9 KB)
2. Review key files list
3. Understand home block categories

### Intermediate (1 hour)
4. Read TYPES_AND_INTERFACES.md (9 KB)
5. Review Form Structure section
6. Study ProductSubmission interface

### Advanced (2 hours)
7. Read CODEBASE_EXPLORATION_COMPLETE.md (50 KB)
8. Study component architecture
9. Review routing system
10. Understand data flow

---

## 🔧 Troubleshooting

**Q: Where do I add new products?**
A: Either:
- CLI: `scripts/add-market-product.ts` (PRODUCTS map)
- Web: `/apps` page (4-step form)

**Q: What's the main product type?**
A: `Solution` interface in `types.ts` (see TYPES_AND_INTERFACES.md)

**Q: How do I validate form fields?**
A: See validation rules in QUICK_START_GUIDE.md or useAppsPage.ts

**Q: Where are products displayed?**
A: Marketplace components in `components/market/` (7 files)

**Q: How do I add translations?**
A: Use LocalizedString: `{ en: '...', vi: '...', ko: '...', ja: '...' }`

---

## 📞 File Cross-References

| Need | File | Lines |
|------|------|-------|
| Types | `types.ts` | 102 |
| Submission form | `components/apps/SubmissionFormSteps.tsx` | 515 |
| Form state | `hooks/useAppsPage.ts` | 200+ |
| API integration | `apis/product-submission.ts` | 67 |
| Admin CLI | `scripts/add-market-product.ts` | 221 |
| Display components | `components/market/*` | ~50 each |
| Wizard example | `components/storyboard-studio/OnboardingWizard.tsx` | 177 |
| Routes | `App.tsx` | 287 |

---

**Generated Documentation:** April 13, 2026  
**All files stored in:** `/Users/duloc/Desktop/SKYVERSES/ai-skyverses/skyverses-market-ai/`

See also:
- CODEBASE_EXPLORATION_COMPLETE.md (comprehensive)
- TYPES_AND_INTERFACES.md (types reference)
- QUICK_START_GUIDE.md (practical guide)
