# EXACT CODE LOCATIONS — QUICK REFERENCE

## Real Estate Visual AI Workspace
**File:** `components/RealEstateVisualWorkspace.tsx`

### Result Task List (Right Rail Panel)
```
Line 1112–1249    → Task list + library panel
Line 1113–1123    → Tab header (current | library)
Line 1125–1185    → Current tasks display (card list)
Line 1135–1183    → Individual task card rendering
Line 1142–1158    → Thumbnail with status indicator
Line 1160–1171    → Card footer (prompt + cost + date)
Line 1173–1181    → Delete button
Line 1195–1246    → Library view (historical sessions)
```

### State Variables
```
Line 188          → const [results, setResults] = useState<REResult[]>([])
Line 189          → const [activeResultId, setActiveResultId] = useState<string | null>(null)
Line 170          → const [viewMode, setViewMode] = useState<'current' | 'library'>('current')
Line 137          → const [sessions, setSessions] = useState<RESession[]>([])
```

### Key Interfaces
```
Line 117–139      → interface RESession
Line 127–139      → interface REResult
```

### Key Functions
```
Line 387–389      → const addLog = (taskId: string, msg: string) => {...}
Line 391–408      → const saveSession = (url: string, mode: WorkspaceMode, promptText: string) => {...}
Line 411–447      → const pollImageJob = async (jobId, taskId, cost) => {...}
Line 450–487      → const pollVideoJob = async (jobId, taskId, cost) => {...}
Line 626–631      → const deleteSession = (e, id) => {...}
Line 633–637      → const deleteResult = (e, id) => {...}
```

---

## Social Banner Workspace
**File:** `components/SocialBannerWorkspace.tsx`

### Result Display & Library
```
Line 715–829      → Main viewport (current + library views)
Line 715–792      → Current view (single result display)
Line 793–829      → Library view (grid of historical results)
Line 804–826      → Library card grid
```

### State Variables
```
Line 103          → const [result, setResult] = useState<string | null>(null)
Line 137          → const [sessions, setSessions] = useState<BannerSession[]>([])
Line 95           → const [viewMode, setViewMode] = useState<'current' | 'library'>('current')
```

### Key Interfaces
```
Line 69–79        → interface BannerSession
```

### Key Functions
```
Line 218–281      → const handleGenerate = async () => {...}
Line 283–288      → const deleteSession = (e, id) => {...}
```

---

## Shared ImageJobCard Component
**File:** `components/shared/ImageJobCard.tsx`

### Component Interface
```
Line 24–58        → interface ImageJobCardProps
Line 22           → type JobCardStatus = 'idle' | 'submitting' | 'processing' | 'done' | 'error'
```

### Render States
```
Line 163–195      → idle state
Line 198–226      → submitting state
Line 230–362      → processing state (with animation)
Line 365–439      → done state (with result image/video)
Line 443–469      → error state
```

### Animation Keyframes
```
Line 131–158      → @keyframes definitions (grid-pan, scan, float, orbit, shimmer)
```

### Component
```
Line 62–481       → ImageJobCard component (full implementation)
Line 84–106       → const handleDownload = async () => {...}
```

---

## AppsPage (Product Submission)
**File:** `pages/AppsPage.tsx`

```
Line 18–340       → AppsPage component
Line 55–80        → Not logged in state
Line 82–224       → Form layout (left sidebar + form)
Line 92–135       → Step indicator + info cards
Line 229–335      → Developer Portal section
```

---

## Supporting Components

### AISuggestPanel
**File:** `components/workspace/AISuggestPanel.tsx`
- Shared by Real Estate and Social Banner workspaces
- Provides template suggestions, style presets, history

### ModelEngineSettings
**File:** `components/image-generator/ModelEngineSettings.tsx`
- Shared image model configuration component

### VideoModelEngineSettings
**File:** `components/video-generator/VideoModelEngineSettings.tsx`
- Shared video model configuration component

---

## localStorage Keys

### Real Estate Visual AI
- `skyverses_REALESTATE-VISUAL-AI_vault_sessions` → Sessions[]
- `skyverses_REALESTATE-VISUAL-AI_vault_prompts` → string[] (last 10)

### Social Banner AI
- `skyverses_SOCIAL-BANNER-AI_vault` → BannerSession[]
- `skyverses_SOCIAL-BANNER-AI_vault_prompts` → string[] (last 10)

---

## API Endpoints Called

### Real Estate
```
imagesApi.createJob(payload)     → Submit image generation job
imagesApi.getJobStatus(jobId)    → Poll image job status (5-10s intervals)
videosApi.createJob(payload)     → Submit video generation job
videosApi.getJobStatus(jobId)    → Poll video job status (5-10s intervals)
```

### Social Banner
```
generateDemoImage(finalPrompt, references)  → Direct image generation
```

---

## CSS Classes Used

### Real Estate Task Cards
```
border-brand-blue/50, shadow-sm, shadow-brand-blue/10
aspect-video
group (for hover effects)
opacity-0 group-hover:opacity-100 (for delete button)
animate-pulse (for loading)
```

### Social Banner Library Cards
```
grid-cols-2 lg:grid-cols-3 gap-4
aspect-video
group-hover:scale-105
group-hover:-translate-y-0.5
```

---

## Key Type Exports

```typescript
// REResult (Real Estate)
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
  logs?: string[];
}

// BannerSession (Social Banner)
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

// ImageJobCardProps (Shared)
type JobCardStatus = 'idle' | 'submitting' | 'processing' | 'done' | 'error';
interface ImageJobCardProps {
  status: JobCardStatus;
  resultUrl?: string;
  progress?: number;
  statusText?: string;
  errorMessage?: string;
  isVideo?: boolean;
  mode?: 'full' | 'compact';
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

