
import React, { useState, useRef, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Wand2, Zap, Plus, Loader2, Sparkles, ChevronDown, Activity, Gift, Image } from 'lucide-react';
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

const PROMPT_SUGGESTIONS = [
  { emoji: '🌟', text: 'Cô gái trong bộ áo dài truyền thống, nền hoa sen' },
  { emoji: '🏙️', text: 'Futuristic cyberpunk city at night, neon lights' },
  { emoji: '🎨', text: 'Oil painting of a serene landscape with mountains' },
  { emoji: '🐉', text: 'A majestic dragon flying over ancient temple ruins' },
  { emoji: '🌸', text: 'Japanese anime girl with sakura petals, pastel colors' },
  { emoji: '📸', text: 'Professional product photo of luxury watch on marble' },
];

// ── Particle config ────────────────────────────────────────────────────────────
const PARTICLES = [
  { x: '8%',  y: '12%', delay: 0,   dur: 3.2, color: '#a855f7', size: 3 },
  { x: '88%', y: '8%',  delay: 0.5, dur: 2.8, color: '#ec4899', size: 2 },
  { x: '18%', y: '82%', delay: 1.0, dur: 3.6, color: '#f97316', size: 2.5 },
  { x: '76%', y: '75%', delay: 1.4, dur: 2.6, color: '#6366f1', size: 2 },
  { x: '48%', y: '6%',  delay: 1.8, dur: 3.0, color: '#a855f7', size: 1.5 },
  { x: '92%', y: '45%', delay: 0.3, dur: 3.8, color: '#ec4899', size: 2 },
  { x: '5%',  y: '55%', delay: 2.2, dur: 2.4, color: '#f97316', size: 1.5 },
  { x: '60%', y: '90%', delay: 0.8, dur: 3.4, color: '#8b5cf6', size: 2.5 },
];

