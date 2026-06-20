export type AppGameShowcaseType = 'app' | 'game' | 'ai';
export type AppGameShowcaseCategoryKey = 'mobile' | 'game' | 'ai' | 'ecommerce' | 'dashboard';
export type AppGameShowcaseIndustryKey =
  | 'analytics'
  | 'commerce'
  | 'education'
  | 'food'
  | 'game'
  | 'health'
  | 'property'
  | 'travel';
export type AppGameShowcaseMetricIcon = 'clock' | 'gamepad' | 'zap' | 'chart' | 'map' | 'sparkles';
export type AppGameShowcasePlatform = 'iOS' | 'Android' | 'Web' | 'PWA' | 'Tablet' | 'Desktop';

export interface AppGameShowcaseFeature {
  title: string;
  description: string;
}

export interface AppGameShowcaseDeliverable {
  title: string;
  detail: string;
}

export interface AppGameShowcaseChecklistItem {
  label: string;
  completed: boolean;
}

export interface AppGameShowcaseItem {
  id: string;
  title: string;
  type: AppGameShowcaseType;
  categoryKey: AppGameShowcaseCategoryKey;
  industryKey: AppGameShowcaseIndustryKey;
  category: string;
  industry: string;
  badge: string;
  metric: string;
  metricIcon: AppGameShowcaseMetricIcon;
  buildTime: string;
  costSaving: string;
  platforms: readonly AppGameShowcasePlatform[];
  tags: readonly string[];
  subtitle: string;
  description: string;
  audience: string;
  heroImage: string;
  galleryImages: readonly string[];
  features: readonly AppGameShowcaseFeature[];
  deliverables: readonly AppGameShowcaseDeliverable[];
  checklist: readonly AppGameShowcaseChecklistItem[];
}

export interface AppGameShowcaseMarketSeed {
  id: string;
  slug: string;
  name: {
    en: string;
    vi: string;
    ko: string;
    ja: string;
  };
  category: {
    en: string;
    vi: string;
    ko: string;
    ja: string;
  };
  description: {
    en: string;
    vi: string;
    ko: string;
    ja: string;
  };
  imageUrl: string;
  bannerUrl: string;
  thumbnailUrl: string;
  gallery: string[];
  demoType: 'interactive';
  homeBlocks: string[];
  tags: string[];
  models: string[];
  industries: string[];
  problems: string[];
  features: {
    en: string;
    vi: string;
    ko: string;
    ja: string;
  }[];
  neuralStack: {
    name: string;
    version?: string;
    capability: {
      en: string;
      vi: string;
      ko: string;
      ja: string;
    };
  }[];
  complexity: 'Standard' | 'Advanced' | 'Enterprise';
  priceReference: string;
  priceCredits: number;
  isFree: boolean;
  isActive: boolean;
  status: 'active';
  featured: boolean;
  order: number;
  platforms: AppGameShowcasePlatform[];
}

export type AppGameShowcaseListItem = Pick<
  AppGameShowcaseItem,
  | 'id'
  | 'title'
  | 'type'
  | 'categoryKey'
  | 'industryKey'
  | 'category'
  | 'industry'
  | 'badge'
  | 'metric'
  | 'metricIcon'
  | 'buildTime'
  | 'costSaving'
  | 'platforms'
  | 'tags'
  | 'subtitle'
  | 'heroImage'
>;

const images = (id: string): Pick<AppGameShowcaseItem, 'heroImage' | 'galleryImages'> => ({
  heroImage: `/assets/showcase/app-game/${id}-cover.png`,
  galleryImages: [
    `/assets/showcase/app-game/${id}-showcase.png`,
    `/assets/showcase/app-game/${id}-screen.png`,
  ],
});

