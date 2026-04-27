# Skyverses Market AI — Source Map

> **Mục đích:** Map toàn bộ source code của repo theo dạng index để Claude (hoặc devs) load context nhanh trong các chat mới mà không cần grep lại. Mỗi entry: `path → role`. Khi cần sửa file, đọc trực tiếp file đó.
>
> **Khi nào regen:** sau mỗi đợt refactor lớn, thêm/xoá module hoặc đổi route. Có thể chạy bằng cách bảo Claude "regenerate docs/SOURCE_MAP.md".
>
> **Last scan:** 2026-04-27 (root scan, 324 components / 62 pages / 30 hooks / 19 apis).

---

## 1. Tech Stack & Build

| Item | Value |
|------|-------|
| Framework | React 19 + TypeScript + Vite 5 |
| Routing | react-router-dom 7 (lazy `React.lazy` + `Suspense`) |
| Styling | Tailwind 3 (`brand-blue=#0090ff`, `brand-dark`, `brand-gray`, `brand-muted`) |
| Animation | framer-motion 12 |
| Icons | lucide-react |
| 3D | three 0.173.0 (`@react-three`-style imports NOT used; raw three.js) |
| Flow editor | @xyflow/react |
| AI SDK | @google/genai (server-relayed) |
| Doc/Slides export | mammoth (docx import), pptxgenjs, jspdf, html2canvas, jszip |
| Dev port | 3001 (vite) |
| Scripts | `npm run dev`, `npm run build` (`tsc && vite build`), `npm run preview` |
| Env | `API_KEY` / `GEMINI_API_KEY` (server-side via `process.env`) |

Entry: `index.tsx` → mounts `<App />`. Root `App.tsx` wraps providers (`Theme → Language → Auth → Toast → Router → Search`) and lazy-routes pages.

---

## 2. Top-level Layout

```
.
├── index.tsx                 React mount point
├── App.tsx                   Providers + Router + lazy route table
├── types.ts                  Shared TS types (Language, Solution, SystemConfig, …)
├── data.ts                   Static SOLUTIONS catalog + sample data
├── tailwind.config.ts        brand colors, content globs
├── vite.config.ts            port 3001, env shim, build chunking
├── tsconfig.json             TS compiler config
├── postcss.config.js         tailwind/autoprefixer pipeline
├── ecosystem.config.cjs      pm2 deploy config
├── deploy.sh                 production deploy shell
├── index.html                Vite shell, SEO meta, fonts
│
├── apis/         19 client-side API modules (talks to skyverses-backend)
├── components/   324 UI components (grouped by feature)
├── pages/        62 route-level pages (lazy-loaded)
├── context/      5 React contexts (Auth, Theme, Lang, Search, Toast)
├── hooks/        30 custom hooks (per-workspace state machines)
├── constants/    4 config files (brand, market, events, presets)
├── services/     2 client services (storage, uploadPoller)
├── utils/        4 helpers (admin auth, cache, docx, pricing)
├── src/          CSS + CDN constant lists
├── scripts/      bash + TS helpers (CDN sync, image gen, seed)
├── public/       static assets (images, auth pages, 3D showcase)
├── dist/         build output (DO NOT edit)
│
├── cms/                      Sub-app: AdminCmsProPage (Vite child build)
├── blog/                     Sub-app: blog frontend (Vite child build)
├── skyverses-backend/        Express + Mongoose backend (TS, ~163 src files)
├── devops/                   Deploy assets (empty leaf)
│
├── seed-products.mjs         One-off DB seeders
├── seed-realestate-visual-ai.mjs
├── seed-social-banner-ai.mjs
├── update-product-images.mjs
├── gen-realestate-visual-ai-images.mjs
├── gen-social-banner-ai-image.mjs
└── *.md / *.txt              Historical exploration docs (~80 files, kept as references)
```

> **NOTE:** Có rất nhiều `.md`/`.txt` ở root từ các exploration trước (`AUDIT_*`, `BLOG-*`, `CHARACTER_SYNC_*`, `CODEBASE_*`, `MARKETPLACE_*`, `PAPERCLIP_*`, …). Coi như reference legacy — không phải spec.

---

## 3. Routes (from `App.tsx`)

### Public
| Path | Page component | Notes |
|------|---------------|-------|
| `/login` | `pages/LoginPage` | Outside Layout |
| `/` | `pages/MarketPage` | Homepage, suspense fallback = `HomepageSkeleton` |
| `/category/:id` | `pages/CategoryPage` | |
| `/explorer` | `pages/ExplorerPage` | Gallery view |
| `/markets` | `pages/MarketsPage` | Browse all tools |
| `/models` | `pages/ModelsPage` | AI model list |
| `/apps` | `pages/AppsPage` | Workspace (auth) |
| `/app/:id` | `pages/AppInterfacePage` | App runtime shell |
| `/credits` | `pages/CreditsPage` | |
| `/usage` | `pages/CreditUsagePage` | |
| `/settings` | `pages/SettingsPage` | |
| `/favorites` | `pages/FavoritesPage` | |
| `/referral` | `pages/ReferralPage` | |
| `/policy` | `pages/PolicyPage` | |
| `/use-cases` | `pages/UseCasesPage` | |
| `/pricing` | `pages/PricingPage` | |
| `/booking` | `pages/BookingPage` | Deploy/contact CTA |
| `/about` | `pages/AboutPage` | |

