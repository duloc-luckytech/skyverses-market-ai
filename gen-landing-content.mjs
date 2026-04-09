#!/usr/bin/env node
/**
 * gen-landing-content.mjs
 * Dùng Claude Sonnet (ezaiapi.com) để sinh nội dung landing page
 * cho 1 product mới trước khi code.
 *
 * Usage:
 *   node gen-landing-content.mjs --slug "social-banner-ai" --name "Social Banner AI" --desc "Tạo banner social media bằng AI"
 *   node gen-landing-content.mjs  (interactive prompt)
 */

import { writeFileSync } from 'fs';

const EZ_API_KEY = 'sk-a872ad970097e44608731b01af1308b6f0ea1dfcaed1db93';
const EZ_API_URL = 'https://api-v2.itera102.cloud/v1/messages';
const MODEL = 'claude-sonnet-4-5';

// ── Parse CLI args ────────────────────────────────────────────────────────────
const args = process.argv.slice(2);
const get = (flag) => {
  const i = args.indexOf(flag);
  return i !== -1 ? args[i + 1] : null;
};

const slug = get('--slug') || 'my-product-ai';
const name = get('--name') || 'My Product AI';
const desc = get('--desc') || 'Công cụ AI giúp người dùng...';
const category = get('--category') || 'AI Tool';

console.log(`\n╔══════════════════════════════════════════════════╗`);
console.log(`║  🤖  Landing Page Content Generator              ║`);
console.log(`║  Claude Sonnet → Skyverses Landing Content       ║`);
console.log(`╚══════════════════════════════════════════════════╝\n`);
console.log(`📦 Product : ${name}`);
console.log(`🔖 Slug    : ${slug}`);
console.log(`📝 Desc    : ${desc}`);
console.log(`🏷️  Category: ${category}\n`);

// ── System prompt ─────────────────────────────────────────────────────────────
const SYSTEM = `Bạn là expert content strategist chuyên thiết kế landing page cho SaaS/AI tool products.
Bạn luôn trả về JSON hợp lệ, không có markdown, không có giải thích thêm.
Output phải là JSON object duy nhất.`;

// ── User prompt ───────────────────────────────────────────────────────────────
const USER_PROMPT = `Tôi cần nội dung landing page cho product AI sau:

- Tên product: "${name}"
- Slug: "${slug}"  
- Mô tả ngắn: "${desc}"
- Danh mục: "${category}"

Hãy tạo nội dung landing page đầy đủ, phù hợp với business cụ thể của product này.
KHÔNG dùng nội dung chung chung. Phải sáng tạo, cụ thể, ấn tượng.

Trả về JSON với cấu trúc sau (bằng Tiếng Việt, trừ các field label/tag):

{
  "hero": {
    "badge": "text cho badge nhỏ trên heading (10-15 từ, ví dụ: '4 Platforms · 14+ Kích thước chuẩn')",
    "headline": ["dòng 1 heading", "highlighted word hoặc phrase", "dòng 3 nếu cần (optional)"],
    "highlightWord": "từ/phrase được tô màu brand-blue trong headline",
    "tagline": "1-2 câu mô tả ngắn gọn nhưng súc tích (max 30 từ)",
    "ctaText": "text cho nút CTA chính (5-8 từ)",
    "specs": [
      { "label": "Spec title ngắn", "sub": "Mô tả spec chi tiết" },
      { "label": "...", "sub": "..." },
      { "label": "...", "sub": "..." },
      { "label": "...", "sub": "..." }
    ],
    "heroVisualIdea": "Mô tả ý tưởng visual cho RIGHT column của hero (ví dụ: 'Platform mockup grid showing X cover, FB post, IG story layouts' hoặc 'Before/after split showing product photo with/without background'). Cụ thể, sáng tạo, phù hợp product."
  },
  "workflow": {
    "sectionLabel": "label trên section (VD: 'QUY TRÌNH')",
    "title": "Tiêu đề section (VD: '4 bước tạo Social Banner AI')",
    "steps": [
      { "num": "01", "title": "Tên bước", "desc": "Mô tả chi tiết bước này (2-3 câu)" },
      { "num": "02", "title": "...", "desc": "..." },
      { "num": "03", "title": "...", "desc": "..." },
      { "num": "04", "title": "...", "desc": "..." }
    ]
  },
  "features": {
    "sectionLabel": "label trên section (VD: 'TÍNH NĂNG')",
    "title": "Tiêu đề section",
    "items": [
      { "title": "Tên tính năng", "desc": "Mô tả chi tiết (2-3 câu, nêu lợi ích cụ thể)" },
      { "title": "...", "desc": "..." },
      { "title": "...", "desc": "..." },
      { "title": "...", "desc": "..." },
      { "title": "...", "desc": "..." },
      { "title": "...", "desc": "..." },
      { "title": "...", "desc": "..." },
      { "title": "...", "desc": "..." }
    ]
  },
  "finalCta": {
    "title": "Câu hỏi/câu kêu gọi hành động (VD: 'Sẵn sàng tạo Social Banner AI?')",
    "subtitle": "1 dòng liệt kê key features (VD: '4 platforms · 14+ formats · AI Boost · 4K Export')",
    "buttonText": "Text nút CTA"
  },
  "seo": {
    "title": "SEO title tag (max 60 chars)",
    "description": "Meta description (max 155 chars)",
    "keywords": "keyword1, keyword2, keyword3..."
  }
}`;

