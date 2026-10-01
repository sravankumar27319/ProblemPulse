'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '../lib/utils';
import { useAuth } from '../hooks/useAuth';

export interface SidebarProps {
  collapsed?: boolean;
  onToggleCollapse?: () => void;
  unreviewedCount?: number;
}

export const Sidebar: React.FC<SidebarProps> = ({
  collapsed = false,
  onToggleCollapse,
  unreviewedCount = 18,
}) => {
  const pathname = usePathname();
  const { logout } = useAuth();

  const overviewItems = [
    { label: 'Dashboard', href: '/admin/dashboard' },
    { label: 'Problems', href: '/admin/problems', badge: unreviewedCount },
    { label: 'Map', href: '/admin/map' },
    { label: 'Analytics', href: '/admin/analytics' },
  ];

  return (
    <aside
      className={cn(
        'relative bg-[#0e1713] text-[#8a9e94] border-r border-[#1b2b23] min-h-screen flex flex-col justify-between transition-all duration-300 z-30 shrink-0 select-none',
        collapsed ? 'w-16' : 'w-64'
      )}
    >
      <div>
        {/* Sidebar Header */}
        <div className="h-16 flex items-center justify-between px-5 border-b border-white/[0.18]">
          <Link href="/admin/dashboard" className="flex items-center gap-2.5">
            <span className="font-heading font-semibold text-[20px] text-white tracking-tight">
              {collapsed ? 'P' : 'ProblemPulse'}
            </span>
          </Link>
          {onToggleCollapse && (
            <button
              type="button"
              onClick={onToggleCollapse}
              className="text-white/90 hover:text-white text-xs cursor-pointer p-1 transition-opacity"
              aria-label="Toggle sidebar"
            >
              {collapsed ? '→' : '←'}
            </button>
          )}
        </div>

        {/* OVERVIEW SECTION ONLY */}
        <div className="pt-6 px-3">
          {!collapsed && (
            <div className="px-3 pb-2 text-[12px] font-medium uppercase tracking-[0.08em] text-[#5e7368]">
              Overview
            </div>
          )}
          <nav className="flex flex-col gap-1.5">
            {overviewItems.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.label}
                  href={item.href}
                  className={cn(
                    'flex items-center justify-between px-3 py-2.5 rounded-lg text-[16px] font-medium transition-colors',
                    isActive
                      ? 'bg-[#0f6b4f] text-white'
                      : 'text-[#8a9e94] hover:text-white hover:bg-[#15231c]',
                    collapsed && 'justify-center px-0'
                  )}
                  title={collapsed ? item.label : undefined}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <span className={cn('text-[10px]', isActive ? 'text-white' : 'text-[#5e7368]')}>
                      ●
                    </span>
                    {!collapsed && <span className="truncate">{item.label}</span>}
                  </div>
                  {!collapsed && item.badge ? (
                    <span className="px-2 py-0.5 text-[12px] font-semibold bg-[#c8371d] text-white rounded-full leading-none">
                      {item.badge}
                    </span>
                  ) : null}
                </Link>
              );
            })}
          </nav>
        </div>
      </div>

      {/* Footer Sign Out */}
      <div className="p-3 border-t border-[#1b2b23]">
        <button
          type="button"
          onClick={() => logout()}
          className={cn(
            'w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-[14px] font-medium text-[#8a9e94] hover:text-[#ff8a70] transition-colors cursor-pointer',
            collapsed && 'justify-center px-0'
          )}
        >
          <span className="text-[10px] text-[#5e7368]">●</span>
          {!collapsed && <span>Sign out</span>}
        </button>
      </div>
    </aside>
  );
};

