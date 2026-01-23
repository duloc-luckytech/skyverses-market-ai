
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
    id: 'REAL-ESTATE-AI',
    slug: 'bat-dong-san-ai',
    name: { 
      en: 'Real Estate AI', 
      vi: 'Bất Động Sản AI', 
      ko: '부동산 AI', 
      ja: '不動産AI' 
    },
    category: { en: 'Design & Architecture', vi: 'Thiết kế & Kiến trúc', ko: '디자인 및 건축', ja: 'デザインと建築' },
    description: { 
      en: 'Professional AI for virtual interior staging and architectural renovation.', 
      vi: 'Hệ thống AI chuyên nghiệp cho dàn dựng nội thất ảo và cải tạo kiến trúc.', 
      ko: '가상 인테리어 스테이징 및 건축 리노베이션을 위한 전문 AI.', 
      ja: '仮想インテリアステージングと建築リ노베이션のためのプロフェッショナルAI。' 
    },
    problems: ['Manual interior staging costs', 'Slow renovation visualization', 'Limited design variations', 'High architectural rendering fees'],
    industries: ['Real Estate', 'Interior Design', 'Architecture', 'Construction'],
    imageUrl: 'https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?auto=format&fit=crop&q=80&w=1600',
    demoType: 'image',
    tags: ['Real Estate', 'Interior', 'Architecture', 'Renovation'],
    features: [
      { en: 'AI Virtual Staging', vi: 'Dàn dựng nội thất ảo AI', ko: 'AI 가상 스테이징', ja: 'AIバーチャルステージング' },
      { en: 'Architectural Renovation', vi: 'Cải tạo kiến trúc AI', ko: '건축 리노베이션', ja: '建築リノベーション' },
      { en: 'Style Transfer', vi: 'Chuyển đổi phong cách nội thất', ko: '인테리어 스타일 전송', ja: 'インテリアスタイルの転送' }
    ],
    complexity: 'Advanced',
    priceReference: '150 CR / design',
    isActive: true,
    priceCredits: 150,
    neuralStack: [
      { name: 'Vision Core v7.4', version: 'v7.4', capability: { en: 'Spatial Analysis', vi: 'Phân tích không gian', ko: '공간 분석', ja: '空間分析' } },
      { name: 'Interior Engine', version: 'v2.0', capability: { en: 'Style Injection', vi: 'Tiêm phong cách', ko: '스타일 주입', ja: 'スタイルの注入' } }
    ]
  },
  {
    id: 'VOICE-STUDIO-PRO',
    slug: 'ai-voice-studio',
    name: { 
      en: 'AI Voice Studio Pro', 
      vi: 'AI Voice Studio Pro', 
      ko: 'AI 보이스 스튜디오 프로', 
      ja: 'AIボイススタジオプロ' 
    },
    category: { en: 'Audio Production', vi: 'Sản xuất Âm thanh', ko: '오디오 제작', ja: 'オーディオ制作' },
    description: { 
      en: 'Enterprise-grade neural voice architecture for high-fidelity narration and identity cloning.', 
      vi: 'Kiến trúc giọng nói thần kinh cấp doanh nghiệp để tường thuật độ trung thực cao và nhân bản định danh.', 
      ko: '고충실도 내레이션 및 아이덴티티 클로닝을 위한 엔터프라이즈급 신경 음성 아키텍처.', 
      ja: '忠実度の高いナレーションとアイデンティティクローニングのためのエンタープライズ級ニューラルボイスアーキテクチャ。' 
    },
    problems: ['Manual recording overhead', 'Voice inconsistency', 'Limited language range', 'High talent costs'],
    industries: ['Advertising', 'Education', 'Gaming', 'Customer Support'],
    imageUrl: 'https://images.unsplash.com/photo-1478737270239-2fccd27ee1f9?auto=format&fit=crop&q=80&w=1600',
    demoType: 'automation',
    tags: ['Voice AI', 'Identity Clone', '48kHz', 'Enterprise'],
    features: [
      { en: 'Multi-lingual Neural Synthesis', vi: 'Tổng hợp thần kinh đa ngôn ngữ', ko: '다국어 신경 합성', ja: '多言語ニューラル合成' },
      { en: 'One-shot Voice Cloning', vi: 'Nhân bản giọng nói tức thì', ko: '원샷 보이스 클로닝', ja: 'ワンショットボイスクローニング' },
      { en: 'Professional Script Mastering', vi: 'Làm chủ kịch bản chuyên nghiệp', ko: '전문 스크립트 마스터링', ja: 'プロフェッショナルスクリプト마스터링' }
    ],
    complexity: 'Advanced',
    priceReference: 'Starting from 0 credits',
    isActive: true,
    priceCredits: 100,
    neuralStack: [
      { name: 'Acoustic Core v4', version: 'v4.2', capability: { en: 'Acoustic Synthesis', vi: 'Tổng hợp âm học', ko: '음향 합성', ja: '音響合成' } },
      { name: 'Identity Engine', version: 'v2.1', capability: { en: 'Persona Matching', vi: 'Khớp nhân vật', ko: '페르소나 매칭', ja: 'ペルソナマッチング' } }
    ]
  },
  {
    id: 'MUSIC-GEN-PRO',
    slug: 'ai-music-generator',
    name: { 
      en: 'AI Music Generator Pro', 
      vi: 'Kiến tạo Nhạc AI Pro', 
      ko: 'AI 음악 생성기 프로', 
      ja: 'AI音楽生成プロ' 
    },
    category: { en: 'Audio Production', vi: 'Sản xuất Âm thanh', ko: '오디오 제작', ja: 'オーディオ制作' },
    description: { 
      en: 'Professional neural music workstation to generate broadcast-quality tracks from text descriptions.', 
      vi: 'Trạm làm việc nhạc thần kinh chuyên nghiệp để tạo ra các bản nhạc chất lượng phát sóng từ mô tả văn bản.', 
      ko: '텍스트 설명을 통해 방송 품질의 트랙을 생성하는 전문 신경망 음악 워크스테이션.', 
      ja: 'テキストの説明から放送品質のトラックを生成するプロフェッショナルなニューラル音楽ワークステーション。' 
    },
    problems: ['Expensive licensing costs', 'Copyright strike risks', 'Slow composition cycles', 'Stock music genericness'],
    industries: ['Content Creation', 'Film Production', 'Advertising', 'Game Development'],
    imageUrl: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?auto=format&fit=crop&q=80&w=1600',
    demoType: 'text',
    tags: ['Music AI', '48kHz', 'Royalty-Free', 'Composer'],
    features: [
      { en: 'Multi-genre Neural Synthesis', vi: 'Tổng hợp thần kinh đa thể loại', ko: '다중 장르 신경 합성', ja: 'マルチジャンル・ニューラル合成' },
      { en: 'Professional BPM & Key Control', vi: 'Kiểm soát BPM & Key chuyên nghiệp', ko: '전문 BPM 및 키 제어', ja: 'プロフェッショナルBPM＆キー制御' },
      { en: 'Full Commercial Usage Rights', vi: 'Quyền sử dụng thương mại đầy đủ', ko: '전체 상업적 sử dụng quyền', ja: '完全な商業利用権' }
    ],
    complexity: 'Advanced',
    priceReference: '150 CR / generation',
    isActive: true,
    priceCredits: 150,
    neuralStack: [
      { name: 'Acoustic Core v3', version: 'v3.2', capability: { en: 'Melodic Synthesis', vi: 'Tổng hợp giai điệu', ko: '멜로디 합성', ja: 'メロディ合成' } },
      { name: 'Rhythm Engine', version: 'v1.5', capability: { en: 'Temporal Precision', vi: 'Độ chính xác thời gian', ko: '시간적 정밀도', ja: '時間的精度' } }
    ]
  },
  {
    id: 'IMAGE-RESTORER',
    slug: 'ai-image-restorer',
    name: { 
      en: 'AI Image Restorer Pro', 
      vi: 'Phục chế ảnh AI Pro', 
      ko: 'AI 이미지 복원 프로', 
      ja: 'AI画像復元プロ' 
    },
    category: { en: 'Image Restoration', vi: 'Phục chế hình ảnh', ko: '이미지 복원', ja: '画像復원' },
    description: { 
      en: 'Professional neural engine to restore old, blurred, or damaged photos to 4K crystalline quality.', 
      vi: 'Công cụ thần kinh chuyên nghiệp để phục chế ảnh cũ, mờ hoặc bị hỏng lên chất lượng 4K sắc nét.', 
      ko: '오래되거나 흐릿하거나 손상된 사진을 4K 품질로 복원하는 전문 신경 엔진.', 
      ja: '古くなった、ぼやけた、または損傷した写真を4K品質に復元するプロフェッショナルなニューラルエンジン。' 
    },
    problems: ['Low resolution archives', 'Motion blur', 'Scratched old photos', 'Digital noise'],
    industries: ['Photography', 'Heritage & History', 'Personal Archiving', 'Media & Press'],
    imageUrl: 'https://images.unsplash.com/photo-1531259683007-016a7b628fc3?auto=format&fit=crop&q=80&w=1600',
    demoType: 'image',
    tags: ['Restoration', 'De-noise', '4K Upscale', 'Face Fix'],
    features: [
      { en: 'Neural Detail Reconstruction', vi: 'Tái tạo chi tiết thần kinh', ko: '신경망 세부 재구성', ja: 'ニューラル詳細再構築' },
      { en: 'AI Scratch & Noise Removal', vi: 'Xóa vết xước & nhiễu AI', ko: 'AI 스크래치 및 노이즈 제거', ja: 'AIスクラッチとノイズ除去' },
      { en: 'Intelligent Face Enhancement', vi: 'Nâng cấp khuôn mặt thông minh', ko: '지능형 얼굴 향상', ja: '지능형 얼굴 향상' }
    ],
    complexity: 'Advanced',
    priceReference: '100 CR / restore',
    isActive: true,
    priceCredits: 100,
    neuralStack: [
      { name: 'Vision Core v7', version: 'v7.4', capability: { en: 'Detail Synthesis', vi: 'Tổng hợp chi tiết', ko: '세부 합성', ja: '詳細合成' } },
      { name: 'Lattice Restorer', version: 'v2.1', capability: { en: 'Artifact Removal', vi: 'Loại bỏ nhiễu hạt', ko: '아티팩트 제거', ja: 'アーティファクト除去' } }
    ]
  },
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
      { en: 'Multi-Modal Asset Sync', vi: 'Đồng bộ tài sản đa phương thức', ko: '멀티모달 자산 동기화', ja: '멀티모달 자산 동기화' }
    ],
    complexity: 'Enterprise',
    priceReference: '500 CR / project',
    isActive: true,
    priceCredits: 500,
    neuralStack: [
      { name: 'Narrative Engine v5', version: 'v5.2', capability: { en: 'Semantic Analysis', vi: 'Phân tích ngữ nghĩa', ko: '의미 분석', ja: '意味分析' } },
      { name: 'Visual Orchestrator', version: 'v3.1', capability: { en: 'Frame Consistency', vi: 'Nhất quán khung hình', ko: '프레임 일관성', ja: 'フレームの一貫性' } }
    ]
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
