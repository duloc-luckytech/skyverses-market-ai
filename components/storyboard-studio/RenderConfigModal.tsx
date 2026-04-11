import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X, Zap, ShieldCheck, Film, ImageIcon, Settings2,
  ChevronRight, Loader2, Check, Package, Monitor, Clock
} from 'lucide-react';
import { pricingApi, PricingModel } from '../../apis/pricing';
import { useToast } from '../../context/ToastContext';

interface RenderConfigModalProps {
  isOpen: boolean;
  onClose: () => void;
  settings: any;
  setSettings: (updates: any) => void;
}

type Tab = 'video' | 'image' | 'export';

// ─── VIDEO MODEL CARD ────────────────────────────────────────────────────────
interface ModelCardProps {
  model: PricingModel;
  isSelected: boolean;
  onSelect: () => void;
  accentColor: string;
}

const VIDEO_MODEL_ACCENT: Record<string, { color: string; glow: string; badge: string }> = {
  veo3:    { color: 'from-brand-blue to-cyan-400',   glow: 'shadow-brand-blue/25',   badge: 'Google' },
  wan:     { color: 'from-purple-500 to-violet-400', glow: 'shadow-purple-500/25',   badge: 'Wan AI' },
  kling:   { color: 'from-rose-500 to-pink-400',     glow: 'shadow-rose-500/25',     badge: 'Kuaishou' },
  hailuo:  { color: 'from-amber-500 to-orange-400',  glow: 'shadow-amber-500/25',    badge: 'MiniMax' },
  default: { color: 'from-slate-500 to-slate-400',   glow: 'shadow-slate-500/10',    badge: 'AI' },
};

const ModelCard: React.FC<ModelCardProps & { type: 'video' | 'image' }> = ({ model, isSelected, onSelect, type }) => {
  const key = model.modelKey?.split('_')[0]?.toLowerCase() ?? 'default';
  const accent = VIDEO_MODEL_ACCENT[key] ?? VIDEO_MODEL_ACCENT.default;
  
  // Get cheapest price for display
  const minPrice = useMemo(() => {
    if (!model.pricing) return null;
    const prices: number[] = [];
    if (type === 'video') {
      Object.values(model.pricing).forEach((resObj: any) => {
        Object.values(resObj).forEach((p: any) => prices.push(Number(p)));
      });
    } else {
      prices.push(...Object.values(model.pricing).map(Number));
    }
    return prices.length > 0 ? Math.min(...prices) : null;
  }, [model.pricing, type]);

  return (
    <button
      onClick={onSelect}
      className={`relative w-full text-left rounded-2xl overflow-hidden border-2 transition-all duration-300 group ${
        isSelected
          ? 'border-brand-blue shadow-xl shadow-brand-blue/15 scale-[1.01]'
          : 'border-slate-200 dark:border-white/8 hover:border-brand-blue/40 hover:shadow-lg'
      }`}
    >
      {/* Gradient header */}
      <div className={`h-2 w-full bg-gradient-to-r ${accent.color} ${isSelected ? 'opacity-100' : 'opacity-40 group-hover:opacity-70'} transition-opacity`} />
      
      <div className="bg-white dark:bg-[#0f0f14] p-4 space-y-2">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-xs font-black uppercase tracking-tight text-slate-800 dark:text-white">{model.name}</p>
            <p className="text-[9px] font-bold text-slate-400 dark:text-gray-500 mt-0.5">{accent.badge}</p>
          </div>
          <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all shrink-0 mt-0.5 ${
            isSelected ? 'bg-brand-blue border-brand-blue' : 'border-slate-300 dark:border-white/20'
          }`}>
            {isSelected && <Check size={11} strokeWidth={3.5} className="text-white" />}
          </div>
        </div>

        {minPrice !== null && (
          <div className="flex items-center gap-1">
            <span className="text-brand-blue text-xs font-black">{minPrice}</span>
            <span className="text-[8px] font-bold text-slate-400 dark:text-gray-500">credits/lần</span>
          </div>
        )}
      </div>
    </button>
  );
};

// ─── PILL SELECTOR ───────────────────────────────────────────────────────────
const PillSelector: React.FC<{
  label: string;
  options: string[];
  value: string;
  onChange: (v: string) => void;
  formatLabel?: (v: string) => string;
}> = ({ label, options, value, onChange, formatLabel }) => (
  <div className="space-y-2.5">
    <p className="text-[9px] font-black uppercase tracking-[0.3em] text-slate-400 dark:text-gray-600">{label}</p>
    <div className="flex flex-wrap gap-2">
      {options.map((opt) => (
        <button
          key={opt}
          onClick={() => onChange(opt)}
          className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all border ${
            value === opt
              ? 'bg-brand-blue text-white border-brand-blue shadow-md shadow-brand-blue/20'
              : 'bg-slate-50 dark:bg-white/5 border-slate-200 dark:border-white/8 text-slate-500 dark:text-gray-400 hover:border-brand-blue/40 hover:text-brand-blue dark:hover:text-white'
          }`}
        >
          {formatLabel ? formatLabel(opt) : opt}
        </button>
      ))}
    </div>
  </div>
);

