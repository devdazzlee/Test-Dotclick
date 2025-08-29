import multer from 'multer';
import { Request } from 'express';

// Configure multer for memory storage (for Cloudinary upload)
const storage = multer.memoryStorage();

// File filter for images
const fileFilter = (_req: Request, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
  if (file.mimetype.startsWith('image/')) {
    cb(null, true);
  } else {
    cb(new Error('Only image files are allowed!'));
  }
};

// Configure multer
export const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  }
});

// Single file upload for profile image
export const uploadProfileImage = upload.single('profileImage');

// Multiple files upload for product images
export const uploadProductImages = upload.array('images', 5); // Max 5 images
