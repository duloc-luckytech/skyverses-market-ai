import { useEffect } from 'react';
import { blogApi } from '../apis/blog';

const BASE_URL = 'https://insights.skyverses.com';
const SITE_TITLE = 'Skyverses Insights — Tin tức AI mới nhất mọi lĩnh vực';
const SITE_DESC = 'Cập nhật tin tức AI mới nhất 2026 cho mọi lĩnh vực: Video AI, Ảnh AI, Âm nhạc, Giọng nói, Y tế, Giáo dục, Tài chính, Doanh nghiệp. Hướng dẫn thực chiến từ đội ngũ Skyverses.';

const esc = (str = '') =>
  str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

const toRFC822 = (iso: string) => {
  try { return new Date(iso).toUTCString(); } catch { return ''; }
};

/**
 * RSSFeedPage — serves a dynamic RSS 2.0 feed at /rss.xml
 * Compatible with feed readers, Google News, and Zalo News.
 */
const RSSFeedPage = () => {
  useEffect(() => {
    const generate = async () => {
      const res = await blogApi.getAllPosts();
      const posts = (res?.data || [])
        .sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime())
        .slice(0, 50); // RSS typically 20-50 most recent

      const items = posts.map(p => {
        const title = esc(p.title?.vi || p.title?.en || '');
        const excerpt = esc(p.excerpt?.vi || p.excerpt?.en || '');
        const link = `${BASE_URL}/${esc(p.slug)}`;
        const pubDate = toRFC822(p.publishedAt);
        const image = p.seo?.ogImage || p.coverImage || '';
        const author = esc(p.author?.name || 'Skyverses Team');
        const category = esc(p.category || '');
        const tags = (p.tags || []).map((t: string) => `    <category>${esc(t)}</category>`).join('\n');

        return `  <item>
    <title>${title}</title>
    <link>${link}</link>
    <guid isPermaLink="true">${link}</guid>
    <description>${excerpt}</description>
    <pubDate>${pubDate}</pubDate>
    <author>contact@skyverses.com (${author})</author>
    <category>${category}</category>
${tags}${image ? `\n    <enclosure url="${esc(image)}" type="image/jpeg" length="0" />` : ''}
    <source url="${BASE_URL}/rss.xml">${esc(SITE_TITLE)}</source>
  </item>`;
      }).join('\n');

      const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0"
  xmlns:atom="http://www.w3.org/2005/Atom"
  xmlns:content="http://purl.org/rss/1.0/modules/content/"
  xmlns:dc="http://purl.org/dc/elements/1.1/"
  xmlns:media="http://search.yahoo.com/mrss/">
  <channel>
    <title>${esc(SITE_TITLE)}</title>
    <link>${BASE_URL}</link>
    <description>${esc(SITE_DESC)}</description>
    <language>vi</language>
    <lastBuildDate>${new Date().toUTCString()}</lastBuildDate>
    <atom:link href="${BASE_URL}/rss.xml" rel="self" type="application/rss+xml" />
    <image>
      <url>https://ai.skyverses.com/assets/seo/seo-og-thumbnail-v2.png</url>
      <title>${esc(SITE_TITLE)}</title>
      <link>${BASE_URL}</link>
      <width>144</width>
      <height>144</height>
    </image>
    <copyright>© ${new Date().getFullYear()} Skyverses. All rights reserved.</copyright>
    <managingEditor>contact@skyverses.com (Skyverses Team)</managingEditor>
    <webMaster>contact@skyverses.com (Skyverses Team)</webMaster>
    <ttl>60</ttl>
${items}
  </channel>
</rss>`;

      document.open('text/xml');
      document.write(xml);
      document.close();
    };

    generate();
  }, []);

  return null;
};

export default RSSFeedPage;
