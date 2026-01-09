import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Check, ChevronDown, ChevronUp, Settings, Sparkles, Palette, Sun, Activity, Maximize2, Scissors, Waves, Ghost, Brush, Zap,
  Image as ImageIcon, PenTool, Eraser, Type, Sliders, Trash2, History as HistoryIcon
} from 'lucide-react';

interface EditorSidebarProps {
  activeTab: 'layers' | 'history';
  setActiveTab: (tab: 'layers' | 'history') => void;
  visibleLayers: string[];
  setVisibleLayers: (val: (prev: string[]) => string[]) => void;
  selectedModel: any;
  setSelectedModel: (m: any) => void;
  models: any[];
  onSetPrompt: (prompt: string) => void;
  history: any[];
  originalSource: string | null;
  onHistoryClick: (url: string) => void;
  isActionsDisabled: boolean;
  actionCost: number;
  textLayers: any[];
  selectedTextId: string | null;
  updateTextLayer: (id: string, text: string) => void;
  deleteSelectedText: () => void;
  isMobileExpanded?: boolean;
  setIsMobileExpanded?: (val: boolean) => void;
}

const LayerButton = ({ icon, label, active, onToggle }: any) => (
  <button 
    onClick={onToggle}
    className={`flex-grow flex flex-col items-center justify-center gap-1.5 py-3 border rounded-xl transition-all ${active ? 'bg-brand-blue/10 border-brand-blue text-brand-blue shadow-sm' : 'bg-white dark:bg-white/[0.02] border-black/5 dark:border-white/10 text-slate-400 grayscale'}`}
  >
    {icon}
    <span className="text-[7px] font-black uppercase tracking-widest">{label}</span>
  </button>
);

const SidebarAccordion = ({ title, id, openAccordions, setOpenAccordions, children }: any) => {
  const isOpen = openAccordions.includes(id);
  const onToggle = () => setOpenAccordions((prev: string[]) => isOpen ? prev.filter(a => a !== id) : [...prev, id]);
  return (
    <div className="border-b border-black/5 dark:border-white/5 overflow-hidden">
       <button onClick={onToggle} className="w-full flex items-center justify-between py-5 px-4 text-[10px] font-black uppercase tracking-[0.4em] text-slate-400 hover:text-slate-900 dark:hover:text-white">
          <span>{title}</span>
          <ChevronDown size={14} className={`transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`} />
       </button>
       <AnimatePresence>{isOpen && <motion.div initial={{ height: 0 }} animate={{ height: 'auto' }} exit={{ height: 0 }} className="overflow-hidden bg-slate-100/50 dark:bg-black/20">{children}</motion.div>}</AnimatePresence>
    </div>
  );
};

const ActionButton = ({ label, icon, onClick, cost, disabled }: any) => (
  <button 
    onClick={onClick} disabled={disabled}
    className={`bg-white dark:bg-white/[0.02] border border-slate-200 dark:border-white/10 rounded-xl flex flex-col items-center justify-center gap-2 py-3 px-2 transition-all active:scale-95 group relative overflow-hidden ${disabled ? 'opacity-40 grayscale cursor-not-allowed' : 'hover:border-brand-blue/50'}`}
  >
     <div className={`transition-colors ${disabled ? 'text-slate-300' : 'text-slate-400 group-hover:text-brand-blue'}`}>{icon}</div>
     <span className="text-[8px] font-black uppercase text-slate-500 text-center leading-tight">{label}</span>
     {!disabled && (
       <div className="absolute top-0 right-0 bg-orange-500 text-white px-1.5 py-0.5 rounded-bl-lg shadow-lg flex items-center gap-1 z-10">
          <Zap size={8} fill="currentColor" />
          <span className="text-[7px] font-black">{cost}</span>
       </div>
     )}
  </button>
);

