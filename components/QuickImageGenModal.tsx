
import React, { useState, useRef, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Wand2, Zap, Plus, Upload, Loader2, Sparkles, ChevronDown, Activity } from 'lucide-react';
import { generateDemoImage } from '../services/gemini';
import { uploadToGCS } from '../services/storage';
import { useAuth } from '../context/AuthContext';
import { pricingApi, PricingModel } from '../apis/pricing';
import { imagesApi, ImageJobRequest, ImageJobResponse } from '../apis/images';

interface QuickImageGenModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

const RATIOS = ['1:1', '16:9', '9:16', '4:3', '3:4'];
const RESOLUTIONS = ['1k', '2k', '4k'];

export const QuickImageGenModal: React.FC<QuickImageGenModalProps> = ({ isOpen, onClose, onSuccess }) => {
  const { credits, useCredits, isAuthenticated, login, refreshUserInfo } = useAuth();
  
  // -- Model & Pricing States --
  const [availableModels, setAvailableModels] = useState<PricingModel[]>([]);
  const [selectedModel, setSelectedModel] = useState<PricingModel | null>(null);
  const [selectedRes, setSelectedRes] = useState('1k');
  
  // -- Content States --
  const [prompt, setPrompt] = useState('');
  const [references, setReferences] = useState<string[]>([]);
  const [ratio, setRatio] = useState('1:1');
  const [isGenerating, setIsGenerating] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [statusText, setStatusText] = useState('Sẵn sàng');
  const fileInputRef = useRef<HTMLInputElement>(null);

  // -- Resource Preference --
  const usagePreference = useMemo(() => {
    return (localStorage.getItem('skyverses_usage_preference') as any) || 'credits';
  }, [isOpen]);

  // -- Initialization: Fetch Pricing --
  useEffect(() => {
    if (isOpen) {
      const fetchModels = async () => {
        try {
          const res = await pricingApi.getPricing({ tool: 'image' });
          if (res.success && res.data.length > 0) {
            setAvailableModels(res.data);
            // Default to Banana Pro if available, otherwise first model
            const defaultModel = res.data.find(m => m.modelKey === 'google_image_gen_banana_pro') || res.data[0];
            setSelectedModel(defaultModel);
          }
        } catch (error) {
          console.error("Failed to fetch image pricing:", error);
        }
      };
      fetchModels();
    }
  }, [isOpen]);

  // -- Dynamic Cost Calculation --
  const currentUnitCost = useMemo(() => {
    if (!selectedModel || !selectedModel.pricing) return 0;
    const resKey = selectedRes.toLowerCase();
    const resMatrix = selectedModel.pricing[resKey];
    if (!resMatrix) return 0;
    const firstKey = Object.keys(resMatrix)[0];
    return resMatrix[firstKey] || 0;
  }, [selectedModel, selectedRes]);

  const pollJobStatus = async (jobId: string) => {
    try {
      const response: ImageJobResponse = await imagesApi.getJobStatus(jobId);
      const jobStatus = response.data?.status;

      if (jobStatus === 'done' && response.data.result?.images?.length) {
        setStatusText('Hoàn tất');
        refreshUserInfo();
        onSuccess();
        onClose();
        // Fix: cast jobStatus to string to allow checking for 'error' state which may not be in the narrowed union type
      } else if (jobStatus === 'failed' || (jobStatus as string) === 'error') {
        // Cho phép tạo lại nếu job thất bại hoặc trả về lỗi
        setIsGenerating(false);
        setStatusText('Lỗi tạo ảnh');
        alert("Máy chủ báo lỗi hoặc không thể tạo hình. Vui lòng kiểm tra lại prompt và thử lại.");
      } else {
        // Tiếp tục poll nếu đang chờ xử lý
        setTimeout(() => pollJobStatus(jobId), 3000);
      }
    } catch (e) {
      console.error("Polling Error:", e);
      setIsGenerating(false);
      setStatusText('Lỗi kết nối');
      alert("Quá trình kiểm tra trạng thái thất bại. Vui lòng thử lại.");
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setIsUploading(true);
      try {
        const metadata = await uploadToGCS(file);
        setReferences(prev => [...prev, metadata.url].slice(0, 3));
      } catch (err) {
        console.error("Upload failed", err);
      } finally {
        setIsUploading(false);
      }
    }
  };

  const handleGenerate = async () => {
    if (!prompt.trim() || isGenerating || !selectedModel) return;
    if (!isAuthenticated) { login(); return; }
    
    if (usagePreference === 'credits' && credits < currentUnitCost) {
      alert(`Hạn ngạch node không đủ (Cần ${currentUnitCost} credits)`);
      return;
    }

    setIsGenerating(true);
    setStatusText('Đang khởi tạo...');

    try {
      if (usagePreference === 'credits') {
        const payload: ImageJobRequest = {
          type: references.length > 0 ? "image_to_image" : "text_to_image",
          input: {
            prompt: prompt,
            images: references.length > 0 ? references : undefined
          },
          config: {
            width: 1024,
            height: 1024,
            aspectRatio: ratio,
            seed: 0,
            style: "cinematic"
          },
          engine: {
            provider: "gommo",
            model: selectedModel.modelKey as any
          },
          enginePayload: {
            prompt: prompt,
            privacy: "PRIVATE",
            projectId: "default"
          }
        };

        const res = await imagesApi.createJob(payload);
        if (res.success && res.data.jobId) {
          useCredits(currentUnitCost);
          setStatusText('Đang kiến tạo...');
          pollJobStatus(res.data.jobId);
        } else {
          throw new Error(res.message || 'Khởi tạo Job thất bại');
        }
      } else {
        // Fallback or API Key usage
        const imageUrl = await generateDemoImage({
          prompt: prompt,
          images: references,
          aspectRatio: ratio,
          model: selectedModel.modelKey,
          quality: selectedRes
        });

        if (imageUrl) {
          // Convert base64 back to file to upload to GCS for permanent storage
          const resBlob = await fetch(imageUrl);
          const blob = await resBlob.blob();
          const file = new File([blob], `gen_${Date.now()}.png`, { type: 'image/png' });
          await uploadToGCS(file);
          onSuccess();
          onClose();
        }
      }
    } catch (err) {
      console.error("Generation failed", err);
      alert("Lỗi kiến tạo hình ảnh. Vui lòng thử lại.");
      setIsGenerating(false);
      setStatusText('Lỗi hệ thống');
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[800] flex items-center justify-center p-4">
        <motion.div 
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
          className="absolute inset-0 bg-black/60 backdrop-blur-sm"
          onClick={onClose}
        />
        <motion.div 
          initial={{ scale: 0.95, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.95, opacity: 0, y: 20 }}
          className="relative w-full max-w-lg bg-white dark:bg-[#111114] border border-slate-200 dark:border-white/10 rounded-2xl overflow-hidden shadow-3xl flex flex-col transition-colors"
        >
          <div className="p-6 border-b border-slate-100 dark:border-white/5 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-brand-blue/10 rounded-lg text-brand-blue">
                <Wand2 size={18} />
              </div>
              <h3 className="text-sm font-black uppercase tracking-widest text-slate-900 dark:text-white">Tạo nhanh bằng AI</h3>
            </div>
            <button onClick={onClose} className="p-2 text-slate-400 hover:text-red-500 transition-colors">
              <X size={20} />
            </button>
          </div>

          <div className="p-6 space-y-6 overflow-y-auto max-h-[70vh] no-scrollbar">
            {/* Model Selection */}
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase text-slate-400 dark:text-gray-500 tracking-widest">Model Engine</label>
              <div className="relative">
                <select 
                  value={selectedModel?._id || ''}
                  onChange={(e) => setSelectedModel(availableModels.find(m => m._id === e.target.value) || null)}
                  className="w-full bg-slate-50 dark:bg-black/40 border border-slate-200 dark:border-white/5 rounded-xl p-3 text-xs font-bold appearance-none outline-none focus:border-brand-blue transition-all text-slate-900 dark:text-white"
                >
                  {availableModels.map(m => (
                    <option key={m._id} value={m._id} className="dark:bg-[#111114]">{m.name}</option>
                  ))}
                </select>
                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" size={16} />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase text-slate-400 dark:text-gray-500 tracking-widest">Kịch bản (Prompt)</label>
              <textarea 
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder="Mô tả hình ảnh bạn muốn tạo..."
                className="w-full h-24 bg-slate-50 dark:bg-black/40 border border-slate-200 dark:border-white/5 rounded-xl p-4 text-xs font-bold outline-none focus:border-brand-blue/50 resize-none transition-all placeholder:text-slate-300 dark:placeholder:text-gray-700 text-slate-900 dark:text-white shadow-inner"
              />
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase text-slate-400 dark:text-gray-500 tracking-widest">Ảnh tham chiếu (Tùy chọn)</label>
              <div className="flex gap-2">
                {references.map((ref, idx) => (
                  <div key={idx} className="relative w-12 h-12 rounded-lg overflow-hidden border border-black/10">
                    <img src={ref} className="w-full h-full object-cover" />
                    <button onClick={() => setReferences(prev => prev.filter((_, i) => i !== idx))} className="absolute inset-0 bg-red-500/60 opacity-0 hover:opacity-100 flex items-center justify-center transition-opacity"><X size={10} className="text-white" /></button>
                  </div>
                ))}
                {references.length < 3 && (
                  <button 
                    onClick={() => fileInputRef.current?.click()}
                    className="w-12 h-12 border-2 border-dashed border-slate-200 dark:border-white/5 rounded-lg flex items-center justify-center text-slate-300 hover:border-brand-blue transition-all"
                  >
                    {isUploading ? <Loader2 size={14} className="animate-spin" /> : <Plus size={16} />}
                  </button>
                )}
                <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleFileUpload} />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase text-slate-400 dark:text-gray-500 tracking-widest">Tỷ lệ khung hình</label>
                <div className="relative">
                  <select 
                    value={ratio}
                    onChange={(e) => setRatio(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-black/40 border border-slate-200 dark:border-white/5 rounded-xl p-3 text-xs font-bold outline-none appearance-none focus:border-brand-blue transition-all text-slate-900 dark:text-white"
                  >
                    {RATIOS.map(r => <option key={r} value={r}>{r}</option>)}
                  </select>
                  <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" size={16} />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase text-slate-400 dark:text-gray-500 tracking-widest">Phân giải</label>
                <div className="relative">
                  <select 
                    value={selectedRes}
                    onChange={(e) => setSelectedRes(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-black/40 border border-slate-200 dark:border-white/5 rounded-xl p-3 text-xs font-bold outline-none appearance-none focus:border-brand-blue transition-all text-slate-900 dark:text-white"
                  >
                    {RESOLUTIONS.map(r => <option key={r} value={r}>{r.toUpperCase()}</option>)}
                  </select>
                  <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" size={16} />
                </div>
              </div>
            </div>
          </div>

          <div className="p-6 bg-slate-50 dark:bg-black/40 border-t border-slate-100 dark:border-white/5 flex items-center justify-between">
            <div className="flex flex-col gap-1">
               <div className="flex items-center gap-2 text-orange-500 font-black italic text-xs">
                 <Zap size={14} fill="currentColor" />
                 <span>{currentUnitCost} CR</span>
               </div>
               <div className="flex items-center gap-1 text-[9px] font-bold text-slate-400">
                  <Activity size={10} className={isGenerating ? 'animate-pulse text-brand-blue' : ''} />
                  <span>{statusText}</span>
               </div>
            </div>
            <button 
              onClick={handleGenerate}
              disabled={isGenerating || !prompt.trim()}
              className="bg-brand-blue text-white px-8 py-3 rounded-xl text-xs font-black uppercase tracking-widest shadow-xl hover:brightness-110 active:scale-95 transition-all flex items-center justify-center gap-3 disabled:opacity-50"
            >
              {isGenerating ? <Loader2 size={16} className="animate-spin" /> : <Sparkles size={16} />}
              Kiến tạo hình ảnh
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
