# Video vs Image Generator: Pattern Comparison

Side-by-side comparison showing how the polling pattern is implemented identically in both generators.

---

## 1. IMPORT PATTERNS

### Video (AIVideoGeneratorWorkspace.tsx, Lines 12-19)
```typescript
import { videosApi, VideoJobRequest, VideoJobResponse } from '../apis/videos';
import { uploadToGCS, GCSAssetMetadata } from '../services/storage';
import { SidebarLeft } from './video-generator/SidebarLeft';
import { ResultsMain } from './video-generator/ResultsMain';
import { VideoResult } from './video-generator/VideoCard';
import { pricingApi, PricingModel } from '../apis/pricing';
import { JobLogsModal } from './common/JobLogsModal';
import { useToast } from '../context/ToastContext';
```

### Image (useImageGenerator.ts, Lines 1-11)
```typescript
import { useState, useRef, useEffect, useMemo, useCallback } from 'react';
import { generateDemoImage } from '../services/gemini';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { GCSAssetMetadata, uploadToGCS } from '../services/storage';
import { imagesApi, ImageJobRequest, ImageJobResponse } from '../apis/images';
import { pricingApi, PricingModel } from '../apis/pricing';
import { useToast } from '../context/ToastContext';
```

**Difference:** Video is a component, Image is a hook. Both import identical API types.

---

## 2. POLLING FUNCTION SIGNATURE

### Video (Line 305)
```typescript
const pollVideoJobStatus = async (jobId: string, resultId: string, cost: number) => {
```

### Image (Line 250)
```typescript
const pollImageJobStatus = async (jobId: string, resultId: string, cost: number) => {
```

**Identical signature** — function name is the only difference.

---

## 3. FETCH STATUS

### Video (Line 308)
```typescript
const response: VideoJobResponse = await videosApi.getJobStatus(jobId);
```

### Image (Line 253)
```typescript
const response: ImageJobResponse = await imagesApi.getJobStatus(jobId);
```

**Same pattern** — different API endpoints, identical structure.

---

## 4. ERROR HANDLING

### Video (Lines 315-327)
```typescript
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
```

### Image (Lines 254-269)
```typescript
const isError = response.status === 'error' || response.data?.status === 'error' || response.data?.status === 'failed';

if (isError) {
  const errorMsg = (response.data as any)?.error?.message || "Inference failed";
  addLogToTask(resultId, `[ERROR] Synthesis aborted: ${errorMsg}`);
  
  if (usagePreference === 'credits') {
    setResults(prev => prev.map(r => {
      if (r.id === resultId && !r.isRefunded) {
        addCredits(cost);
        return { ...r, status: 'error', isRefunded: true };
      }
      return r.id === resultId ? { ...r, status: 'error' } : r;
    }));
  } else {
    setResults(prev => prev.map(r => r.id === resultId ? { ...r, status: 'error' } : r));
  }
  return;
}
```

**Same logic, slightly different code style:**
- Video checks `!isSuccess` flag, Image checks response fields directly
- Both refund credits with `addCredits()`
- Both set `isRefunded: true` to prevent double-refund
- Both return early to exit polling loop

---

## 5. SUCCESS HANDLING

### Video (Lines 330-335)
```typescript
if (jobStatus === 'done' && response.data.result?.videoUrl) {
  addLogToTask(resultId, `[SUCCESS] Synthesis manifest completed. Delivering assets to CDN...`);
  const videoUrl = response.data.result.videoUrl;
  
  setResults(prev => prev.map(r => r.id === resultId ? { ...r, url: videoUrl, status: 'done' } : r));
  
  refreshUserInfo();
  if (autoDownloadRef.current) triggerDownload(videoUrl, `video_${resultId}.mp4`);
}
```

### Image (Lines 273-278)
```typescript
if (response.data && response.data.status === 'done' && response.data.result?.images?.length) {
  addLogToTask(resultId, `[SUCCESS] Synthesis complete. Delivering asset to CDN...`);
  const imageUrl = response.data.result.images[0];
  
  setResults(prev => prev.map(r => r.id === resultId ? { ...r, url: imageUrl, status: 'done' } : r));
  refreshUserInfo();
  fetchServerResults(1, true);
}
```

