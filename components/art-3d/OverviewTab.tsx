
import React from 'react';
import { motion } from 'framer-motion';
import { 
  BookOpen, Edit3, Puzzle, Layers, 
  Accessibility, Download, Check 
} from 'lucide-react';

interface OverviewTabProps {
  modelName: string;
  prompt: string;
  activeAsset: any;
  variants: any;
}

export const OverviewTab: React.FC<OverviewTabProps> = ({ modelName, prompt, activeAsset, variants }) => (
  <motion.div variants={variants} initial="initial" animate="animate" exit="exit" className="space-y-8">
    {/* Model Info Header */}
    <div className="flex items-center gap-2.5 text-white/90">
      <BookOpen size={16} className="text-white" />
      <span className="text-[12px] font-black uppercase tracking-widest">Model Info</span>
    </div>

    {/* User Context */}
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-3">
        <div className="w-9 h-9 rounded-full bg-slate-800 overflow-hidden border border-white/10 shadow-lg">
          <img src="https://i.pravatar.cc/100?u=jeje" className="w-full h-full object-cover" alt="Author" />
        </div>
        <div className="flex flex-col">
          <p className="text-[12px] font-black text-white italic tracking-tight">Jeje02_B7</p>
        </div>
      </div>
      <span className="text-[10px] text-gray-500 font-black uppercase tracking-tighter">12-19 13:19</span>
    </div>

    {/* Identity Hash Row */}
    <div className="flex items-center justify-between group py-1">
      <h3 className="text-[11px] font-mono font-bold text-gray-300 tracking-tighter truncate max-w-[200px]">
        {activeAsset.id === 'as-1' ? 'bb6487d4-b045-4908-87ae-653bf...' : activeAsset.id}
      </h3>
      <button className="text-gray-600 hover:text-white transition-colors">
        <Edit3 size={13} />
      </button>
    </div>

    {/* Action Icons Row */}
    <div className="flex gap-3">
      {[Puzzle, Layers, Accessibility, Download].map((Icon, idx) => (
        <button 
          key={idx} 
          className="w-10 h-10 rounded-full border border-white/10 flex items-center justify-center text-gray-500 hover:text-white hover:bg-white/5 transition-all shadow-md active:scale-90"
        >
          <Icon size={18} />
        </button>
      ))}
    </div>

    {/* Reference Architecture Section */}
    <div className="space-y-3 pt-2">
      <h4 className="text-[11px] font-black uppercase tracking-[0.2em] text-gray-500 italic">Reference</h4>
      <div className="aspect-[3/4] rounded-2xl overflow-hidden border border-white/5 bg-[#0a0a0c] shadow-3xl group">
        <img 
          src={activeAsset.thumb} 
          className="w-full h-full object-cover grayscale opacity-60 group-hover:grayscale-0 group-hover:opacity-100 transition-all duration-1000" 
          alt="Reference" 
        />
      </div>
    </div>

    {/* Tags Section */}
    <div className="space-y-3">
      <h4 className="text-[11px] font-black uppercase tracking-[0.2em] text-gray-500 italic">Tags</h4>
      <div className="flex flex-wrap gap-2">
         <span className="px-3 py-1.5 bg-white/5 border border-white/5 rounded-lg text-[9px] font-black text-gray-400 uppercase tracking-widest shadow-sm">
           Featured
         </span>
      </div>
    </div>

    {/* Detail Specification List */}
    <div className="space-y-4 pt-6 border-t border-white/5">
      <div className="flex justify-between items-center text-[11px] font-bold text-gray-300">
        <span className="uppercase tracking-widest opacity-60">PBR</span>
        <Check size={16} className="text-gray-400" />
      </div>
      <div className="flex justify-between items-center text-[11px] font-bold text-gray-300">
        <span className="uppercase tracking-widest opacity-60">HD Texture</span>
        <Check size={16} className="text-gray-400" />
      </div>
      <div className="flex justify-between items-center text-[11px] font-bold text-gray-300">
        <span className="uppercase tracking-widest opacity-60">Tripo Version</span>
        <span className="text-[10px] font-mono text-gray-500 font-black tracking-tight">v3.0-20250812</span>
      </div>
    </div>
  </motion.div>
);
