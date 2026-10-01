'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ThumbsUp, Check, Loader2, AlertCircle } from 'lucide-react';
import { problemService } from '../../services/problem.service';
import { useAuth } from '../../hooks/useAuth';

export interface SupportButtonProps {
  problemId: string;
  initialSupported?: boolean;
  initialCount?: number;
  onSupportChange?: (newCount: number, isSupported: boolean) => void;
  size?: 'sm' | 'md' | 'lg';
  variant?: 'primary' | 'outline' | 'ghost';
  className?: string;
  showCount?: boolean;
}

export const SupportButton: React.FC<SupportButtonProps> = ({
  problemId,
  initialSupported = false,
  initialCount = 0,
  onSupportChange,
  size = 'md',
  className = '',
  showCount = true,
}) => {
  const router = useRouter();
  const { user } = useAuth();

  const [isSupported, setIsSupported] = useState<boolean>(initialSupported);
  const [supportCount, setSupportCount] = useState<number>(initialCount);
  const [prevInitialSupported, setPrevInitialSupported] = useState<boolean>(initialSupported);
  const [prevInitialCount, setPrevInitialCount] = useState<number>(initialCount);

  // React-recommended pattern to sync state with props during render
  if (prevInitialSupported !== initialSupported) {
    setPrevInitialSupported(initialSupported);
    setIsSupported(initialSupported);
  }
  if (prevInitialCount !== initialCount) {
    setPrevInitialCount(initialCount);
    setSupportCount(initialCount);
  }

  const [status, setStatus] = useState<'idle' | 'loading' | 'error'>('idle');
  const [errorText, setErrorText] = useState<string | null>(null);

  const handleSupportToggle = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    // 1. Unauthenticated users -> Redirect to login
    if (!user) {
      if (typeof window !== 'undefined') {
        const returnUrl = encodeURIComponent(window.location.pathname + window.location.search);
        router.push(`/login?redirect=${returnUrl}`);
      } else {
        router.push('/login');
      }
      return;
    }

    if (status === 'loading') return;

    try {
      setStatus('loading');
      setErrorText(null);

      let res;
      if (isSupported) {
        // Toggle OFF (remove support)
        res = await problemService.removeSupport(problemId);
      } else {
        // Toggle ON (add support)
        res = await problemService.addSupport(problemId);
      }

      if (res && res.success) {
        const nextSupported = res.isSupported ?? res.supported ?? !isSupported;
        const nextCount = res.supportCount ?? (nextSupported ? supportCount + 1 : Math.max(0, supportCount - 1));

        setIsSupported(nextSupported);
        setSupportCount(nextCount);
        setStatus('idle');

        if (onSupportChange) {
          onSupportChange(nextCount, nextSupported);
        }
      } else {
        throw new Error(res?.message || 'Failed to update support status');
      }
    } catch (err: unknown) {
      const axiosError = err as { response?: { status?: number; data?: { error?: { message?: string } } } };
      const statusCode = axiosError?.response?.status;
      if (statusCode === 401) {
        router.push('/login');
        return;
      }

      if (statusCode === 409) {
        // Already supported on backend
        setIsSupported(true);
        setStatus('idle');
        return;
      }

      setStatus('error');
      setErrorText(axiosError?.response?.data?.error?.message || 'Try Again');

      // Auto-reset error state after 3 seconds
      setTimeout(() => {
        setStatus('idle');
        setErrorText(null);
      }, 3000);
    }
  };

  // Size styling
  const sizeClasses = {
    sm: 'text-xs px-2.5 py-1.5 gap-1.5 rounded-lg',
    md: 'text-sm px-3.5 py-2 gap-2 rounded-xl font-medium',
    lg: 'text-base px-5 py-2.5 gap-2.5 rounded-xl font-semibold',
  }[size];

  // Visual appearance based on state
  let buttonStyle = '';
  if (status === 'error') {
    buttonStyle = 'bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 border border-rose-200 dark:border-rose-900/50 hover:bg-rose-100';
  } else if (isSupported) {
    buttonStyle = 'bg-[#0f6b4f] text-white border border-[#0f6b4f] hover:bg-[#0b543d] dark:bg-[#5cc9a0] dark:text-[#0e1512] dark:border-[#5cc9a0] dark:hover:bg-[#4eb790] shadow-xs';
  } else {
    buttonStyle = 'bg-white dark:bg-[#141d19] text-[#14201c] dark:text-[#ece9e1] border border-[#d6d0c4] dark:border-[#2a3832] hover:bg-[#f4efe4] dark:hover:bg-[#1b2621] hover:border-[#0f6b4f]/40 dark:hover:border-[#5cc9a0]/40 shadow-2xs';
  }

  return (
    <button
      type="button"
      onClick={handleSupportToggle}
      disabled={status === 'loading'}
      aria-label={isSupported ? 'Remove support' : 'Support problem'}
      className={`inline-flex items-center justify-center transition-all duration-150 select-none cursor-pointer disabled:opacity-70 disabled:cursor-not-allowed ${sizeClasses} ${buttonStyle} ${className}`}
    >
      {status === 'loading' ? (
        <>
          <Loader2 className="w-4 h-4 animate-spin shrink-0" />
          <span>Supporting...</span>
        </>
      ) : status === 'error' ? (
        <>
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{errorText || 'Try Again'}</span>
        </>
      ) : isSupported ? (
        <>
          <Check className="w-4 h-4 shrink-0 stroke-[2.5]" />
          <span>Supported</span>
        </>
      ) : (
        <>
          <ThumbsUp className="w-4 h-4 shrink-0" />
          <span>Support Problem</span>
        </>
      )}

      {showCount && (
        <span
          className={`ml-1 px-1.5 py-0.5 rounded-full text-xs font-semibold tabular-nums ${
            isSupported
              ? 'bg-white/20 text-white dark:bg-black/20 dark:text-[#0e1512]'
              : 'bg-[#ede8dc] dark:bg-[#202d27] text-[#5d6b65] dark:text-[#9aa8a1]'
          }`}
        >
          {supportCount}
        </span>
      )}
    </button>
  );
};
