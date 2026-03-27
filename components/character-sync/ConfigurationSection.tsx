
import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Settings2, ChevronDown, ChevronUp, Brain, GitBranch,
  SlidersHorizontal, Ratio, MonitorUp, Timer, List
} from 'lucide-react';
import { PricingModel } from '../../apis/pricing';
import { ServerSelector } from '../common/ServerSelector';
import { ModelSelectorModal } from '../common/ModelSelectorModal';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';

/* ─── PILL ─── */
const Pill = ({ label, active, onClick, disabled }: { label: string; active: boolean; onClick: () => void; disabled?: boolean }) => (
  <button onClick={onClick} disabled={disabled}
    className={`px-2.5 py-1 rounded-md text-[10px] font-semibold transition-all border ${active
      ? 'bg-purple-500/10 text-purple-500 dark:text-purple-400 border-purple-500/25'
      : 'bg-transparent border-black/[0.06] dark:border-white/[0.04] text-slate-600 dark:text-[#888] hover:text-slate-800 dark:hover:text-white/70 hover:border-black/10 dark:hover:border-white/10'
      }`}
  >{label}</button>
);

interface ConfigurationSectionProps {
  availableModels: PricingModel[];
  selectedModel: PricingModel | null;
  setSelectedModel: (model: PricingModel) => void;
  selectedEngine: string;
  setSelectedEngine: (engine: string) => void;
  resolution: string;
  setResolution: (val: string) => void;
  availableResolutions: string[];
  aspectRatio: '16:9' | '9:16';
  setAspectRatio: (val: '16:9' | '9:16') => void;
  duration: string;
  setDuration: (val: string) => void;
  availableDurations: string[];
  isGenerating?: boolean;
}

