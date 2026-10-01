import { apiClient } from './apiClient';
import {
  ProblemSummary,
  ProblemDetail,
  ProblemCategory,
  PriorityLevel,
  ProblemStatus,
  CheckDuplicatesResponse,
  CommentsResponse,
  CreateCommentResponse,
  FlagCommentResponse,
  UserActivityResponse,
  CommunityVerificationResponse,
} from '../types/problem';

export interface GetProblemsParams {
  page?: number;
  limit?: number;
  category?: ProblemCategory | 'ALL';
  priority?: PriorityLevel | 'ALL';
  sort?: 'latest' | 'most_supported' | 'most_reported' | 'highest_priority';
  search?: string;
}

export interface MapMarkerItem {
  id: string;
  latitude: number;
  longitude: number;
  title: string;
  priority: PriorityLevel;
  status: ProblemStatus;
  reportCount: number;
  supportCount: number;
  address: string;
  area: string;
  city: string;
}

export interface PaginatedProblemsResponse {
  success: boolean;
  problems: ProblemSummary[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

export interface MapProblemsResponse {
  success: boolean;
  count: number;
  markers: MapMarkerItem[];
}

export interface ProblemDetailResponse {
  success: boolean;
  problem: ProblemDetail;
}

export interface CreateProblemPayload {
  title: string;
  description: string;
  category: ProblemCategory;
  severity: number;
  peopleAffected: number;
  latitude: number;
  longitude: number;
  address: string;
  area: string;
  city: string;
  state: string;
  existingProblemId?: string;
  media: Array<{
    url: string;
    publicId?: string;
    mediaType: 'image' | 'video';
  }>;
}

export interface CreateProblemResponse {
  success: boolean;
  problem: ProblemDetail;
  message?: string;
}

export interface SupportActionResponse {
  success: boolean;
  message?: string;
  supportCount: number;
  isSupported?: boolean;
  supported?: boolean;
  priority?: PriorityLevel;
}

export const problemService = {
  async fetchProblems(params: GetProblemsParams): Promise<PaginatedProblemsResponse> {
    const queryParams: Record<string, string | number> = {
      page: params.page || 1,
      limit: params.limit || 9,
      sort: params.sort || 'latest',
    };

    if (params.category && params.category !== 'ALL') {
      queryParams.category = params.category;
    }

    if (params.priority && params.priority !== 'ALL') {
      queryParams.priority = params.priority;
    }

    if (params.search && params.search.trim()) {
      queryParams.search = params.search.trim();
    }

    const response = await apiClient.get<PaginatedProblemsResponse>('/problems', {
      params: queryParams,
    });
    return response.data;
  },

  async fetchMapProblems(params: {
    bounds?: string;
    category?: ProblemCategory | 'ALL';
    priority?: PriorityLevel | 'ALL';
  }): Promise<MapProblemsResponse> {
    const queryParams: Record<string, string> = {};

    if (params.bounds) {
      queryParams.bounds = params.bounds;
    }

    if (params.category && params.category !== 'ALL') {
      queryParams.category = params.category;
    }

    if (params.priority && params.priority !== 'ALL') {
      queryParams.priority = params.priority;
    }

    const response = await apiClient.get<MapProblemsResponse>('/problems/map', {
      params: queryParams,
    });
    return response.data;
  },

  async checkDuplicates(params: {
    category: ProblemCategory;
    latitude: number;
    longitude: number;
    radiusMeters?: number;
  }): Promise<CheckDuplicatesResponse> {
    const response = await apiClient.get<CheckDuplicatesResponse>('/problems/duplicates', {
      params: {
        category: params.category,
        latitude: params.latitude,
        longitude: params.longitude,
        radiusMeters: params.radiusMeters || 100,
      },
    });
    return response.data;
  },

  async fetchProblemById(id: string): Promise<ProblemDetailResponse> {
    const response = await apiClient.get<ProblemDetailResponse>(`/problems/${id}`);
    return response.data;
  },

  async createProblem(payload: CreateProblemPayload): Promise<CreateProblemResponse> {
    const response = await apiClient.post<CreateProblemResponse>('/problems', payload);
    return response.data;
  },

  // Phase 14 — Support
  async addSupport(problemId: string): Promise<SupportActionResponse> {
    const response = await apiClient.post<SupportActionResponse>(`/problems/${problemId}/support`);
    return response.data;
  },

  async removeSupport(problemId: string): Promise<SupportActionResponse> {
    const response = await apiClient.delete<SupportActionResponse>(`/problems/${problemId}/support`);
    return response.data;
  },

  async toggleSupport(problemId: string, currentlySupported: boolean): Promise<SupportActionResponse> {
    if (currentlySupported) {
      return this.removeSupport(problemId);
    } else {
      return this.addSupport(problemId);
    }
  },

  // Phase 15 — Comments
  async fetchComments(problemId: string): Promise<CommentsResponse> {
    const response = await apiClient.get<CommentsResponse>(`/problems/${problemId}/comments`);
    return response.data;
  },

  async createComment(problemId: string, content: string): Promise<CreateCommentResponse> {
    const response = await apiClient.post<CreateCommentResponse>(`/problems/${problemId}/comments`, {
      content,
    });
    return response.data;
  },

  async flagComment(problemId: string, commentId: string): Promise<FlagCommentResponse> {
    const response = await apiClient.post<FlagCommentResponse>(
      `/problems/${problemId}/comments/${commentId}/flag`
    );
    return response.data;
  },

  // Phase 16 — User Activity
  async fetchUserActivity(): Promise<UserActivityResponse> {
    const response = await apiClient.get<UserActivityResponse>('/problems/user/activity');
    return response.data;
  },

  // Phase 25 — Community Verification
  async fetchVerification(problemId: string): Promise<CommunityVerificationResponse> {
    const response = await apiClient.get<CommunityVerificationResponse>(
      `/problems/${problemId}/verification`
    );
    return response.data;
  },

  async castVerificationVote(
    problemId: string,
    isFixed: boolean,
    comment?: string
  ): Promise<CommunityVerificationResponse> {
    const response = await apiClient.post<CommunityVerificationResponse>(
      `/problems/${problemId}/verification/vote`,
      { isFixed, comment }
    );
    return response.data;
  },
};

