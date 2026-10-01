import React from 'react';
import { cn } from '../../lib/utils';
import { Button } from './Button';

export interface ErrorMessageProps {
  title?: string;
  message: string;
  onRetry?: () => void;
  className?: string;
}

export const ErrorMessage: React.FC<ErrorMessageProps> = ({
  title = 'An error occurred',
  message,
  onRetry,
  className,
}) => {
  return (
    <div
      className={cn(
        'rounded-xl border border-[#fecaca] bg-[#fef2f2] p-4 flex items-start gap-3 text-[#991b1b]',
        className
      )}
      role="alert"
    >
      <span className="w-2 h-2 rounded-full bg-[#dc2626] shrink-0 mt-1.5" aria-hidden="true" />
      <div className="flex-1 text-sm">
        <h4 className="font-serif font-bold text-[#991b1b]">{title}</h4>
        <p className="mt-0.5 text-xs text-[#b91c1c]/90">{message}</p>
        {onRetry && (
          <div className="mt-3">
            <Button
              variant="outline"
              size="sm"
              onClick={onRetry}
              className="border-[#fecaca] text-[#991b1b] hover:bg-[#fee2e2] text-xs h-7 px-3"
            >
              Retry
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};
