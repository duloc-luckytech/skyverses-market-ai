import React, { useState } from 'react';
import {
  ChevronDown, List, Brain, GitBranch, SlidersHorizontal,
  Ratio, MonitorUp, Hash, Volume2, VolumeX, Clock, Settings2,
} from 'lucide-react';
import { PricingModel } from '../../apis/pricing';
import { ServerSelector } from '../common/ServerSelector';
import { ModelSelectorModal } from '../common/ModelSelectorModal';

export interface VideoModelEngineSettingsProps {
  /* Engine */
  selectedEngine: string;
  onSelectEngine: (val: string) => void;

  /* Model / Family */
  availableModels: PricingModel[];
  selectedModelObj: PricingModel | null;
  setSelectedModelObj: (model: PricingModel | null) => void;
  familyList: string[];
  selectedFamily: string;
  setSelectedFamily: (val: string) => void;
  familyModels: PricingModel[];
  familyModes: string[];
  familyResolutions: string[];
  familyRatios: string[];

  /* Config */
  selectedMode: string;
  setSelectedMode: (val: string) => void;
  ratio: string;
  setRatio: (val: string) => void;
  resolution: string;
  setResolution: (val: string) => void;

  /* Video-specific */
  isModeBased: boolean;
  duration: string;
  cycleDuration: () => void;
  soundEnabled: boolean;
  setSoundEnabled: (val: boolean) => void;

  /* Quantity (optional — hide for non-SINGLE modes) */
  quantity?: number;
  setQuantity?: (val: number) => void;
  showQuantity?: boolean;

  /* State */
  isGenerating?: boolean;
}

/* ─── PILL ─── */
const Pill = ({
  label, active, onClick, disabled,
}: { label: string; active: boolean; onClick: () => void; disabled?: boolean }) => (
  <button
    onClick={onClick}
    disabled={disabled}
    className={`px-2.5 py-1 rounded-md text-[10px] font-semibold transition-all border ${
      active
        ? 'bg-indigo-500/10 text-indigo-500 dark:text-indigo-400 border-indigo-500/25'
        : 'bg-transparent border-black/[0.06] dark:border-white/[0.04] text-slate-600 dark:text-[#888] hover:text-slate-800 dark:hover:text-white/70 hover:border-black/10 dark:hover:border-white/10'
    }`}
  >
    {label}
  </button>
);

const KNOWN_FAMILIES = ['VEO', 'Kling', 'Hailuo', 'Grok', 'Sora', 'WAN', 'Wan', 'V-Fuse', 'OmniHuman', 'Seedance'];
const stripFamily = (name: string) =>
  name.replace(new RegExp(`^(${KNOWN_FAMILIES.join('|')})\\s*`, 'i'), '').trim() || name;

