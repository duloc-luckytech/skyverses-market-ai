
import { API_BASE_URL, getHeaders } from './config';

export interface VideoJobRequest {
  type: "text-to-video" | "image-to-video" | "start-end-image" | "ingredient" | "image-to-animation";
  input: {
    images?: (string | null)[];
    videos?: (string | null)[];
  };
  config: {
    duration: number;
    aspectRatio: string;
    resolution: string;
  };
  engine: {
    provider: "gommo" | "fxlab";
    model: string;
  };
  enginePayload: {
    accessToken?: string;
    prompt: string;
    privacy: "PRIVATE";
    translateToEn: boolean;
    projectId: string;
    mode: "relaxed" | "fast";
  };
}

export interface VideoJobResponse {
  success?: boolean; 
  status?: string; 
  data: {
    status: string; 
    jobId: string;
    result?: {
      videoUrl: string;
      thumbnailUrl?: string;
    };
  };
  message?: string;
}

export interface VideoHistoryResponse {
  success: boolean;
  meta: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
  data: Array<{
    jobId: string;
    status: string;
    type: string;
    provider: string;
    model: string;
    prompt: string;
    thumbnail?: string;
    videoUrl?: string;
    createdAt: string;
    error?: {
      message: string;
      userMessage: string;
    } | null;
  }>;
}

export const videosApi = {
  /**
   * Create a video generation job using credits
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
  },

  /**
   * Get list of video jobs (History)
   */
  getJobs: async (params: { 
    status?: string, 
    type?: string, 
    provider?: string, 
    model?: string, 
    q?: string, 
    page?: number, 
    limit?: number 
  }): Promise<VideoHistoryResponse> => {
    try {
      const query = new URLSearchParams();
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined) query.append(key, String(value));
      });

      const response = await fetch(`${API_BASE_URL}/video-jobs?${query.toString()}`, {
        method: 'GET',
        headers: getHeaders(),
      });
      return await response.json();
    } catch (error) {
      console.error('Video Jobs List Error:', error);
      throw error;
    }
  }
};
