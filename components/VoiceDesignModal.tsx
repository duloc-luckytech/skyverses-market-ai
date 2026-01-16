
import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  X, Zap, Sparkles, User, Mic2, 
  Upload, RefreshCw, AudioLines, Info, 
  ChevronRight, ArrowRight, ShieldAlert,
  Save, Play, Volume2, Database, AlignLeft, Layout
} from 'lucide-react';

interface VoiceDesignModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const VoiceDesignModal: React.FC<VoiceDesignModalProps> = ({ isOpen, onClose }) => {
  const [activeTab, setActiveTab] = useState<'CREATE' | 'CLONE'>('CREATE');
  const [voiceName, setVoiceName] = useState('');
  const [description, setDescription] = useState('');
  const [sampleText, setSampleText] = useState('');
  const [seed, setSeed] = useState('');
  
  const [cloneFile, setCloneFile] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[600] flex items-center justify-center p-4 lg:p-10">
      <motion.div 
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        className="absolute inset-0 bg-black/90 backdrop-blur-xl" onClick={onClose} 
      />
      
      <motion.div 
        initial={{ scale: 0.95, opacity: 0, y: 20 }} animate={{ scale: 1, opacity: 1, y: 0 }}
        className="relative w-full max-w-4xl bg-[#141417] border border-white/5 rounded-3xl overflow-hidden flex flex-col shadow-3xl max-h-[90vh]"
      >
        <div className="p-8 border-b border-white/5 flex items-center justify-between shrink-0">
           <div className="flex items-center gap-6">
              <div className="w-14 h-14 bg-[#ff4b3a]/20 border border-[#ff4b3a]/20 rounded-2xl flex items-center justify-center text-[#ff4b3a] shadow-lg">
                 <Sparkles size={28} />
              </div>
              <div className="space-y-1">
                 <h2 className="text-2xl font-black uppercase tracking-tighter italic">Thiết kế giọng nói AI</h2>
                 <p className="text-xs text-gray-500 font-bold uppercase tracking-widest">Tạo giọng nói độc đáo với AI</p>
              </div>
           </div>
           <button onClick={onClose} className="p-2 text-gray-400 hover:text-white transition-colors"><X size={32}/></button>
        </div>

        <div className="flex bg-black/40 p-1 shrink-0">
           <button 
             onClick={() => setActiveTab('CREATE')}
             className={`flex-grow py-5 text-[11px] font-black uppercase tracking-[0.4em] transition-all flex items-center justify-center gap-4 ${activeTab === 'CREATE' ? 'bg-[#2a2a2e] text-[#ff4b3a] shadow-xl border-b-2 border-[#ff4b3a]' : 'text-gray-500 hover:text-white'}`}
           >
              <Sparkles size={16} fill={activeTab === 'CREATE' ? 'currentColor' : 'none'} /> Tạo giọng mới
           </button>
           <button 
             onClick={() => setActiveTab('CLONE')}
             className={`flex-grow py-5 text-[11px] font-black uppercase tracking-[0.4em] transition-all flex items-center justify-center gap-4 ${activeTab === 'CLONE' ? 'bg-[#2a2a2e] text-[#ff4b3a] shadow-xl border-b-2 border-[#ff4b3a]' : 'text-gray-500 hover:text-white'}`}
           >
              <Layout size={16} /> Clone giọng
           </button>
        </div>

