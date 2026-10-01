import { Router } from 'express';
import {
  getProblemsHandler,
  getMapProblemsHandler,
  getProblemByIdHandler,
  createProblemHandler,
  checkDuplicatesHandler,
  addSupportHandler,
  removeSupportHandler,
  getCommentsHandler,
  createCommentHandler,
  flagCommentHandler,
  getUserActivityHandler,
  getProblemVerificationHandler,
  castVerificationVoteHandler,
} from './problem.controller';
import { authenticateUser } from '../../middleware/auth.middleware';
import {
  reportCreationLimiter,
  supportLimiter,
  commentLimiter,
} from '../../middleware/rateLimiter';

const router = Router();

router.get('/', getProblemsHandler);
router.get('/map', getMapProblemsHandler);
router.get('/duplicates', checkDuplicatesHandler);

// Phase 16 — User Activity
router.get('/user/activity', authenticateUser, getUserActivityHandler);
router.get('/my-activity', authenticateUser, getUserActivityHandler);

// Phase 25 — Community Verification
router.get('/:id/verification', getProblemVerificationHandler);
router.post('/:id/verification/vote', authenticateUser, castVerificationVoteHandler);

router.get('/:id', getProblemByIdHandler);

// Phase 11 & Phase 27 — Rate-limited Problem Creation
router.post('/', authenticateUser, reportCreationLimiter, createProblemHandler);

// Phase 14 & Phase 27 — Rate-limited Support
router.post('/:id/support', authenticateUser, supportLimiter, addSupportHandler);
router.delete('/:id/support', authenticateUser, supportLimiter, removeSupportHandler);

// Phase 15 & Phase 27 — Rate-limited Comments
router.get('/:id/comments', getCommentsHandler);
router.post('/:id/comments', authenticateUser, commentLimiter, createCommentHandler);
router.post('/:id/comments/:commentId/flag', authenticateUser, commentLimiter, flagCommentHandler);

export default router;

