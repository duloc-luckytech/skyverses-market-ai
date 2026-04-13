# Codebase Exploration Report - Skyverses Market AI

**Report Date:** April 13, 2026  
**Project Location:** `/Users/duloc/Desktop/SKYVERSES/ai-skyverses/skyverses-market-ai`  
**Scope:** Complete marketplace product management, routing, type system, and form patterns

---

## 📋 EXECUTIVE SUMMARY

This is a comprehensive React/TypeScript application serving as the **Skyverses AI Marketplace**. The codebase includes:
- **37+ Pages** with lazy-loading and code-splitting
- **100+ React Components** organized in modular directories
- **Multi-step Product Submission Wizard** (4 steps)
- **Product Add/Update CLI Script** for admin management
- **Comprehensive Type System** for products and marketplace items
- **Multiple Form Patterns** and stepper/wizard implementations

---

## 1️⃣ SEARCH RESULTS: "add_new_product" / "AddNewProduct" / "addNewProduct"

### ✅ FOUND: `scripts/add-market-product.ts`
**Full Path:** `/Users/duloc/Desktop/SKYVERSES/ai-skyverses/skyverses-market-ai/scripts/add-market-product.ts`

**File Type:** TypeScript CLI Script  
**Purpose:** Admin CLI tool to add/update/create marketplace products via API

**Key Features:**
- Supports batch product creation/update
- Dry-run mode for testing
- List available products command
- Integrates with Skyverses Admin API
- Stores product definitions in a `PRODUCTS` map

**Available Commands:**
```bash
npx ts-node scripts/add-market-product.ts                    # Process all products
npx ts-node scripts/add-market-product.ts --slug ai-slide-creator
npx ts-node scripts/add-market-product.ts --slug ai-slide-creator --dry-run
npx ts-node scripts/add-market-product.ts --list
```

---

## 2️⃣ TYPES.TS - COMPLETE TYPE DEFINITIONS

**File Path:** `/Users/duloc/Desktop/SKYVERSES/ai-skyverses/skyverses-market-ai/types.ts`

### Core Types:

#### 1. **Language Support**
```typescript
export type Language = 'en' | 'vi' | 'ko' | 'ja';

export interface LocalizedString {
  en: string;
  vi: string;
  ko: string;
  ja: string;
}
```

#### 2. **Solution / Product Type** ⭐ (PRIMARY)
```typescript
export interface Solution {
  _id?: string;                           // MongoDB ID
  id: string;                             // Business ID
  slug: string;
  name: LocalizedString;
  category: LocalizedString;
  description: LocalizedString;
  problems: string[];
  industries: string[];
  models?: string[];                      // AI models (gpt3.5, midjourney, etc)
  priceCredits?: number;                  // Credit cost
  isFree?: boolean;
  imageUrl: string;
  gallery?: string[];                     // Gallery images
  neuralStack?: NeuralStackItem[];        // AI models (VEO3, etc)
  demoType: 'text' | 'image' | 'video' | 'automation';
  tags: string[];
  features: (string | LocalizedString)[]; // Plain or localized
  complexity: 'Standard' | 'Advanced' | 'Enterprise';
  priceReference: string;
  isActive?: boolean;                     // Visibility
  order?: number;                         // Sort order
  featured?: boolean;                     // Featured flag
  status?: string;                        // System status
  homeBlocks?: string[];                  // Homepage display positions
  platforms?: string[];                   // 'web', 'ios', 'android'
}
```

#### 3. **NeuralStackItem** (AI Model Stack)
```typescript
export interface NeuralStackItem {
  name: string;
  version: string;
  capability: LocalizedString;
}
```

#### 4. **HomeBlock** (Homepage Configuration)
```typescript
export interface HomeBlock {
  key: string;
  title: LocalizedString;
  subtitle: LocalizedString;
  limit: number;
  order: number;
}
```

#### 5. **SystemConfig** (Global Configuration)
```typescript
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
```

#### 6. **UseCase Type**
```typescript
export interface UseCase {
  id: string;
  industry: string;
  problem: string;
  solution: string;
  outcome: string;
  icon: string;
}
```

#### 7. **PricingPackage Type**
```typescript
export interface PricingPackage {
  name: string;
  priceRange: string;
  description: string;
  features: string[];
  isCustom?: boolean;
}
```

