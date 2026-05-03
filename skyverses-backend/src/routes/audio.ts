import axios from "axios";
import express, { Request, Response } from "express";
import qs from "qs";
import AudioGeneration, {
  AudioGenerationKind,
  IAudioGeneration,
} from "../models/AudioGeneration.model";
import AudioVoice, {
  AudioVoiceGender,
  AudioVoiceProvider,
  IAudioVoice,
} from "../models/AudioVoice.model";
import CreditTransaction from "../models/CreditTransaction.model";
import ProviderToken from "../models/ProviderToken.model";
import User from "../models/UserModel";
import {
  AUDIO_OUTPUT_DIR,
  mimeFromAudioUrl,
  readGeneratedAudio,
  saveAudioBuffer,
  saveTextBuffer,
} from "../services/audioStorage";
import { buildWavHeader, concatWavs } from "../utils/audioWav";
import { authenticate } from "./auth";

const router = express.Router();
const GEMINI_BASE = "https://generativelanguage.googleapis.com/v1beta";
const DEFAULT_GEMINI_MODEL = "gemini-2.5-flash-preview-tts";

router.use("/generated", express.static(AUDIO_OUTPUT_DIR));

type AuthUser = {
  userId: string;
  email?: string;
  role?: string;
  name?: string;
};

type AuthedRequest<TBody = unknown, TParams = Record<string, string>> = Request<
  TParams,
  unknown,
  TBody
> & {
  user?: AuthUser;
};

type ProviderName = "gemini" | "gommo";

interface VoiceSeed {
  provider: AudioVoiceProvider;
  providerVoiceId: string;
  name: string;
  description: string;
  gender: AudioVoiceGender;
  language: string;
  tags: string[];
}

interface TTSBody {
  text?: string;
  voiceId?: string;
  provider?: ProviderName;
  model?: string;
  language?: string;
  stability?: number;
  exportTranscript?: boolean;
  taskName?: string;
  scene?: string;
  sampleContext?: string;
  audioProfile?: string;
  directorStyle?: string;
  directorPace?: string;
  directorAccent?: string;
}

interface DialogueSpeaker {
  label: string;
  voiceId: string;
  provider?: ProviderName;
  model?: string;
  language?: string;
  speed?: number;
  pitch?: number;
  volume?: number;
}

interface DialogueBody {
  text?: string;
  speakers?: DialogueSpeaker[];
  pauseBetweenMs?: number;
  taskName?: string;
}

interface ConcatBody {
  segments?: Array<{ audioUrl?: string; pauseMs?: number }>;
  taskName?: string;
}

interface AudioPart {
  audioBuffer: Buffer;
  mimeType: string;
  providerUsed: ProviderName;
  meta?: Record<string, unknown>;
}

interface GeminiPart {
  text?: string;
  inlineData?: {
    mimeType: string;
    data: string;
  };
}

interface GeminiResponse {
  candidates?: Array<{ content?: { parts?: GeminiPart[] } }>;
  error?: { code: number; message: string; status: string };
}

interface GommoPreview {
  url?: string;
  audio_url?: string;
  audioUrl?: string;
  audio_base_64?: string;
  audioBase64?: string;
  base64?: string;
  mimeType?: string;
  duration?: number;
}

interface GommoAudioResponse {
  previews?: GommoPreview[];
  data?: {
    previews?: GommoPreview[];
  };
}

interface ParsedTurn {
  label: string;
  text: string;
}

