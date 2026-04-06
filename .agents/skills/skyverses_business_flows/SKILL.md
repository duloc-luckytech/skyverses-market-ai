---
name: skyverses_business_flows
description: >
  End-to-end business flows for Skyverses Market AI: user registration, credit top-up
  via bank transfer (QR/VietQR), AI image & video generation pipeline (async jobs + polling),
  external worker routing (FXFlow/Grok factory pattern), model pricing matrix,
  plan upgrade, and referral/affiliate system.
---

# Skyverses Business Flows — End-to-End Reference

## 1. USER REGISTRATION & ONBOARDING

```
User → Clicks "Login" → Google OAuth popup
  ↓
FE: POST /auth/google-register { email, name, picture, inviteCode? }
  ↓
Backend:
  1. Find user by email
  2. If new → generate unique inviteCode (8-char alphanumeric)
  3. Create User with:
     - creditBalance: 1000 (welcome credit)
     - freeImageRemaining: 100
     - claimWelcomeCredit: true
  4. Log CreditTransaction (type: "WELCOME", amount: 1000)
  5. If within event period → +500 EVENT_BONUS credits, globalEventBonus2026: true
  6. Return JWT (7d) with { userId, email, role, name }
  ↓
FE: Store JWT in localStorage → AuthContext loads user
  ↓
User completes onboarding survey
  → PATCH /user/onboarding { role, goals[], workStyle, experienceLevel }
  → Stored on user.onboarding
```

---

## 2. CREDIT TOP-UP FLOW (Bank Transfer / VietQR)

```
User → /credits → Select package → Click "Buy"
  ↓
FE: POST /credits/purchase/create { packageCode }
  ↓
Backend:
  1. Cancel any existing pending tx for same user+package
  2. Calculate amountVND = pkg.price * 26000 (USD→VND)
  3. Generate memo: "SKY {PACKAGE_CODE} {USER_ID_6} {TIMESTAMP}{RANDOM}"
     e.g. "SKY ULTIMATE A2B3C4 0323173505XY2"
  4. Create Transaction { status: "pending", 15-min expiry }
  5. Return { memo, amount, credits, expiresAt }
  ↓
FE: Display VietQR code with memo + bank details from /config/banking
  ↓
User: Transfers money via banking app with EXACT memo
  ↓
Bank API: Sends webhook POST /webhook/bank
  ↓
Backend (webhook.ts):
  1. Save raw payload → BankTransactionTemp (idempotent upsert)
  2. Upsert BankTransaction
  3. Match description against regex "SKY {CODE} {UID} {TS}"
  4. Find pending Transaction with matching memo
  5. Verify amount (±1% tolerance)
  6. If match:
     - creditUser.creditBalance += pkg.totalCredits
     - creditUser.plan = pkg.code
     - Create CreditTransaction (type: "TOP_UP")
     - Transaction.status = "success"
  ↓
FE: Polls GET /credits/purchase/check/:txId every ~3s
  → status "pending" | "success" | "expired" (15min)
  → On success: refresh balance → show celebration UI
```

**Auto-confirm during polling**: On each poll, backend also tries to match
BankTransaction (within 30min window) — so payment can confirm even if
webhook arrives slightly before user opens the check endpoint.

**Memo format**: `SKY {PACKAGE_CODE} {USER_ID_LAST_6} {MMDDHHMMSS}{3-CHAR-RANDOM}`

---

## 3. AI IMAGE GENERATION FLOW (Async Job + Polling)

```
User → Workspace → Write prompt → Click Generate
  ↓
FE: POST /image-jobs {
  type: "text_to_image" | "image_to_image" | "image_upscale" | "image_edit",
  input: { prompt, image?, images?, mask? },
  config: { width, height, aspectRatio, seed, style },
  engine: { provider: "gommo", model: "google_image_gen_4_5" },
  enginePayload: { prompt, privacy, projectId, ... }
}
  ↓
Backend (imageJobs.ts):
  STEP 1 — CHECK FREE IMAGES:
    if freeImageRemaining > 0 → decrement free counter (no credit charge)
    else → look up ModelPricingMatrix for creditCost
           → deduct creditBalance
           → log CreditTransaction (type: "CONSUME", source: "image_generation")

  STEP 2 — DYNAMIC ROUTING (gommo + Google models only):
    Read SystemSetting { key: "fxflow" } → { enabled, routingPercent }
    Read SystemSetting { key: "grok" }   → { enabled, routingPercent }
    Roll: Math.random() * 100
      < fxflow.routingPercent → provider = "fxflow"
      < fxflow% + grok%      → provider = "grok"
      else                   → keep "gommo"
    Non-Google models (Kling, Hailuo, etc.) → always gommo, no routing

  STEP 3 — STICKY OWNER:
    getOrAssignOwnerForUser(userId, provider)
    → User.fxflowOwner OR User.grokOwner (persisted)
    → Same user always routes to same worker account

  STEP 4 — Create ImageJob { status: "PENDING", engine: finalEngine, owner }
  STEP 5 — Return { jobId, status: "pending", creditsUsed }
  ↓
FE: Poll GET /image-jobs/:id every 2-3s
  ↓
External Worker (FXFlow/Grok desktop extension on owner's machine):
  POLL: GET /fxflow/tasks/pending?owner={name}&type=image
  EXEC: Browser automation → submit to Gemini/FxLab
  DONE: POST /fxflow/tasks/:id/complete { status: "done", resultUrl, mediaId }
        OR POST /fxflow/tasks/:id/complete { status: "error", error: "..." }
  ↓
Backend (workerRouter.ts → handleImageComplete):
  On "done":
    - ImageJob.status = "DONE"
    - job.result = { images: [url], thumbnail: url, imageId: mediaId }
    - Auto-save to ImageOwnerModel (user library)
  On "error":
    - ImageJob.status = "ERROR"
    - Auto-refund credits (REFUND transaction)
  ↓
FE poll detects "done" → display image result
  ↓
Cancel flow: POST /image-jobs/:id/cancel → status "CANCELLED" + REFUND credits
```

