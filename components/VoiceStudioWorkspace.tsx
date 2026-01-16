
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  X, Zap, Mic, Play, Pause, Download, 
  Trash2, Sliders, ChevronRight, 
  Settings2, Activity, ShieldCheck, 
  Volume2, ListMusic, 
  Search, Wand2, Info, Loader2,
  Lock, ExternalLink, User, BrainCircuit,
  Settings, Save, ChevronLeft, MoreVertical, ChevronDown, AlertTriangle
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { Link } from 'react-router-dom';
import VoiceDesignModal from './VoiceDesignModal';
import VoiceLibraryModal from './VoiceLibraryModal';

interface AudioResult {
  id: string;
  url: string | null;
  text: string;
  voice: string;
  engine: string;
  timestamp: string;
}

const VoiceStudioWorkspace: React.FC<{ onClose: () => void }> = ({ onClose }) => {
  const { credits, isAuthenticated, login } = useAuth();
  const { lang, t } = useLanguage();
  
  const [activeTab, setActiveTab] = useState<'current' | 'albums'>('current');
  const [isGenerating, setIsGenerating] = useState(false);
  const [script, setScript] = useState('');
  const [selectedVoice, setSelectedVoice] = useState({ name: 'Chọn giọng', type: 'Standard • AI', img: '?' });
  const [selectedEngine, setSelectedEngine] = useState('Eleven V3');
  
  const [results, setResults] = useState<AudioResult[]>([]);
  const [isDesignModalOpen, setIsDesignModalOpen] = useState(false);
  const [isLibraryModalOpen, setIsLibraryModalOpen] = useState(false);
  const [showLowCreditAlert, setShowLowCreditAlert] = useState(false);

  const handleGenerate = async () => {
    if (!script.trim() || isGenerating) return;
    if (!isAuthenticated) { login(); return; }

    if (credits < 100) {
      setShowLowCreditAlert(true);
      return;
    }

    setIsGenerating(true);
    setTimeout(() => {
      const newId = Date.now().toString();
      setResults(prev => [{
        id: newId,
        url: null,
        text: script,
        voice: selectedVoice.name,
        engine: selectedEngine,
        timestamp: new Date().toLocaleTimeString()
      }, ...prev]);
      setIsGenerating(false);
      setScript('');
    }, 2500);
  };

  return (
    <div className="h-full w-full flex bg-[#0c0c0e] text-white font-sans overflow-hidden">
      
      {/* 1. LEFT SIDEBAR: CONFIGURATION */}
      <aside className="w-[400px] shrink-0 border-r border-white/5 bg-[#141416] flex flex-col z-50 transition-all duration-300 shadow-2xl">
        <div className="p-6 border-b border-white/5 flex items-center justify-between">
           <div className="flex items-center gap-3">
              <button onClick={onClose} className="p-1 text-gray-500 hover:text-white transition-colors"><ChevronLeft size={20}/></button>
              <div className="flex items-center gap-2">
                 <Mic size={18} className="text-[#ff4b3a]" />
                 <h2 className="text-sm font-black uppercase tracking-widest italic">AI Voice Studio</h2>
              </div>
           </div>
           <button className="p-2 text-gray-500 hover:text-white transition-colors"><MoreVertical size={16}/></button>
        </div>

        <div className="flex-grow overflow-y-auto no-scrollbar p-6 space-y-10">
           
           {/* GIỌNG ĐỌC */}
           <section className="space-y-4">
              <div className="flex justify-between items-center">
                 <label className="text-[10px] font-black uppercase text-gray-500 tracking-widest">GIỌNG ĐỌC</label>
                 <button 
                   onClick={() => setIsDesignModalOpen(true)}
                   className="text-[9px] font-black text-[#ff4b3a] bg-[#ff4b3a]/10 border border-[#ff4b3a]/20 px-2 py-1 rounded-sm uppercase tracking-widest hover:bg-[#ff4b3a] hover:text-white transition-all"
                 >
                   + Tạo giọng
                 </button>
              </div>
              <button 
                onClick={() => setIsLibraryModalOpen(true)}
                className="w-full p-4 bg-black/40 border border-white/10 rounded-xl flex items-center justify-between group hover:border-[#ff4b3a]/40 transition-all"
              >
                 <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full bg-[#ff4b3a] flex items-center justify-center text-white font-black text-xl shadow-xl overflow-hidden border-2 border-white/10">
                       <span className="opacity-80">?</span>
                    </div>
                    <div className="text-left">
                       <p className="text-sm font-black uppercase tracking-tight">{selectedVoice.name}</p>
                       <p className="text-[9px] text-gray-500 font-bold uppercase tracking-widest">{selectedVoice.type}</p>
                    </div>
                 </div>
                 <ChevronRight size={14} className="text-gray-600 group-hover:text-white" />
              </button>
           </section>

           {/* KỊCH BẢN */}
           <section className="space-y-4">
              <div className="flex justify-between items-center">
                 <label className="text-[10px] font-black uppercase text-gray-500 tracking-widest">KỊCH BẢN</label>
                 <span className="text-[9px] font-bold text-gray-600">{script.length}/20000</span>
              </div>
              <textarea 
                value={script}
                onChange={e => setScript(e.target.value)}
                className="w-full h-48 bg-black/40 border border-white/10 rounded-xl p-5 text-sm font-medium focus:border-[#ff4b3a] outline-none transition-all resize-none shadow-inner leading-relaxed text-white placeholder:text-gray-700"
                placeholder="Nhập văn bản bạn muốn AI đọc..."
              />
           </section>

           {/* ENGINE */}
           <section className="space-y-4">
              <label className="text-[10px] font-black uppercase text-gray-500 tracking-widest">ENGINE</label>
              <div className="relative">
                 <select 
                   value={selectedEngine} onChange={e => setSelectedEngine(e.target.value)}
                   className="w-full bg-black/40 border border-white/10 rounded-xl p-4 text-sm font-bold outline-none appearance-none focus:border-[#ff4b3a] transition-all text-white"
                 >
                    <option value="Eleven V3">Eleven V3</option>
                    <option value="Minimax 1.0">Minimax 1.0</option>
                    <option value="DeepSpeech Ultra">DeepSpeech Ultra</option>
                 </select>
                 <ChevronDown size={14} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-600 pointer-events-none" />
              </div>
           </section>

           {/* CÀI ĐẶT GIỌNG */}
           <button className="w-full flex items-center justify-between p-4 border-y border-white/5 hover:bg-white/5 transition-all group">
              <div className="flex items-center gap-3 text-gray-400 group-hover:text-white">
                 <Sliders size={16} />
                 <span className="text-[11px] font-black uppercase tracking-widest">Cài đặt giọng</span>
              </div>
              <ChevronRight size={14} className="text-gray-700" />
           </button>
        </div>

        <div className="p-8 border-t border-white/5 bg-black/20 shrink-0 space-y-6">
           <div className="flex justify-between items-center px-1">
              <span className="text-[9px] font-black uppercase text-gray-500 tracking-widest italic">Chi phí ước tính</span>
              <div className="flex items-center gap-2 text-[#ff4b3a] font-black italic">
                 <Zap size={14} fill="currentColor" />
                 <span className="text-sm">0 credits</span>
              </div>
           </div>
           <button 
             onClick={handleGenerate}
             disabled={isGenerating || !script.trim()}
             className="w-full py-5 bg-[#3a1a1a] border border-[#ff4b3a]/30 text-[#ff4b3a] rounded-xl text-xs font-black uppercase tracking-[0.4em] shadow-xl transition-all flex items-center justify-center gap-3 hover:bg-[#ff4b3a] hover:text-white active:scale-95 disabled:opacity-30 group overflow-hidden relative"
           >
              <div className="absolute inset-0 bg-white/5 -translate-x-full group-hover:translate-x-full transition-transform duration-700"></div>
              {isGenerating ? <Loader2 size={18} className="animate-spin" /> : <Mic size={18} fill="currentColor" />}
              Tạo Audio
           </button>
        </div>
      </aside>

      {/* 2. MAIN VIEWPORT (CENTER) */}
      <main className="flex-grow flex flex-col bg-[#0c0c0e] relative overflow-hidden">
        {/* TABS HEADER */}
        <div className="h-16 border-b border-white/5 flex items-center px-8 bg-black/40 backdrop-blur-md z-40">
           <div className="flex bg-white/5 p-1 rounded-lg border border-white/5">
              <button 
                onClick={() => setActiveTab('current')}
                className={`px-8 py-2 text-[10px] font-black uppercase tracking-widest transition-all rounded-md ${activeTab === 'current' ? 'bg-[#2a2a2e] text-white shadow-xl' : 'text-gray-500 hover:text-white'}`}
              >
                Phiên hiện tại
              </button>
              <button 
                onClick={() => setActiveTab('albums')}
                className={`px-8 py-2 text-[10px] font-black uppercase tracking-widest transition-all rounded-md ${activeTab === 'albums' ? 'bg-[#2a2a2e] text-white shadow-xl' : 'text-gray-500 hover:text-white'}`}
              >
                Albums
              </button>
           </div>
           <div className="ml-auto flex items-center gap-6">
              <button className="text-[10px] font-black uppercase text-gray-500 hover:text-white transition-colors tracking-widest">Chọn tất cả</button>
           </div>
        </div>

        <div className="flex-grow overflow-y-auto no-scrollbar p-12 relative flex flex-col">
           <AnimatePresence mode="wait">
             {results.length === 0 && !isGenerating ? (
               <motion.div 
                 key="empty"
                 initial={{ opacity: 0, scale: 0.95 }}
                 animate={{ opacity: 1, scale: 1 }}
                 exit={{ opacity: 0, scale: 0.95 }}
                 className="flex-grow flex flex-col items-center justify-center opacity-10 space-y-8"
               >
                  <div className="w-32 h-32 border-2 border-dashed border-white/20 rounded-full flex items-center justify-center">
                     <ListMusic size={60} strokeWidth={1} />
                  </div>
                  <p className="text-2xl font-black uppercase tracking-[0.5em] italic">Không có audio</p>
               </motion.div>
             ) : (
               <motion.div 
                 key="results"
                 initial={{ opacity: 0 }}
                 animate={{ opacity: 1 }}
                 className="max-w-4xl mx-auto w-full space-y-6 pb-20"
               >
                  {results.map(res => (
                     <div key={res.id} className="p-8 bg-white/[0.03] border border-white/5 rounded-3xl flex items-center justify-between group hover:border-[#ff4b3a]/30 transition-all shadow-xl">
                        <div className="flex items-center gap-8">
                           <button className="w-14 h-14 rounded-full bg-[#ff4b3a] flex items-center justify-center text-white shadow-lg shadow-[#ff4b3a]/20 hover:scale-110 active:scale-95 transition-all">
                              <Play size={24} fill="currentColor" className="ml-1" />
                           </button>
                           <div className="space-y-2">
                              <p className="text-base font-bold uppercase italic tracking-tight line-clamp-1 max-w-xl text-white/90">"{res.text}"</p>
                              <div className="flex items-center gap-4 text-[9px] font-black text-gray-500 uppercase tracking-widest">
                                 <span className="flex items-center gap-1.5"><User size={10}/> {res.voice}</span>
                                 <div className="w-1 h-1 rounded-full bg-white/10"></div>
                                 <span className="flex items-center gap-1.5"><BrainCircuit size={10}/> {res.engine}</span>
                                 <div className="w-1 h-1 rounded-full bg-white/10"></div>
                                 <span>{res.timestamp}</span>
                              </div>
                           </div>
                        </div>
                        <div className="flex gap-4 opacity-0 group-hover:opacity-100 transition-all translate-x-4 group-hover:translate-x-0">
                           <button className="p-3 bg-white/5 hover:bg-brand-blue rounded-xl text-gray-500 hover:text-white transition-all shadow-sm"><Download size={18}/></button>
                           <button className="p-3 bg-white/5 hover:bg-red-600 rounded-xl text-gray-500 hover:text-white transition-all shadow-sm"><Trash2 size={18}/></button>
                        </div>
                     </div>
                  ))}
                  {isGenerating && (
                    <div className="p-8 bg-white/[0.01] border border-white/5 border-dashed rounded-3xl flex items-center gap-8 animate-pulse">
                       <div className="w-14 h-14 rounded-full bg-white/5 flex items-center justify-center">
                          <Loader2 size={24} className="animate-spin text-[#ff4b3a]" />
                       </div>
                       <div className="space-y-3 flex-grow">
                          <div className="h-3 w-3/4 bg-white/5 rounded-full"></div>
                          <div className="h-2 w-1/4 bg-white/5 rounded-full"></div>
                       </div>
                    </div>
                  )}
               </motion.div>
             )}
           </AnimatePresence>
        </div>

        {/* Global Action Floating Icon */}
        <button className="absolute bottom-10 right-10 w-16 h-16 bg-[#ff4b3a] text-white rounded-full flex items-center justify-center shadow-[0_0_50px_rgba(255,75,58,0.4)] hover:scale-110 active:scale-95 transition-all z-50 group overflow-hidden">
           <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-500"></div>
           <BrainCircuit size={32} className="relative z-10" />
        </button>
      </main>

      <VoiceDesignModal isOpen={isDesignModalOpen} onClose={() => setIsDesignModalOpen(false)} />
      <VoiceLibraryModal 
        isOpen={isLibraryModalOpen} 
        onClose={() => setIsLibraryModalOpen(false)} 
        onSelect={(av) => { 
          setSelectedVoice({ name: av.name, type: `${av.type} • AI`, img: av.name[0] }); 
          setIsLibraryModalOpen(false); 
        }} 
      />

      <AnimatePresence>
        {showLowCreditAlert && (
          <div className="fixed inset-0 z-[1100] bg-black/80 backdrop-blur-md flex items-center justify-center p-6">
             <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="max-w-md w-full bg-[#111] p-12 rounded-[2.5rem] border border-white/10 text-center space-y-8 shadow-3xl">
                <div className="w-20 h-20 bg-[#ff4b3a]/10 border border-[#ff4b3a]/20 rounded-full flex items-center justify-center mx-auto text-[#ff4b3a] animate-bounce"><AlertTriangle size={40} /></div>
                <div className="space-y-2">
                   <h3 className="text-3xl font-black uppercase italic tracking-tighter text-white leading-none">Quota Depleted</h3>
                   <p className="text-sm text-gray-500 font-medium leading-relaxed uppercase tracking-tight">Việc khởi tạo thiết kế giọng nói yêu cầu **100 credits** cho mỗi chu kỳ tổng hợp.</p>
                </div>
                <div className="flex flex-col gap-4 pt-4">
                   <Link to="/credits" className="bg-[#ff4b3a] text-white py-5 rounded-2xl font-black uppercase text-[11px] tracking-[0.4em] shadow-xl hover:brightness-110 transition-all">Nạp thêm Credits</Link>
                   <button onClick={() => setShowLowCreditAlert(false)} className="text-[10px] font-black text-gray-500 uppercase tracking-widest underline underline-offset-8 decoration-gray-800 hover:text-white transition-colors">Để sau</button>
                </div>
             </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
};

export default VoiceStudioWorkspace;
