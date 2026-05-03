import { execFileSync } from 'node:child_process';
import { mkdirSync, rmSync, writeFileSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const OUT_DIR = join(ROOT, 'public/assets/podcast-voice');
const TMP_DIR = join(OUT_DIR, '.tmp');

mkdirSync(TMP_DIR, { recursive: true });

const palette = {
  ink: '#07111f',
  panel: '#0d1b2e',
  panel2: '#132a46',
  blue: '#0090ff',
  cyan: '#28d7ff',
  violet: '#8b5cf6',
  pink: '#ec4899',
  green: '#20d6a0',
  amber: '#f59e0b',
  text: '#f8fbff',
  muted: '#91a4c3',
};

const grid = `
  <pattern id="grid" width="80" height="80" patternUnits="userSpaceOnUse">
    <path d="M80 0H0V80" fill="none" stroke="${palette.blue}" stroke-width="1" opacity=".12"/>
  </pattern>
`;

const defs = `
  <defs>
    <linearGradient id="bg" x1="0" x2="1" y1="0" y2="1">
      <stop offset="0%" stop-color="#05101f"/>
      <stop offset="45%" stop-color="#0b1631"/>
      <stop offset="100%" stop-color="#190b2c"/>
    </linearGradient>
    <linearGradient id="brand" x1="0" x2="1">
      <stop offset="0%" stop-color="${palette.blue}"/>
      <stop offset="52%" stop-color="${palette.violet}"/>
      <stop offset="100%" stop-color="${palette.pink}"/>
    </linearGradient>
    <linearGradient id="cyan" x1="0" x2="1">
      <stop offset="0%" stop-color="${palette.blue}"/>
      <stop offset="100%" stop-color="${palette.cyan}"/>
    </linearGradient>
    <filter id="glow" x="-60%" y="-60%" width="220%" height="220%">
      <feGaussianBlur stdDeviation="18" result="blur"/>
      <feColorMatrix in="blur" type="matrix" values="0 0 0 0 0.00 0 0 0 0 0.56 0 0 0 0 1.00 0 0 0 .65 0"/>
      <feMerge>
        <feMergeNode/>
        <feMergeNode in="SourceGraphic"/>
      </feMerge>
    </filter>
    ${grid}
  </defs>
`;

function shell(width, height, children) {
  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">
  ${defs}
  <rect width="${width}" height="${height}" fill="url(#bg)"/>
  <rect width="${width}" height="${height}" fill="url(#grid)" opacity=".45"/>
  <circle cx="${Math.round(width * 0.82)}" cy="${Math.round(height * 0.18)}" r="${Math.round(width * 0.25)}" fill="${palette.blue}" opacity=".13"/>
  <circle cx="${Math.round(width * 0.16)}" cy="${Math.round(height * 0.82)}" r="${Math.round(width * 0.22)}" fill="${palette.violet}" opacity=".16"/>
  ${children}
</svg>`;
}

function text(x, y, content, size, weight = 700, color = palette.text, extra = '') {
  return `<text x="${x}" y="${y}" font-family="Arial, Helvetica, sans-serif" font-size="${size}" font-weight="${weight}" fill="${color}" ${extra}>${content}</text>`;
}

function paintAttr(name, value) {
  const match = /^rgba\((\d+),(\d+),(\d+),([.\d]+)\)$/.exec(value);
  if (!match) return `${name}="${value}"`;

  const [, r, g, b, a] = match;
  const hex = [r, g, b]
    .map((part) => Number(part).toString(16).padStart(2, '0'))
    .join('');

  return `${name}="#${hex}" ${name}-opacity="${a}"`;
}

function rounded(x, y, w, h, r, fill, stroke = 'rgba(255,255,255,.16)', opacity = 1) {
  return `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="${r}" ${paintAttr('fill', fill)} ${paintAttr('stroke', stroke)} opacity="${opacity}"/>`;
}

function waveform(x, y, bars, maxHeight, color = palette.blue, gap = 8) {
  return Array.from({ length: bars }, (_, i) => {
    const height = 16 + ((i * 37) % maxHeight);
    const bx = x + i * gap;
    const by = y - height / 2;
    return `<rect x="${bx}" y="${by}" width="4" height="${height}" rx="2" fill="${color}" opacity="${0.32 + (i % 5) * 0.1}"/>`;
  }).join('\n');
}

function speakerCard(x, y, label, accent, waveformColor) {
  return `
    ${rounded(x, y, 315, 118, 28, 'rgba(255,255,255,.08)', 'rgba(255,255,255,.16)')}
    <circle cx="${x + 58}" cy="${y + 58}" r="32" fill="${accent}" opacity=".2"/>
    <circle cx="${x + 58}" cy="${y + 58}" r="18" fill="${accent}"/>
    ${text(x + 108, y + 43, label, 24)}
    ${text(x + 108, y + 72, 'natural voice preset', 15, 600, palette.muted)}
    ${waveform(x + 108, y + 94, 22, 46, waveformColor, 8)}
  `;
}

const hero = shell(1600, 900, `
  <path d="M260 610 C500 350 720 760 930 480 S1270 190 1390 430" fill="none" stroke="url(#brand)" stroke-width="18" stroke-linecap="round" opacity=".85" filter="url(#glow)"/>
  <g transform="translate(690 130)">
    ${rounded(0, 0, 700, 560, 42, 'rgba(7,17,31,.82)', 'rgba(255,255,255,.18)')}
    ${rounded(36, 36, 628, 86, 28, 'rgba(255,255,255,.08)', 'rgba(255,255,255,.12)')}
    ${text(66, 91, 'AI Podcast Voice', 36, 900)}
    ${text(418, 91, 'LIVE MIX', 18, 900, palette.green)}
    ${speakerCard(52, 160, 'Host A', palette.blue, palette.cyan)}
    ${speakerCard(333, 266, 'Guest B', palette.violet, palette.pink)}
    ${speakerCard(78, 390, 'Narrator', palette.green, palette.green)}
    <circle cx="552" cy="420" r="72" fill="url(#brand)" opacity=".9"/>
    <circle cx="552" cy="420" r="36" fill="#fff" opacity=".9"/>
    <rect x="540" y="392" width="24" height="58" rx="12" fill="${palette.ink}"/>
    <path d="M513 426 C513 474 591 474 591 426" fill="none" stroke="${palette.ink}" stroke-width="12" stroke-linecap="round"/>
  </g>
  <g transform="translate(150 184)">
    ${text(0, 0, 'Podcast studio', 30, 800, palette.cyan)}
    ${text(0, 70, 'Script + voice + music', 42, 900, palette.text)}
    ${text(0, 118, 'Export-ready episodes in one AI workspace.', 25, 700, palette.muted)}
    ${rounded(0, 150, 420, 74, 24, 'rgba(0,144,255,.18)', 'rgba(40,215,255,.32)')}
    ${text(34, 198, 'Vietnamese multi-speaker audio', 24, 800)}
  </g>
`);

const scriptBoard = shell(1200, 760, `
  <g transform="translate(90 86)">
    ${text(0, 0, 'Script Builder', 42, 900)}
    ${text(0, 42, 'Outline becomes a structured dialogue in seconds.', 22, 600, palette.muted)}
    ${rounded(0, 95, 480, 420, 34, 'rgba(255,255,255,.08)', 'rgba(255,255,255,.15)')}
    ${text(36, 152, 'Episode brief', 28, 900)}
    ${['Intro hook', 'Host question', 'Guest answer', 'Transition', 'Final CTA'].map((label, i) => `
      <circle cx="52" cy="${206 + i * 56}" r="9" fill="${i === 0 ? palette.blue : palette.violet}"/>
      ${text(78, 214 + i * 56, label, 21, 700, i === 0 ? palette.text : palette.muted)}
      <rect x="248" y="${195 + i * 56}" width="${150 + (i * 37) % 145}" height="12" rx="6" fill="url(#brand)" opacity="${0.34 + i * 0.08}"/>
    `).join('')}
  </g>
  <g transform="translate(620 130)">
    ${rounded(0, 0, 480, 500, 38, 'rgba(7,17,31,.78)', 'rgba(255,255,255,.18)')}
    ${text(42, 68, 'Dialogue Preview', 31, 900)}
    ${speakerCard(42, 112, 'Host', palette.blue, palette.cyan)}
    ${speakerCard(122, 258, 'Guest', palette.violet, palette.pink)}
  </g>
`);

const voiceMixer = shell(1200, 760, `
  <g transform="translate(88 84)">
    ${text(0, 0, 'Voice Mixer', 42, 900)}
    ${text(0, 42, 'Assign consistent hosts, guests, and narration tones.', 22, 600, palette.muted)}
  </g>
  <g transform="translate(110 190)">
    ${['Northern Warm', 'Southern Bright', 'Storyteller', 'English Pro'].map((label, i) => `
      <g transform="translate(${i * 250} 0)">
        ${rounded(0, 0, 215, 405, 34, 'rgba(255,255,255,.08)', 'rgba(255,255,255,.16)')}
        <circle cx="108" cy="82" r="44" fill="${[palette.blue, palette.violet, palette.green, palette.pink][i]}" opacity=".22"/>
        <circle cx="108" cy="82" r="26" fill="${[palette.blue, palette.violet, palette.green, palette.pink][i]}"/>
        ${text(30, 162, label, 21, 850)}
        ${text(30, 196, i % 2 ? 'Guest voice' : 'Host voice', 16, 700, palette.muted)}
        <rect x="30" y="238" width="155" height="12" rx="6" fill="rgba(255,255,255,.16)"/>
        <rect x="30" y="238" width="${80 + i * 24}" height="12" rx="6" fill="url(#cyan)"/>
        <rect x="30" y="292" width="155" height="12" rx="6" fill="rgba(255,255,255,.16)"/>
        <rect x="30" y="292" width="${130 - i * 17}" height="12" rx="6" fill="url(#brand)"/>
        ${waveform(36, 354, 18, 54, [palette.blue, palette.violet, palette.green, palette.pink][i], 8)}
      </g>
    `).join('')}
  </g>
`);

const exportReady = shell(1200, 760, `
  <g transform="translate(90 86)">
    ${text(0, 0, 'Publish Ready', 42, 900)}
    ${text(0, 42, 'Mix music, chapters, and MP3 export from one flow.', 22, 600, palette.muted)}
  </g>
  <g transform="translate(104 174)">
    ${rounded(0, 0, 992, 435, 42, 'rgba(255,255,255,.08)', 'rgba(255,255,255,.16)')}
    ${text(52, 78, 'Episode timeline', 31, 900)}
    <rect x="52" y="126" width="888" height="18" rx="9" fill="rgba(255,255,255,.14)"/>
    <rect x="52" y="126" width="320" height="18" rx="9" fill="${palette.blue}"/>
    <rect x="384" y="126" width="246" height="18" rx="9" fill="${palette.violet}"/>
    <rect x="642" y="126" width="298" height="18" rx="9" fill="${palette.green}"/>
    ${waveform(58, 240, 96, 112, palette.cyan, 9)}
    ${rounded(58, 332, 250, 62, 20, 'rgba(32,214,160,.14)', 'rgba(32,214,160,.4)')}
    ${text(88, 372, 'MP3 192 kbps', 23, 900, palette.green)}
    ${rounded(338, 332, 250, 62, 20, 'rgba(0,144,255,.14)', 'rgba(0,144,255,.4)')}
    ${text(369, 372, 'Chapters', 23, 900, palette.cyan)}
    ${rounded(618, 332, 250, 62, 20, 'rgba(236,72,153,.14)', 'rgba(236,72,153,.4)')}
    ${text(648, 372, 'Music bed', 23, 900, palette.pink)}
  </g>
`);

const thumb = shell(900, 600, `
  <path d="M92 410 C228 190 352 520 484 300 S746 120 824 296" fill="none" stroke="url(#brand)" stroke-width="16" stroke-linecap="round" opacity=".9" filter="url(#glow)"/>
  <g transform="translate(90 100)">
    ${text(0, 0, 'AI Podcast', 54, 900)}
    ${text(0, 62, 'Voice Studio', 54, 900, palette.cyan)}
    ${text(4, 112, 'Multi-speaker audio generator', 23, 700, palette.muted)}
  </g>
  <g transform="translate(560 145)">
    <circle cx="102" cy="102" r="94" fill="url(#brand)" opacity=".88"/>
    <circle cx="102" cy="102" r="45" fill="#fff" opacity=".92"/>
    <rect x="87" y="64" width="30" height="76" rx="15" fill="${palette.ink}"/>
    <path d="M55 108 C55 176 149 176 149 108" fill="none" stroke="${palette.ink}" stroke-width="13" stroke-linecap="round"/>
  </g>
  <g transform="translate(94 388)">
    ${waveform(0, 64, 70, 86, palette.cyan, 10)}
  </g>
`);

const assets = [
  ['podcast-voice-hero.webp', 1600, 900, hero],
  ['podcast-voice-script.webp', 1200, 760, scriptBoard],
  ['podcast-voice-voices.webp', 1200, 760, voiceMixer],
  ['podcast-voice-export.webp', 1200, 760, exportReady],
  ['podcast-voice-thumb.webp', 900, 600, thumb],
];

for (const [file, width, height, svg] of assets) {
  const svgPath = join(TMP_DIR, file.replace(/\.webp$/, '.svg'));
  const outPath = join(OUT_DIR, file);
  writeFileSync(svgPath, svg);
  execFileSync('magick', [
    '-background',
    'transparent',
    '-density',
    '144',
    svgPath,
    '-resize',
    `${width}x${height}!`,
    '-quality',
    '92',
    outPath,
  ], { stdio: 'inherit' });
  console.log(`generated ${outPath}`);
}

rmSync(TMP_DIR, { recursive: true, force: true });
