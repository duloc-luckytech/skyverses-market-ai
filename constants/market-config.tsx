import React from 'react';
import { Flame, ImageIcon, Video, Bot, Gift, LayoutGrid } from 'lucide-react';

export interface HomeBlockOption {
  id: string;
  label: string;
  subtitle: string;
  icon: React.ReactElement;
  color: string;
}

export const HOME_BLOCK_OPTIONS: HomeBlockOption[] = [
  { 
    id: 'top-choice', 
    label: 'Top Choice', 
    subtitle: 'Lựa chọn hàng đầu cho hiệu suất sáng tạo vượt trội',
    icon: <Flame size={14}/>, 
    color: 'text-orange-500' 
  },
  { 
    id: 'top-image', 
    label: 'Image Studio', 
    subtitle: 'Tổng hợp thị giác độ trung thực cao cho hệ thống thiết kế',
    icon: <ImageIcon size={14}/>, 
    color: 'text-brand-blue' 
  },
  { 
    id: 'top-video', 
    label: 'Video Studio', 
    subtitle: 'Công cụ kiến tạo chuyển động AI cho sản xuất điện ảnh',
    icon: <Video size={14}/>, 
    color: 'text-purple-500' 
  },
  { 
    id: 'top-ai-agent', 
    label: 'AI Agent Workflow', 
    subtitle: 'Tự động hóa quy trình sáng tạo đa kênh với hệ thống AI Agent thông minh',
    icon: <Bot size={14}/>, 
    color: 'text-emerald-500' 
  },
  { 
    id: 'events', 
    label: 'Lễ hội & Sự kiện', 
    subtitle: 'Tài nguyên AI cho những khoảnh khắc lễ hội kỳ ảo',
    icon: <Gift size={14}/>, 
    color: 'text-rose-500' 
  },
  { 
    id: 'app-other', 
    label: 'App khác', 
    subtitle: 'Khám phá các ứng dụng hỗ trợ và tiện ích AI đa dạng',
    icon: <LayoutGrid size={14}/>, 
    color: 'text-slate-500' 
  }
];
