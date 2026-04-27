# Components — `components/` (324 files)

## Shell / Global (top-level)

| File | Role |
|------|------|
| `Header.tsx` | Main nav: Logo→Home→Marketplace→Explore↓→Insights→Create. Right: Search, Credits, Theme, Lang, User, Deploy CTA. Shrinks `h-16→h-14` khi scroll>20px. |
| `Footer.tsx` | Site footer (links + i18n) |
| `Layout.tsx` | Page wrapper: Header + outlet + Footer |
| `LoadingScreen.tsx` | Initial app boot loader |
| `HomepageSkeleton.tsx` | Suspense skeleton cho `MarketPage` |
| `ErrorBoundary.tsx` | Top-level React error boundary |
| `UniversalSearch.tsx` | ⌘K global search (`SOLUTIONS` từ `data.ts`) |
| `CommandPalette.tsx` | Quick-action palette |
| `GlobalSettingsModal.tsx` | Global settings popup |
| `GlobalToolsBar.tsx` | Floating tools dock (`useGlobalTools`) |
| `GlobalEventBonusModal.tsx` | Bonus event popup |
| `WelcomeBonusModal.tsx` | First-login welcome credits |
| `WalletConnectModal.tsx` | Web3 wallet stub |
| `UpgradeModal.tsx` | Paywall / tier upgrade |
| `CreditPurchaseModal.tsx` | Buy credits |
| `AISupportChat.tsx` | Floating chat widget (`aiChatApi`) |
| `FullChatModal.tsx` | Expanded chat |
| `DemoModal.tsx` / `DemoInterface.tsx` | Generic product demo |

## Workspaces (full-screen studios — paired với 1 page)

| File | Domain | Hook |
|------|--------|------|
| `AIImageGeneratorWorkspace.tsx` | image | `useImageGenerator` |
| `AIVideoGeneratorWorkspace.tsx` | video | inline |
| `AISlideCreatorWorkspace.tsx` | slides | `useSlideStudio` |
| `AIStylistWorkspace.tsx` | fashion | `useAIStylist` |
| `Art3DWorkspace.tsx` | 3d | `useArt3DGenerator` |
| `ArticleToVideoWorkspace.tsx` | video | inline |
| `AudioToVideoWorkspace.tsx` | video | inline |
| `AvatarLipsyncWorkspace.tsx` | video | inline |
| `BackgroundRemovalWorkspace.tsx` | image | inline |
| `BananaProWorkspace.tsx` | image (comic) | inline |
| `CastAndDirectWorkspace.tsx` | video | inline |
| `CharacterSyncWorkspace.tsx` | character | `useCharacterSync` |
| `EventStudioWorkspace.tsx` | event | `useEventStudio` |
| `FashionStudioWorkspace.tsx` | fashion | inline |
| `GenyuWorkspace.tsx` | studio architect | inline |
| `KineticWorkspace.tsx` | motion | inline |
| `MediaGeneratorWorkspace.tsx` | media universal | inline |
| `MotionSynthUltraWorkspace.tsx` | motion | inline |
| `MusicWorkspace.tsx` | audio | `useMusicStudio` |
| `PaperclipAIAgentsWizard.tsx` + `PaperclipAIAgentsWorkspace.tsx` | agent | `useAgentRegistry` |
| `PosterStudioWorkspace.tsx` | image | inline |
| `ProductImageWorkspace.tsx` | image | `useProductImageEditor` |
| `RealEstateVisualWorkspace.tsx` + `RealEstateWorkspace.tsx` | real-estate | `useRealEstateAI` |
| `RestorationWorkspace.tsx` | image | `useRestoration` |
| `SceneArchitectWorkspace.tsx` | 3d/scene | inline |
| `SocialBannerWorkspace.tsx` | image | inline |
| `StoryboardStudioWorkspace.tsx` | video | `useStoryboardStudio` |
| `TextToVideoWorkspace.tsx` / `TTSWorkspace.tsx` | video/audio | inline |
| `UpscaleWorkspace.tsx` | image | inline |
| `VideoAnimateWorkspace.tsx` | video | `useVideoAnimate` |
| `VoiceDesignWorkspace.tsx` / `VoiceStudioWorkspace.tsx` | audio | inline |
| `AUPX1Studio.tsx` | universal producer | inline |

## Demo Interfaces (landing-page interactive blocks)

`AetherFlowInterface.tsx`, `AetherVisualAgentInterface.tsx`, `CinematicPipelineInterface.tsx`, `GameArchitectInterface.tsx`, `GameCharacterAgentInterface.tsx`, `IdentityDemoInterface.tsx`, `MotionCraftInterface.tsx`, `NebulaDemoInterface.tsx`, `NexusStudioInterface.tsx`, `OmniGridDemoInterface.tsx`, `PromptArchitectInterface.tsx`, `UniversalProducerInterface.tsx`.