#### 8. **BookingFormData Type**
```typescript
export interface BookingFormData {
  name: string;
  company: string;
  email: string;
  industry: string;
  budgetRange: string;
  projectDescription: string;
  timeline: string;
}
```

---

## 3️⃣ PAGES DIRECTORY - COMPLETE LISTING

**Path:** `/Users/duloc/Desktop/SKYVERSES/ai-skyverses/skyverses-market-ai/pages/`

### Main Pages (36 .tsx files):

#### Core Marketplace Pages:
- `MarketPage.tsx` - Main marketplace
- `MarketsPage.tsx` - Multiple markets view
- `CategoryPage.tsx` - Category-specific view
- `ExplorerPage.tsx` - AI tools explorer
- `SolutionDetail.tsx` - Individual solution details
- `FavoritesPage.tsx` - User favorites

#### Business Pages:
- `CreditsPage.tsx` - Credit management
- `CreditUsagePage.tsx` - Usage analytics
- `BookingPage.tsx` - Booking/consultation
- `PricingPage.tsx` - Pricing info
- `ReferralPage.tsx` - Referral program

#### User Pages:
- `LoginPage.tsx` - Authentication
- `SettingsPage.tsx` - User settings
- `ProfilePage.tsx` (if exists) - User profile

#### Info Pages:
- `AboutPage.tsx` - About information
- `UseCasesPage.tsx` - Use cases showcase
- `PolicyPage.tsx` - Policies

#### Admin/Developer Pages:
- `AdminMarketCMS.tsx` - Admin CMS
- `AppsPage.tsx` - Apps/products listing
- `AppInterfacePage.tsx` - App interface

#### Product Pages (22+ Product-specific):
- **Images:** `AIImageGenerator.tsx`, `EventStudioPage.tsx`, `ProductImage.tsx`, `PosterMarketingAI.tsx`, `FashionCenterAI.tsx`, `ImageUpscaleAI.tsx`, etc.
- **Videos:** `AIVideoGenerator.tsx`, `GenyuProduct.tsx`, `AvatarLipsyncAI.tsx`, `VideoAnimateAI.tsx`, `StoryboardStudioPage.tsx`, `FibusVideoStudio.tsx`
- **Audio:** `TextToSpeech.tsx`, `MusicGenerator.tsx`, `VoiceDesignAI.tsx`, `VoiceStudio.tsx`
- **Other:** `SpatialArchitectPage.tsx`, `ProductCharacterSync.tsx`, `ProductAIAgentWorkflow.tsx`, `ProductCaptchaToken.tsx`, `NoCodeExportPage.tsx`, `QwenChatAIPage.tsx`

#### Subdirectories:
- `pages/images/` - 16+ image-related product pages
- `pages/videos/` - 6+ video-related product pages
- `pages/audio/` - 4+ audio-related product pages
- `pages/slides/` - Slide creator pages

---

## 4️⃣ COMPONENTS/MARKET DIRECTORY

**Path:** `/Users/duloc/Desktop/SKYVERSES/ai-skyverses/skyverses-market-ai/components/market/`

### Files:
1. **FeaturedSection.tsx** - Featured products section display
2. **MarketSectionHeader.tsx** - Section header component
3. **MarketSkeleton.tsx** - Loading skeleton for market items
4. **ProductQuickViewModal.tsx** - Quick view modal (11.5 KB)
5. **ProductToolModal.tsx** - Product tool details modal
6. **SolutionCard.tsx** - Solution/product card component
7. **SolutionList.tsx** - List of solutions

**Purpose:** Reusable components for marketplace UI display, modals, and cards.

---

## 5️⃣ ROUTING - APP.TSX COMPLETE ROUTES

**File Path:** `/Users/duloc/Desktop/SKYVERSES/ai-skyverses/skyverses-market-ai/App.tsx`

### Route Structure:

#### Authentication Routes:
```
/login → LoginPage (lazy-loaded)
```

#### Core Marketplace Routes:
```
/ → MarketPage (home)
/category/:id → CategoryPage
/markets → MarketsPage (multiple markets)
/explorer → ExplorerPage
/models → ModelsPage
/apps → AppsPage
/app/:id → AppInterfacePage
```

