
import React, { useState, useEffect, useRef } from 'react';
import { Handle, Position, NodeToolbar } from '@xyflow/react';
import { Settings, Zap, ChevronLeft, ChevronRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { NodeEditorToolbar } from './NodeEditorToolbar';

export const EditorNode = ({ id, data, selected }: any) => {
  const [editingField, setEditingField] = useState<{ key: string; value: any } | null>(null);
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
    if (editingField) { 
      inputRef.current?.focus(); 
      inputRef.current?.select(); 
    }
  }, [editingField]);

  return (
    <>
      <NodeToolbar isVisible={selected} position={Position.Top} align="end" offset={12}>
        <NodeEditorToolbar />
      </NodeToolbar>

      <div className={`min-w-[360px] bg-[#1a1b23]/95 backdrop-blur-2xl border-2 rounded-none transition-all duration-300 shadow-2xl ${selected ? 'border-indigo-500 ring-8 ring-indigo-500/10 scale-[1.02]' : 'border-white/5'}`}>
        
        {/* Node Header */}
        <div className={`px-5 py-3 flex items-center justify-between border-b border-white/5 ${data.headerColor || 'bg-[#2a2b33]'}`}>
          <div className="flex items-center gap-3">
            <div className="w-1.5 h-1.5 bg-indigo-500 shadow-[0_0_8px_#6366f1] animate-pulse"></div>
            <div className="flex flex-col">
              <span className="text-[11px] font-black uppercase tracking-wider text-white italic leading-none">{data.label}</span>
            </div>
          </div>
          <span className="text-[8px] font-mono font-bold text-white/20">ID: {id}</span>
        </div>
        
        <div className="p-4 space-y-4">
          {/* External Inputs (Connections) */}
          {data.inputs && data.inputs.length > 0 && (
            <div className="space-y-2 mb-2">
               {data.inputs.map((input: any, idx: number) => (
                 <div key={idx} className="relative py-1 flex items-center">
                    <Handle 
                      type="target" 
                      position={Position.Left} 
                      id={input.name} 
                      style={{ left: -14, top: '50%', background: '#6366f1', border: '3px solid #1a1b23', width: '12px', height: '12px' }} 
                    />
                    <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest pl-2 italic">{input.name}</span>
                 </div>
               ))}
            </div>
          )}

          {/* Internal Widgets (Parameters - Pill Style based on image) */}
          {data.widgets && data.widgets.length > 0 && (
            <div className="space-y-1">
               {data.widgets.map((widget: any, idx: number) => (
                 <div 
                  key={idx} 
                  onClick={() => { setEditingField({ key: widget.label, value: widget.value }); setTempValue(String(widget.value)); }}
                  className="group flex items-center bg-[#0d0d0f] border border-white/[0.03] rounded-full px-3 py-1.5 hover:border-indigo-500/40 transition-all cursor-pointer shadow-inner"
                 >
                    {/* Left Chevron */}
                    <ChevronLeft size={10} className="text-gray-600 group-hover:text-indigo-400" />
                    
                    {/* Label and Value Container */}
                    <div className="flex-grow flex justify-between items-center px-3 overflow-hidden">
                      <span className="text-[9px] font-black uppercase text-gray-500 tracking-tighter group-hover:text-gray-300 truncate mr-4">
                        {widget.label}
                      </span>
                      <span className="text-[11px] font-mono font-bold text-gray-200 tracking-tight whitespace-nowrap">
                         {String(widget.value)}
                      </span>
                    </div>

                    {/* Right Chevron */}
                    <ChevronRight size={10} className="text-gray-600 group-hover:text-indigo-400" />
                 </div>
               ))}
            </div>
          )}

          {/* External Outputs */}
          {data.outputs && data.outputs.length > 0 && (
            <div className="space-y-2 pt-2">
               {data.outputs.map((out: string, idx: number) => (
                 <div key={idx} className="relative py-1 flex justify-end items-center">
                    <span className="text-[9px] font-black text-emerald-500 uppercase tracking-widest italic pr-2">{out}</span>
                    <Handle 
                      type="source" 
                      position={Position.Right} 
                      id={String(idx)} 
                      style={{ right: -14, top: '50%', background: '#10b981', border: '3px solid #1a1b23', width: '12px', height: '12px' }} 
                    />
                 </div>
               ))}
            </div>
          )}
        </div>

        <div className="px-5 py-2 bg-black/40 flex justify-between items-center text-[7px] font-black text-white/10 uppercase tracking-[0.4em] border-t border-white/[0.03]">
           <span>Neural Architecture Node</span>
           <Zap size={8} />
        </div>

        {/* Edit Modal for Parameters */}
        <AnimatePresence>
          {editingField && (
            <motion.div 
              initial={{ opacity: 0 }} 
              animate={{ opacity: 1 }} 
              exit={{ opacity: 0 }} 
              className="fixed inset-0 z-[500] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 pointer-events-auto" 
              onClick={() => setEditingField(null)}
            >
              <div className="bg-[#1a1b2e] rounded-none p-8 flex flex-col gap-6 shadow-3xl border border-white/10 w-full max-w-sm" onClick={e => e.stopPropagation()}>
                 <div className="flex items-center gap-4 border-b border-white/5 pb-4">
                    <Settings size={20} className="text-indigo-500"/>
                    <span className="text-white text-sm font-black uppercase tracking-widest italic">Cập nhật: {editingField.key}</span>
                 </div>
                 <input 
                   ref={inputRef} type="text" value={tempValue} 
                   onChange={e => setTempValue(e.target.value)} 
                   onKeyDown={e => e.key === 'Enter' && submitEdit()} 
                   className="w-full bg-black border border-white/10 rounded-none p-5 text-white font-bold outline-none focus:border-indigo-500 transition-all" 
                 />
                 <div className="flex gap-4">
                   <button onClick={() => setEditingField(null)} className="flex-1 py-4 text-[10px] font-black uppercase tracking-widest text-gray-500 hover:text-white transition-colors">Hủy</button>
                   <button onClick={submitEdit} className="flex-1 bg-indigo-600 text-white py-4 rounded-none text-[10px] font-black uppercase tracking-widest shadow-xl hover:bg-indigo-700 active:scale-95 transition-all">Xác nhận</button>
                 </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </>
  );
};
