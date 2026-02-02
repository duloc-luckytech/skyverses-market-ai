
import { useState, useMemo } from 'react';

export type AppCategory = 'CREATIVE' | 'AUTOMATION' | 'INFRA' | 'ALL';

export interface AppNode {
  id: string;
  name: string;
  desc: string;
  category: AppCategory;
  status: 'OPERATIONAL' | 'BETA' | 'DEVELOPMENT';
  stats: { latency: string; version: string; users: string };
  color: string;
  slug?: string;
}

export const APP_REGISTRY: AppNode[] = [
  {
    id: 'a1',
    name: 'Cinematic Composer',
    desc: 'Tạo nhạc phim và hiệu ứng âm thanh từ kịch bản kịch tính.',
    category: 'CREATIVE',
    status: 'OPERATIONAL',
    stats: { latency: '12ms', version: 'v1.4', users: '2.4k' },
    color: 'text-rose-500'
  },
  {
    id: 'a2',
    name: '3D Mesh Weaver',
    desc: 'Chuyển đổi hình ảnh 2D sang mô hình 3D chuẩn công nghiệp.',
    category: 'CREATIVE',
    status: 'BETA',
    stats: { latency: '45ms', version: 'v2.0', users: '842' },
    color: 'text-cyan-500'
  },
  {
    id: 'a3',
    name: 'Identity Sync Pro',
    desc: 'Đồng bộ gương mặt người thật vào các bối cảnh AI phức tạp.',
    category: 'CREATIVE',
    status: 'OPERATIONAL',
    stats: { latency: '8ms', version: 'v4.5', users: '12k' },
    color: 'text-purple-500'
  },
  {
    id: 'a4',
    name: 'Flow Orchestrator',
    desc: 'Xây dựng quy trình AI node-based cho doanh nghiệp.',
    category: 'AUTOMATION',
    status: 'OPERATIONAL',
    stats: { latency: '5ms', version: 'v3.1', users: '5.1k' },
    color: 'text-emerald-500'
  },
  {
    id: 'a5',
    name: 'Content Harvester',
    desc: 'Tự động quét và tối ưu nội dung từ các nền tảng mạng xã hội.',
    category: 'AUTOMATION',
    status: 'DEVELOPMENT',
    stats: { latency: 'N/A', version: 'v0.8', users: '0' },
    color: 'text-orange-500'
  },
  {
    id: 'a6',
    name: 'Agentic CRM',
    desc: 'Hệ thống AI Agent chăm sóc khách hàng tự động đa kênh.',
    category: 'AUTOMATION',
    status: 'BETA',
    stats: { latency: '20ms', version: 'v1.2', users: '1.2k' },
    color: 'text-blue-500'
  },
  {
    id: 'a-captcha',
    name: 'Neural Captcha Resolver',
    desc: 'Hạ tầng giải mã Captcha bằng AI tốc độ cao cho các hệ thống tự động hóa quy mô lớn.',
    category: 'INFRA',
    status: 'OPERATIONAL',
    stats: { latency: '0.2s', version: 'API v2', users: 'Enterprise' },
    color: 'text-indigo-500',
    slug: 'captcha-token'
  }
];

export const useAppsPage = () => {
  const [activeCategory, setActiveCategory] = useState<AppCategory>('ALL');
  const [isModalOpen, setIsModalOpen] = useState(false);

  const filteredApps = useMemo(() => {
    return APP_REGISTRY.filter(app => 
      activeCategory === 'ALL' || app.category === activeCategory
    );
  }, [activeCategory]);

  return {
    activeCategory,
    setActiveCategory,
    isModalOpen,
    setIsModalOpen,
    filteredApps
  };
};
