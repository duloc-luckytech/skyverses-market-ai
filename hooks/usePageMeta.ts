import { useEffect } from 'react';

interface PageMetaOptions {
  title: string;
  description: string;
  keywords?: string;
  ogImage?: string;
  canonical?: string;
}

const DEFAULT_OG_IMAGE = 'https://framerusercontent.com/images/GyMtocumMA0iElsHB6CRyb2GQ.png';
const BASE_URL = 'https://skyverses.io';

/**
 * Hook to dynamically update page meta tags for SEO.
 * Updates: document.title, meta description, keywords, og:*, twitter:*, canonical
 */
export function usePageMeta({ title, description, keywords, ogImage, canonical }: PageMetaOptions) {
  useEffect(() => {
    // Title
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

    // Description
    setMeta('name', 'description', description);

    // Keywords
    if (keywords) setMeta('name', 'keywords', keywords);

    // Open Graph
    setMeta('property', 'og:title', title);
    setMeta('property', 'og:description', description);
    setMeta('property', 'og:image', ogImage || DEFAULT_OG_IMAGE);
    if (canonical) setMeta('property', 'og:url', `${BASE_URL}${canonical}`);

    // Twitter
    setMeta('name', 'twitter:title', title);
    setMeta('name', 'twitter:description', description);
    setMeta('name', 'twitter:image', ogImage || DEFAULT_OG_IMAGE);

    // Canonical link
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
  }, [title, description, keywords, ogImage, canonical]);
}
