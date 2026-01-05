import express from 'express';
import { register, login, getMe, updateProfile, getUserById } from '../controllers/authController.js';
import { initiatePortalAuth, handlePortalCallback } from '../controllers/portalAuthController.js';
import { authenticateToken } from '../middleware/auth.js';
import upload from '../middleware/upload.js';

const router = express.Router();

router.post('/register', register);
router.post('/login', login);
router.get('/me', authenticateToken, getMe);
router.put('/update', authenticateToken, upload.single('avatar'), updateProfile);

// Portal OAuth
router.get('/portal', initiatePortalAuth);
router.get('/portal/callback', handlePortalCallback);

// Public user profile
// Public user profile
router.get('/users/:id', getUserById);

export default router;
