import express from 'express';
import { getProducts, getProductById, createProduct, getMyProducts, updateProduct, deleteProduct, toggleReserve } from '../controllers/productController.js';
import { authenticateToken } from '../middleware/auth.js';
import upload from '../middleware/upload.js';

const router = express.Router();

router.get('/', getProducts);
router.get('/my', authenticateToken, getMyProducts); // Important: Place before /:id to avoid conflict
router.get('/:id', getProductById);
router.post('/', authenticateToken, upload.array('images', 5), createProduct);
router.put('/:id', authenticateToken, upload.array('images', 5), updateProduct);
router.patch('/:id/reserve', authenticateToken, toggleReserve);
router.delete('/:id', authenticateToken, deleteProduct);

export default router;
