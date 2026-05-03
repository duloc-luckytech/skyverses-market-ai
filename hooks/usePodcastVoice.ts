import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { aiTextViaProxy } from '../apis/aiCommon';
import {
  AudioGenerationDTO,
  AudioProvider,
  AudioVoiceDTO,
  DialogueSpeakerPayload,
  podcastVoiceApi,
} from '../apis/podcastVoice';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { loadGlobalBrandKit, subscribeBrandKit } from '../utils/globalBrandKit';

export type PodcastWorkspaceMode = 'dialogue' | 'tts';
export type PodcastLang = 'vi' | 'en' | 'ko' | 'ja';

export interface DialogueTurn {
  speaker: string;
  emotion?: string;
  text: string;
}

export interface PodcastSpeaker {
  label: string;
  voiceId: string;
  provider: AudioProvider;
  model: string;
  language: string;
  speed: number;
  pitch: number;
  volume: number;
}

export interface PodcastTemplate {
  id: string;
  label: string;
  description: string;
  language: string;
}

export interface TtsTemplate extends PodcastTemplate {
  text: string;
  voiceId: string;
}

export interface DialogueTemplate extends PodcastTemplate {
  script: string;
  speakers: Array<{ label: string; voiceId: string; gender: 'male' | 'female' | 'neutral' }>;
}

const STORAGE_KEY = 'skyverses_AI-PODCAST-VOICE_workspace_v2';
const DEFAULT_MODEL = 'gemini-2.5-flash-preview-tts';
const GOMMO_MODEL = 'gommo-voice-design';

export const MODEL_OPTIONS: Record<AudioProvider, Array<{ id: string; label: string; tag?: string }>> = {
  gemini: [
    { id: DEFAULT_MODEL, label: 'Gemini 2.5 Flash TTS', tag: 'Fast' },
    { id: 'gemini-2.5-pro-preview-tts', label: 'Gemini 2.5 Pro TTS', tag: 'Quality' },
  ],
  gommo: [
    { id: GOMMO_MODEL, label: 'Gommo Voice Design', tag: 'Fallback' },
  ],
};

export const LANGUAGE_OPTIONS = [
  { code: 'vi', label: 'Vietnamese' },
  { code: 'en', label: 'English' },
  { code: 'ko', label: 'Korean' },
  { code: 'ja', label: 'Japanese' },
];

export const TTS_TEMPLATES: TtsTemplate[] = [
  {
    id: 'vi-greeting',
    label: 'Tiếng Việt - Lời chào',
    description: 'Intro ngắn để test giọng host tiếng Việt',
    language: 'vi',
    voiceId: 'Aoede',
    text:
      'Xin chào và chào mừng bạn đến với AI Podcast Voice. Đây là bản demo tổng hợp giọng nói tự nhiên cho podcast, video và bài giảng. Bạn có thể nhập văn bản, chọn giọng đọc, rồi tạo audio chỉ trong vài giây.',
  },
  {
    id: 'vi-news',
    label: 'Tiếng Việt - Bản tin',
    description: 'Phong cách biên tập viên truyền hình',
    language: 'vi',
    voiceId: 'Sulafat',
    text:
      'Kính chào quý vị. Bản tin hôm nay cập nhật các xu hướng AI nổi bật trong ngành sáng tạo nội dung. Nhiều doanh nghiệp đang chuyển từ sản xuất thủ công sang workflow tự động để rút ngắn thời gian ra mắt chiến dịch.',
  },
  {
    id: 'en-narrator',
    label: 'English - Narrator',
    description: 'Documentary narration sample',
    language: 'en',
    voiceId: 'Rasalgethi',
    text:
      'Deep beneath the surface of modern media, a new production layer is emerging. Voice, script, music, and editing are becoming programmable, helping creators move from idea to finished episode faster than ever.',
  },
];

