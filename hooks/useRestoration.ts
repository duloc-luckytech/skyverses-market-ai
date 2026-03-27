
import { useState, useEffect, useRef, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import { uploadToGCS } from '../services/storage';
import { API_BASE_URL, getHeaders } from '../apis/config';

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
  },
  // ─── NEW PRESETS (#4) ───
  {
    id: 'colorize',
    label: 'Đen trắng → Lên màu',
    prompt: 'This is a black and white photograph. Your primary task is to COLORIZE it with historically accurate, realistic colors. Pay meticulous attention to skin tones, fabric colors, foliage, sky, and environmental details. Use natural, warm tones appropriate for the estimated era of the photo. Do not over-saturate. The result must look like an authentic color photograph, not a digital colorization.',
    sampleUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=800'
  },
  {
    id: 'group_photo',
    label: 'Ảnh nhóm / Lớp học',
    prompt: 'This is a group or class photograph with multiple people. Restore every individual face with equal precision — ensure each person is clearly identifiable. Fix alignment issues, repair any torn edges, and restore the natural group composition. Maintain the authentic background and setting. If black and white, colorize naturally.',
    sampleUrl: 'https://images.unsplash.com/photo-1529156069898-49953e39b3ac?auto=format&fit=crop&q=80&w=800'
  },
  {
    id: 'landscape',
    label: 'Ảnh phong cảnh cũ',
    prompt: 'Restore this old landscape or scenery photograph. Focus on recovering natural colors, sky detail, vegetation textures, and architectural elements. Remove yellowing, foxing spots, and age-related discoloration. Enhance depth and atmosphere while maintaining the authentic vintage character of the scene.',
    sampleUrl: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&q=80&w=800'
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
  backendJobId?: string;
  errorMessage?: string;     // #2 Error detail
  progress?: number;         // #5 Progress 0-100
  progressStep?: string;     // #5 Progress step label
}

const POLL_INTERVAL = 3000;
const POLL_MAX_ATTEMPTS = 120;
const DEFAULT_RESTORE_COST = 100;

