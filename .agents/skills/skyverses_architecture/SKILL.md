---
name: skyverses_architecture
description: >
  Complete architectural context for the Skyverses Market AI platform. 
  Read this skill at the START of every conversation to understand the monorepo layout, 
  tech stack, data models, API routes, credit system, i18n strategy, CMS patterns, 
  blog system, and agent workflows before making any code changes.
---

# Skyverses Market AI — Full Architecture Reference

## 1. MONOREPO STRUCTURE

This is **one Git repo** with **3 independent Vite frontends + 1 Express backend**.

```
skyverses-market-ai/               ← ROOT: Main FE (Vite + React 19 + TailwindCSS)
├── App.tsx                        ← Main FE router (50+ lazy-loaded routes)
├── pages/                         ← All page components (36 files + sub-folders)
├── components/                    ← Shared workspace components (70+ files, 21 sub-folders)
├── context/                       ← React Contexts (Auth, Language, Theme, Toast, Search)
├── apis/                          ← Typed fetch wrappers to backend (15 files)
├── hooks/                         ← Custom React hooks
├── constants/                     ← Shared enums/constants
├── data.ts                        ← Static product/solution data (~22KB, fallback data)
├── types.ts                       ← Global TS interfaces: Solution, MarketItem, LocalizedString, etc.
│
├── cms/                           ← CMS Admin Frontend (separate Vite app, same domain /cms)
│   ├── App.tsx                    ← CMS router
│   ├── pages/                     ← CMS admin pages
│   └── components/admin-pro/      ← Specialized drawer components (BlogDrawer, etc.)
│
├── blog/                          ← Blog / Insights Frontend (separate Vite app)
│   ├── App.tsx                    ← Blog router
│   ├── pages/                     ← BlogListPage, BlogPostPage
│   └── components/                ← PostCard, BlogHeader, etc.
│
├── skyverses-backend/             ← Express + TypeScript + MongoDB backend
│   └── src/
│       ├── index.ts               ← Entry: Express, CORS, Mongoose connect, Swagger, Jobs
│       ├── routes/index.ts        ← Central router registering all 28 route files
│       ├── routes/                ← 28 route files (auth, user, credit, blog, market, ai, video, …)
│       ├── models/                ← 29 Mongoose models
│       ├── jobs/                  ← Background cron jobs (video/image/music workers, sync jobs)
│       └── services/              ← RunningHub integration, utility services
│
└── .agents/                       ← AI Agent configuration for this project
    ├── workflows/                 ← Workflow definitions
    │   ├── cms_style_guide.md     ← MANDATORY: CMS style sync rules
    │   └── push.md                ← Git push workflow (turbo-all)
    └── skills/                    ← AI Skills (this folder)
        └── skyverses_architecture/
            └── SKILL.md           ← THIS FILE
```

---

## 2. TECH STACK

| Layer | Tech |
|-------|------|
| Main FE | Vite 5, React 19, TypeScript, **TailwindCSS v3**, Framer Motion, Lucide React, Three.js, @xyflow/react |
| CMS FE | Vite, React 19, TypeScript, TailwindCSS |
| Blog FE | Vite, React, TypeScript |
| Backend | **Express 4**, TypeScript, **Mongoose 8**, JWT (jsonwebtoken), node-cron, multer, OpenAI SDK, Resend |
| Database | **MongoDB** (Atlas-compatible) |
| AI Services | Google Gemini (@google/genai), Google Cloud (Storage, Speech), OpenAI, RunningHub, FXFlow, Grok |
| Deployment | **PM2** + **Nginx**, `deploy.sh` script, `ecosystem.config.cjs` |

---

## 3. DESIGN SYSTEM (Critical for CMS/FE consistency)

**MANDATORY** — always follow the `cms_style_guide` workflow when building CMS components:

- **Background**: Glassmorphism `bg-white/5 dark:bg-[#0a0a0c]/60 backdrop-blur-2xl`
- **Borders**: Soft `border-black/[0.04] dark:border-white/[0.04]` (never hard borders)
- **Primary CTA**: `brand-blue` color, smooth hover, lucide-react icons
- **Typography**: Inherit exactly from `pages/MarketsPage.tsx` or `pages/ExplorerPage.tsx` (e.g. `font-black uppercase italic tracking-tighter`)
- **Shadows/Glows**: Use exact values from FE (e.g. `shadow-[0_0_50px_rgba(0,144,255,0.05)]`)
- **No arbitrary Tailwind classes** not already in use in `/pages` or `/components`