export const DIALOGUE_TEMPLATES: DialogueTemplate[] = [
  {
    id: 'interview-vi',
    label: 'Tiếng Việt - Phỏng vấn',
    description: 'Đối thoại hai người, phù hợp native multi-speaker',
    language: 'vi',
    speakers: [
      { label: 'MC', voiceId: 'Sulafat', gender: 'female' },
      { label: 'Khách', voiceId: 'Orus', gender: 'male' },
    ],
    script:
      'MC: Xin chào và chào mừng anh đến với chương trình hôm nay. Anh có thể chia sẻ một chút về dự án mới không?\n' +
      'Khách: Cảm ơn chị. Dự án này dùng AI để biến kịch bản thành podcast có nhiều giọng nói tự nhiên.\n' +
      'MC: Điều gì khiến công nghệ này hữu ích cho creator và doanh nghiệp?\n' +
      'Khách: Nó giảm rất nhiều thời gian thu âm, biên tập và thử nghiệm nội dung.',
  },
  {
    id: 'casual-en',
    label: 'English - Casual chat',
    description: 'Friendly back-and-forth between two speakers',
    language: 'en',
    speakers: [
      { label: 'Host', voiceId: 'Kore', gender: 'female' },
      { label: 'Guest', voiceId: 'Charon', gender: 'male' },
    ],
    script:
      'Host: Welcome back to the show. What caught your attention this week?\n' +
      'Guest: Honestly, the speed of AI audio tools. The workflow feels completely different now.\n' +
      'Host: Faster production usually changes the kind of stories people can tell.\n' +
      'Guest: Exactly. Smaller teams can finally sound like a real studio.',
  },
  {
    id: 'three-speaker',
    label: 'English - 3 speakers',
    description: 'Per-turn fallback demo for more than two speakers',
    language: 'en',
    speakers: [
      { label: 'Alice', voiceId: 'Kore', gender: 'female' },
      { label: 'Bob', voiceId: 'Puck', gender: 'male' },
      { label: 'Carol', voiceId: 'Aoede', gender: 'female' },
    ],
    script:
      'Alice: Did both of you review the campaign script?\n' +
      'Bob: I did. The hook is strong, but the middle section needs more contrast.\n' +
      'Carol: I agree. Let us add a customer story before the final call to action.\n' +
      'Alice: Perfect. That gives the episode a much clearer arc.',
  },
];

const FALLBACK_VOICES: AudioVoiceDTO[] = [
  {
    _id: 'fallback-gemini-aoede',
    provider: 'gemini',
    providerVoiceId: 'Aoede',
    name: 'Aoede',
    description: 'Expressive female voice, strong for Vietnamese scripts',
    gender: 'female',
    language: 'vi',
    shared: true,
    status: 'ready',
    tags: ['vietnamese', 'expressive'],
    isCloned: false,
    isFavorite: false,
    createdAt: new Date(0).toISOString(),
    updatedAt: new Date(0).toISOString(),
  },
  {
    _id: 'fallback-gemini-orus',
    provider: 'gemini',
    providerVoiceId: 'Orus',
    name: 'Orus',
    description: 'Natural male voice for Vietnamese guest roles',
    gender: 'male',
    language: 'vi',
    shared: true,
    status: 'ready',
    tags: ['vietnamese', 'guest'],
    isCloned: false,
    isFavorite: false,
    createdAt: new Date(0).toISOString(),
    updatedAt: new Date(0).toISOString(),
  },
  {
    _id: 'fallback-gemini-kore',
    provider: 'gemini',
    providerVoiceId: 'Kore',
    name: 'Kore',
    description: 'Warm balanced host voice',
    gender: 'female',
    language: 'en',
    shared: true,
    status: 'ready',
    tags: ['host'],
    isCloned: false,
    isFavorite: false,
    createdAt: new Date(0).toISOString(),
    updatedAt: new Date(0).toISOString(),
  },
  {
    _id: 'fallback-gommo-vi-host',
    provider: 'gommo',
    providerVoiceId: 'gommo-vi-female-host',
    name: 'VI female host',
    description: 'Vietnamese female podcast host, natural and confident',
    gender: 'female',
    language: 'vi',
    shared: true,
    status: 'ready',
    tags: ['vietnamese', 'host'],
    isCloned: false,
    isFavorite: false,
    createdAt: new Date(0).toISOString(),
    updatedAt: new Date(0).toISOString(),
  },
];

const initialSpeakers: PodcastSpeaker[] = [
  {
    label: 'MC',
    voiceId: 'Sulafat',
    provider: 'gemini',
    model: DEFAULT_MODEL,
    language: 'vi',
    speed: 1,
    pitch: 0,
    volume: 1,
  },
  {
    label: 'Khách',
    voiceId: 'Orus',
    provider: 'gemini',
    model: DEFAULT_MODEL,
    language: 'vi',
    speed: 1,
    pitch: 0,
    volume: 1,
  },
];

