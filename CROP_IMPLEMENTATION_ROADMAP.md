# 🗺️ CROP FEATURE — IMPLEMENTATION ROADMAP

Complete guide for maintaining, debugging, and extending the crop feature.

---

## 📊 DATA FLOW DIAGRAM

### Current (Client-Side Only)

```
ProductImageWorkspace
  ├─ props.initialImage (data URL)
  │
  └─ useProductImageEditor(initialImage, theme)
      ├─ [isCropping] boolean state
      ├─ [cropBox] { x, y, w, h } in %
      ├─ [cropRatio] number (1=1:1, 16/9=16:9, etc.)
      ├─ [dragStart] { x, y, box } for dragging
      ├─ [resizeHandle] "topleft"|"topright"|"bottomleft"|"bottomright"|null
      │
      ├─ applyCrop() ← Main function
      │  ├─ Load image from result (data URL)
      │  ├─ Create HTML5 Canvas
      │  ├─ Convert % to pixels
      │  ├─ ctx.drawImage(source, srcX, srcY, srcW, srcH, 0, 0, dstW, dstH)
      │  ├─ toDataURL('image/png')
      │  └─ pushToHistory(croppedUrl)
      │
      ├─ handleRatioSelect(val)
      │  └─ Recalculate crop box height/width based on ratio
      │
      ├─ Mouse event handlers (global)
      │  ├─ handleMouseMoveGlobal
      │  │  ├─ Calculate delta in %
      │  │  ├─ Update cropBox.x/y (drag entire box)
      │  │  └─ Update cropBox.x/y/w/h (resize from handle)
      │  │
      │  └─ handleMouseUpGlobal
      │     ├─ Clear dragStart
      │     ├─ Clear resizeHandle
      │     └─ Close path on canvas
      │
      └─ Exports to ProductImageWorkspace
         ├─ State: isCropping, cropBox, cropRatio
         ├─ Setters: setIsCropping, setCropBox, setCropRatio
         ├─ Functions: applyCrop, handleRatioSelect
         └─ Refs: setDragStart, setResizeHandle

           ↓

EditorViewport (consumes from hook)
  ├─ Renders crop overlay (if isCropping)
  │  ├─ Control bar with ratio presets
  │  ├─ Dimensions display (width × height in pixels)
  │  ├─ Confirm button → calls applyCrop()
  │  └─ Cancel button → calls setIsCropping(false)
  │
  ├─ Renders crop box on image
  │  ├─ Dark overlay outside crop area
  │  ├─ Crop box with border
  │  └─ 4 corner handles + 4 edge handles
  │     └─ onMouseDown → setResizeHandle + setDragStart
  │
  └─ Global mouse listeners (attached to window)
     ├─ mousemove → handleMouseMoveGlobal
     └─ mouseup → handleMouseUpGlobal

           ↓

EditorHeader
  ├─ Crop button
  │  ├─ active={isCropping}
  │  ├─ onClick={() => setIsCropping(!isCropping)}
  │  └─ disabled={!result}
  │
  └─ Syncs with other tool state

           ↓

Result shown in viewport + Added to history
```

---

## 🔄 STATE MACHINE

```
NORMAL
  ↓ (User clicks crop button)
CROPPING
  ├─ (User drags box) → cropBox updates
  ├─ (User resizes) → cropBox updates
  ├─ (User selects ratio) → cropBox recalculates
  ├─ (User clicks cancel) → NORMAL (cropBox reverted to initial)
  └─ (User clicks confirm)
      ↓
      applyCrop() executed
      ├─ ISGENERING = true (loading state)
      ├─ Canvas operations (sync)
      ├─ pushToHistory(croppedUrl)
      ├─ ISGENERING = false
      └─ NORMAL (cropBox reset to initial for next crop)
```

---

## 🎯 FILE LOCATIONS & RESPONSIBILITIES

| File | Lines | Responsibility |
|------|-------|-----------------|
| `hooks/useProductImageEditor.ts` | 88-92 | State initialization |
| | 436-448 | Ratio selection logic |
| | 319-414 | Mouse event handlers |
| | 466-491 | **applyCrop() main logic** |
| | 519-532 | Export to components |
| `components/product-image/EditorViewport.tsx` | 59-81 | Crop control bar UI |
| | 114-127 | Crop overlay + handles |
| | 44-46 | Mouse event props |
| `components/product-image/EditorHeader.tsx` | 105 | Crop button |
| `ProductImageWorkspace.tsx` | 22-29 | RATIO_PRESETS constant |
| | 131-141 | Pass props to EditorViewport |
| `skyverses-backend/src/routes/editImageJobs.ts` | — | **Backend (NOT USED)** |
| `skyverses-backend/src/models/EditImageJob.ts` | — | **Backend model (NOT USED)** |

