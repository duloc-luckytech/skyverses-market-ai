
import React, { useState, useRef, useEffect, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';

export type GlobalModality = 'video' | 'image' | 'animate';

export const useGlobalTools = () => {
  const [prompt, setPrompt] = useState('');
  const [isExpanded, setIsExpanded] = useState(true);
  const [modality, setModality] = useState<GlobalModality>('video');
  const [selectedAsset, setSelectedAsset] = useState<string | null>(null);
  const [isVideoModalOpen, setIsVideoModalOpen] = useState(false);
  const [isImageModalOpen, setIsImageModalOpen] = useState(false);
  const [isAnimateModalOpen, setIsAnimateModalOpen] = useState(false);
  const [isLibraryOpen, setIsLibraryOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  // Configuration States
  const [selectedModel, setSelectedModelId] = useState('wan-2-6');
  const [resolution, setResolution] = useState('720P');
  const [aspectRatio, setAspectRatio] = useState('16:9');
  const [duration, setDuration] = useState('5s');
  const [switches, setSwitches] = useState({
    credits: true,
    enhance: true,
    multiShot: false
  });
  
  const { credits, isAuthenticated, login } = useAuth();
  const { showToast } = useToast();
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Tự động điều chỉnh chiều cao kịch bản
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  }, [prompt]);

  const handleClear = useCallback(() => {
    setPrompt('');
    setSelectedAsset(null);
    if (textareaRef.current) textareaRef.current.style.height = 'auto';
  }, []);

  const handleGenerate = useCallback(() => {
    if (!prompt.trim()) return;
    
    if (!isAuthenticated) {
      showToast("Vui lòng đăng nhập để bắt đầu", "info");
      login();
      return;
    }

    if (credits < 10) {
      showToast("Hạn ngạch không đủ", "error");
      return;
    }

    // Đánh dấu auto_run và modality cho modal tương ứng
    localStorage.setItem('skyverses_global_auto_prompt', prompt);
    localStorage.setItem('skyverses_global_auto_modality', modality);
    localStorage.setItem('skyverses_global_auto_run', 'true');
    
    if (selectedAsset) {
      localStorage.setItem('skyverses_global_auto_image', selectedAsset);
    } else {
      localStorage.removeItem('skyverses_global_auto_image');
    }

    if (modality === 'video') {
      setIsVideoModalOpen(true);
    } else if (modality === 'image') {
      setIsImageModalOpen(true);
    } else if (modality === 'animate') {
      setIsAnimateModalOpen(true);
    }
    
    setIsExpanded(false);
    setIsSettingsOpen(false);
  }, [prompt, modality, isAuthenticated, credits, login, showToast, selectedAsset]);

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleGenerate();
    }
    if (e.key === 'Escape') {
      setIsExpanded(false);
      setIsSettingsOpen(false);
    }
  };

  return {
    prompt, setPrompt,
    isExpanded, setIsExpanded,
    modality, setModality,
    selectedAsset, setSelectedAsset,
    isVideoModalOpen, setIsVideoModalOpen,
    isImageModalOpen, setIsImageModalOpen,
    isAnimateModalOpen, setIsAnimateModalOpen,
    isLibraryOpen, setIsLibraryOpen,
    isSettingsOpen, setIsSettingsOpen,
    // Config states
    selectedModel, setSelectedModelId,
    resolution, setResolution,
    aspectRatio, setAspectRatio,
    duration, setDuration,
    switches, setSwitches,
    textareaRef, handleGenerate, handleClear, onKeyDown, credits
  };
};
