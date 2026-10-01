import { Request, Response, NextFunction } from 'express';
import { verifyToken } from '../utils/token';

export const authenticateUser = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  let token: string | undefined = req.cookies?.token;

  if (!token && req.headers.authorization?.startsWith('Bearer ')) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    res.status(401).json({
      success: false,
      error: { message: 'Authentication required. Please log in.' },
    });
    return;
  }

  const payload = verifyToken(token);
  if (!payload) {
    res.status(401).json({
      success: false,
      error: { message: 'Invalid or expired session token. Please log in again.' },
    });
    return;
  }

  req.user = payload;
  next();
};

export const authorizeUser = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  if (!req.user) {
    res.status(401).json({
      success: false,
      error: { message: 'Authentication required.' },
    });
    return;
  }
  next();
};

export const authorizeAdmin = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  if (!req.user) {
    res.status(401).json({
      success: false,
      error: { message: 'Authentication required.' },
    });
    return;
  }

  if (req.user.role !== 'ADMIN') {
    res.status(403).json({
      success: false,
      error: { message: 'Forbidden. Admin privileges required.' },
    });
    return;
  }

  next();
};
