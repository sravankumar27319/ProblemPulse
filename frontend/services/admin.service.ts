import { apiClient } from './apiClient';
import {
  AdminDashboardResponse,
  AdminProblemsFilter,
  AdminProblemsResponse,
  AdminReviewResponse,
  VerifyProblemInput,
  RejectProblemInput,
  MarkDuplicateInput,
  AssignProblemInput,
  DepartmentsResponse,
  UpdateStatusInput,
  ResolveProblemInput,
  AdminAnalyticsResponse,
  AdminMapFilterType,
  AdminMapResponse,
} from '../types/admin';

export const adminService = {
  async fetchDashboard(): Promise<AdminDashboardResponse> {
    const response = await apiClient.get<AdminDashboardResponse>('/admin/dashboard');
    return response.data;
  },

  async fetchAnalytics(range?: string): Promise<AdminAnalyticsResponse> {
    const params = new URLSearchParams();
    if (range && range !== 'all') {
      params.append('range', range);
    }
    const response = await apiClient.get<AdminAnalyticsResponse>(
      `/admin/analytics${params.toString() ? `?${params.toString()}` : ''}`
    );
    return response.data;
  },

  async fetchProblems(filters: AdminProblemsFilter = {}): Promise<AdminProblemsResponse> {
    const params = new URLSearchParams();

    if (filters.page) params.append('page', filters.page.toString());
    if (filters.limit) params.append('limit', filters.limit.toString());
    if (filters.priority && filters.priority !== 'ALL') params.append('priority', filters.priority);
    if (filters.status && filters.status !== 'ALL') params.append('status', filters.status);
    if (filters.category && filters.category !== 'ALL') params.append('category', filters.category);
    if (filters.area && filters.area !== 'ALL') params.append('area', filters.area);
    if (filters.date && filters.date !== 'all') params.append('date', filters.date);
    if (filters.startDate) params.append('startDate', filters.startDate);
    if (filters.endDate) params.append('endDate', filters.endDate);
    if (filters.search?.trim()) params.append('search', filters.search.trim());
    if (filters.sort) params.append('sort', filters.sort);

    const queryString = params.toString();
    const endpoint = queryString ? `/admin/problems?${queryString}` : '/admin/problems';

    const response = await apiClient.get<AdminProblemsResponse>(endpoint);
    return response.data;
  },

  async fetchProblemReview(id: string): Promise<AdminReviewResponse> {
    const response = await apiClient.get<AdminReviewResponse>(`/admin/problems/${id}`);
    return response.data;
  },

  async verifyProblem(
    id: string,
    payload: VerifyProblemInput = {}
  ): Promise<{ success: boolean; data?: unknown; message?: string }> {
    const response = await apiClient.post(`/admin/problems/${id}/verify`, payload);
    return response.data;
  },

  async rejectProblem(
    id: string,
    payload: RejectProblemInput
  ): Promise<{ success: boolean; data?: unknown; message?: string }> {
    const response = await apiClient.post(`/admin/problems/${id}/reject`, payload);
    return response.data;
  },

  async markDuplicate(
    id: string,
    payload: MarkDuplicateInput
  ): Promise<{ success: boolean; data?: unknown; message?: string }> {
    const response = await apiClient.post(`/admin/problems/${id}/duplicate`, payload);
    return response.data;
  },

  async fetchDepartments(): Promise<DepartmentsResponse> {
    const response = await apiClient.get<DepartmentsResponse>('/admin/departments');
    return response.data;
  },

  async assignProblem(
    id: string,
    payload: AssignProblemInput
  ): Promise<{ success: boolean; data?: unknown; message?: string }> {
    const response = await apiClient.post(`/admin/problems/${id}/assign`, payload);
    return response.data;
  },

  async updateStatus(
    id: string,
    payload: UpdateStatusInput
  ): Promise<{ success: boolean; data?: unknown; message?: string }> {
    const response = await apiClient.patch(`/admin/problems/${id}/status`, payload);
    return response.data;
  },

  async resolveProblem(
    id: string,
    payload: ResolveProblemInput
  ): Promise<{ success: boolean; data?: unknown; message?: string }> {
    const response = await apiClient.post(`/admin/problems/${id}/resolve`, payload);
    return response.data;
  },

  async fetchAdminMapProblems(params?: {
    filter?: AdminMapFilterType;
    category?: string;
    departmentId?: string;
    bounds?: string;
    search?: string;
  }): Promise<AdminMapResponse> {
    const queryParams = new URLSearchParams();
    if (params?.filter && params.filter !== 'ALL') queryParams.append('filter', params.filter);
    if (params?.category && params.category !== 'ALL') queryParams.append('category', params.category);
    if (params?.departmentId && params.departmentId !== 'ALL') queryParams.append('departmentId', params.departmentId);
    if (params?.bounds) queryParams.append('bounds', params.bounds);
    if (params?.search?.trim()) queryParams.append('search', params.search.trim());

    const queryString = queryParams.toString();
    const endpoint = queryString ? `/admin/map?${queryString}` : '/admin/map';

    const response = await apiClient.get<AdminMapResponse>(endpoint);
    return response.data;
  },
};


