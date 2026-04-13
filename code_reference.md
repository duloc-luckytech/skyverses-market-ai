# 📄 CODE REFERENCE: Product Image Upload/Crop Flow

## 1. Hook: useProductImageEditor.ts

### Location
`/hooks/useProductImageEditor.ts` (807 lines)

### Key Functions

#### `applyCrop()` - Lines 493-624 ❌ BROKEN

Main function that handles cropping. Flow:
1. Convert result URL → base64
2. Compress image
3. Upload to GCS
4. **Poll for upload completion** ✅
5. **Create edit-image job** ✅
6. **Poll for crop result** ❌ **BROKEN HERE**

**Problem area: Lines 576-615**

```typescript
// Lines 576-615: Inline polling with manual Promise
let tickCount = 0;
await new Promise<void>((resolve, reject) => {
  const poll = async () => {
    if (isCancelledRef.current) { resolve(); return; }
    
    tickCount++;
    setStatus(`⏳ Đang crop... (${tickCount * 4}s)`);
    
    const statusRes = await editImageApi.getJobStatus(jobId);
    const st = statusRes.data?.status;  // ← Vulnerable to undefined
    
    if (st === 'done') {
      // ... handle success
      resolve();
    } else if (st === 'error' || st === 'cancelled') {
      reject(new Error(...));
    } else {
      if (tickCount >= 45) {
        reject(new Error('Crop quá thời gian...'));
      } else {
        setTimeout(poll, 4000);
      }
    }
  };
  setTimeout(poll, 2000);
});
```

#### `applyDraw()` - Lines 626-749 ❌ SAME ISSUE

Identical polling logic as `applyCrop()` for draw operations.

#### `handleGenerate()` - Lines 214-285 ✅ WORKING

Uses proper polling with `pollJobStatus()`:
```typescript
if (apiRes.success && apiRes.data.jobId) {
  const serverJobId = apiRes.data.jobId;
  if (usagePreference === 'credits') useCredits(currentCost);
  setStatus('🔄 Đang xử lý...');
  setActiveTasks(prev => prev.map(t => t.id === taskId ? { ...t, id: serverJobId } : t));
  
  // ✅ Delegates to utility
  pollJobStatus(serverJobId, serverJobId, currentCost, finalPrompt);
}
```

#### `pollJobStatus()` - Lines 169-202 ✅ REFERENCE

Shows the correct pattern using `pollJobOnce()`:
```typescript
const pollJobStatus = (jobId: string, taskId: string, cost: number, taskPrompt: string) => {
  pollJobOnce({
    jobId,
    isCancelledRef,
    apiType: 'image',  // ← Only handles image jobs!
    intervalMs: 5000,
    networkRetryMs: 10000,
    onDone: (jobResult) => {
      const imageUrl = jobResult.images?.[0] ?? null;
      if (imageUrl) {
        pushToHistory(imageUrl);
        setHistory(prev => [{
          id: jobId,
          url: imageUrl,
          prompt: taskPrompt,
          timestamp: new Date().toLocaleTimeString()
        }, ...prev]);
        refreshUserInfo();
      }
      setStatus('✅ Hoàn tát');
      setIsGenerating(false);
      setActiveTasks(prev => prev.filter(t => t.id !== taskId));
    },
    onError: (errorMsg) => {
      if (usagePreference === 'credits') addCredits(cost);
      setActiveTasks(prev => prev.filter(t => t.id !== taskId));
      setStatus(`❌ Lỗi: ${errorMsg || 'Xử lý thất bại'}`);
      setIsGenerating(false);
    },
    onTick: ({ tickCount }) => {
      setStatus(`⏳ Đang xử lý... (${tickCount * 5}s)`);
    },
  });
};
```

---

## 2. API: editImage.ts

### Location
`/apis/editImage.ts` (90 lines)

### Functions

#### `editImageApi.createJob()` - Lines 59-71 ✅

Creates a crop or draw job:
```typescript
export const editImageApi = {
  createJob: async (payload: CreateEditImageJobRequest): Promise<CreateEditImageJobResponse> => {
    try {
      const response = await fetch(`${API_BASE_URL}/edit-image-jobs`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify(payload),
      });
      return await response.json();
    } catch (error) {
      console.error('[editImageApi] createJob error:', error);
      return { success: false, message: 'Network connection failed' };
    }
  },
```

**Request payload:**
```typescript
{
  mediaId: string;
  projectId: string;
  editType: 'crop' | 'draw';
  cropCoordinates?: { top, left, right, bottom };
  drawPayload?: { prompt, referenceImageUrl };
}
```

**Response:**
```typescript
{
  success: boolean;
  data?: {
    jobId: string;
    status: string;
    owner?: string;
  };
  message?: string;
}
```

#### `editImageApi.getJobStatus()` - Lines 77-88 ❌ POSSIBLY RETURNING WRONG FORMAT

Polls job status:
```typescript
getJobStatus: async (jobId: string): Promise<EditImageJobStatusResponse> => {
  try {
    const response = await fetch(`${API_BASE_URL}/edit-image-jobs/${jobId}`, {
      method: 'GET',
      headers: getHeaders(),
    });
    return await response.json();
  } catch (error) {
    console.error('[editImageApi] getJobStatus error:', error);
    return { success: false, message: 'Status check failed' };
  }
},
```

**Response interface:**
```typescript
export interface EditImageJobStatusResponse {
  success: boolean;
  data?: {
    jobId: string;
    status: 'pending' | 'processing' | 'done' | 'error' | 'cancelled';
    editType: string;
    result?: {
      mediaId?: string;
      resultUrl?: string;
    };
    error?: { message: string };
    progress?: { percent: number; step?: string };
  };
  message?: string;
}
```

