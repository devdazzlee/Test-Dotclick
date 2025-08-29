import { z } from 'zod';

// Password validation schema
export const passwordSchema = z
  .string()
  .min(8, 'Password must be at least 8 characters long')
  .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
  .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
  .regex(/[0-9]/, 'Password must contain at least one number')
  .regex(/[^A-Za-z0-9]/, 'Password must contain at least one special character');

// Register validation schema
export const registerSchema = z.object({
  username: z
    .string()
    .min(3, 'Username must be at least 3 characters long')
    .max(50, 'Username cannot exceed 50 characters')
    .trim(),
  email: z
    .string()
    .email('Please enter a valid email address')
    .toLowerCase()
    .trim(),
  password: passwordSchema,
  confirmPassword: z.string(),
  phone: z
    .string()
    .regex(/^\+?[\d\s-()]+$/, 'Please enter a valid phone number')
    .trim(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

// Register with role validation schema
export const registerWithRoleSchema = z.object({
  username: z
    .string()
    .min(3, 'Username must be at least 3 characters long')
    .max(50, 'Username cannot exceed 50 characters')
    .trim(),
  email: z
    .string()
    .email('Please enter a valid email address')
    .toLowerCase()
    .trim(),
  password: passwordSchema,
  confirmPassword: z.string(),
  phone: z
    .string()
    .regex(/^\+?[\d\s-()]+$/, 'Please enter a valid phone number')
    .trim(),
  role: z.enum(['admin', 'user']).optional().default('user'),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

// Login validation schema
export const loginSchema = z.object({
  email: z
    .string()
    .email('Please enter a valid email address')
    .toLowerCase()
    .trim(),
  password: z.string().min(1, 'Password is required'),
});

// Product validation schema
export const productSchema = z.object({
  name: z
    .string()
    .min(1, 'Product name is required')
    .max(100, 'Product name cannot exceed 100 characters')
    .trim(),
  slug: z
    .string()
    .min(1, 'Product slug is required')
    .max(100, 'Product slug cannot exceed 100 characters')
    .regex(/^[a-z0-9-]+$/, 'Slug can only contain lowercase letters, numbers, and hyphens')
    .trim()
    .optional(), // Made optional since it can be auto-generated
  description: z
    .string()
    .min(1, 'Product description is required')
    .max(2000, 'Product description cannot exceed 2000 characters'),
  tags: z.array(z.string().trim()).optional(),
  price: z
    .string()
    .min(1, 'Price is required')
    .transform((val) => {
      const num = parseFloat(val);
      if (isNaN(num)) throw new Error('Price must be a valid number');
      return num;
    })
    .pipe(z.number().min(0, 'Price cannot be negative')),
  colour: z
    .string()
    .min(1, 'Product colour is required')
    .trim(),
  size: z.enum(['sm', 'md', 'lg', 'xl']),
  images: z
    .array(z.string())
    .optional(), // Made optional since images can come from file uploads
  totalStock: z
    .string()
    .min(1, 'Total stock is required')
    .transform((val) => {
      const num = parseInt(val);
      if (isNaN(num)) throw new Error('Total stock must be a valid number');
      return num;
    })
    .pipe(z.number().min(0, 'Total stock cannot be negative')),
});

// Cart item validation schema
export const cartItemSchema = z.object({
  productId: z.string().min(1, 'Product ID is required'),
  quantity: z
    .number()
    .min(1, 'Quantity must be at least 1'),
  colour: z
    .string()
    .min(1, 'Colour is required'),
  size: z.enum(['sm', 'md', 'lg', 'xl']),
});

// Order validation schema
export const orderSchema = z.object({
  shippingAddress: z.object({
    street: z.string().min(1, 'Street address is required'),
    city: z.string().min(1, 'City is required'),
    state: z.string().min(1, 'State is required'),
    zipCode: z.string().min(1, 'Zip code is required'),
    country: z.string().min(1, 'Country is required'),
  }),
  paymentMethod: z.string().min(1, 'Payment method is required'),
});

// Pagination query schema
export const paginationSchema = z.object({
  page: z.string().transform(Number).pipe(z.number().min(1)).default(() => 1),
  limit: z.string().transform(Number).pipe(z.number().min(1).max(50)).default(() => 12),
  sort: z.enum(['price_asc', 'price_desc', 'newest', 'popular']).default('newest'),
  category: z.string().optional(),
  tag: z.string().optional(),
  minPrice: z.string().transform(Number).pipe(z.number().min(0)).optional(),
  maxPrice: z.string().transform(Number).pipe(z.number().min(0)).optional(),
  inStock: z.string().transform(Boolean).optional(),
});
