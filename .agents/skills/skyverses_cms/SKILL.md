---
name: skyverses_cms
description: >
  Complete CMS Admin architecture for Skyverses Market AI.
  Read this when working on any CMS page, tab, drawer, or admin component.
  Covers the single-page admin layout, all 20 tabs and their purposes,
  the SolutionDrawer system, design rules, and CMS-specific patterns.
---

# Skyverses CMS Admin — Architecture Reference

## 1. OVERVIEW

The CMS is a **fully separate Vite app** located at `/cms/`. It runs as an independent
frontend on the same domain (typically `/cms` path via Nginx). It shares the same
backend API as the main FE but has its own router, contexts, and components.

```
cms/
├── App.tsx                          ← 2 routes only: /login + /
├── pages/
│   ├── LoginPage.tsx                ← Admin login (scrypt password, POST /auth/admin/login)
│   └── AdminCmsProPage.tsx          ← Main SPA shell (sidebar + tab renderer)
├── components/
│   ├── admin-pro/                   ← All 20 tab components + drawers
│   │   ├── DashboardTab.tsx         (29KB)
│   │   ├── NodeRegistryTab.tsx      (25KB)
│   │   ├── SolutionManagerTab.tsx   (14KB)
│   │   ├── BlogTab.tsx              (12KB)
│   │   ├── BlogDrawer.tsx           (27KB)
│   │   ├── PricingTab.tsx           (44KB)
│   │   ├── CreditPacksTab.tsx       (43KB)
│   │   ├── UsersTab.tsx             (20KB)
│   │   ├── UserDetailDrawer.tsx     (29KB)
│   │   ├── AdminDepositTab.tsx      (27KB)
│   │   ├── BankingTab.tsx           (23KB)
│   │   ├── PaymentHistoryTab.tsx    (10KB)
│   │   ├── WebhookLogsTab.tsx       (12KB)
│   │   ├── FxflowTab.tsx            (27KB)
│   │   ├── AIModelsTab.tsx          (23KB)
│   │   ├── ProviderTokensTab.tsx    (21KB)
│   │   ├── ConfigurationTab.tsx     (12KB)
│   │   ├── ExplorerTab.tsx          (21KB)
│   │   ├── MarketFiltersTab.tsx     (21KB)
│   │   ├── ApiClientsTab.tsx        (44KB)
│   │   ├── ApiSandboxTab.tsx        (18KB)
│   │   ├── SubmissionsTab.tsx       (26KB)
│   │   ├── LogsTab.tsx              (15KB)
│   │   └── solution-drawer/
│   │       ├── SolutionDrawer.tsx   (30KB) ← Full product editor
│   │       ├── EditInput.tsx
│   │       └── EditArray.tsx
│   ├── Header.tsx, Footer.tsx, Layout.tsx
│   └── explorer/
├── context/                         ← ThemeContext, LanguageContext, AuthContext, ToastContext
├── apis/                            ← Typed fetch wrappers (same backend)
└── types.ts                         ← CMS-specific TypeScript types
```

---

## 2. LAYOUT ARCHITECTURE (AdminCmsProPage.tsx)

Single-page app with **collapsible sidebar + tab content area**:

```
┌─────────────────────────────────────────────────────┐
│  SIDEBAR (w-64 or w-16 collapsed)  │  MAIN AREA     │
│  ┌─────────────────────────────┐   │  ┌───────────┐ │
│  │ Logo: Skyverses CMS         │   │  │ Header    │ │
│  │ ─────────────────           │   │  │ h-16      │ │
│  │ [MAIN]                      │   │  ├───────────┤ │
│  │   Tổng quan (DASHBOARD)     │   │  │           │ │
│  │ [MARKET]                    │   │  │ Tab       │ │
│  │   Sản phẩm (CLOUD)          │   │  │ Content   │ │
│  │   Đề xuất SP (SUBMISSIONS)  │   │  │           │ │
│  │   Sản phẩm (PRODUCTS)       │   │  │           │ │
│  │ [CONTENT]                   │   │  │           │ │
│  │   Blog (BLOG)               │   │  │           │ │
│  │ [FINANCE]                   │   │  └───────────┘ │
│  │   Bảng giá / Gói Credits... │   │                │
│  │ [SYSTEM]                    │   │                │
│  │   Khách hàng / Logs...      │   │                │
│  │ ─────────────────           │   │                │
│  │ [Theme toggle] [Collapse]   │   │                │
│  │ [Logout]                    │   │                │
│  └─────────────────────────────┘   │                │
└─────────────────────────────────────────────────────┘
```

