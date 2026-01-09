import React from 'react';
import { AnimatePresence } from 'framer-motion';
import { 
  Box, Puzzle, Grid3X3, GanttChartSquare, Accessibility, MoreVertical, Sparkles
} from 'lucide-react';
import { OverviewTab } from './OverviewTab';
import { SegmentationTab } from './SegmentationTab';
import { RetopologyTab } from './RetopologyTab';
import { TextureTab } from './TextureTab';
import { RiggingTab } from './RiggingTab';
import { GenerateTab } from './GenerateTab';

interface LeftSidebarProps {
  activeTab: string;
  modelName: string;
  prompt: string;
  activeAsset: any;
}

export const LeftSidebar: React.FC<LeftSidebarProps> = ({ activeTab, modelName, prompt, activeAsset }) => {
  
  const sidebarVariants = {
    initial: { opacity: 0, x: -20 },
    animate: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: -20 }
  };

  const getHeaderTitle = () => {
    switch (activeTab) {
      case 'Generate': return 'Generate Model';
      case 'Overview': return 'Overview';
      case 'Segmentation': return 'Segmentation';
      case 'Retopology': return 'Retopology';
      case 'Texture': return '3D Model Texture Generator';
      case 'Rigging': return '3D Rigging & Animation';
      default: return `${activeTab} Info`;
    }
  };

  return (
    <aside className="w-80 shrink-0 border-r border-white/5 bg-[#141519] flex flex-col overflow-hidden relative">
      {/* Dynamic Background Blur Effect */}
      <div className={`absolute -top-40 -left-40 w-80 h-80 rounded-full blur-[100px] opacity-10 pointer-events-none transition-colors duration-1000 ${
        activeTab === 'Generate' ? 'bg-yellow-600' :
        activeTab === 'Overview' ? 'bg-purple-600' :
        activeTab === 'Segmentation' ? 'bg-brand-blue' :
        activeTab === 'Retopology' ? 'bg-indigo-600' :
        activeTab === 'Texture' ? 'bg-cyan-600' :
        'bg-pink-600'
      }`}></div>

      <div className="p-6 border-b border-white/5 flex items-center justify-between shrink-0 bg-black/20 z-10">
        <div className="flex items-center gap-2">
          {activeTab === 'Generate' && <Sparkles size={16} className="text-yellow-400" />}
          {activeTab === 'Overview' && <Box size={16} className="text-purple-400" />}
          {activeTab === 'Segmentation' && <Puzzle size={16} className="text-brand-blue" />}
          {activeTab === 'Retopology' && <Grid3X3 size={16} className="text-indigo-400" />}
          {activeTab === 'Texture' && <GanttChartSquare size={16} className="text-cyan-400" />}
          {activeTab === 'Rigging' && <Accessibility size={16} className="text-pink-400" />}
          <h2 className="text-xs font-black uppercase tracking-widest text-white">{getHeaderTitle()}</h2>
        </div>
        <button className="p-2 text-gray-600 hover:text-white transition-colors"><MoreVertical size={16}/></button>
      </div>

      <div className="flex-grow overflow-y-auto no-scrollbar p-6 relative z-10">
        <AnimatePresence mode="wait">
           {activeTab === 'Generate' && (
             <GenerateTab variants={sidebarVariants} />
           )}
           {activeTab === 'Overview' && (
             <OverviewTab 
               modelName={modelName} 
               prompt={prompt} 
               activeAsset={activeAsset} 
               variants={sidebarVariants} 
             />
           )}
           {activeTab === 'Segmentation' && (
             <SegmentationTab variants={sidebarVariants} />
           )}
           {activeTab === 'Retopology' && (
             <RetopologyTab variants={sidebarVariants} />
           )}
           {activeTab === 'Texture' && (
             <TextureTab variants={sidebarVariants} />
           )}
           {activeTab === 'Rigging' && (
             <RiggingTab variants={sidebarVariants} />
           )}
        </AnimatePresence>
      </div>
    </aside>
  );
};
