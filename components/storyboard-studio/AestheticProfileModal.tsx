import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Sparkles, ShieldCheck, ChevronDown, Layout, Camera, Music, Mic, Palette, Zap } from 'lucide-react';

interface AestheticProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  settings: any;
  setSettings: (updates: any) => void;
}

const FORMAT_OPTIONS = [
  '-- Để trống (AI tự chọn) --',
  'Phim ngắn', 'Phim dài', 'TVC Quảng cáo', 'MV Ca nhạc',
  'Truyện kể', 'Trailer / Teaser', 'Phim tài liệu',
  'Video TikTok/Reels/Shorts', 'Vlog', 'Video giáo dục'
];

const STYLE_OPTIONS = [
  '-- Để trống (AI tự chọn) --',
  'Hoạt hình 3D', 'Hoạt hình 2D', 'Anime', 'Live-action',
  'Cyberpunk', 'Realistic', 'Dreamy', 'Minimalist'
];

export const AestheticProfileModal: React.FC<AestheticProfileModalProps> = ({ 
  isOpen, 
  onClose, 
  settings, 
  setSettings 
}) => {
  const inputBg = "bg-slate-50 dark:bg-black/40 border border-slate-200 dark:border-white/10 rounded-xl px-4 py-3 text-sm font-medium focus:ring-2 focus:ring-brand-blue/30 outline-none transition-all text-slate-900 dark:text-white shadow-inner";
  const labelStyle = "text-[10px] font-black uppercase text-slate-400 dark:text-gray-500 tracking-[0.2em] ml-1 mb-2 block leading-none italic";

  const handleChange = (key: string, value: any) => {
    setSettings({ ...settings, [key]: value });
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[800] flex items-center justify-center p-4 md:p-6">
          <motion.div 
            initial={{ opacity: 0 }} 
            animate={{ opacity: 1 }} 
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/60 dark:bg-black/80 backdrop-blur-md"
            onClick={onClose}
          />
          
          <motion.div 
            initial={{ scale: 0.95, opacity: 0, y: 30 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.95, opacity: 0, y: 30 }}
            className="relative w-full max-w-4xl bg-white dark:bg-[#0c0c0e] rounded-[2.5rem] overflow-hidden shadow-[0_50px_100px_rgba(0,0,0,0.5)] flex flex-col max-h-[90vh] border border-black/5 dark:border-white/10"
          >
            {/* Header */}
            <div className="p-6 md:p-8 border-b border-black/5 dark:border-white/5 flex items-center justify-between bg-slate-50/50 dark:bg-black/20 shrink-0">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-brand-blue/10 rounded-2xl flex items-center justify-center text-brand-blue shadow-inner relative group">
                  <div className="absolute inset-0 bg-brand-blue blur-xl opacity-20 group-hover:opacity-40 transition-opacity"></div>
                  <Palette size={24} fill="currentColor" className="relative z-10" />
                </div>
                <div>
                  <h3 className="text-xl md:text-2xl font-black uppercase italic tracking-tighter text-slate-900 dark:text-white leading-none">Aesthetic Profile</h3>
                  <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mt-1 italic">Ngôn ngữ hình ảnh & Thẩm mỹ sáng tạo</p>
                </div>
              </div>
              <button onClick={onClose} className="p-2 text-slate-400 hover:text-red-500 transition-colors">
                <X size={28} />
              </button>
            </div>

            {/* Content Area */}
            <div className="flex-grow overflow-y-auto p-6 md:p-10 no-scrollbar space-y-10">
              {/* Row 1: Primary Archetype */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <div className="space-y-1">
                  <label className={labelStyle}>Loại hình / Format</label>
                  <div className="relative group">
                    <select 
                      value={settings.format}
                      onChange={(e) => handleChange('format', e.target.value)}
                      className={`w-full appearance-none cursor-pointer ${inputBg}`}
                    >
                      {FORMAT_OPTIONS.map(opt => <option key={opt} value={opt} className="dark:bg-[#0d0d0f]">{opt}</option>)}
                    </select>
                    <ChevronDown size={14} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none transition-colors group-hover:text-brand-blue" />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className={labelStyle}>Phong cách / Style</label>
                  <div className="relative group">
                    <select 
                      value={settings.style}
                      onChange={(e) => handleChange('style', e.target.value)}
                      className={`w-full appearance-none cursor-pointer ${inputBg}`}
                    >
                      {STYLE_OPTIONS.map(opt => <option key={opt} value={opt} className="dark:bg-[#0d0d0f]">{opt}</option>)}
                    </select>
                    <ChevronDown size={14} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none transition-colors group-hover:text-brand-blue" />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className={labelStyle}>Quốc gia / Văn hóa</label>
                  <input 
                    value={settings.culture} 
                    onChange={(e) => handleChange('culture', e.target.value)}
                    className={inputBg} 
                    placeholder="VD: Futuristic Vietnam, Cyberpunk Tokyo..." 
                  />
                </div>
              </div>

              {/* Row 2: Visual Directives */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-4">
                <div className="space-y-1">
                  <label className={labelStyle}><Layout size={12} className="inline mr-2 text-brand-blue" /> Bối cảnh / Background</label>
                  <textarea 
                    value={settings.background}
                    onChange={(e) => handleChange('background', e.target.value)}
                    className={`${inputBg} w-full h-32 resize-none leading-relaxed`} 
                    placeholder="VD: Rain-slicked alleyways reflecting neon holograms, futuristic skyscrapers..." 
                  />
                </div>

                <div className="space-y-1">
                  <label className={labelStyle}><Camera size={12} className="inline mr-2 text-brand-blue" /> Camera & Cinematic</label>
                  <textarea 
                    value={settings.cinematic}
                    onChange={(e) => handleChange('cinematic', e.target.value)}
                    className={`${inputBg} w-full h-32 resize-none leading-relaxed`} 
                    placeholder="VD: Low-angle tracking shots, shallow depth of field, anamorphic flares..." 
                  />
                </div>
              </div>

              {/* Row 3: Audio Architecture */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-1">
                  <label className={labelStyle}><Music size={12} className="inline mr-2 text-emerald-500" /> Âm nhạc (BGM)</label>
                  <input 
                    value={settings.bgm}
                    onChange={(e) => handleChange('bgm', e.target.value)}
                    className={`${inputBg} w-full`} 
                    placeholder="VD: Lo-fi hip hop, Cinematic orchestral..." 
                  />
                </div>

                <div className="space-y-1">
                  <label className={labelStyle}><Mic size={12} className="inline mr-2 text-emerald-500" /> Lời bình (VO)</label>
                  <input 
                    value={settings.voiceOver}
                    onChange={(e) => handleChange('voiceOver', e.target.value)}
                    className={`${inputBg} w-full`} 
                    placeholder="VD: Deep, resonant male voice, Calm and wise..." 
                  />
                </div>
              </div>

              {/* System Note */}
              <div className="p-6 bg-brand-blue/5 border border-brand-blue/10 rounded-2xl flex gap-4 items-start">
                <Zap className="text-brand-blue shrink-0 mt-1" size={18} />
                <div className="space-y-1">
                   <p className="text-[11px] text-slate-800 dark:text-slate-300 font-bold uppercase tracking-tight italic">AI Archetype Sync Active</p>
                   <p className="text-[10px] text-slate-500 dark:text-gray-400 font-medium leading-relaxed italic">
                    Lưu ý: Bạn có thể để trống các trường này để AI tự động phân tích và đề xuất thẩm mỹ tối ưu dựa trên nội dung kịch bản của bạn.
                   </p>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="p-6 md:p-8 border-t border-black/5 dark:border-white/5 bg-slate-50/50 dark:bg-black/40 flex items-center justify-between shrink-0">
              <div className="flex items-center gap-3 text-brand-blue opacity-60">
                <ShieldCheck size={16} />
                <span className="text-[10px] font-black uppercase tracking-widest italic leading-none pt-1">Aesthetic Protocol Synchronized</span>
              </div>
              <button 
                onClick={onClose}
                className="px-12 py-4 bg-brand-blue text-white rounded-xl text-[11px] font-black uppercase tracking-[0.2em] shadow-[0_15px_40px_rgba(0,144,255,0.3)] hover:scale-105 active:scale-95 transition-all flex items-center gap-3 italic"
              >
                Xác nhận thay đổi
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
