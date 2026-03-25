import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ChevronDown, Wand2, ScanFace, Droplets, Radius, Focus, SunDim, Scissors, CircleDashed, Drama, Frame, Pencil, Zap,
  Layers, Paintbrush, Eraser, Type, SlidersHorizontal, Trash2, Clock, FileImage, Server
} from 'lucide-react';
import { ModelAISelector } from './ModelAISelector';

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
  selectedEngine?: string;
  onSelectEngine?: (val: string) => void;
}

const LayerButton = ({ icon, label, active, onToggle }: any) => (
  <button 
    onClick={onToggle}
    className={`flex-grow flex flex-col items-center justify-center gap-1.5 py-3 border rounded-xl transition-all ${active ? 'bg-brand-blue/10 border-brand-blue/20 text-brand-blue' : 'bg-slate-50 dark:bg-white/[0.02] border-slate-100 dark:border-white/[0.06] text-slate-400 dark:text-white/30'}`}
  >
    {icon}
    <span className="text-[7px] font-bold uppercase tracking-widest">{label}</span>
  </button>
);

const SidebarSection = ({ title, children, defaultOpen = true }: { title: string; children: React.ReactNode; defaultOpen?: boolean }) => {
  const [isOpen, setIsOpen] = useState(defaultOpen);
  return (
    <div className="border-b border-slate-100 dark:border-white/[0.04] overflow-hidden">
       <button onClick={() => setIsOpen(!isOpen)} className="w-full flex items-center justify-between py-4 px-4 text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400 dark:text-white/30 hover:text-slate-700 dark:hover:text-white/60 transition-colors">
          <span>{title}</span>
          <ChevronDown size={14} className={`transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`} />
       </button>
       <AnimatePresence>{isOpen && <motion.div initial={{ height: 0 }} animate={{ height: 'auto' }} exit={{ height: 0 }} className="overflow-hidden">{children}</motion.div>}</AnimatePresence>
    </div>
  );
};

const ActionButton = ({ label, icon, onClick, cost, disabled }: any) => (
  <button 
    onClick={onClick} disabled={disabled}
    className={`bg-white dark:bg-white/[0.02] border border-slate-100 dark:border-white/[0.06] rounded-xl flex flex-col items-center justify-center gap-2 py-3 px-2 transition-all active:scale-95 group relative overflow-hidden ${disabled ? 'opacity-30 cursor-not-allowed' : 'hover:border-brand-blue/30 hover:bg-brand-blue/[0.02]'}`}
  >
     <div className={`transition-colors ${disabled ? 'text-slate-300 dark:text-white/20' : 'text-slate-400 dark:text-white/40 group-hover:text-brand-blue'}`}>{icon}</div>
     <span className="text-[8px] font-bold uppercase text-slate-500 dark:text-white/40 text-center leading-tight tracking-wide">{label}</span>
     {!disabled && (
       <div className="absolute top-0 right-0 bg-orange-500/90 text-white px-1.5 py-0.5 rounded-bl-lg flex items-center gap-0.5 z-10">
          <Zap size={7} fill="currentColor" />
          <span className="text-[7px] font-bold">{cost}</span>
       </div>
     )}
  </button>
);

