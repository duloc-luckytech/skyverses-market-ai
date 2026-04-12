# Skyverses Marketplace AI — Codebase Exploration Report

**Date:** April 13, 2026  
**Project:** skyverses-market-ai (React + TypeScript + Vite)  
**Scope:** Complete file structure, types, patterns, and product management components

---

## 🔍 FINDINGS SUMMARY

### 1. **Existing "add_new_product" Workflow** ✅
- **Found:** `.agents/workflows/add_new_product.md` (45,561 tokens)
- **Type:** Comprehensive AI agent workflow (markdown-based automation)
- **Contains:**
  - Step-by-step product creation pipeline
  - AI blueprint generation script (Node.js)
  - Form validation patterns
  - Metadata management (4 languages: EN, VI, KO, JA)
  - Multi-step submission workflow

---

## 📁 PROJECT STRUCTURE

### Root Level
```
/Users/duloc/Desktop/SKYVERSES/ai-skyverses/skyverses-market-ai/
├── App.tsx                    # Main router & layout
├── index.tsx                  # React entry point
├── types.ts                   # Core TypeScript interfaces
├── data.ts                    # Hardcoded marketplace data
├── tailwind.config.ts         # Tailwind CSS config
├── tsconfig.json              # TypeScript config
├── vite.config.ts             # Vite bundler config
├── package.json               # Dependencies (React 19, Vite, Framer Motion)
└── index.html                 # HTML template
```

### Core Application Directories

#### **📄 /pages** (36 pages)
- **Main Pages:**
  - `MarketPage.tsx` (104 KB) — Main marketplace listing & search
  - `MarketsPage.tsx` (73 KB) — Market categories & filtering
  - `CategoryPage.tsx` — Products by category
  - `ExplorerPage.tsx` — Interactive product explorer
  
- **Product Pages (30+ sub-pages):**
  - `/pages/images/` — 12 image AI products (AIImageGenerator, EventStudio, Fashion, etc.)
  - `/pages/videos/` — Video generation pages (Genyu, AvatarLipsync, etc.)
  - `/pages/audio/` — Audio tools (TextToSpeech, Music, Voice)
  - `/pages/slides/` — Slide creator pages

- **User & Admin:**
  - `LoginPage.tsx`, `SettingsPage.tsx`, `CreditsPage.tsx`, `CreditUsagePage.tsx`
  - `AppsPage.tsx` — Product submission & management
  - `AdminMarketCMS.tsx` — Admin CMS interface

#### **🧩 /components** (75+ components)
- **Market Components** (`/components/market/`)
  - `SolutionCard.tsx` — Product card with hover effects
  - `ProductToolModal.tsx` — Quick view modal
  - `ProductQuickViewModal.tsx` — Detailed preview
  - `FeaturedSection.tsx` — Featured products section
  - `MarketSectionHeader.tsx`
  - `MarketSkeleton.tsx` — Loading skeleton

- **Workspace Components** (75+ workspace/editor components)
  - `AIImageGeneratorWorkspace.tsx`
  - `AIVideoGeneratorWorkspace.tsx`
  - `AIStylistWorkspace.tsx`
  - `CharacterSyncWorkspace.tsx`
  - `EventStudioWorkspace.tsx`
  - `PaperclipAIAgentsWorkspace.tsx` (130 KB — largest)
  - And 60+ more...

- **Form Components** (`/components/apps/`)
  - `SubmissionFormSteps.tsx` — Multi-step product submission form
    - Step 1: Product Info (name, slug, category, complexity)
    - Step 2: Media & Pricing (thumbnail, gallery, pricing)
    - Step 3: Technical (AI models, features, API)
    - Step 4: Creator Info & Confirmation

- **Shared Components** (`/components/common/`, `/components/shared/`)
  - Layout, Header, Footer, Modal templates
  - `CommandPalette.tsx` — Command palette interface
  - `ErrorBoundary.tsx` — Error handling

#### **🎣 /hooks** (26 custom hooks)
- **Product-Related:**
  - `useAppsPage.ts` — Product submission form logic (ProductSubmission interface)
  - `useImageGenerator.ts` — Image generation workspace
  - `useSlideStudio.ts` — Slide creation logic
  - `useProductImageEditor.ts` — Image editor logic

- **Feature Hooks:**
  - `useJobPoller.ts` — Async job polling
  - `useProjectManager.ts` — Project management
  - `useFeatureAccess.ts` — Feature flags
  - `useMusicStudio.ts`, `useVideoAnimate.ts`, etc.

