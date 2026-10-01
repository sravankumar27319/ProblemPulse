'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { MapPin, ArrowRight, Calendar } from 'lucide-react';
import { Card } from '../ui/Card';
import { PriorityBadge } from '../ui/PriorityBadge';
import { StatusPill } from '../ui/StatusPill';
import { SupportButton } from './SupportButton';
import { ProblemSummary } from '../../types/problem';
import { formatDate } from '../../utils/formatters';

export interface ProblemCardProps {
  problem: ProblemSummary;
  onSupportChange?: (problemId: string, newCount: number, isSupported: boolean) => void;
  isSupported?: boolean;
}

const CATEGORY_LABELS: Record<string, string> = {
  ROAD: 'Roads',
  WATER: 'Water',
  ELECTRICITY: 'Electricity',
  GARBAGE: 'Sanitation & Waste',
  TRAFFIC: 'Traffic',
  OTHER: 'Public Infrastructure',
};

export const ProblemCard: React.FC<ProblemCardProps> = ({
  problem,
  onSupportChange,
  isSupported = false,
}) => {
  const [currentCount, setCurrentCount] = useState<number>(problem.supportCount);
  const [supportedState, setSupportedState] = useState<boolean>(
    problem.isSupported ?? problem.supported ?? isSupported
  );

  const handleSupportUpdate = (newCount: number, supported: boolean) => {
    setCurrentCount(newCount);
    setSupportedState(supported);
    if (onSupportChange) {
      onSupportChange(problem.id, newCount, supported);
    }
  };

  const categoryName = CATEGORY_LABELS[problem.category] || problem.category;

  return (
    <Card hoverable className="flex flex-col justify-between h-full bg-white dark:bg-[#141d19] border border-[#e5e1d8] dark:border-[#24312b] rounded-2xl p-5 shadow-2xs hover:shadow-md transition-all duration-200">
      <div>
        {/* Top Badges: Category & Status & Priority */}
        <div className="flex items-center justify-between gap-2 mb-3.5 flex-wrap">
          <span className="inline-flex items-center text-xs font-semibold px-2.5 py-1 rounded-full bg-[#f0ede6] dark:bg-[#1f2b25] text-[#0f6b4f] dark:text-[#5cc9a0] tracking-wide">
            {categoryName}
          </span>
          <div className="flex items-center gap-1.5">
            <PriorityBadge priority={problem.priority} size="sm" />
            <StatusPill status={problem.status} size="sm" />
          </div>
        </div>

        {/* Title */}
        <Link href={`/problems/${problem.id}`} className="group block">
          <h3 className="font-heading font-semibold text-lg text-[#14201c] dark:text-[#ece9e1] leading-snug line-clamp-2 mb-2 group-hover:text-[#0f6b4f] dark:group-hover:text-[#5cc9a0] transition-colors">
            {problem.title}
          </h3>
        </Link>

        {/* Address / Location */}
        <div className="flex items-center gap-1.5 text-xs text-[#5d6b65] dark:text-[#9aa8a1] mb-2.5">
          <MapPin className="w-3.5 h-3.5 text-[#0f6b4f] dark:text-[#5cc9a0] shrink-0" />
          <span className="truncate">{problem.address || `${problem.area}, ${problem.city}`}</span>
        </div>

        {/* Description snippet */}
        <p className="text-xs sm:text-sm text-[#5d6b65] dark:text-[#9aa8a1] line-clamp-3 leading-relaxed mb-4">
          {problem.description}
        </p>
      </div>

      <div className="pt-3 border-t border-[#e5e1d8] dark:border-[#24312b] space-y-3">
        {/* Date and Citizen report count */}
        <div className="flex items-center justify-between text-xs text-[#7e8b85] dark:text-[#889891]">
          <div className="flex items-center gap-1">
            <Calendar className="w-3.5 h-3.5 text-[#9aa8a1]" />
            <span>{formatDate(problem.createdAt)}</span>
          </div>
          {problem.reportCount > 1 && (
            <span className="text-[11px] font-medium bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 px-2 py-0.5 rounded-full">
              {problem.reportCount} reports linked
            </span>
          )}
        </div>

        {/* Action Bar: Support Problem Button + View Details */}
        <div className="flex items-center justify-between gap-2 pt-1">
          <SupportButton
            problemId={problem.id}
            initialSupported={supportedState}
            initialCount={currentCount}
            onSupportChange={handleSupportUpdate}
            size="sm"
          />

          <Link
            href={`/problems/${problem.id}`}
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#0f6b4f] dark:text-[#5cc9a0] hover:text-[#0b543d] dark:hover:text-[#4eb790] px-2.5 py-1.5 rounded-lg hover:bg-[#f0ede6] dark:hover:bg-[#1a2520] transition-colors"
          >
            <span>View Details</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>
    </Card>
  );
};
