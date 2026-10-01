'use client';

import React, { useState } from 'react';
import { AdminCandidateDuplicate } from '../../types/admin';
import { Button } from '../ui/Button';
import { Copy, X, AlertTriangle, MapPin, Users, CheckCircle } from 'lucide-react';
import { StatusPill } from '../ui/StatusPill';

export interface MarkDuplicateModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (payload: { canonicalProblemId: string; note?: string }) => Promise<void>;
  problemTitle: string;
  problemId: string;
  candidateDuplicates: AdminCandidateDuplicate[];
}

export const MarkDuplicateModal: React.FC<MarkDuplicateModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  problemTitle,
  problemId,
  candidateDuplicates,
}) => {
  const [canonicalId, setCanonicalId] = useState<string>('');
  const [note, setNote] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!canonicalId.trim()) {
      setError('Please select or enter the Canonical Problem ID to merge with.');
      return;
    }
    if (canonicalId.trim() === problemId) {
      setError('A problem cannot be marked as a duplicate of itself.');
      return;
    }

    try {
      setIsSubmitting(true);
      setError(null);
      await onConfirm({
        canonicalProblemId: canonicalId.trim(),
        note: note.trim() || undefined,
      });
      onClose();
    } catch (err: unknown) {
      const axiosError = err as { response?: { data?: { message?: string } } };
      setError(axiosError?.response?.data?.message || 'Failed to mark duplicate.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="bg-white dark:bg-[#141d19] border border-[#e6e2dc] dark:border-[#24312b] rounded-2xl max-w-lg w-full p-6 shadow-xl space-y-5">
        {/* Header */}
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0">
              <Copy className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-heading font-bold text-lg text-[#1c1917] dark:text-[#ece9e1]">
                Mark as Duplicate
              </h3>
              <p className="text-xs text-[#78716c] dark:text-[#9aa8a1]">
                Merge reports into an existing canonical problem
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-[#78716c] hover:bg-[#faf8f4] dark:hover:bg-[#1a2621] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Current Problem Target */}
        <div className="p-3 rounded-lg bg-[#faf8f4] dark:bg-[#0e1512] border border-[#e6e2dc] dark:border-[#24312b]">
          <span className="text-[11px] font-semibold text-[#78716c] dark:text-[#9aa8a1] uppercase tracking-wider block mb-0.5">
            Current Problem to Mark as Duplicate
          </span>
          <p className="text-xs font-medium text-[#1c1917] dark:text-[#ece9e1] line-clamp-1">
            {problemTitle}
          </p>
          <span className="text-[10px] text-[#78716c] font-mono">#{problemId}</span>
        </div>

        {error && (
          <div className="p-3 rounded-lg bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900 text-xs text-red-700 dark:text-red-300 flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Nearby Candidate Duplicates */}
          {candidateDuplicates.length > 0 && (
            <div className="space-y-2">
              <label className="text-xs font-semibold text-[#1c1917] dark:text-[#ece9e1] flex items-center justify-between">
                <span>Nearby Candidate Problems</span>
                <span className="text-[11px] text-[#0f6b4f] dark:text-[#5cc9a0] font-normal">
                  Found {candidateDuplicates.length} nearby
                </span>
              </label>

              <div className="max-h-44 overflow-y-auto space-y-2 pr-1">
                {candidateDuplicates.map((cand) => (
                  <div
                    key={cand.id}
                    onClick={() => setCanonicalId(cand.id)}
                    className={`p-2.5 rounded-xl border cursor-pointer text-xs transition-all ${
                      canonicalId === cand.id
                        ? 'border-[#0f6b4f] bg-[#0f6b4f]/10 text-[#0f6b4f] dark:text-[#5cc9a0]'
                        : 'border-[#e6e2dc] dark:border-[#24312b] bg-white dark:bg-[#141d19] hover:bg-[#faf8f4]'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="font-semibold text-[#1c1917] dark:text-[#ece9e1] truncate">
                        {cand.title}
                      </div>
                      <StatusPill status={cand.status} size="sm" />
                    </div>
                    <div className="flex items-center gap-3 mt-1 text-[11px] text-[#78716c] dark:text-[#9aa8a1]">
                      <span className="flex items-center gap-0.5">
                        <MapPin className="w-3 h-3" />
                        {cand.distanceMeters}m away
                      </span>
                      <span>•</span>
                      <span className="flex items-center gap-0.5">
                        <Users className="w-3 h-3" />
                        {cand.reportCount} reports
                      </span>
                      <span>•</span>
                      <span className="font-mono text-[10px]">#{cand.id.slice(0, 8)}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Canonical Problem ID */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-[#1c1917] dark:text-[#ece9e1] flex items-center justify-between">
              <span>Canonical Problem ID *</span>
              <span className="text-[10px] text-amber-600 font-normal">Parent Record</span>
            </label>
            <input
              type="text"
              required
              value={canonicalId}
              onChange={(e) => setCanonicalId(e.target.value)}
              placeholder="e.g., cm... (select from above or paste ID)"
              className="w-full p-2.5 text-xs font-mono rounded-xl border border-[#e6e2dc] dark:border-[#24312b] bg-[#faf8f4] dark:bg-[#0e1512] text-[#1c1917] dark:text-[#ece9e1] placeholder-[#78716c] focus:outline-none focus:ring-1 focus:ring-amber-500"
            />
          </div>

          {/* Optional Note */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-[#1c1917] dark:text-[#ece9e1] block">
              Merger Note <span className="text-[#78716c] font-normal">(optional)</span>
            </label>
            <textarea
              rows={2}
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="e.g., Confirmed eyewitness duplicate at same intersection."
              className="w-full p-2.5 text-xs rounded-xl border border-[#e6e2dc] dark:border-[#24312b] bg-[#faf8f4] dark:bg-[#0e1512] text-[#1c1917] dark:text-[#ece9e1] placeholder-[#78716c] focus:outline-none focus:ring-1 focus:ring-amber-500"
            />
          </div>

          <p className="text-[11px] text-[#78716c] dark:text-[#9aa8a1]">
            Marking duplicate will increment the report count and recalculate priority on the canonical problem.
          </p>

          {/* Action Buttons */}
          <div className="flex items-center justify-end gap-3 pt-2">
            <Button
              type="button"
              variant="outline"
              size="md"
              onClick={onClose}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              size="md"
              disabled={isSubmitting || !canonicalId.trim()}
              className="bg-amber-600 hover:bg-amber-700 text-white gap-1.5"
            >
              <CheckCircle className="w-4 h-4" />
              <span>{isSubmitting ? 'Merging...' : 'Mark Duplicate'}</span>
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};
