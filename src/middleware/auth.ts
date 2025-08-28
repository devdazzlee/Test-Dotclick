import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { User } from '../models/User';
import { sendUnauthorized } from '../utils/response';
import { env } from '../config/environment';
import { sendError } from '../utils/response';
import { asyncHandler } from '../middleware/asyncHandler';

export interface AuthRequest extends Request {
  user?: {
    id: string;
    email: string;
    role: string;
  };
}

export const authenticate = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');

    if (!token) {
      sendUnauthorized(res, 'Access denied. No token provided.');
      return;
    }

    const decoded = jwt.verify(token, env.JWT_SECRET) as { id: string };
    const user = await User.findById(decoded.id).select('-password');

    if (!user) {
      sendUnauthorized(res, 'Invalid token. User not found.');
      return;
    }

    req.user = {
      id: (user as any)._id.toString(),
      email: user.email,
      role: user.role,
    };

    next();
  } catch (error) {
    sendUnauthorized(res, 'Invalid token.');
  }
};

export const authorize = (...roles: string[]) => {
  return (req: AuthRequest, res: Response, next: NextFunction): void => {
    if (!req.user) {
      sendUnauthorized(res, 'Access denied. No token provided.');
      return;
    }

    if (!roles.includes(req.user.role)) {
      sendUnauthorized(res, 'Access denied. Insufficient permissions.');
      return;
    }

    next();
  };
};

// Admin authorization middleware
export const requireAdmin = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
  // First check if user is authenticated
  if (!req.user) {
    sendError(res, 'Access denied. Please log in.', 401);
    return;
  }

  // Check if user is admin
  if (req.user.role !== 'admin') {
    sendError(res, 'Access denied. Admin privileges required.', 403);
    return;
  }

  next();
});