---

## 🐛 DEBUGGING GUIDE

### Problem: Crop box won't move

**Debugging steps:**

1. Check if `isCropping === true`:
   ```typescript
   console.log("isCropping:", isCropping);
   ```

2. Check if mouse events firing:
   ```typescript
   window.addEventListener('mousemove', (e) => {
     console.log("mousemove fired", e.clientX, e.clientY);
   });
   ```

3. Check if `dragStart` is set:
   ```typescript
   console.log("dragStart:", dragStart);
   ```

4. Check container rect calculation:
   ```typescript
   const rect = containerRef.current?.getBoundingClientRect();
   console.log("rect:", rect);
   ```

**Common causes:**
- `containerRef` not attached to DOM
- Global mouse listeners not registered
- `dragStart` never set (check onMouseDown handlers)
- Container has `pointer-events: none`

---

### Problem: Crop doesn't apply / stays at 100% of image

**Debugging steps:**

1. Check if `applyCrop()` is called:
   ```typescript
   const applyCrop = async () => {
     console.log("applyCrop called");
     console.log("cropBox:", cropBox);
     console.log("result:", result);
   ```

2. Check image load:
   ```typescript
   const img = new Image();
   img.onload = () => console.log("Image loaded", img.width, img.height);
   img.onerror = () => console.error("Image load failed");
   ```

3. Check canvas context:
   ```typescript
   const ctx = canvas.getContext('2d');
   if (!ctx) console.error("Canvas context failed");
   ```

4. Check data URL generation:
   ```typescript
   const croppedUrl = canvas.toDataURL('image/png');
   console.log("croppedUrl:", croppedUrl.substring(0, 100));
   ```

**Common causes:**
- `result` is null (no image loaded)
- `imageRef.current` is null (ref not attached)
- Canvas context returns null (unlikely)
- Image load fails (CORS issue)

---

### Problem: Handles won't resize

**Check:**
1. `resizeHandle` is being set correctly:
   ```typescript
   console.log("resizeHandle:", resizeHandle);
   ```

2. Handle coordinate check:
   ```typescript
   if (resizeHandle.includes('right')) {
     console.log("Resizing right, deltaX:", deltaX);
   }
   ```

3. Boundary conditions:
   ```typescript
   if (resizeHandle.includes('right')) 
     newBox.w = Math.max(5, Math.min(dragStart.box.w + deltaX, 100 - dragStart.box.x));
   // Check: is w < 5? Is w > (100 - x)?
   ```

---

### Problem: Ratio lock doesn't work

**Check:**
1. `handleRatioSelect()` is being called:
   ```typescript
   const handleRatioSelect = (val: number) => {
     console.log("handleRatioSelect:", val);
     setCropRatio(val);
   ```

2. Height calculation:
   ```typescript
   const newH = newW / val;
   console.log("newW:", newW, "val:", val, "newH:", newH);
   ```

3. Height constraint:
   ```typescript
   if (newH > 90) {
     console.log("Height > 90, constraining to 90");
     return { ...prev, h: 90, w: 90 * val };
   }
   ```

---

## ✨ ENHANCEMENT IDEAS

### 1. Grid overlay during crop
```typescript
// Draw 3x3 grid on crop box for rule-of-thirds
const gridLines = [];
for (let i = 0; i <= 3; i++) {
  gridLines.push({
    h: `${(i / 3) * 100}%`,
    v: `${(i / 3) * 100}%`,
  });
}
```

### 2. Keyboard shortcuts
```typescript
useEffect(() => {
  const handleKeyDown = (e: KeyboardEvent) => {
    if (e.key === 'Enter' && isCropping) applyCrop();
    if (e.key === 'Escape' && isCropping) setIsCropping(false);
  };
  window.addEventListener('keydown', handleKeyDown);
  return () => window.removeEventListener('keydown', handleKeyDown);
}, [isCropping]);
```

