# 🎬 CROP FEATURE DOCUMENTATION

Complete analysis of the ProductImageEditor crop feature implementation.

## 📚 Documentation Files

This folder contains comprehensive documentation about the crop feature:

### 1. **CROP_FEATURE_ANALYSIS.md** (17 KB) — START HERE 🚀
   - **Executive summary** of how crop currently works
   - **5 main sections:**
     1. Hook (`useProductImageEditor.ts`) — state, applyCrop(), handlers
     2. Viewport (`EditorViewport.tsx`) — UI rendering, crop overlay
     3. Header (`EditorHeader.tsx`) — crop button
     4. APIs — current vs. backend infrastructure
     5. Backend routes & models
   - **Complete flow diagram** (client-side)
   - **Summary table** showing what's implemented vs. what's missing
   - **Key insights** about architecture decisions
   - **Next steps** for backend integration

### 2. **CROP_FEATURE_CODE_REFERENCE.md** (12 KB) — CODE SNIPPETS
   - Quick copy-paste reference for all crop-related code
   - Organized by function/component
   - Includes:
     - State initialization
     - `applyCrop()` full implementation
     - `handleRatioSelect()` logic
     - Crop box drag/resize logic
     - Crop UI components (control bar + overlay + handles)
     - Ratio presets
     - Backend model structure
     - Coordinate conversion formulas
   - Testing checklist

### 3. **CROP_IMPLEMENTATION_ROADMAP.md** (11 KB) — MAINTENANCE & DEBUGGING
   - Data flow diagram (current client-side)
   - State machine explanation
   - File locations & responsibilities table
   - **Debugging guide** with common problems:
     - Crop box won't move → solutions
     - Crop doesn't apply → solutions
     - Handles won't resize → solutions
     - Ratio lock fails → solutions
   - Enhancement ideas (grid, keyboard shortcuts, touch, templates, backend)
   - Maintenance checklist (testing, browsers, CORS, performance)
   - Performance tips
   - Backend integration checklist

---

## 🎯 QUICK FACTS

