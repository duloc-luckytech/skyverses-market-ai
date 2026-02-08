import { GoogleGenAI, Modality } from "@google/genai";
import { systemConfigApi } from "../apis/config";

// --- KEY MANAGEMENT LOGIC ---
let cachedGeminiKeys: string[] = [];
let lastFetchTime = 0;
const CACHE_DURATION = 1000 * 60 * 5; // 5 minutes

const getActiveApiKey = async (): Promise<string> => {
  const now = Date.now();
  
  // Refresh cache if empty or expired
  if (cachedGeminiKeys.length === 0 || (now - lastFetchTime) > CACHE_DURATION) {
    try {
      const res = await systemConfigApi.getSystemConfig();
      if (res?.success && res.data?.listKeyGommoGenmini) {
        const activeKeys = res.data.listKeyGommoGenmini
          .filter(k => k.isActive && k.key)
          .map(k => k.key);
        
        if (activeKeys.length > 0) {
          cachedGeminiKeys = activeKeys;
          lastFetchTime = now;
        }
      }
    } catch (err) {
      console.error("[GEMINI_SERVICE] Failed to sync dynamic keys, falling back to env.", err);
    }
  }

  // Pick random key from pool or fallback to process.env.API_KEY
  if (cachedGeminiKeys.length > 0) {
    const randomIndex = Math.floor(Math.random() * cachedGeminiKeys.length);
    return cachedGeminiKeys[randomIndex];
  }
  
  return process.env.API_KEY || '';
};

// Base64 helper for raw audio data
const decodeBase64 = (base64: string) => {
  const binaryString = atob(base64);
  const bytes = new Uint8Array(binaryString.length);
  for (let i = 0; i < binaryString.length; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes;
};

// PCM decoding for raw 24kHz audio
const decodeAudioData = async (
  data: Uint8Array,
  ctx: AudioContext,
  sampleRate: number = 24000,
  numChannels: number = 1,
): Promise<AudioBuffer> => {
  const dataInt16 = new Int16Array(data.buffer);
  const frameCount = dataInt16.length / numChannels;
  const buffer = ctx.createBuffer(numChannels, frameCount, sampleRate);

  for (let channel = 0; channel < numChannels; channel++) {
    const channelData = buffer.getChannelData(channel);
    for (let i = 0; i < frameCount; i++) {
      channelData[i] = dataInt16[i * numChannels + channel] / 32768.0;
    }
  }
  return buffer;
};

let sharedDecodeCtx: AudioContext | null = null;
const getDecodeCtx = () => {
  if (!sharedDecodeCtx) {
    const AudioContextClass = (window as any).AudioContext || (window as any).webkitAudioContext;
    if (!AudioContextClass) throw new Error("Web Audio API not supported.");
    sharedDecodeCtx = new AudioContextClass();
  }
  return sharedDecodeCtx!;
};

export const generateDemoAudio = async (prompt: string, voiceName: string = 'Kore'): Promise<AudioBuffer | null> => {
  const apiKey = await getActiveApiKey();
  const ai = new GoogleGenAI({ apiKey });
  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash-preview-tts",
      contents: [{ parts: [{ text: prompt }] }],
      config: {
        responseModalities: [Modality.AUDIO],
        speechConfig: {
          voiceConfig: {
            prebuiltVoiceConfig: { voiceName: voiceName },
          },
        },
      },
    });

    const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
    if (base64Audio) {
      const bytes = decodeBase64(base64Audio);
      return await decodeAudioData(bytes, getDecodeCtx());
    }
    return null;
  } catch (error) {
    console.error("Audio Synthesis Error:", error);
    return null;
  }
};

export const generateMultiSpeakerAudio = async (
  dialoguePrompt: string, 
  speakerA: { name: string, voice: string }, 
  speakerB: { name: string, voice: string }
): Promise<AudioBuffer | null> => {
  const apiKey = await getActiveApiKey();
  const ai = new GoogleGenAI({ apiKey });
  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash-preview-tts",
      contents: [{ parts: [{ text: dialoguePrompt }] }],
      config: {
        responseModalities: [Modality.AUDIO],
        speechConfig: {
          multiSpeakerVoiceConfig: {
            speakerVoiceConfigs: [
              {
                speaker: speakerA.name,
                voiceConfig: { prebuiltVoiceConfig: { voiceName: speakerA.voice } }
              },
              {
                speaker: speakerB.name,
                voiceConfig: { prebuiltVoiceConfig: { voiceName: speakerB.voice } }
              }
            ]
          }
        },
      },
    });

    const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
    if (base64Audio) {
      const bytes = decodeBase64(base64Audio);
      return await decodeAudioData(bytes, getDecodeCtx());
    }
    return null;
  } catch (error) {
    console.error("Multi-Speaker Synthesis Error:", error);
    return null;
  }
};

export const generateDemoText = async (prompt: string): Promise<string> => {
  const apiKey = await getActiveApiKey();
  const ai = new GoogleGenAI({ apiKey });
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
      config: {
        systemInstruction: "You are an AI Architectural Strategist. Provide concise, high-level technical responses for enterprise B2B contexts."
      }
    });
    return response.text || "NO_DATA_RETURNED";
  } catch (error: any) {
    console.error("Text Synthesis Error:", error);
    return "CONNECTION_TERMINATED";
  }
};

export interface ImageSynthesisParams {
  prompt: string;
  images?: string[];
  model?: string;
  aspectRatio?: string;
  quality?: string;
  apiKey?: string;
}

