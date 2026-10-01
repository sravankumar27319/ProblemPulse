'use client';

/* eslint-disable @next/next/no-img-element */
import React, { useState } from 'react';
import Link from 'next/link';
import { CommentItem } from '../../types/problem';
import { problemService } from '../../services/problem.service';
import { useAuth } from '../../hooks/useAuth';
import { Button } from '../ui/Button';
import { formatDate } from '../../utils/formatters';
import {
  MessageSquare,
  Send,
  Flag,
  ShieldAlert,
  Check,
  AlertCircle,
  Clock,
  User,
} from 'lucide-react';

interface CommentSectionProps {
  problemId: string;
  initialComments?: CommentItem[];
}

export const CommentSection: React.FC<CommentSectionProps> = ({
  problemId,
  initialComments = [],
}) => {
  const { user } = useAuth();
  const [comments, setComments] = useState<CommentItem[]>(initialComments);
  const [newComment, setNewComment] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [flaggingId, setFlaggingId] = useState<string | null>(null);
  const [flaggedIds, setFlaggedIds] = useState<Set<string>>(
    new Set(initialComments.filter((c) => c.isFlagged).map((c) => c.id))
  );
  const [error, setError] = useState<string | null>(null);
  const [actionNotice, setActionNotice] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim() || isSubmitting) return;

    if (!user) {
      setError('Please sign in to post a comment or update.');
      return;
    }

    setIsSubmitting(true);
    setError(null);
    setActionNotice(null);

    try {
      const res = await problemService.createComment(problemId, newComment.trim());
      if (res.success && res.comment) {
        setComments((prev) => [res.comment, ...prev]);
        setNewComment('');
        setActionNotice('Comment added to discussion.');
        setTimeout(() => setActionNotice(null), 3000);
      }
    } catch (err: unknown) {
      const axiosError = err as { response?: { data?: { message?: string } } };
      setError(axiosError?.response?.data?.message || 'Failed to post comment. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleFlag = async (commentId: string) => {
    if (flaggedIds.has(commentId) || flaggingId) return;

    if (!user) {
      setError('Please sign in to report comments for moderation.');
      return;
    }

    setFlaggingId(commentId);
    setError(null);

    try {
      const res = await problemService.flagComment(problemId, commentId);
      if (res.success) {
        setFlaggedIds((prev) => new Set([...prev, commentId]));
        setActionNotice('Comment flagged for moderation review.');
        setTimeout(() => setActionNotice(null), 4000);
      }
    } catch (err: unknown) {
      const axiosError = err as { response?: { data?: { message?: string } } };
      setError(axiosError?.response?.data?.message || 'Failed to report comment. Please try again.');
    } finally {
      setFlaggingId(null);
    }
  };

  return (
    <div className="space-y-6 pt-4 border-t border-[#e5e1d8] dark:border-[#24312b]">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <MessageSquare className="w-5 h-5 text-[#0f6b4f] dark:text-[#5cc9a0]" />
          <h3 className="font-heading text-lg font-medium text-[#14201c] dark:text-[#ece9e1]">
            Community Discussion ({comments.length})
          </h3>
        </div>
        <span className="text-xs text-[#5d6b65] dark:text-[#9aa8a1]">
          Public Citizen Thread
        </span>
      </div>

      {/* Notifications / Alerts */}
      {actionNotice && (
        <div className="p-3 bg-[#e3f0ea] dark:bg-[#173026] text-[#0f6b4f] dark:text-[#5cc9a0] rounded-xl text-xs flex items-center gap-2 font-medium animate-in fade-in duration-200">
          <Check className="w-4 h-4 shrink-0" />
          <span>{actionNotice}</span>
        </div>
      )}

      {error && (
        <div className="p-3 bg-red-500/10 border border-red-500/30 text-red-600 dark:text-red-400 rounded-xl text-xs flex items-center justify-between gap-2 animate-in fade-in duration-200">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
          {!user && (
            <Link
              href={`/login?redirect=/problems/${problemId}`}
              className="font-semibold underline hover:text-red-700 dark:hover:text-red-300"
            >
              Sign In
            </Link>
          )}
        </div>
      )}

      {/* Comment Input Form */}
      {user ? (
        <form onSubmit={handleSubmit} className="space-y-3">
          <div className="relative">
            <textarea
              rows={3}
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              maxLength={1000}
              placeholder="Share an eyewitness update, mention local impact, or add community context..."
              className="w-full text-sm rounded-xl p-3.5 bg-white dark:bg-[#141d19] border border-[#e5e1d8] dark:border-[#24312b] text-[#14201c] dark:text-[#ece9e1] placeholder-[#5d6b65] dark:placeholder-[#5a6862] focus:outline-none focus:ring-2 focus:ring-[#0f6b4f] resize-none transition-all"
            />
            <div className="absolute right-3 bottom-3 text-[10px] text-[#5d6b65] dark:text-[#9aa8a1]">
              {newComment.length}/1000
            </div>
          </div>
          <div className="flex items-center justify-between">
            <p className="text-[11px] text-[#5d6b65] dark:text-[#9aa8a1]">
              Signed in as <span className="font-semibold text-[#14201c] dark:text-[#ece9e1]">{user.name}</span>
            </p>
            <Button
              type="submit"
              size="sm"
              isLoading={isSubmitting}
              disabled={!newComment.trim() || isSubmitting}
              rightIcon={<Send className="w-3.5 h-3.5" />}
            >
              Post Comment
            </Button>
          </div>
        </form>
      ) : (
        <div className="p-4 bg-white dark:bg-[#141d19] rounded-xl border border-[#e5e1d8] dark:border-[#24312b] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs">
          <div className="space-y-0.5">
            <span className="font-semibold text-[#14201c] dark:text-[#ece9e1]">
              Join the conversation
            </span>
            <p className="text-[#5d6b65] dark:text-[#9aa8a1]">
              Sign in to contribute eyewitness updates, local advice, or report inaccuracies.
            </p>
          </div>
          <Link href={`/login?redirect=/problems/${problemId}`}>
            <Button size="sm" variant="outline">
              Sign In to Comment
            </Button>
          </Link>
        </div>
      )}

      {/* Comments List */}
      <div className="space-y-3">
        {comments.length > 0 ? (
          comments.map((comment) => {
            const isFlagged = flaggedIds.has(comment.id);

            return (
              <div
                key={comment.id}
                className="p-4 rounded-xl bg-white dark:bg-[#141d19] border border-[#e5e1d8] dark:border-[#24312b] space-y-2.5 transition-all"
              >
                {/* Comment Header */}
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2.5">
                    {/* User Avatar / Initials */}
                    <div className="w-7 h-7 rounded-full bg-[#e3f0ea] dark:bg-[#1c2e26] text-[#0f6b4f] dark:text-[#5cc9a0] font-bold text-xs flex items-center justify-center border border-[#0f6b4f]/20">
                      {comment.user.avatarUrl ? (
                        <img
                          src={comment.user.avatarUrl}
                          alt={comment.user.name}
                          className="w-full h-full rounded-full object-cover"
                        />
                      ) : (
                        <span>{comment.user.name?.charAt(0).toUpperCase() || <User className="w-3.5 h-3.5" />}</span>
                      )}
                    </div>
                    <div>
                      <div className="font-semibold text-xs text-[#14201c] dark:text-[#ece9e1]">
                        {comment.user.name}
                      </div>
                      <div className="text-[10px] text-[#5d6b65] dark:text-[#9aa8a1] flex items-center gap-1">
                        <Clock className="w-2.5 h-2.5" />
                        <span>{formatDate(comment.createdAt)}</span>
                      </div>
                    </div>
                  </div>

                  {/* Flag / Moderation Action */}
                  <div className="flex items-center gap-1.5">
                    {isFlagged ? (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-semibold bg-amber-500/10 text-amber-700 dark:text-amber-400 border border-amber-500/20">
                        <ShieldAlert className="w-3 h-3" />
                        <span>Under Review</span>
                      </span>
                    ) : (
                      <button
                        type="button"
                        onClick={() => handleFlag(comment.id)}
                        disabled={flaggingId === comment.id}
                        title="Flag comment for inappropriate content"
                        className="inline-flex items-center gap-1 text-[11px] text-[#5d6b65] dark:text-[#9aa8a1] hover:text-amber-600 dark:hover:text-amber-400 p-1 rounded transition-colors"
                      >
                        <Flag className="w-3 h-3" />
                        <span className="hidden sm:inline">Report</span>
                      </button>
                    )}
                  </div>
                </div>

                {/* Comment Text */}
                <p className="text-xs text-[#44403c] dark:text-[#d1cdc7] leading-relaxed whitespace-pre-line pl-9">
                  {comment.content}
                </p>
              </div>
            );
          })
        ) : (
          <div className="p-6 rounded-xl bg-white dark:bg-[#141d19] border border-[#e5e1d8] dark:border-[#24312b] text-center space-y-1">
            <MessageSquare className="w-6 h-6 text-[#5d6b65] dark:text-[#9aa8a1] mx-auto opacity-50" />
            <p className="text-xs font-semibold text-[#14201c] dark:text-[#ece9e1]">
              No community comments yet
            </p>
            <p className="text-[11px] text-[#5d6b65] dark:text-[#9aa8a1]">
              Be the first to share an eyewitness update or report local changes.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
