import React, { useState, useRef } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { useRealEstateAI } from '../hooks/useRealEstateAI';
import { useImageGenerator } from '../hooks/useImageGenerator';
import { SidebarControls } from './real-estate/SidebarControls';
import { ActionFooter } from './real-estate/ActionFooter';
import { ViewportHeader } from './real-estate/ViewportHeader';
import { ViewportContent } from './real-estate/ViewportContent';
import { MobileGeneratorBar } from './common/MobileGeneratorBar';
import { ModelEngineSettings } from './image-generator/ModelEngineSettings';
import ResourceAuthModal from './common/ResourceAuthModal';
import { useAuth } from '../context/AuthContext';

const RealEstateWorkspace: React.FC<{ onClose: () => void }> = ({ onClose }) => {
  const s = useRealEstateAI();
  const gen = useImageGenerator();
  const { credits } = useAuth();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isMobileExpanded, setIsMobileExpanded] = useState(false);

  const handleGenerateClick = () => {
    if (window.innerWidth < 1024) {
      setIsMobileExpanded(false);
    }
    // Build prompt từ form state BĐS
    const builtPrompt = `Real Estate AI: ${s.mode} for a ${s.roomType}. Style: ${s.style}. Additional requirements: ${s.extraPrompt || 'none'}. Maintains spatial structure of the original image. High-end architectural visualization, 8k resolution.`;
    gen.setPrompt(builtPrompt);
    if (s.sourceImage) {
      gen.setReferences([{ url: s.sourceImage }]);
    }
    gen.handleGenerate();
  };

  const isGenerateDisabled = gen.isGenerating || !s.sourceImage || !!gen.generateTooltip;

  return (
    <div className="h-full w-full flex bg-[#fcfcfd] dark:bg-[#0c0c0e] text-slate-900 dark:text-white font-sans overflow-hidden transition-colors duration-500 relative">

      <div className="flex-grow flex flex-col-reverse lg:flex-row overflow-hidden relative h-full">

        {/* Mobile Backdrop */}
        <AnimatePresence>
          {isMobileExpanded && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsMobileExpanded(false)}
              className="lg:hidden fixed inset-0 bg-black/60 z-[140] backdrop-blur-sm"
            />
          )}
        </AnimatePresence>

        {/* SIDEBAR: Bottom sheet on mobile, left sidebar on desktop */}
        <aside
          className={`fixed lg:relative bottom-0 lg:top-0 left-0 w-full lg:w-[380px] shrink-0 bg-white dark:bg-[#0d0e12] border-t lg:border-t-0 lg:border-r border-slate-200 dark:border-white/5 flex flex-col z-[150] lg:z-50 shadow-[0_-10px_40px_rgba(0,0,0,0.1)] lg:shadow-none transition-all duration-500 ease-in-out ${isMobileExpanded ? 'h-[92dvh] rounded-t-[2.5rem]' : 'h-32 lg:h-full lg:rounded-none'}`}
        >
          {/* MOBILE BAR */}
          <MobileGeneratorBar
            isExpanded={isMobileExpanded}
            setIsExpanded={setIsMobileExpanded}
            prompt={s.extraPrompt}
            setPrompt={s.setExtraPrompt}
            credits={credits}
            totalCost={gen.totalCost}
            isGenerating={gen.isGenerating}
            isGenerateDisabled={isGenerateDisabled}
            onGenerate={handleGenerateClick}
            onOpenLibrary={() => fileInputRef.current?.click()}
            generateLabel="TỔNG HỢP"
            type="image"
          />

          {/* Sidebar Full Content */}
          <div className={`flex-grow overflow-y-auto no-scrollbar ${!isMobileExpanded ? 'hidden lg:block' : 'block'}`}>
            <SidebarControls s={s} fileInputRef={fileInputRef} />

            {/* AI Model Settings */}
            <div className="px-8 pb-6">
              <ModelEngineSettings
                availableModels={gen.availableModels}
                selectedModel={gen.selectedModel}
                setSelectedModel={gen.setSelectedModel}
                selectedRatio={gen.selectedRatio}
                setSelectedRatio={gen.setSelectedRatio}
                selectedRes={gen.selectedRes}
                setSelectedRes={gen.setSelectedRes}
                quantity={gen.quantity}
                setQuantity={gen.setQuantity}
                selectedMode={gen.selectedMode}
                setSelectedMode={gen.setSelectedMode}
                selectedEngine={gen.selectedEngine}
                onSelectEngine={gen.setSelectedEngine}
                activeMode="SINGLE"
                isGenerating={gen.isGenerating}
                familyList={[]}
                selectedFamily=""
                setSelectedFamily={() => {}}
                familyModels={gen.availableModels.map((m: any) => m.raw || m)}
                familyModes={[]}
                familyRatios={[]}
                familyResolutions={[]}
              />
            </div>
          </div>

          <div className={`${!isMobileExpanded ? 'hidden lg:block' : 'block'}`}>
            <ActionFooter
              credits={credits}
              cost={gen.totalCost}
              isGenerating={gen.isGenerating}
              hasSource={!!s.sourceImage}
              hasEnoughCredits={credits >= gen.totalCost}
              onGenerate={handleGenerateClick}
            />
          </div>
        </aside>

        {/* VIEWPORT */}
        <main className="flex-grow flex flex-col relative bg-[#f8f9fa] dark:bg-[#020202] transition-colors duration-500 overflow-hidden h-full">
           <ViewportHeader onClose={onClose} />
           <ViewportContent results={gen.results} isGenerating={gen.isGenerating} />
        </main>
      </div>

      {/* ResourceAuthModal */}
      <ResourceAuthModal
        isOpen={gen.showResourceModal}
        onClose={() => gen.setShowResourceModal(false)}
        onConfirm={(pref: 'credits' | 'key') => {
          gen.setUsagePreference(pref);
          localStorage.setItem('skyverses_usage_preference', pref);
          gen.setShowResourceModal(false);
          if (gen.isResumingGenerate) {
            gen.setIsResumingGenerate(false);
            gen.handleGenerate();
          }
        }}
        hasPersonalKey={gen.hasPersonalKey}
        totalCost={gen.totalCost}
      />

      <style>{`
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>
    </div>
  );
};

export default RealEstateWorkspace;
