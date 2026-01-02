import express from 'express';
import { createReport } from '../controllers/reportController.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

// All routes require authentication
router.use(authenticateToken);

// Submit a report
router.post('/', createReport);

export default router;
