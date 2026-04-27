# 🎯 CROP FEATURE CODEBASE ANALYSIS
## Skyverses Market AI — ProductImageEditor

---

## 📋 EXECUTIVE SUMMARY

The crop feature in ProductImageEditor is **currently implemented as pure client-side canvas manipulation** with NO backend integration. The system:
- ✅ Renders a crop box overlay on the viewport
- ✅ Allows users to drag/resize the crop box
- ✅ Uses native Canvas API to extract cropped pixels
- ✅ Converts result to data URL and adds to history
- ❌ Does NOT send the crop job to a backend API
- ❌ Does NOT integrate with EditImageJob service
- ⚠️ **Ready for backend integration** — the backend infrastructure exists but is unused

---

## 1️⃣ HOOK: `useProductImageEditor.ts`

**Location:** `/hooks/useProductImageEditor.ts`

### **Crop State Variables** (Lines 88-92)

```typescript
const [isCropping, setIsCropping] = useState(false);        // Toggle crop mode on/off
const [cropRatio, setCropRatio] = useState(0);              // Selected ratio (0=free, 1=1:1, 1.78=16:9, etc.)
const [cropBox, setCropBox] = useState({ 
  x: 10, y: 10, w: 80, h: 80                               // Crop box in % (x, y, width, height)
});
const [dragStart, setDragStart] = useState<...>(null);      // Drag state for box/handle movement
const [resizeHandle, setResizeHandle] = useState<string | null>(null); // Which corner/edge is being dragged
```

### **Crop Box Structure**
```typescript
cropBox: {
  x: number,    // left position (0-100%)
  y: number,    // top position (0-100%)
  w: number,    // width (0-100%)
  h: number     // height (0-100%)
}
```

### **`handleRatioSelect()` Function** (Lines 436-448)

```typescript
const handleRatioSelect = (val: number) => {
  setCropRatio(val);
  if (val > 0) {
    setCropBox(prev => {
      const newW = prev.w;
      const newH = newW / val;  // ← Calculate height based on width/ratio
      if (newH > 90) {
        // If too tall, constrain height and recalculate width
        return { ...prev, h: 90, w: 90 * val };
      }
      return { ...prev, h: newH };
    });
  }
};
```

**What it does:**
- Stores the selected ratio (e.g., 1.78 for 16:9)
- Recalculates crop box height/width to maintain aspect ratio
- Caps height at 90% to keep box visible

### **`applyCrop()` Function** (Lines 466-491) ⭐ **MAIN CROP LOGIC**

```typescript
const applyCrop = async () => {
  if (!result || !imageRef.current) return;
  setIsGenerating(true);
  setStatus('Đang cắt ảnh...');
  
  try {
    // 1️⃣ Load image with CORS enabled
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.src = result;
    await new Promise(resolve => img.onload = resolve);
    
    // 2️⃣ Create canvas
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    // 3️⃣ Convert % coordinates to actual pixels
    const realX = (cropBox.x / 100) * img.width;
    const realY = (cropBox.y / 100) * img.height;
    const realW = (cropBox.w / 100) * img.width;
    const realH = (cropBox.h / 100) * img.height;
    
    // 4️⃣ Set canvas size to crop area
    canvas.width = realW;
    canvas.height = realH;
    
    // 5️⃣ Draw cropped portion onto canvas
    ctx.drawImage(
      img,
      realX, realY, realW, realH,  // Source: crop coordinates from original
      0, 0, realW, realH            // Destination: fill entire canvas
    );
    
    // 6️⃣ Convert canvas to data URL
    const croppedUrl = canvas.toDataURL('image/png');
    
    // 7️⃣ Add to history and update UI
    pushToHistory(croppedUrl);
    setIsCropping(false);
    setStatus('Cắt ảnh thành công');
    setHistory(prev => [{
      id: Date.now().toString(),
      url: croppedUrl,
      prompt: 'Crop Edit',
      timestamp: new Date().toLocaleTimeString()
    }, ...prev]);
    
  } catch (err) {
    setStatus('Lỗi cắt ảnh');
  } finally {
    setIsGenerating(false);
  }
};
```

