'use client';

import React, { useState } from 'react';
import { ProblemStatus } from '../../types/problem';
import { UpdateStatusInput } from '../../types/admin';
import { StatusPill } from '../ui/StatusPill';
import { Button } from '../ui/Button';
import {
  RefreshCw,
  X,
  AlertTriangle,
  PlayCircle,
  CheckCircle2,
  CheckCheck,
  RotateCcw,
  Building2,
  FileSearch,
  AlertOctagon,
  ArrowRight,
} from 'lucide-react';

export interface UpdateStatusModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (payload: UpdateStatusInput) => Promise<void>;
  problemTitle: string;
  currentStatus: ProblemStatus;
  allowedTransitions?: ProblemStatus[];
}

interface StatusOptionMeta {
  label: string;
  description: string;
  icon: React.ElementType;
  colorClass: string;
}

const STATUS_METADATA: Record<ProblemStatus, StatusOptionMeta> = {
  SUBMITTED: {
    label: 'Submitted',
    description: 'Initial citizen report received.',
    icon: FileSearch,
    colorClass: 'border-blue-200 dark:border-blue-900 bg-blue-50/50 dark:bg-blue-950/20 text-blue-700 dark:text-blue-300',
  },
  UNDER_REVIEW: {
    label: 'Under Review',
    description: 'Send back to municipal review and verification queue.',
    icon: FileSearch,
    colorClass: 'border-amber-200 dark:border-amber-900 bg-amber-50/50 dark:bg-amber-950/20 text-amber-700 dark:text-amber-300',
  },
  VERIFIED: {
    label: 'Verified',
    description: 'Confirm municipal validity and queue for department dispatch.',
    icon: CheckCircle2,
    colorClass: 'border-emerald-200 dark:border-emerald-900 bg-emerald-50/50 dark:bg-emerald-950/20 text-emerald-700 dark:text-emerald-300',
  },
  ASSIGNED: {
    label: 'Assigned',
    description: 'Assign or reassign to responsible department.',
    icon: Building2,
    colorClass: 'border-purple-200 dark:border-purple-900 bg-purple-50/50 dark:bg-purple-950/20 text-purple-700 dark:text-purple-300',
  },
  IN_PROGRESS: {
    label: 'In Progress (Start Work)',
    description: 'Crews deployed on-site; active physical repair work underway.',
    icon: PlayCircle,
    colorClass: 'border-indigo-200 dark:border-indigo-900 bg-indigo-50/50 dark:bg-indigo-950/20 text-indigo-700 dark:text-indigo-300',
  },
  RESOLVED: {
    label: 'Mark Resolved',
    description: 'Repairs successfully finished and ready for community verification.',
    icon: CheckCircle2,
    colorClass: 'border-emerald-200 dark:border-emerald-900 bg-emerald-50/50 dark:bg-emerald-950/20 text-emerald-700 dark:text-emerald-300',
  },
  COMMUNITY_VERIFIED: {
    label: 'Community Verified',
    description: 'Resolution confirmed by citizen reporters and backers.',
    icon: CheckCheck,
    colorClass: 'border-teal-200 dark:border-teal-900 bg-teal-50/50 dark:bg-teal-950/20 text-teal-700 dark:text-teal-300',
  },
  CLOSED: {
    label: 'Close Ticket',
    description: 'Municipal problem case completed and permanently archived.',
    icon: CheckCheck,
    colorClass: 'border-stone-300 dark:border-stone-800 bg-stone-100/60 dark:bg-stone-900/40 text-stone-700 dark:text-stone-300',
  },
  REOPENED: {
    label: 'Reopen Problem',
    description: 'Issue persists or recurring problem detected. Requires further municipal action.',
    icon: RotateCcw,
    colorClass: 'border-rose-200 dark:border-rose-900 bg-rose-50/50 dark:bg-rose-950/20 text-rose-700 dark:text-rose-300',
  },
  REJECTED: {
    label: 'Reject Report',
    description: 'Mark report as rejected or out of municipal jurisdiction.',
    icon: AlertOctagon,
    colorClass: 'border-red-200 dark:border-red-900 bg-red-50/50 dark:bg-red-950/20 text-red-700 dark:text-red-300',
  },
  DUPLICATE: {
    label: 'Duplicate',
    description: 'Merge as duplicate into canonical problem.',
    icon: AlertOctagon,
    colorClass: 'border-amber-200 dark:border-amber-900 bg-amber-50/50 dark:bg-amber-950/20 text-amber-700 dark:text-amber-300',
  },
};

