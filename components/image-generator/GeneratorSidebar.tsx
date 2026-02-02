
import React, { useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ChevronLeft, Image as ImageIcon, Layers, Settings, 
  Loader2, Zap, ChevronUp, SlidersHorizontal, ArrowRight 
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { CreationMode, ReferenceItem } from '../../hooks/useImageGenerator';
import { SidebarSingle } from './SidebarSingle';
import { SidebarBatch } from './SidebarBatch';
import { ModelEngineSettings } from './ModelEngineSettings';
import { ReferenceImageGrid } from './ReferenceImageGrid';

interface GeneratorSidebarProps {
  onClose: () => void;
  activeMode: CreationMode;
  setActiveMode: (mode: CreationMode) => void;
  usagePreference: 'credits' | 'key' | null;
  setShowResourceModal: (val: boolean) => void;
  totalCost: number;
  references: ReferenceItem[];
  setReferences: any;
  setIsLibraryOpen: (val: boolean) => void;
  prompt: string;
  setPrompt: (val: string) => void;
  quantity: number;
  setQuantity: (v: number) => void;
  batchPrompts: string[];
  setBatchPrompts: any;
  isBulkImporting: boolean;
  setIsBulkImporting: (val: boolean) => void;
  bulkText: string;
  setBulkText: (val: string) => void;
  handleBulkImport: () => void;
  availableModels: any[];
  selectedModel: any;
  setSelectedModel: (val: any) => void;
  selectedRatio: string;
  setSelectedRatio: (val: string) => void;
  selectedRes: string;
  setSelectedRes: (val: string) => void;
  isGenerating: boolean;
  isUploadingRef?: boolean;
  tempUploadUrl?: string | null;
  handleLocalFileUpload: (file: File) => Promise<void>;
  handleGenerate: () => void;
  generateTooltip: string | null;
  isGenerateDisabled: boolean;
  isMobileExpanded: boolean;
  setIsMobileExpanded: (val: boolean) => void;
  selectedMode: string;
  setSelectedMode: (val: string) => void;
  selectedEngine: string;
  setSelectedEngine: (val: string) => void;
}

export const GeneratorSidebar: React.FC<GeneratorSidebarProps> = (props) => {
  const { credits } = useAuth();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const onGenerateClick = () => {
    props.handleGenerate();
    if (window.innerWidth < 1024) {
      props.setIsMobileExpanded(false);
    }
  };

  return (
    <aside 
      className={`fixed lg:relative bottom-0 lg:top-0 left-0 w-full lg:w-[380px] lg:shrink-0 bg-white dark:bg-[#111114] border-t lg:border-t-0 lg:border-r border-slate-200 dark:border-white/5 flex flex-col z-[150] lg:z-50 shadow-[0_-10px_40px_rgba(0,0,0,0.1)] lg:shadow-2xl transition-all duration-500 ease-in-out ${props.isMobileExpanded ? 'h-[92dvh] rounded-t-[2.5rem]' : 'h-14 lg:h-full lg:rounded-none'}`}
    >
      <div 
        className="lg:hidden h-14 flex items-center justify-between px-6 shrink-0 cursor-pointer border-b border-black/5 dark:border-white/5"
        onClick={() => props.setIsMobileExpanded(!props.isMobileExpanded)}
      >
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-brand-blue/10 flex items-center justify-center text-brand-blue">
            <SlidersHorizontal size={18} />
          </div>
          <h2 className="text-[10px] font-black uppercase tracking-widest text-slate-900 dark:text-white">Thiết lập AI</h2>
        </div>
        <div className={`p-1.5 rounded-full bg-slate-100 dark:bg-white/5 transition-transform duration-500 ${props.isMobileExpanded ? 'rotate-180' : ''}`}>
          <ChevronUp size={16} />
        </div>
      </div>

      <div className={`flex-grow overflow-y-auto no-scrollbar p-6 space-y-8 ${!props.isMobileExpanded ? 'hidden lg:block' : 'block'}`}>
        <div className="hidden lg:flex items-center gap-4">
           <button onClick={props.onClose} className="p-1 text-slate-400 hover:text-brand-blue transition-colors">
              <ChevronLeft size={24} />
           </button>
           <h2 className="text-lg font-black uppercase tracking-tight italic text-slate-900 dark:text-white">Image Studio</h2>
        </div>

        {/* Tab Selection: ĐƠN LẺ / HÀNG LOẠT */}
        <div className="grid grid-cols-2 bg-slate-100 dark:bg-black/40 p-1 rounded-lg border border-black/5 dark:border-white/10">
           <button 
             onClick={() => props.setActiveMode('SINGLE')}
             className={`flex items-center justify-center gap-2 py-2.5 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${props.activeMode === 'SINGLE' ? 'bg-white dark:bg-white/10 text-brand-blue shadow-sm' : 'text-gray-500 hover:text-slate-900 dark:hover:text-white'}`}
           >
              <ImageIcon size={12} /> ĐƠN LẺ
           </button>
           <button 
             onClick={() => props.setActiveMode('BATCH')}
             className={`flex items-center justify-center gap-2 py-2.5 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${props.activeMode === 'BATCH' ? 'bg-white dark:bg-white/10 text-brand-blue shadow-sm' : 'text-gray-500 hover:text-slate-900 dark:hover:text-white'}`}
           >
              <Layers size={12} /> HÀNG LOẠT
           </button>
        </div>

        {/* --- TÁCH COMPONENT: ẢNH THAM CHIẾU --- */}
        <ReferenceImageGrid 
          references={props.references}
          isUploading={!!props.isUploadingRef}
          tempUrl={props.tempUploadUrl || null}
          onRemove={(idx) => props.setReferences((prev: ReferenceItem[]) => prev.filter((_, i) => i !== idx))}
          onUploadTrigger={() => fileInputRef.current?.click()}
          onLibraryTrigger={() => props.setIsLibraryOpen(true)}
        />

        {/* Hidden input for local file uploads */}
        <input 
          type="file" 
          ref={fileInputRef} 
          className="hidden" 
          accept="image/png, image/jpeg" 
          onChange={(e) => { 
            const f = e.target.files?.[0]; 
            if (f) props.handleLocalFileUpload(f); 
            e.target.value = ''; 
          }} 
        />

        {/* Prompt Section */}
        <div className="hidden lg:block">
           {props.activeMode === 'SINGLE' ? (
             <SidebarSingle prompt={props.prompt} setPrompt={props.setPrompt} />
           ) : (
             <SidebarBatch 
                batchPrompts={props.batchPrompts} 
                setBatchPrompts={props.setBatchPrompts} 
                isBulk={props.isBulkImporting} 
                setIsBulk={props.setIsBulkImporting} 
                bulkText={props.bulkText} 
                setBulkText={props.setBulkText} 
                onBulkImport={props.handleBulkImport} 
              />
           )}
        </div>

        {/* Configurations */}
        <ModelEngineSettings 
          availableModels={props.availableModels}
          selectedModel={props.selectedModel}
          setSelectedModel={props.setSelectedModel}
          selectedRatio={props.selectedRatio}
          setSelectedRatio={props.setSelectedRatio}
          selectedRes={props.selectedRes}
          setSelectedRes={props.setSelectedRes}
          quantity={props.quantity}
          setQuantity={props.setQuantity}
          selectedMode={props.selectedMode}
          setSelectedMode={props.setSelectedMode}
          selectedEngine={props.selectedEngine}
          onSelectEngine={props.setSelectedEngine}
        />
      </div>

      {/* Credit Footer */}
      <div className={`shrink-0 p-6 bg-white dark:bg-[#111114] border-t border-black/5 dark:border-white/10 shadow-[0_-10px_30px_rgba(0,0,0,0.05)] space-y-4 ${!props.isMobileExpanded ? 'hidden lg:block' : 'block'}`}>
        <div className="flex items-center justify-between px-1">
           <div className="flex items-center gap-3">
              <div className="flex flex-col">
                 <span className="text-[8px] font-black uppercase text-slate-400 dark:text-gray-500 tracking-widest leading-none">RESOURCE</span>
                 <span className="text-[10px] font-black text-slate-900 dark:text-white italic mt-1">{props.usagePreference === 'key' ? 'UNLIMITED' : `${credits.toLocaleString()} CR`}</span>
              </div>
              <button onClick={() => props.setShowResourceModal(true)} className="p-1.5 bg-slate-100 dark:bg-white/5 rounded-md text-slate-400 hover:text-brand-blue transition-all"><Settings size={14} /></button>
           </div>
           <div className="flex items-center gap-1.5 text-orange-500 font-black italic">
              <Zap size={12} fill="currentColor" />
              <span className="text-[11px]">-{props.totalCost}</span>
           </div>
        </div>

        <button 
          onClick={onGenerateClick} disabled={props.isGenerateDisabled}
          className={`w-full py-4 rounded-xl font-black uppercase text-[11px] tracking-widest shadow-xl flex items-center justify-center gap-3 transition-all ${props.isGenerateDisabled ? 'bg-slate-100 dark:bg-white/5 text-slate-400 dark:text-gray-600 cursor-not-allowed grayscale' : 'bg-brand-blue text-white hover:brightness-110 active:scale-[0.98]'}`}
        >
           {props.isGenerating ? <Loader2 className="animate-spin" size={16} /> : <ImageIcon size={16} />}
           <span>{props.isGenerating ? 'Đang tạo...' : 'TẠO HÌNH ẢNH'}</span>
        </button>
      </div>
    </aside>
  );
};
