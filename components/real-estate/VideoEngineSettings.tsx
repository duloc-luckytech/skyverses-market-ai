import React, { useState } from 'react';
import {
  ChevronDown, ChevronUp, Brain, GitBranch, SlidersHorizontal,
  Ratio, MonitorUp, Hash, Settings2, Clock, Volume2, VolumeX,
} from 'lucide-react';
import { ServerSelector } from '../common/ServerSelector';
import { PricingModel } from '../../apis/pricing';

/* ─── Types ─── */
export interface VideoEngineSettingsProps {
  /* Engine / server */
  selectedEngine: string;
  onSelectEngine: (val: string) => void;
  /* Model family */
  familyList: string[];
  selectedFamily: string;
  setSelectedFamily: (val: string) => void;
  /* Models in family */
  familyModels: PricingModel[];
  /* Mode */
  familyModes: string[];
  selectedMode: string;
  setSelectedMode: (val: string) => void;
  /* Resolution */
  familyResolutions: string[];
  selectedResolution: string;
  setSelectedResolution: (val: string) => void;
  /* Ratio */
  familyRatios: string[];
  selectedRatio: string;
  cycleRatio: () => void;
  /* Duration */
  availableDurations: string[];
  selectedDuration: string;
  cycleDuration: () => void;
  isModeBased: boolean;
  /* Sound */
  soundEnabled: boolean;
  setSoundEnabled: (val: boolean) => void;
  /* Quantity */
  quantity: number;
  setQuantity: (val: number) => void;
  /** Cost per video */
  unitCost: number;
  isGenerating?: boolean;
  /* Selected model object (for info row) */
  selectedModelObj?: PricingModel | null;
}

/* ─── Pill ─── */
const Pill = ({
  label, active, onClick, disabled,
}: {
  label: string; active: boolean; onClick: () => void; disabled?: boolean;
}) => (
  <button
    onClick={onClick}
    disabled={disabled}
    className={`px-2.5 py-1 rounded-md text-[10px] font-semibold transition-all border ${
      active
        ? 'bg-rose-500/10 text-rose-500 dark:text-rose-400 border-rose-500/25'
        : 'bg-transparent border-black/[0.06] dark:border-white/[0.04] text-slate-600 dark:text-[#888] hover:text-slate-800 dark:hover:text-white/70 hover:border-black/10 dark:hover:border-white/10'
    }`}
  >
    {label}
  </button>
);