const SYSTEM_VOICES: VoiceSeed[] = [
  {
    provider: "gemini",
    providerVoiceId: "Kore",
    name: "Kore",
    description: "Warm, balanced host voice for narration and podcasts",
    gender: "female",
    language: "en",
    tags: ["host", "balanced", "gemini"],
  },
  {
    provider: "gemini",
    providerVoiceId: "Puck",
    name: "Puck",
    description: "Bright, upbeat male voice for casual dialogue",
    gender: "male",
    language: "en",
    tags: ["dialogue", "upbeat", "gemini"],
  },
  {
    provider: "gemini",
    providerVoiceId: "Charon",
    name: "Charon",
    description: "Deep, authoritative male voice for interviews",
    gender: "male",
    language: "en",
    tags: ["expert", "deep", "gemini"],
  },
  {
    provider: "gemini",
    providerVoiceId: "Aoede",
    name: "Aoede",
    description: "Expressive female voice, strong for Vietnamese scripts",
    gender: "female",
    language: "vi",
    tags: ["vietnamese", "expressive", "gemini"],
  },
  {
    provider: "gemini",
    providerVoiceId: "Orus",
    name: "Orus",
    description: "Natural male voice for Vietnamese guest roles",
    gender: "male",
    language: "vi",
    tags: ["vietnamese", "guest", "gemini"],
  },
  {
    provider: "gemini",
    providerVoiceId: "Sulafat",
    name: "Sulafat",
    description: "Clear editor-style female voice for news and explainers",
    gender: "female",
    language: "vi",
    tags: ["vietnamese", "news", "gemini"],
  },
  {
    provider: "gemini",
    providerVoiceId: "Rasalgethi",
    name: "Rasalgethi",
    description: "Documentary narrator tone",
    gender: "neutral",
    language: "en",
    tags: ["narrator", "documentary", "gemini"],
  },
  {
    provider: "gommo",
    providerVoiceId: "gommo-vi-female-host",
    name: "VI female host",
    description: "Vietnamese female podcast host, natural and confident",
    gender: "female",
    language: "vi",
    tags: ["vietnamese", "host", "gommo"],
  },
  {
    provider: "gommo",
    providerVoiceId: "gommo-vi-male-host",
    name: "VI male host",
    description: "Vietnamese male host, warm northern accent, studio quality",
    gender: "male",
    language: "vi",
    tags: ["vietnamese", "host", "gommo"],
  },
  {
    provider: "gommo",
    providerVoiceId: "gommo-vi-news",
    name: "VI news editor",
    description: "Vietnamese news presenter, clear diction, professional pace",
    gender: "neutral",
    language: "vi",
    tags: ["vietnamese", "news", "gommo"],
  },
  {
    provider: "gommo",
    providerVoiceId: "gommo-en-narrator",
    name: "EN narrator",
    description: "English documentary narrator, calm and cinematic",
    gender: "neutral",
    language: "en",
    tags: ["english", "narrator", "gommo"],
  },
];

function charCount(text: string): number {
  return Array.from(text).length;
}

function calculateAudioCredits(text: string, exportTranscript = false): number {
  const base = Math.max(5, Math.ceil(charCount(text) / 15));
  return exportTranscript ? Math.ceil(base * 1.15) : base;
}

function asErrorMessage(err: unknown): string {
  if (err instanceof Error) return err.message;
  if (typeof err === "string") return err;
  return "UNKNOWN_ERROR";
}

function isProviderName(provider: unknown): provider is ProviderName {
  return provider === "gemini" || provider === "gommo";
}

function textPreview(text: string): string {
  return text.replace(/\s+/g, " ").trim().slice(0, 240);
}

async function ensureSystemVoices(): Promise<void> {
  await Promise.all(
    SYSTEM_VOICES.map((voice) =>
      AudioVoice.updateOne(
        {
          provider: voice.provider,
          providerVoiceId: voice.providerVoiceId,
          ownerId: null,
        },
        {
          $set: {
            ...voice,
            ownerId: null,
            shared: true,
            status: "ready",
            isCloned: false,
            isFavorite: false,
          },
        },
        { upsert: true }
      )
    )
  );
}

async function findVoice(providerVoiceId?: string): Promise<VoiceSeed | IAudioVoice | null> {
  if (!providerVoiceId) return null;
  const staticVoice = SYSTEM_VOICES.find((voice) => voice.providerVoiceId === providerVoiceId);
  if (staticVoice) return staticVoice;
  return AudioVoice.findOne({ providerVoiceId, status: "ready" }).lean<IAudioVoice>();
}

function voicePrompt(voice: VoiceSeed | IAudioVoice | null, language?: string): string {
  if (!voice) {
    return `${language || "auto"} natural studio podcast voice`;
  }
  return [
    voice.gender,
    voice.language || language || "auto",
    voice.name,
    voice.description,
    Array.isArray(voice.tags) ? voice.tags.join(", ") : "",
  ]
    .filter(Boolean)
    .join(", ");
}