### Product routes (`/product/:slug`)
Static slugs first (each → dedicated component); fallthrough → `pages/SolutionDetail`.

| Slug | Component | Domain |
|------|-----------|--------|
| background-removal-ai | `pages/images/BackgroundRemovalAI` | image |
| social-banner-ai | `pages/images/SocialBannerAI` | image |
| ai-agent-workflow | `pages/ProductAIAgentWorkflow` | agent |
| captcha-veo3 | `pages/ProductCaptchaToken` | infra |
| nocode-export | `pages/NoCodeExportPage` | tool |
| qwen-chat-ai | `pages/QwenChatAIPage` | chat |
| ai-slide-creator | `pages/slides/AISlideCreatorPage` | slides |
| ai-birthday-generator | `pages/images/EventStudioPage type="birthday"` | event |
| ai-wedding-generator | `pages/images/EventStudioPage type="wedding"` | event |
| ai-noel-generator | `pages/images/EventStudioPage type="noel"` | event |
| ai-tet-generator | `pages/images/EventStudioPage type="tet"` | event |
| bat-dong-san-ai | `pages/images/RealEstateAI` | real-estate |
| realestate-visual-ai | `pages/images/RealEstateVisualAI` | real-estate |
| ai-music-generator | `pages/audio/MusicGenerator` | audio |
| ai-image-restorer | `pages/images/AIImageRestoration` | image |
| storyboard-studio | `pages/videos/StoryboardStudioPage` | video |
| fibus-video-studio | `pages/videos/FibusVideoStudio` | video |
| ai-stylist | `pages/images/AIStylistPage` | fashion |
| character-sync-ai | `pages/ProductCharacterSync` | character |
| ai-video-generator | `pages/videos/AIVideoGenerator` | video |
| ai-image-generator | `pages/images/AIImageGenerator` | image |
| voice-design-ai | `pages/audio/VoiceDesignAI` | audio |
| ai-voice-studio | `pages/audio/VoiceStudio` | audio |
| studio-architect | `pages/videos/GenyuProduct` | video |
| avatar-sync-ai | `pages/videos/AvatarLipsyncAI` | video |
| video-animate-ai | `pages/videos/VideoAnimateAI` | video |
| text-to-speech | `pages/audio/TextToSpeech` | audio |
| music-generator | `pages/audio/MusicGenerator` | audio (alias) |
| product-image | `pages/images/ProductImage` | image |
| poster-marketing-ai | `pages/images/PosterMarketingAI` | image |
| fashion-center-ai | `pages/images/FashionCenterAI` | fashion |
| image-upscale-ai | `pages/images/ImageUpscaleAI` | image |
| character-sync-studio | `pages/images/Product6Image` | character |
| banana-pro-comic-engine | `pages/images/Product7Comic` | image |
| 3d-spatial-architect | `pages/SpatialArchitectPage` | 3d |
| paperclip-ai-agents | `pages/images/PaperclipAIAgents` | agent |
| `*` (fallback) | `pages/SolutionDetail` | dynamic from data |

Other navigation: `<Route path="*" element={<Navigate to="/" replace />} />`.

Critical-route prefetch on idle: `markets`, `credits`, `solutionDetail`, `aiImageGenerator`, `aiVideo`.

---

## 4. Contexts (`context/`)

| File | Hook | Exposes |
|------|------|---------|
| `AuthContext.tsx` | `useAuth()` | `user`, `isAuthenticated`, `credits`, `tier ('free'\|'pro'\|'enterprise')`, `isPro`, `login()`, `logout()`, `register()`, `claimWelcomeCredits()`, `refreshCredits()` |
| `LanguageContext.tsx` | `useLanguage()` | `lang ∈ {en,vi,ko,ja}`, `setLang`, `t(key)` |
| `SearchContext.tsx` | `useSearch()` | `query`, `setQuery`, `primary`, `secondary`, `open()`, `toggle()` (⌘K palette) |
| `ThemeContext.tsx` | `useTheme()` | `theme ∈ {light,dark}`, `toggleTheme()` (sets `dark` class on `<html>`) |
| `ToastContext.tsx` | `useToast()` | `show({message, type, duration})`, types: `success\|error\|info\|warning` |

Provider order (in `App.tsx`): `ErrorBoundary > Theme > Language > Auth > Toast > Router > Search > Layout`.

---

## 5. APIs (`apis/` — frontend → backend)

Base URL configured in `apis/config.ts` (env-driven, falls back to localhost).

| File | Default export / namespace | Purpose |
|------|---------------------------|---------|
| `config.ts` | `API_BASE_URL`, `apiClient` | axios/fetch base, env detection |
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
| `provider-tokens.ts` | `providerTokensApi`, `ProviderToken` | OAuth provider tokens (Google/etc.) |
| `product-submission.ts` | `productSubmissionApi` | "Submit your AI tool" form |
| `deploy.ts` | `deployApi`, `DeployLog` | deploy logs viewer |

---

