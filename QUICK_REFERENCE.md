# Quick Reference: Key Files & Locations

## 🏠 HOMEPAGE & LANDING PAGE

| Item | File Path | Lines | Notes |
|------|-----------|-------|-------|
| **Homepage Component** | `pages/MarketPage.tsx` | 1-203+ | Main landing page at route `/` |
| **Homepage Route** | `App.tsx` | 203 | `<Route path="/" element={<MarketPage />}>` |
| **Layout Wrapper** | `components/Layout.tsx` | - | Wraps all pages except login |
| **Header** | `components/Header.tsx` | 1-32+ | Navigation & user menu |
| **Footer** | `components/Footer.tsx` | 1-200+ | CTA section & links |

---

## 🔍 SEO IMPLEMENTATION

| Item | File Path | Lines | Key Info |
|------|-----------|-------|----------|
| **SEO Hook** | `hooks/usePageMeta.ts` | 1-87 | Sets document.title, meta tags, og:*, twitter:*, JSON-LD |
| **Homepage SEO** | `pages/MarketPage.tsx` | 65-91 | Uses `usePageMeta()` with title "Dùng thử miễn phí 100 Credits" |
| **Static HTML** | `index.html` | 1-250 | Title (line 6), description (line 7), OG tags (line 16), Twitter (line 29) |
| **OG Image** | `index.html` | 18 | URL: `https://ai.skyverses.com/assets/seo/seo-og-thumbnail-v2.png` |

### SEO Meta Values (MarketPage):
```
Title: Skyverses — Marketplace AI #1 Việt Nam | Dùng thử miễn phí 100 Credits
Description: Truy cập 30+ ứng dụng AI sáng tạo trong một nền tảng... 100 Credits miễn phí
Keywords: marketplace AI Việt Nam, AI giá rẻ, dùng thử AI miễn phí, ... (50+ keywords)
Canonical: /
```

---

## 💳 "100 CREDITS" MENTIONS

| File | Line(s) | Context | Text |
|------|---------|---------|------|
| `index.html` | 6 | `<title>` | `Dùng thử miễn phí 100 Credits` |
| `index.html` | 16 | `og:title` | `Dùng thử miễn phí 100 Credits` |
| `index.html` | 29 | `twitter:title` | `Dùng thử miễn phí 100 Credits` |
| `index.html` | 30 | `twitter:description` | `Nhận ngay 100 Credits miễn phí` |
| `index.html` | 135 | Schema FAQ | `Dùng thử miễn phí với 100 Credits` |
| `index.html` | 183 | Schema FAQ | `Đăng ký tài khoản mới nhận ngay 100 Credits miễn phí` |
| `index.html` | 215 | Schema FAQ | `nhận 100 Credits` |
| `index.html` | 240 | Noscript fallback | `Dùng thử miễn phí 100 Credits` |
| `pages/MarketPage.tsx` | 66 | usePageMeta title | Title includes `100 Credits` |
| `pages/MarketPage.tsx` | 67 | usePageMeta description | Description includes `100 Credits miễn phí` |

### ⚠️ DISCREPANCY:
- **Marketing/SEO says**: 100 Credits free
- **Actual backend gives**: 1,000 Credits welcome bonus
  - Source: `context/AuthContext.tsx` line 296
  - Source: `skyverses-backend/src/routes/auth.ts` line 105

---

## 🌐 VIETNAMESE "DÙNG THỬ" TEXT

| Location | Text | Language |
|----------|------|----------|
| `index.html:6` | `Dùng thử miễn phí 100 Credits` | Vietnamese |
| `index.html:16` | `Dùng thử miễn phí 100 Credits` | Vietnamese |
| `index.html:29` | `Dùng thử miễn phí 100 Credits` | Vietnamese |
| `context/LanguageContext.tsx:534` | `Đăng ký miễn phí và nhận 50 Credits trải nghiệm ngay hôm nay.` | Vietnamese |
| `context/LanguageContext.tsx:536` | `Bắt đầu miễn phí — Nhận 50 Credits` | Vietnamese |

**Key Translation Keys**:
- `footer.cta_title` (line 46, vi: line 533)
- `footer.cta_desc` (line 47, vi: line 534)
- `footer.mobile_cta` (line 154, vi: line 536)

---

## 🔤 I18N TRANSLATION SYSTEM

