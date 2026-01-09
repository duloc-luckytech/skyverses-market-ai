
import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Play, Pause, Zap, Loader2, Download, 
  Trash2, Search, Plus, Volume2, 
  Settings2, Activity, ShieldCheck, 
  CheckCircle2, Share2, Wand2, Mic2, RefreshCw,
  History as HistoryIcon, ChevronDown, Save, X, Sparkles,
  Check, AlertTriangle, Coins, Clock
} from 'lucide-react';
import { generateDemoAudio } from '../services/gemini';
import { useAuth } from '../context/AuthContext';
import { Link } from 'react-router-dom';

interface DesignedVoice {
  id: string;
  label: string;
  duration: string;
  timestamp: string;
  buffer: AudioBuffer | null;
}

const EXAMPLES = [
  "Giọng nữ trẻ, ngọt ngào, đọc tin tức",
  "Giọng nam trầm ấm, MC chuyên nghiệp",
  "Giọng trẻ em vui vẻ, quảng cáo"
];

const VoiceDesignWorkspace: React.FC = () => {
  const { credits, useCredits, isAuthenticated, login } = useAuth();
  const [step, setStep] = useState<'input' | 'result'>('input');
  const [description, setDescription] = useState('');
  const [sampleText, setSampleText] = useState('Chào mừng bạn đến với tương lai của âm thanh kỹ thuật số. Hệ thống của chúng tôi tạo ra những giọng nói chân thực từ mô tả của bạn.');
  const [seed, setSeed] = useState(Math.floor(Math.random() * 999999999).toString());
  const [isGenerating, setIsGenerating] = useState(false);
  const [isPlayingId, setIsPlayingId] = useState<string | null>(null);
  const [voices, setVoices] = useState<DesignedVoice[]>([]);
  const [selectedVoiceId, setSelectedVoiceId] = useState<string | null>(null);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [showLowCreditAlert, setShowLowCreditAlert] = useState(false);

  const audioCtxRef = useRef<AudioContext | null>(null);
  const sourceNodeRef = useRef<AudioBufferSourceNode | null>(null);

  const COST_PER_DESIGN = 500;

  const stopPlayback = () => {
    if (sourceNodeRef.current) {
      try { sourceNodeRef.current.stop(); } catch (e) {}
      sourceNodeRef.current = null;
    }
    setIsPlayingId(null);
  };

  const playBuffer = (buffer: AudioBuffer, id: string) => {
    stopPlayback();
    if (!audioCtxRef.current) {
      const AudioContextClass = (window as any).AudioContext || (window as any).webkitAudioContext;
      audioCtxRef.current = new AudioContextClass();
    }
    const source = audioCtxRef.current!.createBufferSource();
    source.buffer = buffer;
    source.connect(audioCtxRef.current!.destination);
    source.onended = () => setIsPlayingId(null);
    source.start(0);
    sourceNodeRef.current = source;
    setIsPlayingId(id);
  };

  const handleGenerate = async () => {
    if (!description.trim() || isGenerating) return;

    if (!isAuthenticated) {
      login();
      return;
    }

    if (credits < COST_PER_DESIGN) {
      setShowLowCreditAlert(true);
      return;
    }

    setIsGenerating(true);
    stopPlayback();

    try {
      const successful = useCredits(COST_PER_DESIGN);
      if (!successful) throw new Error("Deduction failed");

      const voiceNames = ['Kore', 'Puck', 'Zephyr'];
      const durations = ['11s', '16s', '20s'];
      
      const newVoices: DesignedVoice[] = [];
      
      for (let i = 0; i < 3; i++) {
        const prompt = `Style: ${description}. Voice Model: ${voiceNames[i]}. Seed: ${seed}. Text: ${sampleText}`;
        const buffer = await generateDemoAudio(prompt, voiceNames[i]);
        
        newVoices.push({
          id: `v-${Date.now()}-${i}`,
          label: `Mẫu ${i + 1}`,
          duration: durations[i],
          timestamp: new Date().toLocaleTimeString(),
          buffer
        });
      }
      
      setVoices(newVoices);
      setStep('result');
    } catch (e) {
      console.error(e);
    } finally {
      setIsGenerating(false);
    }
  };

  const resetDesign = () => {
    setStep('input');
    setVoices([]);
    setSelectedVoiceId(null);
  };

  const generateRandomSeed = () => {
    setSeed(Math.floor(Math.random() * 999999999).toString());
  };

  return (
    <div className="bg-white dark:bg-[#0c0c0e] min-h-[700px] w-full flex flex-col p-6 text-slate-800 dark:text-white font-sans selection:bg-brand-blue/30 transition-colors duration-500">
      
      {/* HEADER SECTION */}
      <div className="flex items-center gap-4 mb-8">
        <div className="w-12 h-12 bg-slate-100 dark:bg-[#1c1c1f] border border-slate-200 dark:border-white/5 rounded-xl flex items-center justify-center text-slate-400 dark:text-gray-400 shadow-sm transition-colors">
          <Sparkles size={24} />
        </div>
        <div className="flex-grow">
          <h1 className="text-xl font-black uppercase tracking-tight text-slate-900 dark:text-white">Voice Design</h1>
          <p className="text-[10px] font-bold text-slate-400 dark:text-gray-500 uppercase tracking-widest">Skyverses x ElevenLabs</p>
        </div>
        <div className="flex items-center gap-3 px-4 py-2 bg-brand-blue/5 dark:bg-brand-blue/10 border border-brand-blue/20 rounded-full">
          <Coins size={14} className="text-brand-blue" />
          <span className="text-xs font-black text-brand-blue">{credits.toLocaleString()} CR</span>
        </div>
      </div>

      <AnimatePresence mode="wait">
        {step === 'input' ? (
          <motion.div 
            key="input-step"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="grid grid-cols-1 lg:grid-cols-12 gap-6"
          >
            {/* LEFT COLUMN: CONFIG */}
            <div className="lg:col-span-8 bg-slate-50 dark:bg-[#141417] border border-slate-200 dark:border-white/5 rounded-2xl p-8 space-y-8 shadow-sm dark:shadow-2xl transition-colors">
              <div className="space-y-4">
                <label className="text-[10px] font-black uppercase text-slate-400 dark:text-gray-500 tracking-[0.2em]">Mô tả giọng nói</label>
                <textarea 
                  value={description}
                  onChange={e => setDescription(e.target.value)}
                  className="w-full h-32 bg-white dark:bg-black/40 border border-slate-200 dark:border-white/5 rounded-xl p-5 text-sm font-medium focus:border-brand-blue/30 outline-none transition-all resize-none leading-relaxed text-slate-800 dark:text-white shadow-inner"
                  placeholder="Ví dụ: Giọng nữ trẻ, ấm áp, thân thiện, phong cách đọc tin tức chuyên nghiệp..."
                />
              </div>

              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <label className="text-[10px] font-black uppercase text-slate-400 dark:text-gray-500 tracking-[0.2em]">Văn bản mẫu</label>
                  <span className="text-[10px] font-bold text-slate-300 dark:text-gray-600 uppercase tracking-widest">{sampleText.length} chars</span>
                </div>
                <textarea 
                  value={sampleText}
                  onChange={e => setSampleText(e.target.value)}
                  className="w-full h-32 bg-white dark:bg-black/40 border border-slate-200 dark:border-white/5 rounded-xl p-5 text-sm font-medium focus:border-brand-blue/30 outline-none transition-all resize-none leading-relaxed text-slate-800 dark:text-white shadow-inner"
                  placeholder="Nhập văn bản để nghe thử giọng nói..."
                />
              </div>

              <div className="flex flex-col sm:flex-row gap-4">
                <div className="flex-grow relative flex items-center">
                  <input 
                    value={seed}
                    onChange={e => setSeed(e.target.value)}
                    className="w-full bg-white dark:bg-black/40 border border-slate-200 dark:border-white/5 rounded-xl py-4 px-6 text-sm font-bold tracking-widest focus:border-brand-blue/30 outline-none text-slate-800 dark:text-white shadow-sm"
                    placeholder="Mã số hạt giống (Seed)..."
                  />
                  <button 
                    onClick={generateRandomSeed}
                    className="absolute right-4 p-2 bg-slate-100 dark:bg-white/5 hover:bg-slate-200 dark:hover:bg-white/10 rounded-lg text-slate-400 dark:text-gray-400 transition-all active:scale-90"
                  >
                    <RefreshCw size={18} />
                  </button>
                </div>
                <button 
                  onClick={handleGenerate}
                  disabled={isGenerating || !description.trim()}
                  className="px-12 py-4 sm:py-0 bg-slate-900 dark:bg-white/5 hover:bg-black dark:hover:bg-white/10 border border-slate-800 dark:border-white/5 rounded-xl text-white dark:text-gray-400 font-black uppercase tracking-[0.2em] text-[11px] transition-all flex flex-col items-center justify-center gap-1 disabled:opacity-20 shadow-xl"
                >
                  {isGenerating ? (
                    <>
                      <Loader2 size={18} className="animate-spin text-brand-blue" />
                      <span className="text-brand-blue animate-pulse">Đang tạo...</span>
                    </>
                  ) : (
                    <>
                      <span>Tạo giọng nói</span>
                      <span className="text-[8px] opacity-40 italic">Chi phí: {COST_PER_DESIGN} cr</span>
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* RIGHT COLUMN: RECENT & EXAMPLES */}
            <div className="lg:col-span-4 space-y-6">
              {/* Designed Voices Box */}
              <div className="bg-slate-50 dark:bg-[#141417] border border-slate-200 dark:border-white/5 rounded-2xl p-6 flex flex-col h-[300px] shadow-sm dark:shadow-none transition-colors">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-xs font-black uppercase tracking-[0.2em] text-slate-500 dark:text-gray-400">Giọng đã thiết kế</h3>
                  <div className="w-2 h-2 rounded-full bg-brand-blue animate-pulse"></div>
                </div>
                
                <div className="relative mb-6">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-300 dark:text-gray-600" size={14} />
                  <input 
                    placeholder="Tìm giọng..."
                    className="w-full bg-white dark:bg-black/40 border border-slate-100 dark:border-white/5 rounded-lg py-2.5 pl-10 pr-4 text-[10px] outline-none focus:border-brand-blue/20 text-slate-800 dark:text-white shadow-sm"
                  />
                </div>

                <div className="flex bg-slate-200/50 dark:bg-black/40 p-1 rounded-lg border border-slate-100 dark:border-white/5 mb-6">
                  <button className="flex-grow py-2 bg-white dark:bg-[#2a2a2e] rounded-md text-[9px] font-black uppercase tracking-widest text-slate-900 dark:text-white shadow-sm dark:shadow-xl">Hoạt động (0)</button>
                  <button className="flex-grow py-2 text-[9px] font-black uppercase tracking-widest text-slate-400 dark:text-gray-600">Hết hạn (0)</button>
                </div>

                <div className="flex-grow flex items-center justify-center text-center opacity-20">
                   <p className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-900 dark:text-white">Chưa có giọng nào</p>
                </div>
              </div>

              {/* Examples Box */}
              <div className="bg-slate-50 dark:bg-[#141417] border border-slate-200 dark:border-white/5 rounded-2xl p-6 space-y-6 shadow-sm transition-colors">
                 <h3 className="text-xs font-black uppercase tracking-[0.2em] text-slate-500 dark:text-gray-400 italic">Ví dụ</h3>
                 <div className="space-y-2">
                    {EXAMPLES.map((ex, i) => (
                      <button 
                        key={i}
                        onClick={() => setDescription(ex)}
                        className="w-full text-left p-4 bg-white dark:bg-black/20 border border-slate-200 dark:border-white/5 rounded-xl text-[11px] font-bold text-slate-500 dark:text-gray-500 hover:bg-slate-100 dark:hover:bg-black/40 hover:text-slate-900 dark:hover:text-white transition-all hover:border-brand-blue/20 shadow-sm"
                      >
                         {ex}
                      </button>
                    ))}
                 </div>
              </div>
            </div>
          </motion.div>
        ) : (
          /* RESULT STEP */
          <motion.div 
            key="result-step"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="grid grid-cols-1 lg:grid-cols-12 gap-6"
          >
             <div className="lg:col-span-8 space-y-6">
                {/* Collapsible Config Bar */}
                <div className="bg-slate-50 dark:bg-[#141417] border border-slate-200 dark:border-white/5 rounded-2xl overflow-hidden shadow-sm dark:shadow-xl transition-colors">
                  <button 
                    onClick={() => setIsSettingsOpen(!isSettingsOpen)}
                    className="w-full px-8 py-5 flex items-center justify-between group hover:bg-black/[0.02] dark:hover:bg-white/[0.02] transition-all"
                  >
                    <div className="flex items-center gap-4">
                      <span className="text-[10px] font-black uppercase tracking-widest text-slate-500 dark:text-gray-400">Cài đặt</span>
                      <span className="text-[10px] text-slate-400 dark:text-gray-600 font-bold italic truncate max-w-[400px]">- {description}</span>
                    </div>
                    <ChevronDown size={18} className={`text-slate-400 dark:text-gray-600 transition-transform duration-300 ${isSettingsOpen ? 'rotate-180' : ''}`} />
                  </button>
                  <AnimatePresence>
                    {isSettingsOpen && (
                      <motion.div 
                        initial={{ height: 0 }} animate={{ height: 'auto' }} exit={{ height: 0 }}
                        className="overflow-hidden border-t border-slate-200 dark:border-white/5"
                      >
                         <div className="p-8 space-y-4 text-xs font-medium text-slate-600 dark:text-gray-400 bg-slate-100/50 dark:bg-black/20 leading-relaxed italic transition-colors">
                            <p><strong className="text-slate-500 mr-2 uppercase text-[9px] tracking-widest">Mô tả:</strong> {description}</p>
                            <p><strong className="text-slate-500 mr-2 uppercase text-[9px] tracking-widest">Văn bản:</strong> {sampleText}</p>
                            <p><strong className="text-slate-500 mr-2 uppercase text-[9px] tracking-widest">Hạt giống:</strong> {seed}</p>
                            <button onClick={resetDesign} className="mt-4 text-brand-blue hover:underline font-black uppercase text-[9px] tracking-widest">Sửa thiết kế</button>
                         </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                {/* Selection Box */}
                <div className="bg-slate-50 dark:bg-[#141417] border border-slate-200 dark:border-white/5 rounded-2xl p-8 space-y-8 shadow-sm dark:shadow-2xl transition-colors">
                   <div className="flex justify-between items-center">
                      <h3 className="text-sm font-black uppercase italic tracking-tighter text-slate-900 dark:text-white">Chọn giọng bạn thích</h3>
                      <span className="text-[10px] font-bold text-slate-400 dark:text-gray-600 uppercase tracking-widest">{voices.length} mẫu</span>
                   </div>

                   <input 
                      placeholder="VD: Giọng đọc truyện"
                      className="w-full bg-white dark:bg-black/40 border border-slate-200 dark:border-white/5 rounded-xl p-5 text-sm font-bold tracking-tight outline-none focus:border-brand-blue/30 italic text-slate-800 dark:text-white shadow-inner"
                   />

                   <div className="space-y-3">
                      {voices.map((v) => (
                        <div 
                          key={v.id}
                          onClick={() => setSelectedVoiceId(v.id)}
                          className={`flex items-center justify-between p-5 rounded-2xl border-2 transition-all cursor-pointer group ${selectedVoiceId === v.id ? 'bg-white dark:bg-[#1b1b1f] border-brand-blue shadow-[0_0_30px_rgba(0,144,255,0.1)] dark:shadow-[0_0_30px_rgba(0,144,255,0.1)]' : 'bg-white dark:bg-black/20 border-transparent hover:border-slate-200 dark:hover:border-white/10'}`}
                        >
                           <div className="flex items-center gap-6">
                              <button 
                                onClick={(e) => { e.stopPropagation(); if (v.buffer) playBuffer(v.buffer, v.id); }}
                                className={`w-12 h-12 rounded-full flex items-center justify-center transition-all ${isPlayingId === v.id ? 'bg-brand-blue text-white shadow-lg' : 'bg-slate-100 dark:bg-white/5 group-hover:bg-slate-200 dark:group-hover:bg-white/10 text-slate-400 dark:text-gray-400'}`}
                              >
                                 {isPlayingId === v.id ? <Pause size={20} fill="currentColor" /> : <Play size={20} className="ml-1" fill="currentColor" />}
                              </button>
                              <div>
                                 <h4 className="text-base font-black italic tracking-tighter text-slate-900 dark:text-white">{v.label}</h4>
                                 <span className="text-[10px] font-bold text-slate-400 dark:text-gray-600 uppercase tracking-widest">{v.duration}</span>
                              </div>
                           </div>
                           <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all ${selectedVoiceId === v.id ? 'bg-brand-blue border-brand-blue' : 'border-slate-200 dark:border-white/10'}`}>
                              {selectedVoiceId === v.id && <Check size={14} strokeWidth={4} className="text-white" />}
                           </div>
                        </div>
                      ))}
                   </div>

                   <button 
                     disabled={!selectedVoiceId}
                     className={`w-full py-5 rounded-xl font-black uppercase tracking-[0.3em] text-[11px] shadow-2xl flex items-center justify-center gap-4 transition-all active:scale-95 ${selectedVoiceId ? 'bg-slate-900 dark:bg-gray-200 text-white dark:text-black hover:bg-black dark:hover:bg-white' : 'bg-slate-200 dark:bg-white/5 text-slate-400 dark:text-gray-700 cursor-not-allowed'}`}
                   >
                      <Save size={18} />
                      Chọn giọng để lưu
                   </button>
                </div>
             </div>

             {/* RIGHT COLUMN IN RESULT (SAME AS INPUT) */}
             <div className="lg:col-span-4 space-y-6">
               <div className="bg-slate-50 dark:bg-[#141417] border border-slate-200 dark:border-white/5 rounded-2xl p-6 flex flex-col h-[300px] shadow-sm transition-colors">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-xs font-black uppercase tracking-[0.2em] text-slate-500 dark:text-gray-400">Giọng đã thiết kế</h3>
                  <div className="w-2 h-2 rounded-full bg-brand-blue animate-pulse"></div>
                </div>
                <div className="relative mb-6">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-300 dark:text-gray-600" size={14} />
                  <input 
                    placeholder="Tìm giọng..."
                    className="w-full bg-white dark:bg-black/40 border border-slate-100 dark:border-white/5 rounded-lg py-2.5 pl-10 pr-4 text-[10px] outline-none focus:border-brand-blue/20 text-slate-800 dark:text-white shadow-sm"
                  />
                </div>
                <div className="flex bg-slate-200/50 dark:bg-black/40 p-1 rounded-lg border border-slate-100 dark:border-white/5 mb-6">
                  <button className="flex-grow py-2 bg-white dark:bg-[#2a2a2e] rounded-md text-[9px] font-black uppercase tracking-widest text-slate-900 dark:text-white shadow-sm dark:shadow-xl">Hoạt động (0)</button>
                  <button className="flex-grow py-2 text-[9px] font-black uppercase tracking-widest text-slate-400 dark:text-gray-600">Hết hạn (0)</button>
                </div>
                <div className="flex-grow flex items-center justify-center text-center opacity-20">
                   <p className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-900 dark:text-white">Chưa có giọng nào</p>
                </div>
              </div>

              <button onClick={resetDesign} className="w-full py-4 border border-dashed border-slate-300 dark:border-white/10 rounded-2xl text-[10px] font-black uppercase tracking-widest text-slate-400 dark:text-gray-600 hover:text-slate-900 dark:hover:text-white hover:border-slate-400 dark:hover:border-white/30 transition-all flex items-center justify-center gap-3">
                 <RefreshCw size={14} /> Tạo thiết kế mới
              </button>
             </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* LOW CREDIT DIALOG */}
      <AnimatePresence>
        {showLowCreditAlert && (
          <motion.div 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-[1100] bg-black/60 dark:bg-black/80 backdrop-blur-md flex items-center justify-center p-6"
          >
             <motion.div 
               initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }}
               className="max-w-md w-full bg-white dark:bg-[#111114] p-12 border border-slate-200 dark:border-white/10 rounded-[2rem] text-center space-y-8 shadow-2xl transition-colors"
             >
                <div className="w-24 h-24 bg-amber-500/10 border border-amber-500/20 rounded-full flex items-center justify-center mx-auto text-amber-500 shadow-xl dark:shadow-[0_0_40px_rgba(245,158,11,0.2)]">
                   <AlertTriangle size={48} />
                </div>
                <div className="space-y-4">
                   <h3 className="text-3xl font-black uppercase tracking-tighter italic text-slate-900 dark:text-white">Quota Depleted</h3>
                   <p className="text-sm text-slate-500 dark:text-gray-400 font-bold leading-relaxed uppercase tracking-tight">
                     Voice Design requires **{COST_PER_DESIGN} credits** per synthesis. <br />
                     Your current node balance is too low.
                   </p>
                </div>
                <div className="flex flex-col gap-4">
                   <Link to="/credits" className="bg-[#7C7CFF] text-white py-5 rounded-2xl text-[12px] font-black uppercase tracking-[0.4em] shadow-2xl hover:brightness-110 transition-colors text-center">Nạp thêm Credits</Link>
                   <button onClick={() => setShowLowCreditAlert(false)} className="text-[10px] font-black uppercase text-slate-400 dark:text-gray-500 hover:text-slate-900 dark:hover:text-white transition-colors tracking-widest underline underline-offset-8">Để sau</button>
                </div>
             </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
      
      {/* HUD FOOTER INFO */}
      <div className="mt-12 flex justify-between items-center text-[8px] font-black uppercase tracking-[0.3em] text-slate-400 dark:text-gray-700 px-2 transition-colors">
         <div className="flex gap-8">
            <span className="flex items-center gap-2"><CheckCircle2 size={12} className="text-brand-blue" /> NODE: LOCAL_INFERENCE_READY</span>
            <span className="flex items-center gap-2"><ShieldCheck size={12} className="text-emerald-500" /> PRIVACY: ZERO_KNOWLEDGE</span>
         </div>
         <span className="italic opacity-30">ElevenLabs Architecture v4.2</span>
      </div>
    </div>
  );
};

export default VoiceDesignWorkspace;
