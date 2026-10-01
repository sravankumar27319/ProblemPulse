'use client';

import React, { useState, useEffect, use, useCallback } from 'react';
import Link from 'next/link';
import { useAuth } from '../../../../hooks/useAuth';
import { adminService } from '../../../../services/admin.service';
import {
  AdminCandidateDuplicate,
  AdminPriorityBreakdown,
  AdminDepartment,
  AssignProblemInput,
  UpdateStatusInput,
  ResolveProblemInput,
} from '../../../../types/admin';
import { PriorityLevel, ProblemDetail, ProblemStatus } from '../../../../types/problem';
import { Sidebar } from '../../../../components/Sidebar';
import { PriorityBadge } from '../../../../components/ui/PriorityBadge';
import { StatusPill } from '../../../../components/ui/StatusPill';
import { MediaGallery } from '../../../../components/problems/MediaGallery';
import { LocationView } from '../../../../components/problems/LocationView';
import { TimelineWidget } from '../../../../components/problems/TimelineWidget';
import { Card } from '../../../../components/ui/Card';
import { Button } from '../../../../components/ui/Button';
import { Loading } from '../../../../components/ui/Loading';
import { ErrorMessage } from '../../../../components/ui/ErrorMessage';
import { VerifyModal } from '../../../../components/admin/VerifyModal';
import { RejectModal } from '../../../../components/admin/RejectModal';
import { MarkDuplicateModal } from '../../../../components/admin/MarkDuplicateModal';
import { AssignDepartmentModal } from '../../../../components/admin/AssignDepartmentModal';
import { UpdateStatusModal } from '../../../../components/admin/UpdateStatusModal';
import { ResolveModal } from '../../../../components/admin/ResolveModal';
import { ResolutionProofCard } from '../../../../components/problems/ResolutionProofCard';
import { formatDate } from '../../../../utils/formatters';
import {
  CheckCircle2,
  AlertOctagon,
  Copy,
  ChevronLeft,
  Calendar,
  Building,
  Building2,
  Users,
  ThumbsUp,
  MessageSquare,
  Lock,
  Check,
  RefreshCw,
  PlayCircle,
  CheckCheck,
  RotateCcw,
} from 'lucide-react';