## 6. Hooks (`hooks/`)

State-machine + business-logic hooks consumed by feature workspaces.

| File | Used by |
|------|---------|
| `useAIStylist.ts` | AIStylistWorkspace |
| `useAetherFlow.ts` | AetherFlow workflow editor |
| `useAgentRegistry.ts` | Paperclip agents (`AgentSkill`, `AgentNode` types) |
| `useAppsPage.ts` | AppsPage list state |
| `useArt3DGenerator.ts` | Art3DWorkspace (`Art3DAsset`) |
| `useCaptchaToken.ts` | CaptchaToken product |
| `useCharacterSync.ts` | CharacterSyncWorkspace |
| `useDocxImport.ts` | Slide import (`DocxOutline`), uses mammoth |
| `useEventStudio.ts` | EventStudio (birthday/wedding/noel/tet) |
| `useFeatureAccess.ts` | Tier gating (`FeatureKey` enum, e.g. `'export_edl'`) |
| `useGlobalTools.ts` | GlobalToolsBar floating widget |
| `useImageGenerator.ts` | AIImageGeneratorWorkspace |
| `useImageModels.ts` | Image model dropdown (`MappedImageModel`) |
| `useJobPoller.ts` | Generic polling for image/video jobs |
| `useMusicStudio.ts` | MusicWorkspace |
| `useOrgBuilder.ts` | OrgBuilderTab in agent-workspace |
| `usePageMeta.ts` | Sets `<title>`, `<meta>` per page |
| `useProductImageEditor.ts` | ProductImageWorkspace |
| `useProjectManager.ts` | Generic project CRUD (`ProjectData`) |
| `useRealEstateAI.ts` | RealEstateWorkspace |
| `useRestoration.ts` | RestorationWorkspace |
| `useSettingsLogic.ts` | SettingsPage |
| `useSlideProjectManager.ts` | Slide projects (`SlideProject`) |
| `useSlideStudio.ts` | AISlideCreatorWorkspace |
| `useStoryboardStudio.ts` | StoryboardStudioWorkspace |
| `useVideoAnimate.ts` | VideoAnimateWorkspace |
| `useVideoModels.ts` | Video model dropdown (`KNOWN_VIDEO_FAMILIES`) |
| `useWorkflowEditor.ts` | AetherFlow legacy editor |
| `useWorkflowEditorV2.ts` | AetherFlow v2 editor |
| `admin-pro/useExplorerLogic.ts` | Admin CMS explorer view |

---

## 7. Constants (`constants/`)

| File | Exports |
|------|---------|
| `brand.ts` | `BRAND_LOGO` (local), `BRAND_LOGO_EXTERNAL` (CDN fallback) |
| `market-config.tsx` | `HomeBlockOption[]` — homepage block config (icon + i18n labels) |
| `event-configs.ts` | `EventTemplate[]` for birthday/wedding/noel/tet (icons from lucide) |
| `media-presets.ts` | `ASPECT_RATIOS`, `DEFAULT_ASPECT_RATIO`, resolution presets |

`src/constants/`:
- `aislide-showcase-cdn.ts` — CDN URLs for AISlideCreator showcase imgs
- `onboarding-slides-cdn.ts` — CDN URLs for onboarding wizard imgs
- `paperclip-cdn.ts` — CDN URLs for Paperclip landing imgs

---

## 8. Components (`components/`) — by group

### 8.1 Shell / Global

| File | Role |
|------|------|
| `Header.tsx` | Main nav: Logo, Home, Marketplace, Explore dropdown, Insights, Create, Search, User menu, Credits, Theme, Lang, Deploy CTA. Shrinks `h-16→h-14` on scroll>20px. |
| `Footer.tsx` | Site footer (links + i18n) |
| `Layout.tsx` | Page wrapper: Header + outlet + Footer |
| `LoadingScreen.tsx` | Initial app boot loader |
| `HomepageSkeleton.tsx` | Suspense skeleton for `MarketPage` |
| `ErrorBoundary.tsx` | Top-level React error boundary |
| `UniversalSearch.tsx` | ⌘K global search modal (uses `SOLUTIONS` from `data.ts`) |
| `CommandPalette.tsx` | Quick-action palette |
| `GlobalSettingsModal.tsx` | Global settings popup |
| `GlobalToolsBar.tsx` | Floating tools dock (uses `useGlobalTools`) |
| `GlobalEventBonusModal.tsx` | Bonus event popup |
| `WelcomeBonusModal.tsx` | First-login welcome credits modal |
| `WalletConnectModal.tsx` | Wallet connect (Web3 stub) |
| `UpgradeModal.tsx` | Paywall / upgrade tier |
| `CreditPurchaseModal.tsx` | Buy credits |
| `AISupportChat.tsx` | Floating chat widget (uses `aiChatApi`) |
| `FullChatModal.tsx` | Expanded chat |
| `DemoModal.tsx` / `DemoInterface.tsx` | Generic product demo modal |

### 8.2 Workspaces (top-level studios)

These are full-screen "studio" components, each paired with a route in `pages/`.

