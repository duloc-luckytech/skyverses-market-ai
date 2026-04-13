
import { API_BASE_URL, getHeaders } from './config';

// ─── Request / Response Types ─────────────────────────────────────────────────

export interface CropCoordinates {
  top: number;
  left: number;
  right: number;
  bottom: number;
}

export interface DrawPayload {
  prompt: string;
  referenceImageUrl: string;
}

export interface CreateEditImageJobRequest {
  mediaId?: string;
  projectId: string;
  editType: 'crop' | 'draw';
  cropCoordinates?: CropCoordinates;
  drawPayload?: DrawPayload;
}

export interface CreateEditImageJobResponse {
  success: boolean;
  data?: {
    jobId: string;
    status: string;
    owner?: string;
  };
  message?: string;
}

export interface EditImageJobStatusResponse {
  success: boolean;
  data?: {
    jobId: string;
    status: 'pending' | 'processing' | 'done' | 'error' | 'cancelled';
    editType: string;
    result?: {
      mediaId?: string;
      resultUrl?: string;
    };
    error?: { message: string };
    progress?: { percent: number; step?: string };
  };
  message?: string;
}

// ─── API ──────────────────────────────────────────────────────────────────────

export const editImageApi = {
  /**
   * Tạo edit-image job (crop, draw, ...)
   * POST /edit-image-jobs
   */
  createJob: async (payload: CreateEditImageJobRequest): Promise<CreateEditImageJobResponse> => {
    try {
      const response = await fetch(`${API_BASE_URL}/edit-image-jobs`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify(payload),
      });
      return await response.json();
    } catch (error) {
      console.error('[editImageApi] createJob error:', error);
      return { success: false, message: 'Network connection failed' };
    }
  },

  /**
   * Poll trạng thái edit-image job
   * GET /edit-image-jobs/:id
   */
  getJobStatus: async (jobId: string): Promise<EditImageJobStatusResponse> => {
    try {
      const response = await fetch(`${API_BASE_URL}/edit-image-jobs/${jobId}`, {
        method: 'GET',
        headers: getHeaders(),
      });
      return await response.json();
    } catch (error) {
      console.error('[editImageApi] getJobStatus error:', error);
      return { success: false, message: 'Status check failed' };
    }
  },
};
