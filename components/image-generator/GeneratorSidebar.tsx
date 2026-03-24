import React, { useRef } from 'react';
import { AnimatePresence } from 'framer-motion';
import {
  ChevronLeft, Image as ImageIcon, Layers, Settings,
  Loader2, Zap
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { CreationMode, ReferenceItem } from '../../hooks/useImageGenerator';
import { SidebarSingle } from './SidebarSingle';
import { SidebarBatch } from './SidebarBatch';
import { ModelEngineSettings } from './ModelEngineSettings';
import { ReferenceImageGrid } from './ReferenceImageGrid';
import { MobileGeneratorBar } from '../common/MobileGeneratorBar';

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
  // Family-based props (same pattern as video)
  familyList?: string[];
  selectedFamily?: string;
  setSelectedFamily?: (val: string) => void;
  familyModels?: any[];
  familyModes?: string[];
  familyRatios?: string[];
  familyResolutions?: string[];
}

export const GeneratorSidebar: React.FC<GeneratorSidebarProps> = (props) => {
  const { credits } = useAuth();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const onGenerateClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    props.handleGenerate();
    if (window.innerWidth < 1024) props.setIsMobileExpanded(false);
  };

  return (
    <aside
      className={`fixed lg:relative bottom-0 lg:top-0 left-0 w-full lg:w-[320px] lg:shrink-0 bg-white dark:bg-[#111114] border-t lg:border-t-0 lg:border-r border-black/[0.06] dark:border-white/[0.04] flex flex-col z-[150] lg:z-50 transition-all duration-500 ${props.isMobileExpanded ? 'h-[92dvh] rounded-t-2xl' : 'h-32 lg:h-full'}`}
    >
      {/* ─── MOBILE BAR ─── */}
      <MobileGeneratorBar
        isExpanded={props.isMobileExpanded}
        setIsExpanded={props.setIsMobileExpanded}
        prompt={props.prompt}
        setPrompt={props.setPrompt}
        credits={credits}
        totalCost={props.totalCost}
        isGenerating={props.isGenerating}
        isGenerateDisabled={props.isGenerateDisabled}
        onGenerate={onGenerateClick}
        onOpenLibrary={() => props.setIsLibraryOpen(true)}
        generateLabel="TẠO HÌNH ẢNH"
        type="image"
      />

      {/* ─── HEADER ─── */}
      <div className={`px-3 pt-2.5 pb-2 border-b border-black/[0.06] dark:border-white/[0.04] shrink-0 ${!props.isMobileExpanded ? 'hidden lg:block' : 'block'}`}>
        <div className="hidden lg:flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <button onClick={props.onClose} className="p-0.5 text-slate-400 dark:text-[#555] hover:text-slate-900 dark:hover:text-white transition-colors"><ChevronLeft size={16} /></button>
            <ImageIcon size={12} className="text-rose-400" />
            <span className="text-xs font-semibold text-slate-600 dark:text-white/70">Image Studio</span>
          </div>
        </div>
        {/* MODE TABS */}
        <div className="flex bg-black/[0.02] dark:bg-white/[0.02] rounded-lg border border-black/[0.06] dark:border-white/[0.04] overflow-hidden">
          <button
            onClick={() => props.setActiveMode('SINGLE')}
            className={`flex-1 flex items-center justify-center gap-1.5 py-2 text-[10px] font-semibold uppercase tracking-wider transition-all ${props.activeMode === 'SINGLE' ? 'bg-black/[0.04] dark:bg-white/[0.06] text-slate-900 dark:text-white' : 'text-slate-400 dark:text-[#555] hover:text-slate-600 dark:hover:text-white/60'
              }`}
          >
            <ImageIcon size={9} /> Đơn lẻ
          </button>
          <button
            onClick={() => props.setActiveMode('BATCH')}
            className={`flex-1 flex items-center justify-center gap-1.5 py-2 text-[10px] font-semibold uppercase tracking-wider transition-all ${props.activeMode === 'BATCH' ? 'bg-black/[0.04] dark:bg-white/[0.06] text-slate-900 dark:text-white' : 'text-slate-400 dark:text-[#555] hover:text-slate-600 dark:hover:text-white/60'
              }`}
          >
            <Layers size={9} /> Batch
          </button>
        </div>
      </div>

      {/* ─── CONTENT ─── */}
      <div className={`flex-grow overflow-y-auto no-scrollbar px-3 py-2.5 space-y-2.5 ${!props.isMobileExpanded ? 'hidden lg:block' : 'block'}`}>
        {/* Reference Images */}
        <ReferenceImageGrid
          references={props.references}
          isUploading={!!props.isUploadingRef}
          tempUrl={props.tempUploadUrl || null}
          onRemove={(idx) => props.setReferences((prev: ReferenceItem[]) => prev.filter((_, i) => i !== idx))}
          onUploadTrigger={() => fileInputRef.current?.click()}
          onLibraryTrigger={() => props.setIsLibraryOpen(true)}
          onFileDrop={(file) => props.handleLocalFileUpload(file)}
        />

        <input
          type="file" ref={fileInputRef} className="hidden" accept="image/png, image/jpeg"
          onChange={(e) => { const f = e.target.files?.[0]; if (f) props.handleLocalFileUpload(f); e.target.value = ''; }}
        />

        {/* Mode Content */}
        <AnimatePresence mode="wait">
          {props.activeMode === 'SINGLE' ? (
            <SidebarSingle key="single-tab" prompt={props.prompt} setPrompt={props.setPrompt} />
          ) : (
            <SidebarBatch
              key="batch-tab"
              batchPrompts={props.batchPrompts}
              setBatchPrompts={props.setBatchPrompts}
              isBulk={props.isBulkImporting}
              setIsBulk={props.setIsBulkImporting}
              bulkText={props.bulkText}
              setBulkText={props.setBulkText}
              onBulkImport={props.handleBulkImport}
            />
          )}
        </AnimatePresence>

        {/* Model & Config — pass family props */}
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
          activeMode={props.activeMode}
          isGenerating={props.isGenerating}
          familyList={props.familyList}
          selectedFamily={props.selectedFamily}
          setSelectedFamily={props.setSelectedFamily}
          familyModels={props.familyModels}
          familyModes={props.familyModes}
          familyRatios={props.familyRatios}
          familyResolutions={props.familyResolutions}
        />
      </div>

      {/* ─── FOOTER ─── */}
      <div className={`shrink-0 border-t border-black/[0.06] dark:border-white/[0.04] ${!props.isMobileExpanded ? 'hidden lg:block' : 'block'}`}>
        <div className="px-3 py-3 space-y-2.5">
          {/* Cost bar */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <button onClick={() => props.setShowResourceModal(true)} className="text-slate-400 dark:text-[#555] hover:text-rose-400 transition-colors"><Settings size={11} /></button>
              <span className={`text-[11px] font-medium ${props.usagePreference === 'key' ? 'text-fuchsia-500 dark:text-fuchsia-400' : 'text-slate-500 dark:text-[#666]'}`}>
                {props.usagePreference === 'credits' ? `${credits.toLocaleString()} CR` : props.usagePreference === 'key' ? 'API Key' : '—'}
              </span>
            </div>
            <div className="flex items-center gap-1 text-amber-500/80">
              <Zap size={9} fill="currentColor" />
              <span className="text-[11px] font-semibold">{props.usagePreference === 'key' ? '0' : props.totalCost}</span>
            </div>
          </div>
        </div>

        {/* Generate Button */}
        <div className="px-3 pb-3">
          <div className="relative group/btn">
            <button
              onClick={onGenerateClick}
              disabled={props.isGenerateDisabled}
              className={`w-full py-3.5 rounded-xl text-white font-semibold uppercase text-[11px] tracking-widest shadow-lg transition-all flex items-center justify-center gap-2 ${props.isGenerateDisabled
                ? 'bg-slate-100 dark:bg-white/[0.04] text-slate-400 dark:text-[#444] cursor-not-allowed'
                : 'bg-gradient-to-r from-rose-600 to-fuchsia-600 hover:brightness-110 active:scale-[0.98] shadow-rose-500/20'
                }`}
            >
              {props.isGenerating ? <Loader2 className="animate-spin" size={14} /> : <ImageIcon size={14} />}
              {props.isGenerating ? 'Đang tạo...' : 'Tạo hình ảnh'}
            </button>
            {props.generateTooltip && (
              <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 opacity-0 group-hover/btn:opacity-100 pointer-events-none transition-all z-50">
                <div className="bg-[#1a1a1e] text-white/80 text-[10px] font-medium px-3 py-1.5 rounded-md shadow-xl whitespace-nowrap border border-white/10">
                  {props.generateTooltip}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </aside>
  );
};
