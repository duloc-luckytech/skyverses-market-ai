
import { API_BASE_URL, getHeaders } from './config';

export interface ImageJobRequest {
  type: "text_to_image" | "image_to_image";
  input: {
    prompt: string;
    image?: string;
    images?: string[];
    mask?: string;
  };
  config: {
    width: number;
    height: number;
    aspectRatio: string;
    seed: number;
    style: string;
  };
  engine: {
    provider: "gommo";
    model: "google_image_gen_4_5" | "google_image_gen_banana_pro";
  };
  enginePayload: {
    prompt: string;
    privacy: "PRIVATE";
    projectId: "default";
    editImage?: boolean;
    base64Image?: string;
    category?: string;
    mode?: string;
  };
}

export interface ImageJobResponse {
  success?: boolean;
  status?: string;
  data: {
    status: "pending" | "processing" | "done" | "failed" | "error";
    jobId: string;
    result?: {
      images: string[];
      thumbnail: string;
      imageId: string;
      width?: number;
      height?: number;
    };
  };
  message?: string;
}

export interface ImageJobHistoryResponse {
  data: any[];
  pagination: {
    page: number;
    limit: number;
    total: number;
  };
}

export const imagesApi = {
  /**
   * Create an image generation job using credits
   * POST /image-jobs
   */
  createJob: async (payload: ImageJobRequest): Promise<ImageJobResponse> => {
    try {
      const response = await fetch(`${API_BASE_URL}/image-jobs`, {
        method: 'POST',
        headers: {
          'accept': '*/*',
          ...getHeaders()
        },
        body: JSON.stringify(payload),
      });
      return await response.json();
    } catch (error) {
      console.error('Image Job Creation Error:', error);
      return { success: false, status: 'error', data: { status: 'failed', jobId: '' }, message: 'Network connection failed' };
    }
  },

  /**
   * Poll job status
   * GET /image-jobs/:id
   */
  getJobStatus: async (jobId: string): Promise<ImageJobResponse> => {
    try {
      const response = await fetch(`${API_BASE_URL}/image-jobs/${jobId}`, {
        method: 'GET',
        headers: {
          'accept': '*/*',
          ...getHeaders()
        },
      });
      return await response.json();
    } catch (error) {
      console.error('Image Job Status Error:', error);
      return { success: false, status: 'error', data: { status: 'failed', jobId }, message: 'Status check failed' };
    }
  },

  /**
   * List image jobs of current user
   * GET /image-jobs
   */
  getJobs: async (params: { status?: string, page?: number, limit?: number }): Promise<ImageJobHistoryResponse> => {
    try {
      const query = new URLSearchParams();
      if (params.status) query.append('status', params.status);
      if (params.page) query.append('page', String(params.page));
      if (params.limit) query.append('limit', String(params.limit));

      const response = await fetch(`${API_BASE_URL}/image-jobs?${query.toString()}`, {
        method: 'GET',
        headers: getHeaders(),
      });
      return await response.json();
    } catch (error) {
      console.error('Fetch Image Jobs Error:', error);
      throw error;
    }
  }
};
