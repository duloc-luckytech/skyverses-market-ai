# APIs — `apis/` (23 files, frontend → skyverses-backend)

Base URL từ `apis/config.ts` (env-driven, fallback localhost).

| File | Export | Purpose |
|------|--------|---------|
| `config.ts` | `API_BASE_URL`, `apiClient` | base axios/fetch, env detect |
| `auth.ts` | `authApi`, `AuthUser`, `RegisterRequest` | login, register, OAuth, session |
| `user.ts` | `userApi` | profile, preferences |
| `credits.ts` | `creditsApi`, `CreditFeature` | balance, daily claim, transactions |
| `pricing.ts` | `pricingApi`, `PricingModel` | plan & matrix |
| `market.ts` | `marketApi` | products list/detail, home blocks |
| `explorer.ts` | `explorerApi` | gallery feed |
| `images.ts` | `imagesApi`, `ImageJobRequest` | image gen jobs |
| `videos.ts` | `videosApi`, `VideoJobRequest` | video gen jobs |
| `media.ts` | `mediaApi`, `ImageUploadRequest` | upload pipeline |
| `editImage.ts` | `editImageApi`, `CropCoordinates` | edit/crop jobs |
| `upscale.ts` | `upscaleApi`, `UpscaleTask` | upscale jobs |
| `ai-models.ts` | `aiModelsApi`, `AIModel` | model registry |
| `aiChat.ts` | `aiChatApi` | streaming chat (support widget) |
| `aiCommon.ts` | shared helpers | retries, error mapping |
| `paperclipProjects.ts` | `paperclipApi` | Paperclip agent CRUD |
| `podcastVoice.ts` | `podcastVoiceApi`, audio DTOs | AI Podcast Voice TTS/dialogue/history |
| `provider-tokens.ts` | `providerTokensApi`, `ProviderToken` | OAuth provider tokens |
| `product-submission.ts` | `productSubmissionApi` | "Submit your AI tool" form |
| `deploy.ts` | `deployApi`, `DeployLog` | deploy logs viewer |
| `promo-banners.ts` | `promoBannersApi` | promo banner CRUD (admin) |
| `skytoken.ts` | `skytokenApi` | SKT balance, packages, purchase QR, history, claim welcome, withdraw request/cancel/list |
| `prompt-market.ts` | `promptMarketApi` | browse/search prompts, purchase, seller CRUD, earnings, reviews, related, wishlist, seller profile, follow, trackView |

## Pattern

```ts
// Mỗi file export 1 namespace object: <domain>Api
export const fooApi = {
  list: () => apiClient.get('/foo'),
  create: (payload) => apiClient.post('/foo', payload),
  ...
}
```

## Job lifecycle (image/video/music)

1. Frontend gọi `imagesApi.create(...)` / `videosApi.create(...)` → backend tạo job, trả `jobId`
2. Frontend dùng `useJobPoller(jobId)` poll `imagesApi.get(jobId)` mỗi 2-3s
3. Khi `status ∈ {success, failed}` → render result hoặc error
4. `useAuth().refreshCredits()` để cập nhật balance