| Item | File Path | Lines | Type |
|------|-----------|-------|------|
| **Translation Provider** | `context/LanguageContext.tsx` | 1-1563 | Custom inline translations object |
| **English** | `context/LanguageContext.tsx` | 12-393 | ~382 keys |
| **Vietnamese** | `context/LanguageContext.tsx` | 394-775 | ~382 keys |
| **Korean** | `context/LanguageContext.tsx` | 776-1139 | ~364 keys |
| **Japanese** | `context/LanguageContext.tsx` | 1140-1503 | ~364 keys |
| **Language Hook** | `context/LanguageContext.tsx` | 1558-1562 | `useLanguage()` export |

### Translation Usage:
```typescript
// In components:
const { lang, setLang, t } = useLanguage();

// Access translation:
{t('footer.cta_desc')}
```

### Footer CTA Translations:
| Key | English | Vietnamese |
|-----|---------|-----------|
| `footer.cta_title` | Ready to create with AI? | Sẵn sàng sáng tạo với AI? |
| `footer.cta_desc` | Sign up for free and get 50 Credits to try today. | Đăng ký miễn phí và nhận 50 Credits trải nghiệm ngay hôm nay. |
| `footer.cta_btn` | Get Started Free | Bắt đầu miễn phí |
| `footer.mobile_cta` | Get Started Free — Get 50 Credits | Bắt đầu miễn phí — Nhận 50 Credits |

---

## 📍 HERO SECTION TRANSLATIONS

| Key | Line (en) | Line (vi) | English | Vietnamese |
|-----|-----------|-----------|---------|-----------|
| `home.hero.title1` | 273 | 655 | The Platform for | Nền tảng |
| `home.hero.title_highlight` | 274 | 656 | AI Products | sản phẩm AI |
| `home.hero.title2` | 275 | 657 | for All Creative Needs | cho mọi nhu cầu sáng tạo |
| `home.hero.subtitle` | 276 | 658 | 30+ AI products — Video, Image, Voice, Music & Automated Workflow. | 30+ sản phẩm AI — Video, Ảnh, Giọng nói, Nhạc & Workflow tự động. |
| `home.hero.subtitle2` | 277 | 659 | Developed by the Skyverses team. | Được phát triển bởi đội ngũ Skyverses. |
| `home.hero.cta1` | 278 | 660 | Explore Products | Khám phá sản phẩm |
| `home.hero.cta2` | 279 | 661 | Watch Demo | Xem demo |

---

## 🔐 AUTHENTICATION & CREDITS

| Item | File Path | Line(s) | Value | Context |
|------|-----------|---------|-------|---------|
| **Default Credits** | `context/AuthContext.tsx` | 296 | 1000 | Mock login default |
| **Set Credits** | `context/AuthContext.tsx` | 302 | 1000 | Mock login call |
| **Backend Welcome Bonus** | `skyverses-backend/src/routes/auth.ts` | 105 | 1000 | Actual welcome credits given |
| **Free Images** | `context/AuthContext.tsx` | - | 100 | `freeImageRemaining` for new users |

---

## 📂 DIRECTORY STRUCTURE

```
skyverses-market-ai/
├── pages/
│   ├── MarketPage.tsx ⭐ (Homepage)
│   ├── LoginPage.tsx
│   └── ... (40+ other pages)
├── components/
│   ├── Layout.tsx
│   ├── Header.tsx
│   ├── Footer.tsx
│   ├── landing/
│   │   ├── image-generator/
│   │   ├── video-generator/
│   │   ├── social-banner-ai/
│   │   ├── realestate-visual-ai/
│   │   ├── image-restoration/
│   │   └── _shared/
│   └── ... (90+ other components)
├── context/
│   ├── LanguageContext.tsx ⭐ (i18n)
│   ├── AuthContext.tsx
│   ├── ThemeContext.tsx
│   └── ... (other contexts)
├── hooks/
│   ├── usePageMeta.ts ⭐ (SEO)
│   └── ... (other hooks)
├── App.tsx ⭐ (Routes)
├── index.html ⭐ (Static HTML meta)
└── ... (other files)
```

---

## 🎯 SUMMARY TABLE

| Purpose | File | Line(s) | Key Finding |
|---------|------|---------|-------------|
| Homepage | `pages/MarketPage.tsx` | 1-203+ | Route `/` with featured products |
| SEO Meta | `pages/MarketPage.tsx` | 65-91 | Title: "...Dùng thử miễn phí 100 Credits" |
| Static SEO | `index.html` | 6, 16, 29 | 100 Credits mention in 4 places |
| i18n System | `context/LanguageContext.tsx` | 11-1504 | 4 languages, 382+ translation keys |
| Footer CTA | `context/LanguageContext.tsx` | 152, 534 | "Get 50 Credits" (en), "Nhận 50 Credits" (vi) |
| Welcome Bonus | `context/AuthContext.tsx` | 296, 302 | 1000 credits (not 100) |

