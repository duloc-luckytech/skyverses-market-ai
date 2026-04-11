import React, { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X, Sparkles, ShieldCheck, ChevronDown, Layout,
  Camera, Music, Mic, Palette, Zap, Check, ChevronRight,
  Loader2
} from 'lucide-react';
import { useToast } from '../../context/ToastContext';

interface AestheticProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  settings: any;
  setSettings: (updates: any) => void;
}

// ─── OPTION DATA ─────────────────────────────────────────────────────────────
const FORMAT_OPTIONS: { val: string; label: string; emoji: string; desc: string }[] = [
  { val: '', label: 'AI tự chọn', emoji: '✨', desc: 'AI phân tích và đề xuất tối ưu' },
  { val: 'Phim ngắn',           label: 'Phim ngắn',     emoji: '🎬', desc: '< 30 phút, narrative' },
  { val: 'TVC Quảng cáo',       label: 'TVC',           emoji: '📺', desc: '15–60 giây, thương mại' },
  { val: 'MV Ca nhạc',          label: 'MV Ca nhạc',    emoji: '🎵', desc: 'Âm nhạc, sáng tạo' },
  { val: 'Video TikTok/Reels/Shorts', label: 'TikTok/Reels', emoji: '📱', desc: 'Viral short-form' },
  { val: 'Phim tài liệu',       label: 'Tài liệu',      emoji: '🎥', desc: 'Documentary' },
  { val: 'Trailer / Teaser',    label: 'Trailer',       emoji: '🔥', desc: 'Cinematic teaser' },
  { val: 'Vlog',                label: 'Vlog',           emoji: '📸', desc: 'Personal, lifestyle' },
  { val: 'Video giáo dục',      label: 'Giáo dục',      emoji: '📚', desc: 'E-learning, explainer' },
];

const STYLE_OPTIONS: { val: string; label: string; gradient: string; dark: string }[] = [
  { val: '',              label: 'AI tự chọn',  gradient: 'from-slate-300 to-slate-400', dark: 'from-slate-700 to-slate-600' },
  { val: 'Hoạt hình 3D', label: 'Hoạt hình 3D', gradient: 'from-blue-400 to-cyan-300',   dark: 'from-blue-700 to-cyan-600' },
  { val: 'Anime',         label: 'Anime',        gradient: 'from-pink-400 to-rose-300',   dark: 'from-pink-700 to-rose-600' },
  { val: 'Hoạt hình 2D', label: 'Hoạt hình 2D', gradient: 'from-yellow-400 to-amber-300', dark: 'from-yellow-700 to-amber-600' },
  { val: 'Live-action',  label: 'Live-action',  gradient: 'from-slate-500 to-slate-400', dark: 'from-slate-600 to-slate-500' },
  { val: 'Cyberpunk',    label: 'Cyberpunk',    gradient: 'from-purple-500 to-violet-400', dark: 'from-purple-700 to-violet-600' },
  { val: 'Realistic',    label: 'Realistic',    gradient: 'from-emerald-400 to-teal-300', dark: 'from-emerald-700 to-teal-600' },
  { val: 'Dreamy',       label: 'Dreamy',       gradient: 'from-fuchsia-400 to-pink-300', dark: 'from-fuchsia-700 to-pink-600' },
  { val: 'Minimalist',   label: 'Minimalist',   gradient: 'from-gray-300 to-gray-200',   dark: 'from-gray-600 to-gray-500' },
];

const CULTURE_PRESETS = [
  { val: 'Futuristic Vietnam 2077', flag: '🇻🇳' },
  { val: 'Tokyo Neo Cyberpunk',     flag: '🇯🇵' },
  { val: 'Global / International',  flag: '🌐' },
  { val: 'Han (China Dynasty)',     flag: '🇨🇳' },
  { val: 'European Classic',        flag: '🇪🇺' },
  { val: 'Tropical Southeast Asia', flag: '🌴' },
];

