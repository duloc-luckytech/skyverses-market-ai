
import React, { useState } from 'react';
import RestorationWorkspace from '../../components/RestorationWorkspace';
import { useLanguage } from '../../context/LanguageContext';
import { usePageMeta } from '../../hooks/usePageMeta';

// ─── Modular Landing Sections ───
import { HeroSection } from '../../components/landing/image-restoration/HeroSection';
import { WorkflowSection } from '../../components/landing/image-restoration/WorkflowSection';
import { FeaturesSection } from '../../components/landing/image-restoration/FeaturesSection';
import { CTASection } from '../../components/landing/image-restoration/CTASection';

const AIImageRestoration = () => {
  const { lang } = useLanguage();
  usePageMeta({
    title: 'AI Image Restoration | Skyverses',
    description: 'Restore old, damaged, and low-resolution photos to 4K clarity with AI.',
    keywords: 'AI image restoration, photo repair, upscale',
    canonical: '/product/ai-image-restorer'
  });

  const [isStudioOpen, setIsStudioOpen] = useState(false);

  if (isStudioOpen) {
    return (
      <div className="fixed inset-0 z-[500] bg-white dark:bg-black animate-in fade-in duration-500">
        <RestorationWorkspace onClose={() => setIsStudioOpen(false)} />
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-[#020203] min-h-screen text-slate-900 dark:text-white font-sans selection:bg-emerald-500/30 overflow-x-hidden pt-20 transition-colors duration-500">
      <HeroSection onStartStudio={() => setIsStudioOpen(true)} />
      <WorkflowSection />
      <FeaturesSection />
      <CTASection onStartStudio={() => setIsStudioOpen(true)} />
    </div>
  );
};

export default AIImageRestoration;
