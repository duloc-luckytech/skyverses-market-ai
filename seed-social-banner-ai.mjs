const API = 'https://api.skyverses.com/market';
const TOKEN = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiI2OWM4ZDhjYWQ4MWZhNWRlN2JkMTA2MTYiLCJyb2xlIjoiYWRtaW4iLCJlbWFpbCI6ImFkbWluQHNreXZlcnNlcy5jb20iLCJpYXQiOjE3NzU0OTIzOTQsImV4cCI6MTc3NjA5NzE5NH0.3c7nZ2JOFwDtaw6cn9zg7xnA6HyUohbC6jpQ4Q_mUZI';

const product = {
  id: 'SOCIAL-BANNER-AI',
  slug: 'social-banner-ai',
  name: {
    en: 'Social Banner AI',
    vi: 'Tạo Banner MXH AI',
    ko: '소셜 배너 AI',
    ja: 'ソーシャルバナーAI',
  },
  category: {
    en: 'Image',
    vi: 'Hình ảnh',
    ko: '이미지',
    ja: '画像',
  },
  description: {
    en: 'AI-powered social media banner generator. Create pixel-perfect banners for X, Facebook, Instagram, and LinkedIn in seconds — with brand colors, text, and platform-optimized dimensions.',
    vi: 'Công cụ tạo banner mạng xã hội bằng AI. Tạo banner chuẩn pixel cho X, Facebook, Instagram, LinkedIn trong vài giây — với màu thương hiệu, văn bản và kích thước chuẩn từng nền tảng.',
    ko: 'AI 기반 소셜 미디어 배너 생성기. X, Facebook, Instagram, LinkedIn용 픽셀 완벽한 배너를 몇 초 만에 생성하세요.',
    ja: 'AIを活用したソーシャルメディアバナージェネレーター。X、Facebook、Instagram、LinkedInのバナーを数秒で作成。',
  },
  problems: [
    'No design skills',
    'Wrong banner dimensions per platform',
    'Inconsistent brand identity',
    'Slow manual design process',
  ],
  industries: ['Marketing', 'E-commerce', 'Content Creation', 'Branding', 'Social Media'],
  imageUrl: 'https://images.unsplash.com/photo-1611162617213-7d7a39e9b1d7?auto=format&fit=crop&q=80&w=1600',
  demoType: 'image',
  tags: ['Banner', 'Social Media', 'Facebook', 'Instagram', 'X', 'LinkedIn', 'Marketing', 'Branding'],
  features: [
    { en: 'X / Twitter Cover & Post', vi: 'Banner & bài đăng X/Twitter', ko: 'X/트위터 커버 & 포스트', ja: 'X/Twitterカバー＆投稿' },
    { en: 'Facebook Cover & Post', vi: 'Banner & bài đăng Facebook', ko: '페이스북 커버 & 포스트', ja: 'Facebookカバー＆投稿' },
    { en: 'Instagram Story & Post', vi: 'Story & bài đăng Instagram', ko: '인스타그램 스토리 & 포스트', ja: 'Instagramストーリー＆投稿' },
    { en: 'LinkedIn Banner', vi: 'Banner LinkedIn', ko: '링크드인 배너', ja: 'LinkedInバナー' },
    { en: 'Brand Colors & Fonts', vi: 'Màu thương hiệu & Font chữ', ko: '브랜드 색상 및 폰트', ja: 'ブランドカラー＆フォント' },
    { en: 'AI Text Copywriting', vi: 'AI viết tiêu đề & mô tả', ko: 'AI 텍스트 카피라이팅', ja: 'AIテキストコピーライティング' },
    { en: 'Platform-Exact Dimensions', vi: 'Kích thước chuẩn từng nền tảng', ko: '플랫폼별 정확한 크기', ja: 'プラットフォーム対応サイズ' },
    { en: 'PNG / JPG Export', vi: 'Xuất PNG / JPG chất lượng cao', ko: 'PNG / JPG 내보내기', ja: 'PNG/JPGエクスポート' },
  ],
  complexity: 'Standard',
  priceReference: '120 CR / banner',
  isActive: true,
  isFree: false,
  priceCredits: 120,
  featured: true,
  homeBlocks: ['top_trending'],
};

async function seed() {
  const res = await fetch(API, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${TOKEN}`,
    },
    body: JSON.stringify(product),
  });
  const data = await res.json();
  if (data.success) {
    console.log(`✅ Seeded! _id = ${data.data?._id}`);
  } else {
    console.error(`❌ Failed: ${data.message}`);
    console.error(data);
  }
}

seed();
