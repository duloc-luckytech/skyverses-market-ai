# Hooks — `hooks/` (31 files)

State machine + business logic per workspace.

| File | Used by |
|------|---------|
| `useAIStylist.ts` | AIStylistWorkspace |
| `useAetherFlow.ts` | AetherFlow editor |
| `useAgentRegistry.ts` | Paperclip agents (`AgentSkill`, `AgentNode`) |
| `useAppsPage.ts` | AppsPage list state |
| `useArt3DGenerator.ts` | Art3DWorkspace (`Art3DAsset`) |
| `useCaptchaToken.ts` | CaptchaToken product |
| `useCharacterSync.ts` | CharacterSyncWorkspace |
| `useDocxImport.ts` | Slide import (`DocxOutline`), uses `mammoth` |
| `useEventStudio.ts` | EventStudio (birthday/wedding/noel/tet) |
| `useFeatureAccess.ts` | Tier gating (`FeatureKey` enum, e.g. `'export_edl'`) |
| `useGlobalTools.ts` | GlobalToolsBar dock |
| `useImageGenerator.ts` | AIImageGeneratorWorkspace |
| `useImageModels.ts` | Image model dropdown (`MappedImageModel`) |
| `useJobPoller.ts` | **Generic polling cho image/video/music jobs** |
| `useMusicStudio.ts` | MusicWorkspace |
| `useOrgBuilder.ts` | OrgBuilderTab (agent-workspace) |
| `usePageMeta.ts` | Set `<title>`, `<meta>` per page |
| `usePodcastVoice.ts` | PodcastVoiceWorkspace |
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

**Admin hook:** `hooks/admin-pro/useExplorerLogic.ts` — Admin CMS explorer view (outside main hooks count).

## Key types exported

- `useAgentRegistry.ts` → `AgentSkill`, `AgentNode`
- `useArt3DGenerator.ts` → `Art3DAsset`
- `useDocxImport.ts` → `DocxOutline`
- `useFeatureAccess.ts` → `FeatureKey` (union: `'export_edl' | ...`)
- `useImageModels.ts` → `MappedImageModel`
- `useOrgBuilder.ts` → `OrgNode`
- `useProjectManager.ts` → `ProjectData`
- `useSlideProjectManager.ts` → `SlideProject`
- `useVideoModels.ts` → `KNOWN_VIDEO_FAMILIES` (const array)
