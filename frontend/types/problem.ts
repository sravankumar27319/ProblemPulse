export type PriorityLevel = 'CRITICAL' | 'MAJOR' | 'LOW';

export type ProblemStatus =
  | 'SUBMITTED'
  | 'UNDER_REVIEW'
  | 'VERIFIED'
  | 'ASSIGNED'
  | 'IN_PROGRESS'
  | 'RESOLVED'
  | 'COMMUNITY_VERIFIED'
  | 'CLOSED'
  | 'REJECTED'
  | 'DUPLICATE'
  | 'REOPENED';

export type ProblemCategory =
  | 'ROAD'
  | 'WATER'
  | 'GARBAGE'
  | 'ELECTRICITY'
  | 'TRAFFIC'
  | 'OTHER';

export type UserRole = 'USER' | 'ADMIN';

export interface UserSummary {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatarUrl?: string;
}

export interface DepartmentSummary {
  id: string;
  name: string;
  code: string;
  description?: string;
}

export interface MediaItem {
  id: string;
  url: string;
  mediaType: string;
  createdAt?: string;
}

export interface TimelineItem {
  id: string;
  fromStatus?: ProblemStatus | null;
  toStatus: ProblemStatus;
  note?: string | null;
  createdAt: string;
  actor: {
    id: string;
    name: string;
    role: UserRole;
  };
}

export interface CommentItem {
  id: string;
  content: string;
  isFlagged: boolean;
  createdAt: string;
  user: {
    id: string;
    name: string;
    avatarUrl?: string;
  };
}

export interface ResolutionDetail {
  id: string;
  description: string;
  resolvedAt: string;
  communityVerifiedAt?: string | null;
  closedAt?: string | null;
  isReopened: boolean;
  proofMedia?: MediaItem[];
}

export interface ProblemSummary {
  id: string;
  title: string;
  description: string;
  category: ProblemCategory;
  severity: number;
  priority: PriorityLevel;
  autoPriority?: PriorityLevel;
  adminPriority?: PriorityLevel | null;
  status: ProblemStatus;
  reportCount: number;
  supportCount: number;
  peopleAffected?: number;
  address: string;
  area: string;
  city: string;
  state?: string;
  latitude: number;
  longitude: number;
  createdAt: string;
  updatedAt: string;
  createdBy?: {
    id: string;
    name: string;
    avatarUrl?: string;
  };
  department?: DepartmentSummary | null;
  media?: MediaItem[];
  isSupported?: boolean;
  supported?: boolean;
}

export interface ProblemDetail extends ProblemSummary {
  peopleAffected: number;
  state: string;
  timeline: TimelineItem[];
  comments: CommentItem[];
  resolution?: ResolutionDetail | null;
  isSupportedByMe?: boolean;
  isReportedByMe?: boolean;
}

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
  createdAt: string;
  media?: Array<{
    url: string;
    mediaType: string;
  }>;
}

export interface CheckDuplicatesResponse {
  success: boolean;
  count: number;
  hasDuplicates: boolean;
  duplicates: NearbyProblemMatch[];
}

export interface CommentsResponse {
  success: boolean;
  count: number;
  comments: CommentItem[];
}

export interface CreateCommentResponse {
  success: boolean;
  message: string;
  comment: CommentItem;
}

export interface FlagCommentResponse {
  success: boolean;
  message: string;
  comment: CommentItem;
}

export interface UserActivitySummary {
  reportedCount: number;
  supportedCount: number;
  resolvedCount: number;
}

export interface UserActivityResponse {
  success: boolean;
  summary: UserActivitySummary;
  reportedProblems: ProblemSummary[];
  supportedProblems: ProblemSummary[];
  resolvedProblems: ProblemSummary[];
}

// Phase 25 — Community Verification Types
export interface CommunityVerificationVoteItem {
  id: string;
  isFixed: boolean;
  comment?: string | null;
  createdAt: string;
  user: {
    id: string;
    name: string;
    avatarUrl?: string | null;
  };
}

export interface CommunityVerificationData {
  status: ProblemStatus;
  isResolved: boolean;
  isCommunityVerified: boolean;
  isClosed: boolean;
  isReopened: boolean;
  canVote: boolean;
  userVote: {
    isFixed: boolean;
    comment?: string | null;
    createdAt: string;
  } | null;
  totalEligible: number;
  yesVotes: number;
  noVotes: number;
  threshold: number;
  daysRemaining: number;
  autoCloseAt?: string | null;
  resolvedAt?: string | null;
  votes: CommunityVerificationVoteItem[];
}

export interface CommunityVerificationResponse {
  success: boolean;
  message?: string;
  data: CommunityVerificationData;
}



