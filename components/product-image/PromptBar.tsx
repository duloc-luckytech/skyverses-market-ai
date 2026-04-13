import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ImagePlus, Coins, Zap, Settings2, ChevronUp, ChevronDown, X, Loader2, Image as ImageIcon } from 'lucide-react';
import { ModelEngineSettings } from '../image-generator/ModelEngineSettings';

interface PromptBarProps {
  prompt: string;
  onPromptChange: (prompt: string) => void;
  onPromptSubmit: () => void;
  
  isGenerating: boolean;
  isGenerateDisabled: boolean;
  onGenerate: () => void;
  generateTooltip?: string | null;
  
  credits: number;
  usagePreference: string | null;
  actionCost: number;
  
  references: string[];
  onAddReference: () => void;
  
  // AI Settings
  availableModels: any[];
  selectedModel: any;
  setSelectedModel: (val: any) => void;
  selectedRatio: string;
  setSelectedRatio: (val: string) => void;
  selectedRes: string;
  setSelectedRes: (val: string) => void;
  selectedEngine: string;
  onSelectEngine: (val: string) => void;
  selectedMode: string;
  setSelectedMode: (val: string) => void;
  familyList?: string[];
  selectedFamily?: string;
  setSelectedFamily?: (val: string) => void;
  familyModels?: any[];
  familyModes?: string[];
  familyRatios?: string[];
  familyResolutions?: string[];
}