**⚠️ Issue:** The polling code accesses `statusRes.data?.status` but doesn't validate:
- Is `statusRes.data` defined?
- Is `status` a valid enum value?
- If response is error-only, `data` might be undefined

---

## 3. API: media.ts

### Location
`/apis/media.ts` (154 lines)

#### `mediaApi.uploadImage()` - Lines 60-72 ✅

Uploads base64 image:
```typescript
uploadImage: async (payload: ImageUploadRequest): Promise<ImageUploadResponse> => {
  try {
    const response = await fetch(`${API_BASE_URL}/media/image-upload`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(payload),
    });
    return await response.json();
  } catch (error) {
    console.error('Image Upload API Error:', error);
    return { success: false, message: 'Network connection failed during upload' };
  }
},
```

**Response includes:**
```typescript
{
  success: boolean;
  imageUrl?: string;
  mediaId?: string;        // ← Immediate if already processed
  jobId?: string;          // ← If async processing needed
  message?: string;
}
```

#### `mediaApi.getMediaById()` - Lines 108-135 ✅

Gets media record (used by uploadPoller):
```typescript
getMediaById: async (id: string): Promise<{
  success: boolean;
  status?: string;
  mediaId?: string | null;
  projectId?: string | null;
  imageUrl?: string;
  message?: string;
}> => {
  try {
    const response = await fetch(
      `${API_BASE_URL}/upload-media/detail?id=${encodeURIComponent(id)}`,
      { method: 'GET', headers: getHeaders() }
    );
    if (!response.ok) throw new Error('Not found');
    const data = await response.json();
    if (!data) return { success: false };
    return {
      success: true,
      status: data.status ?? undefined,
      mediaId: data.mediaId ?? null,
      projectId: data.projectId ?? null,
      imageUrl: data.imageUrl,
    };
  } catch (error) {
    console.error('Get Media By ID Error:', error);
    return { success: false };
  }
},
```

---

## 4. Service: uploadPoller.ts

### Location
`/services/uploadPoller.ts` (160 lines)

### Functions

#### `waitForUploadPoll()` - Lines 146-159 ✅ WORKING

Used in `applyCrop()` and `applyDraw()` to wait for upload to complete:
```typescript
export function waitForUploadPoll(options: WaitForUploadPollOptions): Promise<UploadPollResult> {
  const {
    jobId,
    onTick,
    intervalMs = POLL_INTERVAL_MS,  // 3s
    timeoutMs = POLL_TIMEOUT_MS,     // 2 min
  } = options;

  return new Promise<UploadPollResult>((resolve, reject) => {
    const deadline = Date.now() + timeoutMs;
    const tickCount = { value: 0 };
    scheduleNext(jobId, deadline, intervalMs, resolve, reject, tickCount, onTick);
  });
}
```

#### Internal poll loop - Lines 56-99 ✅

Uses recursive `setTimeout` for polling:
```typescript
function scheduleNext(
  jobId: string,
  deadline: number,
  intervalMs: number,
  onDone: (result: UploadPollResult) => void,
  onError: (msg: string) => void,
  tickCount: { value: number },
  onTick?: (count: number) => void,
): void {
  setTimeout(async () => {
    if (Date.now() >= deadline) {
      onError('Upload polling timeout');
      return;
    }

    tickCount.value += 1;
    onTick?.(tickCount.value);

    try {
      const res = await mediaApi.getMediaById(jobId);

      if (res.success && res.status === 'done' && res.mediaId) {
        onDone({
          mediaId: res.mediaId,
          projectId: res.projectId,
          imageUrl: res.imageUrl,
        });
        return;
      }

      if (res.status === 'failed' || res.status === 'error') {
        onError('Upload job failed on server');
        return;
      }

      // Still pending/processing — schedule next poll
      scheduleNext(jobId, deadline, intervalMs, onDone, onError, tickCount, onTick);
    } catch {
      // Network error — retry silently
      scheduleNext(jobId, deadline, intervalMs, onDone, onError, tickCount, onTick);
    }
  }, intervalMs);
}
```

**✅ This pattern is clean and works!** The crop polling should use the same approach.

---

## 5. Hook: useJobPoller.ts

### Location
`/hooks/useJobPoller.ts` (not fully shown)

### Export
```typescript
const pollJobOnce = ({ 
  jobId, 
  apiType,  // 'image' only?
  intervalMs, 
  networkRetryMs,
  onDone,
  onError,
  onTick,
  ...
}) => { ... }
```

**Issue:** Only handles `apiType: 'image'` for image generation jobs, not edit-image jobs.

---

## FLOW DIAGRAM

```
User uploads local file + crops
├─ applyCrop() called
│  ├─ Convert to base64 ✅
│  ├─ Compress image ✅
│  ├─ Upload to GCS ✅
│  ├─ await waitForUploadPoll() ✅
│  │  └─ Polls /upload-media/detail until status='done'
│  │  └─ Returns mediaId, projectId
│  ├─ Create edit-image job ✅
│  │  └─ POST /edit-image-jobs
│  │  └─ Returns jobId
│  └─ Poll for crop result ❌ BROKEN
│     ├─ Manual Promise handling
│     ├─ editImageApi.getJobStatus(jobId)
│     ├─ Checks statusRes.data?.status
│     └─ Never detects 'done' (hangs or timeout)
```

---

## CRITICAL DIFFERENCES

| Aspect | Image Generation | Crop/Draw |
|--------|------------------|-----------|
| Job creation | `imagesApi.createJob()` | `editImageApi.createJob()` ✅ |
| Status check | `useJobPoller` with `pollJobOnce()` | Manual polling ❌ |
| Polling pattern | Centralized utility | Inline Promise |
| Error handling | Proper | Incomplete |
| Response parsing | Safe | Vulnerable to undefined |

