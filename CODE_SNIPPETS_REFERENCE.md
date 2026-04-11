# Code Snippets Reference

## 1. HOMEPAGE SEO META SETUP

### File: `pages/MarketPage.tsx` (Lines 65-91)

```typescript
usePageMeta({
  title: 'Skyverses — Marketplace AI #1 Việt Nam | Dùng thử miễn phí 100 Credits',
  description: 'Truy cập 30+ ứng dụng AI sáng tạo trong một nền tảng: tạo Video, Ảnh, Nhạc, Giọng nói & Chat AI. Hỗ trợ Veo3, Kling, Gemini, GPT-4o, Midjourney, Flux, Grok, Qwen. Tiết kiệm ~70% — Dùng thử ngay với 100 Credits miễn phí, không cần thẻ quốc tế.',
  keywords: 'marketplace AI Việt Nam, AI giá rẻ, dùng thử AI miễn phí, tạo video AI, tạo ảnh AI, Veo3, Kling, Sora, Seedance, Gemini, GPT-4o, Grok, Midjourney, Flux, Qwen, chat AI miễn phí, text to speech AI, AI music generator, xoá nền AI, upscale ảnh AI, AI agent workflow, giải pháp AI doanh nghiệp, enterprise AI, Skyverses, credits AI, AI không cần thẻ quốc tế, nền tảng AI all-in-one',
  canonical: '/',
  jsonLd: {
    '@type': 'ItemList',
    name: 'Top AI Products — Skyverses Marketplace',
    description: '30+ công cụ AI hàng đầu: Video, Image, Voice, Music, Chat & Automation trong một nền tảng',
    url: 'https://ai.skyverses.com',
    numberOfItems: 12,
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'AI Video Generator (Veo3, Kling, Sora)', url: 'https://ai.skyverses.com/product/ai-video-generator' },
      // ... more items
    ]
  }
});
```

---

## 2. HOMEPAGE ROUTE SETUP

### File: `App.tsx` (Line 203)

```typescript
<Route path="/" element={<Suspense fallback={<HomepageSkeleton />}><MarketPage /></Suspense>} />
```

### MarketPage Import (Lines 17, 73)

```typescript
const pageImports = {
  market: () => import('./pages/MarketPage'),
  // ... other imports
};

const MarketPage = React.lazy(pageImports.market);
```

---

## 3. SEO HOOK IMPLEMENTATION

### File: `hooks/usePageMeta.ts` (Lines 20-86)

```typescript
export function usePageMeta({ title, description, keywords, ogImage, canonical, type, jsonLd }: PageMetaOptions) {
  useEffect(() => {
    // Set title
    document.title = title;

    // Helper to set/create meta tag
    const setMeta = (attr: string, key: string, content: string) => {
      let el = document.querySelector(`meta[${attr}="${key}"]`) as HTMLMetaElement | null;
      if (el) {
        el.setAttribute('content', content);
      } else {
        el = document.createElement('meta');
        el.setAttribute(attr, key);
        el.setAttribute('content', content);
        document.head.appendChild(el);
      }
    };

    // Set common meta tags
    setMeta('name', 'description', description);
    if (keywords) setMeta('name', 'keywords', keywords);

    // Set Open Graph tags
    setMeta('property', 'og:title', title);
    setMeta('property', 'og:description', description);
    setMeta('property', 'og:image', ogImage || DEFAULT_OG_IMAGE);
    setMeta('property', 'og:type', type || 'website');
    if (canonical) setMeta('property', 'og:url', `${BASE_URL}${canonical}`);

    // Set Twitter tags
    setMeta('name', 'twitter:title', title);
    setMeta('name', 'twitter:description', description);
    setMeta('name', 'twitter:image', ogImage || DEFAULT_OG_IMAGE);

    // Set canonical link
    if (canonical) {
      let link = document.querySelector('link[rel="canonical"]') as HTMLLinkElement | null;
      if (link) {
        link.href = `${BASE_URL}${canonical}`;
      } else {
        link = document.createElement('link');
        link.rel = 'canonical';
        link.href = `${BASE_URL}${canonical}`;
        document.head.appendChild(link);
      }
    }

    // Inject JSON-LD structured data
    if (jsonLd) {
      const prevScript = document.querySelector('script[data-page-jsonld]');
      if (prevScript) prevScript.remove();

      const script = document.createElement('script');
      script.type = 'application/ld+json';
      script.setAttribute('data-page-jsonld', 'true');
      script.textContent = JSON.stringify({ '@context': 'https://schema.org', ...jsonLd });
      document.head.appendChild(script);

      return () => {
        script.remove();
      };
    }
  }, [title, description, keywords, ogImage, canonical, type, jsonLd]);
}
```

---

## 4. I18N TRANSLATION SYSTEM

### File: `context/LanguageContext.tsx` (Lines 11-1563)

