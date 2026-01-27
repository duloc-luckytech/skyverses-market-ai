import React, { useState, useRef, useEffect } from 'react';
import { generateDemoImage } from '../services/gemini';
import { useAuth } from '../context/AuthContext';

export type Gender = 'Male' | 'Female';

export interface UserItem {
  id: string;
  url: string;
  name: string;
}

export interface StylistState {
  gender: Gender;
  selectedOutfit: string | null;
  selectedBottom: string | null;
  selectedOuterwear: string | null;
  selectedTops: string | null;
  selectedSets: string | null;
  selectedSocks: string | null;
  selectedShoes: string | null;
  selectedAccessories: string | null;
  selectedBg: string | null;
  selectedPose: string | null;
  userPhoto: string | null;
  isGenerating: boolean;
  hasResult: boolean;
  history: string[];
  activeHistoryIndex: number | null;
  openAccordions: string[];
  usagePreference: 'credits' | 'key';
  userItems: Record<string, UserItem[]>;
  showTutorial: boolean;
  isTemplateModalOpen: boolean;
}

export const useAIStylist = () => {
  const { credits, useCredits, isAuthenticated, login } = useAuth();
  
  const [state, setState] = useState<StylistState>({
    gender: 'Male',
    selectedOutfit: null,
    selectedBottom: null,
    selectedOuterwear: null,
    selectedTops: null,
    selectedSets: null,
    selectedSocks: null,
    selectedShoes: null,
    selectedAccessories: null,
    selectedBg: null,
    selectedPose: null,
    userPhoto: null,
    // Fixed: removed duplicate isGenerating key
    isGenerating: false,
    hasResult: false,
    history: [],
    activeHistoryIndex: null,
    openAccordions: ['selectedOutfit', 'background', 'pose'],
    usagePreference: (localStorage.getItem('skyverses_usage_preference') as any) || 'credits',
    userItems: {},
    showTutorial: false,
    isTemplateModalOpen: false,
  });

  const [hasPersonalKey, setHasPersonalKey] = useState(false);
  const [personalKey, setPersonalKey] = useState<string | undefined>(undefined);
  const [showResourceModal, setShowResourceModal] = useState(false);
  const [showLowCreditAlert, setShowLowCreditAlert] = useState(false);
  
  const GEN_COST = 100;

  useEffect(() => {
    const vault = localStorage.getItem('skyverses_model_vault');
    if (vault) {
      try {
        const keys = JSON.parse(vault);
        setHasPersonalKey(!!(keys.gemini && keys.gemini.trim() !== ''));
        setPersonalKey(keys.gemini);
      } catch (e) { setHasPersonalKey(false); }
    }

    const hasSeenTutorial = localStorage.getItem('skyverses_stylist_tutorial_seen');
    if (!hasSeenTutorial) {
      setState(prev => ({ ...prev, showTutorial: true }));
    }
  }, [showResourceModal]);

  const closeTutorial = () => {
    localStorage.setItem('skyverses_stylist_tutorial_seen', 'true');
    setState(prev => ({ ...prev, showTutorial: false }));
  };

  const openTutorial = () => {
    setState(prev => ({ ...prev, showTutorial: true }));
  };

  const fileInputRef = useRef<HTMLInputElement>(null);

  const toggleAccordion = (id: string) => {
    setState(prev => ({
      ...prev,
      openAccordions: prev.openAccordions.includes(id) 
        ? prev.openAccordions.filter(a => a !== id) 
        : [...prev.openAccordions, id]
    }));
  };

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setState(prev => ({ ...prev, userPhoto: reader.result as string, hasResult: false }));
        if (e.target) e.target.value = ''; 
      };
      reader.readAsDataURL(file);
    }
  };

  const useAsReference = (url: string) => {
    setState(prev => ({
      ...prev,
      userPhoto: url,
      hasResult: false,
      activeHistoryIndex: null
    }));
  };

  const handleGenerate = async (categoryData: Record<string, any[]>) => {
    if (!state.userPhoto || state.isGenerating) return;
    if (!isAuthenticated) { login(); return; }

    if (state.usagePreference === 'credits' && credits < GEN_COST) {
      setShowLowCreditAlert(true);
      return;
    }

    setState(prev => ({ ...prev, isGenerating: true, hasResult: false }));
    
    try {
      if (state.usagePreference === 'credits') {
        const successful = useCredits(GEN_COST);
        if (!successful) throw new Error("Insufficient credits");
      }

      const inputImages: string[] = [state.userPhoto!];
      let referencePrompt = "Image 1 is the reference person. ";

      const clothingItemUrls: string[] = [];
      const clothingNames: string[] = [];
      
      if (state.selectedOutfit) {
        const item = categoryData.selectedOutfit.find(i => i.id === state.selectedOutfit);
        if (item) {
          clothingItemUrls.push(item.url);
          clothingNames.push(item.name);
        }
      } else {
        const clothesKeys = ['selectedOuterwear', 'selectedTops', 'selectedSets', 'selectedBottom', 'selectedSocks', 'selectedShoes', 'selectedAccessories'];
        clothesKeys.forEach(key => {
          const id = (state as any)[key];
          if (id) {
            const item = categoryData[key]?.find(i => i.id === id);
            if (item) {
              clothingItemUrls.push(item.url);
              clothingNames.push(item.name);
            }
          }
        });
      }

      clothingItemUrls.forEach((url, index) => {
        inputImages.push(url);
        referencePrompt += `Image ${index + 2} is the exact clothing item the person must wear. `;
      });

      const bgItem = categoryData.background?.find(i => i.id === state.selectedBg);
      if (bgItem) {
        inputImages.push(bgItem.url);
        referencePrompt += `Image ${inputImages.length} is the mandatory background environment. `;
      }
      
      const poseItem = categoryData.pose?.find(i => i.id === state.selectedPose);
      if (poseItem) {
        inputImages.push(poseItem.url);
        referencePrompt += `Image ${inputImages.length} is the mandatory pose for the person. `;
      }

      const clothingDescription = clothingNames.length > 0 
        ? `wearing exactly the clothing items shown in the reference images: ${clothingNames.join(', ')}` 
        : "wearing high-end fashion designer apparel";

      const finalPrompt = `${referencePrompt}
      High-end professional fashion editorial photography. 
      STRICT IDENTITY LOCK: The person from Image 1 must remain 100% IDENTICAL in terms of facial features, ethnicity, hair, and body type.
      ACTION: The person is now ${clothingDescription}. 
      VISUAL MATCHING: You must exactly replicate the colors, textures, and designs of the clothing provided in the reference images.
      ${poseItem ? `POSE: Mimic the exact body position and posture from the pose reference image.` : 'POSE: Natural fashion model pose.'}
      ${bgItem ? `SETTING: The person is standing at ${bgItem.name}.` : 'SETTING: In a professional minimal studio.'}
      Cinematic lighting, sharp focus on fabric textures, 8k resolution, photorealistic quality.`;

      const result = await generateDemoImage({
        prompt: finalPrompt,
        images: inputImages,
        model: 'gemini-2.5-flash-image',
        apiKey: state.usagePreference === 'key' ? personalKey : undefined
      });

      if (result) {
        setState(prev => {
          const newHistory = [...prev.history, result];
          return { 
            ...prev, 
            isGenerating: false, 
            hasResult: true, 
            history: newHistory,
            activeHistoryIndex: newHistory.length - 1,
            selectedOutfit: null,
            selectedBottom: null,
            selectedOuterwear: null,
            selectedTops: null,
            selectedSets: null,
            selectedSocks: null,
            selectedShoes: null,
            selectedAccessories: null,
            selectedBg: null,
            selectedPose: null,
          };
        });
      } else {
        throw new Error("Failed to generate image");
      }
    } catch (error) {
      console.error("AI Styling Error:", error);
      setState(prev => ({ ...prev, isGenerating: false }));
    }
  };

  const deleteHistoryItem = (index: number) => {
    setState(prev => {
      const newHistory = prev.history.filter((_, i) => i !== index);
      if (newHistory.length === 0) {
        return { ...prev, history: [], activeHistoryIndex: null, hasResult: false };
      }
      let newIdx = prev.activeHistoryIndex;
      if (newIdx !== null && newIdx >= newHistory.length) {
        newIdx = newHistory.length - 1;
      }
      return { ...prev, history: newHistory, activeHistoryIndex: newIdx };
    });
  };

  const addGeneratedImage = (url: string) => {
    setState(prev => {
      const newHistory = [...prev.history, url];
      return {
        ...prev,
        history: newHistory,
        activeHistoryIndex: newHistory.length - 1,
        hasResult: true
      };
    });
  };

  const addCustomItem = (category: string, url: string, name: string) => {
    setState(prev => {
      const currentCategoryItems = prev.userItems[category] || [];
      const newItem = { id: `custom-${Date.now()}`, url, name };
      
      const nextState = {
        ...prev,
        userItems: {
          ...prev.userItems,
          [category]: [newItem, ...currentCategoryItems]
        }
      };

      (nextState as any)[category] = newItem.id;
      
      if (category !== 'selectedOutfit') {
        nextState.selectedOutfit = null;
      }
      
      return nextState;
    });
  };

  const resetAll = () => {
    setState(prev => ({
      ...prev,
      selectedOutfit: null,
      selectedBottom: null,
      selectedOuterwear: null,
      selectedTops: null,
      selectedSets: null,
      selectedSocks: null,
      selectedShoes: null,
      selectedAccessories: null,
      selectedBg: null,
      selectedPose: null,
      isGenerating: false,
      hasResult: false,
      history: [],
      activeHistoryIndex: null,
      openAccordions: ['selectedOutfit', 'background', 'pose'],
    }));
  };

  const setGender = (gender: Gender) => setState(prev => ({ ...prev, gender }));
  
  const setSelectedItem = (key: string, id: string | null) => {
    setState(prev => {
      const nextState = { ...prev, [key]: id };
      
      if (key !== 'selectedOutfit' && id !== null) {
        nextState.selectedOutfit = null;
      }
      
      if (key === 'selectedOutfit' && id !== null) {
        nextState.selectedBottom = null;
        nextState.selectedOuterwear = null;
        nextState.selectedTops = null;
        nextState.selectedSets = null;
        nextState.selectedSocks = null;
        nextState.selectedShoes = null;
        nextState.selectedAccessories = null;
      }
      
      return nextState;
    });
  };

  const applyTemplate = (templateData: Partial<StylistState>) => {
    setState(prev => ({
      ...prev,
      ...templateData,
      isTemplateModalOpen: false
    }));
  };

  const setIsTemplateModalOpen = (val: boolean) => setState(prev => ({ ...prev, isTemplateModalOpen: val }));
  const setSelectedBg = (id: string | null) => setState(prev => ({ ...prev, selectedBg: id }));
  const setSelectedPose = (id: string | null) => setState(prev => ({ ...prev, selectedPose: id }));
  
  const setUsagePreference = (pref: 'credits' | 'key') => {
    localStorage.setItem('skyverses_usage_preference', pref);
    setState(prev => ({ ...prev, usagePreference: pref }));
  };

  const setActiveHistoryIndex = (index: number | null) => setState(prev => ({ 
    ...prev, 
    activeHistoryIndex: index,
    hasResult: index !== null 
  }));
  const setHasResult = (val: boolean) => setState(prev => ({ ...prev, hasResult: val }));

  return {
    ...state,
    fileInputRef,
    toggleAccordion,
    handlePhotoUpload,
    handleGenerate,
    deleteHistoryItem,
    addGeneratedImage,
    addCustomItem,
    resetAll,
    setGender,
    setSelectedItem,
    setSelectedBg,
    setSelectedPose,
    setActiveHistoryIndex,
    setHasResult,
    useAsReference,
    showResourceModal,
    setShowResourceModal,
    showLowCreditAlert,
    setShowLowCreditAlert,
    hasPersonalKey,
    setUsagePreference,
    credits,
    GEN_COST,
    closeTutorial,
    openTutorial,
    setIsTemplateModalOpen,
    applyTemplate
  };
};