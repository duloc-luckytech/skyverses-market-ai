import React, { useState } from 'react';
import { ChevronDown, ChevronUp, List, Brain, GitBranch, SlidersHorizontal, Ratio, MonitorUp, Hash, Settings2 } from 'lucide-react';
import { ModelSelectorModal } from '../common/ModelSelectorModal';

interface ModelEngineSettingsProps {
  availableModels: any[];
  selectedModel: any;
  setSelectedModel: (val: any) => void;
  selectedRatio: string;
  setSelectedRatio: (val: string) => void;
  selectedRes: string;
  setSelectedRes: (val: string) => void;
  quantity: number;
  setQuantity: (val: number) => void;
  selectedEngine?: string;
  onSelectEngine?: (val: string) => void;
  selectedMode: string;
  setSelectedMode: (val: string) => void;
  activeMode?: 'SINGLE' | 'BATCH';
  isGenerating?: boolean;
  familyList?: string[];
  selectedFamily?: string;
  setSelectedFamily?: (val: string) => void;
  familyModels?: any[];
  familyModes?: string[];
  familyRatios?: string[];
  familyResolutions?: string[];
}

/* ─── PILL ─── */
const Pill = ({ label, active, onClick, disabled }: { label: string; active: boolean; onClick: () => void; disabled?: boolean }) => (
  <button
    onClick={onClick}
    disabled={disabled}
    className={`px-2.5 py-1 rounded-md text-[10px] font-semibold transition-all border ${active
      ? 'bg-rose-500/10 text-rose-500 dark:text-rose-400 border-rose-500/25'
      : 'bg-transparent border-black/[0.06] dark:border-white/[0.04] text-slate-600 dark:text-[#888] hover:text-slate-800 dark:hover:text-white/70 hover:border-black/10 dark:hover:border-white/10'
      }`}
  >
    {label}
  </button>
);

