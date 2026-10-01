import express, { Express, Request, Response } from 'express';
import helmet from 'helmet';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import { config } from './config/env';
import { errorHandler } from './middleware/errorHandler';
import { apiLimiter } from './middleware/rateLimiter';
import authRoutes from './modules/auth/auth.routes';
import problemRoutes from './modules/problems/problem.routes';
import mediaRoutes from './modules/media/media.routes';
import notificationRoutes from './modules/notifications/notification.routes';
import adminRoutes from './modules/admin/admin.routes';

const app: Express = express();

app.set('trust proxy', 1);

// Phase 27 — Helmet Security Headers
app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        scriptSrc: ["'self'", "'unsafe-inline'"],
        connectSrc: [
          "'self'",
          config.frontendUrl,
          'http://localhost:3000',
          'http://127.0.0.1:3000',
          'https://api.cloudinary.com',
          'https://*.tile.openstreetmap.org',
          'https://*.vercel.app',
        ],
        imgSrc: [
          "'self'",
          'data:',
          'blob:',
          'https://res.cloudinary.com',
          'https://images.unsplash.com',
          'https://*.tile.openstreetmap.org',
        ],
        fontSrc: ["'self'", 'https://fonts.gstatic.com'],
        objectSrc: ["'none'"],
        mediaSrc: ["'self'", 'https://res.cloudinary.com'],
      },
    },
    crossOriginResourcePolicy: { policy: 'cross-origin' },
    crossOriginEmbedderPolicy: false,
  })
);

// Phase 27 — Strict Whitelist CORS Policy
const configuredOrigins = config.frontendUrl
  ? config.frontendUrl.split(',').map((u) => u.trim())
  : [];

const allowedOrigins = [
  ...configuredOrigins,
  'http://localhost:3000',
  'http://127.0.0.1:3000',
].filter(Boolean);

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (e.g. mobile apps, curl, server-to-server) or matching origins
      if (
        !origin ||
        allowedOrigins.includes(origin) ||
        origin.endsWith('.vercel.app')
      ) {
        callback(null, true);
      } else {
        callback(new Error(`Origin ${origin} not allowed by CORS security policy`));
      }
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept'],
  })
);

app.use(cookieParser());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Phase 27 — Global API Rate Limiting
app.use('/api', apiLimiter);

// Health Check Route
app.get('/api/health', (_req: Request, res: Response) => {
  res.status(200).json({
    status: 'ok',
    service: 'ProblemPulse Backend API',
    timestamp: new Date().toISOString(),
    environment: config.nodeEnv,
  });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/problems', problemRoutes);
app.use('/api/media', mediaRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/admin', adminRoutes);

// 404 Handler
app.use((_req: Request, res: Response) => {
  res.status(404).json({
    success: false,
    error: {
      message: 'Resource not found',
    },
  });
});

// Global Error Handler
app.use(errorHandler);

export default app;