        <div className="flex-grow overflow-y-auto no-scrollbar p-10 space-y-10">
           <AnimatePresence mode="wait">
              {activeTab === 'CREATE' ? (
                 <motion.div key="create" initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} className="space-y-10">
                    <div className="space-y-4">
                       <label className="text-[10px] font-black uppercase text-gray-400 tracking-[0.4em] flex items-center gap-3">
                          <User size={14} /> TÊN GIỌNG NÓI
                       </label>
                       <input 
                         value={voiceName} onChange={e => setVoiceName(e.target.value)}
                         className="w-full bg-black/40 border border-white/5 rounded-xl p-5 text-sm font-bold tracking-tight outline-none focus:border-[#ff4b3a]/50 transition-all"
                         placeholder="VD: Giọng MC chuyên nghiệp"
                       />
                    </div>

                    <div className="space-y-4">
                       <div className="flex justify-between items-center">
                          <label className="text-[10px] font-black uppercase text-gray-400 tracking-[0.4em] flex items-center gap-3">
                             <AlignLeft size={14} /> MÔ TẢ GIỌNG NÓI <span className="text-[#ff4b3a]">*</span>
                          </label>
                       </div>
                       <textarea 
                         value={description} onChange={e => setDescription(e.target.value)}
                         className="w-full h-32 bg-black/40 border border-white/5 rounded-xl p-5 text-sm font-medium focus:border-[#ff4b3a]/50 outline-none transition-all resize-none leading-relaxed italic text-white"
                         placeholder="Mô tả đặc điểm giọng nói: giới tính, độ tuổi, giọng vùng miền, cảm xúc..."
                       />
                    </div>

                    <div className="space-y-4">
                       <label className="text-[10px] font-black uppercase text-gray-400 tracking-[0.4em] flex items-center gap-3">
                          <Volume2 size={14} /> VĂN BẢN MẪU <span className="text-[#ff4b3a]">*</span>
                       </label>
                       <textarea 
                         value={sampleText} onChange={e => setSampleText(e.target.value)}
                         className="w-full h-32 bg-black/40 border border-white/5 rounded-xl p-5 text-sm font-medium focus:border-[#ff4b3a]/50 outline-none transition-all resize-none leading-relaxed italic text-white"
                         placeholder="Nhập đoạn văn bản để AI đọc mẫu..."
                       />
                    </div>

                    <div className="space-y-4">
                       <label className="text-[10px] font-black uppercase text-gray-400 tracking-[0.4em] flex items-center gap-3">
                          <Database size={14} /> SEED (TÙY CHỌN)
                       </label>
                       <div className="flex gap-4">
                          <input 
                            value={seed} onChange={e => setSeed(e.target.value)}
                            className="flex-grow bg-black/40 border border-white/5 rounded-xl p-5 text-sm font-bold tracking-widest outline-none focus:border-[#ff4b3a]/50 transition-all text-white"
                            placeholder="Để trống để tự động tạo"
                          />
                          <button onClick={() => setSeed(Math.floor(Math.random()*10000000).toString())} className="p-5 bg-white/5 border border-white/10 rounded-xl hover:bg-white/10 transition-all"><RefreshCw size={18}/></button>
                       </div>
                    </div>
                 </motion.div>
              ) : (
                 <motion.div key="clone" initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} className="space-y-10">
                    <div className="space-y-4">
                       <label className="text-[10px] font-black uppercase text-gray-400 tracking-[0.4em] flex items-center gap-3">
                          <User size={14} /> TÊN GIỌNG CLONE
                       </label>
                       <input 
                         className="w-full bg-black/40 border border-white/5 rounded-xl p-5 text-sm font-bold outline-none focus:border-[#ff4b3a]/50 transition-all text-white"
                         placeholder="VD: Giọng của tôi"
                       />
                    </div>

                    <div className="space-y-4">
                       <label className="text-[10px] font-black uppercase text-gray-400 tracking-[0.4em] flex items-center gap-3">
                          <Upload size={14} /> TẢI LÊN MẪU GIỌNG
                       </label>
                       <div 
                         onClick={() => fileInputRef.current?.click()}
                         className="w-full h-64 border-2 border-dashed border-white/5 rounded-2xl bg-black/40 flex flex-col items-center justify-center gap-6 cursor-pointer hover:border-[#ff4b3a]/30 transition-all group overflow-hidden"
                       >
                          <div className="w-20 h-20 rounded-full bg-white/5 flex items-center justify-center text-[#ff4b3a]/30 group-hover:scale-110 transition-transform shadow-inner">
                             <AudioLines size={40} />
                          </div>
                          <div className="text-center space-y-1">
                             <h4 className="text-lg font-black uppercase tracking-tight italic">Nhấn để tải lên</h4>
                             <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">MP3, WAV, M4A - Tối đa 10MB</p>
                          </div>
                          <input type="file" ref={fileInputRef} className="hidden" accept="audio/*" onChange={e => setCloneFile(e.target.files?.[0]?.name || null)} />
                       </div>
                    </div>

                    <div className="p-6 bg-[#ff4b3a]/5 border border-[#ff4b3a]/10 rounded-xl flex gap-6 items-start">
                       <Info className="text-[#ff4b3a] shrink-0 mt-0.5" size={20} />
                       <p className="text-xs text-gray-400 leading-relaxed font-medium">
                          Voice Clone sử dụng mẫu giọng nói của bạn để tạo ra một giọng AI tương tự. 
                       </p>
                    </div>
                 </motion.div>
              )}
           </AnimatePresence>
        </div>

        <div className="p-8 border-t border-white/5 shrink-0 bg-black/20">
           <button className="w-full py-6 bg-[#ff4b3a] text-white rounded-xl text-xs font-black uppercase tracking-[0.4em] transition-all shadow-xl active:scale-[0.98] flex items-center justify-center gap-4 group">
              <Zap size={18} fill="currentColor" className="group-hover:rotate-12 transition-transform" /> 
              {activeTab === 'CREATE' ? 'Tạo mẫu giọng nói' : 'Khởi tạo Clone'}
           </button>
        </div>
      </motion.div>
    </div>
  );
};

export default VoiceDesignModal;
