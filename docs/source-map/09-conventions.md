# Coding Conventions

## TypeScript
- Bắt buộc TypeScript (no `any` trừ khi không tránh được)
- Types chung: `types.ts` (`Language`, `Solution`, `SystemConfig`, `LocalizedString`, `NeuralStackItem`, `HomeBlock`, …)
- `LocalizedString = { en, vi, ko, ja }` cho mọi i18n field

## Styling — Gold/Black/White theme (updated 2026-05)
- Tailwind 3 cho mọi style — không inline style
- **Brand color:** primary gold `#C9A84C`, hover `#B8963F`, light `#E5C767`
- **Tailwind aliases:** `brand-blue` → `#C9A84C` (gold, legacy alias), `brand-blueHover` → `#B8963F`
- **Atlas primitives** (`components/atlas/`): `AtlasButton`, `AtlasCard`, `AtlasSection`, `AtlasPill`, `AtlasHero` — vẫn dùng class `atlas.*` nhưng config đã map sang gold
- **Token CSS vars** trong `src/index.css`: `--atlas-bg-page`, `--atlas-bg-panel`, `--atlas-text-primary`, `--atlas-border` (đổi tự động theo light/dark)
- **Font:** `Manrope` (sans, primary), `Plus Jakarta Sans` (display), `Fragment Mono` (mono). Inter/JetBrains giữ làm fallback
- **Border-radius default = 4px** (Atlas signature). Cards `rounded-atlas-card` (8px), pills `rounded-full`
- **Shadows:** `shadow-atlas-xs/sm/md/lg/xl`, gold glow dùng `rgba(201,168,76,...)`
- **Gradients:** CTA gold gradient, text gradient cho heading
- **Utility classes** (component layer): `atlas-btn`, `atlas-btn-outline`, `atlas-btn-ghost`, `atlas-card`, `atlas-pill`, `atlas-glass`, `atlas-nav`, `atlas-container`, `atlas-section`
- **Easing:** `ease-atlas` (`cubic-bezier(.22,1,.36,1)`), `ease-atlas-spring`
- **Stagger reveal:** wrap children với `.atlas-stagger`, set `style={{ '--i': N }}` (30ms increment)
- Dark mode: `darkMode: 'class'` → `<html class="dark">` (token vars tự switch)

## Animation
- `framer-motion` cho show/hide: `<motion.div>` + `<AnimatePresence>`
- Page transition: top loading bar (`PageLoader` trong `App.tsx`)

## Routing
- `<Link to="...">` cho internal
- `<a target="_blank" rel="noopener noreferrer">` cho external
- Lazy: tất cả page imports đi qua `pageImports` map trong `App.tsx`
- Prefetch on idle: critical routes (markets, credits, solutionDetail, aiImageGenerator, aiVideo)

## Mobile-first
- Pattern: `hidden md:flex` cho desktop-only
- Mobile drawer: slide từ phải, 85% width, `max-w-sm`
- Mobile generator bar: `components/common/MobileGeneratorBar.tsx` hoặc `image-generator/MobileGeneratorBar.tsx`

## Auth
- Wrap UI: `{isAuthenticated && (...)}`
- Tier check: `useFeatureAccess(feature)` với `FeatureKey` enum
- Avatar fallback: `framerusercontent` CDN

## i18n
- `const { t } = useLanguage()` → `t('key')` cho mọi user-facing text
- 4 ngôn ngữ: `en`, `vi`, `ko`, `ja`

## Header behavior
- Shrinks `h-16 → h-14` sau scroll > 20px
- ⌘K mở `UniversalSearch`

## Job pattern (image/video/music)
1. Workspace → `<domain>Api.create(payload)` → trả `{jobId}`
2. `useJobPoller(jobId)` poll mỗi 2-3s
3. Khi `status ∈ {success, failed}` → render result
4. `useAuth().refreshCredits()` để cập nhật balance

## Backend engines
- 5 provider: `fxlab`, `gommo`, `running` (RunningHub), `veo` (Google), `wan` (Wan API)
- Mỗi engine: `adapter.ts` (job → provider format), `request.ts` (HTTP layer), `core/*.ts` (helpers)

## Quirks
- Backend folder typo: `src/constanst/` (không phải `constants`) — đừng rename không grep trước
- 80+ markdown reports ở root từ exploration trước (`AUDIT_*`, `CODEBASE_*`, …) — coi như reference legacy

## Skills (`.agents/skills/`)
| Skill | Topics |
|-------|--------|
| `skyverses_ui_pages` | Homepage, MarketPage, product grid, CMS blocks |
| `skyverses_ui_style` | UI/UX style guide — Atlas design system: colors, typography, spacing, animations, component patterns, page templates |
| `skyverses_architecture` | System architecture, API, backend |
| `skyverses_business_flows` | Auth, credits, payments, referral, SKT |
| `skyverses_cms` | CMS, homeBlocks, content management |
| `skyverses_admin_api` | Admin API reference |