export const EditorSidebar: React.FC<EditorSidebarProps> = (props) => {
  const [openSections] = useState<string[]>(['beauty', 'fix', 'bg', 'style', 'text-edit', 'infrastructure']);

  const toggleLayer = (id: string) => {
    props.setVisibleLayers(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]);
  };

  const selectedTextLayer = props.textLayers.find(l => l.id === props.selectedTextId);

  return (
    <aside 
      className={`fixed lg:relative bottom-0 lg:top-0 left-0 w-full lg:w-80 bg-white dark:bg-[#0e0f14] border-t lg:border-t-0 lg:border-r border-slate-100 dark:border-white/[0.04] flex flex-col z-[150] lg:z-50 shadow-[0_-10px_40px_rgba(0,0,0,0.06)] lg:shadow-none transition-all duration-500 ease-in-out ${props.isMobileExpanded ? 'h-[80dvh] rounded-t-[2rem]' : 'h-14 lg:h-full lg:rounded-none'}`}
    >
      {/* Mobile Toggle Header */}
      <div 
        className="lg:hidden h-14 flex items-center justify-between px-6 cursor-pointer shrink-0 border-b border-slate-100 dark:border-white/[0.04]"
        onClick={() => props.setIsMobileExpanded?.(!props.isMobileExpanded)}
      >
        <div className="flex items-center gap-3">
          <div className="w-7 h-7 rounded-lg bg-brand-blue/10 flex items-center justify-center text-brand-blue">
            <SlidersHorizontal size={14} />
          </div>
          <span className="text-[11px] font-bold text-slate-900 dark:text-white">Bảng điều khiển</span>
        </div>
        <div className={`p-1 rounded-full bg-slate-100 dark:bg-white/5 transition-transform duration-500 ${props.isMobileExpanded ? 'rotate-180' : ''}`}>
          <ChevronDown size={14} className="text-slate-400" />
        </div>
      </div>

      {/* Tabs */}
      <div className={`flex border-b border-slate-100 dark:border-white/[0.04] bg-white dark:bg-[#0e0f14] shrink-0 ${!props.isMobileExpanded ? 'hidden lg:flex' : 'flex'}`}>
        <button onClick={() => props.setActiveTab('layers')} className={`flex-grow py-3.5 text-[11px] font-bold uppercase tracking-wider relative transition-colors ${props.activeTab === 'layers' ? 'text-brand-blue' : 'text-slate-400 dark:text-white/30'}`}>{props.activeTab === 'layers' && <div className="absolute bottom-0 left-0 w-full h-0.5 bg-brand-blue rounded-full" />}Công cụ</button>
        <button onClick={() => props.setActiveTab('history')} className={`flex-grow py-3.5 text-[11px] font-bold uppercase tracking-wider relative transition-colors ${props.activeTab === 'history' ? 'text-brand-blue' : 'text-slate-400 dark:text-white/30'}`}>{props.activeTab === 'history' && <div className="absolute bottom-0 left-0 w-full h-0.5 bg-brand-blue rounded-full" />}Lịch sử</button>
      </div>
      
      <div className={`flex-grow overflow-y-auto no-scrollbar relative flex flex-col ${!props.isMobileExpanded ? 'hidden lg:flex' : 'flex'}`}>
        {props.activeTab === 'layers' ? (
          <div className="flex flex-col flex-grow z-10">
            {/* Layer visibility */}
            <div className="p-4 space-y-3">
              <label className="text-[9px] font-bold uppercase text-slate-400 dark:text-white/30 tracking-widest px-1">Layer hiển thị</label>
              <div className="flex gap-2">
                <LayerButton label="Gốc" icon={<Layers size={14}/>} active={props.visibleLayers.includes('bg')} onToggle={() => toggleLayer('bg')} />
                <LayerButton label="Brush" icon={<Paintbrush size={14}/>} active={props.visibleLayers.includes('draw')} onToggle={() => toggleLayer('draw')} />
                <LayerButton label="Mask" icon={<Eraser size={14}/>} active={props.visibleLayers.includes('mask')} onToggle={() => toggleLayer('mask')} />
                <LayerButton label="Text" icon={<Type size={14}/>} active={props.visibleLayers.includes('text')} onToggle={() => toggleLayer('text')} />
              </div>
            </div>

            {/* Infrastructure Section */}
            <SidebarSection title="Máy chủ AI">
               <div className="p-4 pt-1 pb-5">
                  <ModelAISelector 
                    selectedModel={props.selectedModel}
                    models={props.models}
                    onSelect={props.setSelectedModel}
                    selectedEngine={props.selectedEngine}
                    onSelectEngine={props.onSelectEngine}
                  />
               </div>
            </SidebarSection>

            {/* Text edit section */}
            <AnimatePresence>
               {props.selectedTextId && selectedTextLayer && (
                  <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }}>
                    <SidebarSection title="Chỉnh text" defaultOpen={true}>
                       <div className="p-4 space-y-4">
                          <div className="space-y-1.5">
                             <label className="text-[9px] font-bold uppercase text-slate-400 dark:text-white/30 tracking-widest">Nội dung text</label>
                             <textarea 
                               value={selectedTextLayer.text}
                               onChange={(e) => props.updateTextLayer(selectedTextLayer.id, e.target.value)}
                               className="w-full bg-slate-50 dark:bg-white/[0.03] border border-slate-100 dark:border-white/[0.06] rounded-xl p-3 text-xs font-bold outline-none focus:border-brand-blue transition-all resize-none h-20 text-slate-800 dark:text-white"
                             />
                          </div>
                          <div className="grid grid-cols-2 gap-3">
                             <div className="space-y-1.5">
                                <label className="text-[9px] font-bold uppercase text-slate-400 dark:text-white/30 tracking-widest">Cỡ chữ</label>
                                <input 
                                  type="number" 
                                  value={selectedTextLayer.fontSize}
                                  readOnly
                                  className="w-full bg-slate-50 dark:bg-white/[0.03] border border-slate-100 dark:border-white/[0.06] rounded-xl p-2.5 text-xs font-bold outline-none text-slate-800 dark:text-white"
                                />
                             </div>
                             <div className="space-y-1.5">
                                <label className="text-[9px] font-bold uppercase text-slate-400 dark:text-white/30 tracking-widest">Hành động</label>
                                <button 
                                  onClick={props.deleteSelectedText}
                                  className="w-full flex items-center justify-center gap-2 py-2.5 bg-red-500/10 text-red-500 border border-red-500/20 rounded-xl hover:bg-red-500 hover:text-white transition-all text-[10px] font-bold uppercase"
                                >
                                   <Trash2 size={12} /> Xóa layer
                                </button>
                             </div>
                          </div>
                       </div>
                    </SidebarSection>
                  </motion.div>
               )}
            </AnimatePresence>

            {/* Beauty section */}
            <SidebarSection title="Làm đẹp">
               <div className="grid grid-cols-3 gap-2 p-3 pb-4">
                  <ActionButton label="Làm mịn da" icon={<ScanFace size={14}/>} onClick={() => props.onSetPrompt("Nâng cấp da, làm mịn da chuyên nghiệp")} cost={props.actionCost} disabled={props.isActionsDisabled} />
                  <ActionButton label="Trang điểm" icon={<Wand2 size={14}/>} onClick={() => props.onSetPrompt("Trang điểm nhẹ nhàng, tự nhiên")} cost={props.actionCost} disabled={props.isActionsDisabled} />
                  <ActionButton label="Da sáng" icon={<Droplets size={14}/>} onClick={() => props.onSetPrompt("Hiệu ứng da căng bóng, tươi sáng")} cost={props.actionCost} disabled={props.isActionsDisabled} />
               </div>
            </SidebarSection>

            {/* Photo Fix section */}
            <SidebarSection title="Sửa ảnh">
               <div className="grid grid-cols-3 gap-2 p-3 pb-4">
                  <ActionButton label="Giảm nhiễu" icon={<Radius size={14}/>} onClick={() => props.onSetPrompt("Khử nhiễu, làm mượt các vùng ảnh bị vỡ (Denoise)")} cost={props.actionCost} disabled={props.isActionsDisabled} />
                  <ActionButton label="Làm nét" icon={<Focus size={14}/>} onClick={() => props.onSetPrompt("Tăng độ sắc nét, cải thiện chi tiết vật liệu (Upscale, sharpen)")} cost={props.actionCost} disabled={props.isActionsDisabled} />
                  <ActionButton label="Cân sáng" icon={<SunDim size={14}/>} onClick={() => props.onSetPrompt("Cân bằng ánh sáng, tối ưu độ phơi sáng tự nhiên")} cost={props.actionCost} disabled={props.isActionsDisabled} />
               </div>
            </SidebarSection>

            {/* Background section */}
            <SidebarSection title="Phông nền">
               <div className="grid grid-cols-2 gap-2 p-3 pb-4">
                  <ActionButton label="Xóa nền" icon={<Scissors size={14}/>} onClick={() => props.onSetPrompt("Xóa phông nền, giữ chủ thể sạch sẽ")} cost={props.actionCost} disabled={props.isActionsDisabled} />
                  <ActionButton label="Làm mờ nền" icon={<CircleDashed size={14}/>} onClick={() => props.onSetPrompt("Làm mờ hậu cảnh với hiệu ứng bokeh chuyên nghiệp")} cost={props.actionCost} disabled={props.isActionsDisabled} />
               </div>
            </SidebarSection>

            {/* Style Transfer section */}
            <SidebarSection title="Chuyển phong cách">
               <div className="grid grid-cols-3 gap-2 p-3 pb-4">
                  <ActionButton label="Anime" icon={<Drama size={14}/>} onClick={() => props.onSetPrompt("Chuyển sang phong cách Anime Nhật Bản hiện đại")} cost={props.actionCost} disabled={props.isActionsDisabled} />
                  <ActionButton label="Sơn dầu" icon={<Frame size={14}/>} onClick={() => props.onSetPrompt("Chuyển sang phong cách tranh sơn dầu cổ điển")} cost={props.actionCost} disabled={props.isActionsDisabled} />
                  <ActionButton label="Phác thảo" icon={<Pencil size={14}/>} onClick={() => props.onSetPrompt("Chuyển sang phong cách phác thảo bút chì nghệ thuật")} cost={props.actionCost} disabled={props.isActionsDisabled} />
               </div>
            </SidebarSection>
          </div>
        ) : (
          /* History tab */
          <div className="p-4 space-y-5 flex-grow z-10">
             <div className="space-y-3">
                <label className="text-[10px] font-bold uppercase text-slate-400 dark:text-white/30 tracking-wider px-1 flex items-center gap-2">
                  <FileImage size={12} /> Ảnh gốc
                </label>
                {props.originalSource ? (
                  <div onClick={() => props.onHistoryClick(props.originalSource!)} className="p-3 border border-slate-100 dark:border-white/[0.06] rounded-xl cursor-pointer hover:border-brand-blue/30 transition-all bg-slate-50/50 dark:bg-white/[0.02] flex gap-4 items-center group">
                    <div className="w-14 h-10 rounded-lg bg-slate-200 dark:bg-black overflow-hidden shrink-0 group-hover:scale-105 transition-transform">
                      <img src={props.originalSource} className="w-full h-full object-cover" alt="Original" />
                    </div>
                    <div className="flex-grow min-w-0">
                      <p className="text-[10px] font-bold truncate text-slate-700 dark:text-white/80">Ảnh gốc (chưa chỉnh)</p>
                    </div>
                  </div>
                ) : (
                  <p className="text-[10px] text-center py-4 text-slate-400 dark:text-white/20 font-medium">Chưa có ảnh nào</p>
                )}
             </div>

             <div className="space-y-3 pt-3 border-t border-slate-100 dark:border-white/[0.04]">
                <label className="text-[10px] font-bold uppercase text-slate-400 dark:text-white/30 tracking-wider px-1 flex items-center gap-2">
                   <Clock size={12} /> Các phiên bản
                </label>
                {props.history.length === 0 ? (
                  <div className="py-16 text-center opacity-15 flex flex-col items-center gap-4">
                    <Clock size={36} className="mx-auto" />
                    <p className="text-[10px] font-bold uppercase tracking-wider">Chưa có phiên bản chỉnh sửa</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 gap-2">
                    {props.history.map(h => (
                      <div key={h.id} onClick={() => props.onHistoryClick(h.url)} className="p-3 border border-slate-100 dark:border-white/[0.06] rounded-xl cursor-pointer hover:border-brand-blue/30 transition-all bg-slate-50/50 dark:bg-white/[0.02] flex gap-4 items-center group">
                        <div className="w-14 h-10 rounded-lg bg-slate-200 dark:bg-black overflow-hidden shrink-0 group-hover:scale-105 transition-transform">
                          <img src={h.url} className="w-full h-full object-cover" alt="Edit" />
                        </div>
                        <div className="flex-grow min-w-0">
                          <p className="text-[10px] font-bold truncate text-slate-700 dark:text-white/80">"{h.prompt || 'Edit'}"</p>
                          <p className="text-[8px] text-slate-400 dark:text-white/20 font-medium">{h.timestamp}</p>
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