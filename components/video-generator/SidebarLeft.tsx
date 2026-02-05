import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  X, Layers, Play, ChevronLeft, Terminal, Plus, Loader2, 
  ChevronUp, SlidersHorizontal, ArrowRight, Trash2, ListPlus, Video, Zap,
  Image as ImageIcon, FolderOpen, Upload
} from 'lucide-react';
import { ConfigurationPanel } from './ConfigurationPanel';
import { PricingModel } from '../../apis/pricing';

interface MultiFrameNode {
  id: string;
  url: string | null;
  mediaId: string | null;
  prompt: string;
}

interface AutoTask {
  id: string;
  type: any;
  prompt: string;
  startUrl: string | null;
  startMediaId: string | null;
  endUrl: string | null;
  endMediaId: string | null;
}

interface SidebarLeftProps {
  onClose: () => void;
  activeMode: 'SINGLE' | 'MULTI' | 'AUTO';
  setActiveMode: (mode: 'SINGLE' | 'MULTI' | 'AUTO') => void;
  prompt: string;
  setPrompt: (val: string) => void;
  startFrame: string | null;
  endFrame: string | null;
  handleSingleFrameClick: (slot: 'START' | 'END', mode: 'UPLOAD' | 'LIBRARY') => void;
  fileInputRef: React.RefObject<HTMLInputElement | null>;
  isUploadingImage: string | null;
  multiFrames: MultiFrameNode[];
  handleAddFrame: () => void;
  removeFrame: (id: string) => void;
  handleFramePromptChange: (id: string, val: string) => void;
  handleFrameClick: (id: string, mode: 'UPLOAD' | 'LIBRARY') => void;
  autoTasks: AutoTask[];
  isBulkImporting: boolean;
  setIsBulkImporting: (val: boolean) => void;
  bulkText: string;
  setBulkText: (val: string) => void;
  handleBulkImport: () => void;
  handleAutoPromptChange: (id: string, val: string) => void;
  removeAutoTask: (id: string) => void;
  handleAutoFileUploadClick: (id: string, slot: 'START' | 'END', mode: 'UPLOAD' | 'LIBRARY') => void;
  isMobileExpanded: boolean;
  setIsMobileExpanded: (val: boolean) => void;
  // Config Props
  availableModels: PricingModel[];
  selectedModelObj: PricingModel | null;
  setSelectedModelObj: (model: PricingModel | null) => void;
  selectedEngine: string;
  setSelectedEngine: (val: string) => void;
  selectedMode: string;
  setSelectedMode: (val: string) => void;
  ratio: '16:9' | '9:16';
  cycleRatio: () => void;
  duration: string;
  cycleDuration: () => void;
  soundEnabled: boolean;
  cycleSound: () => void;
  resolution: string;
  cycleResolution: () => void;
  usagePreference: 'credits' | 'key' | null;
  credits: number;
  setShowResourceModal: (val: boolean) => void;
  currentTotalCost: number;
  handleGenerate: () => void;
  isGenerating: boolean;
  isGenerateDisabled: boolean;
  generateTooltip: string | null;
  quantity: number;
  setQuantity: (val: number) => void;
}

const RefPickerSlot = ({ 
  url, 
  isUploading, 
  onUpload, 
  onLibrary, 
  label 
}: { 
  url: string | null, 
  isUploading: boolean, 
  onUpload: () => void, 
  onLibrary: () => void,
  label: string
}) => (
  <div className="space-y-2">
    <label className="text-[10px] font-black uppercase text-slate-400 dark:text-gray-500 tracking-widest">{label}</label>
    <div className={`relative aspect-video bg-slate-100 dark:bg-black border-2 border-dashed rounded-xl flex items-center justify-center transition-all overflow-hidden group ${url ? 'border-brand-blue/50 shadow-lg' : 'border-slate-200 dark:border-white/5 hover:border-brand-blue/40'}`}>
      {isUploading ? (
        <Loader2 size={24} className="text-brand-blue animate-spin" />
      ) : url ? (
        <>
          <img src={url} className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3">
             <button onClick={(e) => { e.stopPropagation(); onUpload(); }} className="p-2.5 bg-white text-black rounded-full hover:bg-brand-blue hover:text-white transition-all shadow-xl"><Upload size={16}/></button>
             <button onClick={(e) => { e.stopPropagation(); onLibrary(); }} className="p-2.5 bg-white text-black rounded-full hover:bg-brand-blue hover:text-white transition-all shadow-xl"><FolderOpen size={16}/></button>
          </div>
        </>
      ) : (
        <div className="flex flex-col items-center gap-2">
           <ImageIcon size={20} className="text-slate-300 dark:text-gray-600 group-hover:text-brand-blue transition-colors" />
           <div className="flex gap-1">
              <button onClick={(e) => { e.stopPropagation(); onUpload(); }} className="p-2 bg-white dark:bg-white/5 rounded-md hover:text-brand-blue transition-colors shadow-sm"><Upload size={14}/></button>
              <button onClick={(e) => { e.stopPropagation(); onLibrary(); }} className="p-2 bg-white dark:bg-white/5 rounded-md hover:text-brand-blue transition-colors shadow-sm"><FolderOpen size={14}/></button>
           </div>
        </div>
      )}
    </div>
  </div>
);

