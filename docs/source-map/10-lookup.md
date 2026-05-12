# Quick Lookup — "Where is X?"

| Need | Path |
|------|------|
| Add a new product route | `App.tsx` (thêm vào `pageImports` + `<Route>`) |
| Add new API call | `apis/<domain>.ts` |
| Edit homepage block ordering | `constants/market-config.tsx` + `pages/MarketPage.tsx` |
| Remake Market product content/assets | live `/market` API + `tmp/market-products-remake-plan.json` / `tmp/market-products-asset-jobs.json`; frontend uses `bannerUrl` for hero and `thumbnailUrl` for cards when backend schema is deployed |
| Add/edit prompt templates | `constants/prompt-templates.ts` (shared by PromptCreatePage + PromptEditPage) |
| Tweak header / menu | `components/Header.tsx` |
| Add language string | `context/LanguageContext.tsx` (translation map) |
| Change brand color | `tailwind.config.ts` → `theme.extend.colors.brand` |
| Add backend endpoint | `skyverses-backend/src/routes/<file>.ts` + register trong `routes/index.ts` |
| Add backend Mongoose model | `skyverses-backend/src/models/<Name>.model.ts` |
| Add new image engine | `skyverses-backend/src/jobs/image/engines/<provider>/{adapter,request}.ts` |
| Add new video engine | `skyverses-backend/src/jobs/video/engines/<provider>/` |
| Wire up new credit feature | `apis/credits.ts` + `utils/pricing-helpers.ts` + backend `credit.router.ts` |
| New landing page sections | `components/landing/<product>/` (Hero/Features/Showcase/Workflow/UseCases/LiveStatsBar/FAQ/FinalCTA) |
| Add slide layout | `components/slide-studio/SlidePresenterLayouts.ts` |
| Add storyboard tab | `components/storyboard-studio/<Tab>.tsx` |
| Modify auth flow | `context/AuthContext.tsx` + `apis/auth.ts` + backend `routes/auth.ts` |
| Change credit deduction | backend `utils/getPricingCredits.ts` + `utils/refundJobCredits.ts` |
| Change OAuth provider tokens | `apis/provider-tokens.ts` + backend `routes/providerToken.ts` + model `ProviderToken.model.ts` |
| Add CMS admin field | `cms/pages/AdminCmsProPage.tsx` + matching `cms/apis/<domain>.ts` |
| Add blog post type | `blog/apis/blog.ts` + `blog/pages/BlogPostPage.tsx` + backend `routes/blog.ts` |
| Add scheduled sync job | `skyverses-backend/src/jobs/sync<Name>.ts` + register trong `jobs/index.ts` |
| Edit upload pipeline | `apis/media.ts` + `services/uploadPoller.ts` + backend `routes/uploadMedia.ts` |
| Tweak ⌘K search | `components/UniversalSearch.tsx` (data từ `data.ts` `SOLUTIONS`) |
| Add toast | `useToast().show({message, type, duration})` |
| Gate UI by tier | `useFeatureAccess(featureKey)` từ `hooks/useFeatureAccess.ts` |
| Generate landing images | `scripts/gen_<product>_*.sh` |
| Sync CDN URLs | `scripts/<product>_cdn*.sh` + result vào `src/constants/<product>-cdn.ts` |
| Seed DB | root `seed-products.mjs` hoặc backend `src/scripts/seed*.ts` |
| Add/auto-random Prompt Market blueprint pack | `skyverses-backend/src/scripts/prompt-market-blueprint.ts` (`PROMPT_MARKET_BLUEPRINT_STANDARD`, `validatePromptMarketBlueprintStandard`, `pickRandomPromptMarketBlueprintId`) + `generate-prompt-market-assets.ts` (video must use same-pack image references before upload) |
| Deploy | `deploy.sh` (pm2 via `ecosystem.config.cjs`) |
| SKT wallet / top-up / withdraw | `pages/SkyTokenPage.tsx` + `apis/skytoken.ts` + `components/skytoken/SkyTokenPurchaseModal.tsx` + backend `routes/skytoken.router.ts` |
| Prompt marketplace | `pages/Prompt*.tsx` (6 page) + `apis/prompt-market.ts` + `components/prompt-market/` (3 file) + backend `routes/prompt-market.router.ts` |
| Admin SKT withdrawals | `cms/components/admin-pro/SktWithdrawalTab.tsx` + `cms/apis/skytoken.ts` |
| Promo banners (admin) | `apis/promo-banners.ts` + backend `routes/promoBanner.ts` + `PromoBanner.model.ts` |