export const APP_GAME_SHOWCASE_ITEMS: readonly AppGameShowcaseItem[] = [
  {
    id: 'dragon-realms-rpg',
    title: 'Dragon Realms RPG',
    type: 'game',
    categoryKey: 'game',
    industryKey: 'game',
    category: 'Fantasy RPG Game',
    industry: 'Game studio',
    badge: 'Playable RPG MVP',
    metric: '2-6 tuần',
    metricIcon: 'gamepad',
    buildTime: '2-6 tuần',
    costSaving: '-40% chi phí MVP',
    platforms: ['iOS', 'Android', 'Web'],
    tags: ['RPG', 'AI NPC', 'Inventory', 'Quest loop'],
    subtitle: 'Game fantasy RPG với gameplay loop, inventory, quest và AI companion.',
    description:
      'Dragon Realms RPG là bản MVP cho studio muốn kiểm chứng gameplay fantasy trước khi đầu tư production lớn: có combat loop, inventory, quest map, progression và AI NPC hướng dẫn người chơi.',
    audience: 'Indie studio, publisher, IP fantasy, creator muốn thử game MVP.',
    ...images('dragon-realms-rpg'),
    features: [
      { title: 'Core combat loop', description: 'Thiết kế vòng lặp chiến đấu, nhiệm vụ, phần thưởng và tiến trình nhân vật.' },
      { title: 'AI NPC companion', description: 'Nhân vật đồng hành hội thoại, gợi ý nhiệm vụ và giải thích hệ thống.' },
      { title: 'Inventory & upgrade', description: 'Kho vật phẩm, trang bị, chỉ số và flow nâng cấp dễ mở rộng.' },
    ],
    deliverables: [
      { title: 'Playable MVP', detail: 'Build gameplay cốt lõi có thể demo trên mobile/web.' },
      { title: 'Game design spec', detail: 'Combat, quest, item, economy và progression draft.' },
      { title: 'Art direction pack', detail: 'Moodboard, UI direction và prompt asset cho production.' },
    ],
    checklist: [
      { label: 'Gameplay loop MVP', completed: true },
      { label: 'AI NPC dialogue flow', completed: true },
      { label: 'Multiplayer/co-op mode', completed: false },
    ],
  },
  {
    id: 'shopverse-commerce',
    title: 'ShopVerse Commerce',
    type: 'app',
    categoryKey: 'ecommerce',
    industryKey: 'commerce',
    category: 'E-commerce App',
    industry: 'Retail',
    badge: 'Storefront ready',
    metric: '-40% chi phí',
    metricIcon: 'zap',
    buildTime: '2-6 tuần',
    costSaving: '-40% so với build truyền thống',
    platforms: ['iOS', 'Android', 'Web', 'PWA'],
    tags: ['Catalog', 'Checkout', 'AI recommend', 'Admin'],
    subtitle: 'App commerce hiện đại cho bán lẻ, có AI gợi ý sản phẩm và dashboard quản trị.',
    description:
      'ShopVerse Commerce gom catalog, giỏ hàng, checkout, inventory và AI recommendation vào một hệ thống gọn để brand bán hàng nhanh hơn trên mobile và web.',
    audience: 'Fashion, sneaker, mỹ phẩm, phụ kiện, D2C brand và marketplace nhỏ.',
    ...images('shopverse-commerce'),
    features: [
      { title: 'Catalog thông minh', description: 'Danh mục, biến thể, bộ lọc, tìm kiếm và bộ sưu tập sản phẩm.' },
      { title: 'Checkout nhanh', description: 'Giỏ hàng, mã giảm giá, phí vận chuyển, thanh toán và trạng thái đơn.' },
      { title: 'AI recommendation', description: 'Gợi ý sản phẩm tương tự, upsell và cá nhân hóa theo hành vi.' },
    ],
    deliverables: [
      { title: 'Mobile storefront', detail: 'iOS/Android UI flow và PWA responsive.' },
      { title: 'Admin commerce', detail: 'Quản lý sản phẩm, đơn hàng, khách hàng, khuyến mãi.' },
      { title: 'Analytics setup', detail: 'Dashboard doanh thu, conversion và best sellers.' },
    ],
    checklist: [
      { label: 'Product catalog + checkout', completed: true },
      { label: 'Admin dashboard', completed: true },
      { label: 'ERP/POS integration', completed: false },
    ],
  },
  {
    id: 'fitpulse-tracker',
    title: 'FitPulse Tracker',
    type: 'app',
    categoryKey: 'mobile',
    industryKey: 'health',
    category: 'Health App',
    industry: 'Fitness',
    badge: 'AI coach MVP',
    metric: '2-4 tuần',
    metricIcon: 'clock',
    buildTime: '2-4 tuần',
    costSaving: '-35% chi phí thiết kế',
    platforms: ['iOS', 'Android'],
    tags: ['Workout', 'Habit', 'AI coach', 'Charts'],
    subtitle: 'Ứng dụng tracking luyện tập, thói quen và AI coach cá nhân.',
    description:
      'FitPulse giúp người dùng theo dõi bước chân, bài tập, calories, tiến độ tuần và nhận gợi ý cá nhân từ AI coach theo mục tiêu sức khỏe.',
    audience: 'Fitness brand, PT coach, wellness community, corporate wellbeing.',
    ...images('fitpulse-tracker'),
    features: [
      { title: 'Progress dashboard', description: 'Bước chân, calories, workout streak và biểu đồ tiến bộ.' },
      { title: 'AI coach card', description: 'Gợi ý lịch tập, nhắc thói quen và điều chỉnh mục tiêu.' },
      { title: 'Workout library', description: 'Bài tập theo mục tiêu, thời lượng, thiết bị và cấp độ.' },
    ],
    deliverables: [
      { title: 'Mobile app MVP', detail: 'Onboarding, dashboard, workout, profile và notification.' },
      { title: 'Coach prompt set', detail: 'Logic gợi ý AI theo mục tiêu người dùng.' },
      { title: 'Analytics events', detail: 'Tracking retention, completion và engagement.' },
    ],
    checklist: [
      { label: 'Health dashboard', completed: true },
      { label: 'AI coach prompts', completed: true },
      { label: 'Wearable integration', completed: false },
    ],
  },
  {
    id: 'travelgo-booking',
    title: 'TravelGo Booking',
    type: 'app',
    categoryKey: 'mobile',
    industryKey: 'travel',
    category: 'Travel Booking App',
    industry: 'Travel',
    badge: 'Booking flow MVP',
    metric: '2-5 tuần',
    metricIcon: 'map',
    buildTime: '2-5 tuần',
    costSaving: '-40% chi phí MVP',
    platforms: ['iOS', 'Android', 'Web'],
    tags: ['Booking', 'Itinerary', 'Map', 'AI search'],
    subtitle: 'App booking tour, khách sạn và trải nghiệm địa phương.',
    description:
      'TravelGo cho phép tìm kiếm điểm đến, xem lịch trình, đặt dịch vụ, nhận xác nhận booking và quản lý đơn từ dashboard vận hành.',
    audience: 'Travel agency, resort, tour operator, local experience marketplace.',
    ...images('travelgo-booking'),
    features: [
      { title: 'Search & discovery', description: 'Tìm tour, phòng, điểm đến và filter theo ngân sách/thời gian.' },
      { title: 'Itinerary builder', description: 'Lịch trình ngày, điểm đến, voucher và nhắc lịch.' },
      { title: 'Booking admin', description: 'Quản lý khách, đơn, thanh toán và trạng thái dịch vụ.' },
    ],
    deliverables: [
      { title: 'Booking app', detail: 'Discovery, detail, checkout, itinerary và user profile.' },
      { title: 'Operator dashboard', detail: 'Quản lý inventory dịch vụ, booking và báo cáo.' },
      { title: 'AI search concept', detail: 'Gợi ý điểm đến theo sở thích và ngân sách.' },
    ],
    checklist: [
      { label: 'Booking flow', completed: true },
      { label: 'Admin inventory', completed: true },
      { label: 'OTA integration', completed: false },
    ],
  },
  {
    id: 'ai-companion',
    title: 'AI Companion',
    type: 'ai',
    categoryKey: 'ai',
    industryKey: 'game',
    category: 'AI Feature',
    industry: 'Game & app',
    badge: 'Voice + chat ready',
    metric: '1-2 tuần',
    metricIcon: 'sparkles',
    buildTime: '1-2 tuần',
    costSaving: '-30% thời gian tích hợp',
    platforms: ['Web', 'iOS', 'Android'],
    tags: ['NPC', 'NLP', 'Voice', 'TTS'],
    subtitle: 'AI companion có hội thoại tự nhiên, voice/TTS và ngữ cảnh sản phẩm.',
    description:
      'AI Companion là module nhúng vào game/app để hướng dẫn người dùng, nhập vai NPC, trả lời theo knowledge base và cá nhân hóa trải nghiệm.',
    audience: 'Game RPG, education app, onboarding assistant, support companion.',
    ...images('ai-companion'),
    features: [
      { title: 'Context memory', description: 'Nhớ trạng thái nhiệm vụ, hồ sơ người dùng và nội dung sản phẩm.' },
      { title: 'Voice & TTS', description: 'Luồng nói/nghe tự nhiên cho companion hoặc NPC.' },
      { title: 'Safety guardrails', description: 'Policy, fallback, tone và kiểm soát nội dung.' },
    ],
    deliverables: [
      { title: 'AI module spec', detail: 'Prompt, tools, memory, fallback và event hooks.' },
      { title: 'Chat/voice UI', detail: 'Widget, in-game panel hoặc mobile assistant flow.' },
      { title: 'Integration guide', detail: 'API contract và cách nhúng vào app/game hiện có.' },
    ],
    checklist: [
      { label: 'Prompt + memory design', completed: true },
      { label: 'Voice/TTS flow', completed: true },
      { label: 'Realtime avatar', completed: false },
    ],
  },
  {
    id: 'admin-analytics',
    title: 'Admin Analytics',
    type: 'app',
    categoryKey: 'dashboard',
    industryKey: 'analytics',
    category: 'Analytics Dashboard',
    industry: 'Business ops',
    badge: 'Insight dashboard',
    metric: '1-3 tuần',
    metricIcon: 'chart',
    buildTime: '1-3 tuần',
    costSaving: '-40% chi phí BI',
    platforms: ['Web', 'PWA'],
    tags: ['Dashboard', 'Revenue', 'AI insight', 'Reports'],
    subtitle: 'Dashboard quản trị doanh thu, user, funnel và AI insight.',
    description:
      'Admin Analytics giúp đội ngũ nhìn nhanh hiệu suất kinh doanh, tăng trưởng người dùng, funnel, cohort và cảnh báo bất thường bằng AI insight.',
    audience: 'SME, SaaS, e-commerce, sales ops, marketing ops.',
    ...images('admin-analytics'),
    features: [
      { title: 'Executive dashboard', description: 'KPI, doanh thu, user, conversion và growth theo thời gian.' },
      { title: 'AI insight panel', description: 'Tự động tóm tắt biến động và đề xuất hành động.' },
      { title: 'Role reports', description: 'Báo cáo riêng cho sales, marketing, finance và operation.' },
    ],
    deliverables: [
      { title: 'Web dashboard', detail: 'Responsive dashboard, chart, table và filter.' },
      { title: 'Data model map', detail: 'KPI definition, event schema và quyền truy cập.' },
      { title: 'Report templates', detail: 'Mẫu báo cáo tuần/tháng và alert.' },
    ],
    checklist: [
      { label: 'KPI dashboard', completed: true },
      { label: 'AI summary', completed: true },
      { label: 'Warehouse integration', completed: false },
    ],
  },
  {
    id: 'puzzle-grove',
    title: 'Puzzle Grove',
    type: 'game',
    categoryKey: 'game',
    industryKey: 'game',
    category: 'Casual Puzzle Game',
    industry: 'Casual games',
    badge: 'Family-friendly MVP',
    metric: '3-5 tuần',
    metricIcon: 'gamepad',
    buildTime: '3-5 tuần',
    costSaving: 'Prototype trước khi mua art pack',
    platforms: ['iOS', 'Android', 'Web'],
    tags: ['Match-3', 'Level map', 'Rewards', 'Live ops'],
    subtitle: 'Game puzzle dễ chơi với level map, reward chest và daily challenge.',
    description:
      'Puzzle Grove là casual game MVP để test retention: match-3 board, level progression, booster, reward chest và event map tươi sáng.',
    audience: 'Casual game team, brand activation, education/game hybrid.',
    ...images('puzzle-grove'),
    features: [
      { title: 'Match-3 board', description: 'Luật chơi quen thuộc, booster và level objective rõ ràng.' },
      { title: 'Progression map', description: 'Bản đồ level, chest, stars và daily rewards.' },
      { title: 'Live ops hooks', description: 'Event theo mùa, challenge ngày và gói reward.' },
    ],
    deliverables: [
      { title: 'Playable prototype', detail: 'Board gameplay, level map và reward flow.' },
      { title: 'Economy draft', detail: 'Stars, booster, chest và progression tuning.' },
      { title: 'Art prompt pack', detail: 'Prompt cho character, tile, background và UI.' },
    ],
    checklist: [
      { label: 'First 20 level plan', completed: true },
      { label: 'Booster system', completed: true },
      { label: 'A/B economy test', completed: false },
    ],
  },
  {
    id: 'quickbite-delivery',
    title: 'QuickBite Delivery',
    type: 'app',
    categoryKey: 'mobile',
    industryKey: 'food',
    category: 'Food Delivery App',
    industry: 'Food delivery',
    badge: 'Marketplace MVP',
    metric: '3-6 tuần',
    metricIcon: 'clock',
    buildTime: '3-6 tuần',
    costSaving: '-35% chi phí launch',
    platforms: ['iOS', 'Android', 'Web'],
    tags: ['Restaurant', 'Courier', 'Tracking', 'Checkout'],
    subtitle: 'Ứng dụng đặt món, tracking tài xế và quản lý nhà hàng.',
    description:
      'QuickBite Delivery bao gồm customer app, restaurant panel, courier tracking và admin dashboard để test mô hình giao đồ ăn theo khu vực.',
    audience: 'Local delivery startup, restaurant chain, campus food service.',
    ...images('quickbite-delivery'),
    features: [
      { title: 'Order tracking', description: 'Theo dõi trạng thái đơn, tài xế, ETA và thông báo realtime.' },
      { title: 'Restaurant panel', description: 'Nhận đơn, cập nhật menu, giờ mở cửa và món hết hàng.' },
      { title: 'Courier workflow', description: 'Nhận chuyến, route, bằng chứng giao hàng và lịch sử thu nhập.' },
    ],
    deliverables: [
      { title: 'Customer app', detail: 'Discovery, cart, checkout, order tracking.' },
      { title: 'Vendor dashboard', detail: 'Menu, order queue, promotion và availability.' },
      { title: 'Courier flow', detail: 'Trip assignment, map route và delivery proof.' },
    ],
    checklist: [
      { label: 'Three-sided MVP flow', completed: true },
      { label: 'Order status logic', completed: true },
      { label: 'Payment gateway production', completed: false },
    ],
  },
  {
    id: 'learnspark-kids',
    title: 'LearnSpark Kids',
    type: 'app',
    categoryKey: 'mobile',
    industryKey: 'education',
    category: 'Education App',
    industry: 'Education',
    badge: 'AI tutor MVP',
    metric: '3-5 tuần',
    metricIcon: 'sparkles',
    buildTime: '3-5 tuần',
    costSaving: '-30% content ops',
    platforms: ['Tablet', 'iOS', 'Android', 'Web'],
    tags: ['Quiz', 'AI tutor', 'Progress', 'Kids safe'],
    subtitle: 'Ứng dụng học tập trẻ em với quiz, lộ trình và AI tutor thân thiện.',
    description:
      'LearnSpark Kids giúp tạo trải nghiệm học vui: lesson cards, mini quiz, reward, progress dashboard và AI tutor trả lời trong giới hạn an toàn.',
    audience: 'EdTech startup, tutoring center, school, kids content brand.',
    ...images('learnspark-kids'),
    features: [
      { title: 'Lesson path', description: 'Lộ trình học theo chủ đề, cấp độ và điểm thưởng.' },
      { title: 'Quiz game', description: 'Bài kiểm tra ngắn, animation reward và replay nhanh.' },
      { title: 'Safe AI tutor', description: 'AI hỗ trợ giải thích trong phạm vi nội dung được duyệt.' },
    ],
    deliverables: [
      { title: 'Learning app MVP', detail: 'Lessons, quiz, profile, progress và reward.' },
      { title: 'Tutor prompt policy', detail: 'Prompt, safety rule và fallback.' },
      { title: 'Content template', detail: 'Mẫu nhập lesson/quiz để mở rộng nhanh.' },
    ],
    checklist: [
      { label: 'Quiz and reward loop', completed: true },
      { label: 'Parent-safe tutor flow', completed: true },
      { label: 'School LMS sync', completed: false },
    ],
  },
  {
    id: 'neon-drift-racing',
    title: 'Neon Drift Racing',
    type: 'game',
    categoryKey: 'game',
    industryKey: 'game',
    category: 'Racing Game',
    industry: 'Arcade games',
    badge: 'High-energy prototype',
    metric: '4-7 tuần',
    metricIcon: 'gamepad',
    buildTime: '4-7 tuần',
    costSaving: 'Validate art + loop early',
    platforms: ['iOS', 'Android', 'Web'],
    tags: ['Racing', 'Garage', 'Leaderboard', 'Cyberpunk'],
    subtitle: 'Game đua xe neon với garage upgrade, leaderboard và race HUD.',
    description:
      'Neon Drift Racing là prototype arcade racing tập trung vào cảm giác tốc độ, nâng cấp xe, challenge thời gian và hình ảnh cyberpunk bắt mắt.',
    audience: 'Arcade game studio, brand racing campaign, mobile publisher.',
    ...images('neon-drift-racing'),
    features: [
      { title: 'Speed loop', description: 'Race, drift, boost, checkpoint và reward theo thời gian.' },
      { title: 'Garage upgrade', description: 'Nâng cấp xe, cosmetic, performance và unlock tier.' },
      { title: 'Leaderboard mode', description: 'Daily track, ghost score và rank replay.' },
    ],
    deliverables: [
      { title: 'Racing MVP plan', detail: 'Controls, camera, boost, drift và scoring.' },
      { title: 'Garage UI kit', detail: 'Upgrade, inventory, shop và vehicle cards.' },
      { title: 'Track content brief', detail: '3 map đầu, obstacle, lighting và visual prompts.' },
    ],
    checklist: [
      { label: 'Racing loop spec', completed: true },
      { label: 'Garage upgrade flow', completed: true },
      { label: 'Realtime multiplayer', completed: false },
    ],
  },
  {
    id: 'estateflow-property',
    title: 'EstateFlow Property',
    type: 'app',
    categoryKey: 'mobile',
    industryKey: 'property',
    category: 'Real Estate App',
    industry: 'Real estate',
    badge: 'Property CRM MVP',
    metric: '3-6 tuần',
    metricIcon: 'map',
    buildTime: '3-6 tuần',
    costSaving: '-35% sales ops',
    platforms: ['iOS', 'Android', 'Web'],
    tags: ['Listings', 'Map', 'Agent CRM', 'AI match'],
    subtitle: 'App listing bất động sản, map search, agent chat và CRM.',
    description:
      'EstateFlow Property giúp đội sales gom listing, khách hàng, lịch hẹn, map search và gợi ý căn phù hợp vào một trải nghiệm mobile/web.',
    audience: 'Real estate agency, broker team, property marketplace, developer sales.',
    ...images('estateflow-property'),
    features: [
      { title: 'Map discovery', description: 'Tìm listing theo vị trí, giá, tiện ích và lịch xem nhà.' },
      { title: 'Agent CRM', description: 'Lead, nhu cầu, lịch hẹn, ghi chú và pipeline bán hàng.' },
      { title: 'AI property match', description: 'Gợi ý căn phù hợp theo ngân sách, vị trí và thói quen tìm kiếm.' },
    ],
    deliverables: [
      { title: 'Listing app', detail: 'Search, detail, favorite, inquiry và schedule.' },
      { title: 'Agent dashboard', detail: 'Lead CRM, listing management và reporting.' },
      { title: 'Data import plan', detail: 'Template nhập listing, media và pricing.' },
    ],
    checklist: [
      { label: 'Listing + map flow', completed: true },
      { label: 'Agent CRM flow', completed: true },
      { label: 'MLS/data feed integration', completed: false },
    ],
  },
] as const;

