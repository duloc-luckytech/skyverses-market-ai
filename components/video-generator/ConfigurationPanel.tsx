import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Settings2, ChevronDown, ChevronUp, Settings, Zap, Loader2, List,
  Brain, GitBranch, SlidersHorizontal, Ratio, MonitorUp, Hash,
  Volume2, Timer, Video
} from 'lucide-react';
import { PricingModel } from '../../apis/pricing';
import { ModelSelectorModal } from '../common/ModelSelectorModal';
import { ServerSelector } from '../common/ServerSelector';

interface ConfigurationPanelProps {
  availableModels: PricingModel[];
  selectedModelObj: PricingModel | null;
  setSelectedModelObj: (model: PricingModel | null) => void;
  selectedEngine: string; setSelectedEngine: (val: string) => void;
  selectedMode: string; setSelectedMode: (val: string) => void;
  ratio: string; cycleRatio: () => void;
  duration: string; cycleDuration: () => void;
  soundEnabled: boolean; cycleSound: () => void;
  resolution: string; cycleResolution: () => void;
  usagePreference: 'credits' | 'key' | null;
  credits: number; setShowResourceModal: (val: boolean) => void;
  currentTotalCost: number; handleGenerate: () => void;
  isGenerating: boolean; isGenerateDisabled: boolean; generateTooltip: string | null;
  activeMode: 'SINGLE' | 'MULTI' | 'AUTO';
  autoTasksCount: number; multiFramesCount: number;
  isMobileExpanded: boolean;
  quantity: number; setQuantity: (val: number) => void;
  isModeBased?: boolean;
  familyList?: string[]; selectedFamily?: string; setSelectedFamily?: (val: string) => void;
  familyModes?: string[]; familyResolutions?: string[]; familyRatios?: string[];
  setRatio?: (val: string) => void; setResolution?: (val: string) => void;
  familyModels?: PricingModel[];
}

/* ─── PILL ─── */
const Pill = ({ label, active, onClick, disabled }: { label: string; active: boolean; onClick: () => void; disabled?: boolean }) => (
  <button onClick={onClick} disabled={disabled}
    className={`px-2.5 py-1 rounded-md text-[10px] font-semibold transition-all border ${active
      ? 'bg-indigo-500/10 text-indigo-500 dark:text-indigo-400 border-indigo-500/25'
      : 'bg-transparent border-black/[0.06] dark:border-white/[0.04] text-slate-600 dark:text-[#888] hover:text-slate-800 dark:hover:text-white/70 hover:border-black/10 dark:hover:border-white/10'
      }`}
  >{label}</button>
);

