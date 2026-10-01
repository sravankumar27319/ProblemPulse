import jwt from 'jsonwebtoken';
import { Response } from 'express';
import { config } from '../config/env';
import { AuthUserPayload } from '../types/express';

export const generateToken = (payload: AuthUserPayload): string => {
  return jwt.sign(payload, config.jwtSecret, {
    expiresIn: config.jwtExpiresIn as jwt.SignOptions['expiresIn'],
  });
};

export const verifyToken = (token: string): AuthUserPayload | null => {
  try {
    return jwt.verify(token, config.jwtSecret) as AuthUserPayload;
  } catch {
    return null;
  }
};

export const setAuthCookie = (res: Response, token: string): void => {
  res.cookie('token', token, {
    httpOnly: true,
    secure: config.nodeEnv === 'production',
    sameSite: 'lax',
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
  });
};

export const clearAuthCookie = (res: Response): void => {
  res.cookie('token', '', {
    httpOnly: true,
    expires: new Date(0),
  });
};
