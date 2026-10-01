'use client';

import React, { useState } from 'react';
import { Button } from '../ui/Button';
import { AlertOctagon, X, AlertTriangle } from 'lucide-react';

export interface RejectModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (reason: string) => Promise<void>;
  problemTitle: string;
}

const COMMON_REASONS = [
  'Insufficient evidence (unclear or missing media)',
  'Outside municipal jurisdiction or state boundary',
  'Private property dispute (not municipal responsibility)',
  'Issue already resolved prior to inspection',
  'Duplicate non-actionable report or spam',
];

export const RejectModal: React.FC<RejectModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  problemTitle,
}) => {
  const [reason, setReason] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reason.trim()) {
      setError('A specific rejection reason is required by municipal policy.');
      return;
    }

    try {
      setIsSubmitting(true);
      setError(null);
      await onConfirm(reason.trim());
      onClose();
    } catch (err: unknown) {
      const axiosError = err as { response?: { data?: { message?: string } } };
      setError(axiosError?.response?.data?.message || 'Failed to reject problem.');
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
            <div className="w-10 h-10 rounded-xl bg-red-500/10 text-red-600 dark:text-red-400 flex items-center justify-center shrink-0">
              <AlertOctagon className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-heading font-bold text-lg text-[#1c1917] dark:text-[#ece9e1]">
                Reject Municipal Problem
              </h3>
              <p className="text-xs text-[#78716c] dark:text-[#9aa8a1]">
                Requires a documented reason provided to citizen reporters
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

        {/* Problem Title Preview */}
        <div className="p-3 rounded-lg bg-[#faf8f4] dark:bg-[#0e1512] border border-[#e6e2dc] dark:border-[#24312b]">
          <span className="text-[11px] font-semibold text-[#78716c] dark:text-[#9aa8a1] uppercase tracking-wider block mb-0.5">
            Target Problem
          </span>
          <p className="text-xs font-medium text-[#1c1917] dark:text-[#ece9e1] line-clamp-2">
            {problemTitle}
          </p>
        </div>

        {error && (
          <div className="p-3 rounded-lg bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900 text-xs text-red-700 dark:text-red-300 flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Quick presets */}
          <div className="space-y-1.5">
            <label className="text-[11px] font-semibold text-[#78716c] dark:text-[#9aa8a1] uppercase tracking-wider block">
              Common Municipal Rationale
            </label>
            <div className="flex flex-wrap gap-1.5">
              {COMMON_REASONS.map((preset) => (
                <button
                  type="button"
                  key={preset}
                  onClick={() => setReason(preset)}
                  className="py-1 px-2.5 rounded-lg text-xs border border-[#e6e2dc] dark:border-[#24312b] bg-[#faf8f4] dark:bg-[#0e1512] text-[#44403c] dark:text-[#d6d3d1] hover:border-[#dc2626] hover:text-[#dc2626] transition-colors text-left"
                >
                  {preset}
                </button>
              ))}
            </div>
          </div>

          {/* Reason Textarea (Required) */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-[#1c1917] dark:text-[#ece9e1] flex items-center justify-between">
              <span>Rejection Reason *</span>
              <span className="text-[10px] text-red-600 font-normal">Required</span>
            </label>
            <textarea
              rows={4}
              required
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="e.g., Photos uploaded do not clearly depict the requested road defect. Please re-submit with clear daylight photos and specific landmark coordinates."
              className="w-full p-3 text-xs rounded-xl border border-[#e6e2dc] dark:border-[#24312b] bg-[#faf8f4] dark:bg-[#0e1512] text-[#1c1917] dark:text-[#ece9e1] placeholder-[#78716c] focus:outline-none focus:ring-1 focus:ring-red-500"
            />
          </div>

          <p className="text-[11px] text-[#78716c] dark:text-[#9aa8a1] leading-relaxed">
            Note: This message will be recorded in the problem&apos;s timeline and sent via notification to the citizen reporter.
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
              disabled={isSubmitting || !reason.trim()}
              className="bg-[#dc2626] hover:bg-[#b91c1c] text-white gap-1.5"
            >
              <AlertOctagon className="w-4 h-4" />
              <span>{isSubmitting ? 'Rejecting...' : 'Reject Problem'}</span>
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};
