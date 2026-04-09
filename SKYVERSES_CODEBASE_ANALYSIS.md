# 🎯 SKYVERSES MARKET AI - CODEBASE EXPLORATION SUMMARY

## 📋 PHẦN I - KIẾN TRÚC TỔNG QUAN

### A. Quy Trình "Add New Product" (`.agents/workflows/add_new_product.md`)

File: `/Users/duloc/Desktop/SKYVERSES/ai-skyverses/skyverses-market-ai/.agents/workflows/add_new_product.md`
Kích thước: 117KB (workflow hoàn chỉnh 9 bước)

**9 BƯỚC CHÍNH:**
```
STEP 0 → Đọc skills architecture
STEP 1 → Xác định product metadata (slug, id, name, category, description, features, price, complexity, tags)
STEP 2 → Tạo seed script → node seed-<slug>.mjs → ghi lại _id
STEP 2.5 → Verify seed success (curl test)
STEP 3 → Gen & upload demo images (3-5 images per platform) → gen-<slug>-images.mjs
STEP 3.5 → Plan PRO landing page (13 câu hỏi: hero type, specs, workflow, features, etc.)
STEP 3.6 → Section Image Guidelines (CDN > Explorer API > Unsplash fallback)
STEP 4 → Build 8 landing section files (HeroSection, WorkflowSection, ShowcaseSection, FeaturesSection, UseCasesSection, FAQSection, FinalCTA, LiveStatsBar)
STEP 5 → Create landing page orchestrator (pages/images/YourProductAI.tsx)
STEP 6 → Build Workspace component (SocialBannerWorkspace pattern)
STEP 6.5 → AI Engine Config (ModelEngineSettings component) — BẮT BUỘC cho image/video products
STEP 7-9 → Wire routing, verify TypeScript, deploy
```

---

### B. Trang/Component Video Creation

**1. Pages:**
- `pages/videos/AIVideoGenerator.tsx` (thin orchestrator)
  - Imports: `AIVideoGeneratorWorkspace` (component chính)
  - Sections: HeroSection, WorkflowSection, ModesSection, UseCasesSection, FinalCTA

**2. Workspace (Component chính):**
- File: `components/AIVideoGeneratorWorkspace.tsx` (810 lines)
- **Modes:** SINGLE | MULTI | AUTO
- **States:**
  ```
  activeMode: CreationMode
  activeTab: 'SESSION' | 'HISTORY'
  isGenerating: boolean
  prompt: string
  startFrame, endFrame: URL | null
  multiFrames: MultiFrameNode[]
  autoTasks: AutoTask[]
  results: VideoResult[]
  selectedVideoIds: string[]
  ```

**3. Video Generation Components:**
```
components/video-generator/
  ├── VideoModelEngineSettings.tsx  ← AI engine config
  ├── VideoCard.tsx                 ← Result card display
  └── SidebarLeft.tsx               ← Input sidebar
  
components/
  ├── TextToVideoWorkspace.tsx
  ├── VideoAnimateWorkspace.tsx
  ├── ArticleToVideoWorkspace.tsx
  └── AudioToVideoWorkspace.tsx
```

---

## 📋 PHẦN II - JOB POLLING PATTERN (Tạo Video/Ảnh)

### A. Pattern Cốt Lõi

File: `/QUICK_REFERENCE.md` (8KB)

**3 Bước Chính:**

#### 1️⃣ CREATE JOB
```typescript
const payload: VideoJobRequest = {
  type: task.type,                    // "text-to-video" | "image-to-video" | "start-end-image"
  input: { images: inputImages },     // [startUrl, endUrl]
  config: { 
    duration: parseInt(duration), 
    aspectRatio: task.ratio, 
    resolution: resolution 
  },
  engine: { 
    provider: selectedEngine,         // "gommo", "veo", etc.
    model: selectedModelObj.modelKey 
  },
  enginePayload: { /* model-specific */ }
};

const res = await videosApi.createJob(payload);
const isSuccess = res.success === true || res.status?.toLowerCase() === 'success';

if (isSuccess && res.data.jobId) {
  const serverJobId = res.data.jobId;
  
  // 🔑 BẮT BUỘC: Swap local ID → server ID
  setResults(prev => prev.map(r => 
    r.id === task.id ? { ...r, id: serverJobId } : r
  ));
  
  // 🔑 BẮT BUỘC: Trừ credits SAU khi confirmed success (không trước)
  useCredits(task.cost);
  
  // Bắt đầu polling
  pollVideoJobStatus(serverJobId, serverJobId, task.cost);
}
```

