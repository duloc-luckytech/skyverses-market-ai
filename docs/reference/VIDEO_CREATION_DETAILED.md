# 🎬 VIDEO CREATION - DETAILED LOGIC GUIDE

## 📍 MAIN ENTRY POINTS

### 1. Landing Page
**File:** `pages/videos/AIVideoGenerator.tsx`

```typescript
import AIVideoGeneratorWorkspace from '../../components/AIVideoGeneratorWorkspace';
import { HeroSection } from '../../components/landing/video-generator/HeroSection';
import { WorkflowSection } from '../../components/landing/video-generator/WorkflowSection';
import { ModesSection } from '../../components/landing/video-generator/ModesSection';
import { UseCasesSection } from '../../components/landing/video-generator/UseCasesSection';
import { FinalCTA } from '../../components/landing/video-generator/FinalCTA';

// Landing page (L1) shows when NOT in studio
// Studio mode (fullscreen) when isStudioOpen = true
if (isStudioOpen) {
  return <div className="fixed inset-0 z-[500]"><AIVideoGeneratorWorkspace ... /></div>;
}

// Normal landing flow
return (
  <div>
    <HeroSection onStartStudio={() => setIsStudioOpen(true)} />
    <WorkflowSection />
    <ModesSection />
    <UseCasesSection />
    <FinalCTA onStartStudio={() => setIsStudioOpen(true)} />
  </div>
);
```

---

### 2. Workspace Component (MAIN LOGIC)
**File:** `components/AIVideoGeneratorWorkspace.tsx` (810 lines)

**Top-level state:**
```typescript
// Modes & tabs
const [activeMode, setActiveMode] = useState<'SINGLE' | 'MULTI' | 'AUTO'>('SINGLE');
const [activeTab, setActiveTab] = useState<'SESSION' | 'HISTORY'>('SESSION');

// AI config
const [availableModels, setAvailableModels] = useState<PricingModel[]>([]);
const [selectedModelObj, setSelectedModelObj] = useState<PricingModel | null>(null);
const [selectedEngine, setSelectedEngine] = useState('gommo');        // gommo, veo, etc.
const [selectedMode, setSelectedMode] = useState('relaxed');         // relaxed, fast, quality
const [selectedFamily, setSelectedFamily] = useState('VEO');         // model family

// Config params
const [ratio, setRatio] = useState('16:9');                          // aspect ratio
const [duration, setDuration] = useState('8s');                       // video length
const [soundEnabled, setSoundEnabled] = useState(false);
const [resolution, setResolution] = useState('720p');                 // 720p, 1080p, 2k, 4k
const [quantity, setQuantity] = useState(1);                          // how many to generate

// Results & history
const [results, setResults] = useState<VideoResult[]>([]);
const [selectedVideoIds, setSelectedVideoIds] = useState<string[]>([]);
const resultsRef = useRef<VideoResult[]>([]);                        // ⚠️ prevent stale closure in polling
```

---

## 🎯 THREE CREATION MODES

### MODE 1: SINGLE (Text-to-Video)
**User input:**
- Prompt (text)
- Optional: Start frame (image) → image-to-video mode
- Optional: End frame (image) → start-end-image mode
- Quantity (1, 2, 5, 10)

**Job type:**
```typescript
let type: "text-to-video" | "image-to-video" | "start-end-image" = "text-to-video";
if (startFrame && endFrame) type = "start-end-image";
else if (startFrame) type = "image-to-video";
```

### MODE 2: MULTI (Frame Sequence)
**User input:**
- Sequence of frames (images)
- Each frame paired to next → generates transition video

**Job type:** Always `"image-to-video"` (between consecutive frames)

### MODE 3: AUTO (Batch)
**User input:**
- Multiple prompts (bulk import or manual input)
- Optional start/end frames for each
- Auto-generates all in sequence

**Job type:** Determined per task like SINGLE mode

---

## 🔄 COMPLETE FLOW (SINGLE MODE EXAMPLE)

