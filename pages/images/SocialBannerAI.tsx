import React, { useState } from 'react';
import SocialBannerWorkspace from '../../components/SocialBannerWorkspace';
import { HeroSection } from '../../components/landing/social-banner/HeroSection';
import { WorkflowSection } from '../../components/landing/social-banner/WorkflowSection';
import { FeaturesSection } from '../../components/landing/social-banner/FeaturesSection';
import { FinalCTA } from '../../components/landing/social-banner/FinalCTA';
import { usePageMeta } from '../../hooks/usePageMeta';

const SocialBannerAI: React.FC = () => {
  usePageMeta({
    title: 'Social Banner AI — Tạo Banner Mạng Xã Hội Bằng AI | Skyverses',
    description: 'Công cụ tạo banner AI cho X, Facebook, Instagram, LinkedIn. Pixel-perfect, brand colors, AI copywriting — xuất PNG/JPG chuẩn kích thước từng nền tảng.',
    keywords: 'tạo banner AI, social media banner, banner facebook, banner instagram, banner x twitter, banner linkedin, AI marketing',
    canonical: '/product/social-banner-ai',
  });

  const [isStudioOpen, setIsStudioOpen] = useState(false);

  if (isStudioOpen) {
    return (
      <div className="fixed inset-0 z-[500] bg-white dark:bg-[#0a0a0c] animate-in fade-in duration-500">
        <SocialBannerWorkspace onClose={() => setIsStudioOpen(false)} />
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-[#0a0a0c] min-h-screen text-slate-900 dark:text-white font-sans overflow-x-hidden pt-16 transition-colors duration-300">
      <HeroSection onStartStudio={() => setIsStudioOpen(true)} />
      <WorkflowSection />
      <FeaturesSection />
      <FinalCTA onStartStudio={() => setIsStudioOpen(true)} />
    </div>
  );
};

export default SocialBannerAI;