async function reserveCredits(
  userId: string,
  amount: number,
  generationId: string,
  note: string
): Promise<number> {
  const user = await User.findOneAndUpdate(
    { _id: userId, creditBalance: { $gte: amount } },
    { $inc: { creditBalance: -amount } },
    { new: true }
  );

  if (!user) {
    const found = await User.findById(userId).select("creditBalance").lean();
    const balance = found?.creditBalance ?? 0;
    const err = new Error("INSUFFICIENT_CREDITS");
    err.name = `INSUFFICIENT_CREDITS:${balance}:${amount}`;
    throw err;
  }

  await CreditTransaction.create({
    userId,
    type: "CONSUME",
    amount: -amount,
    balanceAfter: user.creditBalance,
    source: "audio",
    note,
    meta: { generationId },
  });

  return user.creditBalance;
}

async function refundCredits(
  userId: string,
  amount: number,
  generationId: string,
  note: string
): Promise<void> {
  const user = await User.findByIdAndUpdate(
    userId,
    { $inc: { creditBalance: amount } },
    { new: true }
  );
  await CreditTransaction.create({
    userId,
    type: "REFUND",
    amount,
    balanceAfter: user?.creditBalance ?? amount,
    source: "audio",
    note,
    meta: { generationId },
  });
}

async function getGeminiApiKey(userId?: string): Promise<string> {
  if (process.env.GEMINI_API_KEY) return process.env.GEMINI_API_KEY;
  if (process.env.GOOGLE_API_KEY) return process.env.GOOGLE_API_KEY;
  if (!userId) return "";
  const user = await User.findById(userId).select("geminiApiKey").lean();
  return user?.geminiApiKey || "";
}

export async function getRandomGommoToken(): Promise<{ accessToken: string }> {
  const now = new Date();
  const token = await ProviderToken.aggregate([
    {
      $match: {
        provider: "gommo",
        isActive: true,
        accessToken: { $exists: true, $ne: "" },
        $or: [
          { cooldownUntil: { $exists: false } },
          { cooldownUntil: { $lte: now } },
        ],
      },
    },
    { $sample: { size: 1 } },
  ]);

  if (token.length && token[0]?.accessToken) {
    return { accessToken: token[0].accessToken };
  }

  if (process.env.GOMMO_API_KEY) {
    return { accessToken: process.env.GOMMO_API_KEY };
  }

  throw new Error("NO_ACTIVE_GOMMO_TOKEN");
}

function pcmToWav(pcm: Buffer, sampleRate = 24000): Buffer {
  return Buffer.concat([buildWavHeader(pcm.length, sampleRate), pcm]);
}

function extractAudioPart(resp: GeminiResponse): { buffer: Buffer; mimeType: string } {
  if (resp.error) {
    throw new Error(`Gemini error: ${resp.error.message}`);
  }

  const parts = resp.candidates?.[0]?.content?.parts || [];
  const audioPart = parts.find((part) => part.inlineData?.mimeType?.startsWith("audio"));
  if (!audioPart?.inlineData?.data) {
    throw new Error("GEMINI_RESPONSE_MISSING_AUDIO");
  }

  const raw = Buffer.from(audioPart.inlineData.data, "base64");
  const mime = audioPart.inlineData.mimeType;

  if (mime.startsWith("audio/L16") || mime === "audio/pcm") {
    const rateMatch = mime.match(/rate=(\d+)/);
    const sampleRate = rateMatch ? Number(rateMatch[1]) : 24000;
    return { buffer: pcmToWav(raw, sampleRate), mimeType: "audio/wav" };
  }

  return { buffer: raw, mimeType: mime };
}

function buildDirectedPrompt(body: TTSBody): string {
  const directives = [
    body.scene?.trim() ? `Scene: ${body.scene.trim()}` : null,
    body.sampleContext?.trim() ? `Sample context: ${body.sampleContext.trim()}` : null,
    body.audioProfile?.trim() ? `Audio profile: ${body.audioProfile.trim()}` : null,
    body.directorStyle?.trim() ? `Style: ${body.directorStyle.trim()}` : null,
    body.directorPace?.trim() ? `Pace: ${body.directorPace.trim()}` : null,
    body.directorAccent?.trim() ? `Accent: ${body.directorAccent.trim()}` : null,
    "Read aloud only the script exactly as written. Auto-detect the script language.",
  ].filter(Boolean);

  return `${directives.join("\n")}\n\nScript:\n${body.text || ""}`;
}

