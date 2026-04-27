# Pages — `pages/` (62 files)

## Top-level

| File | Notes |
|------|-------|
| `MarketPage.tsx` | Homepage, dynamic block layout via `BLOCK_ICONS` map |
| `MarketsPage.tsx` | Browse all tools, `STATIC_CATEGORIES` |
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

## Product (top-level)

| File | Slug |
|------|------|
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

## `pages/audio/`

| File | Slug |
|------|------|
| `MusicGenerator.tsx` | `/product/ai-music-generator`, `/product/music-generator` |
| `TextToSpeech.tsx` | `/product/text-to-speech` |
| `VoiceDesignAI.tsx` | `/product/voice-design-ai` |
| `VoiceStudio.tsx` | `/product/ai-voice-studio` |

## `pages/images/`

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

## `pages/slides/`

| File | Slug |
|------|------|
| `AISlideCreatorPage.tsx` | `/product/ai-slide-creator` |

## `pages/videos/`

| File | Slug |
|------|------|
| `AIVideoGenerator.tsx` | `/product/ai-video-generator` |
| `AvatarLipsyncAI.tsx` | `/product/avatar-sync-ai` |
| `FibusVideoStudio.tsx` | `/product/fibus-video-studio` |
| `GenyuProduct.tsx` | `/product/studio-architect` |
| `StoryboardStudioPage.tsx` | `/product/storyboard-studio` |
| `VideoAnimateAI.tsx` | `/product/video-animate-ai` |