export const SidebarLeft: React.FC<SidebarLeftProps> = (props) => {
  return (
    <aside className={`fixed lg:relative bottom-0 lg:top-0 left-0 w-full lg:w-[380px] shrink-0 bg-white dark:bg-[#141416] border-t lg:border-t-0 lg:border-r border-slate-200 dark:border-white/5 flex flex-col z-[150] lg:z-50 shadow-[0_-10px_40px_rgba(0,0,0,0.1)] lg:shadow-2xl transition-all duration-500 ease-in-out ${props.isMobileExpanded ? 'h-[92dvh] rounded-t-[2.5rem]' : 'h-20 lg:h-full lg:rounded-none'}`}>
      {/* Mobile Toggle Header */}
      <div 
        className="lg:hidden h-20 flex flex-col items-center justify-center shrink-0 cursor-pointer relative"
        onClick={() => props.setIsMobileExpanded(!props.isMobileExpanded)}
      >
        <div className="w-10 h-1.5 bg-slate-300 dark:bg-white/10 rounded-full mb-3"></div>
        <div className="flex items-center justify-between w-full px-6">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-purple-100 dark:bg-purple-500/10 flex items-center justify-center text-purple-600 dark:text-purple-400">
              <SlidersHorizontal size={18} />
            </div>
            <div className="space-y-0.5">
              <h2 className="text-sm font-black uppercase tracking-tight">Cấu hình video</h2>
              <p className="text-[9px] font-bold text-slate-400 dark:text-gray-600 uppercase">Nhấn để {props.isMobileExpanded ? 'thu gọn' : 'mở rộng'}</p>
            </div>
          </div>
          <div className={`p-2 rounded-full bg-slate-100 dark:bg-white/5 transition-transform duration-500 ${props.isMobileExpanded ? 'rotate-180' : ''}`}>
            <ChevronUp size={20} />
          </div>
        </div>
      </div>

      <div className={`p-6 border-b border-slate-200 dark:border-white/5 shrink-0 ${!props.isMobileExpanded ? 'hidden lg:block' : 'block'}`}>
        <div className="hidden lg:flex items-center gap-3">
           <div className="flex items-center gap-3">
              <button onClick={(e) => { e.stopPropagation(); props.onClose(); }} className="p-1 text-slate-400 hover:text-[#0090ff] transition-colors"><ChevronLeft size={20} /></button>
              <div className="flex items-center gap-2">
                 <Video size={18} className="text-purple-500" />
                 <h2 className="text-sm font-black uppercase tracking-tight">Tạo Video</h2>
              </div>
           </div>
        </div>
        <div className={`grid grid-cols-3 bg-slate-100 dark:bg-black/40 p-1 rounded-lg border border-black/5 dark:border-white/5 mb-6 ${props.isMobileExpanded ? 'mt-0' : 'mt-6'}`}>
           {(['SINGLE', 'MULTI', 'AUTO'] as const).map(m => (
             <button key={m} onClick={(e) => { e.stopPropagation(); props.setActiveMode(m); }} className={`flex items-center justify-center gap-2 py-2 rounded-md text-[10px] font-bold transition-all ${props.activeMode === m ? 'bg-white dark:bg-[#2a2a2e] text-slate-900 dark:text-white shadow-xl' : 'text-gray-500 hover:text-slate-900 dark:hover:text-white'}`}>
               {m === 'SINGLE' ? <Play size={12} /> : m === 'MULTI' ? <Layers size={12} /> : <Zap size={12} />} {m === 'SINGLE' ? 'Đơn' : m === 'MULTI' ? 'Multi' : 'Auto'}
             </button>
           ))}
        </div>
      </div>

      <div className={`flex-grow overflow-y-auto no-scrollbar p-6 ${!props.isMobileExpanded ? 'hidden lg:block' : 'block'}`}>
        <AnimatePresence mode="wait">
          {props.activeMode === 'SINGLE' && (
            <motion.div key="single" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-8">
               <div className="space-y-4">
                  <label className="text-[10px] font-black uppercase text-slate-400 dark:text-gray-500 tracking-widest flex items-center gap-2"><Terminal size={14} className="text-purple-500" /> Kịch bản</label>
                  <textarea value={props.prompt} onChange={e => props.setPrompt(e.target.value)} className="w-full h-20 bg-slate-50 dark:bg-black/20 border border-slate-200 dark:border-white/5 rounded-xl p-4 text-base lg:text-xs font-medium focus:border-purple-500 outline-none transition-all resize-none text-slate-900 dark:text-white shadow-inner" placeholder="Nhập kịch bản video của bạn tại đây..." />
               </div>
               <div className="grid grid-cols-2 gap-4">
                  <RefPickerSlot 
                    label="Start Frame" 
                    url={props.startFrame} 
                    isUploading={props.isUploadingImage === 'START'} 
                    onUpload={() => props.handleSingleFrameClick('START', 'UPLOAD')}
                    onLibrary={() => props.handleSingleFrameClick('START', 'LIBRARY')}
                  />
                  <RefPickerSlot 
                    label="End Frame" 
                    url={props.endFrame} 
                    isUploading={props.isUploadingImage === 'END'} 
                    onUpload={() => props.handleSingleFrameClick('END', 'UPLOAD')}
                    onLibrary={() => props.handleSingleFrameClick('END', 'LIBRARY')}
                  />
               </div>
            </motion.div>
          )}
          {props.activeMode === 'MULTI' && (
            <motion.div key="multi" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-8">
              <div className="flex justify-between items-center px-1">
                 <h3 className="text-[11px] font-black uppercase text-slate-400 dark:text-gray-500 tracking-widest">{props.multiFrames.length} khung hình</h3>
                 <button onClick={(e) => { e.stopPropagation(); props.handleAddFrame(); }} className="text-purple-400 text-[10px] font-black uppercase flex items-center gap-2 hover:brightness-110 transition-all"><Plus size={14} strokeWidth={3} /> Thêm</button>
              </div>
              <div className="grid grid-cols-3 gap-y-10 gap-x-3">
                 {props.multiFrames.map((frame, idx) => (
                   <div key={frame.id} className="space-y-3">
                      <div className={`relative aspect-[16/10] bg-slate-100 dark:bg-black border-2 rounded-xl overflow-hidden transition-all group ${frame.url ? 'border-black/10 dark:border-white/10' : 'border-slate-200 dark:border-white/5 border-dashed hover:border-purple-500/40'}`}>
                         {props.isUploadingImage === frame.id ? (
                           <div className="flex items-center justify-center h-full"><Loader2 size={20} className="text-brand-blue animate-spin" /></div>
                         ) : frame.url ? (
                           <img src={frame.url} className="w-full h-full object-cover" alt="" />
                         ) : (
                           <div className="flex flex-col items-center justify-center h-full opacity-20"><ImageIcon size={20} /></div>
                         )}
                         
                         <div className="absolute top-2 left-2 w-5 h-5 bg-purple-600 rounded-md flex items-center justify-center text-[9px] font-black shadow-xl text-white">{idx + 1}</div>
                         
                         <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2 p-4 z-40">
                            <button onClick={(e) => { e.stopPropagation(); props.handleFrameClick(frame.id, 'UPLOAD'); }} className="p-2.5 bg-white text-black rounded-full hover:bg-brand-blue hover:text-white transition-all shadow-xl"><Upload size={12}/></button>
                            <button onClick={(e) => { e.stopPropagation(); props.handleFrameClick(frame.id, 'LIBRARY'); }} className="p-2.5 bg-white text-black rounded-full hover:bg-brand-blue hover:text-white transition-all shadow-xl"><FolderOpen size={12}/></button>
                         </div>

                         {props.multiFrames.length > 2 && <button onClick={(e) => { e.stopPropagation(); props.removeFrame(frame.id); }} className="absolute top-2 right-2 p-1 bg-black/60 rounded-full text-white/40 hover:text-red-500 transition-all"><Trash2 size={12} /></button>}
                      </div>
                      {idx < props.multiFrames.length - 1 ? <textarea value={frame.prompt} onChange={(e) => props.handleFramePromptChange(frame.id, e.target.value)} placeholder="Mô tả..." className="w-full h-16 bg-slate-50 dark:bg-black/40 border border-slate-200 dark:border-white/5 rounded-lg p-2 text-[10px] font-bold text-slate-800 dark:text-white focus:border-purple-500/50 outline-none transition-all resize-none shadow-inner" /> : <div className="h-16 flex items-center justify-center border border-dashed border-slate-200 dark:border-white/5 rounded-lg bg-slate-50 dark:bg-black/20 opacity-30"><span className="text-[8px] font-black uppercase tracking-tighter text-slate-400 dark:text-gray-500">Kết thúc</span></div>}
                   </div>
                 ))}
              </div>
            </motion.div>
          )}
          {props.activeMode === 'AUTO' && (
            <motion.div key="auto" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-8 pb-10">
              <div className="flex justify-between items-center px-1">
                 <h3 className="text-[11px] font-black uppercase text-slate-400 dark:text-gray-500 tracking-widest">Hàng loạt (Batch)</h3>
                 <button onClick={(e) => { e.stopPropagation(); props.setIsBulkImporting(!props.isBulkImporting); }} className="text-blue-400 text-[10px] font-black uppercase flex items-center gap-2 hover:brightness-125 transition-all">{props.isBulkImporting ? <X size={14} /> : <ListPlus size={14} />}{props.isBulkImporting ? 'Hủy' : 'Nhập kịch bản'}</button>
              </div>
              <AnimatePresence>
                {props.isBulkImporting && (
                  <motion.div initial={{ height: 0, opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="overflow-hidden space-y-4">
                    <div className="p-4 bg-blue-500/5 border border-blue-500/20 rounded-xl space-y-3">
                      <textarea value={props.bulkText} onChange={e => props.setBulkText(e.target.value)} className="w-full h-32 bg-slate-50 dark:bg-black/40 border border-slate-200 dark:border-white/10 rounded-lg p-3 text-[10px] font-bold text-slate-800 dark:text-white focus:border-blue-500 outline-none transition-all resize-none shadow-inner" placeholder="Mỗi kịch bản một dòng..."/>
                      <button onClick={(e) => { e.stopPropagation(); props.handleBulkImport(); }} className="w-full py-2.5 bg-blue-600 text-white rounded-lg text-[10px] font-black uppercase tracking-widest shadow-lg">Phân tách kịch bản</button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
              <div className="space-y-4">
                 {props.autoTasks.map((task, idx) => (
                    <div key={task.id} className="p-4 bg-slate-50 dark:bg-white/[0.02] border border-slate-200 dark:border-white/5 rounded-2xl space-y-4 group relative hover:border-[#0090ff]/30 transition-all">
                       <div className="flex justify-between items-center"><span className="text-[9px] font-black uppercase text-[#0090ff] tracking-[0.2em]">Tác vụ 0{idx+1}</span><button onClick={(e) => { e.stopPropagation(); props.removeAutoTask(task.id); }} className="text-slate-300 dark:text-gray-700 hover:text-red-500 transition-colors"><Trash2 size={12} /></button></div>
                       <textarea value={task.prompt} onChange={(e) => props.handleAutoPromptChange(task.id, e.target.value)} placeholder="Mô tả kịch bản..." className="w-full h-12 bg-transparent border-b border-black/5 dark:border-white/5 text-[10px] font-bold outline-none focus:border-[#0090ff]/30 transition-all resize-none text-slate-800 dark:text-white" />
                       <div className="grid grid-cols-2 gap-3 pt-2">
                          <div className={`aspect-video bg-slate-100 dark:bg-black border border-dashed border-slate-200 dark:border-white/10 rounded-lg flex flex-col items-center justify-center gap-1 cursor-pointer hover:border-[#0090ff] transition-all overflow-hidden relative group/auto-slot`}>
                             {props.isUploadingImage === `${task.id}-START` ? (
                               <Loader2 size={14} className="text-[#0090ff] animate-spin" />
                             ) : task.startUrl ? (
                               <img src={task.startUrl} className="w-full h-full object-cover" alt="" />
                             ) : (
                               <><ImageIcon size={14} className="opacity-20"/><span className="text-[7px] font-black uppercase opacity-40">Ảnh đầu</span></>
                             )}
                             <div className="absolute inset-0 bg-black/60 opacity-0 group-hover/auto-slot:opacity-100 transition-opacity flex items-center justify-center gap-2">
                                <button onClick={(e) => { e.stopPropagation(); props.handleAutoFileUploadClick(task.id, 'START', 'UPLOAD'); }} className="p-1.5 bg-white text-black rounded-lg hover:bg-brand-blue hover:text-white transition-all"><Upload size={10}/></button>
                                <button onClick={(e) => { e.stopPropagation(); props.handleAutoFileUploadClick(task.id, 'START', 'LIBRARY'); }} className="p-1.5 bg-white text-black rounded-lg hover:bg-brand-blue hover:text-white transition-all"><FolderOpen size={10}/></button>
                             </div>
                          </div>
                          <div className={`aspect-video bg-slate-100 dark:bg-black border border-dashed border-slate-200 dark:border-white/10 rounded-lg flex flex-col items-center justify-center gap-1 cursor-pointer hover:border-[#0090ff] transition-all overflow-hidden relative group/auto-slot-end`}>
                             {props.isUploadingImage === `${task.id}-END` ? (
                               <Loader2 size={14} className="text-[#0090ff] animate-spin" />
                             ) : task.endUrl ? (
                               <img src={task.endUrl} className="w-full h-full object-cover" alt="" />
                             ) : (
                               <><ImageIcon size={14} className="opacity-20"/><span className="text-[7px] font-black uppercase opacity-40">Ảnh cuối</span></>
                             )}
                             <div className="absolute inset-0 bg-black/60 opacity-0 group-hover/auto-slot-end:opacity-100 transition-opacity flex items-center justify-center gap-2">
                                <button onClick={(e) => { e.stopPropagation(); props.handleAutoFileUploadClick(task.id, 'END', 'UPLOAD'); }} className="p-1.5 bg-white text-black rounded-lg hover:bg-brand-blue hover:text-white transition-all"><Upload size={10}/></button>
                                <button onClick={(e) => { e.stopPropagation(); props.handleAutoFileUploadClick(task.id, 'END', 'LIBRARY'); }} className="p-1.5 bg-white text-black rounded-lg hover:bg-brand-blue hover:text-white transition-all"><FolderOpen size={10}/></button>
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

      <ConfigurationPanel 
        availableModels={props.availableModels}
        selectedModelObj={props.selectedModelObj}
        setSelectedModelObj={props.setSelectedModelObj}
        selectedEngine={props.selectedEngine}
        setSelectedEngine={props.setSelectedEngine}
        selectedMode={props.selectedMode}
        setSelectedMode={props.setSelectedMode}
        ratio={props.ratio}
        cycleRatio={props.cycleRatio}
        duration={props.duration}
        cycleDuration={props.cycleDuration}
        soundEnabled={props.soundEnabled}
        cycleSound={props.cycleSound}
        resolution={props.resolution}
        cycleResolution={props.cycleResolution}
        usagePreference={props.usagePreference}
        credits={props.credits}
        setShowResourceModal={props.setShowResourceModal}
        currentTotalCost={props.currentTotalCost}
        handleGenerate={props.handleGenerate}
        isGenerating={props.isGenerating}
        isGenerateDisabled={props.isGenerateDisabled}
        generateTooltip={props.generateTooltip}
        activeMode={props.activeMode}
        autoTasksCount={props.autoTasks.filter(t => t.prompt.trim() !== '').length}
        multiFramesCount={props.multiFrames.length - 1}
        isMobileExpanded={props.isMobileExpanded}
        quantity={props.quantity}
        setQuantity={props.setQuantity}
      />
    </aside>
  );
};