# Coding Conventions

## TypeScript
- Bắt buộc TypeScript (no `any` trừ khi không tránh được)
- Types chung: `types.ts` (`Language`, `Solution`, `SystemConfig`, `LocalizedString`, `NeuralStackItem`, `HomeBlock`, …)
- `LocalizedString = { en, vi, ko, ja }` cho mọi i18n field

## Styling
- Tailwind 3 cho mọi style — không inline style
- Brand color: `brand-blue` (#0090ff), `brand-dark`, `brand-gray`, `brand-muted` (`tailwind.config.ts`)
- Font: `Inter` (sans), `JetBrains Mono` (mono)
- Dark mode: `darkMode: 'class'` → `<html class="dark">`

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
| `skyverses_architecture` | System architecture, API, backend |
| `skyverses_business_flows` | Auth, credits, payments, referral |
| `skyverses_cms` | CMS, homeBlocks, content management |