**Key Points:**
- ✅ Uses HTML5 Canvas API (`ctx.drawImage`)
- ✅ Converts percentage coordinates to actual pixels
- ✅ Outputs as data URL (PNG, no server call)
- ❌ NO API integration
- ❌ NO mediaId/projectId used
- ❌ NO job ID returned

### **Crop Interaction Handlers** (Lines 319-414)

**handleMouseMoveGlobal** (for dragging crop box):
```typescript
if (dragStart && isCropping) {
  const deltaX = ((e.clientX - dragStart.x) / rect.width) * 100;
  const deltaY = ((e.clientY - dragStart.y) / rect.height) * 100;
  setCropBox((prev: typeof cropBox) => {
    let newBox = { ...dragStart.box };
    if (!resizeHandle) {
      // Move entire box
      newBox.x = Math.max(0, Math.min(dragStart.box.x + deltaX, 100 - dragStart.box.w));
      newBox.y = Math.max(0, Math.min(dragStart.box.y + deltaY, 100 - dragStart.box.h));
    } else {
      // Resize from corner/edge
      if (resizeHandle.includes('right')) newBox.w += deltaX;
      if (resizeHandle.includes('left')) { /* adjust x and w */ }
      if (resizeHandle.includes('bottom')) newBox.h += deltaY;
      if (resizeHandle.includes('top')) { /* adjust y and h */ }
    }
    return newBox;
  });
}
```

**Exports:**
```typescript
return {
  isCropping, setIsCropping,
  cropRatio, setCropRatio,
  cropBox, setCropBox,
  applyCrop,
  handleRatioSelect,
  setDragStart, setResizeHandle,  // ← For EditorViewport
  // ... other exports
};
```

---

## 2️⃣ COMPONENT: `EditorViewport.tsx`

**Location:** `/components/product-image/EditorViewport.tsx`

### **Crop UI Rendering** (Lines 59-81 + 114-127)

**Crop Control Bar** (above viewport):
```tsx
{isCropping && (
  <motion.div className="absolute top-20 left-1/2 -translate-x-1/2 z-[100]">
    {/* Ratio preset buttons */}
    {ratioPresets.map(r => (
      <button key={r.label} 
        onClick={() => handleRatioSelect(r.value)}
        className={cropRatio === r.value ? 'bg-brand-blue text-white' : '...'}
      >
        {r.label}  {/* Free, 1:1, 16:9, 9:16, 4:3, 3:4 */}
      </button>
    ))}
    
    {/* Dimensions display */}
    <span>
      {imageRef.current ? Math.round((cropBox.w / 100) * imageRef.current.naturalWidth) : 0} × 
      {imageRef.current ? Math.round((cropBox.h / 100) * imageRef.current.naturalHeight) : 0}
    </span>
    
    {/* Confirm/Cancel buttons */}
    <button onClick={applyCrop}>Xác nhận cắt</button>  {/* Call applyCrop() */}
    <button onClick={() => setIsCropping(false)}>Hủy bỏ</button>
  </motion.div>
)}
```

