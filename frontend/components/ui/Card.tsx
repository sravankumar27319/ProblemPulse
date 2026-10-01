import React from 'react';
import { cn } from '../../lib/utils';

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'outline' | 'flat';
  padding?: 'none' | 'sm' | 'md' | 'lg';
  hoverable?: boolean;
}

export const Card = React.forwardRef<HTMLDivElement, CardProps>(
  (
    {
      children,
      className,
      variant = 'default',
      padding = 'md',
      hoverable = false,
      ...props
    },
    ref
  ) => {
    const paddingStyles = {
      none: 'p-0',
      sm: 'p-3.5',
      md: 'p-5',
      lg: 'p-7',
    };

    const variantStyles = {
      default: 'bg-white border border-[#e6e2dc] rounded-xl shadow-xs',
      outline: 'bg-transparent border border-[#e6e2dc] rounded-xl',
      flat: 'bg-[#f5f2eb] border border-transparent rounded-xl',
    };

    return (
      <div
        ref={ref}
        className={cn(
          variantStyles[variant],
          paddingStyles[padding],
          hoverable &&
            'transition-all duration-200 hover:border-[#0f6b4f]/40 hover:shadow-md cursor-pointer',
          className
        )}
        {...props}
      >
        {children}
      </div>
    );
  }
);

Card.displayName = 'Card';