#### Structure:
```typescript
const translations: Record<Language, Record<string, string>> = {
  en: {
    // English translations (~382 keys)
    'home.hero.title1': 'The Platform for',
    'home.hero.title_highlight': 'AI Products',
    'footer.cta_desc': 'Sign up for free and get 50 Credits to try today.',
    // ... 379 more keys
  },
  vi: {
    // Vietnamese translations
    'home.hero.title1': 'Nền tảng',
    'home.hero.title_highlight': 'sản phẩm AI',
    'footer.cta_desc': 'Đăng ký miễn phí và nhận 50 Credits trải nghiệm ngay hôm nay.',
    // ... 379 more keys
  },
  ko: {
    // Korean translations (~364 keys)
  },
  ja: {
    // Japanese translations (~364 keys)
  }
};
```

#### Provider Export:
```typescript
export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [lang, setLang] = useState<Language>(() => {
    const saved = localStorage.getItem('skyversis_lang');
    return (saved as Language) || 'en';
  });

  // Auto-detect language based on IP country
  useEffect(() => {
    // ... language detection logic
  }, []);

  const t = (key: string) => {
    return translations[lang][key] || key;
  };

  return (
    <LanguageContext.Provider value={{ lang, setLang, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) throw new Error('useLanguage must be used within LanguageProvider');
  return context;
};
```

#### Usage in Components:
```typescript
// In Footer.tsx (Line 12)
const { t } = useLanguage();

// Render translated text
<h3 className="text-lg">{t('footer.cta_title')}</h3>
<p className="text-sm">{t('footer.cta_desc')}</p>
```

---

## 5. FOOTER CTA SECTION

### File: `components/Footer.tsx` (Lines 40-55)

```typescript
<div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-6">
  <div className="flex items-center gap-4">
    <div className="w-12 h-12 rounded-2xl bg-brand-blue/10 border border-brand-blue/20 flex items-center justify-center shrink-0">
      <Sparkles size={22} className="text-brand-blue" />
    </div>
    <div>
      <h3 className="text-lg md:text-xl font-black text-white tracking-tight">
        {t('footer.cta_title')}
      </h3>
      <p className="text-[12px] text-white/40 mt-0.5">
        {t('footer.cta_desc')}
      </p>
    </div>
  </div>
  <Link to="/login" className="group shrink-0 inline-flex items-center gap-3 bg-white text-black px-7 py-3.5 rounded-xl text-sm font-bold hover:shadow-2xl hover:shadow-white/10 hover:scale-[1.03] active:scale-[0.97] transition-all duration-300">
    {t('footer.cta_btn')}
    <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
  </Link>
</div>
```

---

## 6. STATIC HTML META TAGS

### File: `index.html` (Lines 1-50)

```html
<!DOCTYPE html>
<html lang="vi">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Skyverses — Marketplace AI #1 Việt Nam | Dùng thử miễn phí 100 Credits</title>
    <meta name="description" content="Truy cập 30+ ứng dụng AI sáng tạo hàng đầu — tạo video, ảnh, nhạc, giọng nói & chat AI — chỉ với một tài khoản. Hỗ trợ Veo3, Kling, Gemini, GPT-4o, Midjourney, Flux. Tiết kiệm ~70% so với mua lẻ từng nền tảng. Dùng thử ngay với 100 Credits miễn phí." />
    <meta name="keywords" content="marketplace AI Việt Nam, AI giá rẻ, dùng thử AI miễn phí, tạo video AI, tạo ảnh AI bằng AI, Veo3, Kling, Sora, Seedance, Grok, Midjourney, Flux, Gemini, GPT-4o, Qwen, chat AI miễn phí, text to speech AI, AI music generator, xoá nền AI, upscale ảnh AI, AI agent workflow, giải pháp AI doanh nghiệp, enterprise AI, nền tảng AI all-in-one, Skyverses, credits AI, AI không cần thẻ quốc tế" />
    <meta name="author" content="Skyverses" />
    <meta name="robots" content="index, follow, max-image-preview:large, max-snippet:-1" />
    <link rel="canonical" href="https://ai.skyverses.com" />

    <!-- Open Graph -->
    <meta property="og:type" content="website" />
    <meta property="og:site_name" content="Skyverses Marketplace AI" />
    <meta property="og:title" content="Skyverses — Marketplace AI #1 Việt Nam | Dùng thử miễn phí 100 Credits" />
    <meta property="og:description" content="🚀 30+ ứng dụng AI trong một nền tảng: Video • Ảnh • Nhạc • Giọng nói • Chat AI. Hỗ trợ Veo3, Kling, Gemini, GPT-4o, Midjourney. Tiết kiệm ~70% — Dùng thử ngay, không cần thẻ quốc tế!" />
    <meta property="og:image" content="https://ai.skyverses.com/assets/seo/seo-og-thumbnail-v2.png" />
    <meta property="og:url" content="https://ai.skyverses.com" />
    <meta property="og:locale" content="vi_VN" />

    <!-- Twitter Card -->
    <meta name="twitter:card" content="summary_large_image" />
    <meta name="twitter:title" content="Skyverses — Marketplace AI #1 Việt Nam | Dùng thử miễn phí 100 Credits" />
    <meta name="twitter:description" content="🚀 30+ ứng dụng AI: tạo Video, Ảnh, Nhạc, Giọng nói & Chat AI. Veo3, Kling, Gemini, GPT-4o, Midjourney. Tiết kiệm ~70% — Nhận ngay 100 Credits miễn phí!" />
    <meta name="twitter:image" content="https://ai.skyverses.com/assets/seo/seo-og-thumbnail-v2.png" />
  </head>
  <body>
    <!-- ... -->
  </body>
</html>
```

