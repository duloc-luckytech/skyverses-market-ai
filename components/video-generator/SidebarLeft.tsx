import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Layers, Play, ChevronLeft, Plus, Loader2,
  Trash2, ListPlus, Video, Zap, X,
  Image as ImageIcon, FolderOpen, Upload
} from 'lucide-react';
import { ConfigurationPanel } from './ConfigurationPanel';
import { PricingModel } from '../../apis/pricing';
import { MobileGeneratorBar } from '../common/MobileGeneratorBar';
import { useAuth } from '../../context/AuthContext';

interface MultiFrameNode { id: string; url: string | null; mediaId: string | null; prompt: string; }
interface AutoTask { id: string; type: any; prompt: string; startUrl: string | null; startMediaId: string | null; endUrl: string | null; endMediaId: string | null; }

interface SidebarLeftProps {
  onClose: () => void;
  activeMode: 'SINGLE' | 'MULTI' | 'AUTO';
  setActiveMode: (mode: 'SINGLE' | 'MULTI' | 'AUTO') => void;
  prompt: string; setPrompt: (val: string) => void;
  startFrame: string | null; endFrame: string | null;
  handleSingleFrameClick: (slot: 'START' | 'END', mode: 'UPLOAD' | 'LIBRARY') => void;
  fileInputRef: React.RefObject<HTMLInputElement | null>;
  isUploadingImage: string | null;
  multiFrames: MultiFrameNode[];
  handleAddFrame: () => void; removeFrame: (id: string) => void;
  handleFramePromptChange: (id: string, val: string) => void;
  handleFrameClick: (id: string, mode: 'UPLOAD' | 'LIBRARY') => void;
  autoTasks: AutoTask[];
  isBulkImporting: boolean; setIsBulkImporting: (val: boolean) => void;
  bulkText: string; setBulkText: (val: string) => void;
  handleBulkImport: () => void;
  handleAutoPromptChange: (id: string, val: string) => void;
  removeAutoTask: (id: string) => void;
  handleAutoFileUploadClick: (id: string, slot: 'START' | 'END', mode: 'UPLOAD' | 'LIBRARY') => void;
  isMobileExpanded: boolean; setIsMobileExpanded: (val: boolean) => void;
  availableModels: PricingModel[];
  selectedModelObj: PricingModel | null; setSelectedModelObj: (model: PricingModel | null) => void;
  selectedEngine: string; setSelectedEngine: (val: string) => void;
  selectedMode: string; setSelectedMode: (val: string) => void;
  ratio: string; cycleRatio: () => void;
  duration: string; cycleDuration: () => void;
  soundEnabled: boolean; cycleSound: () => void;
  resolution: string; cycleResolution: () => void;
  usagePreference: 'credits' | 'key' | null;
  credits: number; setShowResourceModal: (val: boolean) => void;
  currentTotalCost: number; handleGenerate: () => void;
  isGenerating: boolean; isGenerateDisabled: boolean; generateTooltip: string | null;
  quantity: number; setQuantity: (val: number) => void;
  isModeBased?: boolean;
  familyList?: string[]; selectedFamily?: string; setSelectedFamily?: (val: string) => void;
  familyModes?: string[]; familyResolutions?: string[]; familyRatios?: string[];
  setRatio?: (val: string) => void; setResolution?: (val: string) => void;
  familyModels?: PricingModel[];
}

/* ─── FRAME SLOT ─── */
const Slot = ({ url, uploading, onUp, onLib }: { url: string | null; uploading: boolean; onUp: () => void; onLib: () => void }) => (
  <div className={`relative aspect-video bg-slate-100 dark:bg-white/[0.02] border rounded-lg overflow-hidden group cursor-pointer transition-all ${url ? 'border-black/[0.06] dark:border-white/[0.06]' : 'border-dashed border-black/[0.08] dark:border-white/[0.06] hover:border-indigo-500/30'}`}>
    {uploading ? <div className="flex items-center justify-center h-full"><Loader2 size={14} className="text-indigo-400 animate-spin" /></div>
      : url ? <img src={url} className="w-full h-full object-cover" alt="" />
        : <div className="flex items-center justify-center h-full opacity-15"><ImageIcon size={16} /></div>}
    <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-1.5">
      <button onClick={e => { e.stopPropagation(); onUp(); }} className="p-1.5 bg-white/10 backdrop-blur rounded-md text-white/80 hover:bg-indigo-500 transition-all"><Upload size={10} /></button>
      <button onClick={e => { e.stopPropagation(); onLib(); }} className="p-1.5 bg-white/10 backdrop-blur rounded-md text-white/80 hover:bg-indigo-500 transition-all"><FolderOpen size={10} /></button>
    </div>
  </div>
);