// Fallback transition map in case allowedTransitions prop is not supplied
const DEFAULT_TRANSITIONS: Record<ProblemStatus, ProblemStatus[]> = {
  SUBMITTED: ['UNDER_REVIEW', 'VERIFIED', 'REJECTED'],
  UNDER_REVIEW: ['VERIFIED', 'REJECTED', 'DUPLICATE'],
  VERIFIED: ['ASSIGNED', 'REJECTED'],
  ASSIGNED: ['IN_PROGRESS', 'REOPENED', 'REJECTED'],
  IN_PROGRESS: ['RESOLVED', 'ASSIGNED', 'REOPENED'],
  RESOLVED: ['CLOSED', 'COMMUNITY_VERIFIED', 'REOPENED'],
  COMMUNITY_VERIFIED: ['CLOSED', 'REOPENED'],
  CLOSED: ['REOPENED'],
  REOPENED: ['UNDER_REVIEW', 'VERIFIED', 'ASSIGNED', 'IN_PROGRESS'],
  REJECTED: ['UNDER_REVIEW', 'REOPENED'],
  DUPLICATE: [],
};

export const UpdateStatusModal: React.FC<UpdateStatusModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  problemTitle,
  currentStatus,
  allowedTransitions,
}) => {
  const options = allowedTransitions && allowedTransitions.length > 0
    ? allowedTransitions
    : DEFAULT_TRANSITIONS[currentStatus] || [];

  const [selectedStatus, setSelectedStatus] = useState<ProblemStatus | null>(
    options.length > 0 ? options[0] : null
  );
  const [note, setNote] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedStatus) {
      setError('Please select a target status.');
      return;
    }

    try {
      setIsSubmitting(true);
      setError(null);
      await onConfirm({
        status: selectedStatus,
        note: note.trim() || undefined,
      });
      onClose();
    } catch (err: unknown) {
      const axiosError = err as { response?: { data?: { message?: string } } };
      setError(axiosError?.response?.data?.message || 'Failed to update problem status.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="bg-white dark:bg-[#141d19] border border-[#e6e2dc] dark:border-[#24312b] rounded-2xl max-w-xl w-full p-6 shadow-xl space-y-5">
        {/* Header */}
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-[#0f6b4f]/10 text-[#0f6b4f] dark:text-[#5cc9a0] flex items-center justify-center shrink-0">
              <RefreshCw className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-heading font-bold text-lg text-[#1c1917] dark:text-[#ece9e1]">
                Change Lifecycle Status
              </h3>
              <p className="text-xs text-[#78716c] dark:text-[#9aa8a1]">
                Execute valid municipal state machine transition with audit timeline
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

        {/* Current State Indicator */}
        <div className="p-3.5 rounded-xl bg-[#faf8f4] dark:bg-[#0e1512] border border-[#e6e2dc] dark:border-[#24312b] space-y-2">
          <div className="flex items-center justify-between gap-3">
            <span className="text-[11px] font-semibold text-[#78716c] dark:text-[#9aa8a1] uppercase tracking-wider">
              Problem Under Review
            </span>
            <div className="flex items-center gap-2">
              <span className="text-xs text-[#78716c] dark:text-[#9aa8a1]">Current:</span>
              <StatusPill status={currentStatus} size="sm" />
            </div>
          </div>
          <p className="text-xs font-semibold text-[#1c1917] dark:text-[#ece9e1] line-clamp-1">
            {problemTitle}
          </p>
        </div>

        {error && (
          <div className="p-3 rounded-lg bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900 text-xs text-red-700 dark:text-red-300 flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {options.length === 0 ? (
          <div className="p-5 text-center bg-[#faf8f4] dark:bg-[#0e1512] rounded-xl border border-dashed border-[#e6e2dc] dark:border-[#24312b] text-xs text-[#78716c] dark:text-[#9aa8a1] space-y-1">
            <p className="font-semibold text-[#1c1917] dark:text-[#ece9e1]">
              No legal transitions available
            </p>
            <p>
              This problem is in a terminal status ({currentStatus}) and cannot be transitioned further.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Allowed Transitions Radio Cards */}
            <div className="space-y-2">
              <label className="text-xs font-semibold text-[#1c1917] dark:text-[#ece9e1] flex items-center justify-between">
                <span>Select New Status *</span>
                <span className="text-[11px] text-[#78716c] dark:text-[#9aa8a1] font-normal">
                  Phase 4 / 22 Transition Map Compliant
                </span>
              </label>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-56 overflow-y-auto pr-1">
                {options.map((st) => {
                  const meta = STATUS_METADATA[st] || {
                    label: st,
                    description: `Move status to ${st}`,
                    icon: RefreshCw,
                    colorClass: '',
                  };
                  const Icon = meta.icon;
                  const isSelected = (selectedStatus || options[0]) === st;

                  return (
                    <div
                      key={st}
                      onClick={() => setSelectedStatus(st)}
                      className={`p-3 rounded-xl border cursor-pointer text-xs transition-all flex flex-col justify-between ${
                        isSelected
                          ? 'border-[#0f6b4f] bg-[#0f6b4f]/10 text-[#0f6b4f] dark:text-[#5cc9a0] shadow-xs'
                          : 'border-[#e6e2dc] dark:border-[#24312b] bg-white dark:bg-[#141d19] hover:bg-[#faf8f4] dark:hover:bg-[#1a2621]'
                      }`}
                    >
                      <div className="flex items-center justify-between gap-1 mb-1.5">
                        <div className="flex items-center gap-1.5 font-bold">
                          <Icon className="w-3.5 h-3.5 shrink-0" />
                          <span className="truncate">{meta.label}</span>
                        </div>
                        {isSelected && (
                          <span className="w-2 h-2 rounded-full bg-[#0f6b4f] shrink-0" />
                        )}
                      </div>
                      <p className="text-[11px] text-[#78716c] dark:text-[#9aa8a1] line-clamp-2 leading-relaxed">
                        {meta.description}
                      </p>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Note Field */}
            <div className="space-y-1">
              <label className="text-xs font-semibold text-[#1c1917] dark:text-[#ece9e1]">
                Transition Note / Field Remarks <span className="text-[#78716c] font-normal">(optional)</span>
              </label>
              <textarea
                value={note}
                onChange={(e) => setNote(e.target.value)}
                rows={3}
                placeholder="e.g. Repairs commenced by field crew / Road surface patched and inspected / Reopened due to recurrent sinkage..."
                className="w-full px-3 py-2 text-xs rounded-xl border border-[#e6e2dc] dark:border-[#24312b] bg-white dark:bg-[#0e1512] text-[#1c1917] dark:text-[#ece9e1] placeholder-[#78716c] focus:outline-none focus:ring-1 focus:ring-[#0f6b4f]"
              />
              <p className="text-[11px] text-[#78716c] dark:text-[#9aa8a1]">
                This note will be recorded in the public Problem Lifecycle Timeline and shared with stakeholders.
              </p>
            </div>

            {/* Footer Buttons */}
            <div className="flex items-center justify-end gap-2 pt-3 border-t border-[#e6e2dc] dark:border-[#24312b]">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={onClose}
                disabled={isSubmitting}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                size="sm"
                disabled={isSubmitting || !selectedStatus}
                className="bg-[#0f6b4f] hover:bg-[#0d5942] text-white gap-1.5 shadow-xs"
              >
                <span>{isSubmitting ? 'Updating...' : 'Confirm Status Change'}</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