### STEP 1: USER CLICKS GENERATE

```typescript
const handleGenerate = async () => {
  if (isGenerateDisabled) return;
  if (!isAuthenticated) { login(); return; }
  if (!usagePreference) { setIsResumingGenerate(true); setShowResourceModal(true); return; }
  
  performInference(usagePreference);  // 'credits' | 'key'
};
```

---

### STEP 2: PERFORM INFERENCE (Setup & Create Jobs)

**File:** AIVideoGeneratorWorkspace.tsx, lines 346-462

```typescript
const performInference = async (
  currentPreference: 'credits' | 'key',
  retryTask?: VideoResult,
  isAutoRetry: boolean = false
) => {
  // A. Pre-flight checks
  if (!selectedModelObj) return;
  
  const costToPay = retryTask ? retryTask.cost : currentTotalCost;
  if (currentPreference === 'credits' && !isAutoRetry && credits < costToPay) {
    setShowLowCreditAlert(true);
    return;
  }

  setIsGenerating(true);

  // B. Build task list to produce (based on activeMode)
  const tasksToProduce = retryTask
    ? [{ /* retry single task */ }]
    : activeMode === 'SINGLE'
      ? Array(quantity).fill(null).map((_, i) => ({
          id: `single-${Date.now()}-${i}`,
          type,                         // text-to-video | image-to-video | start-end-image
          prompt,
          startUrl: startFrame,
          startMediaId: startFrameId,
          endUrl: endFrame,
          endMediaId: endFrameId,
          cost: currentUnitCost,
          ratio
        }))
      : activeMode === 'MULTI'
        ? /* build from multiFrames */ []
        : autoTasks.filter(...).map(...);

  // C. Create initial results UI (all "processing" status)
  if (!retryTask) {
    const newResults: VideoResult[] = tasksToProduce.map(t => ({
      id: t.id,                                          // LOCAL ID initially!
      url: null,
      prompt: t.prompt,
      fullTimestamp: timestamp,
      dateKey: todayKey,
      displayDate: now.toLocaleDateString('vi-VN'),
      model: selectedModelObj.name,
      mode: selectedMode,
      duration,
      resolution,
      engine: selectedEngine,
      status: 'processing',
      hasSound: soundEnabled,
      aspectRatio: t.ratio as any,
      cost: t.cost,
      startImg: t.startUrl,
      endImg: t.endUrl,
      logs: [`[${new Date().toLocaleTimeString('vi-VN')}] [SYSTEM] Production pipeline initialized.`]
    }));
    
    setResults(prev => [...newResults, ...prev]);  // Add new tasks to top
  }

  // D. For each task: Create API job + start polling
  try {
    await Promise.all(tasksToProduce.map(async (task) => {
      try {
        addLogToTask(task.id, `[UPLINK] Authenticating resource pool: ${currentPreference.toUpperCase()}`);

        if (currentPreference === 'credits') {
          // 🎬 BUILD JOB PAYLOAD
          const inputImages = [task.startUrl || null, task.endUrl || null];
          const payload: VideoJobRequest = {
            type: task.type,
            input: { images: inputImages },
            config: {
              duration: parseInt(duration),
              aspectRatio: task.ratio,
              resolution: resolution
            },
            engine: {
              provider: selectedEngine as any,
              model: selectedModelObj.modelKey as any
            },
            enginePayload: {
              accessToken: "YOUR_GOMMO_ACCESS_TOKEN",
              prompt: task.prompt,
              privacy: "PRIVATE",
              translateToEn: true,
              projectId: "default",
              mode: selectedMode as any
            }
          };

          addLogToTask(task.id, `[NODE_INIT] Provisioning H100 GPU cluster...`);

          // 🎬 CREATE JOB VIA API
          const res = await videosApi.createJob(payload);
          const isSuccess = res.success === true || res.status?.toLowerCase() === 'success';

          if (isSuccess && res.data.jobId) {
            const serverJobId = res.data.jobId;
            addLogToTask(task.id, `[API_READY] Remote job recognized. ID: ${serverJobId}`);

            // 🔑 CRITICAL: Swap local ID → server ID
            setResults(prev => prev.map(r => 
              r.id === task.id ? { ...r, id: serverJobId } : r
            ));

            // 🔑 CRITICAL: Deduct credits NOW
            if (!isAutoRetry) useCredits(task.cost);

            // 🔑 START POLLING
            pollVideoJobStatus(serverJobId, serverJobId, task.cost);
          } else {
            addLogToTask(task.id, `[ERROR] Resource handshake rejected: ${res.message}`);
            setResults(prev => prev.map(r => 
              r.id === task.id ? { ...r, status: 'error', errorMessage: res.message } : r
            ));
          }
        } else {
          // Demo mode (personal key) — direct synthesis, NO polling
          addLogToTask(task.id, `[DIRECT_INFERENCE] Bypassing internal pool. Using personal SDK...`);
          const url = await generateDemoVideo({ /* params */ });
          if (url) {
            addLogToTask(task.id, `[SUCCESS] Direct synthesis complete.`);
            setResults(prev => prev.map(r => 
              r.id === task.id ? { ...r, url, status: 'done' } : r
            ));
          } else {
            addLogToTask(task.id, `[ERROR] Personal SDK returned empty.`);
            setResults(prev => prev.map(r => 
              r.id === task.id ? { ...r, status: 'error' } : r
            ));
          }
        }
      } catch (e) {
        addLogToTask(task.id, `[CRITICAL_FAIL] Logic gate error: ${String(e)}`);
        setResults(prev => prev.map(r => 
          r.id === task.id ? { ...r, status: 'error' } : r
        ));
      }
    }));
  } finally {
    setIsGenerating(false);
  }
};
```