## Modals & Misc

`ExplorerDetailModal.tsx`, `ImageLibraryModal.tsx`, `MarketSearchTerminal.tsx`, `QuickImageGenModal.tsx`, `VoiceDesignLibrary.tsx`, `VoiceDesignModal.tsx`, `VoiceLibraryModal.tsx`, `AIModelsMarquee.tsx`, `ExploreMoreAI.tsx`.

---

## Sub-folders (25 group)

### `aether-flow/` — Workflow editor (8 file)
`AetherFlowInterface.tsx`, `ConfigPanel.tsx`, `ImportWorkflowModal.tsx`, `ResultsPanel.tsx`, `SettingsDrawer.tsx`, `TemplateCard.tsx`, `WorkflowEditorModal.tsx`, `WorkflowEditorModalV2.tsx`.

### `agent-workspace/` — Paperclip agents (4 file)
`AgentBuilderModal.tsx`, `AgentSandbox.tsx`, `MyAgentsTab.tsx`, `OrgBuilderTab.tsx`.

### `ai-stylist/` — Stylist (4 file)
`SelectedItems.tsx`, `SidebarAccordion.tsx`, `TemplateModal.tsx`, `TutorialModal.tsx`.

### `apps/` — AppsPage primitives (8 file)
`AppCard.tsx`, `AppsHero.tsx`, `CategoryTabs.tsx`, `DeveloperPortal.tsx`, `ProposalModal.tsx`, `StepIndicator.tsx`, `SubmissionFormSteps.tsx`, `SubmissionHero.tsx`.

### `art-3d/` — 3D editor (15 file)
`AxisGizmo.tsx`, `BottomHUD.tsx`, `ConfirmUploadModal.tsx`, `GenerateTab.tsx`, `LeftSidebar.tsx`, `OverviewTab.tsx`, `QuickTools.tsx`, `RetopologyTab.tsx`, `RiggingTab.tsx`, `RightSidebar.tsx`, `SegmentationTab.tsx`, `TextureTab.tsx`, `TopNav.tsx`, `ViewSettingsModal.tsx`, `Viewport.tsx`.

### `captcha-token/` — CaptchaToken product (11 file)
`AccountTab.tsx`, `CaptchaHero.tsx`, `CaptchaPaymentModal.tsx`, `DocsTab.tsx`, `IntegrationWorkflow.tsx`, `PaymentHistoryTab.tsx`, `PricingMatrix.tsx`, `QuotaCard.tsx`, `SandboxTab.tsx`, `TelemetryTab.tsx`, `UplinkTab.tsx`.

### `character-sync/` — Character sync (8 file)
`ConfigurationSection.tsx`, `GuideSlider.tsx`, `ModelSelectionSection.tsx`, `NarrativeBeats.tsx`, `ParameterSettings.tsx`, `RegistrySection.tsx`, `TemplateModal.tsx`, `TutorialModal.tsx`.

### `common/` — Cross-workspace (6 file)
- `JobLogsModal.tsx` — view backend job logs
- `MobileGeneratorBar.tsx` — mobile bottom-bar pattern
- `ModelSelectorModal.tsx` — pick AI model
- `ResourceAuthModal.tsx` — provider OAuth modal
- `ServerSelector.tsx` — pick backend server
- `UniversalModelSelector.tsx` — generic model picker

### `event-studio/` — Event (4 file)
`EventConfiguration.tsx`, `EventHistory.tsx`, `EventSidebar.tsx`, `EventViewport.tsx`.

### `explorer/` — ExplorerPage (8 file)
`ActionFooter.tsx`, `ContentInfo.tsx`, `FilterHub.tsx`, `MediaViewport.tsx`, `SidebarHeader.tsx`, `TagSection.tsx`, `TechnicalSpecs.tsx`, `ThreeDPreview.tsx`.

### `fashion-studio/` — Fashion (1 file)
`ResourceControl.tsx`.

### `image-generator/` — Image gen (10 file)
`GeneratorHistory.tsx`, `GeneratorSidebar.tsx`, `GeneratorViewport.tsx`, `ImageResultCard.tsx`, `MobileGeneratorBar.tsx`, `ModelEngineSettings.tsx`, `ProductionIntelSidebar.tsx`, `ReferenceImageGrid.tsx`, `SidebarBatch.tsx`, `SidebarSingle.tsx`.

### `market/` — Marketplace primitives (7 file)
`FeaturedSection.tsx`, `MarketSectionHeader.tsx`, `MarketSkeleton.tsx`, `ProductQuickViewModal.tsx`, `ProductToolModal.tsx`, `SolutionCard.tsx`, `SolutionList.tsx`.

