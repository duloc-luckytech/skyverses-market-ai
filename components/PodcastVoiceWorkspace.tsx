import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import {
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  Coins,
  Download,
  FileText,
  Headphones,
  History,
  Loader2,
  MessageSquareText,
  Mic,
  Plus,
  RefreshCw,
  RotateCcw,
  Save,
  Scissors,
  Settings,
  SlidersHorizontal,
  Sparkles,
  SplitSquareHorizontal,
  Tag,
  Trash2,
  Upload,
  Wand2,
  X,
} from 'lucide-react';
import {
  AudioGenerationDTO,
  AudioGenerationKind,
  AudioProvider,
  AudioVoiceDTO,
  podcastVoiceApi,
  podcastVoiceAudioUrl,
} from '../apis/podcastVoice';
import {
  PodcastSpeaker,
  usePodcastVoice,
} from '../hooks/usePodcastVoice';

interface Props {
  onClose: () => void;
}

const formatNumber = (value: number) => new Intl.NumberFormat('vi-VN').format(value);

const shortDate = (value: string) =>
  new Intl.DateTimeFormat('vi-VN', {
    hour: '2-digit',
    minute: '2-digit',
    day: '2-digit',
    month: '2-digit',
  }).format(new Date(value));

const truncate = (value: string, max = 120) =>
  value.length > max ? `${value.slice(0, max - 1)}...` : value;

const SaveBadge: React.FC<{ lastSavedAt: number | null }> = ({ lastSavedAt }) => {
  const [, force] = useState(0);

  useEffect(() => {
    const id = window.setInterval(() => force((n) => n + 1), 5000);
    return () => window.clearInterval(id);
  }, []);

  if (!lastSavedAt) return null;
  const seconds = Math.floor((Date.now() - lastSavedAt) / 1000);
  const label = seconds < 8 ? 'Đã lưu' : seconds < 60 ? `Đã lưu ${seconds}s trước` : `Đã lưu ${Math.floor(seconds / 60)}p trước`;
  return (
    <span className="hidden items-center gap-1 text-[10px] font-semibold text-emerald-500 md:inline-flex">
      <Save size={11} />
      {label}
    </span>
  );
};

const ProviderToggle: React.FC<{
  value: AudioProvider;
  onChange: (value: AudioProvider) => void;
}> = ({ value, onChange }) => (
  <div className="grid grid-cols-2 rounded-lg border border-slate-200 bg-slate-100 p-1 dark:border-white/[0.08] dark:bg-white/[0.04]">
    {(['gemini', 'gommo'] as AudioProvider[]).map((provider) => (
      <button
        key={provider}
        type="button"
        onClick={() => onChange(provider)}
        className={`rounded-md px-3 py-1.5 text-[11px] font-bold uppercase tracking-wider transition-all ${
          value === provider
            ? 'bg-white text-brand-blue shadow-sm dark:bg-white/[0.1] dark:text-white'
            : 'text-slate-500 hover:text-slate-900 dark:text-gray-400 dark:hover:text-white'
        }`}
      >
        {provider}
      </button>
    ))}
  </div>
);

const VoiceSelect: React.FC<{
  voices: AudioVoiceDTO[];
  value: string;
  provider: AudioProvider;
  language?: string;
  onChange: (voiceId: string) => void;
}> = ({ voices, value, provider, language, onChange }) => {
  const options = useMemo(() => {
    const providerVoices = voices.filter((voice) => voice.provider === provider);
    const languageVoices = language
      ? providerVoices.filter((voice) => voice.language === language || voice.language === 'en')
      : providerVoices;
    return languageVoices.length > 0 ? languageVoices : providerVoices;
  }, [language, provider, voices]);
  const selected = voices.find((voice) => voice.providerVoiceId === value);

  return (
    <div className="space-y-1.5">
      <select
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="h-10 w-full rounded-lg border border-slate-200 bg-white px-3 text-[12px] font-semibold text-slate-800 outline-none transition-colors focus:border-brand-blue/60 dark:border-white/[0.08] dark:bg-white/[0.04] dark:text-white"
      >
        {options.map((voice) => (
          <option key={voice._id} value={voice.providerVoiceId}>
            {voice.name} - {voice.language.toUpperCase()} - {voice.gender}
          </option>
        ))}
      </select>
      {selected?.description && (
        <p className="line-clamp-2 text-[10px] leading-relaxed text-slate-500 dark:text-gray-400">
          {selected.description}
        </p>
      )}
    </div>
  );
};

