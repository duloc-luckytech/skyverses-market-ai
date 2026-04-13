# 🖼️ LOCAL IMAGE UPLOAD FLOW — CHI TIẾT HOÀN CHỈNH

## 📋 TỔNG QUAN

Luồng upload ảnh local trong dự án này được chia thành **3 bước chính**:

1. **FE: Upload file local** → Server (base64)
2. **Server: Upload to GOMMO** → Get imageUrl
3. **Server: Defer to FXFlow Worker** → Get mediaId from Google

---

## 🔍 CÂU HỎI ĐÃ TRẢ LỜI

### 1️⃣ Có tạo job và poll upload media không?

**ĐÁP ÁN: CÓ** — Nhưng không phải traditional polling. Thay vào đó:
- **Frontend**: Sau khi upload, FE **không poll**. Thay vào đó, backend tạo một **ImageOwnerModel record** với `status = "pending-fxflow-upload"`
- **Backend**: Có một **FXFlow Worker** (external service) chạy background, **định kỳ poll** backend để lấy tasks: `GET /fxflow/image/upload-tasks?owner=<name>`
- **Async Callback**: Khi FXFlow xong, nó gọi `POST /image/upload-result` để report kết quả (mediaId)

**Nhấn mạnh**: Đây là **push-based model** cho FE (fire-and-forget), không phải pull-based.

### 2️⃣ Có get upload media ID không?

**ĐÁP ÁN: CÓ** — Có **3 loại ID** được trả về:

| ID | Mô tả | Khi nào có |
|---|---|---|
| **imageId** / **_id** | MongoDB ObjectId của ImageOwnerModel record | **Ngay sau** upload (sync) |
| **imageUrl** | CDN URL từ GOMMO | **Ngay sau** upload (sync) |
| **mediaId** | Google Generative AI media ID (FXLab) | **Sau** FXFlow worker xử lý (async) |

---

## 🔄 FLOW UPLOAD LOCAL IMAGE — CHI TIẾT TỪNG BƯỚC

### **STEP 1: Frontend — Select File & Call Upload API**

**File**: `pages/ImageLibraryPage.tsx` (dòng 125-146)

```typescript
// 📍 ImageLibraryPage.tsx - Lines 125-146
const handleGCSUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
  const file = e.target.files?.[0];
  if (!file) return;

  setIsUploading(true);
  try {
    const metadata = await uploadToGCS(file);  // ← Call storage service
    // Store in IndexedDB...
    setAssets(prev => [{ ...metadata, url: metadata.url }, ...prev]);
    setIsUploading(false);
  } catch (error) {
    console.error("Uplink failed:", error);
    setIsUploading(false);
  }
};
```

### **STEP 2: Frontend — Convert File to Base64 & Call mediaApi.uploadImage()**

**File**: `services/storage.ts` (dòng 24-60)

```typescript
// 📍 services/storage.ts - Lines 24-60
export const uploadToGCS = async (file: File, source: string = 'gommo'): Promise<GCSAssetMetadata> => {
  // Convert File to Base64
  const base64 = await new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = error => reject(error);
  });

  // Extract raw base64 data (remove prefix)
  const base64Data = base64.split(',')[1];

  // Call API
  const response = await mediaApi.uploadImage({
    base64: base64Data,
    fileName: file.name,
    size: file.size,
    source  // "gommo" or "fxlab"
  });

  // Return metadata with imageId, imageUrl, mediaId
  return {
    id: response.imageId || response._id,
    url: response.imageUrl,
    mediaId: response.mediaId,
    // ... other fields
  };
};
```

### **STEP 3: Backend — POST /media/image-upload (Authenticated)**

**File**: `skyverses-backend/src/routes/uploadMedia.ts` (dòng 1187-1323)

**Endpoint**: `POST /media/image-upload`

**Request Body**:
```json
{
  "base64": "iVBORw0KGgo...",
  "fileName": "my_image.png",
  "size": 245678,
  "source": "gommo",
  "aspectRatio": "IMAGE_ASPECT_RATIO_LANDSCAPE"
}
```

**Handler Flow**:

#### ✅ Step 3.1: Create ImageOwnerModel Record (Async marker)

```typescript
// 📍 uploadMedia.ts - Lines 1215-1221
const imageRecord = await ImageOwnerModel.create({
  userId,
  source,
  type: "image",
  originalName: fileName,
  status: "processing-upload",  // ← Mark as in-progress
});
```

#### ✅ Step 3.2: Upload to GOMMO CDN (Synchronous)

```typescript
// 📍 uploadMedia.ts - Lines 1231-1261
const body = new URLSearchParams({
  access_token: process.env.GOMMO_API_KEY,
  domain: "aivideoauto.com",
  data: base64,
  project_id: "default",
  file_name: fileName,
  size: String(size),
}).toString();

const response = await axios.post(
  "https://api.gommo.net/ai/image-upload",
  body,
  { timeout: 120_000, headers: {...} }
);

imageUrl = response.data.imageInfo.url;  // ← GET IMAGE URL IMMEDIATELY
width = response.data.imageInfo.width;
height = response.data.imageInfo.height;
```

