import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ChevronDown, ChevronUp, Home } from 'lucide-react';
import { useRealEstateAI } from '../hooks/useRealEstateAI';
import { SidebarControls } from './real-estate/SidebarControls';
import { ActionFooter } from './real-estate/ActionFooter';
import { ViewportHeader } from './real-estate/ViewportHeader';
import { ViewportContent } from './real-estate/ViewportContent';
import { MobileGeneratorBar } from './common/MobileGeneratorBar';

const RealEstateWorkspace: React.FC<{ onClose: () => void }> = ({ onClose }) => {
  const s = useRealEstateAI();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isMobileExpanded, setIsMobileExpanded] = useState(false);

  const ACTION_COST = 150;
  const hasEnoughCredits = s.credits >= ACTION_COST;

  const handleGenerateClick = () => {
    if (window.innerWidth < 1024) {
      setIsMobileExpanded(false);
    }
    s.handleGenerate();
  };

  return (
    <div className="h-full w-full flex bg-[#fcfcfd] dark:bg-[#0c0c0e] text-slate-900 dark:text-white font-sans overflow-hidden transition-colors duration-500 relative">
      
      <div className="flex-grow flex flex-col-reverse lg:flex-row overflow-hidden relative">
        
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
          {/* MOBILE BAR - Simplified interface when collapsed */}
          <MobileGeneratorBar 
            isExpanded={isMobileExpanded}
            setIsExpanded={setIsMobileExpanded}
            prompt={s.extraPrompt}
            setPrompt={s.setExtraPrompt}
            credits={s.credits}
            totalCost={ACTION_COST}
            isGenerating={s.isGenerating}
            isGenerateDisabled={s.isGenerating || !s.sourceImage || !hasEnoughCredits}
            onGenerate={handleGenerateClick}
            onOpenLibrary={() => fileInputRef.current?.click()}
            generateLabel="TỔNG HỢP"
            type="image"
          />

          {/* Sidebar Full Content */}
          <div className={`flex-grow overflow-y-auto no-scrollbar ${!isMobileExpanded ? 'hidden lg:block' : 'block'}`}>
            <SidebarControls s={s} fileInputRef={fileInputRef} />
          </div>

          <div className={`${!isMobileExpanded ? 'hidden lg:block' : 'block'}`}>
            <ActionFooter 
              credits={s.credits}
              cost={ACTION_COST}
              isGenerating={s.isGenerating}
              hasSource={!!s.sourceImage}
              hasEnoughCredits={hasEnoughCredits}
              onGenerate={handleGenerateClick}
            />
          </div>
        </aside>

        {/* VIEWPORT HIỂN THỊ (PHẢI TRÊN DESKTOP, TRÊN CÙNG TRÊN MOBILE) */}
        <main className="flex-grow flex flex-col relative bg-[#f8f9fa] dark:bg-[#020202] transition-colors duration-500 overflow-hidden h-full">
           <ViewportHeader onClose={onClose} />
           <ViewportContent resultImage={s.resultImage} isGenerating={s.isGenerating} />
        </main>
      </div>

      <style>{`
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>
    </div>
  );
};

export default RealEstateWorkspace;