---

## 4. AI VIDEO GENERATION FLOW

```
User → Video Workspace → Prompt or Upload image → Generate
  ↓
FE: POST /video-jobs {
  type: "text_to_video" | "image_to_video" | "start_end_image" | "ingredient",
  input: { prompt, images?, startImage?, endImage? },
  config: { duration: 5|8, resolution: "720p"|"1080p", aspectRatio: "16:9"|"1:1"|"9:16" },
  engine: { provider: "gommo", model: "veo_3_1" | "kling_v2" | ... },
  enginePayload: { prompt, mode: "relaxed"|"quality"|"fast", ... }
}
  ↓
Backend (videoJobs.ts):
  STEP 1 — CREDIT DEDUCTION:
    ModelPricingMatrix[model][resolution][duration] = creditCost
    Deduct creditBalance → log CreditTransaction (source: "video_generation")

  STEP 2 — DYNAMIC ROUTING (VEO models only):
    SystemSetting "fxflow" → routingPercent
    If Math.random()*100 < routingPercent → provider = "fxflow"
    Non-VEO models (Kling, Hailuo) → always gommo

  STEP 3 — STICKY OWNER: getOrAssignOwnerForUser(userId, "fxflow")

  STEP 4 — Create VideoJob { status: "PENDING", creditsUsed }
  ↓
FE: Poll GET /video-jobs/:id
  ↓
External Worker:
  GET /fxflow/tasks/pending?owner={name}&type=video
  Submit → Veo/gommo → get taskId
  POST /fxflow/tasks/:id/complete { status: "done", resultUrl }
         OR { status: "error" } → auto-refund
  ↓
VideoJob.result = { videoUrl, thumbnailUrl }
  ↓
FE: Video player displays result
```

### Special Video Types:
| Type | Flow |
|------|------|
| `text_to_video` | prompt → video directly |
| `image_to_video` | upload image → get mediaId → VideoJob.input.startImage = mediaId |
| `start_end_image` | 2 images → mediaIds → startImage + endImage |
| `ingredient` (charsync) | multiple ref images → referenceMediaIds[] |

### Image→Video Chaining (`ImageOwnerModel.pendingVideoPayload`):
```
Upload image → ImageOwnerModel { status: "pending-fxflow-upload" }
Worker: GET /fxflow/image/upload-tasks → upload → get mediaId
POST /fxflow/image/upload-result { id, status: "done", mediaId }
  → chainMediaIdToVideoJob() → creates VideoJob with mediaId injected
```

---

## 5. WORKER ROUTING SYSTEM (workerRouter.ts)

`createWorkerRouter(provider)` is a **generic factory** — creates identical API
surface for any provider. Mounted as:
```typescript
router.use("/fxflow", createWorkerRouter("fxflow"))
router.use("/grok",   createWorkerRouter("grok"))
```

### Endpoints per provider:
| Endpoint | Purpose |
|----------|---------|
| `GET /tasks/pending?owner=X&type=image\|video\|charsync` | Worker polls for jobs |
| `POST /tasks/:id/complete { status, resultUrl, mediaId, error }` | Worker submits result |
| `GET /config` | Read provider routing config |
| `PUT /config` | Admin updates routingPercent, etc. |
| `GET\|POST\|PUT\|DELETE /owners` | Manage the worker account pool |
| `GET /image/upload-tasks` | Pre-upload image queue for image→video |
| `POST /image/upload-result` | Image upload completion callback |

