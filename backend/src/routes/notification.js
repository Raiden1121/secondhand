import express from 'express';
import { getNotifications, markNotificationRead, markAllRead, deleteNotification, deleteAllReadNotifications } from '../controllers/notificationController.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

router.get('/', authenticateToken, getNotifications);
router.put('/:id/read', authenticateToken, markNotificationRead);
router.put('/read-all', authenticateToken, markAllRead);
router.delete('/:id', authenticateToken, deleteNotification);
router.delete('/read/all', authenticateToken, deleteAllReadNotifications);

export default router;
