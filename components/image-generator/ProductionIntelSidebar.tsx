
import React from 'react';
import { motion } from 'framer-motion';
// Add missing ShieldCheck import
import { 
  Tag, Info, Cpu, Activity, 
  Layers, BarChart3, Fingerprint, 
  Terminal, Share2, Download, ExternalLink, ShieldCheck
} from 'lucide-react';

const CATEGORY_TAGS = [
  'Featured', 'Poster & Ad', 'Product', 'Social Media', 
  'Card', 'Character', 'Comic', 'Logo', 
  'Sticker', 'Wallpaper', 'Home'
];

const TECHNICAL_METADATA = [
  { label: 'Neural Engine', val: 'Gemini 4.5' },
  { label: 'Node Cluster', val: 'H100_ALPHA' },
  { label: 'Uplink Sync', val: 'Verified' },
  { label: 'Encryption', val: 'AES-256' }
];

export const ProductionIntelSidebar: React.FC = () => {
  return (
    <aside className="hidden xl:flex w-[320px] shrink-0 border-l border-black/5 dark:border-white/5 bg-white dark:bg-[#0d0d0f] flex flex-col overflow-hidden z-50 transition-all duration-500 shadow-2xl">
      {/* Header */}
      <div className="h-14 border-b border-black/5 dark:border-white/5 flex items-center px-6 shrink-0 bg-slate-50 dark:bg-black/20">
        <div className="flex items-center gap-3 text-brand-blue">
          <Terminal size={16} />
          <span className="text-[10px] font-black uppercase tracking-[0.3em] italic">System_Intel_v4.2</span>
        </div>
      </div>

      <div className="flex-grow overflow-y-auto p-6 space-y-10 no-scrollbar">
        {/* Categories Section */}
        <section className="space-y-5">
           <div className="flex items-center gap-2 px-1">
              <Tag size={14} className="text-gray-400" />
              <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-400 dark:text-gray-500">Phân loại (Tags)</h4>
           </div>
           <div className="flex flex-wrap gap-2">
              {CATEGORY_TAGS.map(tag => (
                <button 
                  key={tag} 
                  className="px-3 py-1.5 bg-slate-50 dark:bg-white/[0.03] border border-slate-200 dark:border-white/5 rounded-lg text-[9px] font-black uppercase tracking-widest text-slate-500 dark:text-gray-400 hover:border-brand-blue hover:text-brand-blue transition-all"
                >
                  {tag}
                </button>
              ))}
           </div>
        </section>

        {/* Visual DNA Section */}
        <section className="space-y-5 pt-2 border-t border-black/5 dark:border-white/5">
           <div className="flex items-center gap-2 px-1">
              <Fingerprint size={14} className="text-brand-blue" />
              <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-400 dark:text-gray-500">Visual DNA</h4>
           </div>
           <div className="p-5 bg-slate-50 dark:bg-black/40 rounded-2xl border border-black/5 dark:border-white/5 space-y-4 shadow-inner">
              <div className="space-y-3">
                 <div className="flex justify-between text-[8px] font-black uppercase text-gray-400">
                    <span>Fidelity Level</span>
                    <span className="text-brand-blue">98%</span>
                 </div>
                 <div className="h-1 w-full bg-black/5 dark:bg-white/5 rounded-full overflow-hidden">
                    <motion.div initial={{ width: 0 }} animate={{ width: '98%' }} transition={{ duration: 1 }} className="h-full bg-brand-blue shadow-[0_0_10px_#0090ff]" />
                 </div>
              </div>
              <div className="space-y-3">
                 <div className="flex justify-between text-[8px] font-black uppercase text-gray-400">
                    <span>Composition Logic</span>
                    <span className="text-brand-blue">Optimal</span>
                 </div>
                 <div className="h-1 w-full bg-black/5 dark:bg-white/5 rounded-full overflow-hidden">
                    <motion.div initial={{ width: 0 }} animate={{ width: '85%' }} transition={{ duration: 1.2 }} className="h-full bg-brand-blue shadow-[0_0_10px_#0090ff]" />
                 </div>
              </div>
           </div>
        </section>

        {/* Technical Specs Section */}
        <section className="space-y-5">
           <div className="flex items-center gap-2 px-1">
              <Cpu size={14} className="text-gray-400" />
              <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-400 dark:text-gray-500">Network Specs</h4>
           </div>
           <div className="grid grid-cols-1 gap-2">
              {TECHNICAL_METADATA.map(item => (
                <div key={item.label} className="flex justify-between items-center p-3 bg-white dark:bg-white/[0.01] border border-black/5 border-slate-200 dark:border-white/5 rounded-xl hover:bg-slate-50 dark:hover:bg-white/[0.03] transition-all group">
                   <span className="text-[9px] font-bold text-gray-400 uppercase tracking-widest">{item.label}</span>
                   <span className="text-[10px] font-black text-slate-900 dark:text-white uppercase italic group-hover:text-brand-blue transition-colors">{item.val}</span>
                </div>
              ))}
           </div>
        </section>

        {/* Node Telemetry */}
        <section className="p-6 bg-brand-blue/5 border border-brand-blue/10 rounded-2xl space-y-3">
           <div className="flex items-center gap-2 text-brand-blue">
              <ShieldCheck size={14} />
              <span className="text-[9px] font-black uppercase tracking-widest">Authorized_Node</span>
           </div>
           <p className="text-[9px] text-gray-500 dark:text-gray-400 font-bold leading-relaxed uppercase italic">
             Tác vụ được thực thi trên môi trường sandbox riêng tư. Dữ liệu được bảo mật tuyệt đối.
           </p>
        </section>
      </div>

      {/* Footer Actions */}
      <div className="p-6 border-t border-black/5 dark:border-white/5 bg-slate-50/50 dark:bg-black/20 shrink-0">
         <button className="w-full py-4 border border-black/10 dark:border-white/10 text-slate-400 dark:text-gray-500 hover:text-brand-blue hover:border-brand-blue/40 transition-all rounded-xl text-[10px] font-black uppercase tracking-widest flex items-center justify-center gap-2">
            <ExternalLink size={12} /> Registry Documentation
         </button>
      </div>
    </aside>
  );
};
