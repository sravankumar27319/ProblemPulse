'use client';

import React, { useState, useEffect, use } from 'react';
import Link from 'next/link';
import { Header } from '../../../components/landing/Header';
import { Footer } from '../../../components/landing/Footer';
import { ProblemHeader } from '../../../components/problems/ProblemHeader';
import { MediaGallery } from '../../../components/problems/MediaGallery';
import { LocationView } from '../../../components/problems/LocationView';
import { TimelineWidget } from '../../../components/problems/TimelineWidget';
import { CommentSection } from '../../../components/problems/CommentSection';
import { ResolutionProofCard } from '../../../components/problems/ResolutionProofCard';
import { CommunityVerificationCard } from '../../../components/problems/CommunityVerificationCard';
import { CommunityEngagementStats } from '../../../components/ui/CommunityEngagementStats';
import { Card } from '../../../components/ui/Card';
import { Button } from '../../../components/ui/Button';
import { Loading } from '../../../components/ui/Loading';
import { ErrorMessage } from '../../../components/ui/ErrorMessage';
import { problemService } from '../../../services/problem.service';
import { ProblemDetail } from '../../../types/problem';
import { FEATURED_PROBLEMS } from '../../../constants/landing';
import {
  ThumbsUp,
  ArrowLeft,
  Share2,
} from 'lucide-react';