// ─── FORMAT CARD ─────────────────────────────────────────────────────────────
const FormatCard: React.FC<{
  opt: typeof FORMAT_OPTIONS[0];
  isSelected: boolean;
  onSelect: () => void;
}> = ({ opt, isSelected, onSelect }) => (
  <button
    onClick={onSelect}
    className={`relative text-left w-full rounded-2xl p-4 border-2 transition-all duration-200 group ${
      isSelected
        ? 'border-brand-blue bg-brand-blue/5 shadow-md shadow-brand-blue/10'
        : 'border-slate-200 dark:border-white/8 bg-white dark:bg-white/[0.02] hover:border-brand-blue/30 hover:shadow-sm'
    }`}
  >
    <div className="flex items-start gap-3">
      <span className="text-2xl leading-none mt-0.5">{opt.emoji}</span>
      <div className="flex-grow min-w-0">
        <p className={`text-xs font-black leading-none truncate ${isSelected ? 'text-brand-blue' : 'text-slate-800 dark:text-white'}`}>
          {opt.label}
        </p>
        <p className="text-[9px] text-slate-400 dark:text-gray-500 mt-1 leading-snug">{opt.desc}</p>
      </div>
      {isSelected && (
        <div className="w-4 h-4 rounded-full bg-brand-blue flex items-center justify-center shrink-0 mt-0.5">
          <Check size={10} strokeWidth={3.5} className="text-white" />
        </div>
      )}
    </div>
  </button>
);

// ─── STYLE CARD ──────────────────────────────────────────────────────────────
const StyleCard: React.FC<{
  opt: typeof STYLE_OPTIONS[0];
  isSelected: boolean;
  onSelect: () => void;
}> = ({ opt, isSelected, onSelect }) => (
  <button
    onClick={onSelect}
    className={`relative overflow-hidden rounded-2xl border-2 transition-all duration-200 ${
      isSelected
        ? 'border-brand-blue shadow-md shadow-brand-blue/15 scale-[1.02]'
        : 'border-slate-200 dark:border-white/8 hover:border-brand-blue/30 hover:scale-[1.01]'
    }`}
  >
    {/* Gradient preview swatch */}
    <div className={`h-12 w-full bg-gradient-to-br ${opt.gradient} dark:${opt.dark}`} />
    <div className="bg-white dark:bg-[#0f0f14] px-3 py-2.5 flex items-center justify-between">
      <span className={`text-[10px] font-black truncate ${isSelected ? 'text-brand-blue' : 'text-slate-700 dark:text-white'}`}>
        {opt.label}
      </span>
      {isSelected && <Check size={11} strokeWidth={3.5} className="text-brand-blue shrink-0 ml-1" />}
    </div>
  </button>
);

