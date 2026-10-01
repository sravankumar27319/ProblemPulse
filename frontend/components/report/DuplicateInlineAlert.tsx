'use client';

import { NearbyProblemMatch } from '../../types/problem';
import { AlertTriangle, ChevronRight } from 'lucide-react';
import { Button } from '../ui/Button';

export interface DuplicateInlineAlertProps {
  duplicates: NearbyProblemMatch[];
  onReviewDuplicates: () => void;
  isLoading?: boolean;
}

export const DuplicateInlineAlert: React.FC<DuplicateInlineAlertProps> = ({
  duplicates,
  onReviewDuplicates,
  isLoading = false,
}) => {
  if (isLoading) {
    return (
      <div className="p-3 bg-[#fbfaf7] dark:bg-[#18231e] rounded-xl border border-[#e5e1d8] dark:border-[#283831] text-xs text-[#78716c] dark:text-[#84948c] flex items-center justify-between animate-pulse">
        <span>Checking for nearby existing reports within 100m...</span>
      </div>
    );
  }

  if (!duplicates || duplicates.length === 0) {
    return null;
  }

  const nearest = duplicates[0];

  return (
    <div className="p-3.5 bg-[#fffbeb] dark:bg-[#2d2411] border border-[#fde68a] dark:border-[#715416] rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs shadow-2xs">
      <div className="flex items-start gap-2.5">
        <AlertTriangle className="w-4 h-4 text-[#d97706] dark:text-[#fbbf24] shrink-0 mt-0.5" />
        <div className="space-y-0.5">
          <p className="font-bold text-[#92400e] dark:text-[#fde68a]">
            {duplicates.length} Existing {duplicates.length === 1 ? 'Report' : 'Reports'} Found Nearby
          </p>
          <p className="text-[#78350f] dark:text-[#fcd34d] flex items-center gap-1">
            <span>Nearest: &quot;{nearest.title.substring(0, 32)}...&quot;</span>
            <span className="font-bold">({nearest.distanceMeters}m away)</span>
          </p>
        </div>
      </div>

      <Button
        type="button"
        variant="outline"
        size="sm"
        onClick={onReviewDuplicates}
        rightIcon={<ChevronRight className="w-3.5 h-3.5" />}
        className="shrink-0 text-xs border-[#d97706]/50 text-[#92400e] dark:text-[#fde68a] bg-white/60 dark:bg-[#1f190c] hover:bg-white dark:hover:bg-[#2a2210]"
      >
        Review &amp; Link
      </Button>
    </div>
  );
};
