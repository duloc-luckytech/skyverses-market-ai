# Skyverses Market AI - Exploration Summary

**Date**: April 11, 2026  
**Status**: ✅ Complete Analysis

---

## 📊 CODEBASE OVERVIEW

**Total Files**: 60 page components + 98 components + 23 hooks + 17 API modules  
**Repository Size**: 89 directories, comprehensive React/TypeScript SPA  
**Stack**: React 19 + TypeScript 5 + Tailwind CSS + Framer Motion + Vite

---

## 🎯 KEY FINDINGS

### 1. ✅ Folder Structure

```
skyverses-market-ai/
├── pages/                    (60 files)    ← Product pages + landing pages
├── components/               (98 files)    ← Reusable UI components
├── hooks/                    (23 files)    ← Custom React hooks + business logic
├── apis/                     (17 files)    ← API client modules
├── context/                  (5 files)     ← Global state (Auth, Language, Theme, Toast, Search)
├── constants/                (4 files)     ← Product configs + branding
├── utils/                    (3 files)     ← Helper functions
├── services/                 (3 files)     ← External integrations (Gemini, Storage)
├── types.ts                  ← Global TypeScript interfaces
├── App.tsx                   ← Routing & lazy loading
└── index.tsx                 ← React entry point
```

### 2. ✅ Product Workspace Pattern

**Three-Layer Architecture**:

1. **Page Layer** (`/pages/{category}/{Product}.tsx`)
   - Landing page UI (hero, features, pricing, FAQs)
   - Toggle button to open workspace modal
   - SEO metadata via `usePageMeta()` hook

2. **Workspace Layer** (`/components/{Product}Workspace.tsx`)
   - Full-screen modal when active
   - Sidebar (controls) + Viewport (results) layout
   - Mobile-responsive with backdrop overlay
   - Handles upscale, download, history loading

3. **Hook Layer** (`/hooks/use{Product}.ts`)
   - All state management
   - API calls (create job, poll status, get history)
   - Business logic (cost calculation, credit debit)
   - Result management

**Example Implementations**:
- `AIImageGenerator` + `AIImageGeneratorWorkspace` + `useImageGenerator`
- `AIVideoGenerator` + `VideoGeneratorWorkspace` + `useVideoGenerator`
- `EventStudioPage` (multi-variant: birthday/wedding/noel/tet)
- `ProductImageWorkspace` (product photo editing with canvas)

---

### 3. ✅ API Call Architecture

**Central Config**: `/apis/config.ts`
- Auto-detects API base URL (env var → production → dev fallback)
- Provides `getHeaders()` helper with JWT auth token
- Caching wrapper via `apiCache.wrap()`

**Standard API Module Pattern**:
```typescript
export const myApi = {
  createJob: async (payload) → POST /endpoint
  getJobStatus: async (jobId) → GET /endpoint/:jobId
  getJobs: async (params) → GET /endpoint?params
  listModels: async () → GET /models
}
```

**Response Format**:
```typescript
{
  success: boolean,
  data: { status, jobId, resultUrl?, ... },
  message?: string
}
```

**Key APIs**:
- `imagesApi` — Image generation jobs
- `videosApi` — Video generation jobs
- `upscaleApi` — Image upscaling
- `creditsApi` — Credit management
- `pricingApi` — Model pricing & resolutions
- `authApi` — User authentication
- `marketApi` — Product listing

---

### 4. ✅ Routing System (App.tsx)

**Code-Splitting Strategy**:
- 70+ pages lazily imported
- `React.lazy()` for dynamic imports
- `Suspense` with `<PageLoader />` fallback
- Prefetch critical routes on browser idle

**Route Structure**:
```typescript
<Route path="/login" element={<LoginPage />} />  // Public

<Route path="*" element={<Layout>
  <Route path="/" element={<MarketPage />} />
  <Route path="/product/{slug}" element={...} />
  ...
</Layout>} />
```

**Product Route Pattern**:
```typescript
/product/ai-image-generator
/product/ai-video-generator
/product/ai-birthday-generator
/product/ai-wedding-generator
/product/{slug} // Dynamic fallback
```

---

### 5. ✅ Multi-Step Forms / Modals

**ResourceAuthModal** (Best Example):
- Two-choice modal: Credits vs API Key
- No traditional steps — instantaneous choice
- Triggers next action via `onConfirm` callback
- Prevents action until choice made

**Other Modals**:
- `ImageLibraryModal` — Select images (1-6)
- `JobLogsModal` — View execution logs
- `ModelSelectorModal` — Choose AI model with advanced options
- `DemoModal` — Product demo
- `UpgradeModal` — Plan upgrade

**Pattern**: All use `AnimatePresence` + `motion.div` for smooth animations

---

### 6. ✅ Product Configuration

**Home Block System** (`/constants/market-config.tsx`):
- "Top Choice" — Featured AI tools
- "Image Studio" — Image generation products
- "Video Studio" — Video generation products
- "AI Agent Workflow" — Automation tools
- "Events" — Birthday/Wedding/Noel/Tet studios
- "Other Apps" — Utilities

**Product Interface** (`types.ts`):
```typescript
interface Solution {
  id, slug, name, category, description
  problems, industries, models, priceCredits, isFree
  imageUrl, gallery, neuralStack, demoType, tags
  features, complexity, order, featured, status
  homeBlocks, platforms
}
```

**Event Configs** (`/constants/event-configs.ts`):
- Separate config per event type
- Templates, colors, pricing tiers
- FAQ data per event

---

### 7. ✅ Global Types

