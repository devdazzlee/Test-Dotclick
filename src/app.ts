import express, { Application } from 'express';
import cors from 'cors';
import path from 'path';
import { env } from './config/environment';
import { connectDatabase } from './config/database';
import routes from './routes';
import { logger } from './middleware/logger';
import { errorHandler } from './middleware/errorHandler';

// Initialize middlewares
const initializeMiddlewares = (app: Application): void => {
  // CORS configuration
  app.use(cors({
    origin: env.NODE_ENV === 'production' 
      ? ['https://yourdomain.com'] // Add your production domain
      : ['http://localhost:3000', 'http://localhost:3001'],
    credentials: true,
  }));

  // Body parsing middleware
  app.use(express.json({ limit: '10mb' }));
  app.use(express.urlencoded({ extended: true, limit: '10mb' }));

  // Static file serving for uploads (only in development)
  if (env.NODE_ENV !== 'production') {
    app.use('/uploads', express.static(path.join(__dirname, '../uploads')));
  }

  // Request logging
  app.use(logger);

  // Security headers
  app.use((_req, res, next) => {
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('X-Frame-Options', 'DENY');
    res.setHeader('X-XSS-Protection', '1; mode=block');
    res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
    next();
  });
};

// Initialize routes
const initializeRoutes = (app: Application): void => {
  // Root endpoint
  app.get('/', (_req, res) => {
    res.json({
      message: 'Welcome to the Ecommerce API',
      version: '1.0.0',
      environment: env.NODE_ENV,
      timestamp: new Date().toISOString(),
      endpoints: {
        auth: `${env.API_PREFIX}/auth`,
        products: `${env.API_PREFIX}/products`,
        cart: `${env.API_PREFIX}/cart`,
        orders: `${env.API_PREFIX}/orders`,
        favorites: `${env.API_PREFIX}/favorites`,
      }
    });
  });

  // API routes
  app.use(env.API_PREFIX, routes);
};

// Initialize error handling
const initializeErrorHandling = (app: Application): void => {
  // 404 handler - must be before error handler
  app.use((req, res, _next) => {
    res.status(404).json({
      success: false,
      message: 'Route not found',
      error: `Cannot ${req.method} ${req.originalUrl}`,
      timestamp: new Date().toISOString(),
      path: req.originalUrl,
    });
  });

  // Global error handler
  app.use(errorHandler);
};

// Create and configure Express app
const createApp = async (): Promise<Application> => {
  const app = express();
  
  // Connect to database
  await connectDatabase();
  
  initializeMiddlewares(app);
  initializeRoutes(app);
  initializeErrorHandling(app);
  
  return app;
};

// Create app instance for testing (without starting server)
let appInstance: Application | null = null;

const getApp = async (): Promise<Application> => {
  if (!appInstance) {
    appInstance = await createApp();
  }
  return appInstance;
};

// Start server
const startServer = (app: Application): void => {
  app.listen(env.PORT, () => {
    console.log(`🚀 Server running on port ${env.PORT}`);
    console.log(`📊 Environment: ${env.NODE_ENV}`);
    console.log(`🔗 API Base URL: http://localhost:${env.PORT}${env.API_PREFIX}`);
    console.log(`🏥 Health Check: http://localhost:${env.PORT}${env.API_PREFIX}/health`);
    if (env.NODE_ENV !== 'production') {
      console.log(`📁 Uploads: http://localhost:${env.PORT}/uploads`);
    }
  });
};

export { createApp, startServer, getApp };
