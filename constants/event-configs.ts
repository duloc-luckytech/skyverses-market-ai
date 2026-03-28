
import { Snowflake, Flower2, Heart, Cake, LucideIcon } from 'lucide-react';

/* =====================================================
   TYPES
====================================================== */
export interface EventTemplate {
  id: string;
  name: string;
  prompt: string;
  style: string;
  tags: string[];
}

export interface StylePreset {
  id: string;
  name: string;
  emoji: string;
  modifier: string;
}

export interface EventConfig {
  id: string;
  name: string;
  version: string;
  heroTitle: string[];
  heroSubtitle: string;
  subjects: string[];
  scenes: string[];
  accentColor: string; 
  icon: LucideIcon;
  basePrompt: string;
  systemPrompt: string;
  atmosphere: string;
  costBase: number;
  benefits: { t: string; d: string }[];
  templates: EventTemplate[];
  coupleMode?: boolean;
  landing: {
    tagline: string;
    headline: string;
    subheadline: string;
    stats: { value: string; label: string }[];
    howItWorks: { step: string; title: string; desc: string }[];
    showcaseTitle: string;
    showcaseDesc: string;
    ctaText: string;
    ctaSubtext: string;
  };
}

/* =====================================================
   STYLE PRESETS (shared across all events)
====================================================== */
export const STYLE_PRESETS: StylePreset[] = [
  { id: 'cinematic', name: 'Cinematic', emoji: '🎬', modifier: 'Cinematic color grading, dramatic lighting, anamorphic lens flare, film grain, shallow depth of field, movie-quality composition.' },
  { id: 'manga', name: 'Manga', emoji: '🎌', modifier: 'Anime/manga art style, cel-shading, vibrant saturated colors, clean outlines, Japanese illustration aesthetic, Studio Ghibli inspired.' },
  { id: 'vintage', name: 'Vintage', emoji: '📷', modifier: 'Vintage film photography look, warm faded tones, soft vignette, retro 70s/80s color palette, analog grain texture, nostalgic atmosphere.' },
  { id: 'editorial', name: 'Editorial', emoji: '📰', modifier: 'High-fashion editorial photography, Vogue magazine quality, dramatic pose, professional studio lighting, minimal background, luxury aesthetic.' },
  { id: 'dreamy', name: 'Dreamy', emoji: '✨', modifier: 'Ethereal dreamy atmosphere, soft focus, pastel color palette, lens flare, light leaks, fairy-tale quality, magical golden hour lighting.' },
  { id: 'dark', name: 'Dark Mood', emoji: '🌑', modifier: 'Dark moody aesthetic, low-key lighting, deep shadows, dramatic contrast, noir photography style, mysterious atmosphere.' },
];

