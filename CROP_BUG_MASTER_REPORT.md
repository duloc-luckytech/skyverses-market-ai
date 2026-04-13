# 🚨 PRODUCT IMAGE CROP BUG - MASTER REPORT

**Date:** April 13, 2026  
**Status:** 🔴 CRITICAL BUG IDENTIFIED  
**Severity:** HIGH - User-facing feature broken  
**Impact:** When users upload local files and crop them, the cropping hangs indefinitely

---

## 📋 Quick Summary

| Aspect | Details |
|--------|---------|
| **Bug Type** | Missing polling after crop job creation |
| **Location** | `hooks/useProductImageEditor.ts` lines 576-615 |
| **Affected Features** | Product image cropping, draw editing |
| **Root Cause** | Response validation failure in polling logic |
| **Symptom** | UI stuck with "Đang xử lý crop..." for 3 minutes |
| **User Impact** | Cannot complete crop/draw operations |
| **Fix Complexity** | Low-Medium (20-40 min) |

---

## 🔍 The Bug Explained (Simple Version)

When a user:
1. Uploads a local image file
2. Enters crop mode
3. Selects a crop area
4. Clicks "Xác nhận cắt" (Confirm crop)

**What happens:**
- ✅ Image uploads successfully
- ✅ Crop job is created
- ❌ **Polling for crop result fails silently**
- ❌ UI shows "Đang xử lý crop..." (Processing...)
- ❌ After 3 minutes: "Crop quá thời gian" (Timeout)

**Why it fails:**
The code checks `statusRes.data?.status` but doesn't validate if `statusRes.data` exists first.  
When the API returns an error or malformed response, `statusRes.data` is `undefined`.  
The optional chaining (`?.`) hides this, and polling keeps retrying until timeout.

---

## 📁 Reference Documents

In the project root directory:

1. **`SEARCH_SUMMARY.txt`** ← START HERE
   - Search results for all crop/upload/poll related files
   - High-level overview
   - API endpoints involved

2. **`bug_analysis.md`**
   - Detailed root cause analysis
   - Comparison with working image generation flow
   - Solution options

3. **`code_reference.md`**
   - Actual file contents from codebase
   - Line-by-line code breakdown
   - API interfaces and response types

4. **`DETAILED_BUG.md`**
   - Execution flow diagrams
   - Scenario-based failure analysis
   - Before/after code comparison
   - Complete fix implementation

---

## 🎯 Key Files Involved

### PRIMARY (Bug Location)
```
hooks/useProductImageEditor.ts
├─ applyCrop()    lines 493-624    ❌ BROKEN
├─ applyDraw()    lines 626-749    ❌ BROKEN (same issue)
└─ pollJobStatus() lines 169-202   ✅ Reference pattern
```

### SUPPORTING APIs
```
apis/editImage.ts (90 lines)
├─ editImageApi.createJob()   ✅ Works
└─ editImageApi.getJobStatus() ⚠️  Returns data but broken polling

apis/media.ts (154 lines)
├─ mediaApi.uploadImage()  ✅ Works
└─ mediaApi.getMediaById() ✅ Works
```

### REFERENCE (Working Pattern)
```
services/uploadPoller.ts (160 lines)
├─ waitForUploadPoll()  ✅ BEST PATTERN
└─ scheduleNext()       ✅ Proper validation
```

### UI COMPONENTS
```
components/ProductImageWorkspace.tsx
└─ Calls e.applyCrop() at line 161

components/product-image/EditorViewport.tsx
└─ Shows crop UI and "Xác nhận cắt" button
```

---

## 🔴 The Broken Code (Lines 576-615)

```typescript
// CURRENT (BROKEN)
let tickCount = 0;
await new Promise<void>((resolve, reject) => {
  const poll = async () => {
    if (isCancelledRef.current) { resolve(); return; }
    
    tickCount++;
    setStatus(`⏳ Đang crop... (${tickCount * 4}s)`);
    
    const statusRes = await editImageApi.getJobStatus(jobId);
    const st = statusRes.data?.status;  // ← VULNERABLE: .data might be undefined
    
    if (st === 'done') {
      // ✅ Never executes when statusRes.data is undefined
      const resultUrl = statusRes.data?.result?.resultUrl;
      // ... handle success ...
      resolve();
    } else if (st === 'error' || st === 'cancelled') {
      // ✅ Never executes when statusRes.data is undefined
      reject(new Error(...));
    } else {
      // ❌ ALWAYS executes when statusRes.data is undefined!
      if (tickCount >= 45) {
        reject(new Error('Crop quá thời gian...'));
      } else {
        setTimeout(poll, 4000);  // Keeps polling
      }
    }
  };
  setTimeout(poll, 2000);
});
```

