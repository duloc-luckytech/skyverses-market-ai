import { useEffect } from 'react';

interface PageMetaOptions {
  title: string;
  description: string;
  keywords?: string;
  ogImage?: string;
  canonical?: string;
  type?: string;
  jsonLd?: Record<string, any>;
}

const DEFAULT_OG_IMAGE = 'https://ai.skyverses.com/assets/seo/seo-og-thumbnail-v2.png';
const BASE_URL = 'https://blog.skyverses.com';

export function usePageMeta({ title, description, keywords, ogImage, canonical, type, jsonLd }: PageMetaOptions) {
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

    setMeta('name', 'description', description);
    if (keywords) setMeta('name', 'keywords', keywords);

    setMeta('property', 'og:title', title);
    setMeta('property', 'og:description', description);
    setMeta('property', 'og:image', ogImage || DEFAULT_OG_IMAGE);
    setMeta('property', 'og:type', type || 'website');
    if (canonical) setMeta('property', 'og:url', `${BASE_URL}${canonical}`);

    setMeta('name', 'twitter:title', title);
    setMeta('name', 'twitter:description', description);
    setMeta('name', 'twitter:image', ogImage || DEFAULT_OG_IMAGE);

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