export default function ProblemDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const resolvedParams = use(params);
  const problemId = resolvedParams.id;

  const [problem, setProblem] = useState<ProblemDetail | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [isSupported, setIsSupported] = useState<boolean>(false);
  const [supportCount, setSupportCount] = useState<number>(0);
  const [copied, setCopied] = useState<boolean>(false);
  const [liveStatus, setLiveStatus] = useState<string | null>(null);

  useEffect(() => {
    const loadProblem = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const res = await problemService.fetchProblemById(problemId);
        if (res.success && res.problem) {
          setProblem(res.problem);
          setIsSupported(Boolean(res.problem.isSupportedByMe ?? res.problem.isSupported ?? res.problem.supported));
          setSupportCount(res.problem.supportCount);
        }
      } catch {
        // Mock fallback preview for mock IDs / offline dev
        const fallback = FEATURED_PROBLEMS.find((p) => p.id === problemId) || FEATURED_PROBLEMS[0];
        if (fallback) {
          const detailFallback: ProblemDetail = {
            ...fallback,
            peopleAffected: 120,
            state: 'Metro State',
            media: fallback.media || [],
            timeline: [
              {
                id: 't1',
                fromStatus: null,
                toStatus: 'SUBMITTED',
                note: 'Citizen submitted report with evidence.',
                createdAt: fallback.createdAt,
                actor: { id: 'u1', name: 'Citizen Reporter', role: 'USER' },
              },
              {
                id: 't2',
                fromStatus: 'SUBMITTED',
                toStatus: 'UNDER_REVIEW',
                note: 'Municipal triage team started review.',
                createdAt: fallback.createdAt,
                actor: { id: 'u2', name: 'Triage Officer', role: 'ADMIN' },
              },
              {
                id: 't3',
                fromStatus: 'UNDER_REVIEW',
                toStatus: fallback.status,
                note: 'Problem priority confirmed and assigned to maintenance.',
                createdAt: fallback.updatedAt,
                actor: { id: 'u3', name: 'Public Works Admin', role: 'ADMIN' },
              },
            ],
            comments: [
              {
                id: 'c1',
                content: 'Water pressure has dropped across the entire sector as well. Needs urgent attention.',
                isFlagged: false,
                createdAt: fallback.createdAt,
                user: { id: 'u4', name: 'Ravi K.' },
              },
            ],
            isSupportedByMe: false,
            isReportedByMe: false,
          };

          setProblem(detailFallback);
          setSupportCount(detailFallback.supportCount);
        } else {
          setError('Problem not found');
        }
      } finally {
        setIsLoading(false);
      }
    };

    loadProblem();
  }, [problemId]);

  const [isTogglingSupport, setIsTogglingSupport] = useState<boolean>(false);
  const [supportNotice, setSupportNotice] = useState<string | null>(null);

  const handleSupportClick = async () => {
    if (isTogglingSupport || !problem) return;
    const nextState = !isSupported;

    // Optimistic UI update
    setIsSupported(nextState);
    setSupportCount((prev) => (nextState ? prev + 1 : Math.max(0, prev - 1)));
    setIsTogglingSupport(true);
    setSupportNotice(null);

    try {
      const res = await problemService.toggleSupport(problem.id, isSupported);
      const nextSupported = res.isSupported ?? res.supported ?? nextState;
      setIsSupported(nextSupported);
      setSupportCount(res.supportCount);
      if (res.priority) {
        setProblem((prev) =>
          prev ? { ...prev, priority: res.priority!, supportCount: res.supportCount } : prev
        );
      }
    } catch (err: unknown) {
      const axiosError = err as { response?: { status?: number; data?: { message?: string } } };
      if (axiosError?.response?.status === 401) {
        setSupportNotice('Please sign in to back and support this problem.');
      } else {
        setSupportNotice(axiosError?.response?.data?.message || 'Unable to update support. Please try again.');
      }
      // Revert optimistic update
      setIsSupported(!nextState);
      setSupportCount((prev) => (!nextState ? prev + 1 : Math.max(0, prev - 1)));
    } finally {
      setIsTogglingSupport(false);
    }
  };

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col bg-[#faf8f4] dark:bg-[#0e1512]">
        <Header />
        <main className="flex-1 flex items-center justify-center p-6">
          <Loading size="lg" text="Loading problem details..." />
        </main>
        <Footer />
      </div>
    );
  }

  if (error || !problem) {
    return (
      <div className="min-h-screen flex flex-col bg-[#faf8f4] dark:bg-[#0e1512]">
        <Header />
        <main className="flex-1 max-w-4xl mx-auto px-4 py-12 w-full space-y-6">
          <ErrorMessage
            title="Problem Not Found"
            message={error || 'The requested problem could not be found or has been removed.'}
          />
          <Link href="/discover">
            <Button variant="outline" leftIcon={<ArrowLeft className="w-4 h-4" />}>
              Back to Discover Feed
            </Button>
          </Link>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-[#faf8f4] dark:bg-[#0e1512] text-[#14201c] dark:text-[#ece9e1]">
      <Header />

      <main className="flex-1 max-w-6xl mx-auto px-4 sm:px-6 py-8 sm:py-12 w-full space-y-8">
        {/* Top Back Navigation Bar */}
        <div className="flex items-center justify-between gap-4">
          <Link
            href="/discover"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#5d6b65] dark:text-[#9aa8a1] hover:text-[#14201c] dark:hover:text-[#ece9e1] transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Problems</span>
          </Link>

          <Button
            variant="outline"
            size="sm"
            onClick={handleShare}
            leftIcon={<Share2 className="w-3.5 h-3.5" />}
          >
            {copied ? 'Link Copied!' : 'Share Problem'}
          </Button>
        </div>

        {/* 1. Header (Priority + Title) */}
        <ProblemHeader problem={problem} />

        {/* Main Grid: Left details & Right summary rail */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left Column (8 cols): Media, Description, Resolution, Comments */}
          <div className="lg:col-span-8 space-y-8">
            {/* 2. Media Gallery */}
            {problem.media && problem.media.length > 0 && (
              <MediaGallery media={problem.media} />
            )}

            {/* 3. Description & Impact */}
            <div className="space-y-3">
              <h3 className="font-heading text-lg font-medium text-[#14201c] dark:text-[#ece9e1]">
                Problem Description
              </h3>
              <p className="text-sm text-[#44403c] dark:text-[#9aa8a1] leading-relaxed bg-white dark:bg-[#141d19] p-5 rounded-2xl border border-[#e5e1d8] dark:border-[#24312b]">
                {problem.description}
              </p>
            </div>

            {/* Resolution Section if present (Phase 23) */}
            {problem.resolution && (
              <div className="space-y-3">
                <ResolutionProofCard resolution={problem.resolution} />
              </div>
            )}

            {/* Community Verification (Phase 25) */}
            <CommunityVerificationCard
              problemId={problem.id}
              problemStatus={liveStatus || problem.status}
              onStatusChange={(newStatus) => setLiveStatus(newStatus)}
            />

            {/* 4. Timeline Widget */}
            <TimelineWidget timeline={problem.timeline} />

            {/* 5. Community Discussion / Comments (Phase 15) */}
            <CommentSection problemId={problem.id} initialComments={problem.comments} />
          </div>

          {/* Right Column (4 cols): Location, Engagement Action, Current Status */}
          <div className="lg:col-span-4 space-y-6">
            {/* Support Action Card */}
            <Card className="p-6 bg-white dark:bg-[#141d19] border border-[#e5e1d8] dark:border-[#24312b] space-y-5 shadow-xs">
              <div>
                <span className="text-xs font-semibold uppercase tracking-wider text-[#0f6b4f] dark:text-[#5cc9a0]">
                  COMMUNITY IMPACT
                </span>
                <h4 className="font-heading text-xl font-medium text-[#14201c] dark:text-[#ece9e1] mt-1">
                  Back This Problem
                </h4>
                <p className="text-xs text-[#5d6b65] dark:text-[#9aa8a1] mt-1 leading-relaxed">
                  Support this report to increase its municipal priority score and accelerate departmental dispatch.
                </p>
              </div>

              {/* Engagement Stats Breakdown (Phase 12: Surfaced Combined Metric + Detailed Breakdown) */}
              <CommunityEngagementStats
                reportCount={problem.reportCount}
                supportCount={supportCount}
                isSupportedByMe={isSupported}
                variant="detailed"
              />

              {/* Support Button */}
              <Button
                variant={isSupported ? 'primary' : 'outline'}
                fullWidth
                size="lg"
                onClick={handleSupportClick}
                disabled={isTogglingSupport}
                leftIcon={
                  <ThumbsUp className={`w-4 h-4 ${isSupported ? 'fill-current' : ''}`} />
                }
              >
                {isSupported ? 'Supported by You' : 'Support Problem'}
              </Button>

              {supportNotice && (
                <div className="p-3 bg-amber-500/10 border border-amber-500/30 rounded-xl text-xs text-amber-800 dark:text-amber-300 flex flex-col gap-1.5 animate-in fade-in duration-200">
                  <span>{supportNotice}</span>
                  <Link
                    href={`/login?redirect=/problems/${problem.id}`}
                    className="font-semibold underline hover:text-amber-900 dark:hover:text-amber-200"
                  >
                    Go to Login &rarr;
                  </Link>
                </div>
              )}
            </Card>

            {/* Location View */}
            <LocationView
              address={problem.address}
              area={problem.area}
              city={problem.city}
              state={problem.state}
              latitude={problem.latitude}
              longitude={problem.longitude}
            />

            {/* Severity & Affected Stats */}
            <Card className="p-5 bg-white dark:bg-[#141d19] border border-[#e5e1d8] dark:border-[#24312b] space-y-3">
              <div className="flex items-center justify-between text-xs text-[#5d6b65] dark:text-[#9aa8a1]">
                <span>Severity Score:</span>
                <span className="font-bold text-[#14201c] dark:text-[#ece9e1]">{problem.severity} / 10</span>
              </div>
              <div className="flex items-center justify-between text-xs text-[#5d6b65] dark:text-[#9aa8a1] pt-2 border-t border-[#e5e1d8] dark:border-[#24312b]">
                <span>Estimated Affected:</span>
                <span className="font-bold text-[#14201c] dark:text-[#ece9e1]">
                  {problem.peopleAffected || '50+'} residents
                </span>
              </div>
            </Card>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
