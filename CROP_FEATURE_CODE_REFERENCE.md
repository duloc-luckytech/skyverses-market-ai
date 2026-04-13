# 📝 CROP FEATURE — CODE REFERENCE GUIDE

Quick copy-paste reference for all crop-related code snippets.

---

## 🔹 STATE INITIALIZATION (`useProductImageEditor.ts`)

```typescript
// Lines 88-92
const [isCropping, setIsCropping] = useState(false);
const [cropRatio, setCropRatio] = useState(0);
const [cropBox, setCropBox] = useState({ x: 10, y: 10, w: 80, h: 80 });
const [dragStart, setDragStart] = useState<{ x: number, y: number, box: typeof cropBox } | null>(null);
const [resizeHandle, setResizeHandle] = useState<string | null>(null);
```

**Return Statement** (Lines 519-532):
```typescript
return {
  isCropping, setIsCropping,
  cropRatio, setCropRatio,
  cropBox, setCropBox,
  applyCrop,
  handleRatioSelect,
  setDragStart,
  setResizeHandle,
  handleMouseDownViewport,
  // ... other exports
};
```

---

## 🔹 `applyCrop()` — THE MAIN FUNCTION

**Full Implementation** (Lines 466-491):

```typescript
const applyCrop = async () => {
  if (!result || !imageRef.current) return;
  setIsGenerating(true);
  setStatus('Đang cắt ảnh...');
  try {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.src = result;
    await new Promise(resolve => img.onload = resolve);
    
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    const realX = (cropBox.x / 100) * img.width;
    const realY = (cropBox.y / 100) * img.height;
    const realW = (cropBox.w / 100) * img.width;
    const realH = (cropBox.h / 100) * img.height;
    
    canvas.width = realW;
    canvas.height = realH;
    
    ctx.drawImage(img, realX, realY, realW, realH, 0, 0, realW, realH);
    const croppedUrl = canvas.toDataURL('image/png');
    
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

**Key Line:**
```typescript
ctx.drawImage(img, realX, realY, realW, realH, 0, 0, realW, realH);
//         source   srcX   srcY   srcW   srcH  dstX dstY dstW dstH
```

---

## 🔹 `handleRatioSelect()` — ASPECT RATIO LOCK

```typescript
const handleRatioSelect = (val: number) => {
  setCropRatio(val);
  if (val > 0) {
    setCropBox(prev => {
      const newW = prev.w;
      const newH = newW / val;
      if (newH > 90) {
        return { ...prev, h: 90, w: 90 * val };
      }
      return { ...prev, h: newH };
    });
  }
};
```

**Usage in EditorViewport:**
```tsx
{ratioPresets.map(r => (
  <button key={r.label} 
    onClick={() => handleRatioSelect(r.value)}
    className={cropRatio === r.value ? 'bg-brand-blue text-white' : '...'}
  >
    {r.label}
  </button>
))}
```

---

## 🔹 CROP BOX DRAG LOGIC

**In `handleMouseMoveGlobal()`** (Lines 350-374):

```typescript
if (dragStart && isCropping) {
  const deltaX = ((e.clientX - dragStart.x) / rect.width) * 100;
  const deltaY = ((e.clientY - dragStart.y) / rect.height) * 100;
  
  setCropBox((prev: typeof cropBox) => {
    let newBox = { ...dragStart.box };
    
    if (!resizeHandle) {
      // DRAG ENTIRE BOX
      newBox.x = Math.max(0, Math.min(dragStart.box.x + deltaX, 100 - dragStart.box.w));
      newBox.y = Math.max(0, Math.min(dragStart.box.y + deltaY, 100 - dragStart.box.h));
    } else {
      // RESIZE FROM HANDLE
      if (resizeHandle.includes('right')) 
        newBox.w = Math.max(5, Math.min(dragStart.box.w + deltaX, 100 - dragStart.box.x));
      
      if (resizeHandle.includes('left')) {
        const move = Math.min(deltaX, dragStart.box.w - 5);
        newBox.x = Math.max(0, dragStart.box.x + move);
        newBox.w = dragStart.box.w - (newBox.x - dragStart.box.x);
      }
      
      if (resizeHandle.includes('bottom')) 
        newBox.h = Math.max(5, Math.min(dragStart.box.h + deltaY, 100 - dragStart.box.y));
      
      if (resizeHandle.includes('top')) {
        const move = Math.min(deltaY, dragStart.box.h - 5);
        newBox.y = Math.max(0, dragStart.box.y + move);
        newBox.h = dragStart.box.h - (newBox.y - dragStart.box.y);
      }
    }
    
    return newBox;
  });
}
```

---

## 🔹 CROP UI IN EditorViewport.tsx

### Control Bar (Lines 60-81)

```tsx
{isCropping && (
  <motion.div 
    initial={{ opacity: 0, y: -20 }} 
    animate={{ opacity: 1, y: 0 }} 
    exit={{ opacity: 0, y: -20 }} 
    className="absolute top-20 left-1/2 -translate-x-1/2 z-[100]"
  >
    {/* Ratio Presets */}
    <div className="bg-white/95 dark:bg-[#14151a]/95 rounded-xl p-1 flex gap-0.5">
      {ratioPresets.map(r => (
        <button 
          key={r.label} 
          onClick={() => handleRatioSelect(r.value)}
          className={`px-4 py-2 text-[10px] font-bold uppercase rounded-lg transition-all 
            ${cropRatio === r.value 
              ? 'bg-brand-blue text-white shadow-md' 
              : 'text-slate-400 hover:bg-slate-100 dark:hover:bg-white/5'}`}
        >
          {r.label}
        </button>
      ))}
    </div>

    {/* Dimensions & Buttons */}
    <div className="bg-white/95 dark:bg-[#14151a]/95 rounded-xl p-2.5 flex gap-6">
      <span className="text-[12px] font-bold">
        {imageRef.current ? Math.round((cropBox.w / 100) * imageRef.current.naturalWidth) : 0} × 
        {imageRef.current ? Math.round((cropBox.h / 100) * imageRef.current.naturalHeight) : 0}
      </span>
      
      <button 
        onClick={applyCrop}
        className="bg-brand-blue text-white px-5 py-2 rounded-lg"
      >
        <Check size={14} /> Xác nhận cắt
      </button>
      
      <button 
        onClick={() => setIsCropping(false)}
        className="bg-slate-100 dark:bg-white/10 px-5 py-2 rounded-lg"
      >
        <X size={14} /> Hủy bỏ
      </button>
    </div>
  </motion.div>
)}
```

### Overlay with Handles (Lines 114-127)

```tsx
{isCropping && (
  <motion.div 
    initial={{ opacity: 0 }} 
    animate={{ opacity: 1 }} 
    exit={{ opacity: 0 }} 
    className="absolute inset-0 z-50"
  >
    {/* Darkened outer area */}
    <div 
      className="absolute inset-0 bg-black/50" 
      style={{ 
        clipPath: `polygon(
          0% 0%, 0% 100%, 
          ${cropBox.x}% 100%, ${cropBox.x}% ${cropBox.y}%, 
          ${cropBox.x + cropBox.w}% ${cropBox.y}%, 
          ${cropBox.x + cropBox.w}% ${cropBox.y + cropBox.h}%, 
          ${cropBox.x}% ${cropBox.y + cropBox.h}%, 
          ${cropBox.x}% 100%, 
          100% 100%, 100% 0%
        )` 
      }} 
    />

    {/* Crop box */}
    <div 
      style={{ 
        left: `${cropBox.x}%`, 
        top: `${cropBox.y}%`, 
        width: `${cropBox.w}%`, 
        height: `${cropBox.h}%` 
      }}
      className="absolute cursor-move border border-brand-blue"
      onMouseDown={(e) => {
        e.stopPropagation();
        setDragStart({ x: e.clientX, y: e.clientY, box: { ...cropBox } });
      }}
    >
      {/* Top-left corner */}
      <div 
        className="absolute -top-1.5 -left-1.5 w-3 h-3 bg-white border border-brand-blue rounded-sm cursor-nw-resize"
        onMouseDown={(e) => {
          e.stopPropagation();
          setResizeHandle('topleft');
          setDragStart({ x: e.clientX, y: e.clientY, box: { ...cropBox } });
        }}
      />

      {/* Top-right corner */}
      <div 
        className="absolute -top-1.5 -right-1.5 w-3 h-3 bg-white border border-brand-blue rounded-sm cursor-ne-resize"
        onMouseDown={(e) => {
          e.stopPropagation();
          setResizeHandle('topright');
          setDragStart({ x: e.clientX, y: e.clientY, box: { ...cropBox } });
        }}
      />

      {/* Bottom-left corner */}
      <div 
        className="absolute -bottom-1.5 -left-1.5 w-3 h-3 bg-white border border-brand-blue rounded-sm cursor-sw-resize"
        onMouseDown={(e) => {
          e.stopPropagation();
          setResizeHandle('bottomleft');
          setDragStart({ x: e.clientX, y: e.clientY, box: { ...cropBox } });
        }}
      />

      {/* Bottom-right corner */}
      <div 
        className="absolute -bottom-1.5 -right-1.5 w-3 h-3 bg-white border border-brand-blue rounded-sm cursor-se-resize"
        onMouseDown={(e) => {
          e.stopPropagation();
          setResizeHandle('bottomright');
          setDragStart({ x: e.clientX, y: e.clientY, box: { ...cropBox } });
        }}
      />
    </div>
  </motion.div>
)}
```

---

## 🔹 CROP BUTTON IN EditorHeader.tsx

**Line 105:**

```tsx
<ToolIcon 
  active={isCropping}
  onClick={() => setIsCropping(!isCropping)}
  icon={<Crop size={15} />}
  tooltip="Cắt ảnh"
  disabled={isActionsDisabled}
