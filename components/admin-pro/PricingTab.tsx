
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Zap, Edit3, ChevronDown, Monitor, Clock, Loader2, Trash2 } from 'lucide-react';
import { PricingModel } from '../../apis/pricing';

interface PricingTabProps {
  pricingModels: PricingModel[];
  expandedIds: string[];
  toggleExpand: (id: string) => void;
  onEdit: (model: PricingModel) => void;
  onDelete: (id: string) => void;
  onUpdateCell: (modelId: string, res: string, dur: string, val: number) => Promise<any>;
}

export const PricingTab: React.FC<PricingTabProps> = ({ 
  pricingModels, expandedIds, toggleExpand, onEdit, onDelete, onUpdateCell 
}) => {
  return (
    <div className="overflow-x-auto no-scrollbar">
      <table className="w-full text-left border-collapse font-mono">
        <thead>
          <tr className="bg-black/5 dark:bg-white/5 text-[9px] font-black uppercase tracking-widest text-gray-500">
            <th className="px-8 py-6">Định danh Model</th>
            <th className="px-8 py-6">Công cụ</th>
            <th className="px-8 py-6">Cơ sở hạ tầng</th>
            <th className="px-8 py-6 text-center">Trạng thái</th>
            <th className="px-8 py-6 text-right">Thao tác</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-black/5 dark:divide-white/5">
          {pricingModels.map((model) => (
            <React.Fragment key={model._id}>
              <tr className="group hover:bg-black/[0.01] dark:hover:bg-white/[0.01] transition-colors">
                <td className="px-8 py-6">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-brand-blue/10 flex items-center justify-center text-brand-blue rounded-lg shadow-inner"><Zap size={18} fill="currentColor" /></div>
                    <div className="space-y-1">
                      <p className="text-[11px] font-black text-black dark:text-white uppercase italic">{model.name}</p>
                      <p className="text-[8px] font-bold text-gray-400 uppercase tracking-widest truncate max-w-xs">{model.modelKey}</p>
                    </div>
                  </div>
                </td>
                <td className="px-8 py-6">
                  <span className="px-2 py-0.5 bg-black/5 dark:bg-white/5 rounded text-[7px] font-black text-gray-500 uppercase tracking-widest border border-black/5 dark:border-white/10">{model.tool}</span>
                </td>
                <td className="px-8 py-6">
                  <div className="flex flex-col gap-1">
                    <span className="text-[10px] font-black text-brand-blue uppercase italic">{model.engine}</span>
                    <span className="text-[8px] text-gray-500 font-bold uppercase tracking-widest">v{model.version}</span>
                  </div>
                </td>
                <td className="px-8 py-6 text-center">
                  <span className={`px-2 py-1 text-[8px] font-black uppercase rounded-sm border ${model.status === 'active' ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' : 'bg-rose-500/10 text-rose-500 border-rose-500/20'}`}>{model.status}</span>
                </td>
                <td className="px-8 py-6 text-right">
                  <div className="flex items-center justify-end gap-2">
                    <button onClick={() => onEdit(model)} className="p-2.5 bg-slate-100 dark:bg-white/5 hover:bg-brand-blue hover:text-white rounded-lg transition-all shadow-sm" title="Chỉnh sửa"><Edit3 size={14} /></button>
                    <button onClick={() => onDelete(model._id)} className="p-2.5 bg-rose-50 dark:bg-rose-500/10 text-rose-400 hover:bg-rose-500 hover:text-white rounded-lg transition-all shadow-sm" title="Xoá vĩnh viễn"><Trash2 size={14} /></button>
                    <button onClick={() => toggleExpand(model._id)} className="p-2.5 rounded-lg bg-slate-100 dark:bg-white/5 text-gray-400 hover:text-brand-blue transition-all"><ChevronDown size={14} className={`transition-transform ${expandedIds.includes(model._id) ? 'rotate-180' : ''}`} /></button>
                  </div>
                </td>
              </tr>
              <AnimatePresence>
                {expandedIds.includes(model._id) && (
                  <motion.tr initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="bg-black/[0.01] dark:bg-white/[0.01]">
                    <td colSpan={5} className="px-12 py-6">
                      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4">
                        {Object.entries(model.pricing || {}).map(([res, durMap]) => (
                          <div key={res} className="p-4 bg-white dark:bg-black/20 border border-black/5 dark:border-white/5 rounded-xl shadow-sm">
                            <p className="text-[9px] font-black uppercase text-brand-blue mb-3 pb-2 border-b border-black/5 dark:border-white/5 flex items-center gap-2"><Monitor size={10}/>{res}</p>
                            <div className="space-y-2">
                              {Object.entries(durMap as any).map(([dur, cost]) => (
                                <div key={dur} className="flex justify-between items-center text-[10px]">
                                  <span className="text-gray-500 flex items-center gap-1.5"><Clock size={10}/>{dur}s</span>
                                  <EditableCell 
                                    modelId={model._id} 
                                    res={res} 
                                    dur={dur} 
                                    initialValue={cost as number} 
                                    onUpdate={onUpdateCell} 
                                  />
                                </div>
                              ))}
                            </div>
                          </div>
                        ))}
                      </div>
                    </td>
                  </motion.tr>
                )}
              </AnimatePresence>
            </React.Fragment>
          ))}
        </tbody>
      </table>
    </div>
  );
};

const EditableCell = ({ modelId, res, dur, initialValue, onUpdate }: any) => {
  const [value, setValue] = useState(initialValue !== undefined && initialValue !== null ? initialValue.toString() : '0');
  const [isSaving, setIsSaving] = useState(false);
  
  const handleBlur = async () => {
    const numValue = parseInt(value);
    if (isNaN(numValue) || numValue === initialValue) {
      setValue(initialValue?.toString() ?? '0');
      return;
    }
    setIsSaving(true);
    try {
      const resApi = await onUpdate(modelId, res, dur, numValue);
      if (resApi.success) {
        // Updated successfully
      } else {
        setValue(initialValue?.toString() ?? '0');
      }
    } catch (e) {
      setValue(initialValue?.toString() ?? '0');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="flex items-center gap-1.5 text-orange-500 font-black relative group">
       <div className={`transition-all ${isSaving ? 'animate-pulse' : ''}`}><Zap size={10} fill="currentColor" /></div>
       <input 
         type="number" 
         value={value} 
         onChange={(e) => setValue(e.target.value)} 
         onBlur={handleBlur} 
         className="w-14 bg-transparent border-none outline-none text-right focus:bg-brand-blue/10 rounded transition-colors" 
       />
       <span className="text-[7px] uppercase opacity-50">CR</span>
       {isSaving && (
         <div className="absolute inset-0 bg-white/10 dark:bg-black/10 flex items-center justify-center rounded">
           <Loader2 size={8} className="animate-spin" />
         </div>
       )}
    </div>
  );
};
