import { Request, Response } from 'express';
import { Product } from '../models/Product';
import { sendSuccess, sendBadRequest, sendNotFound } from '../utils/response';
import { asyncHandler } from '../middleware/asyncHandler';
import { productSchema, paginationSchema } from '../utils/validation';

// Create product (Admin only)
export const createProduct = asyncHandler(async (req: Request, res: Response) => {
  // Validate request body
  const validatedData = productSchema.parse(req.body);

  // Check if product with same slug exists
  const existingProduct = await Product.findOne({ slug: validatedData.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '') });
  
  if (existingProduct) {
    sendBadRequest(res, 'Product with this name already exists');
    return;
  }

  // Create new product
  const product = new Product({
    ...validatedData,
    images: Array.isArray(req.files) ? req.files.map((file: any) => file.path) : validatedData.images,
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
    product.images = req.files.map((file: any) => file.path);
  }

  await product.save();

  sendSuccess(res, { product }, 'Product updated successfully');
});

// Delete product (Admin only)
export const deleteProduct = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;

  const product = await Product.findByIdAndDelete(id);

  if (!product) {
    sendNotFound(res, 'Product not found');
    return;
  }

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