#### User Account Routes:
```
/credits → CreditsPage
/usage → CreditUsagePage
/settings → SettingsPage
/favorites → FavoritesPage
/referral → ReferralPage
/policy → PolicyPage
```

#### Business Routes:
```
/pricing → PricingPage
/booking → BookingPage
/about → AboutPage
/use-cases → UseCasesPage
```

#### Product Routes (30+ routes):
```
/product/background-removal-ai → BackgroundRemovalAI
/product/social-banner-ai → SocialBannerAI
/product/ai-agent-workflow → ProductAIAgentWorkflow
/product/captcha-veo3 → ProductCaptchaToken
/product/nocode-export → NoCodeExportPage
/product/qwen-chat-ai → QwenChatAIPage
/product/ai-slide-creator → AISlideCreatorPage

# Event-specific routes (consolidated)
/product/ai-birthday-generator → EventStudioPage (type: birthday)
/product/ai-wedding-generator → EventStudioPage (type: wedding)
/product/ai-noel-generator → EventStudioPage (type: noel)
/product/ai-tet-generator → EventStudioPage (type: tet)

# Image products
/product/bat-dong-san-ai → RealEstateAI
/product/realestate-visual-ai → RealEstateVisualAI
/product/ai-image-restorer → AIImageRestoration
/product/ai-stylist → AIStylistPage
/product/character-sync-ai → ProductCharacterSync
/product/ai-image-generator → AIImageGenerator
/product/poster-marketing-ai → PosterMarketingAI
/product/fashion-center-ai → FashionCenterAI
/product/image-upscale-ai → ImageUpscaleAI

# Video products
/product/ai-video-generator → AIVideoGenerator
/product/avatar-sync-ai → AvatarLipsyncAI
/product/video-animate-ai → VideoAnimateAI
/product/studio-architect → GenyuProduct
/product/storyboard-studio → StoryboardStudioPage
/product/fibus-video-studio → FibusVideoStudio

# Audio products
/product/voice-design-ai → VoiceDesignAI
/product/ai-voice-studio → VoiceStudio
/product/text-to-speech → TextToSpeech
/product/ai-music-generator → MusicGenerator
/product/music-generator → MusicGenerator

# Other products
/product/product-image → ProductImage
/product/character-sync-studio → Product6Image
/product/banana-pro-comic-engine → Product7Comic
/product/3d-spatial-architect → SpatialArchitectPage
/product/paperclip-ai-agents → PaperclipAIAgents

# Dynamic product route
/product/:slug → SolutionDetail (fallback for any product)
```

---

## 6️⃣ FORM/WIZARD/STEPPER PATTERNS FOUND

### 1. **OnboardingWizard.tsx** ⭐
**Path:** `/Users/duloc/Desktop/SKYVERSES/ai-skyverses/skyverses-market-ai/components/storyboard-studio/OnboardingWizard.tsx`

**Features:**
- 2-step wizard for video creation
- Step 1: Select video type (6 options with emoji)
- Step 2: Describe video idea in textarea
- Uses `framer-motion` for animations
- Local storage to prevent re-showing
- AnimatePresence for step transitions

**Step Types Supported:**
- Quảng cáo sản phẩm (Product Ads)
- Bất động sản (Real Estate)
- TikTok / Reels
- Phim / Câu chuyện (Film/Story)
- Giáo dục / Hướng dẫn (Education)
- Sự kiện / Lễ (Events)

---

### 2. **SubmissionFormSteps.tsx** ⭐ (PRODUCT SUBMISSION WIZARD)
**Path:** `/Users/duloc/Desktop/SKYVERSES/ai-skyverses/skyverses-market-ai/components/apps/SubmissionFormSteps.tsx` (22 KB)

**4-Step Product Submission Form:**

#### Step 1: Product Info
- Product name + auto-generated slug
- Category selection
- Demo type selection
- Complexity level (Standard/Advanced/Enterprise)
- Short description (200 char limit)
- Full description (textarea)
- Tags input

#### Step 2: Media & Pricing
- Thumbnail URL with preview
- Gallery URLs (multiple)
- Demo URL
- Price in credits
- Free toggle
- Platform selection (Web, iOS, Android, Extension, API)

