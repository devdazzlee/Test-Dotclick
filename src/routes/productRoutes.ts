import { Router } from 'express';
import { 
  createProduct, 
  getProducts, 
  getProductBySlug, 
  getProductById, 
  updateProduct, 
  deleteProduct,
  getCategories,
  searchProducts
} from '../controllers/productController';
import { authenticate, authorize } from '../middleware/auth';
import { uploadProductImages } from '../middleware/upload';

const router = Router();

// Public routes
router.get('/', getProducts);
router.get('/search', searchProducts);
router.get('/categories', getCategories);
router.get('/slug/:slug', getProductBySlug);
router.get('/:id', getProductById);

// Admin only routes
router.post('/', authenticate, authorize('admin'), uploadProductImages, createProduct);
router.put('/:id', authenticate, authorize('admin'), uploadProductImages, updateProduct);
router.delete('/:id', authenticate, authorize('admin'), deleteProduct);

export default router;
