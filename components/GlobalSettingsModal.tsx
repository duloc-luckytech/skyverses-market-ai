
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  X, Monitor, Smartphone, Clock, Zap, Sparkles, 
  Crown, Check, ShieldCheck, Activity, Target
} from 'lucide-react';

interface GlobalSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const GlobalSettingsModal: React.FC<GlobalSettingsModalProps> = ({ isOpen, onClose }) => {
  const [selectedModel, setSelectedModel] = useState('wan-2-6');
  const [resolution, setResolution] = useState('720P');
  const [aspectRatio, setAspectRatio] = useState('16:9');
  const [duration, setDuration] = useState('5s');
  
  const [switches, setSwitches] = useState({
    credits: true,
    enhance: true,
    multiShot: false
  });

  if (!isOpen) return null;

  const models = [
    { id: 'wan-2-6', name: 'Wan 2.6', desc: 'Create storyboards and stories' },
    { id: 'wan-2-5', name: 'Wan 2.5 Preview', desc: 'Audio generation with frame sync' },
    { id: 'wan-2-2', name: 'Wan 2.2', desc: 'Film-like quality' }
  ];

  const aspectRatios = [
    { id: '16:9', icon: <Monitor size={14} /> },
    { id: '4:3', icon: <div className="w-3.5 h-2.5 border border-current rounded-sm" /> },
    { id: '1:1', icon: <div className="w-3 h-3 border border-current rounded-sm" /> },
    { id: '3:4', icon: <div className="w-2.5 h-3.5 border border-current rounded-sm" /> },
    { id: '9:16', icon: <Smartphone size={14} /> }
  ];

  const durations = [
    { id: '5s', vip: false },
    { id: '10s', vip: true },
    { id: '15s', vip: true }
  ];

  const Switch = ({ active, onChange }: { active: boolean, onChange: () => void }) => (
    <button 
      onClick={onChange}
      className={`w-10 h-5 md:w-12 md:h-6 rounded-full relative transition-all duration-300 ${active ? 'bg-[#0090ff] shadow-[0_0_10px_rgba(0,144,255,0.4)]' : 'bg-slate-200 dark:bg-zinc-800'}`}
    >
      <motion.div 
        animate={{ x: active ? (window.innerWidth < 768 ? 20 : 26) : 2 }}
        className="absolute top-0.5 md:top-1 left-0 w-4 h-4 bg-white rounded-full shadow-lg"
      />
    </button>
  );

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4 md:p-6">
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="absolute inset-0 bg-black/60 backdrop-blur-md"
          onClick={onClose}
        />
        
        <motion.div 
          initial={{ scale: 0.95, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.95, opacity: 0, y: 20 }}
          className="relative w-full max-w-lg bg-white dark:bg-[#0d0d0f] rounded-[2rem] md:rounded-[2.5rem] overflow-hidden shadow-3xl flex flex-col border border-black/5 dark:border-white/10 max-h-[90vh] md:max-h-[85vh]"
        >
          {/* Header - Compact for Mobile */}
          <div className="p-5 md:p-8 flex items-center justify-between border-b border-black/5 dark:border-white/5 bg-slate-50/50 dark:bg-black/20 shrink-0">
            <h2 className="text-lg md:text-xl font-black uppercase italic tracking-tighter text-slate-900 dark:text-white leading-none">Setting</h2>
            <button onClick={onClose} className="p-2 text-slate-400 hover:text-red-500 transition-colors bg-black/5 dark:bg-white/5 rounded-full">
              <X size={20} />
            </button>
          </div>

          {/* Content Area - Internal Scroll */}
          <div className="flex-grow overflow-y-auto no-scrollbar p-5 md:p-8 space-y-6 md:space-y-10">
            
            {/* Models */}
            <div className="space-y-3">
              <label className="text-[9px] font-black uppercase text-slate-400 dark:text-gray-500 tracking-[0.2em] px-1">Models</label>
              <div className="flex gap-3 overflow-x-auto no-scrollbar pb-1">
                {models.map(m => (
                  <button 
                    key={m.id}
                    onClick={() => setSelectedModel(m.id)}
                    className={`min-w-[140px] md:min-w-[160px] p-4 md:p-5 rounded-2xl border-2 text-left transition-all relative overflow-hidden group ${selectedModel === m.id ? 'border-purple-500 bg-purple-500/5 shadow-lg' : 'border-slate-100 dark:border-white/5 bg-slate-50 dark:bg-black hover:border-slate-200'}`}
                  >
                    <div className="relative z-10 space-y-1">
                      <h4 className={`text-xs md:text-sm font-black uppercase italic ${selectedModel === m.id ? 'text-white' : 'text-slate-800 dark:text-gray-300'}`}>{m.name}</h4>
                      <p className="text-[7px] md:text-[8px] font-bold text-gray-500 uppercase leading-tight tracking-widest line-clamp-1">{m.desc}</p>
                    </div>
                    {selectedModel === m.id && (
                      <div className="absolute top-2 right-2 text-purple-500">
                        <Check size={12} strokeWidth={4} />
                      </div>
                    )}
                  </button>
                ))}
              </div>
            </div>

