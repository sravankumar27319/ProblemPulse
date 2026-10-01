'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { AdminQueueItem } from '../../types/admin';
import { Card } from '../ui/Card';
import { cn } from '../../lib/utils';

export interface ProblemQueueTableProps {
  problems: AdminQueueItem[];
}

export const ProblemQueueTable: React.FC<ProblemQueueTableProps> = ({ problems }) => {
  const [activeTab, setActiveTab] = useState<'CRITICAL' | 'PENDING' | 'RECENT'>('CRITICAL');

  const filteredProblems = problems.filter((item) => {
    if (activeTab === 'CRITICAL') return item.priority === 'CRITICAL';
    if (activeTab === 'PENDING') return item.status === 'SUBMITTED' || item.status === 'UNDER_REVIEW';
    return true; // RECENT: show all
  });

  return (
    <Card className="bg-white dark:bg-[#141d19] border border-[#e5e1d8] dark:border-[#24312b] rounded-[14px] overflow-hidden shadow-xs">
      {/* Table Header & Pill Filter Tabs */}
      <div className="p-5 border-b border-[#e5e1d8] dark:border-[#24312b] flex items-center justify-between gap-4">
        <h3 className="font-heading font-medium text-[18px] text-[#14201c] dark:text-[#ece9e1]">
          Problem queue
        </h3>

        {/* Quick Filter Tabs matching reference: Critical | Pending | Recent */}
        <div className="flex items-center gap-1 bg-[#faf8f4] dark:bg-[#0e1512] p-1 rounded-full border border-[#e5e1d8] dark:border-[#24312b]">
          <button
            type="button"
            onClick={() => setActiveTab('CRITICAL')}
            className={cn(
              'px-3 py-1 rounded-full text-[12px] font-semibold transition-colors cursor-pointer',
              activeTab === 'CRITICAL'
                ? 'bg-[#e3f0ea] dark:bg-[#173026] text-[#0f6b4f] dark:text-[#5cc9a0]'
                : 'text-[#5d6b65] dark:text-[#9aa8a1] hover:text-[#14201c]'
            )}
          >
            Critical
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('PENDING')}
            className={cn(
              'px-3 py-1 rounded-full text-[12px] font-semibold transition-colors cursor-pointer',
              activeTab === 'PENDING'
                ? 'bg-[#e3f0ea] dark:bg-[#173026] text-[#0f6b4f] dark:text-[#5cc9a0]'
                : 'text-[#5d6b65] dark:text-[#9aa8a1] hover:text-[#14201c]'
            )}
          >
            Pending
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('RECENT')}
            className={cn(
              'px-3 py-1 rounded-full text-[12px] font-semibold transition-colors cursor-pointer',
              activeTab === 'RECENT'
                ? 'bg-[#e3f0ea] dark:bg-[#173026] text-[#0f6b4f] dark:text-[#5cc9a0]'
                : 'text-[#5d6b65] dark:text-[#9aa8a1] hover:text-[#14201c]'
            )}
          >
            Recent
          </button>
        </div>
      </div>

      {/* Table Data */}
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse text-[13.5px] sm:text-[14px]">
          <thead>
            <tr className="border-b border-[#e5e1d8] dark:border-[#24312b] text-[#5d6b65] dark:text-[#9aa8a1] text-[12px] font-medium uppercase tracking-[0.04em]">
              <th className="py-3 px-5">Priority</th>
              <th className="py-3 px-5">Problem</th>
              <th className="py-3 px-5">Area</th>
              <th className="py-3 px-5">Reports</th>
              <th className="py-3 px-5">Status</th>
              <th className="py-3 px-5 text-right"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#e5e1d8] dark:divide-[#24312b]">
            {filteredProblems.length > 0 ? (
              filteredProblems.map((item) => (
                <tr
                  key={item.id}
                  className="hover:bg-[#faf8f4]/60 dark:hover:bg-[#17221d]/60 transition-colors"
                >
                  {/* Priority Pill */}
                  <td className="py-4 px-5 whitespace-nowrap">
                    <span
                      className={cn(
                        'inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[12px] font-semibold',
                        item.priority === 'CRITICAL' && 'bg-[#fbe6e2] text-[#c8371d] dark:bg-[#2c1712] dark:text-[#ff8a70]',
                        item.priority === 'MAJOR' && 'bg-[#faf0da] text-[#c77700] dark:bg-[#2b230f] dark:text-[#f0b04a]',
                        item.priority === 'LOW' && 'bg-[#e3f0ea] text-[#2f7d4f] dark:bg-[#173026] dark:text-[#6fcf97]'
                      )}
                    >
                      <span
                        className={cn(
                          'w-1.5 h-1.5 rounded-full',
                          item.priority === 'CRITICAL' && 'bg-[#c8371d] dark:bg-[#ff8a70]',
                          item.priority === 'MAJOR' && 'bg-[#c77700] dark:bg-[#f0b04a]',
                          item.priority === 'LOW' && 'bg-[#2f7d4f] dark:bg-[#6fcf97]'
                        )}
                      />
                      {item.priority === 'CRITICAL'
                        ? 'Critical'
                        : item.priority === 'MAJOR'
                        ? 'Major'
                        : 'Low'}
                    </span>
                  </td>

                  {/* Problem (Title + Location) */}
                  <td className="py-4 px-5 max-w-xs">
                    <div className="font-semibold text-[14px] text-[#14201c] dark:text-[#ece9e1] truncate">
                      {item.title}
                    </div>
                    <div className="text-[12px] text-[#5d6b65] dark:text-[#9aa8a1] mt-0.5">
                      {item.area || item.city}
                    </div>
                  </td>

                  {/* Area */}
                  <td className="py-4 px-5 whitespace-nowrap text-[13.5px] sm:text-[14px] text-[#5d6b65] dark:text-[#9aa8a1]">
                    {item.area ? item.area : '—'}
                  </td>

                  {/* Reports Count */}
                  <td className="py-4 px-5 whitespace-nowrap text-[13.5px] sm:text-[14px] font-normal text-[#14201c] dark:text-[#ece9e1]">
                    {item.reportCount + (item.supportCount || 0)}
                  </td>

                  {/* Status Pill */}
                  <td className="py-4 px-5 whitespace-nowrap">
                    <span
                      className={cn(
                        'inline-block px-2.5 py-0.5 rounded-full text-[12px] font-semibold',
                        (item.status === 'UNDER_REVIEW' || item.status === 'SUBMITTED') &&
                          'bg-[#eff6ff] text-[#1e40af] dark:bg-[#1e2a38] dark:text-[#93c5fd]',
                        item.status === 'VERIFIED' &&
                          'bg-[#e3f0ea] text-[#0f6b4f] dark:bg-[#173026] dark:text-[#5cc9a0]',
                        item.status === 'ASSIGNED' &&
                          'bg-[#faf5ff] text-[#6b21a8] dark:bg-[#281a38] dark:text-[#d8b4fe]',
                        item.status === 'IN_PROGRESS' &&
                          'bg-[#faf0da] text-[#c77700] dark:bg-[#2b230f] dark:text-[#f0b04a]',
                        item.status === 'RESOLVED' &&
                          'bg-[#e3f0ea] text-[#2f7d4f] dark:bg-[#173026] dark:text-[#6fcf97]'
                      )}
                    >
                      {item.status === 'SUBMITTED' || item.status === 'UNDER_REVIEW'
                        ? 'Review'
                        : item.status === 'VERIFIED'
                        ? 'Verified'
                        : item.status === 'ASSIGNED'
                        ? 'Assigned'
                        : item.status === 'IN_PROGRESS'
                        ? 'In Progress'
                        : 'Resolved'}
                    </span>
                  </td>

                  {/* Action Link: View → */}
                  <td className="py-4 px-5 text-right whitespace-nowrap">
                    <Link
                      href={`/admin/problems/${item.id}`}
                      className="text-[14px] font-medium text-[#0f6b4f] dark:text-[#5cc9a0] hover:underline transition-colors"
                    >
                      View →
                    </Link>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={6} className="py-8 text-center text-[13.5px] text-[#5d6b65] dark:text-[#9aa8a1]">
                  No problems match current queue filters.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </Card>
  );
};

