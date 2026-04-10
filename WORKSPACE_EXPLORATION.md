# SKYVERSES MARKETPLACE AI — WORKSPACE APPS PAGE EXPLORATION

**Date:** April 10, 2026  
**Codebase:** `/Users/duloc/Desktop/SKYVERSES/ai-skyverses/skyverses-market-ai`

---

## EXECUTIVE SUMMARY

Explored codebase for Real Estate Visual AI and Social Banner AI workspace pages. Found:
- **Two dedicated workspace components** with job management
- **One AppsPage.tsx** for product submission (NOT product showcase)
- **Shared ImageJobCard component** for result display
- **No existing grid/list card component** for job history — results managed inline per workspace

---

## 1. REAL ESTATE VISUAL AI WORKSPACE

### File Location
`/components/RealEstateVisualWorkspace.tsx` (1,488 lines)

### What It Renders
- **Dual-mode workspace:** Image generation (🖼️ Ảnh) | Video generation (🎬 Video)
- **Desktop layout:** 
  - Left sidebar (380px): Configuration controls
  - Main viewport (center): Result display
  - Right rail (220px): Task history / Library tabs
- **Mobile:** Bottom sheet for settings

### Result Card List / Job History Component

**Status:** ✅ **HAS EXISTING IMPLEMENTATION**

**Location:** Lines 1112–1249 (Right-side rail panel)

**Key Features:**
- **Dual-view tabs:** 
  - `'current'` → Active tasks + completed results
  - `'library'` → Historical sessions (localStorage-persisted)
  
- **Current tasks display (lines 1135–1185):**
  ```
  - Thumbnail with mode badge (🖼️ Ảnh / 🎬 Video)
  - Status indicator (✓ Done / ✗ Lỗi / ⟳ Đang tạo)
  - Prompt preview (line-clamp-1)
  - Cost + date footer
  - Delete button (processing state hidden)
  - Click to select → Shows in main viewport
  ```

- **Library grid (lines 1195–1246):**
  - Same card structure for historical results
  - Click to restore into current results
  - Persisted to localStorage as `BannerSession[]` type

### State Variables & Data Flow

**Results (Task List):**
```typescript
interface REResult {
  id: string;
  url: string | null;
  prompt: string;
  mode: 'image' | 'video';
  status: 'processing' | 'done' | 'error';
  cost: number;
  propertyType: string;
  industry: string;
  createdAt: string;
  isRefunded?: boolean;
  logs?: string[];  // Polling logs
}

const [results, setResults] = useState<REResult[]>([]);
const [activeResultId, setActiveResultId] = useState<string | null>(null);
```

**Key Flow:**
1. User submits prompt → Create task objects with `status: 'processing'`
2. `setResults(prev => [...tasks, ...prev])` — prepend to list
3. Poll API every 5-10 seconds → Update `status` and `url`
4. User clicks task card → `setActiveResultId(taskId)` → Shows in viewport
5. On success → `saveSession()` → Stores to localStorage (persists across sessions)

**Variables:**
- `processingCount` = Results with `status === 'processing'`
- `activeResult` = First result or `results[0]` or null
- `viewMode`: `'current' | 'library'` (tab toggle)
- `sessions`: `RESession[]` (localStorage history)

### Cards & UI Components

**Task Card (Current):**
- Status badge + timestamp
- Thumbnail (img/video preview or placeholder)
- Prompt text + cost
- Delete button on hover
- Aspect ratio: `aspect-video`

**Empty State:**
- When `results.length === 0` in current tab
- Shows centered icon + message

---

## 2. SOCIAL BANNER WORKSPACE

### File Location
`/components/SocialBannerWorkspace.tsx` (1,008 lines)

### What It Renders
- **Single-mode workspace** for banner generation
- **Desktop layout:**
  - Left sidebar (380px): Configuration + platforms + style
  - Main viewport: Result display
- **Mobile:** Bottom sheet for settings
- **Dual-view tabs:** `'current'` (active result) | `'library'` (history)

### Result Card List / Job History Component

**Status:** ✅ **HAS EXISTING IMPLEMENTATION**

**Location:** Lines 715–829 (Main viewport area)

**Key Features:**
- **Current view (lines 715–792):**
  - Single result display (not a list)
  - Shows either: result image | loading skeleton | empty state
  - Result footer overlay with download + fullscreen + refresh buttons

