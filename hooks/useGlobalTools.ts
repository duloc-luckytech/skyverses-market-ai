
import React, { useState, useRef, useEffect, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';

export type GlobalModality = 'video' | 'image';

export const useGlobalTools = () => {
  const [prompt, setPrompt] = useState('');
  const [isExpanded, setIsExpanded] = useState(true);
  const [modality, setModality] = useState<GlobalModality>('video');
  const [isVideoModalOpen, setIsVideoModalOpen] = useState(false);
  const [isImageModalOpen, setIsImageModalOpen] = useState(false);
  
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

    if (modality === 'video') {
      setIsVideoModalOpen(true);
    } else {
      setIsImageModalOpen(true);
    }
    
    setIsExpanded(false);
  }, [prompt, modality, isAuthenticated, credits, login, showToast]);

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleGenerate();
    }
    if (e.key === 'Escape') {
      setIsExpanded(false);
    }
  };

  return {
    prompt,
    setPrompt,
    isExpanded,
    setIsExpanded,
    modality,
    setModality,
    isVideoModalOpen,
    setIsVideoModalOpen,
    isImageModalOpen,
    setIsImageModalOpen,
    textareaRef,
    handleGenerate,
    handleClear,
    onKeyDown,
    credits
  };
};
