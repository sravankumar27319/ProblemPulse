'use client';

import React, { useState } from 'react';
import { PriorityLevel } from '../../types/problem';
import { PriorityBadge } from '../ui/PriorityBadge';
import { Button } from '../ui/Button';
import { CheckCircle2, X, AlertTriangle } from 'lucide-react';

export interface VerifyModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (payload: { note?: string; adminPriority?: PriorityLevel }) => Promise<void>;
  currentPriority: PriorityLevel;
  problemTitle: string;
}

export const VerifyModal: React.FC<VerifyModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  currentPriority,
  problemTitle,
}) => {
  const [priority, setPriority] = useState<PriorityLevel>(currentPriority);
  const [note, setNote] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setIsSubmitting(true);
      setError(null);
      await onConfirm({
        note: note.trim() || undefined,
        adminPriority: priority !== currentPriority ? priority : undefined,
      });
      onClose();
    } catch (err: unknown) {
      const axiosError = err as { response?: { data?: { message?: string } } };
      setError(axiosError?.response?.data?.message || 'Failed to verify problem.');
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
            <div className="w-10 h-10 rounded-xl bg-[#0f6b4f]/10 text-[#0f6b4f] dark:text-[#5cc9a0] flex items-center justify-center shrink-0">
              <CheckCircle2 className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-heading font-bold text-lg text-[#1c1917] dark:text-[#ece9e1]">
                Verify Municipal Problem
              </h3>
              <p className="text-xs text-[#78716c] dark:text-[#9aa8a1]">
                Confirm problem validity and advance to verified state
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
          {/* Priority Assignment */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-[#1c1917] dark:text-[#ece9e1] block">
              Confirm or Adjust Priority
            </label>
            <div className="grid grid-cols-3 gap-2">
              {(['LOW', 'MAJOR', 'CRITICAL'] as PriorityLevel[]).map((level) => (
                <button
                  type="button"
                  key={level}
                  onClick={() => setPriority(level)}
                  className={`p-2 rounded-xl border text-xs font-semibold flex flex-col items-center justify-center gap-1 transition-all ${
                    priority === level
                      ? 'border-[#0f6b4f] bg-[#0f6b4f]/10 text-[#0f6b4f] dark:text-[#5cc9a0] shadow-xs'
                      : 'border-[#e6e2dc] dark:border-[#24312b] bg-white dark:bg-[#141d19] text-[#78716c] hover:bg-[#faf8f4]'
                  }`}
                >
                  <PriorityBadge priority={level} size="sm" showIcon={false} />
                </button>
              ))}
            </div>
            <p className="text-[11px] text-[#78716c] dark:text-[#9aa8a1]">
              Current calculated priority: <strong className="uppercase">{currentPriority}</strong>
            </p>
          </div>

          {/* Optional Verification Note */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-[#1c1917] dark:text-[#ece9e1] block">
              Verification Note <span className="text-[#78716c] font-normal">(optional)</span>
            </label>
            <textarea
              rows={3}
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="e.g., Confirmed with area inspector; damage verified and queued for departmental dispatch."
              className="w-full p-3 text-xs rounded-xl border border-[#e6e2dc] dark:border-[#24312b] bg-[#faf8f4] dark:bg-[#0e1512] text-[#1c1917] dark:text-[#ece9e1] placeholder-[#78716c] focus:outline-none focus:ring-1 focus:ring-[#0f6b4f]"
            />
          </div>

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
              disabled={isSubmitting}
              className="bg-[#0f6b4f] hover:bg-[#0d5942] text-white gap-1.5"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>{isSubmitting ? 'Verifying...' : 'Verify Problem'}</span>
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};