#### **🔌 /apis** (17 API clients)
```
apis/
├── config.ts                  # Base URL & headers configuration
├── aiChat.ts                  # Chat/AI communication
├── aiCommon.ts                # Common AI operations
├── market.ts                  # Marketplace CRUD (getSolutions, createSolution, updateSolution, deleteSolution, toggleActive)
├── product-submission.ts      # Product submission API
├── auth.ts                    # Authentication
├── credits.ts                 # Credit/payment management
├── pricing.ts                 # Pricing data
├── user.ts                    # User profile
├── videos.ts                  # Video generation
├── images.ts                  # Image generation
└── ... (11 more)
```

#### **🎨 /context** (7 context providers)
- `AuthContext.tsx` — Authentication state
- `LanguageContext.tsx` — Multi-language support (EN, VI, KO, JA)
- `ThemeContext.tsx` — Dark/light mode
- `SearchContext.tsx` — Global search
- `ToastContext.tsx` — Notifications
- `/context/` full listing available

#### **⚙️ /utils & /services**
- `apiCache.ts` — Response caching layer
- API helper functions
- Utility functions

---

## 📋 TYPESCRIPT TYPES

### Main Types File: `/types.ts` (102 lines)

#### **Solution Interface** (Product Definition)
```typescript
export interface Solution {
  _id?: string;              // MongoDB ID
  id: string;                // Business ID
  slug: string;              // URL slug
  name: LocalizedString;     // Multi-language name
  category: LocalizedString; // Product category
  description: LocalizedString;
  problems: string[];        // Pain points addressed
  industries: string[];      // Target industries
  models?: string[];         // AI models used (gpt3.5, midjourney, etc)
  priceCredits?: number;     // Cost in credits
  isFree?: boolean;          // Free tier availability
  imageUrl: string;          // Thumbnail/cover image
  gallery?: string[];        // Additional images
  neuralStack?: NeuralStackItem[]; // AI capabilities (VEO3, etc)
  demoType: 'text' | 'image' | 'video' | 'automation';
  tags: string[];
  features: (string | LocalizedString)[];
  complexity: 'Standard' | 'Advanced' | 'Enterprise';
  priceReference: string;
  isActive?: boolean;        // Visibility flag
  order?: number;            // Sort order
  featured?: boolean;        // Featured flag
  status?: string;           // System status
  homeBlocks?: string[];     // Homepage sections
  platforms?: string[];      // web, ios, android
}
```

#### **LocalizedString Interface**
```typescript
export interface LocalizedString {
  en: string;
  vi: string;
  ko: string;
  ja: string;
}
```

#### **Other Key Types**
```typescript
export interface NeuralStackItem {
  name: string;
  version: string;
  capability: LocalizedString;
}

export interface HomeBlock {
  key: string;
  title: LocalizedString;
  subtitle: LocalizedString;
  limit: number;
  order: number;
}

export interface SystemConfig {
  plans: any[];
  resolutions: any[];
  aspectRatios: { label: string; value: string }[];
  defaultMaxPrompt: number;
  defaultMaxDuration: number;
  projectExpireHours: number;
  videoExpireHours: number;
  imageExpireHours: number;
  marketHomeBlock: HomeBlock[];
  listKeyGommoGenmini?: GeminiKey[];
  welcomeBonusCredits?: number;
  aiSupportContext?: string;
}

export interface UseCase {
  id: string;
  industry: string;
  problem: string;
  solution: string;
  outcome: string;
  icon: string;
}
```

---

## 🔄 PRODUCT SUBMISSION WORKFLOW

### Hook: `useAppsPage.ts`
Located in: `/hooks/useAppsPage.ts`

#### **ProductSubmission Interface** (Form Data)
```typescript
export interface ProductSubmission {
  // Step 1: Product Info
  productName: string;
  productSlug: string;
  category: string;
  complexity: string;  // Standard | Advanced | Enterprise
  shortDescription: string;
  fullDescription: string;
  demoType: string;
  tags: string;
  
  // Step 2: Media & Pricing
  thumbnailUrl: string;
  galleryUrls: string;
  demoUrl: string;
  priceCredits: string;
  isFree: boolean;
  platforms: string[];
  
  // Step 3: Technical
  aiModels: string;
  features: string;
  apiEndpoint: string;
  documentation: string;
  
  // Step 4: Creator Info (auto-filled from auth)
  creatorName: string;
  creatorEmail: string;
  creatorStudio: string;
  creatorWebsite: string;
  creatorTelegram: string;
  additionalNotes: string;
}
```

