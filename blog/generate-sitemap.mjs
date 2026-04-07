#!/usr/bin/env node
/**
 * generate-sitemap.mjs
 * Run này trước khi build hoặc deploy để tạo sitemap.xml tĩnh vào public/
 * Usage: node generate-sitemap.mjs
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const API_BASE = process.env.VITE_API_BASE_URL || 'https://api.skyverses.com';
const SITE_BASE = 'https://insights.skyverses.com';

async function generateSitemap() {
  console.log('🗺️  Fetching published blog posts...');
  
  try {
    const res = await fetch(`${API_BASE}/blog?limit=500&page=1`);
    const data = await res.json();
    const posts = data?.data || [];
    
    console.log(`✅ Found ${posts.length} posts`);

    const staticPages = [
      { url: SITE_BASE, priority: '1.0', changefreq: 'daily' },
      { url: `${SITE_BASE}/category/Tutorials`, priority: '0.8', changefreq: 'weekly' },
      { url: `${SITE_BASE}/category/News`, priority: '0.8', changefreq: 'weekly' },
      { url: `${SITE_BASE}/category/Tips`, priority: '0.7', changefreq: 'weekly' },
      { url: `${SITE_BASE}/category/Case Study`, priority: '0.7', changefreq: 'weekly' },
    ];

    const urlSet = [
      ...staticPages.map(p => `
  <url>
    <loc>${p.url}</loc>
    <changefreq>${p.changefreq}</changefreq>
    <priority>${p.priority}</priority>
    <xhtml:link rel="alternate" hreflang="en" href="${p.url}"/>
    <xhtml:link rel="alternate" hreflang="vi" href="${p.url}?lang=vi"/>
    <xhtml:link rel="alternate" hreflang="x-default" href="${p.url}"/>
  </url>`),
      ...posts.map(post => {
        const lastmod = (post.updatedAt || post.publishedAt || new Date().toISOString()).split('T')[0];
        const postUrl = `${SITE_BASE}/${post.slug}`;
        return `
  <url>
    <loc>${postUrl}</loc>
    <lastmod>${lastmod}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.7</priority>
    <xhtml:link rel="alternate" hreflang="en" href="${postUrl}"/>
    <xhtml:link rel="alternate" hreflang="vi" href="${postUrl}?lang=vi"/>
    <xhtml:link rel="alternate" hreflang="x-default" href="${postUrl}"/>
  </url>`;
      }),
    ].join('');

    const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:xhtml="http://www.w3.org/1999/xhtml">
${urlSet}
</urlset>`;

    const outPath = path.join(__dirname, 'public', 'sitemap.xml');
    fs.mkdirSync(path.join(__dirname, 'public'), { recursive: true });
    fs.writeFileSync(outPath, xml, 'utf-8');
    console.log(`✅ Sitemap written to ${outPath} (${posts.length} posts + ${staticPages.length} static pages)`);
  } catch (err) {
    console.error('❌ Failed to generate sitemap:', err.message);
    process.exit(1);
  }
}

generateSitemap();
