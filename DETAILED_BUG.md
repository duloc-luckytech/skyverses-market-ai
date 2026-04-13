# 🔴 DETAILED BUG REPORT: Crop Upload Missing Polling

## Execution Flow Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│ User: Upload Local File + Crop                                  │
└────────────────────────┬────────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────────┐
│ applyCrop() - useProductImageEditor.ts:493-624                  │
│                                                                   │
│ Step 1: Convert result URL → base64                             │
│ ├─ if starts with 'data:' → strip prefix  ✅                    │
│ └─ else → fetch & convert via FileReader  ✅                    │
│                                                                   │
│ Step 2: Compress with compressImageBase64()                     │
│ └─ Resize to 800px max, JPEG 0.80 quality  ✅                   │
│                                                                   │
│ Step 3: Upload to GCS via uploadToGCS()                         │
│ └─ Returns { url, mediaId?, jobId? }  ✅                        │
│                                                                   │
│ Step 4: If jobId exists, POLL FOR UPLOAD                        │
│ ├─ await waitForUploadPoll({ jobId, ... })  ✅                  │
│ └─ Returns { mediaId, projectId }           ✅                  │
│                                                                   │
│ Step 5: Convert cropBox (0-100%) → coordinates (0-1)           │
│ └─ left, top, right, bottom = cropBox / 100  ✅                 │
│                                                                   │
│ Step 6: Create edit-image job                                   │
│ ├─ editImageApi.createJob({                  ✅                 │
│ │   mediaId, projectId, editType: 'crop',                       │
│ │   cropCoordinates: { top, left, right, bottom }               │
│ │ })                                                             │
│ └─ Returns { success, data: { jobId } }  ✅                     │
│                                                                   │
│ Step 7: ❌ POLL FOR CROP RESULT (BROKEN)                        │
│ └─ Inline Promise with manual setTimeout  ❌                    │
│                                                                   │
└─────────────────────────────────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────────┐
│ ❌ BROKEN POLLING LOGIC - Lines 576-615                         │
│                                                                   │
│ let tickCount = 0;                                              │
│ await new Promise<void>((resolve, reject) => {                 │
│   const poll = async () => {                                    │
│     if (isCancelledRef.current) { resolve(); return; }         │
│                                                                   │
│     tickCount++;                                                │
│     setStatus(`⏳ Đang crop... (${tickCount * 4}s)`);           │
│                                                                   │
│     const statusRes = await editImageApi.getJobStatus(jobId);  │
│     const st = statusRes.data?.status;  ← VULNERABLE!          │
│                                                                   │
│     if (st === 'done') {                                        │
│       // Push result to history                                 │
│       pushToHistory(resultUrl);                                 │
│       setHistory(prev => [{                                     │
│         id: jobId,                                              │
│         url: resultUrl,                                         │
│         prompt: 'Crop Edit',                                    │
│         timestamp: new Date().toLocaleTimeString()              │
│       }, ...prev]);                                             │
│       setStatus('✅ Crop thành công');                          │
│       resolve();  ← RESOLVES PROMISE                            │
│     } else if (st === 'error' || st === 'cancelled') {         │
│       reject(new Error(...));                                   │
│     } else {                                                     │
│       if (tickCount >= 45) {  // ~3 min timeout                 │
│         reject(new Error('Crop quá thời gian...'));            │
│       } else {                                                   │
│         setTimeout(poll, 4000);  ← SCHEDULE NEXT POLL          │
│       }                                                          │
│     }                                                            │
│   };                                                             │
│   setTimeout(poll, 2000);  ← INITIAL DELAY                     │
│ });                                                              │
│                                                                   │
└─────────────────────────────────────────────────────────────────┘
                         │
          ┌──────────────┴──────────────┐
          │                             │
          ▼ (if successful)             ▼ (if fails)
    ✅ Result displays           ❌ UI stuck for 3 min
    ✅ History updated          ❌ No error shown
    ✅ Crop complete            ❌ Timeout error
```

## The Problem: Silent Failure in Response Validation

### Scenario 1: Normal Flow (What Should Happen)
```
1. editImageApi.getJobStatus(jobId) called
2. Server responds: {
     success: true,
     data: {
       jobId: "abc123",
       status: "pending"  ← or "done" or "error"
     }
   }
3. const st = statusRes.data?.status  → "pending"
4. Check: st === 'done'? NO
5. Check: st === 'error'? NO
6. Falls to else: setTimeout(poll, 4000)
7. After a few ticks, status becomes "done"
8. Loop exits ✅
```

### Scenario 2: Malformed Response (What's Happening)
```
1. editImageApi.getJobStatus(jobId) called
2. Server responds with ERROR or MALFORMED:
   {
     success: false,
     message: "Job not found"
     // ← No data field!
   }
   OR
   {
     data: null
   }
3. const st = statusRes.data?.status → undefined
4. Check: st === 'done'? NO (undefined !== 'done')
5. Check: st === 'error'? NO (undefined !== 'error')
6. Falls to else: setTimeout(poll, 4000)  ← KEEPS LOOPING!
7. Ticks 1, 2, 3, ... 45 (3+ minutes)
8. Timeout error: "Crop quá thời gian" ❌
9. User sees spinner stuck ❌
```

### Scenario 3: Network Error
```
1. editImageApi.getJobStatus(jobId) called
2. Network timeout or 5xx server error
3. editImageApi catches error and returns:
   {
     success: false,
     message: 'Status check failed'
   }