#### Step 3: Technical
- AI Models used
- Features list (one per line, with visual tags)
- API Endpoint
- Documentation/README URL
- Info banner explaining technical details

#### Step 4: Review & Submit
- Auto-filled creator info from auth
- Creator name, email, studio, website, telegram
- Review summary of product data
- Additional notes textarea
- Success overlay with message

**Components:**
- `Step1ProductInfo` - Product information step
- `Step2MediaPricing` - Media and pricing step
- `Step3Technical` - Technical details step
- `Step4ReviewSubmit` - Review and submission step
- `FormNavigation` - Previous/Next/Submit buttons
- `SuccessOverlay` - Success confirmation screen

---

### 3. **StepIndicator.tsx**
**Path:** `/Users/duloc/Desktop/SKYVERSES/ai-skyverses/skyverses-market-ai/components/apps/StepIndicator.tsx`

**Features:**
- Progress bar with percentage
- 4 step indicators with icons
- Clickable step navigation
- Completed steps show checkmark
- Active step highlighted in blue
- Icons: Package, Image, Cpu, Send

---

## 7️⃣ HOOK PATTERNS FOR PRODUCT MANAGEMENT

### useAppsPage.ts
**Path:** `/Users/duloc/Desktop/SKYVERSES/ai-skyverses/skyverses-market-ai/hooks/useAppsPage.ts`

**Exports:**
- `ProductSubmission` interface (all form fields)
- `useAppsPage()` hook for managing submission state
- Constants:
  - `PRODUCT_CATEGORIES` (8 categories)
  - `COMPLEXITY_LEVELS` (Standard/Advanced/Enterprise)
  - `DEMO_TYPES` (Text/Image/Video/Automation)
  - `PLATFORM_OPTIONS` (5 platforms)
  - `SUBMISSION_STEPS` (4 steps with descriptions)

**Features:**
- Form state management
- Field validation per step
- Auto-slug generation
- Platform toggle functionality
- Step progression logic

---

## 8️⃣ API INTEGRATION

### Product Submission API
**Path:** `/Users/duloc/Desktop/SKYVERSES/ai-skyverses/skyverses-market-ai/apis/product-submission.ts`

**Endpoints:**
- `POST /product-submission` - Submit new product
- `GET /product-submission/mine` - Get current user's submissions

**Payload Interface:**
```typescript
export interface ProductSubmissionPayload {
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
```

---

## 9️⃣ COMPONENT DIRECTORY STRUCTURE

**Path:** `/Users/duloc/Desktop/SKYVERSES/ai-skyverses/skyverses-market-ai/components/`

### Component Directories (23):
1. `aether-flow/` - Aether Flow interface
2. `ai-stylist/` - AI Stylist workspace
3. `apps/` - **Product submission components**
   - SubmissionFormSteps.tsx ⭐
   - StepIndicator.tsx ⭐
   - AppCard.tsx
   - AppsHero.tsx
   - CategoryTabs.tsx
   - DeveloperPortal.tsx
   - ProposalModal.tsx
   - SubmissionHero.tsx
4. `art-3d/` - 3D art tools
5. `captcha-token/` - Captcha token component
6. `character-sync/` - Character sync workspace
7. `common/` - Common/shared components
8. `event-studio/` - Event studio workspace
9. `explorer/` - Explorer components
10. `fashion-studio/` - Fashion studio workspace
11. `image-generator/` - Image generator workspace
12. `landing/` - Landing page components
13. `market/` - **Marketplace components** ⭐
14. `music-generator/` - Music generator workspace
15. `product-image/` - Product image workspace
16. `real-estate/` - Real estate workspace
17. `restoration/` - Restoration workspace
18. `settings/` - Settings components
19. `shared/` - Shared components
20. `slide-studio/` - Slide creator components
21. `storyboard-studio/` - **Storyboard wizard** ⭐
22. `video-animate/` - Video animation workspace
23. `video-generator/` - Video generator workspace
24. `workspace/` - Workspace components

---

## 🔟 MARKET PRODUCT ADD/UPDATE SCRIPT DETAILS

**File:** `/Users/duloc/Desktop/SKYVERSES/ai-skyverses/skyverses-market-ai/scripts/add-market-product.ts`

