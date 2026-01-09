
import React, { useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { 
  Sparkles, Camera, Music, Mic, ChevronDown, 
  Globe, Film, Palette, Layout, Settings,
  ShieldCheck, Save, Zap
} from 'lucide-react';
import { RenderConfig } from './RenderConfig';
import { AdvancedSettings } from './AdvancedSettings';

interface SettingsTabProps {
  script: string;
  setScript: (v: string) => void;
  settings: any;
  setSettings?: (updates: any) => void;
  onLoadSample: () => void;
  onLoadSuggestion: () => void;
  isEnhancing?: boolean;
  isProcessing?: boolean;
  onSaveAndGenerate?: () => void;
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

export const SettingsTab: React.FC<SettingsTabProps> = ({ 
  settings, setSettings, isProcessing, onSaveAndGenerate 
}) => {
  const renderConfigRef = useRef<HTMLDivElement>(null);
  const inputBg = "bg-slate-50 dark:bg-white/[0.02] border border-slate-200 dark:border-white/10 rounded-xl px-4 py-3 text-sm font-medium focus:ring-2 focus:ring-brand-blue/30 outline-none transition-all text-slate-900 dark:text-white";
  const labelStyle = "text-[10px] font-black uppercase text-slate-400 dark:text-gray-500 tracking-widest ml-1 mb-2 block leading-none";

  // Auto-scroll logic when landing on this tab from a "Configure" action
  useEffect(() => {
    if (renderConfigRef.current) {
      renderConfigRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  }, []);

  const handleChange = (key: string, value: any) => {
    if (setSettings) {
      setSettings({ ...settings, [key]: value });
    }
  };

  return (
    <motion.div 
      key="tab-settings" 
      initial={{ opacity: 0, x: 20 }} 
      animate={{ opacity: 1, x: 0 }} 
      exit={{ opacity: 0, x: -20 }}
      className="flex-grow flex flex-col p-6 lg:p-12 overflow-y-auto no-scrollbar bg-white dark:bg-[#050506] transition-colors duration-500"
    >
      <div className="max-w-6xl mx-auto w-full space-y-8 lg:space-y-12 pb-48 lg:pb-40">
        
        {/* TIÊU ĐỀ CHÍNH */}
        <header className="space-y-2 border-l-4 border-brand-blue pl-4 lg:pl-6">
          <h2 className="text-2xl lg:text-4xl font-black uppercase italic tracking-tighter text-slate-900 dark:text-white leading-none">THIẾT LẬP</h2>
          <p className="text-gray-500 text-[10px] lg:text-xs font-bold uppercase tracking-widest italic leading-none">Cấu hình tham số sản xuất</p>
        </header>

        {/* 1. THÔNG SỐ SÁNG TẠO */}
        <section className="p-6 lg:p-8 bg-slate-50/50 dark:bg-white/[0.01] border border-slate-200 dark:border-white/5 rounded-[1.5rem] lg:rounded-[2rem] space-y-6 lg:space-y-8 shadow-sm transition-all">
          <div className="flex items-center gap-3 mb-2">
            <Sparkles size={16} className="text-brand-blue" />
            <h3 className="text-[12px] lg:text-sm font-black uppercase tracking-[0.2em] italic text-slate-800 dark:text-white">THÔNG SỐ SÁNG TẠO</h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="space-y-1">
              <label className={labelStyle}>Loại hình / Format</label>
              <div className="relative">
                <select 
                  value={settings.format}
                  onChange={(e) => handleChange('format', e.target.value)}
                  className={`w-full appearance-none cursor-pointer ${inputBg}`}
                >
                  {FORMAT_OPTIONS.map(opt => <option key={opt} value={opt} className="dark:bg-[#0d0d0f]">{opt}</option>)}
                </select>
                <ChevronDown size={14} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
              </div>
            </div>

            <div className="space-y-1">
              <label className={labelStyle}>Phong cách / Style</label>
              <div className="relative">
                <select 
                  value={settings.style}
                  onChange={(e) => handleChange('style', e.target.value)}
                  className={`w-full appearance-none cursor-pointer ${inputBg}`}
                >
                  {STYLE_OPTIONS.map(opt => <option key={opt} value={opt} className="dark:bg-[#0d0d0f]">{opt}</option>)}
                </select>
                <ChevronDown size={14} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
              </div>
            </div>

            <div className="space-y-1">
              <label className={labelStyle}>Quốc gia / Văn hóa</label>
              <input 
                value={settings.culture} 
                onChange={(e) => handleChange('culture', e.target.value)}
                className={inputBg} 
                placeholder="VD: Futuristic Vietnam" 
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-black/5 dark:border-white/5">
            <div className="space-y-1">
              <label className={labelStyle}><Layout size={12} className="inline mr-1" /> Bối cảnh / Background</label>
              <textarea 
                value={settings.background}
                onChange={(e) => handleChange('background', e.target.value)}
                className={`${inputBg} w-full h-24 resize-none`} 
                placeholder="VD: Rain-slicked alleyways..." 
              />
            </div>

            <div className="space-y-1">
              <label className={labelStyle}><Camera size={12} className="inline mr-1" /> Camera & Cinematic</label>
              <textarea 
                value={settings.cinematic}
                onChange={(e) => handleChange('cinematic', e.target.value)}
                className={`${inputBg} w-full h-24 resize-none`} 
                placeholder="VD: Low-angle tracking shots..." 
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-1">
              <label className={labelStyle}><Music size={12} className="inline mr-1" /> Âm nhạc (BGM)</label>
              <input 
                value={settings.bgm}
                onChange={(e) => handleChange('bgm', e.target.value)}
                className={`${inputBg} w-full`} 
                placeholder="VD: Lo-fi beats..." 
              />
            </div>

            <div className="space-y-1">
              <label className={labelStyle}><Mic size={12} className="inline mr-1" /> Lời bình (VO)</label>
              <input 
                value={settings.voiceOver}
                onChange={(e) => handleChange('voiceOver', e.target.value)}
                className={`${inputBg} w-full`} 
                placeholder="VD: Deep, resonant male voice..." 
              />
            </div>
          </div>
        </section>

        {/* 2. CẤU HÌNH RENDER ENGINE */}
        <div ref={renderConfigRef}>
          <RenderConfig 
            settings={settings}
            setSettings={setSettings || (() => {})}
          />
        </div>

        {/* 3. CÀI ĐẶT NÂNG CAO */}
        <AdvancedSettings 
          isProcessing={isProcessing}
          onSaveAndGenerate={onSaveAndGenerate}
          settings={settings}
          setSettings={setSettings || (() => {})}
        />
      </div>
    </motion.div>
  );
};
