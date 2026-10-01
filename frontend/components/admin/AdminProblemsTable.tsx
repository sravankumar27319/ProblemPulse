'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import {
  ArrowRight,
  Users,
  ThumbsUp,
  MapPin,
  ChevronLeft,
  ChevronRight,
  ArrowUpDown,
  Building,
  Image as ImageIcon,
} from 'lucide-react';
import { AdminProblemItem } from '../../types/admin';
import { PriorityBadge } from '../ui/PriorityBadge';
import { StatusPill } from '../ui/StatusPill';
import { formatDate } from '../../utils/formatters';

function TableThumbnail({ src, alt }: { src: string; alt: string }) {
  const [error, setError] = useState(false);

  if (error) {
    return (
      <div className="w-10 h-10 rounded-lg shrink-0 border border-[#e6e2dc] dark:border-[#24312b] bg-[#faf8f4] dark:bg-[#15231c] flex items-center justify-center text-[#a8a29e]">
        <ImageIcon className="w-4 h-4 opacity-50" />
      </div>
    );
  }

  return (
    <div className="w-10 h-10 rounded-lg overflow-hidden shrink-0 border border-[#e6e2dc] dark:border-[#24312b] bg-[#faf8f4] relative">
      <Image
        src={src}
        alt={alt}
        fill
        sizes="40px"
        className="object-cover"
        onError={() => setError(true)}
      />
    </div>
  );
}

export interface AdminProblemsTableProps {
  problems: AdminProblemItem[];
  isLoading: boolean;
  page: number;
  totalPages: number;
  total: number;
  limit: number;
  sort?: string;
  onPageChange: (newPage: number) => void;
  onLimitChange: (newLimit: number) => void;
  onSortChange: (newSort: string) => void;
}

