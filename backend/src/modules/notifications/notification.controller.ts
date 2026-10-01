import { Request, Response, NextFunction } from 'express';
import * as notificationService from './notification.service';

export const getNotificationsHandler = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const userId = req.user!.userId;
    const result = await notificationService.getNotifications(userId);

    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
};

export const markAsReadHandler = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const userId = req.user!.userId;
    const notificationId = req.params.id as string;

    const result = await notificationService.markAsRead(userId, notificationId);

    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
};

export const markAllAsReadHandler = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const userId = req.user!.userId;
    const result = await notificationService.markAllAsRead(userId);

    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
};

export const deleteNotificationHandler = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const userId = req.user!.userId;
    const notificationId = req.params.id as string;

    const result = await notificationService.deleteNotification(userId, notificationId);

    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
};