- **Library view (lines 793–829):**
  - Grid layout: `grid-cols-2 lg:grid-cols-3 gap-4`
  - Card structure per session:
    ```
    - Image thumbnail (aspect-video)
    - Prompt text (line-clamp-2)
    - Timestamp footer
    - Delete button on hover
    - Click to switch to current view
    ```

### State Variables & Data Flow

**Results (Single):**
```typescript
interface BannerSession {
  id: string;
  url: string;
  prompt: string;
  config: {
    platformId: string;
    style: string;
    model: string;
  };
  timestamp: string;
}

const [result, setResult] = useState<string | null>(null);
const [sessions, setSessions] = useState<BannerSession[]>([]);
const [viewMode, setViewMode] = useState<'current' | 'library'>('current');
```

**Key Flow:**
1. User clicks generate → `setIsGenerating(true)`
2. Call API (direct, not polling)
3. On success → `setResult(imageUrl)` + append to `sessions` + save localStorage
4. User can switch between `'current'` and `'library'` tabs
5. Library click → `setResult(session.url); setViewMode('current')`

**Variables:**
- `result`: Single image URL or null (not a list)
- `sessions`: All historical results (localStorage-persisted)
- `isGenerating`: Boolean for submission state
- `viewMode`: Toggle between current/library

### Cards & UI Components

**Library Card:**
- Image thumbnail
- Prompt text preview
- Timestamp
- Delete button
- Hover effect: slight scale up
- Rounded corners with border

**Current View:**
- Single large result or skeleton or empty state
- Overlay actions on hover (download, fullscreen, copy, retry)

---

## 3. APPS PAGE (Product Submission)

### File Location
`/pages/AppsPage.tsx` (341 lines)

### What It Renders

**NOT a workspace for real estate or social banner AI.**

This is the **Product Submission Form** for developers to list their products on Marketplace:
- Step-by-step form (4 steps)
- Product info, pricing, technical details, review/submit
- Developer Portal section explaining the pipeline
- No result display for AI generation

### Key Sections:
1. **Hero** - Introduction
2. **Submission form** - Multi-step wizard
3. **Developer Portal** - Info about integration + submission pipeline
4. **Pipeline visualization** - 4-step process (Submit → Review → Integration → Go Live)

### No Job History or Results

---

## 4. SHARED IMAGEJOBCARD COMPONENT

### File Location
`/components/shared/ImageJobCard.tsx` (484 lines)

### Purpose
**Reusable result card component** for displaying image/video generation results across all workspaces

### Status Types & Rendering

```typescript
type JobCardStatus = 'idle' | 'submitting' | 'processing' | 'done' | 'error';

interface ImageJobCardProps {
  status: JobCardStatus;
  resultUrl?: string;
  progress?: number;
  statusText?: string;
  errorMessage?: string;
  isVideo?: boolean;
  mode?: 'full' | 'compact';  // 'full' for workspace, 'compact' for widget
  aspectRatio?: string;
  downloadFilename?: string;
  onDownload?: () => void;
  onRetry?: () => void;
  onReset?: () => void;
  idleSlot?: React.ReactNode;
  resultFooter?: React.ReactNode;
  loadingExtra?: React.ReactNode;
}
```

### Key Features
- **5 render states:**
  1. `idle` → Empty placeholder or custom slot
  2. `submitting` → Shimmer overlay + loader
  3. `processing` → Animated grid bg + floating particles + orbit animation + progress bar
  4. `done` → Result image/video + footer overlay with actions
  5. `error` → Red error state + retry button

- **Modes:**
  - `'full'` → Larger sizes (workspace/modal)
  - `'compact'` → Smaller sizes (widget/embed)

- **Not currently used** in Real Estate or Social Banner workspaces — they implement their own result displays inline

---

## 5. DIRECTORY STRUCTURE

```
/components/
  ├── RealEstateVisualWorkspace.tsx    ← Real Estate AI workspace
  ├── SocialBannerWorkspace.tsx        ← Social Banner AI workspace
  ├── shared/
  │   └── ImageJobCard.tsx             ← Reusable result card (generic)
  ├── workspace/
  │   └── AISuggestPanel.tsx           ← Shared AI suggestion + template panel
  ├── image-generator/
  │   └── ModelEngineSettings.tsx      ← Shared image model config
  ├── video-generator/
  │   └── VideoModelEngineSettings.tsx ← Shared video model config
  └── apps/
      ├── SubmissionHero.tsx
      ├── StepIndicator.tsx
      └── SubmissionFormSteps.tsx

/pages/
  ├── AppsPage.tsx                     ← Product submission form (NOT a workspace)
  └── [other product pages...]
```