const AudioResult: React.FC<{
  generation: AudioGenerationDTO;
  onDismiss?: () => void;
}> = ({ generation, onDismiss }) => {
  if (!generation.outputUrl) return null;
  const url = podcastVoiceAudioUrl(generation.outputUrl);
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-xl border border-brand-blue/30 bg-brand-blue/[0.04] p-3 shadow-lg shadow-brand-blue/10"
    >
      <div className="mb-2 flex items-center justify-between gap-3">
        <div className="min-w-0">
          <p className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-widest text-brand-blue">
            <CheckCircle2 size={12} />
            Audio ready
          </p>
          <p className="mt-0.5 truncate text-[12px] font-semibold text-slate-700 dark:text-white">
            {generation.taskName || generation.textPreview || generation.kind}
          </p>
        </div>
        <div className="flex items-center gap-1">
          <a
            href={url}
            download={`${generation.taskName || generation.kind}.wav`}
            className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-600 transition-colors hover:text-brand-blue dark:border-white/[0.08] dark:bg-white/[0.05] dark:text-gray-300"
            title="Download"
          >
            <Download size={14} />
          </a>
          {onDismiss && (
            <button
              type="button"
              onClick={onDismiss}
              className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-700 dark:hover:bg-white/[0.06] dark:hover:text-white"
              title="Dismiss"
            >
              <X size={14} />
            </button>
          )}
        </div>
      </div>
      <audio src={url} controls className="w-full" />
      <div className="mt-2 flex flex-wrap items-center gap-2 text-[10px] font-semibold text-slate-500 dark:text-gray-400">
        <span>{generation.provider}</span>
        <span>{formatNumber(generation.charCount)} chars</span>
        <span>{formatNumber(generation.creditsUsed)} CR</span>
      </div>
    </motion.div>
  );
};

const HistoryPanel: React.FC<{
  kind: AudioGenerationKind;
  refreshKey: number;
  onRegenerate: (generation: AudioGenerationDTO) => void;
}> = ({ kind, refreshKey, onRegenerate }) => {
  const [items, setItems] = useState<AudioGenerationDTO[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchItems = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const next = await podcastVoiceApi.getHistory(kind, 80);
      setItems(next);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Không tải được lịch sử');
    } finally {
      setLoading(false);
    }
  }, [kind]);

  useEffect(() => {
    fetchItems();
  }, [fetchItems, refreshKey]);

  const deleteItem = async (id: string) => {
    await podcastVoiceApi.deleteHistory(id);
    setItems((current) => current.filter((item) => item._id !== id));
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-6 text-[12px] text-slate-500 dark:text-gray-400">
        <Loader2 className="mr-2 animate-spin" size={14} />
        Loading
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-lg border border-amber-500/20 bg-amber-500/[0.08] p-3 text-[11px] text-amber-700 dark:text-amber-300">
        {error}
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="rounded-lg border border-slate-200 p-4 text-center text-[12px] text-slate-500 dark:border-white/[0.08] dark:text-gray-400">
        Chưa có audio nào
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {items.map((item) => (
        <div
          key={item._id}
          className="rounded-lg border border-slate-200 bg-white p-3 dark:border-white/[0.08] dark:bg-white/[0.03]"
        >
          <div className="mb-1 flex items-center justify-between gap-2">
            <span className="text-[10px] font-semibold text-slate-400 dark:text-gray-500">
              {shortDate(item.createdAt)}
            </span>
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={() => onRegenerate(item)}
                className="inline-flex h-7 w-7 items-center justify-center rounded-md text-slate-400 hover:bg-slate-100 hover:text-brand-blue dark:hover:bg-white/[0.06]"
                title="Regenerate"
              >
                <RefreshCw size={12} />
              </button>
              <button
                type="button"
                onClick={() => deleteItem(item._id)}
                className="inline-flex h-7 w-7 items-center justify-center rounded-md text-slate-400 hover:bg-rose-500/10 hover:text-rose-500"
                title="Delete"
              >
                <Trash2 size={12} />
              </button>
            </div>
          </div>
          <p className="line-clamp-2 text-[12px] font-bold text-slate-800 dark:text-white">
            {truncate(item.taskName || item.textPreview || item.inputText || item.kind, 100)}
          </p>
          {item.outputUrl && (
            <div className="mt-2">
              <audio src={podcastVoiceAudioUrl(item.outputUrl)} controls className="w-full" />
            </div>
          )}
          <div className="mt-2 flex items-center justify-between text-[10px] font-semibold text-slate-400 dark:text-gray-500">
            <span>{item.status}</span>
            <span>{formatNumber(item.creditsUsed)} CR</span>
          </div>
        </div>
      ))}
    </div>
  );
};

