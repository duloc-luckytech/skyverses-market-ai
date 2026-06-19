# Routes — `App.tsx`

Lazy-loaded qua `pageImports` map → `React.lazy` → `<Suspense fallback={<PageLoader />}>`.
Provider order: `ErrorBoundary > Theme > Language > Auth > Toast > Router > Search > Layout`.

## Public

| Path | Page | Notes |
|------|------|-------|
| `/login` | `pages/LoginPage` | Outside Layout |
| `/` | `pages/MarketPage` | fallback = `HomepageSkeleton` |
| `/category/:id` | `pages/CategoryPage` | |
| `/explorer` | `pages/ExplorerPage` | Gallery |
| `/markets` | `pages/MarketsPage` | Browse all |
| `/showcase` | `pages/ShowcasePage` | App & game demo gallery |
| `/showcase/:id` | `pages/ShowcaseDetailPage` | App/game showcase product detail |
| `/models` | `pages/ModelsPage` | AI model list |
| `/apps` | `pages/AppsPage` | Workspace (auth) |
| `/app/:id` | `pages/AppInterfacePage` | App runtime |
| `/credits` | `pages/CreditsPage` | |
| `/usage` | `pages/CreditUsagePage` | |
| `/settings` | `pages/SettingsPage` | |
| `/favorites` | `pages/FavoritesPage` | |
| `/referral` | `pages/ReferralPage` | |
| `/policy` | `pages/PolicyPage` | |
| `/use-cases` | `pages/UseCasesPage` | |
| `/pricing` | `pages/PricingPage` | |
| `/booking` | `pages/BookingPage` | Deploy CTA |
| `/about` | `pages/AboutPage` | |

## Prompt Market

| Path | Page | Notes |
|------|------|-------|
| `/prompt-market` | `pages/PromptMarketPage` | Browse marketplace, filter, search |
| `/prompt-market/sell` | `pages/PromptSellPage` | Seller dashboard, listings + earnings |
| `/prompt-market/sell/new` | `pages/PromptCreatePage` | Create new prompt set |
| `/prompt-market/sell/edit/:id` | `pages/PromptEditPage` | Edit existing prompt set |
| `/prompt-market/my-purchases` | `pages/MyPromptPurchasesPage` | Buyer's purchased prompts |
| `/prompt-market/wishlist` | `pages/PromptWishlistPage` | User's saved prompts (auth) |
| `/prompt-market/seller/:sellerId` | `pages/PromptSellerProfilePage` | Public seller profile |
| `/prompt-market/:slug` | `pages/PromptDetailPage` | Prompt set detail + purchase |
| `/skytoken` | `pages/SkyTokenPage` | SKT wallet, packages, withdrawal |

## Product `/product/:slug`

Static slugs trước, fallthrough → `pages/SolutionDetail`.

| Slug | Component | Domain |
|------|-----------|--------|
| `background-removal-ai` | `pages/images/BackgroundRemovalAI` | image |
| `social-banner-ai` | `pages/images/SocialBannerAI` | image |
| `ai-agent-workflow` | `pages/ProductAIAgentWorkflow` | agent |
| `captcha-veo3` | `pages/ProductCaptchaToken` | infra |
| `nocode-export` | `pages/NoCodeExportPage` | tool |
| `qwen-chat-ai` | `pages/QwenChatAIPage` | chat |
| `ai-slide-creator` | `pages/slides/AISlideCreatorPage` | slides |
| `ai-birthday-generator` | `pages/images/EventStudioPage type="birthday"` | event |
| `ai-wedding-generator` | `pages/images/EventStudioPage type="wedding"` | event |
| `ai-noel-generator` | `pages/images/EventStudioPage type="noel"` | event |
| `ai-tet-generator` | `pages/images/EventStudioPage type="tet"` | event |
| `bat-dong-san-ai` | `pages/images/RealEstateAI` | real-estate |
| `realestate-visual-ai` | `pages/images/RealEstateVisualAI` | real-estate |
| `ai-music-generator` | `pages/audio/MusicGenerator` | audio |
| `ai-image-restorer` | `pages/images/AIImageRestoration` | image |
| `storyboard-studio` | `pages/videos/StoryboardStudioPage` | video |
| `fibus-video-studio` | `pages/videos/FibusVideoStudio` | video |
| `ai-stylist` | `pages/images/AIStylistPage` | fashion |
| `character-sync-ai` | `pages/ProductCharacterSync` | character |
| `ai-video-generator` | `pages/videos/AIVideoGenerator` | video |
| `ai-image-generator` | `pages/images/AIImageGenerator` | image |
| `voice-design-ai` | `pages/audio/VoiceDesignAI` | audio |
| `ai-podcast-voice` | `pages/audio/AIPodcastVoice` | audio |
| `ai-voice-studio` | `pages/audio/VoiceStudio` | audio |
| `studio-architect` | `pages/videos/GenyuProduct` | video |
| `avatar-sync-ai` | `pages/videos/AvatarLipsyncAI` | video |
| `video-animate-ai` | `pages/videos/VideoAnimateAI` | video |
| `text-to-speech` | `pages/audio/TextToSpeech` | audio |
| `music-generator` | `pages/audio/MusicGenerator` | audio (alias) |
| `product-image` | `pages/images/ProductImage` | image |
| `poster-marketing-ai` | `pages/images/PosterMarketingAI` | image |
| `fashion-center-ai` | `pages/images/FashionCenterAI` | fashion |
| `image-upscale-ai` | `pages/images/ImageUpscaleAI` | image |
| `character-sync-studio` | `pages/images/Product6Image` | character |
| `banana-pro-comic-engine` | `pages/images/Product7Comic` | image |
| `3d-spatial-architect` | `pages/SpatialArchitectPage` | 3d |
| `paperclip-ai-agents` | `pages/images/PaperclipAIAgents` | agent |
| `:slug` | `pages/SolutionDetail` | dynamic fallback |

## Misc

- `*` → `<Navigate to="/" replace />`
- Critical-route prefetch on idle: `markets`, `credits`, `solutionDetail`, `aiImageGenerator`, `aiVideo`
- `<ScrollToTop />` mounted globally để reset scroll khi navigate
