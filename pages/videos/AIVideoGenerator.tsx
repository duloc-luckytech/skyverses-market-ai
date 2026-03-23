
import React, { useState } from 'react';
import AIVideoGeneratorWorkspace from '../../components/AIVideoGeneratorWorkspace';
import { HeroSection } from '../../components/landing/video-generator/HeroSection';
import { WorkflowSection } from '../../components/landing/video-generator/WorkflowSection';
import { ModesSection } from '../../components/landing/video-generator/ModesSection';
import { UseCasesSection } from '../../components/landing/video-generator/UseCasesSection';
import { FinalCTA } from '../../components/landing/video-generator/FinalCTA';

import { usePageMeta } from '../../hooks/usePageMeta';

const AIVideoGenerator: React.FC = () => {
  usePageMeta({
    title: 'AI Video Generator | Skyverses',
    description: 'Generate cinematic videos from text or images. VEO3, WAN, Gommo engines.',
    keywords: 'AI video generator, text to video, Skyverses',
    canonical: '/product/ai-video-generator'
  });

  const [isStudioOpen, setIsStudioOpen] = useState(false);

  // Studio Mode Overlay
  if (isStudioOpen) {
    return (
      <div className="fixed inset-0 z-[500] bg-white dark:bg-[#0a0a0c]">
        <AIVideoGeneratorWorkspace onClose={() => setIsStudioOpen(false)} />
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-[#0a0a0c] min-h-screen text-slate-900 dark:text-white font-sans selection:bg-indigo-500/30 overflow-x-hidden pt-16 transition-colors duration-300">
      <HeroSection onStartStudio={() => setIsStudioOpen(true)} />
      <WorkflowSection />
      <ModesSection />
      <UseCasesSection />
      <FinalCTA onStartStudio={() => setIsStudioOpen(true)} />
    </div>
  );
};

export default AIVideoGenerator;