**Key Points:**
- ✅ Deduct credits **AFTER** successful API call
- ✅ Swap local ID to serverJobId **BEFORE** polling
- ❌ Do NOT deduct on button click
- ❌ Do NOT use local ID for polling

#### 2️⃣ POLL STATUS (3 branches)
```typescript
const pollVideoJobStatus = async (jobId: string, resultId: string, cost: number) => {
  try {
    const response: VideoJobResponse = await videosApi.getJobStatus(jobId);
    const jobStatus = response.data?.status?.toLowerCase();

    // BRANCH 1: ERROR → Refund + Exit
    if (jobStatus === 'failed' || jobStatus === 'error') {
      if (usagePreference === 'credits' && !r.isRefunded) {
        addCredits(r.cost);  // ← REFUND
        return { ...r, status: 'error', isRefunded: true };
      }
      return;
    }

    // BRANCH 2: SUCCESS → Update URL + Exit
    if (jobStatus === 'done' && response.data.result?.videoUrl) {
      const videoUrl = response.data.result.videoUrl;
      setResults(prev => prev.map(r => 
        r.id === resultId ? { ...r, url: videoUrl, status: 'done' } : r
      ));
      refreshUserInfo();
      return;
    }

    // BRANCH 3: PROCESSING → Keep polling
    setTimeout(() => pollVideoJobStatus(jobId, resultId, cost), 5000);
  } catch (e) {
    // Network error → retry slower
    setTimeout(() => pollVideoJobStatus(jobId, resultId, cost), 10000);
  }
};
```

**Polling Intervals:**
- Normal: 5 seconds
- Network error: 10 seconds

#### 3️⃣ LOGGING PHASES
```
[SYSTEM] Production pipeline initialized.
[UPLINK] Authenticating resource pool: CREDITS
[NODE_INIT] Provisioning H100 GPU cluster...
[API_READY] Remote job recognized. ID: {serverJobId}
[POLLING] Requesting status update for node cluster...
[STATUS] Pipeline state: PROCESSING
[SUCCESS] Synthesis complete. Delivering asset to CDN...
[ERROR] Synthesis aborted: {errorMsg}
[NETWORK] Connectivity drift. Retrying telemetry uplink...
```

---

### B. Implementation ở AIVideoGeneratorWorkspace.tsx

**Lines 305-344: pollVideoJobStatus**
```typescript
const pollVideoJobStatus = async (jobId: string, resultId: string, cost: number) => {
  try {
    addLogToTask(resultId, `[POLLING] Requesting status update...`);
    const response: VideoJobResponse = await videosApi.getJobStatus(jobId);
    
    const isSuccess = response.success === true || response.status?.toLowerCase() === 'success';
    const jobStatus = response.data?.status?.toLowerCase();
    const errorMsg = response.data?.error?.message || response.data?.error?.userMessage || "";

    // ERROR branch
    if (!isSuccess || jobStatus === 'failed' || jobStatus === 'error') {
      addLogToTask(resultId, `[ERROR] Synthesis aborted: ${errorMsg || 'Unknown backend error'}`);
      setResults(prev => prev.map(r => {
        if (r.id === resultId) {
          if (usagePreference === 'credits' && !r.isRefunded) {
            addCredits(r.cost);
            return { ...r, status: 'error', isRefunded: true, errorMessage: errorMsg || 'Unknown error' };
          }
          return { ...r, status: 'error', errorMessage: errorMsg || 'Unknown error' };
        }
        return r;
      }));
      return;
    }

    // SUCCESS branch
    if (jobStatus === 'done' && response.data.result?.videoUrl) {
      addLogToTask(resultId, `[SUCCESS] Synthesis manifest completed. Delivering assets to CDN...`);
      const videoUrl = response.data.result.videoUrl;
      setResults(prev => prev.map(r => 
        r.id === resultId ? { ...r, url: videoUrl, status: 'done' } : r
      ));
      refreshUserInfo();
      if (autoDownloadRef.current) triggerDownload(videoUrl, `video_${resultId}.mp4`);
    } else {
      // PROCESSING branch
      addLogToTask(resultId, `[STATUS] Pipeline state: ${jobStatus?.toUpperCase() || 'SYNTHESIZING'}`);
      setTimeout(() => pollVideoJobStatus(jobId, resultId, cost), 5000);
    }
  } catch (e) {
    addLogToTask(resultId, `[NETWORK] Connectivity drift. Retrying telemetry uplink...`);
    setTimeout(() => pollVideoJobStatus(jobId, resultId, cost), 10000);
  }
};
```

