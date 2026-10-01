import React from 'react';
import { cn } from '../../lib/utils';

export interface LoadingProps {
  size?: 'sm' | 'md' | 'lg';
  text?: string;
  fullPage?: boolean;
  className?: string;
}

export const Loading: React.FC<LoadingProps> = ({
  size = 'md',
  text,
  fullPage = false,
  className,
}) => {
  const sizeClasses = {
    sm: 'w-4 h-4 border-2',
    md: 'w-7 h-7 border-2',
    lg: 'w-10 h-10 border-3',
  };

  const content = (
    <div
      className={cn(
        'flex flex-col items-center justify-center gap-3 p-4 text-[#0f6b4f]',
        className
      )}
    >
      <div
        className={cn(
          'rounded-full border-current border-t-transparent animate-spin shrink-0',
          sizeClasses[size]
        )}
      />
      {text && <p className="text-xs font-medium text-[#5d6b65]">{text}</p>}
    </div>
  );

  if (fullPage) {
    return (
      <div className="min-h-[60vh] w-full flex items-center justify-center">
        {content}
      </div>
    );
  }

  return content;
};

export const Skeleton: React.FC<{ className?: string }> = ({ className }) => (
  <div className={cn('animate-pulse bg-[#e6e2dc]/60 rounded-md', className)} />
);
