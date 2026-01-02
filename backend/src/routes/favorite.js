import express from 'express';
import { addFavorite, removeFavorite, getMyFavorites, checkFavorite } from '../controllers/favoriteController.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

// All routes require authentication
router.use(authenticateToken);

// Get my favorites
router.get('/', getMyFavorites);

// Check if favorited
router.get('/check/:productId', checkFavorite);

// Add to favorites
router.post('/:productId', addFavorite);

// Remove from favorites
router.delete('/:productId', removeFavorite);

export default router;
