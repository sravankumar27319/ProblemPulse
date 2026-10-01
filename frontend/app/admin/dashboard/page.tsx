'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../../hooks/useAuth';
import { adminService } from '../../../services/admin.service';
import { AdminDashboardData } from '../../../types/admin';
import { Sidebar } from '../../../components/Sidebar';
import { KpiCard } from '../../../components/admin/KpiCard';
import { ProblemQueueTable } from '../../../components/admin/ProblemQueueTable';
import { SidePanel } from '../../../components/admin/SidePanel';
import { Loading } from '../../../components/ui/Loading';
import { ErrorMessage } from '../../../components/ui/ErrorMessage';
import { Button } from '../../../components/ui/Button';
import { Card } from '../../../components/ui/Card';

export default function DashboardPage() {
  const router = useRouter();
  const { user, isLoading: authLoading, logout } = useAuth();
  const [data, setData] = useState<AdminDashboardData | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [sidebarCollapsed, setSidebarCollapsed] = useState<boolean>(false);

  const loadDashboard = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const res = await adminService.fetchDashboard();
      if (res.success) {
        setData(res.data);
      }
    } catch (err: unknown) {
      const axiosError = err as { response?: { data?: { message?: string } } };
      setError(
        axiosError?.response?.data?.message ||
          'Failed to load admin dashboard statistics.'
      );
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (!authLoading && user && user.role === 'ADMIN') {
      loadDashboard();
    } else if (!authLoading && (!user || user.role !== 'ADMIN')) {
      setIsLoading(false);
    }
  }, [user, authLoading]);

  // Loading state
  if (authLoading || (isLoading && user?.role === 'ADMIN')) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#faf8f4] dark:bg-[#0e1512]">
        <Loading size="lg" text="Loading municipal admin portal..." />
      </div>
    );
  }

  // Not logged in or not admin
  if (!user || user.role !== 'ADMIN') {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-[#faf8f4] dark:bg-[#0e1512] text-[#14201c] dark:text-[#ece9e1]">
        <Card className="max-w-md w-full p-8 text-center bg-white dark:bg-[#141d19] border border-[#e5e1d8] dark:border-[#24312b] space-y-6 shadow-xs">
          <div className="space-y-2">
            <h2 className="font-heading text-2xl font-normal">
              Admin Access Required
            </h2>
            <p className="text-xs text-[#5d6b65] dark:text-[#9aa8a1] leading-relaxed">
              This dashboard is restricted to authorized municipal officers and emergency triage administrators.
            </p>
          </div>
          <div className="flex flex-col gap-3">
            <Link href="/admin/login">
              <Button fullWidth size="lg">
                Sign In to Admin Portal
              </Button>
            </Link>
            <Link href="/discover">
              <Button variant="outline" fullWidth size="md">
                Return to Citizen Portal
              </Button>
            </Link>
          </div>
        </Card>
      </div>
    );
  }

  const kpis = data?.kpis || {
    pendingReview: 0,
    critical: 0,
    inProgress: 0,
    resolved: 0,
  };

  return (
    <div className="min-h-screen flex bg-[#faf8f4] dark:bg-[#0e1512] text-[#14201c] dark:text-[#ece9e1]">
      {/* Admin Sidebar */}
      <Sidebar
        collapsed={sidebarCollapsed}
        onToggleCollapse={() => setSidebarCollapsed(!sidebarCollapsed)}
      />

      {/* Main Content Area with vertical scrolling */}
      <div className="flex-1 flex flex-col min-w-0 overflow-y-auto">
        {/* Top Minimal Utility Bar */}
        <header className="h-12 px-6 bg-white dark:bg-[#141d19] border-b border-[#e5e1d8] dark:border-[#24312b] flex items-center justify-between gap-4 sticky top-0 z-20 shrink-0">
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-[#0f6b4f] dark:text-[#5cc9a0]">
              Operations Hub
            </span>
          </div>

          <div className="flex items-center gap-3 text-xs">
            <button
              type="button"
              onClick={loadDashboard}
              className="text-[#5d6b65] dark:text-[#9aa8a1] hover:text-[#14201c] dark:hover:text-[#ece9e1] font-medium transition-colors cursor-pointer"
            >
              Refresh
            </button>
            <span className="text-[#e5e1d8] dark:text-[#24312b]">|</span>
            <Link
              href="/discover"
              target="_blank"
              className="text-[#5d6b65] dark:text-[#9aa8a1] hover:text-[#14201c] dark:hover:text-[#ece9e1] font-medium transition-colors"
            >
              Public Portal
            </Link>
            <span className="text-[#e5e1d8] dark:text-[#24312b]">|</span>
            <span className="font-medium text-[#14201c] dark:text-[#ece9e1]">
              {user.name} (ADMIN)
            </span>
            <button
              type="button"
              onClick={() => logout()}
              className="text-[#c8371d] dark:text-[#ff8a70] font-medium hover:underline cursor-pointer ml-1"
            >
              Sign out
            </button>
          </div>
        </header>

        {/* Dashboard Body */}
        <main className="flex-1 p-7 sm:p-8 max-w-7xl w-full mx-auto space-y-6">
          {error && (
            <ErrorMessage
              title="Dashboard Data Error"
              message={error}
            />
          )}

          {/* Reference Header Row: Dashboard Title + Subtitle + Action Controls */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-1">
            <div>
              <h1 className="font-heading text-[26px] font-medium text-[#14201c] dark:text-[#ece9e1] tracking-tight">
                Dashboard
              </h1>
              <p className="text-[15px] text-[#5d6b65] dark:text-[#9aa8a1] mt-1">
                What needs your attention today.
              </p>
            </div>

            <div className="flex items-center gap-2.5 flex-1 max-w-sm sm:justify-end">
              <input
                type="text"
                placeholder="Search problems, areas..."
                className="w-full sm:w-72 px-3.5 py-2 text-[14px] rounded-[8px] border border-[#e5e1d8] dark:border-[#24312b] bg-white dark:bg-[#141d19] text-[#14201c] dark:text-[#ece9e1] placeholder-[#78716c] focus:outline-none focus:ring-1 focus:ring-[#0f6b4f]"
              />
            </div>
          </div>

          {/* 1. KPI Row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <KpiCard
              title="Pending review"
              count={kpis.pendingReview}
              subtitle="↑ 8 today"
              variant="pending"
            />
            <KpiCard
              title="Critical"
              count={kpis.critical}
              subtitle="↑ 3 today"
              variant="critical"
            />
            <KpiCard
              title="In progress"
              count={kpis.inProgress}
              subtitle="↓ 4 this week"
              variant="in_progress"
            />
            <KpiCard
              title="Resolved"
              count={kpis.resolved}
              subtitle="↑ 31 this week"
              variant="resolved"
            />
          </div>

          {/* 2. Main Grid: Queue Table (8 cols) + Side Panels (4 cols) */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            {/* Left: Problem Queue Table */}
            <div className="lg:col-span-8">
              <ProblemQueueTable problems={data?.queue || []} />
            </div>

            {/* Right: Side Panels */}
            <div className="lg:col-span-4">
              <SidePanel
                awaitingReview={data?.awaitingReview || []}
                byCategory={data?.byCategory || []}
                thisWeek={
                  data?.thisWeek || {
                    newReports: 0,
                    verified: 0,
                    reopened: 0,
                    avgResolutionTime: '36 hrs',
                  }
                }
              />
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}

