import { useEffect } from 'react';

interface PageMetaOptions {
  title: string;
  description: string;
  keywords?: string;
  ogImage?: string;
  canonical?: string;
  type?: string;
  lang?: string;        // 'en' | 'vi' | 'ko' | 'ja'
  jsonLd?: Record<string, any>;
}

const DEFAULT_OG_IMAGE = 'https://ai.skyverses.com/assets/seo/seo-og-thumbnail-v2.png';
const BASE_URL = 'https://insights.skyverses.com';

export function usePageMeta({ title, description, keywords, ogImage, canonical, type, lang = 'en', jsonLd }: PageMetaOptions) {
  useEffect(() => {
    document.title = title;

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

    const setLink = (rel: string, attrs: Record<string, string>, id?: string) => {
      const selector = id ? `link[data-hreflang="${id}"]` : `link[rel="${rel}"]`;
      let el = document.querySelector(selector) as HTMLLinkElement | null;
      if (!el) {
        el = document.createElement('link');
        document.head.appendChild(el);
      }
      el.rel = rel;
      if (id) el.setAttribute('data-hreflang', id);
      Object.entries(attrs).forEach(([k, v]) => el!.setAttribute(k, v));
    };

    setMeta('name', 'description', description);
    if (keywords) setMeta('name', 'keywords', keywords);

    // OG tags
    setMeta('property', 'og:title', title);
    setMeta('property', 'og:description', description);
    setMeta('property', 'og:image', ogImage || DEFAULT_OG_IMAGE);
    setMeta('property', 'og:type', type || 'website');
    if (canonical) setMeta('property', 'og:url', `${BASE_URL}${canonical}`);

    // og:locale — dùng để Facebook/Zalo biết ngôn ngữ
    const localeMap: Record<string, string> = {
      en: 'en_US', vi: 'vi_VN', ko: 'ko_KR', ja: 'ja_JP',
    };
    setMeta('property', 'og:locale', localeMap[lang] || 'en_US');
    // og:locale:alternate cho ngôn ngữ kia
    const altLang = lang === 'vi' ? 'en_US' : 'vi_VN';
    setMeta('property', 'og:locale:alternate', altLang);

    // Twitter Card — bắt buộc để có preview ảnh lớn
    setMeta('name', 'twitter:card', 'summary_large_image');
    setMeta('name', 'twitter:title', title);
    setMeta('name', 'twitter:description', description);
    setMeta('name', 'twitter:image', ogImage || DEFAULT_OG_IMAGE);
    setMeta('name', 'twitter:site', '@SkyversesAI');

    // Canonical
    if (canonical) {
      setLink('canonical', { href: `${BASE_URL}${canonical}` });
    }

    // hreflang — Google dùng để phân biệt phiên bản ngôn ngữ
    if (canonical) {
      const canonicalUrl = `${BASE_URL}${canonical}`;
      setLink('alternate', { hreflang: 'en', href: canonicalUrl }, 'hreflang-en');
      setLink('alternate', { hreflang: 'vi', href: `${canonicalUrl}?lang=vi` }, 'hreflang-vi');
      setLink('alternate', { hreflang: 'x-default', href: canonicalUrl }, 'hreflang-default');
    }

    if (jsonLd) {
      const prevScript = document.querySelector('script[data-page-jsonld]');
      if (prevScript) prevScript.remove();

      const script = document.createElement('script');
      script.type = 'application/ld+json';
      script.setAttribute('data-page-jsonld', 'true');
      script.textContent = JSON.stringify({ '@context': 'https://schema.org', ...jsonLd });
      document.head.appendChild(script);

      return () => { script.remove(); };
    }
  }, [title, description, keywords, ogImage, canonical, type, jsonLd]);
}
