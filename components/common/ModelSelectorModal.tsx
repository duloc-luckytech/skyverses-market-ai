
import React, { useState, useMemo } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X, Zap, Search, Check,
  Video, Image as ImageIcon, Layers, ChevronRight, ChevronDown
} from 'lucide-react';
import { PricingModel } from '../../apis/pricing';

/* =====================================================
   TYPES & CONFIG
===================================================== */
interface ModelSelectorModalProps {
  isOpen: boolean;
  onClose: () => void;
  models: PricingModel[];
  selectedModelId: string;
  onSelect: (id: string) => void;
}

const ENGINE_META: Record<string, { label: string; color: string }> = {
  gommo: { label: 'Gommo', color: 'bg-violet-500/10 text-violet-500 border-violet-500/20' },
  fxlab: { label: 'FxLab', color: 'bg-sky-500/10 text-sky-500 border-sky-500/20' },
  wan: { label: 'Wan', color: 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' },
};

/** Trích xuất tên family từ model name.
 *  "Kling - 1.6 - 10s" → "Kling"
 *  "VEO 3.1 - HOT" → "VEO"
 *  "Hailuo 2.3" → "Hailuo"
 *  "Grok Video - Heavy" → "Grok"
 *  "Sora 2" → "Sora"
 *  "V-Fuse  - 1.0" → "V-Fuse"
 *  "OmniHuman 1.5" → "OmniHuman"
 *  "Seedance 2.0 - Omni" → "Seedance"
 *  "Wan 2.2 Animate" → "Wan"
 */
function extractFamily(name: string): string {
  // Normalize: trim and unify separators
  const n = name.trim();
  // Try matching known patterns: "Word" or "Word-Word" before a separator like " - ", digit, space+digit
  // Split by " - " first
  const dashParts = n.split(/\s*-\s*/);
  const first = dashParts[0].trim();
  // Take the first word(s) that form the family name
  // Handle "V-Fuse" → starts with V- then next segment already split. Actually "V-Fuse" splits into ["V", "Fuse", ...]
  // So we need a different approach for hyphenated names

  // Known family prefixes to match exactly
  const KNOWN_FAMILIES = [
    'VEO', 'Kling', 'Hailuo', 'Grok', 'Sora', 'WAN', 'Wan',
    'V-Fuse', 'OmniHuman', 'Seedance', 'Bytedance'
  ];

  for (const fam of KNOWN_FAMILIES) {
    if (n.toLowerCase().startsWith(fam.toLowerCase())) {
      return fam;
    }
  }

  // Fallback: take first word
  const firstWord = first.split(/\s+/)[0];
  return firstWord || 'Other';
}

const FAMILY_COLORS: Record<string, string> = {
  'VEO': 'bg-blue-500',
  'Kling': 'bg-purple-500',
  'Hailuo': 'bg-orange-500',
  'Grok': 'bg-red-500',
  'Sora': 'bg-pink-500',
  'WAN': 'bg-teal-500',
  'Wan': 'bg-teal-500',
  'V-Fuse': 'bg-cyan-500',
  'OmniHuman': 'bg-amber-500',
  'Seedance': 'bg-lime-500',
};

/* =====================================================
   MAIN COMPONENT
===================================================== */
export const ModelSelectorModal: React.FC<ModelSelectorModalProps> = ({
  isOpen, onClose, models, selectedModelId, onSelect
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  // All families start collapsed; we track which are EXPANDED
  const [expandedFamilies, setExpandedFamilies] = useState<Set<string>>(new Set());

  // Group models by engine
  const engineGroups = useMemo(() => {
    const groups: Record<string, PricingModel[]> = {};
    models.forEach(m => {
      const key = (m.engine || 'other').toLowerCase();
      if (!groups[key]) groups[key] = [];
      groups[key].push(m);
    });
    return groups;
  }, [models]);

  const sortedEngines = useMemo(() => Object.keys(engineGroups).sort(), [engineGroups]);

  const initialEngine = useMemo(() => {
    if (selectedModelId) {
      const current = models.find(m => m._id === selectedModelId);
      if (current) return (current.engine || 'other').toLowerCase();
    }
    return sortedEngines[0] || '';
  }, [selectedModelId, models, sortedEngines]);

  const [activeEngine, setActiveEngine] = useState<string>(initialEngine);

  // Filter + group by family
  const familyGroups = useMemo(() => {
    let result = engineGroups[activeEngine] || [];
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      result = result.filter(m =>
        m.name.toLowerCase().includes(q) ||
        m.modelKey.toLowerCase().includes(q) ||
        (m.modes || []).some(mode => mode.toLowerCase().includes(q))
      );
    }
    // Group by family
    const families: Record<string, PricingModel[]> = {};
    result.forEach(m => {
      const fam = extractFamily(m.name);
      if (!families[fam]) families[fam] = [];
      families[fam].push(m);
    });
    // Sort families: larger groups first, then alphabetically
    return Object.entries(families).sort(([a, aModels], [b, bModels]) => {
      if (bModels.length !== aModels.length) return bModels.length - aModels.length;
      return a.localeCompare(b);
    });
  }, [engineGroups, activeEngine, searchQuery]);

  const totalFiltered = useMemo(() => familyGroups.reduce((sum, [, ms]) => sum + ms.length, 0), [familyGroups]);

  // Auto-expand family of selected model on first render
  React.useEffect(() => {
    if (selectedModelId) {
      const current = models.find(m => m._id === selectedModelId);
      if (current) {
        const fam = extractFamily(current.name);
        setExpandedFamilies(new Set([fam]));
      }
    }
  }, []);

  const toggleFamily = (fam: string) => {
    setExpandedFamilies(prev => {
      const next = new Set(prev);
      if (next.has(fam)) next.delete(fam); else next.add(fam);
      return next;
    });
  };

  if (!isOpen) return null;

  return createPortal(
    <div className="fixed inset-0 z-[2000] flex items-center justify-center p-4 md:p-8">
      <motion.div
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        className="absolute inset-0 bg-black/80 backdrop-blur-lg"
        onClick={onClose}
      />

      <motion.div
        initial={{ scale: 0.96, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.96, opacity: 0, y: 20 }}
        transition={{ type: 'spring', damping: 30, stiffness: 300 }}
        className="relative w-full max-w-4xl max-h-[82vh] bg-white dark:bg-[#0e0e11] border border-slate-200 dark:border-white/10 rounded-2xl overflow-hidden shadow-2xl flex flex-col md:flex-row"
      >
        {/* ======= LEFT: ENGINE TABS ======= */}
        <aside className="w-full md:w-48 shrink-0 border-b md:border-b-0 md:border-r border-slate-200 dark:border-white/[0.06] bg-slate-50 dark:bg-black/30 flex md:flex-col">
          <div className="hidden md:flex items-center gap-2.5 px-4 py-3.5 border-b border-slate-200 dark:border-white/[0.06]">
            <Layers size={14} className="text-violet-500" />
            <span className="text-xs font-bold text-slate-900 dark:text-white">Chọn Model</span>
          </div>
          <div className="flex md:flex-col overflow-x-auto md:overflow-y-auto md:flex-grow no-scrollbar p-2 gap-1">
            {sortedEngines.map(engKey => {
              const meta = ENGINE_META[engKey] || { label: engKey.charAt(0).toUpperCase() + engKey.slice(1), color: 'bg-slate-500/10 text-slate-500 border-slate-500/20' };
              const isActive = activeEngine === engKey;
              const count = engineGroups[engKey]?.length || 0;
              return (
                <button
                  key={engKey}
                  onClick={() => { setActiveEngine(engKey); setSearchQuery(''); }}
                  className={`flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl transition-all shrink-0 ${isActive
                    ? 'bg-white dark:bg-white/10 border border-slate-200 dark:border-white/10 shadow-md text-slate-900 dark:text-white'
                    : 'text-slate-500 hover:text-slate-800 dark:hover:text-white hover:bg-white/50 dark:hover:bg-white/5 border border-transparent'
                    }`}
                >
                  <span className="text-[11px] font-bold">{meta.label}</span>
                  <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded border ${meta.color}`}>{count}</span>
                  {isActive && <ChevronRight size={12} className="hidden md:block ml-auto text-violet-500" />}
                </button>
              );
            })}
          </div>
        </aside>

        {/* ======= RIGHT: MODELS LIST ======= */}
        <main className="flex-grow flex flex-col min-w-0 overflow-hidden">
          {/* Search + Close */}
          <div className="shrink-0 flex items-center gap-3 px-5 py-3 border-b border-slate-200 dark:border-white/[0.06]">
            <div className="relative flex-grow">
              <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text" value={searchQuery} onChange={e => setSearchQuery(e.target.value)}
                placeholder="Tìm model, key..."
                className="w-full bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-lg pl-9 pr-4 py-2 text-xs outline-none focus:border-violet-500 text-slate-800 dark:text-white transition-all"
                autoFocus
              />
            </div>
            <button onClick={onClose} className="p-2 text-slate-400 hover:text-red-500 rounded-lg hover:bg-red-50 dark:hover:bg-red-500/10 transition-all"><X size={18} /></button>
          </div>

          {/* Model cards grouped by family */}
          <div className="flex-grow overflow-y-auto no-scrollbar p-4 space-y-3">
            {familyGroups.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 opacity-40">
                <Search size={32} className="mb-3" />
                <p className="text-sm font-medium">Không tìm thấy model</p>
              </div>
            ) : (
              familyGroups.map(([family, familyModels]) => {
                const isExpanded = expandedFamilies.has(family);
                const familyColor = FAMILY_COLORS[family] || 'bg-slate-500';
                const hasSelected = familyModels.some(m => m._id === selectedModelId);
                // Aggregate info for collapsed preview
                const allModes = [...new Set(familyModels.flatMap(m => m.modes || []))];
                const allResolutions = [...new Set(familyModels.flatMap(m => Object.keys(m.pricing || {})))];
                const allPrices: number[] = [];
                familyModels.forEach(m => Object.values(m.pricing || {}).forEach(res => Object.values(res).forEach(p => allPrices.push(p as number))));
                const familyPriceRange = allPrices.length > 0 ? (Math.min(...allPrices) === Math.max(...allPrices) ? `${Math.min(...allPrices)} CR` : `${Math.min(...allPrices)}–${Math.max(...allPrices)} CR`) : null;
                return (
                  <div key={family} className={`rounded-xl border overflow-hidden transition-all ${hasSelected ? 'border-violet-500/30 shadow-sm' : 'border-slate-200 dark:border-white/[0.06]'}`}>
                    {/* Family header — shows summary info */}
                    <button
                      onClick={() => toggleFamily(family)}
                      className={`w-full flex items-center gap-3 px-4 py-3 transition-colors ${isExpanded ? 'bg-slate-100 dark:bg-white/[0.04]' : 'bg-slate-50 dark:bg-white/[0.02] hover:bg-slate-100 dark:hover:bg-white/[0.04]'}`}
                    >
                      <div className={`w-2.5 h-2.5 rounded-full shrink-0 ${familyColor}`}></div>
                      <div className="flex-grow min-w-0 text-left">
                        <div className="flex items-center gap-2 mb-0.5">
                          <span className="text-xs font-bold text-slate-900 dark:text-white">{family}</span>
                          <span className="text-[9px] text-slate-400 font-medium">{familyModels.length} variants</span>
                          {hasSelected && <span className="text-[8px] font-bold text-violet-500 bg-violet-500/10 px-2 py-0.5 rounded-full border border-violet-500/20">✓ Đang chọn</span>}
                        </div>
                        {/* Preview tags on collapsed state */}
                        {!isExpanded && (
                          <div className="flex flex-wrap gap-1">
                            {allModes.slice(0, 4).map(m => (
                              <span key={m} className="px-1.5 py-0.5 rounded text-[7px] font-bold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">{m}</span>
                            ))}
                            {allResolutions.slice(0, 3).map(r => (
                              <span key={r} className="px-1.5 py-0.5 rounded text-[7px] font-bold bg-slate-100 dark:bg-white/5 text-slate-500 border border-slate-200 dark:border-white/10">{r}</span>
                            ))}
                            {familyPriceRange && (
                              <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded text-[7px] font-bold bg-orange-500/10 text-orange-500 border border-orange-500/20">
                                <Zap size={7} fill="currentColor" />{familyPriceRange}
                              </span>
                            )}
                          </div>
                        )}
                      </div>
                      <ChevronDown size={14} className={`shrink-0 text-slate-400 transition-transform ${isExpanded ? '' : '-rotate-90'}`} />
                    </button>

                    {/* Family models — only when expanded */}
                    {isExpanded && (
                      <div className="divide-y divide-slate-100 dark:divide-white/[0.04]">
                        {familyModels.map((model) => {
                          const isSelected = selectedModelId === model._id;
                          const prices: number[] = [];
                          Object.values(model.pricing || {}).forEach(res => {
                            Object.values(res).forEach(p => prices.push(p as number));
                          });
                          const minPrice = prices.length > 0 ? Math.min(...prices) : 0;
                          const maxPrice = prices.length > 0 ? Math.max(...prices) : 0;
                          const resolutions = Object.keys(model.pricing || {});

                          return (
                            <button
                              key={model._id}
                              onClick={() => { onSelect(model._id); onClose(); }}
                              className={`w-full text-left px-4 py-3 transition-all group ${isSelected
                                ? 'bg-violet-50 dark:bg-violet-500/5'
                                : 'hover:bg-slate-50/80 dark:hover:bg-white/[0.015]'
                                }`}
                            >
                              <div className="flex items-center gap-3">
                                {/* Selected indicator */}
                                {isSelected ? (
                                  <div className="shrink-0 w-5 h-5 bg-violet-500 rounded-md flex items-center justify-center"><Check size={11} className="text-white" /></div>
                                ) : (
                                  <div className="shrink-0 w-5 h-5 border-2 border-slate-200 dark:border-white/10 rounded-md group-hover:border-violet-500/40 transition-colors"></div>
                                )}

                                {/* Info */}
                                <div className="flex-grow min-w-0">
                                  <div className="flex items-center gap-2 mb-1">
                                    <span className="text-xs font-semibold text-slate-900 dark:text-white truncate">{model.name}</span>
                                    <span className="text-[9px] text-slate-400 font-mono shrink-0">{model.modelKey}</span>
                                  </div>
                                  {/* Tags row */}
                                  <div className="flex flex-wrap gap-1">
                                    {/* Tool */}
                                    <span className={`inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded text-[7px] font-bold uppercase border ${model.tool === 'video' ? 'bg-purple-500/10 text-purple-500 border-purple-500/20' : 'bg-sky-500/10 text-sky-500 border-sky-500/20'}`}>
                                      {model.tool === 'video' ? <Video size={7} /> : <ImageIcon size={7} />}
                                      {model.tool}
                                    </span>
                                    {/* Modes */}
                                    {model.modes && model.modes.length > 0 && model.modes.slice(0, 3).map(m => (
                                      <span key={m} className="px-1.5 py-0.5 rounded text-[7px] font-bold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">{m}</span>
                                    ))}
                                    {model.modes && model.modes.length > 3 && (
                                      <span className="px-1.5 py-0.5 rounded text-[7px] font-bold bg-slate-100 dark:bg-white/5 text-slate-400 border border-slate-200 dark:border-white/10">+{model.modes.length - 3}</span>
                                    )}
                                    {/* Resolutions */}
                                    {resolutions.map(r => (
                                      <span key={r} className="px-1.5 py-0.5 rounded text-[7px] font-bold bg-slate-100 dark:bg-white/5 text-slate-500 border border-slate-200 dark:border-white/10">{r}</span>
                                    ))}
                                    {/* Aspect Ratios */}
                                    {model.aspectRatios && model.aspectRatios.length > 0 && model.aspectRatios.slice(0, 3).map(ar => (
                                      <span key={ar} className="px-1.5 py-0.5 rounded text-[7px] font-bold bg-indigo-500/10 text-indigo-500 border border-indigo-500/20">{ar}</span>
                                    ))}
                                    {model.aspectRatios && model.aspectRatios.length > 3 && (
                                      <span className="px-1.5 py-0.5 rounded text-[7px] font-bold bg-slate-100 dark:bg-white/5 text-slate-400 border border-slate-200 dark:border-white/10">+{model.aspectRatios.length - 3}</span>
                                    )}
                                  </div>
                                </div>

                                {/* Price */}
                                <div className="shrink-0 flex items-center gap-1 px-2.5 py-1.5 bg-orange-500/10 rounded-lg border border-orange-500/20">
                                  <Zap size={9} className="text-orange-500" fill="currentColor" />
                                  <span className="text-[9px] font-bold text-orange-500 whitespace-nowrap">
                                    {minPrice === maxPrice ? `${minPrice}` : `${minPrice}–${maxPrice}`}
                                  </span>
                                </div>
                              </div>
                            </button>
                          );
                        })}
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>

          {/* Footer */}
          <div className="shrink-0 px-5 py-2 border-t border-slate-200 dark:border-white/[0.06] bg-slate-50 dark:bg-black/30 flex items-center justify-between">
            <span className="text-[10px] text-slate-400 font-medium">{totalFiltered} models · {familyGroups.length} families</span>
            <span className="text-[10px] text-slate-400 font-medium">{activeEngine.toUpperCase()}</span>
          </div>
        </main>
      </motion.div>
    </div>,
    document.body
  );
};
