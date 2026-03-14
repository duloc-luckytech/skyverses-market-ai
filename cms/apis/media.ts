
import { API_BASE_URL, getHeaders } from './config';

export interface ImageUploadRequest {
  base64: string;
  fileName: string;
  size: number;
  source?: string; // "gommo" | "fxlab"
  aspectRatio?: string; // "IMAGE_ASPECT_RATIO_LANDSCAPE" | ...
}

export interface ImageUploadResponse {
  success: boolean;
  _id?: string;
  imageId?: string;
  imageUrl?: string;
  fileName?: string;
  mediaId?: string;
  width?: number;
  height?: number;
  source?: string;
  message?: string;
  raw?: any;
}

export interface MediaListParams {
  page?: number;
  limit?: number;
  search?: string;
  source?: string;
}

export interface MediaListResponse {
  total: number;
  page: number;
  limit: number;
  data: Array<{
    _id: string;
    mediaId: string | null;
    width: number | null;
    height: number | null;
    createdAt: string;
    imageUrl: string;
    status: string;
    aspectRatio: string | null;
    originalName: string | null;
    source: string | null;
  }>;
  error?: string;
}

export const mediaApi = {
  /**
   * Upload image via base64
   * POST /media/image-upload
   */
  uploadImage: async (payload: ImageUploadRequest): Promise<ImageUploadResponse> => {
    try {
      const response = await fetch(`${API_BASE_URL}/media/image-upload`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify(payload),
      });
      return await response.json();
    } catch (error) {
      console.error('Image Upload API Error:', error);
      return { success: false, message: 'Network connection failed during upload' };
    }
  },

  /**
   * Fetch media list from server
   * GET /upload-media/list
   */
  getMediaList: async (params: MediaListParams): Promise<MediaListResponse> => {
    try {
      const query = new URLSearchParams({
        page: String(params.page || 1),
        limit: String(params.limit || 20),
        search: params.search || '',
        ...(params.source ? { source: params.source } : {})
      });

      const response = await fetch(`${API_BASE_URL}/upload-media/list?${query}`, {
        method: 'GET',
        headers: getHeaders(),
      });
      
      if (!response.ok) {
        throw new Error('Unauthorized or Server Error');
      }
      
      return await response.json();
    } catch (error) {
      console.error('Media List Fetch Error:', error);
      return { total: 0, page: 1, limit: 20, data: [] };
    }
  },

  /**
   * Delete media from server
   * DELETE /upload-media/delete/:id
   */
  deleteMedia: async (id: string): Promise<{ success: boolean; message?: string }> => {
    try {
      const response = await fetch(`${API_BASE_URL}/upload-media/delete/${id}`, {
        method: 'DELETE',
        headers: getHeaders(),
      });
      return await response.json();
    } catch (error) {
      console.error('Delete Media API Error:', error);
      return { success: false, message: 'Network connection failed during deletion' };
    }
  }
};
