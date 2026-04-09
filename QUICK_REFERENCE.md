# Job/Polling Pattern - Quick Reference

## 📋 File Locations & Line Numbers

| Component | File | Key Functions |
|-----------|------|---|
| **Video** | `AIVideoGeneratorWorkspace.tsx` | `pollVideoJobStatus` (305-344), `performInference` (346-462) |
| **Image** | `useImageGenerator.ts` | `pollImageJobStatus` (250-287), `performInference` (289-389) |
| **Banner** | `SocialBannerWorkspace.tsx` | `handleGenerate` (201-264) — NO POLLING |

---

## 🎯 The Job Polling Pattern (Copy-Paste Template)

### Step 1: Create Job (Video example from line 429)
```typescript
const payload: VideoJobRequest = {
  type: task.type,
  input: { images: inputImages },
  config: { duration: parseInt(duration), aspectRatio: task.ratio, resolution: resolution },
  engine: { provider: selectedEngine as any, model: selectedModelObj.modelKey as any },
  enginePayload: { /* ... */ }
};

const res = await videosApi.createJob(payload);
const isSuccess = res.success === true || res.status?.toLowerCase() === 'success';

if (isSuccess && res.data.jobId) {
  const serverJobId = res.data.jobId;
  setResults(prev => prev.map(r => r.id === task.id ? { ...r, id: serverJobId } : r));
  useCredits(task.cost);
  pollVideoJobStatus(serverJobId, serverJobId, task.cost);
}
```

### Step 2: Poll Status (Video lines 305-344)
```typescript
const pollVideoJobStatus = async (jobId: string, resultId: string, cost: number) => {
  try {
    const response = await videosApi.getJobStatus(jobId);
    const jobStatus = response.data?.status?.toLowerCase();

    // 1. ERROR: Refund and mark failed
    if (jobStatus === 'failed' || jobStatus === 'error') {
      if (usagePreference === 'credits' && !r.isRefunded) {
        addCredits(r.cost);
        return { ...r, status: 'error', isRefunded: true };
      }
      return;
    }

    // 2. SUCCESS: Got the URL
    if (jobStatus === 'done' && response.data.result?.videoUrl) {
      const videoUrl = response.data.result.videoUrl;
      setResults(prev => prev.map(r => r.id === resultId ? { ...r, url: videoUrl, status: 'done' } : r));
      refreshUserInfo();
      return;
    }

    // 3. PROCESSING: Keep polling
    setTimeout(() => pollVideoJobStatus(jobId, resultId, cost), 5000);
  } catch (e) {
    // Network error: retry later
    setTimeout(() => pollVideoJobStatus(jobId, resultId, cost), 10000);
  }
};
```

---

## 🔑 Key Implementation Points

### 1. **Task Object Structure** (Line 394-413 for video)
```typescript
id: `single-${Date.now()}-${i}`,  // LOCAL ID initially
type: "text-to-video",             // Job type
prompt: prompt,                    // The prompt
startUrl: startFrame,              // Optional frame
endUrl: endFrame,                  // Optional frame
cost: currentUnitCost,             // Cost in credits
ratio: ratio                       // Aspect ratio
```

### 2. **Result Object Structure** (Line 394-413)
```typescript
id: t.id,                          // Starts as local, becomes serverJobId
url: null,                         // Filled when done
prompt: t.prompt,
status: 'processing',              // ← 'processing' | 'done' | 'error'
logs: [...]                        // Activity log for user
cost: t.cost,
isRefunded: false                  // Track if credits refunded on error
```

### 3. **Credit Deduction TIMING**
```
✓ AFTER successful job creation (line 438 video, 361 image)
✗ NOT before API call
✗ NOT when user clicks generate

if (isSuccess && res.data.jobId) {
  useCredits(task.cost);  // ← HERE, after confirmed success
  pollVideoJobStatus(...);
}
```

### 4. **ID Reassignment** (Line 436)
```typescript
// Initial task has local ID: `img-${Date.now()}-${idx}`
// After API returns, replace with server's jobId:
setResults(prev => prev.map(r => 
  r.id === task.id 
    ? { ...r, id: serverJobId }  // ← KEY STEP
    : r
));

// All future polling uses serverJobId
pollVideoJobStatus(serverJobId, serverJobId, cost);
```

