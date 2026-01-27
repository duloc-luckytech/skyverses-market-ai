
import React, { useState, useEffect, useRef } from 'react';
import { Handle, Position, NodeToolbar } from '@xyflow/react';
import { Type, Hash, Box, Settings, Zap, Link as LinkIcon } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { NodeEditorToolbar } from './NodeEditorToolbar';

export const EditorNode = ({ id, data, selected }: any) => {
  const [editingField, setEditingField] = useState<{ key: string; value: any; label: string } | null>(null);
  const [tempValue, setTempValue] = useState<string>('');
  const inputRef = useRef<HTMLInputElement>(null);

  const submitEdit = () => {
    if (!editingField) return;
    let finalValue: any = tempValue;
    if (typeof editingField.value === 'number') finalValue = parseFloat(tempValue) || 0;
    else if (typeof editingField.value === 'boolean') finalValue = tempValue.toLowerCase() === 'true';
    if (data.onUpdate) data.onUpdate(editingField.key, finalValue);
    setEditingField(null);
  };

  useEffect(() => {
    if (editingField) { inputRef.current?.focus(); inputRef.current?.select(); }
  }, [editingField]);

  return (
    <>
      <NodeToolbar isVisible={selected} position={Position.Top} align="end" offset={12}>
        <NodeEditorToolbar />
      </NodeToolbar>

      <div className={`min-w-[340px] bg-white dark:bg-[#0d0d12]/90 backdrop-blur-2xl border-2 rounded-none transition-all duration-300 ${selected ? 'border-indigo-600 ring-8 ring-indigo-500/5 scale-105' : 'border-black/5 dark:border-white/5'}`}>
        <div className={`px-6 py-4 flex items-center justify-between border-b border-black/5 dark:border-white/5 ${data.headerColor || 'bg-slate-100 dark:bg-slate-800'}`}>
          <div className="flex items-center gap-3">
            <div className="w-2 h-2 bg-indigo-600 shadow-[0_0_8px_#6366f1] animate-pulse"></div>
            <div className="flex flex-col">
              <span className="text-[12px] font-black uppercase tracking-widest text-slate-900 dark:text-white italic leading-none">{data.label}</span>
              <span className="text-[7px] font-bold text-slate-400 dark:text-white/40 uppercase tracking-tighter mt-1">{data.classType || 'Khối cơ bản'}</span>
            </div>
          </div>
          <span className="text-[9px] font-mono font-bold text-slate-300 dark:text-white/10">ID: {id}</span>
        </div>
        
        <div className="p-7 space-y-6">
          {data.inputs && Object.entries(data.inputs).map(([key, value]: [string, any], idx: number) => {
            const isConnection = Array.isArray(value) && value.length === 2 && value[0] !== 'LINK';
            const isLinkPlaceholder = Array.isArray(value) && value[0] === 'LINK';
            
            return (
              <div key={key} className="relative">
                <div className="flex flex-col gap-2">
                  <div className="flex items-center gap-2">
                    {isConnection || isLinkPlaceholder ? <LinkIcon size={10} className="text-indigo-600" /> : (typeof value === 'number' ? <Hash size={10} className="text-slate-400" /> : <Type size={10} className="text-slate-400" />)}
                    <span className="text-[9px] font-black text-slate-400 dark:text-gray-500 uppercase tracking-widest">{key.replace(/_/g, ' ')}</span>
                  </div>
                  {!isConnection && !isLinkPlaceholder ? (
                    <div 
                      onClick={() => { setEditingField({key, value, label: key}); setTempValue(String(value)); }}
                      className="w-full bg-slate-50 dark:bg-black/40 border border-black/5 dark:border-white/5 rounded-none px-4 py-3 text-[11px] font-bold text-slate-700 dark:text-gray-300 hover:border-indigo-500/40 transition-all cursor-pointer break-all shadow-inner"
                    >
                      {String(value)}
                    </div>
                  ) : (
                    <div className="w-full bg-indigo-500/5 border border-indigo-500/20 rounded-none px-4 py-3 text-[10px] font-black text-indigo-600 dark:text-indigo-400 italic flex items-center gap-2">
                      <Box size={10} /> 
                      {isLinkPlaceholder ? `KẾT NỐI ID ${value[1]}` : `KHỐI ${value[0]}`}
                    </div>
                  )}
                </div>
                <Handle type="target" position={Position.Left} id={key} style={{ left: -18, top: '50%', background: '#6366f1', border: '4px solid #fff', width: '14px', height: '14px' }} />
              </div>
            );
          })}

          <div className="pt-4 space-y-3">
            {data.outputs?.map((out: string, idx: number) => (
               <div key={idx} className="relative py-1 flex justify-end">
                  <span className="text-[10px] font-black text-emerald-600 dark:text-emerald-500 uppercase tracking-widest italic pr-2">{out}</span>
                  <Handle type="source" position={Position.Right} id={String(idx)} style={{ right: -18, top: '50%', background: '#10b981', border: '4px solid #fff', width: '14px', height: '14px' }} />
               </div>
            ))}
          </div>
        </div>

        <div className="px-6 py-3 bg-slate-50 dark:bg-black/40 flex justify-between items-center text-[8px] font-black text-slate-400 dark:text-white/10 uppercase tracking-[0.5em] border-t border-black/5 dark:border-white/5">
           <span>Mạng lưới kịch bản AI</span>
           <Zap size={10} />
        </div>

        <AnimatePresence>
          {editingField && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[500] flex items-center justify-center bg-black/40 backdrop-blur-sm p-4 pointer-events-auto" onClick={() => setEditingField(null)}>
              <div className="bg-white dark:bg-[#1a1b2e] rounded-none p-8 flex flex-col gap-6 shadow-3xl border border-black/10 dark:border-white/10 w-full max-w-sm" onClick={e => e.stopPropagation()}>
                 <div className="flex items-center gap-4 border-b border-black/5 dark:border-white/5 pb-4">
                    <Settings size={20} className="text-indigo-600"/>
                    <span className="text-slate-900 dark:text-white text-sm font-black uppercase tracking-widest italic">Cập nhật thông số</span>
                 </div>
                 <input ref={inputRef} type="text" value={tempValue} onChange={e => setTempValue(e.target.value)} onKeyDown={e => e.key === 'Enter' && submitEdit()} className="w-full bg-slate-50 dark:bg-black border border-black/5 dark:border-white/10 rounded-none p-5 text-slate-900 dark:text-white font-bold outline-none focus:border-indigo-600 transition-all" />
                 <div className="flex gap-4">
                   <button onClick={() => setEditingField(null)} className="flex-1 py-4 text-[10px] font-black uppercase tracking-widest text-slate-400">Hủy</button>
                   <button onClick={submitEdit} className="flex-1 bg-indigo-600 text-white py-4 rounded-none text-[10px] font-black uppercase tracking-widest shadow-xl">Xác nhận</button>
                 </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </>
  );
};
