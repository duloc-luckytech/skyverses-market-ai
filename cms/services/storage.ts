/**
 * SKYVERSES INDUSTRIAL STORAGE ENGINE
 * GCS Uplink Handler & Binary Transformer
 */
import { mediaApi } from '../apis/media';

export interface GCSAssetMetadata {
  id: string;
  url: string;
  mediaId?: string; // New field for FXLab specific identifier
  gcsPath: string;
  bucket: string;
  name: string;
  size: string;
  type: string;
  blob: Blob;
  timestamp: string;
  prompt?: string; // Metadata bổ sung cho AI Generated assets
}

/**
 * Uploads a file to Server via base64 API and maps to GCS style metadata.
 */
export const uploadToGCS = async (file: File, source: string = 'gommo'): Promise<GCSAssetMetadata> => {
  // Convert File to Base64
  const base64 = await new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = error => reject(error);
  });

  // Extract raw base64 data (remove prefix like "data:image/png;base64,")
  const base64Data = base64.split(',')[1];

  // Call the real API
  const response = await mediaApi.uploadImage({
    base64: base64Data,
    fileName: file.name,
    size: file.size,
    source // Explicitly pass the source (gommo or fxlab)
  });

  if (!response.success || !response.imageUrl) {
    throw new Error(response.message || 'Server rejected the upload');
  }

  return {
    id: response.imageId || response._id || `gcs-${Math.random().toString(36).substr(2, 9).toUpperCase()}`,
    url: response.imageUrl, // Use the real URL from CDN/Server
    mediaId: response.mediaId, // Capture the provider-specific mediaId
    gcsPath: response.imageUrl,
    bucket: 'skyverses-production-vault',
    name: response.fileName || file.name,
    size: (file.size / 1024 / 1024).toFixed(2) + ' MB',
    type: file.type,
    blob: file, // Keep the original downstream blob
    timestamp: new Date().toISOString()
  };
};

/**
 * Chuyển đổi Data URL (Base64) từ Gemini sang Blob để lưu trữ nhị phân tiết kiệm bộ nhớ
 */
export const dataURLtoBlob = (dataurl: string): Blob => {
  const arr = dataurl.split(',');
  const mime = arr[0].match(/:(.*?);/)?.[1] || 'image/png';
  const bstr = atob(arr[1]);
  let n = bstr.length;
  const u8arr = new Uint8Array(n);
  while (n--) {
    u8arr[n] = bstr.charCodeAt(n);
  }
  return new Blob([u8arr], { type: mime });
};