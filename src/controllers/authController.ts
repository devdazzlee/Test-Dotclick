import { Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import { User } from '../models/User';
import { sendSuccess, sendBadRequest, sendError } from '../utils/response';
import { asyncHandler } from '../middleware/asyncHandler';
import { registerSchema, registerWithRoleSchema, loginSchema } from '../utils/validation';
import { env } from '../config/environment';

// Generate JWT token
const generateToken = (id: string): string => {
  if (!env.JWT_SECRET) {
    throw new Error('JWT_SECRET is not configured');
  }
  return jwt.sign({ id }, env.JWT_SECRET as string, {
    expiresIn: env.JWT_EXPIRES_IN as string,
  } as any);
};

// Register user
export const register = asyncHandler(async (req: Request, res: Response) => {
  // Validate request body
  const validatedData = registerSchema.parse(req.body);

  // Check if user already exists
  const existingUser = await User.findOne({
    $or: [{ email: validatedData.email }, { phone: validatedData.phone }]
  });

  if (existingUser) {
    if (existingUser.email === validatedData.email) {
      sendBadRequest(res, 'Email already registered');
      return;
    }
    if (existingUser.phone === validatedData.phone) {
      sendBadRequest(res, 'Phone number already registered');
      return;
    }
  }

  // Create new user
  const user = new User({
    username: validatedData.username,
    email: validatedData.email,
    password: validatedData.password,
    phone: validatedData.phone,
    profileImage: req.file?.path || null,
  });

  await user.save();

  // Generate token
  const token = generateToken((user._id as string).toString());

  // Remove password from response
  const userResponse = {
    id: user._id as string,
    username: user.username,
    email: user.email,
    phone: user.phone,
    profileImage: user.profileImage,
    role: user.role,
    createdAt: user.createdAt,
  };

  sendSuccess(res, { user: userResponse, token }, 'User registered successfully', 201);
});

// Register user with role
export const registerWithRole = asyncHandler(async (req: Request, res: Response) => {
  // Validate request body
  const validatedData = registerWithRoleSchema.parse(req.body);

  // Check if user already exists
  const existingUser = await User.findOne({
    $or: [{ email: validatedData.email }, { phone: validatedData.phone }]
  });

  if (existingUser) {
    if (existingUser.email === validatedData.email) {
      sendBadRequest(res, 'Email already registered');
      return;
    }
    if (existingUser.phone === validatedData.phone) {
      sendBadRequest(res, 'Phone number already registered');
      return;
    }
  }

  // Create new user with specified role
  const user = new User({
    username: validatedData.username,
    email: validatedData.email,
    password: validatedData.password,
    phone: validatedData.phone,
    profileImage: req.file?.path || null,
    role: validatedData.role,
  });

  await user.save();

  // Generate token
  const token = generateToken((user as any)._id.toString());

  // Remove password from response
  const userResponse = {
    id: (user as any)._id,
    username: user.username,
    email: user.email,
    phone: user.phone,
    profileImage: user.profileImage,
    role: user.role,
    createdAt: user.createdAt,
  };

  sendSuccess(res, { user: userResponse, token }, `${user.role} registered successfully`, 201);
});

// Register admin user (convenience function)
export const registerAdmin = asyncHandler(async (req: Request, res: Response) => {
  // Set role to admin in request body
  req.body.role = 'admin';
  
  // Call registerWithRole logic directly
  const validatedData = registerWithRoleSchema.parse(req.body);

  // Check if user already exists
  const existingUser = await User.findOne({
    $or: [{ email: validatedData.email }, { phone: validatedData.phone }]
  });

  if (existingUser) {
    if (existingUser.email === validatedData.email) {
      sendBadRequest(res, 'Email already registered');
      return;
    }
    if (existingUser.phone === validatedData.phone) {
      sendBadRequest(res, 'Phone number already registered');
      return;
    }
  }

  // Create new user with specified role
  const user = new User({
    username: validatedData.username,
    email: validatedData.email,
    password: validatedData.password,
    phone: validatedData.phone,
    profileImage: req.file?.path || null,
    role: validatedData.role,
  });

  await user.save();

  // Generate token
  const token = generateToken((user as any)._id.toString());

  // Remove password from response
  const userResponse = {
    id: (user as any)._id,
    username: user.username,
    email: user.email,
    phone: user.phone,
    profileImage: user.profileImage,
    role: user.role,
    createdAt: user.createdAt,
  };

  sendSuccess(res, { user: userResponse, token }, `${user.role} registered successfully`, 201);
});

// Login user
export const login = asyncHandler(async (req: Request, res: Response) => {
  // Validate request body
  const validatedData = loginSchema.parse(req.body);

  // Find user by email
  const user = await User.findOne({ email: validatedData.email });

  if (!user) {
    sendBadRequest(res, 'Invalid email or password');
    return;
  }

  // Check password
  const isPasswordValid = await user.comparePassword(validatedData.password);

  if (!isPasswordValid) {
    sendBadRequest(res, 'Invalid email or password');
    return;
  }

  // Generate token
  const token = generateToken((user as any)._id.toString());

  // Remove password from response
  const userResponse = {
    id: (user as any)._id,
    username: user.username,
    email: user.email,
    phone: user.phone,
    profileImage: user.profileImage,
    role: user.role,
    createdAt: user.createdAt,
  };

  sendSuccess(res, { user: userResponse, token }, 'Login successful');
});

// Get current user profile
export const getProfile = asyncHandler(async (req: Request, res: Response) => {
  const user = await User.findById(req.user?.id).select('-password');

  if (!user) {
    sendError(res, 'User not found', 404);
    return;
  }

  sendSuccess(res, { user }, 'Profile retrieved successfully');
});

// Update user profile
export const updateProfile = asyncHandler(async (req: Request, res: Response) => {
  const { username, phone } = req.body;

  const user = await User.findById(req.user?.id);

  if (!user) {
    sendError(res, 'User not found', 404);
    return;
  }

  // Update fields
  if (username) user.username = username;
  if (phone) user.phone = phone;
  if (req.file?.path) user.profileImage = req.file.path;

  await user.save();

  // Remove password from response
  const userResponse = {
    id: user._id,
    username: user.username,
    email: user.email,
    phone: user.phone,
    profileImage: user.profileImage,
    role: user.role,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
  };

  sendSuccess(res, { user: userResponse }, 'Profile updated successfully');
});
