# Sub-apps — `cms/` & `blog/`

Cả hai là Vite app riêng (independent build), share pattern với main app nhưng scope nhỏ hơn.

## `cms/` — Admin CMS (76 file)

Mini-app mirror main app primitives cho admin use.

```
cms/
├── App.tsx, index.tsx, vite.config.ts, data.ts, types.ts
├── apis/                  Mirror /apis (ai-models, api-client, auth, blog, config, credits,
│                          deploy, explorer, images, market, media, pricing, product-submission,
│                          provider-tokens, upscale, user, videos)
├── components/            Header.tsx, Footer.tsx, Layout.tsx, LoadingScreen.tsx,
│                          ExplorerDetailModal.tsx
├── constants/             market-config.tsx, media-presets.ts
├── context/               AuthContext, LanguageContext, ThemeContext, ToastContext (subset)
├── hooks/                 useSettingsLogic.ts
├── pages/                 AdminCmsProPage.tsx, LoginPage.tsx
├── services/              gemini.ts, storage.ts
└── utils/                 adminAuth.ts, pricing-helpers.ts
```

**Lưu ý:** CMS có `services/gemini.ts` (main app không có) — gọi `@google/genai` trực tiếp cho admin AI helpers.

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
