import express from 'express';
import { register, login, getMe, updateProfile, getUserById, forgotPassword, resetPassword, verifyEmail } from '../controllers/authController.js';
import { initiatePortalAuth, handlePortalCallback } from '../controllers/portalAuthController.js';
import { authenticateToken } from '../middleware/auth.js';
import upload from '../middleware/upload.js';

import rateLimit from 'express-rate-limit';

const router = express.Router();

const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 300, // Limit each IP to 300 requests per 15 minutes
    message: { message: '登入嘗試次數過多，為保護帳戶安全，請稍後再試。' }
});

router.post('/register', authLimiter, register);
router.post('/login', authLimiter, login);
router.post('/forgot-password', authLimiter, forgotPassword);
router.post('/reset-password', authLimiter, resetPassword);
router.post('/verify-email', authLimiter, verifyEmail);
router.get('/me', authenticateToken, getMe);
router.put('/update', authenticateToken, upload.single('avatar'), updateProfile);

// Portal OAuth
router.get('/portal', initiatePortalAuth);
router.get('/portal/callback', handlePortalCallback);

// Public user profile
// Public user profile
router.get('/users/:id', getUserById);

export default router;
