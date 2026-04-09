import React, { useState } from 'react';
import { HeroSection } from '../../components/landing/social-banner-ai/HeroSection';
import { WorkflowSection } from '../../components/landing/social-banner-ai/WorkflowSection';
import { ShowcaseSection } from '../../components/landing/social-banner-ai/ShowcaseSection';
import { FeaturesSection } from '../../components/landing/social-banner-ai/FeaturesSection';
import { UseCasesSection } from '../../components/landing/social-banner-ai/UseCasesSection';
import { FinalCTA } from '../../components/landing/social-banner-ai/FinalCTA';
import { LiveStatsBar } from '../../components/landing/social-banner-ai/LiveStatsBar';
import { FAQSection } from '../../components/landing/social-banner-ai/FAQSection';
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
      {/* ── HERO ── */}
      <HeroSection onStartStudio={() => setIsStudioOpen(true)} />

      {/* ── LIVE STATS BAR (L2) ── */}
      <LiveStatsBar />

      {/* ── WORKFLOW + SHOWCASE + FEATURES + USE CASES ── */}
      <WorkflowSection />
      <ShowcaseSection />
      <FeaturesSection />
      <UseCasesSection />

      {/* ── FAQ (L3) ── */}
      <FAQSection />

      {/* ── FINAL CTA ── */}
      <FinalCTA onStartStudio={() => setIsStudioOpen(true)} />

      {/* ── L4: STICKY MOBILE CTA ── */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 z-40 px-4 pb-4 pt-2 bg-gradient-to-t from-white dark:from-[#0a0a0c] via-white/95 dark:via-[#0a0a0c]/95 to-transparent">
        <button
          onClick={() => setIsStudioOpen(true)}
          className="w-full py-3.5 rounded-xl bg-gradient-to-r from-brand-blue to-blue-500 text-white text-[12px] font-bold uppercase tracking-widest shadow-lg shadow-brand-blue/30 hover:brightness-110 transition-all flex items-center justify-center gap-2"
        >
          ✨ Tạo Banner Ngay — Miễn phí thử
        </button>
      </div>
    </div>
  );
};

export default SocialBannerAI;