**Theme System**: `ThemeContext` (light/dark toggle), `LanguageContext` (EN/VI/KO/JA), `AuthContext` (JWT user), `ToastContext` (global notifications), `SearchContext`

---

## 4. INTERNATIONALIZATION (i18n)

- **4 languages**: `en` | `vi` | `ko` | `ja`
- **`LocalizedString` type**: `{ en: string; vi: string; ko: string; ja: string }`
- **`LanguageContext.tsx`** (~100KB): contains ALL translation strings for the Main FE UI
- **`context/LanguageContext.tsx`** in CMS: separate translation context for CMS
- All content models (MarketItem, BlogPost, Solution) use `{ en, vi, ko, ja }` sub-objects
- Blog API supports `?lang=en` query param for language-filtered search

---

## 5. BACKEND API ROUTES

Base URL: `http://localhost:3000` (dev) / production via Nginx proxy

### Core
| Route | File | Purpose |
|-------|------|---------|
| `/auth` | `auth.ts` | Google OAuth register/login, JWT, admin login (scrypt password) |
| `/user` | `user.ts` | User profile, onboarding, settings, daily claim, API token |
| `/config` | `config.ts` | System config (home blocks, gemini keys, welcome credits, AI support context) |
| `/credits` | `credit.router.ts` | Credit purchase, bank transfer top-up, usage history |
| `/pricing` | `pricing.router.ts` | Credit packages CMS (CRUD) |
| `/webhook` | `webhook.ts` | Payment webhook handler |

### AI Generation
| Route | File | Purpose |
|-------|------|---------|
| `/ai` | `ai.ts` | Gemini-based AI features (support chat, prompt assist) |
| `/image-jobs` | `imageJobs.ts` | Image generation job queue |
| `/image` | `upscaleJobs.ts` | Image upscaling jobs |
| `/video` | `video.ts` | Video generation (legacy) |
| `/video-jobs` | `videoJobs.ts` | Video generation v2 job queue |
| `/audio` | `audio.ts` | TTS and audio generation |

### External Workers
| Route | File | Purpose |
|-------|------|---------|
| `/fxflow` | `fxflow.ts` | FXFlow external worker integration |
| `/grok` | `grok.ts` | Grok AI worker integration |

### Content & Media
| Route | File | Purpose |
|-------|------|---------|
| `/explorer` | `explorerMedia.router.ts` | Public explorer gallery (images/videos) |
| `/market` | `market.ts` | Market items CRUD (solutions/products) |
| `/blog` | `blog.ts` | Blog posts (public + admin endpoints) |
| `/runninghub` | `runninghub.ts` | RunningHub template integration |
| `/category` | `category.route.ts` | Product categories |
| (upload) | `uploadMedia.ts` | File upload middleware (multer, GCS) |

### Admin
| Route | File | Purpose |
|-------|------|---------|
| `/ai-model` | `aiModel.admin.ts` | AI model registry management |
| `/providerToken` | `providerToken.ts` | Provider API token pool |
| `/customer` | `customer.ts` | Customer management for admin |
| `/api-client` | `apiClient.ts` | External API client management |
| `/product-submission` | `productSubmission.ts` | User-submitted product proposals |
| `/deploy` | `deployLogs.ts` | Deployment log viewer |

---

## 6. KEY DATA MODELS

### User (`UserModel.ts`)
- `email`, `name`, `avatar`, `googleId` — Google OAuth identity
- `role`: `"admin" | "master" | "sub" | "user"`
- `inviteCode` (unique), `inviteFrom` (ref User) — referral system
- `credit`, `creditBalance` — two credit counters
- `claimWelcomeCredit: boolean` — whether 1000 welcome credits were claimed
- `freeImageRemaining: number` — 100 free images on registration
- `plan`, `planExpiresAt` — subscription plan
- `fxflowOwner`, `grokOwner` — sticky worker assignment
- `apiToken`, `apiTokenExpiresAt` — external API access
- `onboarding: { role, goals[], workStyle, experienceLevel, completedAt }` — user persona
- `globalEventBonus2026: boolean` — April 2026 event flag
- **Pre-validate hook**: sanitizes empty strings in `onboarding` fields to `null`

### MarketItem (`MarketItem.model.ts`)
- `id`, `slug` (unique) — business identifier
- `name`, `category`, `description`, `features[]` — all `LocalizedString { en, vi, ko, ja }`
- `demoType`: `'text' | 'image' | 'video' | 'automation'`
- `homeBlocks: string[]` — which homepage sections to display in
- `neuralStack[]`: `{ name, version, capability: LocalizedString }` — AI models used
- `isActive`, `featured`, `order`, `isFree`, `priceCredits`