// ─── MAIN MODAL ──────────────────────────────────────────────────────────────
export const AestheticProfileModal: React.FC<AestheticProfileModalProps> = ({
  isOpen, onClose, settings, setSettings
}) => {
  const { showToast } = useToast();
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  const handleSave = useCallback(() => {
    setIsSaving(true);
    setSaveSuccess(false);
    setTimeout(() => {
      setIsSaving(false);
      setSaveSuccess(true);
      showToast('✓ Đã lưu cấu hình Aesthetic Profile', 'success');
      setTimeout(() => {
        setSaveSuccess(false);
        onClose();
      }, 600);
    }, 300);
  }, [onClose, showToast]);

  const handleChange = (key: string, value: any) =>
    setSettings({ ...settings, [key]: value });

  const inputBase =
    'w-full bg-slate-50 dark:bg-black/40 border border-slate-200 dark:border-white/8 rounded-xl px-4 py-3 text-sm font-medium text-slate-800 dark:text-white placeholder:text-slate-300 dark:placeholder:text-white/20 focus:outline-none focus:ring-2 focus:ring-brand-blue/20 focus:border-brand-blue/40 transition-all';

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[800] flex items-center justify-center p-4">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/60 dark:bg-black/80 backdrop-blur-md"
            onClick={onClose}
          />

          {/* Modal */}
          <motion.div
            initial={{ scale: 0.95, opacity: 0, y: 30 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.95, opacity: 0, y: 30 }}
            transition={{ type: 'spring', damping: 30, stiffness: 400 }}
            className="relative w-full max-w-4xl bg-[#fafafa] dark:bg-[#0c0c10] rounded-[2rem] overflow-hidden shadow-[0_60px_120px_rgba(0,0,0,0.45)] flex flex-col max-h-[90vh] border border-black/8 dark:border-white/8"
          >
            {/* Header */}
            <div className="px-7 py-6 border-b border-black/5 dark:border-white/5 bg-white/60 dark:bg-black/20 shrink-0 flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="relative w-12 h-12 bg-brand-blue/10 dark:bg-brand-blue/15 rounded-2xl flex items-center justify-center text-brand-blue">
                  <div className="absolute inset-0 bg-brand-blue blur-2xl opacity-15 rounded-2xl" />
                  <Palette size={24} className="relative z-10" />
                </div>
                <div>
                  <h3 className="text-xl font-black uppercase italic tracking-tighter text-slate-900 dark:text-white leading-none">
                    Aesthetic Profile
                  </h3>
                  <p className="text-[10px] font-bold text-slate-400 dark:text-gray-500 uppercase tracking-widest mt-1 italic">
                    Ngôn ngữ hình ảnh & thẩm mỹ sáng tạo
                  </p>
                </div>
              </div>
              <button
                onClick={onClose}
                aria-label="Đóng Aesthetic Profile"
                className="p-2 text-slate-400 hover:text-red-500 transition-colors rounded-xl hover:bg-red-50 dark:hover:bg-red-500/10"
              >
                <X size={24} />
              </button>
            </div>

            {/* Content */}
            <div className="flex-grow overflow-y-auto p-7 no-scrollbar space-y-10">

              {/* ── Format Selection ──────────────────────────────── */}
              <section>
                <div className="flex items-center gap-2.5 mb-5">
                  <Layout size={15} className="text-brand-blue" />
                  <h4 className="text-xs font-black uppercase tracking-[0.3em] text-slate-800 dark:text-white">Loại hình / Format</h4>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
                  {FORMAT_OPTIONS.map((opt) => (
                    <FormatCard
                      key={opt.val}
                      opt={opt}
                      isSelected={(settings.format ?? '') === opt.val}
                      onSelect={() => handleChange('format', opt.val)}
                    />
                  ))}
                </div>
              </section>

              {/* ── Style Selection ───────────────────────────────── */}
              <section>
                <div className="flex items-center gap-2.5 mb-5">
                  <Palette size={15} className="text-purple-500" />
                  <h4 className="text-xs font-black uppercase tracking-[0.3em] text-slate-800 dark:text-white">Phong cách / Style</h4>
                </div>
                <div className="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-5 gap-3">
                  {STYLE_OPTIONS.map((opt) => (
                    <StyleCard
                      key={opt.val}
                      opt={opt}
                      isSelected={(settings.style ?? '') === opt.val}
                      onSelect={() => handleChange('style', opt.val)}
                    />
                  ))}
                </div>
              </section>

              {/* ── Culture / World ───────────────────────────────── */}
              <section>
                <div className="flex items-center gap-2.5 mb-4">
                  <Camera size={15} className="text-emerald-500" />
                  <h4 className="text-xs font-black uppercase tracking-[0.3em] text-slate-800 dark:text-white">Bối cảnh văn hóa / World Building</h4>
                </div>
                {/* Preset chips */}
                <div className="flex flex-wrap gap-2 mb-4">
                  {CULTURE_PRESETS.map((p) => (
                    <button
                      key={p.val}
                      onClick={() => handleChange('culture', settings.culture === p.val ? '' : p.val)}
                      className={`flex items-center gap-2 px-3.5 py-2 rounded-full text-[10px] font-black border transition-all ${
                        settings.culture === p.val
                          ? 'bg-brand-blue text-white border-brand-blue shadow-md'
                          : 'bg-white dark:bg-white/5 border-slate-200 dark:border-white/8 text-slate-500 dark:text-gray-400 hover:border-brand-blue/40 hover:text-brand-blue dark:hover:text-white'
                      }`}
                    >
                      <span>{p.flag}</span>
                      <span className="uppercase tracking-widest">{p.val.split('/')[0].trim()}</span>
                    </button>
                  ))}
                </div>
                {/* Custom input */}
                <input
                  value={settings.culture ?? ''}
                  onChange={(e) => handleChange('culture', e.target.value)}
                  className={inputBase}
                  placeholder="Hoặc tự nhập: VD: Futuristic Vietnam 2077, Neo-Tokyo rain alley..."
                />
              </section>

              {/* ── Advanced (collapsible) ────────────────────────── */}
              <section>
                <button
                  onClick={() => setShowAdvanced((v) => !v)}
                  className="flex items-center gap-2.5 text-xs font-black uppercase tracking-[0.3em] text-slate-400 dark:text-gray-500 hover:text-brand-blue transition-colors"
                >
                  <ChevronRight size={14} className={`transition-transform ${showAdvanced ? 'rotate-90' : ''}`} />
                  Nâng cao — Bối cảnh, Camera, Âm thanh
                </button>

                <AnimatePresence>
                  {showAdvanced && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.3 }}
                      className="overflow-hidden"
                    >
                      <div className="space-y-6 pt-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <div className="space-y-2">
                            <label className="text-[9px] font-black uppercase text-slate-400 dark:text-gray-600 tracking-[0.3em] flex items-center gap-1.5">
                              <Layout size={11} className="text-brand-blue" /> Bối cảnh / Background
                            </label>
                            <textarea
                              value={settings.background ?? ''}
                              onChange={(e) => handleChange('background', e.target.value)}
                              className={`${inputBase} h-28 resize-none`}
                              placeholder="VD: Rain-slicked alleyways reflecting neon holograms, minimalist Zen garden..."
                            />
                          </div>
                          <div className="space-y-2">
                            <label className="text-[9px] font-black uppercase text-slate-400 dark:text-gray-600 tracking-[0.3em] flex items-center gap-1.5">
                              <Camera size={11} className="text-brand-blue" /> Camera & Cinematic
                            </label>
                            <textarea
                              value={settings.cinematic ?? ''}
                              onChange={(e) => handleChange('cinematic', e.target.value)}
                              className={`${inputBase} h-28 resize-none`}
                              placeholder="VD: Low-angle tracking shots, shallow DOF, anamorphic lens flares..."
                            />
                          </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <div className="space-y-2">
                            <label className="text-[9px] font-black uppercase text-slate-400 dark:text-gray-600 tracking-[0.3em] flex items-center gap-1.5">
                              <Music size={11} className="text-emerald-500" /> Âm nhạc (BGM)
                            </label>
                            <input
                              value={settings.bgm ?? ''}
                              onChange={(e) => handleChange('bgm', e.target.value)}
                              className={inputBase}
                              placeholder="VD: Lo-fi hip hop, Cinematic orchestral, Ambient electronic..."
                            />
                          </div>
                          <div className="space-y-2">
                            <label className="text-[9px] font-black uppercase text-slate-400 dark:text-gray-600 tracking-[0.3em] flex items-center gap-1.5">
                              <Mic size={11} className="text-emerald-500" /> Lời bình (Voice Over)
                            </label>
                            <input
                              value={settings.voiceOver ?? ''}
                              onChange={(e) => handleChange('voiceOver', e.target.value)}
                              className={inputBase}
                              placeholder="VD: Deep resonant male voice, Calm female narrator..."
                            />
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </section>

              {/* AI tip */}
              <div className="p-5 bg-brand-blue/5 border border-brand-blue/10 dark:border-brand-blue/15 rounded-2xl flex gap-4 items-start">
                <Zap className="text-brand-blue shrink-0 mt-0.5" size={16} />
                <div className="space-y-1">
                  <p className="text-[10px] text-slate-800 dark:text-slate-300 font-black uppercase tracking-tight italic">AI Archetype Sync Active</p>
                  <p className="text-[10px] text-slate-500 dark:text-gray-400 font-medium leading-relaxed">
                    Có thể để trống mọi trường để AI tự phân tích kịch bản và đề xuất aesthetic tối ưu nhất cho từng phân cảnh.
                  </p>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="px-7 py-5 border-t border-black/5 dark:border-white/5 bg-white/60 dark:bg-black/30 flex items-center justify-between shrink-0">
              <div className="flex items-center gap-2.5 text-brand-blue opacity-70">
                <ShieldCheck size={15} />
                <span className="text-[9px] font-black uppercase tracking-widest">Aesthetic Protocol Synchronized</span>
              </div>
              <button
                onClick={handleSave}
                disabled={isSaving || saveSuccess}
                aria-label="Xác nhận và lưu Aesthetic Profile"
                className="px-10 py-3.5 bg-brand-blue text-white rounded-xl text-[10px] font-black uppercase tracking-[0.2em] shadow-lg shadow-brand-blue/25 hover:scale-105 active:scale-95 transition-all flex items-center gap-2.5 disabled:opacity-80"
              >
                {isSaving && <Loader2 size={13} className="animate-spin" />}
                {saveSuccess && <Check size={13} strokeWidth={3.5} />}
                {!isSaving && !saveSuccess && <Sparkles size={13} fill="currentColor" />}
                {isSaving ? 'Đang lưu...' : saveSuccess ? 'Đã lưu!' : 'Xác nhận thay đổi'}
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
