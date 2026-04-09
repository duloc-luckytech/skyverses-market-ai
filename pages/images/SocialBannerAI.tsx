import React, { useState } from 'react';
import { HeroSection } from '../../components/landing/social-banner-ai/HeroSection';
import { WorkflowSection } from '../../components/landing/social-banner-ai/WorkflowSection';
import { ShowcaseSection } from '../../components/landing/social-banner-ai/ShowcaseSection';
import { FeaturesSection } from '../../components/landing/social-banner-ai/FeaturesSection';
import { FinalCTA } from '../../components/landing/social-banner-ai/FinalCTA';
import { usePageMeta } from '../../hooks/usePageMeta';
import SocialBannerWorkspace from '../../components/SocialBannerWorkspace';

const SocialBannerAI: React.FC = () => {
  usePageMeta({
    title: 'Social Banner AI — Tạo Banner Mạng Xã Hội Bằng AI | Skyverses',
    description: 'Công cụ AI tạo banner chuẩn pixel cho X, Facebook, Instagram, LinkedIn trong 60 giây. Tự động đúng kích thước, màu thương hiệu, AI copywriting. 120 CR / banner.',
    keywords: 'tạo banner mạng xã hội AI, banner facebook AI, banner instagram AI, banner X twitter AI, banner linkedin AI, social media banner generator',
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
      <ShowcaseSection />
      <FeaturesSection />
      <FinalCTA onStartStudio={() => setIsStudioOpen(true)} />
    </div>
  );
};

export default SocialBannerAI;
