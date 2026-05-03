/**
 * scripts/add-market-product.ts
 * ─────────────────────────────────────────────────────────────────────────────
 * CLI script to add / update a MarketItem via Skyverses Admin API.
 *
 * Usage:
 *   npx ts-node scripts/add-market-product.ts
 *   npx ts-node scripts/add-market-product.ts --slug ai-slide-creator --dry-run
 *   npx ts-node scripts/add-market-product.ts --slug ai-slide-creator
 *
 * Products are defined in the PRODUCTS map below.
 * Add a new product entry, then run with --slug <your-slug>.
 * ─────────────────────────────────────────────────────────────────────────────
 */

const API_BASE = 'https://api.skyverses.com';
const BEARER_TOKEN =
  process.env.SKYVERSES_MARKET_TOKEN ||
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiI2OWM4ZGE4M2M0YjAzYTQyNGYxNjE3YTEiLCJlbWFpbCI6ImR1bG9jMjcwOEBnbWFpbC5jb20iLCJyb2xlIjoidXNlciIsIm5hbWUiOiJMb2MgRFYiLCJpYXQiOjE3NzU3ODY1NzYsImV4cCI6MTc3NjM5MTM3Nn0.ygWEBUIc4oB9iGs5AhdtX5zjyTDATQNJmYNxqqmpBBI';

/* =============================================================================
   PRODUCT CATALOG
   homeBlocks values (from constants/market-config.tsx):
     'top-choice'   → 🔥 Top Choice
     'top-image'    → 🖼  Image Studio
     'top-video'    → 🎬 Video Studio
     'top-ai-agent' → 🤖 AI Agent Workflow
     'events'       → 🎁 Lễ hội & Sự kiện
     'app-other'    → ✅ Ứng dụng khác  ← default for misc apps
============================================================================= */
interface MarketProduct {
  slug: string;
  id?: string; // optional stable ID
  name: { en: string; vi?: string; ko?: string; ja?: string };
  category: { en: string; vi?: string; ko?: string; ja?: string };
  description: { en: string; vi?: string; ko?: string; ja?: string };
  imageUrl: string;
  gallery?: string[];
  demoType?: string; // 'image' | 'video' | 'interactive'
  homeBlocks: string[];
  tags: string[];
  models?: string[];
  industries?: string[];
  problems?: string[];
  features?: { en: string; vi?: string; ko?: string; ja?: string }[];
  neuralStack?: { name: string; version?: string; capability: { en: string; vi?: string; ko?: string; ja?: string } }[];
  complexity?: string; // 'beginner' | 'intermediate' | 'advanced'
  priceReference?: string;
  priceCredits?: number;
  isFree?: boolean;
  isActive?: boolean;
  status?: string;
  featured?: boolean;
  order?: number;
  platforms?: string[];
}

