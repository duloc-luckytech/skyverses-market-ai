import { API_BASE_URL, getHeaders } from './config';

// ═══ TYPES ═══

export interface UpscaleTask {
  jobId: string;
  urlImage: string;
  resolution?: string; // '2K' | '4K' | '8K' | '12K'
  provider?: string;   // 'fxflow' | 'topaz' | etc.
}

export interface UpscaleCreateRequest {
  provider: string;
  tasks: UpscaleTask[];
}

export interface UpscaleCreateResponse {
  success: boolean;
  message?: string;
  data?: {
    accepted: number;
    jobs: Array<{ jobId: string; status: string }>;
    creditsUsed?: number;
  };
}

export interface UpscaleJobResult {
  id: string;
  status: 'pending' | 'processing' | 'done' | 'error';
  resultUrl?: string;
  mediaId?: string;
  error?: string;
  // Legacy fields for backward compat
  width?: number;
  height?: number;
  oldWidth?: number;
  oldHeight?: number;
}

export interface UpscaleStatusResponse {
  success: boolean;
  data?: UpscaleJobResult;
  message?: string;
}

// Legacy single-upscale response (kept for backward compat)
export interface UpscaleResponse {
  success: boolean;
  data?: {
    id: string;
    type: string;
    model: string;
    status: string;
    runtime: number;
    creditUsed: number;
    image: {
      url: string;
      preview: string;
      width: number;
      height: number;
      oldWidth: number;
      oldHeight: number;
      aspectRatio: string;
    };
    createdAt: number;
  };
  message?: string;
}

// ═══ API ═══

export const upscaleApi = {
  /**
   * [LEGACY] Upscale a single image synchronously
   * POST /image/upscale
   */
  upscale: async (imageUrl: string): Promise<UpscaleResponse> => {
    try {
      const response = await fetch(`${API_BASE_URL}/image/upscale`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify({ imageUrl }),
      });
      return await response.json();
    } catch (error) {
      console.error('Upscale API Error:', error);
      return { success: false, message: 'Network connection failed' };
    }
  },

  /**
   * Create batch upscale jobs
   * POST /image/upscale-batch
   */
  createBatch: async (tasks: UpscaleTask[], provider: string = 'fxflow'): Promise<UpscaleCreateResponse> => {
    try {
      const response = await fetch(`${API_BASE_URL}/image/upscale-batch`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify({ provider, tasks }),
      });
      return await response.json();
    } catch (error) {
      console.error('Upscale Batch API Error:', error);
      return { success: false, message: 'Network connection failed' };
    }
  },

  /**
   * Get upscale job status
   * GET /image/upscale-status/:jobId
   */
  getJobStatus: async (jobId: string): Promise<UpscaleStatusResponse> => {
    try {
      const response = await fetch(`${API_BASE_URL}/image/upscale-status/${jobId}`, {
        method: 'GET',
        headers: getHeaders(),
      });
      return await response.json();
    } catch (error) {
      console.error('Upscale Status API Error:', error);
      return { success: false, message: 'Network connection failed' };
    }
  },

  /**
   * Upscale from an existing image generation job
   * POST /image/upscale-from-job
   */
  upscaleFromJob: async (imageJobId: string, resolution: string = '4K'): Promise<UpscaleCreateResponse> => {
    try {
      const response = await fetch(`${API_BASE_URL}/image/upscale-from-job`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify({ imageJobId, resolution }),
      });
      return await response.json();
    } catch (error) {
      console.error('Upscale From Job API Error:', error);
      return { success: false, message: 'Network connection failed' };
    }
  },
};