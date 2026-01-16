
import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Play, Pause, Download, Trash2, Search, Volume2, 
  Sparkles, Zap, Mic2, ArrowRight, Lightbulb,
  CheckCircle2, Info
} from 'lucide-react';

export interface DesignedVoice {
  id: string;
  label: string; 
  prompt: string;
  duration: string;
  timestamp: string;
  date: string;
  buffer: AudioBuffer | null;
  base64?: string;
}

const START_TEMPLATES = [
  {
    title: "MC Chuyên Nghiệp",
    prompt: "Giọng nam miền Bắc, trầm ấm, chững chạc, phong cách bản tin thời sự.",
    text: "Chào buổi sáng quý vị thính giả. Bản tin Skyverses hôm nay sẽ mang đến những cập nhật mới nhất về công nghệ AI.",
    color: "from-blue-500/10 to-indigo-500/10"
  },
  {
    title: "Kể Chuyện Cổ Tích",
    prompt: "Giọng nữ trẻ, ngọt ngào, truyền cảm, nhịp đọc chậm và êm ái.",
    text: "Ngày xửa ngày xưa, ở một vùng đất xa xôi có một vương quốc của những linh hồn kỹ thuật số...",
    color: "from-purple-500/10 to-pink-500/10"
  },
  {
    title: "Quảng Cáo Sôi Động",
    prompt: "Giọng nam trẻ, năng động, hào hứng, giọng miền Nam, tốc độ hơi nhanh.",
    text: "Sẵn sàng bứt phá giới hạn cùng Skyverses Market! Đăng ký ngay hôm nay để nhận ưu đãi cực khủng!",
    color: "from-orange-500/10 to-amber-500/10"
  }
];

interface VoiceDesignLibraryProps {
  voices: DesignedVoice[];
  isPlayingId: string | null;
  searchQuery: string;
  setSearchQuery: (val: string) => void;
  onPlay: (voice: DesignedVoice) => void;
  onDelete: (id: string) => void;
  onDownload: (voice: DesignedVoice) => void;
  onApplyTemplate?: (prompt: string, text: string) => void;
}