/* ─── Component ─── */
export const VideoEngineSettings: React.FC<VideoEngineSettingsProps> = ({
  selectedEngine, onSelectEngine,
  familyList, selectedFamily, setSelectedFamily,
  familyModels,
  familyModes, selectedMode, setSelectedMode,
  familyResolutions, selectedResolution, setSelectedResolution,
  familyRatios, selectedRatio, cycleRatio,
  availableDurations, selectedDuration, cycleDuration, isModeBased,
  soundEnabled, setSoundEnabled,
  quantity, setQuantity,
  unitCost,
  isGenerating = false,
  selectedModelObj,
}) => {
  const [isExpanded, setIsExpanded] = useState(true);
  const [expandedGroups, setExpandedGroups] = useState<Record<string, boolean>>({});

  const toggleGroup = (key: string) =>
    setExpandedGroups(prev => ({ ...prev, [key]: !prev[key] }));

  /* Compact summary for collapsed state */
  const summaryText = [
    selectedFamily,
    selectedModelObj?.name || '',
  ].filter(Boolean).join(' · ');

  const modes = familyModes;
  const resolutions = familyResolutions;
  const ratios = familyRatios;

  return (
    <div className="border-t border-black/[0.06] dark:border-white/[0.04]">
      {/* ─── Header ─── */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full flex items-center justify-between py-2.5 px-0.5 group"
      >
        <div className="flex items-center gap-2">
          <span className="text-[10px] font-semibold uppercase text-slate-500 dark:text-slate-400 tracking-wider flex items-center gap-1.5">
            <Settings2 size={12} className="text-rose-400" /> Cấu hình AI
          </span>
          {!isExpanded && summaryText && (
            <span className="text-[9px] font-medium text-rose-400/70 truncate max-w-[140px]">
              {summaryText}
            </span>
          )}
        </div>
        {isExpanded
          ? <ChevronUp size={12} className="text-slate-400 dark:text-slate-500 group-hover:text-rose-400 transition-colors" />
          : <ChevronDown size={12} className="text-slate-400 dark:text-slate-500 group-hover:text-rose-400 transition-colors" />
        }
      </button>

      {/* ─── Expanded content ─── */}
      {isExpanded && (
        <div className="space-y-4 pb-3 px-1">

          {/* Server */}
          <ServerSelector
            selected={selectedEngine}
            onChange={onSelectEngine}
            disabled={isGenerating}
            variant="pill"
          />

          {/* Model Family */}
          {familyList.length > 0 && (
            <div className="space-y-1.5">
              <p className="text-[10px] font-semibold uppercase text-slate-500 dark:text-slate-400 tracking-wider px-0.5 flex items-center gap-1.5">
                <Brain size={11} className="text-cyan-500" /> Model
              </p>
              <div className="relative">
                <select
                  value={selectedFamily || ''}
                  onChange={e => setSelectedFamily(e.target.value)}
                  disabled={isGenerating}
                  className="w-full bg-slate-50 dark:bg-white/[0.03] border border-black/[0.06] dark:border-white/[0.06] px-2.5 py-2 rounded-lg text-xs font-medium outline-none appearance-none focus:border-rose-500/40 transition-all cursor-pointer text-slate-800 dark:text-white/80"
                >
                  {familyList.map(f => <option key={f} value={f}>{f}</option>)}
                </select>
                <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 dark:text-[#555] pointer-events-none" size={11} />
              </div>
            </div>
          )}

          {/* Variants */}
          {familyModels.length > 1 && (() => {
            const MAX = 4;
            const currentId = selectedModelObj?._id;
            const visible = familyModels.slice(0, MAX);
            const extra = !visible.find(m => m._id === currentId)
              ? familyModels.find(m => m._id === currentId) : null;
            return (
              <div className="space-y-1.5">
                <p className="text-[10px] font-semibold uppercase text-slate-500 dark:text-slate-400 tracking-wider px-0.5 flex items-center gap-1.5">
                  <GitBranch size={11} className="text-violet-400" /> Phiên bản
                  {familyModels.length > MAX && (
                    <span className="text-[9px] text-slate-400 dark:text-slate-500 normal-case font-normal">({familyModels.length})</span>
                  )}
                </p>
                <div className="flex flex-wrap gap-1">
                  {visible.map(m => (
                    <Pill
                      key={m._id}
                      label={m.name}
                      active={currentId === m._id}
                      onClick={() => setSelectedFamily(m.name.split(/\s*-\s/)[0].split(/\s+/)[0] || m.name)}
                      disabled={isGenerating}
                    />
                  ))}
                  {extra && (
                    <Pill
                      key={extra._id}
                      label={extra.name}
                      active={true}
                      onClick={() => {}}
                    />
                  )}
                </div>
              </div>
            );
          })()}

          {/* Modes */}
          {modes.length > 0 && (() => {
            const MAX = 3;
            const isGroupExpanded = expandedGroups['modes'];
            const activeIdx = modes.findIndex(m => m === selectedMode);
            const visibleItems = isGroupExpanded ? modes : modes.slice(0, MAX);
            const activeOutside = !isGroupExpanded && activeIdx >= MAX;
            const hiddenCount = modes.length - MAX;
            return (
              <div className="space-y-1">
                <p className="text-[10px] font-semibold uppercase text-slate-500 dark:text-slate-400 tracking-wider px-0.5 flex items-center gap-1.5">
                  <SlidersHorizontal size={11} className="text-amber-400" /> Chế độ
                </p>
                <div className="flex flex-wrap gap-1">
                  {visibleItems.map(m => <Pill key={m} label={m} active={selectedMode === m} onClick={() => setSelectedMode(m)} disabled={isGenerating} />)}
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

          {/* Ratio + Resolution */}
          <div className="flex flex-wrap gap-x-4 gap-y-2">
            {ratios.length > 0 && (() => {
              const MAX = 3;
              const isGroupExpanded = expandedGroups['ratios'];
              const activeIdx = ratios.findIndex(r => r === selectedRatio);
              const visibleItems = isGroupExpanded ? ratios : ratios.slice(0, MAX);
              const activeOutside = !isGroupExpanded && activeIdx >= MAX;
              const hiddenCount = ratios.length - MAX;
              return (
                <div className="space-y-0.5">
                  <p className="text-[9px] font-semibold uppercase text-slate-500 dark:text-slate-400 tracking-wider px-0.5 flex items-center gap-1">
                    <Ratio size={10} className="text-emerald-400" /> Tỷ lệ
                  </p>
                  <div className="flex flex-wrap gap-0.5">
                    {visibleItems.map(r => <Pill key={r} label={r} active={selectedRatio === r} onClick={cycleRatio} disabled={isGenerating} />)}
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
              const visibleItems = isGroupExpanded ? resolutions : resolutions.slice(0, MAX);
              const activeIdx = resolutions.findIndex(r => r === selectedResolution);
              const activeOutside = !isGroupExpanded && activeIdx >= MAX;
              const hiddenCount = resolutions.length - MAX;
              return (
                <div className="space-y-0.5">
                  <p className="text-[9px] font-semibold uppercase text-slate-500 dark:text-slate-400 tracking-wider px-0.5 flex items-center gap-1">
                    <MonitorUp size={10} className="text-blue-400" /> P.Giải
                  </p>
                  <div className="flex flex-wrap gap-0.5">
                    {visibleItems.map(r => (
                      <Pill key={r} label={r.toUpperCase()} active={selectedResolution === r} onClick={() => setSelectedResolution(r)} disabled={isGenerating} />
                    ))}
                    {activeOutside && <Pill label={selectedResolution.toUpperCase()} active={true} onClick={() => {}} disabled={isGenerating} />}
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

          {/* Duration + Sound toggle */}
          <div className="flex items-center gap-2">
            {!isModeBased && availableDurations.length > 0 && (
              <button
                onClick={cycleDuration}
                disabled={isGenerating}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-black/[0.06] dark:border-white/[0.04] text-[10px] font-semibold text-slate-600 dark:text-[#888] hover:border-rose-500/30 hover:text-rose-400 transition-all"
              >
                <Clock size={10} /> {selectedDuration}
              </button>
            )}
            <button
              onClick={() => setSoundEnabled(!soundEnabled)}
              disabled={isGenerating}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-[10px] font-semibold transition-all ${
                soundEnabled
                  ? 'bg-rose-500/10 border-rose-500/25 text-rose-400'
                  : 'border-black/[0.06] dark:border-white/[0.04] text-slate-500 dark:text-[#666] hover:border-rose-500/30 hover:text-rose-400'
              }`}
            >
              {soundEnabled ? <Volume2 size={10} /> : <VolumeX size={10} />}
              {soundEnabled ? 'Sound' : 'Mute'}
            </button>
          </div>

          {/* Quantity */}
          <div className="flex items-center gap-2">
            <p className="text-[9px] font-semibold uppercase text-slate-500 dark:text-slate-400 tracking-wider flex items-center gap-1">
              <Hash size={10} className="text-orange-400" /> SL
            </p>
            <div className="flex bg-black/[0.02] dark:bg-white/[0.02] rounded-md border border-black/[0.06] dark:border-white/[0.04] overflow-hidden">
              {[1, 2, 3].map(n => (
                <button
                  key={n}
                  onClick={() => setQuantity(n)}
                  disabled={isGenerating}
                  className={`w-8 py-1 text-[10px] font-semibold transition-all ${quantity === n ? 'bg-rose-500/15 text-rose-400' : 'text-slate-500 dark:text-[#888] hover:text-white/70'}`}
                >
                  {n}
                </button>
              ))}
            </div>
            <span className="ml-auto text-[10px] font-bold text-rose-400">
              {unitCost.toLocaleString()} CR
            </span>
          </div>

          {/* Model info */}
          {selectedModelObj && (
            <p className="text-[9px] text-slate-400 dark:text-[#444] truncate px-0.5">
              → {selectedModelObj.name}{' '}
              <span className="text-slate-400 dark:text-[#333]">({selectedModelObj.modelKey})</span>
            </p>
          )}
        </div>
      )}
    </div>
  );
};
