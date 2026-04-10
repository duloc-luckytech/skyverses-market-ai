// pages/images/AIImageRestoration.tsx
// Thin orchestrator — 5 sections theo chuẩn add_new_product skill

import React, { useState } from 'react';
import RestorationWorkspace from '../../components/RestorationWorkspace';
import { usePageMeta } from '../../hooks/usePageMeta';

// ─── Modular Landing Sections ───
import { HeroSection }     from '../../components/landing/image-restoration/HeroSection';
import { WorkflowSection } from '../../components/landing/image-restoration/WorkflowSection';
import { ShowcaseSection } from '../../components/landing/image-restoration/ShowcaseSection';
import { FeaturesSection } from '../../components/landing/image-restoration/FeaturesSection';
import { FinalCTA }        from '../../components/landing/image-restoration/FinalCTA';

const AIImageRestoration: React.FC = () => {
  usePageMeta({
    title: 'AI Image Restoration — Phục Chế Ảnh 4K | Skyverses',
    description: 'Hồi sinh ảnh cũ, mờ, xước thành tuyệt tác 4K với AI. Face enhancement, color synthesis, 8K upscale — miễn phí, dưới 5 giây.',
    keywords: 'phục chế ảnh AI, restore old photo, tô màu ảnh đen trắng, nâng độ phân giải, face enhancement AI',
    canonical: '/product/ai-image-restorer',
    jsonLd: {
      '@type': 'SoftwareApplication',
      name: 'AI Image Restoration',
      applicationCategory: 'MultimediaApplication',
      description: 'AI-powered photo restoration: upscale to 4K/8K, remove scratches, colorize B&W, enhance faces.',
      offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
    },
  });

  const [isStudioOpen, setIsStudioOpen] = useState(false);

  if (isStudioOpen) {
    return (
      <div className="fixed inset-0 z-[500] bg-white dark:bg-[#0a0a0c] animate-in fade-in duration-500">
        <RestorationWorkspace onClose={() => setIsStudioOpen(false)} />
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-[#0a0a0c] min-h-screen text-slate-900 dark:text-white font-sans overflow-x-hidden pt-16 transition-colors duration-300">

      {/* ── HERO ── */}
      <HeroSection onStartStudio={() => setIsStudioOpen(true)} />

      {/* ── WORKFLOW ── */}
      <WorkflowSection />

      {/* ── SHOWCASE ── */}
      <ShowcaseSection />

      {/* ── FEATURES ── */}
      <FeaturesSection />

      {/* ── FINAL CTA ── */}
      <FinalCTA onStartStudio={() => setIsStudioOpen(true)} />

      {/* ── STICKY MOBILE CTA ── */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 z-40 px-4 pb-4 pt-2 bg-gradient-to-t from-white dark:from-[#0a0a0c] via-white/95 dark:via-[#0a0a0c]/95 to-transparent">
        <button
          onClick={() => setIsStudioOpen(true)}
          className="w-full py-3.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 text-white text-[12px] font-bold uppercase tracking-widest shadow-lg shadow-emerald-500/30 hover:brightness-110 transition-all flex items-center justify-center gap-2"
        >
          ✨ Phục Chế Ảnh Ngay — Miễn Phí
        </button>
      </div>
    </div>
  );
};

export default AIImageRestoration;