export const PromptBar: React.FC<PromptBarProps> = ({
  prompt, onPromptChange, onPromptSubmit,
  isGenerating, isGenerateDisabled, onGenerate, generateTooltip,
  credits, usagePreference, actionCost,
  references, onAddReference,
  availableModels, selectedModel, setSelectedModel,
  selectedRatio, setSelectedRatio, selectedRes, setSelectedRes,
  selectedEngine, onSelectEngine, selectedMode, setSelectedMode,
  familyList, selectedFamily, setSelectedFamily, familyModels, familyModes, familyRatios, familyResolutions,
}) => {
  const [isAISettingsOpen, setIsAISettingsOpen] = useState(false);

  return (
    <div className="absolute bottom-20 lg:bottom-6 left-0 right-16 md:right-24 px-3 md:px-5 z-40">
      <div className="relative mx-auto max-w-3xl space-y-2">

        {/* ═══ AI SETTINGS PANEL ═══ */}
        <AnimatePresence>
          {isAISettingsOpen && (
            <motion.div
              initial={{ opacity: 0, y: 10, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 10, scale: 0.98 }}
              transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
              className="bg-white/97 dark:bg-[#14151a]/97 backdrop-blur-2xl border border-slate-200 dark:border-white/[0.06] rounded-2xl shadow-[0_8px_32px_rgba(0,0,0,0.12)] dark:shadow-[0_8px_32px_rgba(0,0,0,0.4)] overflow-hidden"
            >
              {/* Panel Header */}
              <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100 dark:border-white/[0.04]">
                <span className="text-[10px] font-bold uppercase tracking-widest text-slate-600 dark:text-slate-300 flex items-center gap-1.5">
                  <Settings2 size={11} className="text-brand-blue" />
                  Cấu hình AI Model
                </span>
                <button
                  onClick={() => setIsAISettingsOpen(false)}
                  className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-white/5 text-slate-400 hover:text-slate-600 dark:hover:text-white transition-colors"
                  aria-label="Close settings"
                >
                  <X size={13} />
                </button>
              </div>

              {/* Panel Content */}
              <div className="px-4 py-3">
                <ModelEngineSettings
                  availableModels={availableModels}
                  selectedModel={selectedModel}
                  setSelectedModel={setSelectedModel}
                  selectedRatio={selectedRatio}
                  setSelectedRatio={setSelectedRatio}
                  selectedRes={selectedRes}
                  setSelectedRes={setSelectedRes}
                  quantity={1}
                  setQuantity={() => {}}
                  selectedEngine={selectedEngine}
                  onSelectEngine={onSelectEngine}
                  selectedMode={selectedMode}
                  setSelectedMode={setSelectedMode}
                  activeMode="SINGLE"
                  isGenerating={isGenerating}
                  familyList={familyList}
                  selectedFamily={selectedFamily}
                  setSelectedFamily={setSelectedFamily}
                  familyModels={familyModels}
                  familyModes={familyModes}
                  familyRatios={familyRatios}
                  familyResolutions={familyResolutions}
                />
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ═══ MAIN INPUT ROW ═══ */}
        <div className="flex items-center gap-2">
          {/* Reference image button */}
          <div className="flex items-center gap-1.5 shrink-0">
            {references.slice(0, 1).map((ref, idx) => (
              <div key={idx} className="relative w-10 h-10 rounded-xl overflow-hidden border-2 border-slate-200 dark:border-white/10 shadow-sm">
                <img src={ref} className="w-full h-full object-cover" alt="Reference" />
              </div>
            ))}
            <button
              onClick={onAddReference}
              className="w-10 h-10 border-2 border-dashed border-slate-200 dark:border-white/10 rounded-xl flex items-center justify-center text-slate-300 dark:text-white/20 hover:border-brand-blue hover:text-brand-blue hover:shadow-sm transition-all shrink-0"
              title="Add reference image"
              aria-label="Add reference image"
            >
              <ImagePlus size={16} />
            </button>
          </div>

          {/* Prompt Input + Settings + Credits */}
          <div className="flex-grow flex items-center bg-white/95 dark:bg-[#14151a]/95 backdrop-blur-2xl border border-slate-200 dark:border-white/[0.06] rounded-2xl h-12 px-3 shadow-[0_4px_20px_rgba(0,0,0,0.08)] dark:shadow-[0_4px_20px_rgba(0,0,0,0.25)] focus-within:border-brand-blue/40 transition-all overflow-hidden">
            
            {/* Prompt Input */}
            <input
              value={prompt}
              onChange={(ev) => onPromptChange(ev.target.value)}
              onKeyDown={(ev) => ev.key === 'Enter' && !isGenerateDisabled && onPromptSubmit()}
              className="flex-grow bg-transparent border-none outline-none text-[11px] md:text-sm font-medium text-slate-800 dark:text-white placeholder:text-slate-300 dark:placeholder:text-slate-600 truncate"
              placeholder="Enter prompt or edit description..."
              aria-label="Prompt input"
            />

            {/* Divider */}
            <div className="w-px h-6 bg-slate-100 dark:bg-white/5 mx-2 shrink-0" />

            {/* Credits Display */}
            <div className="hidden md:flex flex-col items-end gap-0 shrink-0 mr-2">
              <div className="flex items-center gap-1">
                <Coins size={10} className="text-amber-500 flex-shrink-0" />
                <span className={`text-[10px] font-black leading-none tracking-tight ${usagePreference === 'key' ? 'text-purple-500' : 'text-slate-700 dark:text-white'}`}>
                  {usagePreference === 'key' ? 'Key' : `${credits.toLocaleString()}`}
                </span>
              </div>
              <div className="flex items-center gap-0.5 text-[8px] font-bold text-orange-500">
                <Zap size={7} fill="currentColor" className="flex-shrink-0" />
                <span>−{actionCost}</span>
              </div>
            </div>

            {/* AI Settings Toggle Button */}
            <button
              onClick={() => setIsAISettingsOpen(!isAISettingsOpen)}
              className={`shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-lg border transition-all text-[10px] font-bold uppercase tracking-tight ${
                isAISettingsOpen
                  ? 'bg-brand-blue/10 border-brand-blue/30 text-brand-blue'
                  : 'bg-slate-100 dark:bg-white/5 border-slate-100 dark:border-white/[0.06] text-slate-600 dark:text-slate-400 hover:border-brand-blue/30 hover:text-brand-blue'
              }`}
              title="AI Model Configuration"
              aria-label="AI Model Configuration"
            >
              <Settings2 size={12} className="flex-shrink-0" />
              <span className="hidden sm:inline whitespace-nowrap">{selectedFamily || 'AI'}</span>
              {isAISettingsOpen ? <ChevronDown size={9} className="flex-shrink-0" /> : <ChevronUp size={9} className="flex-shrink-0" />}
            </button>
          </div>
        </div>

        {/* ═══ GENERATE BUTTON ═══ */}
        <div className="relative group/genbtn">
          <button
            onClick={() => !isGenerateDisabled && onGenerate()}
            disabled={isGenerateDisabled}
            className={`w-full py-3 px-4 rounded-xl text-white font-semibold uppercase text-[11px] tracking-widest shadow-lg transition-all flex items-center justify-center gap-2 ${
              isGenerateDisabled
                ? 'bg-slate-200 dark:bg-white/[0.04] text-slate-400 dark:text-slate-600 cursor-not-allowed'
                : 'bg-gradient-to-r from-brand-blue to-violet-500 hover:brightness-110 active:scale-[0.98] shadow-brand-blue/20'
            }`}
            aria-label={isGenerating ? 'Generating image' : 'Generate image'}
          >
            {isGenerating
              ? (
                <>
                  <Loader2 className="animate-spin flex-shrink-0" size={15} />
                  <span>Generating...</span>
                </>
              )
              : (
                <>
                  <ImageIcon size={15} className="flex-shrink-0" />
                  <span>Generate Image</span>
                </>
              )
            }
          </button>

          {/* Generate Tooltip */}
          {generateTooltip && !isGenerating && (
            <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 opacity-0 group-hover/genbtn:opacity-100 pointer-events-none transition-all z-50">
              <div className="bg-slate-900 dark:bg-white text-white dark:text-black px-3 py-2 rounded-lg text-[9px] font-semibold whitespace-nowrap shadow-xl">
                {generateTooltip}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
