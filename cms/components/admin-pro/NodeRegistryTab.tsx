import React from 'react';
import { motion } from 'framer-motion';
import { 
  CloudUpload, Check, Eye, EyeOff, Edit3, Trash2, Zap, Monitor, 
  Video, Braces, Terminal, Hash, LayoutGrid, Star, Globe, ShieldCheck
} from 'lucide-react';
import { Solution } from '../../types';

interface NodeRegistryTabProps {
  solutions: Array<Solution>;
  isSyncedOnCloud: (slug: string) => boolean;
  onEdit: (sol: Solution) => void;
  onDelete: (sol: Solution) => void;
  onToggleActive: (sol: Solution) => void;
  onUpdateHomeBlocks: (sol: Solution, newBlocks: string[]) => void;
  activeTab: 'CLOUD' | 'LOCAL';
  viewMode?: 'CARD' | 'LIST';
}

export const NodeRegistryTab: React.FC<NodeRegistryTabProps> = ({ 
  solutions, isSyncedOnCloud, onEdit, onDelete, onToggleActive, activeTab, viewMode = 'LIST' 
}) => {
  const getDemoIcon = (type: string) => {
    switch (type) {
      case 'video': return <Video size={14} />;
      case 'image': return <Monitor size={14} />;
      case 'automation': return <Braces size={14} />;
      default: return <Terminal size={14} />;
    }
  };

  if (viewMode === 'CARD') {
    return (
      <div className="p-8 lg:p-12 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {solutions.map((sol, idx) => {
          const asynced = isSyncedOnCloud(sol.slug);
          return (
            <motion.div
              key={sol._id || sol.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.05 }}
              className={`group relative flex flex-col bg-white dark:bg-[#0d0d0f] border rounded-[2.5rem] overflow-hidden shadow-sm hover:shadow-2xl transition-all duration-500 ${
                !sol.isActive ? 'opacity-60 grayscale' : 'border-black/5 dark:border-white/5 hover:border-brand-blue/30'
              }`}
            >
              <div className="relative aspect-[16/10] overflow-hidden bg-black">
                <img src={sol.imageUrl} className="w-full h-full object-cover grayscale group-hover:grayscale-0 group-hover:scale-105 transition-all duration-1000" alt="" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-60"></div>
                
                <div className="absolute top-4 left-4 flex flex-col gap-2">
                   <div className="flex items-center gap-2 px-3 py-1 bg-black/60 backdrop-blur-md border border-white/10 rounded-full text-[8px] font-black text-white uppercase tracking-widest">
                      {getDemoIcon(sol.demoType)} <span className="ml-1">{sol.demoType}</span>
                   </div>
                   {sol.featured && (
                      <div className="flex items-center gap-2 px-3 py-1 bg-orange-500/80 backdrop-blur-md text-white text-[8px] font-black uppercase rounded-full shadow-lg">
                        <Star size={10} fill="currentColor" /> Featured
                      </div>
                   )}
                </div>

                <div className="absolute top-4 right-4">
                  <button 
                    onClick={(e) => { e.stopPropagation(); onToggleActive(sol); }}
                    className={`p-2 rounded-full backdrop-blur-md border transition-all ${sol.isActive ? 'bg-emerald-500/20 border-emerald-500/40 text-emerald-500 hover:bg-emerald-500 hover:text-white' : 'bg-slate-500/20 border-slate-500/40 text-white hover:bg-white hover:text-black'}`}
                  >
                    {sol.isActive ? <Eye size={14}/> : <EyeOff size={14}/>}
                  </button>
                </div>

                <div className="absolute bottom-4 left-4 right-4 flex justify-between items-end">
                   <div className="space-y-1">
                      <p className="text-[10px] font-black text-brand-blue uppercase tracking-widest leading-none">{sol.category.en}</p>
                      <h4 className="text-xl font-black uppercase italic tracking-tighter text-white leading-none truncate pr-10">{sol.name.en}</h4>
                   </div>
                   {asynced ? (
                      <div className="flex items-center gap-1.5 text-emerald-500" title="Synced with Cloud Registry">
                         <ShieldCheck size={14} />
                      </div>
                   ) : (
                      <div className="flex items-center gap-1.5 text-orange-500" title="Local Only">
                         <Globe size={14} />
                      </div>
                   )}
                </div>
              </div>

              <div className="p-6 space-y-6">
                <div className="space-y-2">
                   <p className="text-[9px] font-mono text-gray-500 dark:text-gray-600 uppercase tracking-widest">ID: {sol.id}</p>
                   <p className="text-[11px] text-slate-500 dark:text-gray-400 font-medium italic line-clamp-2">"{sol.description.en}"</p>
                </div>

                <div className="flex flex-wrap gap-1.5">
                   {sol.homeBlocks?.map(block => (
                      <span key={block} className="px-2 py-0.5 bg-indigo-500/10 text-indigo-500 rounded text-[7px] font-black uppercase tracking-tighter italic border border-indigo-500/20">
                         {block}
                      </span>
                   ))}
                </div>

                <div className="pt-4 border-t border-black/5 dark:border-white/5 flex justify-between items-center">
                   <div className="flex items-center gap-1.5 text-orange-500">
                      <Zap size={12} fill="currentColor" />
                      <span className="text-[12px] font-black italic">{sol.priceCredits} CR</span>
                   </div>
                   <div className="flex gap-2">
                      <button 
                        onClick={() => onEdit(sol)}
                        className="p-2.5 bg-slate-100 dark:bg-white/5 hover:bg-brand-blue hover:text-white rounded-xl transition-all shadow-sm"
                      >
                         <Edit3 size={14} />
                      </button>
                      <button 
                        onClick={() => onDelete(sol)}
                        className="p-2.5 bg-red-50 dark:bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-white rounded-xl transition-all shadow-sm"
                      >
                         <Trash2 size={14} />
                      </button>
                   </div>
                </div>
              </div>
            </motion.div>
          )
        })}
      </div>
    );
  }

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="p-0 overflow-x-auto no-scrollbar">
      <table className="w-full text-left border-collapse font-mono">
        <thead>
          <tr className="bg-black/5 dark:bg-white/5 text-[9px] font-black uppercase tracking-widest text-gray-500">
            <th className="px-8 py-6">Định danh Node (Slug)</th>
            <th className="px-8 py-6">Trạng thái Registry</th>
            {activeTab === 'CLOUD' && <th className="px-8 py-6 text-center">Hiển thị</th>}
            <th className="px-8 py-6">Vị trí Trang chủ (Home Keys)</th>
            <th className="px-8 py-6">Kinh tế & Protocol</th>
            <th className="px-8 py-6">Metadata (EN)</th>
            <th className="px-8 py-6 text-right">Thao tác</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-black/5 dark:divide-white/5">
          {solutions.map((sol) => {
            const asynced = isSyncedOnCloud(sol.slug);
            const targetId = sol._id || sol.id;
            return (
            <tr key={targetId} className="group hover:bg-brand-blue/[0.02] transition-colors">
              <td className="px-8 py-6">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded bg-black flex items-center justify-center overflow-hidden border border-white/10 shadow-lg relative">
                    <img src={sol.imageUrl} className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-700" alt="" />
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                  </div>
                  <div className="space-y-1">
                    <p className="text-[11px] font-black text-black dark:text-white uppercase tracking-tight">{sol.slug}</p>
                    <p className="text-[8px] font-bold text-gray-400 uppercase tracking-widest">UID: {sol.id}</p>
                  </div>
                </div>
              </td>
              <td className="px-8 py-6">
                {asynced ? (
                  <div className="flex items-center gap-2 text-emerald-500">
                    <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-[0_0_8px_#10b981]"></div>
                    <span className="text-[9px] font-black uppercase tracking-widest">Asynced</span>
                    <Check size={12} strokeWidth={4} />
                  </div>
                ) : (
                  <div className="flex items-center gap-3 text-orange-500">
                    <span className="text-[9px] font-black uppercase tracking-widest opacity-60 italic">Local_Only</span>
                    <button onClick={() => onEdit(sol)} className="p-1.5 bg-brand-blue/10 text-brand-blue rounded-md hover:bg-brand-blue hover:text-white transition-all shadow-sm"><CloudUpload size={14} /></button>
                  </div>
                )}
              </td>
              {activeTab === 'CLOUD' && (
                <td className="px-8 py-6 text-center">
                  <button onClick={() => onToggleActive(sol)} className={`flex items-center gap-3 px-4 py-2 rounded-full text-[9px] font-black uppercase tracking-widest border mx-auto transition-all ${sol.isActive ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20 hover:bg-emerald-500 hover:text-white' : 'bg-slate-500/10 text-slate-500 border-slate-500/20 hover:bg-slate-500 hover:text-white'}`}>
                    {sol.isActive ? <Eye size={12}/> : <EyeOff size={12}/>}
                    {sol.isActive ? 'Active' : 'Hidden'}
                  </button>
                </td>
              )}
              {/* RENDER LIST OF HOME BLOCK KEYS AS MONO BADGES */}
              <td className="px-8 py-6">
                <div className="flex flex-wrap gap-1.5 max-w-[220px]">
                   {sol.homeBlocks && sol.homeBlocks.length > 0 ? (
                     sol.homeBlocks.map((blockKey) => (
                       <div
                         key={blockKey}
                         className="px-2 py-0.5 bg-indigo-500/5 dark:bg-white/5 border border-indigo-500/10 dark:border-white/10 rounded text-[8px] font-black text-indigo-600 dark:text-indigo-400 uppercase tracking-tighter italic"
                       >
                         {blockKey}
                       </div>
                     ))
                   ) : (
                     <span className="text-[8px] font-bold text-gray-300 dark:text-gray-800 uppercase italic">Unassigned</span>
                   )}
                </div>
              </td>
              <td className="px-8 py-6">
                 <div className="flex flex-col gap-2">
                    <div className="flex items-center gap-3">
                       {sol.isFree ? (
                          <span className="text-[9px] font-black text-emerald-500 uppercase tracking-widest bg-emerald-500/5 px-2 py-0.5 rounded border border-emerald-500/20">Free</span>
                       ) : (
                          <div className="flex items-center gap-1 text-orange-500">
                             <Zap size={10} fill="currentColor" />
                             <span className="text-[10px] font-black italic">{sol.priceCredits} CR</span>
                          </div>
                       )}
                       <div className="h-3 w-px bg-black/5 dark:bg-white/5"></div>
                       <div className="flex items-center gap-1.5 text-slate-700 dark:text-gray-300">
                          {getDemoIcon(sol.demoType)}
                          <span className="text-[9px] font-black uppercase">{sol.demoType}</span>
                       </div>
                    </div>
                    <div className="flex flex-wrap gap-1">
                       {sol.models?.slice(0, 2).map(m => (
                          <span key={m} className="px-1.5 py-0.5 bg-black/5 dark:bg-white/5 rounded text-[7px] font-bold text-gray-500 uppercase">{m}</span>
                       ))}
                    </div>
                 </div>
              </td>
              <td className="px-8 py-6">
                 <div className="space-y-1 max-w-xs">
                    <p className="text-[11px] font-black text-black dark:text-white uppercase truncate italic">{sol.name.en}</p>
                    <div className="flex items-center gap-2">
                       <span className={`text-[8px] font-black uppercase px-1.5 rounded-sm ${sol.complexity === 'Enterprise' ? 'bg-purple-500 text-white' : sol.complexity === 'Advanced' ? 'bg-blue-500 text-white' : 'bg-slate-200 dark:bg-gray-800 text-gray-600'}`}>{sol.complexity}</span>
                       <span className="text-[9px] font-medium text-gray-400 uppercase tracking-widest">{sol.category.en}</span>
                    </div>
                 </div>
              </td>
              <td className="px-8 py-6 text-right">
                <div className="flex items-center justify-end gap-3">
                  <button onClick={() => onEdit(sol)} className="p-3 bg-slate-100 dark:bg-white/5 hover:bg-brand-blue hover:text-white rounded-lg transition-all shadow-sm"><Edit3 size={14} /></button>
                  {activeTab === 'CLOUD' && (
                    <button onClick={() => onDelete(sol)} className="p-3 bg-rose-500/10 text-rose-500 hover:bg-rose-500 hover:text-white rounded-lg transition-all shadow-sm"><Trash2 size={14} /></button>
                  )}
                </div>
              </td>
            </tr>
          )})}
        </tbody>
      </table>
    </motion.div>
  );
};