#### ✅ Step 3.3: Assign to FXFlow Worker (Deferred to Background Job)

```typescript
// 📍 uploadMedia.ts - Lines 1268-1299
imageRecord.imageUrl = imageUrl;
imageRecord.width = width || undefined;
imageRecord.height = height || undefined;

// Pick a random active fxflow owner
const activeOwners = await FxflowOwner.find({
  status: "active"
}).lean();

if (activeOwners.length > 0) {
  const randomOwner = activeOwners[Math.floor(Math.random() * activeOwners.length)];
  imageRecord.source = randomOwner.name;  // ← Assign worker name
}

imageRecord.status = "pending-fxflow-upload";  // ← Wait for worker
await imageRecord.save();
```

#### ✅ Step 3.4: Return Immediate Response (imageUrl + imageId, NO mediaId yet)

```typescript
// 📍 uploadMedia.ts - Lines 1306-1314
return res.json({
  success: true,
  imageId: imageRecord._id,          // ← Record ID
  imageUrl,                          // ← GOMMO CDN URL ✅
  mediaId: null,                     // ← NOT YET (waiting for FXFlow)
  width,
  height,
  source,
});
```

---

### **STEP 4: FXFlow Worker — Poll for Upload Tasks**

**External Service** (not in codebase, but referenced in comments)

```
Worker Flow (pseudo-code):
1. Poll: GET /fxflow/image/upload-tasks?owner=<worker_name>
   → Returns: ImageOwnerModel records with status="pending-fxflow-upload"

2. For each task:
   a. Load image from imageUrl
   b. Upload to Google Generative AI to get mediaId
   c. Call: POST /image/upload-result
      {
        "id": "<imageId>",
        "status": "done",
        "mediaId": "<google_media_id>"
      }

3. If error:
   Call: POST /image/upload-result
   {
     "id": "<imageId>",
     "status": "error",
     "error": "error message"
   }
```

---

### **STEP 5: Backend — Receive FXFlow Result via Callback**

**File**: `skyverses-backend/src/routes/workerRouter.ts` (dòng 871-919)

**Endpoint**: `POST /image/upload-result` (from FXFlow worker)

**Request Body**:
```json
{
  "id": "507f1f77bcf86cd799439011",
  "status": "done",
  "mediaId": "507f1f77bcf86cd799439012"
}
```

**Handler**:

```typescript
// 📍 workerRouter.ts - Lines 871-919
router.post("/image/upload-result", async (req, res) => {
  const { id, status, mediaId, error } = req.body;

  const record = await ImageOwnerModel.findById(id);
  
  if (status === "done" && mediaId) {
    // ✅ SUCCESS: Update record with mediaId
    record.status = "done";
    record.mediaId = mediaId;  // ← FINALLY GET mediaId!
    await record.save();
    
    console.log(`✅ Image upload done: ${id} → mediaId=${mediaId}`);
    
    // Chain to any linked video jobs
    await chainMediaIdToVideoJob(record, mediaId, provider);
    
  } else if (status === "error") {
    // ❌ FAILURE: Retry logic
    const retryCount = (record.retryCount || 0) + 1;
    record.retryCount = retryCount;
    
    if (retryCount >= 3) {
      record.status = "fail";
      record.errorMessage = error || "Upload failed after 3 retries";
      await failLinkedVideoJob(record, error, provider);
    } else {
      record.status = "pending-fxflow-upload";  // ← Retry
      record.errorMessage = error;
    }
    
    await record.save();
  }
  
  return res.json({ success: true });
});
```

---

### **STEP 6: Frontend — Fetch Updated Media List**

**File**: `components/ImageLibraryModal.tsx` (dòng 187-219)

```typescript
// 📍 ImageLibraryModal.tsx - Lines 187-219
const fetchMedia = useCallback(async (pageNum: number, append = false) => {
  const res = await mediaApi.getMediaList({
    page: pageNum,
    limit: ITEMS_PER_PAGE,
    search: searchQuery,
    source: sourceFilter || undefined,
    maxAge: 1,  // ⏰ Only fetch images from last 1 hour
  });

  if (res && res.data) {
    setAssets(res.data);  // ← Now includes mediaId if done!
    setTotal(res.total || 0);
  }
}, [searchQuery, sourceFilter]);
```

**Endpoint**: `GET /upload-media/list` (Backend)

```typescript
// 📍 uploadMedia.ts - Lines 200-271
router.get("/upload-media/list", authenticate, async (req: any, res) => {
  const userId = req?.user?.userId;
  const page = Math.max(parseInt(req.query.page) || 1, 1);
  const limit = Math.min(parseInt(req.query.limit) || 20, 100);
  const skip = (page - 1) * limit;

  const search = req.query.search?.toString().trim() || "";
  const source = req.query.source?.toString().trim();
  
  // Optional: maxAge filter (in hours)
  const maxAge = parseFloat(req.query.maxAge as string);
  if (maxAge > 0) {
    const cutoff = new Date(Date.now() - maxAge * 60 * 60 * 1000);
    filter.createdAt = { $gte: cutoff };
  }

  const total = await ImageOwnerModel.countDocuments(filter);
  const imageRecords = await ImageOwnerModel.find(filter)
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit)
    .lean();

  return res.json({
    total,
    page,
    limit,
    data: imageRecords.map((item) => ({
      _id: item._id,
      mediaId: item.mediaId || null,  // ← Now populated!
      width: item.width || null,
      height: item.height || null,
      createdAt: item.createdAt,
      imageUrl: item.imageUrl || null,
      status: item.status || "done",
      originalName: item.originalName || null,
      source: item.source || null,
    })),
  });
});
```