export const SidebarLeft: React.FC<SidebarLeftProps> = (props) => {
  const { credits } = useAuth();
  const stop = (e: React.MouseEvent) => e.stopPropagation();

  return (
    <aside className={`fixed lg:relative bottom-0 lg:top-0 left-0 w-full lg:w-[320px] shrink-0 bg-white dark:bg-[#111114] border-t lg:border-t-0 lg:border-r border-black/[0.06] dark:border-white/[0.04] flex flex-col z-[150] lg:z-50 transition-all duration-500 ${props.isMobileExpanded ? 'h-[92dvh] rounded-t-2xl' : 'h-32 lg:h-full'}`}>

      {/* ─── MOBILE BAR ─── */}
      <MobileGeneratorBar
        isExpanded={props.isMobileExpanded} setIsExpanded={props.setIsMobileExpanded}
        prompt={props.prompt} setPrompt={props.setPrompt}
        credits={credits} totalCost={props.currentTotalCost}
        isGenerating={props.isGenerating} isGenerateDisabled={props.isGenerateDisabled}
        onGenerate={(e) => { stop(e); props.handleGenerate(); if (window.innerWidth < 1024) props.setIsMobileExpanded(false); }}
        onOpenLibrary={() => props.handleSingleFrameClick('START', 'LIBRARY')}
        generateLabel="TẠO VIDEO" type="video"
      />

      {/* ─── HEADER ─── */}
      <div className={`px-3 pt-2.5 pb-2 border-b border-black/[0.06] dark:border-white/[0.04] shrink-0 ${!props.isMobileExpanded ? 'hidden lg:block' : 'block'}`}>
        <div className="hidden lg:flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <button onClick={e => { stop(e); props.onClose(); }} className="p-0.5 text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors"><ChevronLeft size={16} /></button>
            <Video size={12} className="text-indigo-400" />
            <span className="text-xs font-semibold text-slate-600 dark:text-white/70">Video Studio</span>
          </div>
        </div>
        {/* MODE TABS */}
        <div className="flex bg-black/[0.02] dark:bg-white/[0.02] rounded-lg border border-black/[0.06] dark:border-white/[0.04] overflow-hidden">
          {(['SINGLE', 'MULTI', 'AUTO'] as const).map(m => (
            <button key={m} onClick={e => { stop(e); props.setActiveMode(m); }}
              className={`flex-1 flex items-center justify-center gap-1.5 py-2 text-[10px] font-semibold uppercase tracking-wider transition-all ${props.activeMode === m ? 'bg-black/[0.04] dark:bg-white/[0.06] text-slate-900 dark:text-white' : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-white/60'
                }`}>
              {m === 'SINGLE' ? <Play size={9} /> : m === 'MULTI' ? <Layers size={9} /> : <Zap size={9} />}
              {m === 'SINGLE' ? 'Đơn' : m === 'MULTI' ? 'Multi' : 'Auto'}
            </button>
          ))}
        </div>
      </div>

      {/* ─── CONTENT ─── */}
      <div className={`flex-grow overflow-y-auto no-scrollbar px-3 py-2.5 ${!props.isMobileExpanded ? 'hidden lg:block' : 'block'}`}>
        <AnimatePresence mode="wait">
          {/* SINGLE */}
          {props.activeMode === 'SINGLE' && (
            <motion.div key="s" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-2.5">
              <div className="space-y-1">
                <p className="text-[10px] font-semibold uppercase text-slate-500 dark:text-slate-400 tracking-wider px-0.5">Kịch bản</p>
                <p className="text-[9px] text-slate-400 dark:text-slate-500 px-0.5 leading-relaxed">Mô tả chi tiết nội dung video bạn muốn tạo. Càng chi tiết, kết quả càng chính xác.</p>
                <textarea
                  value={props.prompt} onChange={e => props.setPrompt(e.target.value)}
                  className="w-full min-h-[100px] bg-slate-50 dark:bg-white/[0.02] border border-black/[0.06] dark:border-white/[0.04] rounded-lg p-3 text-xs font-medium focus:border-indigo-500/30 outline-none transition-all resize-y text-slate-800 dark:text-white/80 placeholder:text-slate-300 dark:placeholder:text-[#333] leading-relaxed"
                  placeholder="VD: Một chú mèo đang nhảy qua hàng rào trong vườn hoa, ánh nắng chiều, phong cách cinematic 4K..."
                />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div className="space-y-0.5">
                  <p className="text-[9px] font-medium text-slate-500 dark:text-slate-400 px-0.5">Start <span className="font-normal text-slate-400 dark:text-slate-500">(Khung hình đầu)</span></p>
                  <Slot url={props.startFrame} uploading={props.isUploadingImage === 'START'} onUp={() => props.handleSingleFrameClick('START', 'UPLOAD')} onLib={() => props.handleSingleFrameClick('START', 'LIBRARY')} />
                </div>
                <div className="space-y-0.5">
                  <p className="text-[9px] font-medium text-slate-500 dark:text-slate-400 px-0.5">End <span className="font-normal text-slate-400 dark:text-slate-500">(Khung hình cuối)</span></p>
                  <Slot url={props.endFrame} uploading={props.isUploadingImage === 'END'} onUp={() => props.handleSingleFrameClick('END', 'UPLOAD')} onLib={() => props.handleSingleFrameClick('END', 'LIBRARY')} />
                </div>
              </div>
              <p className="text-[8px] text-slate-400 dark:text-slate-500 px-0.5 leading-relaxed">💡 Tải lên ảnh bắt đầu & kết thúc để AI tạo chuyển động giữa 2 khung hình. Có thể để trống nếu chỉ dùng kịch bản.</p>
            </motion.div>
          )}

          {/* MULTI */}
          {props.activeMode === 'MULTI' && (
            <motion.div key="m" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-2">
              <div className="flex justify-between items-center">
                <p className="text-[10px] font-semibold uppercase text-slate-500 dark:text-slate-400 tracking-wider">{props.multiFrames.length} frames</p>
                <button onClick={e => { stop(e); props.handleAddFrame(); }} className="text-indigo-400 text-[10px] font-semibold flex items-center gap-1 hover:brightness-125"><Plus size={12} strokeWidth={3} /> Add</button>
              </div>
              <div className="grid grid-cols-3 gap-1.5">
                {props.multiFrames.map((f, i) => (
                  <div key={f.id} className="space-y-1">
                    <div className={`relative aspect-[16/10] bg-slate-100 dark:bg-white/[0.02] border rounded-lg overflow-hidden group ${f.url ? 'border-black/[0.06] dark:border-white/[0.06]' : 'border-dashed border-black/[0.08] dark:border-white/[0.06]'}`}>
                      {props.isUploadingImage === f.id ? <div className="flex items-center justify-center h-full"><Loader2 size={12} className="text-indigo-400 animate-spin" /></div>
                        : f.url ? <img src={f.url} className="w-full h-full object-cover" alt="" />
                          : <div className="flex items-center justify-center h-full opacity-15"><ImageIcon size={12} /></div>}
                      <div className="absolute top-0.5 left-0.5 w-4 h-4 bg-indigo-600/80 rounded text-[8px] font-bold flex items-center justify-center text-white">{i + 1}</div>
                      <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-1">
                        <button onClick={e => { stop(e); props.handleFrameClick(f.id, 'UPLOAD'); }} className="p-1 bg-white/10 rounded text-white/80 hover:bg-indigo-500 transition-all"><Upload size={8} /></button>
                        <button onClick={e => { stop(e); props.handleFrameClick(f.id, 'LIBRARY'); }} className="p-1 bg-white/10 rounded text-white/80 hover:bg-indigo-500 transition-all"><FolderOpen size={8} /></button>
                      </div>
                      {props.multiFrames.length > 2 && <button onClick={e => { stop(e); props.removeFrame(f.id); }} className="absolute top-0.5 right-0.5 p-0.5 bg-black/50 rounded text-white/30 hover:text-red-400 transition-all"><Trash2 size={7} /></button>}
                    </div>
                    {i < props.multiFrames.length - 1
                      ? <textarea value={f.prompt} onChange={e => props.handleFramePromptChange(f.id, e.target.value)} placeholder="..." className="w-full h-9 bg-slate-50 dark:bg-white/[0.02] border border-black/[0.06] dark:border-white/[0.04] rounded p-1.5 text-[9px] font-medium text-slate-700 dark:text-white/60 focus:border-indigo-500/30 outline-none resize-none" />
                      : <div className="h-9 flex items-center justify-center border border-dashed border-black/[0.06] dark:border-white/[0.04] rounded opacity-30"><span className="text-[8px] font-semibold uppercase text-slate-400 dark:text-[#555]">End</span></div>
                    }
                  </div>
                ))}
              </div>
            </motion.div>
          )}

          {/* AUTO */}
          {props.activeMode === 'AUTO' && (
            <motion.div key="a" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-2">
              <div className="flex justify-between items-center">
                <p className="text-[10px] font-semibold uppercase text-slate-500 dark:text-slate-400 tracking-wider">Batch</p>
                <button onClick={e => { stop(e); props.setIsBulkImporting(!props.isBulkImporting); }} className="text-indigo-400 text-[10px] font-semibold flex items-center gap-1 hover:brightness-125">
                  {props.isBulkImporting ? <><X size={12} /> Hủy</> : <><ListPlus size={12} /> Nhập</>}
                </button>
              </div>
              <AnimatePresence>
                {props.isBulkImporting && (
                  <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
                    <div className="p-2 bg-indigo-500/5 border border-indigo-500/10 rounded-lg space-y-1.5">
                      <textarea value={props.bulkText} onChange={e => props.setBulkText(e.target.value)} className="w-full h-20 bg-slate-50 dark:bg-white/[0.03] border border-black/[0.06] dark:border-white/[0.06] rounded p-2.5 text-[10px] font-medium text-slate-700 dark:text-white/70 focus:border-indigo-500/30 outline-none resize-none" placeholder="Mỗi dòng = 1 kịch bản..." />
                      <button onClick={e => { stop(e); props.handleBulkImport(); }} className="w-full py-2 bg-indigo-600 text-white rounded text-[10px] font-semibold uppercase tracking-wider">Phân tách</button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
              <div className="space-y-1.5">
                {props.autoTasks.map((t, i) => (
                  <div key={t.id} className="p-2 bg-black/[0.01] dark:bg-white/[0.015] border border-black/[0.06] dark:border-white/[0.04] rounded-lg space-y-1.5 group hover:border-indigo-500/20 transition-all">
                    <div className="flex justify-between items-center">
                      <span className="text-[9px] font-semibold text-indigo-400">#{i + 1}</span>
                      <button onClick={e => { stop(e); props.removeAutoTask(t.id); }} className="text-slate-300 dark:text-[#333] hover:text-red-400 transition-colors"><Trash2 size={9} /></button>
                    </div>
                    <textarea value={t.prompt} onChange={e => props.handleAutoPromptChange(t.id, e.target.value)} placeholder="Kịch bản..." className="w-full h-9 bg-transparent border-b border-black/[0.06] dark:border-white/[0.04] text-[10px] font-medium outline-none focus:border-indigo-500/20 resize-none text-slate-700 dark:text-white/70" />
                    <div className="grid grid-cols-2 gap-1.5">
                      <div className="aspect-video bg-slate-100 dark:bg-white/[0.02] border border-dashed border-black/[0.08] dark:border-white/[0.06] rounded flex items-center justify-center overflow-hidden relative group/s">
                        {props.isUploadingImage === `${t.id}-START` ? <Loader2 size={10} className="text-indigo-400 animate-spin" />
                          : t.startUrl ? <img src={t.startUrl} className="w-full h-full object-cover" alt="" />
                            : <span className="text-[8px] font-medium text-slate-400 dark:text-[#333]">Start</span>}
                        <div className="absolute inset-0 bg-black/60 opacity-0 group-hover/s:opacity-100 transition-opacity flex items-center justify-center gap-1">
                          <button onClick={e => { stop(e); props.handleAutoFileUploadClick(t.id, 'START', 'UPLOAD'); }} className="p-1 bg-white/10 rounded text-white/80 hover:bg-indigo-500"><Upload size={7} /></button>
                          <button onClick={e => { stop(e); props.handleAutoFileUploadClick(t.id, 'START', 'LIBRARY'); }} className="p-1 bg-white/10 rounded text-white/80 hover:bg-indigo-500"><FolderOpen size={7} /></button>
                        </div>
                      </div>
                      <div className="aspect-video bg-slate-100 dark:bg-white/[0.02] border border-dashed border-black/[0.08] dark:border-white/[0.06] rounded flex items-center justify-center overflow-hidden relative group/e">
                        {props.isUploadingImage === `${t.id}-END` ? <Loader2 size={10} className="text-indigo-400 animate-spin" />
                          : t.endUrl ? <img src={t.endUrl} className="w-full h-full object-cover" alt="" />
                            : <span className="text-[8px] font-medium text-slate-400 dark:text-[#333]">End</span>}
                        <div className="absolute inset-0 bg-black/60 opacity-0 group-hover/e:opacity-100 transition-opacity flex items-center justify-center gap-1">
                          <button onClick={e => { stop(e); props.handleAutoFileUploadClick(t.id, 'END', 'UPLOAD'); }} className="p-1 bg-white/10 rounded text-white/80 hover:bg-indigo-500"><Upload size={7} /></button>
                          <button onClick={e => { stop(e); props.handleAutoFileUploadClick(t.id, 'END', 'LIBRARY'); }} className="p-1 bg-white/10 rounded text-white/80 hover:bg-indigo-500"><FolderOpen size={7} /></button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* ─── CONFIG PANEL ─── */}
      <ConfigurationPanel
        availableModels={props.availableModels} selectedModelObj={props.selectedModelObj} setSelectedModelObj={props.setSelectedModelObj}
        selectedEngine={props.selectedEngine} setSelectedEngine={props.setSelectedEngine}
        selectedMode={props.selectedMode} setSelectedMode={props.setSelectedMode}
        ratio={props.ratio} cycleRatio={props.cycleRatio} duration={props.duration} cycleDuration={props.cycleDuration}
        soundEnabled={props.soundEnabled} cycleSound={props.cycleSound} resolution={props.resolution} cycleResolution={props.cycleResolution}
        usagePreference={props.usagePreference} credits={props.credits} setShowResourceModal={props.setShowResourceModal}
        currentTotalCost={props.currentTotalCost} handleGenerate={props.handleGenerate}
        isGenerating={props.isGenerating} isGenerateDisabled={props.isGenerateDisabled} generateTooltip={props.generateTooltip}
        activeMode={props.activeMode} autoTasksCount={props.autoTasks.filter(t => t.prompt.trim() !== '').length}
        multiFramesCount={props.multiFrames.length - 1} isMobileExpanded={props.isMobileExpanded}
        quantity={props.quantity} setQuantity={props.setQuantity} isModeBased={props.isModeBased}
        familyList={props.familyList} selectedFamily={props.selectedFamily} setSelectedFamily={props.setSelectedFamily}
        familyModes={props.familyModes} familyResolutions={props.familyResolutions} familyRatios={props.familyRatios}
        setRatio={props.setRatio} setResolution={props.setResolution} familyModels={props.familyModels}
      />
    </aside>
  );
};