export const APP_GAME_SHOWCASE_LIST: readonly AppGameShowcaseListItem[] = APP_GAME_SHOWCASE_ITEMS.map(
  ({
    id,
    title,
    type,
    categoryKey,
    industryKey,
    category,
    industry,
    badge,
    metric,
    metricIcon,
    buildTime,
    costSaving,
    platforms,
    tags,
    subtitle,
    heroImage,
  }) => ({
    id,
    title,
    type,
    categoryKey,
    industryKey,
    category,
    industry,
    badge,
    metric,
    metricIcon,
    buildTime,
    costSaving,
    platforms,
    tags,
    subtitle,
    heroImage,
  }),
);

export const getAppGameShowcaseById = (id?: string): AppGameShowcaseItem =>
  APP_GAME_SHOWCASE_ITEMS.find((item) => item.id === id) ?? APP_GAME_SHOWCASE_ITEMS[0];

const localize = (value: string) => ({
  en: value,
  vi: value,
  ko: value,
  ja: value,
});

const getComplexity = (item: AppGameShowcaseItem): AppGameShowcaseMarketSeed['complexity'] => {
  if (item.type === 'ai' || item.categoryKey === 'dashboard') return 'Advanced';
  if (item.type === 'game') return 'Advanced';
  return 'Standard';
};

