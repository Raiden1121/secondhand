import express from 'express';
import { getConversations, getMessages, initiateChat, sendMessage, markAsRead } from '../controllers/chatController.js';
import { authenticateToken } from '../middleware/auth.js';
import upload from '../middleware/upload.js';

const router = express.Router();

router.get('/', authenticateToken, getConversations);
router.get('/:chatId/messages', authenticateToken, getMessages);
router.post('/initiate', authenticateToken, initiateChat);
router.post('/:chatId/messages', authenticateToken, upload.single('image'), sendMessage);
router.put('/:chatId/read', authenticateToken, markAsRead);

export default router;
