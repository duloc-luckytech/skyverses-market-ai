# Quick Start Guide - Product Management

**Location:** `/Users/duloc/Desktop/SKYVERSES/ai-skyverses/skyverses-market-ai`

---

## 📂 Key Files to Know

### Types & Interfaces
- **`types.ts`** - Main product type definitions (`Solution`, `BookingFormData`, `UseCase`, etc.)
- **`TYPES_AND_INTERFACES.md`** - Complete TypeScript interface reference

### Product Management
- **`scripts/add-market-product.ts`** - Admin CLI for adding products
- **`apis/product-submission.ts`** - API client for product submissions
- **`hooks/useAppsPage.ts`** - Form state management hook

### UI Components
- **`components/apps/SubmissionFormSteps.tsx`** - 4-step product submission wizard
- **`components/apps/StepIndicator.tsx`** - Step progress indicator
- **`components/market/`** - Marketplace display components (7 files)

### Pages
- **`pages/AppsPage.tsx`** - Product submission interface
- **`App.tsx`** - Routes configuration

---

## 🚀 Adding a New Product - 2 Methods

### Method 1: Admin CLI (Direct)

```bash
# 1. Edit scripts/add-market-product.ts
# 2. Add to PRODUCTS map:

'my-new-product': {
  slug: 'my-new-product',
  name: {
    en: 'My New Product',
    vi: 'Sản Phẩm Mới Của Tôi',
    ko: '내 새로운 제품',
    ja: '私の新しい製品'
  },
  category: {
    en: 'Image Generation',
    vi: 'Sinh Ảnh AI'
  },
  description: {
    en: 'Product description here...',
    vi: 'Mô tả sản phẩm...'
  },
  imageUrl: 'https://...',
  demoType: 'image',
  homeBlocks: ['app-other'],
  tags: ['ai', 'generator'],
  models: ['Flux', 'Stable Diffusion'],
  industries: ['Marketing'],
  features: [
    { en: 'Feature 1', vi: 'Tính năng 1' },
    { en: 'Feature 2', vi: 'Tính năng 2' }
  ],
  neuralStack: [
    {
      name: 'Flux',
      version: '1.0',
      capability: { en: 'Image generation', vi: 'Sinh ảnh' }
    }
  ],
  complexity: 'beginner',
  priceCredits: 10,
  isFree: false,
  isActive: true,
  status: 'active',
  featured: false,
  order: 50
}

# 3. Test dry run:
npx ts-node scripts/add-market-product.ts --slug my-new-product --dry-run

# 4. Deploy:
npx ts-node scripts/add-market-product.ts --slug my-new-product

# 5. List products:
npx ts-node scripts/add-market-product.ts --list
```

### Method 2: Web Form Wizard

```
1. Navigate to: http://localhost:3000/apps
2. Click "Submit New Product"
3. Fill 4-step form:
   - Step 1: Product name, category, description, tags
   - Step 2: Images, demo URL, pricing, platforms
   - Step 3: AI models, features, API endpoint, docs
   - Step 4: Creator info, review, submit
4. Success notification received
```

---

## 📋 Form Structure (useAppsPage Hook)

### ProductSubmission Interface

```typescript
{
  // STEP 1: Product Info
  productName: string;           // e.g., "AI Image Generator Pro"
  productSlug: string;           // Auto-generated from name
  category: string;              // From PRODUCT_CATEGORIES
  complexity: string;            // 'Standard' | 'Advanced' | 'Enterprise'
  shortDescription: string;      // Max 200 chars
  fullDescription: string;       // Detailed features/use-cases
  demoType: string;              // 'text' | 'image' | 'video' | 'automation'
  tags: string;                  // Comma-separated

  // STEP 2: Media & Pricing
  thumbnailUrl: string;          // Main product image (16:9)
  galleryUrls: string;           // Multi-line URLs
  demoUrl: string;               // Live demo link
  priceCredits: string;          // Number of credits
  isFree: boolean;               // Toggle for free products
  platforms: string[];           // ['web', 'ios', 'android', 'extension', 'api']

  // STEP 3: Technical
  aiModels: string;              // "VEO3, Flux Pro, Kling"
  features: string;              // One per line
  apiEndpoint: string;           // API URL (if applicable)
  documentation: string;         // Docs/README URL

  // STEP 4: Creator Info (auto-filled from auth)
  creatorName: string;
  creatorEmail: string;
  creatorStudio: string;
  creatorWebsite: string;
  creatorTelegram: string;
  additionalNotes: string;
}
```

---

## 🏠 Home Block Categories

When adding to marketplace, use one of these:

```
'top-choice'   → 🔥 Top Choice (featured products)
'top-image'    → 🖼  Image Studio (image tools)
'top-video'    → 🎬 Video Studio (video tools)
'top-ai-agent' → 🤖 AI Agent Workflow
'events'       → 🎁 Lễ hội & Sự kiện (events/holidays)
'app-other'    → ✅ Ứng dụng khác (default/miscellaneous)
```

