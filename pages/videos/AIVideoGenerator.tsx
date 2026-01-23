
import React, { useState } from 'react';
import AIVideoGeneratorWorkspace from '../../components/AIVideoGeneratorWorkspace';
import { HeroSection } from '../../components/landing/video-generator/HeroSection';
import { WorkflowSection } from '../../components/landing/video-generator/WorkflowSection';
import { ModesSection } from '../../components/landing/video-generator/ModesSection';
import { UseCasesSection } from '../../components/landing/video-generator/UseCasesSection';
import { FinalCTA } from '../../components/landing/video-generator/FinalCTA';

const AIVideoGenerator: React.FC = () => {
  const [isStudioOpen, setIsStudioOpen] = useState(false);

  // Studio Mode Overlay
  if (isStudioOpen) {
    return (
      <div className="fixed inset-0 z-[500] bg-white dark:bg-black">
        <AIVideoGeneratorWorkspace onClose={() => setIsStudioOpen(false)} />
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-[#050507] min-h-screen text-slate-900 dark:text-white font-sans selection:bg-indigo-500/30 overflow-x-hidden pt-20 transition-colors duration-500">
      <HeroSection onStartStudio={() => setIsStudioOpen(true)} />
      <WorkflowSection />
      <ModesSection />
      <UseCasesSection />
      <FinalCTA onStartStudio={() => setIsStudioOpen(true)} />
    </div>
  );
};

export default AIVideoGenerator;
