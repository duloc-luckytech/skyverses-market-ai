# Skyverses Market AI — Project Context

## Project Overview
- **Name:** Skyverses Market AI (`skyverses-market`)
- **Framework:** React + TypeScript + Vite
- **Styling:** Tailwind CSS (`brand-blue` as primary color)
- **Routing:** React Router DOM
- **Animation:** Framer Motion
- **Icons:** Lucide React

## Key Directories
```
components/        — All UI components (Header.tsx, Footer.tsx, etc.)
pages/             — Route-level page components
context/           — React Contexts (Auth, Theme, Language, Search, Toast)
apis/              — API call modules (credits, market, etc.)
hooks/             — Custom React hooks
constants/         — Config & market-config.tsx
types.ts           — Global TypeScript types
App.tsx            — Route definitions
```

## Core Components
| File | Description |
|------|-------------|
| `components/Header.tsx` | Main nav: Logo, Home, Marketplace, Explore dropdown, Insights, Create, Search, User menu |
| `components/Footer.tsx` | Site footer |
| `components/Layout.tsx` | Page wrapper with Header + Footer |
| `components/UniversalSearch.tsx` | Global search modal (⌘K) |
| `components/market/` | Market-related UI components |
| `components/landing/` | Landing page sections |

## Header Navigation Structure
```
Logo → Home → Marketplace → Explore (dropdown) → Insights → Create (auth only)
                              ├── Discover group
                              │     ├── Explorer Gallery → /explorer
                              │     └── AI Models → /models
                              └── My Workspace → /apps (auth only)
Right: Search | Credits | Theme | Language | User Menu | Deploy CTA
```

## Contexts
| Context | Hook | Purpose |
|---------|------|---------|
| AuthContext | `useAuth()` | user, isAuthenticated, credits, logout, claimWelcomeCredits |
| ThemeContext | `useTheme()` | theme, toggleTheme |
| LanguageContext | `useLanguage()` | lang, setLang, t() |
| SearchContext | `useSearch()` | query, open(), toggle() |
| ToastContext | `useToast()` | show toast notifications |

## i18n
- Use `t('key')` from `useLanguage()` for all user-facing text
- Languages: `en`, `vi`, `ko`, `ja`

## Coding Conventions
- Always TypeScript (no `any` unless unavoidable)
- Tailwind for all styling — no inline styles
- Use `framer-motion` `<motion.div>` + `<AnimatePresence>` for show/hide animations
- `<Link>` for internal routes, `<a target="_blank">` for external
- Mobile-first: `hidden md:flex` pattern for desktop-only elements
- Auth-gated UI: wrap with `{isAuthenticated && (...)}`

## Available Skills (`.agents/skills/`)
| Skill | Trigger topics |
|-------|---------------|
| `skyverses_ui_pages` | Homepage, MarketPage, product grid, filters, CMS blocks |
| `skyverses_architecture` | System architecture, API structure, backend |
| `skyverses_business_flows` | Auth flows, credits, payments, referral |
| `skyverses_cms` | CMS system, homeBlocks, content management |

## Common Routes
| Route | Component | Notes |
|-------|-----------|-------|
| `/` | MarketPage | Homepage + product grid |
| `/markets` | MarketsPage | Browse all AI tools |
| `/apps` | AppsPage | User workspace (auth required) |
| `/explorer` | ExplorerPage | Gallery view |
| `/models` | ModelsPage | AI Models list |
| `/credits` | CreditsPage | Credit management |
| `/login` | LoginPage | Auth |
| `/booking` | BookingPage | Deploy/contact CTA |

## Environment / API
- API Key: via `ANTHROPIC_API_KEY` env
- Base URL: `ANTHROPIC_BASE_URL`
- Credits API: `apis/credits.ts` → `creditsApi.claimDaily()`

## Notes
- `brand-blue` = primary brand color (defined in tailwind.config.ts)
- `DEFAULT_AVATAR` fallback: framerusercontent CDN image
- Scroll behavior: header shrinks from `h-16` → `h-14` after 20px scroll
- Mobile drawer: slides from right, 85% width, max-w-sm
