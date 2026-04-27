# Character Sync AI - Complete Codebase Exploration Report

## Executive Summary
The "character-sync-ai" product page is a comprehensive AI-powered character identity management system integrated into the Skyverses marketplace. This report details all file paths, route definitions, components, data structures, and image/CDN references.

---

## 1. ROUTE DEFINITION

### Route in App.tsx
**File:** `/Users/duloc/Desktop/SKYVERSES/ai-skyverses/skyverses-market-ai/App.tsx`
**Line:** 245

```tsx
<Route path="/product/character-sync-ai" element={<ProductCharacterSync />} />
```

**Route Details:**
- Path: `/product/character-sync-ai`
- Component: `ProductCharacterSync` (lazy-loaded)
- Import: `() => import('./pages/ProductCharacterSync')`
- Lazy load key: `charSync` (line 66)

### Sitemap References
**File:** `/Users/duloc/Desktop/SKYVERSES/ai-skyverses/skyverses-market-ai/public/sitemap.xml`
```xml
<url><loc>https://ai.skyverses.com/product/character-sync-ai</loc><changefreq>weekly</changefreq><priority>0.6</priority></url>
```

---

## 2. PAGE COMPONENT FILES

### Main Product Page
**File:** `/Users/duloc/Desktop/SKYVERSES/ai-skyverses/skyverses-market-ai/pages/ProductCharacterSync.tsx`
**Size:** 343 lines
**Description:** Complete product landing page with hero section, features, workflow, comparison table, use cases, and CTA

**Key Content:**
- Hero section with gradient text
- 6 main features (DNA Anchoring, Semantic Binding, Context Memory, Zero-Drift Sync, Multi-Actor Control, Shared Library)
- 4-step workflow visualization
- Comparison table (old AI vs Character Sync)
- 6 use cases with emojis
- CTA sections with "Thử Character Sync" button
- Opens CharacterSyncWorkspace modal on "Try" button click

---

## 3. WORKSPACE/EDITOR COMPONENT

### Main Workspace Component
**File:** `/Users/duloc/Desktop/SKYVERSES/ai-skyverses/skyverses-market-ai/components/CharacterSyncWorkspace.tsx`
**Size:** 672 lines
**Description:** Full-featured workspace for creating character profiles and generating videos

**Architecture:**
- Left Sidebar (340-360px width)
  - Desktop header with close button
  - Registry Section (character slots)
  - Narrative Beats (prompt sequences)
  - Configuration Section (model/engine/resolution settings)
  - Footer with credits display and generate button

- Right Viewport (flex-grow)
  - Toolbar (tabs: Lab vs History)
  - Results area (session results or server history)
  - Support for fullscreen video playback

**Key Features:**
- Character library integration
- Multi-sequence prompt management
- Job status tracking (QUEUED, SYNTHESIZING, COMPLETED, FAILED)
- Auto-download functionality
- History search and pagination
- Mobile-responsive design with expanded state

---

## 4. CHARACTER SYNC SUB-COMPONENTS

### Component Files in `/components/character-sync/`

**4.1 RegistrySection.tsx (8,188 bytes)**
- Manages character slot display and management
- Drag-and-drop reordering support
- Upload, edit, and remove character actions
- Shows character count (X/10 max)
- Tutorial/help button integration

**4.2 NarrativeBeats.tsx (5,752 bytes)**
- Manages prompt sequences
- Add/remove sequences
- Character reference binding
- Duration settings for each beat

**4.3 ConfigurationSection.tsx (13,780 bytes)**
- Model selection dropdown
- Engine selection (gommo)
- Resolution options (720p)
- Aspect ratio toggle (16:9 or 9:16)
- Duration selection (8s default)

**4.4 TutorialModal.tsx (8,537 bytes)**
- Interactive tutorial for first-time users
- Shown on first visit (localStorage flag)

**4.5 TemplateModal.tsx (5,290 bytes)**
- Pre-built templates for workflows
- Template application functionality

**4.6 GuideSlider.tsx (3,625 bytes)**
- Guide carousel for new users
- Template exploration

**4.7 ModelSelectionSection.tsx (2,662 bytes)**
- Model selection UI component

**4.8 ParameterSettings.tsx (3,274 bytes)**
- Additional parameter configuration

---

## 5. HOOK - STATE MANAGEMENT

