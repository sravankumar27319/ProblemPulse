import axios from 'axios';
import { apiClient } from './apiClient';

export interface UploadSignatureResponse {
  success: boolean;
  isConfigured: boolean;
  signature?: string;
  timestamp?: number;
  apiKey?: string;
  cloudName?: string;
  folder?: string;
  message?: string;
}

export interface UploadedMediaItem {
  id: string;
  url: string;
  publicId?: string;
  mediaType: 'image' | 'video';
  originalName: string;
  size: number;
  format?: string;
}

export const mediaService = {
  /**
   * Request signed upload parameters from the backend
   */
  async getUploadSignature(folder = 'problempulse/evidence'): Promise<UploadSignatureResponse> {
    try {
      const response = await apiClient.get<UploadSignatureResponse>('/media/signature', {
        params: { folder },
      });
      return response.data;
    } catch (error) {
      console.warn('Could not fetch upload signature, using local preview mode:', error);
      return {
        success: true,
        isConfigured: false,
        message: 'Signature service unavailable, falling back to local preview',
      };
    }
  },

  /**
   * Directly upload file to Cloudinary from the browser using a signature
   * (Does not proxy through backend)
   */
  async uploadDirectToCloudinary(
    file: File,
    onProgress?: (percentage: number) => void
  ): Promise<UploadedMediaItem> {
    const isVideo = file.type.startsWith('video/');
    const mediaType: 'image' | 'video' = isVideo ? 'video' : 'image';

    // 1. Fetch upload signature
    const sigData = await this.getUploadSignature();

    // If Cloudinary is configured and credentials are valid
    if (
      sigData.isConfigured &&
      sigData.signature &&
      sigData.timestamp &&
      sigData.apiKey &&
      sigData.cloudName
    ) {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('api_key', sigData.apiKey);
      formData.append('timestamp', String(sigData.timestamp));
      formData.append('signature', sigData.signature);
      if (sigData.folder) {
        formData.append('folder', sigData.folder);
      }

      const resourceType = isVideo ? 'video' : 'image';
      const uploadUrl = `https://api.cloudinary.com/v1_1/${sigData.cloudName}/${resourceType}/upload`;

      const response = await axios.post(uploadUrl, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        onUploadProgress: (progressEvent) => {
          if (progressEvent.total && onProgress) {
            const percent = Math.round((progressEvent.loaded * 100) / progressEvent.total);
            onProgress(percent);
          }
        },
      });

      return {
        id: response.data.public_id || `media_${Date.now()}`,
        url: response.data.secure_url || response.data.url,
        publicId: response.data.public_id,
        mediaType,
        originalName: file.name,
        size: file.size,
        format: response.data.format,
      };
    }

    // 2. Graceful offline/demo fallback when Cloudinary is not configured
    if (onProgress) {
      onProgress(30);
      await new Promise((r) => setTimeout(r, 150));
      onProgress(70);
      await new Promise((r) => setTimeout(r, 150));
      onProgress(100);
    }

    const previewUrl = URL.createObjectURL(file);
    return {
      id: `local_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      url: previewUrl,
      publicId: `local_preview_${file.name}`,
      mediaType,
      originalName: file.name,
      size: file.size,
    };
  },
};
