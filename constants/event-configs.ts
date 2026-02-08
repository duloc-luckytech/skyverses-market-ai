
import { Snowflake, Flower2, Heart, Cake, Gift, LucideIcon } from 'lucide-react';

export interface EventConfig {
  id: string;
  name: string;
  version: string;
  heroTitle: string[];
  heroSubtitle: string;
  subjects: string[];
  scenes: string[];
  accentColor: string; // Tailwind base color
  icon: LucideIcon;
  basePrompt: string;
  atmosphere: string;
  costBase: number;
  benefits: { t: string; d: string }[];
}

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
    basePrompt: 'Noel Studio Design',
    atmosphere: 'Beautiful Christmas atmosphere, 4K, high fidelity.',
    costBase: 150,
    benefits: [
      { t: 'Tốc độ', d: 'Tạo hàng chục concept thiệp và banner Noel chỉ trong vài phút.' },
      { t: 'Đồng nhất', d: 'Duy trì khuôn mặt người mẫu trong các trang phục lễ hội phức tạp.' },
      { t: 'Độ nét', d: 'Kết xuất chất lượng 4K sắc nét từng bông tuyết và ánh đèn.' },
      { t: 'Sáng tạo', d: 'Phong cách Giáng sinh độc bản giúp hình ảnh luôn nổi bật.' }
    ]
  },
  tet: {
    id: 'tet',
    name: 'TẾT STUDIO',
    version: 'AI Engine v4.0',
    heroTitle: ['AI', 'Tết', 'Studio.'],
    heroSubtitle: 'Kỷ niệm ngày Tết truyền thống trong không gian nghệ thuật AI hiện đại. Biến mọi khoảnh khắc thành tác phẩm sắc xuân rực rỡ.',
    subjects: ['Tết cổ truyền', 'Sắc xuân rạng rỡ', 'Chợ Tết phố thị', 'Gia đình sum vầy', 'Lễ hội hoa'],
    scenes: ['Hoa mai hoa đào', 'Câu đối đỏ', 'Bánh chưng xanh', 'Phố ông đồ', 'Múa lân'],
    accentColor: 'red',
    icon: Flower2,
    basePrompt: 'Lunar New Year Tet Holiday Design',
    atmosphere: 'Vibrant Vietnamese Lunar New Year atmosphere, traditional colors, 8K resolution.',
    costBase: 150,
    benefits: [
      { t: 'Trang phục', d: 'Thử mọi loại Áo dài, Việt phục truyền thống chỉ với 1 tấm ảnh.' },
      { t: 'Bối cảnh', d: 'Tái hiện không gian chợ Tết, phố cổ, hay vườn hoa xuân lung linh.' },
      { t: 'Tiết kiệm', d: 'Không cần thuê ekip chuyên nghiệp hay phòng studio đắt đỏ.' },
      { t: 'Độc bản', d: 'Tạo ra những thiệp Tết và hình ảnh chúc xuân không đụng hàng.' }
    ]
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
    basePrompt: 'Professional Wedding Photo Production',
    atmosphere: 'Hyper-realistic wedding atmosphere, high-end bridal photography, 8K resolution.',
    costBase: 150,
    benefits: [
      { t: 'Đa dạng', d: 'Từ châu Âu cổ kính đến bờ biển Maldives hay studio Hàn Quốc.' },
      { t: 'Tùy biến', d: 'Thử hàng trăm mẫu váy cưới, veston cao cấp nhất không cần may đo.' },
      { t: 'Face-Lock', d: 'Công nghệ giữ nguyên vẹn cảm xúc và đường nét của cả hai bạn.' },
      { t: 'Tối ưu', d: 'Sở hữu bộ ảnh cưới đẳng cấp chỉ với vài trăm credits.' }
    ]
  },
  birthday: {
    id: 'birthday',
    name: 'BIRTHDAY STUDIO',
    version: 'Birthday AI v4.2',
    heroTitle: ['ẢNH SINH', 'NHẬT', 'AI.'],
    heroSubtitle: 'Kỷ niệm ngày đặc biệt của bạn theo cách chưa từng có. Biến mọi ý tưởng tiệc tùng thành tác phẩm nghệ thuật đỉnh cao.',
    subjects: ['Tiệc trà cổ điển', 'Neon Cyber Party', 'Outdoor Picnic', 'Luxury Ballroom', 'Manga Fantasy'],
    scenes: ['Bóng bay rực rỡ', 'Bánh kem tầng', 'Hộp quà khổng lồ', 'Pháo hoa', 'Nến lung linh'],
    accentColor: 'purple',
    icon: Cake,
    basePrompt: 'Professional Birthday Photo Production',
    atmosphere: 'Joyful and cinematic birthday atmosphere, vibrant celebrations, high quality 8K.',
    costBase: 150,
    benefits: [
      { t: 'Chủ đề', d: 'Từ tiệc trà cổ điển đến không gian Cyberpunk rực rỡ sắc màu.' },
      { t: 'Cá nhân hóa', d: 'AI hiểu và giữ nguyên nét đẹp gương mặt bạn trong mọi concept.' },
      { t: 'Quà tặng', d: 'Tạo thiệp mời và ảnh kỷ niệm ấn tượng chỉ trong vài giây.' },
      { t: 'Tiết kiệm', d: 'Sở hữu bộ ảnh tiệc chuyên nghiệp mà không cần chuẩn bị kỳ công.' }
    ]
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
