import { useEffect } from 'react';
import { blogApi } from '../apis/blog';

const BASE_URL = 'https://insights.skyverses.com';

const CATEGORIES = ['News', 'Tutorials', 'Tips', 'Case Study', 'Community'];

const esc = (str: string) =>
  str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

/**
 * SitemapPage — serves a dynamic XML sitemap at /sitemap.xml
 * Replaces the document content with raw XML and sets correct Content-Type.
 */
const SitemapPage = () => {
  useEffect(() => {
    const generate = async () => {
      const res = await blogApi.getAllPosts();
      const posts = res?.data || [];

      const staticUrls = [
        { loc: BASE_URL + '/',           priority: '1.0', changefreq: 'daily' },
        { loc: BASE_URL + '/search',     priority: '0.3', changefreq: 'monthly' },
        ...CATEGORIES.map(cat => ({
          loc: `${BASE_URL}/category/${encodeURIComponent(cat)}`,
          priority: '0.7',
          changefreq: 'daily',
        })),
      ];

      const postUrls = posts.map(p => ({
        loc: `${BASE_URL}/${esc(p.slug)}`,
        lastmod: (p.updatedAt || p.publishedAt || '').split('T')[0],
        priority: p.isFeatured ? '0.9' : '0.8',
        changefreq: 'weekly',
      }));

      const allUrls = [...staticUrls, ...postUrls];

      const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:news="http://www.google.com/schemas/sitemap-news/0.9"
        xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">
${allUrls.map(u => `  <url>
    <loc>${u.loc}</loc>${u.lastmod ? `\n    <lastmod>${u.lastmod}</lastmod>` : ''}
    <changefreq>${u.changefreq}</changefreq>
    <priority>${u.priority}</priority>
  </url>`).join('\n')}
</urlset>`;

      // Replace entire document with raw XML
      document.open('text/xml');
      document.write(xml);
      document.close();
    };

    generate();
  }, []);

  return null;
};

export default SitemapPage;
