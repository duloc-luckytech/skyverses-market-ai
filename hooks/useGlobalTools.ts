
import React, { useState, useRef, useEffect, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';

export type GlobalModality = 'video' | 'image' | 'animate';

export const useGlobalTools = () => {
  const [prompt, setPrompt] = useState('');
  const [isExpanded, setIsExpanded] = useState(true);
  const [modality, setModality] = useState<GlobalModality>('video');
  const [isVideoModalOpen, setIsVideoModalOpen] = useState(false);
  const [isImageModalOpen, setIsImageModalOpen] = useState(false);
  const [isAnimateModalOpen, setIsAnimateModalOpen] = useState(false);
  
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

    // Đánh dấu auto_run và modality cho modal tương ứng
    localStorage.setItem('skyverses_global_auto_prompt', prompt);
    localStorage.setItem('skyverses_global_auto_modality', modality);
    localStorage.setItem('skyverses_global_auto_run', 'true');

    if (modality === 'video') {
      setIsVideoModalOpen(true);
    } else if (modality === 'image') {
      setIsImageModalOpen(true);
    } else if (modality === 'animate') {
      setIsAnimateModalOpen(true);
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
    isAnimateModalOpen,
    setIsAnimateModalOpen,
    textareaRef,
    handleGenerate,
    handleClear,
    onKeyDown,
    credits
  };
};
