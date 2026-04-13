
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
  maxAge?: number; // hours — only fetch images created within the last N hours
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

// Auth header only — no Content-Type (browser sets multipart boundary automatically)
const getAuthHeader = (): Record<string, string> => {
  const token = localStorage.getItem('skyverses_auth_token');
  return token ? { 'Authorization': `Bearer ${token}` } : {};
};

export const mediaApi = {
  /**
   * Upload image — tries multipart first, falls back to JSON base64
   * POST /media/image-upload
   */
  uploadImage: async (payload: ImageUploadRequest): Promise<ImageUploadResponse> => {
    try {
      // Convert base64 → Blob → File for multipart upload
      const byteString = atob(payload.base64);
      const bytes = new Uint8Array(byteString.length);
      for (let i = 0; i < byteString.length; i++) {
        bytes[i] = byteString.charCodeAt(i);
      }
      const blob = new Blob([bytes], { type: 'image/png' });
      const file = new File([blob], payload.fileName, { type: 'image/png' });

      const form = new FormData();
      form.append('file', file);
      if (payload.source) form.append('source', payload.source);
      if (payload.aspectRatio) form.append('aspectRatio', payload.aspectRatio);

      const response = await fetch(`${API_BASE_URL}/media/image-upload`, {
        method: 'POST',
        headers: getAuthHeader(),
        body: form,
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
        ...(params.source ? { source: params.source } : {}),
        ...(params.maxAge ? { maxAge: String(params.maxAge) } : {})
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