| File | Domain | Hook |
|------|--------|------|
| `AIImageGeneratorWorkspace.tsx` | image | useImageGenerator |
| `AIVideoGeneratorWorkspace.tsx` | video | (inline) |
| `AISlideCreatorWorkspace.tsx` | slides | useSlideStudio |
| `AIStylistWorkspace.tsx` | fashion | useAIStylist |
| `Art3DWorkspace.tsx` | 3d | useArt3DGenerator |
| `ArticleToVideoWorkspace.tsx` | video | (inline) |
| `AudioToVideoWorkspace.tsx` | video | (inline) |
| `AvatarLipsyncWorkspace.tsx` | video | (inline) |
| `BackgroundRemovalWorkspace.tsx` | image | (inline) |
| `BananaProWorkspace.tsx` | image (comic) | (inline) |
| `CastAndDirectWorkspace.tsx` | video | (inline) |
| `CharacterSyncWorkspace.tsx` | character | useCharacterSync |
| `EventStudioWorkspace.tsx` | event | useEventStudio |
| `FashionStudioWorkspace.tsx` | fashion | (inline) |
| `GenyuWorkspace.tsx` | studio architect | (inline) |
| `KineticWorkspace.tsx` | motion | (inline) |
| `MediaGeneratorWorkspace.tsx` | media universal | (inline) |
| `MotionSynthUltraWorkspace.tsx` | motion | (inline) |
| `MusicWorkspace.tsx` | audio | useMusicStudio |
| `PaperclipAIAgentsWizard.tsx` + `PaperclipAIAgentsWorkspace.tsx` | agent | useAgentRegistry |
| `PosterStudioWorkspace.tsx` | image | (inline) |
| `ProductImageWorkspace.tsx` | image | useProductImageEditor |
| `RealEstateVisualWorkspace.tsx` + `RealEstateWorkspace.tsx` | real-estate | useRealEstateAI |
| `RestorationWorkspace.tsx` | image | useRestoration |
| `SceneArchitectWorkspace.tsx` | 3d/scene | (inline) |
| `SocialBannerWorkspace.tsx` | image | (inline) |
| `StoryboardStudioWorkspace.tsx` | video | useStoryboardStudio |
| `TextToVideoWorkspace.tsx` / `TTSWorkspace.tsx` | audio/video | (inline) |
| `UpscaleWorkspace.tsx` | image | (inline) |
| `VideoAnimateWorkspace.tsx` | video | useVideoAnimate |
| `VoiceDesignWorkspace.tsx` / `VoiceStudioWorkspace.tsx` | audio | (inline) |
| `AUPX1Studio.tsx` | universal producer | (inline) |

### 8.3 "Interface" demo components (landing-page interactive blocks)

`AetherFlowInterface.tsx`, `AetherVisualAgentInterface.tsx`, `CinematicPipelineInterface.tsx`, `GameArchitectInterface.tsx`, `GameCharacterAgentInterface.tsx`, `IdentityDemoInterface.tsx`, `MotionCraftInterface.tsx`, `NebulaDemoInterface.tsx`, `NexusStudioInterface.tsx`, `OmniGridDemoInterface.tsx`, `PromptArchitectInterface.tsx`, `UniversalProducerInterface.tsx`.

### 8.4 Modals & utility components

`ExplorerDetailModal.tsx`, `ImageLibraryModal.tsx`, `MarketSearchTerminal.tsx`, `QuickImageGenModal.tsx`, `VoiceDesignLibrary.tsx`, `VoiceDesignModal.tsx`, `VoiceLibraryModal.tsx`, `AIModelsMarquee.tsx`, `ExploreMoreAI.tsx`.

### 8.5 Sub-folders

#### `components/aether-flow/`
Workflow editor modals & panels.
- `AetherFlowInterface.tsx`, `ConfigPanel.tsx`, `ImportWorkflowModal.tsx`, `ResultsPanel.tsx`, `SettingsDrawer.tsx`, `TemplateCard.tsx`, `WorkflowEditorModal.tsx`, `WorkflowEditorModalV2.tsx`.

#### `components/agent-workspace/`
Paperclip agent builder.
- `AgentBuilderModal.tsx`, `AgentSandbox.tsx`, `MyAgentsTab.tsx`, `OrgBuilderTab.tsx`.

#### `components/ai-stylist/`
- `SelectedItems.tsx`, `SidebarAccordion.tsx`, `TemplateModal.tsx`, `TutorialModal.tsx`.

#### `components/apps/`
AppsPage building blocks.
- `AppCard.tsx`, `AppsHero.tsx`, `CategoryTabs.tsx`, `DeveloperPortal.tsx`, `ProposalModal.tsx`, `StepIndicator.tsx`, `SubmissionFormSteps.tsx`, `SubmissionHero.tsx`.

#### `components/art-3d/`
3D editor surfaces.
- `AxisGizmo.tsx`, `BottomHUD.tsx`, `ConfirmUploadModal.tsx`, `GenerateTab.tsx`, `LeftSidebar.tsx`, `OverviewTab.tsx`, `QuickTools.tsx`, `RetopologyTab.tsx`, `RiggingTab.tsx`, `RightSidebar.tsx`, `SegmentationTab.tsx`, `TextureTab.tsx`, `TopNav.tsx`, `ViewSettingsModal.tsx`, `Viewport.tsx`.

