# Skyverses Codebase Exploration Report

## Executive Summary
This report details the key components for the homepage/landing page, SEO implementation, credit messaging, and i18n translation system for the Skyverses AI Marketplace.

---

## 1. HOMEPAGE/LANDING PAGE COMPONENT

### **Primary Component: MarketPage**
- **File Path**: `pages/MarketPage.tsx`
- **Line Range**: 1-203 (continues beyond visible range)
- **Role**: Serves as the homepage at route `/`
- **Key Details**:
  - Imported in `App.tsx` line 203 as the root route: `<Route path="/" element={<Suspense fallback={<HomepageSkeleton />}><MarketPage /></Suspense>} />`
  - Displays 30+ AI products with featured solutions
  - Implements search, filtering, and market navigation

### **Layout Component**
- **File Path**: `components/Layout.tsx`
- **Role**: Wraps all pages (except login) with Header, Footer, and navigation
- **Contains**:
  - Header component (navigation bar)
  - Main content area
  - Footer component
  - Global tools bar

### **Hero Section & Featured Components** (within MarketPage)
- Featured AI product cards displayed prominently
- Solution cards with "Explore" CTAs
- Featured section header with icon support

---

## 2. SEO META TAGS & HELMET IMPLEMENTATION

### **SEO Method: usePageMeta Hook (React approach)**
**Note**: This project does NOT use React Helmet. Instead, it uses a custom `usePageMeta` hook.

### **Hook Implementation**
- **File Path**: `hooks/usePageMeta.ts`
- **Lines**: 1-87
- **Functionality**:
  - Sets `document.title` dynamically
  - Updates meta tags for: description, keywords, og:*, twitter:*
  - Sets canonical links
  - Injects JSON-LD structured data
  - Creates/updates meta tags on the fly

### **SEO Usage in MarketPage**
**File**: `pages/MarketPage.tsx`
**Lines**: 65-91

```tsx
usePageMeta({
  title: 'Skyverses — Marketplace AI #1 Việt Nam | Dùng thử miễn phí 100 Credits',
  description: 'Truy cập 30+ ứng dụng AI sáng tạo trong một nền tảng: tạo Video, Ảnh, Nhạc, Giọng nói & Chat AI. Hỗ trợ Veo3, Kling, Gemini, GPT-4o, Midjourney, Flux, Grok, Qwen. Tiết kiệm ~70% — Dùng thử ngay với 100 Credits miễn phí, không cần thẻ quốc tế.',
  keywords: 'marketplace AI Việt Nam, AI giá rẻ, dùng thử AI miễn phí, tạo video AI, tạo ảnh AI, Veo3, Kling, Sora, Seedance, Gemini, GPT-4o, Grok, Midjourney, Flux, Qwen, chat AI miễn phí, text to speech AI, AI music generator, xoá nền AI, upscale ảnh AI, AI agent workflow, giải pháp AI doanh nghiệp, enterprise AI, Skyverses, credits AI, AI không cần thẻ quốc tế, nền tảng AI all-in-one',
  canonical: '/',
  jsonLd: {
    '@type': 'ItemList',
    name: 'Top AI Products — Skyverses Marketplace',
    description: '30+ công cụ AI hàng đầu: Video, Image, Voice, Music, Chat & Automation trong một nền tảng',
    // ... additional JSON-LD items
  }
});
```

### **Static HTML Meta Tags (index.html)**
**File Path**: `index.html`
**Lines**: 1-50 (and continues)

Includes:
- Title (line 6)
- Meta description (line 7)
- Keywords (line 8)
- Open Graph tags (og:title, og:description, og:image, etc.) - lines 13-23
- Twitter Card tags - lines 25-32
- Multi-language alternates (Vietnamese, English, Korean, Japanese)
- Theme color, icons, manifest, sitemap links

### **Key Static Titles/Descriptions**:

