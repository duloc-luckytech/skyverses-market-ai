#!/usr/bin/env node
// apply_image_restorer_extra_cdn.cjs
// Apply CDN URLs cho WorkflowSection steps 1-3 và FeaturesSection 6 cards nhỏ

const fs = require('fs');
const path = require('path');

const CDN_FILE = path.resolve(__dirname, 'image_restorer_extra_cdn_urls.sh');
const ROOT = path.resolve(__dirname, '..');

// ── Load CDN URLs ──────────────────────────────────────────────────────────
if (!fs.existsSync(CDN_FILE)) {
  console.error('❌ CDN file not found:', CDN_FILE);
  process.exit(1);
}

const raw = fs.readFileSync(CDN_FILE, 'utf8');
const CDN = {};
for (const line of raw.split('\n')) {
  const m = line.match(/^CDN_(\w+)="([^"]+)"/);
  if (m) CDN[m[1]] = m[2];
}

console.log('✅ Loaded', Object.keys(CDN).length, 'CDN URLs\n');
for (const [k, v] of Object.entries(CDN)) {
  console.log(`   CDN_${k}: ${v.slice(0, 60)}...`);
}
console.log('');

let changed = 0;

function updateFile(relPath, transform) {
  const abs = path.join(ROOT, relPath);
  if (!fs.existsSync(abs)) {
    console.log('⚠  File not found:', relPath);
    return;
  }
  const src = fs.readFileSync(abs, 'utf8');
  const next = transform(src);
  if (next === src) {
    console.log('⚠  No change:', relPath);
  } else {
    fs.writeFileSync(abs, next, 'utf8');
    console.log('✅ Updated:', relPath);
    changed++;
  }
}

// ── 1. WorkflowSection.tsx ─────────────────────────────────────────────────
// Replace thumb: null for steps 1, 2, 3
updateFile('components/landing/image-restoration/WorkflowSection.tsx', (src) => {
  let out = src;

  // Step 1: title 'Tải ảnh cũ lên' — replace its thumb: null
  if (CDN.workflow_step1_upload) {
    out = out.replace(
      /(title:\s*'Tải ảnh cũ lên'[\s\S]*?thumb:\s*)null/,
      `$1'${CDN.workflow_step1_upload}'`
    );
  }

  // Step 2: title 'AI Phân Tích'
  if (CDN.workflow_step2_scan) {
    out = out.replace(
      /(title:\s*'AI Phân Tích'[\s\S]*?thumb:\s*)null/,
      `$1'${CDN.workflow_step2_scan}'`
    );
  }

  // Step 3: title 'Tái Tạo 4K'
  if (CDN.workflow_step3_upscale) {
    out = out.replace(
      /(title:\s*'Tái Tạo 4K'[\s\S]*?thumb:\s*)null/,
      `$1'${CDN.workflow_step3_upscale}'`
    );
  }

  return out;
});

// ── 2. FeaturesSection.tsx ─────────────────────────────────────────────────
// Add thumbnail to 6 non-featured cards & set featured: true for visual display
updateFile('components/landing/image-restoration/FeaturesSection.tsx', (src) => {
  let out = src;

  const cardMap = [
    { title: 'Scratch Removal',    key: 'feat_scratch_removal' },
    { title: 'Noise Reduction',    key: 'feat_noise_reduction' },
    { title: '8K Upscaling',       key: 'feat_8k_upscaling' },
    { title: 'Tốc Độ H100 GPU',    key: 'feat_h100_gpu' },
    { title: 'Privacy Vault',      key: 'feat_privacy_vault' },
    { title: 'History Sync',       key: 'feat_history_sync' },
  ];

  for (const { title, key } of cardMap) {
    const url = CDN[key];
    if (!url) {
      console.log(`⚠  Missing CDN key: ${key}`);
      continue;
    }
    // Find the block for this card: match "title: 'Scratch Removal'," then add thumbnail before closing brace
    // Pattern: title: 'X',\n    desc: '...',\n    featured: false,\n  },
    const blockRegex = new RegExp(
      `(title:\\s*'${title.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}',[\\s\\S]*?featured:\\s*false,)(\n  \\},)`,
      'm'
    );
    const replacement = `$1\n    thumbnail: '${url}',$2`;
    const updated = out.replace(blockRegex, replacement);
    if (updated === out) {
      console.log(`⚠  Could not inject thumbnail for: ${title}`);
    } else {
      out = updated;
    }
  }

  return out;
});

console.log('');
console.log('══════════════════════════════════════════════════════════');
console.log(`✅ Done! ${changed} file(s) updated với CDN URLs`);
console.log('   Kiểm tra: npm run dev → /product/ai-image-restorer');
console.log('══════════════════════════════════════════════════════════');