**Differences:**
- Video gets `result.videoUrl` directly
- Image gets `result.images[0]` (array)
- Video has `autoDownloadRef.current` check
- Image calls `fetchServerResults()` to refresh history
- **Core logic identical:** update results, set status='done', refresh user info

---

## 6. PROCESSING/CONTINUE POLLING

### Video (Lines 336-339)
```typescript
else {
  addLogToTask(resultId, `[STATUS] Pipeline state: ${jobStatus?.toUpperCase() || 'SYNTHESIZING'}`);
  setTimeout(() => pollVideoJobStatus(jobId, resultId, cost), 5000);
}
```

### Image (Lines 279-282)
```typescript
else {
  addLogToTask(resultId, `[STATUS] Pipeline state: ${response.data?.status?.toUpperCase() || 'SYNTHESIZING'}`);
  setTimeout(() => pollImageJobStatus(jobId, resultId, cost), 5000);
}
```

**Identical:** Both poll every 5 seconds (5000ms).

---

## 7. NETWORK ERROR HANDLING

### Video (Lines 340-343)
```typescript
catch (e) {
  addLogToTask(resultId, `[NETWORK] Connectivity drift. Retrying telemetry uplink...`);
  setTimeout(() => pollVideoJobStatus(jobId, resultId, cost), 10000);
}
```

### Image (Lines 283-286)
```typescript
catch (e) {
  addLogToTask(resultId, `[NETWORK] Connectivity drift. Retrying telemetry uplink...`);
  setTimeout(() => pollImageJobStatus(jobId, resultId, cost), 10000);
}
```

**Identical:** Both retry after 10 seconds (10000ms) on network error.

---

## 8. JOB CREATION SETUP

### Video (Lines 394-418)
```typescript
const newResults: VideoResult[] = tasksToProduce.map(t => ({
  id: t.id,
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
setResults(prev => [...newResults, ...prev]);
```

### Image (Lines 305-321)
```typescript
const newTasks: ImageResult[] = retryItem
  ? []
  : promptsToRun.map((p, idx) => ({
    id: `img-${Date.now()}-${idx}`,
    url: null,
    prompt: p,
    fullTimestamp: ts,
    dateKey: todayKey,
    displayDate: now.toLocaleDateString('vi-VN'),
    model: selectedModel.name,
    status: 'processing',
    aspectRatio: selectedRatio,
    resolution: selectedRes,
    cost: currentPreference === 'credits' ? unitCost : 0,
    references: currentRefs,
    logs: [`[SYSTEM] Production pipeline initialized.`]
  }));

if (retryItem) {
  setResults(prev => prev.map(r => r.id === retryItem.id ? { ...r, status: 'processing', isRefunded: false, logs: [`[SYSTEM] Re-initializing production node for manual retry.`] } : r));
} else {
  setResults(prev => [...newTasks, ...prev]);
}
```

**Same pattern:**
- Create result objects with `status: 'processing'`
- Add initial logs
- Add to results state
- Video does it once; Image handles retry case separately

---

## 9. API CALL & ID SWAP

### Video (Lines 428-439)
```typescript
const res = await videosApi.createJob(payload);
const isSuccess = res.success === true || res.status?.toLowerCase() === 'success';

if (isSuccess && res.data.jobId) {
  const serverJobId = res.data.jobId;
  addLogToTask(task.id, `[API_READY] Remote job recognized. ID: ${serverJobId}`);
  
  // KEY: Update task ID to server's jobId
  setResults(prev => prev.map(r => r.id === task.id ? { ...r, id: serverJobId } : r));
  
  // Deduct credits only after successful job creation
  if (!isAutoRetry) useCredits(task.cost);
  
  // START POLLING
  pollVideoJobStatus(serverJobId, serverJobId, task.cost);
}
```

