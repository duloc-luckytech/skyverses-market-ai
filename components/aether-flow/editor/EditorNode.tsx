
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

      <div className={`min-w-[340px] bg-white/5 dark:bg-[#0d0d12]/80 backdrop-blur-2xl border-2 rounded-[2rem] overflow-hidden shadow-2xl transition-all duration-300 ${selected ? 'border-brand-blue ring-8 ring-brand-blue/5 scale-105' : 'border-white/5'}`}>
        <div className={`px-6 py-4 flex items-center justify-between border-b border-white/5 ${data.headerColor || 'bg-slate-800'}`}>
          <div className="flex items-center gap-3">
            <div className="w-2.5 h-2.5 rounded-full bg-brand-blue shadow-[0_0_12px_#0090ff] animate-pulse"></div>
            <div className="flex flex-col">
              <span className="text-[12px] font-black uppercase tracking-widest text-white italic leading-none">{data.label}</span>
              <span className="text-[7px] font-bold text-white/40 uppercase tracking-tighter mt-1">{data.classType}</span>
            </div>
          </div>
          <span className="text-[9px] font-mono font-bold text-white/20">#{id}</span>
        </div>
        
        <div className="p-7 space-y-6">
          {data.inputs && Object.entries(data.inputs).map(([key, value]: [string, any], idx: number) => {
            const isConnection = Array.isArray(value) && value.length === 2 && value[0] !== 'LINK';
            const isLinkPlaceholder = Array.isArray(value) && value[0] === 'LINK';
            
            return (
              <div key={key} className="relative">
                <div className="flex flex-col gap-2">
                  <div className="flex items-center gap-2">
                    {isConnection || isLinkPlaceholder ? <LinkIcon size={10} className="text-brand-blue" /> : (typeof value === 'number' ? <Hash size={10} className="text-brand-blue/40" /> : <Type size={10} className="text-brand-blue/40" />)}
                    <span className="text-[9px] font-black text-gray-500 uppercase tracking-widest">{key.replace(/_/g, ' ')}</span>
                  </div>
                  {!isConnection && !isLinkPlaceholder ? (
                    <div 
                      onClick={() => { setEditingField({key, value, label: key}); setTempValue(String(value)); }}
                      className="w-full bg-black/40 border border-white/5 rounded-xl px-4 py-3 text-[11px] font-bold text-gray-300 hover:border-brand-blue/40 hover:bg-black/60 transition-all cursor-pointer shadow-inner break-all"
                    >
                      {String(value)}
                    </div>
                  ) : (
                    <div className="w-full bg-brand-blue/10 border border-brand-blue/20 rounded-xl px-4 py-3 text-[10px] font-black text-brand-blue italic flex items-center gap-2">
                      <Box size={10} /> 
                      {isLinkPlaceholder ? `LINKED ID ${value[1]}` : `NODE ${value[0]}`}
                      <span className="opacity-40 ml-auto">{isLinkPlaceholder ? 'REMOTE' : `SLOT ${value[1]}`}</span>
                    </div>
                  )}
                </div>
                <Handle 
                  type="target" 
                  position={Position.Left} 
                  id={key} 
                  style={{ left: -18, top: '50%', background: '#0090ff', border: '4px solid #0d0d12', width: '14px', height: '14px' }} 
                />
                <Handle 
                  type="target" 
                  position={Position.Left} 
                  id={String(idx)} 
                  style={{ left: -18, top: '50%', background: '#0090ff', border: '4px solid #0d0d12', width: '14px', height: '14px', opacity: 0 }} 
                />
              </div>
            );
          })}

          <div className="pt-4 space-y-3">
            {data.outputs?.map((out: string, idx: number) => (
               <div key={idx} className="relative py-1 flex justify-end">
                  <span className="text-[10px] font-black text-emerald-500 uppercase tracking-widest italic pr-2">{out}</span>
                  <Handle 
                    type="source" 
                    position={Position.Right} 
                    id={String(idx)} 
                    style={{ right: -18, top: '50%', background: '#10b981', border: '4px solid #0d0d12', width: '14px', height: '14px' }} 
                  />
               </div>
            ))}
          </div>
        </div>

        <div className="px-6 py-3 bg-black/40 flex justify-between items-center text-[8px] font-black text-white/10 uppercase tracking-[0.5em] border-t border-white/5">
           <span>Skyverses Node Lattice</span>
           <Zap size={10} />
        </div>

        <AnimatePresence>
          {editingField && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[500] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 pointer-events-auto" onClick={() => setEditingField(null)}>
              <div className="bg-[#1a1b2e] rounded-[2rem] p-8 flex flex-col gap-6 shadow-3xl border border-white/10 w-full max-w-sm" onClick={e => e.stopPropagation()}>
                 <div className="flex items-center gap-4 border-b border-white/5 pb-4">
                    <Settings size={20} className="text-brand-blue"/>
                    <span className="text-white text-sm font-black uppercase tracking-widest italic">Update Parameter</span>
                 </div>
                 <input ref={inputRef} type="text" value={tempValue} onChange={e => setTempValue(e.target.value)} onKeyDown={e => e.key === 'Enter' && submitEdit()} className="w-full bg-black border border-white/10 rounded-xl p-5 text-white font-bold outline-none focus:border-brand-blue transition-all" />
                 <div className="flex gap-4">
                   <button onClick={() => setEditingField(null)} className="flex-1 py-4 text-[10px] font-black uppercase tracking-widest text-gray-500">Cancel</button>
                   <button onClick={submitEdit} className="flex-1 bg-brand-blue text-white py-4 rounded-xl text-[10px] font-black uppercase tracking-widest shadow-xl">Apply</button>
                 </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </>
  );
};
