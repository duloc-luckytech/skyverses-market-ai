import { API_BASE_URL, getHeaders } from './config';

export type AudioProvider = 'gemini' | 'gommo';
export type AudioGenerationKind = 'tts' | 'dialogue' | 'podcast';
export type AudioGenerationStatus = 'pending' | 'completed' | 'failed';

export interface AudioVoiceDTO {
  _id: string;
  ownerId?: string | null;
  provider: AudioProvider;
  providerVoiceId: string;
  name: string;
  description?: string;
  gender: 'male' | 'female' | 'neutral';
  language: string;
  shared: boolean;
  status: 'ready' | 'pending' | 'failed';
  previewUrl?: string;
  sampleUrl?: string;
  tags: string[];
  isCloned: boolean;
  isFavorite: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface AudioGenerationDTO {
  _id: string;
  userId: string;
  kind: AudioGenerationKind;
  taskName?: string;
  textPreview?: string;
  inputText?: string;
  outputUrl?: string;
  transcriptUrl?: string;
  provider: string;
  voiceId?: string;
  voiceName?: string;
  language?: string;
  model?: string;
  charCount: number;
  creditsUsed: number;
  creditsRefunded: number;
  status: AudioGenerationStatus;
  errorMessage?: string;
  durationMs?: number;
  meta?: Record<string, unknown>;
  createdAt: string;
  updatedAt: string;
}

export interface AudioModelOption {
  id: string;
  label: string;
  tag?: string;
}

export interface AudioProviderCapability {
  id: AudioProvider;
  label: string;
  models: AudioModelOption[];
  nativeMultiSpeaker: boolean;
  maxNativeSpeakers: number;
}

export interface AudioCapabilitiesDTO {
  providers: AudioProviderCapability[];
  maxCharacters: number;
}

export interface TTSGeneratePayload {
  text: string;
  voiceId: string;
  provider: AudioProvider;
  model?: string;
  language?: string;
  stability?: number;
  exportTranscript?: boolean;
  taskName?: string;
}

export interface DialogueSpeakerPayload {
  label: string;
  voiceId: string;
  provider: AudioProvider;
  model?: string;
  language?: string;
  speed?: number;
  pitch?: number;
  volume?: number;
}

export interface DialogueGeneratePayload {
  text: string;
  speakers: DialogueSpeakerPayload[];
  pauseBetweenMs: number;
  taskName?: string;
}

interface ApiEnvelope<T> {
  success?: boolean;
  message?: string;
  data?: T;
}

async function parseJson<T>(response: Response): Promise<T> {
  const payload = (await response.json().catch(() => null)) as (ApiEnvelope<T> & T) | null;
  if (!response.ok || payload?.success === false) {
    throw new Error(payload?.message || response.statusText || 'REQUEST_FAILED');
  }
  return payload as T;
}

async function requestJson<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...init,
    headers: {
      ...getHeaders(),
      ...(init?.headers as Record<string, string> | undefined),
    },
  });
  return parseJson<T>(response);
}

export function podcastVoiceAudioUrl(url?: string): string {
  if (!url) return '';
  if (/^(https?:|blob:|data:)/i.test(url)) return url;
  return `${API_BASE_URL}${url.startsWith('/') ? url : `/${url}`}`;
}

export const podcastVoiceApi = {
  getCapabilities: async (): Promise<AudioCapabilitiesDTO> => {
    const payload = await requestJson<{ capabilities?: AudioCapabilitiesDTO } & AudioCapabilitiesDTO>(
      '/audio/capabilities',
      { method: 'GET' }
    );
    return payload.capabilities || payload;
  },

  getVoices: async (filter?: {
    provider?: AudioProvider;
    language?: string;
    q?: string;
  }): Promise<AudioVoiceDTO[]> => {
    const query = new URLSearchParams();
    if (filter?.provider) query.set('provider', filter.provider);
    if (filter?.language) query.set('language', filter.language);
    if (filter?.q) query.set('q', filter.q);
    const suffix = query.toString() ? `?${query.toString()}` : '';
    const payload = await requestJson<{ voices: AudioVoiceDTO[] }>(`/audio/voices${suffix}`, {
      method: 'GET',
    });
    return payload.voices;
  },

  getHistory: async (
    kind?: AudioGenerationKind,
    limit = 50
  ): Promise<AudioGenerationDTO[]> => {
    const query = new URLSearchParams({ limit: String(limit) });
    if (kind) query.set('kind', kind);
    const payload = await requestJson<{ items: AudioGenerationDTO[] }>(
      `/audio/history?${query.toString()}`,
      { method: 'GET' }
    );
    return payload.items;
  },

  deleteHistory: async (id: string): Promise<void> => {
    await requestJson<{ success: boolean }>(`/audio/history/${id}`, { method: 'DELETE' });
  },

  generateTTS: async (
    payload: TTSGeneratePayload
  ): Promise<{ generation: AudioGenerationDTO; providerUsed?: AudioProvider }> => {
    return requestJson<{ generation: AudioGenerationDTO; providerUsed?: AudioProvider }>(
      '/audio/tts/generate',
      {
        method: 'POST',
        body: JSON.stringify(payload),
      }
    );
  },

  generateDialogue: async (
    payload: DialogueGeneratePayload
  ): Promise<{
    generation: AudioGenerationDTO;
    mode?: 'native-multispeaker' | 'per-turn';
    turns?: number;
    distinctSpeakers?: number;
  }> => {
    return requestJson<{
      generation: AudioGenerationDTO;
      mode?: 'native-multispeaker' | 'per-turn';
      turns?: number;
      distinctSpeakers?: number;
    }>('/audio/dialogue/generate', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },
};