/>
```

---

## 🔹 RATIO PRESETS (ProductImageWorkspace.tsx)

**Lines 22-29:**

```typescript
const RATIO_PRESETS = [
  { label: 'Free', value: 0 },           // Free form
  { label: '1:1', value: 1 },            // Square
  { label: '16:9', value: 16 / 9 },      // Landscape
  { label: '9:16', value: 9 / 16 },      // Portrait
  { label: '4:3', value: 4 / 3 },        // Classic
  { label: '3:4', value: 3 / 4 },        // Classic portrait
];

// Pass to EditorViewport:
<EditorViewport
  ratioPresets={RATIO_PRESETS}
  cropRatio={e.cropRatio}
  handleRatioSelect={e.handleRatioSelect}
  // ...
/>
```

---

## 🔹 BACKEND MODELS & ROUTES

### EditImageJob Model (Backend)

```typescript
interface IEditImageJob extends Document {
  userId?: ObjectId;
  owner?: string;
  mediaId: string;
  projectId: string;
  editType: "crop" | "draw";
  
  cropCoordinates?: {
    top: number;
    left: number;
    right: number;
    bottom: number;
  };
  
  status: EditImageJobStatus;  // pending | processing | done | error | cancelled
  progress?: { percent: number; step?: string };
  error?: { message: string; raw?: any };
  