4. const st = statusRes.data?.status → undefined
5. Same as Scenario 2 ❌ LOOPS FOREVER
```

## Why It's Not Caught

### The Code
```typescript
const statusRes = await editImageApi.getJobStatus(jobId);
const st = statusRes.data?.status;  // ← Optional chaining hides errors!

if (st === 'done') {  // st is undefined → false
  // Never executes
} else if (st === 'error' || st === 'cancelled') {  // undefined → false
  // Never executes
} else {
  // ✅ ALWAYS executes when statusRes.data is undefined!
  if (tickCount >= 45) {
    reject(new Error('Crop quá thời gian...'));  // Timeout after 3 min
  } else {
    setTimeout(poll, 4000);  // Keeps polling
  }
}
```

The optional chaining (`?.`) silently converts undefined to falsy, so:
- No error is thrown
- The else branch always executes
- Polling continues until timeout

## Contrast: Working Pattern (uploadPoller.ts)

### Lines 76-90: Validates BEFORE Accessing
```typescript
try {
  const res = await mediaApi.getMediaById(jobId);

  // ✅ Check success status FIRST
  if (res.success && res.status === 'done' && res.mediaId) {
    onDone({
      mediaId: res.mediaId,
      projectId: res.projectId,
      imageUrl: res.imageUrl,
    });
    return;
  }

  // ✅ Check for known error states
  if (res.status === 'failed' || res.status === 'error') {
    onError('Upload job failed on server');
    return;
  }

  // ⏳ Still pending - schedule next poll
  scheduleNext(jobId, deadline, intervalMs, onDone, onError, tickCount, onTick);
} catch {
  // Network error - retry silently
  scheduleNext(jobId, deadline, intervalMs, onDone, onError, tickCount, onTick);
}
```

Key differences:
1. ✅ Validates `res.success` before accessing `res.status`
2. ✅ Checks `res.status === 'done' && res.mediaId` together
3. ✅ Has explicit error state detection
4. ✅ Recursive call for retry (cleaner than setTimeout)

## The Fix: Apply Same Pattern to applyCrop()

Replace lines 576-615 with validated polling:

```typescript
let tickCount = 0;
await new Promise<void>((resolve, reject) => {
  const poll = async () => {
    if (isCancelledRef.current) { resolve(); return; }
    
    try {
      tickCount++;
      setStatus(`⏳ Đang crop... (${tickCount * 4}s)`);
      
      const statusRes = await editImageApi.getJobStatus(jobId);
      
      // ✅ Validate response structure
      if (!statusRes.success || !statusRes.data) {
        throw new Error(statusRes.message || 'Không thể kiểm tra trạng thái job');
      }
      
      const st = statusRes.data.status;
      
      if (st === 'done') {
        const resultUrl = statusRes.data.result?.resultUrl;
        if (!resultUrl) {
          throw new Error('Không tìm thấy kết quả crop');
        }
        
        pushToHistory(resultUrl);
        setHistory(prev => [{
          id: jobId,
          url: resultUrl,
          prompt: 'Crop Edit',
          timestamp: new Date().toLocaleTimeString()
        }, ...prev]);
        
        setStatus('✅ Crop thành công');
        resolve();
        
      } else if (st === 'error' || st === 'cancelled') {
        throw new Error(statusRes.data.error?.message || 'Crop job thất bại');
        
      } else if (tickCount >= 45) {
        throw new Error('Crop quá thời gian. Vui lòng thử lại.');
        
      } else {
        // Still processing - schedule next poll
        setTimeout(poll, 4000);
      }
      
    } catch (err: any) {
      reject(err);
    }
  };
  
  setTimeout(poll, 2000);
});
```

## Summary Table

| Aspect | Current (Broken) | Fixed |
|--------|------------------|-------|
| Response validation | ❌ None | ✅ Check `.success && .data` |
| Status access | ❌ `.data?.status` | ✅ `.data.status` after validation |
| Error handling | ❌ Optional chaining hides errors | ✅ Explicit error checks |
| Network errors | ❌ Loops forever | ✅ Caught and rejected |
| Undefined handling | ❌ Falls to else | ✅ Throws immediately |
| Timeout behavior | ❌ After 3 min | ✅ Same (but actually works) |
| Code clarity | ❌ Defensive (too safe) | ✅ Explicit (clearer intent) |

---

## Files to Modify

1. **`/hooks/useProductImageEditor.ts`**
   - Fix `applyCrop()` function (lines 576-615)
   - Fix `applyDraw()` function (lines 704-742)

2. **(Optional) Create new utility:**
   - `/services/editJobPoller.ts` (following uploadPoller.ts pattern)
   - Then import and use in applyCrop/applyDraw

3. **Test locations:**
   - ProductImageWorkspace component (uses applyCrop at line 161)
   - EditorViewport component (shows crop UI)

