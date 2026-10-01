import React from 'react';
import { Card } from '../ui/Card';
import { cn } from '../../lib/utils';

export type KpiVariant = 'pending' | 'critical' | 'in_progress' | 'resolved';

export interface KpiCardProps {
  title: string;
  count: number;
  subtitle: string;
  variant: KpiVariant;
  onClick?: () => void;
}

const dotColors: Record<KpiVariant, string> = {
  pending: 'bg-amber-500',
  critical: 'bg-red-500',
  in_progress: 'bg-blue-500',
  resolved: 'bg-emerald-500',
};

export const KpiCard: React.FC<KpiCardProps> = ({
  title,
  count,
  subtitle,
  variant,
  onClick,
}) => {
  return (
    <Card
      onClick={onClick}
      className={cn(
        'p-5 bg-white dark:bg-[#141d19] border border-[#e5e1d8] dark:border-[#24312b] rounded-[14px] transition-all shadow-xs',
        onClick && 'cursor-pointer hover:shadow-sm'
      )}
    >
      <div className="flex items-center justify-between">
        <span className="text-[14px] font-medium text-[#5d6b65] dark:text-[#9aa8a1]">
          {title}
        </span>
        <span className={cn('w-2 h-2 rounded-full', dotColors[variant])} />
      </div>

      <div className="text-[32px] font-heading font-medium text-[#14201c] dark:text-[#ece9e1] my-2 leading-tight">
        {count}
      </div>

      <p className="text-[12px] font-normal text-[#5d6b65] dark:text-[#9aa8a1]">
        {subtitle}
      </p>
    </Card>
  );
};

