import { Request, Response } from 'express';
import { sendSuccess } from '../utils/response';
import { asyncHandler } from '../middleware/asyncHandler';

export const healthCheck = asyncHandler(async (_req: Request, res: Response) => {
  const healthData = {
    status: 'OK',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env['NODE_ENV'] || 'development',
    version: process.env['npm_package_version'] || '1.0.0',
  };

  sendSuccess(res, healthData, 'Health check successful');
});

export const readinessCheck = asyncHandler(async (_req: Request, res: Response) => {
  // Add any additional checks here (database, external services, etc.)
  const readinessData = {
    status: 'READY',
    timestamp: new Date().toISOString(),
    services: {
      database: 'OK', // Add actual database check here
      external: 'OK', // Add external service checks here
    },
  };

  sendSuccess(res, readinessData, 'Service is ready');
});
