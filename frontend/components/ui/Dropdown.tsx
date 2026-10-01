import React from 'react';
import { ChevronDown } from 'lucide-react';
import { cn } from '../../lib/utils';

export interface DropdownOption {
  value: string;
  label: string;
  disabled?: boolean;
}

export interface DropdownProps
  extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  options: DropdownOption[];
  error?: string;
  helperText?: string;
  placeholder?: string;
}

export const Dropdown = React.forwardRef<HTMLSelectElement, DropdownProps>(
  (
    {
      label,
      options,
      error,
      helperText,
      placeholder,
      className,
      id,
      disabled,
      value,
      onChange,
      ...props
    },
    ref
  ) => {
    const selectId =
      id || (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined);

    return (
      <div className="w-full flex flex-col gap-1.5">
        {label && (
          <label
            htmlFor={selectId}
            className="text-xs font-medium text-[#44403c] tracking-wide"
          >
            {label}
          </label>
        )}
        <div className="relative flex items-center">
          <select
            id={selectId}
            ref={ref}
            disabled={disabled}
            value={value}
            onChange={onChange}
            className={cn(
              'w-full appearance-none bg-white text-[#1c1917] text-sm rounded-lg border border-[#e6e2dc] pl-3.5 pr-10 py-2.5 transition-colors duration-150',
              'focus:outline-none focus:border-[#0f6b4f] focus:ring-1 focus:ring-[#0f6b4f]',
              'disabled:bg-[#faf8f5] disabled:text-[#a8a29e] disabled:cursor-not-allowed',
              error && 'border-[#dc2626] focus:border-[#dc2626] focus:ring-[#dc2626]',
              className
            )}
            {...props}
          >
            {placeholder && (
              <option value="" disabled>
                {placeholder}
              </option>
            )}
            {options.map((opt) => (
              <option key={opt.value} value={opt.value} disabled={opt.disabled}>
                {opt.label}
              </option>
            ))}
          </select>
          <ChevronDown className="w-4 h-4 text-[#78716c] absolute right-3 pointer-events-none" />
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

Dropdown.displayName = 'Dropdown';