// ═══════════════════════════════════════════════════════════════════════════════
export const QuickImageGenModal: React.FC<QuickImageGenModalProps> = ({ isOpen, onClose, onSuccess }) => {
  const { credits, useCredits, isAuthenticated, login, refreshUserInfo, freeImageRemaining } = useAuth();

  const [availableModels, setAvailableModels] = useState<PricingModel[]>([]);
  const [selectedModel, setSelectedModel] = useState<PricingModel | null>(null);
  const [selectedRes, setSelectedRes] = useState('1k');
  const [selectedMode, setSelectedMode] = useState('VEO');
  const [prompt, setPrompt] = useState('');
  const [references, setReferences] = useState<string[]>([]);
  const [ratio, setRatio] = useState('1:1');
  const [isGenerating, setIsGenerating] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [statusText, setStatusText] = useState('Sẵn sàng');
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const usagePreference = useMemo(() => {
    return (localStorage.getItem('skyverses_usage_preference') as any) || 'credits';
  }, [isOpen]);

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

  useEffect(() => {
    if (isOpen) {
      const fetchModels = async () => {
        try {
          const res = await pricingApi.getPricing({ tool: 'image', engine: 'fxflow' });
          if (res.success && res.data.length > 0) {
            setAvailableModels(res.data);
            setSelectedModel(res.data[0]);
            const firstModel = res.data[0];
            if (firstModel.modes && firstModel.modes.length > 0) {
              setSelectedMode(firstModel.modes.includes('VEO') ? 'VEO' : firstModel.modes[0]);
            } else {
              setSelectedMode(firstModel.mode || 'VEO');
            }
          } else {
            const fallback = await pricingApi.getPricing({ tool: 'image' });
            if (fallback.success && fallback.data.length > 0) {
              setAvailableModels(fallback.data);
              setSelectedModel(fallback.data[0]);
            }
          }
        } catch (error) {
          console.error('Failed to fetch image pricing:', error);
        }
      };
      fetchModels();
      setGeneratedImage(null);
      setStatusText('Sẵn sàng');
    }
  }, [isOpen]);

  useEffect(() => {
    if (selectedModel) {
      if (selectedModel.modes && selectedModel.modes.length > 0) {
        setSelectedMode(selectedModel.modes.includes('VEO') ? 'VEO' : selectedModel.modes[0]);
      } else {
        setSelectedMode(selectedModel.mode || 'VEO');
      }
    }
  }, [selectedModel]);

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
        console.error('Upload failed', err);
      } finally {
        setIsUploading(false);
      }
    }
  };

  const handleGenerate = async () => {
    if (!prompt.trim() || isGenerating || !selectedModel) return;
    if (!isAuthenticated) { login(); return; }
    if (freeImageRemaining <= 0 && usagePreference === 'credits' && credits < currentUnitCost) {
      alert(`Hạn ngạch không đủ (Cần ${currentUnitCost} credits)`);
      return;
    }

    setIsGenerating(true);
    setStatusText('⚡ Đang khởi tạo...');
    setGeneratedImage(null);

    try {
      const payload: ImageJobRequest = {
        type: references.length > 0 ? 'image_to_image' : 'text_to_image',
        input: {
          prompt,
          images: references.length > 0 ? references : undefined,
        },
        config: {
          width: 1024,
          height: 1024,
          aspectRatio: ratio,
          seed: 0,
          style: 'cinematic',
        },
        engine: {
          provider: selectedModel.engine as any || 'fxflow',
          model: selectedModel.modelKey as any,
        },
        enginePayload: {
          prompt,
          privacy: 'PRIVATE',
          projectId: 'default',
          mode: selectedMode,
        },
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
      console.error('Generation failed', err);
      alert('Lỗi kiến tạo hình ảnh. Vui lòng thử lại.');
      setIsGenerating(false);
      setStatusText('Lỗi hệ thống');
    }
  };

  if (!isOpen) return null;

  return (
    <>
      <style>{`
        @keyframes qFloatUp {
          0%, 100% { transform: translateY(0) scale(1); opacity: 0.5; }
          50%       { transform: translateY(-18px) scale(1.4); opacity: 1; }
        }
        @keyframes qOrbit {
          from { transform: rotate(0deg); }
          to   { transform: rotate(360deg); }
        }
        @keyframes qOrbitRev {
          from { transform: rotate(0deg); }
          to   { transform: rotate(-360deg); }
        }
        @keyframes qPulseGlow {
          0%, 100% { opacity: 0.5; transform: scale(1); }
          50%       { opacity: 1;   transform: scale(1.08); }
        }
        @keyframes qShimmer {
          0%   { background-position: -200% center; }
          100% { background-position: 200% center; }
        }
        @keyframes qProgress {
          0%   { width: 4%;  }
          15%  { width: 20%; }
          40%  { width: 48%; }
          70%  { width: 72%; }
          100% { width: 93%; }
        }
        @keyframes qScanline {
          0%   { top: -10%; opacity: 0.6; }
          100% { top: 110%; opacity: 0; }
        }
        @keyframes qBorderSpin {
          0%   { background-position: 0% 50%;   }
          50%  { background-position: 100% 50%;  }
          100% { background-position: 0% 50%;   }
        }
        @keyframes qIdleShimmer {
          0%   { opacity: 0.04; }
          50%  { opacity: 0.10; }
          100% { opacity: 0.04; }
        }
        .q-gen-btn:not(:disabled):hover .q-btn-shine {
          animation: qShimmer 0.8s linear forwards;
        }
      `}</style>

      <AnimatePresence>
        {isOpen && (
          <div className="fixed inset-0 z-[800] flex items-center justify-center p-3 md:p-4">
            {/* ── Backdrop ── */}
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="absolute inset-0"
              style={{
                background: 'radial-gradient(ellipse at 40% 30%, rgba(139,92,246,0.18) 0%, rgba(0,0,0,0) 60%), radial-gradient(ellipse at 70% 80%, rgba(236,72,153,0.12) 0%, rgba(0,0,0,0) 55%), rgba(0,0,0,0.88)',
                backdropFilter: 'blur(14px)',
              }}
              onClick={onClose}
            />

            {/* ── Modal Shell ── */}
            <motion.div
              initial={{ scale: 0.88, opacity: 0, y: 24 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.88, opacity: 0, y: 24 }}
              transition={{ type: 'spring', stiffness: 280, damping: 26 }}
              className="relative w-full max-w-[480px] flex flex-col overflow-hidden"
              style={{
                borderRadius: '1.75rem',
                background: 'linear-gradient(160deg, #12091f 0%, #0d0919 50%, #09060f 100%)',
                border: '1px solid rgba(139,92,246,0.18)',
                boxShadow: '0 40px 120px rgba(0,0,0,0.85), 0 0 80px rgba(139,92,246,0.12), inset 0 1px 0 rgba(255,255,255,0.06)',
                maxHeight: '94vh',
              }}
            >
              {/* ── Ambient top glow ── */}
              <div className="absolute top-0 left-0 right-0 h-32 pointer-events-none"
                style={{
                  background: 'radial-gradient(ellipse at 50% 0%, rgba(139,92,246,0.22) 0%, transparent 70%)',
                  borderRadius: '1.75rem 1.75rem 0 0',
                }}
              />

              {/* ── Floating particles ── */}
              <div className="absolute inset-0 pointer-events-none overflow-hidden" style={{ borderRadius: '1.75rem' }}>
                {PARTICLES.map((p, i) => (
                  <div key={i}
                    className="absolute rounded-full"
                    style={{
                      left: p.x, top: p.y,
                      width: p.size, height: p.size,
                      background: p.color,
                      boxShadow: `0 0 ${p.size * 3}px ${p.color}`,
                      animation: `qFloatUp ${p.dur}s ease-in-out infinite ${p.delay}s`,
                    }}
                  />
                ))}
              </div>

              {/* ════════════════════════════════════════════
                  LOGIN GATE
              ════════════════════════════════════════════ */}
              <AnimatePresence>
                {!isAuthenticated && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.3 }}
                    className="absolute inset-0 z-40 flex flex-col items-center justify-center px-8"
                    style={{
                      background: 'linear-gradient(160deg, rgba(18,9,31,0.96) 0%, rgba(13,9,25,0.98) 100%)',
                      backdropFilter: 'blur(8px)',
                      borderRadius: '1.75rem',
                    }}
                  >
                    {/* Decorative rings */}
                    <div className="relative mb-6">
                      <div className="absolute -inset-8 rounded-full"
                        style={{ border: '1px solid rgba(139,92,246,0.1)', animation: 'qOrbit 8s linear infinite' }}
                      />
                      <div className="absolute -inset-14 rounded-full"
                        style={{ border: '1px solid rgba(236,72,153,0.07)', animation: 'qOrbitRev 12s linear infinite' }}
                      />
                      <div className="w-20 h-20 rounded-2xl flex items-center justify-center relative"
                        style={{
                          background: 'linear-gradient(135deg, rgba(139,92,246,0.25), rgba(236,72,153,0.15))',
                          border: '1px solid rgba(139,92,246,0.3)',
                          boxShadow: '0 0 40px rgba(139,92,246,0.25), inset 0 1px 0 rgba(255,255,255,0.1)',
                          animation: 'qPulseGlow 3s ease-in-out infinite',
                        }}
                      >
                        <Wand2 size={30} style={{ color: '#a855f7' }} />
                      </div>
                    </div>

                    <h3 className="text-[19px] font-black text-white text-center leading-tight mb-2 tracking-tight">
                      Tạo ảnh AI miễn phí
                    </h3>
                    <p className="text-[12px] text-white/40 text-center leading-relaxed mb-1">
                      Đăng nhập để bắt đầu ngay hôm nay
                    </p>

                    {/* Free badge */}
                    <div className="flex items-center gap-2 px-4 py-2 rounded-full mb-7 mt-1"
                      style={{
                        background: 'linear-gradient(135deg, rgba(16,185,129,0.15), rgba(16,185,129,0.08))',
                        border: '1px solid rgba(16,185,129,0.25)',
                      }}
                    >
                      <Gift size={12} className="text-emerald-400" />
                      <span className="text-[12px] font-bold text-emerald-400">50 ảnh miễn phí + 1,000 credits</span>
                    </div>

                    <motion.button
                      whileHover={{ scale: 1.02, y: -1 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={login}
                      className="w-full flex items-center justify-center gap-3 py-4 rounded-2xl text-[13px] font-bold text-white relative overflow-hidden"
                      style={{
                        background: 'linear-gradient(135deg, rgba(139,92,246,0.25), rgba(236,72,153,0.15))',
                        border: '1px solid rgba(139,92,246,0.3)',
                        boxShadow: '0 8px 32px rgba(139,92,246,0.2)',
                      }}
                    >
                      <img src="https://www.gstatic.com/images/branding/product/1x/gsa_512dp.png" className="w-5 h-5" alt="Google" />
                      Đăng nhập với Google
                    </motion.button>

                    <button onClick={onClose} className="mt-4 text-[11px] text-white/15 hover:text-white/35 transition-colors py-1">
                      Để sau
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* ════════════════════════════════════════════
                  GENERATING OVERLAY
              ════════════════════════════════════════════ */}
              <AnimatePresence>
                {isGenerating && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.35 }}
                    className="absolute inset-0 z-50 flex flex-col items-center justify-center"
                    style={{
                      background: 'linear-gradient(160deg, rgba(18,9,31,0.98) 0%, rgba(9,6,15,0.99) 100%)',
                      borderRadius: '1.75rem',
                    }}
                  >
                    {/* Grid bg */}
                    <div className="absolute inset-0 pointer-events-none overflow-hidden" style={{ borderRadius: '1.75rem' }}>
                      <div style={{
                        position: 'absolute', inset: 0,
                        backgroundImage: `linear-gradient(rgba(139,92,246,0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(139,92,246,0.05) 1px, transparent 1px)`,
                        backgroundSize: '36px 36px',
                        animation: 'qIdleShimmer 4s ease-in-out infinite',
                      }} />
                      {/* Scanline */}
                      <div style={{
                        position: 'absolute', left: 0, right: 0, height: '100px',
                        background: 'linear-gradient(180deg, transparent, rgba(139,92,246,0.07), transparent)',
                        animation: 'qScanline 3.5s ease-in-out infinite',
                      }} />
                    </div>

                    {/* Particles in loading */}
                    {PARTICLES.slice(0, 6).map((p, i) => (
                      <div key={i}
                        className="absolute rounded-full"
                        style={{
                          left: p.x, top: p.y,
                          width: p.size, height: p.size,
                          background: p.color,
                          boxShadow: `0 0 ${p.size * 3}px ${p.color}`,
                          animation: `qFloatUp ${p.dur}s ease-in-out infinite ${p.delay}s`,
                        }}
                      />
                    ))}

                    {/* Center icon + orbits */}
                    <div className="relative mb-8">
                      <div className="absolute -inset-7" style={{ animation: 'qOrbit 3.5s linear infinite' }}>
                        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-2.5 h-2.5 rounded-full"
                          style={{ background: '#a855f7', boxShadow: '0 0 10px rgba(168,85,247,0.8)' }} />
                      </div>
                      <div className="absolute -inset-12" style={{ animation: 'qOrbitRev 5s linear infinite' }}>
                        <div className="absolute bottom-2 right-2 w-2 h-2 rounded-full"
                          style={{ background: '#ec4899', boxShadow: '0 0 8px rgba(236,72,153,0.7)' }} />
                      </div>
                      <div className="absolute -inset-16" style={{ animation: 'qOrbit 7s linear infinite' }}>
                        <div className="absolute top-1/2 right-0 w-1.5 h-1.5 rounded-full"
                          style={{ background: '#f97316', boxShadow: '0 0 6px rgba(249,115,22,0.6)' }} />
                      </div>

                      {/* Glow */}
                      <div className="absolute -inset-10 rounded-full"
                        style={{ background: 'radial-gradient(circle, rgba(139,92,246,0.2) 0%, transparent 70%)' }}
                      />

                      <div className="relative w-18 h-18 w-[72px] h-[72px] rounded-2xl flex items-center justify-center"
                        style={{
                          background: 'linear-gradient(135deg, rgba(139,92,246,0.3), rgba(236,72,153,0.2))',
                          border: '1px solid rgba(139,92,246,0.35)',
                          boxShadow: '0 0 40px rgba(139,92,246,0.3)',
                          animation: 'qPulseGlow 2s ease-in-out infinite',
                        }}
                      >
                        <Wand2 size={28} style={{ color: '#a855f7' }} />
                      </div>
                    </div>

                    {/* Status */}
                    <motion.div
                      key={statusText}
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="text-center relative z-10"
                    >
                      <p className="text-base font-bold text-white mb-1.5">{statusText}</p>
                      <p className="text-[11px] text-white/30 max-w-[220px] leading-relaxed">
                        AI đang phân tích prompt và render hình ảnh. Quá trình mất 10–30 giây.
                      </p>
                    </motion.div>

                    {/* Progress bar */}
                    <div className="w-52 h-1 rounded-full mt-6 overflow-hidden relative z-10"
                      style={{ background: 'rgba(255,255,255,0.05)' }}
                    >
                      <div className="h-full rounded-full"
                        style={{
                          background: 'linear-gradient(90deg, #7c3aed, #ec4899, #f97316)',
                          backgroundSize: '200% 100%',
                          animation: 'qProgress 28s ease-out forwards, qShimmer 2s linear infinite',
                        }}
                      />
                    </div>

                    {/* Steps */}
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.4 }}
                      className="flex items-center gap-2.5 mt-5 relative z-10"
                    >
                      {[
                        { label: 'Prompt', done: true },
                        { label: 'GPU', done: statusText.includes('render') || statusText.includes('Hoàn') },
                        { label: 'Output', done: statusText.includes('Hoàn') },
                      ].map((step, i) => (
                        <div key={i} className="flex items-center gap-1.5">
                          <div className={`w-4 h-4 rounded-full flex items-center justify-center text-[8px] font-bold transition-all duration-500 ${
                            step.done
                              ? 'text-white'
                              : 'bg-white/5 text-white/20'
                          }`}
                            style={step.done ? { background: 'linear-gradient(135deg, #7c3aed, #ec4899)', boxShadow: '0 0 8px rgba(139,92,246,0.5)' } : {}}
                          >
                            {step.done ? '✓' : (i + 1)}
                          </div>
                          <span className={`text-[9px] font-bold transition-colors ${step.done ? 'text-violet-400' : 'text-white/15'}`}>
                            {step.label}
                          </span>
                          {i < 2 && <div className={`w-4 h-px transition-colors ${step.done ? 'bg-violet-400/40' : 'bg-white/5'}`} />}
                        </div>
                      ))}
                    </motion.div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* ════════════════════════════════════════════
                  HEADER
              ════════════════════════════════════════════ */}
              <div className="relative z-10 px-5 pt-5 pb-4 flex items-center justify-between shrink-0">
                <div className="flex items-center gap-3">
                  {/* Icon */}
                  <div className="w-11 h-11 rounded-2xl flex items-center justify-center relative"
                    style={{
                      background: 'linear-gradient(135deg, rgba(139,92,246,0.25), rgba(236,72,153,0.15))',
                      border: '1px solid rgba(139,92,246,0.25)',
                      boxShadow: '0 4px 20px rgba(139,92,246,0.2)',
                    }}
                  >
                    <Wand2 size={19} style={{ color: '#a855f7' }} />
                  </div>

                  <div>
                    <h3 className="text-[15px] font-black text-white tracking-tight">AI Image Studio</h3>
                    {freeImageRemaining > 0 ? (
                      <div className="flex items-center gap-1.5">
                        <div className="w-1.5 h-1.5 rounded-full bg-emerald-400" style={{ boxShadow: '0 0 6px rgba(52,211,153,0.8)' }} />
                        <span className="text-[10px] font-bold text-emerald-400">
                          {freeImageRemaining} ảnh miễn phí còn lại
                        </span>
                      </div>
                    ) : (
                      <span className="text-[10px] text-white/25">Server 2 · VEO Engine</span>
                    )}
                  </div>
                </div>

                <button onClick={onClose}
                  className="w-8 h-8 rounded-xl flex items-center justify-center text-white/25 hover:text-white transition-all"
                  style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.06)' }}
                >
                  <X size={15} />
                </button>
              </div>

              {/* Divider */}
              <div className="mx-5 shrink-0" style={{ height: '1px', background: 'linear-gradient(90deg, transparent, rgba(139,92,246,0.15), rgba(236,72,153,0.1), transparent)' }} />

              {/* ════════════════════════════════════════════
                  CONTENT
              ════════════════════════════════════════════ */}
              <div className="relative z-10 flex-1 overflow-y-auto no-scrollbar px-5 py-4 space-y-4">

                {/* Preview */}
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
                  <div className="flex items-center justify-between">
                    <label className="text-[10px] font-bold uppercase tracking-[0.15em] text-white/30">
                      Mô tả hình ảnh
                    </label>
                    <span className="text-[9px] text-white/15">{prompt.length}/500</span>
                  </div>

                  {/* Glowing textarea wrapper */}
                  <div className="relative rounded-xl overflow-hidden"
                    style={{ background: 'rgba(139,92,246,0.04)', border: '1px solid rgba(139,92,246,0.12)' }}
                  >
                    <textarea
                      value={prompt}
                      onChange={(e) => setPrompt(e.target.value.slice(0, 500))}
                      placeholder="Mô tả hình ảnh bạn muốn tạo... VD: Cô gái mặc áo dài đỏ đứng trước Hồ Gươm lúc hoàng hôn, phong cách anime, ánh sáng vàng ấm áp"
                      className="w-full h-24 p-3.5 text-[12.5px] font-medium outline-none resize-none placeholder:text-white/15 text-white bg-transparent"
                      maxLength={500}
                    />
                    {/* Corner sparkle */}
                    <div className="absolute bottom-2.5 right-3 pointer-events-none">
                      <Sparkles size={12} style={{ color: 'rgba(139,92,246,0.3)' }} />
                    </div>
                  </div>
                </div>

                {/* Prompt Suggestions */}
                <AnimatePresence>
                  {!prompt && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      transition={{ duration: 0.2 }}
                      className="space-y-2 overflow-hidden"
                    >
                      <label className="text-[10px] font-bold uppercase tracking-[0.15em] text-white/20">
                        ✨ Thử ngay
                      </label>
                      <div className="flex flex-wrap gap-1.5">
                        {PROMPT_SUGGESTIONS.slice(0, 4).map((s, i) => (
                          <motion.button
                            key={i}
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.97 }}
                            onClick={() => setPrompt(s.text)}
                            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[10px] font-medium text-white/40 hover:text-white/75 transition-all"
                            style={{
                              background: 'rgba(139,92,246,0.05)',
                              border: '1px solid rgba(139,92,246,0.1)',
                            }}
                          >
                            <span>{s.emoji}</span>
                            <span className="truncate max-w-[140px]">{s.text.slice(0, 28)}…</span>
                          </motion.button>
                        ))}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Reference Images */}
                <div className="space-y-2">
                  <label className="text-[10px] font-bold uppercase tracking-[0.15em] text-white/25">
                    Ảnh tham chiếu <span className="text-white/15 normal-case font-normal">(tùy chọn)</span>
                  </label>
                  <div className="flex gap-2 items-center">
                    {references.map((ref, idx) => (
                      <div key={idx} className="relative w-14 h-14 rounded-xl overflow-hidden group"
                        style={{ border: '1px solid rgba(139,92,246,0.15)' }}
                      >
                        <img src={ref} className="w-full h-full object-cover" />
                        <button
                          onClick={() => setReferences(prev => prev.filter((_, i) => i !== idx))}
                          className="absolute inset-0 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity rounded-xl"
                          style={{ background: 'rgba(239,68,68,0.7)' }}
                        >
                          <X size={12} className="text-white" />
                        </button>
                      </div>
                    ))}
                    {references.length < 3 && (
                      <button
                        onClick={() => fileInputRef.current?.click()}
                        className="w-14 h-14 rounded-xl flex flex-col items-center justify-center gap-1 transition-all hover:border-violet-400/30"
                        style={{
                          border: '2px dashed rgba(139,92,246,0.15)',
                          color: 'rgba(255,255,255,0.2)',
                        }}
                      >
                        {isUploading
                          ? <Loader2 size={14} className="animate-spin" style={{ color: '#a855f7' }} />
                          : <>
                              <Plus size={14} />
                              <span className="text-[8px]">Upload</span>
                            </>
                        }
                      </button>
                    )}
                    <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleFileUpload} />
                  </div>
                </div>

                {/* Config Row */}
                <div className="grid grid-cols-3 gap-2.5">
                  {/* Model */}
                  <div className="space-y-1.5">
                    <label className="text-[9px] font-bold uppercase tracking-[0.1em] text-white/20">Model</label>
                    <div className="relative">
                      <select
                        value={selectedModel?._id || ''}
                        onChange={(e) => setSelectedModel(availableModels.find(m => m._id === e.target.value) || null)}
                        className="w-full rounded-xl px-2.5 py-2 text-[10.5px] font-bold appearance-none outline-none text-white"
                        style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)' }}
                      >
                        {availableModels.map(m => (
                          <option key={m._id} value={m._id} style={{ background: '#0d0919' }}>{m.name}</option>
                        ))}
                      </select>
                      <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 text-white/20 pointer-events-none" size={10} />
                    </div>
                  </div>

                  {/* Ratio */}
                  <div className="space-y-1.5">
                    <label className="text-[9px] font-bold uppercase tracking-[0.1em] text-white/20">Tỷ lệ</label>
                    <div className="relative">
                      <select
                        value={ratio}
                        onChange={(e) => setRatio(e.target.value)}
                        className="w-full rounded-xl px-2.5 py-2 text-[10.5px] font-bold outline-none appearance-none text-white"
                        style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)' }}
                      >
                        {RATIOS.map(r => <option key={r} value={r} style={{ background: '#0d0919' }}>{r}</option>)}
                      </select>
                      <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 text-white/20 pointer-events-none" size={10} />
                    </div>
                  </div>

                  {/* Resolution */}
                  <div className="space-y-1.5">
                    <label className="text-[9px] font-bold uppercase tracking-[0.1em] text-white/20">Phân giải</label>
                    <div className="relative">
                      <select
                        value={selectedRes}
                        onChange={(e) => setSelectedRes(e.target.value)}
                        className="w-full rounded-xl px-2.5 py-2 text-[10.5px] font-bold outline-none appearance-none text-white"
                        style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)' }}
                      >
                        {['1k', '2k', '4k'].map(r => <option key={r} value={r} style={{ background: '#0d0919' }}>{r.toUpperCase()}</option>)}
                      </select>
                      <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 text-white/20 pointer-events-none" size={10} />
                    </div>
                  </div>
                </div>
              </div>

              {/* ════════════════════════════════════════════
                  FOOTER
              ════════════════════════════════════════════ */}
              <div className="relative z-10 px-5 py-4 shrink-0"
                style={{ borderTop: '1px solid rgba(139,92,246,0.08)', background: 'rgba(0,0,0,0.25)' }}
              >
                <div className="flex items-center justify-between gap-3">
                  {/* Cost + status */}
                  <div className="flex flex-col gap-0.5">
                    <div className="flex items-center gap-1.5">
                      {freeImageRemaining > 0 ? (
                        <>
                          <Gift size={11} className="text-emerald-400" />
                          <span className="text-[11px] font-black text-emerald-400">MIỄN PHÍ</span>
                        </>
                      ) : (
                        <>
                          <Zap size={11} fill="currentColor" className="text-amber-400" />
                          <span className="text-[11px] font-black text-amber-400">{currentUnitCost} Credits</span>
                        </>
                      )}
                    </div>
                    <div className="flex items-center gap-1 text-[9px] text-white/20">
                      <Activity size={8} className={isGenerating ? 'animate-pulse text-violet-400' : ''} />
                      <span>{statusText}</span>
                    </div>
                  </div>

                  {/* Generate button */}
                  <motion.button
                    whileHover={{ scale: 1.02, y: -1 }}
                    whileTap={{ scale: 0.97 }}
                    onClick={handleGenerate}
                    disabled={isGenerating || !prompt.trim()}
                    className="q-gen-btn relative flex items-center gap-2 px-6 py-3 rounded-xl text-[12px] font-black text-white overflow-hidden disabled:opacity-30 transition-all"
                    style={{
                      background: isGenerating || !prompt.trim()
                        ? 'rgba(139,92,246,0.2)'
                        : 'linear-gradient(135deg, #7c3aed 0%, #a855f7 40%, #ec4899 80%, #f97316 100%)',
                      boxShadow: isGenerating || !prompt.trim()
                        ? 'none'
                        : '0 6px 28px rgba(139,92,246,0.45), 0 2px 8px rgba(236,72,153,0.25)',
                    }}
                  >
                    {/* Shine overlay */}
                    <div
                      className="q-btn-shine absolute inset-0 pointer-events-none"
                      style={{
                        background: 'linear-gradient(105deg, transparent 30%, rgba(255,255,255,0.18) 50%, transparent 70%)',
                        backgroundSize: '200% 100%',
                        backgroundPosition: '-200% center',
                      }}
                    />

                    {isGenerating ? (
                      <>
                        <Loader2 size={13} className="animate-spin" />
                        <span>Đang tạo...</span>
                      </>
                    ) : (
                      <>
                        <Sparkles size={13} fill="currentColor" />
                        <span>Kiến tạo</span>
                      </>
                    )}
                  </motion.button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
};
