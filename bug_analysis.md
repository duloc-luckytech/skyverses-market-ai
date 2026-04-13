# 🐛 BUG ANALYSIS: Product Image Crop Upload Missing Polling

## THE BUG

When uploading a local file and then cropping it, the system:
1. ✅ Uploads the image to media successfully 
2. ✅ Creates a crop job
3. ❌ **DOES NOT POLL** for the crop job result

This means users see:
- A stuck "Đang xử lý crop..." status
- No completion callback
- The cropped result never displays

---

## ROOT CAUSE ANALYSIS

### Current Flow (BROKEN)

**File:** `hooks/useProductImageEditor.ts` → `applyCrop()` function (lines 493-624)

#### Step 1-2: Upload + Poll for mediaId ✅
```typescript
// Lines 519-542: Upload to GCS and wait for mediaId
const asset = await uploadToGCS(cropFile, user?.fxflowOwner || 'fxlab');

if (asset.jobId && !mediaId) {
  const pollResult = await waitForUploadPoll({
    jobId: asset.jobId,
    onTick: (n) => setStatus(`⏳ Đang chờ xử lý ảnh... (${n * 3}s)`),
  });
  mediaId = pollResult.mediaId;
  projectId = pollResult.projectId ?? null;
}
```

✅ **This part works** — uses `waitForUploadPoll()` from `services/uploadPoller.ts`

---

#### Step 3-4: Create Edit Job ✅
```typescript
// Lines 556-573: Create the crop job
const createRes = await editImageApi.createJob({
  mediaId,
  projectId: projectId || 'default',
  editType: 'crop',
  cropCoordinates: { top, left, right, bottom },
});

const jobId = createRes.data.jobId;
setStatus('⏳ Đang xử lý crop...');
```

✅ **This part works** — job is created successfully

---

#### Step 5: Poll for Result ❌ BROKEN
```typescript
// Lines 576-615: The polling logic
let tickCount = 0;
await new Promise<void>((resolve, reject) => {
  const poll = async () => {
    if (isCancelledRef.current) { resolve(); return; }

    tickCount++;
    setStatus(`⏳ Đang crop... (${tickCount * 4}s)`);

    const statusRes = await editImageApi.getJobStatus(jobId);
    const st = statusRes.data?.status;

    if (st === 'done') {
      // ✅ Success — result found
      const resultUrl = statusRes.data?.result?.resultUrl;
      if (resultUrl) {
        pushToHistory(resultUrl);
        setHistory(prev => [...prev, ...]);
        setStatus('✅ Crop thành công');
      }
      resolve();
    } else if (st === 'error' || st === 'cancelled') {
      // ❌ Error — job failed
      reject(new Error(...));
    } else {
      // ⏳ Still pending/processing — poll again
      if (tickCount >= 45) {
        reject(new Error('Crop quá thời gian...'));
      } else {
        setTimeout(poll, 4000);  // ← Poll every 4 seconds
      }
    }
  };
  setTimeout(poll, 2000);  // ← Initial delay 2 seconds
});
```

**The Problem:**
The polling logic is written manually inline instead of using the established `pollJobOnce()` utility. However, the main issue is:

**`editImageApi.getJobStatus()` is returning `undefined` or the status check is failing silently.**

---

## COMPARISON: What Works (Image Generation)

**File:** `hooks/useProductImageEditor.ts` → `handleGenerate()` function (lines 214-285)

For image generation, after creating a job:
```typescript
if (apiRes.success && apiRes.data.jobId) {
  const serverJobId = apiRes.data.jobId;
  if (usagePreference === 'credits') useCredits(currentCost);
  setStatus('🔄 Đang xử lý...');
  
  // ✅ Uses the utility function!
  pollJobStatus(serverJobId, serverJobId, currentCost, finalPrompt);
}
```

This calls `pollJobStatus()` (lines 169-202), which uses **`pollJobOnce()`** with `apiType: 'image'`.

**Key difference:** Image generation properly delegates to `pollJobOnce()` which handles polling for the image generation API.

---

## MISSING PIECE

There is **NO `pollJobOnce()` utility for edit-image jobs**.

The `useJobPoller` hook (imported at line 9) likely only handles:
- `apiType: 'image'` → for image generation jobs (via `/image-jobs`)

But crop jobs use:
- `/edit-image-jobs/:id` endpoint (via `editImageApi.getJobStatus()`)

So the solution is **NOT** to use the inline polling in `applyCrop()` and `applyDraw()`, but to:

1. Create proper polling support for edit-image jobs, OR
2. Fix the inline polling to properly handle async/await

---

## THE REAL ISSUE: Event Loop + Promise Handling

Looking at the inline polling (lines 578-615), there's a subtle bug:

```typescript
await new Promise<void>((resolve, reject) => {
  const poll = async () => {
    // ... fetch status ...
    if (st === 'done') {
      resolve();  // ← Resolves immediately after UI update
    } else {
      setTimeout(poll, 4000);  // ← Schedules next poll
    }
  };
  setTimeout(poll, 2000);  // ← Initial delay
});
```

**The problem:**
- After `resolve()` is called, the outer `await` completes
- But if `statusRes.data?.status` is `undefined` or missing, it goes to the `else` branch
- If the response parsing fails silently, we never detect 'done'
- The promise hangs until timeout (3 min)

---

## SOLUTION

### Recommended Fix:

Use the same pattern as `handleGenerate()` with proper error handling:

```typescript
// Create an extension to useJobPoller for edit-image jobs, OR
// Use async polling with exponential backoff

const pollEditImageJob = async (jobId: string) => {
  const maxAttempts = 45;
  let attempt = 0;
  
  while (attempt < maxAttempts) {
    const statusRes = await editImageApi.getJobStatus(jobId);
    
    if (!statusRes.success) {
      throw new Error('Failed to check job status');
    }
    
    const st = statusRes.data?.status;
    
    if (st === 'done') {
      return statusRes.data?.result?.resultUrl;
    } else if (st === 'error' || st === 'cancelled') {
      throw new Error(statusRes.data?.error?.message || 'Job failed');
    }
    
    attempt++;
    setStatus(`⏳ Đang crop... (${attempt * 4}s)`);
    
    if (attempt < maxAttempts) {
      await new Promise(r => setTimeout(r, 4000));
    }
  }
  
  throw new Error('Crop timeout');
};
```

---

## FILES INVOLVED

| File | Role | Issue |
|------|------|-------|
| `hooks/useProductImageEditor.ts` | Main logic | `applyCrop()` has broken polling |
| `apis/editImage.ts` | API calls | Working but response might be malformed |
| `services/uploadPoller.ts` | Upload polling | ✅ Working fine |
| `hooks/useJobPoller.ts` | Job polling | ❌ Only handles image jobs, not edit-image jobs |

---

## TESTING CHECKLIST

After fix, verify:
1. [ ] Upload local file successfully
2. [ ] Enter crop mode
3. [ ] Select crop area
4. [ ] Click "Xác nhận cắt" (Confirm crop)
5. [ ] Status message updates: "📤 Đang upload ảnh..." → "⏳ Đang xử lý crop..." → "✅ Crop thành công"
6. [ ] Cropped result appears in viewport
7. [ ] Result added to history rail
8. [ ] No hanging/stuck UI

