import React from 'react';
import { ProblemStatus } from '../../types/problem';
import { formatStatusLabel } from '../../utils/formatters';
import { cn } from '../../lib/utils';

export interface StatusPillProps {
  status: ProblemStatus;
  size?: 'sm' | 'md';
  className?: string;
}

export const StatusPill: React.FC<StatusPillProps> = ({
  status,
  size = 'md',
  className,
}) => {
  const styles: Record<ProblemStatus, { bg: string; text: string; border: string }> = {
    SUBMITTED: {
      bg: 'bg-[#eff6ff]',
      text: 'text-[#2563eb]',
      border: 'border-transparent',
    },
    UNDER_REVIEW: {
      bg: 'bg-[#eff6ff]',
      text: 'text-[#2563eb]',
      border: 'border-transparent',
    },
    VERIFIED: {
      bg: 'bg-[#ecfdf5]',
      text: 'text-[#059669]',
      border: 'border-transparent',
    },
    ASSIGNED: {
      bg: 'bg-[#eff6ff]',
      text: 'text-[#4f46e5]',
      border: 'border-transparent',
    },
    IN_PROGRESS: {
      bg: 'bg-[#fffbebf]',
      text: 'text-[#b45309]',
      border: 'border-transparent',
    },
    RESOLVED: {
      bg: 'bg-[#ecfdf5]',
      text: 'text-[#047857]',
      border: 'border-transparent',
    },
    COMMUNITY_VERIFIED: {
      bg: 'bg-[#e6f4ef]',
      text: 'text-[#0f6b4f]',
      border: 'border-transparent',
    },
    CLOSED: {
      bg: 'bg-[#f3f4f6]',
      text: 'text-[#4b5563]',
      border: 'border-transparent',
    },
    REJECTED: {
      bg: 'bg-[#fef2f2]',
      text: 'text-[#b91c1c]',
      border: 'border-transparent',
    },
    DUPLICATE: {
      bg: 'bg-[#f5f5f4]',
      text: 'text-[#78716c]',
      border: 'border-transparent',
    },
    REOPENED: {
      bg: 'bg-[#fff7ed]',
      text: 'text-[#c2410c]',
      border: 'border-transparent',
    },
  };

  const current = styles[status] || styles.SUBMITTED;

  const sizeClasses = {
    sm: 'px-2 py-0.5 text-[12px] font-semibold rounded-full',
    md: 'px-2.5 py-0.5 text-[12px] font-semibold rounded-full',
  };

  return (
    <span
      className={cn(
        'inline-flex items-center justify-center tracking-normal whitespace-nowrap',
        current.bg,
        current.text,
        current.border,
        sizeClasses[size],
        className
      )}
    >
      {formatStatusLabel(status)}
    </span>
  );
};