export const VideoModelEngineSettings: React.FC<VideoModelEngineSettingsProps> = ({
  selectedEngine, onSelectEngine,
  availableModels, selectedModelObj, setSelectedModelObj,
  familyList, selectedFamily, setSelectedFamily,
  familyModels, familyModes, familyResolutions, familyRatios,
  selectedMode, setSelectedMode,
  ratio, setRatio,
  resolution, setResolution,
  isModeBased, duration, cycleDuration,
  soundEnabled, setSoundEnabled,
  quantity = 1, setQuantity, showQuantity = true,
  isGenerating = false,
}) => {
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [showAllVariants, setShowAllVariants] = useState(false);
  const [expandedGroups, setExpandedGroups] = useState<Record<string, boolean>>({});
  const toggleGroup = (key: string) =>
    setExpandedGroups(prev => ({ ...prev, [key]: !prev[key] }));

  const MAX_VARIANTS = 4;
  const allVariants = familyModels || [];
  const hasMoreVariants = allVariants.length > MAX_VARIANTS;
  const visibleVariants = showAllVariants ? allVariants : allVariants.slice(0, MAX_VARIANTS);
  const selectedInVisible = visibleVariants.some(m => m._id === selectedModelObj?._id);
  const extraSelected = !showAllVariants && !selectedInVisible
    ? allVariants.find(m => m._id === selectedModelObj?._id)
    : null;

  const modes = familyModes?.length ? familyModes : (selectedModelObj?.modes || []);
  const resolutions = familyResolutions?.length ? familyResolutions : ['720p', '1080p'];
  const ratios = familyRatios?.length ? familyRatios : ['16:9', '9:16'];

  return (
    <>
      <div className="space-y-2.5">

        {/* ─── SERVER SELECTOR ─── */}
        <ServerSelector
          selected={selectedEngine}
          onChange={onSelectEngine}
          disabled={isGenerating}
          variant="pill"
        />

        {/* ─── MODEL FAMILY ─── */}
        {familyList.length > 0 && (
          <div className="space-y-1">
            <p className="text-[10px] font-semibold uppercase text-slate-500 dark:text-slate-400 tracking-wider px-0.5 flex items-center gap-1.5">
              <Brain size={11} className="text-cyan-500" /> Model
            </p>
            <div className="flex gap-1.5">
              <div className="relative flex-grow">
                <select
                  value={selectedFamily}
                  onChange={e => setSelectedFamily(e.target.value)}
                  disabled={isGenerating}
                  className="w-full bg-slate-50 dark:bg-white/[0.03] border border-black/[0.06] dark:border-white/[0.06] px-2.5 py-2 rounded-lg text-xs font-medium outline-none appearance-none focus:border-indigo-500/40 transition-all cursor-pointer text-slate-700 dark:text-white/80"
                >
                  {familyList.map(f => <option key={f} value={f}>{f}</option>)}
                </select>
                <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 dark:text-[#555] pointer-events-none" size={11} />
              </div>
              <button
                onClick={() => setIsDetailModalOpen(true)}
                disabled={isGenerating}
                className="shrink-0 px-2 py-1.5 bg-slate-50 dark:bg-white/[0.03] border border-black/[0.06] dark:border-white/[0.06] rounded-lg text-[10px] font-medium text-slate-500 dark:text-slate-400 hover:text-indigo-500 dark:hover:text-indigo-400 hover:border-indigo-500/30 transition-all flex items-center gap-1"
                title="Xem tất cả models"
              >
                <List size={10} />
              </button>
            </div>
          </div>
        )}

        {/* ─── VARIANTS (phiên bản trong family) ─── */}
        {allVariants.length > 1 && (
          <div className="space-y-1">
            <p className="text-[10px] font-semibold uppercase text-slate-500 dark:text-slate-400 tracking-wider px-0.5 flex items-center gap-1.5">
              <GitBranch size={11} className="text-violet-400" /> Phiên bản
              {hasMoreVariants && (
                <span className="text-[9px] text-slate-400 dark:text-slate-500 normal-case font-normal">
                  ({allVariants.length})
                </span>
              )}
            </p>
            <div className="flex flex-wrap gap-1">
              {visibleVariants.map(m => (
                <Pill
                  key={m._id}
                  label={stripFamily(m.name)}
                  active={selectedModelObj?._id === m._id}
                  onClick={() => setSelectedModelObj(m)}
                  disabled={isGenerating}
                />
              ))}
              {extraSelected && (
                <Pill
                  key={extraSelected._id}
                  label={stripFamily(extraSelected.name)}
                  active
                  onClick={() => setSelectedModelObj(extraSelected)}
                />
              )}
              {hasMoreVariants && (
                <button
                  onClick={() => setShowAllVariants(!showAllVariants)}
                  className="px-1.5 py-1 text-[9px] font-medium text-slate-500 dark:text-[#888] hover:text-indigo-400 transition-colors"
                >
                  {showAllVariants ? '↑ Thu gọn' : `+${allVariants.length - MAX_VARIANTS}`}
                </button>
              )}
            </div>
          </div>
        )}

        {/* ─── CHẾ ĐỘ ─── */}
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
                {visibleItems.map(m => (
                  <Pill key={m} label={m} active={selectedMode === m} onClick={() => setSelectedMode(m)} disabled={isGenerating} />
                ))}
                {activeOutside && (
                  <Pill label={selectedMode} active onClick={() => {}} disabled={isGenerating} />
                )}
                {hiddenCount > 0 && (
                  <button onClick={() => toggleGroup('modes')} className="px-1.5 py-1 text-[9px] font-medium text-slate-500 dark:text-[#888] hover:text-indigo-400 transition-colors">
                    {isGroupExpanded ? '↑ Thu gọn' : `+${hiddenCount}`}
                  </button>
                )}
              </div>
            </div>
          );
        })()}

        {/* ─── TỶ LỆ + P.GIẢI ─── */}
        <div className="flex flex-wrap gap-x-4 gap-y-2">
          {/* Ratio */}
          {(() => {
            const MAX = 3;
            const isGroupExpanded = expandedGroups['ratios'];
            const activeIdx = ratios.findIndex(r => r === ratio);
            const visibleItems = isGroupExpanded ? ratios : ratios.slice(0, MAX);
            const activeOutside = !isGroupExpanded && activeIdx >= MAX;
            const hiddenCount = ratios.length - MAX;
            return (
              <div className="space-y-0.5">
                <p className="text-[9px] font-semibold uppercase text-slate-500 dark:text-slate-400 tracking-wider px-0.5 flex items-center gap-1">
                  <Ratio size={10} className="text-emerald-400" /> Tỷ lệ
                </p>
                <div className="flex flex-wrap gap-0.5">
                  {visibleItems.map(r => (
                    <Pill key={r} label={r} active={ratio === r} onClick={() => setRatio(r)} disabled={isGenerating} />
                  ))}
                  {activeOutside && <Pill label={ratio} active onClick={() => {}} />}
                  {hiddenCount > 0 && (
                    <button onClick={() => toggleGroup('ratios')} className="px-1.5 py-0.5 text-[9px] font-medium text-slate-500 dark:text-[#888] hover:text-indigo-400 transition-colors">
                      {isGroupExpanded ? '↑' : `+${hiddenCount}`}
                    </button>
                  )}
                </div>
              </div>
            );
          })()}

          {/* Resolution */}
          {(() => {
            const MAX = 3;
            const isGroupExpanded = expandedGroups['res'];
            const activeIdx = resolutions.findIndex(r => r === resolution);
            const visibleItems = isGroupExpanded ? resolutions : resolutions.slice(0, MAX);
            const activeOutside = !isGroupExpanded && activeIdx >= MAX;
            const hiddenCount = resolutions.length - MAX;
            return (
              <div className="space-y-0.5">
                <p className="text-[9px] font-semibold uppercase text-slate-500 dark:text-slate-400 tracking-wider px-0.5 flex items-center gap-1">
                  <MonitorUp size={10} className="text-blue-400" /> P.Giải
                </p>
                <div className="flex flex-wrap gap-0.5">
                  {visibleItems.map(r => (
                    <Pill key={r} label={r} active={resolution === r} onClick={() => setResolution(r)} disabled={isGenerating} />
                  ))}
                  {activeOutside && <Pill label={resolution} active onClick={() => {}} />}
                  {hiddenCount > 0 && (
                    <button onClick={() => toggleGroup('res')} className="px-1.5 py-0.5 text-[9px] font-medium text-slate-500 dark:text-[#888] hover:text-indigo-400 transition-colors">
                      {isGroupExpanded ? '↑' : `+${hiddenCount}`}
                    </button>
                  )}
                </div>
              </div>
            );
          })()}

          {/* Duration (chỉ khi không phải mode-based) */}
          {!isModeBased && (
            <div className="space-y-0.5">
              <p className="text-[9px] font-semibold uppercase text-slate-500 dark:text-slate-400 tracking-wider px-0.5 flex items-center gap-1">
                <Clock size={10} className="text-teal-400" /> Thời lượng
              </p>
              <Pill label={duration} active onClick={cycleDuration} disabled={isGenerating} />
            </div>
          )}

          {/* Sound */}
          <div className="space-y-0.5">
            <p className="text-[9px] font-semibold uppercase text-slate-500 dark:text-slate-400 tracking-wider px-0.5 flex items-center gap-1">
              {soundEnabled
                ? <Volume2 size={10} className="text-pink-400" />
                : <VolumeX size={10} className="text-slate-400" />}
              Âm thanh
            </p>
            <Pill
              label={soundEnabled ? 'ON' : 'OFF'}
              active={soundEnabled}
              onClick={() => setSoundEnabled(!soundEnabled)}
              disabled={isGenerating}
            />
          </div>
        </div>

        {/* ─── SỐ LƯỢNG ─── */}
        {showQuantity && setQuantity && (
          <div className="flex items-center gap-2">
            <p className="text-[9px] font-semibold uppercase text-slate-500 dark:text-slate-400 tracking-wider flex items-center gap-1">
              <Hash size={10} className="text-orange-400" /> SL
            </p>
            <div className="flex bg-black/[0.02] dark:bg-white/[0.02] rounded-md border border-black/[0.06] dark:border-white/[0.04] overflow-hidden">
              {[1, 2, 3, 4].map(n => (
                <button
                  key={n}
                  onClick={() => setQuantity(n)}
                  disabled={isGenerating}
                  className={`w-8 py-1 text-[10px] font-semibold transition-all ${
                    quantity === n
                      ? 'bg-indigo-500/15 text-indigo-500 dark:text-indigo-400'
                      : 'text-slate-500 dark:text-[#888] hover:text-slate-700 dark:hover:text-white/70'
                  }`}
                >
                  {n}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* ─── MODEL INFO ─── */}
        {selectedModelObj && (
          <p className="text-[9px] text-slate-400 dark:text-[#444] truncate px-0.5">
            → {selectedModelObj.name}{' '}
            <span className="text-slate-400 dark:text-[#333]">({selectedModelObj.modelKey})</span>
          </p>
        )}
      </div>

      {/* ─── MODEL DETAIL MODAL ─── */}
      {isDetailModalOpen && (
        <ModelSelectorModal
          isOpen={isDetailModalOpen}
          onClose={() => setIsDetailModalOpen(false)}
          models={availableModels}
          selectedModelId={selectedModelObj?._id || ''}
          onSelect={(id) => {
            const model = availableModels.find(m => m._id === id);
            if (model) {
              setSelectedModelObj(model);
              const name = model.name.trim();
              let fam = name.split(/\s*-\s/)[0].split(/\s+/)[0] || 'Other';
              for (const f of KNOWN_FAMILIES) {
                if (name.toLowerCase().startsWith(f.toLowerCase())) { fam = f; break; }
              }
              setSelectedFamily(fam);
            }
            setIsDetailModalOpen(false);
          }}
        />
      )}
    </>
  );
};
