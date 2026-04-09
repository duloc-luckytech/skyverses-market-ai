import React, { useState } from 'react';
import { HeroSection } from '../../components/landing/social-banner-ai/HeroSection';
import { WorkflowSection } from '../../components/landing/social-banner-ai/WorkflowSection';
import { ShowcaseSection } from '../../components/landing/social-banner-ai/ShowcaseSection';
import { FeaturesSection } from '../../components/landing/social-banner-ai/FeaturesSection';
import { UseCasesSection } from '../../components/landing/social-banner-ai/UseCasesSection';
import { FinalCTA } from '../../components/landing/social-banner-ai/FinalCTA';
import { usePageMeta } from '../../hooks/usePageMeta';
import SocialBannerWorkspace from '../../components/SocialBannerWorkspace';

const SocialBannerAI: React.FC = () => {
  usePageMeta({
    title: 'AI Tạo Banner Facebook & X (Twitter) | Skyverses',
    description: 'Tạo banner mạng xã hội chuyên nghiệp cho Facebook và X bằng AI. Đúng kích thước, đúng thương hiệu, không cần designer. Tạo trong 30 giây.',
    keywords: 'tạo banner AI, banner facebook AI, banner twitter AI, banner mạng xã hội, social media banner generator',
    canonical: '/product/social-banner-ai',
  });

  const [isStudioOpen, setIsStudioOpen] = useState(false);

  if (isStudioOpen) return (
    <div className="fixed inset-0 z-[500] bg-white dark:bg-[#0a0a0c] animate-in fade-in duration-500">
      <SocialBannerWorkspace onClose={() => setIsStudioOpen(false)} />
    </div>
  );

  return (
    <div className="bg-white dark:bg-[#0a0a0c] min-h-screen text-slate-900 dark:text-white font-sans overflow-x-hidden pt-16 transition-colors duration-300">
      <HeroSection onStartStudio={() => setIsStudioOpen(true)} />
      <WorkflowSection />
      <ShowcaseSection productSlug="social-banner-ai" />
      <FeaturesSection />
      <UseCasesSection />
      <FinalCTA onStartStudio={() => setIsStudioOpen(true)} />
    </div>
  );
};

export default SocialBannerAI;
