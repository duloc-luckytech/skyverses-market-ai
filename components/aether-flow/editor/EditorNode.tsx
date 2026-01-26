
import React, { useState, useEffect, useRef } from 'react';
import { Handle, Position, NodeToolbar } from '@xyflow/react';
import { Zap, Sliders, Type, Hash, Check, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { NodeEditorToolbar } from './NodeEditorToolbar';

export const EditorNode = ({ id, data, selected }: any) => {
  const [editingField, setEditingField] = useState<{ key: string; value: any; label: string } | null>(null);
  const [tempValue, setTempValue] = useState<string>('');
  const inputRef = useRef<HTMLInputElement>(null);

  const onInputChange = (key: string, value: any) => {
    if (data.onUpdate) {
      data.onUpdate(key, value);
    }
  };

  const handleValueClick = (key: string, value: any, label: string = 'Value') => {
    setEditingField({ key, value, label });
    setTempValue(String(value));
  };

  const submitEdit = () => {
    if (!editingField) return;
    const key = editingField.key;
    const originalType = typeof editingField.value;
    let finalValue: any = tempValue;

    if (key === 'label') {
      finalValue = tempValue;
    } else if (originalType === 'number') {
      finalValue = parseFloat(tempValue) || 0;
    } else if (originalType === 'boolean') {
      finalValue = tempValue.toLowerCase() === 'true';
    }

    onInputChange(key, finalValue);
    setEditingField(null);
  };

  useEffect(() => {
    if (editingField && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [editingField]);

  return (
    <>
      <NodeToolbar 
        isVisible={selected} 
        position={Position.Top} 
        align="end"
        offset={12}
      >
        <NodeEditorToolbar />
      </NodeToolbar>

      <div className={`min-w-[300px] bg-[#121218] border-2 rounded-2xl overflow-hidden shadow-3xl transition-all duration-300 ${selected ? 'border-brand-blue ring-4 ring-brand-blue/20' : 'border-white/10'}`}>
        {/* Node Header */}
        <div className={`px-5 py-3 flex items-center justify-between border-b border-white/5 ${data.headerColor || 'bg-slate-800'}`}>
          <div 
            className="flex items-center gap-3 cursor-pointer hover:brightness-125 transition-all"
            onClick={() => handleValueClick('label', data.label, 'Title')}
          >
            <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_8px_#10b981]"></div>
            <span className="text-[12px] font-black uppercase tracking-widest text-white/90 italic">{data.label}</span>
          </div>
          <span className="text-[10px] font-mono font-bold text-white/30">#{data.id}</span>
        </div>
        
        {/* Node Body / Inputs */}
        <div className="p-5 space-y-5">
          {data.inputs && Object.entries(data.inputs).map(([key, value]: [string, any]) => {
            const isConnection = Array.isArray(value) && value.length === 2 && typeof value[0] === 'string';
            const isBoolean = typeof value === 'boolean';
            
            return (
              <div key={key} className="relative group">
                 <div className="flex flex-col gap-1.5 mb-1">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                         {typeof value === 'number' ? <Hash size={10} className="text-gray-600" /> : <Type size={10} className="text-gray-600" />}
                         <span className="text-[9px] font-black text-gray-500 uppercase tracking-widest group-hover:text-gray-300 transition-colors">{key}</span>
                      </div>
                      {isConnection && (
                        <span className="text-[8px] font-black text-brand-blue/60 uppercase">Link: {value[0]}</span>
                      )}
                    </div>
                    
                    {!isConnection ? (
                      <div 
                        onClick={() => handleValueClick(key, value)}
                        className="w-full bg-black/40 border border-white/5 rounded-lg px-3 py-2 text-[11px] font-bold text-gray-200 hover:border-brand-blue/50 hover:bg-black/60 transition-all cursor-pointer min-h-[32px] flex items-center"
                      >
                        <span className="truncate">{isBoolean ? (value ? 'True' : 'False') : String(value)}</span>
                      </div>
                    ) : (
                      <div className="w-full bg-indigo-500/5 border border-indigo-500/20 rounded-lg px-3 py-2 text-[10px] font-black text-indigo-400/60 italic">
                        Linked to Node_{value[0]}
                      </div>
                    )}
                 </div>

                 {/* Target Handle for Inputs */}
                 {(key === 'model' || key === 'clip' || key === 'vae' || key === 'latent_image' || key === 'positive' || key === 'negative' || isConnection) && (
                    <Handle 
                      type="target" 
                      position={Position.Left} 
                      style={{ left: -14, top: '70%', background: '#0090ff', border: '2px solid #121218', width: '12px', height: '12px' }} 
                    />
                 )}
              </div>
            );
          })}

          {/* Source Handles for Outputs */}
          {data.outputs && data.outputs.map((out: string) => (
             <div key={out} className="relative py-1 flex justify-end">
                <div className="flex items-center gap-2">
                   <span className="text-[10px] font-black text-emerald-500 uppercase tracking-widest italic">{out}</span>
                   <div className="w-1.5 h-1.5 rounded-full bg-emerald-500/60"></div>
                </div>
                <Handle 
                  type="source" 
                  position={Position.Right} 
                  style={{ right: -14, top: '50%', background: '#10b981', border: '2px solid #121218', width: '12px', height: '12px' }} 
                />
             </div>
          ))}
        </div>
        
        {/* Node Footer */}
        <div className="px-5 py-2.5 bg-black/40 flex justify-between items-center text-[8px] font-black text-white/20 uppercase tracking-[0.3em]">
           <div className="flex items-center gap-2">
              <Sliders size={10} />
              <span>Operational Mode: Active</span>
           </div>
           <Zap size={10} className="text-white/10" />
        </div>

        {/* MINI MODAL EDIT INPUT */}
        <AnimatePresence>
          {editingField && (
            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="fixed inset-0 z-[500] flex items-center justify-center bg-black/40 backdrop-blur-sm pointer-events-auto"
              onClick={() => setEditingField(null)}
            >
              <div 
                className="bg-[#2a2b2f] rounded-full px-5 py-2 flex items-center gap-4 shadow-[0_20px_50px_rgba(0,0,0,0.5)] border border-white/10"
                onClick={e => e.stopPropagation()}
              >
                 <span className="text-gray-400 text-sm font-black uppercase tracking-widest pl-2">{editingField.label}</span>
                 <input 
                   ref={inputRef}
                   type="text"
                   value={tempValue}
                   onChange={e => setTempValue(e.target.value)}
                   onKeyDown={e => e.key === 'Enter' && submitEdit()}
                   className="bg-transparent border-none outline-none text-white font-bold text-sm w-40 md:w-64"
                 />
                 <button 
                   onClick={submitEdit}
                   className="bg-[#666] hover:bg-[#777] text-white px-6 py-1.5 rounded-full text-xs font-black uppercase tracking-widest transition-all active:scale-95"
                 >
                   OK
                 </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </>
  );
};
