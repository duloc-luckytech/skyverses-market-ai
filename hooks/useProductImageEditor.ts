
import React, { useState, useRef, useEffect, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { imagesApi, ImageJobRequest, ImageJobResponse } from '../apis/images';
import { pricingApi, PricingModel } from '../apis/pricing';
import { generateDemoImage } from '../services/gemini';
import { uploadToGCS } from '../services/storage';

export interface TextLayer {
  id: string;
  text: string;
  x: number; 
  y: number; 
  fontSize: number;
  color: string;
}

export interface GenerationRecord {
  id: string;
  url: string;
  prompt: string;
  timestamp: string;
}

export interface ActiveTask {
  id: string;
  prompt: string;
}

export const useProductImageEditor = (initialImage: string | null | undefined, theme: string) => {
  const { credits, useCredits, isAuthenticated, login, refreshUserInfo } = useAuth();
  const navigate = useNavigate();

  const [activeTool, setActiveTool] = useState<string>('pointer');
  const [zoom, setZoom] = useState(100);
  const [brushSize, setBrushSize] = useState(20);
  const [status, setStatus] = useState('Hệ thống sẵn sàng');
  const [showLowCreditAlert, setShowLowCreditAlert] = useState(false);
  const [isLibraryOpen, setIsLibraryOpen] = useState(false);
  
  const [showResourceModal, setShowResourceModal] = useState(false);
  const [isResumingGenerate, setIsResumingGenerate] = useState(false);
  const [usagePreference, setUsagePreference] = useState<'credits' | 'key' | null>(() => {
    return (localStorage.getItem('skyverses_usage_preference') as any) || 'credits';
  });
  
  const [hasPersonalKey, setHasPersonalKey] = useState(false);
  const [personalKey, setPersonalKey] = useState<string | undefined>(undefined);
  
  const [availableModels, setAvailableModels] = useState<any[]>([]);
  const [selectedModel, setSelectedModel] = useState<any>(null);

  const [prompt, setPrompt] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [result, setResult] = useState<string | null>(null);
  const [originalSource, setOriginalSource] = useState<string | null>(null);
  const [history, setHistory] = useState<GenerationRecord[]>([]);
  const [activeTasks, setActiveTasks] = useState<ActiveTask[]>([]);
  const [references, setReferences] = useState<string[]>([]);
  
  // Refined History State for Undo/Redo
  const [undoRedoState, setUndoRedoState] = useState<{ stack: string[], index: number }>({
    stack: initialImage ? [initialImage] : [],
    index: initialImage ? 0 : -1
  });

  const [panOffset, setPanOffset] = useState({ x: 0, y: 0 });
  const [isPanning, setIsPanning] = useState(false);
  const panStartRef = useRef({ x: 0, y: 0, offset: { x: 0, y: 0 } });

  const [isDrawing, setIsDrawing] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const imageRef = useRef<HTMLImageElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const [textLayers, setTextLayers] = useState<TextLayer[]>([]);
  const [selectedTextId, setSelectedTextId] = useState<string | null>(null);
  const [textDragStart, setTextDragStart] = useState<{ id: string, x: number, y: number, startX: number, startY: number } | null>(null);
  
  const lastClickRef = useRef<{ id: string, time: number } | null>(null);

  const [isCropping, setIsCropping] = useState(false);
  const [cropRatio, setCropRatio] = useState(0); 
  const [cropBox, setCropBox] = useState({ x: 10, y: 10, w: 80, h: 80 }); 
  const [dragStart, setDragStart] = useState<{ x: number, y: number, box: typeof cropBox } | null>(null);
  const [resizeHandle, setResizeHandle] = useState<string | null>(null);

  const [activeTab, setActiveTab] = useState<'layers' | 'history'>('layers');
  const [visibleLayers, setVisibleLayers] = useState<string[]>(['bg', 'draw', 'mask', 'text']);

  // Atomic update to history stack
  const pushToHistory = useCallback((url: string) => {
    setUndoRedoState(prev => {
      const newStack = prev.stack.slice(0, prev.index + 1);
      newStack.push(url);
      const limitedStack = newStack.slice(-20); // Limit to 20 steps
      return {
        stack: limitedStack,
        index: limitedStack.length - 1
      };
    });
    setResult(url);
  }, []);

  const handleUndo = () => {
    if (undoRedoState.index > 0) {
      const newIndex = undoRedoState.index - 1;
      setUndoRedoState(prev => ({ ...prev, index: newIndex }));
      setResult(undoRedoState.stack[newIndex]);
      setStatus('Hoàn tác');
    }
  };

  const handleRedo = () => {
    if (undoRedoState.index < undoRedoState.stack.length - 1) {
      const newIndex = undoRedoState.index + 1;
      setUndoRedoState(prev => ({ ...prev, index: newIndex }));
      setResult(undoRedoState.stack[newIndex]);
      setStatus('Làm lại');
    }
  };

  useEffect(() => {
    const fetchModels = async () => {
      try {
        const res = await pricingApi.getPricing({ tool: 'image' });
        if (res.success && res.data.length > 0) {
          const mapped = res.data.map((m: PricingModel) => {
            let cost = 150;
            if (m.pricing && m.pricing['1k']) {
              const firstKey = Object.keys(m.pricing['1k'])[0];
              cost = m.pricing['1k'][firstKey] || 150;
            }
            return { id: m.modelKey, name: m.name, cost };
          });
          setAvailableModels(mapped);
          setSelectedModel(mapped.find(m => m.id === 'google_image_gen_4_5') || mapped[0]);
        }
      } catch (error) {
        console.error("Failed to fetch image models:", error);
      }
    };
    fetchModels();
  }, []);

  useEffect(() => {
    const vault = localStorage.getItem('skyverses_model_vault');
    if (vault) {
      try {
        const keys = JSON.parse(vault);
        if (keys.gemini && keys.gemini.trim() !== '') {
          setHasPersonalKey(true);
          setPersonalKey(keys.gemini);
        }
      } catch (e) {}
    }
  }, [showResourceModal]);

  useEffect(() => {
    if (initialImage) {
      setResult(initialImage);
      setOriginalSource(initialImage);
      setUndoRedoState({ stack: [initialImage], index: 0 });
    } else {
      setResult(null);
      setOriginalSource(null);
      setUndoRedoState({ stack: [], index: -1 });
    }
  }, [initialImage]);

  useEffect(() => {
    if (imageRef.current && canvasRef.current && result) {
      const img = imageRef.current;
      const canvas = canvasRef.current;
      const updateCanvasSize = () => {
        canvas.width = img.clientWidth;
        canvas.height = img.clientHeight;
      };
      if (img.complete) updateCanvasSize(); else img.onload = updateCanvasSize;
    }
  }, [result, zoom]);

  const pollJobStatus = async (jobId: string, tempId: string, originalPrompt: string) => {
    try {
      const response: ImageJobResponse = await imagesApi.getJobStatus(jobId);
      if (response.data && response.data.status === 'done' && response.data.result?.images?.length) {
        const imageUrl = response.data.result.images[0];
        pushToHistory(imageUrl);
        setHistory(prev => [{ id: Date.now().toString(), url: imageUrl, prompt: originalPrompt, timestamp: new Date().toLocaleTimeString() }, ...prev]);
        refreshUserInfo();
        setStatus('Hoàn tất');
        setIsGenerating(false);
        setActiveTasks(prev => prev.filter(t => t.id !== tempId));
      } else if (response.data && response.data.status === 'failed') {
        setActiveTasks(prev => prev.filter(t => t.id !== tempId));
        setStatus('Lỗi xử lý từ máy chủ');
        setIsGenerating(false);
      } else {
        setTimeout(() => pollJobStatus(jobId, tempId, originalPrompt), 5000);
      }
    } catch (e) {
      setActiveTasks(prev => prev.filter(t => t.id !== tempId));
      setStatus('Lỗi đồng bộ trạng thái');
      setIsGenerating(false);
    }
  };

  const handleGenerate = async (overridePrompt?: string, forceCost?: number) => {
    const finalPrompt = overridePrompt || prompt;
    if (!finalPrompt.trim() || isGenerating) return;
    if (!isAuthenticated) { login(); return; }
    if (!usagePreference) {
      setIsResumingGenerate(true);
      setShowResourceModal(true);
      return;
    }

    const currentCost = forceCost !== undefined ? forceCost : (selectedModel?.cost || 150);
    const taskId = Date.now().toString();

    if (usagePreference === 'key') {
      const activeKey = personalKey;
      if (!activeKey) { navigate('/settings'); return; }
      setActiveTasks(prev => [...prev, { id: taskId, prompt: finalPrompt }]);
      setIsGenerating(true);
      setStatus('AI đang tính toán...');
      try {
        const inputImages = [...references];
        if (result) inputImages.push(result);
        const url = await generateDemoImage({ prompt: finalPrompt, images: inputImages, apiKey: activeKey, model: selectedModel.id });
        if (url) {
          pushToHistory(url);
          setHistory(prev => [{ id: Date.now().toString(), url, prompt: finalPrompt, timestamp: new Date().toLocaleTimeString() }, ...prev]);
          setPrompt('');
          setStatus('Sẵn sàng');
        }
      } catch (error) { setStatus('Lỗi kết nối AI'); } finally { setActiveTasks(prev => prev.filter(t => t.id !== taskId)); setIsGenerating(false); }
    } else {
      if (credits < currentCost) { setShowLowCreditAlert(true); return; }
      setActiveTasks(prev => [...prev, { id: taskId, prompt: finalPrompt }]);
      setIsGenerating(true);
      setStatus('Đang khởi tạo job...');
      try {
        const payload: ImageJobRequest = {
          type: "image_to_image",
          input: { prompt: finalPrompt, images: references.length > 0 ? [...references] : undefined },
          config: { width: 1024, height: 1024, aspectRatio: '1:1', seed: 0, style: "cinematic" },
          engine: { provider: "gommo", model: selectedModel.id as any },
          enginePayload: { prompt: finalPrompt, privacy: "PRIVATE", projectId: "default" }
        };
        const apiRes = await imagesApi.createJob(payload);
        if (apiRes.success && apiRes.data.jobId) pollJobStatus(apiRes.data.jobId, taskId, finalPrompt);
        else { setActiveTasks(prev => prev.filter(t => t.id !== taskId)); setIsGenerating(false); setStatus('Lỗi khởi tạo job'); }
      } catch (e) { setActiveTasks(prev => prev.filter(t => t.id !== taskId)); setIsGenerating(false); setStatus('Lỗi kết nối API'); }
    }
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (file && file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = (ev) => {
        const dataUrl = ev.target?.result as string;
        setOriginalSource(dataUrl);
        pushToHistory(dataUrl);
      };
      reader.readAsDataURL(file);
    }
  };

  const addTextLayer = () => {
    const newText: TextLayer = {
      id: Date.now().toString(),
      text: 'NHẤP ĐÔI ĐỂ SỬA',
      x: 40,
      y: 40,
      fontSize: 32,
      color: theme === 'dark' ? '#ffffff' : '#000000'
    };
    setTextLayers(prev => [...prev, newText]);
    setSelectedTextId(newText.id);
    if (!visibleLayers.includes('text')) {
      setVisibleLayers(prev => [...prev, 'text']);
    }
  };

  const updateTextLayer = (id: string, newText: string) => {
    setTextLayers(prev => prev.map(layer => layer.id === id ? { ...layer, text: newText } : layer));
  };

  const handleMouseMoveGlobal = useCallback((e: MouseEvent) => {
    if (isPanning && activeTool === 'hand') {
      const deltaX = e.clientX - panStartRef.current.x;
      const deltaY = e.clientY - panStartRef.current.y;
      setPanOffset({ x: panStartRef.current.offset.x + deltaX, y: panStartRef.current.offset.y + deltaY });
      return;
    }
    
    if (isDrawing && (activeTool === 'pen' || activeTool === 'eraser')) {
       if (!canvasRef.current) return;
       const canvas = canvasRef.current;
       const ctx = canvas.getContext('2d');
       if (!ctx) return;
       const rect = canvas.getBoundingClientRect();
       const x = (e.clientX - rect.left) * (canvas.width / rect.width);
       const y = (e.clientY - rect.top) * (canvas.height / rect.height);
       ctx.lineWidth = brushSize;
       ctx.lineCap = 'round';
       ctx.lineJoin = 'round';
       if (activeTool === 'eraser') ctx.globalCompositeOperation = 'destination-out';
       else {
         ctx.globalCompositeOperation = 'source-over';
         ctx.strokeStyle = 'rgba(255, 0, 0, 0.5)';
       }
       ctx.lineTo(x, y);
       ctx.stroke();
    }

    const rect = containerRef.current?.getBoundingClientRect();
    if (!rect) return;
    
    if (dragStart && isCropping) {
      const deltaX = ((e.clientX - dragStart.x) / rect.width) * 100;
      const deltaY = ((e.clientY - dragStart.y) / rect.height) * 100;
      setCropBox((prev: typeof cropBox) => {
        let newBox = { ...dragStart.box };
        if (!resizeHandle) {
          newBox.x = Math.max(0, Math.min(dragStart.box.x + deltaX, 100 - dragStart.box.w));
          newBox.y = Math.max(0, Math.min(dragStart.box.y + deltaY, 100 - dragStart.box.h));
        } else {
          if (resizeHandle.includes('right')) newBox.w = Math.max(5, Math.min(dragStart.box.w + deltaX, 100 - dragStart.box.x));
          if (resizeHandle.includes('left')) {
            const move = Math.min(deltaX, dragStart.box.w - 5);
            newBox.x = Math.max(0, dragStart.box.x + move);
            newBox.w = dragStart.box.w - (newBox.x - dragStart.box.x);
          }
          if (resizeHandle.includes('bottom')) newBox.h = Math.max(5, Math.min(dragStart.box.h + deltaY, 100 - dragStart.box.y));
          if (resizeHandle.includes('top')) {
            const move = Math.min(deltaY, dragStart.box.h - 5);
            newBox.y = Math.max(0, dragStart.box.y + move);
            newBox.h = dragStart.box.h - (newBox.y - dragStart.box.y);
          }
        }
        return newBox;
      });
    }

    if (textDragStart) {
      const dx = e.clientX - textDragStart.startX;
      const dy = e.clientY - textDragStart.startY;
      if (Math.abs(dx) < 3 && Math.abs(dy) < 3) return;

      const deltaX = (dx / rect.width) * 100;
      const deltaY = (dy / rect.height) * 100;
      setTextLayers(prev => prev.map(layer => {
        if (layer.id === textDragStart.id) {
          return {
            ...layer,
            x: Math.max(0, Math.min(95, textDragStart.x + deltaX)),
            y: Math.max(0, Math.min(95, textDragStart.y + deltaY))
          };
        }
        return layer;
      }));
    }
  }, [dragStart, isCropping, resizeHandle, textDragStart, isPanning, activeTool, panOffset, isDrawing, brushSize]);

  const handleMouseUpGlobal = useCallback(() => {
    setDragStart(null);
    setResizeHandle(null);
    setTextDragStart(null);
    setIsPanning(false);
    setIsDrawing(false);
    if (canvasRef.current) {
      canvasRef.current.getContext('2d')?.closePath();
    }
  }, []);

  useEffect(() => {
    window.addEventListener('mousemove', handleMouseMoveGlobal);
    window.addEventListener('mouseup', handleMouseUpGlobal);
    return () => {
      window.removeEventListener('mousemove', handleMouseMoveGlobal);
      window.removeEventListener('mouseup', handleMouseUpGlobal);
    };
  }, [handleMouseMoveGlobal, handleMouseUpGlobal]);

  const handleMouseDownViewport = (e: React.MouseEvent) => {
    if (activeTool === 'hand') {
      setIsPanning(true);
      panStartRef.current = { x: e.clientX, y: e.clientY, offset: { ...panOffset } };
      return;
    }
    if (activeTool === 'pen' || activeTool === 'eraser') {
       setIsDrawing(true);
       if (!canvasRef.current) return;
       const canvas = canvasRef.current;
       const ctx = canvas.getContext('2d');
       if (!ctx) return;
       const rect = canvas.getBoundingClientRect();
       const x = (e.clientX - rect.left) * (canvas.width / rect.width);
       const y = (e.clientY - rect.top) * (canvas.height / rect.height);
       ctx.beginPath();
       ctx.moveTo(x, y);
    }
  };

  const handleRatioSelect = (val: number) => {
    setCropRatio(val);
    if (val > 0) {
      setCropBox(prev => {
        const newW = prev.w;
        const newH = newW / val;
        if (newH > 90) {
            return { ...prev, h: 90, w: 90 * val };
        }
        return { ...prev, h: newH };
      });
    }
  };

  const handleTextMouseDown = (e: React.MouseEvent, layer: TextLayer) => {
    e.stopPropagation();
    const now = Date.now();
    if (lastClickRef.current && lastClickRef.current.id === layer.id && (now - lastClickRef.current.time) < 300) {
      const newText = window.prompt('Nhập nội dung văn bản mới:', layer.text);
      if (newText !== null && newText.trim() !== '') {
        updateTextLayer(layer.id, newText.trim());
      }
      lastClickRef.current = null;
      return;
    }
    lastClickRef.current = { id: layer.id, time: now };
    setSelectedTextId(layer.id);
    setTextDragStart({ id: layer.id, x: layer.x, y: layer.y, startX: e.clientX, startY: e.clientY });
  };

  const applyCrop = async () => {
    if (!result || !imageRef.current) return;
    setIsGenerating(true);
    setStatus('Đang cắt ảnh...');
    try {
      const img = new Image();
      img.crossOrigin = "anonymous";
      img.src = result;
      await new Promise(resolve => img.onload = resolve);
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      if (!ctx) return;
      const realX = (cropBox.x / 100) * img.width;
      const realY = (cropBox.y / 100) * img.height;
      const realW = (cropBox.w / 100) * img.width;
      const realH = (cropBox.h / 100) * img.height;
      canvas.width = realW;
      canvas.height = realH;
      ctx.drawImage(img, realX, realY, realW, realH, 0, 0, realW, realH);
      const croppedUrl = canvas.toDataURL('image/png');
      pushToHistory(croppedUrl);
      setIsCropping(false);
      setStatus('Cắt ảnh thành công');
      setHistory(prev => [{ id: Date.now().toString(), url: croppedUrl, prompt: 'Crop Edit', timestamp: new Date().toLocaleTimeString() }, ...prev]);
    } catch (err) { setStatus('Lỗi cắt ảnh'); } finally { setIsGenerating(false); }
  };

  const handleExport = async () => {
    if (!result) return;
    try {
      const response = await fetch(result);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `skyverses_export_${Date.now()}.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (e) {
      window.open(result, '_blank');
    }
  };

  return {
    credits, usagePreference, setUsagePreference, hasPersonalKey, showResourceModal, setShowResourceModal,
    isAuthenticated, login,
    activeTool, setActiveTool, zoom, setZoom, brushSize, setBrushSize, status, setStatus,
    prompt, setPrompt, isGenerating, result, setResult, originalSource, setOriginalSource, history, activeTasks, references, setReferences,
    panOffset, setPanOffset, isPanning, setIsPanning, panStartRef, isDrawing, setIsDrawing,
    canvasRef, imageRef, containerRef,
    textLayers, setTextLayers, selectedTextId, setSelectedTextId,
    isCropping, setIsCropping, cropRatio, setCropRatio, cropBox, setCropBox,
    showLowCreditAlert, setShowLowCreditAlert, isLibraryOpen, setIsLibraryOpen,
    handleGenerate, applyCrop, handleExport, addTextLayer, updateTextLayer,
    availableModels, selectedModel, setSelectedModel,
    isResumingGenerate, setIsResumingGenerate,
    activeTab, setActiveTab,
    visibleLayers, setVisibleLayers,
    setDragStart, setResizeHandle,
    handleMouseDownViewport, handleRatioSelect, handleTextMouseDown,
    handleUndo, handleRedo, handleDrop,
    pushToHistory,
    canUndo: undoRedoState.index > 0,
    canRedo: undoRedoState.index < undoRedoState.stack.length - 1,
    deleteSelectedText: () => {
        if (!selectedTextId) return;
        setTextLayers(prev => prev.filter(t => t.id !== selectedTextId));
        setSelectedTextId(null);
    },
    handleEditorApply: (newUrl: string) => {
        const editedResult: GenerationRecord = { id: `edit-${Date.now()}`, url: newUrl, prompt: 'Edited', timestamp: new Date().toLocaleTimeString() };
        setHistory(prev => [editedResult, ...prev]);
        pushToHistory(newUrl);
    }
  };
};
