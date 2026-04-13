# IMAGE UPLOAD JOB/POLL FLOW — COMPLETE ARCHITECTURE

**Last Updated:** April 13, 2026  
**Status:** Production Ready  
**Scope:** Local image upload → Server polling → Library management

---

## 📋 TABLE OF CONTENTS

1. [Frontend Flow](#frontend-flow)
2. [Backend API Routes](#backend-api-routes)
3. [Models & Data Structures](#models--data-structures)
4. [Polling Mechanism](#polling-mechanism)
5. [File Locations](#file-locations)
6. [Data Flow Diagram](#data-flow-diagram)

---

## 🎯 FRONTEND FLOW

### Entry Point: `ImageLibraryModal.tsx` (lines 148-863)

**Component Responsibilities:**
- Display user's image library (paginated list)
- Handle local file upload via drag-drop or file picker
- Display image selection UI
- Fetch media list with filters (search, source, sort)
- Delete images in bulk or individual

**Key States:**
```typescript
const [assets, setAssets] = useState<any[]>([]);           // Current page images
const [total, setTotal] = useState(0);                      // Total count
const [page, setPage] = useState(1);                        // Pagination
const [isLoading, setIsLoading] = useState(false);          // Initial load
const [isLoadingMore, setIsLoadingMore] = useState(false);  // Infinite scroll
const [selectedAssets, setSelectedAssets] = useState<GCSAssetMetadata[]>([]);
const [isBulkMode, setIsBulkMode] = useState(false);        // Bulk delete mode
```

### Upload Flow (lines 367-386)

**Step 1: User Selects File**
```typescript
const handleGCSUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
  const file = e.target.files?.[0];
  if (!file) return;
  await processUpload(file);
  if (e.target) e.target.value = '';
};
```

**Step 2: Upload to GCS via Service** (lines 367-379)
```typescript
const processUpload = async (file: File) => {
  setIsUploading(true);
  setErrorMessage(null);
  try {
    await uploadToGCS(file);           // ← Service call (services/storage.ts)
    await fetchMedia(1);                // ← Refresh library
    showToast('Tải ảnh thành công', 'success');
  } catch (error: any) {
    setErrorMessage(error.message || 'Lỗi tải ảnh lên máy chủ');
  } finally {
    setIsUploading(false);
  }
};
```

### Service: `uploadToGCS()` in `services/storage.ts` (lines 24-60)

**Purpose:** Convert local file → Base64 → Call backend API

```typescript
export const uploadToGCS = async (file: File, source: string = 'gommo'): Promise<GCSAssetMetadata> => {
  // 1️⃣ Convert File to Base64
  const base64 = await new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = error => reject(error);
  });

  const base64Data = base64.split(',')[1];  // Remove "data:image/png;base64," prefix

  // 2️⃣ Call Backend API: POST /media/image-upload
  const response = await mediaApi.uploadImage({
    base64: base64Data,
    fileName: file.name,
    size: file.size,
    source // "gommo" or "fxlab"
  });

  if (!response.success || !response.imageUrl) {
    throw new Error(response.message || 'Server rejected the upload');
  }

  // 3️⃣ Map response to GCSAssetMetadata
  return {
    id: response.imageId || response._id || `gcs-${Math.random()...}`,
    url: response.imageUrl,                    // CDN URL from GOMMO
    mediaId: response.mediaId,                 // For FXLab specific use
    gcsPath: response.imageUrl,
    bucket: 'skyverses-production-vault',
    name: response.fileName || file.name,
    size: (file.size / 1024 / 1024).toFixed(2) + ' MB',
    type: file.type,
    blob: file,
    timestamp: new Date().toISOString()
  };
};
```

### API Call: `mediaApi.uploadImage()` in `apis/media.ts` (lines 54-70)

**HTTP Request:**
```typescript
export interface ImageUploadRequest {
  base64: string;           // Raw base64 data (NO prefix)
  fileName: string;
  size: number;
  source?: string;          // "gommo" | "fxlab"
  aspectRatio?: string;     // "IMAGE_ASPECT_RATIO_LANDSCAPE" | ...
}

export interface ImageUploadResponse {
  success: boolean;
  _id?: string;             // Record ID for library tracking
  imageId?: string;         // Same as _id
  imageUrl?: string;        // CDN URL from GOMMO
  fileName?: string;
  mediaId?: string;         // FXLab-specific mediaId
  width?: number;
  height?: number;
  source?: string;          // Returned source
  message?: string;
  raw?: any;
}

const uploadImage = async (payload: ImageUploadRequest): Promise<ImageUploadResponse> => {
  const response = await fetch(`${API_BASE_URL}/media/image-upload`, {
    method: 'POST',
    headers: getHeaders(),
    body: JSON.stringify(payload),
  });
  return await response.json();
};
```

### Fetch Media List: `mediaApi.getMediaList()` (lines 76-100)

**HTTP Request:**
```typescript
export interface MediaListParams {
  page?: number;
  limit?: number;
  search?: string;
  source?: string;          // Filter by "gommo" | "fxlab" | etc
  maxAge?: number;          // Hours - only fetch images from last N hours
}

const getMediaList = async (params: MediaListParams): Promise<MediaListResponse> => {
  const query = new URLSearchParams({
    page: String(params.page || 1),
    limit: String(params.limit || 20),
    search: params.search || '',
    ...(params.source ? { source: params.source } : {}),
    ...(params.maxAge ? { maxAge: String(params.maxAge) } : {})
  });

  const response = await fetch(`${API_BASE_URL}/upload-media/list?${query}`, {
    method: 'GET',
    headers: getHeaders(),
  });
  
  return await response.json();
};
```

---

## 🖥️ BACKEND API ROUTES

### File: `skyverses-backend/src/routes/uploadMedia.ts`

#### Route 1: POST `/media/image-upload` (lines 1187-1323)

**Purpose:** Accept base64 image, upload to GOMMO CDN, create ImageOwner record, defer Google upload to FXFlow

**Key Steps:**

1. **Validate Input**
   - Check authentication
   - Validate base64, fileName, size

2. **Create ImageOwner Record** (Early)
   ```typescript
   const imageRecord = await ImageOwnerModel.create({
     userId,
     source,
     type: "image",
     originalName: fileName,
     status: "processing-upload",
   });
   ```

3. **Upload to GOMMO CDN** (Always)
   ```typescript
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
     { headers: { "Content-Type": "application/x-www-form-urlencoded" } }
   );

   // Response: { imageInfo: { url, width, height } }
   imageUrl = response.data.imageInfo.url;
   ```

4. **Assign FXFlow Owner** (For Google upload task)
   ```typescript
   const activeOwners = await FxflowOwner.find({
     status: "active"
   }).lean();

   if (activeOwners.length > 0) {
     const randomOwner = activeOwners[Math.floor(Math.random() * activeOwners.length)];
     imageRecord.source = randomOwner.name;  // e.g., "fxflow-worker-1"
   }
   ```

5. **Defer to FXFlow Worker**
   ```typescript
   imageRecord.status = "pending-fxflow-upload";
   imageRecord.imageUrl = imageUrl;
   imageRecord.width = width;
   imageRecord.height = height;
   await imageRecord.save();
   ```

6. **Response**
   ```json
   {
     "success": true,
     "imageId": "<record._id>",
     "imageUrl": "https://cdn.example.com/image.png",
     "mediaId": null,
     "width": 1024,
     "height": 1024,
     "source": "fxflow-worker-1"
   }
   ```

#### Route 2: GET `/upload-media/list` (lines 200-271)

**Purpose:** Fetch user's image library with pagination, search, filtering

**Query Parameters:**
- `page` (default: 1)
- `limit` (default: 20, max: 100)
- `search` - Regex search on `originalName`
- `source` - Filter by provider (gommo, fxlab, fxflow, etc)
- `maxAge` - Only return images created in last N hours

**Database Query:**
```typescript
const filter: any = { userId };

if (search) {
  filter.originalName = { $regex: search, $options: "i" };
}

if (source) {
  filter.source = source;
}

if (maxAge > 0) {
  const cutoff = new Date(Date.now() - maxAge * 60 * 60 * 1000);
  filter.createdAt = { $gte: cutoff };
}

const imageRecords = await ImageOwnerModel.find(filter)
  .sort({ createdAt: -1 })
  .skip((page - 1) * limit)
  .limit(limit)
  .lean();
```

**Response:**
```json
{
  "total": 42,
  "page": 1,
  "limit": 20,
  "data": [
    {
      "_id": "61234567890abcdef1234567",
      "mediaId": "media-123456789",
      "width": 1024,
      "height": 1024,
      "createdAt": "2026-04-13T12:30:00Z",
      "imageUrl": "https://cdn.example.com/image.png",
      "status": "done",
      "aspectRatio": null,
      "originalName": "character_01.png",
      "source": "gommo"
    }
  ]
}
```

#### Route 3: GET `/upload-media/detail` (lines 313-335)

**Purpose:** Get single image record details by `id`

**Response:**
```json
{
  "_id": "61234567890abcdef1234567",
  "mediaId": "media-123456789",
  "width": 1024,
  "height": 1024,
  "imageUrl": "https://cdn.example.com/image.png",
  "status": "done",
  "aspectRatio": null,
  "originalName": "character_01.png",
  "createdAt": "2026-04-13T12:30:00Z"
}
```

#### Route 4: DELETE `/upload-media/delete/:id` (lines 439-486)

**Purpose:** Delete single image by ID

**Validation:**
- Check ownership (userId match)
- Check record exists

**Cleanup:**
- Delete ImageOwnerModel record
- Delete ImageBase64Model record
- Delete preview file from disk

**Response:**
```json
{
  "success": true,
  "id": "61234567890abcdef1234567",
  "message": "Đã xoá ảnh thành công"
}
```

---

## 📊 MODELS & DATA STRUCTURES

### ImageOwnerModel (Backend - MongoDB)

**Collection: `imageowners`**

```typescript
interface IImageOwner {
  _id: ObjectId;
  userId: ObjectId;              // User who uploaded
  
  // 📸 Image Metadata
  originalName: string | null;   // Original filename
  imageUrl: string | null;       // CDN URL (GOMMO)
  mediaId: string | null;        // FXLab mediaId for Gemini API
  width: number | null;
  height: number | null;
  
  // 🏷️ Classification
  source: string | null;         // "gommo" | "fxlab" | "fxflow" | "grok"
  type: string;                  // "image" | "ai-generated" | "prompt-image" | "edit-image"
  status: string;                // "processing-upload" | "pending-fxflow-upload" | "done" | "failed"
  
  // 📝 Optional Fields
  prompt?: string;               // For AI-generated images
  groupId?: string;              // For batch operations
  aspectRatio?: string;
  googleEmail?: string;          // Associated Google account
  
  // Timestamps
  createdAt: Date;
  updatedAt: Date;
}
```

### GCSAssetMetadata (Frontend - TypeScript)

**File: `services/storage.ts` (lines 7-19)**

```typescript
export interface GCSAssetMetadata {
  id: string;                    // imageId from backend
  url: string;                   // CDN URL
  mediaId?: string;              // FXLab-specific ID
  gcsPath: string;               // Same as url
  bucket: string;                // Always 'skyverses-production-vault'
  name: string;                  // Filename
  size: string;                  // "1.23 MB"
  type: string;                  // "image/png"
  blob: Blob;                    // Original File object
  timestamp: string;             // ISO string
  prompt?: string;               // AI metadata
}
```

### ImageUploadResponse (API Response)

**File: `apis/media.ts` (lines 12-24)**

```typescript
export interface ImageUploadResponse {
  success: boolean;
  _id?: string;                  // Record ID
  imageId?: string;              // Same as _id
  imageUrl?: string;             // CDN URL from GOMMO
  fileName?: string;             // Echoed filename
  mediaId?: string;              // FXLab mediaId (null initially)
  width?: number;                // Image dimensions
  height?: number;
  source?: string;               // FXFlow owner name (assigned backend)
  message?: string;              // Error message
  raw?: any;                     // Raw response
}
```

---

## 🔄 POLLING MECHANISM

### Image Generation Job Flow (Not Directly Related to Upload, But Used in useImageGenerator)

**File: `hooks/useJobPoller.ts` (Complete polling core)**

#### Core Polling Loop: `runPollLoop()` (lines 97-156)

```typescript
async function runPollLoop(
  jobId: string,
  apiType: 'image' | 'video',
  intervalMs: number,
  maxDurationMs: number,
  networkRetryMs: number,
  startTime: number,
  tickCountRef: { current: number },
  cancelledRef: React.MutableRefObject<boolean>,
  callbacksRef: React.MutableRefObject<JobPollerCallbacks>,
  scheduleNext: (delayMs: number) => void,
  onFinish: () => void,
): Promise<void> {
  // 1️⃣ Check timeout
  const elapsedMs = Date.now() - startTime;
  if (elapsedMs >= maxDurationMs) {
    onFinish();
    if (callbacksRef.current.onTimeout) {
      callbacksRef.current.onTimeout();
    } else {
      callbacksRef.current.onError('Quá thời gian xử lý. Vui lòng thử lại.');
    }
    return;
  }

  // 2️⃣ Increment tick count
  tickCountRef.current += 1;

  // 3️⃣ Fetch job status
  try {
    const raw = apiType === 'video'
      ? await videosApi.getJobStatus(jobId)
      : await imagesApi.getJobStatus(jobId);

    if (cancelledRef.current) return;

    const { status, result, errorMsg } = parseResponse(raw?.data);

    // 4️⃣ Handle response
    if (status === 'done') {
      onFinish();
      callbacksRef.current.onDone(result);
    } else if (status === 'failed' || status === 'error') {
      onFinish();
      callbacksRef.current.onError(errorMsg);
    } else {
      // Still pending — fire onTick then schedule next
      callbacksRef.current.onTick?.({
        tickCount: tickCountRef.current,
        elapsedMs: Date.now() - startTime,
      });
      scheduleNext(intervalMs);  // Schedule next poll
    }
  } catch {
    // Network error — retry later without calling onError yet
    if (cancelledRef.current) return;
    scheduleNext(networkRetryMs);  // Retry with longer delay
  }
}
```

#### Hook: `useJobPoller()` (lines 174-271)

**Usage:**
```typescript
const poller = useJobPoller({
  onDone: (result) => setImageUrl(result.images?.[0] ?? null),
  onError: (msg) => { addCredits(cost); setError(msg); },
  onTick: ({ tickCount, elapsedMs }) => setProgress(...),
}, { apiType: 'image', intervalMs: 5000 });

poller.startPolling(jobId);  // Start polling
```

#### Utility: `pollJobOnce()` (lines 290-345)

**For parallel polling multiple jobs:**
```typescript
export async function pollJobOnce(options: PollJobOptions): Promise<void> {
  const { jobId, isCancelledRef, apiType, intervalMs, ... } = options;
  
  // Returns a Promise that resolves when job is done/error
  // Caller uses isCancelledRef.current = true to cancel
}
```

**Usage in `useImageGenerator` (lines 257-290):**
```typescript
const pollImageJobStatus = (jobId: string, resultId: string, cost: number) => {
  addLogToTask(resultId, `[POLLING] Requesting status update...`);
  
  pollJobOnce({
    jobId,
    isCancelledRef,
    apiType: 'image',
    intervalMs: 5000,
    networkRetryMs: 10000,
    onDone: (result) => {
      const imageUrl = result.images?.[0] ?? null;
      addLogToTask(resultId, `[SUCCESS] Synthesis complete.`);
      setResults(prev => prev.map(r => 
        r.id === resultId ? { ...r, url: imageUrl, status: 'done' } : r
      ));
      refreshUserInfo();
      fetchServerResults(1, true);
    },
    onError: (errorMsg) => {
      addLogToTask(resultId, `[ERROR] ${errorMsg}`);
      if (usagePreference === 'credits') {
        // Auto-refund credits if error
      }
    },
    onTick: ({ tickCount }) => {
      addLogToTask(resultId, `[STATUS] Pipeline state: SYNTHESIZING (tick ${tickCount})`);
    },
  });
};
```

### Image Job Status Endpoint: `imagesApi.getJobStatus()` (apis/images.ts)

**HTTP GET:** `/image-jobs/:jobId`

**Response Structure:**
```typescript
interface ImageJobResponse {
  success?: boolean;
  status?: string;
  data: {
    status: "pending" | "processing" | "done" | "failed" | "error";
    jobId: string;
    result?: {
      images: string[];
      thumbnail: string;
      imageId: string;
      width?: number;
      height?: number;
    };
  };
  message?: string;
}
```

---

## 📁 FILE LOCATIONS

### Frontend Files

| File | Purpose | Lines |
|------|---------|-------|
| `components/ImageLibraryModal.tsx` | Main library UI component | 1-893 |
| `services/storage.ts` | Upload service (File → Base64 → API) | 1-75 |
| `apis/media.ts` | API client for media operations | 1-139 |
| `hooks/useImageGenerator.ts` | Image generation state & polling | 1-465 |
| `hooks/useJobPoller.ts` | Shared polling core | 1-346 |
| `types.ts` | Shared types (basic) | 1-102 |

### Backend Files

| File | Purpose | Lines |
|------|---------|-------|
| `skyverses-backend/src/routes/uploadMedia.ts` | Upload, list, delete routes | 1-1437 |
| `skyverses-backend/src/routes/imageJobs.ts` | Image generation job routes | 1-559 |
| `skyverses-backend/src/models/ImageJob.ts` | ImageJob schema | 1-220 |
| `skyverses-backend/src/models/ImageOwnerModel.ts` | ImageOwner schema (for library) | N/A |
| `skyverses-backend/src/models/ImageBase64Model.ts` | Base64 storage | N/A |

---

## 🎭 DATA FLOW DIAGRAM

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                         FRONTEND (React)                                     │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                               │
│  User selects file in ImageLibraryModal                                       │
│    ↓                                                                          │
│  handleGCSUpload() → processUpload(file)                                     │
│    ↓                                                                          │
│  uploadToGCS(file) [services/storage.ts]                                     │
│    │                                                                          │
│    ├─→ FileReader.readAsDataURL(file)                                       │
│    │   Extract base64 from data URL                                          │
│    │                                                                          │
│    └─→ mediaApi.uploadImage({base64, fileName, size, source})               │
│        [POST] /media/image-upload                                            │
│            ↓                                                                  │
│        Backend processes upload                                              │
│            ↓                                                                  │
│        Response: {success, imageId, imageUrl, mediaId, source}              │
│    ↓                                                                          │
│  Map response → GCSAssetMetadata                                             │
│    ↓                                                                          │
│  Return metadata to component                                                │
│    ↓                                                                          │
│  fetchMedia(1) — Refresh library                                             │
│    ↓                                                                          │
│  mediaApi.getMediaList({page, limit, search, source, maxAge})              │
│  [GET] /upload-media/list                                                   │
│    ↓                                                                          │
│  Display updated library                                                     │
│                                                                               │
└─────────────────────────────────────────────────────────────────────────────┘
        ↓                                    ↑
        │                                    │
        └────────────────────────────────────┘
                    HTTP Boundary


┌─────────────────────────────────────────────────────────────────────────────┐
│                         BACKEND (Node.js)                                    │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                               │
│  [1] POST /media/image-upload                                               │
│    ├─ Validate input (base64, fileName, size)                               │
│    ├─ Create ImageOwner record                                              │
│    │   {userId, source, type: "image", status: "processing-upload"}        │
│    │                                                                         │
│    ├─ Upload to GOMMO CDN                                                  │
│    │   POST https://api.gommo.net/ai/image-upload                          │
│    │   Response: {imageInfo: {url, width, height}}                          │
│    │                                                                         │
│    ├─ Assign FXFlow owner (from FxflowOwner collection)                    │
│    │   imageRecord.source = randomOwner.name                               │
│    │                                                                         │
│    ├─ Update ImageOwner                                                     │
│    │   {status: "pending-fxflow-upload", imageUrl, width, height}          │
│    │                                                                         │
│    └─ Response: {success, imageId, imageUrl, source}                       │
│                                                                               │
│  [ASYNC] FXFlow Worker (separate cron/process)                              │
│    ├─ Query: ImageOwnerModel.find({status: "pending-fxflow-upload"})       │
│    ├─ Upload image to Google (using accessToken)                            │
│    ├─ Get mediaId from Google response                                      │
│    ├─ Update ImageOwner                                                     │
│    │   {status: "done", mediaId}                                            │
│    └─ (Details not in current files)                                        │
│                                                                               │
│  [2] GET /upload-media/list?page=1&limit=20&source=gommo&maxAge=1         │
│    ├─ Filter: {userId, source, createdAt >= cutoff}                        │
│    ├─ Query ImageOwnerModel.find(filter).sort({createdAt: -1})             │
│    └─ Response: {total, page, limit, data: [...]}                          │
│                                                                               │
│  [3] GET /upload-media/detail?id=<recordId>                                │
│    ├─ Query: ImageOwnerModel.findOne({userId, _id})                        │
│    └─ Response: {_id, mediaId, imageUrl, ...}                              │
│                                                                               │
│  [4] DELETE /upload-media/delete/:id                                        │
│    ├─ Verify ownership                                                      │
│    ├─ Delete ImageOwnerModel                                                │
│    ├─ Delete ImageBase64Model                                               │
│    ├─ Delete preview file                                                   │
│    └─ Response: {success, message}                                          │
│                                                                               │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## 🔗 IMAGE GENERATION JOB POLLING (Related to Upload)

When user uses uploaded images as **reference** in image generation:

```
[Frontend] useImageGenerator.handleGenerate()
  ├─ Check references (from uploaded images)
  ├─ Create image job:
  │   POST /image-jobs
  │   {
  │     type: "image_to_image",
  │     input: {
  │       prompt: "...",
  │       images: [<uploaded_image_urls>]
  │     },
  │     engine: {...},
  │     ...
  │   }
  │
  ├─ Response: {success, data: {jobId, status}}
  │
  └─ Start polling: pollJobOnce({
      jobId,
      apiType: 'image',
      intervalMs: 5000,
      maxDurationMs: 180_000,
      onDone: (result) => { setResults(...); fetchServerResults(...); },
      onError: (msg) => { addCredits(cost); },
      onTick: (info) => { addLogToTask(...); }
    })
      ↓
    Poll Loop: GET /image-jobs/:jobId (every 5s)
      ├─ Parse status: pending/processing/done/failed
      ├─ If done: call onDone(result)
      ├─ If failed: call onError(msg)
      ├─ If pending: fire onTick, schedule next poll
      └─ Timeout after 180s
```

---

## 🚀 QUICK SUMMARY

### **Upload Flow (5 Steps)**
1. User selects file in ImageLibraryModal
2. `uploadToGCS()` converts to Base64
3. `mediaApi.uploadImage()` sends to backend
4. Backend uploads to GOMMO CDN, creates ImageOwner record, assigns FXFlow owner
5. Response includes imageUrl and imageId for future reference

### **List Flow (2 Steps)**
1. `mediaApi.getMediaList()` queries backend with filters
2. Backend returns paginated list of user's ImageOwner records

### **Delete Flow (2 Steps)**
1. User clicks delete in bulk or single mode
2. `mediaApi.deleteMedia()` deletes ImageOwner + Base64 + preview

### **Image Generation with References (3 Steps)**
1. User selects uploaded images as references
2. `imagesApi.createJob()` creates job with image URLs
3. `pollJobOnce()` polls job status every 5s until done

---

**END OF DOCUMENT**
