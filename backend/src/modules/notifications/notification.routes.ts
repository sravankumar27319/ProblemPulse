import { Router } from 'express';
import {
  getNotificationsHandler,
  markAsReadHandler,
  markAllAsReadHandler,
  deleteNotificationHandler,
} from './notification.controller';
import { authenticateUser } from '../../middleware/auth.middleware';

const router = Router();

// Phase 17 — Notifications
router.get('/', authenticateUser, getNotificationsHandler);

// Read all notifications
router.patch('/read-all', authenticateUser, markAllAsReadHandler);
router.post('/read-all', authenticateUser, markAllAsReadHandler);

// Read single notification
router.patch('/:id/read', authenticateUser, markAsReadHandler);
router.post('/:id/read', authenticateUser, markAsReadHandler);

// Delete notification
router.delete('/:id', authenticateUser, deleteNotificationHandler);

export default router;