### BlogPost (`BlogPost.model.ts`)
- `slug` (unique, indexed)
- `title`, `excerpt`, `content` — all `{ en, vi?, ko?, ja? }`
- `coverImage`, `category`, `tags[]`
- `author: { name, avatar, role }` — auto-assigned from 5 PRESET_CREATORS (server-side)
- `seo: { metaTitle, metaDescription: LocalizedString, ogImage, keywords[] }`
- `isPublished`, `isFeatured`, `publishedAt`, `readTime`, `viewCount`, `order`, `relatedSlugs[]`
- Blog list API excludes `content` field for performance

### CreditPackage (`CreditPackage.model.ts`)
- `code` (unique): `basic | pro | ultimate | creator`
- `credits`, `bonusPercent`, `bonusCredits` — credit calculation
- `price`, `originalPrice`, `currency`, `billingCycle`, `billedMonths`, `discountPercent`
- `popular`, `highlight`, `badge`, `ribbon: { text, color, icon }` — UI flags
- `features[]`: `{ key, label, enabled, highlight, note }` — feature list
- `unlimitedModels[]`: `{ modelKey, label, badge, enabled, highlight }`
- `theme: { gradientFrom, gradientTo, accentColor, buttonStyle }`
- Virtual `totalCredits` = credits + bonusFromPercent + bonusCredits

---

## 7. AUTHENTICATION FLOW

1. FE calls Google OAuth → gets `{ email, name, picture }`
2. POST `/auth/google-register` with those fields + optional `inviteCode`
3. Backend: find-or-create User in MongoDB, generate unique `inviteCode`
   - New user: auto-grant **1,000 welcome credits** + **100 free images** + event bonuses
4. Return JWT (7d expiry) with `{ userId, email, role, name }`
5. All protected routes use `authenticate` middleware (Bearer JWT)
6. Admin login: POST `/auth/admin/login` with username/password (scrypt hash verification)
7. `lastActiveAt` is updated silently via cookie-gated fire-and-forget call

---

## 8. BLOG SYSTEM

### API Endpoints (all under `/blog`)
- `GET /blog` — paginated list, supports `?page&limit&category&tag&q&lang&featured`
- `GET /blog/featured` — top 5 featured posts
- `GET /blog/categories` — aggregated category counts
- `GET /blog/creators` — returns 5 preset author personas
- `GET /blog/:slug` — single post by slug (increments `viewCount`)
- `GET /blog/admin/all` — admin: all posts incl. drafts (requires auth)
- `GET /blog/admin/:id` — admin: full post with content (requires auth)
- `POST /blog` — create post, auto-assigns random creator (requires auth)
- `PUT /blog/:id` — update post (requires auth)
- `DELETE /blog/:id` — delete post (requires auth)
- `POST /blog/:id/publish` — toggle publish status (requires auth)

### PRESET_CREATORS (server-side only, 5 personas)
Alex Morgan, Skyverses Team, Jordan Lee, David Kim, Sophia Chen — author is randomly assigned on creation and cannot be overridden by the caller.

### Frontend (`blog/` folder)
- Separate Vite app, reads from API
- Features: Table of Contents, reading progress bar, back-to-top button
- `BlogDrawer.tsx` in CMS handles auto-slug-generation, HTML preview, SEO auto-fill

---

## 9. CREDIT SYSTEM

- Users have `creditBalance` (main balance used for consumption)
- `credit` (secondary field — legacy or bonus pool)
- **Welcome**: 1,000 credits on registration + 100 free images (`freeImageRemaining`)
- **Daily claim**: checked via `lastDailyClaimAt` (isSameDay utility)
- **Top-up**: minimum **100,000 VND** — bank transfer, webhook-confirmed
- **Packages**: managed via CMS `/pricing` → stored in `CreditPackage` model
- `CreditTransaction` model logs every credit event with `type`, `amount`, `balanceAfter`, `source`, `note`
- Transaction types: `WELCOME`, `EVENT_BONUS`, `PURCHASE`, `DAILY_CLAIM`, `USAGE`, etc.

---

## 10. BACKGROUND JOBS (production only)

Jobs initialized in `jobs/index.ts` only when `NODE_ENV === 'production'`:

| Job File | Purpose |
|----------|---------|
| `video/videoWorker` | Poll + process video generation queue |
| `image/imageWorker` | Poll + process image generation queue |
| `music/musicWorker` | Poll + process music generation queue |
| `syncGommoPublicVideos` | Sync public video assets from Gommo |
| `syncGommoPublicImages` | Sync public image assets from Gommo |
| `syncRunningHubTemplates` | Sync RunningHub workflow templates |
| `cleanupProviderTokens` | Remove expired/invalid provider API tokens |
| `syncGommoImageModels` | Sync AI model registry from Gommo |