---

## 6. KEY FINDINGS

### ✅ Existing Job History Components

**Real Estate Visual AI:**
- **Right-side rail (220px):** Task list + library tabs
- **Card structure:** Thumbnail + status + prompt + cost + date + delete
- **State management:** `results[]` + `activeResultId`
- **History persistence:** `sessions[]` → localStorage

**Social Banner AI:**
- **Tab-based:** Current result (single) | Library grid (multiple)
- **Card structure:** Thumbnail + prompt + timestamp + delete
- **State management:** Single `result` + `sessions[]`
- **History persistence:** `sessions[]` → localStorage

### ❌ NOT Found

- No pre-built "AppsPage" for workspace showcase
- No separate "job history grid" component (each workspace manages its own)
- No global job queue across products
- `AppsPage.tsx` is product submission form, not workspace display

### ⚠️ Design Patterns Observed

1. **In-workspace result management:** Each workspace (`RealEstateVisualWorkspace`, `SocialBannerWorkspace`) manages its own results and history
2. **localStorage persistence:** Sessions saved with timestamp + config
3. **Tab-based viewing:** Current work | Historical work
4. **Polling for async jobs:** Real Estate polls API every 5-10 seconds with retry logic
5. **Direct generation:** Social Banner uses direct API call (no polling)
6. **Shared UI patterns:** Both workspaces use similar sidebar + main viewport layout

---

## 7. COMPONENT REUSE OPPORTUNITIES

### Shared Across Workspaces:
- `AISuggestPanel` → AI suggestions, featured templates, style selection
- `ModelEngineSettings` → Image model picker, aspect ratio, resolution
- `VideoModelEngineSettings` → Video model picker, duration, bitrate
- `ImageJobCard` → Generic result display (currently underutilized)

### Workspace-Specific:
- Task list UI (right rail in Real Estate, tabs in Social Banner)
- Polling logic (Real Estate) vs direct generation (Social Banner)
- Configuration sidebars (different options per product)

---

## 8. RECOMMENDATIONS FOR FUTURE WORK

If building a unified **Apps/Workspace showcase page:**

1. **Extract task list component:**
   - Create reusable `TaskListPanel` component
   - Accept `tasks[]`, `onSelectTask()`, `onDeleteTask()`
   - Reuse in all workspaces

2. **Standardize result management:**
   - Export `useJobPolling()` hook for async jobs
   - Centralize localStorage logic in context

3. **Create workspace registry:**
   - List all products (`RealEstateVisualAI`, `SocialBannerAI`, etc.)
   - Each registers its configuration + entry component
   - Single "Apps Dashboard" renders all

4. **Decouple AppsPage from product workspaces:**
   - `AppsPage` → Product submission (admin form)
   - New `WorkspaceHub` → User's active workspaces + history

---

## 9. LOCALSTORAGEKEYS

| Workspace | Key | Data Type |
|-----------|-----|-----------|
| Real Estate | `skyverses_REALESTATE-VISUAL-AI_vault` | JSON: `RESession[]` |
| Real Estate | `skyverses_REALESTATE-VISUAL-AI_vault_sessions` | JSON: sessions |
| Real Estate | `skyverses_REALESTATE-VISUAL-AI_vault_prompts` | JSON: last 10 prompts |
| Social Banner | `skyverses_SOCIAL-BANNER-AI_vault` | JSON: `BannerSession[]` |
| Social Banner | `skyverses_SOCIAL-BANNER-AI_vault_prompts` | JSON: last 10 prompts |

---

## 10. SAMPLE COMPONENT INTERFACE (FOR FUTURE GRID)

```typescript
// What a unified TaskListGrid might look like:
interface TaskListGridProps {
  tasks: Task[];
  activeTaskId: string | null;
  onSelectTask: (id: string) => void;
  onDeleteTask: (id: string) => void;
  columns?: 'auto' | 2 | 3 | 4;  // grid-cols-{n}
  mode?: 'current' | 'history';
  emptyMessage?: string;
}

// Both workspaces could use this instead of custom inline lists
```

---

**End of Exploration Report**
