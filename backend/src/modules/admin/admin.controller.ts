import { Request, Response, NextFunction } from 'express';
import * as adminService from './admin.service';

export const getDashboardHandler = async (
  _req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const data = await adminService.getDashboardStats();

    res.status(200).json({
      success: true,
      data,
    });
  } catch (error) {
    next(error);
  }
};

export const getAdminProblemsHandler = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const result = await adminService.getAdminProblems({
      page: req.query.page ? Number(req.query.page) : undefined,
      limit: req.query.limit ? Number(req.query.limit) : undefined,
      priority: req.query.priority as any,
      status: req.query.status as any,
      category: req.query.category as any,
      area: req.query.area as string,
      date: req.query.date as string,
      startDate: req.query.startDate as string,
      endDate: req.query.endDate as string,
      search: req.query.search as string,
      sort: req.query.sort as any,
    });

    res.status(200).json({
      success: true,
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

export const getAdminProblemDetailHandler = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const id = req.params.id as string;
    const data = await adminService.getAdminProblemDetail(id);

    res.status(200).json({
      success: true,
      data,
    });
  } catch (error) {
    next(error);
  }
};

export const verifyProblemHandler = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const id = req.params.id as string;
    const actorId = req.user?.userId || 'admin';
    const { note, adminPriority } = req.body;

    const data = await adminService.verifyProblem(id, actorId, {
      note,
      adminPriority,
    });

    res.status(200).json({
      success: true,
      message: 'Problem verified successfully',
      data,
    });
  } catch (error) {
    next(error);
  }
};

export const rejectProblemHandler = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const id = req.params.id as string;
    const actorId = req.user?.userId || 'admin';
    const { reason } = req.body;

    const data = await adminService.rejectProblem(id, actorId, reason);

    res.status(200).json({
      success: true,
      message: 'Problem rejected successfully',
      data,
    });
  } catch (error) {
    next(error);
  }
};

export const markDuplicateHandler = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const id = req.params.id as string;
    const actorId = req.user?.userId || 'admin';
    const { canonicalProblemId, note } = req.body;

    const data = await adminService.markProblemDuplicate(
      id,
      actorId,
      canonicalProblemId,
      note
    );

    res.status(200).json({
      success: true,
      message: 'Problem marked as duplicate and report count merged',
      data,
    });
  } catch (error) {
    next(error);
  }
};

export const getDepartmentsHandler = async (
  _req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const departments = await adminService.getDepartments();

    res.status(200).json({
      success: true,
      data: departments,
    });
  } catch (error) {
    next(error);
  }
};

export const assignProblemHandler = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const id = req.params.id as string;
    const actorId = req.user?.userId || 'admin';
    const { departmentId, zone, team, note } = req.body;

    const data = await adminService.assignProblem(id, actorId, {
      departmentId,
      zone,
      team,
      note,
    });

    res.status(200).json({
      success: true,
      message: 'Problem successfully assigned to department',
      data,
    });
  } catch (error) {
    next(error);
  }
};

export const updateProblemStatusHandler = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const id = req.params.id as string;
    const actorId = req.user?.userId || 'admin';
    const { status, note, departmentId } = req.body;

    const data = await adminService.updateProblemStatus(id, actorId, {
      status,
      note,
      departmentId,
    });

    res.status(200).json({
      success: true,
      message: `Problem status successfully updated to ${status}`,
      data,
    });
  } catch (error) {
    next(error);
  }
};

export const resolveProblemHandler = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const id = req.params.id as string;
    const actorId = req.user?.userId || 'admin';
    const { description, proofMedia } = req.body;

    const data = await adminService.resolveProblem(id, actorId, {
      description,
      proofMedia,
    });

    res.status(200).json({
      success: true,
      message: 'Problem marked as resolved with proof evidence',
      data,
    });
  } catch (error) {
    next(error);
  }
};

export const getAdminAnalyticsHandler = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const range = req.query.range as any;
    const data = await adminService.getAdminAnalytics({ range });

    res.status(200).json({
      success: true,
      data,
    });
  } catch (error) {
    next(error);
  }
};

export const getAdminMapProblemsHandler = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { filter, category, departmentId, bounds, search } = req.query;

    const data = await adminService.getAdminMapProblems({
      filter: (filter as any) || 'ALL',
      category: (category as any) || 'ALL',
      departmentId: (departmentId as any) || 'ALL',
      bounds: bounds as string | undefined,
      search: search as string | undefined,
    });

    res.status(200).json({
      success: true,
      count: data.markers.length,
      counts: data.counts,
      markers: data.markers,
    });
  } catch (error) {
    next(error);
  }
};