**Lines 420-443: performInference (Job Creation)**
```typescript
const res = await videosApi.createJob(payload);
const isSuccess = res.success === true || res.status?.toLowerCase() === 'success';

if (isSuccess && res.data.jobId) {
  const serverJobId = res.data.jobId;
  addLogToTask(task.id, `[API_READY] Remote job recognized. ID: ${serverJobId}`);
  
  // 🔑 ID swap
  setResults(prev => prev.map(r => r.id === task.id ? { ...r, id: serverJobId } : r));
  
  // 🔑 Credit deduction
  if (!isAutoRetry) useCredits(task.cost);
  
  // Poll
  pollVideoJobStatus(serverJobId, serverJobId, task.cost);
} else {
  addLogToTask(task.id, `[ERROR] Resource handshake rejected: ${res.message || 'Generic refusal'}`);
  setResults(prev => prev.map(r => 
    r.id === task.id ? { ...r, status: 'error', errorMessage: res.message || 'API handshake rejected' } : r
  ));
}
```

---

### C. Result Object Structure

```typescript
interface VideoResult {
  id: string;                    // Starts as local ID, becomes serverJobId
  url: string | null;           // Filled when status === 'done'
  prompt: string;
  fullTimestamp: string;        // "14:30:45 09/04/2026"
  dateKey: string;              // "2026-04-09"
  displayDate: string;
  model: string;                // Model name
  mode: string;                 // "relaxed", "fast", etc.
  duration: string;             // "8s"
  resolution: string;           // "720p", "1080p", etc.
  engine: string;               // "gommo", "veo", etc.
  status: 'processing' | 'done' | 'error';
  hasSound: boolean;
  aspectRatio: string;          // "16:9", "9:16", etc.
  cost: number;                 // Credits cost
  startImg?: string;            // URL if image-to-video
  endImg?: string;              // URL if start-end mode
  logs: string[];               // Activity log
  isRefunded?: boolean;         // Track refund on error
  errorMessage?: string;        // Error details
}
```

---

## 📋 PHẦN III - FRONTEND ARCHITECTURE

File: `.agents/skills/skyverses_ui_pages/SKILL.md` (12KB)

### A. Homepage (MarketPage.tsx - 103KB)

**Route:** `/`

**Sections (top → bottom):**
1. **Hero** — H1 title (i18n), gradient headline, 2 CTAs, animated stats
2. **Featured Showcase** — Desktop: 1 spotlight + 3 side cards (rotate 5s). Mobile: horizontal snap scroll
3. **AI Models Marquee** — `<AIModelsMarquee />` ticker
4. **Trust Pillars** — 5 stats: response time, save %, secure, languages, models
5. **How It Works** — 3 steps with images from `/assets/homepage/hiw-*.webp`
6. **Product Grid** — `homeBlocks` from CMS → horizontal scroll sections
7. **Use Cases by Industry** — Marketing, E-commerce, Education, Real Estate, Fashion, Healthcare

**Key State:**
```typescript
const [solutions, setSolutions] = useState<Solution[]>([]);
const [homeBlocks, setHomeBlocks] = useState<HomeBlock[]>([]);
const [favorites, setFavorites] = useState<string[]>([]);
const [featuredIdx, setFeaturedIdx] = useState(0);
```

**HomeBlock System (CMS-Driven):**
- Stored in `SystemSetting { key: "marketHomeBlock" }`
- Block keys: `top_trending`, `video_studio`, `image_studio`, `ai_agents`, `festivals`, `others`
- **Only `top_trending` shows during search**

