
import { Solution, UseCase, PricingPackage } from './types';

export const LOGIN_SLIDER_IMAGES = [
  "https://d8j0ntlcm91z4.cloudfront.net/user_2wktMsxjtKgSKtgICToGYmGGjfw/955c04bf-959f-4832-843a-dfbaad2d82a3_min.webp",
  "https://d8j0ntlcm91z4.cloudfront.net/user_2vV68Ukpv101mL5Dprsk6JvfLMI/6571fcff-b67e-4537-98fe-0301d9051c57_min.webp",
  "https://d8j0ntlcm91z4.cloudfront.net/user_2vV68Ukpv101mL5Dprsk6JvfLMI/596c139a-7cd8-4c10-9305-bad2f9b6ab1f_min.webp",
  "https://d8j0ntlcm91z4.cloudfront.net/user_2vV68Ukpv101mL5Dprsk6JvfLMI/640d8657-22e1-4ec7-adcf-d2b99f4e25e0_min.webp",
  "https://d8j0ntlcm91z4.cloudfront.net/user_2wktMsxjtKgSKtgICToGYmGGjfw/1354a1b1-5ef3-46d7-8cb2-17268db2d7f7_min.webp",
  "https://d8j0ntlcm91z4.cloudfront.net/user_2vV68Ukpv101mL5Dprsk6JvfLMI/82e86e0d-db5a-4bcf-8f7b-142ff21f8442_min.webp",
  "https://d8j0ntlcm91z4.cloudfront.net/user_2wKQUGex0SWTDax9bngGeSqhuK7/bd7a9af7-87da-430f-ae2e-efb223e28cf3_min.webp",
  "https://d8j0ntlcm91z4.cloudfront.net/user_32VMvlSstxcIMk6hBmtAY4gHyan/3ca5245a-2aac-4903-a528-6bfb222533ac_min.webp",
  "https://d8j0ntlcm91z4.cloudfront.net/user_32EcHkfGNK1doxze6RC3ON8fcph/ab0fd5cb-366d-4db6-b5df-3244d6a6a10b_min.webp",
  "https://d8j0ntlcm91z4.cloudfront.net/user_32VMvlSstxcIMk6hBmtAY4gHyan/3513ba7e-5084-4ca4-b6af-4d6c59239ee5_min.webp"
];

/**
 * Kho kịch bản mẫu cho Storyboard Studio
 * Chủ đề: Anime (DBZ, Naruto, One Piece), Marvel, Avatar
 */
export const STORYBOARD_SAMPLES = [
  {
    id: 's-dbz',
    title: 'Dragon Ball: Ultra Instinct Rise',
    script: 'Goku đứng giữa đấu trường đổ nát, bao quanh bởi luồng hào quang bạc lấp lánh của Bản Năng Vô Cực. Jiren lao tới với nắm đấm rực lửa nhưng Goku né tránh nhẹ nhàng như một chiếc lá trong gió, trước khi tung đòn phản công bằng luồng năng lượng xanh chói lòa.'
  },
  {
    id: 's-naruto',
    title: 'Naruto: Final Valley Clash',
    script: 'Dưới cơn mưa tầm tã tại Thung lũng Tận cùng, Naruto trong trạng thái Lục đạo và Sasuke với Susanoo hoàn mỹ lao vào nhau. Rasengan và Chidori va chạm tạo ra một hố đen năng lượng khổng lồ, phản chiếu ký ức tuổi thơ của cả hai.'
  },
  {
    id: 's-onepiece',
    title: 'One Piece: Gear 5 Joyboy',
    script: 'Luffy cười vang dội trên nóc Onigashima, toàn thân trắng toát như mây. Cậu biến mặt đất thành cao su, bật nhảy giữa những tia sét khổng lồ như một vị thần tự do, trong khi Kaido kinh ngạc nhìn nắm đấm khổng lồ xuyên qua mây mù.'
  },
  {
    id: 's-marvel',
    title: 'Marvel: Avengers Assemble',
    script: 'Captain America đứng cô độc đối diện với binh đoàn Thanos hùng hậu. Đột nhiên, tiếng rè của bộ đàm vang lên "On your left", hàng loạt cổng dịch chuyển vàng rực mở ra, các siêu anh hùng bước ra sẵn sàng cho trận chiến cuối cùng bảo vệ vũ trụ.'
  },
  {
    id: 's-avatar',
    title: 'Avatar: Way of Water',
    script: 'Jake Sully cưỡi Skimwing lướt trên mặt biển xanh biếc của Pandora. Những sinh vật biển phát sáng lung linh dưới làn nước. Quân đoàn RDA đổ bộ bằng tàu chiến khổng lồ, phá vỡ sự yên bình của rặng san hô rực rỡ.'
  }
];

