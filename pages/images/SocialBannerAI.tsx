
import React, { useState } from 'react';
import SocialBannerWorkspace from '../../components/SocialBannerWorkspace';
import { HeroSection } from '../../components/landing/social-banner/HeroSection';
import { WorkflowSection } from '../../components/landing/social-banner/WorkflowSection';
import { FeaturesSection } from '../../components/landing/social-banner/FeaturesSection';
import { FinalCTA } from '../../components/landing/social-banner/FinalCTA';
import { usePageMeta } from '../../hooks/usePageMeta';

const SocialBannerAI = () => {
  usePageMeta({
    title: 'Social Banner AI | Skyverses — Tạo banner X, Facebook, Instagram, LinkedIn',
    description: 'Tạo banner media đúng kích thước chuẩn cho X (Twitter), Facebook, Instagram và LinkedIn bằng AI. Cover, Post, Story — đúng pixel, chuyên nghiệp ngay lập tức.',
    keywords: 'social media banner AI, tạo banner facebook, twitter cover AI, instagram banner, linkedin banner',
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
