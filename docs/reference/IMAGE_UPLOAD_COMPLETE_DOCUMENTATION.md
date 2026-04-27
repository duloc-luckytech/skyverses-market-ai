# Complete Image Upload and Job Polling Flow - Full Documentation

**Project:** skyverses-market-ai (Skyverses Platform)
**Date:** April 2026
**Status:** Fully documented from source code

---

## Table of Contents

1. [Architecture Overview](#architecture-overview)
2. [Frontend Components](#frontend-components)
3. [API Clients](#api-clients)
4. [Backend Models](#backend-models)
5. [Backend Routes](#backend-routes)
6. [Complete Data Flow](#complete-data-flow)
7. [Polling Mechanism](#polling-mechanism)
8. [Error Handling & Refunds](#error-handling--refunds)
9. [Multi-Provider Routing](#multi-provider-routing)

---

## Architecture Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                     SKYVERSES PLATFORM FLOW                      │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  [User Browser]                                                  │
│      ↓                                                            │
│  [ImageLibraryModal]  ←→  [storage.ts] (FileReader)             │
│      ↓                                                            │
│  [useImageGenerator] ←→ [mediaApi + imagesApi]                  │
│      ↓                                                            │
│  [pollJobOnce]  (every 5s)                                      │
│      ↓                                                            │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │               BACKEND (Node/Express)                    │   │
│  ├─────────────────────────────────────────────────────────┤   │
│  │                                                         │   │
│  │  POST /media/image-upload                             │   │
│  │    ↓                                                   │   │
│  │  ImageOwnerModel + ImageBase64Model                   │   │
│  │    ↓                                                   │   │
│  │  Upload to GOMMO CDN                                  │   │
│  │    ↓                                                   │   │
│  │  Assign FXFlow Owner (random)                         │   │
│  │    ↓                                                   │   │
│  │  Response: {_id, imageUrl, mediaId: null}            │   │
│  │                                                         │   │
│  │  ───────────────────────────────────────────────────  │   │
│  │                                                         │   │
│  │  POST /image-jobs (Image Generation)                  │   │
│  │    ↓                                                   │   │
│  │  Check Free Images / Deduct Credits                   │   │
│  │    ↓                                                   │   │
│  │  Dynamic Provider Routing (gommo → fxflow/grok)       │   │
│  │    ↓                                                   │   │
│  │  Create ImageJob (status: PENDING)                    │   │
│  │    ↓                                                   │   │
│  │  Response: {jobId, status, creditsUsed}              │   │
│  │                                                         │   │
│  │  ───────────────────────────────────────────────────  │   │
│  │                                                         │   │
│  │  GET /image-jobs/:id (Poll Loop)                      │   │
│  │    ↓                                                   │   │
│  │  ImageJob.status: PENDING → PROCESSING → DONE/ERROR  │   │
│  │    ↓                                                   │   │
│  │  Update result with generated images                  │   │
│  │    ↓                                                   │   │
│  │  Auto-save to ImageOwner library                      │   │
│  │                                                         │   │
│  └─────────────────────────────────────────────────────────┘   │
│                                                                  │
│  [External Services]                                             │
│    - GOMMO CDN: https://api.gommo.net/ai/image-upload           │
│    - FXFlow: Background image generation worker                 │
│    - Grok: Alternative image generation provider                │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

---

## Frontend Components

### 1. ImageLibraryModal.tsx (893 lines)

**Location:** `components/ImageLibraryModal.tsx`

**Purpose:** Main UI for displaying user's image library, uploading new images, and managing assets.

**Key States:**
```typescript
const [assets, setAssets] = useState<GCSAssetMetadata[]>([]);
const [total, setTotal] = useState(0);
const [page, setPage] = useState(1);
const [isLoading, setIsLoading] = useState(false);
const [selectedAssets, setSelectedAssets] = useState<GCSAssetMetadata[]>([]);
const [isBulkMode, setIsBulkMode] = useState(false);
```

**Upload Flow:**
```
User selects file
    ↓
handleGCSUpload(files)
    ↓
processUpload(file):
    - Validate type (PNG, JPEG)
    - Validate size (max 5MB)
    - Call uploadToGCS(file, source)
    ↓
uploadToGCS returns GCSAssetMetadata
    ↓
addNewAsset(metadata)
    ↓
fetchMedia(1, currentSource, true)  // CRITICAL: maxAge refresh
    ↓
Asset appears in library UI
```

**Pagination (Infinite Scroll):**
```
Initial Load: page=1, limit=20
    ↓
User scrolls to bottom
    ↓
handleLoadMore()
    ↓
fetchMedia(page+1)
    ↓
setAssets([...prev, ...newAssets])
```

---

### 2. storage.ts (75 lines)

**Location:** `services/storage.ts`

**Purpose:** Convert File to Base64 and upload to GOMMO CDN via mediaApi.

**Interface: GCSAssetMetadata**
```typescript
export interface GCSAssetMetadata {
  id: string;                    // Unique identifier
  url: string;                   // GOMMO CDN URL (imageUrl)
  mediaId: string | null;        // Google mediaId (may be null initially)
  gcsPath: string;               // GCS storage path
  bucket: string;                // GCS bucket name
  name: string;                  // Original filename
  size: number;                  // File size in bytes
  type: string;                  // MIME type
  blob: Blob;                    // Original file blob
  timestamp: number;             // Upload timestamp
}
```

**Upload Process:**
```typescript
uploadToGCS = async (file: File, source = 'gommo'): Promise<GCSAssetMetadata> => {
  1. FileReader.readAsDataURL(file)
  2. Extract base64: dataUrl.split(',')[1]
  3. Call mediaApi.uploadImage({
       base64,                    // WITHOUT data:image/png;base64, prefix
       fileName: file.name,
       size: file.size,
       source,                    // "gommo" or "fxlab"
       aspectRatio: undefined
     })
  4. Extract response fields:
     - id = response._id          // ImageOwner record _id
     - url = response.imageUrl    // GOMMO CDN URL
     - mediaId = response.mediaId // null initially
  5. Return GCSAssetMetadata
}
```

---

## API Clients

### 1. mediaApi (apis/media.ts)

**Endpoint: POST /media/image-upload**
```typescript
interface ImageUploadRequest {
  base64: string;                  // Base64 WITHOUT prefix
  fileName: string;                // Original filename
  size: number;                    // File size
  source?: string;                 // "gommo" | "fxlab"
  aspectRatio?: string;            // e.g., "IMAGE_ASPECT_RATIO_LANDSCAPE"
}

interface ImageUploadResponse {
  success: boolean;
  _id?: string;                    // ImageOwner record ID
  imageId?: string;                // Same as _id
  imageUrl?: string;               // GOMMO CDN URL
  fileName?: string;
  mediaId?: string;                // null initially, updated later
  width?: number;
  height?: number;
  source?: string;                 // FXFlow owner name
  message?: string;
  raw?: any;
}
```

**Endpoint: GET /upload-media/list**
```typescript
interface MediaListParams {
  page?: number;                   // Default: 1
  limit?: number;                  // Default: 20
  search?: string;                 // Search by filename
  source?: string;                 // Filter by source
  maxAge?: number;                 // Hours (refresh after upload)
}

interface MediaListResponse {
  total: number;                   // Total records
  page: number;
  limit: number;
  data: Array<{
    _id: string;                   // ImageOwner._id
    mediaId: string | null;        // Google mediaId
    width: number | null;
    height: number | null;
    createdAt: string;
    imageUrl: string;              // GOMMO CDN URL
    status: string;                // "ready", "processing", etc.
    aspectRatio: string | null;
    originalName: string | null;
    source: string | null;         // FXFlow owner name
  }>;
  error?: string;
}
```

**Endpoint: GET /upload-media/detail**
```
Query: ?id=<recordId>
Response: Full ImageOwner record (minus base64)
```

**Endpoint: DELETE /upload-media/delete/:id**
```
Deletes ImageOwner + ImageBase64 records
Response: {success, id, message}
```

---

### 2. imagesApi (apis/images.ts)

**Endpoint: POST /image-jobs**
```typescript
interface ImageJobRequest {
  type: "text_to_image" | "image_to_image" | ... ;
  input: {
    prompt: string;
    images?: string[];             // URLs for image_to_image
  };
  config: {
    width: number;
    height: number;
    aspectRatio: string;
    seed: number;
    style: string;
  };
  engine: {
    provider: "gommo" | "fxflow" | "grok" | ...;
    model: string;                 // e.g., "google_image_gen_banana_pro"
  };
  enginePayload: {
    prompt: string;
    privacy: "PRIVATE";
    projectId: string;
    mode: "relaxed" | "turbo";
  };
}

// Response
{
  success: boolean;
  data: {
    jobId: string;                 // ImageJob._id
    status: string;                // "PENDING"
    creditsUsed: number;
  };
}
```

**Endpoint: GET /image-jobs/:id**
```
Response: Complete ImageJob document
{
  _id: string;
  status: "PENDING" | "PROCESSING" | "DONE" | "ERROR" | ...;
  result?: {
    images: string[];              // Generated image URLs
    thumbnail: string;
  };
  progress?: {
    percent: number;
    step: string;
  };
  ...
}
```

**Endpoint: GET /image-jobs (List)**
```
Query: ?page=1&limit=20
Response: {data: ImageJob[], pagination: {page, limit, total}}
```

---

## Backend Models

### 1. ImageOwnerModel.ts (59 lines)

**Purpose:** Store metadata for uploaded images with ownership tracking.

**Schema Fields:**
```typescript
{
  userId: ObjectId;                // User who uploaded
  groupId: string;                 // Optional group
  googleEmail: string;             // Google account used
  mediaId: string;                 // Google media ID (null initially)
  type: string;                    // "ai-generated", "user-uploaded", etc.
  source: string;                  // "gommo", "fxlab", etc.
  prompt: string;                  // Associated prompt
  mediaIdEdit: string;             // Edited version ID
  referenceMediaId: [string];       // Related media IDs
  width: number;
  height: number;
  imageUrl: string;                // GOMMO CDN URL ⭐
  originalName: string;
  retryCount: number;
  videoJobId: string;              // Link to video task
  videoJobField: string;           // e.g., "startImage"
  pendingVideoPayload: object;      // Pending video config
  
  status: enum {
    "pending",
    "ready",
    "processing",
    "done",
    "fail",
    "reject",
    "processing-upload",           // During GOMMO upload
    "pending-fxflow-upload"         // Waiting for FXFlow
  };
  
  errorCode: string;
  errorMessage: string;
  createdAt: timestamp;
  updatedAt: timestamp;
}
```

**Status Lifecycle:**
```
POST /media/image-upload
    ↓
Create ImageOwner: status = "processing-upload"
    ↓
Upload to GOMMO CDN (parallel)
    ↓
Update: status = "pending-fxflow-upload"
    ↓
Assign FXFlow owner (background)
    ↓
Update: status = "ready" / "processing"
    ↓
mediaId updated (when Google processes)
    ↓
Final: status = "done"
```

---

### 2. ImageBase64Model.ts (23 lines)

**Purpose:** Store base64 separately to avoid locking ImageOwner queries.

**Schema Fields:**
```typescript
{
  imageId: ObjectId;               // Reference to ImageOwner._id (unique)
  base64: string;                  // Full base64 data (NO prefix)
  createdAt: timestamp;
  updatedAt: timestamp;
}
```

**Why Separate?**
- Base64 can be very large (5MB+ stored as string)
- Queries on ImageOwner would need to skip large fields
- Separation improves query performance
- Base64 rarely needed except for re-upload/edit

---

### 3. ImageJob.ts (220 lines)

**Purpose:** Track async image generation jobs with polling status.

**Schema Fields:**
```typescript
{
  userId: ObjectId;                // User who requested
  type: "TEXT_TO_IMAGE" | "IMAGE_TO_IMAGE" | ...;
  status: enum {
    "PENDING",                     // Job created, waiting
    "PROCESSING",                  // Provider working
    "DONE",                        // Success
    "ERROR",                       // Failed
    "FAILED",                      // Variant of ERROR
    "REJECT",                      // Rejected by provider
    "CANCELLED",                   // User cancelled
    "POLLING",                     // Frontend polling
    "CAPCHA"                       // Requires CAPTCHA (fxlab)
  };
  
  input: {
    prompt: string;
    images: string[];              // For image_to_image
    mask: string;                  // For inpainting
  };
  
  config: {
    width: number;
    height: number;
    aspectRatio: string;
    seed: number;
    style: string;
  };
  
  engine: {
    provider: "GOMMO" | "GEMINI" | "FXLAB" | "FXFLOW" | "GROK" | ...;
    model: string;
  };
  
  enginePayload: object;           // Raw engine-specific config
  finalPayload: object;            // Computed payload
  result: {
    images: string[];              // CDN URLs
    thumbnail: string;
    imageId: string;
    raw: object;
  };
  
  creditsUsed: number;             // Cost charged
  owner: string;                   // FXFlow/Grok owner sticky assignment
  progress: {
    percent: number;
    step: string;
  };
  
  pollStartedAt: timestamp;        // When polling started
  failedEngines: [string];         // Attempted but failed providers
  recaptchaToken: string;          // For fxlab CAPTCHA
  
  createdAt: timestamp;
  updatedAt: timestamp;
}
```

---

## Backend Routes

### 1. POST /media/image-upload (uploadMedia.ts)

**Location:** `skyverses-backend/src/routes/uploadMedia.ts` (lines 1187-1323)

**Request Body:**
```json
{
  "base64": "iVBORw0KGgoAAAANSUhEUgAAAA...",
  "fileName": "test.png",
  "size": 15234,
  "source": "gommo",
  "aspectRatio": undefined
}
```

**Processing Steps:**

```
Step 1: Validate Input
  - Check base64 length
  - Check fileName length
  - Check size ≤ 5MB
  ✅ Return 400 if invalid

Step 2: Create ImageOwner Record
  - Create with userId, fileName, size
  - Set status = "processing-upload"
  - Store in ImageOwnerModel
  ✅ Receive record._id

Step 3: Separate Base64 Storage
  - Create ImageBase64 record
  - Reference imageId = record._id
  - Store full base64 string
  ✅ Optimization: allows fast queries on ImageOwner

Step 4: Upload to GOMMO CDN ⭐
  - axios POST to: https://api.gommo.net/ai/image-upload
  - Body: {base64Data (raw bytes)}
  - Headers: Authorization, Content-Type
  ✅ Receive response: {
      imageUrl: "https://gommo-cdn.../image.png",
      imageId: "gommo-internal-id"
    }

Step 5: Update ImageOwner with GOMMO URL
  - imageUrl = response.imageUrl
  - Set status = "pending-fxflow-upload"

Step 6: Assign FXFlow Owner (Async Background)
  - Query FxflowOwner collection
  - Random selection from active owners
  - Assign to record.source field
  - This ties image to specific FXFlow account for later processing
  
Step 7: Return Response
  ✅ Response: {
       success: true,
       _id: "64abc123def456...",
       imageId: "64abc123def456...",
       imageUrl: "https://gommo-cdn.../image.png",
       fileName: "test.png",
       mediaId: null,                    // Set later
       source: "fxflow-owner-name",
       width: 1024,                      // From GOMMO
       height: 1024
     }
```

**Response Fields Mapping:**
| Field | Source | Purpose |
|-------|--------|---------|
| _id | ImageOwner._id | Record identifier |
| imageId | ImageOwner._id | Duplicate for compatibility |
| imageUrl | GOMMO CDN response | CDN URL for display |
| mediaId | null | Updated later by Google |
| source | FXFlow random assign | Owner tracking |
| width/height | GOMMO response | Image dimensions |

---

### 2. GET /upload-media/list (uploadMedia.ts)

**Location:** Lines 200-271

**Query Parameters:**
```
GET /upload-media/list?page=1&limit=20&search=&source=gommo&maxAge=24
```

**Processing:**

```
Step 1: Build Filter
  - userId = req.user.userId (ownership)
  - if search: add regex pattern on originalName
  - if source: filter by source field
  - if maxAge: filter createdAt > now - hours
    ✅ Critical: maxAge allows refresh after upload

Step 2: Query Database
  - ImageOwnerModel.find(filter)
    .sort({createdAt: -1})
    .skip((page-1)*limit)
    .limit(limit)

Step 3: Aggregate Total
  - ImageOwnerModel.countDocuments(filter)

Step 4: Return Response
  ✅ {
       total: 147,
       page: 1,
       limit: 20,
       data: [{
         _id: "64abc...",
         mediaId: "google-id-or-null",
         width: 1024,
         height: 1024,
         createdAt: "2026-04-13T10:30:00Z",
         imageUrl: "https://gommo-cdn.../image.png",
         status: "ready",
         aspectRatio: null,
         originalName: "test.png",
         source: "fxflow-owner-name"
       }, ...]
     }
```

**Key Feature: maxAge Parameter**
```
After uploadToGCS completes:
  - Response: {id: "64abc...", url: "https://..."}
  - Immediately call: fetchMedia(1, source, true)
  - Pass maxAge: 1 (last 1 hour)
  - Server returns fresh record with imageUrl
  - UI displays immediately
```

---

### 3. POST /image-jobs (imageJobs.ts)

**Location:** Lines 103-247

**Request Body:**
```json
{
  "type": "text_to_image",
  "input": {
    "prompt": "A cinematic cyberpunk dog",
    "images": null
  },
  "config": {
    "width": 1024,
    "height": 1024,
    "aspectRatio": "1:1",
    "seed": 0,
    "style": "cinematic"
  },
  "engine": {
    "provider": "gommo",
    "model": "google_image_gen_banana_pro"
  },
  "enginePayload": {
    "prompt": "A cinematic cyberpunk dog",
    "privacy": "PRIVATE",
    "projectId": "default",
    "mode": "relaxed"
  }
}
```

**Processing Steps:**

```
Step 1: Validate Request
  ✅ Check required fields: type, engine, enginePayload

Step 2: Get User & Check Free Images
  - Load User document
  - if freeImageRemaining > 0:
      → Use free image
      → Decrement counter
      → Create FREE_IMAGE transaction
      → creditCost = 0
  - else:
      → Look up ModelPricingMatrix for engine.model
      → Extract price from pricing[resolution]
      → Check creditBalance ≥ creditCost
      → if insufficient: return 400 INSUFFICIENT_CREDITS
      → Deduct creditBalance
      → Create CONSUME transaction

Step 3: Calculate Final Cost
  - Free image: creditsUsed = 0
  - Paid: creditsUsed = extracted cost

Step 4: Dynamic Provider Routing ⭐ (CRITICAL)
  ┌─ Only if provider="gommo" AND isGoogleImageModel
  │
  ├─ Read SystemSetting:
  │   - fxflow: {enabled: true, routingPercent: 60}
  │   - grok: {enabled: true, routingPercent: 20}
  │
  ├─ Roll dice: random(0-100)
  │   - if roll < 60: → provider = "fxflow"
  │   - else if roll < 80: → provider = "grok"
  │   - else: → keep "gommo"
  │
  └─ Log: 🎲 [IMG] google_image_gen_banana_pro → fxflow

Step 5: Sticky Owner Assignment
  - if provider = "fxflow" or "grok":
      → Call getOrAssignOwnerForUser(userId, provider)
      → Returns or creates sticky assignment
      → Store in job.owner field
  - else: owner = null

Step 6: Create ImageJob
  - ImageJob.create({
      userId,
      type,
      input,
      config,
      engine: finalEngine,
      finalPayload,
      enginePayload,
      status: PENDING,
      creditsUsed,
      owner
    })

Step 7: Return Response
  ✅ {
       success: true,
       data: {
         jobId: "64def789...",
         status: "PENDING",
         creditsUsed: 10
       }
     }
```

**Credit Transaction Logging:**

| Scenario | Type | Amount | Note |
|----------|------|--------|------|
| Free image | FREE_IMAGE | 0 | Remaining count |
| Paid generation | CONSUME | -N | Model: engine.model |
| Job cancelled | REFUND | +N | Refund cancelled job |

---

### 4. GET /image-jobs/:id (imageJobs.ts)

**Location:** Lines 324-342

**Polling Endpoint**

```
Frontend calls repeatedly (every 5 seconds):
  GET /image-jobs/64def789...

Response:
{
  status: "PENDING",              // ← Frontend checks this
  data: {
    status: "PENDING",
    jobId: "64def789...",
    result: {
      images: [],                 // Empty until DONE
      thumbnail: null
    }
  }
}

Status Progression:
PENDING
  → (Provider processes)
  → PROCESSING
  → DONE (with images)
  OR
  → ERROR (with error message)
```

---

### 5. POST /image-jobs/:id/cancel (imageJobs.ts)

**Location:** Lines 369-409

**Refund Logic:**
```
Only cancel if status in [PENDING, POLLING]

if job.creditsUsed > 0:
  - Load User
  - creditBalance += job.creditsUsed
  - Create REFUND transaction
  - Log: 💳 [REFUND] user@email.com +N CR

Return: {success: true, refunded: N}
```

---

### 6. POST /image-jobs/submit-result-image/fxlab

**Location:** Lines 462-525

**Called By:** FXLab worker when image completes

**Request Body:**
```json
{
  "jobId": "64def789...",
  "resultImage": {
    "media": [{
      "image": {
        "generatedImage": {
          "fifeUrl": "https://fife.../image.png",
          "mediaGenerationId": "fxlab-internal-id"
        }
      }
    }]
  }
}
```

**Processing:**
```
Step 1: Find ImageJob
  - ImageJob.findById(jobId)

Step 2: Extract Result
  - images = [data.fifeUrl]
  - thumbnail = data.fifeUrl
  - imageId = data.mediaGenerationId

Step 3: Update Job
  - job.result = {images, thumbnail, imageId, raw: data}
  - job.status = DONE
  - job.progress = {percent: 100, step: "done"}
  - job.save()

Step 4: Auto-Save to Library ⭐
  - Create ImageOwner record:
      {
        userId: job.userId,
        imageUrl: data.fifeUrl,
        mediaId: data.mediaGenerationId,
        type: "ai-generated",
        source: "fxlab",
        prompt: job.enginePayload.prompt,
        originalName: `AI_${jobId.slice(-6)}`,
        status: "done"
      }
  - Result: Image appears in user's library automatically

Step 5: Return Response
  ✅ {
       success: true,
       jobId,
       status: "DONE"
     }
```

---

## Complete Data Flow

### Scenario 1: Upload Image & Generate

```
FRONTEND
┌────────────────────────────────────────────────┐
│ 1. User selects image file (test.png, 2MB)   │
│                                                 │
│ 2. ImageLibraryModal.handleGCSUpload()        │
│    └─ processUpload(file)                      │
│       └─ uploadToGCS(file, "gommo")            │
│          ├─ FileReader.readAsDataURL()        │
│          ├─ Extract base64 (NO prefix)        │
│          └─ mediaApi.uploadImage({             │
│               base64,                          │
│               fileName: "test.png",            │
│               size: 2097152,                   │
│               source: "gommo"                  │
│             })                                 │
│                                                 │
│ 3. BACKEND: POST /media/image-upload          │
│    ├─ Create ImageOwner (status: processing)  │
│    ├─ Create ImageBase64 (store base64)       │
│    ├─ Upload to GOMMO CDN                     │
│    │  axios POST https://api.gommo.net/...    │
│    ├─ Receive imageUrl                        │
│    ├─ Assign FXFlow owner (random)            │
│    └─ Response: {                              │
│         _id: "64abc...",                      │
│         imageUrl: "https://gommo.../img.png", │
│         mediaId: null,                        │
│         source: "fxflow-owner-1"              │
│       }                                        │
│                                                 │
│ 4. FRONTEND: Receive response                 │
│    ├─ setReferences([{                         │
│    │   url: "https://gommo.../img.png",       │
│    │   mediaId: null                          │
│    │ }])                                       │
│    └─ fetchMedia(1, "gommo", true)  ⭐       │
│       └─ Pass maxAge: 1 (last 1 hour)        │
│          └─ Server returns fresh record      │
│             └─ UI displays image             │
│                                                 │
│ 5. User creates prompt & generates             │
│    "Make this image cyberpunk"                │
│                                                 │
│ 6. useImageGenerator.performInference()       │
│    ├─ Build ImageJobRequest:                  │
│    │  {                                        │
│    │    type: "image_to_image",               │
│    │    input: {                               │
│    │      prompt: "Make this image cyberpunk" │
│    │      images: ["https://gommo.../img.png"]│
│    │    },                                    │
│    │    config: {...},                        │
│    │    engine: {                              │
│    │      provider: "gommo",                  │
│    │      model: "google_image_gen_banana"    │
│    │    },                                    │
│    │    enginePayload: {...}                  │
│    │  }                                        │
│    └─ imagesApi.createJob(payload)            │
│                                                 │
│ 7. BACKEND: POST /image-jobs                  │
│    ├─ Check credits (10 CR available)        │
│    ├─ Dynamic routing:                        │
│    │  roll = 45 < 60 → provider = "fxflow"   │
│    ├─ Assign owner: "fxflow-owner-3"         │
│    ├─ Deduct 10 credits                      │
│    ├─ Create CONSUME transaction              │
│    ├─ ImageJob.create({                       │
│    │    userId,                               │
│    │    status: PENDING,                      │
│    │    engine: {provider: "fxflow", ...},   │
│    │    creditsUsed: 10,                      │
│    │    owner: "fxflow-owner-3"               │
│    │  })                                       │
│    └─ Response: {                              │
│         jobId: "64def789...",                 │
│         status: "PENDING",                    │
│         creditsUsed: 10                       │
│       }                                        │
│                                                 │
│ 8. FRONTEND: Receive jobId                    │
│    ├─ Start polling loop:                     │
│    │  pollJobOnce({                           │
│    │    jobId: "64def789...",                 │
│    │    intervalMs: 5000,                     │
│    │    maxDurationMs: 180000,                │
│    │    onDone: (result) => {...},            │
│    │    onError: (msg) => {...},              │
│    │    onTick: (info) => {...}               │
│    │  })                                       │
│    │                                           │
│    └─ Loop:                                    │
│       ├─ Tick 1: GET /image-jobs/64def789    │
│       │  Status: PENDING → onTick()           │
│       │  setTimeout(5000)                     │
│       │                                       │
│       ├─ Tick 2: GET /image-jobs/64def789    │
│       │  Status: PROCESSING → onTick()        │
│       │  setTimeout(5000)                     │
│       │                                       │
│       ├─ Tick 3: GET /image-jobs/64def789    │
│       │  Status: DONE                         │
│       │  result.images: ["https://..."]       │
│       │  → onDone({images: [...]})            │
│       │                                       │
│       └─ FXFlow worker:                       │
│          POST /image-jobs/submit-result-image │
│          {                                     │
│            jobId: "64def789...",              │
│            resultImage: {                      │
│              media: [{image: {                │
│                generatedImage: {              │
│                  fifeUrl: "https://..."       │
│                }                              │
│              }}]                              │
│            }                                  │
│          }                                    │
│          → Auto-saves to ImageOwner library   │
│          → Image appears in library UI        │
│                                                 │
│ 9. FRONTEND: Display result                   │
│    ├─ setResults([{                           │
│    │   id: "64def789...",                     │
│    │   url: "https://...",                    │
│    │   prompt: "Make this image cyberpunk",   │
│    │   status: "done",                        │
│    │   cost: 10,                              │
│    │   model: "google_image_gen_banana",      │
│    │   references: [{                         │
│    │     url: "https://gommo.../img.png"      │
│    │   }]                                     │
│    │ }])                                       │
│    └─ User sees generated image in results    │
│                                                 │
│ 10. Fetch library to show auto-saved result   │
│     fetchServerResults(1, true)                │
│     └─ Display in history                      │
│                                                 │
└────────────────────────────────────────────────┘
```

---

## Polling Mechanism

### pollJobOnce() - Core Implementation

**Location:** `hooks/useJobPoller.ts` (lines 290-345)

**Async Utility Function (NOT a React hook)**
Used for parallel multi-job polling.

```typescript
export async function pollJobOnce(options: PollJobOptions): Promise<void> {
  const {
    jobId,
    isCancelledRef,                // Caller-managed cancel flag
    apiType = 'image',             // 'image' or 'video'
    intervalMs = 5000,             // Default 5s between polls
    maxDurationMs = 180_000,       // Default 3 minutes max
    networkRetryMs = 10_000,       // 10s retry on network error
    onDone,                        // Success callback
    onError,                       // Error callback
    onTick,                        // Progress callback
    onTimeout                      // Timeout callback
  } = options;

  return new Promise<void>((resolve) => {
    const scheduleNext = (delayMs: number) => {
      setTimeout(() => {
        runPollLoop(jobId, apiType, intervalMs, maxDurationMs, 
                    networkRetryMs, startTime, tickCountRef, 
                    isCancelledRef, callbacksRef, scheduleNext, resolve);
      }, delayMs);
    };

    runPollLoop(...);  // Start immediately
  });
}
```

### runPollLoop() - Main Loop

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
  onFinish: () => void
): Promise<void> {
  
  // Check if cancelled
  if (cancelledRef.current) return;

  // ─── TIMEOUT CHECK ──────────────────────────────
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

  tickCountRef.current += 1;

  try {
    // ─── FETCH STATUS ──────────────────────────────
    const raw =
      apiType === 'video'
        ? await videosApi.getJobStatus(jobId)
        : await imagesApi.getJobStatus(jobId);

    if (cancelledRef.current) return;

    const { status, result, errorMsg } = parseResponse(raw?.data);

    if (status === 'done') {
      onFinish();
      callbacksRef.current.onDone(result);
    } else if (status === 'failed' || status === 'error') {
      onFinish();
      callbacksRef.current.onError(errorMsg);
    } else {
      // Still pending/processing
      callbacksRef.current.onTick?.({
        tickCount: tickCountRef.current,
        elapsedMs: Date.now() - startTime,
      });
      scheduleNext(intervalMs);  // Schedule next poll
    }
  } catch {
    // Network error - retry later (don't call onError yet)
    if (cancelledRef.current) return;
    scheduleNext(networkRetryMs);
  }
}
```

### Status Response Parsing

```typescript
function parseResponse(data: any): {
  status: string;
  result: JobDoneResult;
  errorMsg: string;
} {
  const status = (data?.status ?? '').toLowerCase();
  const result: JobDoneResult = {
    images: data?.result?.images,      // Array of CDN URLs
    videoUrl: data?.result?.videoUrl,
    thumbnail: data?.result?.thumbnail ?? data?.result?.thumbnailUrl,
  };
  const errorMsg =
    data?.error?.userMessage ??
    data?.error?.message ??
    'Job thất bại';
  
  return { status, result, errorMsg };
}
```

### Timeout & Error Handling

```
Polling Timeline:
┌─────────────────────────────────────────────────────┐
│ Start: elapsedMs = 0                                │
├─────────────────────────────────────────────────────┤
│ Tick 1: elapsedMs=0, status=PENDING                 │
│  └─ onTick({tickCount: 1, elapsedMs: 0})           │
│  └─ scheduleNext(5000)                              │
├─────────────────────────────────────────────────────┤
│ Tick 2: elapsedMs=5000, status=PROCESSING           │
│  └─ onTick({tickCount: 2, elapsedMs: 5000})        │
│  └─ scheduleNext(5000)                              │
├─────────────────────────────────────────────────────┤
│ Tick 3: elapsedMs=10000, status=PROCESSING          │
│  └─ onTick({tickCount: 3, elapsedMs: 10000})       │
│  └─ scheduleNext(5000)                              │
├─────────────────────────────────────────────────────┤
│ ...                                                  │
├─────────────────────────────────────────────────────┤
│ Tick N: elapsedMs=180000 (3 min) ← TIMEOUT!        │
│  └─ if onTimeout: onTimeout()                       │
│  └─ else: onError('Quá thời gian xử lý...')        │
│  └─ onFinish()                                      │
├─────────────────────────────────────────────────────┤
│ Tick M: status=DONE                                 │
│  └─ onDone({images: [...], ...})                   │
│  └─ onFinish()                                      │
└─────────────────────────────────────────────────────┘
```

---

## Error Handling & Refunds

### Credit Refund on Generation Error

**Location:** `useImageGenerator.ts` (lines 272-285)

```typescript
onError: (errorMsg) => {
  addLogToTask(resultId, `[ERROR] Synthesis aborted: ${errorMsg}`);
  
  if (usagePreference === 'credits') {
    setResults(prev => prev.map(r => {
      if (r.id === resultId && !r.isRefunded) {
        // ✅ REFUND credits immediately
        addCredits(cost);
        return { ...r, status: 'error', isRefunded: true };
      }
      return r.id === resultId ? { ...r, status: 'error' } : r;
    }));
  } else {
    // Using personal key - no refund
    setResults(prev => prev.map(r => r.id === resultId ? { ...r, status: 'error' } : r));
  }
}
```

**Refund Flow:**
```
Image Generation Job Fails
    ↓
pollJobOnce detects status='error' or 'failed'
    ↓
Calls onError(errorMsg)
    ↓
if usagePreference === 'credits':
    ├─ Check !isRefunded (only once)
    ├─ Call addCredits(cost)  ← Updates context
    ├─ Set isRefunded: true   ← Prevent double refund
    └─ Set status: 'error'
    ↓
Update UI with error message + refund confirmation
```

### Cancel Job & Refund

**Backend Route:** `POST /image-jobs/:id/cancel`

```
Frontend: User clicks Cancel
    ↓
POST /image-jobs/64def789.../cancel
    ↓
Backend:
  1. Find ImageJob by id
  2. Verify status in [PENDING, POLLING]
  3. Set status = CANCELLED
  4. if creditsUsed > 0:
       ├─ Load User
       ├─ user.creditBalance += creditsUsed
       ├─ Create REFUND transaction
       └─ Save User
  5. Return {success: true, refunded: N}
    ↓
Frontend: 
  ├─ Display: "+N CR refunded"
  ├─ Call refreshUserInfo()
  ├─ Update creditBalance
  └─ Remove task from UI
```

---

## Multi-Provider Routing

### Dynamic Provider Selection Flow

**Location:** `imageJobs.ts` (lines 176-215)

**Decision Tree:**

```
User submits: engine.provider = "gommo", model = "google_image_gen_banana"
    ↓
Step 1: Check if route candidate
  ├─ Must be provider="gommo" ✓
  ├─ Must be Google model ✓
  │  (imagen, google_image_gen, banana)
  └─ Proceed to routing

Step 2: Read SystemSetting config
  ├─ Query: SystemSetting.findOne({key: "fxflow"})
  │  Result: {value: {enabled: true, routingPercent: 60}}
  │
  └─ Query: SystemSetting.findOne({key: "grok"})
     Result: {value: {enabled: true, routingPercent: 20}}

Step 3: Probability routing
  roll = Math.random() * 100  // 0-100
  
  if (roll < 60):
    → provider = "fxflow"
    → owner = getOrAssignOwnerForUser(userId, "fxflow")
    → Log: 🎲 [IMG] google_image_gen_banana → fxflow (60%)
  
  else if (roll < 80):  // 60-80
    → provider = "grok"
    → owner = getOrAssignOwnerForUser(userId, "grok")
    → Log: 🎲 [IMG] google_image_gen_banana → grok (20%)
  
  else:  // 80-100
    → keep provider = "gommo"
    → owner = null
    → Log: 🎲 [IMG] google_image_gen_banana → gommo (20%)

Step 4: Create ImageJob with routing
  ImageJob {
    engine: {provider: finalEngine.provider, model},
    owner: jobOwner,
    ...
  }

Step 5: Process asynchronously
  Different backends handle based on provider:
  ├─ gommo: Direct HTTP API calls
  ├─ fxflow: Worker queue assignment (sticky owner)
  ├─ grok: Grok worker queue assignment (sticky owner)
  └─ ...
```

### Sticky Owner Assignment

**Why Sticky?**
- Some providers (FXFlow, Grok) have rate limits per account
- Distributing jobs across multiple accounts prevents hitting limits
- Same user should use consistent account for better tracking

**Implementation:**
```typescript
// getOrAssignOwnerForUser(userId, provider)
// Returns: owner account name for that user+provider combo

Examples:
  User 1 + fxflow → always "fxflow-owner-2"
  User 1 + grok   → always "grok-owner-5"
  User 2 + fxflow → always "fxflow-owner-7"
  ...
```

---

## Summary Table

| Component | Role | Key Responsibility |
|-----------|------|-------------------|
| **ImageLibraryModal** | UI Component | Display library, upload flow |
| **storage.ts** | Service | File → Base64 conversion |
| **mediaApi** | API Client | /media/image-upload, /upload-media/* |
| **imagesApi** | API Client | /image-jobs CRUD, polling |
| **ImageOwnerModel** | Backend DB | Store uploaded images metadata |
| **ImageBase64Model** | Backend DB | Store base64 separately (performance) |
| **ImageJob** | Backend DB | Track generation jobs + status |
| **uploadMedia.ts** | Backend Route | Handle file upload to GOMMO CDN |
| **imageJobs.ts** | Backend Route | Handle job creation, polling, routing |
| **useImageGenerator** | React Hook | State management + generation logic |
| **useJobPoller** | React Hook | Generic polling utility |
| **pollJobOnce** | Utility | Parallel job polling |

---

## File Size Reference

| File | Lines | Primary Purpose |
|------|-------|-----------------|
| uploadMedia.ts | 1437 | Upload to GOMMO, ImageOwner CRUD |
| ImageJob.ts | 220 | Job schema + status enums |
| imageJobs.ts | 559 | Job creation, routing, polling endpoints |
| useImageGenerator.ts | 465 | Generation state + inference logic |
| useJobPoller.ts | 346 | Core polling abstraction |
| ImageLibraryModal.tsx | 893 | Library UI + pagination |
| apis/media.ts | 139 | Media API client |
| apis/images.ts | 124 | Image job API client |
| ImageOwnerModel.ts | 59 | Upload metadata schema |
| ImageBase64Model.ts | 23 | Base64 storage schema |
| storage.ts | 75 | FileReader + upload service |
| types.ts | 102 | Global type definitions |

---

**Total Production Code:** 4,442 lines across 12 key files

Generated: April 2026