async function geminiTTS(body: TTSBody, apiKey: string): Promise<AudioPart> {
  const model = body.model || DEFAULT_GEMINI_MODEL;
  const url = `${GEMINI_BASE}/models/${model}:generateContent`;
  const requestBody = {
    contents: [{ parts: [{ text: buildDirectedPrompt(body) }] }],
    generationConfig: {
      responseModalities: ["AUDIO"],
      speechConfig: {
        voiceConfig: {
          prebuiltVoiceConfig: { voiceName: body.voiceId || "Kore" },
        },
      },
      ...(typeof body.stability === "number"
        ? { temperature: Math.max(0, Math.min(2, 1.2 - body.stability)) }
        : {}),
    },
  };

  const resp = await axios.post<GeminiResponse>(url, requestBody, {
    headers: {
      "x-goog-api-key": apiKey,
      "Content-Type": "application/json",
    },
    timeout: 120_000,
  });

  const audio = extractAudioPart(resp.data);
  return {
    audioBuffer: audio.buffer,
    mimeType: audio.mimeType,
    providerUsed: "gemini",
    meta: { provider: "gemini", model, voice: body.voiceId },
  };
}

async function geminiDialogue(
  script: string,
  speakers: Array<{ label: string; voiceId: string }>,
  model: string | undefined,
  apiKey: string
): Promise<AudioPart> {
  if (speakers.length === 0) throw new Error("MISSING_SPEAKERS");
  if (speakers.length > 2) throw new Error("GEMINI_NATIVE_MAX_2_SPEAKERS");

  const finalModel = model || DEFAULT_GEMINI_MODEL;
  const url = `${GEMINI_BASE}/models/${finalModel}:generateContent`;
  const names = speakers.map((speaker) => speaker.label).join(" and ");
  const requestBody = {
    contents: [{ parts: [{ text: `TTS the following conversation between ${names}:\n\n${script}` }] }],
    generationConfig: {
      responseModalities: ["AUDIO"],
      speechConfig: {
        multiSpeakerVoiceConfig: {
          speakerVoiceConfigs: speakers.map((speaker) => ({
            speaker: speaker.label,
            voiceConfig: {
              prebuiltVoiceConfig: { voiceName: speaker.voiceId },
            },
          })),
        },
      },
    },
  };

  const resp = await axios.post<GeminiResponse>(url, requestBody, {
    headers: {
      "x-goog-api-key": apiKey,
      "Content-Type": "application/json",
    },
    timeout: 180_000,
  });

  const audio = extractAudioPart(resp.data);
  return {
    audioBuffer: audio.buffer,
    mimeType: audio.mimeType,
    providerUsed: "gemini",
    meta: { provider: "gemini", model: finalModel, multiSpeaker: true },
  };
}

async function downloadAudioUrl(url: string): Promise<{ buffer: Buffer; mimeType: string }> {
  const generated = readGeneratedAudio(url);
  if (generated) return generated;

  if (url.startsWith("data:")) {
    const match = url.match(/^data:([^;]+);base64,(.*)$/);
    if (!match) throw new Error("INVALID_DATA_AUDIO_URL");
    return { buffer: Buffer.from(match[2], "base64"), mimeType: match[1] };
  }

  if (!/^https?:\/\//i.test(url)) {
    throw new Error("UNSUPPORTED_AUDIO_URL");
  }

  const response = await axios.get<ArrayBuffer>(url, {
    responseType: "arraybuffer",
    timeout: 120_000,
  });
  const mimeType =
    typeof response.headers["content-type"] === "string"
      ? response.headers["content-type"]
      : mimeFromAudioUrl(url);
  return { buffer: Buffer.from(response.data), mimeType };
}