const VoiceDesignLibrary: React.FC<VoiceDesignLibraryProps> = ({
  voices,
  isPlayingId,
  searchQuery,
  setSearchQuery,
  onPlay,
  onDelete,
  onDownload,
  onApplyTemplate
}) => {
  return (
    <div className="flex-grow flex flex-col bg-slate-50 dark:bg-[#141417] border border-slate-200 dark:border-white/5 rounded-2xl shadow-sm transition-colors overflow-hidden">
      <div className="p-6 shrink-0 space-y-6 border-b border-black/5 dark:border-white/5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Volume2 size={18} className="text-brand-blue" />
            <h3 className="text-sm font-black uppercase tracking-[0.2em] text-slate-500 dark:text-gray-400">Thư viện giọng đã thiết kế</h3>
          </div>
          {voices.length > 0 && <div className="w-2 h-2 rounded-full bg-brand-blue animate-pulse"></div>}
        </div>
        
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
          <input 
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="Tìm kiếm giọng nói..."
            className="w-full bg-white dark:bg-black/40 border border-slate-200 dark:border-white/10 rounded-xl py-3 pl-12 pr-4 text-xs font-bold outline-none focus:border-brand-blue/20 text-slate-800 dark:text-white shadow-sm"
          />
        </div>
      </div>

      <div className="flex-grow overflow-y-auto no-scrollbar p-6">
        <AnimatePresence mode="popLayout">
          {voices.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {voices.map((v, idx) => (
                <motion.div 
                  key={v.id} 
                  layout 
                  initial={{ opacity: 0, scale: 0.95 }} 
                  animate={{ opacity: 1, scale: 1 }} 
                  exit={{ opacity: 0, scale: 0.95 }}
                  className="p-5 bg-white dark:bg-white/[0.03] border border-black/5 dark:border-white/5 rounded-2xl group hover:border-brand-blue/30 transition-all shadow-sm relative overflow-hidden"
                >
                  <div className="absolute -top-1 -left-1 w-7 h-7 bg-slate-50 dark:bg-white/5 border border-black/5 dark:border-white/5 flex items-center justify-center rounded-br-xl text-[9px] font-black text-slate-400 z-10">
                    {(voices.length - idx).toString().padStart(2, '0')}
                  </div>

                  <div className="flex justify-between items-start mb-4 pl-4">
                    <div className="space-y-1 min-w-0 flex-grow">
                      <h4 className="text-[13px] font-black uppercase italic text-slate-900 dark:text-white truncate">"{v.label}"</h4>
                      <p className="text-[9px] font-bold text-brand-blue uppercase tracking-widest leading-none truncate opacity-60">{v.prompt}</p>
                    </div>
                    <div className="flex gap-1 shrink-0 ml-4 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button onClick={() => onDownload(v)} className="p-2 bg-slate-50 dark:bg-white/5 rounded-lg text-slate-400 hover:text-brand-blue transition-colors" title="Tải xuống"><Download size={14}/></button>
                      <button onClick={() => onDelete(v.id)} className="p-2 bg-slate-50 dark:bg-white/5 rounded-lg text-slate-400 hover:text-red-500 transition-colors" title="Xóa"><Trash2 size={14}/></button>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between gap-3">
                    <button 
                      onClick={() => onPlay(v)}
                      className={`flex-grow py-3 rounded-xl text-[10px] font-black uppercase flex items-center justify-center gap-2 transition-all ${isPlayingId === v.id ? 'bg-brand-blue text-white shadow-lg shadow-brand-blue/20' : 'bg-slate-50 dark:bg-white/5 text-gray-500 hover:text-slate-900 dark:hover:text-white border border-transparent dark:border-white/5'}`}
                    >
                      {isPlayingId === v.id ? <Pause size={14} fill="currentColor" /> : <Play size={14} fill="currentColor" className="ml-0.5" />} 
                      {isPlayingId === v.id ? 'Đang phát' : 'Nghe thử'}
                    </button>
                    <div className="flex flex-col items-end shrink-0">
                      <span className="text-[8px] font-black text-slate-300 dark:text-gray-700 uppercase tracking-widest">{v.date}</span>
                      <span className="text-[9px] font-bold text-slate-400 dark:text-gray-500 uppercase tracking-widest">{v.duration}</span>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          ) : (
            <motion.div 
              initial={{ opacity: 0 }} 
              animate={{ opacity: 1 }} 
              className="h-full flex flex-col space-y-12 py-6"
            >
              {/* GUIDE SECTION */}
              <div className="space-y-6">
                 <div className="flex items-center gap-3">
                    <div className="p-2 bg-brand-blue/10 rounded-lg text-brand-blue">
                       <Lightbulb size={18} />
                    </div>
                    <h4 className="text-sm font-black uppercase tracking-widest text-slate-800 dark:text-white">Hướng dẫn nhanh</h4>
                 </div>
                 <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {[
                      { icon: <Sparkles size={16}/>, t: "Mô tả nhân vật", d: "Mô tả độ tuổi, giới tính và cảm xúc giọng nói." },
                      { icon: <Mic2 size={16}/>, t: "Văn bản mẫu", d: "Cung cấp nội dung để AI đọc thử nghiệm." },
                      { icon: <Zap size={16}/>, t: "Khởi tạo", d: "Duyệt kết quả và tải về định dạng Studio." }
                    ].map((step, i) => (
                      <div key={i} className="p-5 bg-white dark:bg-white/[0.02] border border-black/5 dark:border-white/5 rounded-2xl space-y-3">
                         <div className="text-brand-blue">{step.icon}</div>
                         <div className="space-y-1">
                            <p className="text-[10px] font-black uppercase text-slate-900 dark:text-white">{step.t}</p>
                            <p className="text-[9px] text-gray-500 dark:text-gray-400 font-bold leading-relaxed">"{step.d}"</p>
                         </div>
                      </div>
                    ))}
                 </div>
              </div>

              {/* TEMPLATES SECTION */}
              <div className="space-y-6">
                 <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                       <div className="p-2 bg-purple-500/10 rounded-lg text-purple-500">
                          <Zap size={18} />
                       </div>
                       <h4 className="text-sm font-black uppercase tracking-widest text-slate-800 dark:text-white">Mẫu gợi ý</h4>
                    </div>
                 </div>
                 <div className="grid grid-cols-1 gap-4">
                    {START_TEMPLATES.map((tmpl, i) => (
                      <button 
                        key={i}
                        onClick={() => onApplyTemplate?.(tmpl.prompt, tmpl.text)}
                        className={`p-6 bg-gradient-to-r ${tmpl.color} border border-black/5 dark:border-white/5 rounded-3xl text-left group hover:scale-[1.02] transition-all relative overflow-hidden`}
                      >
                         <div className="absolute top-0 right-0 p-6 opacity-10 group-hover:rotate-12 transition-transform">
                            <Volume2 size={80} />
                         </div>
                         <div className="flex justify-between items-start relative z-10">
                            <div className="space-y-4 flex-grow">
                               <div className="space-y-1">
                                  <h5 className="text-lg font-black uppercase italic tracking-tighter text-slate-900 dark:text-white">{tmpl.title}</h5>
                                  <p className="text-[10px] font-bold text-brand-blue uppercase tracking-widest opacity-70 leading-none">{tmpl.prompt}</p>
                               </div>
                               <p className="text-[11px] text-slate-500 dark:text-gray-400 font-medium italic line-clamp-1 pr-12">"{tmpl.text}"</p>
                            </div>
                            <div className="w-10 h-10 rounded-full bg-brand-blue text-white flex items-center justify-center shadow-lg group-hover:translate-x-1 transition-transform">
                               <ArrowRight size={20} />
                            </div>
                         </div>
                      </button>
                    ))}
                 </div>
              </div>

              <div className="pt-6 border-t border-black/5 dark:border-white/5 flex items-center justify-center gap-2 opacity-30">
                 <Info size={14} />
                 <p className="text-[9px] font-black uppercase tracking-widest italic">Chọn một mẫu để bắt đầu thiết kế ngay lập tức</p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default VoiceDesignLibrary;
