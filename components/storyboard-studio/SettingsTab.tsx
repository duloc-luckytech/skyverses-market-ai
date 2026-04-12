import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Sparkles, Settings, Zap, ImageIcon, Film, Cpu,
  Edit3, Music, Mic, Check, ChevronDown, Maximize2,
  Save, Loader2, ShieldCheck,
} from 'lucide-react';
import { AdvancedSettings } from './AdvancedSettings';
import { ModelEngineSettings } from '../image-generator/ModelEngineSettings';
import { VideoModelEngineSettings } from '../video-generator/VideoModelEngineSettings';
import { useImageModels } from '../../hooks/useImageModels';
import { useVideoModels } from '../../hooks/useVideoModels';

interface SettingsTabProps {
  script: string;
  setScript: (v: string) => void;
  settings: any;
  setSettings?: (updates: any) => void;
  onLoadSample: () => void;
  onLoadSuggestion: () => void;
  onOpenAestheticConfig: () => void;
  onOpenRenderConfig: () => void;
  isEnhancing?: boolean;
  isProcessing?: boolean;
  onSaveAndGenerate?: () => void;
}

// ── Collapsible card wrapper ─────────────────────────────────────────────────
const SettingsCard: React.FC<{
  icon: React.ReactNode;
  accentClass: string;          // e.g. "text-rose-500 bg-rose-500/10"
  title: string;
  subtitle: string;
  defaultOpen?: boolean;
  badge?: string;
  children: React.ReactNode;
}> = ({ icon, accentClass, title, subtitle, defaultOpen = true, badge, children }) => {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="rounded-2xl border border-black/[0.06] dark:border-white/[0.05] bg-white dark:bg-white/[0.02] overflow-hidden transition-colors">
      <button
        onClick={() => setOpen(v => !v)}
        className="w-full flex items-center gap-3 px-5 py-4 text-left hover:bg-black/[0.02] dark:hover:bg-white/[0.02] transition-colors"
      >
        <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 ${accentClass}`}>
          {icon}
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-xs font-black uppercase italic tracking-tight text-slate-800 dark:text-white leading-none">
            {title}
          </p>
          <p className="text-[9px] font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-widest mt-0.5 leading-none truncate">
            {subtitle}
          </p>
        </div>
        {badge && (
          <span className="shrink-0 px-2 py-0.5 rounded-full bg-brand-blue/10 text-brand-blue text-[9px] font-black uppercase tracking-wider border border-brand-blue/20">
            {badge}
          </span>
        )}
        <ChevronDown
          size={14}
          className={`shrink-0 text-slate-400 dark:text-slate-500 transition-transform duration-200 ${open ? 'rotate-180' : ''}`}
        />
      </button>

      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.22, ease: 'easeInOut' }}
            className="overflow-hidden"
          >
            <div className="px-5 pb-5 border-t border-black/[0.04] dark:border-white/[0.04] pt-4">
              {children}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

// ── Pill toggle ──────────────────────────────────────────────────────────────
const Pill: React.FC<{
  label: string; active: boolean; onClick: () => void; disabled?: boolean;
}> = ({ label, active, onClick, disabled }) => (
  <button
    onClick={onClick}
    disabled={disabled}
    className={`px-3 py-1.5 rounded-lg text-[10px] font-semibold border transition-all ${
      active
        ? 'bg-brand-blue/10 text-brand-blue border-brand-blue/25'
        : 'bg-transparent border-black/[0.06] dark:border-white/[0.05] text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-white/70 hover:border-black/10 dark:hover:border-white/10'
    } disabled:opacity-40 disabled:cursor-not-allowed`}
  >
    {label}
  </button>
);

// ── Summary stat chip ────────────────────────────────────────────────────────
const StatChip: React.FC<{ icon: React.ReactNode; label: string; value: string; accent?: string }> = ({
  icon, label, value, accent = 'text-brand-blue',
}) => (
  <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-slate-50 dark:bg-white/[0.03] border border-black/[0.05] dark:border-white/[0.05]">
    <span className={`shrink-0 ${accent}`}>{icon}</span>
    <div className="min-w-0">
      <p className="text-[8px] font-black uppercase tracking-widest text-slate-400 dark:text-slate-500 leading-none">{label}</p>
      <p className="text-[10px] font-black uppercase italic truncate text-slate-800 dark:text-white mt-0.5 leading-none">{value}</p>
    </div>
  </div>
);

// ─────────────────────────────────────────────────────────────────────────────

export const SettingsTab: React.FC<SettingsTabProps> = ({
  settings,
  setSettings,
  isProcessing,
  onSaveAndGenerate,
  onOpenAestheticConfig,
  onOpenRenderConfig,
}) => {
  // ── Image AI ────────────────────────────────────────────────────────────────
  const [imgEngine, setImgEngine] = useState(settings?.imageEngine ?? 'gommo');
  const imgModels = useImageModels(imgEngine, settings?.imageModel);
  const {
    availableModels: imgAvailableModels,
    selectedModel: imgSelectedModel,       setSelectedModel: setImgSelectedModel,
    selectedFamily: imgSelectedFamily,     setSelectedFamily: setImgSelectedFamily,
    selectedMode: imgSelectedMode,         setSelectedMode: setImgSelectedMode,
    selectedRatio: imgSelectedRatio,       setSelectedRatio: setImgSelectedRatio,
    selectedRes: imgSelectedRes,           setSelectedRes: setImgSelectedRes,
    familyList: imgFamilyList,
    familyModels: imgFamilyModels,
    familyModes: imgFamilyModes,
    familyRatios: imgFamilyRatios,
    familyResolutions: imgFamilyResolutions,
  } = imgModels;

  // ── Video AI ─────────────────────────────────────────────────────────────────
  const [videoEngine, setVideoEngine] = useState(settings?.videoEngine ?? 'gommo');
  const vid = useVideoModels(videoEngine, settings?.model);

  // ── Sync image → settings ────────────────────────────────────────────────────
  useEffect(() => {
    if (!setSettings || !imgSelectedModel) return;
    setSettings({
      ...settings,
      imageEngine: imgEngine,
      imageModel: imgSelectedModel.raw?.modelKey ?? imgSelectedModel.id,
      imageRatio: imgSelectedRatio,
      imageQuality: imgSelectedRes,
    });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [imgEngine, imgSelectedModel, imgSelectedRatio, imgSelectedRes]);

  // ── Sync video → settings ────────────────────────────────────────────────────
  useEffect(() => {
    if (!setSettings || !vid.selectedModelObj) return;
    setSettings({
      ...settings,
      videoEngine,
      model: vid.selectedModelObj.modelKey,
      resolution: vid.resolution,
      aspectRatio: vid.ratio,
      mode: vid.selectedMode || settings?.mode,
      duration: vid.duration.replace('s', ''),
    });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [videoEngine, vid.selectedModelObj, vid.resolution, vid.ratio, vid.selectedMode, vid.duration]);

  // ── Save state ───────────────────────────────────────────────────────────────
  const [isSaving, setIsSaving] = useState(false);
  const [savedOk, setSavedOk] = useState(false);

  const handleSave = () => {
    if (isProcessing) return;
    setIsSaving(true);
    setSavedOk(false);
    setTimeout(() => {
      setIsSaving(false);
      setSavedOk(true);
      onSaveAndGenerate?.();
      setTimeout(() => setSavedOk(false), 2000);
    }, 380);
  };

  return (
    <motion.div
      key="tab-settings"
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="flex-grow flex flex-col overflow-y-auto no-scrollbar bg-slate-50 dark:bg-[#050506] transition-colors duration-300"
    >
      <div className="max-w-5xl mx-auto w-full px-5 lg:px-10 py-8 space-y-4 pb-40">

        {/* ── Page header ── */}
        <div className="flex items-center justify-between mb-2">
          <div>
            <h2 className="text-lg font-black uppercase italic tracking-tighter text-slate-900 dark:text-white leading-none">
              Cấu hình sản xuất
            </h2>
            <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">
              Image AI · Video AI · Render · Nâng cao
            </p>
          </div>
          {/* Quick save */}
          <button
            onClick={handleSave}
            disabled={isProcessing || isSaving}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-brand-blue text-white text-[10px] font-black uppercase tracking-widest shadow-lg shadow-brand-blue/25 hover:brightness-110 active:scale-95 transition-all disabled:opacity-50"
          >
            {isSaving && <Loader2 size={12} className="animate-spin" />}
            {savedOk  && <Check size={12} strokeWidth={3} />}
            {!isSaving && !savedOk && <Save size={12} />}
            {isSaving ? 'Đang lưu...' : savedOk ? 'Đã lưu!' : 'Lưu'}
          </button>
        </div>

        {/* ══════════════════════════════════════════════════
            1. THẨM MỸ & PHONG CÁCH
        ══════════════════════════════════════════════════ */}
        <SettingsCard
          icon={<Sparkles size={15} />}
          accentClass="text-brand-blue bg-brand-blue/10"
          title="Thẩm mỹ & Phong cách"
          subtitle="Ngôn ngữ hình ảnh"
          defaultOpen
        >
          {/* Summary chips */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-4">
            <StatChip icon={<Film size={11} />}       label="Định dạng" value={settings.format}  accent="text-brand-blue" />
            <StatChip icon={<Sparkles size={11} />}   label="Phong cách" value={settings.style}  accent="text-violet-500" />
            <StatChip icon={<Zap size={11} />}        label="Văn hóa"   value={settings.culture} accent="text-emerald-500" />
            <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-slate-50 dark:bg-white/[0.03] border border-black/[0.05] dark:border-white/[0.05]">
              <div className="flex flex-col gap-1">
                <div className="flex items-center gap-1.5">
                  <Music size={10} className={settings.bgm ? 'text-emerald-500' : 'text-slate-400'} />
                  <span className="text-[9px] font-bold text-slate-500 dark:text-slate-400">Nhạc nền</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Mic size={10} className={settings.voiceOver ? 'text-emerald-500' : 'text-slate-400'} />
                  <span className="text-[9px] font-bold text-slate-500 dark:text-slate-400">Lời bình</span>
                </div>
              </div>
            </div>
          </div>

          <button
            onClick={onOpenAestheticConfig}
            className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl border border-brand-blue/30 bg-brand-blue/5 text-brand-blue text-[10px] font-black uppercase tracking-widest hover:bg-brand-blue hover:text-white transition-all"
          >
            <Edit3 size={13} /> Chỉnh sửa thẩm mỹ
          </button>
        </SettingsCard>

        {/* ══════════════════════════════════════════════════
            2. IMAGE AI ENGINE
        ══════════════════════════════════════════════════ */}
        <SettingsCard
          icon={<ImageIcon size={15} />}
          accentClass="text-rose-500 bg-rose-500/10"
          title="Image AI Engine"
          subtitle="Model sinh ảnh cho phân cảnh"
          badge={imgSelectedModel ? (imgSelectedModel.raw?.modelKey ?? '').split('_').slice(0, 2).join(' ') : undefined}
          defaultOpen
        >
          <ModelEngineSettings
            availableModels={imgAvailableModels}
            selectedModel={imgSelectedModel}
            setSelectedModel={setImgSelectedModel}
            selectedRatio={imgSelectedRatio}
            setSelectedRatio={setImgSelectedRatio}
            selectedRes={imgSelectedRes}
            setSelectedRes={setImgSelectedRes}
            quantity={1}
            setQuantity={() => {}}
            selectedMode={imgSelectedMode}
            setSelectedMode={setImgSelectedMode}
            selectedEngine={imgEngine}
            onSelectEngine={setImgEngine}
            activeMode="SINGLE"
            isGenerating={isProcessing}
            familyList={imgFamilyList}
            selectedFamily={imgSelectedFamily}
            setSelectedFamily={setImgSelectedFamily}
            familyModels={imgFamilyModels.map(m => m.raw || m)}
            familyModes={imgFamilyModes}
            familyRatios={imgFamilyRatios}
            familyResolutions={imgFamilyResolutions}
          />
        </SettingsCard>

        {/* ══════════════════════════════════════════════════
            3. VIDEO AI ENGINE
        ══════════════════════════════════════════════════ */}
        <SettingsCard
          icon={<Film size={15} />}
          accentClass="text-indigo-500 bg-indigo-500/10"
          title="Video AI Engine"
          subtitle="Model sinh video cho từng cảnh"
          badge={vid.selectedModelObj ? vid.selectedModelObj.name.split(' ').slice(0, 2).join(' ') : undefined}
          defaultOpen
        >
          <VideoModelEngineSettings
            selectedEngine={videoEngine}
            onSelectEngine={setVideoEngine}
            availableModels={vid.models}
            selectedModelObj={vid.selectedModelObj}
            setSelectedModelObj={vid.setSelectedModelObj}
            familyList={vid.familyList}
            selectedFamily={vid.selectedFamily}
            setSelectedFamily={vid.setSelectedFamily}
            familyModels={vid.familyModels}
            familyModes={vid.familyModes}
            familyResolutions={vid.familyResolutions}
            familyRatios={vid.familyRatios}
            selectedMode={vid.selectedMode}
            setSelectedMode={vid.setSelectedMode}
            ratio={vid.ratio}
            setRatio={vid.setRatio}
            resolution={vid.resolution}
            setResolution={vid.setResolution}
            isModeBased={vid.isModeBased}
            duration={vid.duration}
            cycleDuration={vid.cycleDuration}
            soundEnabled={vid.soundEnabled}
            setSoundEnabled={vid.setSoundEnabled}
            showQuantity={false}
            isGenerating={isProcessing}
          />
        </SettingsCard>

        {/* ══════════════════════════════════════════════════
            4. CẤU HÌNH KẾT XUẤT — summary + shortcut
        ══════════════════════════════════════════════════ */}
        <SettingsCard
          icon={<Cpu size={15} />}
          accentClass="text-amber-500 bg-amber-500/10"
          title="Cấu hình kết xuất"
          subtitle="Export · Resolution · Privacy"
          defaultOpen={false}
        >
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 mb-4">
            <StatChip
              icon={<ImageIcon size={11} />}
              label="Engine ảnh"
              value={(settings.imageModel ?? '–').replace(/_/g, ' ')}
              accent="text-rose-500"
            />
            <StatChip
              icon={<Film size={11} />}
              label="Engine video"
              value={(settings.model ?? '–').replace(/_/g, ' ')}
              accent="text-indigo-500"
            />
            <StatChip
              icon={<Maximize2 size={11} />}
              label="Thông số xuất"
              value={`${(settings.resolution ?? '1080P').toUpperCase()} · ${settings.exportFormat ?? 'MP4'}`}
              accent="text-emerald-500"
            />
          </div>

          {/* Aspect ratio quick pills */}
          <div className="space-y-2 mb-4">
            <p className="text-[9px] font-black uppercase tracking-widest text-slate-400 dark:text-slate-500">Tỉ lệ khung hình</p>
            <div className="flex gap-1.5 flex-wrap">
              {['16:9', '9:16', '1:1'].map(r => (
                <Pill
                  key={r}
                  label={r}
                  active={(settings.aspectRatio ?? '16:9') === r}
                  onClick={() => setSettings?.({ ...settings, aspectRatio: r })}
                  disabled={isProcessing}
                />
              ))}
            </div>
          </div>

          {/* Mode quick pills */}
          <div className="space-y-2 mb-4">
            <p className="text-[9px] font-black uppercase tracking-widest text-slate-400 dark:text-slate-500">Chế độ ưu tiên</p>
            <div className="flex gap-1.5 flex-wrap">
              {['fast', 'quality', 'relaxed'].map(m => (
                <Pill
                  key={m}
                  label={m}
                  active={(settings.mode ?? 'fast') === m}
                  onClick={() => setSettings?.({ ...settings, mode: m })}
                  disabled={isProcessing}
                />
              ))}
            </div>
          </div>

          <button
            onClick={onOpenRenderConfig}
            className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl border border-slate-200 dark:border-white/[0.08] text-slate-600 dark:text-white/60 text-[10px] font-black uppercase tracking-widest hover:border-brand-blue/40 hover:text-brand-blue dark:hover:text-white transition-all"
          >
            <Settings size={13} /> Mở cấu hình đầy đủ
          </button>
        </SettingsCard>

        {/* ══════════════════════════════════════════════════
            5. CÀI ĐẶT NÂNG CAO
        ══════════════════════════════════════════════════ */}
        <SettingsCard
          icon={<Zap size={15} />}
          accentClass="text-slate-500 bg-slate-500/10"
          title="Cài đặt nâng cao"
          subtitle="Retry · Threads · API Key"
          defaultOpen={false}
        >
          <AdvancedSettings
            isProcessing={isProcessing}
            onSaveAndGenerate={onSaveAndGenerate}
            settings={settings}
            setSettings={setSettings || (() => {})}
          />
        </SettingsCard>

        {/* ── Bottom save bar ── */}
        <div className="flex gap-3 pt-2">
          <button
            onClick={handleSave}
            disabled={isProcessing || isSaving}
            className="flex-1 flex items-center justify-center gap-2 py-3.5 rounded-2xl bg-brand-blue text-white text-[10px] font-black uppercase tracking-widest shadow-lg shadow-brand-blue/25 hover:brightness-110 active:scale-[0.98] transition-all disabled:opacity-50 relative overflow-hidden group"
          >
            <div className="absolute inset-0 bg-white/10 -translate-x-full group-hover:translate-x-full transition-transform duration-700 pointer-events-none" />
            {isSaving  ? <><Loader2 size={13} className="animate-spin" /> Đang lưu...</>
            : savedOk  ? <><Check size={13} strokeWidth={3} /> Đã lưu!</>
            :            <><ShieldCheck size={13} /> Lưu thiết lập</>}
          </button>
        </div>

      </div>
    </motion.div>
  );
};
