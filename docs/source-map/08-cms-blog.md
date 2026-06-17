# Sub-apps — `cms/` & `blog/`

Cả hai là Vite app riêng (independent build), share pattern với main app nhưng scope nhỏ hơn.

## `cms/` — Admin CMS (89 file)

Mini-app mirror main app primitives cho admin use.

```
cms/
├── App.tsx, index.tsx, index.css, vite.config.ts, tailwind.config.js, postcss.config.js, data.ts, types.ts
├── apis/                  Mirror /apis (ai-models, api-client, auth, blog, config, credits,
│                          deploy, explorer, images, market, media, pricing, product-submission,
│                          provider-tokens, skytoken, upscale, user, videos)
├── components/            Header.tsx, Footer.tsx, Layout.tsx, LoadingScreen.tsx,
│                          ExplorerDetailModal.tsx
├── constants/             market-config.tsx, media-presets.ts
├── context/               AuthContext, LanguageContext, ThemeContext, ToastContext (subset)
├── hooks/                 useSettingsLogic.ts
├── pages/                 AdminCmsProPage.tsx (`/` Control Center + lazy tabs), LoginPage.tsx (`/login`)
├── services/              gemini.ts, storage.ts
└── utils/                 adminAuth.ts, pricing-helpers.ts
```

**Lưu ý:** CMS có `services/gemini.ts` (main app không có) — gọi `@google/genai` trực tiếp cho admin AI helpers.

**CMS routes:** `/` mở Control Center, `/login` mở admin login; alias cũ `/cms-admin-pro` đã bỏ.

**CMS theme:** `cms/context/ThemeContext.tsx` default `dark` để Control Center khớp dark admin shell.

**CMS dashboard:** `cms/components/admin-pro/DashboardTab.tsx` dùng dark KPI grid + Recharts line/donut theo Control Center.

**Dọn admin-pro:** bỏ các tab legacy/mồ côi `ProductsTab`, `SolutionManagerTab`, `ApiSandboxTab`; shell hiện dùng `NodeRegistryTab` cho Market Products.

**admin-pro tabs mới:** `SktWithdrawalTab.tsx` — quản lý yêu cầu rút SKT (approve/reject/complete), dùng `cms/apis/skytoken.ts`.

## `blog/` — Blog frontend (21 file)

```
blog/
├── App.tsx, index.tsx, vite.config.ts, types.ts, vite-env.d.ts
├── apis/                  blog.ts, config.ts
├── components/            BlogHeader.tsx, BlogFooter.tsx, PostCard.tsx
├── context/               LanguageContext.tsx, ThemeContext.tsx
├── hooks/                 usePageMeta.ts
└── pages/                 BlogHomePage, BlogPostPage, PrivacyPage, RSSFeedPage,
                           SearchPage, SitemapPage, TagPage
```

**Routes blog (suy ra từ pages):** `/`, `/post/:slug`, `/privacy`, `/rss`, `/search`, `/sitemap`, `/tag/:tag`.

## Build

| App | Port | Output |
|-----|------|--------|
| Main | 3001 | `./dist/` |
| CMS | (xem `cms/vite.config.ts`) | `./cms/dist/` |
| Blog | (xem `blog/vite.config.ts`) | `./blog/dist/` |

Cả 3 build đều qua `vite build` riêng. Deploy script: `deploy.sh` ở root.