async function gommoTTS(body: TTSBody, prompt: string): Promise<AudioPart> {
  const providerToken = await getRandomGommoToken();
  const payload = {
    access_token: providerToken.accessToken,
    domain: "aivideoauto.com",
    action_type: "createVoiceDesign",
    project_id: "5a1f50fe10ddbb5d",
    prompt,
    text_preview: body.text || "",
    seed: Math.floor(Math.random() * 1e9),
  };

  const response = await axios.post<GommoAudioResponse>(
    "https://api.gommo.net/ai/audio",
    qs.stringify(payload),
    { headers: { "content-type": "application/x-www-form-urlencoded" }, timeout: 120_000 }
  );

  const previews = response.data?.previews || response.data?.data?.previews || [];
  if (!Array.isArray(previews) || previews.length === 0) {
    throw new Error("GOMMO_RESPONSE_MISSING_AUDIO");
  }

  const first = previews[0];
  const base64 = first.audio_base_64 || first.audioBase64 || first.base64;
  if (base64) {
    const clean = base64.includes(",") ? base64.split(",").pop() || "" : base64;
    return {
      audioBuffer: Buffer.from(clean, "base64"),
      mimeType: first.mimeType || "audio/mpeg",
      providerUsed: "gommo",
      meta: { provider: "gommo", preview: { duration: first.duration } },
    };
  }

  const audioUrl = first.url || first.audio_url || first.audioUrl;
  if (!audioUrl) throw new Error("GOMMO_RESPONSE_MISSING_AUDIO_URL");
  const audio = await downloadAudioUrl(audioUrl);
  return {
    audioBuffer: audio.buffer,
    mimeType: audio.mimeType,
    providerUsed: "gommo",
    meta: { provider: "gommo", sourceUrl: audioUrl, duration: first.duration },
  };
}

async function synthesizeText(
  body: TTSBody,
  userId: string | undefined,
  fallbackPrompt?: string
): Promise<AudioPart> {
  const requestedProvider = isProviderName(body.provider) ? body.provider : "gemini";

  if (requestedProvider === "gemini") {
    const key = await getGeminiApiKey(userId);
    if (key) return geminiTTS(body, key);
  }

  const voice = await findVoice(body.voiceId);
  return gommoTTS(body, fallbackPrompt || voicePrompt(voice, body.language));
}

function parseDialogueTurns(text: string): ParsedTurn[] {
  const turns: ParsedTurn[] = [];
  for (const rawLine of text.split(/\r?\n/)) {
    const line = rawLine.trim();
    if (!line) continue;
    const match = line.match(/^([^:]{1,60}):\s*(.*)$/);
    if (match) {
      turns.push({ label: match[1].trim(), text: match[2].trim() });
    } else if (turns.length) {
      turns[turns.length - 1].text = `${turns[turns.length - 1].text} ${line}`.trim();
    }
  }
  return turns.filter((turn) => turn.label && turn.text);
}

function concatAudioParts(parts: AudioPart[], gapMs = 0): AudioPart {
  if (parts.length === 0) throw new Error("NO_AUDIO_PARTS");
  if (parts.length === 1) return parts[0];

  const allWav = parts.every((part) => part.mimeType.includes("wav"));
  if (allWav) {
    return {
      audioBuffer: concatWavs(parts.map((part) => part.audioBuffer), gapMs),
      mimeType: "audio/wav",
      providerUsed: parts[0].providerUsed,
      meta: { concat: "wav", parts: parts.length, gapMs },
    };
  }

  return {
    audioBuffer: Buffer.concat(parts.map((part) => part.audioBuffer)),
    mimeType: parts[0].mimeType,
    providerUsed: parts[0].providerUsed,
    meta: { concat: "byte", parts: parts.length },
  };
}

async function failGeneration(
  generation: IAudioGeneration,
  userId: string,
  credits: number,
  message: string
): Promise<void> {
  if (credits > 0) {
    await refundCredits(userId, credits, String(generation._id), "Audio generation failed");
  }
  await AudioGeneration.findByIdAndUpdate(generation._id, {
    status: "failed",
    errorMessage: message,
    creditsRefunded: credits,
  });
}

router.get("/capabilities", async (_req: Request, res: Response) => {
  res.json({
    success: true,
    providers: [
      {
        id: "gemini",
        label: "Gemini",
        models: [
          { id: DEFAULT_GEMINI_MODEL, label: "Gemini 2.5 Flash TTS", tag: "Fast" },
          { id: "gemini-2.5-pro-preview-tts", label: "Gemini 2.5 Pro TTS", tag: "Quality" },
        ],
        nativeMultiSpeaker: true,
        maxNativeSpeakers: 2,
      },
      {
        id: "gommo",
        label: "Gommo",
        models: [{ id: "gommo-voice-design", label: "Gommo Voice Design", tag: "Fallback" }],
        nativeMultiSpeaker: false,
        maxNativeSpeakers: 1,
      },
    ],
    maxCharacters: 50000,
  });
});

