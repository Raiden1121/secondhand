import express from 'express';
import { submitRating, getUserRating, checkRatingStatus } from '../controllers/ratingController.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

router.post('/', authenticateToken, submitRating);
router.get('/user/:userId', getUserRating);
router.get('/transaction/:transactionId/status', authenticateToken, checkRatingStatus);

export default router;
