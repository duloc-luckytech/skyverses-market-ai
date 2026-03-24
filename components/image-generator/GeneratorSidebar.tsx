import React, { useRef, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Image as ImageIcon, Layers, Settings, Zap, Loader2,
  ChevronLeft, Menu
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { ReferenceImageGrid } from './ReferenceImageGrid';
import { SidebarSingle } from './SidebarSingle';
import { SidebarBatch } from './SidebarBatch';
import { ModelEngineSettings } from './ModelEngineSettings';
import { ReferenceItem } from '../../hooks/useImageGenerator';

interface GeneratorSidebarProps {
  onClose: () => void;
  activeMode: 'SINGLE' | 'BATCH';
  setActiveMode: (v: 'SINGLE' | 'BATCH') => void;
  usagePreference: 'credits' | 'key' | null;
  setShowResourceModal: (v: boolean) => void;
  totalCost: number;
  references: ReferenceItem[];
  setReferences: (fn: any) => void;
  setIsLibraryOpen: (v: boolean) => void;
  prompt: string;
  setPrompt: (v: string) => void;
  quantity: number;
  setQuantity: (v: number) => void;
  isBulkImporting: boolean;
  setIsBulkImporting: (v: boolean) => void;
  bulkText: string;
  setBulkText: (v: string) => void;
  handleBulkImport: () => void;
  batchPrompts: string[];
  setBatchPrompts: (v: string[]) => void;
  availableModels: any[];
  selectedModel: any;
  setSelectedModel: (v: any) => void;
  selectedRatio: string;
  setSelectedRatio: (v: string) => void;
  selectedRes: string;
  setSelectedRes: (v: string) => void;
  isGenerating: boolean;
  handleLocalFileUpload: (file: File) => void;
  handleGenerate: () => void;
  generateTooltip: string | null;
  isGenerateDisabled: boolean;
  isMobileExpanded: boolean;
  setIsMobileExpanded: (v: boolean) => void;
  selectedMode: string;
  setSelectedMode: (v: string) => void;
  selectedEngine: string;
  setSelectedEngine: (v: string) => void;
  isUploadingRef?: boolean;
  tempUploadUrl?: string;
  familyList?: string[];
  selectedFamily?: string;
  setSelectedFamily?: (v: string) => void;
  familyModels?: any[];
  familyModes?: string[];
  familyRatios?: string[];
  familyResolutions?: string[];
}

export const GeneratorSidebar: React.FC<GeneratorSidebarProps> = (props) => {
  const { credits } = useAuth();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const onGenerateClick = () => {
    if (props.isGenerateDisabled) return;
    props.handleGenerate();
  };

  return (
    <>
      {/* Mobile toggle */}
      <button
        onClick={() => props.setIsMobileExpanded(true)}
        className="lg:hidden fixed bottom-6 left-4 z-[130] w-12 h-12 bg-gradient-to-r from-rose-500 to-fuchsia-500 rounded-full shadow-2xl flex items-center justify-center text-white active:scale-95 transition-transform"
      >
        <Menu size={20} />
      </button>

      <aside className={`
        ${props.isMobileExpanded ? 'translate-x-0' : '-translate-x-full'}
        lg:translate-x-0 fixed lg:relative inset-y-0 left-0 z-[150]
        w-[320px] lg:w-[340px] xl:w-[360px] shrink-0
        bg-white dark:bg-[#0c0c10] border-r border-black/[0.06] dark:border-white/[0.04]
        flex flex-col transition-transform duration-300
      `}>

        {/* ─── HEADER ─── */}
        <div className="px-4 pt-3 pb-2.5 border-b border-black/[0.06] dark:border-white/[0.04] shrink-0">
          <div className="flex items-center justify-between mb-2.5">
            <div className="flex items-center gap-2.5">
              <button onClick={props.onClose} className="p-1 text-slate-400 dark:text-slate-500 hover:text-slate-900 dark:hover:text-white transition-colors rounded-lg hover:bg-black/[0.03] dark:hover:bg-white/[0.04]">
                <ChevronLeft size={16} />
              </button>
              <div className="flex items-center gap-1.5">
                <div className="w-6 h-6 rounded-lg bg-gradient-to-br from-rose-500 to-fuchsia-500 flex items-center justify-center">
                  <ImageIcon size={12} className="text-white" />
                </div>
                <span className="text-xs font-bold text-slate-800 dark:text-white">Image Studio</span>
              </div>
            </div>
            <button
              onClick={() => props.setIsMobileExpanded(false)}
              className="lg:hidden p-1 text-slate-400 hover:text-slate-600 dark:hover:text-white transition-colors"
            >✕</button>
          </div>

          {/* Mode tabs */}
          <div className="flex bg-black/[0.02] dark:bg-white/[0.02] rounded-lg border border-black/[0.06] dark:border-white/[0.04] overflow-hidden">
            <button
              onClick={() => props.setActiveMode('SINGLE')}
              className={`flex-1 flex items-center justify-center gap-1.5 py-2 text-[10px] font-semibold uppercase tracking-wider transition-all ${props.activeMode === 'SINGLE'
                ? 'bg-black/[0.04] dark:bg-white/[0.06] text-slate-900 dark:text-white'
                : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-white/60'
                }`}
            >
              <ImageIcon size={10} /> Đơn lẻ
            </button>
            <button
              onClick={() => props.setActiveMode('BATCH')}
              className={`flex-1 flex items-center justify-center gap-1.5 py-2 text-[10px] font-semibold uppercase tracking-wider transition-all ${props.activeMode === 'BATCH'
                ? 'bg-black/[0.04] dark:bg-white/[0.06] text-slate-900 dark:text-white'
                : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-white/60'
                }`}
            >
              <Layers size={10} /> Batch
            </button>
          </div>
        </div>

        {/* ─── CONTENT ─── */}
        <div className="flex-grow overflow-y-auto no-scrollbar px-4 py-3 space-y-3">
          {/* Reference images — collapsible */}
          <ReferenceImageGrid
            references={props.references}
            isUploading={!!props.isUploadingRef}
            tempUrl={props.tempUploadUrl || null}
            onRemove={(idx) => props.setReferences((prev: ReferenceItem[]) => prev.filter((_: any, i: number) => i !== idx))}
            onUploadTrigger={() => fileInputRef.current?.click()}
            onLibraryTrigger={() => props.setIsLibraryOpen(true)}
            onFileDrop={(file) => props.handleLocalFileUpload(file)}
          />

          <input type="file" ref={fileInputRef} className="hidden" accept="image/png, image/jpeg"
            onChange={(e) => { const f = e.target.files?.[0]; if (f) props.handleLocalFileUpload(f); e.target.value = ''; }} />

          {/* Prompt */}
          <AnimatePresence mode="wait">
            {props.activeMode === 'SINGLE' ? (
              <SidebarSingle key="single-tab" prompt={props.prompt} setPrompt={props.setPrompt} />
            ) : (
              <SidebarBatch key="batch-tab"
                batchPrompts={props.batchPrompts} setBatchPrompts={props.setBatchPrompts}
                isBulk={props.isBulkImporting} setIsBulk={props.setIsBulkImporting}
                bulkText={props.bulkText} setBulkText={props.setBulkText}
                onBulkImport={props.handleBulkImport} />
            )}
          </AnimatePresence>

          {/* Model & Config — collapsible with 3-item limit */}
          <ModelEngineSettings
            availableModels={props.availableModels} selectedModel={props.selectedModel} setSelectedModel={props.setSelectedModel}
            selectedRatio={props.selectedRatio} setSelectedRatio={props.setSelectedRatio}
            selectedRes={props.selectedRes} setSelectedRes={props.setSelectedRes}
            quantity={props.quantity} setQuantity={props.setQuantity}
            selectedMode={props.selectedMode} setSelectedMode={props.setSelectedMode}
            selectedEngine={props.selectedEngine} onSelectEngine={props.setSelectedEngine}
            activeMode={props.activeMode} isGenerating={props.isGenerating}
            familyList={props.familyList} selectedFamily={props.selectedFamily} setSelectedFamily={props.setSelectedFamily}
            familyModels={props.familyModels} familyModes={props.familyModes}
            familyRatios={props.familyRatios} familyResolutions={props.familyResolutions}
          />
        </div>

        {/* ─── FOOTER ─── */}
        <div className="shrink-0 border-t border-black/[0.06] dark:border-white/[0.04] bg-white/80 dark:bg-[#0c0c10]/80 backdrop-blur-lg">
          {/* Credits bar */}
          <div className="px-4 py-2.5 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <button onClick={() => props.setShowResourceModal(true)} className="p-1 text-slate-400 dark:text-slate-500 hover:text-rose-400 transition-colors rounded-md hover:bg-black/[0.03] dark:hover:bg-white/[0.04]">
                <Settings size={12} />
              </button>
              <span className={`text-[11px] font-medium ${props.usagePreference === 'key' ? 'text-fuchsia-500' : 'text-slate-600 dark:text-slate-400'}`}>
                {props.usagePreference === 'credits' ? `${credits.toLocaleString()} CR` : props.usagePreference === 'key' ? 'API Key' : '—'}
              </span>
            </div>
            <div className="flex items-center gap-1 text-amber-500/80">
              <Zap size={10} fill="currentColor" />
              <span className="text-[11px] font-semibold">{props.usagePreference === 'key' ? '0' : props.totalCost}</span>
            </div>
          </div>

          {/* Generate button */}
          <div className="px-4 pb-4">
            <div className="relative group/btn">
              <button
                onClick={onGenerateClick}
                disabled={props.isGenerateDisabled}
                className={`w-full py-3.5 rounded-xl text-white font-semibold uppercase text-[11px] tracking-widest shadow-lg transition-all flex items-center justify-center gap-2.5 ${props.isGenerateDisabled
                  ? 'bg-slate-200 dark:bg-white/[0.04] text-slate-400 dark:text-slate-600 cursor-not-allowed'
                  : 'bg-gradient-to-r from-rose-500 to-fuchsia-500 hover:brightness-110 active:scale-[0.98] shadow-rose-500/20'
                  }`}
              >
                {props.isGenerating ? <Loader2 className="animate-spin" size={14} /> : <ImageIcon size={14} />}
                {props.isGenerating ? 'Đang tạo...' : 'Tạo hình ảnh'}
              </button>
              {props.generateTooltip && (
                <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 opacity-0 group-hover/btn:opacity-100 pointer-events-none transition-all z-50">
                  <div className="bg-slate-900 dark:bg-white text-white dark:text-black px-3 py-1.5 rounded-lg text-[9px] font-semibold whitespace-nowrap shadow-xl">
                    {props.generateTooltip}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </aside>
    </>
  );
};
