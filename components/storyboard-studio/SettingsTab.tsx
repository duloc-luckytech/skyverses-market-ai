import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ImageIcon, Film,
  Check, ChevronDown,
  Save, Loader2, ShieldCheck,
} from 'lucide-react';
import { ModelEngineSettings } from '../image-generator/ModelEngineSettings';
import { VideoModelEngineSettings } from '../video-generator/VideoModelEngineSettings';
import { useImageModels } from '../../hooks/useImageModels';
import { useVideoModels } from '../../hooks/useVideoModels';

// ── localStorage keys ────────────────────────────────────────────────────────
const LS_IMG = 'sb_img_settings';
const LS_VID = 'sb_vid_settings';

interface ImgPersistedState {
  engine: string;
  modelKey: string;
  family: string;
  mode: string;
  ratio: string;
  res: string;
}

interface VidPersistedState {
  engine: string;
  modelKey: string;
  family: string;
  mode: string;
  ratio: string;
  resolution: string;
  duration: string;
  soundEnabled: boolean;
}

const loadLS = <T,>(key: string): T | null => {
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : null;
  } catch {
    return null;
  }
};

const saveLS = (key: string, value: unknown) => {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch { /* quota errors — silently ignore */ }
};

// ── Collapsible card wrapper ─────────────────────────────────────────────────
const SettingsCard: React.FC<{
  icon: React.ReactNode;
  accentClass: string;
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

// ─────────────────────────────────────────────────────────────────────────────

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

export const SettingsTab: React.FC<SettingsTabProps> = ({
  settings,
  setSettings,
  isProcessing,
  onSaveAndGenerate,
}) => {
  // ── Restore persisted state ──────────────────────────────────────────────────
  const persistedImg = loadLS<ImgPersistedState>(LS_IMG);
  const persistedVid = loadLS<VidPersistedState>(LS_VID);

  // ── Image AI ────────────────────────────────────────────────────────────────
  const [imgEngine, setImgEngine] = useState(persistedImg?.engine ?? settings?.imageEngine ?? 'gommo');
  const imgModels = useImageModels(imgEngine, persistedImg?.modelKey ?? settings?.imageModel);
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

  // Restore img family/mode/ratio/res after models load
  useEffect(() => {
    if (!persistedImg || imgFamilyList.length === 0) return;
    if (persistedImg.family && imgFamilyList.includes(persistedImg.family))
      setImgSelectedFamily(persistedImg.family);
    if (persistedImg.mode) setImgSelectedMode(persistedImg.mode);
    if (persistedImg.ratio) setImgSelectedRatio(persistedImg.ratio);
    if (persistedImg.res) setImgSelectedRes(persistedImg.res);
  // run once when family list first populates
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [imgFamilyList.length > 0]);

  // Persist image state on every change
  useEffect(() => {
    if (!imgSelectedModel) return;
    saveLS<ImgPersistedState>(LS_IMG, {
      engine: imgEngine,
      modelKey: imgSelectedModel.raw?.modelKey ?? imgSelectedModel.id,
      family: imgSelectedFamily,
      mode: imgSelectedMode,
      ratio: imgSelectedRatio,
      res: imgSelectedRes,
    });
  }, [imgEngine, imgSelectedModel, imgSelectedFamily, imgSelectedMode, imgSelectedRatio, imgSelectedRes]);

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

  // ── Video AI ─────────────────────────────────────────────────────────────────
  const [videoEngine, setVideoEngine] = useState(persistedVid?.engine ?? settings?.videoEngine ?? 'gommo');
  const vid = useVideoModels(videoEngine, persistedVid?.modelKey ?? settings?.model);

  // Restore video family/mode/ratio/res after models load
  useEffect(() => {
    if (!persistedVid || vid.familyList.length === 0) return;
    if (persistedVid.family && vid.familyList.includes(persistedVid.family))
      vid.setSelectedFamily(persistedVid.family);
    if (persistedVid.mode) vid.setSelectedMode(persistedVid.mode);
    if (persistedVid.ratio) vid.setRatio(persistedVid.ratio);
    if (persistedVid.resolution) vid.setResolution(persistedVid.resolution);
  // run once when family list first populates
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [vid.familyList.length > 0]);

  // Persist video state on every change
  useEffect(() => {
    if (!vid.selectedModelObj) return;
    saveLS<VidPersistedState>(LS_VID, {
      engine: videoEngine,
      modelKey: vid.selectedModelObj.modelKey,
      family: vid.selectedFamily,
      mode: vid.selectedMode,
      ratio: vid.ratio,
      resolution: vid.resolution,
      duration: vid.duration,
      soundEnabled: vid.soundEnabled,
    });
  }, [videoEngine, vid.selectedModelObj, vid.selectedFamily, vid.selectedMode, vid.ratio, vid.resolution, vid.duration, vid.soundEnabled]);

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
              Image AI · Video AI
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
            1. IMAGE AI ENGINE
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
            2. VIDEO AI ENGINE
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
