import { API_BASE_URL, getHeaders } from './config';

export interface VideoJobRequest {
  type: "text-to-video" | "image-to-video" | "start-end-image" | "ingredient";
  input: {
    images: (string | null)[];
  };
  config: {
    duration: number;
    aspectRatio: string;
    resolution: string;
  };
  engine: {
    provider: "gommo" | "fxlab";
    model: "veo_3_1";
  };
  enginePayload: {
    accessToken: string;
    prompt: string;
    privacy: "PRIVATE";
    translateToEn: boolean;
    projectId: string;
    mode: "relaxed" | "fast";
  };
}

export interface VideoJobResponse {
  success?: boolean; // Root success flag seen in live responses
  status?: string; // The root status can be "success" or "error"
  data: {
    status: string; // The job status can be "done", "failed", "processing", "pending", "queued"
    jobId: string;
    result?: {
      videoUrl: string;
      thumbnailUrl?: string;
    };
  };
  message?: string;
}

export const videosApi = {
  /**
   * Create a video generation job using credits
   * POST /video-jobs
   */
  createJob: async (payload: VideoJobRequest): Promise<VideoJobResponse> => {
    try {
      const response = await fetch(`${API_BASE_URL}/video-jobs`, {
        method: 'POST',
        headers: {
          'accept': '*/*',
          ...getHeaders()
        },
        body: JSON.stringify(payload),
      });
      return await response.json();
    } catch (error) {
      console.error('Video Job Creation Error:', error);
      return { success: false, status: 'error', data: { status: 'failed', jobId: '' }, message: 'Network connection failed' };
    }
  },

  /**
   * Poll video job status
   * GET /video-jobs/:id
   */
  getJobStatus: async (jobId: string): Promise<VideoJobResponse> => {
    try {
      const response = await fetch(`${API_BASE_URL}/video-jobs/${jobId}`, {
        method: 'GET',
        headers: {
          'accept': '*/*',
          ...getHeaders()
        },
      });
      return await response.json();
    } catch (error) {
      console.error('Video Job Status Error:', error);
      return { success: false, status: 'error', data: { status: 'failed', jobId }, message: 'Status check failed' };
    }
  }
};