**Crop Overlay** (on image, Lines 114-127):
```tsx
{isCropping && (
  <motion.div className="absolute inset-0 z-50">
    {/* Darkened area outside crop box */}
    <div className="absolute inset-0 bg-black/50" 
      style={{ clipPath: `polygon(...)` }}  // Inverse clip to darken outer area
    />
    
    {/* Crop box with handles */}
    <div style={{ 
      left: `${cropBox.x}%`, 
      top: `${cropBox.y}%`, 
      width: `${cropBox.w}%`, 
      height: `${cropBox.h}%` 
    }}>
      {/* Border */}
      <div className="border border-brand-blue"
        onMouseDown={(e) => { 
          setDragStart({ x: e.clientX, y: e.clientY, box: { ...cropBox } });
        }}
      />
      
      {/* 4 Corner handles + 4 Edge handles */}
      <div className="absolute -top-1.5 -left-1.5 w-3 h-3 bg-white border border-brand-blue cursor-nw-resize"
        onMouseDown={(e) => {
          e.stopPropagation();
          setResizeHandle('topleft');
          setDragStart({ x: e.clientX, y: e.clientY, box: { ...cropBox } });
        }}
      />
      {/* ... topright, bottomleft, bottomright handles */}
    </div>
  </motion.div>
)}
```

### **Props Passed to EditorViewport**
```typescript
<EditorViewport
  isCropping={e.isCropping}
  setIsCropping={e.setIsCropping}
  cropBox={e.cropBox}
  setDragStart={e.setDragStart}
  setResizeHandle={e.setResizeHandle}
  applyCrop={e.applyCrop}
  cropRatio={e.cropRatio}
  handleRatioSelect={e.handleRatioSelect}
  ratioPresets={RATIO_PRESETS}
  // ... other props
/>
```

---

## 3️⃣ COMPONENT: `EditorHeader.tsx`

**Location:** `/components/product-image/EditorHeader.tsx`

### **Crop Button** (Line 105)

```tsx
<ToolIcon 
  active={isCropping}                          // Button highlights when crop mode active
  onClick={() => setIsCropping(!isCropping)}   // Toggle crop mode on/off
  icon={<Crop size={15} />}
  tooltip="Cắt ảnh"
  disabled={isActionsDisabled}                 // Disabled if no image loaded
/>
```

**Disabled when:**
- `isActionsDisabled={!e.result}` — No image loaded
- During generation or other operations

---

## 4️⃣ APIS DIRECTORY STRUCTURE

**Location:** `/apis/`

### **images.ts** ✅ Exists for generation

```typescript
export interface ImageJobRequest {
  type: "text_to_image" | "image_to_image";
  input: { prompt: string; images?: string[]; mask?: string; };
  config: { width, height, aspectRatio, seed, style };
  engine: { provider: "gommo" | "fxlab"; model: string; };
  enginePayload: { prompt, privacy, projectId, editImage?, mode? };
}

export const imagesApi = {
  createJob: (payload) => POST /image-jobs,
  getJobStatus: (jobId) => GET /image-jobs/:id,
  getJobs: (params) => GET /image-jobs,
}
```

### **media.ts** ✅ For image uploads

```typescript
export const mediaApi = {
  uploadImage: (base64) => POST /media/image-upload,
  getMediaList: (params) => GET /upload-media/list,
  deleteMedia: (id) => DELETE /upload-media/delete/:id,
}
```

### **⚠️ NO edit-image API in frontend**

There is NO API file for edit-image operations in the frontend `/apis/` directory.

---

## 5️⃣ BACKEND: `editImageJobs.ts`

**Location:** `/skyverses-backend/src/routes/editImageJobs.ts`

### **Backend Infrastructure EXISTS** ✅

```typescript
// POST /edit-image-jobs — Create edit job
router.post("/", async (req, res) => {
  const { mediaId, projectId, editType, cropCoordinates, drawPayload } = req.body;
  
  // Validate
  if (!mediaId || !projectId || !editType) return 400;
  if (!["crop", "draw"].includes(editType)) return 400;
  if (editType === "crop" && !cropCoordinates) return 400;
  
  // Pick FxFlow worker
  const userId = req.user?.userId || null;
  const owner = await getOrAssignOwnerForUser(userId, "fxflow");
  
  // Create job
  const job = await EditImageJob.create({
    userId,
    owner,
    mediaId,
    projectId,
    editType,
    cropCoordinates,
    drawPayload,
    status: EditImageJobStatus.PENDING,
  });
  
  return res.json({
    success: true,
    data: { jobId: job._id, status: job.status, owner }
  });
});

// GET /edit-image-jobs/:id — Poll status
router.get("/:id", async (req, res) => {
  const job = await EditImageJob.findById(req.params.id);
  return res.json({
    success: true,
    data: { jobId, status, editType, result, error, progress }
  });
});

// POST /edit-image-jobs/:id/cancel — Cancel job
router.post("/:id/cancel", authenticate, async (req, res) => {
  job.status = EditImageJobStatus.CANCELLED;
  await job.save();
  return res.json({ success: true });
});
```