---

### STEP 3: POLL JOB STATUS (Every 5s)

**File:** AIVideoGeneratorWorkspace.tsx, lines 305-344

```typescript
const pollVideoJobStatus = async (jobId: string, resultId: string, cost: number) => {
  try {
    addLogToTask(resultId, `[POLLING] Requesting status update for node cluster...`);
    const response: VideoJobResponse = await videosApi.getJobStatus(jobId);

    const isSuccess = response.success === true || response.status?.toLowerCase() === 'success';
    const jobStatus = response.data?.status?.toLowerCase();
    const errorMsg = response.data?.error?.message || response.data?.error?.userMessage || "";

    // 🔴 BRANCH 1: ERROR STATE
    if (!isSuccess || jobStatus === 'failed' || jobStatus === 'error') {
      addLogToTask(resultId, `[ERROR] Synthesis aborted: ${errorMsg || 'Unknown backend error'}`);
      
      setResults(prev => prev.map(r => {
        if (r.id === resultId) {
          // REFUND credits if job failed
          if (usagePreference === 'credits' && !r.isRefunded) {
            addCredits(r.cost);  // ← REFUND ACTION
            return { 
              ...r, 
              status: 'error', 
              isRefunded: true, 
              errorMessage: errorMsg || 'Unknown error' 
            };
          }
          return { ...r, status: 'error', errorMessage: errorMsg || 'Unknown error' };
        }
        return r;
      }));
      
      return;  // EXIT polling
    }

    // 🟢 BRANCH 2: SUCCESS STATE
    if (jobStatus === 'done' && response.data.result?.videoUrl) {
      addLogToTask(resultId, `[SUCCESS] Synthesis manifest completed. Delivering assets to CDN...`);
      const videoUrl = response.data.result.videoUrl;
      
      setResults(prev => prev.map(r => 
        r.id === resultId ? { ...r, url: videoUrl, status: 'done' } : r
      ));
      
      refreshUserInfo();  // Update user info from backend
      
      if (autoDownloadRef.current) {
        triggerDownload(videoUrl, `video_${resultId}.mp4`);
      }
      
      return;  // EXIT polling
    }

    // 🟡 BRANCH 3: STILL PROCESSING
    addLogToTask(resultId, `[STATUS] Pipeline state: ${jobStatus?.toUpperCase() || 'SYNTHESIZING'}`);
    
    // CONTINUE POLLING in 5 seconds
    setTimeout(() => pollVideoJobStatus(jobId, resultId, cost), 5000);
    
  } catch (e) {
    // Network error → longer retry interval
    addLogToTask(resultId, `[NETWORK] Connectivity drift. Retrying telemetry uplink...`);
    
    setTimeout(() => pollVideoJobStatus(jobId, resultId, cost), 10000);  // 10s retry
  }
};
```