| Location | Content |
|----------|---------|
| `index.html:6` | `Skyverses — Marketplace AI #1 Việt Nam \| Dùng thử miễn phí 100 Credits` |
| `index.html:7` | `Truy cập 30+ ứng dụng AI sáng tạo hàng đầu — tạo video, ảnh, nhạc, giọng nói & chat AI — chỉ với một tài khoản. Hỗ trợ Veo3, Kling, Gemini, GPT-4o, Midjourney, Flux. Tiết kiệm ~70% so với mua lẻ từng nền tảng. Dùng thử ngay với 100 Credits miễn phí.` |
| `index.html:29` | Twitter title: `Skyverses — Marketplace AI #1 Việt Nam \| Dùng thử miễn phí 100 Credits` |
| `index.html:30` | Twitter desc: `🚀 30+ ứng dụng AI: tạo Video, Ảnh, Nhạc, Giọng nói & Chat AI. Veo3, Kling, Gemini, GPT-4o, Midjourney. Tiết kiệm ~70% — Nhận ngay 100 Credits miễn phí!` |

---

## 3. "FREE 100 CREDITS" MENTIONS THROUGHOUT CODEBASE

### **Primary Occurrences**:

| File | Line(s) | Content | Context |
|------|---------|---------|---------|
| `index.html` | 6 | `Dùng thử miễn phí 100 Credits` | Title tag |
| `index.html` | 16 | `Dùng thử miễn phí 100 Credits` | og:title |
| `index.html` | 29 | `Dùng thử miễn phí 100 Credits` | twitter:title |
| `index.html` | 30 | `Nhận ngay 100 Credits miễn phí` | twitter:description |
| `index.html` | 135 | `Dùng thử miễn phí với 100 Credits` | Schema FAQ |
| `index.html` | 183 | `Đăng ký tài khoản mới nhận ngay 100 Credits miễn phí` | FAQ structured data |
| `index.html` | 215 | `nhận 100 Credits` | FAQ: How to get free credits |
| `index.html` | 240 | `Dùng thử miễn phí 100 Credits` | Noscript fallback |
| `pages/MarketPage.tsx` | 66 | Title uses `100 Credits` | usePageMeta hook |
| `pages/MarketPage.tsx` | 67 | Description mentions `100 Credits miễn phí` | usePageMeta hook |
| `context/AuthContext.tsx` | 296 | `creditBalance: 1000` | Mock login default (NOT 100) |
| `context/AuthContext.tsx` | 302 | `setCredits(1000)` | Mock login sets 1000 credits |

### **Important Note on Actual Welcome Credits**:
- **SEO/Marketing**: Mentions "100 Credits" as the free trial/welcome bonus
- **Actual Implementation**: Backend gives **1,000 welcome credits** on registration
  - Source: `context/AuthContext.tsx` line 296
  - Source: `skyverses-backend/src/routes/auth.ts` line 105
  - Source: `.agents/skills/skyverses_architecture/SKILL.md` line 200

### **Related Credit Amounts**:
- **100 free images**: `freeImageRemaining` (new users get 100 free images for Image AI)
- **50 Credits**: Mentioned in Footer CTA ("Get 50 Credits") - see translation keys below
- **1000 Credits**: Actual welcome bonus given on signup

---

## 4. VIETNAMESE "DÙNG THỬ" (TRY FOR FREE) TEXT

### **Direct Mentions**:
- `index.html:6` - Title: `Dùng thử miễn phí 100 Credits`
- `index.html:16` - og:title
- `index.html:29` - twitter:title  
- `index.html:135` - Schema text
- `index.html:240` - Noscript fallback

### **Translation Keys in LanguageContext**:
**File**: `context/LanguageContext.tsx`
**Lines**: 11-1504 (full translations object)

Key translation entries related to credits/signup:

```typescript
// Vietnamese (vi):
'footer.cta_title': 'Sẵn sàng sáng tạo với AI?',
'footer.cta_desc': 'Đăng ký miễn phí và nhận 50 Credits trải nghiệm ngay hôm nay.',  // Line 534
'footer.mobile_cta': 'Bắt đầu miễn phí — Nhận 50 Credits',  // Line 536

// English (en):
'footer.cta_title': 'Ready to create with AI?',
'footer.cta_desc': 'Sign up for free and get 50 Credits to try today.',  // Line 152
'footer.mobile_cta': 'Get Started Free — Get 50 Credits',  // Line 154
```

---

## 5. I18N TRANSLATION FILES

### **Translation System**
- **Type**: Custom inline translation object (NOT i18next/react-i18n)
- **File**: `context/LanguageContext.tsx`
- **Lines**: 11-1504 (full translations object)

### **Languages Supported**:
1. **English** (`en`) - Lines 12-393
2. **Vietnamese** (`vi`) - Lines 394-775
3. **Korean** (`ko`) - Lines 776-1139
4. **Japanese** (`ja`) - Lines 1140-1503

