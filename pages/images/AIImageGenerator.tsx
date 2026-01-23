
import React, { useState } from 'react';
import AIImageGeneratorWorkspace from '../../components/AIImageGeneratorWorkspace';
import { HeroSection } from '../../components/landing/image-generator/HeroSection';
import { WorkflowSection } from '../../components/landing/image-generator/WorkflowSection';
import { ModesSection } from '../../components/landing/image-generator/ModesSection';
import { UseCasesSection } from '../../components/landing/image-generator/UseCasesSection';
import { FinalCTA } from '../../components/landing/image-generator/FinalCTA';

const AIImageGenerator = () => {
  const [isStudioOpen, setIsStudioOpen] = useState(false);

  if (isStudioOpen) {
    return (
      <div className="fixed inset-0 z-[500] bg-white dark:bg-black animate-in fade-in duration-500">
        <AIImageGeneratorWorkspace onClose={() => setIsStudioOpen(false)} />
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-[#050507] min-h-screen text-slate-900 dark:text-white font-sans selection:bg-brand-blue/30 overflow-x-hidden pt-20 transition-colors duration-500">
      <HeroSection onStartStudio={() => setIsStudioOpen(true)} />
      <WorkflowSection />
      <ModesSection />
      <UseCasesSection />
      <FinalCTA onStartStudio={() => setIsStudioOpen(true)} />
    </div>
  );
};

export default AIImageGenerator;