### MarketProduct Interface:
```typescript
interface MarketProduct {
  slug: string;
  id?: string;
  name: LocalizedString;
  category: LocalizedString;
  description: LocalizedString;
  imageUrl: string;
  demoType?: string;
  homeBlocks: string[];
  tags: string[];
  models?: string[];
  industries?: string[];
  features?: LocalizedString[];
  neuralStack?: NeuralStackItem[];
  complexity?: string;
  priceCredits?: number;
  isFree?: boolean;
  isActive?: boolean;
  status?: string;
  featured?: boolean;
  order?: number;
}
```

### Example Product Definition:
The script includes an example "ai-slide-creator" product with:
- Multi-language names (EN, VI, KO, JA)
- Localized descriptions
- Feature list with translations
- Neural stack (AI models used)
- Homepage blocks configuration
- Pricing and complexity settings

### Home Block Categories:
```
'top-choice'   → 🔥 Top Choice
'top-image'    → 🖼  Image Studio
'top-video'    → 🎬 Video Studio
'top-ai-agent' → 🤖 AI Agent Workflow
'events'       → 🎁 Lễ hội & Sự kiện
'app-other'    → ✅ Ứng dụng khác (default)
```

---

## 📊 SUMMARY TABLE

| Item | Count | Location |
|------|-------|----------|
| Pages (.tsx) | 62+ | `pages/` + subdirs |
| Main page routes | 37 | App.tsx routes |
| Product-specific routes | 30+ | `/product/*` routes |
| Components | 100+ | `components/` |
| Component dirs | 24 | `components/*/` |
| Market components | 7 | `components/market/` |
| Type definitions | 8 major | `types.ts` |
| Wizard patterns | 2 | OnboardingWizard, SubmissionForm |
| Step components | 4 | Step1, Step2, Step3, Step4 + StepIndicator |
| Hooks | 30+ | `hooks/` |
| API endpoints | 2+ | `apis/product-submission.ts` |
| CLI scripts | 1 | `scripts/add-market-product.ts` |

---

## 🎯 KEY FINDINGS

### ✅ Product Management System
1. **Dual Product System:**
   - Admin CLI: `scripts/add-market-product.ts` for direct API submission
   - User Wizard: 4-step form in `components/apps/SubmissionFormSteps.tsx`

2. **Product Types:**
   - `Solution` interface in `types.ts` (primary marketplace type)
   - `ProductSubmission` interface for user submissions
   - `MarketProduct` interface in CLI script

3. **Form Wizard Pattern:**
   - 4-step multi-part form with validation
   - Step navigation with progress tracking
   - Auto-filled fields from authentication
   - Success confirmation overlay

4. **Marketplace Display:**
   - 7 reusable market components
   - Featured sections
   - Quick view modals
   - Solution cards with galleries

### ✅ Routing Architecture
- 37+ core routes with lazy-loading
- 30+ product-specific routes
- Code-splitting with React.lazy()
- Automatic page transition bar
- Idle-time route prefetching

### ✅ Localization Support
- 4 languages: English, Vietnamese, Korean, Japanese
- `LocalizedString` type for all text
- Language context provider
- All marketplace text translatable

### ✅ Multi-step Patterns
- Storyboard wizard: 2 steps
- Product submission: 4 steps
- Step indicators with progress
- Framer Motion animations
- Form validation per step

---

## 📝 RECOMMENDATIONS FOR NEW PRODUCT ADDITION

1. **Define Product in Script:**
   ```bash
   // Add to PRODUCTS map in scripts/add-market-product.ts
   'new-product-slug': { ... MarketProduct data ... }
   ```

2. **Run CLI:**
   ```bash
   npx ts-node scripts/add-market-product.ts --slug new-product-slug --dry-run
   npx ts-node scripts/add-market-product.ts --slug new-product-slug
   ```

3. **Or Use Web Wizard:**
   - Navigate to `/apps`
   - Fill 4-step submission form
   - Auto-validates each step
   - Submits to `/product-submission` endpoint

4. **Homepage Block Registration:**
   - Use one of 6 homeBlocks categories
   - Controls where product appears on homepage
   - Can be featured or in app-other section

---

**End of Report**
