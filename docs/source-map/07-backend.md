# Backend — `skyverses-backend/` (~163 src file)

Express + Mongoose, TypeScript. Bootstrapped từ `src/index.ts`. OpenAPI docs ở `src/swagger.ts`.

## Top-level files

```
skyverses-backend/
├── package.json, tsconfig.json
├── gcp-key.json, service-account.json   GCP creds
├── runninghub/, scripts/, tmp-videos/, uploads/   runtime data
├── dist/                                  Compiled JS (DO NOT edit)
└── src/
    ├── index.ts                Express bootstrap
    ├── swagger.ts              OpenAPI docs
    ├── swagger-jsdoc.d.ts      Swagger types shim
    ├── cloneDb.ts              DB clone util
    ├── config/
    │   └── keyGenminiGommo.ts  API key rotation
    └── constanst/              (sic — typo, đừng rename)
        ├── index.ts
        └── plans.ts
```

## Routes — `src/routes/` (33 file)

| File | Purpose |
|------|---------|
| `index.ts` | Mount tất cả routes |
| `adminTasks.ts` | Admin task management |
| `ai.ts` | AI generic endpoints |
| `aiModel.admin.ts` | Admin: AI model CRUD |
| `apiClient.ts` | API client management |
| `audio.ts` | Audio (Gommo voice design + Podcast Voice TTS/dialogue/history/export) |
| `auth.ts` | Login, register, OAuth |
| `blog.ts` | Blog posts |
| `category.route.ts` | Categories |
| `config.ts` | System config |
| `credit.router.ts` | Credit balance, packages, transactions |
| `customer.ts` | Customer management |
| `deployLogs.ts` | Deploy log viewer |
| `editImageJobs.ts` | Edit/crop image jobs |
| `explorerMedia.router.ts` | Gallery feed |
| `fxflow.ts` | FxFlow (workflow) endpoints |
| `grok.ts` | Grok integration |
| `imageJobs.ts` | Image generation jobs |
| `market.ts` | Marketplace items |
| `pricing.router.ts` | Pricing matrix |
| `productSubmission.ts` | "Submit your AI tool" |
| `promoBanner.ts` | Promo banner CRUD (admin) |
| `providerToken.ts` | OAuth provider tokens |
| `runninghub.ts` | RunningHub provider sync |
| `uploadMedia.ts` | Media upload |
| `upscaleJobs.ts` | Upscale jobs |
| `user.ts` | User profile |
| `video.ts` | Video generic |
| `videoJobs.ts` | Video gen jobs |
| `webhook.ts` | Provider webhooks |
| `workerRouter.ts` | Worker control |
| `skytoken.router.ts` | SKT balance, packages, purchase QR, history, claim welcome, admin add, withdrawal (request/cancel/my + admin approve/reject/complete) |
| `prompt-market.router.ts` | Browse/search prompts with category/tags/models/media/price/rating/featured filters, paid-detail preview sanitization, purchase, seller profile/follow, wishlist, view tracking, related, earnings, reviews, admin clear/seed/append APIs |

## Models — `src/models/` (41 Mongoose schemas)

`AIModel`, `AffiliateTransaction`, `AudioGeneration`, `AudioVoice`, `BankTransaction`, `BlogPost`, `Category`, `CreditPackage`, `CreditTransaction`, `DeployLog`, `EditImageJob`, `ExplorerMedia`, `FxflowOwner`, `GoogleToken`, `ImageBase64`, `ImageJob`, `ImageOwner`, `MarketItem`, `MetaPromptTemplate`, `ModelPricingMatrix`, `Plan`, `PlanPurchase`, `ProductSubmission`, `PromoBanner`, `PromptGenerationJob`, `PromptPurchase`, `PromptReview`, `PromptSet` (examples include promptTitle/style/input/output/media), `PromptWishlist`, `ProviderToken`, `RunningHubTemplate`, `SellerFollower`, `ServerStatus`, `SkyTokenPackage`, `SkyTokenTransaction`, `SkyTokenWithdrawal`, `SystemSetting`, `User`, `VideoConcatJob`, `VideoJob`, `VideoJobV2`.

Each is `<Name>.model.ts` (or `<Name>.ts` for older).

## Jobs — `src/jobs/`

Worker pool cho image / video / music. Mỗi domain có:
- `<domain>Worker.ts` — entry
- `polling/pollEngine.ts` — poll task
- `engines/<provider>/{adapter.ts, request.ts, core/*.ts}` — per-provider impl

### Engines

| Provider | Image | Video | Music |
|----------|-------|-------|-------|
| `fxlab` | ✅ (có `core/ingredientsCharacters.ts`) | ✅ (full core/) | ✅ |
| `gommo` | ✅ | ✅ | ✅ |
| `running` (RunningHub) | ✅ (có `core/running/createTaskImageRunning.ts`) | — | — |
| `veo` (Google) | ✅ | ✅ | ✅ |
| `wan` (Wan API) | — | ✅ (rich core/: models, sizes, polling, swap, extend) | ✅ |

### Wan engine core (`engines/wan/core/`)
`index.ts`, `wan.ts`, `wanApiKeys.ts`, `wanModels.ts`, `wanSizes.ts`, `normalizeWanDuration.ts`, `validateWanSize.ts`, `pollWanTask.ts`, `requestWanTextToVideo.ts`, `requestWanImageToVideo.ts`, `requestWanStartEndImageToVideo.ts`, `requestWanExtendVideo.ts`, `requestImageToAction.ts` (video only), `requestSwapCharacter.ts` (video only).

### Sync jobs
`syncGommoImageModels.ts`, `syncGommoPublicImages.ts`, `syncGommoPublicVideos.ts`, `syncRunningHubTemplates.ts`, `cleanupProviderTokens.ts`, `utils/requestCaptchaToken.ts`.

## Services — `src/services/`

- `audioStorage.ts` — save Podcast Voice audio/transcript under `/audio/generated`
- `runninghub/index.ts`, `runninghub/syncTemplates.ts`
- `utils/affiliate.ts`

## Utils — `src/utils/`

`audioWav`, `buildFinalImagePayload`, `buildPricingMatrix`, `checkPlanValidity`, `downloadVideoFromUrl`, `fetchSessionFromCookie`, `getAccessTokenForJob`, `getCookieForJob`, `getPricingCredits`, `image`, `isSameDay`, `makeSlug`, `refundJobCredits`, `roleHelpers`.

## Scripts — `src/scripts/`

`asynsDataMongo.ts`, `seed-ai-models.ts`, `prompt-market-blueprint.ts` (blueprint builder for reusable complex prompt packs, including free samples, food/drink packs, and cinema/animation/anime showcase packs), `generate-prompt-market-assets.ts` (external asset generation + Cloudflare upload runner), `seed-prompt-market-v4.ts` (blueprint-driven showcase prompt sets with images+videos, exports clear/seed/append helpers), `seedAdmin.ts`, `seedCategories.ts`, `updatePricingX2.ts`.

## Common patterns

- **Job lifecycle:** route → enqueue worker → adapter → request → poll → save result → refund credits nếu fail
- **Credit deduct:** `getPricingCredits()` trước khi enqueue, `refundJobCredits()` nếu fail
- **Provider token:** `getAccessTokenForJob()` / `getCookieForJob()` để pull credentials
- **Slug:** `makeSlug()` cho URL-safe tên product