### Owner System:
- **Owner** = a named worker account (e.g. "worker_01" running FXFlow extension on a machine)
- Stored in `FxflowOwner` model: `{ name, status: "active"|"inactive", provider }`
- **Sticky assignment**: each user gets a consistent owner per provider
  - `User.fxflowOwner` — assigned FXFlow worker
  - `User.grokOwner` — assigned Grok worker
- If owner goes inactive → re-assign random active owner, save new assignment

### Task Response Format (worker sends to backend):
```typescript
POST /fxflow/tasks/:id/complete {
  status: "done" | "error",
  resultUrl?: string,    // CDN URL of result
  mediaId?: string,      // Provider's internal media ID
  error?: string         // Error message on failure
}
```

---

## 6. SYSTEM CONFIG (CMS-Managed via SystemSetting)

`SystemSetting` model: `{ key: string, value: Mixed }` — MongoDB key-value store.
Admin manages via CMS. Backend reads on each request (no caching).

| Key | Value shape | Purpose |
|-----|-------------|---------|
| `fxflow` | `{ enabled, routingPercent, videoQuality, imageModel }` | FXFlow routing % |
| `grok` | `{ enabled, routingPercent, videoQuality, imageModel }` | Grok routing % |
| `welcomeBonusCredits` | `number` | Credits given on signup (default: 1000) |
| `productLocks` | `{ [slug]: boolean }` | Lock/unlock product pages |
| `aiSupportContext` | `string` | System prompt for AI support chat |
| `banking` | `{ bankName, bankCode, accountNumber, accountName, qrTemplate }` | VietQR display |
| `crypto` | `{ walletAddress, networks[], usdtContract* }` | USDT payment config |
| `marketHomeBlock` | `HomeBlock[]` | Homepage product sections |

---

## 7. CREDIT TRANSACTION TYPES

| type | When triggered | Amount |
|------|---------------|--------|
| `WELCOME` | New user registration | +1000 |
| `EVENT_BONUS` | Global event (April 2026) | +500 |
| `DAILY` | Daily check-in claim | +100 |
| `TOP_UP` | Bank transfer confirmed | + pkg.totalCredits |
| `CONSUME` | Image/video/audio generation | - creditCost |
| `REFUND` | Job cancelled or failed | + creditsUsed |
| `BONUS` | Admin manually adds/deducts | ± amount |

**Daily claim logic**:
```typescript
isSameDay(lastDailyClaimAt, now)  // utility in utils/isSameDay.ts
→ already claimed today → 400 DAILY_CREDIT_ALREADY_CLAIMED { nextClaimAt: midnight }
→ first claim today → +100 creditBalance, update lastDailyClaimAt
```

---

## 8. PLAN UPGRADE FLOW (Legacy Subscription System)

Separate from credit top-up — manages **video usage quotas** via subscription plans:

```
User picks plan → POST /credits/purchase/create { packageCode: "PRO" }
  ↓ (same memo + QR flow as credit top-up)
Bank webhook matches plan transaction
  ↓
Backend (webhook.ts):
  - Verify amount === planPrice (EXACT, no tolerance for plan upgrades)
  - user.plan = plan.key
  - user.planExpiresAt = now + plan.expire days + 7h timezone offset
  - user.maxVideo = MAX_VIDEO_PLAN[plan.key].maxVideo
  - user.videoUsed = 0  (reset usage counter)
  ↓
VIP Token Assignment: pickVipTokenAutoScale()
  - Find GoogleToken { type: "vip", isActive: true, credits > 20000 }
  - If available slot → atomically assign user
  - Auto-scale: if slot < MAX_SLOT (5) → increment slot (one token serves multiple users)
  - Link: user.googleId = token._id
  ↓
Affiliate: handleAffiliateCommission(userId, planKey, planPrice)
```

---

## 9. REFERRAL & AFFILIATE SYSTEM

- Each user has a unique 8-char `inviteCode` (generated on registration)
- New user registers with `inviteCode` → `user.inviteFrom = inviter._id`
- On plan purchase:
  - `handleAffiliateCommission()` in `services/utils/affiliate.ts`
  - Credits commission to `inviter.affiliateTotal`
  - Creates `AffiliateTransaction` record
- `/referral` page: shows invite link, commission stats, pending earnings

---

## 10. MODEL PRICING MATRIX

`ModelPricingMatrix` stores credit cost per model × resolution × duration:

```typescript
// VIDEO model example:
{
  modelKey: "veo_3_1",
  status: "active",
  pricing: {
    "720p":  { "5": 50,  "8": 80  },
    "1080p": { "5": 100, "8": 160 },
  }
}

// IMAGE model example:
{
  modelKey: "google_image_gen_4_5",
  status: "active",
  pricing: {
    "1024x1024": 10   // flat cost per generation
  }
}
```

**Deduction timing**: Credits are deducted **at job creation** (pre-paid).
If job fails/cancelled → auto-refund via REFUND transaction.

Admin manages pricing via CMS → `PUT /pricing/admin/package/:id` route.