### 3. Touch support
```typescript
const handleTouchStart = (e: React.TouchEvent) => {
  const touch = e.touches[0];
  setDragStart({ 
    x: touch.clientX, 
    y: touch.clientY, 
    box: { ...cropBox } 
  });
};
```

### 4. Crop preset templates
```typescript
const CROP_TEMPLATES = {
  'profile': { x: 25, y: 10, w: 50, h: 50 },
  'banner': { x: 0, y: 25, w: 100, h: 50 },
  'thumbnail': { x: 10, y: 10, w: 80, h: 80 },
};
```

### 5. Backend integration
```typescript
const applyCrop = async () => {
  // ... existing canvas crop ...
  
  // NEW: Send to backend if mediaId available
  if (mediaId && projectId) {
    const jobRes = await editImageApi.createCropJob({
      mediaId,
      projectId,
      editType: 'crop',
      cropCoordinates: {
        top: cropBox.y,
        left: cropBox.x,
        right: cropBox.x + cropBox.w,
        bottom: cropBox.y + cropBox.h,
      }
    });
    
    if (jobRes.success) {
      const jobId = jobRes.data.jobId;
      // Poll until done
      pollEditJob(jobId);
    }
  }
};
```

---

## 📋 MAINTENANCE CHECKLIST

- [ ] **Test on all browsers** (Chrome, Firefox, Safari, Edge)
- [ ] **Test on mobile** (iOS Safari, Android Chrome)
- [ ] **Test CORS** — Can images from different origins be cropped?
- [ ] **Test history** — Are cropped images preserved in undo/redo?
- [ ] **Test performance** — Does UI lag with large images (4K+)?
- [ ] **Test dark mode** — Are colors visible in both themes?
- [ ] **Test accessibility** — Can keyboard-only users operate crop?
- [ ] **Test edge cases:**
  - [ ] Very small image (< 100x100px)
  - [ ] Very large image (8K+)
  - [ ] Extremely wide/tall aspect ratio
  - [ ] Data URL vs HTTP URL
  - [ ] WebP/AVIF formats

---

## 🚀 PERFORMANCE TIPS

1. **Limit history stack** (already done at 20 items):
   ```typescript
   const limitedStack = newStack.slice(-20);
   ```

2. **Debounce mousemove if laggy** (currently direct, may need debounce):
   ```typescript
   const debouncedMouseMove = debounce(handleMouseMoveGlobal, 8);
   ```

3. **Use `canvas.toDataURL('image/webp')` for smaller output**:
   ```typescript
   // Instead of 'image/png', try 'image/webp' for smaller file size
   const croppedUrl = canvas.toDataURL('image/webp', 0.85);
   ```

4. **Lazy-load image before drawing**:
   ```typescript
   const img = new Image();
   img.loading = 'lazy';  // Try lazy loading
   ```

---

## 🔗 INTEGRATION CHECKLIST (For Backend)

To connect crop to backend EditImageJob system:

- [ ] Add `mediaId`, `projectId` to `ProductImageWorkspace` props
- [ ] Pass to `useProductImageEditor(initialImage, mediaId, projectId, ...)`
- [ ] Store in hook state
- [ ] Create `/apis/editImage.ts` with:
  - [ ] `createCropJob(mediaId, projectId, cropCoordinates)`
  - [ ] `getCropJobStatus(jobId)`
  - [ ] `cancelCropJob(jobId)`
- [ ] Modify `applyCrop()` to:
  - [ ] Check if `mediaId` exists
  - [ ] If yes: send to backend + poll
  - [ ] If no: fall back to client-side canvas
- [ ] Add job polling with `useJobPoller`
- [ ] Add error handling (job failed, retry, cancel)
- [ ] Add progress indicator during backend processing

---

## 📚 RELATED DOCUMENTATION

- **useJobPoller hook**: Handles polling logic for background jobs
- **ImageJobRequest**: See `apis/images.ts` for structure
- **EditImageJob model**: See `skyverses-backend/src/models/EditImageJob.ts`
- **FxFlow worker**: Backend uses FxFlow for image processing

---

## 📞 SUPPORT

For issues or questions about the crop feature:

1. **Check CROP_FEATURE_ANALYSIS.md** for complete overview
2. **Check CROP_FEATURE_CODE_REFERENCE.md** for code snippets
3. **Check this file** for debugging & maintenance
4. **Check git history** for recent changes

---

**Last Updated:** 2026-04-13  
**Status:** ✅ Client-side implementation complete, backend infrastructure ready but not integrated
