import express from 'express';
import { getConversations, getMessages } from '../controllers/chatController.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

router.get('/', authenticateToken, getConversations);
router.get('/:chatId/messages', authenticateToken, getMessages);

export default router;
