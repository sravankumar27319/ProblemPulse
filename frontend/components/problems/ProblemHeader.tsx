import React from 'react';
import { PriorityBadge } from '../ui/PriorityBadge';
import { StatusPill } from '../ui/StatusPill';
import { ProblemDetail } from '../../types/problem';
import { formatDate } from '../../utils/formatters';
import { Building2, User, Calendar } from 'lucide-react';

export const ProblemHeader: React.FC<{ problem: ProblemDetail }> = ({ problem }) => {
  return (
    <div className="space-y-4 border-b border-[#e5e1d8] dark:border-[#24312b] pb-6">
      {/* Category & Status Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold tracking-wider uppercase px-2.5 py-1 rounded-md bg-[#e3f0ea] dark:bg-[#173026] text-[#0f6b4f] dark:text-[#5cc9a0] border border-[#0f6b4f]/20">
            {problem.category}
          </span>
          <PriorityBadge
            priority={problem.priority}
            isAdminOverride={Boolean(problem.adminPriority)}
            size="md"
          />
        </div>
        <StatusPill status={problem.status} size="md" />
      </div>

      {/* Title */}
      <h1 className="font-heading text-3xl sm:text-4xl font-semibold text-[#14201c] dark:text-[#ece9e1] leading-tight">
        {problem.title}
      </h1>

      {/* Meta Information Bar */}
      <div className="flex flex-wrap items-center gap-y-2 gap-x-5 text-xs text-[#5d6b65] dark:text-[#9aa8a1]">
        <div className="flex items-center gap-1.5">
          <Calendar className="w-4 h-4 text-[#78716c]" />
          <span>Reported on {formatDate(problem.createdAt)}</span>
        </div>

        {problem.createdBy && (
          <div className="flex items-center gap-1.5">
            <User className="w-4 h-4 text-[#78716c]" />
            <span>By {problem.createdBy.name}</span>
          </div>
        )}

        {problem.department && (
          <div className="flex items-center gap-1.5 text-[#0f6b4f] dark:text-[#5cc9a0] font-semibold">
            <Building2 className="w-4 h-4" />
            <span>Assigned: {problem.department.name}</span>
          </div>
        )}
      </div>
    </div>
  );
};
