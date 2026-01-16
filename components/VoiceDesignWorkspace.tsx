
import React, { useState, useEffect, useRef, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Zap, Loader2, X, AlertTriangle, Coins, List, Maximize2
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { API_BASE_URL, getHeaders } from '../apis/config';
import { Link } from 'react-router-dom';
import VoiceDesignLibrary, { DesignedVoice } from './VoiceDesignLibrary';

const EXAMPLES = [
  "Giọng nữ trẻ, ngọt ngào, đọc tin tức",
  "Giọng nam trầm ấm, MC chuyên nghiệp",
  "Giọng trẻ em vui vẻ, quảng cáo",
  "Giọng nữ trung niên, sang trọng",
  "Giọng kể chuyện ma mị, trầm thấp"
];

const STORAGE_KEY = 'skyverses_generated_voices';

const VoiceDesignWorkspace: React.FC = () => {
  const { credits, useCredits, isAuthenticated, login, refreshUserInfo } = useAuth();
  const [description, setDescription] = useState('');
  const [sampleText, setSampleText] = useState('Chào mừng bạn đến với tương lai của âm thanh kỹ thuật số. Hệ thống của chúng tôi tạo ra những giọng nói chân thực từ mô tả của bạn.');
  const [isGenerating, setIsGenerating] = useState(false);
  const [isPlayingId, setIsPlayingId] = useState<string | null>(null);
  const [generatedVoices, setGeneratedVoices] = useState<DesignedVoice[]>([]);
  const [showLowCreditAlert, setShowLowCreditAlert] = useState(false);
  const [searchSaved, setSearchSaved] = useState('');
  const [showExamples, setShowExamples] = useState(false);
  const [isTextModalOpen, setIsTextModalOpen] = useState(false);

  const audioCtxRef = useRef<AudioContext | null>(null);
  const sourceNodeRef = useRef<AudioBufferSourceNode | null>(null);
  const examplesRef = useRef<HTMLDivElement>(null);

  const COST_PER_DESIGN = 500;

  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setGeneratedVoices(parsed);
      } catch (e) {
        console.error("Failed to load history", e);
      }
    }

    const handleClickOutside = (event: MouseEvent) => {
      if (examplesRef.current && !examplesRef.current.contains(event.target as Node)) {
        setShowExamples(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const getAudioCtx = () => {
    if (!audioCtxRef.current) {
      const AudioContextClass = (window as any).AudioContext || (window as any).webkitAudioContext;
      if (AudioContextClass) {
        audioCtxRef.current = new AudioContextClass();
      }
    }
    return audioCtxRef.current;
  };

  const decodeBase64ToBuffer = async (base64: string): Promise<AudioBuffer | null> => {
    const ctx = getAudioCtx();
    if (!ctx) return null;
    
    const binaryString = atob(base64);
    const len = binaryString.length;
    const bytes = new Uint8Array(len);
    for (let i = 0; i < len; i++) {
      bytes[i] = binaryString.charCodeAt(i);
    }
    return await ctx.decodeAudioData(bytes.buffer);
  };

  const stopPlayback = () => {
    if (sourceNodeRef.current) {
      try { sourceNodeRef.current.stop(); } catch (e) {}
      sourceNodeRef.current = null;
    }
    setIsPlayingId(null);
  };

  const handlePlayVoice = async (voice: DesignedVoice) => {
    if (isPlayingId === voice.id) {
      stopPlayback();
      return;
    }
    stopPlayback();

    let buffer = voice.buffer;
    if (!buffer && voice.base64) {
      buffer = await decodeBase64ToBuffer(voice.base64);
    }

    if (buffer) {
      const ctx = getAudioCtx();
      if (!ctx) return;
      
      const source = ctx.createBufferSource();
      source.buffer = buffer;
      source.connect(ctx.destination);
      source.onended = () => setIsPlayingId(null);
      source.start(0);
      sourceNodeRef.current = source;
      setIsPlayingId(voice.id);
    }
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
      const response = await fetch(`${API_BASE_URL}/audio`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify({
          prompt: description,
          text: sampleText,
          seed: Math.floor(Math.random() * 9999999)
        })
      });

      const result = await response.json();

      if (result.success && Array.isArray(result.data)) {
        useCredits(COST_PER_DESIGN);
        
        const now = new Date();
        const newVoices: DesignedVoice[] = await Promise.all(
          result.data.map(async (item: any, i: number) => {
            let buffer: AudioBuffer | null = null;
            if (item.audio_base_64) {
              try {
                buffer = await decodeBase64ToBuffer(item.audio_base_64);
              } catch (e) {
                console.error("Decoding error", e);
              }
            }
            
            return {
              id: `v-${Date.now()}-${i}`,
              label: sampleText.slice(0, 40) + (sampleText.length > 40 ? '...' : ''),
              prompt: description.slice(0, 30) + (description.length > 30 ? '...' : ''),
              duration: buffer ? `${Math.round(buffer.duration)}s` : 'N/A',
              timestamp: now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
              date: now.toLocaleDateString('vi-VN'),
              buffer,
              base64: item.audio_base_64
            };
          })
        );
        
        const updatedList = [...newVoices, ...generatedVoices];
        setGeneratedVoices(updatedList);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedList.map(v => ({ ...v, buffer: null })))); 
        
        refreshUserInfo();
      } else {
        alert(result.message || "Không thể khởi tạo thực thể giọng nói. Vui lòng thử lại.");
      }
    } catch (e) {
      console.error("API Error:", e);
      alert("Lỗi kết nối máy chủ thiết kế.");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleDeleteVoice = (id: string) => {
    const updated = generatedVoices.filter(v => v.id !== id);
    setGeneratedVoices(updated);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated.map(v => ({ ...v, buffer: null }))));
    if (isPlayingId === id) stopPlayback();
  };

  const handleDownloadVoice = (voice: DesignedVoice) => {
    if (!voice.base64) return;
    const blob = new Blob([new Uint8Array(atob(voice.base64).split("").map(c => c.charCodeAt(0)))], { type: 'audio/mpeg' });
    const url = window.URL.createObjectURL(blob);
    const a = document.body.appendChild(document.createElement('a'));
    a.href = url;
    a.download = `voice_${Date.now()}.mp3`;
    a.click();
    a.remove();
    window.URL.revokeObjectURL(url);
  };

  const applyQuickTemplate = (p: string, t: string) => {
    setDescription(p);
    setSampleText(t);
  };

  const filteredVoices = useMemo(() => 
    generatedVoices.filter(v => 
      v.label.toLowerCase().includes(searchSaved.toLowerCase()) || 
      v.prompt.toLowerCase().includes(searchSaved.toLowerCase())
    ), 
  [generatedVoices, searchSaved]);

  return (
    <div className="bg-white dark:bg-[#0c0c0e] min-h-[700px] w-full flex flex-col p-6 text-slate-800 dark:text-white font-sans selection:bg-brand-blue/30 transition-colors duration-500">
      
      <div className="flex-grow flex flex-col lg:flex-row gap-6 overflow-hidden">
        {/* LEFT COLUMN: CONFIG (1/3) */}
        <div className="w-full lg:w-1/3 flex flex-col gap-6 overflow-y-auto no-scrollbar pr-1">
          <div className="space-y-6">
            <div className="bg-slate-50 dark:bg-[#141417] border border-slate-200 dark:border-white/5 rounded-2xl p-6 space-y-6 shadow-sm dark:shadow-2xl transition-colors">
              <div className="space-y-3 relative">
                <div className="flex justify-between items-center">
                  <label className="text-[10px] font-black uppercase text-slate-400 dark:text-gray-500 tracking-[0.2em]">Mô tả giọng nói</label>
                  <div className="relative" ref={examplesRef}>
                    <button 
                      onClick={() => setShowExamples(!showExamples)}
                      className="flex items-center gap-1.5 px-3 py-1.5 bg-brand-blue/10 rounded-lg text-[9px] font-black text-brand-blue uppercase hover:bg-brand-blue/20 transition-all"
                    >
                      <List size={12} />
                      Mẫu gợi ý
                    </button>
                    <AnimatePresence>
                      {showExamples && (
                        <motion.div 
                          initial={{ opacity: 0, y: 5, scale: 0.95 }}
                          animate={{ opacity: 1, y: 0, scale: 1 }}
                          exit={{ opacity: 0, y: 5, scale: 0.95 }}
                          className="absolute top-full right-0 mt-2 w-56 bg-white dark:bg-[#1c1c1f] border border-slate-200 dark:border-white/10 rounded-xl shadow-2xl z-[100] overflow-hidden p-2"
                        >
                          {EXAMPLES.map((ex, i) => (
                            <button
                              key={i}
                              onClick={() => { setDescription(ex); setShowExamples(false); }}
                              className="w-full text-left p-3 text-[10px] font-bold text-slate-600 dark:text-gray-400 hover:bg-slate-50 dark:hover:bg-white/5 rounded-lg transition-colors border-b border-black/5 dark:border-white/5 last:border-0"
                            >
                              {ex}
                            </button>
                          ))}
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </div>
                <textarea 
                  value={description}
                  onChange={e => setDescription(e.target.value)}
                  className="w-full h-32 bg-white dark:bg-black/40 border border-slate-200 dark:border-white/5 rounded-xl p-4 text-sm font-medium focus:border-brand-blue/30 outline-none transition-all resize-none leading-relaxed text-slate-800 dark:text-white shadow-inner"
                  placeholder="Ví dụ: Giọng nữ trẻ, ngọt ngào, ấm áp..."
                />
              </div>

              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <label className="text-[10px] font-black uppercase text-slate-400 dark:text-gray-500 tracking-[0.2em]">VĂN BẢN MẪU</label>
                  <div className="flex items-center gap-3">
                    <span className="text-[9px] font-bold text-slate-300 dark:text-gray-600 uppercase tracking-widest">{sampleText.length} chars</span>
                    <button 
                      onClick={() => setIsTextModalOpen(true)}
                      className="p-1.5 bg-slate-100 dark:bg-white/5 rounded-lg text-slate-400 hover:text-brand-blue transition-all"
                      title="Mở rộng khung nhập"
                    >
                      <Maximize2 size={12} />
                    </button>
                  </div>
                </div>
                <textarea 
                  value={sampleText}
                  onChange={e => setSampleText(e.target.value)}
                  className="w-full h-32 bg-white dark:bg-black/40 border border-slate-200 dark:border-white/5 rounded-xl p-4 text-sm font-medium focus:border-brand-blue/30 outline-none transition-all resize-none leading-relaxed text-slate-800 dark:text-white shadow-inner"
                  placeholder="Nhập văn bản mẫu..."
                />
              </div>

              <div className="pt-2 space-y-4">
                <div className="flex items-center justify-between bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 p-3 rounded-2xl">
                    <div className="flex items-center gap-2">
                      <Coins size={14} className="text-brand-blue" />
                      <span className="text-xs font-black text-brand-blue">{credits.toLocaleString()} CR</span>
                    </div>
                    <div className="flex items-center gap-1 text-[10px] font-bold text-gray-400 uppercase italic">
                       Cost: {COST_PER_DESIGN}
                    </div>
                </div>

                <button 
                  onClick={handleGenerate}
                  disabled={isGenerating || !description.trim()}
                  className="w-full py-5 bg-slate-900 dark:bg-white/10 hover:bg-black dark:hover:bg-white/20 border border-slate-800 dark:border-white/5 rounded-xl text-white font-black uppercase tracking-[0.3em] text-[11px] transition-all flex items-center justify-center gap-3 disabled:opacity-20 shadow-xl"
                >
                  {isGenerating ? (
                    <>
                      <Loader2 size={18} className="animate-spin text-brand-blue" />
                      <span className="text-brand-blue animate-pulse">Đang thiết kế...</span>
                    </>
                  ) : (
                    <>
                      <Zap size={18} fill="currentColor" />
                      <span>Khởi tạo giọng</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: LIBRARY (2/3) - MOVED TO COMPONENT */}
        <VoiceDesignLibrary 
          voices={filteredVoices}
          isPlayingId={isPlayingId}
          searchQuery={searchSaved}
          setSearchQuery={setSearchSaved}
          onPlay={handlePlayVoice}
          onDelete={handleDeleteVoice}
          onDownload={handleDownloadVoice}
          onApplyTemplate={applyQuickTemplate}
        />
      </div>

      <AnimatePresence>
        {isTextModalOpen && (
          <motion.div 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-[1200] bg-black/60 dark:bg-black/90 backdrop-blur-md flex items-center justify-center p-6"
          >
            <motion.div 
              initial={{ scale: 0.95, y: 20 }} animate={{ scale: 1, y: 0 }}
              className="bg-white dark:bg-[#111114] border border-slate-200 dark:border-white/10 rounded-[2rem] w-full max-w-4xl flex flex-col overflow-hidden shadow-3xl"
            >
              <div className="p-8 border-b border-black/5 dark:border-white/5 flex items-center justify-between bg-slate-50 dark:bg-black/20">
                 <div className="flex items-center gap-4">
                    <Maximize2 size={20} className="text-brand-blue" />
                    <h3 className="text-xl font-black uppercase italic tracking-tighter text-slate-900 dark:text-white">Văn bản mẫu mở rộng</h3>
                 </div>
                 <button onClick={() => setIsTextModalOpen(false)} className="p-2 text-slate-400 hover:text-red-500 transition-colors"><X size={24} /></button>
              </div>
              <div className="p-8 flex-grow">
                 <textarea 
                   value={sampleText}
                   onChange={e => setSampleText(e.target.value)}
                   className="w-full h-[400px] bg-transparent border-none text-slate-900 dark:text-gray-200 text-lg font-medium text-slate-700 dark:text-gray-200 outline-none resize-none leading-relaxed italic no-scrollbar"
                   placeholder="Nhập văn bản dài tại đây..."
                   autoFocus
                 />
              </div>
              <div className="p-8 border-t border-black/5 dark:border-white/5 flex justify-between items-center bg-slate-50 dark:bg-black/20">
                 <span className="text-[10px] font-black uppercase text-slate-400 tracking-widest">{sampleText.length} ký tự</span>
                 <button 
                   onClick={() => setIsTextModalOpen(false)}
                   className="bg-brand-blue text-white px-10 py-4 rounded-xl text-xs font-black uppercase tracking-widest shadow-xl hover:brightness-110 active:scale-95 transition-all"
                 >
                   Hoàn tất
                 </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

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
                   <h3 className="text-3xl font-black uppercase tracking-tighter italic text-slate-900 dark:text-white">Hạn ngạch cạn kiệt</h3>
                   <p className="text-sm text-slate-500 dark:text-gray-400 font-bold leading-relaxed uppercase tracking-tight">
                     Thiết kế giọng nói yêu cầu **{COST_PER_DESIGN} credits** mỗi chu kỳ tổng hợp. <br />
                     Vui lòng nạp thêm để tiếp tục.
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
      
      <div className="mt-6 flex justify-end items-center text-[8px] font-black uppercase tracking-[0.3em] text-slate-400 dark:text-gray-700 px-2 transition-colors">
         <span className="italic opacity-30">ElevenLabs Architecture v4.2</span>
      </div>
    </div>
  );
};

export default VoiceDesignWorkspace;