### 5. **Error Refund** (Lines 320 video, 262 image)
```typescript
if (jobStatus === 'failed') {
  setResults(prev => prev.map(r => {
    if (r.id === resultId) {
      if (usagePreference === 'credits' && !r.isRefunded) {
        addCredits(r.cost);  // ← REFUND
        return { ...r, status: 'error', isRefunded: true };
      }
    }
    return r;
  }));
}
```

### 6. **Logging Phases**
```typescript
addLogToTask(id, `[SYSTEM] Production pipeline initialized.`);
addLogToTask(id, `[UPLINK] Authenticating resource pool: CREDITS`);
addLogToTask(id, `[NODE_INIT] Provisioning H100 GPU cluster...`);
addLogToTask(id, `[API_READY] Remote job recognized. ID: ${serverJobId}`);
addLogToTask(id, `[POLLING] Requesting status update for node cluster...`);
addLogToTask(id, `[STATUS] Pipeline state: PROCESSING`);
addLogToTask(id, `[SUCCESS] Synthesis complete. Delivering asset to CDN...`);
addLogToTask(id, `[ERROR] Synthesis aborted: ${errorMsg}`);
addLogToTask(id, `[NETWORK] Connectivity drift. Retrying telemetry uplink...`);
```

---

## ⚙️ API Contract Examples

### Video: createJob Response
```typescript
{
  success: true,
  data: {
    jobId: "vid-xyz-123"  // ← Use this for polling
  }
}
```

### Video: getJobStatus Response (Polling)
```typescript
// Processing:
{ data: { status: 'processing' } }

// Done:
{ data: { status: 'done', result: { videoUrl: 'https://...' } } }

// Error:
{ data: { status: 'failed', error: { message: 'Out of memory' } } }
```

### Image: Same pattern
```typescript
// createJob returns { data: { jobId: "img-abc-456" } }
// getJobStatus returns { data: { status: 'done', result: { images: ['url'] } } }
```

---

## 🚫 Common Mistakes to Avoid

| ❌ Wrong | ✅ Right |
|---------|---------|
| Deduct credits on button click | Deduct after API success |
| Never refund on error | Always refund if `!isRefunded` |
| Use local ID for polling | Use serverJobId for polling |
| Poll every 1s | Poll every 5s (timeout 10s on network error) |
| Skip logging | Log each phase with `[PHASE]` prefix |
| Return stale results | Keep `resultsRef` current during polling |

---

## 🔄 State Management Helpers

### Add Log Entry (lines 286-297 video)
```typescript
const addLogToTask = (taskId: string, message: string) => {
  setResults(prev => prev.map(r => 
    r.id === taskId 
      ? { ...r, logs: [...(r.logs || []), message] } 
      : r
  ));
};
```

### Toggle Status to Processing (line 416 image)
```typescript
setResults(prev => prev.map(r => 
  r.id === retryItem.id 
    ? { ...r, status: 'processing', isRefunded: false } 
    : r
));
```

### Update URL on Success (line 333 video, 276 image)
```typescript
setResults(prev => prev.map(r => 
  r.id === resultId 
    ? { ...r, url: videoUrl, status: 'done' } 
    : r
));
```

---

## 🎬 Complete Flow Diagram

```
1. User clicks "Generate"
   ↓
2. createJob(payload) → {jobId: "xyz"}
   ↓
3. setResults(...id = "xyz"...)  // Swap local ID
   ↓
4. useCredits(cost)  // Deduct AFTER confirmation
   ↓
5. pollJobStatus("xyz")
   ├→ Error → addCredits() → status='error'
   ├→ Success → status='done', url=...
   └→ Processing → setTimeout(5s) → poll again
   ↓
6. Result shown in UI
```

---

## 📝 TypeScript Interfaces Needed

```typescript
export interface JobRequest {
  type: string;
  input: { [key: string]: any };
  config: { [key: string]: any };
  engine: { provider: string; model: string };
  enginePayload: { [key: string]: any };
}

export interface JobResponse {
  success?: boolean;
  status?: string;
  data: {
    jobId?: string;
    status?: string;
    result?: { [key: string]: any };
    error?: { message: string; userMessage?: string };
  };
  message?: string;
}

export interface Result {
  id: string;
  url: string | null;
  prompt: string;
  status: 'processing' | 'done' | 'error';
  logs?: string[];
  isRefunded?: boolean;
  cost: number;
  // ... other fields
}
```