export const ConfigurationSection: React.FC<ConfigurationSectionProps> = ({
  availableModels, selectedModel, setSelectedModel,
  selectedEngine, setSelectedEngine,
  resolution, setResolution, availableResolutions,
  aspectRatio, setAspectRatio,
  duration, setDuration, availableDurations,
  isGenerating = false,
}) => {
  const [isExpanded, setIsExpanded] = useState(true);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [showAllVariants, setShowAllVariants] = useState(false);

  const { user } = useAuth();
  const { showToast } = useToast();

  // ─── Family grouping ───
  const KNOWN_FAMILIES = ['VEO', 'Kling', 'Hailuo', 'Grok', 'Sora', 'WAN', 'Wan', 'V-Fuse', 'OmniHuman', 'Seedance'];

  const extractFamily = (name: string): string => {
    const n = name.trim();
    for (const fam of KNOWN_FAMILIES) {
      if (n.toLowerCase().startsWith(fam.toLowerCase())) return fam;
    }
    return n.split(/\s*-\s/)[0].split(/\s+/)[0] || 'Other';
  };

  const stripFamily = (name: string) => name.replace(/^(VEO|Kling|Hailuo|Grok|Sora|WAN|Wan|V-Fuse|OmniHuman|Seedance)\s*/i, '').trim() || name;

  const families = useMemo(() => {
    const groups: Record<string, PricingModel[]> = {};
    availableModels.forEach(m => {
      const fam = extractFamily(m.name);
      if (!groups[fam]) groups[fam] = [];
      groups[fam].push(m);
    });
    return groups;
  }, [availableModels]);

  const familyList = useMemo(() => Object.keys(families).sort(), [families]);
  const [selectedFamily, setSelectedFamily] = useState<string>(() => {
    if (selectedModel) return extractFamily(selectedModel.name);
    return familyList[0] || '';
  });

  const familyModels = useMemo(() => families[selectedFamily] || [], [families, selectedFamily]);
  const familyModes = useMemo(() => [...new Set(familyModels.flatMap(m => m.modes || (m.mode ? [m.mode] : [])))], [familyModels]);
  const familyResolutions = useMemo(() => [...new Set(familyModels.flatMap(m => Object.keys(m.pricing || {})))], [familyModels]);
  const familyRatios = useMemo(() => [...new Set(familyModels.flatMap(m => m.aspectRatios || []))].filter(r => r && r !== 'auto'), [familyModels]);

  // Auto-select first model in family if current isn't in family
  React.useEffect(() => {
    if (familyModels.length > 0 && !familyModels.some(m => m._id === selectedModel?._id)) {
      setSelectedModel(familyModels[0]);
    }
  }, [selectedFamily, familyModels]);

  // Update selectedFamily when model list loads
  React.useEffect(() => {
    if (familyList.length > 0 && !selectedFamily) {
      setSelectedFamily(familyList[0]);
    }
  }, [familyList]);

  const MAX_VARIANTS = 4;
  const hasMoreVariants = familyModels.length > MAX_VARIANTS;
  const visibleVariants = showAllVariants ? familyModels : familyModels.slice(0, MAX_VARIANTS);
  const selectedInVisible = visibleVariants.some(m => m._id === selectedModel?._id);
  const extraSelected = !showAllVariants && !selectedInVisible ? familyModels.find(m => m._id === selectedModel?._id) : null;

  // Resolution guard
  const HIGH_RES = ['1080p', '2k', '4k', '2K', '4K'];
  const handleResolutionClick = (res: string) => {
    if (!user?.plan && HIGH_RES.includes(res)) {
      showToast('⚠️ Bạn cần nạp gói lần đầu để sử dụng độ phân giải ' + res, 'error');
      return;
    }
    setResolution(res);
  };

  const resolutions = familyResolutions.length ? familyResolutions : availableResolutions;
  const ratios = familyRatios.length ? familyRatios : ['16:9', '9:16'];

  const summaryText = [selectedFamily, selectedModel ? stripFamily(selectedModel.name) : ''].filter(Boolean).join(' · ');

  return (
    <>
      <div className="px-4 py-2.5 border-t border-slate-100 dark:border-white/[0.04]">
        <div className="space-y-2.5">

          {/* ─── COLLAPSIBLE HEADER ─── */}
          <button onClick={() => setIsExpanded(!isExpanded)} className="w-full flex items-center justify-between group">
            <div className="flex items-center gap-2">
              <span className="text-[9px] font-semibold uppercase text-slate-400 dark:text-slate-500 tracking-wider flex items-center gap-1.5">
                <Settings2 size={10} className="text-purple-400" /> Cấu hình AI
              </span>
              {!isExpanded && summaryText && (
                <span className="text-[8px] font-medium text-purple-400/70 truncate max-w-[140px]">{summaryText}</span>
              )}
            </div>
            {isExpanded
              ? <ChevronUp size={11} className="text-slate-400 group-hover:text-purple-400 transition-colors" />
              : <ChevronDown size={11} className="text-slate-400 group-hover:text-purple-400 transition-colors" />}
          </button>

          {/* ─── EXPANDED CONTENT ─── */}
          {isExpanded && (
            <div className="space-y-2.5">
              {/* SERVER SELECTOR */}
              <ServerSelector
                selected={selectedEngine}
                onChange={setSelectedEngine}
                disabled={isGenerating}
                variant="pill"
              />

              {/* MODEL FAMILY */}
              {familyList.length > 0 && (
                <div className="space-y-1">
                  <p className="text-[9px] font-semibold uppercase text-slate-400 dark:text-slate-500 tracking-wider px-0.5 flex items-center gap-1.5">
                    <Brain size={10} className="text-cyan-500" /> Model
                  </p>
                  <div className="flex gap-1.5">
                    <div className="relative flex-grow">
                      <select value={selectedFamily} onChange={e => setSelectedFamily(e.target.value)} disabled={isGenerating}
                        className="w-full bg-slate-50 dark:bg-white/[0.03] border border-black/[0.06] dark:border-white/[0.06] px-2 py-1.5 rounded-lg text-[11px] font-medium outline-none appearance-none focus:border-purple-500/40 transition-all cursor-pointer text-slate-700 dark:text-white/80">
                        {familyList.map(f => <option key={f} value={f}>{f}</option>)}
                      </select>
                      <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 dark:text-[#555] pointer-events-none" size={10} />
                    </div>
                    <button onClick={() => setIsDetailModalOpen(true)} disabled={isGenerating}
                      className="shrink-0 px-2 py-1 bg-slate-50 dark:bg-white/[0.03] border border-black/[0.06] dark:border-white/[0.06] rounded-lg text-[9px] font-medium text-slate-500 dark:text-slate-400 hover:text-purple-500 dark:hover:text-purple-400 hover:border-purple-500/30 transition-all flex items-center gap-1" title="Chi tiết">
                      <List size={9} />
                    </button>
                  </div>
                </div>
              )}

              {/* VARIANTS */}
              {familyModels.length > 1 && (
                <div className="space-y-1">
                  <p className="text-[9px] font-semibold uppercase text-slate-400 dark:text-slate-500 tracking-wider px-0.5 flex items-center gap-1.5">
                    <GitBranch size={10} className="text-violet-400" /> Phiên bản {hasMoreVariants && <span className="text-[8px] text-slate-400 dark:text-slate-500 normal-case font-normal">({familyModels.length})</span>}
                  </p>
                  <div className="flex flex-wrap gap-1">
                    {visibleVariants.map(m => (
                      <Pill key={m._id} label={stripFamily(m.name)} active={selectedModel?._id === m._id} onClick={() => setSelectedModel(m)} disabled={isGenerating} />
                    ))}
                    {extraSelected && <Pill key={extraSelected._id} label={stripFamily(extraSelected.name)} active={true} onClick={() => setSelectedModel(extraSelected)} />}
                    {hasMoreVariants && (
                      <button onClick={() => setShowAllVariants(!showAllVariants)} className="px-1.5 py-1 text-[8px] font-medium text-slate-500 dark:text-[#888] hover:text-purple-400 transition-colors">
                        {showAllVariants ? '↑ Thu gọn' : `+${familyModels.length - MAX_VARIANTS}`}
                      </button>
                    )}
                  </div>
                </div>
              )}

              {/* MODES */}
              {familyModes.length > 0 && (
                <div className="space-y-1">
                  <p className="text-[9px] font-semibold uppercase text-slate-400 dark:text-slate-500 tracking-wider px-0.5 flex items-center gap-1.5">
                    <SlidersHorizontal size={10} className="text-amber-400" /> Chế độ
                  </p>
                  <div className="flex flex-wrap gap-1">
                    {familyModes.map(m => <Pill key={m} label={m} active={selectedModel?.mode === m} onClick={() => {
                      const match = familyModels.find(fm => fm.mode === m || (fm.modes || []).includes(m));
                      if (match) setSelectedModel(match);
                    }} disabled={isGenerating} />)}
                  </div>
                </div>
              )}

              {/* CONFIG ROW — Ratio + Resolution + Duration */}
              <div className="flex flex-wrap gap-x-3 gap-y-2">
                {/* Ratio */}
                <div className="space-y-0.5">
                  <p className="text-[8px] font-semibold uppercase text-slate-400 dark:text-slate-500 tracking-wider px-0.5 flex items-center gap-1">
                    <Ratio size={9} className="text-emerald-400" /> Tỷ lệ
                  </p>
                  <div className="flex gap-0.5">
                    {ratios.map(r => <Pill key={r} label={r} active={aspectRatio === r} onClick={() => setAspectRatio(r as any)} disabled />)}
                  </div>
                </div>

                {/* Resolution */}
                <div className="space-y-0.5">
                  <p className="text-[8px] font-semibold uppercase text-slate-400 dark:text-slate-500 tracking-wider px-0.5 flex items-center gap-1">
                    <MonitorUp size={9} className="text-blue-400" /> P.Giải
                  </p>
                  <div className="flex flex-wrap gap-0.5">
                    {resolutions.map(r => <Pill key={r} label={r} active={resolution === r} onClick={() => handleResolutionClick(r)} />)}
                  </div>
                </div>

                {/* Duration */}
                <div className="space-y-0.5">
                  <p className="text-[8px] font-semibold uppercase text-slate-400 dark:text-slate-500 tracking-wider px-0.5 flex items-center gap-1">
                    <Timer size={9} className="text-teal-400" /> Thời lượng
                  </p>
                  <div className="flex gap-0.5">
                    {availableDurations.map(d => <Pill key={d} label={d} active={duration === d} onClick={() => setDuration(d)} />)}
                  </div>
                </div>
              </div>

              {/* MODEL INFO */}
              {selectedModel && (
                <p className="text-[8px] text-slate-400 dark:text-[#444] truncate px-0.5">
                  → {selectedModel.name} <span className="text-slate-400 dark:text-[#333]">({selectedModel.modelKey})</span>
                </p>
              )}
            </div>
          )}
        </div>
      </div>

      {/* ─── DETAIL MODAL ─── */}
      <AnimatePresence>
        {isDetailModalOpen && (
          <ModelSelectorModal
            isOpen={isDetailModalOpen} onClose={() => setIsDetailModalOpen(false)}
            models={availableModels} selectedModelId={selectedModel?._id || ''}
            onSelect={(id) => {
              const model = availableModels.find(m => m._id === id);
              if (model) {
                setSelectedModel(model);
                setSelectedFamily(extractFamily(model.name));
              }
            }}
          />
        )}
      </AnimatePresence>
    </>
  );
};