### useCharacterSync.ts
**File:** `/Users/duloc/Desktop/SKYVERSES/ai-skyverses/skyverses-market-ai/hooks/useCharacterSync.ts`
**Size:** 200+ lines (partial read)

**Interfaces:**
```typescript
interface CharacterSlot {
  id: string;
  url: string | null;
  mediaId: string | null;
  name: string;
  role: string;
}

interface PromptSequence {
  id: string;
  text: string;
  duration: string;
  boundCharacterIds: string[];
}

interface ProductionJob {
  id: string;
  status: 'QUEUED' | 'SYNTHESIZING' | 'COMPLETED' | 'FAILED';
  prompt: string;
  progress: number;
  url?: string;
  timestamp: string;
  cost: number;
  isRefunded?: boolean;
  ratio: string;
  resolution: string;
  duration: string;
  references: string[];
  dateKey: string;
  modelName: string;
  error?: string;
}
```

**Constants:**
- `MAX_CHARACTERS = 10`

**Key State:**
- `slots`: Character definitions
- `sequences`: Prompt sequences with character references
- `jobs`: Current session production jobs
- `history`: Historical jobs
- `selectedModel`: Pricing model selection
- `selectedEngine`: Engine selection (gommo)
- `resolution`: Video resolution (720p)
- `aspectRatio`: 16:9 or 9:16
- `duration`: Video duration (8s default)
- `usagePreference`: 'credits' or 'key' (stored in localStorage)
- `activeResultTab`: 'CURRENT' or 'HISTORY'

---

## 6. WORKSPACE INTEGRATION

### ProductToolModal.tsx
**File:** `/Users/duloc/Desktop/SKYVERSES/ai-skyverses/skyverses-market-ai/components/market/ProductToolModal.tsx`

**Workspace Mapping:**
```typescript
'character-sync-ai': React.lazy(() => import('../CharacterSyncWorkspace'))
```

This maps the product slug to the workspace component for modal opening.

---

## 7. DATA & CONFIGURATION FILES

### data.ts
**File:** `/Users/duloc/Desktop/SKYVERSES/ai-skyverses/skyverses-market-ai/data.ts`
**Status:** No specific product definition for character-sync-ai in SOLUTIONS array

**Use Case Reference (Line 476-478):**
```typescript
{
  id: 'uc-1',
  industry: 'Marketing',
  problem: 'High cost of photoshoot for seasonal campaigns.',
  solution: 'Used Character Sync AI to maintain brand ambassadors across all digital ads.',
  outcome: '85% reduction in production costs and 3x faster delivery.',
  icon: 'Megaphone'
}
```

### market-config.tsx
**File:** `/Users/duloc/Desktop/SKYVERSES/ai-skyverses/skyverses-market-ai/constants/market-config.tsx`
**Status:** No specific character-sync configuration (generic home block options)

---

## 8. API INTEGRATIONS

### Embedded in useCharacterSync.ts:
- `uploadToGCS` - Character image upload
- `pricingApi` - Model pricing information
- `videosApi` - Video job management
  - `getJobs()` - Fetch production history
  - `pollJobOnce()` - Single poll for job status
- `useAuth()` - User authentication and credits

---

## 9. IMAGE & CDN REFERENCES

### Product Page Images (ProductCharacterSync.tsx)
**No hardcoded CDN URLs** - Uses placeholder/avatar services inline:

