import { Response } from 'express';
import mongoose from 'mongoose';
import { Cart } from '../models/Cart';
import { Product } from '../models/Product';
import { sendSuccess, sendBadRequest, sendNotFound } from '../utils/response';
import { asyncHandler } from '../middleware/asyncHandler';
import { cartItemSchema } from '../utils/validation';
import { AuthRequest } from '../middleware/auth';

// Get user's cart
export const getCart = asyncHandler(async (req: AuthRequest, res: Response) => {
  const userId = req.user?.id;

  let cart = await Cart.findOne({ user: userId }).populate({
    path: 'items.product',
    select: 'name price images inStock totalStock'
  });

  if (!cart) {
    // Create empty cart if it doesn't exist
    cart = new Cart({ user: userId, items: [], totalAmount: 0 });
    await cart.save();
  }

  sendSuccess(res, { cart }, 'Cart retrieved successfully');
});

// Add item to cart
export const addToCart = asyncHandler(async (req: AuthRequest, res: Response) => {
  const userId = req.user?.id;
  
  // Validate request body
  const validatedData = cartItemSchema.parse(req.body);
  const { productId, quantity, colour, size } = validatedData;

  // Check if product exists and is in stock
  const product = await Product.findById(productId);
  if (!product) {
    sendNotFound(res, 'Product not found');
    return;
  }

  if (!product.inStock || product.totalStock < quantity) {
    sendBadRequest(res, 'Product is out of stock or insufficient quantity');
    return;
  }

  // Get or create user's cart
  let cart = await Cart.findOne({ user: userId });
  if (!cart) {
    cart = new Cart({ user: userId, items: [], totalAmount: 0 });
  }

  // Check if product variant already exists in cart
  const existingItemIndex = cart.items.findIndex(
    item => 
      item.product.toString() === productId && 
      item.colour === colour && 
      item.size === size
  );

  if (existingItemIndex !== -1) {
    // Update quantity if product variant already exists
    if (cart.items[existingItemIndex]) {
      cart.items[existingItemIndex].quantity += quantity;
    }
  } else {
    // Add new item to cart
    cart.items.push({
      product: new mongoose.Types.ObjectId(productId),
      quantity,
      colour,
      size,
    });
  }

  await cart.save();

  // Populate product details
  await cart.populate({
    path: 'items.product',
    select: 'name price images inStock totalStock'
  });

  sendSuccess(res, { cart }, 'Item added to cart successfully');
});

// Update cart item quantity
export const updateCartItem = asyncHandler(async (req: AuthRequest, res: Response) => {
  const userId = req.user?.id;
  const { itemId } = req.params;
  const { quantity } = req.body;

  if (!quantity || quantity < 1) {
    sendBadRequest(res, 'Quantity must be at least 1');
    return;
  }

  const cart = await Cart.findOne({ user: userId });
  if (!cart) {
    sendNotFound(res, 'Cart not found');
    return;
  }

  const itemIndex = cart.items.findIndex(item => (item as any)._id?.toString() === itemId);
  if (itemIndex === -1) {
    sendNotFound(res, 'Cart item not found');
    return;
  }

  // Check if product is still in stock
  const item = cart.items[itemIndex];
  if (!item) {
    sendNotFound(res, 'Cart item not found');
    return;
  }
  
  const product = await Product.findById(item.product);
  if (!product || !product.inStock || product.totalStock < quantity) {
    sendBadRequest(res, 'Product is out of stock or insufficient quantity');
    return;
  }

  item.quantity = quantity;
  await cart.save();

  await cart.populate({
    path: 'items.product',
    select: 'name price images inStock totalStock'
  });

  sendSuccess(res, { cart }, 'Cart item updated successfully');
});

// Remove item from cart
export const removeFromCart = asyncHandler(async (req: AuthRequest, res: Response) => {
  const userId = req.user?.id;
  const { itemId } = req.params;

  const cart = await Cart.findOne({ user: userId });
  if (!cart) {
    sendNotFound(res, 'Cart not found');
    return;
  }

  const itemIndex = cart.items.findIndex(item => (item as any)._id?.toString() === itemId);
  if (itemIndex === -1) {
    sendNotFound(res, 'Cart item not found');
    return;
  }

  cart.items.splice(itemIndex, 1);
  await cart.save();

  await cart.populate({
    path: 'items.product',
    select: 'name price images inStock totalStock'
  });

  sendSuccess(res, { cart }, 'Item removed from cart successfully');
});

// Clear cart
export const clearCart = asyncHandler(async (req: AuthRequest, res: Response) => {
  const userId = req.user?.id;

  const cart = await Cart.findOne({ user: userId });
  if (!cart) {
    sendNotFound(res, 'Cart not found');
    return;
  }

  cart.items = [];
  await cart.save();

  sendSuccess(res, { cart }, 'Cart cleared successfully');
});

// Get cart count
export const getCartCount = asyncHandler(async (req: AuthRequest, res: Response) => {
  const userId = req.user?.id;

  const cart = await Cart.findOne({ user: userId });
  const itemCount = cart ? cart.items.reduce((total, item) => total + item.quantity, 0) : 0;

  sendSuccess(res, { itemCount }, 'Cart count retrieved successfully');
});
