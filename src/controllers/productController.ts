import { Request, Response } from 'express';
import { Product } from '../models/Product';
import { sendSuccess, sendBadRequest, sendNotFound, sendError } from '../utils/response';
import { asyncHandler } from '../middleware/asyncHandler';
import { productSchema, paginationSchema } from '../utils/validation';
import { CloudinaryService } from '../services/cloudinary';

// Create product (Admin only)
export const createProduct = asyncHandler(async (req: Request, res: Response) => {
  // Validate request body
  const validatedData = productSchema.parse(req.body);

    // Generate or use provided slug
  let slug: string;
  if (validatedData.slug) {
    // Use provided slug
    slug = validatedData.slug.toLowerCase().trim();
    
    // Check if slug already exists
    const existingProductWithSlug = await Product.findOne({ slug });
    if (existingProductWithSlug) {
      sendBadRequest(res, 'Product with this slug already exists');
      return;
    }
  } else {
    // Auto-generate slug from name
    slug = validatedData.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
    
    // Check if auto-generated slug already exists
    const existingProduct = await Product.findOne({ slug });
  if (existingProduct) {
    sendBadRequest(res, 'Product with this name already exists');
      return;
    }
  }

  // Determine images from uploaded files or request body
  let images: string[] = [];
  
  if (Array.isArray(req.files) && req.files.length > 0) {
    try {
      // Upload images to Cloudinary (following the same pattern as profile images)
      const uploadPromises = req.files.map((file: any) => 
        CloudinaryService.uploadImage(file, 'products')
      );
      const uploadResults = await Promise.all(uploadPromises);
      images = uploadResults.map(result => result.secure_url);
    } catch (error) {
      console.error('Cloudinary upload error:', error);
      sendError(res, 'Failed to upload images', 500);
      return;
    }
  } else if (validatedData.images && Array.isArray(validatedData.images) && validatedData.images.length > 0) {
    // Images provided in request body (URLs)
    images = validatedData.images;
  }

  // Ensure at least one image is provided
  if (images.length === 0) {
    sendBadRequest(res, 'At least one product image is required');
    return;
  }

  // Create new product
  const product = new Product({
    ...validatedData,
    slug,
    images,
  });

  await product.save();

  sendSuccess(res, { product }, 'Product created successfully', 201);
});

// Get all products with filtering and pagination
export const getProducts = asyncHandler(async (req: Request, res: Response) => {
  // Validate query parameters
  const validatedQuery = paginationSchema.parse(req.query);

  const { page, limit, sort, category, tag, minPrice, maxPrice, inStock } = validatedQuery;

  // Build filter object
  const filter: any = {};

  if (category) {
    filter.tags = { $in: [category] };
  }

  if (tag) {
    filter.tags = { $in: [tag] };
  }

  if (minPrice !== undefined || maxPrice !== undefined) {
    filter.price = {};
    if (minPrice !== undefined) filter.price.$gte = minPrice;
    if (maxPrice !== undefined) filter.price.$lte = maxPrice;
  }

  if (inStock !== undefined) {
    filter.inStock = inStock;
  }

  // Build sort object
  let sortObj: any = {};
  switch (sort) {
    case 'price_asc':
      sortObj = { price: 1 };
      break;
    case 'price_desc':
      sortObj = { price: -1 };
      break;
    case 'popular':
      sortObj = { soldCount: -1 };
      break;
    case 'newest':
    default:
      sortObj = { createdAt: -1 };
      break;
  }

  // Calculate pagination
  const skip = (page - 1) * limit;

  // Execute query
  const [products, total] = await Promise.all([
    Product.find(filter)
      .sort(sortObj)
      .skip(skip)
      .limit(limit)
      .lean(),
    Product.countDocuments(filter)
  ]);

  // Calculate pagination info
  const totalPages = Math.ceil(total / limit);
  const hasNextPage = page < totalPages;
  const hasPrevPage = page > 1;

  sendSuccess(res, {
    products,
    pagination: {
      page,
      limit,
      total,
      totalPages,
      hasNextPage,
      hasPrevPage,
    }
  }, 'Products retrieved successfully');
});

// Get product by slug
export const getProductBySlug = asyncHandler(async (req: Request, res: Response) => {
  const { slug } = req.params;

  const product = await Product.findOne({ slug });

  if (!product) {
    sendNotFound(res, 'Product not found');
    return;
  }

  sendSuccess(res, { product }, 'Product retrieved successfully');
});

