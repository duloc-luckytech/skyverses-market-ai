
import { Snowflake, Flower2, Heart, Cake, Gift, LucideIcon } from 'lucide-react';

export interface EventConfig {
  id: string;
  name: string;
  version: string;
  subjects: string[];
  scenes: string[];
  accentColor: string; // Tailwind base color (e.g., 'rose', 'red', 'pink')
  icon: LucideIcon;
  basePrompt: string;
  atmosphere: string;
  costBase: number;
}

export const EVENT_CONFIGS: Record<string, EventConfig> = {
  noel: {
    id: 'noel',
    name: 'NOEL STUDIO',
    version: 'AI Engine v2.5',
    subjects: ['Lễ hội ánh sáng', 'Mùa đông kỳ ảo', 'Cyberpunk Christmas', 'Manga Noel', 'Vintage Holiday'],
    scenes: ['Tuyết rơi', 'Lò sưởi', 'Đường phố neon', 'Rừng thông', 'Bữa tiệc tối'],
    accentColor: 'rose',
    icon: Snowflake,
    basePrompt: 'Noel Studio Design',
    atmosphere: 'Beautiful Christmas atmosphere, 4K, high fidelity.',
    costBase: 150
  },
  tet: {
    id: 'tet',
    name: 'TẾT STUDIO',
    version: 'AI Engine v4.0',
    subjects: ['Tết cổ truyền', 'Sắc xuân rạng rỡ', 'Chợ Tết phố thị', 'Gia đình sum vầy', 'Lễ hội hoa'],
    scenes: ['Hoa mai hoa đào', 'Câu đối đỏ', 'Bánh chưng xanh', 'Phố ông đồ', 'Múa lân'],
    accentColor: 'red',
    icon: Flower2,
    basePrompt: 'Lunar New Year Tet Holiday Design',
    atmosphere: 'Vibrant Vietnamese Lunar New Year atmosphere, traditional colors, 8K resolution.',
    costBase: 150
  },
  wedding: {
    id: 'wedding',
    name: 'WEDDING STUDIO',
    version: 'Wedding Engine v4.5',
    subjects: ['Studio Hàn Quốc', 'Châu Âu cổ điển', 'Bờ biển lãng mạn', 'Phong cách Indochine', 'Modern Urban'],
    scenes: ['Hoa cưới lộng lẫy', 'Ánh sáng trong trẻo', 'Kiến trúc sang trọng', 'Hoàng hôn', 'Tối giản'],
    accentColor: 'pink',
    icon: Heart,
    basePrompt: 'Professional Wedding Photo Production',
    atmosphere: 'Hyper-realistic wedding atmosphere, high-end bridal photography, 8K resolution.',
    costBase: 150
  },
  birthday: {
    id: 'birthday',
    name: 'BIRTHDAY STUDIO',
    version: 'Birthday AI v4.2',
    subjects: ['Tiệc trà cổ điển', 'Neon Cyber Party', 'Outdoor Picnic', 'Luxury Ballroom', 'Manga Fantasy'],
    scenes: ['Bóng bay rực rỡ', 'Bánh kem tầng', 'Hộp quà khổng lồ', 'Pháo hoa', 'Nến lung linh'],
    accentColor: 'purple',
    icon: Cake,
    basePrompt: 'Professional Birthday Photo Production',
    atmosphere: 'Joyful and cinematic birthday atmosphere, vibrant celebrations, high quality 8K.',
    costBase: 150
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