export const SOLUTIONS: Solution[] = [
  {
    id: 'STORYBOARD-STUDIO',
    slug: 'storyboard-studio',
    name: { 
      en: 'Storyboard Studio Pro', 
      vi: 'Storyboard Studio Pro', 
      ko: '스토리보드 스튜디오 프로', 
      ja: 'ストーリーボード・スタジオ・プロ' 
    },
    category: { en: 'Video Production', vi: 'Sản xuất Video', ko: '비디오 제작', ja: 'ビデオ制作' },
    description: { 
      en: 'Enterprise-grade AI script-to-visual engine. Automate scene breakdown, cinematic staging, and multi-modal asset production.', 
      vi: 'Công cụ AI chuyển kịch bản thành hình ảnh cấp độ doanh nghiệp. Tự động phân tách phân cảnh, dàn dựng điện ảnh và sản xuất tài sản đa phương thức.', 
      ko: '엔터프라이즈급 AI 스크립트-비주얼 엔진. 장면 분할, 시네마틱 연출 및 멀티모달 자산 제작을 자동화합니다.', 
      ja: 'エンタープライズ向けのAIスクリプト・ビジュアルエンジン。シーン分解、映画的な演出、マルチモーダルアセット制作を自動化。' 
    },
    problems: ['Manual storyboarding bottleneck', 'Character inconsistency', 'Slow pre-production cycles', 'High directing costs'],
    industries: ['Advertising', 'Film Production', 'Game Studios', 'Content Creators'],
    imageUrl: 'https://images.unsplash.com/photo-1485846234645-a62644f84728?auto=format&fit=crop&q=80&w=1600',
    demoType: 'video',
    tags: ['Script-to-Video', 'VEO 3.1', 'Identity Lock', 'B2B'],
    features: [
      { en: 'Automated Scene Decomposition', vi: 'Tự động phân rã kịch bản', ko: '자동 장면 분해', ja: '自動シーン分解' },
      { en: 'Cinematic Staging Control', vi: 'Kiểm soát dàn dựng điện ảnh', ko: '시네마틱 연출 제어', ja: '映画的な演出制御' },
      { en: 'Multi-Modal Asset Sync', vi: 'Đồng bộ tài sản đa phương thức', ko: '멀티모달 자산 동기화', ja: 'マルチモーダルアセット同期' }
    ],
    complexity: 'Enterprise',
    priceReference: '500 CR / project',
    isActive: true,
    priceCredits: 500,
    neuralStack: [
      { name: 'Narrative Engine v5', version: 'v5.2', capability: { en: 'Semantic Analysis', vi: 'Phân tích ngữ nghĩa', ko: '의미 분석', ja: '意味分析' } },
      { name: 'Visual Orchestrator', version: 'v3.1', capability: { en: 'Frame Consistency', vi: 'Nhất quán khung hình', ko: '프레임 일관성', ja: 'フレームの一貫性' } }
    ]
  },
  {
    id: 'PRECISION-SPATIAL-ARCHITECT',
    slug: '3d-spatial-architect',
    name: { 
      en: 'Precision Spatial Architect', 
      vi: 'Kiến trúc sư Không gian Chính xác', 
      ko: '정밀 공간 아키텍트', 
      ja: '精密空間建築家' 
    },
    category: { en: '3D Synthesis', vi: 'Tổng hợp 3D', ko: '3D 합성', ja: '3D合成' },
    description: { 
      en: 'CAD-grade 3D mesh synthesis for architectural visualization and structural design.', 
      vi: 'Tổng hợp lưới 3D cấp độ CAD cho phối cảnh kiến trúc và thiết kế kết cấu.', 
      ko: '건축 시각화 및 구조 설계를 위한 CAD 등급 3D 메쉬 합성.', 
      ja: '建築可視化および構造設計のためのCADグレードの3Dメッシュ合成。' 
    },
    problems: ['Manual 3D modeling bottleneck', 'Inconsistent scale', 'Poor topology for rendering', 'High licensing costs'],
    industries: ['Architecture', 'Interior Design', 'Real Estate', 'Urban Planning'],
    imageUrl: 'https://images.unsplash.com/photo-1633356122544-f134324a6cee?auto=format&fit=crop&q=80&w=1600',
    demoType: 'automation',
    tags: ['CAD AI', 'BIM Ready', 'Structural', '8K Textures'],
    features: [
      { en: 'BIM-Compatible Topology', vi: 'Lưới đa giác tương thích BIM', ko: 'BIM 호환 토폴로지', ja: 'BIM互換トポロジー' },
      { en: 'Ray-Traced Ambient Lighting', vi: 'Ánh sáng môi trường Ray-Traced', ko: '레이 트레이싱 앰비언트 라이팅', ja: 'レイトレーシング環境照明' },
      { en: 'Auto-Calculated Scale Norms', vi: 'Tự động tính toán tỷ lệ chuẩn', ko: '자동 계산 스케일 노름', ja: '自動計算スケールノルム' }
    ],
    complexity: 'Enterprise',
    priceReference: '250 CR / creation',
    isActive: true,
    priceCredits: 250,
    neuralStack: [
      { name: 'Spatial Engine v2', version: 'v2.1', capability: { en: 'Geometric Precision', vi: 'Độ chính xác hình học', ko: '기하학적 정밀도', ja: '幾 thực học적 정밀도' } },
      { name: 'Texture Mapper Pro', version: 'v1.4', capability: { en: 'PBR Synthesis', vi: 'Tổng hợp PBR', ko: 'PBR 합성', ja: 'PBR合成' } }
    ]
  },
  {
    id: 'CHAR-SYNC-AI',
    slug: 'character-sync-ai',
    name: { 
      en: 'Character Sync AI', 
      vi: 'Character Sync AI', 
      ko: '캐릭터 싱크 AI', 
      ja: 'キャラクター同期AI' 
    },
    category: { en: 'Continuity AI', vi: 'Đồng bộ AI', ko: '연속성 AI', ja: '継続性AI' },
    description: { 
      en: 'Professional character identity locking system. Sync characters from images to video and long-form stories.', 
      vi: 'Hệ thống khóa định danh nhân vật chuyên nghiệp. Đồng bộ nhân vật từ hình ảnh sang video và truyện dài tập.', 
      ko: '전문 캐릭터 아이덴티티 잠금 시스템. 이미지에서 비디오 및 장편 스토리로 캐릭터를 동기화합니다.', 
      ja: 'プロフェッショナルなキャラクター識別ロックシステム。画像からビデオ、長編ストーリーまでキャラクターを同期。' 
    },
    problems: ['Randomized faces', 'Inconsistent outfits', 'No cross-prompt memory', 'Hard to manage hero casts'],
    industries: ['Comics', 'Game Studios', 'Film Production', 'Advertising'],
    imageUrl: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&q=80&w=1600',
    demoType: 'automation',
    tags: ['Identity Lock', 'VEO 3.1', 'Storytelling', 'Enterprise'],
    features: [
      { en: 'Visual DNA Anchoring', vi: 'Neo định danh thị giác', ko: 'Visual DNA', ja: 'Visual DNA' },
      { en: 'Multi-Character Narrative Binding', vi: 'Liên kết kịch bản đa nhân vật', ko: 'Narrative Binding', ja: 'Narrative Binding' },
      { en: 'Zero-Drift Temporal Consistency', vi: 'Nhất quán thời gian không sai lệch', ko: 'Zero-Drift', ja: 'Zero-Drift' }
    ],
    complexity: 'Enterprise',
    priceReference: '50 CR / sequence',
    isActive: true,
    priceCredits: 50,
    neuralStack: [
      { name: 'Identity Engine v4', version: 'v4.2', capability: { en: 'Symmetry Locking', vi: 'Khóa đối xứng', ko: 'Symmetry', ja: 'Symmetry' } },
      { name: 'Context Memory v2', version: 'v2.0', capability: { en: 'Project-wide Persistence', vi: 'Duy trì toàn dự án', ko: 'Persistence', ja: 'Persistence' } }
    ]
  },
  {
    id: 'PRODUCT-IMAGE',
    slug: 'product-image',
    name: { 
      en: 'Product Image Editor', 
      vi: 'Trình biên tập ảnh sản phẩm', 
      ko: '제품 이미지 에디터', 
      ja: '製品画像エディタ' 
    },
    category: { en: 'Image AI', vi: 'Ảnh AI', ko: '이미지 AI', ja: '画像AI' },
    description: { 
      en: 'Advanced AI-powered image editing and synthesis for e-commerce and professional design.', 
      vi: 'Chỉnh sửa và tổng hợp hình ảnh bằng AI tiên tiến cho thương mại điện tử và thiết kế chuyên nghiệp.', 
      ko: '전자 상거래 및 전문 디자인을 위한 고급 AI 기반 이미지 편집 및 합성.', 
      ja: '電子商取引およびプロフェッショナルなデザインのための、高度なAIを活用した画像編集 và 合成。' 
    },
    problems: ['Expensive photoshoots', 'Hard to edit backgrounds', 'Consistency issues'],
    industries: ['E-commerce', 'Marketing', 'Photography'],
    imageUrl: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&q=80&w=1600',
    demoType: 'image',
    tags: ['In-painting', 'Background Removal', 'Upscaling'],
    features: [
      { en: 'AI In-painting', vi: 'Vẽ bù bằng AI', ko: 'AI 인페인팅', ja: 'AIインペインティング' },
      { en: 'Smart Background Swap', vi: 'Thay nền thông minh', ko: '스마트 배경 교체', ja: 'スマート背景交換' }
    ],
    complexity: 'Advanced',
    priceReference: '150 CR / edit',
    isActive: true,
    priceCredits: 150
  },
  {
    id: 'FASHION-CENTER-AI',
    slug: 'fashion-center-ai',
    name: { 
      en: 'Fashion Studio AI', 
      vi: 'Fashion Studio AI', 
      ko: '패션 스튜디오 AI', 
      ja: 'ファッションスタジオAI' 
    },
    category: { en: 'Image AI', vi: 'Ảnh AI', ko: '이미지 AI', ja: '画像AI' },
    description: { 
      en: 'Generate high-end fashion visuals with consistent models and virtual try-on.', 
      vi: 'Tạo hình ảnh thời trang cao cấp với người mẫu nhất quán và thử đồ ảo.', 
      ko: '일관된 모델과 가상 착용을 통해 하이엔드 패션 비주얼을 생성합니다.', 
      ja: '一貫したモデルとバーチャル試着により、ハイエンドなファッションビジュアルを生成します。' 
    },
    problems: ['Model casting costs', 'Seasonal update lag'],
    industries: ['Fashion', 'Retail', 'Advertising'],
    imageUrl: 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&q=80&w=1600',
    demoType: 'image',
    tags: ['Virtual Try-on', 'Model Generation'],
    features: [
      { en: 'Neural Try-on', vi: 'Thử đồ thần kinh', ko: '뉴럴 트라이온', ja: 'ニューラル試着' }
    ],
    complexity: 'Advanced',
    priceReference: '150 CR / gen',
    isActive: true,
    priceCredits: 150
  }
];

export const USE_CASES: UseCase[] = [
  {
    id: 'uc-1',
    industry: 'Marketing',
    problem: 'High cost of photoshoot for seasonal campaigns.',
    solution: 'Used Character Sync AI to maintain brand ambassadors across all digital ads.',
    outcome: '85% reduction in production costs and 3x faster delivery.',
    icon: 'Megaphone'
  }
];

export const PRICING_PACKAGES: PricingPackage[] = [
  {
    name: 'Starter Node',
    priceRange: '$49 - $199 / mo',
    description: 'Perfect for individual creators and small experimental teams.',
    features: [
      '500 Universal Credits',
      'Shared Infrastructure Access',
      'Standard Support',
      'Community Templates'
    ]
  }
];