const DetectedDialoguePanel: React.FC<{
  turns: Array<{ speaker: string; emotion?: string; text: string }>;
  speakers: string[];
}> = ({ turns, speakers }) => {
  const [collapsed, setCollapsed] = useState(turns.length > 6);
  if (turns.length === 0) return null;

  return (
    <div className="mb-4 rounded-xl border border-slate-200 bg-white p-3 dark:border-white/[0.08] dark:bg-white/[0.03]">
      <div className="flex flex-wrap items-center gap-2">
        <span className="text-[11px] font-bold uppercase tracking-widest text-slate-400 dark:text-gray-500">
          Detected
        </span>
        {speakers.map((speaker) => (
          <span
            key={speaker}
            className="rounded-full border border-brand-blue/20 bg-brand-blue/10 px-2 py-0.5 text-[10px] font-bold text-brand-blue"
          >
            {speaker}
          </span>
        ))}
        <span className="text-[10px] font-semibold text-slate-400 dark:text-gray-500">
          {turns.length} turns
        </span>
        <button
          type="button"
          onClick={() => setCollapsed((value) => !value)}
          className="ml-auto inline-flex items-center gap-1 rounded-md px-2 py-1 text-[10px] font-bold text-slate-500 hover:bg-slate-100 dark:text-gray-400 dark:hover:bg-white/[0.06]"
        >
          {collapsed ? <ChevronDown size={12} /> : <ChevronUp size={12} />}
          {collapsed ? 'Show' : 'Hide'}
        </button>
      </div>
      {!collapsed && (
        <div className="mt-3 max-h-52 space-y-2 overflow-y-auto pr-1">
          {turns.map((turn, index) => (
            <div
              key={`${turn.speaker}-${index}`}
              className="grid gap-2 rounded-lg border border-slate-100 bg-slate-50 p-2 text-[12px] dark:border-white/[0.06] dark:bg-black/20 sm:grid-cols-[110px_1fr]"
            >
              <div className="min-w-0">
                <span className="inline-flex max-w-full rounded-full bg-brand-blue/10 px-2 py-0.5 text-[10px] font-bold text-brand-blue">
                  <span className="truncate">{turn.speaker}</span>
                </span>
                {turn.emotion && (
                  <p className="mt-1 truncate text-[10px] text-slate-400">{turn.emotion}</p>
                )}
              </div>
              <p className="min-w-0 leading-relaxed text-slate-600 dark:text-gray-300">
                {turn.text}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

const SpeakerCard: React.FC<{
  index: number;
  speaker: PodcastSpeaker;
  speakersCount: number;
  voices: AudioVoiceDTO[];
  modelOptions: Record<AudioProvider, Array<{ id: string; label: string }>>;
  languageOptions: Array<{ code: string; label: string }>;
  onUpdate: (patch: Partial<PodcastSpeaker>) => void;
  onRemove: () => void;
}> = ({
  index,
  speaker,
  speakersCount,
  voices,
  modelOptions,
  languageOptions,
  onUpdate,
  onRemove,
}) => {
  const [open, setOpen] = useState(index < 2);
  const models = modelOptions[speaker.provider];

  return (
    <div className="rounded-lg border border-slate-200 bg-white dark:border-white/[0.08] dark:bg-white/[0.03]">
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        className="flex w-full items-center justify-between gap-2 px-3 py-2"
      >
        <div className="flex min-w-0 items-center gap-2">
          <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-brand-blue text-[11px] font-bold text-white">
            {index + 1}
          </span>
          <input
            value={speaker.label}
            onChange={(event) => onUpdate({ label: event.target.value })}
            onClick={(event) => event.stopPropagation()}
            className="h-7 min-w-0 flex-1 rounded-md border-0 bg-transparent text-[12px] font-bold text-slate-800 outline-none dark:text-white"
          />
        </div>
        <div className="flex items-center gap-1">
          <span className="hidden rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-bold text-slate-500 dark:bg-white/[0.06] dark:text-gray-300 sm:inline-flex">
            {speaker.voiceId}
          </span>
          {speakersCount > 1 && (
            <span
              onClick={(event) => {
                event.stopPropagation();
                onRemove();
              }}
              className="inline-flex h-7 w-7 items-center justify-center rounded-md text-slate-400 hover:bg-rose-500/10 hover:text-rose-500"
            >
              <Trash2 size={13} />
            </span>
          )}
          {open ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
        </div>
      </button>
      {open && (
        <div className="space-y-3 border-t border-slate-100 px-3 py-3 dark:border-white/[0.06]">
          <ProviderToggle
            value={speaker.provider}
            onChange={(provider) => onUpdate({ provider })}
          />
          <VoiceSelect
            voices={voices}
            value={speaker.voiceId}
            provider={speaker.provider}
            language={speaker.language}
            onChange={(voiceId) => onUpdate({ voiceId })}
          />
          <select
            value={speaker.model}
            onChange={(event) => onUpdate({ model: event.target.value })}
            className="h-9 w-full rounded-lg border border-slate-200 bg-white px-3 text-[11px] font-semibold text-slate-700 outline-none dark:border-white/[0.08] dark:bg-white/[0.04] dark:text-white"
          >
            {models.map((model) => (
              <option key={model.id} value={model.id}>
                {model.label}
              </option>
            ))}
          </select>
          <select
            value={speaker.language}
            onChange={(event) => onUpdate({ language: event.target.value })}
            className="h-9 w-full rounded-lg border border-slate-200 bg-white px-3 text-[11px] font-semibold text-slate-700 outline-none dark:border-white/[0.08] dark:bg-white/[0.04] dark:text-white"
          >
            {languageOptions.map((language) => (
              <option key={language.code} value={language.code}>
                {language.label}
              </option>
            ))}
          </select>
          <div className="space-y-1">
            <div className="flex justify-between text-[10px] font-semibold text-slate-400 dark:text-gray-500">
              <span>Speed</span>
              <span>{speaker.speed.toFixed(2)}x</span>
            </div>
            <input
              type="range"
              min="0.5"
              max="2"
              step="0.05"
              value={speaker.speed}
              onChange={(event) => onUpdate({ speed: Number(event.target.value) })}
              className="w-full accent-brand-blue"
            />
          </div>
        </div>
      )}
    </div>
  );
};

const PodcastVoiceWorkspace: React.FC<Props> = ({ onClose }) => {
  const s = usePodcastVoice();
  const [rightTab, setRightTab] = useState<'settings' | 'history'>('settings');
  const [scriptIdea, setScriptIdea] = useState('');
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const usingNative = useMemo(
    () =>
      s.mode === 'dialogue' &&
      s.detectedSpeakers.length > 0 &&
      s.detectedSpeakers.length <= 2 &&
      s.speakers.every((speaker) => speaker.provider === 'gemini'),
    [s.detectedSpeakers.length, s.mode, s.speakers]
  );

  const loadFile = async (file?: File) => {
    if (!file) return;
    const content = await file.text();
    if (s.mode === 'tts') s.setTtsText(content);
    else s.setDialogueText(content);
  };

  const handleTtsProviderChange = (provider: AudioProvider) => {
    s.setTtsProvider(provider);
    s.setTtsModel(s.MODEL_OPTIONS[provider][0].id);
    const nextVoice = s.voices.find((voice) => voice.provider === provider);
    if (nextVoice) s.setTtsVoiceId(nextVoice.providerVoiceId);
  };

  const handleHistoryRegenerate = (generation: AudioGenerationDTO) => {
    if (generation.kind === 'tts') {
      s.setMode('tts');
      if (generation.inputText) s.setTtsText(generation.inputText);
      if (generation.voiceId) s.setTtsVoiceId(generation.voiceId);
      if (generation.language) s.setTtsLanguage(generation.language);
      if (generation.model) s.setTtsModel(generation.model);
    } else {
      s.setMode('dialogue');
      if (generation.inputText) s.setDialogueText(generation.inputText);
    }
    if (generation.taskName) s.setTaskName(generation.taskName);
    setRightTab('settings');
  };

  return (
    <div className="flex h-full w-full flex-col bg-slate-50 font-sans text-slate-900 dark:bg-[var(--atlas-bg-page)] dark:text-white">
      <header className="flex h-14 shrink-0 items-center justify-between border-b border-black/[0.06] bg-white px-3 dark:border-white/[0.08] dark:bg-[#111722] sm:px-5">
        <div className="flex min-w-0 items-center gap-2">
          <button
            type="button"
            onClick={onClose}
            className="inline-flex h-9 w-9 items-center justify-center rounded-lg text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-900 dark:hover:bg-white/[0.06] dark:hover:text-white"
            title="Close"
          >
            <X size={17} />
          </button>
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-brand-blue to-purple-500 text-white">
            <Headphones size={16} />
          </div>
          <div className="min-w-0">
            <p className="truncate text-[13px] font-bold">AI Podcast Voice</p>
            <SaveBadge lastSavedAt={s.lastSavedAt} />
          </div>
        </div>

        <div className="hidden rounded-lg border border-slate-200 bg-slate-100 p-1 dark:border-white/[0.08] dark:bg-white/[0.04] md:grid md:grid-cols-2">
          <button
            type="button"
            onClick={() => s.setMode('dialogue')}
            className={`inline-flex items-center justify-center gap-1.5 rounded-md px-4 py-1.5 text-[11px] font-bold uppercase tracking-widest transition-all ${
              s.mode === 'dialogue'
                ? 'bg-white text-brand-blue shadow-sm dark:bg-white/[0.1] dark:text-white'
                : 'text-slate-500 dark:text-gray-400'
            }`}
          >
            <MessageSquareText size={13} />
            Dialogue
          </button>
          <button
            type="button"
            onClick={() => s.setMode('tts')}
            className={`inline-flex items-center justify-center gap-1.5 rounded-md px-4 py-1.5 text-[11px] font-bold uppercase tracking-widest transition-all ${
              s.mode === 'tts'
                ? 'bg-white text-brand-blue shadow-sm dark:bg-white/[0.1] dark:text-white'
                : 'text-slate-500 dark:text-gray-400'
            }`}
          >
            <Mic size={13} />
            TTS
          </button>
        </div>

        <div className="flex items-center gap-2">
          <span className="hidden items-center gap-1.5 rounded-full bg-brand-blue/10 px-3 py-1 text-[11px] font-bold text-brand-blue sm:inline-flex">
            <Coins size={12} />
            {formatNumber(s.credits)} CR
          </span>
          <button
            type="button"
            onClick={() => setRightTab((tab) => (tab === 'settings' ? 'history' : 'settings'))}
            className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-500 lg:hidden dark:border-white/[0.08] dark:bg-white/[0.04] dark:text-gray-300"
            title="Panel"
          >
            <SlidersHorizontal size={16} />
          </button>
        </div>
      </header>

      <div className="grid min-h-0 flex-1 grid-cols-1 lg:grid-cols-[minmax(0,1fr)_390px]">
        <main className="flex min-h-0 flex-col">
          <div className="flex flex-wrap items-center gap-2 border-b border-black/[0.06] bg-white px-4 py-3 dark:border-white/[0.08] dark:bg-[#111722] sm:px-6">
            <Tag size={14} className="text-slate-400" />
            <input
              value={s.taskName}
              onChange={(event) => s.setTaskName(event.target.value)}
              placeholder="Task name"
              className="h-8 min-w-[160px] flex-1 border-0 bg-transparent text-[13px] font-bold text-slate-800 outline-none dark:text-white"
            />
            {s.mode === 'dialogue' && (
              <span
                className={`rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-widest ${
                  usingNative
                    ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
                    : 'bg-amber-500/10 text-amber-600 dark:text-amber-300'
                }`}
              >
                {usingNative ? 'Native ready' : 'Per-turn'}
              </span>
            )}
          </div>

          <div className="flex flex-wrap items-center gap-2 border-b border-black/[0.06] bg-brand-blue/[0.04] px-4 py-3 dark:border-white/[0.08] sm:px-6">
            <FileText size={14} className="text-brand-blue" />
            <span className="text-[11px] font-bold uppercase tracking-widest text-slate-500 dark:text-gray-400">
              Templates
            </span>
            {s.mode === 'dialogue'
              ? s.DIALOGUE_TEMPLATES.map((template) => (
                <button
                  key={template.id}
                  type="button"
                  onClick={() => s.loadDialogueTemplate(template.id)}
                  className="rounded-lg border border-brand-blue/20 bg-white px-3 py-1.5 text-[11px] font-bold text-slate-700 transition-colors hover:text-brand-blue dark:bg-white/[0.05] dark:text-gray-200"
                  title={template.description}
                >
                  {template.label}
                </button>
              ))
              : s.TTS_TEMPLATES.map((template) => (
                <button
                  key={template.id}
                  type="button"
                  onClick={() => s.loadTtsTemplate(template.id)}
                  className="rounded-lg border border-brand-blue/20 bg-white px-3 py-1.5 text-[11px] font-bold text-slate-700 transition-colors hover:text-brand-blue dark:bg-white/[0.05] dark:text-gray-200"
                  title={template.description}
                >
                  {template.label}
                </button>
              ))}
            {s.mode === 'dialogue' && (
              <button
                type="button"
                onClick={s.autoDetectDialogue}
                className="ml-auto inline-flex items-center gap-1.5 rounded-lg bg-brand-blue px-3 py-1.5 text-[11px] font-bold text-white transition-all hover:brightness-110"
              >
                <Wand2 size={13} />
                Auto detect
              </button>
            )}
          </div>

          <div className="min-h-0 flex-1 overflow-y-auto p-4 pb-28 sm:p-6 lg:pb-6">
            {s.mode === 'dialogue' ? (
              <>
                <DetectedDialoguePanel turns={s.dialogueTurns} speakers={s.detectedSpeakers} />
                <textarea
                  value={s.dialogueText}
                  onChange={(event) => s.setDialogueText(event.target.value)}
                  placeholder="MC: Xin chào...\nKhách: Rất vui được tham gia..."
                  className="min-h-[420px] w-full resize-none rounded-xl border border-slate-200 bg-white p-4 text-[14px] leading-relaxed text-slate-800 outline-none transition-colors focus:border-brand-blue/60 dark:border-white/[0.08] dark:bg-white/[0.03] dark:text-white"
                />
              </>
            ) : (
              <textarea
                value={s.ttsText}
                onChange={(event) => s.setTtsText(event.target.value)}
                placeholder="Nhập text cần chuyển thành giọng nói..."
                className="min-h-[520px] w-full resize-none rounded-xl border border-slate-200 bg-white p-4 text-[14px] leading-relaxed text-slate-800 outline-none transition-colors focus:border-brand-blue/60 dark:border-white/[0.08] dark:bg-white/[0.03] dark:text-white"
              />
            )}

            {s.lastGeneration?.outputUrl && (
              <div className="mt-4">
                <AudioResult
                  generation={s.lastGeneration}
                  onDismiss={() => s.setLastGeneration(null)}
                />
              </div>
            )}
          </div>

          <footer className="hidden flex-wrap items-center justify-between gap-3 border-t border-black/[0.06] bg-white px-4 py-3 dark:border-white/[0.08] dark:bg-[#111722] lg:flex">
            <div className="flex items-center gap-2">
              <input
                ref={fileInputRef}
                type="file"
                accept=".txt,.srt,.md"
                hidden
                onChange={(event) => loadFile(event.target.files?.[0])}
              />
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 text-slate-500 transition-colors hover:text-brand-blue dark:border-white/[0.08] dark:text-gray-300"
                title="Upload"
              >
                <Upload size={15} />
              </button>
              {s.mode === 'tts' && (
                <>
                  <button
                    type="button"
                    onClick={s.splitTtsByLine}
                    className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 px-3 py-2 text-[11px] font-bold text-slate-600 transition-colors hover:text-brand-blue dark:border-white/[0.08] dark:text-gray-300"
                  >
                    <SplitSquareHorizontal size={13} />
                    Clean lines
                  </button>
                  <button
                    type="button"
                    onClick={s.splitTtsBySentence}
                    className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 px-3 py-2 text-[11px] font-bold text-slate-600 transition-colors hover:text-brand-blue dark:border-white/[0.08] dark:text-gray-300"
                  >
                    <Scissors size={13} />
                    Split sentences
                  </button>
                </>
              )}
              <button
                type="button"
                onClick={s.normalizeCurrentText}
                className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 px-3 py-2 text-[11px] font-bold text-slate-600 transition-colors hover:text-brand-blue dark:border-white/[0.08] dark:text-gray-300"
              >
                <RotateCcw size={13} />
                Normalize VI
              </button>
            </div>
            <div className="flex items-center gap-3">
              <div className="text-[12px] font-semibold text-slate-500 dark:text-gray-400">
                {formatNumber(s.activeCharCount)} chars · {formatNumber(s.activeCredits)}/{formatNumber(s.credits)} CR
              </div>
              <button
                type="button"
                onClick={s.generateActive}
                disabled={s.isGenerating || s.activeCharCount === 0}
                className="inline-flex items-center gap-2 rounded-xl bg-brand-blue px-5 py-2.5 text-[12px] font-bold uppercase tracking-widest text-white shadow-lg shadow-brand-blue/20 transition-all hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {s.isGenerating ? <Loader2 size={15} className="animate-spin" /> : <Sparkles size={15} />}
                Generate
              </button>
            </div>
          </footer>
        </main>

        <aside
          className="block min-h-0 border-l border-black/[0.06] bg-white dark:border-white/[0.08] dark:bg-[#111722] lg:flex lg:flex-col"
        >
          <div className="grid shrink-0 grid-cols-2 gap-1 border-b border-black/[0.06] p-3 dark:border-white/[0.08]">
            <button
              type="button"
              onClick={() => setRightTab('settings')}
              className={`inline-flex items-center justify-center gap-1.5 rounded-lg px-3 py-2 text-[11px] font-bold uppercase tracking-widest ${
                rightTab === 'settings'
                  ? 'bg-brand-blue text-white'
                  : 'bg-slate-100 text-slate-500 dark:bg-white/[0.04] dark:text-gray-400'
              }`}
            >
              <Settings size={13} />
              Settings
            </button>
            <button
              type="button"
              onClick={() => setRightTab('history')}
              className={`inline-flex items-center justify-center gap-1.5 rounded-lg px-3 py-2 text-[11px] font-bold uppercase tracking-widest ${
                rightTab === 'history'
                  ? 'bg-brand-blue text-white'
                  : 'bg-slate-100 text-slate-500 dark:bg-white/[0.04] dark:text-gray-400'
              }`}
            >
              <History size={13} />
              History
            </button>
          </div>

          {rightTab === 'settings' ? (
            <div className="min-h-0 flex-1 space-y-4 overflow-y-auto p-4">
              {s.mode === 'dialogue' ? (
                <>
                  <div className="rounded-xl border border-purple-500/20 bg-purple-500/[0.05] p-3">
                    <p className="mb-2 flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-widest text-purple-600 dark:text-purple-300">
                      <Wand2 size={12} />
                      Script AI
                    </p>
                    <textarea
                      value={scriptIdea}
                      onChange={(event) => setScriptIdea(event.target.value)}
                      placeholder="Outline podcast..."
                      rows={3}
                      className="w-full resize-none rounded-lg border border-slate-200 bg-white p-2 text-[12px] text-slate-800 outline-none focus:border-purple-500/60 dark:border-white/[0.08] dark:bg-white/[0.04] dark:text-white"
                    />
                    <button
                      type="button"
                      onClick={() => s.enhanceDialogue(scriptIdea)}
                      disabled={s.isGenerating || !scriptIdea.trim()}
                      className="mt-2 inline-flex w-full items-center justify-center gap-1.5 rounded-lg bg-purple-500 px-3 py-2 text-[11px] font-bold text-white transition-all hover:brightness-110 disabled:opacity-50"
                    >
                      {s.isGenerating ? <Loader2 size={13} className="animate-spin" /> : <Sparkles size={13} />}
                      Create script
                    </button>
                  </div>

                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <p className="text-[11px] font-bold uppercase tracking-widest text-slate-400 dark:text-gray-500">
                        Speakers
                      </p>
                      <button
                        type="button"
                        onClick={s.addSpeaker}
                        className="inline-flex items-center gap-1 text-[11px] font-bold text-brand-blue"
                      >
                        <Plus size={12} />
                        Add
                      </button>
                    </div>
                    {s.speakers.map((speaker, index) => (
                      <SpeakerCard
                        key={`${speaker.label}-${index}`}
                        index={index}
                        speaker={speaker}
                        speakersCount={s.speakers.length}
                        voices={s.voices}
                        modelOptions={s.MODEL_OPTIONS}
                        languageOptions={s.LANGUAGE_OPTIONS}
                        onUpdate={(patch) => s.updateSpeaker(index, patch)}
                        onRemove={() => s.removeSpeaker(index)}
                      />
                    ))}
                  </div>

                  <div className="space-y-2">
                    <div className="flex justify-between text-[11px] font-semibold text-slate-500 dark:text-gray-400">
                      <span>Pause between turns</span>
                      <span>{(s.pauseMs / 1000).toFixed(1)}s</span>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="3000"
                      step="100"
                      value={s.pauseMs}
                      onChange={(event) => s.setPauseMs(Number(event.target.value))}
                      className="w-full accent-brand-blue"
                    />
                  </div>
                </>
              ) : (
                <>
                  <div className="space-y-2">
                    <p className="text-[11px] font-bold uppercase tracking-widest text-slate-400 dark:text-gray-500">
                      Provider
                    </p>
                    <ProviderToggle value={s.ttsProvider} onChange={handleTtsProviderChange} />
                  </div>

                  <div className="space-y-2">
                    <p className="text-[11px] font-bold uppercase tracking-widest text-slate-400 dark:text-gray-500">
                      Voice
                    </p>
                    <VoiceSelect
                      voices={s.voices}
                      value={s.ttsVoiceId}
                      provider={s.ttsProvider}
                      language={s.ttsLanguage}
                      onChange={s.setTtsVoiceId}
                    />
                  </div>

                  <div className="space-y-2">
                    <p className="text-[11px] font-bold uppercase tracking-widest text-slate-400 dark:text-gray-500">
                      Model
                    </p>
                    <select
                      value={s.ttsModel}
                      onChange={(event) => s.setTtsModel(event.target.value)}
                      className="h-10 w-full rounded-lg border border-slate-200 bg-white px-3 text-[12px] font-semibold text-slate-800 outline-none dark:border-white/[0.08] dark:bg-white/[0.04] dark:text-white"
                    >
                      {s.MODEL_OPTIONS[s.ttsProvider].map((model) => (
                        <option key={model.id} value={model.id}>
                          {model.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-2">
                    <p className="text-[11px] font-bold uppercase tracking-widest text-slate-400 dark:text-gray-500">
                      Language
                    </p>
                    <select
                      value={s.ttsLanguage}
                      onChange={(event) => s.setTtsLanguage(event.target.value)}
                      className="h-10 w-full rounded-lg border border-slate-200 bg-white px-3 text-[12px] font-semibold text-slate-800 outline-none dark:border-white/[0.08] dark:bg-white/[0.04] dark:text-white"
                    >
                      {s.LANGUAGE_OPTIONS.map((language) => (
                        <option key={language.code} value={language.code}>
                          {language.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-2">
                    <div className="flex justify-between text-[11px] font-semibold text-slate-500 dark:text-gray-400">
                      <span>Stability</span>
                      <span>{Math.round(s.stability * 100)}%</span>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="1"
                      step="0.01"
                      value={s.stability}
                      onChange={(event) => s.setStability(Number(event.target.value))}
                      className="w-full accent-brand-blue"
                    />
                  </div>

                  <label className="flex cursor-pointer items-center justify-between rounded-lg border border-slate-200 bg-white p-3 dark:border-white/[0.08] dark:bg-white/[0.03]">
                    <span>
                      <span className="block text-[12px] font-bold text-slate-800 dark:text-white">
                        Export transcript
                      </span>
                      <span className="text-[10px] font-semibold text-slate-400 dark:text-gray-500">
                        Adds 15% credits
                      </span>
                    </span>
                    <input
                      type="checkbox"
                      checked={s.exportTranscript}
                      onChange={(event) => s.setExportTranscript(event.target.checked)}
                      className="h-4 w-4 accent-brand-blue"
                    />
                  </label>
                </>
              )}
            </div>
          ) : (
            <div className="min-h-0 flex-1 overflow-y-auto p-4">
              <HistoryPanel
                kind={s.mode}
                refreshKey={s.historyKey}
                onRegenerate={handleHistoryRegenerate}
              />
            </div>
          )}
        </aside>
      </div>

      <div className="fixed inset-x-0 bottom-0 z-[510] border-t border-black/[0.06] bg-white/95 px-4 py-3 shadow-2xl backdrop-blur dark:border-white/[0.08] dark:bg-[#111722]/95 lg:hidden">
        <div className="mb-2 flex rounded-lg border border-slate-200 bg-slate-100 p-1 dark:border-white/[0.08] dark:bg-white/[0.04]">
          <button
            type="button"
            onClick={() => s.setMode('dialogue')}
            className={`flex-1 rounded-md px-3 py-1.5 text-[11px] font-bold uppercase tracking-widest ${
              s.mode === 'dialogue' ? 'bg-white text-brand-blue shadow-sm dark:bg-white/[0.1]' : 'text-slate-500'
            }`}
          >
            Dialogue
          </button>
          <button
            type="button"
            onClick={() => s.setMode('tts')}
            className={`flex-1 rounded-md px-3 py-1.5 text-[11px] font-bold uppercase tracking-widest ${
              s.mode === 'tts' ? 'bg-white text-brand-blue shadow-sm dark:bg-white/[0.1]' : 'text-slate-500'
            }`}
          >
            TTS
          </button>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-slate-200 text-slate-500 dark:border-white/[0.08] dark:text-gray-300"
            title="Upload"
          >
            <Upload size={16} />
          </button>
          <div className="min-w-0 flex-1 text-[11px] font-semibold text-slate-500 dark:text-gray-400">
            {formatNumber(s.activeCharCount)} chars · {formatNumber(s.activeCredits)}/{formatNumber(s.credits)} CR
          </div>
          <button
            type="button"
            onClick={s.generateActive}
            disabled={s.isGenerating || s.activeCharCount === 0}
            className="inline-flex h-11 shrink-0 items-center justify-center gap-1.5 rounded-xl bg-brand-blue px-4 text-[11px] font-bold uppercase tracking-widest text-white disabled:opacity-50"
          >
            {s.isGenerating ? <Loader2 size={14} className="animate-spin" /> : <Sparkles size={14} />}
            Generate
          </button>
        </div>
      </div>
    </div>
  );
};

export default PodcastVoiceWorkspace;
