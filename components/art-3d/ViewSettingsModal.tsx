import React from 'react';
import { motion } from 'framer-motion';
import { X } from 'lucide-react';

interface ViewSettingsModalProps {
  logic: any;
  onClose: () => void;
}

export const ViewSettingsModal: React.FC<ViewSettingsModalProps> = ({ logic, onClose }) => {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 20 }}
      className="absolute bottom-32 left-1/2 -translate-x-1/2 w-80 bg-[#1e2024]/98 backdrop-blur-3xl border border-white/10 rounded-[2.5rem] shadow-3xl overflow-hidden z-50 transition-colors"
    >
      <div className="p-6 space-y-6">
        <div className="flex justify-between items-center">
          <span className="text-[10px] font-black uppercase text-white tracking-widest">View Master</span>
          <button onClick={onClose} className="text-gray-500 hover:text-red-500 transition-colors"><X size={14} /></button>
        </div>
        
        <div className="space-y-4">
          <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Shading Node</p>
          <div className="flex bg-black/40 p-1.5 rounded-xl border border-white/5">
            <button onClick={() => logic.setShading('Flat')} className={`flex-grow py-2.5 text-[10px] font-black uppercase rounded-lg transition-all ${logic.shading === 'Flat' ? 'bg-[#3b3d45] text-white shadow-xl' : 'text-gray-500 hover:text-white'}`}>Flat</button>
            <button onClick={() => logic.setShading('Smooth')} className={`flex-grow py-2.5 text-[10px] font-black uppercase rounded-lg transition-all ${logic.shading === 'Smooth' ? 'bg-[#3b3d45] text-white shadow-xl' : 'text-gray-500 hover:text-white'}`}>Smooth</button>
          </div>
        </div>

        <div className="flex items-center justify-between p-4 bg-black/20 rounded-xl border border-white/5">
          <span className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Material PBR</span>
          <button onClick={() => logic.setIsPBR(!logic.isPBR)} className={`w-12 h-6 rounded-full relative transition-colors ${logic.isPBR ? 'bg-purple-600' : 'bg-gray-600'}`}>
            <motion.div animate={{ x: logic.isPBR ? 24 : 2 }} className="absolute top-1 w-4 h-4 bg-white rounded-full shadow-lg" />
          </button>
        </div>

        <div className="space-y-6">
          <div className="space-y-3">
            <div className="flex justify-between text-[10px] font-black uppercase">
              <span className="text-gray-500 tracking-widest">Metallic</span>
              <span className="text-white italic">{logic.metallic.toFixed(1)}</span>
            </div>
            <input type="range" min="0" max="1" step="0.1" value={logic.metallic} onChange={e => logic.setMetallic(parseFloat(e.target.value))} className="w-full h-1.5 bg-white/10 appearance-none rounded-full accent-purple-500 cursor-pointer" />
          </div>
          <div className="space-y-3">
            <div className="flex justify-between text-[10px] font-black uppercase">
              <span className="text-gray-500 tracking-widest">Roughness</span>
              <span className="text-white italic">{logic.roughness.toFixed(1)}</span>
            </div>
            <input type="range" min="0" max="1" step="0.1" value={logic.roughness} onChange={e => logic.setRoughness(parseFloat(e.target.value))} className="w-full h-1.5 bg-white/10 appearance-none rounded-full accent-purple-500 cursor-pointer" />
          </div>
        </div>
      </div>

      <div className="bg-black/60 p-5 flex justify-center gap-4 border-t border-white/5">
        {[1,2,3,4,5].map(i => (
          <div key={i} onClick={() => logic.setActiveMaterial(i)} className={`w-8 h-8 rounded-full border-2 transition-all cursor-pointer hover:scale-125 shadow-2xl ${logic.activeMaterial === i ? 'border-white scale-110' : 'border-white/10'} ${i === 1 ? 'bg-[#3b3d45]' : i === 2 ? 'bg-[#1a1b1e]' : i === 3 ? 'bg-gradient-to-tr from-purple-600 to-cyan-500' : i === 4 ? 'bg-[#dfff1a]' : 'bg-red-600'}`}></div>
        ))}
      </div>
    </motion.div>
  );
};