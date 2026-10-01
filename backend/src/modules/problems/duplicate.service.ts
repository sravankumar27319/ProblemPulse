import { ProblemCategory, ProblemStatus } from '@prisma/client';
import { prisma } from '../../config/db';

export interface NearbyProblemMatch {
  id: string;
  title: string;
  category: ProblemCategory;
  status: ProblemStatus;
  distanceMeters: number;
  reportCount: number;
  supportCount: number;
  address: string;
  area: string;
  city: string;
  createdAt: Date;
  media?: Array<{
    url: string;
    mediaType: string;
  }>;
}

/**
 * Calculates Haversine distance in meters between two lat/lng coordinates
 */
export function calculateHaversineDistance(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371e3; // Earth radius in meters
  const radLat1 = (lat1 * Math.PI) / 180;
  const radLat2 = (lat2 * Math.PI) / 180;
  const deltaLat = ((lat2 - lat1) * Math.PI) / 180;
  const deltaLon = ((lon2 - lon1) * Math.PI) / 180;

  const a =
    Math.sin(deltaLat / 2) * Math.sin(deltaLat / 2) +
    Math.cos(radLat1) * Math.cos(radLat2) * Math.sin(deltaLon / 2) * Math.sin(deltaLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return Math.round(R * c);
}

/**
 * Detects existing nearby open problems with the same category within a given radius (default 100 meters)
 */
export async function findDuplicateProblems(params: {
  category: ProblemCategory;
  latitude: number;
  longitude: number;
  radiusMeters?: number;
  excludeProblemId?: string;
}): Promise<NearbyProblemMatch[]> {
  const { category, latitude, longitude, radiusMeters = 100, excludeProblemId } = params;

  // 1 deg latitude ≈ 111,320m
  // Use a slightly larger bounding box buffer for initial database filter
  const latDelta = (radiusMeters * 1.5) / 111320;
  const cosLat = Math.cos((latitude * Math.PI) / 180);
  const lonDelta = (radiusMeters * 1.5) / (111320 * (Math.abs(cosLat) > 0.001 ? Math.abs(cosLat) : 0.001));

  const candidates = await prisma.problem.findMany({
    where: {
      category,
      status: {
        notIn: ['CLOSED', 'REJECTED', 'DUPLICATE'],
      },
      latitude: {
        gte: latitude - latDelta,
        lte: latitude + latDelta,
      },
      longitude: {
        gte: longitude - lonDelta,
        lte: longitude + lonDelta,
      },
      ...(excludeProblemId ? { id: { not: excludeProblemId } } : {}),
    },
    select: {
      id: true,
      title: true,
      category: true,
      status: true,
      latitude: true,
      longitude: true,
      reportCount: true,
      supportCount: true,
      address: true,
      area: true,
      city: true,
      createdAt: true,
      media: {
        take: 1,
        select: {
          url: true,
          mediaType: true,
        },
      },
    },
    take: 20,
  });

  const matches: NearbyProblemMatch[] = [];

  for (const candidate of candidates) {
    const distanceMeters = calculateHaversineDistance(
      latitude,
      longitude,
      candidate.latitude,
      candidate.longitude
    );

    if (distanceMeters <= radiusMeters) {
      matches.push({
        id: candidate.id,
        title: candidate.title,
        category: candidate.category,
        status: candidate.status,
        distanceMeters,
        reportCount: candidate.reportCount,
        supportCount: candidate.supportCount,
        address: candidate.address,
        area: candidate.area,
        city: candidate.city,
        createdAt: candidate.createdAt,
        media: candidate.media,
      });
    }
  }

  // Sort by closest distance first
  return matches.sort((a, b) => a.distanceMeters - b.distanceMeters);
}
