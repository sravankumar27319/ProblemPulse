import multer, { FileFilterCallback } from 'multer';
import { Request, Response, NextFunction } from 'express';
import { AppError } from './errorHandler';

// Explicitly Whitelisted MIME types
export const ALLOWED_IMAGE_TYPES = [
  'image/jpeg',
  'image/jpg',
  'image/png',
  'image/webp',
];

export const ALLOWED_VIDEO_TYPES = [
  'video/mp4',
  'video/quicktime',
  'video/webm',
];

export const ALL_ALLOWED_MEDIA_TYPES = [
  ...ALLOWED_IMAGE_TYPES,
  ...ALLOWED_VIDEO_TYPES,
];

// Strict File Size Bounds
export const MAX_IMAGE_SIZE = 10 * 1024 * 1024; // 10 Megabytes
export const MAX_VIDEO_SIZE = 50 * 1024 * 1024; // 50 Megabytes

export function isAllowedMimeType(mimetype: string): boolean {
  if (!mimetype) return false;
  return ALL_ALLOWED_MEDIA_TYPES.includes(mimetype.toLowerCase().trim());
}

export function validateFileSize(mimetype: string, size: number): boolean {
  const normalizedMime = (mimetype || '').toLowerCase().trim();
  const isVideo = ALLOWED_VIDEO_TYPES.includes(normalizedMime);
  const maxSize = isVideo ? MAX_VIDEO_SIZE : MAX_IMAGE_SIZE;
  return size <= maxSize && size > 0;
}

// Memory storage for controlled in-flight security inspection
const storage = multer.memoryStorage();

const fileFilter = (
  _req: Request,
  file: Express.Multer.File,
  cb: FileFilterCallback
): void => {
  const mimetype = (file.mimetype || '').toLowerCase().trim();

  if (!isAllowedMimeType(mimetype)) {
    const error: AppError = new Error(
      `Unsupported file type '${file.mimetype}'. Only images (JPEG, PNG, WEBP) and videos (MP4, MOV, WEBM) are permitted.`
    );
    error.statusCode = 400;
    return cb(error);
  }

  cb(null, true);
};

export const mediaUpload = multer({
  storage,
  limits: {
    fileSize: MAX_VIDEO_SIZE, // Outer ceiling; per-mimetype exact check executed in validateUploadedFiles
    files: 5, // Maximum 5 files per single submission batch
  },
  fileFilter,
});

/**
 * Validates individual file sizes according to their specific type (10MB for image, 50MB for video).
 */
export const validateUploadedFiles = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  const files = (req.files as Express.Multer.File[]) || (req.file ? [req.file] : []);

  for (const file of files) {
    const mimetype = file.mimetype.toLowerCase();

    if (!isAllowedMimeType(mimetype)) {
      res.status(400).json({
        success: false,
        error: {
          code: 'UNSUPPORTED_MEDIA_TYPE',
          message: `File '${file.originalname}' has unsupported MIME type '${file.mimetype}'. Allowed: JPG, PNG, WEBP, MP4, MOV, WEBM.`,
        },
      });
      return;
    }

    if (!validateFileSize(mimetype, file.size)) {
      const isVideo = ALLOWED_VIDEO_TYPES.includes(mimetype);
      const limitMb = isVideo ? 50 : 10;
      res.status(400).json({
        success: false,
        error: {
          code: 'FILE_SIZE_EXCEEDED',
          message: `File '${file.originalname}' (${(file.size / (1024 * 1024)).toFixed(1)}MB) exceeds maximum permitted size of ${limitMb}MB for ${isVideo ? 'video' : 'image'}.`,
        },
      });
      return;
    }
  }

  next();
};
