import { useState, useEffect, useMemo } from 'react';
import { pricingApi, PricingModel } from '../apis/pricing';

export const KNOWN_VIDEO_FAMILIES = [
  'VEO', 'Kling', 'Hailuo', 'Grok', 'Sora',
  'WAN', 'Wan', 'V-Fuse', 'OmniHuman', 'Seedance',
];

export const extractVideoFamily = (name: string): string => {
  const n = name.trim();
  for (const fam of KNOWN_VIDEO_FAMILIES) {
    if (n.toLowerCase().startsWith(fam.toLowerCase())) return fam;
  }
  return n.split(/\s*-\s/)[0].split(/\s+/)[0] || 'Other';
};

const DURATION_PRESETS = ['5s', '8s', '10s'] as const;

/**
 * Shared hook for loading and managing video AI models.
 * Used by StoryboardStudio SettingsTab, AIVideoGeneratorWorkspace, RealEstateVisualWorkspace, etc.
 *
 * @param engine  — server engine key, e.g. 'gommo'
 * @param defaultModelKey — optional modelKey to pre-select on load
 */
export const useVideoModels = (engine: string, defaultModelKey?: string) => {
  const [models, setModels] = useState<PricingModel[]>([]);
  const [selectedModelObj, setSelectedModelObj] = useState<PricingModel | null>(null);
  const [selectedFamily, setSelectedFamily] = useState('');
  const [selectedMode, setSelectedMode] = useState('');
  const [ratio, setRatio] = useState('16:9');
  const [resolution, setResolution] = useState('720p');
  const [duration, setDuration] = useState('5s');
  const [soundEnabled, setSoundEnabled] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // ── Fetch models whenever engine changes ───────────────────────────────────
  useEffect(() => {
    setModels([]);
    setSelectedModelObj(null);

    const fetchPricing = async () => {
      setIsLoading(true);
      try {
        const res = await pricingApi.getPricing({ tool: 'video', engine });
        if (res.success && res.data.length > 0) {
          const list: PricingModel[] = res.data;
          setModels(list);

          const first =
            (defaultModelKey ? list.find(m => m.modelKey === defaultModelKey) : null) ?? list[0];
          setSelectedModelObj(first);
          setSelectedFamily(extractVideoFamily(first.name));

          // Init resolution from pricing keys
          const resList = Object.keys(first.pricing || {}).filter(k => k !== 'auto');
          if (resList.length > 0) setResolution(resList[0]);

          // Init ratio
          if (first.aspectRatios?.length) setRatio(first.aspectRatios[0]);

          // Init mode
          if (first.modes?.length) setSelectedMode(first.modes[0]);
        }
      } catch (err) {
        console.error('[useVideoModels] Failed to fetch pricing:', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchPricing();
  }, [engine]);

  // ── Derived: family groupings ──────────────────────────────────────────────
  const families = useMemo(() => {
    const groups: Record<string, PricingModel[]> = {};
    models.forEach(m => {
      const fam = extractVideoFamily(m.name);
      if (!groups[fam]) groups[fam] = [];
      groups[fam].push(m);
    });
    return groups;
  }, [models]);

  const familyList        = useMemo(() => Object.keys(families).sort(), [families]);
  const familyModels      = useMemo(() => families[selectedFamily] || [], [families, selectedFamily]);
  const familyModes       = useMemo(() => [...new Set(familyModels.flatMap(m => m.modes || []))], [familyModels]);
  const familyResolutions = useMemo(() => [...new Set(familyModels.flatMap(m => Object.keys(m.pricing || {})))], [familyModels]);
  const familyRatios      = useMemo(
    () => [...new Set(familyModels.flatMap(m => m.aspectRatios || []))].filter(Boolean),
    [familyModels],
  );

  // ── Auto-sync mode/ratio/resolution when family changes ───────────────────
  useEffect(() => {
    if (familyModes.length > 0 && !familyModes.includes(selectedMode))
      setSelectedMode(familyModes[0]);
    if (familyResolutions.length > 0 && !familyResolutions.includes(resolution))
      setResolution(familyResolutions[0]);
    if (familyRatios.length > 0 && !familyRatios.includes(ratio))
      setRatio(familyRatios[0]);
  }, [selectedFamily, familyModes, familyResolutions, familyRatios]);

  // ── Auto-select best model variant when family/mode/res changes ───────────
  useEffect(() => {
    if (familyModels.length === 0) return;
    let best = familyModels.find(
      m => (m.modes || []).includes(selectedMode) && m.pricing?.[resolution?.toLowerCase()],
    );
    if (!best) best = familyModels.find(m => (m.modes || []).includes(selectedMode));
    if (!best) best = familyModels.find(m => m.pricing?.[resolution?.toLowerCase()]);
    if (!best) best = familyModels[0];
    if (best && best._id !== selectedModelObj?._id) setSelectedModelObj(best);
  }, [selectedFamily, selectedMode, resolution, familyModels]);

  // ── Duration cycle (5s → 8s → 10s → 5s) ──────────────────────────────────
  const cycleDuration = () => {
    setDuration(prev => {
      const idx = DURATION_PRESETS.indexOf(prev as typeof DURATION_PRESETS[number]);
      return DURATION_PRESETS[(idx + 1) % DURATION_PRESETS.length];
    });
  };

  // ── Cost ──────────────────────────────────────────────────────────────────
  const selectedModelCost = useMemo(() => {
    if (!selectedModelObj?.pricing) return 50;
    const resKey = resolution || Object.keys(selectedModelObj.pricing)[0];
    const resPricing = selectedModelObj.pricing[resKey];
    if (!resPricing) return 50;
    if (typeof resPricing === 'number') return resPricing;
    const modeKey = selectedMode || Object.keys(resPricing)[0];
    return (resPricing as Record<string, number>)[modeKey] ?? 50;
  }, [selectedModelObj, resolution, selectedMode]);

  const isModeBased = familyModes.length > 0;

  return {
    // raw list
    models,
    isLoading,
    // model selection
    selectedModelObj, setSelectedModelObj,
    // family
    selectedFamily, setSelectedFamily,
    familyList, familyModels,
    // mode
    selectedMode, setSelectedMode,
    familyModes,
    // ratio / resolution
    ratio, setRatio,
    resolution, setResolution,
    familyResolutions, familyRatios,
    // duration / sound
    duration, cycleDuration,
    soundEnabled, setSoundEnabled,
    // derived
    isModeBased,
    selectedModelCost,
  };
};
