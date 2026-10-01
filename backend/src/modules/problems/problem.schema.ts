import { z } from 'zod';
import { ProblemCategory, PriorityLevel } from '@prisma/client';

export const getProblemsQuerySchema = z.object({
  page: z.string().optional().transform((val) => (val ? parseInt(val, 10) : 1)),
  limit: z.string().optional().transform((val) => (val ? Math.min(parseInt(val, 10), 50) : 10)),
  category: z
    .string()
    .optional()
    .transform((val) => (val ? (val.toUpperCase() as ProblemCategory) : undefined)),
  priority: z
    .string()
    .optional()
    .transform((val) => (val ? (val.toUpperCase() as PriorityLevel) : undefined)),
  sort: z.enum(['latest', 'most_supported', 'most_reported', 'highest_priority']).optional().default('latest'),
  search: z.string().optional(),
});

export const getMapQuerySchema = z.object({
  bounds: z.string().optional(), // "sw_lat,sw_lng,ne_lat,ne_lng"
  category: z
    .string()
    .optional()
    .transform((val) => (val ? (val.toUpperCase() as ProblemCategory) : undefined)),
  priority: z
    .string()
    .optional()
    .transform((val) => (val ? (val.toUpperCase() as PriorityLevel) : undefined)),
});

export const checkDuplicatesQuerySchema = z.object({
  category: z.nativeEnum(ProblemCategory),
  latitude: z.string().transform((val) => parseFloat(val)),
  longitude: z.string().transform((val) => parseFloat(val)),
  radiusMeters: z
    .string()
    .optional()
    .transform((val) => (val ? parseInt(val, 10) : 100)),
});

export const createProblemSchema = z.object({
  title: z
    .string()
    .min(5, 'Title must be at least 5 characters long')
    .max(150, 'Title cannot exceed 150 characters')
    .trim(),
  description: z
    .string()
    .min(10, 'Description must be at least 10 characters long')
    .max(2000, 'Description cannot exceed 2000 characters')
    .trim(),
  category: z.nativeEnum(ProblemCategory, {
    message: 'Please select a valid problem category',
  }),
  severity: z
    .number()
    .int()
    .min(1, 'Severity must be between 1 and 10')
    .max(10, 'Severity must be between 1 and 10')
    .default(5),
  peopleAffected: z
    .number()
    .int()
    .min(1, 'People affected must be at least 1')
    .default(1),
  latitude: z
    .number()
    .min(-90, 'Latitude must be between -90 and 90')
    .max(90, 'Latitude must be between -90 and 90'),
  longitude: z
    .number()
    .min(-180, 'Longitude must be between -180 and 180')
    .max(180, 'Longitude must be between -180 and 180'),
  address: z.string().min(3, 'Address is required').trim(),
  area: z.string().min(2, 'Area or neighborhood is required').trim(),
  city: z.string().min(2, 'City is required').trim(),
  state: z.string().optional().default('Metro State'),
  departmentId: z.string().optional().nullable(),
  existingProblemId: z.string().optional().nullable(),
  media: z
    .array(
      z.object({
        url: z.string().url('Invalid media URL'),
        publicId: z.string().optional(),
        mediaType: z.enum(['image', 'video']).default('image'),
      })
    )
    .optional()
    .default([]),
});

export const createCommentSchema = z.object({
  content: z
    .string()
    .trim()
    .min(1, 'Comment cannot be empty')
    .max(1000, 'Comment cannot exceed 1000 characters'),
});

export type GetProblemsQueryInput = z.infer<typeof getProblemsQuerySchema>;
export type GetMapQueryInput = z.infer<typeof getMapQuerySchema>;
export type CheckDuplicatesQueryInput = z.infer<typeof checkDuplicatesQuerySchema>;
export type CreateProblemInput = z.infer<typeof createProblemSchema>;
export type CreateCommentInput = z.infer<typeof createCommentSchema>;