### Sidebar behavior:
- Collapsible: `sidebarCollapsed` state → `w-[64px]` (icon only) or `w-64` (full)
- Active tab: `bg-brand-blue text-white shadow-lg shadow-brand-blue/20`
- Inactive: `text-slate-500 hover:bg-black/[0.03]`
- Groups: MAIN, MARKET, CONTENT, FINANCE, SYSTEM — shown as section labels

### Tab switching:
```typescript
const [activeTab, setActiveTab] = useState<ProAdminTab>('DASHBOARD');
// Tab content rendered via AnimatePresence with mode="wait"
// activeTab === 'BLOG' && <BlogTab />
// Each tab fetches its own data independently
```

---

## 3. ALL TABS — FULL REFERENCE

| Tab ID | Label (VN) | Group | File | Purpose |
|--------|-----------|-------|------|---------|
| `DASHBOARD` | Tổng quan | MAIN | `DashboardTab.tsx` | Stats overview, recent activity |
| `CLOUD` | Sản phẩm | MARKET | `NodeRegistryTab.tsx` | Browse + toggle/edit all market products |
| `SUBMISSIONS` | Đề xuất SP | MARKET | `SubmissionsTab.tsx` | Review user-submitted product proposals |
| `PRODUCTS` | Sản phẩm | MARKET | `ProductsTab.tsx` | Quick product list view |
| `BLOG` | Blog | CONTENT | `BlogTab.tsx` + `BlogDrawer.tsx` | Create/edit/publish blog posts |
| `PRICING` | Bảng giá | FINANCE | `PricingTab.tsx` | Model pricing matrix (credit cost per model×res×duration) |
| `CREDIT_PACKS` | Gói Credits | FINANCE | `CreditPacksTab.tsx` | Credit package CRUD (basic/pro/ultimate/creator) |
| `BANKING` | Banking & QR | FINANCE | `BankingTab.tsx` | Bank account + VietQR config |
| `PAYMENT_HISTORY` | Lịch sử nạp | FINANCE | `PaymentHistoryTab.tsx` | All payment transactions |
| `ADMIN_DEPOSIT` | Deposit Credit | FINANCE | `AdminDepositTab.tsx` | Manually add/deduct credits for users |
| `USERS` | Khách hàng | SYSTEM | `UsersTab.tsx` | User management + search |
| `LOGS` | Nhật ký | SYSTEM | `LogsTab.tsx` | System activity logs |
| `WEBHOOK_LOGS` | Webhook Logs | SYSTEM | `WebhookLogsTab.tsx` | Bank webhook raw log viewer |
| `CONFIG` | Cấu hình | SYSTEM | `ConfigurationTab.tsx` | SystemSetting key-value editor |
| `FXFLOW` | FXFlow Engine | SYSTEM | `FxflowTab.tsx` | Worker routing config + owner pool |
| `PROVIDER_TOKENS` | *(hidden)* | SYSTEM | `ProviderTokensTab.tsx` | Provider API token pool management |
| `AI_MODELS` | *(hidden)* | SYSTEM | `AIModelsTab.tsx` | AI model registry sync |
| `EXPLORER` | *(hidden)* | SYSTEM | `ExplorerTab.tsx` | Public explorer gallery management |
| `MARKET_FILTERS` | *(hidden)* | SYSTEM | `MarketFiltersTab.tsx` | Homepage homeBlock order & filter config |
| `API_CLIENTS` | API Clients | SYSTEM | `ApiClientsTab.tsx` | External API client keys |

---

## 4. SOLUTION EDITOR (CLOUD tab + SolutionDrawer)