---

## 📊 STATUS TRANSITIONS DIAGRAM

```
┌─────────────────────────────────────────────────────────────────┐
│                   IMAGE UPLOAD LIFECYCLE                        │
└─────────────────────────────────────────────────────────────────┘

FrontEnd:        Backend:                    FXFlow Worker:
  ▼                ▼                              ▼
  │               │                              │
  │ POST base64   │                              │
  ├──────────────►│                              │
  │               │ Create Record               │
  │               │ status="processing-upload"  │
  │               │                              │
  │               │ Upload to GOMMO             │
  │               │ Get imageUrl ✅             │
  │               │                              │
  │               │ Change status               │
  │               │ status="pending-fxflow-upload"
  │               │                              │
  │◄──────────────┤ Response (imageUrl, imageId)
  │               │                              │
  │               │ DB: Waiting...              │
  │               │                              │
  │               │        Poll GET /tasks      │
  │               │◄─────────────────────────────┤
  │               │ Return records              │
  │               │──────────────────────────────►
  │               │                              │
  │               │                  Upload to Google
  │               │                  Get mediaId ✅
  │               │                              │
  │               │        POST /result         │
  │               │◄─────────────────────────────┤
  │               │ Update mediaId, status="done"
  │               │                              │
  │ GET /list     │                              │
  ├──────────────►│                              │
  │ Response      │                              │
  │ (mediaId) ✅  │                              │
  │◄──────────────┤                              │
  ▼               ▼                              ▼
```

---

## 🎯 KEY STATISTICS

| Component | File | Lines | Purpose |
|---|---|---|---|
| **FE Upload Handler** | `pages/ImageLibraryPage.tsx` | 125-146 | Trigger file upload |
| **Storage Service** | `services/storage.ts` | 24-60 | Convert base64 & call API |
| **Media API Upload** | `apis/media.ts` | 53-70 | POST to /media/image-upload |
| **Backend Upload Endpoint** | `uploadMedia.ts` | 1187-1323 | Create record, upload to GOMMO, defer to FXFlow |
| **ImageOwnerModel Record** | Created @ Line 1215 | Step 3.1 | Tracks upload lifecycle |
| **FXFlow Status Update** | `workerRouter.ts` | 871-919 | Receive mediaId from worker |
| **Fetch Media List** | `ImageLibraryModal.tsx` | 187-219 | Poll for updated list |
| **Media List Endpoint** | `uploadMedia.ts` | 200-271 | Return records with mediaId |

---

## 💡 IMPORTANT NOTES

### ⚠️ No Traditional Job + Poll from FE

Unlike other image generation flows (which use `useJobPoller` hook), the upload flow **does NOT use polling from FE**.

**Why?**
- GOMMO CDN upload is **synchronous** (instant imageUrl)
- Google media upload is **async** (requires FXFlow worker)
- FE doesn't need to wait for mediaId immediately
- mediaId is only needed later when creating video/project

**Pattern**:
```
FE: Fire → Get imageUrl immediately → Done ✅
Backend: Async worker polls → Get mediaId → Update DB
FE: Later → Fetch updated list → Get mediaId if needed
```

### ✅ Three ID Levels

| When | ID | Status |
|---|---|---|
| After FE upload | `imageId` (_id) | ✅ Immediate |
| After GOMMO CDN | `imageUrl` | ✅ Immediate |
| After FXFlow | `mediaId` | ⏳ Async (seconds/minutes) |

### 🔄 Retry Logic

- FXFlow worker can retry up to **3 times** (Line 897 in workerRouter.ts)
- After 3 failures, record status = `"fail"`
- Failed uploads won't be used in video generation

---

## 🔗 RELATED ENDPOINTS

### Media Management

- `POST /media/image-upload` — Upload local image (base64)
- `GET /upload-media/list` — List uploaded images with mediaId
- `GET /upload-media/detail?id=<recordId>` — Get single image details
- `DELETE /upload-media/delete/:id` — Delete uploaded image
- `POST /image/upload-result` — FXFlow worker callback (updates mediaId)

---

## 🎬 NEXT STEPS FOR DEVELOPERS

If you need to **use mediaId**:

1. **Get imageId** from upload response immediately
2. **Store in state** or IndexedDB locally
3. **Poll list** endpoint every 2-5 seconds OR wait for async notification
4. **Check if mediaId is populated** when needed
5. **Use mediaId** for video creation, editing, or generation jobs

---

**Last Updated**: April 2026
**Backend Version**: FXFlow Worker Model (async callback-based)
**Frontend Version**: IndexedDB + MediaList Polling
