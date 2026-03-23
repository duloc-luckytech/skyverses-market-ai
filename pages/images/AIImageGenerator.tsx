
import React, { useState } from 'react';
import AIImageGeneratorWorkspace from '../../components/AIImageGeneratorWorkspace';
import { HeroSection } from '../../components/landing/image-generator/HeroSection';
import { WorkflowSection } from '../../components/landing/image-generator/WorkflowSection';
import { ModesSection } from '../../components/landing/image-generator/ModesSection';
import { UseCasesSection } from '../../components/landing/image-generator/UseCasesSection';
import { FinalCTA } from '../../components/landing/image-generator/FinalCTA';

import { usePageMeta } from '../../hooks/usePageMeta';

const AIImageGenerator = () => {
  usePageMeta({
    title: 'AI Image Generator | Skyverses',
    description: 'Generate stunning AI images from text prompts. Multiple models, styles, and resolutions.',
    keywords: 'AI image generator, text to image, Skyverses',
    canonical: '/product/ai-image-generator'
  });

  const [isStudioOpen, setIsStudioOpen] = useState(false);

  if (isStudioOpen) {
    return (
      <div className="fixed inset-0 z-[500] bg-white dark:bg-[#0a0a0c] animate-in fade-in duration-500">
        <AIImageGeneratorWorkspace onClose={() => setIsStudioOpen(false)} />
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-[#0a0a0c] min-h-screen text-slate-900 dark:text-white font-sans overflow-x-hidden pt-16 transition-colors duration-300">
      <HeroSection onStartStudio={() => setIsStudioOpen(true)} />
      <WorkflowSection />
      <ModesSection />
      <UseCasesSection />
      <FinalCTA onStartStudio={() => setIsStudioOpen(true)} />
    </div>
  );
};

export default AIImageGenerator;