/* =====================================================
   EVENT CONFIGS
====================================================== */
export const EVENT_CONFIGS: Record<string, EventConfig> = {
  noel: {
    id: 'noel',
    name: 'NOEL STUDIO',
    version: 'AI Engine v2.5',
    heroTitle: ['AI', 'Noel', 'Studio.'],
    heroSubtitle: 'Biến mọi ý tưởng Giáng sinh thành hiện thực 4K. Từ ông già Noel phong cách mới đến bối cảnh tuyết rơi huyền ảo.',
    subjects: ['Lễ hội ánh sáng', 'Mùa đông kỳ ảo', 'Cyberpunk Christmas', 'Manga Noel', 'Vintage Holiday'],
    scenes: ['Tuyết rơi', 'Lò sưởi', 'Đường phố neon', 'Rừng thông', 'Bữa tiệc tối'],
    accentColor: 'rose',
    icon: Snowflake,
    basePrompt: 'Professional high-quality Christmas/Noel themed photo synthesis.',
    systemPrompt: `You are a professional Christmas/Noel photo studio AI. Your role is to generate stunning, cinematic Christmas-themed images.

RULES:
- ALWAYS preserve the identity, facial features, and likeness of any person in the reference image with 100% accuracy
- Generate festive Christmas/Noel themed environments: snow, warm lights, Christmas trees, fireplaces, gifts
- Use warm, golden, and red color palettes with bokeh lighting effects
- Maintain hyper-realistic 8K quality with professional photography composition
- Apply cinematic lighting: warm key light, cool fill from snow/winter ambience
- Include Christmas decorations and props naturally in the scene
- The person should look natural and comfortable in the Christmas setting
- DO NOT alter facial features, skin tone, or body proportions of the reference person`,
    atmosphere: 'Beautiful Christmas atmosphere, falling snow, bokeh warm lights, 4K resolution.',
    costBase: 150,
    benefits: [
      { t: 'Tốc độ', d: 'Tạo hàng chục concept thiệp và banner Noel chỉ trong vài phút.' },
      { t: 'Đồng nhất', d: 'Duy trì khuôn mặt người mẫu trong các trang phục lễ hội phức tạp.' },
      { t: 'Độ nét', d: 'Kết xuất chất lượng 4K sắc nét từng bông tuyết và ánh đèn.' },
      { t: 'Sáng tạo', d: 'Phong cách Giáng sinh độc bản giúp hình ảnh luôn nổi bật.' }
    ],
    templates: [
      { id: 'noel-1', name: 'Santa Claus Premium', prompt: 'Person dressed as a stylish modern Santa Claus in a luxury red velvet suit with white fur trim, standing in a grand Christmas hall decorated with a massive Christmas tree, golden ornaments, warm candlelight, snow falling outside the window.', style: 'cinematic', tags: ['Santa', 'Luxury'] },
      { id: 'noel-2', name: 'Winter Wonderland', prompt: 'Person standing in a magical winter wonderland forest, surrounded by snow-covered pine trees, sparkling ice crystals, northern lights in the sky, wearing an elegant winter coat with fur details, soft moonlight illumination.', style: 'dreamy', tags: ['Forest', 'Snow'] },
      { id: 'noel-3', name: 'Cozy Fireplace', prompt: 'Person sitting by a warm crackling fireplace in a cozy cabin, Christmas stockings hanging, hot cocoa in hand, soft blanket, warm golden lighting, Christmas tree with fairy lights in the background.', style: 'vintage', tags: ['Cozy', 'Indoor'] },
      { id: 'noel-4', name: 'Neon Christmas', prompt: 'Person in a cyberpunk-style Christmas setting, neon lights in red and green, futuristic Christmas decorations, holographic snowflakes, urban nightscape with Christmas-themed digital billboards.', style: 'cinematic', tags: ['Cyberpunk', 'Neon'] },
      { id: 'noel-5', name: 'Christmas Market', prompt: 'Person walking through a traditional European Christmas market, wooden stalls decorated with lights, fresh snow on the ground, the aroma of mulled wine, handmade ornaments, romantic evening atmosphere.', style: 'editorial', tags: ['Outdoor', 'Market'] },
    ],
    landing: {
      tagline: 'NOEL STUDIO — AI CHRISTMAS ENGINE',
      headline: 'Giáng Sinh Trong\nTầm Tay Bạn.',
      subheadline: 'Không cần studio, không cần tuyết thật. AI tạo ra những bức ảnh Giáng Sinh mà bạn nghĩ chỉ có trong mơ — chất lượng tạp chí, giao ngay trong 30 giây.',
      stats: [
        { value: '5', label: 'Mẫu có sẵn' },
        { value: '6', label: 'Phong cách AI' },
        { value: '8K', label: 'Chất lượng' },
        { value: '30s', label: 'Mỗi ảnh' }
      ],
      howItWorks: [
        { step: '01', title: 'Tải ảnh chân dung', desc: 'Upload ảnh selfie hoặc chân dung rõ mặt. AI ghi nhớ đường nét gương mặt của bạn.' },
        { step: '02', title: 'Chọn concept Giáng Sinh', desc: 'Chọn từ 5 mẫu có sẵn hoặc mô tả bối cảnh mong muốn. Thêm phong cách Cinematic, Vintage, hay Cyberpunk.' },
        { step: '03', title: 'AI tổng hợp & tải về', desc: 'Engine xử lý trong 30 giây. Tải ảnh 8K về máy, chia sẻ lên mạng xã hội, hoặc in thiệp.' }
      ],
      showcaseTitle: 'Tác phẩm từ cộng đồng',
      showcaseDesc: 'Những bức ảnh Noel AI đẹp nhất được tạo bởi người dùng Skyverses.',
      ctaText: 'Mở Studio Noel',
      ctaSubtext: 'Bắt đầu miễn phí — không cần thẻ tín dụng'
    }
  },
  tet: {
    id: 'tet',
    name: 'TẾT STUDIO',
    version: 'AI Engine v4.0',
    heroTitle: ['AI', 'Tết', 'Studio.'],
    heroSubtitle: 'Kỷ niệm ngày Tết truyền thống trong không gian nghệ thuật AI hiện đại. Biến mọi khoảnh khắc thành tác phẩm rực rỡ.',
    subjects: ['Tết cổ truyền', 'Sắc xuân rạng rỡ', 'Chợ Tết phố thị', 'Gia đình sum vầy', 'Lễ hội hoa'],
    scenes: ['Hoa mai hoa đào', 'Câu đối đỏ', 'Bánh chưng xanh', 'Phố ông đồ', 'Múa lân'],
    accentColor: 'red',
    icon: Flower2,
    basePrompt: 'Traditional Vietnamese Lunar New Year (Tet) themed professional photography.',
    systemPrompt: `You are a professional Vietnamese Lunar New Year (Tết) photo studio AI. Your role is to generate beautiful, culturally authentic Tết-themed images.

RULES:
- ALWAYS preserve the identity, facial features, and likeness of any person in the reference image with 100% accuracy
- Generate authentic Vietnamese Tết environments: peach blossoms (hoa đào), apricot blossoms (hoa mai), red decorations, calligraphy scrolls
- Use vibrant red and gold color palettes with warm spring lighting
- Include traditional Tết elements: Áo dài, bánh chưng, mâm ngũ quả, câu đối
- Maintain hyper-realistic 8K quality with professional photography composition
- The person should wear culturally appropriate traditional Vietnamese clothing (Áo dài, Việt phục)
- Apply warm, celebratory lighting that captures the joyful spirit of spring
- DO NOT alter facial features, skin tone, or body proportions of the reference person`,
    atmosphere: 'Vibrant spring colors, warm sunlight, traditional Tet decorations, 8K hyper-realistic.',
    costBase: 150,
    benefits: [
      { t: 'Trang phục', d: 'Thử mọi loại Áo dài, Việt phục truyền thống chỉ với 1 tấm ảnh.' },
      { t: 'Bối cảnh', d: 'Tái hiện không gian chợ Tết, phố cổ, hay vườn hoa xuân lung linh.' },
      { t: 'Tiết kiệm', d: 'Không cần thuê ekip chuyên nghiệp hay phòng studio đắt đỏ.' },
      { t: 'Độc bản', d: 'Tạo ra những thiệp Tết và hình ảnh chúc xuân không đụng hàng.' }
    ],
    templates: [
      { id: 'tet-1', name: 'Áo dài Đỏ Cổ điển', prompt: 'Person wearing a stunning red Áo dài with golden embroidery, standing gracefully among blooming peach blossoms (hoa đào), traditional Vietnamese garden, red lanterns hanging, sunlight streaming through petals.', style: 'cinematic', tags: ['Áo dài', 'Hoa đào'] },
      { id: 'tet-2', name: 'Phố Ông Đồ', prompt: 'Person in elegant Vietnamese traditional clothing at a calligraphy street, old scholar writing red calligraphy scrolls (câu đối), blooming apricot blossoms, vintage Hanoi atmosphere, warm golden afternoon light.', style: 'vintage', tags: ['Phố cổ', 'Câu đối'] },
      { id: 'tet-3', name: 'Chợ Hoa Xuân', prompt: 'Person walking through a vibrant Vietnamese spring flower market, surrounded by kumquat trees, chrysanthemums, peach blossoms, bustling crowd, colorful decorations, warm festive lighting.', style: 'editorial', tags: ['Chợ hoa', 'Sắc xuân'] },
      { id: 'tet-4', name: 'Múa Lân Rồng', prompt: 'Person standing beside a magnificent Vietnamese lion/dragon dance performance, red and gold costumes, firecrackers, confetti, traditional drums, vibrant street festival atmosphere, dynamic action shot.', style: 'cinematic', tags: ['Múa lân', 'Lễ hội'] },
      { id: 'tet-5', name: 'Mâm Cỗ Tết', prompt: 'Person beside a beautifully arranged traditional Tết feast table (mâm cỗ Tết) with bánh chưng, giò, mứt Tết, fresh flowers, incense, family altar in the background, warm indoor lighting.', style: 'dreamy', tags: ['Mâm cỗ', 'Gia đình'] },
    ],
    landing: {
      tagline: 'TẾT STUDIO — PHIÊN BẢN XUÂN AI',
      headline: 'Xuân Về\nRực Rỡ Hơn.',
      subheadline: 'Áo dài truyền thống, hoa đào nở rộ, câu đối đỏ vàng — AI tái hiện trọn vẹn không khí Tết nguyên đán trong từng bức ảnh. Giữ nguyên khuôn mặt, thay đổi cả thế giới.',
      stats: [
        { value: '5', label: 'Mẫu Tết' },
        { value: '6', label: 'Phong cách' },
        { value: '8K', label: 'Ultra HD' },
        { value: '100%', label: 'Giữ mặt' }
      ],
      howItWorks: [
        { step: '01', title: 'Tải ảnh của bạn', desc: 'Upload ảnh chân dung bất kỳ. AI sẽ ghi nhớ hoàn toàn khuôn mặt và đường nét.' },
        { step: '02', title: 'Chọn bối cảnh Tết', desc: 'Áo dài đỏ bên hoa đào? Phố ông đồ? Chợ hoa xuân? Chọn mẫu hoặc tự mô tả.' },
        { step: '03', title: 'Nhận ảnh Tết AI', desc: 'Ảnh chất lượng tạp chí được tạo trong 30 giây. Hoàn hảo cho thiệp Tết, ảnh bìa, hay chia sẻ gia đình.' }
      ],
      showcaseTitle: 'Tác phẩm Xuân AI',
      showcaseDesc: 'Không gian Tết được tái hiện bằng trí tuệ nhân tạo — đẹp, đậm bản sắc Việt.',
      ctaText: 'Mở Studio Tết',
      ctaSubtext: 'Tạo ảnh Tết đầu tiên miễn phí'
    }
  },
  wedding: {
    id: 'wedding',
    name: 'WEDDING STUDIO',
    version: 'Wedding Engine v4.5',
    heroTitle: ['ẢNH CƯỚI', 'AI', 'PRO.'],
    heroSubtitle: 'Lưu giữ khoảnh khắc hạnh phúc nhất trong những bối cảnh lãng mạn đỉnh cao mà không cần tốn hàng chục triệu đồng.',
    subjects: ['Studio Hàn Quốc', 'Châu Âu cổ điển', 'Bờ biển lãng mạn', 'Phong cách Indochine', 'Modern Urban'],
    scenes: ['Hoa cưới lộng lẫy', 'Ánh sáng trong trẻo', 'Kiến trúc sang trọng', 'Hoàng hôn', 'Tối giản'],
    accentColor: 'pink',
    icon: Heart,
    basePrompt: 'Professional cinematic wedding photography production.',
    systemPrompt: `You are a world-class wedding photography AI studio. Your role is to generate stunning, magazine-quality wedding photos.

RULES:
- ALWAYS preserve the identity, facial features, and likeness of ALL persons in the reference images with 100% accuracy
- When multiple reference images are provided, treat them as a COUPLE — place them together naturally in the wedding scene
- Generate romantic, high-end wedding environments: elegant venues, gardens, beaches, European architecture
- Use soft, romantic color palettes: blush pink, ivory, gold, champagne tones
- Apply professional wedding photography lighting: golden hour, soft diffused light, romantic backlighting
- Include luxurious wedding elements: bridal gowns, bouquets, elegant decor, architectural details
- Maintain cinematic composition with shallow depth of field and dreamy bokeh
- Capture genuine emotion, elegance, and the romantic atmosphere of a premium wedding photoshoot
- DO NOT alter facial features, skin tone, or body proportions of any reference person`,
    atmosphere: 'Hyper-realistic wedding atmosphere, high-end bridal photography, romantic soft lighting, 8K.',
    costBase: 250,
    coupleMode: true,
    benefits: [
      { t: 'Đa dạng', d: 'Từ châu Âu cổ kính đến bờ biển Maldives hay studio Hàn Quốc.' },
      { t: 'Tùy biến', d: 'Thử hàng trăm mẫu váy cưới, veston cao cấp nhất không cần may đo.' },
      { t: 'Face-Lock', d: 'Công nghệ giữ nguyên vẹn cảm xúc và đường nét của cả hai bạn.' },
      { t: 'Tối ưu', d: 'Sở hữu bộ ảnh cưới đẳng cấp chỉ với vài trăm credits.' }
    ],
    templates: [
      { id: 'wed-1', name: 'Korean Studio Classic', prompt: 'Elegant Korean-style bridal studio photo, couple in luxurious white wedding dress and black tuxedo, clean white background with soft diffused lighting, minimalist elegant composition, magazine cover quality.', style: 'editorial', tags: ['Hàn Quốc', 'Studio'] },
      { id: 'wed-2', name: 'European Palace', prompt: 'Couple in a grand European palace ballroom, crystal chandeliers overhead, marble floors reflecting golden light, bride in a flowing cathedral-length gown, groom in a tailored suit, renaissance architecture.', style: 'cinematic', tags: ['Châu Âu', 'Cung điện'] },
      { id: 'wed-3', name: 'Beach Sunset', prompt: 'Romantic couple on a pristine tropical beach at golden hour, waves gently touching their bare feet, bride in a flowing bohemian lace dress, warm sunset colors painting the sky, silhouette backlighting.', style: 'dreamy', tags: ['Biển', 'Hoàng hôn'] },
      { id: 'wed-4', name: 'Indochine Garden', prompt: 'Couple in a serene Indochine-style garden with French colonial architecture, lotus pond, tropical plants, bride in elegant áo dài or fusion wedding dress, soft afternoon light filtering through trees.', style: 'vintage', tags: ['Indochine', 'Vườn'] },
      { id: 'wed-5', name: 'Modern Urban Night', prompt: 'Stylish couple in a modern city at night, cityscape lights as bokeh background, bride in a sleek contemporary wedding gown, urban rooftop setting, neon reflections, cinematic night photography.', style: 'cinematic', tags: ['Urban', 'Night'] },
    ],
    landing: {
      tagline: 'WEDDING STUDIO — AI BRIDAL ENGINE',
      headline: 'Ảnh Cưới Đẳng Cấp.\nChỉ Cần Selfie.',
      subheadline: 'Không cần bay sang Hàn Quốc. Không cần thuê studio 50 triệu. Chỉ cần 2 tấm ảnh chân dung — AI tạo bộ ảnh cưới mà studio thật chưa chắc làm được.',
      stats: [
        { value: '5', label: 'Package cưới' },
        { value: '♥', label: 'Couple Mode' },
        { value: '8K', label: 'Điện ảnh' },
        { value: '2', label: 'Ảnh cặp đôi' }
      ],
      howItWorks: [
        { step: '01', title: 'Upload ảnh cả hai', desc: 'Upload ảnh chân dung cô dâu và chú rể. AI ghi nhớ khuôn mặt của từng người.' },
        { step: '02', title: 'Chọn concept cưới', desc: 'Studio Hàn Quốc, cung điện Châu Âu, bờ biển hoàng hôn — hay để AI gợi ý cho bạn.' },
        { step: '03', title: 'Nhận ảnh cưới AI', desc: 'Bộ ảnh cưới chất lượng tạp chí, giữ nguyên đường nét cả hai. Tải về và in ngay.' }
      ],
      showcaseTitle: 'Tình yêu qua lăng kính AI',
      showcaseDesc: 'Những bộ ảnh cưới AI đẹp nhất — từ Hàn Quốc đến Santorini, chỉ bằng 1 click.',
      ctaText: 'Mở Wedding Studio',
      ctaSubtext: 'Tạo ảnh cưới đầu tiên — chỉ 250 Credits'
    }
  },
  birthday: {
    id: 'birthday',
    name: 'BIRTHDAY STUDIO',
    version: 'Birthday AI v4.2',
    heroTitle: ['ẢNH SINH', 'NHẬT', 'AI.'],
    heroSubtitle: 'Kỷ niệm ngày đặc biệt của bạn theo cách chưa từng có. Biến mọi ý tưởng tiệc tùng thành tác phẩm nghệ thuật.',
    subjects: ['Tiệc trà cổ điển', 'Neon Cyber Party', 'Outdoor Picnic', 'Luxury Ballroom', 'Manga Fantasy'],
    scenes: ['Bóng bay rực rỡ', 'Bánh kem tầng', 'Hộp quà khổng lồ', 'Pháo hoa', 'Nến lung linh'],
    accentColor: 'purple',
    icon: Cake,
    basePrompt: 'Joyful professional birthday celebration photography.',
    systemPrompt: `You are a professional birthday celebration photo studio AI. Your role is to generate vibrant, joyful birthday-themed images.

RULES:
- ALWAYS preserve the identity, facial features, and likeness of any person in the reference image with 100% accuracy
- Generate festive birthday environments: party decorations, balloons, confetti, birthday cakes, gifts
- Use vibrant, celebratory color palettes with dynamic lighting effects
- Include birthday party elements appropriate to the chosen theme (elegant, cyber, outdoor, etc.)
- The person should look happy, celebratory, and naturally placed in the birthday setting
- Apply professional photography lighting with festive accents: fairy lights, candle glow, colored spotlights
- Maintain hyper-realistic 8K quality with dynamic, energetic composition
- Capture the joy and excitement of a birthday celebration
- DO NOT alter facial features, skin tone, or body proportions of the reference person`,
    atmosphere: 'Festive and cinematic birthday atmosphere, vibrant colors, celebratory lighting, high quality 8K.',
    costBase: 150,
    benefits: [
      { t: 'Chủ đề', d: 'Từ tiệc trà cổ điển đến không gian Cyberpunk rực rỡ sắc màu.' },
      { t: 'Cá nhân hóa', d: 'AI hiểu và giữ nguyên nét đẹp gương mặt bạn trong mọi concept.' },
      { t: 'Quà tặng', d: 'Tạo thiệp mời và ảnh kỷ niệm ấn tượng chỉ trong vài giây.' },
      { t: 'Tiết kiệm', d: 'Sở hữu bộ ảnh tiệc chuyên nghiệp mà không cần chuẩn bị kỳ công.' }
    ],
    templates: [
      { id: 'bday-1', name: 'Luxury Ballroom', prompt: 'Person at an extravagant birthday gala in a luxury ballroom, towering multi-tier birthday cake with sparklers, golden balloon arch, confetti falling, crystal chandeliers, elegant party outfit.', style: 'cinematic', tags: ['Luxury', 'Ballroom'] },
      { id: 'bday-2', name: 'Neon Cyber Party', prompt: 'Person at a futuristic neon-lit birthday party, UV reactive decorations, LED balloon wall, holographic "Happy Birthday" sign, cyberpunk outfit, electric blue and pink lighting, DJ stage in background.', style: 'dark', tags: ['Neon', 'Cyberpunk'] },
      { id: 'bday-3', name: 'Garden Tea Party', prompt: 'Person at an elegant outdoor garden tea party birthday celebration, vintage china tea set, three-tier cake stand, pastel flower decorations, white lace tablecloth, afternoon sun through the trees.', style: 'vintage', tags: ['Vintage', 'Garden'] },
      { id: 'bday-4', name: 'Manga Fantasy', prompt: 'Person in an anime/manga style birthday scene, surrounded by cute kawaii decorations, giant strawberry cake, cherry blossoms, sparkle effects, vibrant colors, whimsical fantasy setting.', style: 'manga', tags: ['Manga', 'Fantasy'] },
      { id: 'bday-5', name: 'Fireworks Celebration', prompt: 'Person on a rooftop with spectacular birthday fireworks in the night sky, city skyline backdrop, elegant outfit, champagne toast, golden confetti, dramatic upward camera angle.', style: 'cinematic', tags: ['Fireworks', 'Night'] },
    ],
    landing: {
      tagline: 'BIRTHDAY STUDIO — AI PARTY ENGINE',
      headline: 'Sinh Nhật\nĐáng Nhớ Nhất.',
      subheadline: 'Từ tiệc trà cổ điển đến Neon Cyber Party — AI biến ngày sinh nhật của bạn thành tác phẩm nghệ thuật. Giữ nguyên khuôn mặt, thay đổi cả vũ trụ xung quanh.',
      stats: [
        { value: '5', label: 'Concept tiệc' },
        { value: '6', label: 'Art style' },
        { value: '8K', label: 'Ultra HD' },
        { value: '4x', label: 'Biến thể' }
      ],
      howItWorks: [
        { step: '01', title: 'Tải ảnh sinh nhật', desc: 'Upload ảnh chân dung của bạn hoặc người bạn muốn tặng. AI ghi nhớ mọi đường nét.' },
        { step: '02', title: 'Chọn concept tiệc', desc: 'Luxury Ballroom? Manga Fantasy? Neon Party? Chọn mẫu hoặc mô tả tiệc sinh nhật mơ ước.' },
        { step: '03', title: 'Tải ảnh & chia sẻ', desc: 'Ảnh sinh nhật chất lượng điện ảnh, sẵn sàng in thiệp mời hoặc đăng Instagram.' }
      ],
      showcaseTitle: 'Tiệc sinh nhật AI',
      showcaseDesc: 'Những concept sinh nhật ấn tượng nhất — được tạo hoàn toàn bởi AI.',
      ctaText: 'Mở Birthday Studio',
      ctaSubtext: 'Tạo ảnh sinh nhật đầu tiên — chỉ 150 Credits'
    }
  }
};

export const COMMON_STUDIO_CONSTANTS = {
  RATIOS: ['1:1', '16:9', '9:16', '4:3', '3:4'],
  QUALITY_MODES: ['Tiêu chuẩn (Nhanh)', 'Sắc nét (Chất lượng)', 'Điện ảnh (UHD)'],
  AI_MODELS: [
    { id: 'gemini-2.5-flash-image', name: 'Gemini 2.5 Flash', cost: 150 },
    { id: 'gemini-3-pro-image-preview', name: 'Gemini 3 Pro (PRO)', cost: 500 }
  ]
};