export const EditorSidebar: React.FC<EditorSidebarProps> = (props) => {
  const [openAccordions, setOpenAccordions] = useState<string[]>(['beauty', 'fix', 'bg', 'style', 'text-edit']);

  const toggleLayer = (id: string) => {
    props.setVisibleLayers(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]);
  };

  const selectedTextLayer = props.textLayers.find(l => l.id === props.selectedTextId);

  return (
    <aside 
      className={`fixed lg:relative bottom-0 lg:top-0 left-0 w-full lg:w-80 bg-white dark:bg-[#0a1016] border-t lg:border-t-0 lg:border-r border-slate-200 dark:border-white/5 flex flex-col z-[150] lg:z-50 shadow-[0_-10px_40px_rgba(0,0,0,0.1)] lg:shadow-2xl transition-all duration-500 ease-in-out ${props.isMobileExpanded ? 'h-[80dvh] rounded-t-[2.5rem]' : 'h-14 lg:h-full lg:rounded-none'}`}
    >
      {/* Mobile Toggle Header */}
      <div 
        className="lg:hidden h-14 flex items-center justify-between px-6 cursor-pointer shrink-0 border-b border-black/5 dark:border-white/5"
        onClick={() => props.setIsMobileExpanded?.(!props.isMobileExpanded)}
      >
        <div className="flex items-center gap-3">
          <div className="w-7 h-7 rounded-lg bg-brand-blue/10 flex items-center justify-center text-brand-blue">
            <Sliders size={16} />
          </div>
          <span className="text-[10px] font-black uppercase tracking-widest text-slate-900 dark:text-white">Công cụ & Lịch sử</span>
        </div>
        <div className={`p-1.5 rounded-full bg-slate-100 dark:bg-white/5 transition-transform duration-500 ${props.isMobileExpanded ? 'rotate-180' : ''}`}>
          <ChevronUp size={16} />
        </div>
      </div>

      {/* Tabs */}
      <div className={`flex border-b border-slate-200 dark:border-white/5 bg-white dark:bg-[#0d151c] shrink-0 ${!props.isMobileExpanded ? 'hidden lg:flex' : 'flex'}`}>
        <button onClick={() => props.setActiveTab('layers')} className={`flex-grow py-4 text-[11px] font-black uppercase tracking-widest relative ${props.activeTab === 'layers' ? 'text-brand-blue' : 'text-slate-400 dark:text-slate-500'}`}>{props.activeTab === 'layers' && <div className="absolute bottom-0 left-0 w-full h-0.5 bg-brand-blue" />}Quản lý</button>
        <button onClick={() => props.setActiveTab('history')} className={`flex-grow py-4 text-[11px] font-black uppercase tracking-widest relative ${props.activeTab === 'history' ? 'text-brand-blue' : 'text-slate-400 dark:text-slate-500'}`}>{props.activeTab === 'history' && <div className="absolute bottom-0 left-0 w-full h-0.5 bg-brand-blue" />}Lịch sử</button>
      </div>
      
      <div className={`flex-grow overflow-y-auto no-scrollbar relative flex flex-col ${!props.isMobileExpanded ? 'hidden lg:flex' : 'flex'}`}>
        {props.activeTab === 'layers' ? (
          <div className="flex flex-col flex-grow z-10">
            <div className="p-4 space-y-3">
              <label className="text-[9px] font-black uppercase text-slate-400 dark:text-gray-500 tracking-widest px-1">Lớp hiển thị</label>
              <div className="flex gap-2">
                <LayerButton label="Ảnh" icon={<ImageIcon size={14}/>} active={props.visibleLayers.includes('bg')} onToggle={() => toggleLayer('bg')} />
                <LayerButton label="Vẽ" icon={<PenTool size={14}/>} active={props.visibleLayers.includes('draw')} onToggle={() => toggleLayer('draw')} />
                <LayerButton label="Mask" icon={<Eraser size={14}/>} active={props.visibleLayers.includes('mask')} onToggle={() => toggleLayer('mask')} />
                <LayerButton label="Text" icon={<Type size={14}/>} active={props.visibleLayers.includes('text')} onToggle={() => toggleLayer('text')} />
              </div>
            </div>

            <AnimatePresence>
               {props.selectedTextId && selectedTextLayer && (
                  <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }}>
                    <SidebarAccordion id="text-edit" title="EDIT SELECTED TEXT" openAccordions={openAccordions} setOpenAccordions={setOpenAccordions}>
                       <div className="p-4 space-y-6">
                          <div className="space-y-2">
                             <label className="text-[8px] font-black uppercase text-gray-400 tracking-widest">Nội dung văn bản</label>
                             <textarea 
                               value={selectedTextLayer.text}
                               onChange={(e) => props.updateTextLayer(selectedTextLayer.id, e.target.value)}
                               className="w-full bg-white dark:bg-black border border-black/10 dark:border-white/10 rounded-lg p-3 text-xs font-black uppercase outline-none focus:border-brand-blue transition-all resize-none h-20"
                             />
                          </div>
                          <div className="grid grid-cols-2 gap-4">
                             <div className="space-y-2">
                                <label className="text-[8px] font-black uppercase text-gray-400 tracking-widest">Kích cỡ</label>
                                <input 
                                  type="number" 
                                  value={selectedTextLayer.fontSize}
                                  readOnly
                                  className="w-full bg-white dark:bg-black border border-black/10 dark:border-white/10 rounded-lg p-2 text-xs font-black outline-none"
                                />
                             </div>
                             <div className="space-y-2">
                                <label className="text-[8px] font-black uppercase text-gray-400 tracking-widest">Hành động</label>
                                <button 
                                  onClick={props.deleteSelectedText}
                                  className="w-full flex items-center justify-center gap-2 py-2 bg-red-500/10 text-red-500 border border-red-500/20 rounded-lg hover:bg-red-500 hover:text-white transition-all text-[10px] font-black uppercase"
                                >
                                   <Trash2 size={12} /> Xóa
                                </button>
                             </div>
                          </div>
                       </div>
                    </SidebarAccordion>
                  </motion.div>
               )}
            </AnimatePresence>

            <SidebarAccordion id="beauty" title="BEAUTY" openAccordions={openAccordions} setOpenAccordions={setOpenAccordions}>
               <div className="grid grid-cols-3 gap-2 p-3">
                  <ActionButton label="Làm đẹp da" icon={<Sparkles size={14}/>} onClick={() => props.onSetPrompt("Nâng cấp da, làm mịn da chuyên nghiệp")} cost={props.actionCost} disabled={props.isActionsDisabled} />
                  <ActionButton label="Trang điểm" icon={<Palette size={14}/>} onClick={() => props.onSetPrompt("Trang điểm nhẹ nhàng")} cost={props.actionCost} disabled={props.isActionsDisabled} />
                  <ActionButton label="Glowing Skin" icon={<Sun size={14}/>} onClick={() => props.onSetPrompt("Hiệu ứng da căng bóng")} cost={props.actionCost} disabled={props.isActionsDisabled} />
               </div>
            </SidebarAccordion>

            <SidebarAccordion id="fix" title="PHOTO FIX" openAccordions={openAccordions} setOpenAccordions={setOpenAccordions}>
               <div className="grid grid-cols-3 gap-2 p-3">
                  <ActionButton label="Khử noise" icon={<Activity size={14}/>} onClick={() => props.onSetPrompt("Khử nhiễu, làm mượt các vùng ảnh bị vỡ (Denoise)")} cost={props.actionCost} disabled={props.isActionsDisabled} />
                  <ActionButton label="Tăng độ nét" icon={<Maximize2 size={14}/>} onClick={() => props.onSetPrompt("Tăng độ sắc nét, cải thiện chi tiết vật liệu (Upscale, sharpen)")} cost={props.actionCost} disabled={props.isActionsDisabled} />
                  <ActionButton label="Sửa ánh sáng" icon={<Sun size={14}/>} onClick={() => props.onSetPrompt("Cân bằng ánh sáng, tối ưu độ phơi sáng tự nhiên")} cost={props.actionCost} disabled={props.isActionsDisabled} />
               </div>
            </SidebarAccordion>

            <SidebarAccordion id="bg" title="BACKGROUND" openAccordions={openAccordions} setOpenAccordions={setOpenAccordions}>
               <div className="grid grid-cols-2 gap-2 p-3">
                  <ActionButton label="Xóa nền" icon={<Scissors size={14}/>} onClick={() => props.onSetPrompt("Xóa phông nền, giữ chủ thể sạch sẽ")} cost={props.actionCost} disabled={props.isActionsDisabled} />
                  <ActionButton label="Blur nền" icon={<Waves size={14}/>} onClick={() => props.onSetPrompt("Làm mờ hậu cảnh với hiệu ứng bokeh chuyên nghiệp")} cost={props.actionCost} disabled={props.isActionsDisabled} />
               </div>
            </SidebarAccordion>

            <SidebarAccordion id="style" title="STYLE TRANSFER" openAccordions={openAccordions} setOpenAccordions={setOpenAccordions}>
               <div className="grid grid-cols-3 gap-2 p-3">
                  <ActionButton label="Anime" icon={<Ghost size={14}/>} onClick={() => props.onSetPrompt("Chuyển sang phong cách Anime Nhật Bản hiện đại")} cost={props.actionCost} disabled={props.isActionsDisabled} />
                  <ActionButton label="Oil Painting" icon={<Brush size={14}/>} onClick={() => props.onSetPrompt("Chuyển sang phong cách tranh sơn dầu cổ điển")} cost={props.actionCost} disabled={props.isActionsDisabled} />
                  <ActionButton label="Sketch" icon={<Brush size={14}/>} onClick={() => props.onSetPrompt("Chuyển sang phong cách phác thảo bút chì nghệ thuật")} cost={props.actionCost} disabled={props.isActionsDisabled} />
               </div>
            </SidebarAccordion>
          </div>
        ) : (
          <div className="p-4 space-y-6 flex-grow z-10">
             <div className="space-y-4">
                <label className="text-[10px] font-black uppercase text-slate-400 dark:text-gray-500 tracking-widest px-1 flex items-center gap-2">
                  <ImageIcon size={12} /> Tệp tin gốc
                </label>
                {props.originalSource ? (
                  <div onClick={() => props.onHistoryClick(props.originalSource!)} className="p-3 border border-black/5 dark:border-white/10 rounded-xl cursor-pointer hover:border-brand-blue transition-all bg-white dark:bg-black/20 flex gap-4 items-center">
                    <div className="w-16 h-12 rounded bg-black overflow-hidden shrink-0">
                      <img src={props.originalSource} className="w-full h-full object-cover" alt="Original" />
                    </div>
                    <div className="flex-grow min-w-0">
                      <p className="text-[9px] font-black uppercase truncate text-slate-800 dark:text-white italic">Ảnh gốc tải lên</p>
                    </div>
                  </div>
                ) : (
                  <p className="text-[9px] text-center py-4 text-gray-500 uppercase font-black opacity-30">Chưa tải ảnh</p>
                )}
             </div>

             <div className="space-y-4 pt-4 border-t border-black/5 dark:border-white/5">
                <label className="text-[10px] font-black uppercase text-slate-400 dark:text-gray-500 tracking-widest px-1 flex items-center gap-2">
                   <HistoryIcon size={12} /> Phiên bản chỉnh sửa
                </label>
                {props.history.length === 0 ? (
                  <div className="py-20 text-center opacity-20 flex flex-col items-center gap-4">
                    <HistoryIcon size={40} className="mx-auto" />
                    <p className="text-[10px] font-black uppercase">Chưa có chỉnh sửa</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 gap-3">
                    {props.history.map(h => (
                      <div key={h.id} onClick={() => props.onHistoryClick(h.url)} className="p-3 border border-black/5 dark:border-white/10 rounded-xl cursor-pointer hover:border-brand-blue transition-all bg-white dark:bg-black/20 flex gap-4 items-center group">
                        <div className="w-16 h-12 rounded bg-black overflow-hidden shrink-0 group-hover:scale-105 transition-transform">
                          <img src={h.url} className="w-full h-full object-cover" alt="Edit" />
                        </div>
                        <div className="flex-grow min-w-0">
                          <p className="text-[9px] font-black uppercase truncate text-slate-800 dark:text-white">"{h.prompt || 'Edit'}"</p>
                          <p className="text-[7px] text-gray-500 uppercase font-bold">{h.timestamp}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
             </div>
          </div>
        )}
      </div>
    </aside>
  );
};