export const ConfigurationPanel: React.FC<ConfigurationPanelProps> = (props) => {
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [showAllVariants, setShowAllVariants] = useState(false);
  const [isExpanded, setIsExpanded] = useState(true);
  const [expandedGroups, setExpandedGroups] = useState<Record<string, boolean>>({});
  const toggleGroup = (key: string) => setExpandedGroups(prev => ({ ...prev, [key]: !prev[key] }));

  const modes = props.familyModes?.length ? props.familyModes : (props.selectedModelObj?.modes || []);
  const resolutions = props.familyResolutions?.length ? props.familyResolutions : ['720p', '1080p'];
  const ratios = props.familyRatios?.length ? props.familyRatios : ['16:9', '9:16'];

  const MAX_VARIANTS = 4;
  const allVariants = props.familyModels || [];
  const hasMoreVariants = allVariants.length > MAX_VARIANTS;
  const visibleVariants = showAllVariants ? allVariants : allVariants.slice(0, MAX_VARIANTS);
  const selectedInVisible = visibleVariants.some(m => m._id === props.selectedModelObj?._id);
  const extraSelected = !showAllVariants && !selectedInVisible ? allVariants.find(m => m._id === props.selectedModelObj?._id) : null;

  const stripFamily = (name: string) => name.replace(/^(VEO|Kling|Hailuo|Grok|Sora|WAN|Wan|V-Fuse|OmniHuman|Seedance)\s*/i, '').trim() || name;

  const summaryText = [
    props.selectedFamily || '',
    props.selectedModelObj ? stripFamily(props.selectedModelObj.name) : '',
  ].filter(Boolean).join(' · ');

  return (
    <>
      <div className={`shrink-0 border-t border-black/[0.06] dark:border-white/[0.04] bg-white/80 dark:bg-[#0c0c10]/80 backdrop-blur-lg ${!props.isMobileExpanded ? 'hidden lg:block' : 'block'}`}>
        <div className="px-4 py-3 space-y-2.5">

          {/* ─── COLLAPSIBLE HEADER ─── */}
          <button onClick={() => setIsExpanded(!isExpanded)} className="w-full flex items-center justify-between group">
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-semibold uppercase text-slate-500 dark:text-slate-400 tracking-wider flex items-center gap-1.5">
                <Settings2 size={12} className="text-indigo-400" /> Cấu hình AI
              </span>
              {!isExpanded && summaryText && (
                <span className="text-[9px] font-medium text-indigo-400/70 truncate max-w-[140px]">{summaryText}</span>
              )}
            </div>
            {isExpanded
              ? <ChevronUp size={12} className="text-slate-400 dark:text-slate-500 group-hover:text-indigo-400 transition-colors" />
              : <ChevronDown size={12} className="text-slate-400 dark:text-slate-500 group-hover:text-indigo-400 transition-colors" />
            }
          </button>

          {/* ─── EXPANDED CONTENT ─── */}
          {isExpanded && (
            <div className="space-y-2.5">
              {/* SERVER SELECTOR */}
              <ServerSelector
                selected={props.selectedEngine}
                onChange={props.setSelectedEngine}
                disabled={props.isGenerating}
                variant="pill"
              />

              {/* MODEL FAMILY */}
              {props.familyList && props.familyList.length > 0 && (
                <div className="space-y-1">
                  <p className="text-[10px] font-semibold uppercase text-slate-500 dark:text-slate-400 tracking-wider px-0.5 flex items-center gap-1.5">
                    <Brain size={11} className="text-cyan-500" /> Model
                  </p>
                  <div className="flex gap-1.5">
                    <div className="relative flex-grow">
                      <select value={props.selectedFamily || ''} onChange={e => props.setSelectedFamily?.(e.target.value)} disabled={props.isGenerating}
                        className="w-full bg-slate-50 dark:bg-white/[0.03] border border-black/[0.06] dark:border-white/[0.06] px-2.5 py-2 rounded-lg text-xs font-medium outline-none appearance-none focus:border-indigo-500/40 transition-all cursor-pointer text-slate-700 dark:text-white/80">
                        {props.familyList.map(f => <option key={f} value={f}>{f}</option>)}
                      </select>
                      <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 dark:text-[#555] pointer-events-none" size={11} />
                    </div>
                    <button onClick={() => setIsDetailModalOpen(true)} disabled={props.isGenerating}
                      className="shrink-0 px-2 py-1.5 bg-slate-50 dark:bg-white/[0.03] border border-black/[0.06] dark:border-white/[0.06] rounded-lg text-[10px] font-medium text-slate-500 dark:text-slate-400 hover:text-indigo-500 dark:hover:text-indigo-400 hover:border-indigo-500/30 transition-all flex items-center gap-1" title="Chi tiết">
                      <List size={10} />
                    </button>
                  </div>
                </div>
              )}

              {/* VARIANTS */}
              {allVariants.length > 1 && (
                <div className="space-y-1">
                  <p className="text-[10px] font-semibold uppercase text-slate-500 dark:text-slate-400 tracking-wider px-0.5 flex items-center gap-1.5">
                    <GitBranch size={11} className="text-violet-400" /> Phiên bản {hasMoreVariants && <span className="text-[9px] text-slate-400 dark:text-slate-500 normal-case font-normal">({allVariants.length})</span>}
                  </p>
                  <div className="flex flex-wrap gap-1">
                    {visibleVariants.map(m => (
                      <Pill key={m._id} label={stripFamily(m.name)} active={props.selectedModelObj?._id === m._id} onClick={() => props.setSelectedModelObj(m)} disabled={props.isGenerating} />
                    ))}
                    {extraSelected && <Pill key={extraSelected._id} label={stripFamily(extraSelected.name)} active={true} onClick={() => props.setSelectedModelObj(extraSelected)} />}
                    {hasMoreVariants && (
                      <button onClick={() => setShowAllVariants(!showAllVariants)} className="px-1.5 py-1 text-[9px] font-medium text-slate-500 dark:text-[#888] hover:text-indigo-400 transition-colors">
                        {showAllVariants ? '↑ Thu gọn' : `+${allVariants.length - MAX_VARIANTS}`}
                      </button>
                    )}
                  </div>
                </div>
              )}

              {/* MODES — 3-item limit */}
              {modes.length > 0 && (() => {
                const MAX = 3;
                const isGroupExpanded = expandedGroups['modes'];
                const activeIdx = modes.findIndex(m => m === props.selectedMode);
                const visibleItems = isGroupExpanded ? modes : modes.slice(0, MAX);
                const activeOutside = !isGroupExpanded && activeIdx >= MAX;
                const hiddenCount = modes.length - MAX;
                return (
                  <div className="space-y-1">
                    <p className="text-[10px] font-semibold uppercase text-slate-500 dark:text-slate-400 tracking-wider px-0.5 flex items-center gap-1.5">
                      <SlidersHorizontal size={11} className="text-amber-400" /> Chế độ
                    </p>
                    <div className="flex flex-wrap gap-1">
                      {visibleItems.map(m => <Pill key={m} label={m} active={props.selectedMode === m} onClick={() => props.setSelectedMode(m)} disabled={props.isGenerating} />)}
                      {activeOutside && <Pill label={props.selectedMode} active={true} onClick={() => {}} disabled={props.isGenerating} />}
                      {hiddenCount > 0 && (
                        <button onClick={() => toggleGroup('modes')} className="px-1.5 py-1 text-[9px] font-medium text-slate-500 dark:text-[#888] hover:text-indigo-400 transition-colors">
                          {isGroupExpanded ? '↑ Thu gọn' : `+${hiddenCount}`}
                        </button>
                      )}
                    </div>
                  </div>
                );
              })()}

              {/* CONFIG ROW — Ratio + Resolution + Sound + Duration */}
              <div className="flex flex-wrap gap-x-4 gap-y-2">
                {/* Ratio — 3-item limit */}
                {(() => {
                  const MAX = 3;
                  const isGroupExpanded = expandedGroups['ratios'];
                  const activeIdx = ratios.findIndex(r => r === props.ratio);
                  const visibleItems = isGroupExpanded ? ratios : ratios.slice(0, MAX);
                  const activeOutside = !isGroupExpanded && activeIdx >= MAX;
                  const hiddenCount = ratios.length - MAX;
                  return (
                    <div className="space-y-0.5">
                      <p className="text-[9px] font-semibold uppercase text-slate-500 dark:text-slate-400 tracking-wider px-0.5 flex items-center gap-1">
                        <Ratio size={10} className="text-emerald-400" /> Tỷ lệ
                      </p>
                      <div className="flex flex-wrap gap-0.5">
                        {visibleItems.map(r => <Pill key={r} label={r} active={props.ratio === r} onClick={() => props.setRatio ? props.setRatio(r) : props.cycleRatio()} />)}
                        {activeOutside && <Pill label={props.ratio} active={true} onClick={() => {}} />}
                        {hiddenCount > 0 && (
                          <button onClick={() => toggleGroup('ratios')} className="px-1.5 py-0.5 text-[9px] font-medium text-slate-500 dark:text-[#888] hover:text-indigo-400 transition-colors">
                            {isGroupExpanded ? '↑' : `+${hiddenCount}`}
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })()}

                {/* Resolution — 3-item limit */}
                {(() => {
                  const MAX = 3;
                  const isGroupExpanded = expandedGroups['res'];
                  const activeIdx = resolutions.findIndex(r => r === props.resolution);
                  const visibleItems = isGroupExpanded ? resolutions : resolutions.slice(0, MAX);
                  const activeOutside = !isGroupExpanded && activeIdx >= MAX;
                  const hiddenCount = resolutions.length - MAX;
                  return (
                    <div className="space-y-0.5">
                      <p className="text-[9px] font-semibold uppercase text-slate-500 dark:text-slate-400 tracking-wider px-0.5 flex items-center gap-1">
                        <MonitorUp size={10} className="text-blue-400" /> P.Giải
                      </p>
                      <div className="flex flex-wrap gap-0.5">
                        {visibleItems.map(r => <Pill key={r} label={r} active={props.resolution === r} onClick={() => props.setResolution ? props.setResolution(r) : props.cycleResolution()} />)}
                        {activeOutside && <Pill label={props.resolution} active={true} onClick={() => {}} />}
                        {hiddenCount > 0 && (
                          <button onClick={() => toggleGroup('res')} className="px-1.5 py-0.5 text-[9px] font-medium text-slate-500 dark:text-[#888] hover:text-indigo-400 transition-colors">
                            {isGroupExpanded ? '↑' : `+${hiddenCount}`}
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })()}

                {/* Sound */}
                <div className="space-y-0.5">
                  <p className="text-[9px] font-semibold uppercase text-slate-500 dark:text-slate-400 tracking-wider px-0.5 flex items-center gap-1">
                    <Volume2 size={10} className="text-pink-400" /> Âm thanh
                  </p>
                  <Pill label={props.soundEnabled ? 'ON' : 'OFF'} active={props.soundEnabled} onClick={props.cycleSound} />
                </div>

                {/* Duration */}
                {!props.isModeBased && (
                  <div className="space-y-0.5">
                    <p className="text-[9px] font-semibold uppercase text-slate-500 dark:text-slate-400 tracking-wider px-0.5 flex items-center gap-1">
                      <Timer size={10} className="text-teal-400" /> Thời lượng
                    </p>
                    <Pill label={props.duration} active={true} onClick={props.cycleDuration} />
                  </div>
                )}
              </div>

              {/* QUANTITY (SINGLE) */}
              {props.activeMode === 'SINGLE' && (
                <div className="flex items-center gap-2">
                  <p className="text-[9px] font-semibold uppercase text-slate-500 dark:text-slate-400 tracking-wider flex items-center gap-1">
                    <Hash size={10} className="text-orange-400" /> SL
                  </p>
                  <div className="flex bg-black/[0.02] dark:bg-white/[0.02] rounded-md border border-black/[0.06] dark:border-white/[0.04] overflow-hidden">
                    {[1, 2, 3, 4].map(n => (
                      <button key={n} onClick={() => props.setQuantity(n)} className={`w-8 py-1 text-[10px] font-semibold transition-all ${props.quantity === n ? 'bg-indigo-500/15 text-indigo-500 dark:text-indigo-400' : 'text-slate-500 dark:text-[#888] hover:text-slate-700 dark:hover:text-white/70'}`}>{n}</button>
                    ))}
                  </div>
                </div>
              )}

              {/* MODEL INFO */}
              {props.selectedModelObj && (
                <p className="text-[9px] text-slate-400 dark:text-[#444] truncate px-0.5">
                  → {props.selectedModelObj.name} <span className="text-slate-400 dark:text-[#333]">({props.selectedModelObj.modelKey})</span>
                </p>
              )}
            </div>
          )}

          {/* ─── COST BAR ─── */}
          <div className="flex items-center justify-between pt-1 border-t border-black/[0.06] dark:border-white/[0.04]">
            <div className="flex items-center gap-2">
              <button onClick={() => props.setShowResourceModal(true)} className="p-1 text-slate-400 dark:text-slate-500 hover:text-indigo-400 transition-colors rounded-md hover:bg-black/[0.03] dark:hover:bg-white/[0.04]">
                <Settings size={12} />
              </button>
              <span className={`text-[11px] font-medium ${props.usagePreference === 'key' ? 'text-violet-500 dark:text-violet-400' : 'text-slate-600 dark:text-slate-400'}`}>
                {props.usagePreference === 'credits' ? `${props.credits.toLocaleString()} CR` : props.usagePreference === 'key' ? 'API Key' : '—'}
              </span>
            </div>
            <div className="flex items-center gap-1 text-amber-500/80">
              <Zap size={10} fill="currentColor" />
              <span className="text-[11px] font-semibold">{props.usagePreference === 'key' ? '0' : props.currentTotalCost}</span>
            </div>
          </div>
        </div>

        {/* ─── GENERATE BUTTON ─── */}
        <div className="px-4 pb-4">
          <div className="relative group/btn">
            <button
              onClick={props.handleGenerate}
              disabled={props.isGenerateDisabled}
              className={`w-full py-3.5 rounded-xl text-white font-semibold uppercase text-[11px] tracking-widest shadow-lg transition-all flex items-center justify-center gap-2.5 ${props.isGenerateDisabled
                ? 'bg-slate-200 dark:bg-white/[0.04] text-slate-400 dark:text-slate-600 cursor-not-allowed'
                : 'bg-gradient-to-r from-indigo-500 to-violet-500 hover:brightness-110 active:scale-[0.98] shadow-indigo-500/20'
                }`}
            >
              {props.isGenerating ? <Loader2 className="animate-spin" size={14} /> : <Video size={14} />}
              {props.activeMode === 'AUTO' ? `Chạy ${props.autoTasksCount} tác vụ` : props.activeMode === 'MULTI' ? `Tạo ${props.multiFramesCount} video` : 'Tạo Video'}
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

      {/* ─── DETAIL MODAL ─── */}
      <AnimatePresence>
        {isDetailModalOpen && (
          <ModelSelectorModal
            isOpen={isDetailModalOpen} onClose={() => setIsDetailModalOpen(false)}
            models={props.availableModels} selectedModelId={props.selectedModelObj?._id || ''}
            onSelect={(id) => {
              const model = props.availableModels.find(m => m._id === id);
              if (model) {
                props.setSelectedModelObj(model);
                const KNOWN = ['VEO', 'Kling', 'Hailuo', 'Grok', 'Sora', 'WAN', 'Wan', 'V-Fuse', 'OmniHuman', 'Seedance'];
                const name = model.name.trim();
                let fam = name.split(/\s*-\s/)[0].split(/\s+/)[0] || 'Other';
                for (const f of KNOWN) {
                  if (name.toLowerCase().startsWith(f.toLowerCase())) { fam = f; break; }
                }
                props.setSelectedFamily?.(fam);
              }
            }}
          />
        )}
      </AnimatePresence>
    </>
  );
};