router.get("/voices", async (req: Request, res: Response) => {
  try {
    await ensureSystemVoices();
    const provider = typeof req.query.provider === "string" ? req.query.provider : "";
    const language = typeof req.query.language === "string" ? req.query.language : "";
    const q = typeof req.query.q === "string" ? req.query.q.trim() : "";

    const query: Record<string, unknown> = { shared: true, status: "ready" };
    if (isProviderName(provider)) query.provider = provider;
    if (language) query.language = language;
    if (q) {
      query.$or = [
        { name: { $regex: q, $options: "i" } },
        { description: { $regex: q, $options: "i" } },
        { tags: { $regex: q, $options: "i" } },
      ];
    }

    const voices = await AudioVoice.find(query)
      .sort({ provider: 1, language: -1, name: 1 })
      .lean();

    res.json({ success: true, voices });
  } catch (err) {
    res.status(500).json({ success: false, message: asErrorMessage(err) });
  }
});

router.get(
  "/history",
  authenticate,
  async (req: AuthedRequest, res: Response) => {
    try {
      const userId = req.user?.userId;
      if (!userId) return res.status(401).json({ success: false, message: "UNAUTHORIZED" });

      const kind = typeof req.query.kind === "string" ? req.query.kind : "";
      const limit = Math.min(Number(req.query.limit || 50), 100);
      const filter: Record<string, unknown> = { userId };
      if (["tts", "dialogue", "podcast"].includes(kind)) filter.kind = kind;

      const items = await AudioGeneration.find(filter)
        .sort({ createdAt: -1 })
        .limit(limit)
        .lean();

      res.json({ success: true, items });
    } catch (err) {
      res.status(500).json({ success: false, message: asErrorMessage(err) });
    }
  }
);

router.delete(
  "/history/:id",
  authenticate,
  async (req: AuthedRequest, res: Response) => {
    try {
      const userId = req.user?.userId;
      if (!userId) return res.status(401).json({ success: false, message: "UNAUTHORIZED" });
      await AudioGeneration.deleteOne({ _id: req.params.id, userId });
      res.json({ success: true });
    } catch (err) {
      res.status(500).json({ success: false, message: asErrorMessage(err) });
    }
  }
);

router.post(
  "/tts/generate",
  authenticate,
  async (req: AuthedRequest<TTSBody>, res: Response) => {
    const userId = req.user?.userId;
    if (!userId) return res.status(401).json({ success: false, message: "UNAUTHORIZED" });

    const body = req.body || {};
    const text = typeof body.text === "string" ? body.text.trim() : "";
    if (!text) return res.status(400).json({ success: false, message: "MISSING_TEXT" });
    if (charCount(text) > 50000) {
      return res.status(400).json({ success: false, message: "TEXT_TOO_LONG" });
    }

    const provider = isProviderName(body.provider) ? body.provider : "gemini";
    const voice = await findVoice(body.voiceId);
    const cost = calculateAudioCredits(text, body.exportTranscript === true);
    const generation = await AudioGeneration.create({
      userId,
      kind: "tts",
      taskName: body.taskName,
      textPreview: textPreview(text),
      inputText: text,
      provider,
      voiceId: body.voiceId,
      voiceName: voice?.name,
      language: body.language,
      model: body.model,
      charCount: charCount(text),
      creditsUsed: 0,
      creditsRefunded: 0,
      status: "pending",
      meta: {
        exportTranscript: body.exportTranscript === true,
        scene: body.scene,
        sampleContext: body.sampleContext,
        audioProfile: body.audioProfile,
      },
    });

    let reservedCredits = 0;
    try {
      await reserveCredits(userId, cost, String(generation._id), "AI Podcast Voice TTS");
      reservedCredits = cost;
      const start = Date.now();
      const audio = await synthesizeText({ ...body, text, provider }, userId);
      const saved = saveAudioBuffer(audio.audioBuffer, audio.mimeType, "tts");
      const transcript = body.exportTranscript ? saveTextBuffer(text, "tts-transcript") : null;
      const updated = await AudioGeneration.findByIdAndUpdate(
        generation._id,
        {
          status: "completed",
          outputUrl: saved.publicUrl,
          transcriptUrl: transcript?.publicUrl,
          provider: audio.providerUsed,
          creditsUsed: cost,
          durationMs: Date.now() - start,
          meta: { ...generation.meta, ...audio.meta, requestedProvider: provider },
        },
        { new: true }
      );

      return res.json({ success: true, generation: updated, providerUsed: audio.providerUsed });
    } catch (err) {
      const message = asErrorMessage(err);
      await failGeneration(generation, userId, reservedCredits, message);
      const status = message.startsWith("INSUFFICIENT_CREDITS") ? 400 : 500;
      return res.status(status).json({ success: false, message });
    }
  }
);

