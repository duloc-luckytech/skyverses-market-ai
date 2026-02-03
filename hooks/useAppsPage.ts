
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
    id: 'a-captcha',
    name: 'Neural Captcha Resolver',
    desc: 'Hạ tầng giải mã Captcha bằng AI tốc độ cao cho các hệ thống tự động hóa quy mô lớn.',
    category: 'INFRA',
    status: 'OPERATIONAL',
    stats: { latency: '0.2s', version: 'API v2', users: 'Enterprise' },
    color: 'text-indigo-500',
    slug: 'captcha-veo3'
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