// Get product by ID
export const getProductById = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;

  const product = await Product.findById(id);

  if (!product) {
    sendNotFound(res, 'Product not found');
    return;
  }

  sendSuccess(res, { product }, 'Product retrieved successfully');
});

// Update product (Admin only)
export const updateProduct = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;

  // Validate request body
  const validatedData = productSchema.partial().parse(req.body);

  const product = await Product.findById(id);

  if (!product) {
    sendNotFound(res, 'Product not found');
    return;
  }

  // Update product
  Object.assign(product, validatedData);
  
  // Update images if new files are uploaded
  if (req.files && Array.isArray(req.files) && req.files.length > 0) {
    try {
      // Delete old images from Cloudinary if they exist (following profile pattern)
      if (product.images && product.images.length > 0) {
        for (const imageUrl of product.images) {
          if (imageUrl.includes('cloudinary')) {
            const oldPublicId = CloudinaryService.getPublicIdFromUrl(imageUrl);
            if (oldPublicId) {
              await CloudinaryService.deleteImage(oldPublicId);
            }
          }
        }
      }

      // Upload new images to Cloudinary
      const uploadPromises = req.files.map((file: any) => 
        CloudinaryService.uploadImage(file, 'products')
      );
      const uploadResults = await Promise.all(uploadPromises);
      product.images = uploadResults.map(result => result.secure_url);
    } catch (error) {
      console.error('Cloudinary upload error:', error);
      sendError(res, 'Failed to upload images', 500);
      return;
    }
  }

  await product.save();

  sendSuccess(res, { product }, 'Product updated successfully');
});

// Delete product (Admin only)
export const deleteProduct = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;

  const product = await Product.findById(id);

  if (!product) {
    sendNotFound(res, 'Product not found');
    return;
  }

  // Delete images from Cloudinary if they exist (following profile pattern)
  if (product.images && product.images.length > 0) {
    try {
      for (const imageUrl of product.images) {
        if (imageUrl.includes('cloudinary')) {
          const publicId = CloudinaryService.getPublicIdFromUrl(imageUrl);
          if (publicId) {
            await CloudinaryService.deleteImage(publicId);
          }
        }
      }
    } catch (error) {
      console.error('Failed to delete images from Cloudinary:', error);
      // Continue with product deletion even if image deletion fails
    }
  }

  // Delete the product
  await Product.findByIdAndDelete(id);

  sendSuccess(res, null, 'Product deleted successfully');
});

// Get product categories/tags
export const getCategories = asyncHandler(async (_req: Request, res: Response) => {
  const categories = await Product.distinct('tags');
  
  sendSuccess(res, { categories }, 'Categories retrieved successfully');
});

// Search products
export const searchProducts = asyncHandler(async (req: Request, res: Response) => {
  const { q } = req.query;
  const validatedQuery = paginationSchema.parse(req.query);

  if (!q || typeof q !== 'string') {
    sendBadRequest(res, 'Search query is required');
    return;
  }

  const { page, limit, sort } = validatedQuery;
  const skip = (page - 1) * limit;

  // Build sort object
  let sortObj: any = {};
  switch (sort) {
    case 'price_asc':
      sortObj = { price: 1 };
      break;
    case 'price_desc':
      sortObj = { price: -1 };
      break;
    case 'popular':
      sortObj = { soldCount: -1 };
      break;
    case 'newest':
    default:
      sortObj = { createdAt: -1 };
      break;
  }

  // Search query
  const searchQuery = {
    $or: [
      { name: { $regex: q, $options: 'i' } },
      { description: { $regex: q, $options: 'i' } },
      { tags: { $in: [new RegExp(q, 'i')] } }
    ]
  };

  const [products, total] = await Promise.all([
    Product.find(searchQuery)
      .sort(sortObj)
      .skip(skip)
      .limit(limit)
      .lean(),
    Product.countDocuments(searchQuery)
  ]);

  const totalPages = Math.ceil(total / limit);
  const hasNextPage = page < totalPages;
  const hasPrevPage = page > 1;

  sendSuccess(res, {
    products,
    pagination: {
      page,
      limit,
      total,
      totalPages,
      hasNextPage,
      hasPrevPage,
    }
  }, 'Search results retrieved successfully');
});
