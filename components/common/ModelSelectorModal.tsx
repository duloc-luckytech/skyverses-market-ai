
import React, { useState, useMemo } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  X, Video, ImageIcon, Zap, MousePointer2, 
  Terminal, Share2, Wand2, RefreshCw, Move, 
  User, Clock, Monitor, Hash, Cpu, Globe,
  LayoutGrid, ChevronRight, Activity, Scan,
  Layers
} from 'lucide-react';
import { PricingModel } from '../../apis/pricing';

interface ModelSelectorModalProps {
  isOpen: boolean;
  onClose: () => void;
  models: PricingModel[];
  selectedModelId: string;
  onSelect: (id: string) => void;
}

// Cấu hình Icon và Mô tả cho các Động cơ (Engines)
const ENGINE_ICONS: Record<string, any> = {
  kling: { icon: Video, label: 'Kling', desc: 'Động lực học hoàn hảo, kiểm soát nâng cao' },
  google: { icon: Globe, label: 'Google', desc: 'Video chính xác, tích hợp âm thanh' },
  grok: { icon: Terminal, label: 'Grok', desc: 'Kiến tạo video thế hệ mới' },
  auto: { icon: Cpu, label: 'Auto', desc: 'Luồng tổng hợp kịch bản tự động' },
  bytedance: { icon: Activity, label: 'Bytedance', desc: 'Chuyển động điện ảnh đa chiều' },
  hailuo: { icon: Activity, label: 'Hailuo', desc: 'Động lực cao, sẵn sàng cho kỹ xảo' },
  sora: { icon: Zap, label: 'Sora', desc: 'Khởi tạo video đa phân cảnh' },
};