---

## 📊 STATE TRANSITIONS DIAGRAM

```
User clicks Generate
         ↓
performInference() called
         ↓
Create PayloadTask (local ID = `single-${Date.now()}-${i}`)
         ↓
setResults(...) → VideoResult { status: 'processing', id: localId }
         ↓
videosApi.createJob(payload)
         ↓
Success? YES → setResults(...id = serverJobId...)     NO → status: 'error'
         ↓
useCredits(cost)
         ↓
pollVideoJobStatus(serverJobId, serverJobId, cost)
         ↓
         ├─→ Every 5s: getJobStatus(serverJobId)
         │
         ├─→ Result: 'done'
         │    └─→ setResults(...status: 'done', url: ...)
         │    └─→ refreshUserInfo()
         │    └─→ EXIT
         │
         ├─→ Result: 'failed' | 'error'
         │    └─→ IF !isRefunded: addCredits(cost)
         │    └─→ setResults(...status: 'error', isRefunded: true...)
         │    └─→ EXIT
         │
         └─→ Result: 'processing'
              └─→ Continue polling in 5s
```

---

## 🛠️ KEY HELPER FUNCTIONS

### Add Log to Task
```typescript
const addLogToTask = (taskId: string, message: string) => {
  const timestamp = new Date().toLocaleTimeString('vi-VN');
  const logEntry = `${message}`;
  
  setResults(prev => prev.map(r => 
    r.id === taskId 
      ? { ...r, logs: [...(r.logs || []), logEntry] } 
      : r
  ));
};
```

### Download Video
```typescript
const triggerDownload = (url: string, filename: string) => {
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
};
```

### Calculate Total Cost
```typescript
const currentTotalCost = useMemo(() => {
  if (activeMode === 'AUTO') 
    return autoTasks.filter(t => t.prompt.trim() !== '').length * currentUnitCost;
  if (activeMode === 'MULTI') 
    return (multiFrames.length - 1) * currentUnitCost;
  return currentUnitCost * quantity;
}, [activeMode, autoTasks, multiFrames, currentUnitCost, quantity]);
```

---

## 🎨 UI COMPONENTS & LAYOUT

### Main Workspace Layout
```
┌─────────────────────────────────────────────────────────────────────┐
│                         TOP NAVIGATION (h-14)                        │
│  [Current Session | Library(N)] ───────────── [Credits] [Close X]   │
├──────────────────────────┬──────────────────────────────────────────┤
│   SIDEBAR (w-[380px])   │           VIEWPORT (flex-1)              │
│                          │                                           │
│ [SINGLE|MULTI|AUTO]     │  ┌────────────────────────────┐           │
│  Tab selector            │  │                            │           │
│                          │  │   Active Result Preview    │           │
│ ─ Mode selector ─        │  │   (Processing skeleton     │           │
│ ─ Prompt textarea ─      │  │    or video thumbnail)    │           │
│ ─ AI Suggest Panel ─     │  │                            │           │
│                          │  │ [Download] [Fullscreen]   │           │
│ Engine:  [Dropdown]     │  │                            │           │
│ Model:   [Dropdown]     │  └────────────────────────────┘           │
│ Mode:    [Dropdown]     │                                           │
│ Resolution: [Dropdown]  │  ┌─ RESULTS/HISTORY RAIL ───┐           │
│ Ratio:   [Dropdown]     │  │ [SESSION | HISTORY]       │           │
│ Duration: [Slider]      │  │                           │           │
│ Quantity: [Spinner]     │  │ Task cards (clickable):   │           │
│                          │  │ • ✓ Done (green badge)   │           │
│ [Generate] 240 CR        │  │ • ⟳ Processing           │           │
│                          │  │ • ✗ Error (red badge)    │           │
│                          │  │                           │           │
│                          │  │ [Select All] [Download]   │           │
│                          │  └───────────────────────────┘           │
└──────────────────────────┴──────────────────────────────────────────┘
```