const imageUrlToBase64 = async (url: string): Promise<{ data: string, mimeType: string } | null> => {
  try {
    const response = await fetch(url);
    const blob = await response.blob();
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64 = (reader.result as string).split(',')[1];
        resolve({ data: base64, mimeType: blob.type });
      };
      reader.readAsDataURL(blob);
    });
  } catch (e) {
    console.error("Failed to convert URL to base64:", e);
    return null;
  }
};

export const generateDemoImage = async (params: ImageSynthesisParams | string, imagesLegacy?: string[], modelLegacy?: string): Promise<string | null> => {
  let promptText: string;
  let inputImages: string[] | undefined;
  let modelNameInput: string;
  let ratio: string = "1:1";
  let res: string = "1K";
  let userApiKey: string | undefined;

  if (typeof params === 'string') {
    promptText = params;
    inputImages = imagesLegacy;
    modelNameInput = modelLegacy || 'gemini-2.5-flash-image';
  } else {
    promptText = params.prompt;
    inputImages = params.images;
    modelNameInput = params.model || 'gemini-2.5-flash-image';
    ratio = params.aspectRatio || "1:1";
    res = (params.quality || "1K").toUpperCase();
    userApiKey = params.apiKey;
  }

  let modelId = 'gemini-2.5-flash-image';
  if (
    modelNameInput.includes('Banana Pro') || 
    modelNameInput.includes('google_image_gen_banana_pro') || 
    modelNameInput.includes('Gemini 3 Pro Image') || 
    modelNameInput === 'gemini-3-pro-image-preview'
  ) {
    modelId = 'gemini-3-pro-image-preview';
  } else if (modelNameInput === 'google_image_gen_4_5') {
    modelId = 'gemini-2.5-flash-image';
  }

  const apiKey = userApiKey || await getActiveApiKey();
  const ai = new GoogleGenAI({ apiKey });
  try {
    const parts: any[] = [{ text: promptText }];

    if (inputImages && inputImages.length > 0) {
      await Promise.all(inputImages.map(async (img) => {
        if (!img) return;
        
        if (img.startsWith('data:')) {
          const mimeType = img.substring(img.indexOf(":") + 1, img.indexOf(";"));
          const data = img.substring(img.indexOf(",") + 1);
          parts.push({ inlineData: { data, mimeType } });
        } else if (img.startsWith('http')) {
          const b64 = await imageUrlToBase64(img);
          if (b64) {
            parts.push({ inlineData: { data: b64.data, mimeType: b64.mimeType } });
          }
        }
      }));
    }

    const imageConfig: any = { aspectRatio: ratio };
    if (modelId === 'gemini-3-pro-image-preview') {
      imageConfig.imageSize = res;
    }

    const response = await ai.models.generateContent({
      model: modelId,
      contents: { parts },
      config: { imageConfig },
    });

    const candidate = response.candidates?.[0];
    if (candidate?.content?.parts) {
      for (const part of candidate.content.parts) {
        if (part.inlineData) {
          return `data:image/png;base64,${part.inlineData.data}`;
        }
      }
    }
    return null;
  } catch (error: any) {
    throw error;
  }
};

export interface VideoProductionParams {
  prompt: string;
  references?: string[]; 
  lastFrame?: string;
  resolution?: '720p' | '1080p';
  aspectRatio?: '16:9' | '9:16';
  duration?: string;
  isUltra?: boolean;
  previousVideoUri?: string;
}

export const generateDemoVideo = async (params: VideoProductionParams): Promise<string | null> => {
  const apiKey = await getActiveApiKey();
  const ai = new GoogleGenAI({ apiKey });
  try {
    const modelName = params.isUltra 
      ? 'veo-3.1-generate-preview' 
      : 'veo-3.1-fast-generate-preview';

    const config: any = {
      numberOfVideos: 1,
      resolution: params.resolution || '720p',
      aspectRatio: params.aspectRatio || '16:9'
    };

    const finalPrompt = params.duration 
      ? `[STRICT DURATION: ${params.duration}] ${params.prompt}` 
      : params.prompt;

    const payload: any = {
      model: modelName,
      prompt: finalPrompt,
      config: config
    };

    if (params.previousVideoUri) {
      payload.video = { uri: params.previousVideoUri };
    }

    if (params.references && params.references.length > 0) {
      const base64Data = params.references[0].includes(',') 
        ? params.references[0].split(',')[1] 
        : params.references[0];
      const mimeType = params.references[0].includes(';') 
        ? params.references[0].split(';')[0].split(':')[1] 
        : 'image/png';

      payload.image = {
        imageBytes: base64Data,
        mimeType: mimeType
      };
    }

    if (params.lastFrame) {
      const base64Data = params.lastFrame.includes(',') 
        ? params.lastFrame.split(',')[1] 
        : params.lastFrame;
      const mimeType = params.lastFrame.includes(';') 
        ? params.lastFrame.split(';')[0].split(':')[1] 
        : 'image/png';

      config.lastFrame = {
        imageBytes: base64Data,
        mimeType: mimeType
      };
    }

    let operation = await ai.models.generateVideos(payload);

    while (!operation.done) {
      await new Promise(resolve => setTimeout(resolve, 10000));
      operation = await ai.operations.getVideosOperation({ operation: operation });
    }
    
    const videoData = operation.response?.generatedVideos?.[0]?.video;
    const downloadLink = videoData?.uri;

    if (downloadLink) {
      const response = await fetch(`${downloadLink}&key=${apiKey}`);
      if (!response.ok) throw new Error(`Failed to download video: ${response.statusText}`);
      const blob = await response.blob();
      return URL.createObjectURL(blob);
    }
    
    return null;
  } catch (error: any) {
    console.error("Video Synthesis Error:", error);
    throw error;
  }
};