### `music-generator/` — Music (3 file)
`ExpandModal.tsx`, `MusicResultCard.tsx`, `StudioSidebar.tsx`.

### `product-image/` — Product image editor (5 file)
`EditorHeader.tsx`, `EditorSidebar.tsx`, `EditorViewport.tsx`, `ModelAISelector.tsx`, `PromptBar.tsx`.

### `real-estate/` — Real estate (6 file)
`ActionFooter.tsx`, `SidebarControls.tsx`, `StatusFooter.tsx`, `VideoEngineSettings.tsx`, `ViewportContent.tsx`, `ViewportHeader.tsx`.

### `restoration/` — Image restoration (3 file)
`RestorationControls.tsx`, `RestorationSidebar.tsx`, `RestorationViewport.tsx`.

### `settings/` (1 file)
`SettingsTabs.tsx`.

### `shared/` (1 file)
`ImageJobCard.tsx` — universal job-card UI.

### `slide-studio/` — AI Slide Creator (17 file)
`AIGenerateModal.tsx`, `SlideCanvas.tsx`, `SlideExportModal.tsx`, `SlideFormatBar.tsx`, `SlideGeneratingOverlay.tsx`, `SlideHelpBanner.tsx`, `SlideOnboardingWizard.tsx`, `SlidePresenter.tsx`, `SlidePresenterLayouts.ts`, `SlideProjectSwitcher.tsx`, `SlidePromptBar.tsx`, `SlideSidebar.tsx`, `SlideTextBlock.tsx`, `SlideTextObject.tsx`, `SlideTextStyleBar.tsx`, `SlideThumbnailList.tsx`, `SlideToolbar.tsx`.

### `storyboard-studio/` — Storyboard (22 file)
`AIGeneratingScreen.tsx`, `AIScriptAssistant.tsx`, `ActSection.tsx`, `AdvancedSettings.tsx`, `AestheticProfileModal.tsx`, `AssetsTab.tsx`, `CharacterEditModal.tsx`, `ExportTab.tsx`, `FooterControls.tsx`, `HeaderNav.tsx`, `IdentityAnchors.tsx`, `LogicTab.tsx`, `OnboardingWizard.tsx`, `ProjectSwitcher.tsx`, `RenderConfig.tsx`, `RenderConfigModal.tsx`, `SettingsTab.tsx`, `ShortcutsModal.tsx`, `StoryboardProgressModal.tsx`, `StoryboardTab.tsx`, `TemplatePickerModal.tsx`, `TimelineView.tsx`.

### `video-animate/` (5 file)
`AnimateHistory.tsx`, `AnimateIntelView.tsx`, `AnimateSidebar.tsx`, `AnimateTemplateModal.tsx`, `AnimateViewport.tsx`.

### `video-generator/` (8 file)
`ConfigurationPanel.tsx`, `DurationSelector.tsx`, `JobLogsModal.tsx`, `ModelEngineSelector.tsx`, `ResultsMain.tsx`, `SidebarLeft.tsx`, `VideoCard.tsx`, `VideoModelEngineSettings.tsx`.

### `workspace/` (1 file)
`AISuggestPanel.tsx`.

### `landing/` — Landing-page sections (per product)

Pattern mỗi sub-folder: `HeroSection`, `FeaturesSection`, `ShowcaseSection`, `WorkflowSection`, `UseCasesSection`, `LiveStatsBar`, `FAQSection`, `FinalCTA`.

| Sub-folder | Files |
|------------|-------|
| `_shared/` | `ProHeroVisuals.tsx`, `SectionAnimations.tsx` |
| `ai-slide-creator/` | FAQ, Features, FinalCTA, Hero, LiveStatsBar, Showcase, UseCases, Workflow, `index.ts` |
| `image-generator/` | FinalCTA, Hero, Modes, UseCases, Workflow |
| `image-restoration/` | Features, FinalCTA, Hero, Showcase, Workflow |
| `paperclip-ai-agents/` | FAQ, Features, FinalCTA, Hero, LiveStatsBar, Showcase, UseCases, Workflow |
| `product-image/` | FAQ, Features, FinalCTA, Hero, LiveStatsBar, Modes, UseCases, Workflow |
| `realestate-visual-ai/` | FAQ, Features, FinalCTA, Hero, LiveStatsBar, Showcase, UseCases, Workflow |
| `social-banner-ai/` | FAQ, Features, FinalCTA, Hero, LiveStatsBar, Showcase, UseCases, Workflow |
| `video-generator/` | FinalCTA, Hero, Modes, UseCases, Workflow |