| Aspect | Answer |
|--------|--------|
| **Implementation Type** | 100% client-side HTML5 Canvas |
| **Crop Box Format** | Percentage-based: `{ x, y, w, h }` (0-100%) |
| **Main Function** | `applyCrop()` in `useProductImageEditor.ts` (line 466) |
| **UI Components** | `EditorViewport.tsx` (overlay) + `EditorHeader.tsx` (button) |
| **API Integration** | ❌ NOT USED (backend exists but frontend doesn't call it) |
| **Backend Routes** | ✅ `POST /edit-image-jobs`, `GET /edit-image-jobs/:id` |
| **History Tracking** | ✅ Each crop added to `history` array |
| **Undo/Redo** | ✅ Works through `undoRedoState` stack |
| **Ratio Presets** | Free, 1:1, 16:9, 9:16, 4:3, 3:4 |
| **Canvas API Used** | `ctx.drawImage(source, srcX, srcY, srcW, srcH, 0, 0, dstW, dstH)` |
| **Output Format** | PNG data URL |

---

## 🔍 KEY DISCOVERIES

### ✅ What's Implemented
- **State management** — Crop box, ratio, drag/resize tracking
- **UI components** — Overlay, handles, control bar
- **Aspect ratio lock** — Drag/resize respects ratio
- **Canvas extraction** — Client-side pixel processing
- **History integration** — Crops added to history rail
- **Undo/redo** — Works through history stack

### ❌ What's Missing
- **Frontend API** — No `/apis/editImage.ts` file
- **Backend integration** — applyCrop() never calls API
- **MediaId/ProjectId** — Not passed to ProductImageWorkspace
- **Job tracking** — No jobId returned from crop
- **Worker processing** — FxFlow workers unused

### ⚠️ Backend Infrastructure Ready
- **Routes exist** — `POST /edit-image-jobs`, `GET /edit-image-jobs/:id`
- **Model exists** — `EditImageJob` with crop/draw support
- **FxFlow integration** — Ready to process async
- **Just needs** — Frontend to start calling it

---

## 🚀 USAGE

### For **understanding the crop feature:**
1. Read: `CROP_FEATURE_ANALYSIS.md`
2. Reference: `CROP_FEATURE_CODE_REFERENCE.md`

### For **debugging issues:**
1. Check: `CROP_IMPLEMENTATION_ROADMAP.md` → Debugging Guide
2. Add console logs to functions mentioned
3. Verify state in React DevTools

### For **implementing backend integration:**
1. Read: `CROP_IMPLEMENTATION_ROADMAP.md` → Integration Checklist
2. Follow the 4-step process
3. Reference: Backend routes in Analysis doc

### For **adding features (grid, keyboard, touch):**
1. Check: `CROP_IMPLEMENTATION_ROADMAP.md` → Enhancement Ideas
2. Copy code snippets
3. Adapt to your needs

---

## 📝 READING GUIDE

### If you have 5 minutes:
Read the **Executive Summary** in `CROP_FEATURE_ANALYSIS.md`

### If you have 15 minutes:
Read entire `CROP_FEATURE_ANALYSIS.md` sections 1-3

### If you have 30 minutes:
Read all of `CROP_FEATURE_ANALYSIS.md` + skim `CROP_FEATURE_CODE_REFERENCE.md`

### If you need to debug:
Go straight to `CROP_IMPLEMENTATION_ROADMAP.md` → Debugging Guide

### If you need to integrate backend:
Follow `CROP_IMPLEMENTATION_ROADMAP.md` → Integration Checklist

---

## 🔗 RELATED FILES IN CODEBASE

| File | Purpose |
|------|---------|
| `hooks/useProductImageEditor.ts` | Crop state & logic (lines 88-92, 436-448, 466-491) |
| `components/product-image/EditorViewport.tsx` | Crop UI (lines 59-127) |
| `components/product-image/EditorHeader.tsx` | Crop button (line 105) |
| `ProductImageWorkspace.tsx` | Workspace container + RATIO_PRESETS |
| `skyverses-backend/src/routes/editImageJobs.ts` | Backend route (NOT USED) |
| `skyverses-backend/src/models/EditImageJob.ts` | Mongoose model (NOT USED) |
| `apis/images.ts` | Image generation API (model for future editImage.ts) |
| `apis/media.ts` | Media upload API |

---

## 🐛 COMMON ISSUES & QUICK FIXES

| Issue | Quick Fix |
|-------|-----------|
| Crop box won't move | Check `containerRef` attached to DOM |
| Can't resize handles | Check `resizeHandle` state in DevTools |
| Ratio lock doesn't work | Verify `handleRatioSelect()` called with ratio > 0 |
| Crop doesn't apply | Check image loaded with `img.onerror` callback |
| Undo doesn't work | Verify `pushToHistory()` called after crop |
| CORS errors | Add `img.crossOrigin = "anonymous"` (already done) |

---

## 📊 STATE STRUCTURE

```typescript
// In useProductImageEditor hook
const [isCropping, setIsCropping] = useState(false);
const [cropBox, setCropBox] = useState({ 
  x: 10,      // left position (0-100%)
  y: 10,      // top position (0-100%)
  w: 80,      // width (0-100%)
  h: 80       // height (0-100%)
});
const [cropRatio, setCropRatio] = useState(0);          // 0=free, 1=1:1, 1.78=16:9, etc.
const [dragStart, setDragStart] = useState(null);       // { x, y, box }
const [resizeHandle, setResizeHandle] = useState(null); // "topleft"|"topright"|etc
```

---

## 🎨 CROP UI STRUCTURE

```
EditorViewport
  ├─ Crop Control Bar (if isCropping)
  │  ├─ Ratio preset buttons (Free, 1:1, 16:9, ...)
  │  ├─ Dimensions display (1024 × 768)
  │  ├─ Confirm button → applyCrop()
  │  └─ Cancel button → setIsCropping(false)
  │
  └─ Crop Overlay (if isCropping)
     ├─ Dark background (black/50%)
     ├─ Crop box (blue border)
     └─ 8 corner/edge handles (draggable)
```

---

## 📈 FUTURE IMPROVEMENTS

1. **Grid overlay** — Rule-of-thirds grid during crop
2. **Keyboard shortcuts** — Enter to confirm, Esc to cancel
3. **Touch support** — Pinch to resize crop box
4. **Presets** — Quick buttons for profile/banner/thumbnail crops
5. **Backend integration** — Async processing via FxFlow
6. **Crop history** — Save/load crop presets
7. **Rotation** — Allow image rotation before crop
8. **Format options** — Choose output format (PNG/WEBP/JPG)

---

## ✅ VERIFICATION

Generated files:
- ✅ `CROP_FEATURE_ANALYSIS.md` (17 KB)
- ✅ `CROP_FEATURE_CODE_REFERENCE.md` (12 KB)
- ✅ `CROP_IMPLEMENTATION_ROADMAP.md` (11 KB)
- ✅ `CROP_README.md` (this file)

All documentation is **current as of 2026-04-13**.

---

## 📞 HOW TO USE THIS DOCUMENTATION

**Step 1:** Open `CROP_FEATURE_ANALYSIS.md` for the big picture  
**Step 2:** Jump to specific section based on your need (hook, component, API, etc.)  
**Step 3:** Use `CROP_FEATURE_CODE_REFERENCE.md` to copy code snippets  
**Step 4:** Use `CROP_IMPLEMENTATION_ROADMAP.md` for debugging or extending  

---

**Last Updated:** April 13, 2026  
**Documentation Scope:** Crop feature in ProductImageEditor  
**Implementation Status:** ✅ Client-side complete | ⏳ Backend ready but not integrated