### **EditImageJob Model** ✅

```typescript
interface IEditImageJob extends Document {
  // WHO
  userId?: ObjectId;     // Optional (desktop app may skip)
  owner?: string;        // FxFlow worker

  // EDIT PARAMS
  mediaId: string;       // Original image ID
  projectId: string;     // Google AI project ID
  editType: "crop" | "draw";

  // CROP DATA
  cropCoordinates?: {
    top: number;
    left: number;
    right: number;
    bottom: number;
  };

  // DRAW DATA
  drawPayload?: any;

  // STATUS
  status: EditImageJobStatus;  // "pending" | "processing" | "done" | "error" | "cancelled"
  progress?: { percent: number; step?: string };
  error?: { message: string; raw?: any };

  // RESULT
  result?: {
    mediaId?: string;          // Edited image media ID
    resultUrl?: string;        // Public result URL
  };

  engineResponse?: any;        // Raw response from FxFlow
  createdAt: Date;
  updatedAt: Date;
}
```

---

## 6️⃣ WHERE mediaId/projectId COME FROM

### **productImageWorkspace.tsx Context**

Looking at `ProductImageWorkspace.tsx` (Lines 31-48):
```typescript
interface ProductImageWorkspaceProps {
  isOpen: boolean;
  onClose: () => void;
  initialImage?: string | null;        // ← Image passed in (data URL or URL)
  onApply?: (editedUrl: string) => void; // ← Callback with edited result
}

const e = useProductImageEditor(initialImage, theme);  // ← No mediaId/projectId passed!
```

**Problem:** ❌ mediaId and projectId are **NOT provided** to the editor hook.

**Current Flow:**
1. `ProductImageWorkspace` receives `initialImage` (a data URL or image URL)
2. Passes to `useProductImageEditor(initialImage, ...)`
3. Hook has NO way to know what `mediaId` or `projectId` is
4. `applyCrop()` function ignores both entirely
5. No backend job is created

---

## 7️⃣ COMPLETE FLOW DIAGRAM

### **Current Client-Side Flow (Active) ✅**

```
User clicks Crop button
    ↓
setIsCropping(true)
    ↓
EditorViewport renders:
  - Crop overlay with handles
  - Ratio preset buttons
  - Confirm/Cancel buttons
    ↓
User drags/resizes crop box (handleMouseMoveGlobal)
    ↓
dragStart + resizeHandle update cropBox state
    ↓
User clicks "Xác nhận cắt"
    ↓
applyCrop() called:
  1. Load image from result (data URL)
  2. Create Canvas element
  3. Calculate pixel coordinates from % (cropBox.x/y/w/h)
  4. ctx.drawImage(source, srcX, srcY, srcW, srcH, 0, 0, dstW, dstH)
  5. canvas.toDataURL('image/png')
  6. pushToHistory(croppedUrl)
  7. setIsCropping(false)
    ↓
setResult(croppedUrl)  ← New cropped image shown in viewport
    ↓
Added to history rail on right side
```

### **Potential Backend Flow (Inactive) ❌**

