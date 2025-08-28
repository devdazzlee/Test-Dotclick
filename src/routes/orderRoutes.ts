import { Router } from 'express';
import { 
  createCheckoutSession, 
  handlePaymentSuccess, 
  getUserOrders, 
  getOrderById,
  getAllOrders,
  updateOrderStatus
} from '../controllers/orderController';
import { authenticate, authorize } from '../middleware/auth';

const router = Router();

// Public routes (for Stripe webhooks)
router.get('/success', handlePaymentSuccess);

// User routes (require authentication)
router.post('/checkout', authenticate, createCheckoutSession);
router.get('/my-orders', authenticate, getUserOrders);
router.get('/my-orders/:orderId', authenticate, getOrderById);

// Admin routes
router.get('/', authenticate, authorize('admin'), getAllOrders);
router.put('/:orderId/status', authenticate, authorize('admin'), updateOrderStatus);

export default router;