export const ModelSelectorModal: React.FC<ModelSelectorModalProps> = ({
  isOpen,
  onClose,
  models,
  selectedModelId,
  onSelect
}) => {
  // Nhóm các model theo Engine
  const engineGroups = useMemo(() => {
    const groups: Record<string, PricingModel[]> = {};
    models.forEach(m => {
      const engineKey = m.name.split(' ')[0].toLowerCase().replace(/[^a-z]/g, '');
      if (!groups[engineKey]) groups[engineKey] = [];
      groups[engineKey].push(m);
    });
    return groups;
  }, [models]);

  const sortedEngines = Object.keys(engineGroups).sort();
  const [activeEngine, setActiveEngine] = useState<string>(sortedEngines[0] || '');

  if (!isOpen) return null;

  const currentModels = engineGroups[activeEngine] || [];

  return createPortal(
    <div className="fixed inset-0 z-[2000] flex items-center justify-center p-4 md:p-10 pointer-events-none">
      <motion.div 
        initial={{ opacity: 0 }} 
        animate={{ opacity: 1 }} 
        exit={{ opacity: 0 }}
        className="absolute inset-0 bg-black/90 backdrop-blur-xl pointer-events-auto" 
        onClick={onClose} 
      />
      
      <motion.div 
        initial={{ scale: 0.95, opacity: 0, y: 30 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.95, opacity: 0, y: 30 }}
        className="relative w-full h-full max-h-[85vh] max-w-6xl bg-white dark:bg-[#0d0d0f] border border-black/10 dark:border-white/10 rounded-[2rem] overflow-hidden shadow-[0_50px_100px_rgba(0,0,0,0.5)] flex flex-col md:flex-row transition-all duration-500 pointer-events-auto"
      >
        {/* SIDEBAR: LỰA CHỌN ĐỘNG CƠ (ENGINE) */}
        <aside className="w-full md:w-80 shrink-0 border-r border-slate-200 dark:border-white/5 flex flex-col bg-slate-50 dark:bg-black/40">
           <div className="p-8 border-b border-slate-200 dark:border-white/5 flex items-center justify-between">
              <div className="space-y-0.5">
                 <h2 className="text-xl font-black uppercase italic tracking-tighter text-slate-900 dark:text-white">Danh mục Model</h2>
                 <p className="text-[9px] font-bold text-gray-500 uppercase tracking-widest">Lựa chọn công nghệ xử lý</p>
              </div>
              <button onClick={onClose} className="md:hidden text-gray-400"><X /></button>
           </div>

           <div className="flex-grow overflow-y-auto no-scrollbar p-3 space-y-2">
              {sortedEngines.map(engKey => {
                const info = ENGINE_ICONS[engKey] || { icon: Layers, label: engKey.toUpperCase(), desc: 'Nút mạng nơ-ron cục bộ' };
                const Icon = info.icon;
                const isActive = activeEngine === engKey;
                return (
                  <button 
                    key={engKey}
                    onClick={() => setActiveEngine(engKey)}
                    className={`w-full p-5 rounded-2xl flex items-center justify-between transition-all group ${isActive ? 'bg-white dark:bg-white/10 border border-slate-200 dark:border-white/10 shadow-xl' : 'hover:bg-black/5 dark:hover:bg-white/5 border border-transparent'}`}
                  >
                    <div className="flex items-center gap-4">
                       <div className={`w-11 h-11 rounded-xl flex items-center justify-center transition-all ${isActive ? 'bg-brand-blue text-white shadow-lg shadow-brand-blue/20' : 'bg-slate-100 dark:bg-white/5 text-gray-500 group-hover:text-slate-900 dark:group-hover:text-white'}`}>
                          <Icon size={20} />
                       </div>
                       <div className="text-left space-y-0.5 overflow-hidden">
                          <p className={`text-[13px] font-black uppercase tracking-tight ${isActive ? 'text-slate-900 dark:text-white' : 'text-slate-500 dark:text-gray-400 group-hover:text-slate-900 dark:group-hover:text-white'}`}>{info.label}</p>
                          <p className="text-[9px] font-bold text-gray-400 truncate max-w-[140px]">{info.desc}</p>
                       </div>
                    </div>
                    {isActive && <ChevronRight size={16} className="text-brand-blue" />}
                  </button>
                );
              })}
           </div>
        </aside>

        {/* MAIN: DANH SÁCH MÔ HÌNH */}
        <main className="flex-grow flex flex-col overflow-hidden bg-white dark:bg-[#0d0d0f]">
           <header className="h-20 border-b border-slate-200 dark:border-white/5 flex items-center justify-between px-10 shrink-0">
              <div className="flex items-center gap-3">
                 <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
                 <span className="text-[10px] font-black uppercase tracking-[0.4em] text-gray-400 italic">Hệ thống: {activeEngine.toUpperCase()} — Trạng thái: Sẵn sàng</span>
              </div>
              <button onClick={onClose} className="hidden md:block p-2 text-gray-400 hover:text-red-500 transition-colors">
                <X size={24} />
              </button>
           </header>

           <div className="flex-grow overflow-y-auto no-scrollbar p-10 space-y-12 bg-[#fcfcfd] dark:bg-[#0d0d0f]">
              {currentModels.map((model) => {
                const isMotion = model.name.toLowerCase().includes('motion');
                const isEdit = model.name.toLowerCase().includes('o1') || model.name.toLowerCase().includes('edit');
                const isLipsync = model.name.toLowerCase().includes('lipsync');
                
                // Tính toán dải giá
                const prices: number[] = [];
                Object.values(model.pricing || {}).forEach(res => {
                  Object.values(res).forEach(p => prices.push(p as number));
                });
                const minPrice = Math.min(...prices);
                const maxPrice = Math.max(...prices);

                return (
                  <div 
                    key={model._id}
                    onClick={() => { onSelect(model._id); onClose(); }}
                    className={`p-8 border-2 rounded-[2.5rem] space-y-6 transition-all cursor-pointer group relative overflow-hidden ${selectedModelId === model._id ? 'bg-brand-blue/5 border-brand-blue shadow-2xl shadow-brand-blue/10' : 'bg-white dark:bg-white/[0.02] border-slate-200 dark:border-white/5 hover:border-brand-blue/20'}`}
                  >
                     <div className="flex justify-between items-start">
                        <div className="space-y-4 flex-grow pr-8">
                           <div className="flex items-center gap-4">
                              <h3 className="text-3xl font-black uppercase italic tracking-tighter text-slate-900 dark:text-white leading-none">{model.name}</h3>
                              <span className="px-3 py-1 bg-emerald-600 text-white text-[9px] font-black rounded-lg uppercase tracking-widest shadow-lg">MỚI</span>
                           </div>
                           <p className="text-sm text-slate-500 dark:text-gray-400 font-medium leading-relaxed italic max-w-2xl">
                             {model.description || `Mô hình cao cấp từ hệ sinh thái ${model.engine.toUpperCase()}, tối ưu hóa ${model.tool} với độ trung thực tuyệt đối và tính nhất quán định danh.`}
                           </p>
                        </div>
                        <div className="shrink-0 pt-1">
                           <div className="bg-orange-500/10 border border-orange-500/20 px-6 py-3 rounded-full flex items-center gap-3 shadow-xl">
                              <Zap size={14} className="text-orange-500" fill="currentColor" />
                              <span className="text-sm font-black italic text-orange-500">{minPrice} - {maxPrice} CR/Giây</span>
                           </div>
                        </div>
                     </div>

                     <div className="flex flex-wrap gap-3">
                        <FeatureTag icon={<Wand2 />} label="Văn bản → Video" />
                        {isEdit && <FeatureTag icon={<RefreshCw />} label="Tái cấu trúc (Remix)" color="bg-indigo-500/10 text-indigo-400" />}
                        {isMotion && <FeatureTag icon={<Move />} label="Động lực học (Motion)" color="bg-cyan-500/10 text-cyan-400" />}
                        {isLipsync && <FeatureTag icon={<Scan />} label="Đồng bộ môi (Lipsync)" color="bg-pink-500/10 text-pink-400" />}
                        <FeatureTag icon={<ImageIcon />} label="Hình ảnh → Video" />
                        <FeatureTag icon={<User />} label="Nhân vật (Character)" color="bg-orange-500/10 text-orange-400" />
                     </div>

                     <div className="flex items-center gap-10 pt-4 border-t border-slate-100 dark:border-white/5 opacity-40">
                        <div className="flex items-center gap-3">
                           <Monitor size={14} className="text-gray-400" />
                           <span className="text-[10px] font-black uppercase tracking-widest text-slate-900 dark:text-white">TIÊU CHUẨN</span>
                        </div>
                        <div className="flex items-center gap-3">
                           <Clock size={14} className="text-gray-400" />
                           <span className="text-[10px] font-black uppercase tracking-widest text-slate-900 dark:text-white">10 GIÂY</span>
                        </div>
                        <div className="flex items-center gap-3">
                           <LayoutGrid size={14} className="text-gray-400" />
                           <span className="text-[10px] font-black uppercase tracking-widest text-slate-900 dark:text-white">TỶ LỆ 1:1</span>
                        </div>
                     </div>
                  </div>
                );
              })}
           </div>
        </main>
      </motion.div>
    </div>,
    document.body
  );
};

const FeatureTag = ({ icon, label, color = "bg-slate-100 dark:bg-white/5 text-slate-500 dark:text-gray-300" }: any) => (
  <div className={`flex items-center gap-2.5 px-4 py-2 rounded-xl border border-black/5 dark:border-white/5 font-black text-[10px] uppercase tracking-wider italic transition-all ${color}`}>
    {React.cloneElement(icon, { size: 14 })}
    {label}
  </div>
);
