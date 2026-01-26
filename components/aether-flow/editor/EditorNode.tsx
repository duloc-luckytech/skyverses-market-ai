
import React from 'react';
import { Handle, Position } from '@xyflow/react';
import { Zap, Sliders, Type, Hash } from 'lucide-react';

export const EditorNode = ({ data, selected }: any) => {
  const onInputChange = (key: string, value: any) => {
    if (data.onUpdate) {
      data.onUpdate(key, value);
    }
  };

  return (
    <div className={`min-w-[300px] bg-[#121218] border-2 rounded-2xl overflow-hidden shadow-3xl transition-all duration-300 ${selected ? 'border-brand-blue ring-4 ring-brand-blue/20' : 'border-white/10'}`}>
      {/* Node Header */}
      <div className={`px-5 py-3 flex items-center justify-between border-b border-white/5 ${data.headerColor || 'bg-slate-800'}`}>
        <div className="flex items-center gap-3">
          <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_8px_#10b981]"></div>
          <span className="text-[12px] font-black uppercase tracking-widest text-white/90 italic">{data.label}</span>
        </div>
        <span className="text-[10px] font-mono font-bold text-white/30">#{data.id}</span>
      </div>
      
      {/* Node Body / Inputs */}
      <div className="p-5 space-y-5">
        {data.inputs && Object.entries(data.inputs).map(([key, value]: [string, any]) => {
          const isConnection = Array.isArray(value) && value.length === 2 && typeof value[0] === 'string';
          
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
                    <div className="relative">
                      {typeof value === 'string' && value.length > 30 ? (
                        <textarea 
                          value={value}
                          onChange={(e) => onInputChange(key, e.target.value)}
                          className="w-full bg-black/40 border border-white/5 rounded-lg p-3 text-[11px] font-bold text-gray-200 outline-none focus:border-brand-blue/50 transition-all resize-none min-h-[60px] no-scrollbar"
                        />
                      ) : (
                        <input 
                          type={typeof value === 'number' ? 'number' : 'text'}
                          value={value}
                          onChange={(e) => onInputChange(key, typeof value === 'number' ? parseFloat(e.target.value) : e.target.value)}
                          className="w-full bg-black/40 border border-white/5 rounded-lg px-3 py-2 text-[11px] font-bold text-gray-200 outline-none focus:border-brand-blue/50 transition-all"
                        />
                      )}
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
    </div>
  );
};
