import { Router } from 'express';
import { 
  addToFavorites, 
  removeFromFavorites, 
  getFavorites, 
  checkFavoriteStatus 
} from '../controllers/favoriteController';
import { authenticate } from '../middleware/auth';

const router = Router();

// All favorite routes require authentication
router.use(authenticate);

// Add product to favorites
router.post('/add', addToFavorites);

// Remove product from favorites
router.delete('/:productId', removeFromFavorites);

// Get user's favorites with pagination
router.get('/', getFavorites);

// Check if specific product is in favorites
router.get('/check/:productId', checkFavoriteStatus);

export default router;
