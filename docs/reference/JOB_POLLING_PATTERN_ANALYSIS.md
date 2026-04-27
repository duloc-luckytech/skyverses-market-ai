# Job & Polling Pattern Analysis

Complete reference for implementing job creation and polling logic across the codebase.

---

## 1. VIDEO GENERATOR PATTERN (AIVideoGeneratorWorkspace.tsx)

### A. Video Job Creation & Polling Flow

#### Job Creation (Lines 420-443)
```typescript
// AIVideoGeneratorWorkspace.tsx: Lines 420-443

await Promise.all(tasksToProduce.map(async (task) => {
  try {
    addLogToTask(task.id, `[UPLINK] Authenticating resource pool: ${currentPreference.toUpperCase()}`);
    
    if (currentPreference === 'credits') {
      const inputImages = [task.startUrl || null, task.endUrl || null];
      
      const payload: VideoJobRequest = {
        type: task.type,
        input: { images: inputImages },
        config: { duration: parseInt(duration), aspectRatio: task.ratio, resolution: resolution },
        engine: { provider: selectedEngine as any, model: selectedModelObj.modelKey as any },
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
      } else {
        addLogToTask(task.id, `[ERROR] Resource handshake rejected: ${res.message || 'Generic refusal'}`);
        setResults(prev => prev.map(r => r.id === task.id ? { ...r, status: 'error', errorMessage: res.message || 'API handshake rejected' } : r));
      }
    }
  } catch (e) {
    addLogToTask(task.id, `[CRITICAL_FAIL] Logic gate error: ${String(e)}`);
    setResults(prev => prev.map(r => r.id === task.id ? { ...r, status: 'error', errorMessage: String(e) } : r));
  }
}));
```

#### Video Polling Function (Lines 305-344)
```typescript
// AIVideoGeneratorWorkspace.tsx: Lines 305-344

const pollVideoJobStatus = async (jobId: string, resultId: string, cost: number) => {
  try {
    addLogToTask(resultId, `[POLLING] Requesting status update for node cluster...`);
    
    // FETCH current status from API
    const response: VideoJobResponse = await videosApi.getJobStatus(jobId);

    // Parse response status
    const isSuccess = response.success === true || response.status?.toLowerCase() === 'success';
    const jobStatus = response.data?.status?.toLowerCase();
    const errorMsg = response.data?.error?.message || response.data?.error?.userMessage || "";

    // ERROR BRANCH: Job failed
    if (!isSuccess || jobStatus === 'failed' || jobStatus === 'error') {
      addLogToTask(resultId, `[ERROR] Synthesis aborted: ${errorMsg || 'Unknown backend error'}`);
      
      setResults(prev => prev.map(r => {
        if (r.id === resultId) {
          // REFUND credits if using credits mode
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

    // SUCCESS BRANCH: Job complete
    if (jobStatus === 'done' && response.data.result?.videoUrl) {
      addLogToTask(resultId, `[SUCCESS] Synthesis manifest completed. Delivering assets to CDN...`);
      const videoUrl = response.data.result.videoUrl;
      
      setResults(prev => prev.map(r => r.id === resultId ? { ...r, url: videoUrl, status: 'done' } : r));
      
      refreshUserInfo();
      
      // Auto-download if enabled
      if (autoDownloadRef.current) triggerDownload(videoUrl, `video_${resultId}.mp4`);
    } 
    // PROCESSING BRANCH: Still working, re-poll
    else {
      addLogToTask(resultId, `[STATUS] Pipeline state: ${jobStatus?.toUpperCase() || 'SYNTHESIZING'}`);
      
      // RECURSIVE POLL with 5s delay
      setTimeout(() => pollVideoJobStatus(jobId, resultId, cost), 5000);
    }
  } catch (e) {
    addLogToTask(resultId, `[NETWORK] Connectivity drift. Retrying telemetry uplink...`);
    
    // NETWORK ERROR: Retry with 10s delay
    setTimeout(() => pollVideoJobStatus(jobId, resultId, cost), 10000);
  }
};
```

---

## 2. IMAGE GENERATOR PATTERN (useImageGenerator.ts)

### A. Hook Structure & Imports (Lines 1-12)
```typescript
// useImageGenerator.ts: Lines 1-12

import { useState, useRef, useEffect, useMemo, useCallback } from 'react';
import { generateDemoImage } from '../services/gemini';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { GCSAssetMetadata, uploadToGCS } from '../services/storage';
import { imagesApi, ImageJobRequest, ImageJobResponse } from '../apis/images';
import { pricingApi, PricingModel } from '../apis/pricing';
import { useToast } from '../context/ToastContext';

// Note: useImageGenerator is a CUSTOM HOOK, not a component
// Returns object with all state and handlers
```

