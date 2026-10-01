'use client';

import React from 'react';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { StatusPill } from '../ui/StatusPill';
import { NearbyProblemMatch } from '../../types/problem';
import { formatCategoryLabel } from '../../utils/formatters';
import {
  AlertTriangle,
  MapPin,
  Users,
  ExternalLink,
  CheckCircle2,
  ArrowRight,
  Clock,
} from 'lucide-react';

export interface DuplicateWarningModalProps {
  isOpen: boolean;
  onClose: () => void;
  duplicates: NearbyProblemMatch[];
  onContinueAnyway: () => void;
  onLinkToExisting: (problemId: string, problemTitle: string) => void;
  isLinking?: boolean;
}

export const DuplicateWarningModal: React.FC<DuplicateWarningModalProps> = ({
  isOpen,
  onClose,
  duplicates,
  onContinueAnyway,
  onLinkToExisting,
  isLinking = false,
}) => {
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      size="lg"
      title="Possible Existing Problem Detected"
      subtitle="A similar active civic issue was previously reported very close to your selected location."
    >
      <div className="space-y-5">
        {/* Warning Banner Header */}
        <div className="p-4 bg-[#fffbeb] dark:bg-[#2d2411] border border-[#fde68a] dark:border-[#715416] rounded-2xl flex items-start gap-3.5">
          <div className="w-10 h-10 rounded-xl bg-[#fef3c7] dark:bg-[#423315] text-[#d97706] dark:text-[#fbbf24] flex items-center justify-center shrink-0 shadow-2xs">
            <AlertTriangle className="w-5 h-5" />
          </div>
          <div className="space-y-1">
            <h4 className="text-sm font-bold text-[#92400e] dark:text-[#fde68a]">
              Found {duplicates.length} nearby {duplicates.length === 1 ? 'issue' : 'issues'} within ~100m
            </h4>
            <p className="text-xs text-[#78350f] dark:text-[#fcd34d] leading-relaxed">
              To keep municipal dispatch organized and expedite resolution, choosing an existing problem links your citizen report and increases its priority score without creating duplicate entries.
            </p>
          </div>
        </div>

        {/* Duplicates List */}
        <div className="space-y-3 max-h-[360px] overflow-y-auto pr-1">
          {duplicates.map((dup) => (
            <div
              key={dup.id}
              className="p-4 bg-white dark:bg-[#18231e] rounded-2xl border border-[#e5e1d8] dark:border-[#283831] shadow-2xs hover:border-[#0f6b4f]/40 dark:hover:border-[#5cc9a0]/40 transition-all space-y-3.5"
            >
              {/* Card Header Info */}
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-[#e3f0ea] dark:bg-[#173026] text-[#0f6b4f] dark:text-[#5cc9a0]">
                    {formatCategoryLabel(dup.category)}
                  </span>
                  <StatusPill status={dup.status} size="sm" />
                </div>

                <div className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-[#fef3c7] dark:bg-[#2e2614] text-[#b45309] dark:text-[#fbbf24] text-[11px] font-bold">
                  <MapPin className="w-3 h-3" />
                  <span>{dup.distanceMeters}m away</span>
                </div>
              </div>

              {/* Body Details */}
              <div className="flex items-start gap-3">
                {dup.media && dup.media.length > 0 && dup.media[0].url ? (
                  <div className="w-16 h-16 rounded-xl overflow-hidden bg-[#e5e1d8] dark:bg-[#283831] shrink-0 border border-[#e5e1d8] dark:border-[#283831]">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={dup.media[0].url}
                      alt={dup.title}
                      className="w-full h-full object-cover"
                    />
                  </div>
                ) : null}

                <div className="flex-1 min-w-0">
                  <h5 className="font-heading font-bold text-sm text-[#14201c] dark:text-[#ece9e1] line-clamp-1">
                    {dup.title}
                  </h5>
                  <p className="text-xs text-[#5d6b65] dark:text-[#9aa8a1] mt-0.5 flex items-center gap-1 truncate">
                    <MapPin className="w-3 h-3 shrink-0" />
                    <span>{dup.address}, {dup.area}</span>
                  </p>

                  <div className="flex items-center gap-4 mt-2 text-[11px] text-[#78716c] dark:text-[#84948c]">
                    <span className="flex items-center gap-1 font-medium text-[#0f6b4f] dark:text-[#5cc9a0]">
                      <Users className="w-3.5 h-3.5" />
                      {dup.reportCount} {dup.reportCount === 1 ? 'Report' : 'Reports'}
                    </span>
                    <span>•</span>
                    <span>{dup.supportCount} Supports</span>
                    <span>•</span>
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {new Date(dup.createdAt).toLocaleDateString(undefined, {
                        month: 'short',
                        day: 'numeric',
                      })}
                    </span>
                  </div>
                </div>
              </div>

              {/* Action Buttons for this Duplicate */}
              <div className="pt-2 border-t border-[#f0ece1] dark:border-[#223029] flex flex-wrap items-center justify-between gap-2">
                <a
                  href={`/problems/${dup.id}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-xs font-semibold text-[#5d6b65] dark:text-[#9aa8a1] hover:text-[#0f6b4f] dark:hover:text-[#5cc9a0] transition-colors"
                >
                  <span>View Details</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>

                <Button
                  type="button"
                  variant="primary"
                  size="sm"
                  isLoading={isLinking}
                  onClick={() => onLinkToExisting(dup.id, dup.title)}
                  leftIcon={<CheckCircle2 className="w-3.5 h-3.5" />}
                  className="shadow-xs text-xs"
                >
                  Link My Report to This Issue
                </Button>
              </div>
            </div>
          ))}
        </div>

        {/* Modal Decision Footer */}
        <div className="pt-4 border-t border-[#e5e1d8] dark:border-[#24312b] flex flex-col-reverse sm:flex-row items-center justify-between gap-3">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="w-full sm:w-auto text-xs"
          >
            Go Back & Review Pin
          </Button>

          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={onContinueAnyway}
            rightIcon={<ArrowRight className="w-3.5 h-3.5" />}
            className="w-full sm:w-auto text-xs border-[#d97706]/40 text-[#92400e] dark:text-[#fde68a] hover:bg-[#fffbeb] dark:hover:bg-[#2d2411]"
          >
            Continue Anyway (Create New Report)
          </Button>
        </div>
      </div>
    </Modal>
  );
};
