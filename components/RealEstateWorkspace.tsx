
import React, { useRef } from 'react';
import { useRealEstateAI } from '../hooks/useRealEstateAI';
import { SidebarControls } from './real-estate/SidebarControls';
import { ActionFooter } from './real-estate/ActionFooter';
import { ViewportHeader } from './real-estate/ViewportHeader';
import { ViewportContent } from './real-estate/ViewportContent';

const RealEstateWorkspace: React.FC<{ onClose: () => void }> = ({ onClose }) => {
  const s = useRealEstateAI();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const ACTION_COST = 150;
  const hasEnoughCredits = s.credits >= ACTION_COST;

  return (
    <div className="h-full w-full flex bg-[#fcfcfd] dark:bg-[#0c0c0e] text-slate-900 dark:text-white font-sans overflow-hidden transition-colors duration-500">
      
      {/* SIDEBAR ĐIỀU KHIỂN (TRÁI) */}
      <aside className="w-full md:w-[380px] shrink-0 border-r border-slate-200 dark:border-white/5 bg-white dark:bg-[#0d0e12] flex flex-col relative z-20 transition-colors">
        <SidebarControls s={s} fileInputRef={fileInputRef} />
        
        <ActionFooter 
          credits={s.credits}
          cost={ACTION_COST}
          isGenerating={s.isGenerating}
          hasSource={!!s.sourceImage}
          hasEnoughCredits={hasEnoughCredits}
          onGenerate={s.handleGenerate}
        />
      </aside>

      {/* VIEWPORT HIỂN THỊ (PHẢI) */}
      <main className="flex-grow flex flex-col relative bg-[#f8f9fa] dark:bg-[#020202] transition-colors duration-500">
         <ViewportHeader onClose={onClose} />
         <ViewportContent resultImage={s.resultImage} isGenerating={s.isGenerating} />
      </main>

      <style>{`
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>
    </div>
  );
};

export default RealEstateWorkspace;