router.post(
  "/dialogue/generate",
  authenticate,
  async (req: AuthedRequest<DialogueBody>, res: Response) => {
    const userId = req.user?.userId;
    if (!userId) return res.status(401).json({ success: false, message: "UNAUTHORIZED" });

    const body = req.body || {};
    const text = typeof body.text === "string" ? body.text.trim() : "";
    const speakers = Array.isArray(body.speakers) ? body.speakers : [];
    if (!text) return res.status(400).json({ success: false, message: "MISSING_TEXT" });
    if (charCount(text) > 50000) {
      return res.status(400).json({ success: false, message: "TEXT_TOO_LONG" });
    }
    if (speakers.length === 0) {
      return res.status(400).json({ success: false, message: "MISSING_SPEAKERS" });
    }

    const turns = parseDialogueTurns(text);
    if (turns.length === 0) {
      return res.status(400).json({ success: false, message: "NO_DIALOGUE_TURNS" });
    }

    const primaryProvider = isProviderName(speakers[0]?.provider) ? speakers[0].provider : "gemini";
    const cost = calculateAudioCredits(text, false);
    const generation = await AudioGeneration.create({
      userId,
      kind: "dialogue",
      taskName: body.taskName,
      textPreview: textPreview(text),
      inputText: text,
      provider: primaryProvider,
      charCount: charCount(text),
      creditsUsed: 0,
      creditsRefunded: 0,
      status: "pending",
      meta: {
        speakers,
        turns: turns.length,
        pauseBetweenMs: body.pauseBetweenMs ?? 300,
      },
    });

    let reservedCredits = 0;
    try {
      await reserveCredits(userId, cost, String(generation._id), "AI Podcast Voice dialogue");
      reservedCredits = cost;
      const start = Date.now();
      const labels = Array.from(new Set(turns.map((turn) => turn.label)));
      const pauseBetweenMs = Math.max(0, Math.min(3000, Number(body.pauseBetweenMs ?? 300)));
      const allGemini = speakers.every((speaker) => (speaker.provider || "gemini") === "gemini");
      const geminiKey = allGemini ? await getGeminiApiKey(userId) : "";
      let audio: AudioPart;
      let mode: "native-multispeaker" | "per-turn" = "per-turn";

      if (geminiKey && allGemini && labels.length <= 2) {
        const speakerConfigs = labels.map((label, index) => {
          const speaker = speakers.find((item) => item.label === label) || speakers[index] || speakers[0];
          return { label, voiceId: speaker.voiceId || "Kore" };
        });
        audio = await geminiDialogue(text, speakerConfigs, speakers[0]?.model, geminiKey);
        mode = "native-multispeaker";
      } else {
        const parts: AudioPart[] = [];
        for (const turn of turns) {
          const speaker = speakers.find((item) => item.label === turn.label) || speakers[0];
          const voice = await findVoice(speaker.voiceId);
          parts.push(
            await synthesizeText(
              {
                text: turn.text,
                voiceId: speaker.voiceId,
                provider: isProviderName(speaker.provider) ? speaker.provider : "gemini",
                model: speaker.model,
                language: speaker.language,
              },
              userId,
              voicePrompt(voice, speaker.language)
            )
          );
        }
        audio = concatAudioParts(parts, pauseBetweenMs);
      }

      const saved = saveAudioBuffer(audio.audioBuffer, audio.mimeType, "dialogue");
      const updated = await AudioGeneration.findByIdAndUpdate(
        generation._id,
        {
          status: "completed",
          outputUrl: saved.publicUrl,
          provider: audio.providerUsed,
          creditsUsed: cost,
          durationMs: Date.now() - start,
          meta: {
            ...generation.meta,
            ...audio.meta,
            mode,
            distinctSpeakers: labels.length,
          },
        },
        { new: true }
      );

      return res.json({
        success: true,
        generation: updated,
        turns: turns.length,
        mode,
        distinctSpeakers: labels.length,
      });
    } catch (err) {
      const message = asErrorMessage(err);
      await failGeneration(generation, userId, reservedCredits, message);
      const status = message.startsWith("INSUFFICIENT_CREDITS") ? 400 : 500;
      return res.status(status).json({ success: false, message });
    }
  }
);

