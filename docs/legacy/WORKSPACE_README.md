# Skyverses Marketplace AI — Workspace Exploration Report

## 📋 Quick Navigation

This folder contains comprehensive exploration of the Real Estate Visual AI and Social Banner AI workspaces.

### 📄 Documentation Files

1. **WORKSPACE_EXPLORATION.md** (12 KB) — START HERE
   - Full analysis of both workspaces
   - State variables and data flows
   - Card structures and UI patterns
   - Design patterns and recommendations
   - localStorage keys reference

2. **WORKSPACE_CODE_LOCATIONS.md** (6.2 KB) — For Developers
   - Exact line numbers for all major sections
   - Component interfaces and types
   - Key functions and API calls
   - CSS classes used
   - Type exports reference

3. **WORKSPACE_ARCHITECTURE.txt** (22 KB) — Visual Reference
   - ASCII diagrams showing workspace layouts
   - State flow diagrams
   - Component hierarchy
   - Reuse opportunities

---

## 🎯 Executive Summary

### What We Found

✅ **Real Estate Visual AI Workspace**
- File: `components/RealEstateVisualWorkspace.tsx` (1,488 lines)
- Dual-mode: Image + Video generation
- Layout: Sidebar (config) | Viewport (result) | Right rail (task list)
- Job history: ✅ YES (right panel with tabs)
- Job handling: Polling-based (5-10s intervals)

✅ **Social Banner AI Workspace**
- File: `components/SocialBannerWorkspace.tsx` (1,008 lines)
- Single-mode: Banner generation only
- Layout: Sidebar (config) | Viewport (result with tabs)
- Job history: ✅ YES (tab-based library)
- Job handling: Direct generation (no polling)

✅ **Shared Components**
- `ImageJobCard` — Generic result card (5 states, not currently used)
- `AISuggestPanel` — Template suggestions (shared)
- `ModelEngineSettings` — Image config (shared)
- `VideoModelEngineSettings` — Video config (shared)

⚠️ **AppsPage is NOT a Workspace**
- File: `pages/AppsPage.tsx` (341 lines)
- This is a product submission form for developers
- Not a workspace execution environment

---

## 🏗️ Architecture Comparison

### Real Estate Visual AI

```
┌─────────────┐ ┌──────────────────┐ ┌──────────────┐
│   SIDEBAR   │ │  MAIN VIEWPORT   │ │  RIGHT RAIL  │
│  380px      │ │  (flexible)      │ │  220px       │
├─────────────┤ ├──────────────────┤ ├──────────────┤
│ • Property  │ │ Active Result:   │ │ [Tabs]       │
│   type      │ │ • Loading        │ │ • Current    │
│ • Industry  │ │ • Done           │ │ • Library    │
│ • Mode      │ │ • Error          │ │              │
│ • Config    │ │ • Empty          │ │ ┌──────────┐ │
│ • Prompt    │ │                  │ │ │Task Card │ │
│ • Refs      │ │                  │ │ │[Thumb]   │ │
│ [Generate]  │ │                  │ │ │Status:✓  │ │
└─────────────┘ └──────────────────┘ │ │5000 CR   │ │
                                     │ │Apr 10... │ │
                                     │ └──────────┘ │
                                     └──────────────┘
```

**State Flow:**
1. User generates → Create task object
2. Append to results array: `setResults([newTask, ...results])`
3. Poll API every 5-10s → Update status & URL
4. User clicks card → `setActiveResultId(taskId)` → Show in main viewport
5. On success → `saveSession()` → Persist to localStorage

### Social Banner AI

```
┌─────────────┐ ┌──────────────────┐
│   SIDEBAR   │ │  MAIN VIEWPORT   │
│  380px      │ │  (flexible)      │
├─────────────┤ ├──────────────────┤
│ • Platform  │ │ [Tabs]           │
│   selector  │ │ • Current        │
│ • Industry  │ │ • Library        │
│ • Templates │ │                  │
│ • Style     │ │ Current View:    │
│ • Prompt    │ │ ╔──────────────╗ │
│ • Text cfg  │ │ ║Result Image  ║ │
│ • Refs      │ │ ║              ║ │
│ • Colors    │ │ ║Or Loading    ║ │
│ [Generate]  │ │ ║Or Empty      ║ │
│             │ │ ╚──────────────╝ │
│             │ │                  │
│             │ │ Library View:    │
│             │ │ [Grid 2-3 cols]  │
│             │ │ [Card] [Card]    │
│             │ │ [Card] [Card]    │
└─────────────┘ └──────────────────┘
```

**State Flow:**
1. User generates → `setIsGenerating(true)`
2. API call (direct) → Get imageUrl
3. `setResult(imageUrl)` + append to sessions + save localStorage
4. User toggles tabs: current (single) vs library (grid)
5. Library click → `setResult(sessionUrl); setViewMode('current')`

---

## 💾 State Management

### Real Estate

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

// In-memory current session
const [results, setResults] = useState<REResult[]>([]);
const [activeResultId, setActiveResultId] = useState<string | null>(null);