const PRODUCTS: Record<string, MarketProduct> = {
  /* ─── AI Slide Creator ─────────────────────────────────────────────────── */
  'ai-slide-creator': {
    slug: 'ai-slide-creator',
    name: {
      en: 'AI Slide Creator',
      vi: 'Tạo Slide AI',
      ko: 'AI 슬라이드 크리에이터',
      ja: 'AIスライドクリエーター',
    },
    category: {
      en: 'Script',
      vi: 'Kịch bản & Studio',
      ko: '스크립트 & 스튜디오',
      ja: 'スクリプト & スタジオ',
    },
    description: {
      en: 'Create professional AI-powered presentations in 2 minutes. Each slide gets a unique AI background image, live editor for direct editing, export to PPTX/PDF/PNG.',
      vi: 'Tạo bản trình chiếu AI chuyên nghiệp hoàn chỉnh trong 2 phút. Mỗi slide có ảnh nền AI riêng, live editor chỉnh trực tiếp, xuất PPTX/PDF/PNG.',
      ko: '2분 만에 전문적인 AI 프레젠테이션을 만드세요. 각 슬라이드에 고유한 AI 배경 이미지, 실시간 편집기, PPTX/PDF/PNG 내보내기.',
      ja: '2分でプロ仕様のAIプレゼンを作成。各スライドに独自のAI背景画像、ライブエディター、PPTX/PDF/PNG書き出し対応。',
    },
    imageUrl: 'https://framerusercontent.com/images/ai-slide-creator-thumb.webp',
    demoType: 'interactive',
    homeBlocks: ['app-other'],
    tags: ['slide', 'presentation', 'AI', 'PPTX', 'PDF', 'pitch deck', 'Canva alternative'],
    models: ['GPT-4o', 'Flux', 'Stable Diffusion'],
    industries: ['Marketing', 'Education', 'Business', 'Startup'],
    features: [
      { en: 'AI-generated slide content from a single prompt', vi: 'Tạo nội dung slide từ 1 prompt duy nhất' },
      { en: 'Unique AI background image per slide', vi: 'Ảnh nền AI riêng cho từng slide' },
      { en: 'Live editor — edit text & layout directly', vi: 'Live editor — chỉnh text & layout trực tiếp' },
      { en: 'Export to PPTX, PDF, PNG', vi: 'Xuất file PPTX, PDF, PNG' },
      { en: 'Multi-language support', vi: 'Hỗ trợ đa ngôn ngữ' },
    ],
    neuralStack: [
      {
        name: 'GPT-4o',
        capability: { en: 'Slide content generation', vi: 'Sinh nội dung slide' },
      },
      {
        name: 'Flux',
        capability: { en: 'Background image synthesis', vi: 'Tổng hợp ảnh nền' },
      },
    ],
    complexity: 'beginner',
    priceCredits: 10,
    isFree: false,
    isActive: true,
    status: 'active',
    featured: false,
    order: 50,
  },

  /* ─── AI Podcast Voice ─────────────────────────────────────────────────── */
  'ai-podcast-voice': {
    id: 'AI-PODCAST-VOICE',
    slug: 'ai-podcast-voice',
    name: {
      en: 'AI Podcast Voice',
      vi: 'AI Podcast Voice',
      ko: 'AI 팟캐스트 보이스',
      ja: 'AIポッドキャストボイス',
    },
    category: {
      en: 'Audio & Music',
      vi: 'Âm thanh & Nhạc',
      ko: '오디오 & 음악',
      ja: 'オーディオ＆ミュージック',
    },
    description: {
      en: 'Create complete podcast episodes with AI-written scripts, Vietnamese multi-speaker voices, background music mixing, and MP3 export.',
      vi: 'Tạo tập podcast hoàn chỉnh với kịch bản AI, nhiều giọng Việt tự nhiên, mix nhạc nền và xuất MP3.',
      ko: 'AI 대본, 베트남어 멀티 스피커 음성, 배경음악 믹싱, MP3 내보내기로 완성형 팟캐스트를 제작하세요.',
      ja: 'AI台本、ベトナム語マルチスピーカー音声、BGMミックス、MP3書き出しでポッドキャストを制作できます。',
    },
    imageUrl: 'https://imagedelivery.net/eCWooK4EUyalJ6a-Nut5cw/0b19cde1-0a88-4670-2abb-feb9ca77ab00/public',
    gallery: [
      'https://imagedelivery.net/eCWooK4EUyalJ6a-Nut5cw/6fefe3fa-5ffc-4f8f-5289-32478668ef00/public',
      'https://imagedelivery.net/eCWooK4EUyalJ6a-Nut5cw/8ddabe04-b3b9-40ca-b459-e175af399b00/public',
      'https://imagedelivery.net/eCWooK4EUyalJ6a-Nut5cw/41117ac8-f886-4802-94a6-785e841ea500/public',
      'https://imagedelivery.net/eCWooK4EUyalJ6a-Nut5cw/a10abf09-9265-4419-34c1-3df034dd0300/public',
    ],
    demoType: 'automation',
    homeBlocks: ['app-other'],
    tags: ['podcast', 'voice', 'tts', 'audio', 'Vietnamese', 'multi-speaker', 'MP3'],
    models: ['Gemini', 'Google TTS', 'Skyverses Audio Mixer'],
    industries: ['Podcasting', 'Education', 'Marketing', 'Media', 'Audiobook'],
    problems: [
      'Studio recording is expensive and slow',
      'Finding consistent voice talent is difficult',
      'Podcast editing and audio mixing take too much time',
    ],
    features: [
      {
        en: 'AI script builder from a short outline',
        vi: 'AI viết kịch bản từ outline ngắn',
        ko: '짧은 아웃라인에서 AI 대본 생성',
        ja: '短いアウトラインからAI台本を作成',
      },
      {
        en: 'Vietnamese multi-speaker voice presets',
        vi: 'Preset nhiều giọng Việt cho host và khách mời',
        ko: '호스트와 게스트용 베트남어 멀티 스피커 음성',
        ja: 'ホストとゲスト向けのベトナム語マルチスピーカー音声',
      },
      {
        en: 'Background music with intro and outro mixing',
        vi: 'Mix nhạc nền, intro và outro tự động',
        ko: '인트로와 아웃트로를 포함한 배경음악 믹싱',
        ja: 'イントロとアウトロを含むBGMミックス',
      },
      {
        en: 'Export-ready MP3 episode output',
        vi: 'Xuất tập podcast MP3 sẵn sàng đăng tải',
        ko: '바로 게시할 수 있는 MP3 에피소드 내보내기',
        ja: '公開準備済みのMP3エピソードを書き出し',
      },
    ],
    neuralStack: [
      {
        name: 'Gemini',
        version: '2.5',
        capability: {
          en: 'Podcast script generation and dialogue structure',
          vi: 'Sinh kịch bản podcast và cấu trúc hội thoại',
          ko: '팟캐스트 대본 및 대화 구조 생성',
          ja: 'ポッドキャスト台本と会話構成の生成',
        },
      },
      {
        name: 'Google TTS',
        capability: {
          en: 'Natural multi-language speech synthesis',
          vi: 'Tổng hợp giọng nói đa ngôn ngữ tự nhiên',
          ko: '자연스러운 다국어 음성 합성',
          ja: '自然な多言語音声合成',
        },
      },
      {
        name: 'Skyverses Mixer',
        capability: {
          en: 'Episode timeline, voice segments, and music bed mixing',
          vi: 'Mix timeline tập, đoạn thoại và nhạc nền',
          ko: '에피소드 타임라인, 음성 세그먼트, 배경음악 믹싱',
          ja: 'エピソードタイムライン、音声セグメント、BGMミックス',
        },
      },
    ],
    complexity: 'Standard',
    priceReference: '50 CR / minute',
    priceCredits: 50,
    isFree: false,
    isActive: true,
    status: 'active',
    featured: true,
    order: 44,
    platforms: ['web'],
  },

  /* ─── ADD NEW PRODUCTS BELOW ───────────────────────────────────────────── */
  // Example:
  // 'ai-video-editor': {
  //   slug: 'ai-video-editor',
  //   name: { en: 'AI Video Editor', vi: 'Chỉnh Video AI' },
  //   ...
  // },
};

