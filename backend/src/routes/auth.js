import express from 'express';
import { register, login, getMe } from '../controllers/authController.js';
import { initiatePortalAuth, handlePortalCallback } from '../controllers/portalAuthController.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

router.post('/register', register);
router.post('/login', login);
router.get('/me', authenticateToken, getMe);

// Portal OAuth
router.get('/portal', initiatePortalAuth);
router.get('/portal/callback', handlePortalCallback);

export default router;
