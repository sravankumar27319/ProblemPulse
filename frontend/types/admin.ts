import {
  ProblemCategory,
  PriorityLevel,
  ProblemStatus,
  ProblemDetail,
} from './problem';

export interface AdminKpiStats {
  pendingReview: number;
  critical: number;
  inProgress: number;
  resolved: number;
}

export interface AdminCategoryCount {
  category: ProblemCategory;
  count: number;
  percentage: number;
}

export interface AdminWeeklyMetrics {
  newReports: number;
  verified: number;
  reopened: number;
  avgResolutionTime: string;
}

export interface AdminQueueItem {
  id: string;
  title: string;
  category: ProblemCategory;
  area: string;
  city: string;
  reportCount: number;
  supportCount: number;
  priority: PriorityLevel;
  status: ProblemStatus;
  createdAt: string;
}

export interface AdminDashboardData {
  kpis: AdminKpiStats;
  queue: AdminQueueItem[];
  awaitingReview: AdminQueueItem[];
  byCategory: AdminCategoryCount[];
  thisWeek: AdminWeeklyMetrics;
}

export interface AdminDashboardResponse {
  success: boolean;
  data: AdminDashboardData;
}

// Phase 19 — Admin Problem Management Types
export interface AdminProblemItem {
  id: string;
  title: string;
  description: string;
  category: ProblemCategory;
  area: string;
  city: string;
  address: string;
  reportCount: number;
  supportCount: number;
  peopleAffected: number;
  autoPriority: PriorityLevel;
  adminPriority: PriorityLevel | null;
  priority: PriorityLevel;
  status: ProblemStatus;
  createdAt: string;
  updatedAt: string;
  department?: {
    id: string;
    name: string;
    code: string;
  } | null;
  mediaUrl?: string | null;
}

export interface AdminProblemsFilter {
  page?: number;
  limit?: number;
  priority?: string;
  status?: string;
  category?: string;
  area?: string;
  date?: string;
  startDate?: string;
  endDate?: string;
  search?: string;
  sort?: string;
}

export interface AdminProblemsResult {
  problems: AdminProblemItem[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  areas: string[];
}

export interface AdminProblemsResponse {
  success: boolean;
  data: AdminProblemsResult;
}

// Phase 20 — Admin Review & Triage Types
export interface AdminCandidateDuplicate {
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
  createdAt: string;
  media?: Array<{
    url: string;
    mediaType: string;
  }>;
}

export interface AdminPriorityBreakdown {
  score: number;
  priority: PriorityLevel;
  breakdown: {
    severityScore: number;
    peopleScore: number;
    reportScore: number;
    supportScore: number;
    totalScore: number;
    isCapped: {
      people: boolean;
      reports: boolean;
      supports: boolean;
    };
  };
}

export interface AdminReviewData {
  problem: ProblemDetail;
  candidateDuplicates: AdminCandidateDuplicate[];
  priorityBreakdown: AdminPriorityBreakdown;
  departments?: AdminDepartment[];
  allowedTransitions?: ProblemStatus[];
}

export interface AdminReviewResponse {
  success: boolean;
  data: AdminReviewData;
}

export interface VerifyProblemInput {
  note?: string;
  adminPriority?: PriorityLevel;
}

export interface RejectProblemInput {
  reason: string;
}

export interface MarkDuplicateInput {
  canonicalProblemId: string;
  note?: string;
}

// Phase 21 — Department Assignment Types
export interface AdminDepartment {
  id: string;
  name: string;
  code: string;
  description: string | null;
}

export interface AssignProblemInput {
  departmentId: string;
  zone?: string;
  team?: string;
  note?: string;
}

export interface DepartmentsResponse {
  success: boolean;
  data: AdminDepartment[];
}

// Phase 22 — Status Management Types
export interface UpdateStatusInput {
  status: ProblemStatus;
  note?: string;
  departmentId?: string;
}

// Phase 23 — Resolution System Types
export interface ResolveProblemInput {
  description: string;
  proofMedia?: Array<{
    url: string;
    publicId?: string;
    mediaType?: 'image' | 'video';
  }>;
}

// Phase 24 — Admin Analytics Types
export interface AnalyticsCategoryItem {
  category: ProblemCategory;
  count: number;
  percentage: number;
  resolvedCount: number;
}

export interface AnalyticsAreaItem {
  area: string;
  count: number;
  resolvedCount: number;
  resolutionRate: number;
}

export interface AnalyticsPriorityItem {
  priority: PriorityLevel;
  count: number;
  percentage: number;
}

export interface AnalyticsStatusItem {
  status: ProblemStatus;
  count: number;
  percentage: number;
}

export interface AnalyticsResolutionRatio {
  total: number;
  resolved: number;
  unresolved: number;
  resolutionRate: number;
  ratePercentage?: number;
}

export interface AnalyticsMonthlyTrend {
  month: string;
  label: string;
  reports: number;
  resolved: number;
  monthKey?: string;
  monthLabel?: string;
  newReports?: number;
  resolvedCount?: number;
}

export interface AdminAnalyticsData {
  timeRange?: '7days' | '30days' | '90days' | 'year' | 'all';
  summary: {
    totalProblems: number;
    activeBacklog: number;
    resolvedCount: number;
    resolvedTotal?: number;
    resolutionRate: number;
    avgResolutionTimeHours: number;
    avgResolutionHours?: number;
    avgResolutionTimeDays: number;
    avgResolutionTime?: string;
    topCategory: string;
    topArea: string;
  };
  byCategory: AnalyticsCategoryItem[];
  byArea: AnalyticsAreaItem[];
  byPriority: AnalyticsPriorityItem[];
  byStatus: AnalyticsStatusItem[];
  resolutionRatio: AnalyticsResolutionRatio;
  monthlyTrend: AnalyticsMonthlyTrend[];
  monthlyTrends?: AnalyticsMonthlyTrend[];
}

export interface AdminAnalyticsResponse {
  success: boolean;
  data: AdminAnalyticsData;
}

// Phase 26 — Admin Map Types
export type AdminMapFilterType =
  | 'ALL'
  | 'CRITICAL'
  | 'UNVERIFIED'
  | 'IN_PROGRESS'
  | 'UNRESOLVED';

export interface AdminMapMarkerItem {
  id: string;
  title: string;
  description: string;
  category: ProblemCategory;
  priority: PriorityLevel;
  autoPriority: PriorityLevel;
  adminPriority: PriorityLevel | null;
  status: ProblemStatus;
  reportCount: number;
  supportCount: number;
  peopleAffected: number;
  latitude: number;
  longitude: number;
  address: string;
  area: string;
  city: string;
  departmentId: string | null;
  department: {
    id: string;
    name: string;
    code: string;
  } | null;
  createdAt: string;
  updatedAt: string;
}

export interface AdminMapCounts {
  all: number;
  critical: number;
  unverified: number;
  inProgress: number;
  unresolved: number;
}

export interface AdminMapResponse {
  success: boolean;
  count: number;
  counts: AdminMapCounts;
  markers: AdminMapMarkerItem[];
}
