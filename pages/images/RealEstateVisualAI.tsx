// pages/images/RealEstateVisualAI.tsx
// Thin orchestrator — import 8 sections

import React, { useState } from 'react';
import RealEstateVisualWorkspace from '../../components/RealEstateVisualWorkspace';
import { HeroSection } from '../../components/landing/realestate-visual-ai/HeroSection';
import { LiveStatsBar } from '../../components/landing/realestate-visual-ai/LiveStatsBar';
import { WorkflowSection } from '../../components/landing/realestate-visual-ai/WorkflowSection';
import { ShowcaseSection } from '../../components/landing/realestate-visual-ai/ShowcaseSection';
import { FeaturesSection } from '../../components/landing/realestate-visual-ai/FeaturesSection';
import { UseCasesSection } from '../../components/landing/realestate-visual-ai/UseCasesSection';
import { FAQSection } from '../../components/landing/realestate-visual-ai/FAQSection';
import { FinalCTA } from '../../components/landing/realestate-visual-ai/FinalCTA';
import { usePageMeta } from '../../hooks/usePageMeta';

const RealEstateVisualAI: React.FC = () => {
  usePageMeta({
    title: 'AI Tạo Ảnh & Video Bất Động Sản | Render 4K, Video Tour — Skyverses',
    description:
      'Tạo ảnh render 4K, staging nội thất ảo, video tour cinematic cho bất động sản bằng AI. Không cần designer, không cần studio. Thử miễn phí ngay!',
    keywords:
      'tạo ảnh bất động sản AI, render kiến trúc 4K, video tour BĐS, staging nội thất ảo, phối cảnh dự án AI',
    canonical: '/product/realestate-visual-ai',
  });

  const [isStudioOpen, setIsStudioOpen] = useState(false);

  if (isStudioOpen) return (
    <div className="fixed inset-0 z-[500] bg-white dark:bg-[#0a0a0c] animate-in fade-in duration-500">
      <RealEstateVisualWorkspace onClose={() => setIsStudioOpen(false)} />
    </div>
  );

  return (
    <div className="bg-white dark:bg-[#0a0a0c] min-h-screen text-slate-900 dark:text-white font-sans overflow-x-hidden pt-16 transition-colors duration-300">
      {/* ── HERO ── */}
      <HeroSection onStartStudio={() => setIsStudioOpen(true)} />

      {/* ── LIVE STATS BAR ── */}
      <LiveStatsBar />

      {/* ── WORKFLOW + SHOWCASE + FEATURES + USE CASES ── */}
      <WorkflowSection />
      <ShowcaseSection productSlug="realestate-visual-ai" />
      <FeaturesSection />
      <UseCasesSection />

      {/* ── FAQ ── */}
      <FAQSection />

      {/* ── FINAL CTA ── */}
      <FinalCTA onStartStudio={() => setIsStudioOpen(true)} />

      {/* ── STICKY MOBILE CTA ── */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 z-40 px-4 pb-4 pt-2 bg-gradient-to-t from-white dark:from-[#0a0a0c] via-white/95 dark:via-[#0a0a0c]/95 to-transparent">
        <button
          onClick={() => setIsStudioOpen(true)}
          className="w-full py-3.5 rounded-xl bg-gradient-to-r from-brand-blue to-blue-500 text-white text-[12px] font-bold uppercase tracking-widest shadow-lg shadow-brand-blue/30 hover:brightness-110 transition-all flex items-center justify-center gap-2"
        >
          ✨ Tạo Ảnh & Video BĐS — Thử miễn phí
        </button>
      </div>
    </div>
  );
};

export default RealEstateVisualAI;