### B. Image Job Creation (Lines 332-366)
```typescript
// useImageGenerator.ts: Lines 332-366

try {
  await Promise.all(targetTasks.map(async (task) => {
    addLogToTask(task.id, `[UPLINK] Authenticating resource pool: ${currentPreference.toUpperCase()}`);
    
    if (currentPreference === 'credits') {
      const processedRefs = task.references.map(r => r.url);

      const payload: ImageJobRequest = {
        type: processedRefs.length > 0 ? "image_to_image" : "text_to_image",
        input: {
          prompt: task.prompt,
          images: processedRefs.length > 0 ? processedRefs : undefined
        },
        config: { 
          width: 1024, 
          height: 1024, 
          aspectRatio: task.aspectRatio || selectedRatio, 
          seed: 0, 
          style: "cinematic" 
        },
        engine: {
          provider: selectedEngine as any,
          model: selectedModel.raw.modelKey as any
        },
        enginePayload: {
          prompt: task.prompt,
          privacy: "PRIVATE",
          projectId: "default",
          mode: selectedMode
        }
      };
      
      addLogToTask(task.id, `[NODE_INIT] Provisioning H100 GPU cluster...`);
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
      } else {
        addLogToTask(task.id, `[ERROR] Resource handshake rejected: ${apiRes.message || 'Generic refusal'}`);
        setResults(prev => prev.map(r => r.id === task.id ? { ...r, status: 'error' } : r));
      }
    }
  }));
} finally {
  setIsGenerating(false);
}
```

### C. Image Polling Function (Lines 250-287)
```typescript
// useImageGenerator.ts: Lines 250-287

const pollImageJobStatus = async (jobId: string, resultId: string, cost: number) => {
  try {
    addLogToTask(resultId, `[POLLING] Requesting status update for node cluster...`);
    
    // FETCH status
    const response: ImageJobResponse = await imagesApi.getJobStatus(jobId);
    const isError = response.status === 'error' || response.data?.status === 'error' || response.data?.status === 'failed';

    // ERROR BRANCH
    if (isError) {
      const errorMsg = (response.data as any)?.error?.message || "Inference failed";
      addLogToTask(resultId, `[ERROR] Synthesis aborted: ${errorMsg}`);
      
      if (usagePreference === 'credits') {
        setResults(prev => prev.map(r => {
          if (r.id === resultId && !r.isRefunded) {
            addCredits(cost);  // REFUND
            return { ...r, status: 'error', isRefunded: true };
          }
          return r.id === resultId ? { ...r, status: 'error' } : r;
        }));
      } else {
        setResults(prev => prev.map(r => r.id === resultId ? { ...r, status: 'error' } : r));
      }
      return;
    }

    // SUCCESS BRANCH
    if (response.data && response.data.status === 'done' && response.data.result?.images?.length) {
      addLogToTask(resultId, `[SUCCESS] Synthesis complete. Delivering asset to CDN...`);
      const imageUrl = response.data.result.images[0];
      
      setResults(prev => prev.map(r => r.id === resultId ? { ...r, url: imageUrl, status: 'done' } : r));
      refreshUserInfo();
      fetchServerResults(1, true);
    } 
    // PROCESSING BRANCH: Re-poll
    else {
      addLogToTask(resultId, `[STATUS] Pipeline state: ${response.data?.status?.toUpperCase() || 'SYNTHESIZING'}`);
      
      // RECURSIVE POLL with 5s delay
      setTimeout(() => pollImageJobStatus(jobId, resultId, cost), 5000);
    }
  } catch (e) {
    addLogToTask(resultId, `[NETWORK] Connectivity drift. Retrying telemetry uplink...`);
    
    // NETWORK ERROR: Retry with 10s delay
    setTimeout(() => pollImageJobStatus(jobId, resultId, cost), 10000);
  }
};
```

### D. performInference Function (Lines 289-389)
```typescript
// useImageGenerator.ts: Lines 289-389
// This is the MAIN orchestration function that coordinates job creation

const performInference = async (currentPreference: 'credits' | 'key', retryItem?: ImageResult) => {
  if (!selectedModel) return;
  
  const unitCost = retryItem ? retryItem.cost : currentUnitCost;
  const currentRefs = retryItem ? retryItem.references : [...references];
  const promptsToRun = retryItem
    ? [retryItem.prompt]
    : (activeMode === 'SINGLE'
      ? Array(quantity).fill(prompt)
      : batchPrompts.filter(p => p.trim()));

  if (promptsToRun.length === 0) return;
  setIsGenerating(true);

  const now = new Date();
  const ts = `${now.getHours()}:${now.getMinutes().toString().padStart(2, '0')} ${now.toLocaleDateString('vi-VN')}`;

  // CREATE local result objects with 'processing' status
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

  // Add to results immediately
  if (retryItem) {
    setResults(prev => prev.map(r => r.id === retryItem.id ? { ...r, status: 'processing', isRefunded: false, logs: [`[SYSTEM] Re-initializing production node for manual retry.`] } : r));
  } else {
    setResults(prev => [...newTasks, ...prev]);
  }

  // ... then invoke API and start polling (see Lines 332-366 above)
};
```

---

## 3. SOCIAL BANNER PATTERN (SocialBannerWorkspace.tsx)