---

## 7. AUTHENTICATION CONTEXT

### File: `context/AuthContext.tsx` (Lines 296, 302)

```typescript
// Mock login default values
const DEFAULT_USER = {
  id: 'sandbox_user_' + Date.now(),
  email: 'sandbox@example.com',
  name: 'Sandbox User',
  avatar: DEFAULT_AVATAR_URL,
  creditBalance: 1000,  // ⭐ 1000 credits (not 100)
  plan: 'free',
};

// Mock login function
const mockLogin = useCallback(() => {
  setUser(DEFAULT_USER);
  setCredits(1000);  // ⭐ Sets 1000 credits
  localStorage.setItem('skyverses_auth', JSON.stringify(DEFAULT_USER));
  console.log('[AUTH] Mock login successful:', DEFAULT_USER);
}, []);
```

---

## 8. LAYOUT WRAPPER COMPONENT

### File: `components/Layout.tsx` (Structure)

```typescript
export const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <div className="flex flex-col min-h-screen">
      {/* ═══ Header ═══ */}
      <Header />
      
      {/* ═══ Global Tools Bar ═══ */}
      <GlobalToolsBar />
      
      {/* ═══ Main Content ═══ */}
      <main className="flex-1">
        {children}
      </main>
      
      {/* ═══ Footer ═══ */}
      <Footer />
    </div>
  );
};
```

### Route Wrapping (App.tsx):
```typescript
<Route path="*" element={
  <Layout>
    <Suspense fallback={<PageLoader />}>
      <Routes>
        <Route path="/" element={<MarketPage />} />
        {/* ... other routes */}
      </Routes>
    </Suspense>
  </Layout>
} />
```

---

## 9. KEY TRANSLATION KEYS

### Hero Section Keys (Lines 272-284, vi: 655-667):

| Key | Purpose |
|-----|---------|
| `home.hero.title1` | Primary heading: "The Platform for" |
| `home.hero.title_highlight` | Highlighted text: "AI Products" |
| `home.hero.title2` | Secondary heading: "for All Creative Needs" |
| `home.hero.subtitle` | Main tagline |
| `home.hero.subtitle2` | Credit line: "Developed by the Skyverses team" |
| `home.hero.cta1` | Primary button: "Explore Products" |
| `home.hero.cta2` | Secondary button: "Watch Demo" |

### Footer CTA Keys (Lines 151-154, vi: 533-536):

| Key | Purpose |
|-----|---------|
| `footer.cta_title` | Heading: "Ready to create with AI?" |
| `footer.cta_desc` | Description: "Sign up for free and get 50 Credits to try today." |
| `footer.cta_btn` | Button text: "Get Started Free" |
| `footer.mobile_cta` | Mobile: "Get Started Free — Get 50 Credits" |

---

## 10. TRANSLATION KEY ACCESS PATTERN

### In Components:

```typescript
import { useLanguage } from '../context/LanguageContext';

export const MyComponent: React.FC = () => {
  const { lang, t, setLang } = useLanguage();

  return (
    <div>
      {/* Current language */}
      <p>Language: {lang}</p>
      
      {/* Access translation */}
      <h1>{t('home.hero.title1')}</h1>
      
      {/* Change language */}
      <button onClick={() => setLang('vi')}>Vietnamese</button>
      <button onClick={() => setLang('en')}>English</button>
      <button onClick={() => setLang('ko')}>한국어</button>
      <button onClick={() => setLang('ja')}>日本語</button>
    </div>
  );
};
```

---

## Summary of Changes to Update Credits Messaging

To update from "100 Credits" to actual "1000 Credits", modify:

1. **`index.html`** (Lines 6, 16, 29, 30, 135, 183, 215, 240)
   - Replace: `100 Credits` → `1000 Credits`
   - Replace: `100 Credits miễn phí` → `1000 Credits miễn phí`

2. **`pages/MarketPage.tsx`** (Lines 66-67)
   - Update `usePageMeta()` title and description

3. **`context/LanguageContext.tsx`** (Lines 152, 154, 534, 536)
   - Update footer CTA translations if needed to reflect new credit amount