// ── Call API ──────────────────────────────────────────────────────────────────
async function callClaude() {
  console.log(`🔄 Calling Claude ${MODEL}...\n`);

  const res = await fetch(EZ_API_URL, {
    method: 'POST',
    headers: {
      'x-api-key': EZ_API_KEY,
      'anthropic-version': '2023-06-01',
      'content-type': 'application/json',
    },
    body: JSON.stringify({
      model: MODEL,
      max_tokens: 4096,
      system: SYSTEM,
      messages: [{ role: 'user', content: USER_PROMPT }],
    }),
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`API Error ${res.status}: ${err}`);
  }

  const data = await res.json();
  const rawText = data.content?.[0]?.text || '';

  // Extract JSON (handle possible markdown code blocks)
  const jsonMatch = rawText.match(/```json\n?([\s\S]*?)\n?```/) || rawText.match(/(\{[\s\S]*\})/);
  const jsonStr = jsonMatch ? jsonMatch[1] : rawText;

  return JSON.parse(jsonStr.trim());
}

// ── Main ──────────────────────────────────────────────────────────────────────
async function main() {
  try {
    const content = await callClaude();

    // Pretty print result
    console.log(`✅ Content generated!\n`);
    console.log(`━━━━━━━━━━━━━━━━━━━━━━━━━━ HERO ━━━━━━━━━━━━━━━━━━━━━━━━━━`);
    console.log(`Badge: ${content.hero?.badge}`);
    console.log(`H1: ${content.hero?.headline?.join(' / ')}`);
    console.log(`Tagline: ${content.hero?.tagline}`);
    console.log(`CTA: ${content.hero?.ctaText}`);
    console.log(`\n🎨 Hero Visual Idea:`);
    console.log(`   ${content.hero?.heroVisualIdea}`);

    console.log(`\n━━━━━━━━━━━━━━━━━━━━━━━━ WORKFLOW ━━━━━━━━━━━━━━━━━━━━━━━━`);
    content.workflow?.steps?.forEach(s => console.log(`  ${s.num}. ${s.title} — ${s.desc.substring(0, 60)}...`));

    console.log(`\n━━━━━━━━━━━━━━━━━━━━━━━━ FEATURES ━━━━━━━━━━━━━━━━━━━━━━━━`);
    content.features?.items?.forEach(f => console.log(`  ✦ ${f.title}`));

    console.log(`\n━━━━━━━━━━━━━━━━━━━━━━━━━ SEO ━━━━━━━━━━━━━━━━━━━━━━━━━━━`);
    console.log(`Title: ${content.seo?.title}`);
    console.log(`Desc:  ${content.seo?.description}`);

    // Save to file
    const outFile = `landing-content-${slug}.json`;
    writeFileSync(outFile, JSON.stringify(content, null, 2), 'utf8');
    console.log(`\n💾 Saved to: ${outFile}`);
    console.log(`\n🚀 Next step: Use this content to build landing page sections.\n`);

    return content;
  } catch (err) {
    console.error(`\n❌ Error: ${err.message}`);
    process.exit(1);
  }
}

main();
