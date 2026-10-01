import React from 'react';
import { PriorityLevel } from '../../types/problem';
import { formatPriorityLabel } from '../../utils/formatters';
import { cn } from '../../lib/utils';

export interface PriorityBadgeProps {
  priority: PriorityLevel;
  size?: 'sm' | 'md';
  className?: string;
  showIcon?: boolean;
  isAdminOverride?: boolean;
}

export const PriorityBadge: React.FC<PriorityBadgeProps> = ({
  priority,
  size = 'md',
  className,
  showIcon = true,
  isAdminOverride = false,
}) => {
  const styles: Record<
    PriorityLevel,
    { bg: string; text: string; dot: string }
  > = {
    CRITICAL: {
      bg: 'bg-[#fbe6e2] dark:bg-[#2c1712]',
      text: 'text-[#c8371d] dark:text-[#ff8a70]',
      dot: 'bg-[#c8371d] dark:bg-[#ff8a70]',
    },
    MAJOR: {
      bg: 'bg-[#faf0da] dark:bg-[#2b230f]',
      text: 'text-[#c77700] dark:text-[#f0b04a]',
      dot: 'bg-[#c77700] dark:bg-[#f0b04a]',
    },
    LOW: {
      bg: 'bg-[#e3f0ea] dark:bg-[#173026]',
      text: 'text-[#2f7d4f] dark:text-[#6fcf97]',
      dot: 'bg-[#2f7d4f] dark:bg-[#6fcf97]',
    },
  };

  const current = styles[priority] || styles.LOW;

  const sizeClasses = {
    sm: 'px-2 py-0.5 text-[12px] font-semibold gap-1.5 rounded-full',
    md: 'px-2.5 py-0.5 text-[12px] font-semibold gap-1.5 rounded-full',
  };

  return (
    <span
      className={cn(
        'inline-flex items-center',
        current.bg,
        current.text,
        sizeClasses[size],
        className
      )}
      title={isAdminOverride ? 'Admin Assigned Priority' : 'Auto-Calculated Priority'}
    >
      {showIcon && (
        <span
          className={cn('w-1.5 h-1.5 rounded-full shrink-0', current.dot)}
          aria-hidden="true"
        />
      )}
      <span>{formatPriorityLabel(priority)}</span>
    </span>
  );
};
