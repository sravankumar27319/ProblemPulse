import { Router } from 'express';
import * as authController from './auth.controller';
import { authenticateUser } from '../../middleware/auth.middleware';
import { authLimiter } from '../../middleware/rateLimiter';

const router = Router();

// Phase 27 — Rate limited authentication endpoints
router.post('/register', authLimiter, authController.register);
router.post('/login', authLimiter, authController.login);
router.post('/logout', authController.logout);
router.get('/me', authenticateUser, authController.getMe);

export default router;
