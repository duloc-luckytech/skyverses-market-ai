
import React from 'react';
import { motion } from 'framer-motion';
import { Play, Heart, CheckCircle2, Wand2, LayoutGrid } from 'lucide-react';
import { WorkflowTemplate } from '../../hooks/useAetherFlow';

interface TemplateCardProps {
  tmpl: WorkflowTemplate;
  isActive: boolean;
  onSelect: (tmpl: WorkflowTemplate) => void;
  onOpenVisualEditor: (tmpl: WorkflowTemplate) => void;
  onOpenVisualEditorV2: (tmpl: WorkflowTemplate) => void;
}

export const TemplateCard: React.FC<TemplateCardProps> = ({ 
  tmpl, 
  isActive, 
  onSelect, 
  onOpenVisualEditorV2
}) => {
  const coverImg = tmpl.covers?.[0]?.thumbnailUri || tmpl.covers?.[0]?.url || 'https://images.unsplash.com/photo-1639322537228-f710d846310a?auto=format&fit=crop&q=80&w=1600';

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className={`relative aspect-square rounded-none border transition-all duration-300 flex flex-col group overflow-hidden ${
        isActive 
          ? 'border-indigo-600 dark:border-indigo-500 ring-1 ring-indigo-600 dark:ring-indigo-500' 
          : 'border-black/5 dark:border-white/[0.05] hover:border-indigo-600/50 dark:hover:border-indigo-500/50'
      }`}
    >
      {/* Background Image Layer - FULL OPACITY & CLEAR */}
      <img 
        src={coverImg} 
        className={`absolute inset-0 w-full h-full object-cover transition-all duration-1000 ${
          isActive ? 'grayscale-0 opacity-100' : 'grayscale-0 opacity-100 group-hover:scale-105'
        }`} 
        alt={tmpl.name} 
      />

      {/* NO FULL SCREEN OVERLAY HERE - REMOVED AS PER REQUEST */}

      {/* Info Container - Using a gradient at bottom only to protect text legibility */}
      <div className="relative z-20 h-full flex flex-col justify-end p-6 bg-gradient-to-t from-black/80 via-black/20 to-transparent">
        <div className="space-y-4">
          {/* Author Info */}
          <div className="flex items-center gap-2">
             <span className="px-2 py-0.5 bg-black/60 backdrop-blur-md text-[8px] font-black text-indigo-400 dark:text-indigo-400 uppercase tracking-[0.3em] italic border border-white/10">
               TÁC GIẢ: {tmpl.owner.name.toUpperCase()}
             </span>
          </div>

          {/* Title & Description */}
          <div className="space-y-1">
            <h4 className="text-lg font-black uppercase italic tracking-tighter text-white leading-tight drop-shadow-md">
              {tmpl.name}
            </h4>
            <p className="text-[9px] text-zinc-300 font-bold uppercase tracking-widest line-clamp-1 italic drop-shadow-sm">
              {tmpl.desc || 'HỆ THỐNG HOẠT ĐỘNG BÌNH THƯỜNG'}
            </p>
          </div>

          {/* Action Buttons - SQUARE & FLAT */}
          <div className="flex gap-1 pt-2 opacity-0 group-hover:opacity-100 transition-all transform translate-y-2 group-hover:translate-y-0">
            <button 
              onClick={() => onSelect(tmpl)}
              className={`flex-grow py-3 text-[10px] font-black uppercase tracking-widest transition-all rounded-none shadow-xl ${
                isActive 
                  ? 'bg-indigo-600 text-white' 
                  : 'bg-white text-black hover:bg-indigo-600 hover:text-white'
              }`}
            >
              SỬ DỤNG MẪU
            </button>
            <button 
              onClick={() => onOpenVisualEditorV2(tmpl)}
              className="px-4 py-3 bg-zinc-900/90 backdrop-blur-md text-white border border-white/10 rounded-none hover:bg-indigo-600 transition-all shadow-xl"
              title="Mở sơ đồ node"
            >
              <LayoutGrid size={14} />
            </button>
          </div>
        </div>
      </div>

      {/* Status Indicators */}
      <div className="absolute top-4 left-4 flex gap-2">
         {isActive && (
            <div className="w-2 h-2 bg-indigo-500 shadow-[0_0_10px_rgba(99,102,241,0.8)]"></div>
         )}
         <div className="flex items-center gap-1.5 px-2 py-0.5 bg-black/60 backdrop-blur-md text-[7px] font-black text-white uppercase tracking-widest border border-white/10">
            {tmpl.statistics.useCount} LƯỢT DÙNG
         </div>
      </div>
    </motion.div>
  );
};