1. **Error State Gallery (Line 181):**
   ```tsx
   <img src={`https://i.pravatar.cc/300?u=err${i}`} alt="" />
   ```
   - Uses Pravatar service for placeholder avatars
   - Shows "Broken Identity" concept

2. **No other CDN/image URLs found** in product page

### Workspace Images
- No hardcoded image URLs in CharacterSyncWorkspace.tsx

### Asset Structure
- Character images stored in GCS (uploadToGCS from storage service)
- mediaId references stored in CharacterSlot
- No local image assets in `/public` folder for character-sync

---

## 10. FEATURE BREAKDOWN

### Core Features in ProductCharacterSync.tsx:

```typescript
const FEATURES = [
  { 
    icon: Fingerprint, 
    title: 'DNA Anchoring', 
    desc: 'Upload lên 10 ảnh để định danh nhân vật. Mỗi ảnh trở thành nguồn sự thật hình ảnh.' 
  },
  { 
    icon: BrainCircuit, 
    title: 'Semantic Binding', 
    desc: 'Prompt tham chiếu nhân vật theo tên — y như kịch bản đạo diễn chuyên nghiệp.' 
  },
  { 
    icon: Activity, 
    title: 'Context Memory', 
    desc: 'AI ghi nhớ mối quan hệ nhân vật và đặc điểm tính cách xuyên suốt.' 
  },
  { 
    icon: RefreshCw, 
    title: 'Zero-Drift Sync', 
    desc: 'Duy trì khuôn mặt, tóc, trang phục ổn định ở mọi tư thế và góc nhìn.' 
  },
  { 
    icon: Users, 
    title: 'Multi-Actor Control', 
    desc: 'Tham chiếu đồng thời đến 3 nhân vật trong một cảnh mà không bị lẫn.' 
  },
  { 
    icon: Database, 
    title: 'Shared Library', 
    desc: 'Kho nhân vật tập trung — tái sử dụng xuyên suốt mọi dự án và video.' 
  }
]
```

### Problems Addressed:
```typescript
const PROBLEMS = [
  'Nhân vật thay đổi khuôn mặt mỗi lần generate.',
  'Trang phục và phong cách trôi dạt giữa các prompt.',
  'AI không ghi nhớ đặc điểm nhân vật dài hạn.',
  'Quản lý nhiều nhân vật trong một cảnh rất hỗn loạn.',
]
```

### Use Cases:
```typescript
const USE_CASES = [
  { emoji: '📚', title: 'Truyện tranh AI', desc: 'Nhân vật nhất quán qua mọi trang' },
  { emoji: '🎬', title: 'Phim ngắn AI', desc: 'Diễn viên ảo xuyên suốt cốt truyện' },
  { emoji: '📱', title: 'Content Series', desc: 'Persona thống nhất cho social media' },
  { emoji: '🎮', title: 'Game Characters', desc: 'NPC nhất quán trong game AI' },
  { emoji: '📰', title: 'AI Anchor', desc: 'MC ảo cho bản tin, podcast' },
  { emoji: '👗', title: 'Virtual Model', desc: 'Model ảo cho lookbook, quảng cáo' },
]
```

---

## 11. COMPONENT HIERARCHY

```
App.tsx
├── Route: /product/character-sync-ai
│   └── ProductCharacterSync (pages/ProductCharacterSync.tsx)
│       ├── Hero Section
│       ├── Problem Section (Gallery with Pravatar images)
│       ├── Features Section (6 cards)
│       ├── Workflow Section (4 steps)
│       ├── Comparison Table
│       ├── Use Cases Grid
│       ├── CTA Section
│       └── CharacterSyncWorkspace Modal (on button click)
│           ├── Left Sidebar
│           │   ├── Desktop Header
│           │   ├── RegistrySection
│           │   ├── NarrativeBeats
│           │   ├── ConfigurationSection
│           │   └── Footer (Credits + Generate button)
│           └── Right Viewport
│               ├── Toolbar (Lab/History tabs)
│               ├── Results Grid (VideoCard components)
│               ├── History with Pagination
│               └── Supporting Modals
│                   ├── ImageLibraryModal
│                   ├── TemplateModal
│                   ├── TutorialModal
│                   ├── JobLogsModal
│                   ├── ResourceAuthModal
│                   ├── Naming Modal
│                   └── Fullscreen Video Modal
```

---

## 12. STYLING & UI FRAMEWORK

- **Framework:** Tailwind CSS
- **Animation:** Framer Motion
- **Icons:** Lucide React
- **Dark Mode Support:** Yes (dark: prefixes throughout)
- **Color Scheme:** Purple/Violet/Fuchsia gradient theme
- **Typography:** Font family "sans" (default)

**Key Classes:**
- Hero gradient: `from-purple-500 via-violet-500 to-fuchsia-500`
- Background gradients: `bg-gradient-to-b`, `bg-gradient-to-br`
- Animations: Fade in, slide up, shimmer effects

---

## 13. FILE INVENTORY - COMPLETE

### Pages
- `/pages/ProductCharacterSync.tsx` (343 lines)

### Components
- `/components/CharacterSyncWorkspace.tsx` (672 lines)
- `/components/character-sync/RegistrySection.tsx`
- `/components/character-sync/NarrativeBeats.tsx`
- `/components/character-sync/ConfigurationSection.tsx`
- `/components/character-sync/TutorialModal.tsx`
- `/components/character-sync/TemplateModal.tsx`
- `/components/character-sync/GuideSlider.tsx`
- `/components/character-sync/ModelSelectionSection.tsx`
- `/components/character-sync/ParameterSettings.tsx`

### Hooks
- `/hooks/useCharacterSync.ts`

### Core App Files
- `/App.tsx` (Route definition at line 245)

### Data Files
- `/data.ts` (Use case reference at line 476)

### Config Files
- `/constants/market-config.tsx` (No specific character-sync config)
- `/public/sitemap.xml` (2 URL entries)

### Workspace Integration
- `/components/market/ProductToolModal.tsx` (Workspace mapping)

---

## 14. KEY FINDINGS & OBSERVATIONS

### ✅ Fully Implemented:
1. **Route Definition:** Clean React Router integration
2. **Product Page:** Comprehensive landing page with all sections
3. **Workspace:** Full-featured editor with modal pattern
4. **State Management:** Custom hook with proper TypeScript interfaces
5. **UI Components:** All sub-components present and organized
6. **API Integration:** Connected to videos API, pricing API, auth
7. **Sitemap:** Indexed for SEO

### ⚠️ Notes:
1. **No Product Data Definition:** Character Sync AI is NOT defined in the `SOLUTIONS` array in data.ts
   - Only use case reference exists
   - Dynamic/API-driven data loading likely
   
2. **Image Handling:**
   - Character images uploaded to GCS
   - Demo images use Pravatar CDN (free avatars)
   - No product promotional images with CDN URLs

3. **Workspace Pattern:** Uses modal + isolated full-screen pattern like other products

4. **Pricing:** No hardcoded pricing visible - likely retrieved from pricing API

---

## 15. NAVIGATION FLOWS

### Entry Points:
1. Direct URL: `/product/character-sync-ai`
2. From Marketplace: ProductToolModal component
3. From Sitemap: SEO crawlable

### Exit Points:
- Back button in modal
- Navigation links in hero (e.g., "/market")
- Enterprise Access link to "/booking"

---

## 16. TYPESCRIPT INTERFACES SUMMARY

```typescript
interface CharacterSlot {
  id: string;
  url: string | null;
  mediaId: string | null;
  name: string;
  role: string;
}

