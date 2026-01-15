
import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { uploadToGCS } from '../services/storage';
import { GoogleGenAI } from "@google/genai";

export interface RestorationPreset {
  id: string;
  label: string;
  prompt: string;
  sampleUrl?: string;
}

export const RESTORATION_PRESETS: RestorationPreset[] = [
  {
    id: 'portrait',
    label: 'Phục chế chân dung gia đình',
    prompt: 'Focus on natural skin tones and facial clarity of multiple family members. Repair any cracks or water damage while preserving the warm family atmosphere and authentic background details.',
    sampleUrl: 'https://images.unsplash.com/photo-1531259683007-016a7b628fc3?auto=format&fit=crop&q=80&w=800'
  },
  {
    id: 'wedding',
    label: 'Ảnh cưới cũ',
    prompt: 'Restore this old wedding photo. Restore the intricate details of the white dress and suit textures. If it is black and white, colorize it with soft, romantic, realistic tones suitable for the specific historical era of the photo.',
    sampleUrl: 'https://images.unsplash.com/photo-1515934751635-c81c6bc9a2d8?auto=format&fit=crop&q=80&w=800'
  },
  {
    id: 'memorial',
    label: 'Ảnh liệt sĩ / Ảnh thờ',
    prompt: 'CRITICAL TASK: Restore this memorial portrait with the highest respect for identity. Sharpen facial features with extreme precision. Ensure the final result is formal, clean, and photorealistic. Maintain original proportions and dignity. The result must be suitable for ceremonial display.',
    sampleUrl: 'https://images.unsplash.com/photo-1531123897727-8f129e1688ce?auto=format&fit=crop&q=80&w=800'
  },
  {
    id: 'heavy_blur',
    label: 'Ảnh mờ cực nặng',
    prompt: 'This image has severe motion blur and low resolution. Use advanced neural reconstruction to recover lost edges and details. Reduce heavy noise and digital artifacts without losing the realistic texture of the subject.',
    sampleUrl: 'https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&q=80&w=800'
  },
  {
    id: 'upscale_4k',
    label: 'Phục chế + Upscale 4K',
    prompt: 'Perform a full high-fidelity restoration and enhance this image to 4K crystalline quality. Sharpen all edges, reconstruct micro-textures, and ensure pixel-perfect clarity for large-scale professional printing.',
    sampleUrl: 'https://images.unsplash.com/photo-1620641788421-7a1c342ea42e?auto=format&fit=crop&q=80&w=800'
  }
];

const SYSTEM_INSTRUCTION = `You are a professional photo restoration expert.

RESTORE this old photograph by repairing scratches, cracks, dust, and damaged areas. 
REDUCE noise and blur while enhancing clarity without over-sharpening. 
RESTORE facial details naturally, preserving the original identity, proportions, age, and expression.

COLORIZATION:
If the image is black and white, colorize it with realistic, historically accurate colors and natural skin tones. 
Avoid oversaturation and modern color styles.

STRICT CONSTRAINTS:
Maintain authentic textures, lighting, and atmosphere. 
Do NOT beautify, stylize, or change facial features. 
Avoid artificial, CGI, or cartoon-like appearance.
The goal is a photorealistic, clean, natural, high-quality restoration.`;

export interface RestoreJob {
  id: string;
  original: string;
  result: string | null;
  status: 'Khởi tạo' | 'PROCESSING' | 'DONE' | 'ERROR';
  timestamp: string;
  presetId: string;
}

export const useRestoration = () => {
  const { credits, useCredits, isAuthenticated, login } = useAuth();
  const [jobs, setJobs] = useState<RestoreJob[]>([]);
  const [activeJobId, setActiveJobId] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [selectedPresetId, setSelectedPresetId] = useState(RESTORATION_PRESETS[0].id);

  const handleUpload = async (file: File) => {
    const tempId = Date.now().toString();
    const newJob: RestoreJob = {
      id: tempId,
      original: '',
      result: null,
      status: 'Khởi tạo',
      timestamp: new Date().toLocaleTimeString(),
      presetId: selectedPresetId
    };
    setJobs(prev => [newJob, ...prev]);
    setActiveJobId(tempId);

    try {
      const metadata = await uploadToGCS(file);
      setJobs(prev => prev.map(j => j.id === tempId ? { ...j, original: metadata.url } : j));
    } catch (err) {
      setJobs(prev => prev.map(j => j.id === tempId ? { ...j, status: 'ERROR' } : j));
    }
  };

  const handleApplyTemplate = (url: string) => {
    const tempId = `template-${Date.now()}`;
    const newJob: RestoreJob = {
      id: tempId,
      original: url,
      result: null,
      status: 'Khởi tạo',
      timestamp: new Date().toLocaleTimeString(),
      presetId: selectedPresetId
    };
    setJobs(prev => [newJob, ...prev]);
    setActiveJobId(tempId);
  };

  const deleteJob = (id: string) => {
    setJobs(prev => prev.filter(j => j.id !== id));
    if (activeJobId === id) setActiveJobId(null);
  };

  const runRestoration = async () => {
    const currentJob = jobs.find(j => j.id === activeJobId);
    const RESTORE_COST = 100;

    if (!currentJob || (currentJob.status !== 'Khởi tạo' && currentJob.status !== 'ERROR') || isProcessing) return;
    if (!isAuthenticated) { login(); return; }
    if (credits < RESTORE_COST) { alert("Không đủ hạn ngạch credits."); return; }

    setIsProcessing(true);
    setJobs(prev => prev.map(j => j.id === activeJobId ? { ...j, status: 'PROCESSING' } : j));

    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const selectedPreset = RESTORATION_PRESETS.find(p => p.id === selectedPresetId);
      
      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash-image',
        contents: {
          parts: [
            { text: `${SYSTEM_INSTRUCTION}\n\nSPECIFIC RESTORATION STRATEGY: ${selectedPreset?.prompt}` },
            { 
              inlineData: {
                data: await fetch(currentJob.original).then(r => r.blob()).then(blob => {
                  return new Promise((resolve) => {
                    const reader = new FileReader();
                    reader.onloadend = () => resolve((reader.result as string).split(',')[1]);
                    reader.readAsDataURL(blob);
                  });
                }) as string,
                mimeType: "image/png"
              } 
            }
          ]
        }
      });

      let restoredUrl = null;
      if (response.candidates?.[0]?.content?.parts) {
        for (const part of response.candidates[0].content.parts) {
          if (part.inlineData) {
            restoredUrl = `data:image/png;base64,${part.inlineData.data}`;
            break;
          }
        }
      }

      if (restoredUrl) {
        useCredits(RESTORE_COST);
        setJobs(prev => prev.map(j => j.id === activeJobId ? { 
          ...j, 
          status: 'DONE', 
          result: restoredUrl 
        } : j));
      } else {
        throw new Error("AI failed to provide image data");
      }
    } catch (err) {
      console.error(err);
      setJobs(prev => prev.map(j => j.id === activeJobId ? { ...j, status: 'ERROR' } : j));
    } finally {
      setIsProcessing(false);
    }
  };

  return {
    jobs,
    activeJobId,
    setActiveJobId,
    isProcessing,
    selectedPresetId,
    setSelectedPresetId,
    handleUpload,
    handleApplyTemplate,
    runRestoration,
    deleteJob,
    credits
  };
};
