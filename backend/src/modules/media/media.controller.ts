import { Request, Response } from 'express';
import { v2 as cloudinary } from 'cloudinary';
import { config } from '../../config/env';
import { ALLOWED_VIDEO_TYPES } from '../../middleware/fileValidation';

// Initialize cloudinary configuration if credentials exist
if (config.cloudinary.cloudName && config.cloudinary.apiKey && config.cloudinary.apiSecret) {
  cloudinary.config({
    cloud_name: config.cloudinary.cloudName,
    api_key: config.cloudinary.apiKey,
    api_secret: config.cloudinary.apiSecret,
    secure: true,
  });
}

// Whitelist allowed folder paths
const ALLOWED_FOLDERS = [
  'problempulse/evidence',
  'problempulse/resolutions',
  'problempulse/avatars',
];

export const getUploadSignatureHandler = async (req: Request, res: Response): Promise<void> => {
  try {
    const rawFolder = (req.query.folder as string) || 'problempulse/evidence';

    // Folder safety validation: ensure folder is within permitted namespace and free of traversal
    const isValidFolder =
      ALLOWED_FOLDERS.includes(rawFolder) ||
      (/^[a-zA-Z0-9_\-\/]+$/.test(rawFolder) && !rawFolder.includes('..') && rawFolder.startsWith('problempulse/'));

    if (!isValidFolder) {
      res.status(400).json({
        success: false,
        error: {
          code: 'INVALID_FOLDER',
          message: 'Invalid upload destination folder specified.',
        },
      });
      return;
    }

    const folder = rawFolder;
    const timestamp = Math.round(Date.now() / 1000);

    const isConfigured = Boolean(
      config.cloudinary.cloudName &&
      config.cloudinary.apiKey &&
      config.cloudinary.apiSecret
    );

    if (!isConfigured) {
      res.status(200).json({
        success: true,
        isConfigured: false,
        message: 'Cloudinary credentials not configured. Direct upload fallback active.',
      });
      return;
    }

    const paramsToSign = {
      folder,
      timestamp,
    };

    const signature = cloudinary.utils.api_sign_request(
      paramsToSign,
      config.cloudinary.apiSecret
    );

    res.status(200).json({
      success: true,
      isConfigured: true,
      signature,
      timestamp,
      apiKey: config.cloudinary.apiKey,
      cloudName: config.cloudinary.cloudName,
      folder,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: {
        message: error.message || 'Failed to generate media upload signature',
      },
    });
  }
};

/**
 * Direct file upload handler via validated multipart multer payload.
 * Uploads buffer to Cloudinary or returns fallback object in local development.
 */
export const uploadFilesHandler = async (req: Request, res: Response): Promise<void> => {
  try {
    const files = (req.files as Express.Multer.File[]) || (req.file ? [req.file] : []);

    if (!files || files.length === 0) {
      res.status(400).json({
        success: false,
        error: {
          code: 'NO_FILES_UPLOADED',
          message: 'No media files were provided in the upload request.',
        },
      });
      return;
    }

    const isConfigured = Boolean(
      config.cloudinary.cloudName &&
      config.cloudinary.apiKey &&
      config.cloudinary.apiSecret
    );

    const uploadedResults: Array<{
      url: string;
      publicId: string;
      mediaType: 'image' | 'video';
      format: string;
      bytes: number;
    }> = [];

    for (const file of files) {
      const isVideo = ALLOWED_VIDEO_TYPES.includes(file.mimetype.toLowerCase());
      const mediaType: 'image' | 'video' = isVideo ? 'video' : 'image';

      if (isConfigured) {
        // Stream upload buffer to Cloudinary
        const result = await new Promise<any>((resolve, reject) => {
          const uploadStream = cloudinary.uploader.upload_stream(
            {
              folder: 'problempulse/evidence',
              resource_type: isVideo ? 'video' : 'image',
            },
            (error, result) => {
              if (error) reject(error);
              else resolve(result);
            }
          );
          uploadStream.end(file.buffer);
        });

        uploadedResults.push({
          url: result.secure_url || result.url,
          publicId: result.public_id,
          mediaType,
          format: result.format || file.mimetype.split('/')[1],
          bytes: result.bytes || file.size,
        });
      } else {
        // Safe development simulation fallback
        const simulatedId = `local_${Date.now()}_${Math.random().toString(36).substring(7)}`;
        uploadedResults.push({
          url: `https://images.unsplash.com/photo-1541888946425-d0fbb18615f3?auto=format&fit=crop&w=800&q=80`,
          publicId: simulatedId,
          mediaType,
          format: file.mimetype.split('/')[1] || 'jpeg',
          bytes: file.size,
        });
      }
    }

    res.status(200).json({
      success: true,
      count: uploadedResults.length,
      files: uploadedResults,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: {
        message: error.message || 'Failed to process media file upload',
      },
    });
  }
};
