import React, { useState } from 'react';
import { HeroSection } from '../../components/landing/product-image/HeroSection';
import { LiveStatsBar } from '../../components/landing/product-image/LiveStatsBar';
import { ModesSection } from '../../components/landing/product-image/ModesSection';
import { WorkflowSection } from '../../components/landing/product-image/WorkflowSection';
import { FeaturesSection } from '../../components/landing/product-image/FeaturesSection';
import { UseCasesSection } from '../../components/landing/product-image/UseCasesSection';
import { FAQSection } from '../../components/landing/product-image/FAQSection';
import { FinalCTA } from '../../components/landing/product-image/FinalCTA';
import { usePageMeta } from '../../hooks/usePageMeta';
import ProductImageWorkspace from '../../components/ProductImageWorkspace';

const ProductImage: React.FC = () => {
  usePageMeta({
    title: 'AI Image Studio — Tạo & Chỉnh sửa ảnh AI | Skyverses',
    description: 'Tạo và chỉnh sửa ảnh chuyên nghiệp bằng AI. 22+ models: Imagen 4, FLUX, Stable Diffusion, Midjourney-style. Xuất 4K/8K, xóa nền, style transfer, batch processing.',
    keywords: 'AI image studio, tạo ảnh AI, chỉnh sửa ảnh AI, product photography, Skyverses, image generator',
    canonical: '/product/product-image',
  });

  const [isStudioOpen, setIsStudioOpen] = useState(false);

  if (isStudioOpen) return (
    <div className="fixed inset-0 z-[500] bg-white dark:bg-[#0a0a0c] animate-in fade-in duration-500">
      <ProductImageWorkspace isOpen={isStudioOpen} onClose={() => setIsStudioOpen(false)} />
    </div>
  );

  return (
    <div className="bg-white dark:bg-[#0a0a0c] min-h-screen text-slate-900 dark:text-white font-sans overflow-x-hidden pt-16 transition-colors duration-300">
      {/* ── HERO ── */}
      <HeroSection onStartStudio={() => setIsStudioOpen(true)} />

      {/* ── LIVE STATS BAR ── */}
      <LiveStatsBar />

      {/* ── MODES ── */}
      <ModesSection />

      {/* ── WORKFLOW ── */}
      <WorkflowSection />

      {/* ── FEATURES ── */}
      <FeaturesSection />

      {/* ── USE CASES ── */}
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
          ✨ Mở AI Image Studio — Thử ngay
        </button>
      </div>
    </div>
  );
};

export default ProductImage;
