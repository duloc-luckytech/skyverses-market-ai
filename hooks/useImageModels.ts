import { useState, useEffect, useMemo } from 'react';
import { pricingApi, PricingModel } from '../apis/pricing';

export interface MappedImageModel {
  id: string;   // _id from DB
  name: string;
  raw: PricingModel;
}

const KNOWN_IMAGE_FAMILIES = ['Nano Banana', 'Banana', 'Seedream', 'Seedance', 'Midjourney', 'Imagen', 'Z-Image', 'Kling', 'IMAGE O1', 'Nâng cấp'];

export const extractImageFamily = (name: string): string => {
  const n = name.trim();
  for (const fam of KNOWN_IMAGE_FAMILIES) {
    if (n.toLowerCase().startsWith(fam.toLowerCase())) return fam;
  }
  return n.split(/\s*-\s/)[0].split(/\s+\d/)[0] || 'Other';
};

export const getResolutionsFromPricing = (pricing: Record<string, any> | undefined): string[] => {
  if (!pricing) return [];
  return Object.keys(pricing).filter(k => k !== 'auto');
};

/**
 * Shared hook for loading and managing image models.
 * Used by both AI Image Generator page and ProductImageWorkspace modal.
 */
export const useImageModels = (engine: string, defaultModelKey?: string) => {
  const [availableModels, setAvailableModels] = useState<MappedImageModel[]>([]);
  const [selectedModel, setSelectedModel] = useState<MappedImageModel | null>(null);
  const [selectedFamily, setSelectedFamily] = useState('');
  const [selectedMode, setSelectedMode] = useState('');
  const [selectedRatio, setSelectedRatio] = useState('');
  const [selectedRes, setSelectedRes] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Fetch models when engine changes
  useEffect(() => {
    const fetchModels = async () => {
      setIsLoading(true);
      try {
        const res = await pricingApi.getPricing({ tool: 'image', engine });
        if (res.success && res.data.length > 0) {
          const mapped: MappedImageModel[] = res.data.map((m: PricingModel) => ({
            id: m._id,
            name: m.name,
            raw: m,
          }));
          setAvailableModels(mapped);
          const defaultModel = mapped.find(m => m.raw.modelKey === (defaultModelKey || 'google_image_gen_banana_pro')) || mapped[0];
          setSelectedModel(defaultModel);

          const resOptions = getResolutionsFromPricing(defaultModel.raw.pricing);
          if (resOptions.length > 0) setSelectedRes(resOptions[0]);
          if (defaultModel.raw.aspectRatios?.length) setSelectedRatio(defaultModel.raw.aspectRatios[0]);
          if (defaultModel.raw.modes?.length) setSelectedMode(defaultModel.raw.modes[0]);
        } else {
          setAvailableModels([]);
          setSelectedModel(null);
        }
      } catch (error) {
        console.error('Failed to fetch image models:', error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchModels();
  }, [engine]);

  // Family grouping
  const families = useMemo(() => {
    const groups: Record<string, MappedImageModel[]> = {};
    availableModels.forEach(m => {
      const fam = extractImageFamily(m.name);
      if (!groups[fam]) groups[fam] = [];
      groups[fam].push(m);
    });
    return groups;
  }, [availableModels]);

  const familyList = useMemo(() => Object.keys(families).sort(), [families]);
  const familyModels = useMemo(() => families[selectedFamily] || [], [families, selectedFamily]);
  const familyModes = useMemo(() => [...new Set(familyModels.flatMap(m => m.raw.modes || []))], [familyModels]);
  const familyResolutions = useMemo(() => [...new Set(familyModels.flatMap(m => Object.keys(m.raw.pricing || {})))], [familyModels]);
  const familyRatios = useMemo(() => [...new Set(familyModels.flatMap(m => m.raw.aspectRatios || []))].filter(r => r && r !== 'auto'), [familyModels]);

  // Set initial family when models load
  useEffect(() => {
    if (familyList.length > 0 && !selectedFamily) {
      const defaultFam = selectedModel?.raw ? extractImageFamily(selectedModel.raw.name) : familyList[0];
      setSelectedFamily(defaultFam || familyList[0]);
    }
  }, [familyList, selectedModel]);

  // Auto-resolve best model from family
  useEffect(() => {
    if (familyModels.length === 0) return;
    const currentRaw = selectedModel?.raw;
    let best = familyModels.find(m => (m.raw.modes || []).includes(selectedMode) && m.raw.pricing?.[selectedRes?.toLowerCase()]);
    if (!best) best = familyModels.find(m => (m.raw.modes || []).includes(selectedMode));
    if (!best) best = familyModels.find(m => m.raw.pricing?.[selectedRes?.toLowerCase()]);
    if (!best) best = familyModels[0];
    if (best && best.id !== currentRaw?._id) {
      setSelectedModel(best);
    }
  }, [selectedFamily, selectedMode, selectedRes, familyModels]);

  // Reset mode/ratio/resolution when family changes
  useEffect(() => {
    if (familyModes.length > 0 && !familyModes.includes(selectedMode)) setSelectedMode(familyModes[0]);
    if (familyResolutions.length > 0 && !familyResolutions.includes(selectedRes)) setSelectedRes(familyResolutions[0]);
    if (familyRatios.length > 0 && !familyRatios.includes(selectedRatio)) setSelectedRatio(familyRatios[0]);
  }, [selectedFamily, familyModes, familyResolutions, familyRatios]);

  // Compute cost from selected model
  const selectedModelCost = useMemo(() => {
    if (!selectedModel?.raw?.pricing) return 150;
    const resKey = selectedRes || Object.keys(selectedModel.raw.pricing)[0];
    const resPricing = selectedModel.raw.pricing[resKey];
    if (!resPricing) return 150;
    const modeKey = selectedMode || Object.keys(resPricing)[0];
    return resPricing[modeKey] || 150;
  }, [selectedModel, selectedRes, selectedMode]);

  return {
    availableModels, selectedModel, setSelectedModel,
    selectedFamily, setSelectedFamily,
    selectedMode, setSelectedMode,
    selectedRatio, setSelectedRatio,
    selectedRes, setSelectedRes,
    isLoading,
    families, familyList, familyModels, familyModes, familyResolutions, familyRatios,
    selectedModelCost,
  };
};