### Image (Lines 356-362)
```typescript
const apiRes = await imagesApi.createJob(payload);

if (apiRes.success && apiRes.data.jobId) {
  const serverJobId = apiRes.data.jobId;
  addLogToTask(task.id, `[API_READY] Remote job recognized. ID: ${serverJobId}`);
  
  // Update local ID to server jobId
  setResults(prev => prev.map(r => r.id === task.id ? { ...r, id: serverJobId } : r));
  
  // Deduct credits
  useCredits(unitCost);
  
  // START POLLING
  pollImageJobStatus(serverJobId, serverJobId, unitCost);
}
```

**Identical pattern:**
1. Call API
2. Check success
3. Get serverJobId
4. Log success
5. **CRITICAL:** Replace `task.id` with `serverJobId` in state
6. Deduct credits
7. Start polling with `serverJobId`

---

## 10. USAGE PREFERENCE HANDLING

### Video (Lines 351-446)
```typescript
const performInference = async (
  currentPreference: 'credits' | 'key',
  retryTask?: VideoResult,
  isAutoRetry: boolean = false
) => {
  // ...
  if (currentPreference === 'key') {
    if (!personalKey) { navigate('/settings'); return; }
  } else {
    const costToPay = retryTask ? retryTask.cost : currentTotalCost;
    if (!isAutoRetry && credits < costToPay) { setShowLowCreditAlert(true); return; }
  }
  // ...
  if (currentPreference === 'credits') {
    // ...
    const res = await videosApi.createJob(payload);
    // ...
  } else {
    // Use personal key / direct inference
    const url = await generateDemoVideo({...});
  }
}
```

### Image (Lines 289-389)
```typescript
const performInference = async (
  currentPreference: 'credits' | 'key',
  retryItem?: ImageResult
) => {
  // ...
  if (currentPreference === 'credits') {
    // ...
    const apiRes = await imagesApi.createJob(payload);
    // ...
  } else {
    // Use personal key / direct inference
    const url = await generateDemoImage({...});
  }
}
```

**Identical logic:**
- Accept preference parameter
- Branch on credits vs personal key
- Credits mode: use job polling
- Key mode: direct API call without polling

---

## 11. KEY DIFFERENCES (Video vs Image)

| Aspect | Video | Image |
|--------|-------|-------|
| **Component Type** | Component | Hook |
| **API Module** | `videosApi` | `imagesApi` |
| **Result Type** | `VideoResult` | `ImageResult` |
| **Result URL field** | `data.result.videoUrl` | `data.result.images[0]` |
| **Job Types** | text-to-video, image-to-video, start-end-image | text_to_image, image_to_image |
| **Extra fields** | `mode`, `duration`, `hasSound`, `startImg`, `endImg` | — |
| **Auto-download** | Has `autoDownloadRef.current` check | No auto-download |
| **History refresh** | — | Calls `fetchServerResults()` |

---

## 12. CORE ALGORITHM (Both Identical)

```
┌─ CREATE TASK with local ID
│
├─ ADD to results with status='processing'
│
├─ CALL API createJob()
│
├─ SWAP ID: local → serverJobId
│
├─ DEDUCT credits (if success)
│
└─ CALL pollJobStatus(serverJobId)
   │
   ├─ FETCH getJobStatus(jobId)
   │
   ├─ IF error
   │  └─ REFUND credits
   │  └─ status='error'
   │  └─ RETURN (exit polling)
   │
   ├─ IF done
   │  └─ UPDATE url
   │  └─ status='done'
   │  └─ RETURN (exit polling)
   │
   └─ IF processing
      └─ WAIT 5s
      └─ RECURSE: pollJobStatus(jobId)
         (or retry after 10s on network error)
```

**This exact algorithm runs in both generators.**

---

## Summary

✅ **99% of the polling logic is identical** between video and image generators:
- Same error handling strategy
- Same refund logic
- Same retry intervals (5s, 10s)
- Same state update patterns
- Same logging phases
- Same ID-swapping pattern

✅ **Only these differ:**
- API endpoint names (`videosApi` vs `imagesApi`)
- URL extraction path (`.videoUrl` vs `.images[0]`)
- Component-specific features (video has auto-download, image has history refresh)

**IMPLICATION:** When implementing a new generator, copy either pattern and only modify:
1. API endpoint calls
2. URL extraction logic
3. Result type fields

Everything else is universal.