const NON_SPEAKER_LABELS = new Set([
  'ví dụ',
  'ví dụ như',
  'lưu ý',
  'ghi chú',
  'tóm lại',
  'nói cách khác',
  'kết luận',
  'example',
  'note',
  'warning',
  'summary',
]);

const NARRATION_TRAILING_WORDS = new Set(['bảo', 'nói', 'hỏi', 'đáp', 'rằng', 'nhé']);

function splitSpeakerLabel(raw: string): { speaker: string; emotion?: string } {
  const cleaned = raw.replace(/\s+/g, ' ').trim();
  const match = cleaned.match(/^(.+?)\s*\(([^()]+)\)\s*$/);
  if (!match) return { speaker: cleaned };
  return { speaker: match[1].trim(), emotion: match[2].trim() };
}

function isNonSpeakerLabel(name: string): boolean {
  const normalized = name.toLowerCase().replace(/\s+/g, ' ').trim();
  const words = normalized.split(/\s+/).filter(Boolean);
  const last = words[words.length - 1];
  if (NON_SPEAKER_LABELS.has(normalized)) return true;
  return words.length > 1 && NARRATION_TRAILING_WORDS.has(last);
}

export function parseDialogueLines(input: string): DialogueTurn[] {
  return input
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line): DialogueTurn | null => {
      const match = line.match(/^([^:]{1,60}):\s*(.*)$/);
      if (!match) return null;
      const { speaker, emotion: labelEmotion } = splitSpeakerLabel(match[1]);
      let body = match[2].trim();
      let emotion = labelEmotion;
      const bodyEmotion = body.match(/^\(([^()]+)\)\s*(.*)$/);
      if (!emotion && bodyEmotion) {
        emotion = bodyEmotion[1].trim();
        body = bodyEmotion[2].trim();
      }
      return { speaker, emotion, text: body };
    })
    .filter((turn): turn is DialogueTurn => Boolean(turn?.speaker));
}

export function detectPodcastDialogue(input: string): DialogueTurn[] {
  const normalized = input
    .replace(/\[([^\]]+)\]\((?:https?:\/\/|mailto:)?[^)]+\)/g, '$1')
    .replace(/\$\\rightarrow\$/g, '->')
    .replace(/\s+/g, ' ')
    .trim();
  if (!normalized) return [];

  const marker = /(^|[\n\r]+|[.!?…]+\s*)([A-ZÀ-ỴĐ][\p{L}\p{M}0-9.'’_-]*(?:\s+[A-ZÀ-ỴĐa-zà-ỹđ][\p{L}\p{M}0-9.'’_-]*){0,3}(?:\s*\([^():]{1,50}\))?)\s*:/gu;
  const candidates: Array<{ labelStart: number; contentStart: number; rawLabel: string; bareName: string }> = [];
  let match: RegExpExecArray | null;

  while ((match = marker.exec(normalized))) {
    const prefix = match[1] || '';
    const rawLabel = match[2].replace(/\s+/g, ' ').trim();
    const { speaker } = splitSpeakerLabel(rawLabel);
    candidates.push({
      labelStart: match.index + prefix.length,
      contentStart: marker.lastIndex,
      rawLabel,
      bareName: speaker,
    });
  }

  if (candidates.length === 0) return [];
  const cast = new Set<string>();
  for (const candidate of candidates) {
    const words = candidate.bareName.split(/\s+/).filter(Boolean);
    const shortEnough = words.length <= 3 && candidate.bareName.length <= 24;
    if (shortEnough && !isNonSpeakerLabel(candidate.bareName)) {
      cast.add(candidate.bareName.toLowerCase());
    }
  }

  const turns = candidates.filter((candidate) => cast.has(candidate.bareName.toLowerCase()));
  return turns
    .map((item, index) => {
      const next = turns[index + 1];
      const rawBody = normalized.slice(item.contentStart, next ? next.labelStart : normalized.length).trim();
      const { speaker, emotion } = splitSpeakerLabel(item.rawLabel);
      return { speaker, emotion, text: rawBody.replace(/\s+/g, ' ').trim() };
    })
    .filter((turn) => turn.speaker && turn.text);
}