### **Translation Provider**
- **File**: `context/LanguageContext.tsx`
- **Export**: `useLanguage()` hook for accessing translations
- **Usage**: `const { t } = useLanguage(); t('key.name')`

### **Key Translation Keys Related to Hero/Credits**:

| Key | English | Vietnamese |
|-----|---------|-----------|
| `home.hero.title1` | `The Platform for` | `Nền tảng` |
| `home.hero.title_highlight` | `AI Products` | `sản phẩm AI` |
| `home.hero.title2` | `for All Creative Needs` | `cho mọi nhu cầu sáng tạo` |
| `home.hero.subtitle` | `30+ AI products — Video, Image, Voice, Music & Automated Workflow.` | `30+ sản phẩm AI — Video, Ảnh, Giọng nói, Nhạc & Workflow tự động.` |
| `footer.cta_title` | `Ready to create with AI?` | `Sẵn sàng sáng tạo với AI?` |
| `footer.cta_desc` | `Sign up for free and get 50 Credits to try today.` | `Đăng ký miễn phí và nhận 50 Credits trải nghiệm ngay hôm nay.` |

### **Constants Directory**
- **Path**: `constants/` directory exists but not directly used for translations
- **Main Config**: Everything is centralized in `context/LanguageContext.tsx`

---

## 6. LANDING PAGE STRUCTURE (VISUAL HIERARCHY)

Based on MarketPage component, the landing page includes:

1. **Header Component** (`components/Header.tsx`)
   - Navigation menu
   - Language selector
   - User profile/login
   - Credit balance display

2. **Hero Section** (MarketPage lines 60-203+)
   - Featured AI products
   - Search/filter interface
   - Primary CTA buttons

3. **Featured Products Grid**
   - Solution cards showing 6-12 products
   - Card icons, titles, descriptions
   - "Explore" buttons linking to product pages

4. **Footer Component** (`components/Footer.tsx`)
   - CTA Section: "Ready to create with AI?"
   - "Sign up for free and get 50 Credits to try today"
   - Social links
   - Useful links to products, pricing, explorer, referral

5. **Global Elements**
   - Navigation bar (persistent)
   - Footer (persistent)
   - Global tools bar
   - Support chat

---

## 7. KEY FILE LOCATIONS SUMMARY

### **Homepage/Landing Page**
- Primary: `pages/MarketPage.tsx` (lines 1-203+)
- Wrapper: `components/Layout.tsx`
- Header: `components/Header.tsx` (lines 1-32+)
- Footer: `components/Footer.tsx` (lines 1-200+)

### **SEO Implementation**
- Hook: `hooks/usePageMeta.ts` (lines 1-87)
- Static HTML: `index.html` (lines 1-250)
- Meta usage: `pages/MarketPage.tsx` (lines 65-91)

### **Translations/i18n**
- Provider: `context/LanguageContext.tsx` (lines 11-1504)
- Component: `pages/MarketPage.tsx` uses `useLanguage()` hook (line 61)
- Footer translations: `components/Footer.tsx` (line 12)

### **Authentication & Credits**
- Auth context: `context/AuthContext.tsx` (lines 296, 302 for default credits)
- Backend: `skyverses-backend/src/routes/auth.ts` (line 105 for actual 1000 credits)

---

## 8. IMPORTANT DISCREPANCIES

### **Marketing vs. Actual Credits**
| Aspect | Marketing Message | Actual Implementation |
|--------|-------------------|----------------------|
| Free signup bonus | 100 Credits | 1,000 Credits |
| Free images | Implied in "try" messaging | 100 free images (`freeImageRemaining`) |
| Footer CTA | 50 Credits | See translation key line 152 |

### **Explanation**:
- The "100 Credits" appears to be outdated SEO messaging
- Current actual welcome bonus is **1,000 credits** (more generous)
- The frontend mock shows 1000, the backend gives 1000
- SEO/Marketing materials (index.html, pageTitle) still reference 100

---

## 9. ROUTING & APP STRUCTURE

- **Homepage Route**: `/` → `pages/MarketPage.tsx`
- **App Router**: `App.tsx` lines 197-268 (Route definitions)
- **Layout Wrapper**: All routes (except `/login`) wrapped by `components/Layout.tsx`