const getPriceCredits = (item: AppGameShowcaseItem) => {
  if (item.type === 'game') return 320;
  if (item.type === 'ai') return 180;
  if (item.categoryKey === 'dashboard') return 220;
  return 240;
};

export const APP_GAME_SHOWCASE_MARKET_SEED: readonly AppGameShowcaseMarketSeed[] =
  APP_GAME_SHOWCASE_ITEMS.map((item, index) => ({
    id: `APP-GAME-${item.id.toUpperCase()}`,
    slug: `showcase-${item.id}`,
    name: localize(item.title),
    category: localize(item.category),
    description: localize(`${item.subtitle} ${item.description}`),
    imageUrl: item.heroImage,
    bannerUrl: item.galleryImages[0],
    thumbnailUrl: item.heroImage,
    gallery: [item.heroImage, ...item.galleryImages],
    demoType: 'interactive',
    homeBlocks: ['app-other'],
    tags: [...item.tags, item.type, item.categoryKey, item.industryKey],
    models: ['GPT-5', 'GPT Image', 'Skyverses App Factory'],
    industries: [item.industry, item.industryKey],
    problems: [
      'Mất nhiều thời gian để biến ý tưởng thành MVP có thể demo.',
      'Chi phí thiết kế UI, asset và prototype thường vượt ngân sách ban đầu.',
      'Thiếu một quy trình thống nhất từ concept, build, testing đến launch.',
    ],
    features: item.features.map((feature) =>
      localize(`${feature.title}: ${feature.description}`),
    ),
    neuralStack: [
      {
        name: 'Skyverses App Factory',
        version: '1.0',
        capability: localize('Product planning, UX flow, implementation backlog, and launch packaging.'),
      },
      {
        name: 'GPT Image',
        capability: localize('Product visuals, UI concepts, game art, and showcase assets.'),
      },
      {
        name: 'GPT-5',
        capability: localize('Feature specification, app logic, AI workflow design, and technical documentation.'),
      },
    ],
    complexity: getComplexity(item),
    priceReference: `${item.buildTime} · ${item.costSaving}`,
    priceCredits: getPriceCredits(item),
    isFree: false,
    isActive: true,
    status: 'active',
    featured: index < 6,
    order: 600 + index,
    platforms: [...item.platforms],
  }));