### B. Markets Page (MarketsPage.tsx - 57KB)

**Route:** `/markets`

**Layout:** 2-column (sidebar + content)

**Sidebar Filters:**
- Search (⌘K shortcut)
- Categories: ALL, Video, Image, Audio, Music, Automation, 3D
- Complexity: Standard, Advanced, Enterprise
- Platform: Web, iOS, Android, Extension
- Tags (dynamic)
- Toggles: Free Only, Featured Only

**Advanced Features:**
- URL-synced filters (shareable links)
- Grid/List toggle (⌘G)
- Quick Preview Modal
- Compare Panel (3 products max)
- Recently Viewed (localStorage)
- Trending Slider
- Infinite Scroll (12+12)

**Filter Logic (client-side):**
```typescript
filteredSolutions = solutions.filter(sol =>
  matchSearch &&      // name + description + tags (currentLang)
  matchCategory &&    // category[lang] OR tags OR demoType
  matchFree &&        // sol.isFree
  matchFeatured &&    // sol.featured
  matchComplexity &&  // sol.complexity
  matchTags &&        // ALL activeTags
  matchPlatform       // sol.platforms includes activePlatform
)
```

### C. Product Catalog (Routes)

```
/product/video-animate-ai      → AI Video Animation Studio
/product/image-upscale-ai      → AI Image Upscale
/product/image-generator-ai    → AI Image Generator
/product/video-generator-ai    → AI Video Generator
/product/product-image-ai      → AI Product Image
/product/image-restoration-ai  → AI Image Restoration
/product/ai-music-generator    → AI Music Generator
/product/text-to-speech        → Text to Speech AI
/product/qwen-chat-ai          → Qwen Chat AI
/product/background-removal-ai → Background Removal AI
/product/studio-architect      → Studio Architect
/product/ai-agent-workflow     → AI Agent Workflow
/product/voice-design-ai       → Voice Design AI
/product/poster-marketing-ai   → Poster Marketing AI
```

---

## 📋 PHẦN IV - COMPONENT CẤU HÌNH AI

### A. ModelEngineSettings (Video)

File: `components/video-generator/VideoModelEngineSettings.tsx`

**Used in:** AIVideoGeneratorWorkspace.tsx (STEP 6.5)

**Purpose:** Centralized AI engine configuration — **KHÔNG tự build UI riêng**

**Features:**
- Model selection (dropdown)
- Engine selection (gommo, veo, etc.)
- Mode selection (relaxed, fast, quality)
- Resolution picker (720p, 1080p, 2k, 4k)
- Aspect ratio (16:9, 9:16, 1:1, etc.)
- Duration (4s, 8s, 16s)
- Quantity selector

### B. Image Generation Pattern

File: `components/image-generator/` (similar structure)

**Same pattern:** Use `ModelEngineSettings`, NOT hardcoded UI

---

## 📋 PHẦN V - FILE STRUCTURE

```
.agents/
├── skills/
│   ├── skyverses_ui_pages/SKILL.md ← Frontend architecture
│   ├── skyverses_business_flows/SKILL.md
│   ├── skyverses_architecture/SKILL.md
│   └── skyverses_cms/SKILL.md
└── workflows/
    ├── add_new_product.md ← 117KB complete workflow
    ├── cms_style_guide.md
    ├── new_chat_starter.md
    └── push.md

pages/
├── videos/
│   ├── AIVideoGenerator.tsx ← thin orchestrator
│   ├── AvatarLipsyncAI.tsx
│   ├── FibusVideoStudio.tsx
│   └── ...
├── images/
│   ├── AIImageGenerator.tsx
│   ├── SocialBannerAI.tsx
│   └── ...

components/
├── AIVideoGeneratorWorkspace.tsx ← 810 lines, main video creation
├── video-generator/
│   ├── VideoModelEngineSettings.tsx
│   ├── VideoCard.tsx
│   └── SidebarLeft.tsx
├── landing/
│   └── video-generator/ ← 8 section files
├── workspace/
│   └── AISuggestPanel.tsx ← AI-powered prompt suggestions

scripts/
├── seed-products.mjs ← multi-product seed
├── seed-<slug>.mjs ← single product
├── gen-<slug>-images.mjs ← gen + upload to CDN
└── update-product-images.mjs

Documentation:
├── START_HERE.md ← quick navigation
├── QUICK_REFERENCE.md ← job polling copy-paste template
├── JOB_POLLING_PATTERN_ANALYSIS.md ← 20KB detailed reference
├── VIDEO_vs_IMAGE_PATTERN.md ← side-by-side comparison
└── FILES_CREATED.md ← summary
```

