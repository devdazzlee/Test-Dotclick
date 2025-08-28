import { Request, Response } from 'express';
import Stripe from 'stripe';
import { Cart } from '../models/Cart';
import { Order } from '../models/Order';
import { Product } from '../models/Product';
import { sendSuccess, sendBadRequest, sendError, sendNotFound } from '../utils/response';
import { asyncHandler } from '../middleware/asyncHandler';
import { orderSchema } from '../utils/validation';
import { AuthRequest } from '../middleware/auth';
import { env } from '../config/environment';

// Initialize Stripe conditionally
let stripe: Stripe | null = null;
if (env.STRIPE_SECRET_KEY) {
  stripe = new Stripe(env.STRIPE_SECRET_KEY, {
    apiVersion: '2025-08-27.basil' as any,
  });
}

// Create checkout session
export const createCheckoutSession = asyncHandler(async (req: AuthRequest, res: Response) => {
  if (!stripe) {
    sendError(res, 'Stripe is not configured', 500);
    return;
  }

  const userId = req.user?.id;
  
  // Validate request body
  const validatedData = orderSchema.parse(req.body);
  const { shippingAddress, paymentMethod } = validatedData;

  // Get user's cart
  const cart = await Cart.findOne({ user: userId }).populate({
    path: 'items.product',
    select: 'name price images inStock totalStock'
  });

  if (!cart || cart.items.length === 0) {
    sendBadRequest(res, 'Cart is empty');
    return;
  }

  // Validate stock and calculate total
  const orderItems = [];
  let totalAmount = 0;

  for (const item of cart.items) {
    const product = item.product as any;
    
    if (!product.inStock || product.totalStock < item.quantity) {
      sendBadRequest(res, `Product ${product.name} is out of stock or insufficient quantity`);
      return;
    }

    const itemTotal = product.price * item.quantity;
    totalAmount += itemTotal;

    orderItems.push({
      product: item.product,
      quantity: item.quantity,
      price: product.price,
      colour: item.colour,
      size: item.size,
    });
  }

  // Create Stripe checkout session
  const session = await stripe.checkout.sessions.create({
    payment_method_types: ['card'] as any,
    line_items: cart.items.map((item: any) => ({
      price_data: {
        currency: 'usd',
        product_data: {
          name: item.product.name,
          images: item.product.images,
        },
        unit_amount: Math.round(item.product.price * 100), // Convert to cents
      },
      quantity: item.quantity,
    })) as any,
    mode: 'payment' as any,
    success_url: `${req.protocol}://${req.get('host')}/api/v1/orders/success?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${req.protocol}://${req.get('host')}/api/v1/orders/cancel`,
    metadata: {
      userId,
      shippingAddress: JSON.stringify(shippingAddress),
      paymentMethod,
    },
  } as any);

  // Create order
  const order = new Order({
    user: userId,
    items: orderItems,
    totalAmount,
    shippingAddress,
    paymentMethod,
    stripePaymentIntentId: session.payment_intent as string,
  });

  await order.save();

  sendSuccess(res, { 
    sessionId: session.id,
    sessionUrl: session.url,
    order: order
  }, 'Checkout session created successfully');
});

// Handle successful payment
export const handlePaymentSuccess = asyncHandler(async (req: Request, res: Response) => {
  if (!stripe) {
    sendError(res, 'Stripe is not configured', 500);
    return;
  }

  const { session_id } = req.query;

  if (!session_id) {
    sendBadRequest(res, 'Session ID is required');
    return;
  }

  const session = await stripe.checkout.sessions.retrieve(session_id as string);

  if (session.payment_status === 'paid') {
    // Update order status
    const order = await Order.findOne({ stripePaymentIntentId: session.payment_intent });
    
    if (order) {
      order.paymentStatus = 'completed';
      order.status = 'processing';
      await order.save();

      // Update product stock
      for (const item of order.items) {
        await Product.findByIdAndUpdate(item.product, {
          $inc: { 
            totalStock: -item.quantity,
            soldCount: item.quantity
          }
        });
      }

      // Clear user's cart
      await Cart.findOneAndUpdate(
        { user: order.user },
        { items: [], totalAmount: 0 }
      );
    }
  }

  sendSuccess(res, { 
    message: 'Payment successful! Your order has been placed.',
    orderId: session.metadata?.['orderId'] 
  }, 'Payment completed successfully');
});

// Get user's orders
export const getUserOrders = asyncHandler(async (req: AuthRequest, res: Response) => {
  const userId = req.user?.id;

  const orders = await Order.find({ user: userId })
    .populate({
      path: 'items.product',
      select: 'name price images'
    })
    .sort({ createdAt: -1 });

  sendSuccess(res, { orders }, 'Orders retrieved successfully');
});

// Get order by ID
export const getOrderById = asyncHandler(async (req: AuthRequest, res: Response) => {
  const userId = req.user?.id;
  const { orderId } = req.params;

  const order = await Order.findOne({ _id: orderId, user: userId })
    .populate({
      path: 'items.product',
      select: 'name price images'
    });

  if (!order) {
    sendNotFound(res, 'Order not found');
    return;
  }

  sendSuccess(res, { order }, 'Order retrieved successfully');
});

// Get all orders (Admin only)
export const getAllOrders = asyncHandler(async (req: Request, res: Response) => {
  const { page = 1, limit = 10, status } = req.query;

  const filter: any = {};
  if (status) filter.status = status;

  const skip = (Number(page) - 1) * Number(limit);

  const [orders, total] = await Promise.all([
    Order.find(filter)
      .populate({
        path: 'user',
        select: 'username email'
      })
      .populate({
        path: 'items.product',
        select: 'name price images'
      })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(Number(limit)),
    Order.countDocuments(filter)
  ]);

  const totalPages = Math.ceil(total / Number(limit));

  sendSuccess(res, {
    orders,
    pagination: {
      page: Number(page),
      limit: Number(limit),
      total,
      totalPages,
    }
  }, 'Orders retrieved successfully');
});

// Update order status (Admin only)
export const updateOrderStatus = asyncHandler(async (req: Request, res: Response) => {
  const { orderId } = req.params;
  const { status } = req.body;

  const validStatuses = ['pending', 'processing', 'shipped', 'delivered', 'cancelled'];
  
  if (!validStatuses.includes(status)) {
    sendBadRequest(res, 'Invalid order status');
    return;
  }

  const order = await Order.findByIdAndUpdate(
    orderId,
    { status },
    { new: true }
  ).populate({
    path: 'user',
    select: 'username email'
  }).populate({
    path: 'items.product',
    select: 'name price images'
  });

  if (!order) {
    sendNotFound(res, 'Order not found');
    return;
  }

  sendSuccess(res, { order }, 'Order status updated successfully');
});
