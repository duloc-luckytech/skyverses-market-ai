#!/usr/bin/env node
// =============================================================
// apply_image_restorer_cdn.js
// Đọc URLs từ scripts/image_restorer_cdn_urls.sh
// → tự động update HeroSection, ShowcaseSection,
//   WorkflowSection, FeaturesSection
// =============================================================

const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');
const CDN_FILE = path.join(__dirname, 'image_restorer_cdn_urls.sh');

// ── 1. Parse CDN URLs từ .sh file ─────────────────────────────
function parseCdnFile(filePath) {
  if (!fs.existsSync(filePath)) {
    console.error(`❌  File không tồn tại: ${filePath}`);
    console.error('    Chạy: bash scripts/generate_image_restorer_cdn.sh trước');
    process.exit(1);
  }

  const content = fs.readFileSync(filePath, 'utf8');
  const urls = {};
  const regex = /^CDN_(\w+)="(https:\/\/[^"]+)"/gm;
  let match;
  while ((match = regex.exec(content)) !== null) {
    urls[match[1]] = match[2];
  }
  return urls;
}

const CDN = parseCdnFile(CDN_FILE);
console.log(`\n✅ Loaded ${Object.keys(CDN).length} CDN URLs\n`);
Object.entries(CDN).forEach(([k, v]) => console.log(`   CDN_${k}: ${v.slice(0, 60)}...`));

// ── Helper: replace in file ────────────────────────────────────
function updateFile(filePath, replaceFn) {
  const full = path.join(ROOT, filePath);
  let content = fs.readFileSync(full, 'utf8');
  const updated = replaceFn(content);
  if (updated !== content) {
    fs.writeFileSync(full, updated, 'utf8');
    console.log(`\n✅ Updated: ${filePath}`);
    return true;
  }
  console.log(`⚠  No change: ${filePath}`);
  return false;
}

// ── 2. HeroSection.tsx ────────────────────────────────────────
if (CDN.hero_before && CDN.hero_after) {
  updateFile('components/landing/image-restoration/HeroSection.tsx', (src) => {
    return src
      .replace(/beforeSrc="[^"]*"/, `beforeSrc="${CDN.hero_before}"`)
      .replace(/afterSrc="[^"]*"/,  `afterSrc="${CDN.hero_after}"`);
  });
} else {
  console.log('⚠  Bỏ qua HeroSection — thiếu CDN_hero_before hoặc CDN_hero_after');
}

// ── 3. ShowcaseSection.tsx ────────────────────────────────────
updateFile('components/landing/image-restoration/ShowcaseSection.tsx', (src) => {
  let out = src;

  // portrait
  if (CDN.showcase_portrait_before)
    out = out.replace(/id: 'portrait-hero'[\s\S]*?before: '[^']*'/, (m) =>
      m.replace(/before: '[^']*'/, `before: '${CDN.showcase_portrait_before}'`)
    );
  if (CDN.showcase_portrait_after)
    out = out.replace(/id: 'portrait-hero'[\s\S]*?after: '[^']*'/, (m) =>
      m.replace(/after: '[^']*'/, `after: '${CDN.showcase_portrait_after}'`)
    );

  // wedding
  if (CDN.showcase_wedding_before)
    out = out.replace(/id: 'wedding-1'[\s\S]*?before: '[^']*'/, (m) =>
      m.replace(/before: '[^']*'/, `before: '${CDN.showcase_wedding_before}'`)
    );
  if (CDN.showcase_wedding_after)
    out = out.replace(/id: 'wedding-1'[\s\S]*?after: '[^']*'/, (m) =>
      m.replace(/after: '[^']*'/, `after: '${CDN.showcase_wedding_after}'`)
    );

  // colorize
  if (CDN.showcase_colorize_before)
    out = out.replace(/id: 'colorize-1'[\s\S]*?before: '[^']*'/, (m) =>
      m.replace(/before: '[^']*'/, `before: '${CDN.showcase_colorize_before}'`)
    );
  if (CDN.showcase_colorize_after)
    out = out.replace(/id: 'colorize-1'[\s\S]*?after: '[^']*'/, (m) =>
      m.replace(/after: '[^']*'/, `after: '${CDN.showcase_colorize_after}'`)
    );

  // landscape
  if (CDN.showcase_landscape_before)
    out = out.replace(/id: 'landscape-1'[\s\S]*?before: '[^']*'/, (m) =>
      m.replace(/before: '[^']*'/, `before: '${CDN.showcase_landscape_before}'`)
    );
  if (CDN.showcase_landscape_after)
    out = out.replace(/id: 'landscape-1'[\s\S]*?after: '[^']*'/, (m) =>
      m.replace(/after: '[^']*'/, `after: '${CDN.showcase_landscape_after}'`)
    );

  // memorial
  if (CDN.showcase_memorial_before)
    out = out.replace(/id: 'memorial-1'[\s\S]*?before: '[^']*'/, (m) =>
      m.replace(/before: '[^']*'/, `before: '${CDN.showcase_memorial_before}'`)
    );
  if (CDN.showcase_memorial_after)
    out = out.replace(/id: 'memorial-1'[\s\S]*?after: '[^']*'/, (m) =>
      m.replace(/after: '[^']*'/, `after: '${CDN.showcase_memorial_after}'`)
    );

  // portrait-2 (wide card) — reuse portrait pair
  if (CDN.showcase_portrait_before)
    out = out.replace(/id: 'portrait-2'[\s\S]*?before: '[^']*'/, (m) =>
      m.replace(/before: '[^']*'/, `before: '${CDN.showcase_portrait_before}'`)
    );
  if (CDN.showcase_portrait_after)
    out = out.replace(/id: 'portrait-2'[\s\S]*?after: '[^']*'/, (m) =>
      m.replace(/after: '[^']*'/, `after: '${CDN.showcase_portrait_after}'`)
    );

  return out;
});

// ── 4. WorkflowSection.tsx ────────────────────────────────────
if (CDN.workflow_result_thumb) {
  updateFile('components/landing/image-restoration/WorkflowSection.tsx', (src) => {
    return src.replace(
      /thumb: '[^']*'/,
      `thumb: '${CDN.workflow_result_thumb}'`
    );
  });
} else {
  console.log('⚠  Bỏ qua WorkflowSection — thiếu CDN_workflow_result_thumb');
}

// ── 5. FeaturesSection.tsx ────────────────────────────────────
updateFile('components/landing/image-restoration/FeaturesSection.tsx', (src) => {
  let out = src;
  if (CDN.feat_face_enhancement) {
    // Replace first thumbnail (Face Enhancement)
    out = out.replace(
      /(title: 'Face Enhancement AI'[\s\S]*?thumbnail: ')[^']*(')/,
      `$1${CDN.feat_face_enhancement}$2`
    );
  }
  if (CDN.feat_color_synthesis) {
    // Replace second thumbnail (Color Synthesis)
    out = out.replace(
      /(title: 'Color Synthesis AI'[\s\S]*?thumbnail: ')[^']*(')/,
      `$1${CDN.feat_color_synthesis}$2`
    );
  }
  return out;
});

console.log('\n══════════════════════════════════════════════════════');
console.log('✅ Done! Components đã được update với CDN URLs');
console.log('   Kiểm tra: npm run dev → /product/ai-image-restorer');
console.log('══════════════════════════════════════════════════════\n');
