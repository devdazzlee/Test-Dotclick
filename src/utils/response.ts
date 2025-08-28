import { Response } from 'express';
import { SuccessResponse, ErrorResponse } from '../types/api';

// Success response utility
export const sendSuccess = <T>(
  res: Response,
  data: T,
  message: string = 'Success',
  statusCode: number = 200
): Response<SuccessResponse<T>> => {
  const response: SuccessResponse<T> = {
    success: true,
    message,
    data,
    timestamp: new Date().toISOString(),
  };

  return res.status(statusCode).json(response);
};

// Error response utility
export const sendError = (
  res: Response,
  message: string = 'Internal Server Error',
  statusCode: number = 500,
  error?: string,
  path?: string
): Response<ErrorResponse> => {
  const response: ErrorResponse = {
    success: false,
    message,
    error: error || message,
    timestamp: new Date().toISOString(),
    path,
  };

  return res.status(statusCode).json(response);
};

// Not found response utility
export const sendNotFound = (
  res: Response,
  message: string = 'Resource not found',
  path?: string
): Response<ErrorResponse> => {
  return sendError(res, message, 404, message, path);
};

// Bad request response utility
export const sendBadRequest = (
  res: Response,
  message: string = 'Bad request',
  path?: string
): Response<ErrorResponse> => {
  return sendError(res, message, 400, message, path);
};

// Unauthorized response utility
export const sendUnauthorized = (
  res: Response,
  message: string = 'Unauthorized',
  path?: string
): Response<ErrorResponse> => {
  return sendError(res, message, 401, message, path);
};

// Forbidden response utility
export const sendForbidden = (
  res: Response,
  message: string = 'Forbidden',
  path?: string
): Response<ErrorResponse> => {
  return sendError(res, message, 403, message, path);
};