#### `components/captcha-token/`
CaptchaToken product UI.
- `AccountTab.tsx`, `CaptchaHero.tsx`, `CaptchaPaymentModal.tsx`, `DocsTab.tsx`, `IntegrationWorkflow.tsx`, `PaymentHistoryTab.tsx`, `PricingMatrix.tsx`, `QuotaCard.tsx`, `SandboxTab.tsx`, `TelemetryTab.tsx`, `UplinkTab.tsx`.

#### `components/character-sync/`
- `ConfigurationSection.tsx`, `GuideSlider.tsx`, `ModelSelectionSection.tsx`, `NarrativeBeats.tsx`, `ParameterSettings.tsx`, `RegistrySection.tsx`, `TemplateModal.tsx`, `TutorialModal.tsx`.

#### `components/common/`
Shared building blocks across workspaces.
- `JobLogsModal.tsx` — view backend job logs
- `MobileGeneratorBar.tsx` — mobile bottom-bar pattern
- `ModelSelectorModal.tsx` — pick AI model
- `ResourceAuthModal.tsx` — provider OAuth modal
- `ServerSelector.tsx` — pick backend server
- `UniversalModelSelector.tsx` — generic model picker

#### `components/event-studio/`
- `EventConfiguration.tsx`, `EventHistory.tsx`, `EventSidebar.tsx`, `EventViewport.tsx`.

#### `components/explorer/`
ExplorerPage detail panels.
- `ActionFooter.tsx`, `ContentInfo.tsx`, `FilterHub.tsx`, `MediaViewport.tsx`, `SidebarHeader.tsx`, `TagSection.tsx`, `TechnicalSpecs.tsx`, `ThreeDPreview.tsx`.

#### `components/fashion-studio/`
- `ResourceControl.tsx`.

#### `components/image-generator/`
- `GeneratorHistory.tsx`, `GeneratorSidebar.tsx`, `GeneratorViewport.tsx`, `ImageResultCard.tsx`, `MobileGeneratorBar.tsx`, `ModelEngineSettings.tsx`, `ProductionIntelSidebar.tsx`, `ReferenceImageGrid.tsx`, `SidebarBatch.tsx`, `SidebarSingle.tsx`.

#### `components/market/`
Marketplace UI primitives (used in MarketPage / MarketsPage / SolutionDetail).
- `FeaturedSection.tsx`, `MarketSectionHeader.tsx`, `MarketSkeleton.tsx`, `ProductQuickViewModal.tsx`, `ProductToolModal.tsx`, `SolutionCard.tsx`, `SolutionList.tsx`.

#### `components/music-generator/`
- `ExpandModal.tsx`, `MusicResultCard.tsx`, `StudioSidebar.tsx`.

#### `components/product-image/`
- `EditorHeader.tsx`, `EditorSidebar.tsx`, `EditorViewport.tsx`, `ModelAISelector.tsx`, `PromptBar.tsx`.

#### `components/real-estate/`
- `ActionFooter.tsx`, `SidebarControls.tsx`, `StatusFooter.tsx`, `VideoEngineSettings.tsx`, `ViewportContent.tsx`, `ViewportHeader.tsx`.

#### `components/restoration/`
- `RestorationControls.tsx`, `RestorationSidebar.tsx`, `RestorationViewport.tsx`.

#### `components/settings/`
- `SettingsTabs.tsx`.

#### `components/shared/`
- `ImageJobCard.tsx` — universal job-card UI.

#### `components/slide-studio/`
AI Slide Creator.
- `AIGenerateModal.tsx`, `SlideCanvas.tsx`, `SlideExportModal.tsx`, `SlideFormatBar.tsx`, `SlideGeneratingOverlay.tsx`, `SlideHelpBanner.tsx`, `SlideOnboardingWizard.tsx`, `SlidePresenter.tsx`, `SlidePresenterLayouts.ts`, `SlideProjectSwitcher.tsx`, `SlidePromptBar.tsx`, `SlideSidebar.tsx`, `SlideTextBlock.tsx`, `SlideTextObject.tsx`, `SlideTextStyleBar.tsx`, `SlideThumbnailList.tsx`, `SlideToolbar.tsx`.

#### `components/storyboard-studio/`
Storyboard editor.
- `AIGeneratingScreen.tsx`, `AIScriptAssistant.tsx`, `ActSection.tsx`, `AdvancedSettings.tsx`, `AestheticProfileModal.tsx`, `AssetsTab.tsx`, `CharacterEditModal.tsx`, `ExportTab.tsx`, `FooterControls.tsx`, `HeaderNav.tsx`, `IdentityAnchors.tsx`, `LogicTab.tsx`, `OnboardingWizard.tsx`, `ProjectSwitcher.tsx`, `RenderConfig.tsx`, `RenderConfigModal.tsx`, `SettingsTab.tsx`, `ShortcutsModal.tsx`, `StoryboardProgressModal.tsx`, `StoryboardTab.tsx`, `TemplatePickerModal.tsx`, `TimelineView.tsx`.