interface PromptSequence {
  id: string;
  text: string;
  duration: string;
  boundCharacterIds: string[];
}

interface ProductionJob {
  id: string;
  status: 'QUEUED' | 'SYNTHESIZING' | 'COMPLETED' | 'FAILED';
  prompt: string;
  progress: number;
  url?: string;
  timestamp: string;
  cost: number;
  isRefunded?: boolean;
  ratio: string;
  resolution: string;
  duration: string;
  references: string[];
  dateKey: string;
  modelName: string;
  error?: string;
}

interface VideoResult {
  id: string;
  url: string | null;
  prompt: string;
  fullTimestamp: string;
  dateKey: string;
  displayDate: string;
  model: string;
  mode: 'standard';
  duration: string;
  status: 'done' | 'error' | 'processing';
  hasSound: boolean;
  aspectRatio: '16:9' | '9:16';
  cost: number;
  // ... more fields
}
```

---

## Summary Table

| Aspect | Details |
|--------|---------|
| **Main Route** | `/product/character-sync-ai` |
| **Page Component** | `ProductCharacterSync.tsx` (343 lines) |
| **Workspace Component** | `CharacterSyncWorkspace.tsx` (672 lines) |
| **Sub-Components** | 8 files in `/components/character-sync/` |
| **Hook** | `useCharacterSync.ts` |
| **Max Characters** | 10 |
| **Video Resolutions** | 720p (primary) |
| **Aspect Ratios** | 16:9, 9:16 |
| **Default Duration** | 8 seconds |
| **Color Theme** | Purple/Violet/Fuchsia gradient |
| **Animation Library** | Framer Motion |
| **Icon Library** | Lucide React |
| **Image Storage** | Google Cloud Storage (GCS) |
| **Image Demo URLs** | Pravatar CDN (https://i.pravatar.cc) |
| **Product Data Source** | API-driven (not in data.ts) |
| **Sitemap Entries** | 2 URLs listed |

