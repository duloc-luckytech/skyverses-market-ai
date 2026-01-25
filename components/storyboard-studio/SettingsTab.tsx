import React from 'react';
import { motion } from 'framer-motion';
import { 
  Sparkles, Palette, Settings, Zap, ImageIcon, Film, Maximize2, Cpu, Edit3, Music, Mic
} from 'lucide-react';
import { AdvancedSettings } from './AdvancedSettings';

interface SettingsTabProps {
  script: string;
  setScript: (v: string) => void;
  settings: any;
  setSettings?: (updates: any) => void;
  onLoadSample: () => void;
  onLoadSuggestion: () => void;
  onOpenAestheticConfig: () => void;
  onOpenRenderConfig: () => void;
  isEnhancing?: boolean;
  isProcessing?: boolean;
  onSaveAndGenerate?: () => void;
}

export const SettingsTab: React.FC<SettingsTabProps> = ({ 
  settings, setSettings, isProcessing, onSaveAndGenerate, onOpenAestheticConfig, onOpenRenderConfig 
}) => {
  return (
    <motion.div 
      key="tab-settings" 
      initial={{ opacity: 0, x: 20 }} 
      animate={{ opacity: 1, x: 0 }} 
      exit={{ opacity: 0, x: -20 }}
      className="flex-grow flex flex-col p-6 lg:p-12 overflow-y-auto no-scrollbar bg-white dark:bg-[#050506] transition-colors duration-500"
    >
      <div className="max-w-6xl mx-auto w-full space-y-8 lg:space-y-12 pb-48 lg:pb-40">
        
        <header className="space-y-2 border-l-4 border-brand-blue pl-4 lg:pl-6">
          <h2 className="text-2xl lg:text-4xl font-black uppercase italic tracking-tighter text-slate-900 dark:text-white leading-none">THIẾT LẬP</h2>
          <p className="text-gray-500 text-[10px] lg:text-xs font-bold uppercase tracking-widest italic leading-none">Cấu hình tham số sản xuất</p>
        </header>

        {/* 1. THÔNG SỐ SÁNG TẠO - SUMMARY VIEW */}
        <section className="p-8 lg:p-10 bg-slate-50/50 dark:bg-[#0a0a0c] border border-slate-200 dark:border-white/5 rounded-[2rem] space-y-8 shadow-sm transition-colors relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:scale-110 transition-transform duration-[3s]">
             <Sparkles size={180} />
          </div>
          
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-brand-blue/10 rounded-2xl flex items-center justify-center text-brand-blue">
                <Palette size={24} fill="currentColor" />
              </div>
              <div className="space-y-1">
                <h3 className="text-xl font-black uppercase italic tracking-tighter text-slate-900 dark:text-white">THÔNG SỐ SÁNG TẠO</h3>
                <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest italic">Aesthetic & Artistic Language</p>
              </div>
            </div>
            
            <button 
              onClick={onOpenAestheticConfig}
              className="px-10 py-4 bg-brand-blue text-white rounded-xl text-[11px] font-black uppercase tracking-widest shadow-xl shadow-brand-blue/20 hover:scale-105 active:scale-95 transition-all flex items-center gap-3 italic"
            >
              <Edit3 size={16} /> Chỉnh sửa Thẩm mỹ
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 relative z-10">
             <div className="p-5 bg-white dark:bg-white/[0.03] border border-black/5 dark:border-white/5 rounded-2xl space-y-3">
                <p className="text-[8px] font-black uppercase text-gray-400 tracking-widest">Format</p>
                <p className="text-sm font-black uppercase italic truncate">{settings.format}</p>
             </div>
             <div className="p-5 bg-white dark:bg-white/[0.03] border border-black/5 dark:border-white/5 rounded-2xl space-y-3">
                <p className="text-[8px] font-black uppercase text-gray-400 tracking-widest">Style</p>
                <p className="text-sm font-black uppercase italic truncate">{settings.style}</p>
             </div>
             <div className="p-5 bg-white dark:bg-white/[0.03] border border-black/5 dark:border-white/5 rounded-2xl space-y-3">
                <p className="text-[8px] font-black uppercase text-gray-400 tracking-widest">Culture</p>
                <p className="text-sm font-black uppercase italic truncate">{settings.culture}</p>
             </div>
             <div className="p-5 bg-white dark:bg-white/[0.03] border border-black/5 dark:border-white/5 rounded-2xl space-y-3">
                <p className="text-[8px] font-black uppercase text-gray-400 tracking-widest">Audio Nodes</p>
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-1">
                    <Music size={12} className={settings.bgm ? 'text-emerald-500' : 'text-gray-600'} />
                    <span className="text-[9px] font-bold">BGM</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Mic size={12} className={settings.voiceOver ? 'text-emerald-500' : 'text-gray-600'} />
                    <span className="text-[9px] font-bold">VO</span>
                  </div>
                </div>
             </div>
          </div>
        </section>

        {/* 2. CẤU HÌNH KẾT XUẤT - SUMMARY VIEW */}
        <section className="p-8 lg:p-10 bg-slate-50/50 dark:bg-[#0a0a0c] border border-slate-200 dark:border-white/5 rounded-[2rem] space-y-8 shadow-sm transition-colors relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:scale-110 transition-transform duration-[3s]">
             <Cpu size={180} />
          </div>
          
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-brand-blue/10 rounded-2xl flex items-center justify-center text-brand-blue">
                <Zap size={24} fill="currentColor" />
              </div>
              <div className="space-y-1">
                <h3 className="text-xl font-black uppercase italic tracking-tighter text-slate-900 dark:text-white">CẤU HÌNH KẾT XUẤT</h3>
                <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest italic">Engine & Model Registry</p>
              </div>
            </div>
            
            <button 
              onClick={onOpenRenderConfig}
              className="px-10 py-4 bg-brand-blue text-white rounded-xl text-[11px] font-black uppercase tracking-widest shadow-xl shadow-brand-blue/20 hover:scale-105 active:scale-95 transition-all flex items-center gap-3 italic"
            >
              <Settings size={16} /> Thay đổi thiết lập
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 relative z-10">
             <div className="p-5 bg-white dark:bg-white/[0.03] border border-black/5 dark:border-white/5 rounded-2xl space-y-3">
                <div className="flex items-center gap-2 text-brand-blue">
                   <ImageIcon size={14} />
                   <span className="text-[8px] font-black uppercase tracking-widest">Image Engine</span>
                </div>
                <p className="text-sm font-black uppercase italic truncate">{settings.imageModel.replace(/_/g, ' ')}</p>
             </div>
             <div className="p-5 bg-white dark:bg-white/[0.03] border border-black/5 dark:border-white/5 rounded-2xl space-y-3">
                <div className="flex items-center gap-2 text-purple-500">
                   <Film size={14} />
                   <span className="text-[8px] font-black uppercase tracking-widest">Video Engine</span>
                </div>
                <p className="text-sm font-black uppercase italic truncate">{settings.model.replace(/_/g, ' ')}</p>
             </div>
             <div className="p-5 bg-white dark:bg-white/[0.03] border border-black/5 dark:border-white/5 rounded-2xl space-y-3">
                <div className="flex items-center gap-2 text-emerald-500">
                   <Maximize2 size={14} />
                   <span className="text-[8px] font-black uppercase tracking-widest">Spec Target</span>
                </div>
                <p className="text-sm font-black uppercase italic truncate">1080P • 24FPS • 16:9</p>
             </div>
          </div>
        </section>

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