#### **Form Configuration Constants**
```typescript
PRODUCT_CATEGORIES = [
  { value: 'video', label: 'Video AI' },
  { value: 'image', label: 'Hình ảnh AI' },
  { value: 'audio', label: 'Giọng nói AI' },
  { value: 'music', label: 'Nhạc AI' },
  { value: 'automation', label: 'Tự động hóa' },
  { value: '3d', label: '3D & Game' },
  { value: 'agent', label: 'AI Agent' },
  { value: 'other', label: 'Khác' }
];

COMPLEXITY_LEVELS = [
  'Standard' | 'Advanced' | 'Enterprise'
];

DEMO_TYPES = [
  'text', 'image', 'video', 'automation'
];

PLATFORM_OPTIONS = [
  'web', 'ios', 'android', 'extension', 'api'
];

SUBMISSION_STEPS = [
  { id: 1, title: 'Thông tin sản phẩm', desc: 'Tên, mô tả, danh mục' },
  { id: 2, title: 'Media & Giá', desc: 'Hình ảnh, demo, pricing' },
  { id: 3, title: 'Kỹ thuật', desc: 'AI models, features, API' },
  { id: 4, title: 'Xác nhận & Gửi', desc: 'Kiểm tra và submit' }
];
```

### Form Component: `SubmissionFormSteps.tsx`
Located in: `/components/apps/SubmissionFormSteps.tsx`

**Features:**
- Multi-step form with validation
- Shared input/select styling
- Animation between steps
- Platform toggle system
- Auto-slug generation from product name
- Field-level error handling

**Input Styling (Reusable):**
```typescript
const INPUT_CLASS = "w-full bg-slate-50 dark:bg-white/[0.03] border border-black/[0.06] dark:border-white/[0.06] rounded-xl px-4 py-3 text-sm font-medium outline-none focus:border-brand-blue focus:ring-1 focus:ring-brand-blue/20 transition-all...";

const SELECT_CLASS = "w-full bg-slate-50 dark:bg-white/[0.03] border border-black/[0.06] dark:border-white/[0.06] rounded-xl px-4 py-3...";

const LABEL_CLASS = "flex items-center gap-1.5 text-xs font-bold text-slate-500 dark:text-gray-400 ml-1";
```

---

## 🗂️ PRODUCT MANAGEMENT API

### Market API: `/apis/market.ts`

```typescript
export const marketApi = {
  // Fetch products
  getSolutions(params?: { q?: string; category?: string; lang?: Language }): Promise<{ success: boolean; data: Solution[] }>
  
  // Fetch random featured products
  getRandomFeatured(): Promise<{ success: boolean; data: Solution[] }>
  
  // Create new product
  createSolution(payload: Solution): Promise<{ success: boolean; data?: Solution }>
  
  // Update existing product
  updateSolution(id: string, payload: Partial<Solution>): Promise<{ success: boolean; message: string }>
  
  // Delete product
  deleteSolution(id: string): Promise<{ success: boolean; message?: string }>
  
  // Toggle visibility
  toggleActive(id: string, isActive: boolean): Promise<{ success: boolean; data?: Solution }>
};
```

**API Cache Strategy:**
- 2-minute TTL for search results
- 5-minute TTL for featured products
- Automatic cache invalidation on CREATE/UPDATE/DELETE

---

## 🎯 PRODUCT CARD PATTERN

### Component: `SolutionCard.tsx` (`/components/market/`)

**Key Features:**
```typescript
interface SolutionCardProps {
  sol: Solution;
  idx: number;
  lang: string;
  isLiked: boolean;
  isFavorited: boolean;
  onToggleFavorite: (e: React.MouseEvent, id: string) => void;
  onToggleLike: (e: React.MouseEvent, id: string) => void;
  onClick: (slug: string) => void;
  onHover?: (slug: string) => void;
  onQuickView?: (e: React.MouseEvent, sol: Solution) => void;
  stats: { users: string; likes: string };
  isGrid?: boolean;
}
```

**Visual Elements:**
- Image hover effects (scale + opacity)
- Overlay action buttons (Quick View, Detail)
- Category badge (top-left)
- Favorite bookmark (top-right)
- Stats footer (users, likes)
- Free/Credit indicator (bottom-right)
- Responsive sizing

---

## 🏗️ ROUTING STRUCTURE

