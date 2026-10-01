'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { problemService } from '../../services/problem.service';
import { CommunityVerificationData } from '../../types/problem';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { cn } from '../../lib/utils';
import {
  CheckCircle2,
  XCircle,
  Clock,
  Users,
  ShieldCheck,
  AlertTriangle,
  CheckCheck,
  RotateCcw,
  MessageSquare,
  ThumbsUp,
  ThumbsDown,
} from 'lucide-react';
import { formatDate } from '../../utils/formatters';

export interface CommunityVerificationCardProps {
  problemId: string;
  problemStatus: string;
  onStatusChange?: (newStatus: string) => void;
  className?: string;
}

const RELEVANT_STATUSES = ['RESOLVED', 'COMMUNITY_VERIFIED', 'CLOSED', 'REOPENED'];

export const CommunityVerificationCard: React.FC<CommunityVerificationCardProps> = ({
  problemId,
  problemStatus,
  onStatusChange,
  className = '',
}) => {
  const { user } = useAuth();

  const [data, setData] = useState<CommunityVerificationData | null>(null);
  const [isLoading, setIsLoading] = useState(() =>
    RELEVANT_STATUSES.includes(problemStatus)
  );
  const [isVoting, setIsVoting] = useState(false);
  const [comment, setComment] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [voteSuccess, setVoteSuccess] = useState<string | null>(null);

  const applyVerificationResponse = useCallback(
    (res: { success: boolean; data: CommunityVerificationData }) => {
      if (res.success) {
        setData(res.data);
        if (onStatusChange && res.data.status !== problemStatus) {
          onStatusChange(res.data.status);
        }
      }
    },
    [onStatusChange, problemStatus]
  );

  const loadVerification = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const res = await problemService.fetchVerification(problemId);
      applyVerificationResponse(res);
    } catch {
      setError('Could not load community verification data.');
    } finally {
      setIsLoading(false);
    }
  }, [problemId, applyVerificationResponse]);

  useEffect(() => {
    if (!RELEVANT_STATUSES.includes(problemStatus)) return;

    let cancelled = false;
    problemService
      .fetchVerification(problemId)
      .then((res) => {
        if (cancelled) return;
        applyVerificationResponse(res);
      })
      .catch(() => {
        if (!cancelled) setError('Could not load community verification data.');
      })
      .finally(() => {
        if (!cancelled) setIsLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [problemId, problemStatus, applyVerificationResponse]);


  const handleVote = async (isFixed: boolean) => {
    if (!user) return;

    try {
      setIsVoting(true);
      setError(null);
      setVoteSuccess(null);

      const res = await problemService.castVerificationVote(
        problemId,
        isFixed,
        comment.trim() || undefined
      );

      if (res.success) {
        setData(res.data);
        setVoteSuccess(res.message || (isFixed ? 'Marked as fixed!' : 'Dispute recorded.'));
        setComment('');
        if (onStatusChange && res.data.status !== problemStatus) {
          onStatusChange(res.data.status);
        }
      }
    } catch (err: unknown) {
      const axiosError = err as { response?: { data?: { message?: string } } };
      setError(axiosError?.response?.data?.message || 'Failed to cast your vote. Please try again.');
    } finally {
      setIsVoting(false);
    }
  };

  // Only show for relevant statuses — AFTER all hooks
  if (!RELEVANT_STATUSES.includes(problemStatus)) return null;

  if (isLoading && !data) {
    return (
      <Card
        className={`p-5 border border-[#e5e1d8] dark:border-[#24312b] bg-white dark:bg-[#141d19] animate-pulse ${className}`}
      >
        <div className="h-4 w-2/3 bg-gray-200 dark:bg-gray-700 rounded mb-3" />
        <div className="h-16 bg-gray-100 dark:bg-gray-800 rounded" />
      </Card>
    );
  }

  if (!data) return null;

  const { yesVotes, noVotes, threshold, totalEligible, daysRemaining, canVote, userVote } = data;
  const total = yesVotes + noVotes;
  const yesPercent = total > 0 ? Math.round((yesVotes / total) * 100) : 0;
  const noPercent = total > 0 ? Math.round((noVotes / total) * 100) : 0;

  const isTerminal = data.isClosed || data.isReopened;

  return (
    <Card
      className={cn(
        'p-5 space-y-4 border shadow-xs',
        data.isClosed
          ? 'bg-gradient-to-br from-teal-50/40 to-white dark:from-teal-950/20 dark:to-[#141d19] border-teal-400/30'
          : data.isReopened
          ? 'bg-gradient-to-br from-orange-50/40 to-white dark:from-orange-950/20 dark:to-[#141d19] border-orange-400/30'
          : data.isCommunityVerified
          ? 'bg-gradient-to-br from-emerald-50/40 to-white dark:from-emerald-950/20 dark:to-[#141d19] border-emerald-400/30'
          : 'bg-white dark:bg-[#141d19] border-[#e5e1d8] dark:border-[#24312b]',
        className
      )}
    >
      {/* Header */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-2">
          <div
            className={cn(
              'w-9 h-9 rounded-xl flex items-center justify-center shrink-0',
              data.isClosed
                ? 'bg-teal-500/10 text-teal-600 dark:text-teal-400'
                : data.isReopened
                ? 'bg-orange-500/10 text-orange-600 dark:text-orange-400'
                : data.isCommunityVerified
                ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
                : 'bg-blue-500/10 text-blue-600 dark:text-blue-400'
            )}
          >
            {data.isClosed ? (
              <CheckCheck className="w-5 h-5" />
            ) : data.isReopened ? (
              <RotateCcw className="w-5 h-5" />
            ) : data.isCommunityVerified ? (
              <ShieldCheck className="w-5 h-5" />
            ) : (
              <Users className="w-5 h-5" />
            )}
          </div>
          <div>
            <h3 className="font-heading text-sm font-bold text-[#14201c] dark:text-[#ece9e1]">
              {data.isClosed
                ? 'Case Officially Closed'
                : data.isReopened
                ? 'Reopened — Municipal Review Required'
                : data.isCommunityVerified
                ? 'Community Verified'
                : 'Community Verification'}
            </h3>
            <p className="text-[11px] text-[#78716c] dark:text-[#9aa8a1]">
              {data.isClosed
                ? 'Citizens confirmed the municipal repair was successful.'
                : data.isReopened
                ? 'Citizens flagged this as still broken. Returned to municipal action queue.'
                : data.isCommunityVerified
                ? 'Community confirmed the fix. Pending final municipal closure.'
                : `${totalEligible} eligible ${totalEligible === 1 ? 'citizen' : 'citizens'} · ${threshold} vote${threshold !== 1 ? 's' : ''} needed · ${daysRemaining} day${daysRemaining !== 1 ? 's' : ''} remaining`}
            </p>
          </div>
        </div>
      </div>

      {/* Auto-close countdown for active RESOLVED */}
      {data.isResolved && !isTerminal && (
        <div className="flex items-center gap-2 text-xs text-[#57534e] dark:text-[#9aa8a1] bg-[#f7f5f0] dark:bg-[#1b2621] rounded-xl px-3 py-2">
          <Clock className="w-3.5 h-3.5 text-amber-500 shrink-0" />
          <span>
            Auto-closes in{' '}
            <strong className="text-[#1c1917] dark:text-[#ece9e1]">{daysRemaining}</strong> days if
            no disputes are filed.
          </span>
        </div>
      )}

      {/* Vote Tally Bars */}
      {(total > 0 || !isTerminal) && (
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs font-medium">
            <div className="flex items-center gap-1 text-emerald-700 dark:text-emerald-400">
              <ThumbsUp className="w-3.5 h-3.5" />
              <span>Yes, it&apos;s fixed ({yesVotes})</span>
            </div>
            <div className="flex items-center gap-1 text-red-600 dark:text-red-400">
              <span>({noVotes}) Problem remains</span>
              <ThumbsDown className="w-3.5 h-3.5" />
            </div>
          </div>

          {/* Combined bar */}
          <div className="w-full h-2.5 rounded-full overflow-hidden bg-[#f0ede6] dark:bg-[#1f2c25] flex">
            {yesPercent > 0 && (
              <div
                className="bg-emerald-500 h-full transition-all duration-500"
                style={{ width: `${yesPercent}%` }}
                title={`${yesVotes} fixed votes`}
              />
            )}
            {noPercent > 0 && (
              <div
                className="bg-red-400 h-full transition-all duration-500"
                style={{ width: `${noPercent}%` }}
                title={`${noVotes} dispute votes`}
              />
            )}
          </div>

          <p className="text-[11px] text-[#78716c] dark:text-[#a8a29e] text-center">
            {total === 0
              ? 'No votes yet — be the first!'
              : `${total} vote${total !== 1 ? 's' : ''} cast · threshold: ${threshold} on either side`}
          </p>
        </div>
      )}

      {/* Existing user vote indicator */}
      {userVote && (
        <div
          className={cn(
            'flex items-center gap-2 text-xs px-3 py-2 rounded-xl border',
            userVote.isFixed
              ? 'bg-emerald-50 dark:bg-emerald-950/30 border-emerald-200 dark:border-emerald-900 text-emerald-800 dark:text-emerald-300'
              : 'bg-red-50 dark:bg-red-950/30 border-red-200 dark:border-red-900 text-red-800 dark:text-red-300'
          )}
        >
          {userVote.isFixed ? (
            <CheckCircle2 className="w-4 h-4 shrink-0" />
          ) : (
            <XCircle className="w-4 h-4 shrink-0" />
          )}
          <div>
            <span className="font-semibold">
              You voted: {userVote.isFixed ? '&quot;Yes, it is fixed&quot;' : '&quot;No, the problem remains&quot;'}
            </span>
            {userVote.comment && (
              <p className="text-[11px] opacity-80 mt-0.5">&quot;{userVote.comment}&quot;</p>
            )}
            <p className="text-[11px] opacity-70 mt-0.5">
              Submitted {formatDate(userVote.createdAt)} · You can change your vote.
            </p>
          </div>
        </div>
      )}

      {/* Feedback banner */}
      {voteSuccess && (
        <div className="flex items-center gap-2 text-xs px-3 py-2 rounded-xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-900 text-emerald-800 dark:text-emerald-300">
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          <span>{voteSuccess}</span>
        </div>
      )}

      {error && (
        <div className="flex items-center gap-2 text-xs px-3 py-2 rounded-xl bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900 text-red-800 dark:text-red-300">
          <AlertTriangle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Voting Panel — only for eligible, authenticated, non-terminal */}
      {!isTerminal && canVote && user && (
        <div className="space-y-3 pt-1 border-t border-[#f0ede6] dark:border-[#22352b]">
          <p className="text-xs font-semibold text-[#44403c] dark:text-[#c2bfb8]">
            Was this municipal repair actually completed?
          </p>

          {/* Optional comment */}
          <div className="flex items-center gap-1.5 text-[11px] text-[#78716c] dark:text-[#9aa8a1]">
            <MessageSquare className="w-3 h-3" />
            <span>Optional: add a comment with your vote</span>
          </div>
          <textarea
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder="e.g. The pothole was repaired but the road markings are still missing."
            maxLength={300}
            rows={2}
            className="w-full text-xs bg-[#f7f5f0] dark:bg-[#1b2621] border border-[#e5e1d8] dark:border-[#24312b] rounded-xl px-3 py-2 text-[#1c1917] dark:text-[#ece9e1] placeholder:text-[#a8a29e] resize-none focus:outline-none focus:ring-2 focus:ring-[#0f6b4f]/20 focus:border-[#0f6b4f]/40 transition"
          />

          <div className="flex gap-3">
            <Button
              variant="primary"
              size="sm"
              fullWidth
              onClick={() => handleVote(true)}
              disabled={isVoting}
              leftIcon={<ThumbsUp className="w-4 h-4" />}
              className="bg-emerald-600 hover:bg-emerald-700 border-emerald-700"
            >
              {isVoting ? 'Submitting...' : 'Yes, it is fixed'}
            </Button>
            <Button
              variant="outline"
              size="sm"
              fullWidth
              onClick={() => handleVote(false)}
              disabled={isVoting}
              leftIcon={<ThumbsDown className="w-4 h-4" />}
              className="text-red-600 dark:text-red-400 border-red-300 dark:border-red-800 hover:bg-red-50 dark:hover:bg-red-950/30"
            >
              {isVoting ? 'Submitting...' : 'No, problem remains'}
            </Button>
          </div>
        </div>
      )}

      {/* Unauthenticated reminder */}
      {!isTerminal && !user && (
        <p className="text-xs text-[#78716c] dark:text-[#9aa8a1] bg-[#f7f5f0] dark:bg-[#1b2621] rounded-xl px-3 py-2">
          Sign in as a reporter or backer of this problem to participate in community verification.
        </p>
      )}

      {/* Ineligible reminder */}
      {!isTerminal && user && !canVote && (
        <p className="text-xs text-[#78716c] dark:text-[#9aa8a1] bg-[#f7f5f0] dark:bg-[#1b2621] rounded-xl px-3 py-2">
          Only citizens who originally reported or supported this problem are eligible to vote.
        </p>
      )}

      {/* Recent votes */}
      {data.votes.length > 0 && (
        <div className="space-y-2 pt-1 border-t border-[#f0ede6] dark:border-[#22352b]">
          <p className="text-[11px] font-bold uppercase tracking-wider text-[#78716c] dark:text-[#9aa8a1]">
            Recent Community Votes
          </p>
          <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
            {data.votes.slice(0, 5).map((vote) => (
              <div key={vote.id} className="flex items-start gap-2">
                <div
                  className={cn(
                    'w-5 h-5 rounded-full flex items-center justify-center shrink-0 mt-0.5',
                    vote.isFixed
                      ? 'bg-emerald-100 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400'
                      : 'bg-red-100 dark:bg-red-950 text-red-500 dark:text-red-400'
                  )}
                >
                  {vote.isFixed ? (
                    <ThumbsUp className="w-2.5 h-2.5" />
                  ) : (
                    <ThumbsDown className="w-2.5 h-2.5" />
                  )}
                </div>
                <div className="min-w-0">
                  <p className="text-xs font-medium text-[#1c1917] dark:text-[#ece9e1] truncate">
                    {vote.user.name}
                    <span className="text-[#78716c] dark:text-[#9aa8a1] font-normal ml-1">
                      · {formatDate(vote.createdAt)}
                    </span>
                  </p>
                  {vote.comment && (
                    <p className="text-[11px] text-[#57534e] dark:text-[#9aa8a1] mt-0.5 line-clamp-2">
                      &quot;{vote.comment}&quot;
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Refresh button for live updates */}
      {!isTerminal && (
        <button
          type="button"
          onClick={loadVerification}
          className="text-[11px] text-[#0f6b4f] dark:text-[#5cc9a0] hover:underline w-full text-center"
        >
          Refresh verification status
        </button>
      )}
    </Card>
  );
};