The most complex CMS flow — editing/creating market products:

### Flow:
```
Admin → CLOUD tab → NodeRegistryTab renders all products
  ↓
Click "Edit" on a product → handleEdit(sol) in AdminCmsProPage
  ↓
editedItem state populated → <SolutionDrawer /> renders (right sliding drawer)
  ↓
Admin edits fields → setEditedItem()
  ↓
Click "Save":
  - if slug matches existing remote → PUT /market/:id (update)
  - else → POST /market (create)
  → fetchData() refreshes list
  ↓
"Add New" button (top right of CLOUD tab):
  handleEdit({ id: 'NODE_'+Date.now(), slug: '', name: {...}, ... })
```

### SolutionDrawer editable fields (30KB component):
```typescript
{
  name: LocalizedString,           // { en, vi, ko, ja }
  category: LocalizedString,
  description: LocalizedString,
  features: LocalizedString[],     // list of feature strings
  slug: string,                    // URL identifier
  imageUrl: string,
  demoType: 'text' | 'image' | 'video' | 'automation',
  homeBlocks: string[],            // which homepage sections to appear in
  neuralStack: { name, version, capability: LocalizedString }[],
  priceCredits: number,
  isFree: boolean,
  featured: boolean,
  isActive: boolean,
  order: number,
  complexity: 'Standard' | 'Advanced' | 'Enterprise',
  tags: string[],
  platforms: string[],             // 'web' | 'ios' | 'android' | 'extension'
}
```

### Quick actions (without opening drawer):
- **Toggle active/inactive**: click toggle on card → `PUT /market/:id { isActive }`
- **Quick homeBlocks update**: drag/select which sections → `PUT /market/:id { homeBlocks }`

---

## 5. BLOG MANAGEMENT (BLOG tab)

### BlogTab + BlogDrawer flow:
```
BlogTab → GET /blog/admin/all → renders post list
  ↓
"New Post" or "Edit" → opens <BlogDrawer /> as slide-in panel
  ↓
BlogDrawer features:
  - Auto-slug generation from title (EN)
  - HTML content editor with preview toggle
  - SEO auto-fill from title + excerpt
  - Publish/Draft toggle
  - Featured toggle
  - Category + Tags
  - Cover image URL
  - Multi-language content (EN required, VI/KO/JA optional)
  ↓
Save → POST /blog (create) or PUT /blog/:id (update)
Publish → POST /blog/:id/publish (toggle)
```

**⚠️ IMPORTANT**: Author is always auto-assigned server-side from 5 PRESET_CREATORS.
Never send `author` field when creating from CMS.

---

## 6. FINANCE TABS

### PricingTab (model pricing matrix):
- Lists all AI models with price per resolution × duration
- Edit in-place → `PUT /pricing/admin/package/:modelId`
- Add new model → `POST /pricing/admin/package`
- Format: `{ modelKey, pricing: { "720p": { "5": 50, "8": 80 }, "1080p": {...} } }`

### CreditPacksTab (credit packages):
- Full CRUD for 4 packages: `basic | pro | ultimate | creator`
- Edit: name, price, credits, bonusPercent, bonusCredits, features[], theme colors
- UI flags: popular, highlight, badge, ribbon (with color/icon config)
- `PUT /pricing/credit-packs/:id`

### AdminDepositTab (manual credits):
- Search user by email/name
- Input amount + note → POST to deposit credits
- Creates `CreditTransaction { type: "BONUS" }`
- Useful for: customer support credits, event rewards

### BankingTab:
- Edit `SystemSetting { key: "banking" }` via CMS form
- Fields: bankName, bankCode, accountNumber, accountName, qrTemplate
- Changes immediately reflected in user-facing credit purchase QR

---

## 7. SYSTEM TABS

### ConfigurationTab:
- Editor for `SystemSetting` key-value pairs
- Key fields editable: `fxflow`, `grok`, `welcomeBonusCredits`, `productLocks`, `aiSupportContext`
- Free-form JSON editor for each key's value

### FxflowTab:
- View/manage FXFlow worker pool (owners list)
- Toggle owner active/inactive
- Edit `routingPercent` → controls what % of jobs route to FXFlow vs Gommo
- View live pending jobs count per owner

