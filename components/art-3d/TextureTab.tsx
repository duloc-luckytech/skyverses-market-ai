import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Image as ImageIcon, 
  Box, 
  Edit3, 
  Trash2, 
  HelpCircle, 
  Crown, 
  Zap, 
  Flame, 
  ChevronDown, 
  Wand2, 
  Maximize, 
  Contrast, 
  ChevronRight,
  Loader2,
  CheckCircle2
} from 'lucide-react';

interface TextureTabProps {
  variants: any;
}

type SectionType = 'MAIN' | 'BRUSH' | 'UPSCALE' | 'PBR';

export const TextureTab: React.FC<TextureTabProps> = ({ variants }) => {
  const [activeSection, setActiveSection] = useState<SectionType>('MAIN');
  const [genMode, setGenMode] = useState<'IMAGE' | 'MESH' | 'TEXT'>('IMAGE');
  const [brushMode, setBrushMode] = useState<'GEN' | 'PAINT'>('GEN');
  const [fourKEnabled, setFourKEnabled] = useState(false);
  const [creativity, setCreativity] = useState(0.6);

  const SectionHeader = ({ id, label, icon, isActive }: { id: SectionType, label: string, icon: React.ReactNode, isActive: boolean }) => (
    <button
      onClick={() => setActiveSection(isActive ? 'MAIN' : id)}
      className={`w-full flex items-center justify-between p-4 rounded-2xl border transition-all ${
        isActive 
        ? 'bg-[#1c1c1f] border-brand-blue/30 text-white' 
        : 'bg-[#1c1c1f] border-white/5 text-gray-400 hover:border-white/10'
      }`}
    >
      <div className="flex items-center gap-3">
        <div className={isActive ? 'text-brand-blue' : 'text-gray-500'}>
          {icon}
        </div>
        <span className="text-xs font-black uppercase tracking-widest">{label}</span>
      </div>
      <ChevronDown size={16} className={`transition-transform duration-300 ${isActive ? 'rotate-180' : ''}`} />
    </button>
  );

  return (
    <motion.div 
      variants={variants} 
      initial="initial" 
      animate="animate" 
      exit="exit" 
      className="h-full flex flex-col space-y-4 pb-10 no-scrollbar"
    >
      {/* HEADER SECTION (Always Visible if MAIN is active or as a back button style) */}
      <AnimatePresence mode="wait">
        {activeSection === 'MAIN' ? (
          <motion.div 
            key="main-gen"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="space-y-6"
          >
            <div className="flex items-center gap-3 px-1">
               <div className="flex flex-col gap-0.5">
                  <div className="w-4 h-0.5 bg-gray-400"></div>
                  <div className="w-4 h-0.5 bg-gray-400"></div>
                  <div className="w-4 h-0.5 bg-gray-400"></div>
               </div>
               <h3 className="text-[13px] font-black uppercase tracking-tight text-white">3D Model Texture Generator</h3>
            </div>

            <div className="bg-[#1c1c1f] border border-brand-blue/30 rounded-[2.5rem] p-4 space-y-6">
              {/* Internal Tabs */}
              <div className="flex justify-center items-center gap-8 py-2 border-b border-white/5">
                <button onClick={() => setGenMode('IMAGE')} className={`transition-colors ${genMode === 'IMAGE' ? 'text-white' : 'text-gray-600'}`}><ImageIcon size={20}/></button>
                <button onClick={() => setGenMode('MESH')} className={`transition-colors ${genMode === 'MESH' ? 'text-white' : 'text-gray-600'}`}><Box size={20}/></button>
                <button onClick={() => setGenMode('TEXT')} className={`transition-colors ${genMode === 'TEXT' ? 'text-white' : 'text-gray-600'}`}><Edit3 size={20}/></button>
              </div>

              {/* Preview Image */}
              <div className="aspect-square rounded-3xl overflow-hidden relative bg-black group">
                <img 
                  src="https://ai-cdn.gommo.net/ai/images/c1df07a5156c5710/f0b1a03f4f135b9d.png" 
                  className="w-full h-full object-cover opacity-80" 
                  alt="Texture Preview" 
                />
                <button className="absolute top-4 right-4 p-2.5 bg-black/60 backdrop-blur-md rounded-full text-white/40 hover:text-red-500 transition-all opacity-0 group-hover:opacity-100 shadow-xl">
                  <Trash2 size={18} />
                </button>
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between px-1">
                <span className="text-[13px] font-bold text-white">Create Your Own Texture Style</span>
                <HelpCircle size={16} className="text-gray-600" />
              </div>
              <button className="w-full p-4 bg-[#1c1c1f] border border-white/5 rounded-2xl flex items-center justify-between group hover:border-brand-blue/30 transition-all">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-black rounded-lg flex items-center justify-center text-[10px] font-black text-gray-700">N/A</div>
                  <span className="text-sm font-bold text-gray-400 group-hover:text-white">None</span>
                </div>
                <ChevronRight size={18} className="text-gray-600" />
              </button>
            </div>

            <div className="flex items-center justify-between p-1">
              <div className="flex items-center gap-2">
                <Crown size={16} className="text-yellow-500" fill="currentColor" />
                <span className="text-[13px] font-bold text-white">4K Texture</span>
                <HelpCircle size={16} className="text-gray-600" />
              </div>
              <button 
                onClick={() => setFourKEnabled(!fourKEnabled)}
                className={`w-12 h-6 rounded-full relative transition-colors ${fourKEnabled ? 'bg-brand-blue' : 'bg-white/10'}`}
              >
                <motion.div 
                  animate={{ x: fourKEnabled ? 26 : 2 }}
                  className="absolute top-1 left-0 w-4 h-4 bg-white rounded-full shadow-lg"
                />
              </button>
            </div>
          </motion.div>
        ) : activeSection === 'BRUSH' ? (
          <motion.div 
            key="brush-section"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="space-y-6"
          >
            <div className="flex items-center gap-3 px-1">
               <Edit3 size={18} className="text-brand-blue" />
               <h3 className="text-[13px] font-black uppercase tracking-tight text-white">Magic Brush</h3>
            </div>
            
            <div className="flex bg-black/40 p-1.5 rounded-2xl border border-white/5">
              <button onClick={() => setBrushMode('GEN')} className={`flex-grow py-2.5 text-[11px] font-black uppercase rounded-xl transition-all ${brushMode === 'GEN' ? 'bg-[#3b3d45] text-white shadow-lg' : 'text-gray-500 hover:text-white'}`}>Gen Mode</button>
              <button onClick={() => setBrushMode('PAINT')} className={`flex-grow py-2.5 text-[11px] font-black uppercase rounded-xl transition-all ${brushMode === 'PAINT' ? 'bg-[#3b3d45] text-white shadow-lg' : 'text-gray-500 hover:text-white'}`}>Paint Mode</button>
            </div>

            <div className="space-y-4">
              <div className="relative">
                <textarea 
                  className="w-full h-48 bg-[#1c1c1f] border border-white/5 rounded-[2rem] p-6 text-sm text-white placeholder:text-gray-600 outline-none focus:border-brand-blue/30 transition-all resize-none"
                  placeholder="Describe the new texture from the current view"
                />
                <span className="absolute bottom-6 right-6 text-[10px] font-bold text-gray-600">0/1000</span>
              </div>

              <div className="space-y-4 px-1 pt-2">
                 <div className="flex justify-between items-center">
                    <div className="flex items-center gap-2">
                       <span className="text-[13px] font-bold text-white">Creativity Strength</span>
                       <HelpCircle size={14} className="text-gray-600" />
                    </div>
                    <div className="px-5 py-2 bg-white/5 border border-white/10 rounded-xl">
                      <span className="text-xs font-bold text-white">{creativity.toFixed(1)}</span>
                    </div>
                 </div>
                 <input 
                   type="range" min="0" max="1" step="0.1" value={creativity}
                   onChange={e => setCreativity(parseFloat(e.target.value))}
                   className="w-full h-1 bg-white/10 appearance-none rounded-full accent-brand-blue cursor-pointer"
                 />
              </div>
            </div>

            <button className="w-full py-5 bg-[#3b3d45] border border-white/5 rounded-full flex items-center justify-center gap-3 shadow-xl active:scale-[0.98] transition-all">
              <span className="text-xs font-black uppercase tracking-[0.2em] text-gray-500 italic">Generate Preview</span>
              <div className="flex items-center gap-2 px-3 py-1 bg-black/40 rounded-full border border-white/5">
                <Zap size={12} className="text-gray-500" fill="currentColor" />
                <span className="text-[11px] font-black italic text-gray-500">5</span>
              </div>
            </button>
          </motion.div>
        ) : activeSection === 'UPSCALE' ? (
          <motion.div 
            key="upscale-section"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="space-y-8"
          >
            <div className="flex items-center gap-3 px-1">
               <Maximize size={18} className="text-brand-blue" />
               <h3 className="text-[13px] font-black uppercase tracking-tight text-white">Texture Upscale</h3>
            </div>

            <div className="aspect-square rounded-3xl overflow-hidden relative border border-white/5 bg-black">
               <img 
                 src="https://ai-cdn.gommo.net/ai/images/c1df07a5156c5710/f0b1a03f4f135b9d.png" 
                 className="w-full h-full object-cover" 
                 alt="Upscale Preview" 
               />
               <div className="absolute inset-0 w-1/2 border-r border-white/50 overflow-hidden">
                  <img src="https://ai-cdn.gommo.net/ai/images/c1df07a5156c5710/f0b1a03f4f135b9d.png" className="w-[200%] h-full object-cover blur-[2px] grayscale opacity-50" />
               </div>
            </div>

            <p className="text-[12px] text-gray-500 font-bold text-center leading-relaxed px-4">
              Intelligently boosts texture resolution while preserving original style and detail
            </p>

            <div className="space-y-4">
               <div className="relative">
                 <button className="w-full py-5 bg-[#3b3d45] border border-white/5 rounded-full flex items-center justify-center gap-3 shadow-xl active:scale-[0.98] transition-all">
                   <div className="flex items-center gap-2 text-white">
                      <Crown size={14} fill="currentColor" className="text-yellow-500" />
                      <span className="text-xs font-black uppercase tracking-[0.2em] italic">Upscale Now</span>
                   </div>
                   <div className="flex items-center gap-2 px-3 py-1 bg-black/40 rounded-full border border-white/5">
                     <Zap size={12} className="text-gray-500" fill="currentColor" />
                     <span className="text-[11px] font-black italic text-gray-500">10</span>
                   </div>
                 </button>
                 <div className="absolute -top-3 -right-2 bg-pink-500 text-white text-[9px] font-black px-2 py-0.5 rounded-full uppercase italic shadow-xl">Free 0/1</div>
               </div>
            </div>
          </motion.div>
        ) : (
          <motion.div 
            key="pbr-section"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="space-y-8"
          >
            <div className="flex items-center gap-3 px-1">
               <Contrast size={18} className="text-brand-blue" />
               <h3 className="text-[13px] font-black uppercase tracking-tight text-white">PBR Generator</h3>
            </div>

            <div className="aspect-square rounded-3xl overflow-hidden relative border border-white/5 bg-black">
               <img 
                 src="https://images.unsplash.com/photo-1639322537228-f710d846310a?auto=format&fit=crop&q=80&w=800" 
                 className="w-full h-full object-cover" 
                 alt="PBR Preview" 
               />
               <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,_rgba(255,255,255,0.1)_0%,_transparent_100%)]"></div>
            </div>

            <p className="text-[12px] text-gray-500 font-bold text-center leading-relaxed px-4">
              Create PBR materials with physically accurate reflectance properties for authentic surface rendering
            </p>

            <button className="w-full py-5 bg-[#3b3d45] border border-white/5 rounded-full flex items-center justify-center gap-3 shadow-xl active:scale-[0.98] transition-all">
              <span className="text-xs font-black uppercase tracking-[0.2em] text-gray-500 italic">Generate PBR</span>
              <div className="flex items-center gap-2 px-3 py-1 bg-black/40 rounded-full border border-white/5">
                <Zap size={12} className="text-gray-500" fill="currentColor" />
                <span className="text-[11px] font-black italic text-gray-500">5</span>
              </div>
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* FOOTER ACCORDIONS */}
      <div className="mt-auto space-y-3 pt-6 border-t border-white/5">
        <SectionHeader 
          id="BRUSH" 
          label="Magic Brush" 
          icon={<Wand2 size={16}/>} 
          isActive={activeSection === 'BRUSH'} 
        />
        <SectionHeader 
          id="UPSCALE" 
          label="Texture Upscale" 
          icon={<Maximize size={16}/>} 
          isActive={activeSection === 'UPSCALE'} 
        />
        <SectionHeader 
          id="PBR" 
          label="PBR Generator" 
          icon={<Contrast size={16}/>} 
          isActive={activeSection === 'PBR'} 
        />
      </div>
    </motion.div>
  );
};