### Problems:
1. ❌ No validation that `statusRes.data` exists
2. ❌ If API returns error format, `.data` is `undefined`
3. ❌ Optional chaining (`?.`) silently converts to falsy
4. ❌ Falls to else branch and keeps polling until timeout
5. ❌ User sees spinner stuck for 3 minutes

---

## ✅ The Fix (Lines 576-615)

```typescript
// FIXED VERSION
let tickCount = 0;
await new Promise<void>((resolve, reject) => {
  const poll = async () => {
    if (isCancelledRef.current) { resolve(); return; }
    
    try {
      tickCount++;
      setStatus(`⏳ Đang crop... (${tickCount * 4}s)`);
      
      const statusRes = await editImageApi.getJobStatus(jobId);
      
      // ✅ VALIDATE RESPONSE STRUCTURE FIRST
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

### Fixes:
1. ✅ Validates `statusRes.success && statusRes.data` before access
2. ✅ Throws error immediately if validation fails
3. ✅ Wrapped in try/catch to handle all errors
4. ✅ Proper error messages for debugging
5. ✅ No silent failures or infinite loops

---

## 🔧 Implementation Steps

### Step 1: Locate the code
- File: `/hooks/useProductImageEditor.ts`
- Function: `applyCrop()` (lines 493-624)
- Problem area: Lines 576-615

### Step 2: Replace broken polling
Copy the fixed version (above) and replace lines 576-615

### Step 3: Fix applyDraw() too
- Same issue in `applyDraw()` function (lines 626-749)
- Broken section: lines 704-742
- Apply identical fix

### Step 4: Test

```bash
# Test scenario:
1. Open ProductImageWorkspace
2. Upload a local image file
3. Enter crop mode
4. Select a crop region
5. Click "Xác nhận cắt" (Confirm crop)
6. Verify:
   - Status updates: "📤 Đang upload..." → "⏳ Đang xử lý crop..." → "✅ Crop thành công"
   - Cropped result displays in viewport
   - Result appears in history rail
   - No hanging/timeout
```

---

## 📊 Flow Comparison

### Current (BROKEN)
```
Upload ✅
├─ Poll for mediaId ✅
├─ Create crop job ✅
└─ Poll for result ❌ (fails silently)
   └─ statusRes.data is undefined
   └─ falls to else branch
   └─ loops until timeout (3 min)
```

### Fixed
```
Upload ✅
├─ Poll for mediaId ✅
├─ Create crop job ✅
└─ Poll for result ✅ (validates response)
   ├─ Check statusRes.success && statusRes.data
   ├─ If valid: process status
   ├─ If error: throw immediately
   └─ Result displays in <1 minute
```

---

## 📝 Related Issues

This same pattern issue affects:
- `applyDraw()` function (draw editing)
- Both use identical broken polling logic

---

## 🚀 Optional: Better Solution

Instead of fixing inline polling, create a utility service:

**File:** `/services/editJobPoller.ts`
```typescript
export async function waitForEditJobPoll(
  jobId: string,
  onTick?: (count: number) => void
): Promise<string> {
  const maxAttempts = 45;
  let attempt = 0;
  
  while (attempt < maxAttempts) {
    const res = await editImageApi.getJobStatus(jobId);
    
    if (!res.success || !res.data) {
      throw new Error(res.message || 'Job status check failed');
    }
    
    if (res.data.status === 'done') {
      return res.data.result?.resultUrl || '';
    }
    
    if (res.data.status === 'error' || res.data.status === 'cancelled') {
      throw new Error(res.data.error?.message || 'Job failed');
    }
    
    attempt++;
    onTick?.(attempt);
    
    if (attempt < maxAttempts) {
      await new Promise(r => setTimeout(r, 4000));
    }
  }
  
  throw new Error('Job processing timeout');
}
```

Then use in `applyCrop()` and `applyDraw()`:
```typescript
const resultUrl = await waitForEditJobPoll(jobId, (n) => {
  setStatus(`⏳ Đang crop... (${n * 4}s)`);
});
pushToHistory(resultUrl);
```

Benefits:
- ✅ Reusable pattern
- ✅ Consistent with uploadPoller.ts
- ✅ Cleaner applyCrop/applyDraw code
- ✅ Easier to test

---

## 📞 Questions?

Refer to:
- `DETAILED_BUG.md` - Scenario-based failure analysis
- `code_reference.md` - Exact file contents and line numbers
- `bug_analysis.md` - Architectural comparison

---

**Last Updated:** April 13, 2026  
**Bug Severity:** 🔴 CRITICAL  
**Fix Priority:** HIGH  
**Estimated Fix Time:** 20-40 minutes
