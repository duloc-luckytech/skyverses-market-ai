import React from 'react';
import { motion } from 'framer-motion';
import { Play, Heart, CheckCircle2, ChevronRight, Wand2, Eye } from 'lucide-react';
import { WorkflowTemplate } from '../../hooks/useAetherFlow';

interface TemplateCardProps {
  tmpl: WorkflowTemplate;
  isActive: boolean;
  onSelect: (tmpl: WorkflowTemplate) => void;
  onOpenVisualEditor: (tmpl: WorkflowTemplate) => void;
}

export const TemplateCard: React.FC<TemplateCardProps> = ({ 
  tmpl, 
  isActive, 
  onSelect, 
  onOpenVisualEditor 
}) => {
  const coverImg = tmpl.covers?.[0]?.thumbnailUri || tmpl.covers?.[0]?.url || 'https://images.unsplash.com/photo-1639322537228-f710d846310a?auto=format&fit=crop&q=80&w=800';

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className={`relative aspect-[16/11] rounded-[2.5rem] border transition-all duration-500 flex flex-col group overflow-hidden ${
        isActive 
          ? 'border-indigo-500 ring-4 ring-indigo-500/20 shadow-2xl' 
          : 'border-black/5 dark:border-white/10 hover:border-indigo-500/40 shadow-sm'
      }`}
    >
      {/* Background Image Layer */}
      <img 
        src={coverImg} 
        className={`absolute inset-0 w-full h-full object-cover transition-all duration-[2s] ${
          isActive ? 'scale-110 opacity-100' : 'scale-100 opacity-80 group-hover:opacity-100 group-hover:scale-110'
        }`} 
        alt={tmpl.name} 
      />

      {/* Dark Gradient Overlay for Readability */}
      <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent opacity-80 group-hover:opacity-90 transition-opacity duration-500"></div>

      {/* Main Content Area */}
      <div className="relative z-20 h-full flex flex-col justify-end p-6 md:p-8">
        
        {/* Top Floating Stats */}
        <div className="absolute top-6 right-6 flex items-center gap-3 opacity-0 group-hover:opacity-100 transition-all translate-y-2 group-hover:translate-y-0 duration-500">
           <div className="flex items-center gap-1.5 px-3 py-1 bg-black/40 backdrop-blur-md rounded-full border border-white/10 text-[9px] font-black uppercase text-white">
              <Play size={10} fill="currentColor" /> {tmpl.statistics.useCount}
           </div>
           <div className="flex items-center gap-1.5 px-3 py-1 bg-black/40 backdrop-blur-md rounded-full border border-white/10 text-[9px] font-black uppercase text-white">
              <Heart size={10} fill="currentColor" /> {tmpl.statistics.likeCount}
           </div>
        </div>

        <div className="space-y-4">
          {/* Author Info */}
          <div className="flex items-center gap-3 transition-transform duration-500 group-hover:-translate-y-2">
             <img 
               src={tmpl.owner.avatar} 
               className="w-7 h-7 rounded-full border-2 border-white/20 object-cover" 
               alt={tmpl.owner.name} 
             />
             <span className="text-[10px] font-black text-white/70 uppercase tracking-[0.2em] italic">
               {tmpl.owner.name}
             </span>
          </div>

          {/* Title & Description */}
          <div className="space-y-1 transition-transform duration-500 group-hover:-translate-y-2">
            <h4 className="text-xl md:text-2xl font-black uppercase italic tracking-tighter text-white leading-tight drop-shadow-lg">
              {tmpl.name}
            </h4>
            <p className="text-[10px] md:text-[11px] text-white/50 font-bold uppercase tracking-widest line-clamp-1 italic">
              {tmpl.desc || 'System node operational'}
            </p>
          </div>

          {/* Action Buttons - Shown only on hover */}
          <div className="flex gap-2 pt-2 opacity-0 group-hover:opacity-100 translate-y-4 group-hover:translate-y-0 transition-all duration-500 ease-out">
            <button 
              onClick={() => onSelect(tmpl)}
              className={`flex-grow py-3.5 rounded-xl text-[10px] font-black uppercase tracking-[0.3em] transition-all flex items-center justify-center gap-3 shadow-xl active:scale-95 ${
                isActive 
                  ? 'bg-indigo-500 text-white shadow-indigo-500/30' 
                  : 'bg-white text-black hover:bg-indigo-500 hover:text-white'
              }`}
            >
              <Wand2 size={14} /> Use template
            </button>
            <button 
              onClick={() => onOpenVisualEditor(tmpl)}
              className="px-5 py-3.5 bg-black/40 backdrop-blur-md border border-white/10 text-white rounded-xl hover:bg-white hover:text-black text-[10px] font-black uppercase tracking-widest transition-all shadow-xl flex items-center justify-center gap-2 active:scale-95"
              title="View Workflow Graph"
            >
              <Eye size={14} />
              <span className="hidden sm:inline">Workflow</span>
            </button>
          </div>
        </div>
      </div>

      {/* Active Indicator Badge */}
      {isActive && (
        <div className="absolute top-6 left-6 w-8 h-8 rounded-full bg-indigo-500 text-white shadow-lg flex items-center justify-center transition-all z-20">
          <CheckCircle2 size={20} />
        </div>
      )}
      
      {/* Tag Labels */}
      <div className="absolute top-4 left-1/2 -translate-x-1/2 flex flex-wrap gap-1.5 z-20 opacity-0 group-hover:opacity-100 transition-all duration-500">
         {tmpl.tags?.slice(0, 2).map((tag, i) => (
           <span key={i} className="px-2 py-0.5 bg-brand-blue text-white text-[7px] font-black uppercase rounded-sm tracking-widest shadow-lg">
             {tag.name}
           </span>
         ))}
      </div>
    </motion.div>
  );
};