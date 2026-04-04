
import React, { useState, useRef, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Wand2, Zap, Plus, Loader2, Sparkles, ChevronDown, Activity, Gift, Image, Camera, Star, ArrowRight } from 'lucide-react';
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

// ─── Prompt Suggestions ──────────────────────────────────────────────────────
const PROMPT_SUGGESTIONS = [
  '🌟 Cô gái trong bộ áo dài truyền thống, nền hoa sen',
  '🏙️ Futuristic cyberpunk city at night, neon lights',
  '🎨 Oil painting of a serene landscape with mountains',
  '🐉 A majestic dragon flying over ancient temple ruins',
  '🌸 Japanese anime girl with sakura petals, pastel colors',
  '📸 Professional product photo of luxury watch on marble',
];

// ═══════════════════════════════════════════════════════════════════════════════
export const QuickImageGenModal: React.FC<QuickImageGenModalProps> = ({ isOpen, onClose, onSuccess }) => {
  const { credits, useCredits, isAuthenticated, login, refreshUserInfo, freeImageRemaining } = useAuth();
  
  // -- Model & Pricing States --
  const [availableModels, setAvailableModels] = useState<PricingModel[]>([]);
  const [selectedModel, setSelectedModel] = useState<PricingModel | null>(null);
  const [selectedRes, setSelectedRes] = useState('1k');
  const [selectedMode, setSelectedMode] = useState('VEO');
  
  // -- Content States --
  const [prompt, setPrompt] = useState('');
  const [references, setReferences] = useState<string[]>([]);
  const [ratio, setRatio] = useState('1:1');
  const [isGenerating, setIsGenerating] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [statusText, setStatusText] = useState('Sẵn sàng');
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // -- Resource Preference --
  const usagePreference = useMemo(() => {
    return (localStorage.getItem('skyverses_usage_preference') as any) || 'credits';
  }, [isOpen]);

  // -- Initialization: Fetch Pricing (default to fxflow engine = Server 2) --
  useEffect(() => {
    if (isOpen) {
      const fetchModels = async () => {
        try {
          // ⭐ Default: fetch from fxflow (Server 2)
          const res = await pricingApi.getPricing({ tool: 'image', engine: 'fxflow' });
          if (res.success && res.data.length > 0) {
            setAvailableModels(res.data);
            // Default model: first available on fxflow
            setSelectedModel(res.data[0]);
            // Set default mode
            const firstModel = res.data[0];
            if (firstModel.modes && firstModel.modes.length > 0) {
              setSelectedMode(firstModel.modes.includes('VEO') ? 'VEO' : firstModel.modes[0]);
            } else {
              setSelectedMode(firstModel.mode || 'VEO');
            }
          } else {
            // Fallback to gommo if fxflow has no models
            const fallback = await pricingApi.getPricing({ tool: 'image' });
            if (fallback.success && fallback.data.length > 0) {
              setAvailableModels(fallback.data);
              setSelectedModel(fallback.data[0]);
            }
          }
        } catch (error) {
          console.error("Failed to fetch image pricing:", error);
        }
      };
      fetchModels();
      setGeneratedImage(null);
      setStatusText('Sẵn sàng');
    }
  }, [isOpen]);

  // Update mode when model changes
  useEffect(() => {
    if (selectedModel) {
      if (selectedModel.modes && selectedModel.modes.length > 0) {
        setSelectedMode(selectedModel.modes.includes('VEO') ? 'VEO' : selectedModel.modes[0]);
      } else {
        setSelectedMode(selectedModel.mode || 'VEO');
      }
    }
  }, [selectedModel]);

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
        setStatusText('✨ Hoàn tất');
        setGeneratedImage(response.data.result.images[0]);
        setIsGenerating(false);
        refreshUserInfo();
      } else if (jobStatus === 'failed' || (jobStatus as string) === 'error') {
        setIsGenerating(false);
        setStatusText('Lỗi tạo ảnh');
        alert("Máy chủ báo lỗi hoặc không thể tạo hình. Vui lòng thử lại.");
      } else {
        setStatusText(jobStatus === 'processing' ? '🎨 Đang render...' : '⏳ Đang xếp hàng...');
        setTimeout(() => pollJobStatus(jobId), 3000);
      }
    } catch (e) {
      console.error("Polling Error:", e);
      setIsGenerating(false);
      setStatusText('Lỗi kết nối');
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
    
    // ⭐ Skip credit check if user has free images
    if (freeImageRemaining <= 0 && usagePreference === 'credits' && credits < currentUnitCost) {
      alert(`Hạn ngạch không đủ (Cần ${currentUnitCost} credits)`);
      return;
    }

    setIsGenerating(true);
    setStatusText('⚡ Đang khởi tạo...');
    setGeneratedImage(null);

    try {
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
          provider: selectedModel.engine as any || "fxflow",
          model: selectedModel.modelKey as any
        },
        enginePayload: {
          prompt: prompt,
          privacy: "PRIVATE",
          projectId: "default",
          mode: selectedMode
        }
      };

      const res = await imagesApi.createJob(payload);
      if (res.success && res.data.jobId) {
        if (freeImageRemaining <= 0) useCredits(currentUnitCost);
        setStatusText('🎨 Đang kiến tạo...');
        pollJobStatus(res.data.jobId);
      } else {
        throw new Error(res.message || 'Khởi tạo Job thất bại');
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
    <>
      <style>{`
        @keyframes qimgPulse {
          0%   { box-shadow: 0 0 0 0 rgba(0,144,255,0.3); }
          70%  { box-shadow: 0 0 0 12px rgba(0,144,255,0); }
          100% { box-shadow: 0 0 0 0 rgba(0,144,255,0); }
        }
        @keyframes qimgShimmer {
          0%   { background-position: -200% center; }
          100% { background-position: 200% center; }
        }
      `}</style>

      <AnimatePresence>
        <div className="fixed inset-0 z-[800] flex items-center justify-center p-4">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="absolute inset-0"
            style={{ background: 'radial-gradient(ellipse, rgba(0,20,60,0.85), rgba(0,0,0,0.9))', backdropFilter: 'blur(12px)' }}
            onClick={onClose}
          />

          {/* Modal */}
          <motion.div
            initial={{ scale: 0.9, opacity: 0, y: 30 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 30 }}
            transition={{ type: 'spring', stiffness: 250, damping: 25 }}
            className="relative w-full max-w-lg overflow-hidden flex flex-col"
            style={{
              borderRadius: '1.5rem',
              background: 'linear-gradient(180deg, #0e101a 0%, #090b14 100%)',
              border: '1px solid rgba(255,255,255,0.06)',
              boxShadow: '0 32px 100px rgba(0,0,0,0.7), 0 0 60px rgba(0,144,255,0.08)',
              maxHeight: '92vh',
            }}
          >
            {/* ═══ HEADER ═══ */}
            <div className="p-5 flex items-center justify-between shrink-0"
              style={{ borderBottom: '1px solid rgba(255,255,255,0.04)', background: 'linear-gradient(180deg, rgba(0,144,255,0.04) 0%, transparent 100%)' }}
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center"
                  style={{ background: 'linear-gradient(135deg, rgba(0,144,255,0.2), rgba(139,92,246,0.1))', border: '1px solid rgba(0,144,255,0.2)' }}
                >
                  <Wand2 size={18} className="text-brand-blue" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white">Tạo Hình Ảnh AI</h3>
                  {freeImageRemaining > 0 ? (
                    <span className="text-[10px] font-bold text-emerald-400 flex items-center gap-1">
                      <Gift size={10} /> Còn {freeImageRemaining} ảnh miễn phí
                    </span>
                  ) : (
                    <span className="text-[10px] text-white/30">Server 2 · VEO Engine</span>
                  )}
                </div>
              </div>
              <button onClick={onClose} className="p-2 rounded-xl text-white/30 hover:text-white hover:bg-white/5 transition-all">
                <X size={18} />
              </button>
            </div>

            {/* ═══ CONTENT ═══ */}
            <div className="flex-1 overflow-y-auto p-5 space-y-5 no-scrollbar">

              {/* Generated Image Preview */}
              {generatedImage && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="rounded-xl overflow-hidden border border-emerald-500/20"
                  style={{ background: 'rgba(52,211,153,0.05)' }}
                >
                  <img src={generatedImage} className="w-full h-auto rounded-xl" alt="Generated" />
                  <div className="p-3 flex items-center justify-between">
                    <span className="text-[10px] font-bold text-emerald-400 flex items-center gap-1">
                      <Star size={10} fill="currentColor" /> Ảnh đã tạo thành công
                    </span>
                    <button
                      onClick={() => { setGeneratedImage(null); setPrompt(''); }}
                      className="text-[10px] font-bold text-white/40 hover:text-brand-blue transition-colors flex items-center gap-1"
                    >
                      Tạo thêm <ArrowRight size={10} />
                    </button>
                  </div>
                </motion.div>
              )}

              {/* Prompt */}
              <div className="space-y-2">
                <label className="text-[10px] font-bold uppercase tracking-[0.15em] text-white/30">Kịch bản (Prompt)</label>
                <textarea
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  placeholder="Mô tả hình ảnh bạn muốn tạo..."
                  className="w-full h-24 rounded-xl p-4 text-[13px] font-medium outline-none resize-none transition-all placeholder:text-white/15 text-white"
                  style={{
                    background: 'rgba(255,255,255,0.03)',
                    border: '1px solid rgba(255,255,255,0.06)',
                  }}
                  onFocus={e => (e.target.style.borderColor = 'rgba(0,144,255,0.3)')}
                  onBlur={e => (e.target.style.borderColor = 'rgba(255,255,255,0.06)')}
                />
              </div>

              {/* Prompt Suggestions */}
              {!prompt && (
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold uppercase tracking-[0.15em] text-white/20">Gợi ý</label>
                  <div className="flex flex-wrap gap-1.5">
                    {PROMPT_SUGGESTIONS.slice(0, 4).map((s, i) => (
                      <button
                        key={i}
                        onClick={() => setPrompt(s.replace(/^[^\s]+ /, ''))}
                        className="px-3 py-1.5 rounded-full text-[10px] font-medium text-white/40 transition-all hover:text-white/80"
                        style={{
                          background: 'rgba(255,255,255,0.03)',
                          border: '1px solid rgba(255,255,255,0.05)',
                        }}
                      >
                        {s}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Reference Images */}
              <div className="space-y-2">
                <label className="text-[10px] font-bold uppercase tracking-[0.15em] text-white/30">Ảnh tham chiếu</label>
                <div className="flex gap-2 items-center">
                  {references.map((ref, idx) => (
                    <div key={idx} className="relative w-14 h-14 rounded-xl overflow-hidden group"
                      style={{ border: '1px solid rgba(255,255,255,0.08)' }}
                    >
                      <img src={ref} className="w-full h-full object-cover" />
                      <button
                        onClick={() => setReferences(prev => prev.filter((_, i) => i !== idx))}
                        className="absolute inset-0 bg-red-500/70 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity rounded-xl"
                      >
                        <X size={12} className="text-white" />
                      </button>
                    </div>
                  ))}
                  {references.length < 3 && (
                    <button
                      onClick={() => fileInputRef.current?.click()}
                      className="w-14 h-14 rounded-xl flex items-center justify-center transition-all"
                      style={{
                        border: '2px dashed rgba(255,255,255,0.08)',
                        color: 'rgba(255,255,255,0.2)',
                      }}
                    >
                      {isUploading ? <Loader2 size={14} className="animate-spin" /> : <Plus size={16} />}
                    </button>
                  )}
                  <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleFileUpload} />
                </div>
              </div>

              {/* Config Grid */}
              <div className="grid grid-cols-3 gap-3">
                {/* Model */}
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold uppercase tracking-[0.15em] text-white/20">Model</label>
                  <div className="relative">
                    <select
                      value={selectedModel?._id || ''}
                      onChange={(e) => setSelectedModel(availableModels.find(m => m._id === e.target.value) || null)}
                      className="w-full rounded-xl p-2.5 text-[11px] font-bold appearance-none outline-none transition-all text-white"
                      style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}
                    >
                      {availableModels.map(m => (
                        <option key={m._id} value={m._id} style={{ background: '#0e101a' }}>{m.name}</option>
                      ))}
                    </select>
                    <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 text-white/20 pointer-events-none" size={12} />
                  </div>
                </div>

                {/* Ratio */}
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold uppercase tracking-[0.15em] text-white/20">Tỷ lệ</label>
                  <div className="relative">
                    <select
                      value={ratio}
                      onChange={(e) => setRatio(e.target.value)}
                      className="w-full rounded-xl p-2.5 text-[11px] font-bold outline-none appearance-none transition-all text-white"
                      style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}
                    >
                      {RATIOS.map(r => <option key={r} value={r} style={{ background: '#0e101a' }}>{r}</option>)}
                    </select>
                    <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 text-white/20 pointer-events-none" size={12} />
                  </div>
                </div>

                {/* Resolution */}
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold uppercase tracking-[0.15em] text-white/20">Phân giải</label>
                  <div className="relative">
                    <select
                      value={selectedRes}
                      onChange={(e) => setSelectedRes(e.target.value)}
                      className="w-full rounded-xl p-2.5 text-[11px] font-bold outline-none appearance-none transition-all text-white"
                      style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}
                    >
                      {['1k', '2k', '4k'].map(r => <option key={r} value={r} style={{ background: '#0e101a' }}>{r.toUpperCase()}</option>)}
                    </select>
                    <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 text-white/20 pointer-events-none" size={12} />
                  </div>
                </div>
              </div>
            </div>

            {/* ═══ FOOTER ═══ */}
            <div className="p-5 flex items-center justify-between shrink-0"
              style={{ borderTop: '1px solid rgba(255,255,255,0.04)', background: 'rgba(0,0,0,0.3)' }}
            >
              {/* Cost Info */}
              <div className="flex flex-col gap-1">
                <div className="flex items-center gap-2">
                  <Zap size={12} fill="currentColor" className={freeImageRemaining > 0 ? 'text-emerald-400' : 'text-amber-400'} />
                  <span className={`text-xs font-black ${freeImageRemaining > 0 ? 'text-emerald-400' : 'text-amber-400'}`}>
                    {freeImageRemaining > 0 ? 'MIỄN PHÍ' : `${currentUnitCost} CR`}
                  </span>
                </div>
                <div className="flex items-center gap-1.5 text-[9px] font-medium text-white/25">
                  <Activity size={9} className={isGenerating ? 'animate-pulse text-brand-blue' : ''} />
                  <span>{statusText}</span>
                </div>
              </div>

              {/* Generate Button */}
              <motion.button
                whileHover={{ scale: 1.02, y: -1 }}
                whileTap={{ scale: 0.97 }}
                onClick={handleGenerate}
                disabled={isGenerating || !prompt.trim()}
                className="px-7 py-3 rounded-xl text-xs font-bold text-white flex items-center gap-2 transition-all disabled:opacity-30"
                style={{
                  background: isGenerating ? 'rgba(0,144,255,0.3)' : 'linear-gradient(135deg, #0090ff, #0070cc)',
                  boxShadow: isGenerating || !prompt.trim() ? 'none' : '0 8px 24px rgba(0,144,255,0.3)',
                }}
              >
                {isGenerating ? (
                  <>
                    <Loader2 size={14} className="animate-spin" />
                    Đang tạo...
                  </>
                ) : (
                  <>
                    <Sparkles size={14} fill="currentColor" />
                    Kiến tạo
                  </>
                )}
              </motion.button>
            </div>
          </motion.div>
        </div>
      </AnimatePresence>
    </>
  );
};