export function formatDialogueTurns(turns: DialogueTurn[]): string {
  return turns
    .map((turn) => `${turn.speaker}: ${turn.emotion ? `(${turn.emotion}) ` : ''}${turn.text}`.trim())
    .join('\n');
}

function uniqueSpeakers(turns: DialogueTurn[]): string[] {
  return Array.from(new Set(turns.map((turn) => turn.speaker).filter(Boolean)));
}

function normalizeVietnameseText(text: string): string {
  return text
    .replace(/\b(\d+)\s*%/g, '$1 phần trăm')
    .replace(/&/g, ' và ')
    .replace(/\bvs\.?\b/gi, 'với')
    .replace(/\s{2,}/g, ' ');
}

function estimateCredits(text: string, exportTranscript = false): number {
  const base = Math.max(5, Math.ceil(Array.from(text).length / 15));
  return exportTranscript ? Math.ceil(base * 1.15) : base;
}

function safeError(err: unknown): string {
  return err instanceof Error ? err.message : 'Không xử lý được yêu cầu';
}

export const usePodcastVoice = () => {
  const { isAuthenticated, login, credits, refreshUserInfo } = useAuth();
  const { showToast } = useToast();
  const [mode, setMode] = useState<PodcastWorkspaceMode>('dialogue');
  const [taskName, setTaskName] = useState('AI Podcast Voice');
  const [ttsText, setTtsText] = useState(TTS_TEMPLATES[0].text);
  const [dialogueText, setDialogueText] = useState(DIALOGUE_TEMPLATES[0].script);
  const [ttsProvider, setTtsProvider] = useState<AudioProvider>('gemini');
  const [ttsVoiceId, setTtsVoiceId] = useState('Aoede');
  const [ttsModel, setTtsModel] = useState(DEFAULT_MODEL);
  const [ttsLanguage, setTtsLanguage] = useState('vi');
  const [stability, setStability] = useState(1);
  const [exportTranscript, setExportTranscript] = useState(true);
  const [speakers, setSpeakers] = useState<PodcastSpeaker[]>(initialSpeakers);
  const [pauseMs, setPauseMs] = useState(300);
  const [voices, setVoices] = useState<AudioVoiceDTO[]>(FALLBACK_VOICES);
  const [voicesLoading, setVoicesLoading] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [lastGeneration, setLastGeneration] = useState<AudioGenerationDTO | null>(null);
  const [historyKey, setHistoryKey] = useState(0);
  const [lastSavedAt, setLastSavedAt] = useState<number | null>(null);
  const isLoadingRef = useRef(true);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const data = JSON.parse(raw) as Partial<{
          mode: PodcastWorkspaceMode;
          taskName: string;
          ttsText: string;
          dialogueText: string;
          ttsProvider: AudioProvider;
          ttsVoiceId: string;
          ttsModel: string;
          ttsLanguage: string;
          stability: number;
          exportTranscript: boolean;
          speakers: PodcastSpeaker[];
          pauseMs: number;
        }>;
        if (data.mode) setMode(data.mode);
        if (data.taskName) setTaskName(data.taskName);
        if (data.ttsText) setTtsText(data.ttsText);
        if (data.dialogueText) setDialogueText(data.dialogueText);
        if (data.ttsProvider) setTtsProvider(data.ttsProvider);
        if (data.ttsVoiceId) setTtsVoiceId(data.ttsVoiceId);
        if (data.ttsModel) setTtsModel(data.ttsModel);
        if (data.ttsLanguage) setTtsLanguage(data.ttsLanguage);
        if (typeof data.stability === 'number') setStability(data.stability);
        if (typeof data.exportTranscript === 'boolean') setExportTranscript(data.exportTranscript);
        if (Array.isArray(data.speakers) && data.speakers.length > 0) setSpeakers(data.speakers);
        if (typeof data.pauseMs === 'number') setPauseMs(data.pauseMs);
      }
    } catch {
      localStorage.removeItem(STORAGE_KEY);
    }

    const kit = loadGlobalBrandKit();
    if (kit?.brandName) {
      setTaskName((current) => current === 'AI Podcast Voice' ? `${kit.brandName} Podcast` : current);
    }
    isLoadingRef.current = false;

    return subscribeBrandKit((newKit) => {
      if (newKit?.brandName) {
        setTaskName((current) => current === 'AI Podcast Voice' ? `${newKit.brandName} Podcast` : current);
      }
    });
  }, []);

  useEffect(() => {
    let cancelled = false;
    setVoicesLoading(true);
    podcastVoiceApi
      .getVoices()
      .then((items) => {
        if (!cancelled && items.length > 0) setVoices(items);
      })
      .catch(() => {
        if (!cancelled) setVoices(FALLBACK_VOICES);
      })
      .finally(() => {
        if (!cancelled) setVoicesLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (isLoadingRef.current) return;
    const id = window.setTimeout(() => {
      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({
          mode,
          taskName,
          ttsText,
          dialogueText,
          ttsProvider,
          ttsVoiceId,
          ttsModel,
          ttsLanguage,
          stability,
          exportTranscript,
          speakers,
          pauseMs,
        })
      );
      setLastSavedAt(Date.now());
    }, 500);
    return () => window.clearTimeout(id);
  }, [
    mode,
    taskName,
    ttsText,
    dialogueText,
    ttsProvider,
    ttsVoiceId,
    ttsModel,
    ttsLanguage,
    stability,
    exportTranscript,
    speakers,
    pauseMs,
  ]);

  const dialogueTurns = useMemo(() => parseDialogueLines(dialogueText), [dialogueText]);
  const detectedSpeakers = useMemo(() => uniqueSpeakers(dialogueTurns), [dialogueTurns]);
  const ttsCredits = useMemo(() => estimateCredits(ttsText, exportTranscript), [ttsText, exportTranscript]);
  const dialogueCredits = useMemo(() => estimateCredits(dialogueText, false), [dialogueText]);
  const activeCredits = mode === 'tts' ? ttsCredits : dialogueCredits;
  const activeCharCount = mode === 'tts' ? Array.from(ttsText).length : Array.from(dialogueText).length;

  const voiceById = useMemo(() => {
    return new Map(voices.map((voice) => [voice.providerVoiceId, voice]));
  }, [voices]);

  const filteredVoices = useCallback(
    (provider: AudioProvider, language?: string) => {
      const providerVoices = voices.filter((voice) => voice.provider === provider);
      const languageVoices = language
        ? providerVoices.filter((voice) => voice.language === language || voice.language === 'en')
        : providerVoices;
      return languageVoices.length > 0 ? languageVoices : providerVoices;
    },
    [voices]
  );

  const requireAuth = useCallback(() => {
    if (isAuthenticated) return true;
    login();
    return false;
  }, [isAuthenticated, login]);

  const loadTtsTemplate = useCallback((id: string) => {
    const template = TTS_TEMPLATES.find((item) => item.id === id);
    if (!template) return;
    setMode('tts');
    setTtsText(template.text);
    setTtsLanguage(template.language);
    setTtsVoiceId(template.voiceId);
    setTtsProvider('gemini');
    setTtsModel(DEFAULT_MODEL);
    showToast(`Đã tải template: ${template.label}`, 'success');
  }, [showToast]);

  const loadDialogueTemplate = useCallback((id: string) => {
    const template = DIALOGUE_TEMPLATES.find((item) => item.id === id);
    if (!template) return;
    setMode('dialogue');
    setDialogueText(template.script);
    setSpeakers(
      template.speakers.map((speaker) => ({
        label: speaker.label,
        voiceId: speaker.voiceId,
        provider: 'gemini',
        model: DEFAULT_MODEL,
        language: template.language,
        speed: 1,
        pitch: 0,
        volume: 1,
      }))
    );
    showToast(`Đã tải template: ${template.label}`, 'success');
  }, [showToast]);

  const autoDetectDialogue = useCallback(() => {
    const turns = detectPodcastDialogue(dialogueText);
    if (turns.length === 0) {
      showToast('Không tìm thấy marker hội thoại. Dùng định dạng MC: ...', 'error');
      return;
    }

    const labels = uniqueSpeakers(turns);
    setDialogueText(formatDialogueTurns(turns));
    setSpeakers((current) =>
      labels.map((label, index) => {
        const existing =
          current.find((speaker) => speaker.label.toLowerCase() === label.toLowerCase()) ||
          current[index];
        const fallbackVoice = index % 2 === 0 ? 'Sulafat' : 'Orus';
        return {
          label,
          voiceId: existing?.voiceId || fallbackVoice,
          provider: existing?.provider || 'gemini',
          model: existing?.model || DEFAULT_MODEL,
          language: existing?.language || 'vi',
          speed: existing?.speed ?? 1,
          pitch: existing?.pitch ?? 0,
          volume: existing?.volume ?? 1,
        };
      })
    );
    showToast(`Đã detect ${turns.length} lượt thoại`, 'success');
  }, [dialogueText, showToast]);

  const normalizeCurrentText = useCallback(() => {
    if (mode === 'tts') setTtsText((text) => normalizeVietnameseText(text));
    else setDialogueText((text) => normalizeVietnameseText(text));
    showToast('Đã chuẩn hóa chữ số và viết tắt tiếng Việt', 'success');
  }, [mode, showToast]);

  const splitTtsBySentence = useCallback(() => {
    const segments = ttsText
      .split(/([.!?…]+\s)/g)
      .reduce<string[]>((acc, cur, index, arr) => {
        if (index % 2 === 0) acc.push((cur + (arr[index + 1] || '')).trim());
        return acc;
      }, [])
      .filter(Boolean);
    setTtsText(segments.join('\n'));
    showToast(`Đã tách ${segments.length} câu`, 'success');
  }, [ttsText, showToast]);

  const splitTtsByLine = useCallback(() => {
    const lines = ttsText.split(/\r?\n/).map((line) => line.trim()).filter(Boolean);
    setTtsText(lines.join('\n'));
    showToast(`Đã làm sạch ${lines.length} dòng`, 'success');
  }, [ttsText, showToast]);

  const updateSpeaker = useCallback((index: number, patch: Partial<PodcastSpeaker>) => {
    setSpeakers((current) => current.map((speaker, i) => {
      if (i !== index) return speaker;
      const next = { ...speaker, ...patch };
      if (patch.provider && patch.provider !== speaker.provider) {
        next.model = MODEL_OPTIONS[patch.provider][0].id;
        const nextVoice = FALLBACK_VOICES.find((voice) => voice.provider === patch.provider);
        if (nextVoice) next.voiceId = nextVoice.providerVoiceId;
      }
      return next;
    }));
  }, []);

  const addSpeaker = useCallback(() => {
    setSpeakers((current) => [
      ...current,
      {
        label: `Speaker ${current.length + 1}`,
        voiceId: current.length % 2 === 0 ? 'Sulafat' : 'Orus',
        provider: 'gemini',
        model: DEFAULT_MODEL,
        language: 'vi',
        speed: 1,
        pitch: 0,
        volume: 1,
      },
    ]);
  }, []);

  const removeSpeaker = useCallback((index: number) => {
    setSpeakers((current) => current.length <= 1 ? current : current.filter((_, i) => i !== index));
  }, []);

  const enhanceDialogue = useCallback(async (idea: string) => {
    if (!idea.trim()) {
      showToast('Nhập outline trước khi tạo kịch bản', 'error');
      return;
    }
    setIsGenerating(true);
    try {
      const prompt =
        'Bạn là biên kịch podcast tiếng Việt. Viết kịch bản hội thoại tự nhiên theo format "MC: ...\\nKhách: ...". ' +
        'Mỗi lượt thoại dưới 70 từ, có nhịp mở đầu, trao đổi, kết luận và CTA ngắn. ' +
        `Tên tập: ${taskName}. Outline: ${idea}`;
      const raw = await aiTextViaProxy(prompt);
      const detected = detectPodcastDialogue(raw);
      const finalScript = detected.length > 0 ? formatDialogueTurns(detected) : raw.trim();
      setMode('dialogue');
      setDialogueText(finalScript);
      if (detected.length > 0) {
        const labels = uniqueSpeakers(detected);
        setSpeakers(labels.map((label, index) => ({
          label,
          voiceId: index % 2 === 0 ? 'Sulafat' : 'Orus',
          provider: 'gemini',
          model: DEFAULT_MODEL,
          language: 'vi',
          speed: 1,
          pitch: 0,
          volume: 1,
        })));
      }
      showToast('Đã tạo kịch bản podcast', 'success');
    } catch (err) {
      showToast(safeError(err), 'error');
    } finally {
      setIsGenerating(false);
    }
  }, [showToast, taskName]);

  const generateTTS = useCallback(async () => {
    if (!ttsText.trim()) {
      showToast('Nhập nội dung TTS trước', 'error');
      return;
    }
    if (!requireAuth()) return;
    if (credits < ttsCredits) {
      showToast(`Cần ${ttsCredits} CR, hiện có ${credits} CR`, 'error');
      return;
    }
    setIsGenerating(true);
    try {
      const result = await podcastVoiceApi.generateTTS({
        text: ttsText,
        voiceId: ttsVoiceId,
        provider: ttsProvider,
        model: ttsModel,
        language: ttsLanguage,
        stability,
        exportTranscript,
        taskName,
      });
      setLastGeneration(result.generation);
      setHistoryKey((key) => key + 1);
      await refreshUserInfo();
      showToast('Audio TTS đã sẵn sàng', 'success');
    } catch (err) {
      showToast(safeError(err), 'error');
    } finally {
      setIsGenerating(false);
    }
  }, [
    credits,
    exportTranscript,
    refreshUserInfo,
    requireAuth,
    showToast,
    stability,
    taskName,
    ttsCredits,
    ttsLanguage,
    ttsModel,
    ttsProvider,
    ttsText,
    ttsVoiceId,
  ]);

  const generateDialogue = useCallback(async () => {
    if (!dialogueText.trim()) {
      showToast('Nhập hội thoại trước', 'error');
      return;
    }
    if (!requireAuth()) return;
    if (credits < dialogueCredits) {
      showToast(`Cần ${dialogueCredits} CR, hiện có ${credits} CR`, 'error');
      return;
    }
    setIsGenerating(true);
    try {
      const payloadSpeakers: DialogueSpeakerPayload[] = speakers.map((speaker) => ({
        label: speaker.label,
        voiceId: speaker.voiceId,
        provider: speaker.provider,
        model: speaker.model,
        language: speaker.language,
        speed: speaker.speed,
        pitch: speaker.pitch,
        volume: speaker.volume,
      }));
      const result = await podcastVoiceApi.generateDialogue({
        text: dialogueText,
        speakers: payloadSpeakers,
        pauseBetweenMs: pauseMs,
        taskName,
      });
      setLastGeneration(result.generation);
      setHistoryKey((key) => key + 1);
      await refreshUserInfo();
      showToast(
        result.mode === 'native-multispeaker'
          ? 'Đã tạo dialogue bằng native multi-speaker'
          : 'Đã tạo dialogue bằng per-turn concat',
        'success'
      );
    } catch (err) {
      showToast(safeError(err), 'error');
    } finally {
      setIsGenerating(false);
    }
  }, [
    credits,
    dialogueCredits,
    dialogueText,
    pauseMs,
    refreshUserInfo,
    requireAuth,
    showToast,
    speakers,
    taskName,
  ]);

  const generateActive = mode === 'tts' ? generateTTS : generateDialogue;

  return {
    mode,
    setMode,
    taskName,
    setTaskName,
    ttsText,
    setTtsText,
    dialogueText,
    setDialogueText,
    ttsProvider,
    setTtsProvider,
    ttsVoiceId,
    setTtsVoiceId,
    ttsModel,
    setTtsModel,
    ttsLanguage,
    setTtsLanguage,
    stability,
    setStability,
    exportTranscript,
    setExportTranscript,
    speakers,
    setSpeakers,
    updateSpeaker,
    addSpeaker,
    removeSpeaker,
    pauseMs,
    setPauseMs,
    voices,
    voicesLoading,
    voiceById,
    filteredVoices,
    dialogueTurns,
    detectedSpeakers,
    ttsCredits,
    dialogueCredits,
    activeCredits,
    activeCharCount,
    credits,
    isGenerating,
    lastGeneration,
    setLastGeneration,
    historyKey,
    lastSavedAt,
    loadTtsTemplate,
    loadDialogueTemplate,
    autoDetectDialogue,
    normalizeCurrentText,
    splitTtsBySentence,
    splitTtsByLine,
    enhanceDialogue,
    generateTTS,
    generateDialogue,
    generateActive,
    MODEL_OPTIONS,
    LANGUAGE_OPTIONS,
    TTS_TEMPLATES,
    DIALOGUE_TEMPLATES,
  };
};
