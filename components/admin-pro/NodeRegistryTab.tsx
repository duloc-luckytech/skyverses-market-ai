import React from 'react';
import { motion } from 'framer-motion';
import { 
  CloudUpload, Check, Eye, EyeOff, Edit3, Trash2, Zap, Monitor, 
  Video, Braces, Terminal, Hash
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
}

export const NodeRegistryTab: React.FC<NodeRegistryTabProps> = ({ 
  solutions, isSyncedOnCloud, onEdit, onDelete, onToggleActive, activeTab 
}) => {
  const getDemoIcon = (type: string) => {
    switch (type) {
      case 'video': return <Video size={14} />;
      case 'image': return <Monitor size={14} />;
      case 'automation': return <Braces size={14} />;
      default: return <Terminal size={14} />;
    }
  };

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