router.post(
  "/podcast/concat",
  authenticate,
  async (req: AuthedRequest<ConcatBody>, res: Response) => {
    const userId = req.user?.userId;
    if (!userId) return res.status(401).json({ success: false, message: "UNAUTHORIZED" });

    const segments = Array.isArray(req.body?.segments) ? req.body.segments : [];
    const urls = segments
      .map((segment) => segment.audioUrl)
      .filter((url): url is string => typeof url === "string" && url.length > 0);
    if (urls.length === 0) {
      return res.status(400).json({ success: false, message: "MISSING_AUDIO_SEGMENTS" });
    }

    const generation = await AudioGeneration.create({
      userId,
      kind: "podcast" satisfies AudioGenerationKind,
      taskName: req.body?.taskName,
      textPreview: `${urls.length} audio segments`,
      provider: "internal",
      charCount: 0,
      creditsUsed: 0,
      creditsRefunded: 0,
      status: "pending",
      meta: { segments: urls.length },
    });

    const cost = 5;
    let reservedCredits = 0;
    try {
      await reserveCredits(userId, cost, String(generation._id), "AI Podcast Voice export");
      reservedCredits = cost;
      const parts = await Promise.all(
        urls.map(async (url) => {
          const audio = await downloadAudioUrl(url);
          return {
            audioBuffer: audio.buffer,
            mimeType: audio.mimeType,
            providerUsed: "gommo" as ProviderName,
          };
        })
      );
      const merged = concatAudioParts(parts, Number(segments[0]?.pauseMs ?? 300));
      const saved = saveAudioBuffer(merged.audioBuffer, merged.mimeType, "podcast");
      const updated = await AudioGeneration.findByIdAndUpdate(
        generation._id,
        {
          status: "completed",
          outputUrl: saved.publicUrl,
          creditsUsed: cost,
          provider: "internal",
        },
        { new: true }
      );
      return res.json({ success: true, generation: updated });
    } catch (err) {
      const message = asErrorMessage(err);
      await failGeneration(generation, userId, reservedCredits, message);
      const status = message.startsWith("INSUFFICIENT_CREDITS") ? 400 : 500;
      return res.status(status).json({ success: false, message });
    }
  }
);

/* =====================================================
   POST /audio
   Backward-compatible Gommo Voice Design endpoint
===================================================== */
router.post("/", async (req: Request, res: Response) => {
  try {
    const { prompt, text, seed } = req.body as { prompt?: string; text?: string; seed?: number };

    if (!prompt || !text) {
      return res.status(400).json({
        success: false,
        message: "MISSING_PROMPT_OR_TEXT",
      });
    }

    const providerToken = await getRandomGommoToken();
    const payload = {
      access_token: providerToken.accessToken,
      domain: "aivideoauto.com",
      action_type: "createVoiceDesign",
      project_id: "5a1f50fe10ddbb5d",
      prompt,
      text_preview: text,
      seed: seed || Math.floor(Math.random() * 1e9),
    };

    const response = await axios.post<GommoAudioResponse>(
      "https://api.gommo.net/ai/audio",
      qs.stringify(payload),
      {
        headers: {
          "content-type": "application/x-www-form-urlencoded",
        },
      }
    );

    const previews = response.data?.previews || response.data?.data?.previews || [];

    return res.json({
      success: true,
      data: previews,
    });
  } catch (err) {
    console.error("[GOMMO_AUDIO_ERROR]", asErrorMessage(err));

    return res.status(500).json({
      success: false,
      message: "GOMMO_AUDIO_FAILED",
    });
  }
});

export default router;
