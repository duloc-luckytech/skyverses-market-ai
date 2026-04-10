
import React, { useState, useRef, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Wand2, Zap, Plus, Loader2, Sparkles, ChevronDown, Activity, Gift, Image, Camera } from 'lucide-react';
import { ImageJobCard } from './shared/ImageJobCard';
import { uploadToGCS } from '../services/storage';
import { useAuth } from '../context/AuthContext';
import { pricingApi, PricingModel } from '../apis/pricing';
import { imagesApi, ImageJobRequest } from '../apis/images';
import { useJobPoller } from '../hooks/useJobPoller';

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

  // ─── Shared polling via useJobPoller ────────────────────────────────────────
  const poller = useJobPoller(
    {
      onDone: (result) => {
        const url = result.images?.[0] ?? null;
        if (url) {
          setStatusText('✨ Hoàn tất');
          setGeneratedImage(url);
          refreshUserInfo();
        } else {
          setStatusText('Lỗi tạo ảnh');
          alert('Máy chủ không trả về hình ảnh. Vui lòng thử lại.');
        }
        setIsGenerating(false);
      },
      onError: () => {
        setIsGenerating(false);
        setStatusText('Lỗi tạo ảnh');
        alert('Máy chủ báo lỗi hoặc không thể tạo hình. Vui lòng thử lại.');
      },
      onTimeout: () => {
        setIsGenerating(false);
        setStatusText('Hết thời gian chờ');
      },
      onTick: ({ tickCount }) => {
        setStatusText(tickCount <= 2 ? '⏳ Đang xếp hàng...' : '🎨 Đang render...');
      },
    },
    { apiType: 'image', intervalMs: 3000, maxDurationMs: 180_000 },
  );

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
        poller.startPolling(res.data.jobId);
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
        @keyframes qimgOrbit {
          from { transform: rotate(0deg); }
          to   { transform: rotate(360deg); }
        }
        @keyframes qimgScanline {
          0%   { transform: translateY(-100%); }
          100% { transform: translateY(100%); }
        }
        @keyframes qimgFloat {
          0%, 100% { transform: translateY(0) scale(1); opacity: 0.4; }
          50%       { transform: translateY(-20px) scale(1.3); opacity: 0.9; }
        }
        @keyframes qimgProgress {
          0%   { width: 5%; }
          20%  { width: 25%; }
          50%  { width: 55%; }
          80%  { width: 80%; }
          100% { width: 95%; }
        }
        @keyframes qimgBreath {
          0%, 100% { transform: scale(1); opacity: 0.8; }
          50%       { transform: scale(1.12); opacity: 1; }
        }
        @keyframes qimgGridPulse {
          0%, 100% { opacity: 0.03; }
          50%       { opacity: 0.07; }
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
            {/* ═══ AI LOADING OVERLAY ═══ */}
            <AnimatePresence>
              {isGenerating && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.4 }}
                  className="absolute inset-0 z-50 flex flex-col items-center justify-center"
                  style={{
                    background: 'linear-gradient(180deg, rgba(8,10,20,0.97) 0%, rgba(6,8,18,0.99) 100%)',
                    borderRadius: '1.5rem',
                  }}
                >
                  {/* Animated Grid Background */}
                  <div className="absolute inset-0 overflow-hidden pointer-events-none" style={{ borderRadius: '1.5rem' }}>
                    <div style={{
                      position: 'absolute', inset: 0,
                      backgroundImage: `
                        linear-gradient(rgba(0,144,255,0.04) 1px, transparent 1px),
                        linear-gradient(90deg, rgba(0,144,255,0.04) 1px, transparent 1px)
                      `,
                      backgroundSize: '40px 40px',
                      animation: 'qimgGridPulse 4s ease-in-out infinite',
                    }} />
                    {/* Scanline */}
                    <div style={{
                      position: 'absolute', left: 0, right: 0, height: '120px',
                      background: 'linear-gradient(180deg, transparent, rgba(0,144,255,0.06), transparent)',
                      animation: 'qimgScanline 3s ease-in-out infinite',
                    }} />
                  </div>

                  {/* Floating Particles */}
                  {[
                    { x: '15%', y: '20%', d: 0, color: 'bg-brand-blue', size: 'w-1.5 h-1.5' },
                    { x: '80%', y: '15%', d: 0.4, color: 'bg-violet-400', size: 'w-1 h-1' },
                    { x: '25%', y: '75%', d: 0.8, color: 'bg-cyan-400', size: 'w-1 h-1' },
                    { x: '70%', y: '80%', d: 1.2, color: 'bg-emerald-400', size: 'w-1.5 h-1.5' },
                    { x: '50%', y: '10%', d: 1.6, color: 'bg-amber-400', size: 'w-1 h-1' },
                    { x: '90%', y: '50%', d: 2.0, color: 'bg-pink-400', size: 'w-1 h-1' },
                  ].map((p, i) => (
                    <div key={i}
                      className={`absolute rounded-full ${p.color} ${p.size}`}
                      style={{ left: p.x, top: p.y, animation: `qimgFloat ${2.5 + i * 0.3}s ease-in-out infinite ${p.d}s` }}
                    />
                  ))}

                  {/* Center: Icon + Orbit */}
                  <div className="relative mb-8">
                    {/* Orbit Ring */}
                    <div className="absolute -inset-6" style={{ animation: 'qimgOrbit 4s linear infinite' }}>
                      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-2 h-2 rounded-full bg-brand-blue shadow-lg" style={{ boxShadow: '0 0 12px rgba(0,144,255,0.6)' }} />
                    </div>
                    <div className="absolute -inset-10" style={{ animation: 'qimgOrbit 6s linear infinite reverse' }}>
                      <div className="absolute bottom-0 right-0 w-1.5 h-1.5 rounded-full bg-violet-400 shadow-lg" style={{ boxShadow: '0 0 10px rgba(139,92,246,0.5)' }} />
                    </div>

                    {/* Glow */}
                    <div className="absolute -inset-8 rounded-full" style={{ background: 'radial-gradient(circle, rgba(0,144,255,0.15) 0%, transparent 70%)' }} />

                    {/* Icon */}
                    <div className="relative w-16 h-16 rounded-2xl flex items-center justify-center"
                      style={{
                        background: 'linear-gradient(135deg, rgba(0,144,255,0.2), rgba(139,92,246,0.1))',
                        border: '1px solid rgba(0,144,255,0.25)',
                        animation: 'qimgBreath 2.5s ease-in-out infinite',
                        boxShadow: '0 8px 32px rgba(0,144,255,0.2)',
                      }}
                    >
                      <Wand2 size={26} className="text-brand-blue" />
                    </div>
                  </div>

                  {/* Status Text */}
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="text-center relative z-10"
                  >
                    <p className="text-base font-bold text-white mb-1">
                      {statusText}
                    </p>
                    <p className="text-[11px] text-white/25 max-w-[240px] leading-relaxed">
                      AI đang phân tích prompt và render hình ảnh của bạn. Quá trình này có thể mất 10-30 giây.
                    </p>
                  </motion.div>

                  {/* Progress Bar */}
                  <div className="w-48 h-1 rounded-full mt-6 overflow-hidden relative z-10"
                    style={{ background: 'rgba(255,255,255,0.04)' }}
                  >
                    <div className="h-full rounded-full"
                      style={{
                        background: 'linear-gradient(90deg, #0090ff, #7c3aed, #0090ff)',
                        backgroundSize: '200% 100%',
                        animation: 'qimgProgress 25s ease-out forwards, qimgShimmer 1.5s linear infinite',
                      }}
                    />
                  </div>

                  {/* Pipeline Steps */}
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.5 }}
                    className="flex items-center gap-3 mt-5 relative z-10"
                  >
                    {[
                      { label: 'Prompt', done: true },
                      { label: 'GPU', done: statusText.includes('render') || statusText.includes('Hoàn') },
                      { label: 'Output', done: statusText.includes('Hoàn') },
                    ].map((step, i) => (
                      <div key={i} className="flex items-center gap-1.5">
                        <div className={`w-4 h-4 rounded-full flex items-center justify-center text-[8px] font-bold transition-all duration-500 ${
                          step.done
                            ? 'bg-brand-blue text-white shadow-sm shadow-brand-blue/30'
                            : 'bg-white/5 text-white/20'
                        }`}
                        >
                          {step.done ? '✓' : (i + 1)}
                        </div>
                        <span className={`text-[9px] font-bold transition-colors ${step.done ? 'text-brand-blue' : 'text-white/15'}`}>
                          {step.label}
                        </span>
                        {i < 2 && <div className={`w-4 h-px transition-colors ${step.done ? 'bg-brand-blue/40' : 'bg-white/5'}`} />}
                      </div>
                    ))}
                  </motion.div>
                </motion.div>
              )}
            </AnimatePresence>

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
              <ImageJobCard
                status={isGenerating ? 'processing' : generatedImage ? 'done' : 'idle'}
                resultUrl={generatedImage ?? undefined}
                statusText={statusText}
                mode="full"
                aspectRatio="1/1"
                downloadFilename={`skyverses_${Date.now()}`}
                onReset={() => { setGeneratedImage(null); setPrompt(''); }}
              />

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