### App.tsx — Route Configuration
```typescript
// Core Pages
/ → MarketPage (main marketplace)
/categories/:id → CategoryPage
/explorer → ExplorerPage
/models → ModelsPage
/apps → AppsPage (product submission)
/app/:slug → AppInterfacePage

// User Features
/login → LoginPage
/credits → CreditsPage
/settings → SettingsPage
/favorites → FavoritesPage
/referral → ReferralPage

// Product Pages
/images/ai-image-generator → AIImageGenerator
/images/event-studio → EventStudioPage
/videos/genyu → GenyuProduct
/audio/tts → TextToSpeech
/slides/ai-slide-creator → AISlideCreatorPage

// Info Pages
/about → AboutPage
/use-cases → UseCasesPage
/pricing → PricingPage
/booking → BookingPage
/policy → PolicyPage

// Dynamic Product Pages (30+ total)
```

---

## 🛠️ TECHNOLOGY STACK

### Frontend
- **React 19.2.3** — Component framework
- **Vite 5.3.1** — Build tool
- **TypeScript 5.4.5** — Type safety
- **Tailwind CSS 3.4.4** — Styling
- **Framer Motion 12.23.26** — Animations

### Routing & State
- **React Router DOM 7.11.0** — Page routing
- **Zustand** — State management (if used)
- **Context API** — Global state (Auth, Language, Theme, Search)

### UI & Animation
- **Lucide React 0.562.0** — Icons (75+ icons used)
- **Framer Motion** — Component animations
- **HTML2Canvas 1.4.1** — Screenshot capture
- **JSPDF 4.2.1** — PDF generation
- **jszip** — ZIP file creation

### 3D & Advanced
- **Three.js 0.173.0** — 3D graphics
- **XYFlow React 12.4.2** — Node graph editor (workflow visualization)
- **PPTXGenJS 4.0.1** — PowerPoint generation

### API & Data
- **Google GenAI 1.34.0** — Gemini API integration
- **Fetch API** — HTTP client (custom wrapper)
- **Local API Cache** — Response caching

---

## 🎨 DESIGN PATTERNS

### 1. **Lazy Loading Pages**
```typescript
// App.tsx pattern
const MarketPage = React.lazy(() => import('./pages/MarketPage'));
const CategoryPage = React.lazy(() => import('./pages/CategoryPage'));

<Suspense fallback={<HomepageSkeleton />}>
  <Routes>
    <Route path="/" element={<MarketPage />} />
  </Routes>
</Suspense>
```

### 2. **Multi-Step Form Pattern**
```typescript
// SubmissionFormSteps.tsx
export const Step1ProductInfo: React.FC<StepProps> = ({ formData, updateField, autoSlug }) => (
  <motion.div key="step1" variants={stepVariants} initial="enter" animate="center" exit="exit">
    {/* Form fields */}
  </motion.div>
);
```

### 3. **Context Providers Architecture**
```typescript
// App.tsx wrapping
<Router>
  <ThemeProvider>
    <LanguageProvider>
      <AuthProvider>
        <SearchProvider>
          <ToastProvider>
            <Routes>...</Routes>
          </ToastProvider>
        </SearchProvider>
      </AuthProvider>
    </LanguageProvider>
  </ThemeProvider>
</Router>
```

### 4. **Hook-Based Component Logic**
```typescript
// Separation of concerns
const useAppsPage = () => {
  const [formData, setFormData] = useState<ProductSubmission>();
  const [currentStep, setCurrentStep] = useState(1);
  
  return {
    formData,
    updateField,
    autoSlug,
    togglePlatform,
    isStepValid,
    handleSubmit
  };
};
```

### 5. **API Cache Wrapper**
```typescript
// /utils/apiCache.ts
apiCache.wrap(cacheKey, async () => {
  // Fetch logic
}, ttlMs);
```

### 6. **Product Card Component**
```typescript
// Reusable card with flexible rendering
<SolutionCard
  sol={solution}
  lang={language}
  isLiked={likes.includes(id)}
  isFavorited={favorites.includes(id)}
  onToggleFavorite={handleFavorite}
  onClick={navigateToProduct}
  stats={{ users: "2.5K", likes: "1.2K" }}
/>
```

---

## 📊 DATA STRUCTURE

### Product Data Flow
1. **Backend Source:** Backend API returns `Solution[]`
2. **Cache Layer:** `apiCache.wrap()` caches for 2-5 minutes
3. **React State:** MarketPage stores filtered/sorted solutions
4. **Component Props:** Solutions passed to `SolutionCard` components
5. **User Interaction:** Click → route to `/product/:slug` or show modal

