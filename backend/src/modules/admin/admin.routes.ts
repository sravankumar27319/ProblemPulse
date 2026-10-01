import { Router } from 'express';
import {
  getDashboardHandler,
  getAdminProblemsHandler,
  getAdminProblemDetailHandler,
  verifyProblemHandler,
  rejectProblemHandler,
  markDuplicateHandler,
  getDepartmentsHandler,
  assignProblemHandler,
  updateProblemStatusHandler,
  resolveProblemHandler,
  getAdminAnalyticsHandler,
  getAdminMapProblemsHandler,
} from './admin.controller';
import { authenticateUser, authorizeAdmin } from '../../middleware/auth.middleware';

const router = Router();

// Phase 18 — Admin Dashboard Stats
router.get('/dashboard', authenticateUser, authorizeAdmin, getDashboardHandler);

// Phase 26 — Admin Map
router.get('/map', authenticateUser, authorizeAdmin, getAdminMapProblemsHandler);

// Phase 25 — Admin Analytics
router.get('/analytics', authenticateUser, authorizeAdmin, getAdminAnalyticsHandler);

// Phase 19 — Admin Problem Management
router.get('/problems', authenticateUser, authorizeAdmin, getAdminProblemsHandler);

// Phase 20 — Admin Review Page & Actions
router.get('/problems/:id', authenticateUser, authorizeAdmin, getAdminProblemDetailHandler);
router.post('/problems/:id/verify', authenticateUser, authorizeAdmin, verifyProblemHandler);
router.post('/problems/:id/reject', authenticateUser, authorizeAdmin, rejectProblemHandler);
router.post('/problems/:id/duplicate', authenticateUser, authorizeAdmin, markDuplicateHandler);

// Phase 21 — Department Assignment
router.get('/departments', authenticateUser, authorizeAdmin, getDepartmentsHandler);
router.post('/problems/:id/assign', authenticateUser, authorizeAdmin, assignProblemHandler);

// Phase 22 — Status Management (Full Lifecycle Transitions)
router.patch('/problems/:id/status', authenticateUser, authorizeAdmin, updateProblemStatusHandler);
router.post('/problems/:id/status', authenticateUser, authorizeAdmin, updateProblemStatusHandler);

// Phase 23 — Resolution System (Proof of Work Upload)
router.post('/problems/:id/resolve', authenticateUser, authorizeAdmin, resolveProblemHandler);

export default router;