#### `components/video-animate/`
- `AnimateHistory.tsx`, `AnimateIntelView.tsx`, `AnimateSidebar.tsx`, `AnimateTemplateModal.tsx`, `AnimateViewport.tsx`.

#### `components/video-generator/`
- `ConfigurationPanel.tsx`, `DurationSelector.tsx`, `JobLogsModal.tsx`, `ModelEngineSelector.tsx`, `ResultsMain.tsx`, `SidebarLeft.tsx`, `VideoCard.tsx`, `VideoModelEngineSettings.tsx`.

#### `components/workspace/`
- `AISuggestPanel.tsx`.

#### `components/landing/`
Landing-page sections (per product). Each sub-folder follows the same pattern: `HeroSection`, `FeaturesSection`, `ShowcaseSection`, `WorkflowSection`, `UseCasesSection`, `LiveStatsBar`, `FAQSection`, `FinalCTA`.

| Sub-folder | Files |
|------------|-------|
| `_shared/` | `ProHeroVisuals.tsx`, `SectionAnimations.tsx` |
| `ai-slide-creator/` | FAQSection, FeaturesSection, FinalCTA, HeroSection, LiveStatsBar, ShowcaseSection, UseCasesSection, WorkflowSection, `index.ts` |
| `image-generator/` | FinalCTA, HeroSection, ModesSection, UseCasesSection, WorkflowSection |
| `image-restoration/` | FeaturesSection, FinalCTA, HeroSection, ShowcaseSection, WorkflowSection |
| `paperclip-ai-agents/` | FAQSection, FeaturesSection, FinalCTA, HeroSection, LiveStatsBar, ShowcaseSection, UseCasesSection, WorkflowSection |
| `product-image/` | FAQSection, FeaturesSection, FinalCTA, HeroSection, LiveStatsBar, ModesSection, UseCasesSection, WorkflowSection |
| `realestate-visual-ai/` | FAQSection, FeaturesSection, FinalCTA, HeroSection, LiveStatsBar, ShowcaseSection, UseCasesSection, WorkflowSection |
| `social-banner-ai/` | FAQSection, FeaturesSection, FinalCTA, HeroSection, LiveStatsBar, ShowcaseSection, UseCasesSection, WorkflowSection |
| `video-generator/` | FinalCTA, HeroSection, ModesSection, UseCasesSection, WorkflowSection |

---

## 9. Pages (`pages/`)

### Top-level

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
| `SolutionDetail.tsx` | Generic product detail (fallback) |
| `SolutionsPage.tsx` | Solutions overview, embedded `SOLUTIONS` |
| `UseCasesPage.tsx` | `USE_CASE_CATEGORIES` |
| `PricingPage.tsx` | Plans table |
| `BookingPage.tsx` | Deploy / contact form |
| `AboutPage.tsx` | About + STATS |
| `SettingsPage.tsx` | User settings |
| `FavoritesPage.tsx` | Favorites list |
| `ReferralPage.tsx` | Referral program |
| `PolicyPage.tsx` | Legal/Terms (`PolicyCard`) |
| `ImageLibraryPage.tsx` | IndexedDB-backed library (`DB_NAME`) |
| `AdminMarketCMS.tsx` | Admin CMS (legacy, see `cms/` sub-app) |
| `NebulaVisionEngine.tsx` | Demo product page |
| `SpatialArchitectPage.tsx` | 3D spatial product, `LIVE_3D_MODELS` |
| `NoCodeExportPage.tsx` | NoCode export landing |
| `QwenChatAIPage.tsx` | Qwen chat product |

### Product pages (top-level under `pages/`)

| File | Slug |
|------|------|
| `ProductAIAgent.tsx` | (legacy) |
| `ProductAIAgentWorkflow.tsx` | `/product/ai-agent-workflow` |
| `ProductAgentImage.tsx` | (legacy) |
| `ProductCaptchaToken.tsx` | `/product/captcha-veo3` |
| `ProductCharacterSync.tsx` | `/product/character-sync-ai`, has CDN const |
| `ProductCinematicAgent.tsx` | (legacy) |
| `ProductGame1.tsx` | (legacy) |
| `ProductGameCharacterAgent.tsx` | (legacy) |
| `ProductPrompt1.tsx` | (legacy) |
| `ProductUniversalProducer.tsx` | (legacy) |

### `pages/audio/`

| File | Slug |
|------|------|
| `MusicGenerator.tsx` | `/product/ai-music-generator`, `/product/music-generator` |
| `TextToSpeech.tsx` | `/product/text-to-speech` |
| `VoiceDesignAI.tsx` | `/product/voice-design-ai` |
| `VoiceStudio.tsx` | `/product/ai-voice-studio` |

### `pages/images/`

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

### `pages/slides/`

| File | Slug |
|------|------|
| `AISlideCreatorPage.tsx` | `/product/ai-slide-creator` |

### `pages/videos/`

| File | Slug |
|------|------|
| `AIVideoGenerator.tsx` | `/product/ai-video-generator` |
| `AvatarLipsyncAI.tsx` | `/product/avatar-sync-ai` |
| `FibusVideoStudio.tsx` | `/product/fibus-video-studio` |
| `GenyuProduct.tsx` | `/product/studio-architect` |
| `StoryboardStudioPage.tsx` | `/product/storyboard-studio` |
| `VideoAnimateAI.tsx` | `/product/video-animate-ai` |

