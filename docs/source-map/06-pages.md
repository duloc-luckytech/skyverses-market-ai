# Pages — `pages/` (69 files)

## Top-level (47 files)

| File | Notes |
|------|-------|
| `HomePage.tsx` | Homepage route `/` (đổi tên từ `MarketPage`), dynamic block layout via `BLOCK_ICONS` map |
| `MarketsPage.tsx` | Browse all tools `/markets`, `STATIC_CATEGORIES` |
| `ShowcasePage.tsx` | App & game demo gallery `/showcase`, static items + App/Game filter, CTA → `/booking` |
| `ShowcaseDetailPage.tsx` | App/game showcase detail `/showcase/:id`, static product data + sticky summary/tabs/related cards |
| `CategoryPage.tsx` | Category detail, `CATEGORY_UI_MAP` |
| `ExplorerPage.tsx` | Gallery, `ASPECT_CLASSES` |
| `ModelsPage.tsx` | Model list, `CATEGORIES` |
| `AppsPage.tsx` | User workspace (auth) |
| `AppInterfacePage.tsx` | App runtime container |
| `CreditsPage.tsx` | `USD_TO_VND` constant |
| `CreditUsagePage.tsx` | Credit transaction history |
| `LoginPage.tsx` | Auth UI, `FlagIcon` |
| `SolutionDetail.tsx` | Generic product detail (fallback `/product/:slug`) |
| `SolutionsPage.tsx` | Solutions overview, embedded `SOLUTIONS` |
| `UseCasesPage.tsx` | `USE_CASE_CATEGORIES` |
| `PricingPage.tsx` | Plans table |
| `BookingPage.tsx` | Deploy / contact form |
| `AboutPage.tsx` | About + `STATS` |
| `SettingsPage.tsx` | User settings |
| `FavoritesPage.tsx` | Favorites list |
| `ReferralPage.tsx` | Referral program |
| `PolicyPage.tsx` | Legal/Terms (`PolicyCard`) |
| `ImageLibraryPage.tsx` | IndexedDB-backed library (`DB_NAME`) |
| `AdminMarketCMS.tsx` | Admin CMS (legacy, dùng `cms/` sub-app thay) |
| `NebulaVisionEngine.tsx` | Demo product page |
| `SpatialArchitectPage.tsx` | 3D spatial product, `LIVE_3D_MODELS` |
| `NoCodeExportPage.tsx` | NoCode export landing |
| `QwenChatAIPage.tsx` | Qwen chat product |
| `PromptMarketPage.tsx` | Prompt marketplace — `/prompt-market`; browse, filter, search, featured carousel |
| `PromptDetailPage.tsx` | Single prompt-set detail — `/prompt-market/:slug`; fetches by slug, shows prompts, opens `PromptPurchaseModal` |
| `PromptSellPage.tsx` | Seller dashboard — `/prompt-market/sell`; listings table, earnings summary cards, recent sales tab; auth-gated |
| `PromptCreatePage.tsx` | Create new prompt set — `/prompt-market/sell/new`; multi-section form (basic info, pricing, preview, prompts+variables), calls `promptMarketApi.create()`, auth-gated |
| `PromptEditPage.tsx` | Edit prompt set — `/prompt-market/sell/edit/:id`; loads existing data, same form as create, calls `promptMarketApi.update()` |
| `MyPromptPurchasesPage.tsx` | Buyer's purchased prompts — `/prompt-market/my-purchases`; expandable cards, lazy detail load, copy-to-clipboard |
| `PromptWishlistPage.tsx` | Wishlist — `/prompt-market/wishlist`; grid of saved prompts, remove, auth gate, pagination |
| `PromptSellerProfilePage.tsx` | Seller profile — `/prompt-market/seller/:sellerId`; avatar, badges, stats, follow, listings tabs |
| `SkyTokenPage.tsx` | SKT wallet — `/skytoken`; balance card, packages grid, withdrawal form, tx history |
| `ProductAIAgentWorkflow.tsx` | `/product/ai-agent-workflow` |
| `ProductCaptchaToken.tsx` | `/product/captcha-veo3` |
| `ProductCharacterSync.tsx` | `/product/character-sync-ai` (có CDN const) |
| `ProductAIAgent.tsx` | (legacy, không route) |
| `ProductAgentImage.tsx` | (legacy) |
| `ProductCinematicAgent.tsx` | (legacy) |
| `ProductGame1.tsx` | (legacy) |
| `ProductGameCharacterAgent.tsx` | (legacy) |
| `ProductPrompt1.tsx` | (legacy) |
| `ProductUniversalProducer.tsx` | (legacy) |

## `pages/audio/` (5 files)

| File | Slug |
|------|------|
| `MusicGenerator.tsx` | `/product/ai-music-generator`, `/product/music-generator` |
| `TextToSpeech.tsx` | `/product/text-to-speech` |
| `VoiceDesignAI.tsx` | `/product/voice-design-ai` |
| `AIPodcastVoice.tsx` | `/product/ai-podcast-voice` |
| `VoiceStudio.tsx` | `/product/ai-voice-studio` |

## `pages/images/` (15 files)

| File | Slug |
|------|------|
| `AIImageGenerator.tsx` | `/product/ai-image-generator` |
| `AIImageRestoration.tsx` | `/product/ai-image-restorer` |
| `AIStylistPage.tsx` | `/product/ai-stylist` |
| `BackgroundRemovalAI.tsx` | `/product/background-removal-ai` |
| `EventStudioPage.tsx` | `/product/ai-{birthday,wedding,noel,tet}-generator` |
| `FashionCenterAI.tsx` | `/product/fashion-center-ai` |
| `ImageUpscaleAI.tsx` | `/product/image-upscale-ai` |
| `PaperclipAIAgents.tsx` | `/product/paperclip-ai-agents` |
| `PosterMarketingAI.tsx` | `/product/poster-marketing-ai` |
| `Product6Image.tsx` | `/product/character-sync-studio` |
| `Product7Comic.tsx` | `/product/banana-pro-comic-engine` |
| `ProductImage.tsx` | `/product/product-image` |
| `RealEstateAI.tsx` | `/product/bat-dong-san-ai` |
| `RealEstateVisualAI.tsx` | `/product/realestate-visual-ai` |
| `SocialBannerAI.tsx` | `/product/social-banner-ai` |

## `pages/slides/` (1 file)

| File | Slug |
|------|------|
| `AISlideCreatorPage.tsx` | `/product/ai-slide-creator` |

## `pages/videos/` (6 files)

| File | Slug |
|------|------|
| `AIVideoGenerator.tsx` | `/product/ai-video-generator` |
| `AvatarLipsyncAI.tsx` | `/product/avatar-sync-ai` |
| `FibusVideoStudio.tsx` | `/product/fibus-video-studio` |
| `GenyuProduct.tsx` | `/product/studio-architect` |
| `StoryboardStudioPage.tsx` | `/product/storyboard-studio` |
| `VideoAnimateAI.tsx` | `/product/video-animate-ai` |
