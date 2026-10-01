import React from 'react';
import { cn } from '../../lib/utils';

export interface InputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  (
    {
      label,
      error,
      helperText,
      leftIcon,
      rightIcon,
      className,
      id,
      disabled,
      ...props
    },
    ref
  ) => {
    const inputId =
      id || (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined);

    return (
      <div className="w-full flex flex-col gap-1.5">
        {label && (
          <label
            htmlFor={inputId}
            className="text-xs font-medium text-[#44403c] tracking-wide"
          >
            {label}
          </label>
        )}
        <div className="relative flex items-center">
          {leftIcon && (
            <div className="absolute left-3 text-[#78716c] pointer-events-none flex items-center">
              {leftIcon}
            </div>
          )}
          <input
            id={inputId}
            ref={ref}
            disabled={disabled}
            suppressHydrationWarning
            className={cn(
              'w-full bg-white text-[#1c1917] placeholder:text-[#a8a29e] text-sm rounded-lg border border-[#e6e2dc] px-3.5 py-2.5 transition-colors duration-150',
              'focus:outline-none focus:border-[#0f6b4f] focus:ring-1 focus:ring-[#0f6b4f]',
              'disabled:bg-[#faf8f5] disabled:text-[#a8a29e] disabled:cursor-not-allowed',
              leftIcon ? 'pl-9' : false,
              rightIcon ? 'pr-9' : false,
              error ? 'border-[#dc2626] focus:border-[#dc2626] focus:ring-[#dc2626]' : false,
              className
            )}
            {...props}
          />
          {rightIcon && (
            <div className="absolute right-3 text-[#78716c] flex items-center">
              {rightIcon}
            </div>
          )}
        </div>
        {error ? (
          <p className="text-xs text-[#dc2626] font-medium">{error}</p>
        ) : helperText ? (
          <p className="text-xs text-[#78716c]">{helperText}</p>
        ) : null}
      </div>
    );
  }
);

Input.displayName = 'Input';