**`/types.ts`** (single source of truth):
- `Language` — 'en' | 'vi' | 'ko' | 'ja'
- `LocalizedString` — All 4 languages
- `Solution` — Product definition
- `SystemConfig` — App configuration
- `UseCase` — Use case examples
- `PricingPackage` — Pricing tiers
- `BookingFormData` — Contact form

**API-Specific Types** (in respective API modules):
- `ImageJobRequest/Response`
- `VideoJobRequest/Response`
- `UpscaleTask/Response`
- `CreditTransactionResponse`

---

### 8. ✅ Context & State Management

| Context | Purpose | Exports |
|---|---|---|
| `AuthContext` | User auth, credits | `user, isAuthenticated, login, useCredits, refreshUserInfo` |
| `LanguageContext` | i18n | `language, t(), setLanguage` |
| `ThemeContext` | Dark/light mode | `theme, toggleTheme` |
| `SearchContext` | Global search | `searchQuery, setSearchQuery` |
| `ToastContext` | Notifications | `showToast(message, type)` |

---

## 📁 KEY FILES

| What | Where |
|---|---|
| Add new product workspace | See `QUICK_WORKSPACE_REFERENCE.md` — 6 steps |
| Add new API endpoint | `/apis/{feature}.ts` + `export const {feature}Api = { ... }` |
| Add new route | Edit `App.tsx` — add pageImports, lazy component, route |
| Global state | `/context/{Feature}Context.tsx` + `useContext()` |
| Product configuration | `/constants/market-config.tsx` or create `/constants/{feature}-config.ts` |
| Types | `/types.ts` (global) or API module (API-specific) |
| Reusable components | `/components/common/{Component}.tsx` or `/components/{feature}/{Component}.tsx` |

---

## 🚀 QUICK START

### View Workspace Example
👉 **File**: `/components/AIImageGeneratorWorkspace.tsx` (280 lines)  
👉 **Hook**: `/hooks/useImageGenerator.ts` (400 lines)  
👉 **Page**: `/pages/images/AIImageGenerator.tsx` (40 lines)  
👉 **Route**: `/product/ai-image-generator`

### Replicate for New Product
1. Copy `AIImageGeneratorWorkspace.tsx` → `MyProductWorkspace.tsx`
2. Create `useMyProduct.ts` hook
3. Create `/pages/{category}/MyProduct.tsx` page
4. Create `/apis/myProduct.ts` API module
5. Add route in `App.tsx`
6. Replace API calls with your endpoints
7. Test at `/product/my-product`

See `QUICK_WORKSPACE_REFERENCE.md` for templates.

---

## 📊 DOCUMENT MAP

| Document | Purpose |
|---|---|
| `COMPREHENSIVE_CODEBASE_STRUCTURE.md` | Full architecture + code examples (41KB) |
| `QUICK_WORKSPACE_REFERENCE.md` | Step-by-step implementation guide with templates |
| `EXPLORATION_SUMMARY.md` | This file — overview + key findings |

---

## 💡 KEY INSIGHTS

### 1. Single Page App (SPA)
- React Router v7 for client-side routing
- No server-side rendering
- All 60 pages code-split for fast loading

### 2. Async Job Model
- Create job → Get jobId → Poll status (5-30s intervals)
- Used for: images, videos, upscale, character sync
- Timeout: 30 retries (max ~2.5 min)

### 3. Credit-Based Monetization
- Each operation costs credits (150-600 CR)
- Check credits before operation
- Debit on successful completion
- Refund on error

### 4. Multi-Language Support
- Vietnamese (VI) primary
- English (EN), Korean (KO), Japanese (JA)
- `LocalizedString` interface for all UI text

### 5. Component Reusability
- Shared modals: `JobLogsModal`, `ImageLibraryModal`, `ResourceAuthModal`
- Sub-components organized in feature folders
- Common utilities in `/components/common/`

### 6. Mobile Responsive
- Tailwind CSS responsive breakpoints (sm, md, lg, xl)
- Mobile backdrop overlay for sidebar
- Touch-friendly button sizing

---

## ⚠️ IMPORTANT PATTERNS

### ✅ DO

- Use `useAuth()` to access credits & user info
- Use `useToast()` for all notifications
- Wrap async operations in try-catch
- Poll jobs with 5-second intervals
- Show modal when user needs to make a choice
- Use `useMemo` for expensive computations
- Debounce file uploads (500ms)
- Check credits BEFORE calling API

### ❌ DON'T

- Don't navigate away during job processing
- Don't make multiple API calls for same job
- Don't hardcode API URLs (use `API_BASE_URL`)
- Don't forget JWT token in headers
- Don't show errors silently (always toast)
- Don't forget to clean up event listeners
- Don't use `localStorage` directly for non-auth data

---

## 🔗 External Resources

- **React**: 19.2.3 — https://react.dev
- **Vite**: 5.3.1 — https://vitejs.dev
- **Tailwind**: 3.4.4 — https://tailwindcss.com
- **Framer Motion**: 12.23 — https://www.framer.com/motion
- **React Router**: 7.11 — https://reactrouter.com
- **Lucide Icons**: — https://lucide.dev

---

## ✅ ANALYSIS COMPLETE

**Explored**:
- ✅ All 60 page files
- ✅ 98 component files
- ✅ 23 hook files
- ✅ 17 API modules
- ✅ 5 context providers
- ✅ Routing system
- ✅ Type system
- ✅ Configuration files

**Generated**:
- ✅ Comprehensive structure document (41KB)
- ✅ Quick workspace reference (templates)
- ✅ This summary

**Ready to**: Add new products, modify workspaces, extend API, implement new features.

---

**Questions?** See `COMPREHENSIVE_CODEBASE_STRUCTURE.md` for detailed examples and code snippets.
