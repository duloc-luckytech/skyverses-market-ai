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
  };
}

export interface ImageJobResponse {
  success: boolean;
  data: {
    status: "pending" | "processing" | "done" | "failed";
    jobId: string;
    result?: {
      images: string[];
      thumbnail: string;
      imageId: string;
    };
  };
  message?: string;
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
        headers: getHeaders(),
        body: JSON.stringify(payload),
      });
      return await response.json();
    } catch (error) {
      console.error('Image Job Creation Error:', error);
      return { success: false, data: { status: 'failed', jobId: '' }, message: 'Network connection failed' };
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
        headers: getHeaders(),
      });
      return await response.json();
    } catch (error) {
      console.error('Image Job Status Error:', error);
      return { success: false, data: { status: 'failed', jobId }, message: 'Status check failed' };
    }
  }
};