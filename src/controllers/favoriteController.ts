import { Response } from 'express';
import { Favorite } from '../models/Favorite';
import { Product } from '../models/Product';
import { sendSuccess, sendBadRequest, sendNotFound } from '../utils/response';
import { asyncHandler } from '../middleware/asyncHandler';
import { AuthRequest } from '../middleware/auth';

// Add product to favorites
export const addToFavorites = asyncHandler(async (req: AuthRequest, res: Response) => {
  const userId = req.user?.id;
  const { productId } = req.body;

  if (!productId) {
    sendBadRequest(res, 'Product ID is required');
    return;
  }

  // Check if product exists
  const product = await Product.findById(productId);
  if (!product) {
    sendNotFound(res, 'Product not found');
    return;
  }

  // Check if already in favorites
  const existingFavorite = await Favorite.findOne({ user: userId, product: productId });
  if (existingFavorite) {
    sendBadRequest(res, 'Product is already in favorites');
    return;
  }

  // Add to favorites
  const favorite = new Favorite({
    user: userId,
    product: productId,
  });

  await favorite.save();

  // Populate product details
  await favorite.populate({
    path: 'product',
    select: 'name price images description tags'
  });

  sendSuccess(res, { favorite }, 'Product added to favorites successfully');
});

// Remove product from favorites
export const removeFromFavorites = asyncHandler(async (req: AuthRequest, res: Response) => {
  const userId = req.user?.id;
  const { productId } = req.params;

  const favorite = await Favorite.findOneAndDelete({ user: userId, product: productId });

  if (!favorite) {
    sendNotFound(res, 'Product not found in favorites');
    return;
  }

  sendSuccess(res, null, 'Product removed from favorites successfully');
});

// Get user's favorites
export const getFavorites = asyncHandler(async (req: AuthRequest, res: Response) => {
  const userId = req.user?.id;
  const { page = 1, limit = 12 } = req.query;

  const skip = (Number(page) - 1) * Number(limit);

  const [favorites, total] = await Promise.all([
    Favorite.find({ user: userId })
      .populate({
        path: 'product',
        select: 'name price images description tags inStock totalStock'
      })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(Number(limit)),
    Favorite.countDocuments({ user: userId })
  ]);

  const totalPages = Math.ceil(total / Number(limit));
  const hasNextPage = Number(page) < totalPages;
  const hasPrevPage = Number(page) > 1;

  sendSuccess(res, {
    favorites,
    pagination: {
      page: Number(page),
      limit: Number(limit),
      total,
      totalPages,
      hasNextPage,
      hasPrevPage,
    }
  }, 'Favorites retrieved successfully');
});

// Check if product is in favorites
export const checkFavoriteStatus = asyncHandler(async (req: AuthRequest, res: Response) => {
  const userId = req.user?.id;
  const { productId } = req.params;

  const favorite = await Favorite.findOne({ user: userId, product: productId });

  sendSuccess(res, { 
    isFavorite: !!favorite,
    favoriteId: favorite?._id 
  }, 'Favorite status checked successfully');
});
