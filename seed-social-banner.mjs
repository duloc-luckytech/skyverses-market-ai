/**
 * Seed: Social Banner AI Product
 * ─────────────────────────────
 * Thêm product "Social Banner AI" vào marketplace.
 * Run: node seed-social-banner.mjs
 */

const API = 'https://api.skyverses.com/market';
const TOKEN = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiI2OWM4ZDhjYWQ4MWZhNWRlN2JkMTA2MTYiLCJyb2xlIjoiYWRtaW4iLCJlbWFpbCI6ImFkbWluQHNreXZlcnNlcy5jb20iLCJpYXQiOjE3NzU0OTIzOTQsImV4cCI6MTc3NjA5NzE5NH0.3c7nZ2JOFwDtaw6cn9zg7xnA6HyUohbC6jpQ4Q_mUZI';

const product = {
  id: 'SOCIAL-BANNER-AI',
  slug: 'social-banner-ai',

  name: {
    en: 'Social Banner AI',
    vi: 'Tạo Banner Mạng Xã Hội AI',
    ko: '소셜 배너 AI',
    ja: 'ソーシャルバナーAI'
  },

  category: {
    en: 'Marketing Design',
    vi: 'Thiết kế Marketing',
    ko: '마케팅 디자인',
    ja: 'マーケティングデザイン'
  },

  description: {
    en: 'Generate pixel-perfect social media banners for X (Twitter), Facebook, Instagram and LinkedIn with AI. Cover photos, post images, stories — all in correct dimensions instantly.',
    vi: 'Tạo banner mạng xã hội đúng kích thước chuẩn cho X (Twitter), Facebook, Instagram và LinkedIn bằng AI. Cover, post, story — đúng pixel, đúng tỷ lệ, chuyên nghiệp ngay lập tức.',
    ko: 'X(트위터), 페이스북, 인스타그램, 링크드인용 소셜 미디어 배너를 AI로 생성. 커버, 포스트, 스토리 — 정확한 규격으로 즉시 제작.',
    ja: 'X(Twitter)、Facebook、Instagram、LinkedIn用のソーシャルメディアバナーをAIで生成。カバー、投稿、ストーリー — 正確なサイズで即座に作成。'
  },

  problems: [
    'Wrong image dimensions get cropped',
    'Manual resizing wastes hours',
    'No design skills for professional banners',
    'Inconsistent brand visual across platforms'
  ],

  industries: [
    'Social Media Marketing',
    'Brand Management',
    'E-commerce',
    'Content Creation',
    'Agencies'
  ],

  // Placeholder — will be replaced by gen-social-banner-image.mjs
  imageUrl: 'https://images.unsplash.com/photo-1611162617213-7d7a39e9b1d7?auto=format&fit=crop&q=80&w=1600',

  demoType: 'image',

  tags: [
    'Social Media',
    'Banner',
    'Facebook Cover',
    'X Twitter',
    'Instagram Story',
    'LinkedIn Banner',
    'Marketing',
    'AI Design'
  ],

  features: [
    { en: '14 Platform-Native Formats', vi: '14 định dạng chuẩn nền tảng', ko: '14가지 플랫폼별 형식', ja: '14種類のプラットフォーム規格' },
    { en: 'AI Prompt Optimizer', vi: 'Tối ưu prompt AI tự động', ko: 'AI 프롬프트 최적화', ja: 'AIプロンプト最適化' },
    { en: 'Brand Color DNA Lock', vi: 'Khóa màu thương hiệu', ko: '브랜드 컬러 고정', ja: 'ブランドカラーロック' },
    { en: 'Reference Image Upload', vi: 'Upload ảnh tham chiếu', ko: '참조 이미지 업로드', ja: '参照画像アップロード' },
    { en: 'Text Overlay Control', vi: 'Kiểm soát tiêu đề & phụ đề', ko: '텍스트 오버레이 조정', ja: 'テキストオーバーレイ制御' },
    { en: '4K Resolution Export', vi: 'Xuất chất lượng 4K', ko: '4K 해상도 내보내기', ja: '4K解像度エクスポート' }
  ],

  platforms: ['web'],

  complexity: 'Standard',
  priceReference: '120 CR / banner',
  isActive: true,
  isFree: false,
  priceCredits: 120,
  featured: true,

  homeBlocks: ['top_trending', 'marketing_tools'],
};

async function seed() {
  console.log('🚀 Seeding Social Banner AI product...\n');
  try {
    const res = await fetch(API, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${TOKEN}`
      },
      body: JSON.stringify(product)
    });

    const data = await res.json();

    if (data.success) {
      console.log(`✅ Created: ${product.slug}`);
      console.log(`   _id: ${data.data?._id}`);
      console.log(`   slug: ${data.data?.slug}`);
      console.log('\n👉 Next: run node gen-social-banner-image.mjs to generate and update the banner image.');
    } else {
      console.log(`❌ Failed:`, data.message || JSON.stringify(data));
    }
  } catch (e) {
    console.error('❌ Error:', e.message);
  }
}

seed();
