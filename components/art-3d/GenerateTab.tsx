import React, { useState } from 'react';
import { motion } from 'framer-motion';
// Add ChevronUp to the imports from lucide-react
import { 
  Image as ImageIcon, Box, Edit3, Upload, 
  HelpCircle, Crown, Globe, ChevronDown, ChevronUp,
  Flame, Zap, Settings, Grid2X2 
} from 'lucide-react';

interface GenerateTabProps {
  variants: any;
}

export const GenerateTab: React.FC<GenerateTabProps> = ({ variants }) => {
  const [subTab, setSubTab] = useState<'IMAGE' | 'MESH' | 'GALLERY' | 'EDIT'>('IMAGE');
  const [makeImageBetter, setMakeImageBetter] = useState(true);
  const [quality, setQuality] = useState<'Ultra' | 'Standard'>('Standard');
  const [generateInParts, setGenerateInParts] = useState(false);
  const [textureEnabled, setTextureEnabled] = useState(true);

  return (
    <motion.div 
      variants={variants} 
      initial="initial" 
      animate="animate" 
      exit="exit" 
      className="h-full flex flex-col space-y-6"
    >
      {/* Visual Generator Container */}
      <div className="bg-[#1c1c1f] border border-[#5e5ce6]/40 rounded-xl p-4 space-y-6">
        {/* Top Icon Tabs */}
        <div className="flex justify-center items-center gap-8 py-2 border-b border-white/[0.06]">
          <button onClick={() => setSubTab('IMAGE')} className={`transition-colors ${subTab === 'IMAGE' ? 'text-white' : 'text-white/40'}`}><ImageIcon size={20}/></button>
          <button onClick={() => setSubTab('MESH')} className={`transition-colors ${subTab === 'MESH' ? 'text-white' : 'text-white/40'}`}><Box size={20}/></button>
          <button onClick={() => setSubTab('GALLERY')} className={`transition-colors ${subTab === 'GALLERY' ? 'text-white' : 'text-white/40'}`}><ImageIcon size={20} className="rotate-90"/></button>
          <button onClick={() => setSubTab('EDIT')} className={`transition-colors ${subTab === 'EDIT' ? 'text-white' : 'text-white/40'}`}><Edit3 size={20}/></button>
        </div>

        {/* Upload Dropzone */}
        <div className="aspect-square bg-black/40 rounded-xl border-2 border-dashed border-white/10 flex flex-col items-center justify-center p-8 text-center space-y-4 relative group hover:border-[#5e5ce6]/40 transition-colors cursor-pointer">
          <div className="absolute inset-0 opacity-10 pointer-events-none" style={{ backgroundImage: 'radial-gradient(circle, #fff 1px, transparent 1px)', backgroundSize: '16px 16px' }}></div>
          
          <div className="w-12 h-12 rounded-full bg-white/[0.06] flex items-center justify-center text-white/50 group-hover:text-brand-blue transition-colors">
            <Upload size={24} />
          </div>
          <div className="space-y-1">
            <p className="text-sm font-bold text-white uppercase tracking-tight">Upload</p>
            <p className="text-[10px] text-white/50 font-bold uppercase tracking-widest leading-tight">JPG, PNG, WEBP Size ≤ 5MB</p>
          </div>
          
          {/* Bulb Icon in top right of upload area from image */}
          <div className="absolute top-4 right-4 text-white/30">
            <HelpCircle size={16} />
          </div>
        </div>
      </div>

      {/* Toggles and Settings */}
      <div className="space-y-6 px-1">
        
        {/* Make Image Better */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-[13px] font-bold text-white">Make Image Better</span>
            <HelpCircle size={16} className="text-white/40" />
          </div>
          <Toggle active={makeImageBetter} onChange={() => setMakeImageBetter(!makeImageBetter)} />
        </div>

        {/* Mesh Quality */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-[13px] font-bold text-white">Mesh Quality</span>
            <HelpCircle size={16} className="text-white/40" />
          </div>
          <div className="flex gap-2 p-1 bg-black/20 rounded-xl border border-white/[0.06]">
            <button 
              onClick={() => setQuality('Ultra')}
              className={`flex-grow py-3 px-2 text-xs font-bold rounded-lg transition-all relative flex items-center justify-center gap-2 ${quality === 'Ultra' ? 'bg-[#5e5ce6] text-white shadow-lg' : 'text-white/50 hover:text-white'}`}
            >
              <Crown size={14} fill="currentColor" className="text-yellow-400" />
              Ultra
              <div className="absolute -top-3 -right-2 bg-pink-500 text-white text-[9px] font-bold px-2 py-0.5 rounded-full uppercase italic">Trial 0/1</div>
            </button>
            <button 
              onClick={() => setQuality('Standard')}
              className={`flex-grow py-3 text-xs font-bold rounded-lg transition-all ${quality === 'Standard' ? 'bg-[#5e5ce6] text-white shadow-lg' : 'text-white/50 hover:text-white'}`}
            >
              Standard
            </button>
          </div>
        </div>

        {/* Generate in Parts */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Crown size={16} className="text-yellow-400" fill="currentColor" />
            <span className="text-[13px] font-bold text-white">Generate in Parts</span>
            <HelpCircle size={16} className="text-white/40" />
          </div>
          <Toggle active={generateInParts} onChange={() => setGenerateInParts(!generateInParts)} />
        </div>

        {/* Privacy */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Crown size={16} className="text-yellow-400" fill="currentColor" />
            <span className="text-[13px] font-bold text-white">Privacy</span>
            <HelpCircle size={16} className="text-white/40" />
          </div>
          <button className="flex items-center gap-3 px-4 py-2 bg-white/[0.06] border border-white/10 rounded-lg group">
             <Globe size={14} className="text-white/60 group-hover:text-white" />
             <span className="text-xs font-bold text-white">Public</span>
             <ChevronDown size={14} className="text-white/40" />
          </button>
        </div>

        {/* Texture */}
        <div className="flex items-center justify-between">
          <span className="text-[13px] font-bold text-white">Texture</span>
          <Toggle active={textureEnabled} onChange={() => setTextureEnabled(!textureEnabled)} />
        </div>

        {/* Accordions */}
        <div className="space-y-4 pt-4">
          <button className="w-full flex items-center justify-between py-3 border-t border-white/[0.06] group">
            <span className="text-[13px] font-bold text-white/60 group-hover:text-white transition-colors">Texture Settings</span>
            <ChevronDown size={16} className="text-white/40" />
          </button>
          <button className="w-full flex items-center justify-between py-3 border-t border-white/[0.06] group">
            <span className="text-[13px] font-bold text-white/60 group-hover:text-white transition-colors">Topology Settings</span>
            <ChevronDown size={16} className="text-white/40" />
          </button>
        </div>
      </div>

      {/* Footer Section */}
      <div className="mt-auto space-y-6 pt-10 pb-4">
        <button className="w-full flex items-center justify-center gap-2 text-[11px] font-bold uppercase text-red-500 tracking-widest group">
          <Flame size={14} fill="currentColor" className="animate-pulse" />
          v3.0 (Fast & Detailed)
          <ChevronUp size={14} className="text-white/40 group-hover:text-red-500 transition-colors" />
        </button>

        <button className="w-full py-5 bg-[#FFE135] text-black rounded-full font-bold uppercase text-xs tracking-[0.4em] shadow-[0_20px_60px_rgba(255,225,53,0.3)] hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-4">
          Generate Model
          <div className="flex items-center gap-1.5 px-3 py-1 bg-black rounded-full text-white text-[10px] font-bold">
             <Zap size={10} fill="currentColor" className="text-yellow-400" />
             25
          </div>
        </button>
      </div>
    </motion.div>
  );
};

const Toggle = ({ active, onChange }: { active: boolean, onChange: () => void }) => (
  <button 
    onClick={onChange}
    className={`w-12 h-6 rounded-full relative transition-colors ${active ? 'bg-[#5e5ce6]' : 'bg-white/10'}`}
  >
    <motion.div 
      animate={{ x: active ? 26 : 2 }}
      className="absolute top-1 left-0 w-4 h-4 bg-white rounded-full shadow-lg"
    />
  </button>
);