---

## 10. Services & Utils

`services/`
- `storage.ts` — IndexedDB / localStorage wrapper
- `uploadPoller.ts` — polls upload status

`utils/`
- `adminAuth.ts` — admin role guard
- `apiCache.ts` — in-memory cache for API responses
- `downloadDocxTemplate.ts` — DOCX template download helper
- `pricing-helpers.ts` — credit/USD/VND conversion + formatting

---

## 11. Scripts (`scripts/`)

Two TS helpers + many bash/cjs scripts for content generation & CDN sync.

| Type | Files |
|------|-------|
| TS | `add-market-product.ts`, `example-video-api.js` |
| CDN sync (bash) | `*_cdn.sh`, `*_cdn_urls.sh` (per product: aislide, charactersync, image_restorer, imagegen_landing, paperclip, productimage, realestate, socialbanner, storyboard_landing, onboarding_slides) |
| Image gen (bash) | `gen_aislide_*.sh`, `gen_banners.sh`, `gen_blocks.sh`, `gen_charactersync_*.sh`, `gen_credit_banners.sh`, `gen_enterprise_images.sh`, `gen_homepage_images.sh`, `gen_image_restorer_*.sh`, `gen_imagegen_landing.sh`, `gen_onboarding_slides.sh`, `gen_paperclip_landing.sh`, `gen_productimage_landing_images.sh`, `gen_realestate_*.sh`, `gen_seo_thumbnail.sh`, `gen_showcase_remaining.sh`, `gen_socialbanner_*.sh`, `gen_storyboard_landing.sh` |
| Apply CDN (cjs) | `apply_image_restorer_cdn.cjs`, `apply_image_restorer_extra_cdn.cjs` |
| Ops | `backup-db.sh`, `poll_and_upload_showcase.sh`, `upload_realestate_to_cdn.sh` |

Root mjs seeders: `seed-products.mjs`, `seed-realestate-visual-ai.mjs`, `seed-social-banner-ai.mjs`, `update-product-images.mjs`, `gen-realestate-visual-ai-images.mjs`, `gen-social-banner-ai-image.mjs`.

---

## 12. Sub-projects

### `cms/` — Admin CMS (independent Vite app)

Mini-app mirroring the main app's primitives but for admin use.

```
cms/
├── App.tsx, index.tsx, vite.config.ts, data.ts, types.ts
├── apis/   (mirrors root /apis: ai-models, api-client, auth, blog, config, credits, deploy, explorer, images, market, media, pricing, product-submission, provider-tokens, upscale, user, videos)
├── components/  Header.tsx, Footer.tsx, Layout.tsx, LoadingScreen.tsx, ExplorerDetailModal.tsx
├── constants/   market-config.tsx, media-presets.ts
├── context/     AuthContext, LanguageContext, ThemeContext, ToastContext (subset of root)
├── hooks/       useSettingsLogic.ts
├── pages/       AdminCmsProPage.tsx, LoginPage.tsx
├── services/    gemini.ts, storage.ts
└── utils/       adminAuth.ts, pricing-helpers.ts
```

### `blog/` — Blog frontend (independent Vite app)

```
blog/
├── App.tsx, index.tsx, vite.config.ts, types.ts, vite-env.d.ts
├── apis/        blog.ts, config.ts
├── components/  BlogHeader.tsx, BlogFooter.tsx, PostCard.tsx
├── context/     LanguageContext.tsx, ThemeContext.tsx
├── hooks/       usePageMeta.ts
└── pages/       BlogHomePage, BlogPostPage, PrivacyPage, RSSFeedPage, SearchPage, SitemapPage, TagPage
```

### `skyverses-backend/` — Express + Mongoose API (`~163 src files`)

