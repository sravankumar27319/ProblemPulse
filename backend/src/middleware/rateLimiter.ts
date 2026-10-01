import rateLimit from 'express-rate-limit';
import { Request, Response } from 'express';

const createLimitHandler = (message: string) => (_req: Request, res: Response) => {
  res.status(429).json({
    success: false,
    error: {
      code: 'RATE_LIMIT_EXCEEDED',
      message,
    },
  });
};

/**
 * 1. Global API Limiter
 * Restricts overall request rate across all endpoints to mitigate DoS / scraping.
 * Window: 15 minutes | Max: 300 requests per IP
 */
export const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: process.env.NODE_ENV === 'development' ? 5000 : 300,
  standardHeaders: 'draft-7',
  legacyHeaders: false,
  skip: () => process.env.NODE_ENV === 'development',
  handler: createLimitHandler('Too many requests from this IP. Please try again in 15 minutes.'),
});

/**
 * 2. Authentication Limiter
 * Applied on /api/auth/login and /api/auth/register.
 * Prevents credential brute-forcing, password stuffing, and automated bot accounts.
 * Window: 15 minutes | Max: 15 attempts per IP
 */
export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 15,
  standardHeaders: 'draft-7',
  legacyHeaders: false,
  handler: createLimitHandler('Too many authentication attempts from this IP. Please try again in 15 minutes.'),
});

/**
 * 3. Report Creation Limiter
 * Applied on POST /api/problems.
 * Prevents flooding the municipal database with automated junk or duplicate spam reports.
 * Window: 1 hour | Max: 15 reports per IP
 */
export const reportCreationLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 15,
  standardHeaders: 'draft-7',
  legacyHeaders: false,
  handler: createLimitHandler('Report creation rate limit exceeded. You can submit up to 15 reports per hour.'),
});

/**
 * 4. Support Limiter
 * Applied on POST /api/problems/:id/support.
 * Protects against automated vote brigading, click-farms, and community endorsement distortion.
 * Window: 15 minutes | Max: 60 support actions per IP
 */
export const supportLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 60,
  standardHeaders: 'draft-7',
  legacyHeaders: false,
  handler: createLimitHandler('Support endorsement rate limit exceeded. Please wait a moment before endorsing more issues.'),
});

/**
 * 5. Comment Creation Limiter
 * Applied on POST /api/problems/:id/comments.
 * Prevents comment spamming, harassment flooding, and bot-generated message storms.
 * Window: 15 minutes | Max: 30 comments per IP
 */
export const commentLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 30,
  standardHeaders: 'draft-7',
  legacyHeaders: false,
  handler: createLimitHandler('Comment submission rate limit exceeded. Please wait before posting additional comments.'),
});

/**
 * 6. Media Upload & Signature Limiter
 * Applied on /api/media/signature and /api/media/upload.
 * Protects Cloudinary bandwidth and upload endpoint against asset flooding.
 * Window: 15 minutes | Max: 40 requests per IP
 */
export const mediaLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 40,
  standardHeaders: 'draft-7',
  legacyHeaders: false,
  handler: createLimitHandler('Media upload request limit reached. Please try again in a few minutes.'),
});