// Persistent history
const [sessions, setSessions] = useState<RESession[]>([]);
const [viewMode, setViewMode] = useState<'current' | 'library'>('current');
```

### Social Banner

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

// Single result at a time
const [result, setResult] = useState<string | null>(null);

// Persistent history
const [sessions, setSessions] = useState<BannerSession[]>([]);
const [viewMode, setViewMode] = useState<'current' | 'library'>('current');
```

---

## 📦 localStorage Keys

| Workspace | Key | Data |
|-----------|-----|------|
| Real Estate | `skyverses_REALESTATE-VISUAL-AI_vault_sessions` | `RESession[]` |
| Real Estate | `skyverses_REALESTATE-VISUAL-AI_vault_prompts` | `string[]` (last 10) |
| Social Banner | `skyverses_SOCIAL-BANNER-AI_vault` | `BannerSession[]` |
| Social Banner | `skyverses_SOCIAL-BANNER-AI_vault_prompts` | `string[]` (last 10) |

---

## 🔄 Job Handling Comparison

### Real Estate (Polling-Based)

```
User generates
     ↓
Create task object with status:'processing'
     ↓
Call imagesApi.createJob(payload) or videosApi.createJob(payload)
     ↓
Receive jobId
     ↓
Every 5 seconds:
  Call imagesApi.getJobStatus(jobId) or videosApi.getJobStatus(jobId)
  ↓
  If status === 'done': Update task.url, task.status = 'done'
  If status === 'error': Refund credits, task.status = 'error'
  If status === 'processing': Continue polling
     ↓
User sees task card update in real-time
```

**API:** `imagesApi.createJob()`, `imagesApi.getJobStatus()`, `videosApi.*`

### Social Banner (Direct Generation)

```
User generates
     ↓
setIsGenerating(true)
     ↓
Call generateDemoImage(finalPrompt, references)
     ↓
Receive imageUrl immediately
     ↓
setResult(imageUrl)
Append to sessions
Save localStorage
     ↓
User sees result immediately
```

**API:** `generateDemoImage()`

---

## 🔧 Reusable Components

### ✅ Already Shared
- **AISuggestPanel** — Both workspaces use for templates/suggestions
- **ModelEngineSettings** — Image workspaces for model selection
- **VideoModelEngineSettings** — Video workspaces for model selection

### ⚠️ Could Be Shared (Currently Not)
- **ImageJobCard** component exists but workspaces implement custom displays
- Task list UI logic (each workspace implements its own)
- localStorage persistence logic (each workspace implements its own)
- API polling logic (only Real Estate implements, could be abstracted)

---

## 🎯 Design Patterns

1. **Self-Contained Workspaces**
   - Each workspace manages its own state
   - No cross-workspace communication
   - Sidebar + viewport + panel layout

2. **Tab-Based History View**
   - Current work vs. historical work
   - Easy switching between modes
   - localStorage persistence

3. **Polling Pattern (Real Estate)**
   - Submit job → Get jobId
   - Poll every 5-10s until done
   - Update state in real-time
   - Show progress/logs

4. **Direct Generation Pattern (Social Banner)**
   - Submit → Get result immediately
   - Simpler UX, instant feedback
   - Good for fast operations

---

## 💡 Refactoring Opportunities

### Extract TaskListPanel Component
```typescript
// Reusable across all workspaces
<TaskListPanel
  tasks={results}
  activeTaskId={activeResultId}
  onSelectTask={(id) => setActiveResultId(id)}
  onDeleteTask={(id) => deleteResult(id)}
  mode="current"
/>
```

### Create useJobPolling Hook
```typescript
// Standardize polling logic
const { status, progress, logs } = useJobPolling(jobId, {
  pollInterval: 5000,
  onComplete: (url) => setResult(url),
  onError: (err) => handleError(err),
});
```

### Create useLocalStorageHistory Hook
```typescript
// Centralize storage logic
const { history, addToHistory, deleteFromHistory } = useLocalStorageHistory(
  'storage-key',
  maxItems: 50
);
```

---

## 📚 File Reference Quick Links

| Component | File | Lines | Purpose |
|-----------|------|-------|---------|
| Real Estate Workspace | `components/RealEstateVisualWorkspace.tsx` | 1,488 | Main workspace for RE visual AI |
| Social Banner Workspace | `components/SocialBannerWorkspace.tsx` | 1,008 | Main workspace for banners |
| ImageJobCard | `components/shared/ImageJobCard.tsx` | 484 | Generic result card (unused) |
| AISuggestPanel | `components/workspace/AISuggestPanel.tsx` | ? | Template suggestions |
| ModelEngineSettings | `components/image-generator/ModelEngineSettings.tsx` | ? | Image config |
| VideoModelEngineSettings | `components/video-generator/VideoModelEngineSettings.tsx` | ? | Video config |
| AppsPage | `pages/AppsPage.tsx` | 341 | Product submission (NOT workspace) |

---

## 🚀 Next Steps

1. Review `WORKSPACE_EXPLORATION.md` for detailed analysis
2. Use `WORKSPACE_CODE_LOCATIONS.md` to find exact code sections
3. Reference `WORKSPACE_ARCHITECTURE.txt` for visual diagrams
4. Consider refactoring opportunities outlined above
5. Use existing patterns when building new workspaces

---

**Last Updated:** April 10, 2026  
**Explorer:** Claude Code  
**Status:** ✅ Complete & Documented
