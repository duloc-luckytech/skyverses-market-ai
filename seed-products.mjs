const API = 'https://api.skyverses.com/market';
const TOKEN = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiI2OWM4ZDhjYWQ4MWZhNWRlN2JkMTA2MTYiLCJyb2xlIjoiYWRtaW4iLCJlbWFpbCI6ImFkbWluQHNreXZlcnNlcy5jb20iLCJpYXQiOjE3NzU0OTIzOTQsImV4cCI6MTc3NjA5NzE5NH0.3c7nZ2JOFwDtaw6cn9zg7xnA6HyUohbC6jpQ4Q_mUZI';
const products = [
  {
    id: '3D-SPATIAL-ARCHITECT', slug: '3d-spatial-architect',
    name: { en: '3D Spatial Architect', vi: 'Kiến Trúc Không Gian 3D', ko: '3D 공간 아키텍트', ja: '3D空間アーキテクト' },
    category: { en: 'Generative Art', vi: 'Nghệ thuật sinh tạo', ko: '생성 아트', ja: '生成アート' },
    description: { en: 'Generate immersive 3D environments and spatial designs with AI-powered architectural visualization.', vi: 'Tạo môi trường 3D sống động và thiết kế không gian với trực quan hóa kiến trúc AI.', ko: 'AI 기반 건축 시각화로 몰입감 있는 3D 환경 및 공간 디자인 생성.', ja: 'AI搭載の建築ビジュアライゼーションで没入型3D環境と空間デザインを生成。' },
    problems: ['Expensive 3D modeling', 'Complex CAD software', 'Slow architectural renders'],
    industries: ['Architecture', 'Interior Design', 'Real Estate', 'Gaming'],
    imageUrl: 'https://images.unsplash.com/photo-1558618666-fcd25c85f82e?auto=format&fit=crop&q=80&w=1600',
    demoType: 'image', tags: ['3D', 'Spatial', 'Architecture', 'Environment'],
    features: [
      { en: 'Text-to-3D Scene', vi: 'Văn bản sang cảnh 3D', ko: '텍스트-투-3D 장면', ja: 'テキストから3Dシーン' },
      { en: 'Architectural AI', vi: 'AI kiến trúc', ko: '건축 AI', ja: '建築AI' },
      { en: 'Spatial Walkthrough', vi: 'Dạo quanh không gian', ko: '공간 워크스루', ja: '空間ウォークスルー' }
    ],
    complexity: 'Enterprise', priceReference: '400 CR / scene', isActive: true, priceCredits: 400, featured: true
  },
  {
    id: 'MUSIC-GENERATOR', slug: 'music-generator',
    name: { en: 'Music Generator Pro', vi: 'Tạo Nhạc Pro', ko: '뮤직 제너레이터 프로', ja: 'ミュージックジェネレータープロ' },
    category: { en: 'Audio & Music', vi: 'Âm thanh & Nhạc', ko: '오디오 & 음악', ja: 'オーディオ＆ミュージック' },
    description: { en: 'Advanced music composition engine with lyrics, vocals, and full arrangement generation.', vi: 'Công cụ sáng tác nhạc nâng cao với lời bài hát, giọng hát và tạo phối khí đầy đủ.', ko: '가사, 보컬 및 전체 편곡 생성을 갖춘 고급 음악 작곡 엔진.', ja: '歌詞、ボーカル、フルアレンジメント生成を備えた高度な音楽作曲エンジン。' },
    problems: ['No music skills', 'Expensive producers', 'Copyright limitations'],
    industries: ['Music Production', 'Content Creation', 'Advertising', 'Gaming'],
    imageUrl: 'https://images.unsplash.com/photo-1511379938547-c1f69419868d?auto=format&fit=crop&q=80&w=1600',
    demoType: 'automation', tags: ['Music', 'Composition', 'Vocals', 'Arrangement'],
    features: [
      { en: 'Vocal Synthesis', vi: 'Tổng hợp giọng hát', ko: '보컬 합성', ja: 'ボーカル合成' },
      { en: 'Lyrics Generator', vi: 'Tạo lời bài hát', ko: '가사 생성기', ja: '歌詞ジェネレーター' },
      { en: 'Full Arrangement', vi: 'Phối khí đầy đủ', ko: '전체 편곡', ja: 'フルアレンジメント' }
    ],
    complexity: 'Advanced', priceReference: '150 CR / song', isActive: true, priceCredits: 150, featured: true
  },
  {
    id: 'BACKGROUND-REMOVE-AI', slug: 'background-removal-ai',
    name: { en: 'AI Background Remover', vi: 'Xóa Nền AI Pro', ko: 'AI 배경 제거기', ja: 'AI背景削除' },
    category: { en: 'Enhancement', vi: 'Tối ưu & Phục chế', ko: '강화', ja: '強化' },
    description: { en: 'Professional high-precision background removal using neural edge detection for clean PNG assets.', vi: 'Giải pháp xóa nền chuyên nghiệp với độ chính xác cực cao cho tài sản PNG sạch.', ko: '깔끔한 PNG 자산을 위한 신경망 에지 감지를 사용한 전문 고정밀 배경 제거.', ja: 'クリーンなPNGアセットのための高精度背景削除。' },
    problems: ['Manual clipping path', 'Poor edge quality', 'Slow batch processing'],
    industries: ['E-commerce', 'Graphic Design', 'Marketing', 'Photography'],
    imageUrl: 'https://images.unsplash.com/photo-1542744173-8e7e53415bb0?auto=format&fit=crop&q=80&w=1600',
    demoType: 'image', tags: ['Remove BG', 'PNG', 'Masking', 'Product'],
    features: [
      { en: 'Neural Edge Detection', vi: 'Nhận diện biên Neural', ko: '신경망 에지 감지', ja: '神経エッジ検出' },
      { en: 'Hair & Fiber Separation', vi: 'Tách tóc và sợi vải', ko: '머리카락 및 섬유 분리', ja: '髪と繊維の分離' },
      { en: 'Batch Processing', vi: 'Xử lý hàng loạt', ko: '일괄 처리', ja: 'バッチ処理' }
    ],
    complexity: 'Standard', priceReference: '50 CR / image', isActive: true, priceCredits: 50, featured: true
  },
  {
    id: 'AI-AGENT-WORKFLOW', slug: 'ai-agent-workflow',
    name: { en: 'Aether Flow Orchestrator', vi: 'AI Agent Workflow', ko: 'AI 에이전트 워크플로우', ja: 'AIエージェントワークフロー' },
    category: { en: 'Automation', vi: 'Tự động hóa & Quy trình', ko: '자동화', ja: '自動化' },
    description: { en: 'Professional node-based AI workflow for industrial image synthesis and automated creative pipelines.', vi: 'Quy trình AI node-based chuyên nghiệp để tổng hợp hình ảnh công nghiệp.', ko: '산업용 이미지 합성을 위한 전문 노드 기반 AI 워크플로우.', ja: '産業用画像合成のためのプロフェッショナルなノードベースのAIワークフロー。' },
    problems: ['Disconnected AI tools', 'Inconsistent output', 'Manual repetitive work'],
    industries: ['Game Studios', 'Advertising', 'E-commerce', 'Architecture'],
    imageUrl: 'https://images.unsplash.com/photo-1639322537228-f710d846310a?auto=format&fit=crop&q=80&w=1600',
    demoType: 'automation', tags: ['Workflow', 'Agentic AI', 'Image Gen', 'Pipeline'],
    features: [
      { en: 'Sequential Node Architecture', vi: 'Kiến trúc Node tuần tự', ko: '순차 노드 아키텍처', ja: 'シーケンシャルノードアーキテクチャ' },
      { en: 'Context Persistence', vi: 'Duy trì ngữ cảnh logic', ko: '컨텍스트 지속성', ja: 'コンテキストの永続性' },
      { en: 'H100 Edge Processing', vi: 'Xử lý biên H100 GPU', ko: 'H100 에지 프로세싱', ja: 'H100エッジプロセッシング' }
    ],
    complexity: 'Enterprise', priceReference: '500 CR / Orchestration', isActive: true, priceCredits: 500, featured: true
  },
  {
    id: 'NOCODE-EXPORT', slug: 'nocode-export',
    name: { en: 'NoCodeExport', vi: 'NoCodeExport — Xuất Website thành Code', ko: 'NoCodeExport', ja: 'NoCodeExport' },
    category: { en: 'Developer Tools', vi: 'Công cụ phát triển', ko: '개발자 도구', ja: '開発者ツール' },
    description: { en: 'Export any website to clean source code. Paste URL, get code, push to GitHub, deploy to Vercel.', vi: 'Xuất bất kỳ website nào thành source code sạch.', ko: '모든 웹사이트를 깨끗한 소스코드로 내보내기.', ja: 'ウェブサイトをクリーンなソースコードにエクスポート。' },
    problems: ['Manual website cloning', 'Complex scraping', 'Slow migration'],
    industries: ['Web Development', 'Freelancers', 'Agencies', 'Design-to-Code'],
    imageUrl: '/nocode-export-hero.png',
    demoType: 'automation', tags: ['Export', 'Website', 'HTML', 'GitHub'],
    features: [
      { en: 'URL-to-Code Export', vi: 'Xuất code từ URL', ko: 'URL에서 코드 내보내기', ja: 'URLからコードへ' },
      { en: 'Auto Detect', vi: 'Tự động nhận diện', ko: '자동 감지', ja: '自動検出' },
      { en: 'Push to GitHub', vi: 'Push GitHub tự động', ko: 'GitHub 푸시', ja: 'GitHubプッシュ' }
    ],
    complexity: 'Standard', priceReference: 'Free', isActive: true, isFree: true, priceCredits: 0, featured: true
  },
  {
    id: 'BIRTHDAY-AI-PRO', slug: 'ai-birthday-generator',
    name: { en: 'AI Birthday Studio', vi: 'Ảnh Sinh Nhật AI', ko: 'AI 생일 스튜디오', ja: 'AI誕生日スタジオ' },
    category: { en: 'Festivals', vi: 'Lễ hội & Sự kiện', ko: '축제', ja: 'フェスティバル' },
    description: { en: 'Create festive birthday celebration photos with stunning AI concepts.', vi: 'Tạo ảnh kỷ niệm sinh nhật rực rỡ với concept AI sáng tạo.', ko: '멋진 AI 컨셉으로 생일 축하 사진 생성.', ja: '素晴らしいAIコンセプトで誕生日写真を作成。' },
    problems: ['Generic birthday cards', 'Expensive decorations', 'Limited themes'],
    industries: ['Personal Branding', 'Social Media', 'Marketing'],
    imageUrl: 'https://images.unsplash.com/photo-1530103043960-ef38714abb15?auto=format&fit=crop&q=80&w=1600',
    demoType: 'image', tags: ['Birthday', 'Celebration', 'Party', 'Portrait'],
    features: [
      { en: 'Thematic Concept Engine', vi: 'Công cụ concept theo chủ đề', ko: '테마 컨셉 엔진', ja: 'テーマコンセプトエンジン' },
      { en: 'Virtual Outfit Fitting', vi: 'Thử trang phục tiệc ảo', ko: '가상 파티 의상 피팅', ja: 'バーチャルパーティードレスフィッティング' }
    ],
    complexity: 'Advanced', priceReference: '150 CR / generation', isActive: true, priceCredits: 150, featured: true
  },
  {
    id: 'WEDDING-AI-PRO', slug: 'ai-wedding-generator',
    name: { en: 'AI Wedding Studio', vi: 'Ảnh Cưới AI Pro', ko: 'AI 웨딩 스튜디오', ja: 'AIウェディングスタジオ' },
    category: { en: 'Generative Art', vi: 'Nghệ thuật sinh tạo', ko: '생성 아트', ja: '生成アート' },
    description: { en: 'Create stunning professional wedding photos from simple portraits with face sync.', vi: 'Kiến tạo ảnh cưới chuyên nghiệp với đồng bộ gương mặt kép.', ko: '얼굴 동기화로 전문 웨딩 사진 생성.', ja: '顔同期技術でプロの結婚式写真を作成。' },
    problems: ['Expensive wedding photoshoots', 'Limited outdoor time', 'Complex editing'],
    industries: ['Photography', 'Personal Branding', 'Social Media'],
    imageUrl: 'https://images.unsplash.com/photo-1515934751635-c81c6bc9a2d8?auto=format&fit=crop&q=80&w=1600',
    demoType: 'image', tags: ['Wedding', 'Romantic', 'Couple', 'Face Sync'],
    features: [
      { en: 'Dual Face Sync', vi: 'Đồng bộ gương mặt kép', ko: '이중 얼굴 동기화', ja: 'デュアルフェイス同期' },
      { en: 'Luxury Dress Library', vi: 'Thư viện váy cưới cao cấp', ko: '럭셔리 드레스 라이브러리', ja: '高級ドレスライブラリ' }
    ],
    complexity: 'Advanced', priceReference: '150 CR / generation', isActive: true, priceCredits: 150, featured: true
  },
  {
    id: 'NOEL-AI-PRO', slug: 'ai-noel-generator',
    name: { en: 'AI Noel Studio', vi: 'Ảnh Giáng Sinh AI', ko: 'AI 크리스마스 스튜디오', ja: 'AIクリスマススタジオ' },
    category: { en: 'Festivals', vi: 'Lễ hội & Sự kiện', ko: '축제', ja: 'フェスティバル' },
    description: { en: 'Create magical Christmas-themed photos with winter wonderland concepts.', vi: 'Tạo ảnh Giáng sinh huyền ảo với bối cảnh mùa đông kỳ diệu.', ko: '겨울 원더랜드 컨셉으로 크리스마스 사진 생성.', ja: '冬のワンダーランドのコンセプトでクリスマス写真を作成。' },
    problems: ['Expensive Christmas shoots', 'Limited winter scenery', 'Generic cards'],
    industries: ['Personal Branding', 'Social Media', 'Marketing', 'Greeting Cards'],
    imageUrl: 'https://images.unsplash.com/photo-1543589077-47d81606c1bf?auto=format&fit=crop&q=80&w=1600',
    demoType: 'image', tags: ['Christmas', 'Noel', 'Winter', 'Holiday'],
    features: [
      { en: 'Winter Scene Generation', vi: 'Tạo bối cảnh mùa đông', ko: '겨울 장면 생성', ja: '冬のシーン生成' },
      { en: 'Festive Outfit Synthesis', vi: 'Tổng hợp trang phục lễ hội', ko: '축제 의상 합성', ja: '祝日の衣装合成' }
    ],
    complexity: 'Advanced', priceReference: '150 CR / generation', isActive: true, priceCredits: 150, featured: true
  },
  {
    id: 'TET-AI-PRO', slug: 'ai-tet-generator',
    name: { en: 'AI Tết Studio', vi: 'Ảnh Tết AI Pro', ko: 'AI 설날 스튜디오', ja: 'AIテトスタジオ' },
    category: { en: 'Festivals', vi: 'Lễ hội & Sự kiện', ko: '축제', ja: 'フェスティバル' },
    description: { en: 'Create authentic Vietnamese Lunar New Year photos with Áo dài and festive settings.', vi: 'Tạo ảnh Tết đậm chất truyền thống với Áo dài, hoa đào, hoa mai.', ko: '아오자이와 축제 배경으로 베트남 설날 사진 생성.', ja: 'アオザイとお祝いの設定でベトナムの旧正月写真を作成。' },
    problems: ['Expensive Tết shoots', 'Limited Áo dài options', 'Weather-dependent'],
    industries: ['Personal Branding', 'Social Media', 'Marketing', 'Greeting Cards'],
    imageUrl: 'https://images.unsplash.com/photo-1611516491426-03025e6043c8?auto=format&fit=crop&q=80&w=1600',
    demoType: 'image', tags: ['Tết', 'Lunar New Year', 'Áo dài', 'Vietnamese'],
    features: [
      { en: 'Áo dài Fitting AI', vi: 'Thử Áo dài ảo AI', ko: '아오자이 피팅 AI', ja: 'アオザイフィッティングAI' },
      { en: 'Traditional Scene Engine', vi: 'Bối cảnh truyền thống', ko: '전통 장면 엔진', ja: '伝統的なシーンエンジン' }
    ],
    complexity: 'Advanced', priceReference: '150 CR / generation', isActive: true, priceCredits: 150, featured: true
  },
  {
    id: 'IMAGE-UPSCALE-AI', slug: 'image-upscale-ai',
    name: { en: 'Generative Upscale AI', vi: 'Generative Upscale - Nâng Cấp Ảnh AI', ko: '생성형 업스케일 AI', ja: '生成型アップスケールAI' },
    category: { en: 'Enhancement', vi: 'Tối ưu & Phục chế', ko: '강화', ja: '強化' },
    description: { en: 'Advanced generative upscaling technology for crystal-clear 4K/12K results.', vi: 'Upscale ảnh cao cấp, tái tạo chi tiết thông minh bằng AI.', ko: '크리스탈 클리어 4K/12K 결과를 위한 고급 업스케일링.', ja: 'クリスタルクリアな4K/12K結果のための高度なアップスケーリング。' },
    problems: ['Blurry low-res', 'Compression artifacts', 'Loss of textures', 'Limited print resolution'],
    industries: ['Photography', 'Marketing', 'Printing', 'E-commerce'],
    imageUrl: 'https://images.unsplash.com/photo-1639322537228-f710d846310a?auto=format&fit=crop&q=80&w=1600',
    demoType: 'image', tags: ['Upscale', '4K', '12K', 'Detail'],
    features: [
      { en: 'Generative Detail Recovery', vi: 'Tái tạo chi tiết thông minh', ko: '생성적 세부 복구', ja: '生成的な詳細の復元' },
      { en: 'Multi-Resolution 12K', vi: 'Độ phân giải tới 12K', ko: '다중 해상도 12K', ja: 'マルチ解像度12K' },
      { en: 'Human-like Realism', vi: 'Tái tạo chân thực', ko: '인간과 같은 사실감', ja: '人間のようなリアルさ' }
    ],
    complexity: 'Advanced', priceReference: '100 CR / upscaling', isActive: true, priceCredits: 100, featured: true
  },
  {
    id: 'QWEN-CHAT-AI', slug: 'qwen-chat-ai',
    name: { en: 'Qwen AI Chat', vi: 'Chat AI Qwen', ko: 'Qwen AI 채팅', ja: 'Qwen AIチャット' },
    category: { en: 'AI Chat', vi: 'AI Chat', ko: 'AI 채팅', ja: 'AIチャット' },
    description: { en: 'Free AI chat powered by Qwen 3.5 running 100% local. Fast, private, Vision & Deep Reasoning.', vi: 'Chat AI miễn phí với Qwen 3.5 chạy 100% local. Nhanh, riêng tư, hỗ trợ Vision và Deep Reasoning.', ko: '100% 로컬 Qwen 3.5 기반 무료 AI 채팅. 빠르고 프라이빗.', ja: '100%ローカルQwen 3.5搭載の無料AIチャット。' },
    problems: ['Expensive AI subscriptions', 'Data privacy concerns', 'Limited local AI', 'No API access'],
    industries: ['Developers', 'Content Creators', 'Education', 'Research'],
    imageUrl: 'https://images.unsplash.com/photo-1677442136019-21780ecad995?auto=format&fit=crop&q=80&w=1600',
    demoType: 'text', tags: ['Chat', 'Qwen', 'Local AI', 'Free', 'Vision', 'API'],
    features: [
      { en: '100% Local & Private', vi: 'Chạy hoàn toàn local, riêng tư', ko: '100% 로컬 및 프라이빗', ja: '100%ローカル＆プライベート' },
      { en: 'Multi-Model Support', vi: 'Hỗ trợ đa model Qwen', ko: '다중 모델 지원', ja: 'マルチモデルサポート' },
      { en: 'OpenAI-Compatible API', vi: 'API chuẩn OpenAI', ko: 'OpenAI 호환 API', ja: 'OpenAI互換API' }
    ],
    complexity: 'Standard', priceReference: 'Free', isActive: true, isFree: true, priceCredits: 0, featured: true
  },
  {
    id: 'FIBUS-VIDEO-STUDIO', slug: 'fibus-video-studio',
    name: { en: 'Fibus Video Studio', vi: 'Fibus Video Studio', ko: 'Fibus 비디오 스튜디오', ja: 'Fibusビデオスタジオ' },
    category: { en: 'Video', vi: 'Video', ko: '비디오', ja: 'ビデオ' },
    description: {
      en: 'Powerful desktop app to create AI Videos & Images. Text-to-Video, Image-to-Video powered by Google VEO3. Multi-account, multi-queue processing.',
      vi: 'Ứng dụng desktop tạo Video AI & Hình ảnh AI mạnh nhất. Text-to-Video, Image-to-Video với Google VEO3. Hỗ trợ đa tài khoản, đa hàng đợi.',
      ko: 'Google VEO3 기반 AI 동영상 및 이미지 생성 데스크톱 앱. 텍스트-비디오, 이미지-비디오, 멀티 계정 지원.',
      ja: 'Google VEO3搭載のAI動画・画像生成デスクトップアプリ。テキスト→動画、画像→動画、マルチアカウント対応。'
    },
    problems: ['Expensive video production', 'Complex editing software', 'No AI video tools', 'Slow content creation'],
    industries: ['Content Creation', 'Marketing', 'Social Media', 'E-commerce', 'Education'],
    imageUrl: 'https://images.unsplash.com/photo-1492619375914-88005aa9e8fb?auto=format&fit=crop&q=80&w=1600',
    demoType: 'video',
    tags: ['Video AI', 'VEO3', 'Google AI', 'Desktop App', 'Text-to-Video', 'Image-to-Video', 'Banana Pro'],
    features: [
      { en: 'Text-to-Video (VEO 3.1)', vi: 'Text-to-Video với VEO 3.1', ko: '텍스트→동영상 (VEO 3.1)', ja: 'テキスト→動画 (VEO 3.1)' },
      { en: 'Image-to-Video (Start & End Frame)', vi: 'Image-to-Video (Start & End Frame)', ko: '이미지→동영상 (시작/끝 프레임)', ja: '画像→動画 (開始/終了フレーム)' },
      { en: 'Multi-Account VEO3 Switching', vi: 'Chuyển đổi đa tài khoản VEO3', ko: 'VEO3 멀티 계정 전환', ja: 'VEO3マルチアカウント切替' },
      { en: 'AI Image Generation (Banana Pro)', vi: 'Tạo hình ảnh AI (Banana Pro)', ko: 'AI 이미지 생성 (Banana Pro)', ja: 'AI画像生成 (Banana Pro)' },
      { en: 'Media Library Management', vi: 'Quản lý thư viện media', ko: '미디어 라이브러리 관리', ja: 'メディアライブラリ管理' },
      { en: 'Multi-Queue Parallel Processing', vi: 'Xử lý hàng đợi song song', ko: '멀티 큐 병렬 처리', ja: 'マルチキュー並列処理' }
    ],
    neuralStack: [
      { name: 'Google VEO', version: '3.1', capability: { en: 'Video Generation Engine', vi: 'Engine tạo video', ko: '영상 생성 엔진', ja: '動画生成エンジン' } },
      { name: 'Banana Pro', version: '2.0', capability: { en: 'Image Generation Model', vi: 'Model tạo hình ảnh', ko: '이미지 생성 모델', ja: '画像生成モデル' } },
      { name: 'Nano Banana', version: '2', capability: { en: 'Fast Image Synthesis', vi: 'Tổng hợp ảnh nhanh', ko: '빠른 이미지 합성', ja: '高速画像合成' } }
    ],
    homeBlocks: ['video_studio', 'top_trending'],
    complexity: 'Advanced', priceReference: 'License Key', isActive: true, isFree: false, priceCredits: 0, featured: true,
    platforms: ['web']
  }
];

async function seed() {
  for (const p of products) {
    try {
      const res = await fetch(API, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${TOKEN}` },
        body: JSON.stringify(p)
      });
      const data = await res.json();
      console.log(`✅ ${p.slug}:`, data.success ? 'OK' : data.message || JSON.stringify(data));
    } catch (e) { console.log(`❌ ${p.slug}:`, e.message); }
  }
}
seed();
