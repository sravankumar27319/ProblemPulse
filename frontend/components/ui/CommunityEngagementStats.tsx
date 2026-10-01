'use client';

import React from 'react';
import { Users, ThumbsUp, ShieldAlert, Sparkles, HelpCircle } from 'lucide-react';
import { cn } from '../../lib/utils';
import { getCombinedEngagement } from '../../utils/formatters';

export interface CommunityEngagementStatsProps {
  reportCount: number;
  supportCount: number;
  variant?: 'compact' | 'detailed' | 'pill';
  className?: string;
  isSupportedByMe?: boolean;
}

export const CommunityEngagementStats: React.FC<CommunityEngagementStatsProps> = ({
  reportCount,
  supportCount,
  variant = 'compact',
  className,
  isSupportedByMe = false,
}) => {
  const totalImpact = getCombinedEngagement(reportCount, supportCount);

  if (variant === 'pill') {
    return (
      <div
        className={cn(
          'inline-flex items-center gap-2 px-2.5 py-1 rounded-full bg-[#f4fbf7] dark:bg-[#14231c] border border-[#0f6b4f]/20 text-xs text-[#0f6b4f] dark:text-[#5cc9a0] font-medium shadow-2xs',
          className
        )}
      >
        <span className="font-bold">{totalImpact} Community Backers</span>
        <span className="text-[#a8a29e] dark:text-[#52645b]">•</span>
        <span className="text-[11px] text-[#5d6b65] dark:text-[#9aa8a1]">
          {reportCount} {reportCount === 1 ? 'Report' : 'Reports'} · {supportCount}{' '}
          {supportCount === 1 ? 'Support' : 'Supports'}
        </span>
      </div>
    );
  }

  if (variant === 'detailed') {
    return (
      <div className={cn('space-y-4', className)}>
        {/* Total Surfaced Backers Metric */}
        <div className="p-4 bg-[#f4fbf7] dark:bg-[#13251e] rounded-2xl border border-[#0f6b4f]/20 flex items-center justify-between">
          <div className="space-y-0.5">
            <span className="text-[11px] font-bold uppercase tracking-wider text-[#0f6b4f] dark:text-[#5cc9a0]">
              Total Community Backing
            </span>
            <div className="flex items-baseline gap-2">
              <span className="font-heading text-3xl font-bold text-[#14201c] dark:text-[#ece9e1]">
                {totalImpact}
              </span>
              <span className="text-xs text-[#5d6b65] dark:text-[#9aa8a1]">
                citizens engaged
              </span>
            </div>
          </div>

          <div className="w-12 h-12 rounded-2xl bg-[#0f6b4f]/10 dark:bg-[#5cc9a0]/15 text-[#0f6b4f] dark:text-[#5cc9a0] flex items-center justify-center">
            <Sparkles className="w-6 h-6" />
          </div>
        </div>

        {/* 2-Column Breakdown: Report Count vs Support Count */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {/* 1. Direct Citizen Reports */}
          <div className="p-3.5 bg-white dark:bg-[#18231e] rounded-xl border border-[#e5e1d8] dark:border-[#283831] space-y-1.5 shadow-2xs">
            <div className="flex items-center justify-between text-xs">
              <span className="flex items-center gap-1.5 font-bold text-[#14201c] dark:text-[#ece9e1]">
                <Users className="w-3.5 h-3.5 text-[#0f6b4f] dark:text-[#5cc9a0]" />
                <span>Citizen Reports</span>
              </span>
              <span className="font-mono font-bold text-sm text-[#0f6b4f] dark:text-[#5cc9a0]">
                {reportCount}
              </span>
            </div>
            <p className="text-[11px] text-[#5d6b65] dark:text-[#9aa8a1] leading-relaxed">
              Independent eyewitness reports &amp; duplicate links with location evidence.
            </p>
          </div>

          {/* 2. Community Supports */}
          <div className="p-3.5 bg-white dark:bg-[#18231e] rounded-xl border border-[#e5e1d8] dark:border-[#283831] space-y-1.5 shadow-2xs">
            <div className="flex items-center justify-between text-xs">
              <span className="flex items-center gap-1.5 font-bold text-[#14201c] dark:text-[#ece9e1]">
                <ThumbsUp className="w-3.5 h-3.5 text-[#0f6b4f] dark:text-[#5cc9a0]" />
                <span>Community Supports</span>
              </span>
              <span className="font-mono font-bold text-sm text-[#0f6b4f] dark:text-[#5cc9a0]">
                {supportCount}
              </span>
            </div>
            <p className="text-[11px] text-[#5d6b65] dark:text-[#9aa8a1] leading-relaxed">
              Neighbors affected backing this issue with one-click support.
            </p>
          </div>
        </div>

        {/* Phase 12 Explanatory Guide Box */}
        <div className="p-3 bg-[#faf8f4] dark:bg-[#1a2520] rounded-xl border border-[#e5e1d8] dark:border-[#24312b] text-[11px] text-[#5d6b65] dark:text-[#9aa8a1] flex items-start gap-2">
          <HelpCircle className="w-3.5 h-3.5 text-[#78716c] dark:text-[#84948c] shrink-0 mt-0.5" />
          <span>
            <strong className="text-[#14201c] dark:text-[#ece9e1]">How Triage Works:</strong> Reports verify direct physical evidence on the ground, while supports quantify community breadth. Together, both numbers drive automatic priority escalation.
          </span>
        </div>
      </div>
    );
  }

  // Default 'compact' variant (for cards / map markers)
  return (
    <div
      className={cn(
        'flex items-center justify-between py-2 px-3 bg-[#faf8f4] dark:bg-[#0e1512] rounded-xl border border-[#e5e1d8] dark:border-[#24312b] text-xs shadow-2xs',
        className
      )}
    >
      <div className="flex items-center gap-1.5">
        <Users className="w-3.5 h-3.5 text-[#0f6b4f] dark:text-[#5cc9a0]" />
        <span className="font-semibold text-[#14201c] dark:text-[#ece9e1]">
          {totalImpact} {totalImpact === 1 ? 'Backer' : 'Backers'}
        </span>
      </div>

      <div className="flex items-center gap-2 text-[11px] text-[#78716c] dark:text-[#84948c]">
        <span>{reportCount} {reportCount === 1 ? 'rep' : 'reps'}</span>
        <span>•</span>
        <span className="text-[#0f6b4f] dark:text-[#5cc9a0] font-medium">
          {supportCount + (isSupportedByMe ? 1 : 0)} {supportCount === 1 ? 'sup' : 'sups'}
        </span>
      </div>
    </div>
  );
};
