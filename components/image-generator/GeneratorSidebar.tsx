import React, { useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ChevronLeft, Image as ImageIcon, Layers, Settings, 
  Plus, Upload, FolderOpen, Loader2, Wand2, Zap,
  ChevronUp, SlidersHorizontal, ArrowRight
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { CreationMode, ReferenceItem } from '../../hooks/useImageGenerator';
import { SidebarSingle } from './SidebarSingle';
import { SidebarBatch } from './SidebarBatch';
import { ModelEngineSettings } from './ModelEngineSettings';

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

        <div className="grid grid-cols-2 bg-slate-100 dark:bg-black/40 p-1 rounded-xl border border-black/5 dark:border-white/10">
           <button 
             onClick={() => props.setActiveMode('SINGLE')}
             className={`flex items-center justify-center gap-2 py-2.5 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${props.activeMode === 'SINGLE' ? 'bg-white dark:bg-white/10 text-brand-blue shadow-sm' : 'text-gray-500 hover:text-slate-900 dark:hover:text-white'}`}
           >
              <ImageIcon size={12} /> Đơn lẻ
           </button>
           <button 
             onClick={() => props.setActiveMode('BATCH')}
             className={`flex items-center justify-center gap-2 py-2.5 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${props.activeMode === 'BATCH' ? 'bg-white dark:bg-white/10 text-brand-blue shadow-sm' : 'text-gray-500 hover:text-slate-900 dark:hover:text-white'}`}
           >
              <Layers size={12} /> Hàng loạt
           </button>
        </div>

        <div className="space-y-4">
           <div className="flex justify-between items-center px-1">
             <label className="text-[10px] font-black text-slate-400 dark:text-gray-500 uppercase tracking-widest">Ảnh tham chiếu</label>
             <span className="text-[10px] font-bold text-gray-500">{props.references.length + (props.tempUploadUrl ? 1 : 0)}/6</span>
           </div>
           <div className="grid grid-cols-3 gap-2">
              {props.references.map((ref, idx) => (
                <div key={idx} className="relative aspect-square rounded-lg overflow-hidden border border-black/5 dark:border-white/5 group">
                  <img src={ref.url} className="w-full h-full object-cover" alt="" />
                  <button onClick={() => props.setReferences((prev: ReferenceItem[]) => prev.filter((_: any, i: number) => i !== idx))} className="absolute inset-0 bg-red-500/80 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity"><Plus className="rotate-45" size={20} /></button>
                </div>
              ))}
              
              {/* Temporary Upload Slot with Preview */}
              {props.tempUploadUrl && (
                <div className="relative aspect-square rounded-lg overflow-hidden border-2 border-brand-blue/30 bg-brand-blue/5 animate-pulse">
                  <img src={props.tempUploadUrl} className="w-full h-full object-cover opacity-50 blur-[1px]" alt="Uplinking" />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <Loader2 size={18} className="text-brand-blue animate-spin" />
                  </div>
                </div>
              )}

              {props.references.length + (props.tempUploadUrl ? 1 : 0) < 6 && (
                <div className="relative aspect-square group">
                  <div className="absolute inset-0 border-2 border-dashed border-slate-200 dark:border-white/10 flex flex-col items-center justify-center gap-1 text-gray-400 hover:border-brand-blue transition-all rounded-lg cursor-pointer">
                    {props.isUploadingRef && !props.tempUploadUrl ? <Loader2 size={20} className="animate-spin text-brand-blue" /> : <Plus size={20} />}
                  </div>
                  <div className="absolute inset-0 bg-white dark:bg-[#111114] opacity-0 group-hover:opacity-100 transition-all flex flex-col p-1 gap-1 z-10 border border-slate-200 dark:border-white/10 rounded-lg">
                    <button onClick={() => fileInputRef.current?.click()} className="flex-grow flex items-center justify-center gap-2 bg-slate-50 dark:bg-white/5 rounded-md hover:bg-brand-blue hover:text-white transition-all"><Upload size={14} /></button>
                    <button onClick={() => props.setIsLibraryOpen(true)} className="flex-grow flex items-center justify-center gap-2 bg-slate-50 dark:bg-white/5 rounded-md hover:bg-brand-blue hover:text-white transition-all"><FolderOpen size={14} /></button>
                  </div>
                </div>
              )}
           </div>
           <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={(e) => { const f = e.target.files?.[0]; if (f) props.handleLocalFileUpload(f); e.target.value = ''; }} />
        </div>

        <div className="hidden lg:block">
           {props.activeMode === 'SINGLE' ? (
             <SidebarSingle prompt={props.prompt} setPrompt={props.setPrompt} />
           ) : (
             <SidebarBatch batchPrompts={props.batchPrompts} setBatchPrompts={props.setBatchPrompts} isBulk={props.isBulkImporting} setIsBulk={props.setIsBulkImporting} bulkText={props.bulkText} setBulkText={props.setBulkText} onBulkImport={props.handleBulkImport} />
           )}
        </div>

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

      <div className={`shrink-0 p-6 bg-white dark:bg-[#111114] border-t border-black/5 dark:border-white/10 shadow-[0_-10px_30px_rgba(0,0,0,0.05)] space-y-4 ${!props.isMobileExpanded ? 'hidden lg:block' : 'block'}`}>
        <div className="flex items-center justify-between px-1">
           <div className="flex items-center gap-3">
              <div className="flex flex-col">
                 <span className="text-[8px] font-black text-slate-400 dark:text-gray-500 uppercase tracking-widest leading-none">Resource: {props.usagePreference === 'credits' ? 'Credits' : 'API Key'}</span>
                 <span className="text-[10px] font-black text-slate-900 dark:text-white italic mt-1">{props.usagePreference === 'key' ? 'UNLIMITED' : `${credits.toLocaleString()} CR`}</span>
              </div>
              <button onClick={() => props.setShowResourceModal(true)} className="p-1.5 bg-slate-100 dark:bg-white/5 rounded-md text-slate-400 hover:text-brand-blue transition-all"><Settings size={14} /></button>
           </div>
           <div className="flex items-center gap-1.5 text-orange-500 font-black italic">
              <Zap size={12} fill="currentColor" />
              <span className="text-[11px]">-{props.totalCost}</span>
           </div>
        </div>

        {props.activeMode === 'SINGLE' && (
           <div className="lg:hidden relative">
              <input 
                 value={props.prompt}
                 onChange={(e) => props.setPrompt(e.target.value)}
                 className="w-full bg-slate-50 dark:bg-black/40 border border-slate-200 dark:border-white/10 rounded-xl p-4 text-xs font-bold focus:border-brand-blue outline-none transition-all pr-12"
                 placeholder="Mô tả cho AI..."
              />
              <button 
                 onClick={onGenerateClick}
                 disabled={props.isGenerateDisabled}
                 className="absolute right-2 top-1/2 -translate-y-1/2 p-2 text-brand-blue disabled:opacity-30"
              >
                 <Wand2 size={18} />
              </button>
           </div>
        )}

        <div className="relative group/genbtn">
           <button 
             onClick={onGenerateClick} disabled={props.isGenerateDisabled}
             className={`w-full py-4 rounded-xl font-black uppercase text-[11px] tracking-widest shadow-xl flex items-center justify-center gap-3 transition-all ${props.isGenerateDisabled ? 'bg-slate-100 dark:bg-white/5 text-slate-400 dark:text-gray-600 cursor-not-allowed grayscale' : 'bg-brand-blue text-white hover:brightness-110 active:scale-[0.98]'}`}
           >
              {props.isGenerating ? <Loader2 className="animate-spin" size={16} /> : <Wand2 size={16} />}
              <span>{props.isGenerating ? 'Đang tạo...' : 'Tạo Hình Ảnh'}</span>
           </button>
        </div>
      </div>

      {!props.isMobileExpanded && (
         <div className="lg:hidden fixed bottom-20 left-1/2 -translate-x-1/2 w-[calc(100%-2rem)] max-w-lg z-[160]">
            <div className="bg-white/95 dark:bg-[#0d151c]/95 backdrop-blur-2xl border border-slate-200 dark:border-white/10 rounded-[2rem] h-14 px-4 flex items-center gap-3 shadow-2xl overflow-hidden">
               <div className="flex items-center gap-1.5 shrink-0 pr-3 border-r border-black/5 dark:border-white/5">
                  <div className={`w-8 h-8 rounded-lg bg-brand-blue/10 flex items-center justify-center ${props.isGenerating ? 'animate-spin' : ''}`}>
                    <Wand2 size={16} className="text-brand-blue" />
                  </div>
               </div>
               <input 
                  value={props.prompt}
                  onChange={(e) => props.setPrompt(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && onGenerateClick()}
                  className="flex-grow bg-transparent border-none outline-none text-[11px] font-bold text-slate-900 dark:text-white placeholder:text-slate-400"
                  placeholder="Mô tả cho AI..."
               />
               <button 
                  onClick={onGenerateClick}
                  disabled={props.isGenerateDisabled}
                  className={`w-10 h-10 rounded-full flex items-center justify-center transition-all ${props.isGenerateDisabled ? 'text-slate-300' : 'text-brand-blue hover:scale-110'}`}
               >
                  {props.isGenerating ? <Loader2 size={18} className="animate-spin" /> : <ArrowRight size={18} />}
               </button>
            </div>
         </div>
      )}
    </aside>
  );
};