```
skyverses-backend/
├── package.json, tsconfig.json, gcp-key.json, service-account.json
├── runninghub/, scripts/, tmp-videos/, uploads/  (runtime data)
├── dist/                  Compiled JS (DO NOT edit)
└── src/
    ├── index.ts           Express bootstrap
    ├── swagger.ts         OpenAPI docs
    ├── cloneDb.ts         DB clone util
    ├── config/keyGenminiGommo.ts     API key rotation
    ├── constanst/         (sic — typo) index.ts, plans.ts
    │
    ├── routes/            29 route files (REST endpoints)
    │   ai.ts, aiModel.admin.ts, apiClient.ts, audio.ts, auth.ts, blog.ts,
    │   category.route.ts, config.ts, credit.router.ts, customer.ts,
    │   deployLogs.ts, editImageJobs.ts, explorerMedia.router.ts,
    │   fxflow.ts, grok.ts, imageJobs.ts, index.ts, market.ts,
    │   pricing.router.ts, productSubmission.ts, providerToken.ts,
    │   runninghub.ts, uploadMedia.ts, upscaleJobs.ts, user.ts,
    │   video.ts, videoJobs.ts, webhook.ts, workerRouter.ts
    │
    ├── models/            30 Mongoose schemas
    │   AIModel, AffiliateTransaction, BankTransaction, BlogPost, Category,
    │   CreditPackage, CreditTransaction, DeployLog, EditImageJob,
    │   ExplorerMedia, FxflowOwner, GoogleToken, ImageBase64, ImageJob,
    │   ImageOwner, MarketItem, MetaPromptTemplate, ModelPricingMatrix,
    │   Plan, PlanPurchase, ProductSubmission, PromptGenerationJob,
    │   ProviderToken, RunningHubTemplate, ServerStatus, SystemSetting,
    │   User, VideoConcatJob, VideoJob, VideoJobV2
    │
    ├── jobs/              Worker pool — image / video / music
    │   ├── image/
    │   │   ├── imageWorker.ts
    │   │   ├── polling/pollEngine.ts
    │   │   └── engines/{fxlab,gommo,running,veo}/  adapter+request per provider
    │   ├── video/
    │   │   ├── videoWorker.ts
    │   │   ├── polling/pollEngine.ts
    │   │   └── engines/{fxlab,gommo,veo,wan}/      wan/ has rich core/* files
    │   ├── music/
    │   │   ├── musicWorker.ts
    │   │   ├── polling/pollEngine.ts
    │   │   └── engines/{fxlab,gommo,veo,wan}/
    │   ├── cleanupProviderTokens.ts
    │   ├── syncGommoImageModels.ts
    │   ├── syncGommoPublicImages.ts
    │   ├── syncGommoPublicVideos.ts
    │   ├── syncRunningHubTemplates.ts
    │   ├── utils/requestCaptchaToken.ts
    │   └── index.ts
    │
    ├── services/
    │   ├── runninghub/{index.ts, syncTemplates.ts}
    │   └── utils/affiliate.ts
    │
    ├── scripts/           asynsDataMongo, seed-ai-models, seedAdmin, seedCategories, updatePricingX2
    │
    └── utils/             buildFinalImagePayload, buildPricingMatrix, checkPlanValidity,
                           downloadVideoFromUrl, fetchSessionFromCookie, getAccessTokenForJob,
                           getCookieForJob, getPricingCredits, image, isSameDay, makeSlug,
                           refundJobCredits, roleHelpers
```

**Engine pattern (jobs/{image,video,music}/engines/<provider>/):**
- `adapter.ts` — translates job spec to provider-specific request
- `request.ts` — HTTP layer to provider
- `core/*.ts` — provider-specific helpers (esp. for `wan`: model lists, sizes, polling)

---

## 13. Conventions (cheat-sheet)

- **TypeScript** everywhere; avoid `any`.
- **Tailwind** for styling — no inline styles. Brand color = `brand-blue`.
- **framer-motion** `<motion.div>` + `<AnimatePresence>` for transitions.
- **Routing:** `<Link>` internal, `<a target="_blank" rel="noopener">` external.
- **Mobile-first:** `hidden md:flex` pattern; mobile drawer slides from right (`max-w-sm`).
- **Auth-gated UI:** `{isAuthenticated && (...)}`.
- **i18n:** `t('key')` from `useLanguage()` for all user-facing text. Languages: `en`, `vi`, `ko`, `ja`.
- **Lazy routes:** all page imports go through `pageImports` map in `App.tsx` for prefetch.
- **Header behavior:** shrinks `h-16 → h-14` after 20px scroll.
- **Avatar fallback:** framerusercontent CDN image (see `DEFAULT_AVATAR`).
- **Job pattern:** `useJobPoller` polls backend `imageJobs` / `videoJobs` until `status ∈ {success, failed}`.
- **Provider engines (backend):** `fxlab`, `gommo`, `running` (RunningHub), `veo` (Google), `wan` (Wan API).
- **Backend folder typo:** `src/constanst/` (intentional — don't rename without grep).

---

## 14. Skills (`.agents/skills/`)

| Skill | Topics |
|-------|--------|
| `skyverses_ui_pages` | Homepage, MarketPage, product grid, filters, CMS blocks |
| `skyverses_architecture` | System architecture, API structure, backend |
| `skyverses_business_flows` | Auth flows, credits, payments, referral |
| `skyverses_cms` | CMS system, homeBlocks, content management |

---

## 15. Quick lookup — "where is X?"

| Need | Path |
|------|------|
| Add a new product route | `App.tsx` (add to `pageImports` + `<Route>`) |
| Add new API call | `apis/<domain>.ts` |
| Edit homepage block ordering | `constants/market-config.tsx` + `pages/MarketPage.tsx` |
| Tweak header/menu | `components/Header.tsx` |
| Add language string | `context/LanguageContext.tsx` (translation map) |
| Change brand color | `tailwind.config.ts` → `theme.extend.colors.brand` |
| Add backend endpoint | `skyverses-backend/src/routes/<file>.ts` + register in `routes/index.ts` |
| Add backend model | `skyverses-backend/src/models/<Name>.model.ts` |
| Add new image engine | `skyverses-backend/src/jobs/image/engines/<provider>/` |
| Wire up new credit feature | `apis/credits.ts` + `utils/pricing-helpers.ts` + backend `credit.router.ts` |
| New landing page sections | `components/landing/<product>/` (follow Hero/Features/… pattern) |

---

*EOF — regenerate after structural changes.*
