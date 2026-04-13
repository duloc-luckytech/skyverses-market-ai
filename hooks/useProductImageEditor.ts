import React, { useState, useRef, useEffect, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { imagesApi, ImageJobRequest } from '../apis/images';
import { editImageApi } from '../apis/editImage';
import { mediaApi } from '../apis/media';
import { uploadToGCS } from '../services/storage';
import { useImageModels, MappedImageModel } from './useImageModels';
import { pollJobOnce } from './useJobPoller';

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
  const { credits, useCredits, addCredits, isAuthenticated, login, refreshUserInfo } = useAuth();
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
  
  const [selectedEngine, setSelectedEngine] = useState('gommo');
  const imageModels = useImageModels(selectedEngine, 'google_image_gen_banana_pro');
  const { availableModels, selectedModel, setSelectedModel, selectedFamily, setSelectedFamily, selectedMode, setSelectedMode, selectedRatio, setSelectedRatio, selectedRes, setSelectedRes, familyList, familyModels, familyModes, familyResolutions, familyRatios, selectedModelCost } = imageModels;

  const [prompt, setPrompt] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [result, setResult] = useState<string | null>(null);
  const [originalSource, setOriginalSource] = useState<string | null>(null);
  const [history, setHistory] = useState<GenerationRecord[]>([]);
  const [activeTasks, setActiveTasks] = useState<ActiveTask[]>([]);
  const [references, setReferences] = useState<string[]>([]);
  
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
  const isCancelledRef = useRef(false);

  // Cancel all in-flight polls on unmount
  useEffect(() => {
    return () => { isCancelledRef.current = true; };
  }, []);

  const [isCropping, setIsCropping] = useState(false);
  const [cropRatio, setCropRatio] = useState(0); 
  const [cropBox, setCropBox] = useState({ x: 10, y: 10, w: 80, h: 80 }); 
  const [dragStart, setDragStart] = useState<{ x: number, y: number, box: typeof cropBox } | null>(null);
  const [resizeHandle, setResizeHandle] = useState<string | null>(null);

  const [activeTab, setActiveTab] = useState<'layers' | 'history'>('layers');
  const [visibleLayers, setVisibleLayers] = useState<string[]>(['bg', 'draw', 'mask', 'text']);

  const pushToHistory = useCallback((url: string) => {
    setUndoRedoState(prev => {
      const newStack = prev.stack.slice(0, prev.index + 1);
      newStack.push(url);
      const limitedStack = newStack.slice(-20);
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

  // Model fetching is now handled by shared useImageModels hook

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

  const pollJobStatus = (jobId: string, taskId: string, cost: number, taskPrompt: string) => {
    pollJobOnce({
      jobId,
      isCancelledRef,
      apiType: 'image',
      intervalMs: 5000,
      networkRetryMs: 10000,
      onDone: (jobResult) => {
        const imageUrl = jobResult.images?.[0] ?? null;
        if (imageUrl) {
          pushToHistory(imageUrl);
          setHistory(prev => [{
            id: jobId,
            url: imageUrl,
            prompt: taskPrompt,
            timestamp: new Date().toLocaleTimeString()
          }, ...prev]);
          refreshUserInfo();
        }
        setStatus('✅ Hoàn tất');
        setIsGenerating(false);
        setActiveTasks(prev => prev.filter(t => t.id !== taskId));
      },
      onError: (errorMsg) => {
        if (usagePreference === 'credits') addCredits(cost);
        setActiveTasks(prev => prev.filter(t => t.id !== taskId));
        setStatus(`❌ Lỗi: ${errorMsg || 'Xử lý thất bại'}`);
        setIsGenerating(false);
      },
      onTick: ({ tickCount }) => {
        setStatus(`⏳ Đang xử lý... (${tickCount * 5}s)`);
      },
    });
  };

  const generateTooltip = (() => {
    if (!isAuthenticated) return 'Vui lòng đăng nhập';
    if (!usagePreference) return 'Chọn nguồn tài nguyên';
    if (usagePreference === 'credits' && credits < selectedModelCost) return `Số dư không đủ (Cần ${selectedModelCost} CR)`;
    if (!prompt.trim()) return 'Vui lòng nhập prompt';
    return null;
  })();

  const isGenerateDisabledComputed = isGenerating || !!generateTooltip || !selectedModel;

  const handleGenerate = async (overridePrompt?: string, forceCost?: number) => {
    if (generateTooltip) return;
    const finalPrompt = overridePrompt || prompt;
    if (!finalPrompt.trim() || isGenerating) return;
    if (!isAuthenticated) { login(); return; }
    if (!usagePreference) {
      setIsResumingGenerate(true);
      setShowResourceModal(true);
      return;
    }
    if (!selectedModel) return;

    const currentCost = forceCost !== undefined ? forceCost : selectedModelCost;

    if (usagePreference === 'credits' && credits < currentCost) {
      setShowLowCreditAlert(true);
      return;
    }

    const taskId = `pimg-${Date.now()}`;
    setActiveTasks(prev => [...prev, { id: taskId, prompt: finalPrompt }]);
    setIsGenerating(true);
    setStatus('🚀 Đang khởi tạo job...');

    try {
      const hasRefs = references.length > 0;
      const payload: ImageJobRequest = {
        type: hasRefs ? "image_to_image" : "text_to_image",
        input: {
          prompt: finalPrompt,
          images: hasRefs ? [...references] : undefined
        },
        config: {
          width: 1024,
          height: 1024,
          aspectRatio: selectedRatio || '1:1',
          seed: 0,
          style: "cinematic"
        },
        engine: {
          provider: selectedEngine as any,
          model: (selectedModel.raw?.modelKey || selectedModel.id || '') as any
        },
        enginePayload: {
          prompt: finalPrompt,
          privacy: "PRIVATE",
          projectId: "default",
          mode: selectedMode || undefined
        }
      };

      const apiRes = await imagesApi.createJob(payload);

      if (apiRes.success && apiRes.data.jobId) {
        const serverJobId = apiRes.data.jobId;
        // Deduct credits immediately after job is accepted (optimistic)
        if (usagePreference === 'credits') useCredits(currentCost);
        setStatus('🔄 Đang xử lý...');
        // Update taskId to serverJobId for tracking
        setActiveTasks(prev => prev.map(t => t.id === taskId ? { ...t, id: serverJobId } : t));
        pollJobStatus(serverJobId, serverJobId, currentCost, finalPrompt);
      } else {
        setActiveTasks(prev => prev.filter(t => t.id !== taskId));
        setIsGenerating(false);
        setStatus('❌ Lỗi khởi tạo job');
      }
    } catch {
      setActiveTasks(prev => prev.filter(t => t.id !== taskId));
      setIsGenerating(false);
      setStatus('❌ Lỗi kết nối API');
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
    if (!result) return;
    setIsGenerating(true);
    setStatus('📤 Đang upload ảnh...');

    try {
      // ── Step 1: Convert result URL → base64 ──────────────────────────────
      let base64: string;
      if (result.startsWith('data:')) {
        // Already a data URL — strip the prefix
        base64 = result.split(',')[1];
      } else {
        // Remote URL — fetch and convert
        const res = await fetch(result);
        const blob = await res.blob();
        base64 = await new Promise<string>((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = () => resolve((reader.result as string).split(',')[1]);
          reader.onerror = reject;
          reader.readAsDataURL(blob);
        });
      }

      // ── Step 2: Upload to media → get mediaId ────────────────────────────
      const uploadRes = await mediaApi.uploadImage({
        base64,
        fileName: `crop_source_${Date.now()}.png`,
        size: Math.ceil(base64.length * 0.75), // approximate byte size
        source: 'fxflow',
      });

      if (!uploadRes.success || !uploadRes.mediaId) {
        throw new Error(uploadRes.message || 'Upload ảnh thất bại');
      }

      const mediaId = uploadRes.mediaId;
      const projectId = uploadRes.raw?.projectId || 'default';

      // ── Step 3: Convert cropBox (% 0-100) → normalized coordinates (0-1) ─
      const left   = cropBox.x / 100;
      const top    = cropBox.y / 100;
      const right  = (cropBox.x + cropBox.w) / 100;
      const bottom = (cropBox.y + cropBox.h) / 100;

      setStatus('✂️ Đang gửi lệnh crop...');

      // ── Step 4: Create edit-image job ─────────────────────────────────────
      const createRes = await editImageApi.createJob({
        mediaId,
        projectId,
        editType: 'crop',
        cropCoordinates: {
          top: parseFloat(top.toFixed(4)),
          left: parseFloat(left.toFixed(4)),
          right: parseFloat(right.toFixed(4)),
          bottom: parseFloat(bottom.toFixed(4)),
        },
      });

      if (!createRes.success || !createRes.data?.jobId) {
        throw new Error(createRes.message || 'Tạo crop job thất bại');
      }

      const jobId = createRes.data.jobId;
      setStatus('⏳ Đang xử lý crop...');

      // ── Step 5: Poll until done ───────────────────────────────────────────
      let tickCount = 0;
      await new Promise<void>((resolve, reject) => {
        const poll = async () => {
          if (isCancelledRef.current) { resolve(); return; }

          tickCount++;
          setStatus(`⏳ Đang crop... (${tickCount * 4}s)`);

          const statusRes = await editImageApi.getJobStatus(jobId);
          const st = statusRes.data?.status;

          if (st === 'done') {
            const resultUrl = statusRes.data?.result?.resultUrl;
            if (resultUrl) {
              pushToHistory(resultUrl);
              setHistory(prev => [{
                id: jobId,
                url: resultUrl,
                prompt: 'Crop Edit',
                timestamp: new Date().toLocaleTimeString()
              }, ...prev]);
              setStatus('✅ Crop thành công');
            } else {
              reject(new Error('Không tìm thấy kết quả crop'));
            }
            resolve();
          } else if (st === 'error' || st === 'cancelled') {
            reject(new Error(statusRes.data?.error?.message || 'Crop job thất bại'));
          } else {
            // pending / processing — poll again in 4s
            if (tickCount >= 45) { // ~3 min timeout
              reject(new Error('Crop quá thời gian. Vui lòng thử lại.'));
            } else {
              setTimeout(poll, 4000);
            }
          }
        };
        setTimeout(poll, 2000); // initial delay 2s
      });

      setIsCropping(false);
    } catch (err: any) {
      console.error('[applyCrop] error:', err);
      setStatus(`❌ Lỗi crop: ${err?.message || 'Thử lại sau'}`);
    } finally {
      setIsGenerating(false);
    }
  };

  const applyDraw = async () => {
    if (!result || !prompt.trim()) return;

    // result phải là URL (không phải data URL) vì BE cần referenceImageUrl truy cập được
    let referenceImageUrl = result;
    if (result.startsWith('data:')) {
      setStatus('❌ Vui lòng dùng ảnh từ URL (không phải upload local)');
      return;
    }

    setIsGenerating(true);
    setStatus('🎨 Đang gửi lệnh draw...');

    try {
      const createRes = await editImageApi.createJob({
        projectId: 'default',
        editType: 'draw',
        drawPayload: {
          prompt: prompt.trim(),
          referenceImageUrl,
        },
      });

      if (!createRes.success || !createRes.data?.jobId) {
        throw new Error(createRes.message || 'Tạo draw job thất bại');
      }

      const jobId = createRes.data.jobId;
      setStatus('⏳ Đang xử lý draw...');

      let tickCount = 0;
      await new Promise<void>((resolve, reject) => {
        const poll = async () => {
          if (isCancelledRef.current) { resolve(); return; }

          tickCount++;
          setStatus(`⏳ Đang xử lý... (${tickCount * 4}s)`);

          const statusRes = await editImageApi.getJobStatus(jobId);
          const st = statusRes.data?.status;

          if (st === 'done') {
            const resultUrl = statusRes.data?.result?.resultUrl;
            if (resultUrl) {
              pushToHistory(resultUrl);
              setHistory(prev => [{
                id: jobId,
                url: resultUrl,
                prompt: prompt.trim(),
                timestamp: new Date().toLocaleTimeString()
              }, ...prev]);
              setPrompt('');
              setStatus('✅ Draw hoàn tất');
            } else {
              reject(new Error('Không tìm thấy kết quả draw'));
            }
            resolve();
          } else if (st === 'error' || st === 'cancelled') {
            reject(new Error(statusRes.data?.error?.message || 'Draw job thất bại'));
          } else {
            if (tickCount >= 45) {
              reject(new Error('Draw quá thời gian. Vui lòng thử lại.'));
            } else {
              setTimeout(poll, 4000);
            }
          }
        };
        setTimeout(poll, 2000);
      });
    } catch (err: any) {
      console.error('[applyDraw] error:', err);
      setStatus(`❌ Lỗi draw: ${err?.message || 'Thử lại sau'}`);
    } finally {
      setIsGenerating(false);
    }
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
    handleGenerate, applyDraw, applyCrop, handleExport, addTextLayer, updateTextLayer,
    availableModels, selectedModel, setSelectedModel, selectedEngine, setSelectedEngine,
    selectedFamily, setSelectedFamily, selectedMode, setSelectedMode,
    selectedRatio, setSelectedRatio, selectedRes, setSelectedRes,
    familyList, familyModels, familyModes, familyResolutions, familyRatios,
    selectedModelCost,
    generateTooltip,
    isGenerateDisabled: isGenerateDisabledComputed,
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