export const useRestoration = () => {
  const { credits, useCredits, isAuthenticated, login, refreshUserInfo } = useAuth();
  const [jobs, setJobs] = useState<RestoreJob[]>([]);
  const [activeJobId, setActiveJobId] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [selectedPresetId, setSelectedPresetId] = useState(RESTORATION_PRESETS[0].id);
  const [restoreCost, setRestoreCost] = useState(DEFAULT_RESTORE_COST);
  const [toast, setToast] = useState<{ message: string; type: 'error' | 'success' | 'info' } | null>(null);
  
  const [usagePreference, setUsagePreference] = useState<'credits' | 'key'>(() => {
    const saved = localStorage.getItem('skyverses_usage_preference');
    return (saved as any) || 'credits';
  });
  const [hasPersonalKey, setHasPersonalKey] = useState(false);

  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const pollCountRef = useRef(0);

  useEffect(() => {
    const vault = localStorage.getItem('skyverses_model_vault');
    if (vault) {
      try {
        const keys = JSON.parse(vault);
        if (keys.gemini && keys.gemini.trim() !== '') {
          setHasPersonalKey(true);
        }
      } catch (e) {}
    }
  }, []);

  // ─── #6 FETCH PRICING FROM BACKEND ───
  useEffect(() => {
    (async () => {
      try {
        const res = await fetch(`${API_BASE_URL}/pricing?modelKey=google_image_gen_4_5`, {
          headers: getHeaders(),
        });
        const json = await res.json();
        const models = Array.isArray(json) ? json : json?.data;
        if (Array.isArray(models) && models.length > 0) {
          const pricing = models[0]?.pricing;
          if (pricing) {
            const resolutions = Object.keys(pricing);
            if (resolutions.length > 0) {
              const durations = pricing[resolutions[0]];
              const cost = typeof durations === 'number' ? durations : (durations?.['0'] || durations?.['1'] || Object.values(durations || {})[0] || DEFAULT_RESTORE_COST);
              setRestoreCost(cost as number);
            }
          }
        }
      } catch {}
    })();
  }, []);

  useEffect(() => {
    return () => {
      if (pollRef.current) clearInterval(pollRef.current);
    };
  }, []);

  // ─── #2 TOAST AUTO-DISMISS ───
  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => setToast(null), 5000);
      return () => clearTimeout(timer);
    }
  }, [toast]);

  const showToast = (message: string, type: 'error' | 'success' | 'info' = 'error') => {
    setToast({ message, type });
  };

  // ─── POLL JOB STATUS (#5 progress support) ───
  const startPolling = useCallback((localJobId: string, backendJobId: string) => {
    if (pollRef.current) clearInterval(pollRef.current);
    pollCountRef.current = 0;

    pollRef.current = setInterval(async () => {
      pollCountRef.current += 1;

      if (pollCountRef.current > POLL_MAX_ATTEMPTS) {
        if (pollRef.current) clearInterval(pollRef.current);
        setJobs(prev => prev.map(j => j.id === localJobId
          ? { ...j, status: 'ERROR', errorMessage: 'Quá thời gian chờ. Vui lòng thử lại.' }
          : j
        ));
        setIsProcessing(false);
        showToast('⏱️ Quá thời gian chờ xử lý. Credit đã được hoàn trả tự động.', 'error');
        return;
      }

      try {
        const res = await fetch(`${API_BASE_URL}/image-jobs/${backendJobId}`, {
          headers: getHeaders(),
        });
        const json = await res.json();
        const status = json?.data?.status || json?.status;

        if (status === 'done') {
          if (pollRef.current) clearInterval(pollRef.current);

          const resultUrl =
            json?.data?.result?.images?.[0] ||
            json?.data?.result?.thumbnail ||
            null;

          setJobs(prev => prev.map(j =>
            j.id === localJobId
              ? { ...j, status: 'DONE', result: resultUrl, progress: 100, progressStep: 'Hoàn tất' }
              : j
          ));
          setIsProcessing(false);
          showToast('✅ Phục chế hoàn tất! Ảnh đã sẵn sàng tải xuống.', 'success');
          try { refreshUserInfo?.(); } catch {}

        } else if (status === 'error' || status === 'reject' || status === 'cancelled') {
          if (pollRef.current) clearInterval(pollRef.current);
          const errorMsg = json?.data?.error?.message || json?.data?.error || 'Lỗi xử lý phục chế ảnh';
          setJobs(prev => prev.map(j =>
            j.id === localJobId
              ? { ...j, status: 'ERROR', errorMessage: errorMsg, progress: 0 }
              : j
          ));
          setIsProcessing(false);
          showToast(`❌ ${errorMsg}. Credit đã được hoàn trả.`, 'error');
          try { refreshUserInfo?.(); } catch {}

        } else if (status === 'processing' || status === 'polling') {
          // #5 — Simulate progress based on poll count
          const simulatedProgress = Math.min(90, Math.floor((pollCountRef.current / 30) * 90));
          const step = simulatedProgress < 20 ? 'Đang phân tích ảnh...'
            : simulatedProgress < 50 ? 'Đang tái tạo chi tiết...'
            : simulatedProgress < 75 ? 'Đang khử nhiễu & lên màu...'
            : 'Đang hoàn thiện kết xuất...';

          setJobs(prev => prev.map(j =>
            j.id === localJobId
              ? { ...j, status: 'PROCESSING', progress: simulatedProgress, progressStep: step }
              : j
          ));
        }
      } catch (err) {
        console.error('[Restore] Poll error:', err);
      }
    }, POLL_INTERVAL);
  }, [refreshUserInfo]);

  // ─── UPLOAD IMAGE ───
  const handleUpload = async (file: File) => {
    const tempId = Date.now().toString();
    const newJob: RestoreJob = {
      id: tempId,
      original: '',
      result: null,
      status: 'Khởi tạo',
      timestamp: new Date().toLocaleTimeString(),
      presetId: selectedPresetId,
      progress: 0,
    };
    setJobs(prev => [newJob, ...prev]);
    setActiveJobId(tempId);

    try {
      const metadata = await uploadToGCS(file);
      setJobs(prev => prev.map(j => j.id === tempId ? { ...j, original: metadata.url } : j));
      showToast('📷 Ảnh đã tải lên thành công!', 'success');
    } catch (err) {
      setJobs(prev => prev.map(j => j.id === tempId
        ? { ...j, status: 'ERROR', errorMessage: 'Tải ảnh lên thất bại. Vui lòng thử lại.' }
        : j
      ));
      showToast('❌ Tải ảnh lên thất bại. Kiểm tra kết nối mạng.', 'error');
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
      presetId: selectedPresetId,
      progress: 0,
    };
    setJobs(prev => [newJob, ...prev]);
    setActiveJobId(tempId);
  };

  const deleteJob = (id: string) => {
    setJobs(prev => prev.filter(j => j.id !== id));
    if (activeJobId === id) setActiveJobId(null);
  };

  // ─── #3 RETRY (reuse existing job, no extra credit if backend already refunded) ───
  const retryJob = async (jobId: string) => {
    const job = jobs.find(j => j.id === jobId);
    if (!job || job.status !== 'ERROR' || !job.original) return;

    // Reset job status to re-run
    setActiveJobId(jobId);
    setJobs(prev => prev.map(j =>
      j.id === jobId
        ? { ...j, status: 'Khởi tạo', result: null, errorMessage: undefined, progress: 0, backendJobId: undefined }
        : j
    ));
    showToast('🔄 Đang chuẩn bị thử lại...', 'info');
  };

  // ─── RUN RESTORATION (Backend Job) ───
  const runRestoration = async () => {
    const currentJob = jobs.find(j => j.id === activeJobId);
    const RESTORE_COST = restoreCost;

    if (!currentJob || (currentJob.status !== 'Khởi tạo' && currentJob.status !== 'ERROR') || isProcessing) return;
    if (!isAuthenticated) { login(); return; }

    // #2 — Better credit check message
    if (credits < RESTORE_COST) {
      showToast(`💳 Không đủ credits. Cần ${RESTORE_COST} CR, bạn có ${credits} CR.`, 'error');
      return;
    }

    setIsProcessing(true);
    setJobs(prev => prev.map(j => j.id === activeJobId
      ? { ...j, status: 'PROCESSING', progress: 5, progressStep: 'Đang gửi yêu cầu...' }
      : j
    ));

    try {
      const selectedPreset = RESTORATION_PRESETS.find(p => p.id === selectedPresetId);
      const restorationPrompt = `${SYSTEM_INSTRUCTION}\n\nSPECIFIC RESTORATION STRATEGY: ${selectedPreset?.prompt || ''}`;

      const response = await fetch(`${API_BASE_URL}/image-jobs`, {
        method: 'POST',
        headers: {
          'accept': '*/*',
          ...getHeaders()
        },
        body: JSON.stringify({
          type: 'image_to_image',
          input: {
            prompt: restorationPrompt,
            image: currentJob.original,
            images: [currentJob.original],
          },
          config: {
            style: selectedPresetId,
          },
          engine: {
            provider: 'fxflow',
            model: 'google_image_gen_4_5',
          },
          enginePayload: {
            prompt: restorationPrompt,
            privacy: 'PRIVATE',
            projectId: 'default',
          },
        }),
      });

      const json = await response.json();

      if (!response.ok || !json?.data?.jobId) {
        const msg = json?.message || 'Failed to create restoration job';

        // #2 — Specific error messages
        if (msg === 'INSUFFICIENT_CREDITS') {
          showToast(`💳 Không đủ credits. Cần ${json?.required || RESTORE_COST} CR.`, 'error');
        } else if (msg === 'USER_NOT_FOUND') {
          showToast('🔒 Phiên đăng nhập hết hạn. Vui lòng đăng nhập lại.', 'error');
        } else {
          showToast(`❌ ${msg}`, 'error');
        }
        throw new Error(msg);
      }

      const backendJobId = json.data.jobId;

      setJobs(prev => prev.map(j =>
        j.id === activeJobId
          ? { ...j, backendJobId, status: 'PROCESSING', progress: 10, progressStep: 'Đang chờ xử lý...' }
          : j
      ));

      showToast('🚀 Đã gửi yêu cầu phục chế. Đang xử lý...', 'info');
      startPolling(activeJobId!, backendJobId);

    } catch (err: any) {
      console.error('[Restore] Error:', err);
      setJobs(prev => prev.map(j => j.id === activeJobId
        ? { ...j, status: 'ERROR', errorMessage: err.message || 'Lỗi không xác định', progress: 0 }
        : j
      ));
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
    retryJob,
    deleteJob,
    credits,
    restoreCost,      // #6 Dynamic pricing
    usagePreference,
    setUsagePreference,
    hasPersonalKey,
    toast,
    dismissToast: () => setToast(null),
  };
};