// ─── MAIN MODAL ──────────────────────────────────────────────────────────────
export const RenderConfigModal: React.FC<RenderConfigModalProps> = ({
  isOpen, onClose, settings, setSettings
}) => {
  const { showToast } = useToast();
  const [activeTab, setActiveTab] = useState<Tab>('video');
  const [imageModels, setImageModels] = useState<PricingModel[]>([]);
  const [videoModels, setVideoModels] = useState<PricingModel[]>([]);
  const [loading, setLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  const handleSave = useCallback(() => {
    setIsSaving(true);
    setSaveSuccess(false);
    setTimeout(() => {
      setIsSaving(false);
      setSaveSuccess(true);
      showToast('✓ Đã lưu cấu hình render', 'success');
      setTimeout(() => {
        setSaveSuccess(false);
        onClose();
      }, 600);
    }, 300);
  }, [onClose, showToast]);

  useEffect(() => {
    if (!isOpen) return;
    const fetchModels = async () => {
      setLoading(true);
      try {
        const [imgRes, vidRes] = await Promise.all([
          pricingApi.getPricing({ tool: 'image' }),
          pricingApi.getPricing({ tool: 'video' }),
        ]);
        if (imgRes.success) setImageModels(imgRes.data);
        if (vidRes.success) setVideoModels(vidRes.data);
      } catch (_) {}
      finally { setLoading(false); }
    };
    fetchModels();
  }, [isOpen]);

  const currentVideoModel = useMemo(
    () => videoModels.find((m) => m.modelKey === settings.model) ?? videoModels[0],
    [videoModels, settings.model]
  );

  const availableResolutions = useMemo(() => {
    if (!currentVideoModel?.pricing) return ['720p', '1080p'];
    return Object.keys(currentVideoModel.pricing);
  }, [currentVideoModel]);

  const availableDurations = useMemo(() => {
    if (!currentVideoModel?.pricing) return ['5', '8', '10'];
    const firstRes = Object.keys(currentVideoModel.pricing)[0];
    return Object.keys(currentVideoModel.pricing[firstRes] ?? {});
  }, [currentVideoModel]);

  const handleChange = (key: string, value: any) => setSettings({ ...settings, [key]: value });

  const TABS: { id: Tab; label: string; icon: React.ReactNode }[] = [
    { id: 'video',  label: 'Video Engine',  icon: <Film size={15} /> },
    { id: 'image',  label: 'Image Engine',  icon: <ImageIcon size={15} /> },
    { id: 'export', label: 'Export & Privacy', icon: <Package size={15} /> },
  ];

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[700] flex items-center justify-center p-4">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/60 dark:bg-black/80 backdrop-blur-md"
            onClick={onClose}
          />

          {/* Modal */}
          <motion.div
            initial={{ scale: 0.95, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.95, opacity: 0, y: 20 }}
            transition={{ type: 'spring', damping: 30, stiffness: 400 }}
            className="relative w-full max-w-3xl bg-[#fafafa] dark:bg-[#0c0c10] rounded-[2rem] overflow-hidden shadow-[0_50px_120px_rgba(0,0,0,0.4)] flex flex-col max-h-[88vh] border border-black/8 dark:border-white/8"
          >
            {/* Header */}
            <div className="px-7 pt-7 pb-0 shrink-0">
              <div className="flex items-start justify-between mb-6">
                <div className="flex items-center gap-4">
                  <div className="w-11 h-11 bg-brand-blue rounded-xl flex items-center justify-center text-white shadow-lg shadow-brand-blue/30">
                    <Settings2 size={20} />
                  </div>
                  <div>
                    <h3 className="text-xl font-black uppercase italic tracking-tighter text-slate-900 dark:text-white leading-none">
                      Render Configuration
                    </h3>
                    <p className="text-[10px] font-bold text-slate-400 dark:text-gray-500 uppercase tracking-widest mt-1">
                      Cấu hình mô hình, độ phân giải & xuất bản
                    </p>
                  </div>
                </div>
                <button
                  onClick={onClose}
                  aria-label="Đóng cấu hình render"
                  className="p-2 text-slate-400 hover:text-red-500 transition-colors rounded-xl hover:bg-red-50 dark:hover:bg-red-500/10"
                >
                  <X size={22} />
                </button>
              </div>

              {/* Tabs */}
              <div className="flex gap-1 bg-slate-100 dark:bg-black/40 p-1 rounded-xl border border-slate-200 dark:border-white/5">
                {TABS.map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${
                      activeTab === tab.id
                        ? 'bg-white dark:bg-[#1a1a1f] text-brand-blue shadow-md'
                        : 'text-slate-400 dark:text-gray-600 hover:text-slate-700 dark:hover:text-white'
                    }`}
                  >
                    {tab.icon}
                    <span className="hidden sm:inline">{tab.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Content */}
            <div className="flex-grow overflow-y-auto p-7 no-scrollbar">
              {loading ? (
                <div className="py-16 flex flex-col items-center gap-4">
                  <Loader2 className="w-9 h-9 text-brand-blue animate-spin" />
                  <p className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-400 animate-pulse italic">
                    Đang tải danh sách mô hình...
                  </p>
                </div>
              ) : (
                <AnimatePresence mode="wait">
                  {/* ── TAB: VIDEO ENGINE ─────────────────────────── */}
                  {activeTab === 'video' && (
                    <motion.div
                      key="video"
                      initial={{ opacity: 0, x: -12 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 12 }}
                      className="space-y-8"
                    >
                      {/* Model cards */}
                      <div className="space-y-3">
                        <p className="text-[9px] font-black uppercase tracking-[0.35em] text-slate-400 dark:text-gray-600">Chọn mô hình video</p>
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                          {videoModels.length > 0
                            ? videoModels.map((m) => (
                                <ModelCard
                                  key={m._id}
                                  model={m}
                                  isSelected={settings.model === m.modelKey}
                                  onSelect={() => handleChange('model', m.modelKey)}
                                  accentColor=""
                                  type="video"
                                />
                              ))
                            : Array.from({ length: 4 }).map((_, i) => (
                                <div key={i} className="h-24 bg-slate-100 dark:bg-white/5 rounded-2xl animate-pulse" />
                              ))
                          }
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                        {/* Resolution */}
                        <PillSelector
                          label="Độ phân giải"
                          options={availableResolutions}
                          value={settings.resolution ?? availableResolutions[0]}
                          onChange={(v) => handleChange('resolution', v)}
                          formatLabel={(v) => v.toUpperCase()}
                        />
                        {/* Duration */}
                        <PillSelector
                          label="Thời lượng"
                          options={availableDurations}
                          value={settings.duration ?? availableDurations[0]}
                          onChange={(v) => handleChange('duration', v)}
                          formatLabel={(v) => `${v}s`}
                        />
                      </div>

                      {/* Aspect ratio */}
                      <div className="space-y-3">
                        <p className="text-[9px] font-black uppercase tracking-[0.35em] text-slate-400 dark:text-gray-600">Tỉ lệ khung hình</p>
                        <div className="flex gap-3">
                          {[
                            { val: '16:9', label: '16:9', shape: 'w-14 h-8' },
                            { val: '9:16', label: '9:16', shape: 'w-7 h-14' },
                            { val: '1:1',  label: '1:1',  shape: 'w-10 h-10' },
                          ].map((r) => (
                            <button
                              key={r.val}
                              onClick={() => handleChange('aspectRatio', r.val)}
                              className={`flex flex-col items-center gap-2.5 p-4 rounded-2xl border-2 transition-all ${
                                (settings.aspectRatio ?? '16:9') === r.val
                                  ? 'border-brand-blue bg-brand-blue/5'
                                  : 'border-slate-200 dark:border-white/8 hover:border-brand-blue/30'
                              }`}
                            >
                              <div className={`${r.shape} border-2 rounded-sm ${(settings.aspectRatio ?? '16:9') === r.val ? 'border-brand-blue bg-brand-blue/20' : 'border-slate-300 dark:border-white/20 bg-slate-100 dark:bg-white/5'} transition-all`} />
                              <span className={`text-[9px] font-black uppercase tracking-widest ${(settings.aspectRatio ?? '16:9') === r.val ? 'text-brand-blue' : 'text-slate-400 dark:text-gray-500'}`}>{r.label}</span>
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* Priority mode */}
                      <div className="space-y-3">
                        <p className="text-[9px] font-black uppercase tracking-[0.35em] text-slate-400 dark:text-gray-600">Chế độ ưu tiên</p>
                        <div className="flex gap-2 bg-slate-100 dark:bg-black/40 p-1.5 rounded-xl w-fit border border-slate-200 dark:border-white/5">
                          {['fast', 'quality', 'relaxed'].map((mode) => (
                            <button
                              key={mode}
                              onClick={() => handleChange('mode', mode)}
                              className={`px-6 py-2.5 rounded-lg text-[9px] font-black uppercase tracking-widest transition-all ${
                                settings.mode === mode
                                  ? 'bg-white dark:bg-[#1a1a1e] text-brand-blue shadow-md'
                                  : 'text-slate-400 dark:text-gray-600 hover:text-slate-800 dark:hover:text-white'
                              }`}
                            >
                              {mode}
                            </button>
                          ))}
                        </div>
                      </div>
                    </motion.div>
                  )}

                  {/* ── TAB: IMAGE ENGINE ─────────────────────────── */}
                  {activeTab === 'image' && (
                    <motion.div
                      key="image"
                      initial={{ opacity: 0, x: -12 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 12 }}
                      className="space-y-8"
                    >
                      {/* Model cards */}
                      <div className="space-y-3">
                        <p className="text-[9px] font-black uppercase tracking-[0.35em] text-slate-400 dark:text-gray-600">Chọn mô hình ảnh</p>
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                          {imageModels.length > 0
                            ? imageModels.map((m) => (
                                <ModelCard
                                  key={m._id}
                                  model={m}
                                  isSelected={settings.imageModel === m.modelKey}
                                  onSelect={() => handleChange('imageModel', m.modelKey)}
                                  accentColor=""
                                  type="image"
                                />
                              ))
                            : Array.from({ length: 4 }).map((_, i) => (
                                <div key={i} className="h-24 bg-slate-100 dark:bg-white/5 rounded-2xl animate-pulse" />
                              ))
                          }
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                        {/* Image ratio */}
                        <PillSelector
                          label="Tỉ lệ ảnh"
                          options={['1:1', '16:9', '9:16', '4:3', '3:4']}
                          value={settings.imageRatio ?? '16:9'}
                          onChange={(v) => handleChange('imageRatio', v)}
                        />
                        {/* Quality */}
                        <PillSelector
                          label="Chất lượng"
                          options={['1K', '2K', '4K']}
                          value={settings.imageQuality ?? '1K'}
                          onChange={(v) => handleChange('imageQuality', v)}
                        />
                      </div>
                    </motion.div>
                  )}

                  {/* ── TAB: EXPORT ───────────────────────────────── */}
                  {activeTab === 'export' && (
                    <motion.div
                      key="export"
                      initial={{ opacity: 0, x: -12 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 12 }}
                      className="space-y-8"
                    >
                      <PillSelector
                        label="Định dạng xuất"
                        options={['MP4', 'WebM']}
                        value={settings.exportFormat ?? 'MP4'}
                        onChange={(v) => handleChange('exportFormat', v)}
                      />

                      {/* Privacy */}
                      <div className="space-y-3">
                        <p className="text-[9px] font-black uppercase tracking-[0.35em] text-slate-400 dark:text-gray-600">Quyền riêng tư</p>
                        <div className="grid grid-cols-2 gap-3">
                          {[
                            { val: 'private', label: '🔒 Chỉ mình tôi', desc: 'Không xuất hiện trên Explorer' },
                            { val: 'public',  label: '🌐 Công khai',    desc: 'Hiển thị trên Explorer cộng đồng' },
                          ].map((opt) => (
                            <button
                              key={opt.val}
                              onClick={() => handleChange('privacy', opt.val)}
                              className={`p-4 rounded-2xl border-2 text-left transition-all ${
                                (settings.privacy ?? 'private') === opt.val
                                  ? 'border-brand-blue bg-brand-blue/5'
                                  : 'border-slate-200 dark:border-white/8 hover:border-brand-blue/30'
                              }`}
                            >
                              <p className={`text-xs font-black ${(settings.privacy ?? 'private') === opt.val ? 'text-brand-blue' : 'text-slate-700 dark:text-white'}`}>{opt.label}</p>
                              <p className="text-[9px] text-slate-400 dark:text-gray-500 mt-1 leading-snug">{opt.desc}</p>
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* Toggles */}
                      <div className="space-y-3">
                        <p className="text-[9px] font-black uppercase tracking-[0.35em] text-slate-400 dark:text-gray-600">Tùy chọn khác</p>
                        <div className="space-y-3">
                          {[
                            { key: 'autoDownload', label: 'Tự động tải xuống khi xong', desc: 'Download ngay khi render hoàn tất' },
                            { key: 'watermark',    label: 'Watermark Skyverses',         desc: 'Thêm logo nhỏ góc dưới phải' },
                          ].map((opt) => (
                            <div
                              key={opt.key}
                              onClick={() => handleChange(opt.key, !settings[opt.key])}
                              className={`flex items-center justify-between p-4 rounded-2xl border transition-all cursor-pointer ${
                                settings[opt.key]
                                  ? 'border-brand-blue/30 bg-brand-blue/5'
                                  : 'border-slate-200 dark:border-white/8 hover:border-brand-blue/20'
                              }`}
                            >
                              <div>
                                <p className="text-xs font-black text-slate-800 dark:text-white">{opt.label}</p>
                                <p className="text-[9px] text-slate-400 dark:text-gray-500 mt-0.5">{opt.desc}</p>
                              </div>
                              <div className={`w-11 h-6 rounded-full transition-all relative shrink-0 ml-4 ${settings[opt.key] ? 'bg-brand-blue' : 'bg-slate-200 dark:bg-white/10'}`}>
                                <div className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow-sm transition-all ${settings[opt.key] ? 'left-6' : 'left-1'}`} />
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              )}
            </div>

            {/* Footer */}
            <div className="px-7 py-5 border-t border-black/5 dark:border-white/5 bg-slate-50/80 dark:bg-black/30 flex items-center justify-between shrink-0">
              <div className="flex items-center gap-2.5 text-emerald-500">
                <ShieldCheck size={15} />
                <span className="text-[9px] font-black uppercase tracking-widest">Enterprise Validated</span>
              </div>
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setActiveTab(activeTab === 'video' ? 'image' : activeTab === 'image' ? 'export' : 'video')}
                  className="flex items-center gap-1.5 text-[9px] font-black uppercase tracking-widest text-slate-400 hover:text-brand-blue transition-colors"
                >
                  Tiếp theo <ChevronRight size={13} />
                </button>
                <button
                  onClick={handleSave}
                  disabled={isSaving || saveSuccess}
                  aria-label="Xác nhận và lưu cấu hình"
                  className="px-8 py-3 bg-brand-blue text-white rounded-xl text-[10px] font-black uppercase tracking-widest shadow-lg shadow-brand-blue/25 hover:brightness-110 active:scale-95 transition-all flex items-center gap-2 disabled:opacity-80"
                >
                  {isSaving && <Loader2 size={13} className="animate-spin" />}
                  {saveSuccess && <Check size={13} strokeWidth={3} />}
                  {!isSaving && !saveSuccess && 'Xác nhận'}
                  {isSaving && 'Đang lưu...'}
                  {saveSuccess && 'Đã lưu!'}
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
