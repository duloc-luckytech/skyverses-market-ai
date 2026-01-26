
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
    id: 'AI-AGENT-WORKFLOW',
    slug: 'ai-agent-workflow',
    name: { 
      en: 'Aether Flow Orchestrator', 
      vi: 'AI Agent Workflow', 
      ko: 'AI 에이전트 워크플로우', 
      ja: 'AIエージェントワークフロー' 
    },
    category: { en: 'Automation', vi: 'Tự động hóa & Quy trình', ko: '자동화', ja: '自動化' },
    description: { 
      en: 'Professional node-based AI workflow for industrial image synthesis and automated creative pipelines.', 
      vi: 'Quy trình AI node-based chuyên nghiệp để tổng hợp hình ảnh công nghiệp và tự động hóa dây chuyền sáng tạo.', 
      ko: '산업용 이미지 합성 및 자동화된 크리에이티브 파이프라인을 위한 전문 노드 기반 AI 워크플로우.', 
      ja: '産業用画像合成および自動化されたクリエイティブパイプラインのためのプロフェッショナルなノードベースのAIワークフロー。' 
    },
    problems: ['Disconnected AI tools', 'Inconsistent image output', 'Manual prompt repetitive work', 'Complex multi-stage production'],
    industries: ['Game Studios', 'Advertising Agencies', 'E-commerce', 'Architectural Visualization'],
    imageUrl: 'https://images.unsplash.com/photo-1639322537228-f710d846310a?auto=format&fit=crop&q=80&w=1600',
    demoType: 'automation',
    tags: ['Workflow', 'Agentic AI', 'Image Gen', 'Pipeline'],
    features: [
      { en: 'Sequential Node Architecture', vi: 'Kiến trúc Node tuần tự', ko: '순차 노드 아키텍처', ja: 'シーケンシャルノードアーキテクチャ' },
      { en: 'Context Persistence', vi: 'Duy trì ngữ cảnh logic', ko: '컨텍스트 지속성', ja: 'コンテキストの永続性' },
      { en: 'H100 Edge Processing', vi: 'Xử lý biên H100 GPU', ko: 'H100 에지 프로세싱', ja: 'H100エッジプロセッシング' }
    ],
    complexity: 'Enterprise',
    priceReference: '500 CR / Orchestration',
    isActive: true,
    priceCredits: 500,
    featured: true,
    neuralStack: [
      { name: 'Flow Kernel v1.0', version: 'v1.0.4', capability: { en: 'Logic Orchestration', vi: 'Điều phối Logic', ko: '로직 오케스트레이션', ja: 'ロジックオーケストレーション' } },
      { name: 'Vision Edge v7', version: 'v7.2', capability: { en: 'High-Fidelity Synthesis', vi: 'Tổng hợp độ trung thực cao', ko: '고충실도 합성', ja: '高忠実度合成' } }
    ]
  },
  {
    id: 'BIRTHDAY-AI-PRO',
    slug: 'ai-birthday-generator',
    name: { 
      en: 'AI Birthday Studio', 
      vi: 'Ảnh Sinh Nhật AI', 
      ko: 'AI 생일 스튜디오', 
      ja: 'AI誕生日スタジオ' 
    },
    category: { en: 'Festivals', vi: 'Lễ hội & Sự kiện', ko: '축제', ja: 'フェスティバル' },
    description: { 
      en: 'Create festive and personalized birthday celebration photos with stunning AI concepts.', 
      vi: 'Tạo ảnh kỷ niệm sinh nhật rực rỡ và cá nhân hóa với những concept AI sáng tạo đỉnh cao.', 
      ko: '멋진 AI 컨셉으로 축제 분위기의 맞춤형 생일 축하 사진을 만드세요.', 
      ja: '素晴らしいAIコンセプトで、お祝いのパーソナライズされた誕生日写真を撮りましょう。' 
    },
    problems: ['Generic birthday cards', 'Expensive decoration costs', 'Limited creative party themes'],
    industries: ['Personal Branding', 'Social Media', 'Marketing'],
    imageUrl: 'https://images.unsplash.com/photo-1530103043960-ef38714abb15?auto=format&fit=crop&q=80&w=1600',
    demoType: 'image',
    tags: ['Birthday', 'Celebration', 'Party', 'Portrait'],
    features: [
      { en: 'Thematic Concept Engine', vi: 'Công cụ concept theo chủ đề', ko: '테마 컨셉 엔진', ja: 'テーマコンセプトエンジン' },
      { en: 'Virtual Outfit Fitting', vi: 'Thử trang phục tiệc ảo', ko: '가상 파티 의상 피팅', ja: 'バーチャルパーティードレスフィッティング' }
    ],
    complexity: 'Advanced',
    priceReference: '150 CR / generation',
    isActive: true,
    priceCredits: 150,
    featured: true
  },
  {
    id: 'WEDDING-AI-PRO',
    slug: 'ai-wedding-generator',
    name: { 
      en: 'AI Wedding Studio', 
      vi: 'Ảnh Cưới AI Pro', 
      ko: 'AI 웨딩 스튜디오', 
      ja: 'AIウェディングスタジオ' 
    },
    category: { en: 'Generative Art', vi: 'Nghệ thuật sinh tạo', ko: '생성 nghệ thuật', ja: '生成アート' },
    description: { 
      en: 'Create stunning professional wedding photos from simple portraits with advanced face sync.', 
      vi: 'Kiến tạo ảnh cưới chuyên nghiệp từ ảnh chân dung với công nghệ đồng bộ gương mặt kép tiên tiến.', 
      ko: '고급 얼굴 동기화 기술을 사용하여 간단한 인물 사진으로 멋진 전문 웨딩 사진을 만드세요.', 
      ja: '高度な顔同期技術を使用して、シンプルなポートレートから素晴らしいプロの結婚式の写真を作成します。' 
    },
    problems: ['Expensive wedding photoshoots', 'Limited time for outdoor shooting', 'Complexity of traditional editing'],
    industries: ['Photography', 'Personal Branding', 'Social Media'],
    imageUrl: 'https://images.unsplash.com/photo-1515934751635-c81c6bc9a2d8?auto=format&fit=crop&q=80&w=1600',
    demoType: 'image',
    tags: ['Wedding', 'Romantic', 'Couple', 'Face Sync'],
    features: [
      { en: 'Dual Face Sync', vi: 'Đồng bộ gương mặt kép', ko: '이중 얼굴 동기화', ja: 'デュアルフェイス同期' },
      { en: 'Luxury Dress Library', vi: 'Thư viện váy cưới cao cấp', ko: '럭셔리 드레스 라이브러리', ja: '高級ドレスライブラリ' }
    ],
    complexity: 'Advanced',
    priceReference: '150 CR / generation',
    isActive: true,
    priceCredits: 150,
    featured: true
  },
  {
    id: 'TET-GEN-PRO',
    slug: 'ai-tet-generator',
    name: { 
      en: 'AI Tet Studio', 
      vi: 'AI Tết Studio', 
      ko: 'AI 설날 스튜디오', 
      ja: 'AIテトスタジオ' 
    },
    category: { en: 'Festivals', vi: 'Lễ hội & Sự kiện', ko: '축제', ja: 'フェスティバル' },
    description: { 
      en: 'Create stunning Lunar New Year photos with traditional Ao Dai and spring atmosphere.', 
      vi: 'Kiến tạo ảnh Tết Nguyên Đán rạng rỡ với Áo dài truyền thống và không gian xuân rực rỡ.', 
      ko: '전통 아오자이와 봄 분위기의 멋진 설날 사진을 만들어보세요.', 
      ja: '伝統的なアオザイと春の雰囲気で素晴らしいテトの写真を撮りましょう。' 
    },
    problems: ['Expensive holiday photography', 'Crowded spring flower markets', 'Limited outfit choices'],
    industries: ['Marketing', 'Personal Branding', 'Social Media'],
    imageUrl: 'https://images.unsplash.com/photo-1583417319070-4a69db38a482?auto=format&fit=crop&q=80&w=1600',
    demoType: 'image',
    tags: ['Tet', 'Lunar New Year', 'Ao Dai', 'Spring'],
    features: [
      { en: 'Ao Dai Pattern Library', vi: 'Thư viện mẫu Áo dài', ko: '아오자이 패턴 라이브러리', ja: 'アオザイパターンライブラリ' },
      { en: 'Spring Flower Engine', vi: 'Công cụ mô phỏng hoa xuân', ko: '봄꽃 엔진', ja: '春の花エンジン' }
    ],
    complexity: 'Advanced',
    priceReference: '150 CR / generation',
    isActive: true,
    priceCredits: 150,
    featured: true
  },
  {
    id: 'NOEL-GEN-PRO',
    slug: 'ai-noel-generator',
    name: { 
      en: 'AI Noel Studio', 
      vi: 'AI Noel Studio', 
      ko: 'AI 노엘 스튜디오', 
      ja: 'AIノエルスタジオ' 
    },
    category: { en: 'Festivals', vi: 'Lễ hội & Sự kiện', ko: '축제', ja: 'フェスティバル' },
    description: { 
      en: 'Create magical Christmas and holiday visuals with advanced neural style transfer.', 
      vi: 'Kiến tạo hình ảnh Giáng sinh màu nhiệm với công nghệ chuyển đổi phong cách thần kinh tiên tiến.', 
      ko: '고급 신경 스타일 전송으로 마법 같은 크리스마스 및 휴일 비주얼을 만듭니다.', 
      ja: '高度なニューラルスタイル転送で、魔法のようなクリスマスとホリデーのビジュアルを作成します。' 
    },
    problems: ['Generic holiday cards', 'Expensive photography for seasonal marketing', 'Lack of unique festive content'],
    industries: ['Marketing', 'Personal Branding', 'E-commerce'],
    imageUrl: 'https://images.unsplash.com/photo-1543589077-47d81606c1ad?auto=format&fit=crop&q=80&w=1600',
    demoType: 'image',
    tags: ['Noel', 'Christmas', 'Cyber-Santa', 'Winter'],
    features: [
      { en: 'Festive DNA Lock', vi: 'Khóa định danh lễ hội', ko: '축제 DNA 잠금', ja: 'フェスティブDNAロック' },
      { en: 'Atmospheric Snow Engine', vi: 'Công cụ mô phỏng tuyết', ko: '대기 눈 엔진', ja: '大気雪エンジン' }
    ],
    complexity: 'Advanced',
    priceReference: '150 CR / generation',
    isActive: true,
    priceCredits: 150,
    featured: true
  },
  {
    id: 'PRODUCT-IMAGE',
    slug: 'product-image',
    name: { 
      en: 'AI Image Studio', 
      vi: 'AI Image Studio', 
      ko: 'AI 이미지 스튜디오', 
      ja: 'AIイメージスタジオ' 
    },
    category: { en: 'Generative Art', vi: 'Nghệ thuật sinh tạo', ko: '생성 예술', ja: '生成アート' },
    description: { 
      en: 'Professional creative studio for high-fidelity image synthesis and pixel-perfect editing.', 
      vi: 'Studio sáng tạo chuyên nghiệp để tổng hợp hình ảnh độ trung thực cao và chỉnh sửa pixel hoàn hảo.', 
      ko: '고충실도 이미지 합성 및 픽셀 완벽 편집을 위한 전문 크리에이티브 스튜디오.', 
      ja: '忠実度の高い画像合成とピクセル完璧な編集のためのプロフェッショナルなクリエイティブスタジオ。' 
    },
    problems: ['Expensive photoshoot costs', 'Slow design iterations', 'Manual retouching overhead'],
    industries: ['Marketing', 'E-commerce', 'Creative Agency'],
    imageUrl: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&q=80&w=1600',
    demoType: 'image',
    tags: ['AI Image', 'Editor', '8K', 'Upscale'],
    features: [
      { en: 'Neural Retouching', vi: 'Chỉnh sửa thần kinh', ko: '신경망 리터칭', ja: 'ニューラルレタッチ' },
      { en: 'Identity Lock', vi: 'Khóa định danh', ko: '아이덴티티 락', ja: 'アイデンティティロック' }
    ],
    complexity: 'Advanced',
    priceReference: '150 CR / generation',
    isActive: true,
    priceCredits: 150
  },
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
      ja: '仮想インテリアステージングと建築リノベーションのためのプロフェッショナルAI。' 
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
      ja: '忠実度の高いナレーション và アイデンティティクローニングのためのエンタープライズ級ニューラルボイスアーキテクチャ。' 
    },
    problems: ['Manual recording overhead', 'Voice inconsistency', 'Limited language range', 'High talent costs'],
    industries: ['Advertising', 'Education', 'Gaming', 'Customer Support'],
    imageUrl: 'https://images.unsplash.com/photo-1478737270239-2fccd27ee1f9?auto=format&fit=crop&q=80&w=1600',
    demoType: 'automation',
    tags: ['Voice AI', 'Identity Clone', '48kHz', 'Enterprise'],
    features: [
      { en: 'Multi-lingual Neural Synthesis', vi: 'Tổng hợp thần kinh đa ngôn ngữ', ko: '다국어 신경 합성', ja: '多言語ニューラル合成' },
      { en: 'One-shot Voice Cloning', vi: 'Nhân bản giọng nói tức thì', ko: '원샷 보이스 클로닝', ja: '원샷 보이스 클로닝' },
      { en: 'Professional Script Mastering', vi: 'Làm chủ kịch bản chuyên nghiệp', ko: '전문 스크립트 마스터링', ja: 'プロフェッショナルスクリプトマ스터リング' }
    ],
    complexity: 'Advanced',
    priceReference: 'Starting from 0 credits',
    isActive: true,
    priceCredits: 100,
    neuralStack: [
      { name: 'Acoustic Core v4', version: 'v4.2', capability: { en: 'Acoustic Synthesis', vi: 'Tổng hợp âm học', ko: '음향 합성', ja: '音響合成' } },
      { name: 'Identity Engine', version: 'v2.1', capability: { en: 'Persona Matching', vi: 'Khớp nhân vật', ko: '페르소나 매칭', ja: '페르소나 매칭' } }
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
