import express from 'express';
import { getProducts, getProductById, createProduct } from '../controllers/productController.js';
import { authenticateToken } from '../middleware/auth.js';
import upload from '../middleware/upload.js';

const router = express.Router();

router.get('/', getProducts);
router.get('/:id', getProductById);
router.post('/', authenticateToken, upload.array('images', 5), createProduct);

export default router;