export const AdminProblemsTable: React.FC<AdminProblemsTableProps> = ({
  problems,
  isLoading,
  page,
  totalPages,
  total,
  limit,
  sort,
  onPageChange,
  onLimitChange,
  onSortChange,
}) => {
  const startIndex = total === 0 ? 0 : (page - 1) * limit + 1;
  const endIndex = Math.min(page * limit, total);

  const handleSortToggle = (column: 'date' | 'reports' | 'supports' | 'priority') => {
    if (column === 'date') {
      onSortChange(sort === 'date_desc' ? 'date_asc' : 'date_desc');
    } else {
      onSortChange(sort === column ? 'date_desc' : column);
    }
  };

  return (
    <div className="bg-white dark:bg-[#141d19] border border-[#e5e1d8] dark:border-[#24312b] rounded-[14px] overflow-hidden shadow-xs">
      {/* Table Content */}
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse text-[13.5px] sm:text-[14px]">
          <thead>
            <tr className="border-b border-[#e5e1d8] dark:border-[#24312b] bg-[#faf8f4]/75 dark:bg-[#0e1512]/75 text-[#5d6b65] dark:text-[#9aa8a1] text-[12px] font-medium uppercase tracking-[0.04em]">
              {/* Priority */}
              <th
                className="py-3.5 px-4 cursor-pointer hover:text-[#14201c] dark:hover:text-[#ece9e1] transition-colors"
                onClick={() => handleSortToggle('priority')}
              >
                <div className="flex items-center gap-1.5">
                  <span>Priority</span>
                  <ArrowUpDown className="w-3 h-3 text-[#78716c]" />
                </div>
              </th>

              {/* Problem */}
              <th
                className="py-3.5 px-4 cursor-pointer hover:text-[#1c1917] dark:hover:text-[#ece9e1] transition-colors min-w-[220px]"
                onClick={() => handleSortToggle('date')}
              >
                <div className="flex items-center gap-1.5">
                  <span>Problem</span>
                  <ArrowUpDown className="w-3 h-3 text-[#78716c]" />
                </div>
              </th>

              {/* Area */}
              <th className="py-3.5 px-4">Area</th>

              {/* Reports */}
              <th
                className="py-3.5 px-4 text-center cursor-pointer hover:text-[#1c1917] dark:hover:text-[#ece9e1] transition-colors"
                onClick={() => handleSortToggle('reports')}
              >
                <div className="flex items-center justify-center gap-1.5">
                  <span>Reports</span>
                  <ArrowUpDown className="w-3 h-3 text-[#78716c]" />
                </div>
              </th>

              {/* Supports */}
              <th
                className="py-3.5 px-4 text-center cursor-pointer hover:text-[#1c1917] dark:hover:text-[#ece9e1] transition-colors"
                onClick={() => handleSortToggle('supports')}
              >
                <div className="flex items-center justify-center gap-1.5">
                  <span>Supports</span>
                  <ArrowUpDown className="w-3 h-3 text-[#78716c]" />
                </div>
              </th>

              {/* Status */}
              <th className="py-3.5 px-4">Status</th>

              {/* Action */}
              <th className="py-3.5 px-4 text-right">Action</th>
            </tr>
          </thead>

          <tbody className="divide-y divide-[#e6e2dc] dark:divide-[#24312b]">
            {isLoading ? (
              // Loading Skeleton
              Array.from({ length: 5 }).map((_, i) => (
                <tr key={i} className="animate-pulse">
                  <td className="py-4 px-4">
                    <div className="h-5 w-16 bg-[#e6e2dc] dark:bg-[#24312b] rounded-md" />
                  </td>
                  <td className="py-4 px-4">
                    <div className="h-4 w-48 bg-[#e6e2dc] dark:bg-[#24312b] rounded-sm mb-1.5" />
                    <div className="h-3 w-28 bg-[#e6e2dc]/60 dark:bg-[#24312b]/60 rounded-sm" />
                  </td>
                  <td className="py-4 px-4">
                    <div className="h-4 w-24 bg-[#e6e2dc] dark:bg-[#24312b] rounded-sm" />
                  </td>
                  <td className="py-4 px-4 text-center">
                    <div className="h-5 w-10 mx-auto bg-[#e6e2dc] dark:bg-[#24312b] rounded-md" />
                  </td>
                  <td className="py-4 px-4 text-center">
                    <div className="h-5 w-10 mx-auto bg-[#e6e2dc] dark:bg-[#24312b] rounded-md" />
                  </td>
                  <td className="py-4 px-4">
                    <div className="h-5 w-20 bg-[#e6e2dc] dark:bg-[#24312b] rounded-full" />
                  </td>
                  <td className="py-4 px-4 text-right">
                    <div className="h-6 w-14 ml-auto bg-[#e6e2dc] dark:bg-[#24312b] rounded-md" />
                  </td>
                </tr>
              ))
            ) : problems.length > 0 ? (
              problems.map((item) => (
                <tr
                  key={item.id}
                  className="hover:bg-[#faf8f4]/70 dark:hover:bg-[#17221d]/70 transition-colors"
                >
                  {/* Priority Column */}
                  <td className="py-3.5 px-4 whitespace-nowrap">
                    <PriorityBadge
                      priority={item.priority}
                      size="sm"
                      isAdminOverride={Boolean(item.adminPriority)}
                    />
                  </td>

                  {/* Problem Column (Thumbnail, Title, Category, Date) */}
                  <td className="py-3.5 px-4 max-w-sm">
                    <div className="flex items-start gap-3">
                      {item.mediaUrl && (
                        <TableThumbnail src={item.mediaUrl} alt={item.title} />
                      )}
                      <div className="min-w-0">
                        <Link
                          href={`/admin/problems/${item.id}`}
                          className="font-semibold text-[#1c1917] dark:text-[#ece9e1] hover:text-[#0f6b4f] dark:hover:text-[#5cc9a0] transition-colors truncate block"
                          title={item.title}
                        >
                          {item.title}
                        </Link>
                        <div className="flex flex-wrap items-center gap-1.5 mt-0.5 text-[11px] text-[#78716c] dark:text-[#9aa8a1]">
                          <span className="font-medium text-[#0f6b4f] dark:text-[#5cc9a0]">
                            {item.category}
                          </span>
                          <span>•</span>
                          <span>{formatDate(item.createdAt)}</span>
                          {item.department && (
                            <>
                              <span>•</span>
                              <span className="inline-flex items-center gap-0.5 text-purple-700 dark:text-purple-300">
                                <Building className="w-2.5 h-2.5" />
                                {item.department.name}
                              </span>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                  </td>

                  {/* Area Column */}
                  <td className="py-3.5 px-4 whitespace-nowrap text-[#57534e] dark:text-[#a8a29e]">
                    <div className="font-medium text-[#1c1917] dark:text-[#ece9e1] flex items-center gap-1">
                      <MapPin className="w-3 h-3 text-[#78716c] dark:text-[#9aa8a1]" />
                      <span>{item.area || 'Metro Area'}</span>
                    </div>
                    <div className="text-[11px] text-[#78716c] dark:text-[#9aa8a1] truncate max-w-[160px]">
                      {item.address || item.city}
                    </div>
                  </td>

                  {/* Reports Column */}
                  <td className="py-3.5 px-4 text-center whitespace-nowrap">
                    <span
                      className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-[#faf8f4] dark:bg-[#0e1512] border border-[#e6e2dc] dark:border-[#24312b] font-semibold text-[#1c1917] dark:text-[#ece9e1]"
                      title={`${item.reportCount} Verified Reports`}
                    >
                      <Users className="w-3 h-3 text-[#0f6b4f] dark:text-[#5cc9a0]" />
                      {item.reportCount}
                    </span>
                  </td>

                  {/* Supports Column */}
                  <td className="py-3.5 px-4 text-center whitespace-nowrap">
                    <span
                      className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-[#faf8f4] dark:bg-[#0e1512] border border-[#e6e2dc] dark:border-[#24312b] font-semibold text-[#1c1917] dark:text-[#ece9e1]"
                      title={`${item.supportCount} Community Supporters`}
                    >
                      <ThumbsUp className="w-3 h-3 text-amber-600 dark:text-amber-400" />
                      {item.supportCount}
                    </span>
                  </td>

                  {/* Status Column */}
                  <td className="py-3.5 px-4 whitespace-nowrap">
                    <StatusPill status={item.status} size="sm" />
                  </td>

                  {/* Action Column */}
                  <td className="py-3.5 px-4 text-right whitespace-nowrap">
                    <Link
                      href={`/admin/problems/${item.id}`}
                      className="inline-flex items-center gap-1.5 py-1.5 px-3 rounded-lg bg-[#faf8f4] dark:bg-[#0e1512] hover:bg-[#0f6b4f] hover:text-white dark:hover:bg-[#0f6b4f] text-[#0f6b4f] dark:text-[#5cc9a0] border border-[#e6e2dc] dark:border-[#24312b] hover:border-[#0f6b4f] font-semibold text-xs transition-colors shadow-2xs"
                    >
                      <span>Review</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={7} className="py-12 text-center">
                  <div className="max-w-xs mx-auto text-center space-y-2">
                    <p className="text-sm font-semibold text-[#1c1917] dark:text-[#ece9e1]">
                      No problems found
                    </p>
                    <p className="text-xs text-[#78716c] dark:text-[#9aa8a1]">
                      Try adjusting or clearing your filters to see more results.
                    </p>
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination Footer */}
      <div className="p-4 border-t border-[#e6e2dc] dark:border-[#24312b] flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-[#78716c] dark:text-[#9aa8a1]">
        {/* Left: Range and Limit Selector */}
        <div className="flex items-center gap-3">
          <span>
            Showing <span className="font-semibold text-[#1c1917] dark:text-[#ece9e1]">{startIndex}</span> to{' '}
            <span className="font-semibold text-[#1c1917] dark:text-[#ece9e1]">{endIndex}</span> of{' '}
            <span className="font-semibold text-[#1c1917] dark:text-[#ece9e1]">{total}</span> items
          </span>

          <div className="flex items-center gap-1.5">
            <span>Per page:</span>
            <select
              value={limit}
              onChange={(e) => onLimitChange(Number(e.target.value))}
              className="py-1 px-2 rounded-md border border-[#e6e2dc] dark:border-[#24312b] bg-[#faf8f4] dark:bg-[#0e1512] text-[#1c1917] dark:text-[#ece9e1] text-xs focus:outline-none"
            >
              <option value={10}>10</option>
              <option value={15}>15</option>
              <option value={25}>25</option>
              <option value={50}>50</option>
            </select>
          </div>
        </div>

        {/* Right: Page Navigation Buttons */}
        <div className="flex items-center gap-1.5">
          <button
            onClick={() => onPageChange(page - 1)}
            disabled={page <= 1 || isLoading}
            className="p-1.5 rounded-lg border border-[#e6e2dc] dark:border-[#24312b] bg-[#faf8f4] dark:bg-[#0e1512] hover:bg-white dark:hover:bg-[#1a2621] disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            aria-label="Previous page"
          >
            <ChevronLeft className="w-4 h-4 text-[#1c1917] dark:text-[#ece9e1]" />
          </button>

          <span className="px-2 font-medium text-[#1c1917] dark:text-[#ece9e1]">
            Page {page} of {totalPages}
          </span>

          <button
            onClick={() => onPageChange(page + 1)}
            disabled={page >= totalPages || isLoading}
            className="p-1.5 rounded-lg border border-[#e6e2dc] dark:border-[#24312b] bg-[#faf8f4] dark:bg-[#0e1512] hover:bg-white dark:hover:bg-[#1a2621] disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            aria-label="Next page"
          >
            <ChevronRight className="w-4 h-4 text-[#1c1917] dark:text-[#ece9e1]" />
          </button>
        </div>
      </div>
    </div>
  );
};