/* =============================================================================
   HELPERS
============================================================================= */
function log(msg: string, icon = 'ℹ️') {
  console.log(`${icon}  ${msg}`);
}

async function apiRequest(method: string, path: string, body?: unknown) {
  const url = `${API_BASE}${path}`;
  const res = await fetch(url, {
    method,
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${BEARER_TOKEN}`,
    },
    body: body ? JSON.stringify(body) : undefined,
  });

  const data = await res.json().catch(() => ({}));
  return { ok: res.ok, status: res.status, data };
}

/* =============================================================================
   MAIN
============================================================================= */
async function main() {
  const args = process.argv.slice(2);
  const slugIndex = args.indexOf('--slug');
  const dryRun = args.includes('--dry-run');
  const listFlag = args.includes('--list');

  // --list: show available product slugs
  if (listFlag) {
    console.log('\n📦 Available products in catalog:');
    Object.keys(PRODUCTS).forEach((s) => console.log(`   • ${s}`));
    return;
  }

  const targetSlug = slugIndex !== -1 ? args[slugIndex + 1] : null;

  // Determine which products to process
  const toProcess: MarketProduct[] = targetSlug
    ? [PRODUCTS[targetSlug]].filter(Boolean)
    : Object.values(PRODUCTS);

  if (toProcess.length === 0) {
    console.error(`❌ No product found for slug "${targetSlug}".`);
    console.error(`   Run with --list to see available slugs.`);
    process.exit(1);
  }

  if (dryRun) {
    log('DRY RUN — no API calls will be made', '🧪');
    toProcess.forEach((p) => {
      console.log(`\n   Slug: ${p.slug}`);
      console.log('   Payload:', JSON.stringify(p, null, 4));
    });
    return;
  }

  console.log(`\n🚀 Processing ${toProcess.length} product(s)...\n`);

  for (const product of toProcess) {
    log(`Checking if "${product.slug}" exists...`, '🔍');

    // 1. Check if already exists
    const { ok: existOk, data: existData } = await apiRequest('GET', `/market/${product.slug}`);

    if (existOk && existData?.data?._id) {
      const id = existData.data._id;
      log(`Found existing item (id: ${id}). Updating...`, '✏️');

      const { ok, status, data } = await apiRequest('PUT', `/market/${id}`, product);
      if (ok) {
        log(`"${product.slug}" updated successfully ✅`, '✅');
        console.log(`   homeBlocks: ${data?.data?.homeBlocks?.join(', ')}`);
        console.log(`   isActive:   ${data?.data?.isActive}`);
        console.log(`   status:     ${data?.data?.status}\n`);
      } else {
        console.error(`❌ Update failed (HTTP ${status}):`, data);
      }
    } else {
      // 2. Create new
      log(`"${product.slug}" not found. Creating...`, '➕');

      const { ok, status, data } = await apiRequest('POST', '/market', product);
      if (ok) {
        log(`"${product.slug}" created successfully ✅`, '✅');
        console.log(`   _id:        ${data?.data?._id}`);
        console.log(`   homeBlocks: ${data?.data?.homeBlocks?.join(', ')}`);
        console.log(`   isActive:   ${data?.data?.isActive}`);
        console.log(`   status:     ${data?.data?.status}\n`);
      } else {
        console.error(`❌ Create failed (HTTP ${status}):`, data);
      }
    }
  }

  log('Done!', '🎉');
}

main().catch((err) => {
  console.error('💥 Script crashed:', err);
  process.exit(1);
});