### A. Direct Generation (No Job Polling)
```typescript
// SocialBannerWorkspace.tsx: Lines 201-264

const handleGenerate = async () => {
  if (!prompt.trim() || isGenerating) return;
  if (!isAuthenticated) { login(); return; }
  
  const totalCost = CREDIT_COST * quantity;
  if (credits < totalCost) { setShowLowCreditAlert(true); return; }

  const controller = new AbortController();
  abortRef.current = controller;

  setIsGenerating(true);
  setStatus('Đang kết nối AI...');
  
  try {
    // Build final prompt
    const finalPrompt = `...`; // (lines 213-220)

    setStatus('AI đang tạo banner...');
    
    // DIRECT API CALL (NO JOB POLLING)
    const imageUrl = await generateDemoImage(finalPrompt, references);

    if (controller.signal.aborted) return;

    if (imageUrl) {
      // Deduct credits AFTER successful generation
      useCredits(totalCost);

      setResult(imageUrl);
      
      // Store in history
      const newSession: BannerSession = {
        id: Date.now().toString(),
        url: imageUrl,
        prompt,
        config: { platformId: activePlatform, style: selectedStyle, model: selectedModel },
        timestamp: new Date().toLocaleString('vi-VN'),
      };
      const updated = [newSession, ...sessions];
      setSessions(updated);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));

      setStatus('Hoàn tất ✓');
      showToast('Banner đã được tạo thành công!', 'success');
    } else {
      setStatus('Lỗi tạo banner');
      showToast('Không tạo được banner — credits chưa bị trừ, thử lại nhé!', 'warning');
    }
  } catch (err) {
    if (controller.signal.aborted) return;
    setStatus('Lỗi hệ thống');
    showToast('Lỗi hệ thống — credits chưa bị trừ, thử lại sau.', 'error');
  } finally {
    if (!controller.signal.aborted) {
      setIsGenerating(false);
    }
    abortRef.current = null;
  }
};
```

**KEY DIFFERENCE**: Social Banner uses direct API calls without async job polling. Credits are deducted AFTER successful generation (line 229).

---

## 4. KEY PATTERNS & BEST PRACTICES

### ✅ Polling Pattern Summary

| Step | Video | Image |
|------|-------|-------|
| 1. Create task object | Lines 394-413 | Lines 307-321 |
| 2. Add to results | Line 414 | Line 326 |
| 3. Call API createJob | Line 429 | Line 356 |
| 4. Get serverJobId | Line 433 | Line 358 |
| 5. Update local ID | Line 436 | Line 360 |
| 6. Deduct credits | Line 438 | Line 361 |
| 7. Start polling | Line 439 | Line 362 |
| 8. Poll status | Every 5s | Every 5s |
| 9. Handle done | Line 333 | Line 276 |
| 10. Refund on error | Line 320 | Line 262 |

### 📝 Logging Pattern
```
[SYSTEM] — System initialization
[UPLINK] — Resource authentication
[NODE_INIT] — GPU cluster provisioning
[API_READY] — Job created on server
[POLLING] — Status check initiated
[STATUS] — Current job state
[SUCCESS] — Job completed
[ERROR] — Job failed
[NETWORK] — Network error occurred
[CRITICAL_FAIL] — Unexpected exception
```

### 🔄 Retry Logic
When called with retryItem parameter:
- Don't deduct credits again if isAutoRetry = true
- Set isRefunded to false before restart
- Reset status to 'processing'

### 💳 Credit Deduction Rules
- ✓ Deduct AFTER successful job creation (not on user click)
- ✓ Refund ONLY on error (before user sees result)
- ✓ Don't refund on network retry (keeps polling)

### 🎯 Result Status States
```
'processing'  — Job created, awaiting completion
'done'        — Job completed, URL received
'error'       — Job failed
```

---

## 5. VIDEO API SPECIFICS

### Video Task Types
```
"text-to-video" | "image-to-video" | "start-end-image"
```

Selected based on frame availability:
- If startFrame && endFrame → "start-end-image"
- Else if startFrame → "image-to-video"
- Else → "text-to-video"

---

## 6. IMAGE API SPECIFICS

### Image Task Types
```
type: processedRefs.length > 0 ? "image_to_image" : "text_to_image"
```

- With references → image_to_image
- Without references → text_to_image

---

## 7. IMPLEMENTATION CHECKLIST

When creating new AI generator:
- [ ] Define JobRequest and JobResponse types
- [ ] Create createJob(payload) API method
- [ ] Create getJobStatus(jobId) API method
- [ ] Implement pollJobStatus() with 5s interval
- [ ] Add 10s retry for network errors
- [ ] Implement error refund logic
- [ ] Add status logging
- [ ] Call useCredits() AFTER successful job creation
- [ ] Update local result ID to server jobId
- [ ] Add isRefunded flag to result object
- [ ] Test retry flow with network errors

---

## Summary

**Jobs with Polling (Video, Image):**
1. Create job via API → get serverJobId
2. Update local task ID to serverJobId  
3. Add task to results with 'processing' status
4. Start polling with 5s interval
5. Handle 3 outcomes: done (update url), error (refund), processing (recurse)

**Direct Generation (Banner):**
1. Call API directly (no jobId tracking)
2. Get result immediately or fail
3. Update credits AFTER confirmed success
4. Store in local history

**Key Rule:** Credits are NEVER deducted until job creation succeeds.