export const ModelEngineSettings: React.FC<ModelEngineSettingsProps> = ({
  availableModels, selectedModel, setSelectedModel,
  selectedRatio, setSelectedRatio, selectedRes, setSelectedRes,
  quantity, setQuantity, selectedEngine = 'gommo', onSelectEngine = () => { },
  selectedMode, setSelectedMode, activeMode = 'SINGLE', isGenerating = false,
  familyList, selectedFamily, setSelectedFamily, familyModels, familyModes, familyRatios, familyResolutions,
}) => {
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [showAllVariants, setShowAllVariants] = useState(false);
  const [isExpanded, setIsExpanded] = useState(true);
  const [expandedGroups, setExpandedGroups] = useState<Record<string, boolean>>({});

  const toggleGroup = (key: string) => setExpandedGroups(prev => ({ ...prev, [key]: !prev[key] }));

  const hasFamilyData = familyList && familyList.length > 0;
  const modes = hasFamilyData && familyModes?.length ? familyModes : (selectedModel?.raw?.modes || []);
  const resolutions = hasFamilyData && familyResolutions?.length ? familyResolutions : ['1k'];
  const ratios = hasFamilyData && familyRatios?.length ? familyRatios : (selectedModel?.raw?.aspectRatios || ['16:9', '9:16', '1:1']);

  const allVariants = familyModels || [];
  const MAX_VARIANTS = 4;
  const hasMoreVariants = allVariants.length > MAX_VARIANTS;
  const visibleVariants = showAllVariants ? allVariants : allVariants.slice(0, MAX_VARIANTS);
  const currentModelId = selectedModel?.raw?._id || selectedModel?._id || selectedModel?.id;
  const selectedInVisible = visibleVariants.some((m: any) => m._id === currentModelId);
  const extraSelected = !showAllVariants && !selectedInVisible ? allVariants.find((m: any) => m._id === currentModelId) : null;

  const stripFamily = (name: string) => {
    const KNOWN = ['Nano Banana', 'Banana', 'Seedream', 'Seedance', 'Midjourney', 'Imagen', 'Z-Image', 'Kling', 'IMAGE O1', 'Nâng cấp'];
    let result = name;
    for (const fam of KNOWN) {
      if (result.toLowerCase().startsWith(fam.toLowerCase())) {
        result = result.slice(fam.length).trim();
        break;
      }
    }
    return result.replace(/^[\s-]+/, '').trim() || name;
  };

  /* ─── Compact summary when collapsed ─── */
  const summaryText = [
    selectedFamily || '',
    selectedModel?.name ? stripFamily(selectedModel.name) : '',
  ].filter(Boolean).join(' · ');

  return (
    <>
      <div className="border-t border-black/[0.06] dark:border-white/[0.04]">

        {/* ─── COLLAPSIBLE HEADER ─── */}
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="w-full flex items-center justify-between py-2.5 px-0.5 group"
        >
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-semibold uppercase text-slate-500 dark:text-slate-400 tracking-wider flex items-center gap-1.5"><Settings2 size={12} className="text-rose-400" /> Cấu hình AI</span>
            {!isExpanded && summaryText && (
              <span className="text-[9px] font-medium text-rose-400/70 truncate max-w-[140px]">{summaryText}</span>
            )}
          </div>
          {isExpanded
            ? <ChevronUp size={12} className="text-slate-400 dark:text-slate-500 group-hover:text-rose-400 transition-colors" />
            : <ChevronDown size={12} className="text-slate-400 dark:text-slate-500 group-hover:text-rose-400 transition-colors" />
          }
        </button>

        {/* ─── EXPANDED CONTENT ─── */}
        {isExpanded && (
          <div className="space-y-4 pb-3 px-1">

            {/* MODEL FAMILY */}
            {hasFamilyData && (
              <div className="space-y-1.5">
                <p className="text-[10px] font-semibold uppercase text-slate-500 dark:text-slate-400 tracking-wider px-0.5 flex items-center gap-1.5"><Brain size={11} className="text-cyan-500" /> Model</p>
                <div className="flex gap-1.5">
                  <div className="relative flex-grow">
                    <select
                      value={selectedFamily || ''}
                      onChange={e => setSelectedFamily?.(e.target.value)}
                      disabled={isGenerating}
                      className="w-full bg-slate-50 dark:bg-white/[0.03] border border-black/[0.06] dark:border-white/[0.06] px-2.5 py-2 rounded-lg text-xs font-medium outline-none appearance-none focus:border-rose-500/40 transition-all cursor-pointer text-slate-800 dark:text-white/80"
                    >
                      {familyList!.map(f => <option key={f} value={f}>{f}</option>)}
                    </select>
                    <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 dark:text-[#555] pointer-events-none" size={11} />
                  </div>
                  <button
                    onClick={() => setIsDetailOpen(true)}
                    disabled={isGenerating}
                    className="shrink-0 px-2 py-1.5 bg-slate-50 dark:bg-white/[0.03] border border-black/[0.06] dark:border-white/[0.06] rounded-lg text-[10px] font-medium text-slate-500 dark:text-slate-400 hover:text-rose-500 dark:hover:text-rose-400 hover:border-rose-500/30 transition-all flex items-center gap-1"
                    title="Xem chi tiết"
                  >
                    <List size={10} />
                  </button>
                </div>
              </div>
            )}

            {/* VARIANTS */}
            {allVariants.length > 1 && (
              <div className="space-y-1.5">
                <p className="text-[10px] font-semibold uppercase text-slate-500 dark:text-slate-400 tracking-wider px-0.5 flex items-center gap-1.5">
                  <GitBranch size={11} className="text-violet-400" /> Phiên bản {hasMoreVariants && <span className="text-[9px] text-slate-400 dark:text-slate-500 normal-case font-normal">({allVariants.length})</span>}
                </p>
                <div className="flex flex-wrap gap-1">
                  {visibleVariants.map((m: any) => (
                    <Pill
                      key={m._id}
                      label={stripFamily(m.name)}
                      active={currentModelId === m._id}
                      onClick={() => {
                        const mapped = availableModels.find((am: any) => (am.raw?._id || am._id || am.id) === m._id);
                        if (mapped) setSelectedModel(mapped);
                      }}
                      disabled={isGenerating}
                    />
                  ))}
                  {extraSelected && (
                    <Pill
                      key={extraSelected._id}
                      label={stripFamily(extraSelected.name)}
                      active={true}
                      onClick={() => {
                        const mapped = availableModels.find((am: any) => (am.raw?._id || am._id || am.id) === extraSelected._id);
                        if (mapped) setSelectedModel(mapped);
                      }}
                    />
                  )}
                  {hasMoreVariants && (
                    <button onClick={() => setShowAllVariants(!showAllVariants)} className="px-1.5 py-1 text-[9px] font-medium text-slate-500 dark:text-[#888] hover:text-rose-400 transition-colors">
                      {showAllVariants ? '↑ Thu gọn' : `+${allVariants.length - MAX_VARIANTS}`}
                    </button>
                  )}
                </div>
              </div>
            )}

            {/* COMPACT ROW: Modes + Ratio + Resolution + Quantity */}
            <div className="space-y-3">
              {/* Modes */}
              {modes.length > 0 && (() => {
                const MAX = 3;
                const isGroupExpanded = expandedGroups['modes'];
                const activeIdx = modes.findIndex((m: string) => m === selectedMode);
                const visibleItems = isGroupExpanded ? modes : modes.slice(0, MAX);
                const activeOutside = !isGroupExpanded && activeIdx >= MAX;
                const hiddenCount = modes.length - MAX;
                return (
                  <div className="space-y-1">
                    <p className="text-[10px] font-semibold uppercase text-slate-500 dark:text-slate-400 tracking-wider px-0.5 flex items-center gap-1.5"><SlidersHorizontal size={11} className="text-amber-400" /> Chế độ</p>
                    <div className="flex flex-wrap gap-1">
                      {visibleItems.map((m: string) => <Pill key={m} label={m} active={selectedMode === m} onClick={() => setSelectedMode(m)} disabled={isGenerating} />)}
                      {activeOutside && <Pill label={selectedMode} active={true} onClick={() => {}} disabled={isGenerating} />}
                      {hiddenCount > 0 && (
                        <button onClick={() => toggleGroup('modes')} className="px-1.5 py-1 text-[9px] font-medium text-slate-500 dark:text-[#888] hover:text-rose-400 transition-colors">
                          {isGroupExpanded ? '↑ Thu gọn' : `+${hiddenCount}`}
                        </button>
                      )}
                    </div>
                  </div>
                );
              })()}

              {/* Ratio + Res on same row */}
              <div className="flex flex-wrap gap-x-4 gap-y-2">
                {ratios.length > 0 && (() => {
                  const MAX = 3;
                  const isGroupExpanded = expandedGroups['ratios'];
                  const activeIdx = ratios.findIndex((r: string) => r === selectedRatio);
                  const visibleItems = isGroupExpanded ? ratios : ratios.slice(0, MAX);
                  const activeOutside = !isGroupExpanded && activeIdx >= MAX;
                  const hiddenCount = ratios.length - MAX;
                  return (
                    <div className="space-y-0.5">
                      <p className="text-[9px] font-semibold uppercase text-slate-500 dark:text-slate-400 tracking-wider px-0.5 flex items-center gap-1"><Ratio size={10} className="text-emerald-400" /> Tỷ lệ</p>
                      <div className="flex flex-wrap gap-0.5">
                        {visibleItems.map((r: string) => <Pill key={r} label={r} active={selectedRatio === r} onClick={() => setSelectedRatio(r)} disabled={isGenerating} />)}
                        {activeOutside && <Pill label={selectedRatio} active={true} onClick={() => {}} disabled={isGenerating} />}
                        {hiddenCount > 0 && (
                          <button onClick={() => toggleGroup('ratios')} className="px-1.5 py-0.5 text-[9px] font-medium text-slate-500 dark:text-[#888] hover:text-rose-400 transition-colors">
                            {isGroupExpanded ? '↑' : `+${hiddenCount}`}
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })()}
                {resolutions.length > 0 && (() => {
                  const MAX = 3;
                  const isGroupExpanded = expandedGroups['res'];
                  const activeIdx = resolutions.findIndex((r: string) => r === selectedRes);
                  const visibleItems = isGroupExpanded ? resolutions : resolutions.slice(0, MAX);
                  const activeOutside = !isGroupExpanded && activeIdx >= MAX;
                  const hiddenCount = resolutions.length - MAX;
                  return (
                    <div className="space-y-0.5">
                      <p className="text-[9px] font-semibold uppercase text-slate-500 dark:text-slate-400 tracking-wider px-0.5 flex items-center gap-1"><MonitorUp size={10} className="text-blue-400" /> P.Giải</p>
                      <div className="flex flex-wrap gap-0.5">
                        {visibleItems.map((r: string) => <Pill key={r} label={r} active={selectedRes === r} onClick={() => setSelectedRes(r)} disabled={isGenerating} />)}
                        {activeOutside && <Pill label={selectedRes} active={true} onClick={() => {}} disabled={isGenerating} />}
                        {hiddenCount > 0 && (
                          <button onClick={() => toggleGroup('res')} className="px-1.5 py-0.5 text-[9px] font-medium text-slate-500 dark:text-[#888] hover:text-rose-400 transition-colors">
                            {isGroupExpanded ? '↑' : `+${hiddenCount}`}
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })()}
              </div>

              {/* Quantity (Single mode only) */}
              {activeMode === 'SINGLE' && (
                <div className="flex items-center gap-2">
                  <p className="text-[9px] font-semibold uppercase text-slate-500 dark:text-slate-400 tracking-wider flex items-center gap-1"><Hash size={10} className="text-orange-400" /> SL</p>
                  <div className="flex bg-black/[0.02] dark:bg-white/[0.02] rounded-md border border-black/[0.06] dark:border-white/[0.04] overflow-hidden">
                    {[1, 2, 3, 4].map(n => (
                      <button key={n} onClick={() => setQuantity(n)} className={`w-8 py-1 text-[10px] font-semibold transition-all ${quantity === n ? 'bg-rose-500/15 text-rose-400' : 'text-slate-500 dark:text-[#888] hover:text-white/70'}`}>{n}</button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* MODEL INFO — compact */}
            {selectedModel && (
              <p className="text-[9px] text-slate-400 dark:text-[#444] truncate px-0.5">
                → {selectedModel.raw?.name || selectedModel.name} <span className="text-slate-400 dark:text-[#333]">({selectedModel.raw?.modelKey || selectedModel.id})</span>
              </p>
            )}
          </div>
        )}
      </div>

      {/* ─── DETAIL MODAL ─── */}
      {isDetailOpen && (
        <ModelSelectorModal
          isOpen={isDetailOpen}
          onClose={() => setIsDetailOpen(false)}
          models={availableModels.map((m: any) => m.raw || m)}
          selectedModelId={currentModelId || ''}
          onSelect={(id) => {
            const found = availableModels.find((m: any) => (m.raw?._id || m._id || m.id) === id);
            if (found) {
              setSelectedModel(found);
              const raw = found.raw || found;
              const KNOWN = ['Nano Banana', 'Banana', 'Seedream', 'Seedance', 'Midjourney', 'Imagen', 'Z-Image', 'Kling', 'IMAGE O1', 'Nâng cấp'];
              let fam = raw.name.split(/\s*-\s/)[0].split(/\s+\d/)[0] || 'Other';
              for (const f of KNOWN) {
                if (raw.name.toLowerCase().startsWith(f.toLowerCase())) { fam = f; break; }
              }
              setSelectedFamily?.(fam);
            }
          }}
        />
      )}
    </>
  );
};