            {/* Resolution */}
            <div className="space-y-3">
              <label className="text-[9px] font-black uppercase text-slate-400 dark:text-gray-500 tracking-[0.2em] px-1">Resolution</label>
              <div className="grid grid-cols-2 gap-2 md:gap-3">
                <button 
                  onClick={() => setResolution('1080P')}
                  className={`py-3 md:py-4 rounded-xl border-2 font-black text-[10px] md:text-[11px] uppercase tracking-widest flex items-center justify-center gap-2 transition-all ${resolution === '1080P' ? 'border-purple-500 bg-purple-500/5 text-white' : 'border-slate-100 dark:border-white/5 text-gray-400'}`}
                >
                  1080P <span className="bg-purple-600 text-white text-[7px] px-1.5 py-0.5 rounded-sm">VIP</span>
                </button>
                <button 
                  onClick={() => setResolution('720P')}
                  className={`py-3 md:py-4 rounded-xl border-2 font-black text-[10px] md:text-[11px] uppercase tracking-widest flex items-center justify-center gap-2 transition-all ${resolution === '720P' ? 'border-purple-500 bg-purple-500/5 text-white' : 'border-slate-100 dark:border-white/5 text-gray-400'}`}
                >
                  720P
                </button>
              </div>
            </div>

            {/* Aspect Ratio */}
            <div className="space-y-3">
              <label className="text-[9px] font-black uppercase text-slate-400 dark:text-gray-500 tracking-[0.2em] px-1">Aspect Ratio</label>
              <div className="grid grid-cols-5 gap-2">
                {aspectRatios.map(r => (
                  <button 
                    key={r.id}
                    onClick={() => setAspectRatio(r.id)}
                    className={`flex flex-col items-center justify-center gap-2 md:gap-3 aspect-square border-2 rounded-xl transition-all ${aspectRatio === r.id ? 'border-purple-500 bg-purple-500/5 text-white' : 'border-slate-100 dark:border-white/5 text-gray-400 hover:border-slate-200'}`}
                  >
                    <div className={aspectRatio === r.id ? 'text-white' : 'text-gray-500'}>{r.icon}</div>
                    <span className="text-[8px] md:text-[9px] font-black">{r.id}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Duration */}
            <div className="space-y-3">
              <label className="text-[9px] font-black uppercase text-slate-400 dark:text-gray-500 tracking-[0.2em] px-1">Duration</label>
              <div className="grid grid-cols-3 gap-2 md:gap-3">
                {durations.map(d => (
                  <button 
                    key={d.id}
                    onClick={() => setDuration(d.id)}
                    className={`py-3 md:py-4 rounded-xl border-2 font-black text-[10px] md:text-[11px] uppercase tracking-widest flex items-center justify-center gap-1 md:gap-2 transition-all ${duration === d.id ? 'border-purple-500 bg-purple-500/5 text-white' : 'border-slate-100 dark:border-white/5 text-gray-400'}`}
                  >
                    {d.id} {d.vip && <span className="bg-purple-600 text-white text-[7px] px-1 py-0.5 rounded-sm leading-none">VIP</span>}
                  </button>
                ))}
              </div>
            </div>

            {/* Switches */}
            <div className="space-y-4 md:space-y-6 pt-2">
               <div className="flex items-center justify-between group gap-4">
                  <div className="space-y-0.5">
                    <p className="text-[11px] md:text-[12px] font-black uppercase tracking-widest text-slate-800 dark:text-white">Generate with Credits</p>
                    <p className="text-[8px] md:text-[9px] text-gray-500 font-bold uppercase max-w-[220px] md:max-w-[280px] leading-tight italic">reduce wait time during peak hours.</p>
                  </div>
                  <Switch active={switches.credits} onChange={() => setSwitches({...switches, credits: !switches.credits})} />
               </div>

               <div className="flex items-center justify-between group gap-4">
                  <p className="text-[11px] md:text-[12px] font-black uppercase tracking-widest text-slate-800 dark:text-white">Enhance Prompt</p>
                  <Switch active={switches.enhance} onChange={() => setSwitches({...switches, enhance: !switches.enhance})} />
               </div>

               <div className="flex items-center justify-between group gap-4">
                  <p className="text-[11px] md:text-[12px] font-black uppercase tracking-widest text-slate-800 dark:text-white">Smart Multi-shot</p>
                  <Switch active={switches.multiShot} onChange={() => setSwitches({...switches, multiShot: !switches.multiShot})} />
               </div>
            </div>
          </div>

          {/* Footer Info */}
          <div className="p-4 md:p-6 bg-slate-50 dark:bg-black/40 border-t border-black/5 dark:border-white/5 flex items-center justify-center gap-3 md:gap-4 text-slate-400 italic shrink-0">
             <ShieldCheck size={14} className="text-brand-blue" />
             <span className="text-[8px] md:text-[9px] font-black uppercase tracking-widest leading-none">Security Node: V4.2 Protocol Active</span>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default GlobalSettingsModal;
