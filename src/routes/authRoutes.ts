import { Router } from 'express';
import { register, registerWithRole, registerAdmin, login, getProfile, updateProfile } from '../controllers/authController';
import { authenticate } from '../middleware/auth';
import { uploadProfileImage } from '../middleware/upload';

const router = Router();

// Public routes
router.post('/register', uploadProfileImage, register);
router.post('/register/with-role', uploadProfileImage, registerWithRole);
router.post('/register/admin', uploadProfileImage, registerAdmin);
router.post('/login', login);

// Protected routes
router.get('/profile', authenticate, getProfile);
router.put('/profile', authenticate, uploadProfileImage, updateProfile);

export default router;