export default function AdminProblemReviewPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const resolvedParams = use(params);
  const problemId = resolvedParams.id;
  const { user, isLoading: authLoading } = useAuth();

  const [problem, setProblem] = useState<ProblemDetail | null>(null);
  const [candidateDuplicates, setCandidateDuplicates] = useState<AdminCandidateDuplicate[]>([]);
  const [priorityBreakdown, setPriorityBreakdown] = useState<AdminPriorityBreakdown | null>(null);
  const [departments, setDepartments] = useState<AdminDepartment[]>([]);
  const [allowedTransitions, setAllowedTransitions] = useState<ProblemStatus[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [successBanner, setSuccessBanner] = useState<string | null>(null);
  const [sidebarCollapsed, setSidebarCollapsed] = useState<boolean>(false);
  const [copiedId, setCopiedId] = useState<boolean>(false);

  // Modal states
  const [isVerifyOpen, setIsVerifyOpen] = useState<boolean>(false);
  const [isRejectOpen, setIsRejectOpen] = useState<boolean>(false);
  const [isDuplicateOpen, setIsDuplicateOpen] = useState<boolean>(false);
  const [isAssignOpen, setIsAssignOpen] = useState<boolean>(false);
  const [isStatusOpen, setIsStatusOpen] = useState<boolean>(false);
  const [isResolveOpen, setIsResolveOpen] = useState<boolean>(false);

  const loadReviewData = useCallback(async () => {
    try {
      setError(null);
      const res = await adminService.fetchProblemReview(problemId);
      if (res.success && res.data) {
        setProblem(res.data.problem);
        setCandidateDuplicates(res.data.candidateDuplicates || []);
        setPriorityBreakdown(res.data.priorityBreakdown || null);
        if (res.data.allowedTransitions) {
          setAllowedTransitions(res.data.allowedTransitions);
        }
        if (res.data.departments && res.data.departments.length > 0) {
          setDepartments(res.data.departments);
        } else {
          try {
            const deptRes = await adminService.fetchDepartments();
            if (deptRes.success && deptRes.data) {
              setDepartments(deptRes.data);
            }
          } catch {
            // fallback gracefully
          }
        }
      }
    } catch (err: unknown) {
      const axiosError = err as { response?: { data?: { message?: string } } };
      setError(axiosError?.response?.data?.message || 'Failed to load problem review data.');
    } finally {
      setIsLoading(false);
    }
  }, [problemId]);

  useEffect(() => {
    let ignore = false;
    if (!authLoading) {
      if (user && user.role === 'ADMIN') {
        adminService
          .fetchProblemReview(problemId)
          .then((res) => {
            if (ignore) return;
            if (res.success && res.data) {
              setProblem(res.data.problem);
              setCandidateDuplicates(res.data.candidateDuplicates || []);
              setPriorityBreakdown(res.data.priorityBreakdown || null);
              if (res.data.departments && res.data.departments.length > 0) {
                setDepartments(res.data.departments);
              }
              if (res.data.allowedTransitions) {
                setAllowedTransitions(res.data.allowedTransitions);
              }
            }
            setIsLoading(false);
          })
          .catch((err: unknown) => {
            if (ignore) return;
            const axiosError = err as { response?: { data?: { message?: string } } };
            setError(axiosError?.response?.data?.message || 'Failed to load problem review data.');
            setIsLoading(false);
          });
      }
    }
    return () => {
      ignore = true;
    };
  }, [user, authLoading, problemId]);

  const handleCopyId = () => {
    if (!problem) return;
    navigator.clipboard.writeText(problem.id);
    setCopiedId(true);
    setTimeout(() => setCopiedId(false), 2000);
  };

  // Actions handlers
  const handleVerifyConfirm = async (payload: { note?: string; adminPriority?: PriorityLevel }) => {
    await adminService.verifyProblem(problemId, payload);
    setSuccessBanner('Problem has been verified and added to the municipal queue.');
    await loadReviewData();
  };

  const handleRejectConfirm = async (reason: string) => {
    await adminService.rejectProblem(problemId, { reason });
    setSuccessBanner('Problem has been rejected. Citizen reporter has been notified with the reason.');
    await loadReviewData();
  };

  const handleDuplicateConfirm = async (payload: { canonicalProblemId: string; note?: string }) => {
    await adminService.markDuplicate(problemId, payload);
    setSuccessBanner(`Problem marked as duplicate of #${payload.canonicalProblemId}. Reports merged.`);
    await loadReviewData();
  };

  const handleAssignConfirm = async (payload: AssignProblemInput) => {
    await adminService.assignProblem(problemId, payload);
    setSuccessBanner('Problem has been assigned to department and moved to municipal dispatch queue.');
    await loadReviewData();
  };

  const handleStatusConfirm = async (payload: UpdateStatusInput) => {
    await adminService.updateStatus(problemId, payload);
    setSuccessBanner(`Problem status successfully transitioned to ${payload.status}.`);
    await loadReviewData();
  };

  const handleResolveConfirm = async (payload: ResolveProblemInput) => {
    await adminService.resolveProblem(problemId, payload);
    setSuccessBanner('Problem marked as resolved with proof of work attached.');
    await loadReviewData();
  };

  const handleQuickStatus = async (status: ProblemStatus) => {
    try {
      await adminService.updateStatus(problemId, { status });
      setSuccessBanner(`Problem status updated to ${status}.`);
      await loadReviewData();
    } catch (err: unknown) {
      const axiosError = err as { response?: { data?: { message?: string } } };
      setError(axiosError?.response?.data?.message || 'Failed to update problem status.');
    }
  };

  // Auth loading state
  if (authLoading || (isLoading && user?.role === 'ADMIN')) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#faf8f4] dark:bg-[#0e1512]">
        <Loading size="lg" text="Loading municipal problem review..." />
      </div>
    );
  }

  // Not logged in or not admin
  if (!user || user.role !== 'ADMIN') {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-[#faf8f4] dark:bg-[#0e1512] text-[#14201c] dark:text-[#ece9e1]">
        <Card className="max-w-md w-full p-8 text-center bg-white dark:bg-[#141d19] border border-[#e6e2dc] dark:border-[#24312b] space-y-6 shadow-xs">
          <div className="w-12 h-12 rounded-2xl bg-red-500/10 text-red-600 dark:text-red-400 flex items-center justify-center mx-auto">
            <Lock className="w-6 h-6" />
          </div>
          <div className="space-y-2">
            <h2 className="font-heading text-2xl font-bold">
              Admin Access Required
            </h2>
            <p className="text-xs text-[#57534e] dark:text-[#a8a29e] leading-relaxed">
              Problem review and verification actions are restricted to authorized municipal officers.
            </p>
          </div>
          <div className="flex flex-col gap-3">
            <Link href="/admin/login">
              <Button fullWidth size="lg">
                Sign In to Admin Portal
              </Button>
            </Link>
            <Link href="/discover">
              <Button variant="outline" fullWidth size="md">
                Return to Citizen Portal
              </Button>
            </Link>
          </div>
        </Card>
      </div>
    );
  }

  if (error || !problem) {
    return (
      <div className="min-h-screen bg-[#faf8f4] dark:bg-[#0e1512] p-8 flex flex-col items-center justify-center">
        <ErrorMessage
          message={error || 'Problem not found'}
          onRetry={loadReviewData}
        />
        <Link href="/admin/problems" className="mt-4">
          <Button variant="outline" size="sm">
            Back to Problem Management
          </Button>
        </Link>
      </div>
    );
  }

  const effectivePriority = problem.adminPriority || problem.autoPriority || problem.priority;
  const isTerminalState = ['RESOLVED', 'CLOSED', 'COMMUNITY_VERIFIED'].includes(problem.status);

  return (
    <div className="min-h-screen bg-[#faf8f4] dark:bg-[#0e1512] flex flex-row font-body text-[#1c1917] dark:text-[#ece9e1]">
      {/* Admin Sidebar */}
      <Sidebar
        collapsed={sidebarCollapsed}
        onToggleCollapse={() => setSidebarCollapsed(!sidebarCollapsed)}
      />

      {/* Main Review Workspace */}
      <main className="flex-1 flex flex-col min-w-0 overflow-y-auto">
        {/* Sticky Action Header */}
        <header className="sticky top-0 z-20 bg-white/95 dark:bg-[#141d19]/95 backdrop-blur-md border-b border-[#e6e2dc] dark:border-[#24312b] px-4 sm:px-8 py-3.5 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Link
              href="/admin/problems"
              className="p-1.5 rounded-lg border border-[#e6e2dc] dark:border-[#24312b] bg-[#faf8f4] dark:bg-[#0e1512] text-[#78716c] hover:text-[#1c1917] dark:hover:text-[#ece9e1] transition-colors"
              title="Back to Problem Management"
            >
              <ChevronLeft className="w-5 h-5" />
            </Link>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="font-heading text-base sm:text-lg font-bold text-[#1c1917] dark:text-[#ece9e1]">
                  Problem Review
                </h1>
                <span className="font-mono text-xs text-[#78716c] dark:text-[#9aa8a1]">
                  #{problem.id.slice(0, 8)}
                </span>
                <StatusPill status={problem.status} size="sm" />
              </div>
              <p className="text-[11px] text-[#78716c] dark:text-[#9aa8a1]">
                Municipal verification, deduplication, and triage workspace
              </p>
            </div>
          </div>

          {/* Action Toolbar */}
          <div className="flex flex-wrap items-center gap-2 self-end sm:self-auto">
            {/* Mark Duplicate Button */}
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsDuplicateOpen(true)}
              disabled={problem.status === 'DUPLICATE'}
              className="border-[#e6e2dc] dark:border-[#24312b] text-[#44403c] dark:text-[#d6d3d1] hover:text-amber-600 dark:hover:text-amber-400 gap-1.5 text-xs py-1.5 px-3 h-auto"
            >
              <Copy className="w-3.5 h-3.5 text-amber-600" />
              <span>Mark Duplicate</span>
            </Button>

            {/* Reject Button (valid from SUBMITTED, UNDER_REVIEW, VERIFIED, ASSIGNED) */}
            {['SUBMITTED', 'UNDER_REVIEW', 'VERIFIED', 'ASSIGNED'].includes(problem.status) && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsRejectOpen(true)}
                className="border-red-200 dark:border-red-900/60 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/30 gap-1.5 text-xs py-1.5 px-3 h-auto"
              >
                <AlertOctagon className="w-3.5 h-3.5" />
                <span>Reject</span>
              </Button>
            )}

            {/* Verify Button (when SUBMITTED or UNDER_REVIEW) */}
            {['SUBMITTED', 'UNDER_REVIEW'].includes(problem.status) && (
              <Button
                size="sm"
                onClick={() => setIsVerifyOpen(true)}
                className="bg-[#0f6b4f] hover:bg-[#0d5942] text-white gap-1.5 text-xs py-1.5 px-4 h-auto shadow-xs"
              >
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Verify</span>
              </Button>
            )}

            {/* Assign Department Button */}
            {['VERIFIED', 'ASSIGNED'].includes(problem.status) && (
              <Button
                variant={problem.status === 'VERIFIED' ? 'primary' : 'outline'}
                size="sm"
                onClick={() => setIsAssignOpen(true)}
                className={
                  problem.status === 'VERIFIED'
                    ? 'bg-purple-600 hover:bg-purple-700 text-white gap-1.5 text-xs py-1.5 px-3 h-auto shadow-xs'
                    : 'border-purple-200 dark:border-purple-900/60 text-purple-600 dark:text-purple-400 hover:bg-purple-50 dark:hover:bg-purple-950/30 gap-1.5 text-xs py-1.5 px-3 h-auto'
                }
              >
                <Building2 className="w-3.5 h-3.5" />
                <span>{problem.department ? 'Reassign Dept' : 'Assign Dept'}</span>
              </Button>
            )}

            {/* Contextual Status Quick Actions */}
            {problem.status === 'ASSIGNED' && (
              <Button
                size="sm"
                onClick={() => handleQuickStatus('IN_PROGRESS')}
                className="bg-indigo-600 hover:bg-indigo-700 text-white gap-1.5 text-xs py-1.5 px-3 h-auto shadow-xs"
              >
                <PlayCircle className="w-3.5 h-3.5" />
                <span>Start Work</span>
              </Button>
            )}

            {problem.status === 'IN_PROGRESS' && (
              <Button
                size="sm"
                onClick={() => setIsResolveOpen(true)}
                className="bg-[#0f6b4f] hover:bg-[#0d5942] text-white gap-1.5 text-xs py-1.5 px-3 h-auto shadow-xs"
              >
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Mark Resolved</span>
              </Button>
            )}

            {problem.status === 'RESOLVED' && (
              <>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleQuickStatus('REOPENED')}
                  className="border-rose-200 dark:border-rose-900/60 text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/30 gap-1.5 text-xs py-1.5 px-3 h-auto"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Reopen</span>
                </Button>
                <Button
                  size="sm"
                  onClick={() => handleQuickStatus('CLOSED')}
                  className="bg-stone-800 hover:bg-stone-900 dark:bg-stone-700 text-white gap-1.5 text-xs py-1.5 px-3 h-auto shadow-xs"
                >
                  <CheckCheck className="w-3.5 h-3.5" />
                  <span>Close Ticket</span>
                </Button>
              </>
            )}

            {problem.status === 'CLOSED' && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleQuickStatus('REOPENED')}
                className="border-rose-200 dark:border-rose-900/60 text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/30 gap-1.5 text-xs py-1.5 px-3 h-auto"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Reopen Ticket</span>
              </Button>
            )}

            {/* Universal Status Transition Modal Trigger */}
            {problem.status !== 'DUPLICATE' && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsStatusOpen(true)}
                className="border-[#e6e2dc] dark:border-[#24312b] text-[#44403c] dark:text-[#d6d3d1] hover:text-[#0f6b4f] dark:hover:text-[#5cc9a0] gap-1.5 text-xs py-1.5 px-3 h-auto"
              >
                <RefreshCw className="w-3.5 h-3.5 text-[#0f6b4f]" />
                <span>Update Status</span>
              </Button>
            )}
          </div>
        </header>

        {/* Workspace Body: 7 Sequential Sections */}
        <div className="p-4 sm:p-6 lg:p-8 max-w-5xl mx-auto w-full space-y-8">
          {/* Success Notification Banner */}
          {successBanner && (
            <div className="p-4 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-xs text-emerald-800 dark:text-emerald-300 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 shrink-0" />
                <span>{successBanner}</span>
              </div>
              <button
                onClick={() => setSuccessBanner(null)}
                className="text-emerald-700 hover:text-emerald-900 text-xs font-semibold ml-2"
              >
                Dismiss
              </button>
            </div>
          )}

          {/* Phase 23 Resolution Proof Display (when problem has resolution) */}
          {problem.resolution && (
            <section className="space-y-3 animate-in fade-in duration-200">
              <div className="border-b border-emerald-200 dark:border-emerald-900 pb-2">
                <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-700 dark:text-emerald-400">
                  Municipal Resolution & Proof
                </span>
              </div>
              <ResolutionProofCard resolution={problem.resolution} />
            </section>
          )}

          {/* 1. Problem Information */}
          <section className="space-y-3">
            <div className="flex items-center justify-between border-b border-[#e6e2dc] dark:border-[#24312b] pb-2">
              <span className="text-[11px] font-bold uppercase tracking-wider text-[#0f6b4f] dark:text-[#5cc9a0]">
                1. Problem Information
              </span>
              <button
                onClick={handleCopyId}
                className="inline-flex items-center gap-1 text-[11px] text-[#78716c] hover:text-[#1c1917] dark:hover:text-[#ece9e1]"
                title="Copy Problem ID"
              >
                {copiedId ? (
                  <>
                    <Check className="w-3 h-3 text-[#0f6b4f]" />
                    <span className="text-[#0f6b4f]">Copied!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3 h-3" />
                    <span>Copy ID</span>
                  </>
                )}
              </button>
            </div>

            <Card className="p-5 sm:p-6 bg-white dark:bg-[#141d19] border border-[#e6e2dc] dark:border-[#24312b] shadow-xs space-y-4">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                <h2 className="font-heading text-xl sm:text-2xl font-bold text-[#1c1917] dark:text-[#ece9e1]">
                  {problem.title}
                </h2>
                <div className="flex items-center gap-2 shrink-0">
                  <span className="py-1 px-3 rounded-lg bg-[#faf8f4] dark:bg-[#0e1512] border border-[#e6e2dc] dark:border-[#24312b] text-xs font-semibold text-[#0f6b4f] dark:text-[#5cc9a0]">
                    {problem.category}
                  </span>
                  <StatusPill status={problem.status} />
                  {problem.status !== 'DUPLICATE' && (
                    <button
                      onClick={() => setIsStatusOpen(true)}
                      className="text-xs font-semibold text-[#0f6b4f] dark:text-[#5cc9a0] hover:underline inline-flex items-center gap-1 ml-1"
                      title="Update Lifecycle Status"
                    >
                      <RefreshCw className="w-3 h-3" />
                      <span>Update</span>
                    </button>
                  )}
                </div>
              </div>

              {/* Metadata Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-3 border-t border-[#e6e2dc] dark:border-[#24312b] text-xs">
                {/* Reporter */}
                <div className="space-y-1">
                  <span className="text-[#78716c] dark:text-[#9aa8a1] text-[11px] uppercase tracking-wider">
                    Reported By
                  </span>
                  <div className="flex items-center gap-2 font-medium text-[#1c1917] dark:text-[#ece9e1]">
                    <div className="w-6 h-6 rounded-full bg-[#0f6b4f]/10 text-[#0f6b4f] flex items-center justify-center font-bold text-[10px]">
                      {problem.createdBy?.name?.slice(0, 2).toUpperCase() || 'CT'}
                    </div>
                    <span>{problem.createdBy?.name || 'Citizen Reporter'}</span>
                  </div>
                </div>

                {/* Submission Date */}
                <div className="space-y-1">
                  <span className="text-[#78716c] dark:text-[#9aa8a1] text-[11px] uppercase tracking-wider">
                    Submitted Date
                  </span>
                  <div className="flex items-center gap-1.5 font-medium text-[#1c1917] dark:text-[#ece9e1]">
                    <Calendar className="w-3.5 h-3.5 text-[#78716c]" />
                    <span>{formatDate(problem.createdAt)}</span>
                  </div>
                </div>

                {/* Department */}
                <div className="space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="text-[#78716c] dark:text-[#9aa8a1] text-[11px] uppercase tracking-wider">
                      Assigned Department
                    </span>
                    {!isTerminalState && problem.status !== 'REJECTED' && problem.status !== 'DUPLICATE' && (
                      <button
                        onClick={() => setIsAssignOpen(true)}
                        className="text-[11px] font-semibold text-purple-600 dark:text-purple-400 hover:underline inline-flex items-center gap-1"
                      >
                        <Building2 className="w-3 h-3" />
                        <span>{problem.department ? 'Reassign' : 'Assign'}</span>
                      </button>
                    )}
                  </div>
                  <div className="flex items-center gap-1.5 font-medium text-[#1c1917] dark:text-[#ece9e1]">
                    <Building className="w-3.5 h-3.5 text-purple-600" />
                    <span>{problem.department?.name || 'Pending Department Assignment'}</span>
                  </div>
                </div>
              </div>
            </Card>
          </section>

          {/* 2. Video / Images */}
          <section className="space-y-3">
            <div className="border-b border-[#e6e2dc] dark:border-[#24312b] pb-2">
              <span className="text-[11px] font-bold uppercase tracking-wider text-[#0f6b4f] dark:text-[#5cc9a0]">
                2. Video / Images Evidence
              </span>
            </div>

            <Card className="p-5 sm:p-6 bg-white dark:bg-[#141d19] border border-[#e6e2dc] dark:border-[#24312b] shadow-xs">
              {problem.media && problem.media.length > 0 ? (
                <MediaGallery media={problem.media} />
              ) : (
                <div className="p-8 text-center bg-[#faf8f4] dark:bg-[#0e1512] rounded-xl border border-dashed border-[#e6e2dc] dark:border-[#24312b] text-xs text-[#78716c] dark:text-[#9aa8a1]">
                  No photo or video evidence uploaded with this report.
                </div>
              )}
            </Card>
          </section>

          {/* 3. Location */}
          <section className="space-y-3">
            <div className="border-b border-[#e6e2dc] dark:border-[#24312b] pb-2">
              <span className="text-[11px] font-bold uppercase tracking-wider text-[#0f6b4f] dark:text-[#5cc9a0]">
                3. Location Coordinates & Area
              </span>
            </div>

            <LocationView
              address={problem.address}
              area={problem.area}
              city={problem.city}
              state={problem.state}
              latitude={problem.latitude}
              longitude={problem.longitude}
            />
          </section>

          {/* 4. Description */}
          <section className="space-y-3">
            <div className="border-b border-[#e6e2dc] dark:border-[#24312b] pb-2">
              <span className="text-[11px] font-bold uppercase tracking-wider text-[#0f6b4f] dark:text-[#5cc9a0]">
                4. Problem Description & Impact
              </span>
            </div>

            <Card className="p-5 sm:p-6 bg-white dark:bg-[#141d19] border border-[#e6e2dc] dark:border-[#24312b] shadow-xs space-y-4">
              <div className="prose prose-sm dark:prose-invert max-w-none text-xs sm:text-sm text-[#44403c] dark:text-[#d6d3d1] leading-relaxed">
                {problem.description}
              </div>

              <div className="flex flex-wrap items-center gap-6 pt-3 border-t border-[#e6e2dc] dark:border-[#24312b] text-xs text-[#78716c] dark:text-[#9aa8a1]">
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-[#1c1917] dark:text-[#ece9e1]">
                    Citizen Severity Rating:
                  </span>
                  <div className="flex items-center gap-1">
                    {Array.from({ length: 10 }).map((_, i) => (
                      <span
                        key={i}
                        className={`w-2 h-2 rounded-full ${
                          i < problem.severity
                            ? 'bg-[#0f6b4f] dark:bg-[#5cc9a0]'
                            : 'bg-[#e6e2dc] dark:bg-[#24312b]'
                        }`}
                      />
                    ))}
                    <span className="ml-1 font-bold text-[#1c1917] dark:text-[#ece9e1]">
                      {problem.severity}/10
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-1.5">
                  <span className="font-semibold text-[#1c1917] dark:text-[#ece9e1]">
                    People Directly Affected:
                  </span>
                  <span className="font-bold text-[#1c1917] dark:text-[#ece9e1]">
                    ~{problem.peopleAffected} citizens
                  </span>
                </div>
              </div>
            </Card>
          </section>

          {/* 5. Priority */}
          <section className="space-y-3">
            <div className="border-b border-[#e6e2dc] dark:border-[#24312b] pb-2 flex items-center justify-between">
              <span className="text-[11px] font-bold uppercase tracking-wider text-[#0f6b4f] dark:text-[#5cc9a0]">
                5. Priority Calculation & Override
              </span>
              <PriorityBadge
                priority={effectivePriority}
                isAdminOverride={Boolean(problem.adminPriority)}
              />
            </div>

            <Card className="p-5 sm:p-6 bg-white dark:bg-[#141d19] border border-[#e6e2dc] dark:border-[#24312b] shadow-xs space-y-4">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                <div>
                  <h4 className="font-semibold text-sm text-[#1c1917] dark:text-[#ece9e1]">
                    Priority Classification Engine
                  </h4>
                  <p className="text-xs text-[#78716c] dark:text-[#9aa8a1]">
                    Automatic scoring based on severity, population footprint, and corroborating reports
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-xs text-[#78716c]">Effective Priority:</span>
                  <PriorityBadge priority={effectivePriority} size="md" />
                </div>
              </div>

              {/* Score Breakdown Cards */}
              {priorityBreakdown && (
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
                  {/* Severity */}
                  <div className="p-3 rounded-xl bg-[#faf8f4] dark:bg-[#0e1512] border border-[#e6e2dc] dark:border-[#24312b]">
                    <span className="text-[10px] uppercase font-semibold text-[#78716c] block">
                      Severity Score
                    </span>
                    <span className="text-base font-bold text-[#1c1917] dark:text-[#ece9e1]">
                      {priorityBreakdown.breakdown?.severityScore || 0} / 40
                    </span>
                  </div>

                  {/* Population */}
                  <div className="p-3 rounded-xl bg-[#faf8f4] dark:bg-[#0e1512] border border-[#e6e2dc] dark:border-[#24312b]">
                    <span className="text-[10px] uppercase font-semibold text-[#78716c] block">
                      People Score
                    </span>
                    <span className="text-base font-bold text-[#1c1917] dark:text-[#ece9e1]">
                      {priorityBreakdown.breakdown?.peopleScore || 0} / 30
                    </span>
                  </div>

                  {/* Reports */}
                  <div className="p-3 rounded-xl bg-[#faf8f4] dark:bg-[#0e1512] border border-[#e6e2dc] dark:border-[#24312b]">
                    <span className="text-[10px] uppercase font-semibold text-[#78716c] block">
                      Report Score
                    </span>
                    <span className="text-base font-bold text-[#1c1917] dark:text-[#ece9e1]">
                      {priorityBreakdown.breakdown?.reportScore || 0} / 15
                    </span>
                  </div>

                  {/* Supports */}
                  <div className="p-3 rounded-xl bg-[#faf8f4] dark:bg-[#0e1512] border border-[#e6e2dc] dark:border-[#24312b]">
                    <span className="text-[10px] uppercase font-semibold text-[#78716c] block">
                      Support Score
                    </span>
                    <span className="text-base font-bold text-[#1c1917] dark:text-[#ece9e1]">
                      {priorityBreakdown.breakdown?.supportScore || 0} / 15
                    </span>
                  </div>
                </div>
              )}
            </Card>
          </section>

          {/* 6. Community Activity */}
          <section className="space-y-3">
            <div className="border-b border-[#e6e2dc] dark:border-[#24312b] pb-2">
              <span className="text-[11px] font-bold uppercase tracking-wider text-[#0f6b4f] dark:text-[#5cc9a0]">
                6. Community Engagement & Corroboration
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Left: Engagement Counts */}
              <Card className="p-5 bg-white dark:bg-[#141d19] border border-[#e6e2dc] dark:border-[#24312b] shadow-xs space-y-3">
                <h4 className="font-semibold text-xs uppercase tracking-wider text-[#78716c] dark:text-[#9aa8a1]">
                  Citizen Backing
                </h4>

                <div className="flex items-center gap-6">
                  <div className="flex items-center gap-2">
                    <div className="w-9 h-9 rounded-xl bg-[#0f6b4f]/10 text-[#0f6b4f] flex items-center justify-center">
                      <Users className="w-4 h-4" />
                    </div>
                    <div>
                      <span className="text-lg font-bold text-[#1c1917] dark:text-[#ece9e1] block">
                        {problem.reportCount}
                      </span>
                      <span className="text-[11px] text-[#78716c]">Corroborating Reports</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <div className="w-9 h-9 rounded-xl bg-amber-500/10 text-amber-600 flex items-center justify-center">
                      <ThumbsUp className="w-4 h-4" />
                    </div>
                    <div>
                      <span className="text-lg font-bold text-[#1c1917] dark:text-[#ece9e1] block">
                        {problem.supportCount}
                      </span>
                      <span className="text-[11px] text-[#78716c]">Citizen Backers</span>
                    </div>
                  </div>
                </div>
              </Card>

              {/* Right: Comments Stream */}
              <Card className="p-5 bg-white dark:bg-[#141d19] border border-[#e6e2dc] dark:border-[#24312b] shadow-xs space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="font-semibold text-xs uppercase tracking-wider text-[#78716c] dark:text-[#9aa8a1]">
                    Citizen Comments ({problem.comments?.length || 0})
                  </h4>
                  <MessageSquare className="w-4 h-4 text-[#78716c]" />
                </div>

                <div className="max-h-40 overflow-y-auto space-y-2 pr-1 text-xs">
                  {problem.comments && problem.comments.length > 0 ? (
                    problem.comments.map((comm) => (
                      <div
                        key={comm.id}
                        className="p-2.5 rounded-lg bg-[#faf8f4] dark:bg-[#0e1512] border border-[#e6e2dc] dark:border-[#24312b]"
                      >
                        <div className="flex items-center justify-between text-[11px] text-[#78716c] mb-1">
                          <span className="font-semibold text-[#1c1917] dark:text-[#ece9e1]">
                            {comm.user?.name || 'Citizen'}
                          </span>
                          <span>{formatDate(comm.createdAt)}</span>
                        </div>
                        <p className="text-[#44403c] dark:text-[#d6d3d1]">{comm.content}</p>
                      </div>
                    ))
                  ) : (
                    <p className="text-[#78716c] py-2 text-center">No citizen comments logged yet.</p>
                  )}
                </div>
              </Card>
            </div>
          </section>

          {/* 7. Timeline */}
          <section className="space-y-3">
            <div className="border-b border-[#e6e2dc] dark:border-[#24312b] pb-2">
              <span className="text-[11px] font-bold uppercase tracking-wider text-[#0f6b4f] dark:text-[#5cc9a0]">
                7. Problem Lifecycle Timeline
              </span>
            </div>

            <Card className="p-5 sm:p-6 bg-white dark:bg-[#141d19] border border-[#e6e2dc] dark:border-[#24312b] shadow-xs">
              <TimelineWidget timeline={problem.timeline} />
            </Card>
          </section>
        </div>
      </main>

      {/* Verification Modal */}
      <VerifyModal
        isOpen={isVerifyOpen}
        onClose={() => setIsVerifyOpen(false)}
        onConfirm={handleVerifyConfirm}
        currentPriority={effectivePriority}
        problemTitle={problem.title}
      />

      {/* Reject Modal */}
      <RejectModal
        isOpen={isRejectOpen}
        onClose={() => setIsRejectOpen(false)}
        onConfirm={handleRejectConfirm}
        problemTitle={problem.title}
      />

      {/* Mark Duplicate Modal */}
      <MarkDuplicateModal
        isOpen={isDuplicateOpen}
        onClose={() => setIsDuplicateOpen(false)}
        onConfirm={handleDuplicateConfirm}
        problemTitle={problem.title}
        problemId={problem.id}
        candidateDuplicates={candidateDuplicates}
      />

      {/* Assign Department Modal */}
      <AssignDepartmentModal
        isOpen={isAssignOpen}
        onClose={() => setIsAssignOpen(false)}
        onConfirm={handleAssignConfirm}
        problemTitle={problem.title}
        problemCategory={problem.category}
        currentDepartmentId={problem.department?.id || (problem as unknown as { departmentId?: string }).departmentId}
        departments={departments}
      />

      {/* Update Status Modal */}
      <UpdateStatusModal
        isOpen={isStatusOpen}
        onClose={() => setIsStatusOpen(false)}
        onConfirm={handleStatusConfirm}
        problemTitle={problem.title}
        currentStatus={problem.status}
        allowedTransitions={allowedTransitions}
      />

      {/* Resolve Modal (Phase 23) */}
      <ResolveModal
        isOpen={isResolveOpen}
        onClose={() => setIsResolveOpen(false)}
        onConfirm={handleResolveConfirm}
        problemTitle={problem.title}
        problemCategory={problem.category}
        departmentName={problem.department?.name}
      />
    </div>
  );
}