```
[Would require frontend API call]
    ↓
applyCrop() sends to POST /edit-image-jobs:
  {
    mediaId: "??",  ← Not available
    projectId: "??", ← Not available
    editType: "crop",
    cropCoordinates: {
      top: cropBox.y,
      left: cropBox.x,
      right: cropBox.x + cropBox.w,
      bottom: cropBox.y + cropBox.h
    }
  }
    ↓
Backend creates EditImageJob(PENDING)
    ↓
FxFlow worker picks up job
    ↓
Worker processes crop via external API
    ↓
Returns resultUrl
    ↓
Frontend polls GET /edit-image-jobs/:id until done
    ↓
Update result with resultUrl
```

---

## 8️⃣ SUMMARY TABLE

| Aspect | Status | Details |
|--------|--------|---------|
| **Crop State Management** | ✅ Complete | `isCropping`, `cropBox`, `cropRatio`, `dragStart`, `resizeHandle` |
| **Crop UI Rendering** | ✅ Complete | EditorViewport renders overlay + handles + presets |
| **Crop Button** | ✅ Complete | Toggle in EditorHeader |
| **applyCrop() Function** | ✅ Complete | Uses Canvas API to crop, outputs data URL |
| **Ratio Selection** | ✅ Complete | `handleRatioSelect()` updates crop box aspect ratio |
| **Drag/Resize Logic** | ✅ Complete | `handleMouseMoveGlobal()` + `setDragStart` + `setResizeHandle` |
| **Backend API File** | ❌ Missing | No frontend `/apis/editImage.ts` |
| **Backend Route** | ✅ Exists | `skyverses-backend/src/routes/editImageJobs.ts` |
| **Backend Model** | ✅ Exists | `EditImageJob` with crop/draw support |
| **MediaId Source** | ❌ Missing | Not provided to ProductImageWorkspace |
| **ProjectId Source** | ❌ Missing | Not provided to ProductImageWorkspace |
| **Backend Integration** | ❌ NOT USED | applyCrop() does client-side only |

---

## 9️⃣ KEY INSIGHTS

1. **applyCrop() is 100% client-side:**
   - Uses native Canvas API (`ctx.drawImage`)
   - No network calls
   - No job tracking
   - No backend integration

2. **Backend infrastructure is ready but unused:**
   - Route exists: `POST /edit-image-jobs`
   - Model exists: `EditImageJob`
   - Worker system exists: FxFlow integration
   - But frontend never calls it

3. **CropBox structure is percentage-based:**
   - x, y, w, h all in 0-100%
   - Converted to pixels in applyCrop()
   - No fractional pixels concerns

4. **ProductImageWorkspace has no mediaId/projectId context:**
   - Takes `initialImage` (data URL) only
   - No metadata about image origin
   - Would need parent component to pass these

5. **History system is working:**
   - Each crop creates a record: `{ id, url, prompt: 'Crop Edit', timestamp }`
   - Stored in hook state
   - Visible in right sidebar

---

## 🔟 NEXT STEPS (For Backend Integration)

If you want to integrate the backend:

1. **Add mediaId/projectId context:**
   - Pass to `ProductImageWorkspace` props
   - Pass to `useProductImageEditor(initialImage, mediaId, projectId)`
   - Store in hook state

2. **Create `/apis/editImage.ts`:**
   ```typescript
   export const editImageApi = {
     createCropJob: (mediaId, projectId, cropCoordinates) => 
       POST /edit-image-jobs,
     getCropJobStatus: (jobId) => 
       GET /edit-image-jobs/:id,
     cancelCropJob: (jobId) => 
       POST /edit-image-jobs/:id/cancel,
   };
   ```

3. **Modify applyCrop():**
   - Call `editImageApi.createCropJob()` with backend params
   - Poll `editImageApi.getCropJobStatus()` until done
   - Use `result.resultUrl` instead of data URL

4. **Handle offline mode:**
   - If no mediaId/projectId, fall back to client-side crop
   - Or show error "Image must be uploaded first"

---

**Generated:** 2026-04-13  
**Codebase:** `/Users/duloc/Desktop/SKYVERSES/ai-skyverses/skyverses-market-ai`