---

## 📋 PHẦN VI - KEY APIS

### A. Video API

```typescript
import { videosApi, VideoJobRequest, VideoJobResponse } from '../apis/videos';

// Create job
const res = await videosApi.createJob(payload);
// Response: { success: true, data: { jobId: "vid-xyz-123" } }

// Get status
const res = await videosApi.getJobStatus(jobId);
// Response: 
//   Processing: { data: { status: 'processing' } }
//   Done: { data: { status: 'done', result: { videoUrl: 'https://...' } } }
//   Error: { data: { status: 'failed', error: { message: '...' } } }
```

### B. Auth & Credits

```typescript
const { 
  credits,           // current credits
  addCredits,        // refund function
  useCredits,        // deduct function
  isAuthenticated,   // auth state
  login,             // login function
  refreshUserInfo    // sync with backend
} = useAuth();
```

---

## 📋 PHẦN VII - COMMON MISTAKES TO AVOID

| ❌ Sai | ✅ Đúng |
|---------|---------|
| Deduct credits on button click | Deduct **AFTER** API success |
| Never refund on error | **Always** refund if `!isRefunded` |
| Use local ID for polling | Use **serverJobId** for polling |
| Poll every 1s | Poll every **5s** (timeout 10s on error) |
| Skip logging phases | Log each **[PHASE]** |
| Return stale results | Keep `resultsRef` **current** during polling |
| Tự build model/engine UI | **Dùng** `ModelEngineSettings` component |
| Hardcode CDN URLs trong landing | **Dùng** Explorer API hoặc fallback Unsplash |
| Quên swap ID (local → server) | **PHẢI** swap trước poll |
| Không refund khi user kiếm | **PHẢI** refund nếu job fail, check `isRefunded` flag |

---

## 📋 PHẦN VIII - REFERENCES

**Exact Line Numbers in Code:**

### AIVideoGeneratorWorkspace.tsx (810 lines)
- Line 305-344: `pollVideoJobStatus` function
- Line 346-462: `performInference` function
- Line 394-413: Result object initialization
- Line 420-443: Job creation logic
- Line 436: ID swap location
- Line 438: Credit deduction location

**Related Files:**
- `useImageGenerator.ts`: Image polling pattern (lines 250-287, 289-389)
- `SocialBannerWorkspace.tsx`: Reference workspace (direct generation, NO polling)
- `RealEstateVisualWorkspace.tsx`: Multi-output workspace pattern

**Documentation Files:**
- `QUICK_REFERENCE.md`: Copy-paste templates
- `JOB_POLLING_PATTERN_ANALYSIS.md`: Detailed analysis
- `VIDEO_vs_IMAGE_PATTERN.md`: Side-by-side comparison

---

## 📋 PHẦN IX - THỰC HÀNH NGAY

### Để hiểu Job Polling Pattern:
1. Đọc `QUICK_REFERENCE.md` (5 phút)
2. Xem `pollVideoJobStatus` (lines 305-344)
3. Xem `performInference` (lines 346-443)
4. So sánh với `useImageGenerator.ts`

### Để thêm product mới:
1. Tuân theo `.agents/workflows/add_new_product.md` (9 bước)
2. Copy structure từ `SocialBannerWorkspace.tsx`
3. Tuân thủ `STEP 6.5` nếu tạo ảnh/video
4. KHÔNG tự build model/engine UI — dùng `ModelEngineSettings`

### Để hiểu Frontend:
1. Đọc `.agents/skills/skyverses_ui_pages/SKILL.md`
2. Tìm hiểu cách `homeBlocks` hoạt động
3. Xem filter logic trong `MarketsPage.tsx`

