import { Router } from 'express';
import { getUploadSignatureHandler, uploadFilesHandler } from './media.controller';
import { mediaLimiter } from '../../middleware/rateLimiter';
import { mediaUpload, validateUploadedFiles } from '../../middleware/fileValidation';
import { authenticateUser } from '../../middleware/auth.middleware';

const router = Router();

// GET /api/media/signature - Generate direct upload signature for Cloudinary (Rate limited)
router.get('/signature', mediaLimiter, getUploadSignatureHandler);

// POST /api/media/upload - Direct multipart media upload with MIME type & size enforcement
router.post(
  '/upload',
  mediaLimiter,
  authenticateUser,
  mediaUpload.array('files', 5),
  validateUploadedFiles,
  uploadFilesHandler
);

export default router;
