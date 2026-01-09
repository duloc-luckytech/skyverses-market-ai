
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Bot, Edit3, Trash2, CheckCircle2, 
  AlertCircle, Clock, ExternalLink,
  ChevronRight, ArrowRight, Activity,
  Globe, LayoutGrid, Layers, Loader2,
  ToggleLeft, ToggleRight, Search
} from 'lucide-react';
import { AIModel } from '../../apis/ai-models';

interface AIModelsTabProps {
  loading: boolean;
  models: AIModel[];
  onEdit: (model: AIModel) => void;
  onDelete: (id: string) => void;
  onToggleStatus: (id: string, status: string) => void;
  search: string;
}

export const AIModelsTab: React.FC<AIModelsTabProps> = ({ 
  loading, models, onEdit, onDelete, onToggleStatus, search 
}) => {
  const filteredModels = models.filter(m => 
    !search || 
    m.name.toLowerCase().includes(search.toLowerCase()) || 
    m.key.toLowerCase().includes(search.toLowerCase()) ||
    m.provider?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="animate-in fade-in duration-700">
      <div className="bg-white dark:bg-[#08080a] border border-black/5 dark:border-white/5 rounded-[2rem] overflow-hidden shadow-2xl transition-all">
        <div className="overflow-x-auto no-scrollbar">
          <table className="w-full text-left border-collapse font-mono">
            <thead>
              <tr className="bg-black/5 dark:bg-white/5 text-[9px] font-black uppercase tracking-widest text-gray-500">
                <th className="px-8 py-6">Model Core</th>
                <th className="px-8 py-6">Provider / Engine</th>
                <th className="px-8 py-6">Category</th>
                <th className="px-8 py-6">Order</th>
                <th className="px-8 py-6 text-center">Status</th>
                <th className="px-8 py-6 text-right">Operations</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-black/5 dark:divide-white/5">
              {loading && models.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-40 text-center">
                    <Loader2 className="animate-spin mx-auto text-brand-blue mb-4" size={48} />
                    <p className="text-[10px] font-black uppercase tracking-[0.5em] text-gray-400 animate-pulse">Syncing_Model_Registry...</p>
                  </td>
                </tr>
              ) : filteredModels.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-40 text-center opacity-30">
                    <Bot size={64} className="mx-auto mb-6" />
                    <p className="text-xl font-black uppercase tracking-[0.2em] italic">No Models Detected</p>
                  </td>
                </tr>
              ) : (
                filteredModels.map((m) => (
                  <tr key={m._id} className="group hover:bg-brand-blue/[0.01] transition-colors">
                    <td className="px-8 py-6">
                      <div className="flex items-center gap-4">
                        <div className="w-11 h-11 rounded-xl bg-black flex items-center justify-center p-2 border border-white/10 group-hover:scale-105 transition-transform shadow-lg">
                           <img src={m.logoUrl} className="w-full h-full object-contain" alt="" />
                        </div>
                        <div className="space-y-0.5">
                          <p className="text-[11px] font-black text-black dark:text-white uppercase italic truncate max-w-[180px]">{m.name}</p>
                          <p className="text-[9px] font-medium text-gray-500 truncate max-w-[180px]">{m.key}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-8 py-6">
                       <div className="flex flex-col gap-1">
                          <span className="text-[10px] font-black text-brand-blue uppercase tracking-widest">{m.provider || 'N/A'}</span>
                          <span className="text-[8px] text-gray-400 font-bold uppercase italic">Protocol: {m.route}</span>
                       </div>
                    </td>
                    <td className="px-8 py-6">
                       <span className="px-2 py-0.5 bg-black/5 dark:bg-white/5 border border-black/5 dark:border-white/10 rounded text-[8px] font-black uppercase text-gray-500">
                          {m.category || 'Standard'}
                       </span>
                    </td>
                    <td className="px-8 py-6">
                       <span className="text-[11px] font-black text-slate-700 dark:text-gray-300">
                          {m.order}
                       </span>
                    </td>
                    <td className="px-8 py-6 text-center">
                       <button 
                         onClick={() => onToggleStatus(m._id, m.status === 'active' ? 'inactive' : 'active')}
                         className={`mx-auto flex items-center gap-2 px-3 py-1.5 rounded-full text-[8px] font-black uppercase tracking-widest transition-all ${
                           m.status === 'active' ? 'bg-emerald-500/10 text-emerald-500' : 'bg-slate-500/10 text-slate-500'
                         }`}
                       >
                         {m.status === 'active' ? <ToggleRight size={14} /> : <ToggleLeft size={14} />}
                         {m.status}
                       </button>
                    </td>
                    <td className="px-8 py-6 text-right">
                       <div className="flex items-center justify-end gap-3">
                          <button 
                            onClick={() => onEdit(m)}
                            className="p-2.5 bg-slate-50 dark:bg-white/5 text-slate-400 hover:text-brand-blue rounded-lg transition-all shadow-sm"
                          >
                             <Edit3 size={14} />
                          </button>
                          <button 
                            onClick={() => onDelete(m._id)}
                            className="p-2.5 bg-rose-50 dark:bg-rose-500/10 text-rose-400 hover:bg-rose-500 hover:text-white rounded-lg transition-all shadow-sm"
                          >
                             <Trash2 size={14} />
                          </button>
                       </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
