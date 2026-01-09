
import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
// Added missing imports: ChevronLeft, MoreVertical, ChevronDown, AlertTriangle
import { 
  X, Zap, Mic, Play, Pause, Download, 
  Trash2, Plus, Sliders, ChevronRight, 
  Settings2, Activity, ShieldCheck, 
  Volume2, Headphones, ListMusic, 
  Search, Wand2, Info, Loader2,
  Lock, ExternalLink, User, BrainCircuit,
  Settings, Save, ChevronLeft, MoreVertical, ChevronDown, AlertTriangle
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
// Added missing Link import
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
  const { credits, isAuthenticated, login, useCredits } = useAuth();
  const { lang, t } = useLanguage();
  
  const [activeTab, setActiveTab] = useState<'current' | 'albums'>('current');
  const [isGenerating, setIsGenerating] = useState(false);
  const [script, setScript] = useState('');
  const [selectedVoice, setSelectedVoice] = useState({ name: 'Chọn giọng', type: 'Standard • AI', img: '?' });
  const [selectedEngine, setSelectedEngine] = useState('Eleven V3');
  
  const [results, setResults] = useState<AudioResult[]>([]);
  const [isDesignModalOpen, setIsDesignModalOpen] = useState(false);
  const [isLibraryModalOpen, setIsLibraryModalOpen] = useState(false);
  // Added missing showLowCreditAlert state
  const [showLowCreditAlert, setShowLowCreditAlert] = useState(false);

  const handleGenerate = async () => {
    if (!script.trim() || isGenerating) return;
    if (!isAuthenticated) { login(); return; }

    setIsGenerating(true);
    // Simulating synthesis
    setTimeout(() => {
      const newId = Date.now().toString();
      setResults(prev => [{
        id: newId,
        url: null, // Logic synthesis actual audio here
        text: script,
        voice: selectedVoice.name,
        engine: selectedEngine,
        timestamp: new Date().toLocaleTimeString()
      }, ...prev]);
      setIsGenerating(false);
      setScript('');
    }, 2000);
  };

  return (
    <div className="h-full w-full flex bg-[#0c0c0e] text-white font-sans overflow-hidden">
      
      {/* 1. LEFT SIDEBAR: CONFIGURATION */}
      <aside className="w-[400px] shrink-0 border-r border-white/5 bg-[#141416] flex flex-col z-50 transition-all duration-300 shadow-2xl">
        <div className="p-6 border-b border-white/5 flex items-center justify-between">
           <div className="flex items-center gap-3">
              <button onClick={onClose} className="p-1 text-gray-500 hover:text-white transition-colors"><ChevronLeft size={20}/></button>
              <div className="flex items-center gap-2">
                 <Mic size={18} className="text-orange-500" />
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
                   className="text-[9px] font-black text-orange-500 bg-orange-500/10 border border-orange-500/20 px-2 py-1 rounded-sm uppercase tracking-widest hover:bg-orange-500 hover:text-black transition-all"
                 >
                   + Tạo giọng
                 </button>
              </div>
              <button 
                onClick={() => setIsLibraryModalOpen(true)}
                className="w-full p-4 bg-black/40 border border-white/10 rounded-xl flex items-center justify-between group hover:border-orange-500/40 transition-all"
              >
                 <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-full bg-orange-600 flex items-center justify-center text-white font-black text-lg shadow-xl">
                       {selectedVoice.img}
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
                className="w-full h-40 bg-black/40 border border-white/10 rounded-xl p-5 text-sm font-medium focus:border-orange-500 outline-none transition-all resize-none shadow-inner leading-relaxed"
                placeholder="Nhập văn bản bạn muốn AI đọc..."
              />
           </section>

           {/* ENGINE */}
           <section className="space-y-4">
              <label className="text-[10px] font-black uppercase text-gray-500 tracking-widest">ENGINE</label>
              <div className="relative">
                 <select 
                   value={selectedEngine} onChange={e => setSelectedEngine(e.target.value)}
                   className="w-full bg-black/40 border border-white/10 rounded-xl p-4 text-sm font-bold outline-none appearance-none focus:border-orange-500 transition-all"
                 >
                    <option>Eleven V3</option>
                    <option>Minimax 1.0</option>
                    <option>DeepSpeech Ultra</option>
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
           <div className="flex justify-between items-center">
              <span className="text-[9px] font-black uppercase text-gray-500 tracking-widest">Chi phí ước tính</span>
              <span className="text-[10px] font-black text-orange-500 uppercase tracking-widest">0 credits</span>
           </div>
           <button 
             onClick={handleGenerate}
             disabled={isGenerating || !script.trim()}
             className="w-full py-5 bg-[#52211b] text-[#ff4b3a] rounded-xl text-xs font-black uppercase tracking-[0.4em] shadow-xl transition-all flex items-center justify-center gap-3 hover:brightness-110 active:scale-95 disabled:opacity-30 group overflow-hidden relative"
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
        <div className="h-14 border-b border-white/5 flex items-center px-8 bg-black/20 backdrop-blur-md z-40">
           <div className="flex bg-white/5 p-1 rounded-lg">
              <button 
                onClick={() => setActiveTab('current')}
                className={`px-6 py-1.5 text-[10px] font-black uppercase tracking-widest transition-all rounded-md ${activeTab === 'current' ? 'bg-[#2a2a2e] text-white shadow-xl' : 'text-gray-500 hover:text-white'}`}
              >
                Phiên hiện tại
              </button>
              <button 
                onClick={() => setActiveTab('albums')}
                className={`px-6 py-1.5 text-[10px] font-black uppercase tracking-widest transition-all rounded-md ${activeTab === 'albums' ? 'bg-[#2a2a2e] text-white shadow-xl' : 'text-gray-500 hover:text-white'}`}
              >
                Albums
              </button>
           </div>
           <div className="ml-auto flex items-center gap-6">
              <button className="text-[10px] font-black uppercase text-gray-500 hover:text-white transition-colors tracking-widest">Chọn tất cả</button>
           </div>
        </div>

        <div className="flex-grow overflow-y-auto no-scrollbar p-12 relative flex flex-col">
           {results.length === 0 && !isGenerating ? (
             <div className="flex-grow flex flex-col items-center justify-center opacity-10 space-y-6">
                <div className="w-24 h-24 border-2 border-dashed border-white/20 rounded-full flex items-center justify-center">
                   <ListMusic size={48} strokeWidth={1} />
                </div>
                <p className="text-xl font-black uppercase tracking-[0.5em] italic">Không có audio</p>
             </div>
           ) : (
             <div className="max-w-4xl mx-auto w-full space-y-4">
                {results.map(res => (
                   <div key={res.id} className="p-6 bg-white/[0.03] border border-white/5 rounded-2xl flex items-center justify-between group hover:border-orange-500/20 transition-all">
                      <div className="flex items-center gap-6">
                         <button className="w-12 h-12 rounded-full bg-orange-600 flex items-center justify-center text-white shadow-lg shadow-orange-500/20 active:scale-90 transition-all">
                            <Play size={20} fill="currentColor" className="ml-1" />
                         </button>
                         <div className="space-y-1">
                            <p className="text-sm font-bold uppercase truncate max-w-lg">{res.text}</p>
                            <p className="text-[9px] font-black text-gray-500 uppercase tracking-widest">{res.voice} • {res.engine} • {res.timestamp}</p>
                         </div>
                      </div>
                      <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                         <button className="p-2.5 text-gray-500 hover:text-white transition-colors"><Download size={16}/></button>
                         <button className="p-2.5 text-gray-500 hover:text-red-500 transition-colors"><Trash2 size={16}/></button>
                      </div>
                   </div>
                ))}
                {isGenerating && (
                  <div className="p-6 bg-white/[0.01] border border-white/5 border-dashed rounded-2xl flex items-center gap-6 animate-pulse">
                     <div className="w-12 h-12 rounded-full bg-white/5 flex items-center justify-center">
                        <Loader2 size={20} className="animate-spin text-orange-500" />
                     </div>
                     <div className="space-y-2 flex-grow">
                        <div className="h-2 w-3/4 bg-white/5 rounded"></div>
                        <div className="h-1.5 w-1/4 bg-white/5 rounded"></div>
                     </div>
                  </div>
                )}
             </div>
           )}
        </div>

        {/* Global Action Floating Icon */}
        <button className="absolute bottom-10 right-10 w-14 h-14 bg-brand-blue text-white rounded-full flex items-center justify-center shadow-2xl hover:scale-110 active:scale-95 transition-all z-50">
           <BrainCircuit size={28} />
        </button>
      </main>

      <VoiceDesignModal isOpen={isDesignModalOpen} onClose={() => setIsDesignModalOpen(false)} />
      <VoiceLibraryModal isOpen={isLibraryModalOpen} onClose={() => setIsLibraryModalOpen(false)} onSelect={(av) => { setSelectedVoice({ name: av.name, type: av.type, img: av.name[0] }); setIsLibraryModalOpen(false); }} />

      {/* LOW CREDIT ALERT */}
      <AnimatePresence>
        {showLowCreditAlert && (
          <div className="fixed inset-0 z-[1100] bg-black/80 backdrop-blur-md flex items-center justify-center p-6">
             <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="max-w-md w-full bg-[#111] p-10 rounded-2xl border border-white/10 text-center space-y-8">
                <div className="w-20 h-20 bg-orange-500/10 border border-orange-500/20 rounded-full flex items-center justify-center mx-auto text-amber-500"><AlertTriangle size={40} /></div>
                <h3 className="text-3xl font-black uppercase italic tracking-tighter">Quota Depleted</h3>
                <p className="text-sm text-gray-500 font-medium">Việc khởi tạo thiết kế giọng nói yêu cầu **500 credits**.</p>
                <div className="flex flex-col gap-4">
                   <Link to="/credits" className="bg-orange-600 text-white py-5 rounded-sm font-black uppercase text-[10px] tracking-widest shadow-xl">Nạp thêm Credits</Link>
                   <button onClick={() => setShowLowCreditAlert(false)} className="text-[10px] font-black text-gray-500 uppercase tracking-widest underline">Bỏ qua</button>
                </div>
             </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
};

export default VoiceStudioWorkspace;