---

## 🛣️ Product Routes

Once added to marketplace, automatically available at:

```
/product/:slug  → Dynamic product page (SolutionDetail)
```

Example: `/product/my-new-product`

Pre-configured product routes (see App.tsx):

```
/product/ai-image-generator
/product/ai-video-generator
/product/background-removal-ai
/product/social-banner-ai
/product/qwen-chat-ai
... (30+ more)
```

---

## 🔍 Product Type Definitions

### Main Solution Type
**File:** `types.ts`

```typescript
interface Solution {
  _id?: string;              // MongoDB ID
  id: string;                // Business ID
  slug: string;              // URL slug
  name: LocalizedString;     // {en, vi, ko, ja}
  category: LocalizedString;
  description: LocalizedString;
  problems: string[];
  industries: string[];
  models?: string[];         // AI models used
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
  order?: number;
  featured?: boolean;
  status?: string;
  homeBlocks?: string[];     // ['app-other', 'top-image', etc]
  platforms?: string[];      // ['web', 'ios', 'android']
}
```

---

## 🎯 Form Validation

Each step must pass validation before moving forward:

**Step 1 Required:**
- productName
- category
- demoType
- shortDescription

**Step 2 Required:**
- thumbnailUrl
- (priceCredits OR isFree)

**Step 3 Required:**
- features (at least 1)

**Step 4 Required:**
- creatorName
- creatorEmail

---

## 💾 API Endpoints

### Product Submission

```
POST /product-submission
Content-Type: application/json

{
  productName: string;
  productSlug: string;
  category: string;
  complexity: string;
  shortDescription: string;
  fullDescription: string;
  demoType: string;
  tags: string;
  thumbnailUrl: string;
  galleryUrls: string;
  demoUrl: string;
  priceCredits: string;
  isFree: boolean;
  platforms: string[];
  aiModels: string;
  features: string;
  apiEndpoint: string;
  documentation: string;
  creatorName: string;
  creatorEmail: string;
  creatorStudio: string;
  creatorWebsite: string;
  creatorTelegram: string;
  additionalNotes: string;
}

Response: { success: boolean; data?: any; message?: string }
```

### Get User Submissions

```
GET /product-submission/mine
Authorization: Bearer <token>

Response: { success: boolean; data: any[] }
```

---

## 🗂️ Directory Structure

```
/skyverses-market-ai
├── types.ts                           ← Main types
├── App.tsx                            ← Routes
├── components/
│   ├── apps/                          ← Product submission
│   │   ├── SubmissionFormSteps.tsx    ← 4-step form
│   │   ├── StepIndicator.tsx          ← Step progress
│   │   └── ...
│   ├── market/                        ← Marketplace UI
│   │   ├── ProductQuickViewModal.tsx
│   │   ├── SolutionCard.tsx
│   │   └── ...
│   └── storyboard-studio/
│       └── OnboardingWizard.tsx       ← 2-step wizard example
├── pages/
│   ├── AppsPage.tsx                   ← Product submission page
│   ├── MarketPage.tsx                 ← Main marketplace
│   ├── SolutionDetail.tsx             ← Individual product
│   └── ...
├── hooks/
│   ├── useAppsPage.ts                 ← Form state management
│   └── ...
├── apis/
│   └── product-submission.ts          ← API client
├── scripts/
│   └── add-market-product.ts          ← Admin CLI
└── utils/
    └── ...
```

---

## 📊 Summary

| Component | Location | Purpose |
|-----------|----------|---------|
| Types | `types.ts` | Main product type system |
| Form | `components/apps/SubmissionFormSteps.tsx` | 4-step form UI |
| Hook | `hooks/useAppsPage.ts` | Form state management |
| API | `apis/product-submission.ts` | Backend integration |
| CLI | `scripts/add-market-product.ts` | Admin product addition |
| Pages | `pages/AppsPage.tsx` | Submission interface |
| Markets | `components/market/` | Product display |

---

## ✨ Tips

1. **Auto-slug Generation** - Converts product name to URL-safe slug automatically
2. **Localization** - Always provide all 4 language versions (en, vi, ko, ja)
3. **Image Requirements** - Thumbnails should be 16:9 aspect ratio
4. **Pricing** - Either free OR credit-based (cannot be both)
5. **Features** - One per line, will be parsed and displayed as tags
6. **Success Overlay** - Shows confirmation message after successful submission
7. **Step Navigation** - Users can go back and edit previous steps
8. **Validation** - Errors appear inline, prevents progression

---

**For more details, see:** `CODEBASE_EXPLORATION_COMPLETE.md` and `TYPES_AND_INTERFACES.md`