### Components Used
- `SidebarLeft.tsx` — Input sidebar
- `ResultsMain.tsx` — Viewport + results rail
- `VideoCard.tsx` — Individual result card
- `VideoModelEngineSettings.tsx` — AI engine config section
- `AISuggestPanel.tsx` — AI prompt suggestions

---

## 📝 ERROR HANDLING

### Common Error Scenarios

**1. Insufficient Credits**
```typescript
if (credits < costToPay) {
  setShowLowCreditAlert(true);  // Show modal
  return;
}
```

**2. Job API Failure**
```typescript
if (!isSuccess || !res.data.jobId) {
  setResults(prev => prev.map(r => 
    r.id === task.id ? { ...r, status: 'error', errorMessage: res.message } : r
  ));
}
```

**3. Job Synthesis Failure (During Polling)**
```typescript
if (jobStatus === 'failed' || jobStatus === 'error') {
  if (usagePreference === 'credits' && !r.isRefunded) {
    addCredits(r.cost);  // REFUND
  }
  // Mark as error
}
```

**4. Network Error (During Polling)**
```typescript
catch (e) {
  // Retry after 10s (not 5s)
  setTimeout(() => pollVideoJobStatus(...), 10000);
}
```

---

## 🔐 RESOURCE MANAGEMENT

### Credit Usage Lifecycle

```
User has 1000 credits
         ↓
Start video generation (cost 120 CR each × 1 = 120 total)
         ↓
Display: 1000 CR (not deducted yet)
         ↓
performInference → videosApi.createJob SUCCESS
         ↓
useCredits(120) ← DEDUCT NOW
         ↓
Display: 880 CR
         ↓
Poll status...
         ↓
Job failed after 30s
         ↓
addCredits(120) ← REFUND
         ↓
Display: 1000 CR (back to original)
```

### Auto Download
```typescript
const autoDownloadRef = useRef(false);
useEffect(() => {
  autoDownloadRef.current = autoDownload;
}, [autoDownload]);

// In polling success branch:
if (autoDownloadRef.current) {
  triggerDownload(videoUrl, `video_${resultId}.mp4`);
}
```

---

## 🎓 BEST PRACTICES

✅ **DO:**
- Swap ID immediately after API success
- Deduct credits after confirmed API success
- Add logs at each phase for debugging
- Keep `resultsRef` in sync to avoid stale closure
- Poll every 5s for normal state, 10s for network error
- Refund credits if job fails and not already refunded
- Use `useCredits()` + `addCredits()` for all credit changes
- Show skeleton loader while polling

❌ **DON'T:**
- Deduct credits before API call succeeds
- Use local ID for polling (always use serverJobId)
- Poll too fast (< 5s) or too slow (> 10s)
- Double-refund (check `isRefunded` flag)
- Skip logging — logs help debug issues
- Mutate results array directly (always use setResults)
- Assume API response format without validation

---

## 📚 REFERENCES

**Main Files:**
- `AIVideoGeneratorWorkspace.tsx` — Full implementation
- `QUICK_REFERENCE.md` — Copy-paste template
- `JOB_POLLING_PATTERN_ANALYSIS.md` — Detailed reference

**Related Patterns:**
- `useImageGenerator.ts` — Image polling (same pattern)
- `SocialBannerWorkspace.tsx` — Direct generation (no polling)
- `RealEstateVisualWorkspace.tsx` — Multi-output workspace

