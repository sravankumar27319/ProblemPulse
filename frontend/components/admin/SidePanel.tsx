'use client';

import React from 'react';
import Link from 'next/link';
import { Card } from '../ui/Card';
import { AdminQueueItem, AdminCategoryCount, AdminWeeklyMetrics } from '../../types/admin';
import { formatDate } from '../../utils/formatters';

export interface SidePanelProps {
  awaitingReview: AdminQueueItem[];
  byCategory: AdminCategoryCount[];
  thisWeek: AdminWeeklyMetrics;
}

export const SidePanel: React.FC<SidePanelProps> = ({
  awaitingReview,
  byCategory,
  thisWeek,
}) => {
  return (
    <div className="space-y-6">
      {/* Panel 1: Awaiting your review */}
      <Card className="p-5 bg-white dark:bg-[#141d19] border border-[#e5e1d8] dark:border-[#24312b] rounded-[14px] shadow-xs space-y-4">
        <h4 className="font-heading font-medium text-[18px] text-[#14201c] dark:text-[#ece9e1]">
          Awaiting your review
        </h4>

        <div className="divide-y divide-[#e5e1d8] dark:divide-[#24312b]">
          {awaitingReview.length > 0 ? (
            awaitingReview.slice(0, 5).map((item) => (
              <Link
                key={item.id}
                href={`/admin/problems/${item.id}`}
                className="py-3 first:pt-0 last:pb-0 flex items-start justify-between gap-3 group block transition-colors"
              >
                <div className="min-w-0">
                  <div className="font-medium text-[14px] text-[#14201c] dark:text-[#ece9e1] group-hover:text-[#0f6b4f] transition-colors truncate">
                    {item.title}
                  </div>
                  <div className="text-[12px] text-[#5d6b65] dark:text-[#9aa8a1] mt-0.5">
                    {item.area || item.city}
                  </div>
                </div>
                <span className="text-[12px] text-[#5d6b65] dark:text-[#9aa8a1] whitespace-nowrap shrink-0">
                  {formatDate(item.createdAt)}
                </span>
              </Link>
            ))
          ) : (
            <p className="text-[13.5px] text-[#5d6b65] dark:text-[#9aa8a1] py-3 text-center">
              All submitted reports have been reviewed!
            </p>
          )}
        </div>
      </Card>

      {/* Panel 2: By category */}
      <Card className="p-5 bg-white dark:bg-[#141d19] border border-[#e5e1d8] dark:border-[#24312b] rounded-[14px] shadow-xs space-y-4">
        <h4 className="font-heading font-medium text-[18px] text-[#14201c] dark:text-[#ece9e1]">
          By category
        </h4>

        <div className="space-y-3.5">
          {byCategory.map((cat) => (
            <div key={cat.category} className="space-y-1.5">
              <div className="flex items-center justify-between text-[13.5px]">
                <span className="text-[#5d6b65] dark:text-[#9aa8a1]">
                  {cat.category === 'ROAD'
                    ? 'Road'
                    : cat.category === 'WATER'
                    ? 'Water'
                    : cat.category === 'GARBAGE'
                    ? 'Garbage'
                    : cat.category === 'ELECTRICITY'
                    ? 'Electricity'
                    : cat.category === 'TRAFFIC'
                    ? 'Traffic'
                    : 'Other'}
                </span>
                <span className="text-[#14201c] dark:text-[#ece9e1] font-semibold">
                  {cat.count}
                </span>
              </div>
              <div className="w-full h-1.5 rounded-full bg-[#faf8f4] dark:bg-[#0e1512] border border-[#e5e1d8] dark:border-[#24312b] overflow-hidden">
                <div
                  className="h-full bg-[#0f6b4f] dark:bg-[#5cc9a0] rounded-full transition-all duration-300"
                  style={{ width: `${Math.max(4, cat.percentage)}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* Panel 3: This week */}
      <Card className="p-5 bg-white dark:bg-[#141d19] border border-[#e5e1d8] dark:border-[#24312b] rounded-[14px] shadow-xs space-y-4">
        <h4 className="font-heading font-medium text-[18px] text-[#14201c] dark:text-[#ece9e1]">
          This week
        </h4>

        <div className="space-y-2.5">
          {/* Metric: Avg Resolution Time */}
          <div className="p-3 rounded-xl bg-[#faf8f4] dark:bg-[#0e1512] border border-[#e5e1d8] dark:border-[#24312b] flex items-center justify-between">
            <span className="text-[13px] text-[#5d6b65] dark:text-[#9aa8a1]">
              Avg Resolution Time
            </span>
            <span className="font-semibold text-[13px] text-[#14201c] dark:text-[#ece9e1]">
              {thisWeek.avgResolutionTime}
            </span>
          </div>

          {/* Metric: New Reports */}
          <div className="p-3 rounded-xl bg-[#faf8f4] dark:bg-[#0e1512] border border-[#e5e1d8] dark:border-[#24312b] flex items-center justify-between">
            <span className="text-[13px] text-[#5d6b65] dark:text-[#9aa8a1]">
              New Reports Logged
            </span>
            <span className="font-semibold text-[13px] text-[#14201c] dark:text-[#ece9e1]">
              +{thisWeek.newReports}
            </span>
          </div>

          {/* Metric: Verified */}
          <div className="p-3 rounded-xl bg-[#faf8f4] dark:bg-[#0e1512] border border-[#e5e1d8] dark:border-[#24312b] flex items-center justify-between">
            <span className="text-[13px] text-[#5d6b65] dark:text-[#9aa8a1]">
              Reports Verified
            </span>
            <span className="font-semibold text-[13px] text-[#14201c] dark:text-[#ece9e1]">
              {thisWeek.verified}
            </span>
          </div>

          {/* Metric: Reopened */}
          <div className="p-3 rounded-xl bg-[#faf8f4] dark:bg-[#0e1512] border border-[#e5e1d8] dark:border-[#24312b] flex items-center justify-between">
            <span className="text-[13px] text-[#5d6b65] dark:text-[#9aa8a1]">
              Reopened Issues
            </span>
            <span className="font-semibold text-[13px] text-[#14201c] dark:text-[#ece9e1]">
              {thisWeek.reopened}
            </span>
          </div>
        </div>
      </Card>
    </div>
  );
};