  result?: {
    mediaId?: string;
    resultUrl?: string;
  };
}
```

### Backend Routes (if integrating)

```typescript
// POST /edit-image-jobs
POST { mediaId, projectId, editType: "crop", cropCoordinates: { top, left, right, bottom } }
→ Returns: { jobId, status, owner }

// GET /edit-image-jobs/:id
→ Returns: { jobId, status, editType, result, error, progress }

// POST /edit-image-jobs/:id/cancel
→ Returns: { success: true }
```

---

## 🔹 COORDINATE CONVERSION FORMULAS

**Percentage to Pixels:**
```typescript
const realX = (cropBox.x / 100) * img.width;
const realY = (cropBox.y / 100) * img.height;
const realW = (cropBox.w / 100) * img.width;
const realH = (cropBox.h / 100) * img.height;
```

**Pixels to Percentage:**
```typescript
const percentX = (pixelX / containerWidth) * 100;
const percentY = (pixelY / containerHeight) * 100;
const percentW = (pixelW / containerWidth) * 100;
const percentH = (pixelH / containerHeight) * 100;
```

**Mouse Delta to Percentage:**
```typescript
const deltaX = ((e.clientX - startX) / containerRect.width) * 100;
const deltaY = ((e.clientY - startY) / containerRect.height) * 100;
```

---

## 🔹 HISTORY RECORD CREATED

When crop is applied, this is added to history:

```typescript
{
  id: Date.now().toString(),
  url: croppedUrl,                    // data URL from canvas.toDataURL()
  prompt: 'Crop Edit',
  timestamp: new Date().toLocaleTimeString()
}
```

Stored in:
```typescript
const [history, setHistory] = useState<GenerationRecord[]>([]);
```

Visible in right sidebar with thumbnail.

---

## ✅ TESTING CHECKLIST

- [ ] Click crop button → overlay appears
- [ ] Drag crop box → coordinates update
- [ ] Resize from corners → box resizes
- [ ] Select 1:1 ratio → height recalculates
- [ ] Select free ratio → can move freely
- [ ] Dimensions display updates in real-time
- [ ] Click confirm → canvas API executes
- [ ] Cropped image appears in viewport
- [ ] New entry added to history rail
- [ ] Cancel button closes crop mode without applying
- [ ] Status message shows "Cắt ảnh thành công"
- [ ] Can undo to get original image back

---

**Generated:** 2026-04-13
