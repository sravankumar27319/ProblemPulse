import { Request, Response, NextFunction } from 'express';
import {
  getProblemsQuerySchema,
  getMapQuerySchema,
  createProblemSchema,
  checkDuplicatesQuerySchema,
  createCommentSchema,
} from './problem.schema';
import * as problemService from './problem.service';
import * as verificationService from './verification.service';
import { verifyToken } from '../../utils/token';

export const getProblemsHandler = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const queryInput = getProblemsQuerySchema.parse(req.query);

    let currentUserId: string | undefined = req.user?.userId;
    if (!currentUserId && req.cookies?.token) {
      const payload = verifyToken(req.cookies.token);
      if (payload) currentUserId = payload.userId;
    }
    if (!currentUserId && req.headers.authorization?.startsWith('Bearer ')) {
      const token = req.headers.authorization.split(' ')[1];
      const payload = verifyToken(token);
      if (payload) currentUserId = payload.userId;
    }

    const result = await problemService.getProblems(queryInput, currentUserId);

    res.status(200).json({
      success: true,
      ...result,
    });
  } catch (error) {
    next(error);
  }
};

export const getMapProblemsHandler = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const queryInput = getMapQuerySchema.parse(req.query);
    const markers = await problemService.getMapProblems(queryInput);

    res.status(200).json({
      success: true,
      count: markers.length,
      markers,
    });
  } catch (error) {
    next(error);
  }
};

export const checkDuplicatesHandler = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const queryInput = checkDuplicatesQuerySchema.parse(req.query);
    const duplicates = await problemService.checkDuplicates(queryInput);

    res.status(200).json({
      success: true,
      count: duplicates.length,
      hasDuplicates: duplicates.length > 0,
      duplicates,
    });
  } catch (error) {
    next(error);
  }
};

export const getProblemByIdHandler = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const id = req.params.id as string;

    // Optional user token extraction for viewing support status
    let currentUserId: string | undefined = req.user?.userId;
    if (!currentUserId && req.cookies?.token) {
      const payload = verifyToken(req.cookies.token);
      if (payload) currentUserId = payload.userId;
    }

    const problem = await problemService.getProblemById(id, currentUserId);

    res.status(200).json({
      success: true,
      problem,
    });
  } catch (error) {
    next(error);
  }
};

export const createProblemHandler = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const userId = req.user!.userId;
    const validatedInput = createProblemSchema.parse(req.body);

    const problem = await problemService.createProblem(validatedInput, userId);

    res.status(201).json({
      success: true,
      message: validatedInput.existingProblemId
        ? 'Report linked to existing problem successfully'
        : 'Problem reported successfully',
      problem,
    });
  } catch (error) {
    next(error);
  }
};

export const addSupportHandler = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const userId = req.user!.userId;
    const problemId = req.params.id as string;

    const result = await problemService.addSupport(problemId, userId);

    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
};

export const removeSupportHandler = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const userId = req.user!.userId;
    const problemId = req.params.id as string;

    const result = await problemService.removeSupport(problemId, userId);

    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
};

export const getCommentsHandler = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const problemId = req.params.id as string;
    const result = await problemService.getComments(problemId);

    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
};

export const createCommentHandler = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const userId = req.user!.userId;
    const problemId = req.params.id as string;
    const validated = createCommentSchema.parse(req.body);

    const result = await problemService.createComment(problemId, userId, validated.content);

    res.status(201).json(result);
  } catch (error) {
    next(error);
  }
};

export const flagCommentHandler = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const problemId = req.params.id as string;
    const commentId = req.params.commentId as string;

    const result = await problemService.flagComment(problemId, commentId);

    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
};

export const getUserActivityHandler = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const userId = req.user!.userId;
    const result = await problemService.getUserActivity(userId);

    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
};

export const getProblemVerificationHandler = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const problemId = req.params.id as string;

    let currentUserId: string | undefined = req.user?.userId;
    if (!currentUserId && req.cookies?.token) {
      const payload = verifyToken(req.cookies.token);
      if (payload) currentUserId = payload.userId;
    }

    const data = await verificationService.getProblemVerification(problemId, currentUserId);

    res.status(200).json({
      success: true,
      data,
    });
  } catch (error) {
    next(error);
  }
};

export const castVerificationVoteHandler = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const problemId = req.params.id as string;
    const userId = req.user!.userId;
    const { isFixed, comment } = req.body;

    if (typeof isFixed !== 'boolean') {
      res.status(400).json({
        success: false,
        message: 'Vote requires a boolean isFixed value (true for fixed, false for problem remains)',
      });
      return;
    }

    const data = await verificationService.castVerificationVote(problemId, userId, {
      isFixed,
      comment,
    });

    res.status(200).json({
      success: true,
      message: isFixed
        ? 'Thank you! You verified this municipal resolution as fixed.'
        : 'Thank you! Your feedback that the problem remains has been recorded.',
      data,
    });
  } catch (error) {
    next(error);
  }
};