### Marketplace Sections
- **Featured Products** — Random selection (5-min TTL)
- **Category Sections** — Filtered by `category` field
- **Search Results** — Filtered by `q` query + language
- **Home Blocks** — Positioned via `homeBlocks` array

---

## ✨ KEY FEATURES IMPLEMENTED

### ✅ Multi-Language Support
- Languages: **EN**, **VI**, **KO**, **JA**
- All content stored in `LocalizedString` objects
- Context-based language switching
- URL-based language routing (optional)

### ✅ Product Management
- Create new products (AppsPage)
- Edit existing products (Admin interface)
- Delete products (Market API)
- Toggle visibility (isActive flag)
- Set pricing in credits
- Complexity levels (Standard/Advanced/Enterprise)
- Platform support (web, iOS, Android, extension, API)

### ✅ Search & Filter
- Real-time search by name/description
- Filter by category
- Sort by trending/newest/price
- Search result caching

### ✅ User Features
- Favorites system (bookmark)
- Like/heart system
- User stats (followers, activity)
- Credit-based pricing
- Free tier support

### ✅ Rich Animations
- Framer Motion for all transitions
- Hover effects on cards
- Step transitions in forms
- Skeleton loaders
- Loading states

### ✅ Accessibility
- Semantic HTML (role, aria-label)
- Keyboard navigation (Enter/Space to click)
- Focus management
- Light/dark mode support

---

## 🚀 WORKFLOW FILES REFERENCE

### Agent Workflow: `.agents/workflows/add_new_product.md`
**Purpose:** Full product creation pipeline

**Key Steps:**
1. **STEP 0:** Read architecture skills
2. **STEP 0.5:** AI blueprint generation (via API)
3. **STEP 1:** Create metadata (4 languages)
4. **STEP 3.5:** Landing page blueprint
5. **STEP 6:** Workspace logic implementation
6. **Final:** Deploy to marketplace

**Output:** Complete product with:
- Product data (metadata)
- Landing page components
- Workspace interface
- Documentation

---

## 📍 FILE LOCATIONS QUICK REFERENCE

| Component | Path | Size |
|-----------|------|------|
| Main Types | `/types.ts` | 102 lines |
| Product Submission Form | `/components/apps/SubmissionFormSteps.tsx` | ~300 lines |
| Product Card | `/components/market/SolutionCard.tsx` | ~106 lines |
| Product Hook | `/hooks/useAppsPage.ts` | ~200+ lines |
| Market API | `/apis/market.ts` | 132 lines |
| Main Marketplace Page | `/pages/MarketPage.tsx` | 104 KB |
| Markets Overview Page | `/pages/MarketsPage.tsx` | 73 KB |
| App Router | `/App.tsx` | ~400 lines |
| Add Product Workflow | `.agents/workflows/add_new_product.md` | 45,561 tokens |

---

## 🎯 RECOMMENDED PATTERNS FOR NEW PRODUCTS

### When Adding a New AI Product:

1. **Create Product Component** → Follow `AIImageGeneratorWorkspace.tsx` pattern
2. **Add to types.ts** → Extend `Solution` interface if needed
3. **Create API Hook** → Follow `useImageGenerator.ts` pattern
4. **Add Route in App.tsx** → Lazy-load the new page
5. **Register in Marketplace Data** → Add to seeded products
6. **Use Form Template** → Reference `SubmissionFormSteps.tsx` for input UI
7. **Apply Styling** → Use existing Tailwind classes + dark mode support
8. **Add Animations** → Use Framer Motion with existing variants
9. **Cache Responses** → Use `apiCache.wrap()` for API calls
10. **Multi-language Content** → All strings in `LocalizedString` format

---

## 📝 SUMMARY

The Skyverses marketplace codebase is a **modular, scalable React application** with:
- **75+ reusable components** organized by feature
- **26 custom hooks** for business logic separation
- **17 API client modules** with automatic caching
- **7 context providers** for global state
- **36 product pages** demonstrating various AI tools
- **4-language support** (EN, VI, KO, JA)
- **Complete product submission workflow** (existing in `.agents/workflows/add_new_product.md`)

**Key Insight:** The `add_new_product.md` workflow exists and provides comprehensive guidance for adding products to the marketplace. It includes AI blueprint generation, metadata management, and landing page creation templates.

---

**Generated:** April 13, 2026  
**Analyzed by:** Claude Code Assistant
