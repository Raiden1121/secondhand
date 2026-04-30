import express from 'express';
import {
    createPurchaseRequest,
    confirmPurchase,
    cancelTransaction,
    getTransaction,
    getProductTransactionStatus,
    getCarbonStats
} from '../controllers/transactionController.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

// Specific routes MUST come before parameterized routes
router.get('/carbon-stats', getCarbonStats);
router.get('/product/:productId/status', authenticateToken, getProductTransactionStatus);
router.post('/', authenticateToken, createPurchaseRequest);
router.patch('/:transactionId/confirm', authenticateToken, confirmPurchase);
router.patch('/:transactionId/cancel', authenticateToken, cancelTransaction);
router.get('/:transactionId', authenticateToken, getTransaction);

export default router;