---

## 11. FRONTEND STRUCTURE (Main FE)

### Context Providers (in App.tsx nesting order)
```
ErrorBoundary → ThemeProvider → LanguageProvider → AuthProvider → ToastProvider → Router → SearchProvider
```

### Route Structure
- `/` → `MarketPage` (homepage — main product showcase)
- `/markets` → `MarketsPage` (full grid of all AI products)
- `/explorer` → `ExplorerPage` (community AI media gallery)
- `/product/:slug` → `SolutionDetail` (catch-all for products)
- `/product/[specific-slug]` → dedicated product pages (registered BEFORE the catch-all)
- `/credits` → `CreditsPage`, `/usage` → `CreditUsagePage`
- `/settings`, `/favorites`, `/referral`, `/booking`, `/about`, `/policy`
- All pages are `React.lazy()` with prefetching on `requestIdleCallback`

### Key Components
- `Header.tsx` (~30KB) — navigation, language switcher, user menu
- `CreditPurchaseModal.tsx` (~48KB) — credit top-up flow  
- `AISupportChat.tsx` (~49KB) — AI chat assistant with multi-session support
- `ImageLibraryModal.tsx` (~45KB) — user image library
- `GlobalToolsBar.tsx` — floating toolbar
- `Layout.tsx` — wraps all authenticated pages

### API Layer (`apis/` folder)
All typed fetch wrappers — no raw fetch in components. Key files:
- `auth.ts`, `user.ts`, `credits.ts`, `market.ts`, `images.ts`, `videos.ts`, `pricing.ts`, `explorer.ts`, `media.ts`, `upscale.ts`

---

## 12. AGENT WORKFLOWS

### `/cms_style_guide`
**MANDATORY before any CMS work.** Three-step process:
1. **Follow FE style**: grep `MarketsPage.tsx`, `ExplorerPage.tsx` for exact Tailwind classes
2. **Understand schema**: read `data.ts` and `types.ts` for object shapes
3. **Apply premium aesthetic**: Glassmorphism, soft borders, brand-blue CTAs

### `/push`
`turbo-all` — auto-runs `git add -A && git commit -m "..." && git push origin main`.
Uses conventional commit format: `feat:`, `fix:`, `refactor:`, etc.

## 13. IMPORTANT PATTERNS & GOTCHAS

1. **Route ordering matters**: In `App.tsx`, specific product routes (`/product/ai-image-generator`) must be registered BEFORE the generic catch-all (`/product/:slug`)
2. **Blog author is server-assigned**: Never send `author` field from client when creating blog posts
3. **CMS is a separate app**: `/cms` and main FE share backend API but are independent Vite builds
4. **Onboarding sanitization**: UserModel `pre('validate')` hook converts empty strings in `onboarding` fields to `null`
5. **MinTopUp = 100,000 VND**: Minimum bank transfer top-up (updated from 50,000)
6. **Free images counter**: `freeImageRemaining` hard-decrements (not reset monthly)
7. **Localized content search**: Blog uses `$or` across `title.{lang}`, `excerpt.{lang}`, `content.{lang}`, `tags`
8. **Background jobs only in production**: `NODE_ENV !== 'production'` skips all cron jobs
9. **Static data fallback**: `data.ts` has hardcoded products — live data comes from MongoDB `/market` API
10. **Blog FE is standalone**: `/blog/` has its own `package.json`, `vite.config.ts`, `index.html`
11. **Fake stats are hash-based**: `sol.id` → deterministic users/likes/rating — NOT real data
12. **HomeBlock is CMS-controlled**: Homepage sections (order, title, limit) via `SystemSetting.marketHomeBlock`
13. **MarketsPage filters are URL-synced**: filter state lives in URLSearchParams for shareable links
14. **Credits are pre-paid**: Deducted at job creation time, auto-refunded if job fails/cancelled
15. **Sticky worker assignment**: Each user is consistently routed to the same FXFlow/Grok owner account

---

## 14. RELATED SKILLS

This skill covers the **architectural skeleton** of the platform. For deeper context, read:

| Skill | When to read |
|-------|-------------|
| `skyverses_ui_pages` | Working on homepage, markets page, product cards, filters, or any FE page component |
| `skyverses_business_flows` | Working on payment flows, AI generation pipeline, credit system, worker routing, or pricing |
| `skyverses_cms` | Working on any CMS tab, drawer, admin component, or the CMS admin panel |