### UsersTab + UserDetailDrawer:
- Paginated user list with search
- Click user → `UserDetailDrawer` opens:
  - View credit balance, plan, invite history
  - Edit plan manually
  - Add bonus credits
  - View credit transaction history
  - View image/video job history

### WebhookLogsTab:
- Raw bank webhook payload viewer
- Filter by status (matched/unmatched)
- Useful for debugging failed payments

---

## 8. CMS DESIGN SYSTEM

> **MANDATORY**: Always follow `cms_style_guide` workflow before building any new CMS component.

### Background (page level):
```css
bg-slate-50 dark:bg-[#050505]
/* Decorations: */
bg-brand-blue/[0.03] rounded-full blur-[120px]  /* top-right blob */
bg-purple-500/[0.02] rounded-full blur-[100px]  /* bottom-left blob */
/* Grid: 24px cells, masked radial gradient */
```

### Sidebar:
```css
bg-white/60 dark:bg-[#0a0a0c]/60 backdrop-blur-2xl
border-r border-black/[0.04] dark:border-white/[0.04]
```

### Tab/Card containers:
```css
bg-white/60 dark:bg-[#0a0a0c]/60 backdrop-blur-2xl   /* glassmorphism */
border border-black/[0.04] dark:border-white/[0.04]  /* soft border */
rounded-2xl                                           /* radius */
```

### Active state (buttons, nav):
```css
bg-brand-blue text-white shadow-lg shadow-brand-blue/20
```

### Hover state:
```css
hover:bg-black/[0.03] dark:hover:bg-white/[0.03]
```

### Typography conventions:
```css
/* Section labels */
text-[9px] font-bold uppercase tracking-wider text-slate-400

/* Tab button labels */
text-[11px] font-semibold

/* Card titles */
text-sm font-bold text-slate-900 dark:text-white

/* Body text */
text-[12px] text-slate-500 dark:text-gray-400
```

### Toasts (feedback):
```typescript
const { showToast } = useToast();
showToast('Message', 'success' | 'error' | 'info')
```

---

## 9. CMS API LAYER (cms/apis/)

CMS has its own typed API wrappers. Key files mirror the main FE apis/:
- `market.ts` — `getSolutions()`, `createSolution()`, `updateSolution()`, `toggleActive()`
- `config.ts` — `getSystemConfig()`, `updateSystemConfig()`
- `blog.ts` — `getAllAdmin()`, `create()`, `update()`, `togglePublish()`
- `pricing.ts` — pricing matrix CRUD
- `users.ts` — user list, detail, credit adjust
- `auth.ts` — `adminLogin()`, `logout()`

All wrappers use the same base URL pattern with JWT Bearer token from `AuthContext`.

---

## 10. CMS PATTERNS & GOTCHAS

1. **Single page app**: CMS is entirely in `AdminCmsProPage.tsx` — only 2 routes exist (`/login`, `/`)
2. **Auth guard**: `useEffect` in `AdminCmsProPage` redirects to `/login` if `!user`
3. **fetchData on tab change**: `useEffect(() => fetchData(), [activeTab])` — data refreshes when switching tabs
4. **Solution edit uses slug matching**: `existingRemote` is found by `slug` comparison — if slug changes, it creates a NEW product instead of updating
5. **Drawer state lives in AdminCmsProPage**: `editedItem` / `editingId` / `isSaving` are all in the parent — passed down as props
6. **AnimatePresence mode="wait"**: Tab transitions have exit animation before entry — avoid adding loading states that break this
7. **Sidebar groups are hardcoded**: `GROUP_LABELS` and `sidebarItems` array in `AdminCmsProPage.tsx` — add new tabs here
8. **No URL routing for tabs**: Tab state is in-memory `useState` only — refreshing the page resets to `DASHBOARD`
9. **Blog author never from client**: `BlogDrawer` must NOT send `author` field — backend assigns from PRESET_CREATORS
10. **Dark/light theme**: CMS has its own `ThemeContext` — independent from main FE theme
