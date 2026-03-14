import { API_BASE_URL, getHeaders } from './config';

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

export const upscaleApi = {
  /**
   * Upscale an image by providing its URL
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
  }
};