'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { useAuth } from '../../../hooks/useAuth';
import { adminService } from '../../../services/admin.service';
import { AdminAnalyticsData } from '../../../types/admin';
import { Sidebar } from '../../../components/Sidebar';
import { Loading } from '../../../components/ui/Loading';
import { ErrorMessage } from '../../../components/ui/ErrorMessage';
import { Button } from '../../../components/ui/Button';
import { Card } from '../../../components/ui/Card';
import {
  BarChart3,
  Clock,
  CheckCircle2,
  TrendingUp,
  MapPin,
  Layers,
  ShieldAlert,
  RefreshCw,
  Calendar,
  Lock,
  ArrowRight,
  CheckCircle,
  FileText,
  Activity,
} from 'lucide-react';
import { cn } from '../../../lib/utils';

type TimeRangeOption = 'all' | '7days' | '30days' | '90days' | 'year';

const TIME_RANGES: { label: string; value: TimeRangeOption }[] = [
  { label: 'All Time', value: 'all' },
  { label: 'Past 7 Days', value: '7days' },
  { label: 'Past 30 Days', value: '30days' },
  { label: 'Past 90 Days', value: '90days' },
  { label: 'Past Year', value: 'year' },
];

const CATEGORY_COLORS: Record<string, { bg: string; fill: string; text: string }> = {
  ROAD: { bg: 'bg-amber-500/10', fill: 'bg-amber-500', text: 'text-amber-700 dark:text-amber-400' },
  WATER: { bg: 'bg-cyan-500/10', fill: 'bg-cyan-500', text: 'text-cyan-700 dark:text-cyan-400' },
  GARBAGE: { bg: 'bg-emerald-500/10', fill: 'bg-emerald-500', text: 'text-emerald-700 dark:text-emerald-400' },
  ELECTRICITY: { bg: 'bg-yellow-500/10', fill: 'bg-yellow-500', text: 'text-yellow-700 dark:text-yellow-400' },
  TRAFFIC: { bg: 'bg-purple-500/10', fill: 'bg-purple-500', text: 'text-purple-700 dark:text-purple-400' },
  OTHER: { bg: 'bg-stone-500/10', fill: 'bg-stone-500', text: 'text-stone-700 dark:text-stone-400' },
};

const PRIORITY_BADGES: Record<string, { bg: string; border: string; text: string }> = {
  CRITICAL: {
    bg: 'bg-red-500/10 dark:bg-red-950/30',
    border: 'border-red-500/20',
    text: 'text-red-700 dark:text-red-400',
  },
  MAJOR: {
    bg: 'bg-amber-500/10 dark:bg-amber-950/30',
    border: 'border-amber-500/20',
    text: 'text-amber-700 dark:text-amber-400',
  },
  LOW: {
    bg: 'bg-blue-500/10 dark:bg-blue-950/30',
    border: 'border-blue-500/20',
    text: 'text-blue-700 dark:text-blue-400',
  },
};

const STATUS_LABELS: Record<string, { label: string; badge: string }> = {
  SUBMITTED: { label: 'Submitted', badge: 'bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300' },
  UNDER_REVIEW: { label: 'Under Review', badge: 'bg-indigo-100 text-indigo-800 dark:bg-indigo-950 dark:text-indigo-300' },
  VERIFIED: { label: 'Verified', badge: 'bg-purple-100 text-purple-800 dark:bg-purple-950 dark:text-purple-300' },
  ASSIGNED: { label: 'Assigned', badge: 'bg-cyan-100 text-cyan-800 dark:bg-cyan-950 dark:text-cyan-300' },
  IN_PROGRESS: { label: 'In Progress', badge: 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300' },
  RESOLVED: { label: 'Resolved', badge: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300' },
  COMMUNITY_VERIFIED: { label: 'Community Verified', badge: 'bg-teal-100 text-teal-800 dark:bg-teal-950 dark:text-teal-300' },
  CLOSED: { label: 'Closed', badge: 'bg-stone-200 text-stone-800 dark:bg-stone-800 dark:text-stone-300' },
  REOPENED: { label: 'Reopened', badge: 'bg-orange-100 text-orange-800 dark:bg-orange-950 dark:text-orange-300' },
  REJECTED: { label: 'Rejected', badge: 'bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-300' },
  DUPLICATE: { label: 'Duplicate', badge: 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300' },
};

export default function AdminAnalyticsPage() {
  const { user, isLoading: authLoading } = useAuth();
  const [data, setData] = useState<AdminAnalyticsData | null>(null);
  const [selectedRange, setSelectedRange] = useState<TimeRangeOption>('all');
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [sidebarCollapsed, setSidebarCollapsed] = useState<boolean>(false);

  const fetchAnalyticsData = useCallback(async (range: TimeRangeOption) => {
    try {
      setIsLoading(true);
      setError(null);
      const res = await adminService.fetchAnalytics(range);
      if (res.success) {
        setData(res.data);
      }
    } catch (err: unknown) {
      const axiosError = err as { response?: { data?: { message?: string } } };
      setError(
        axiosError?.response?.data?.message ||
          'Failed to load analytics. Please try refreshing.'
      );
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    let ignore = false;

    if (!authLoading && user && user.role === 'ADMIN') {
      adminService
        .fetchAnalytics(selectedRange)
        .then((res) => {
          if (!ignore && res.success) {
            setData(res.data);
          }
        })
        .catch((err) => {
          if (!ignore) {
            const axiosError = err as { response?: { data?: { message?: string } } };
            setError(
              axiosError?.response?.data?.message ||
                'Failed to load analytics. Please try refreshing.'
            );
          }
        })
        .finally(() => {
          if (!ignore) {
            setIsLoading(false);
          }
        });
    }

    return () => {
      ignore = true;
    };
  }, [user, authLoading, selectedRange]);

  // Unauthorized view
  if (!authLoading && (!user || user.role !== 'ADMIN')) {

    return (
      <div className="min-h-screen bg-[#f7f5f0] dark:bg-[#0c1410] flex items-center justify-center p-4">
        <Card className="max-w-md w-full p-8 text-center bg-white dark:bg-[#141d19] border border-[#e6e2dc] dark:border-[#22352b] shadow-md">
          <div className="w-14 h-14 bg-red-500/10 text-red-600 dark:text-red-400 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Lock className="w-7 h-7" />
          </div>
          <h2 className="text-xl font-heading font-bold text-[#1c1917] dark:text-[#ece9e1] mb-2">
            Administrator Access Required
          </h2>
          <p className="text-sm text-[#78716c] dark:text-[#a8a29e] mb-6">
            You must be logged in as an official city administrator to view municipal analytics.
          </p>
          <div className="flex gap-3 justify-center">
            <Link href="/admin/login">
              <Button variant="primary">Admin Login</Button>
            </Link>
            <Link href="/">
              <Button variant="secondary">Back to Citizen Portal</Button>
            </Link>
          </div>
        </Card>
      </div>
    );
  }

  // Calculate normalized monthly trends for rendering & scaling
  const rawMonthly = data ? (data.monthlyTrend || data.monthlyTrends || []) : [];
  const monthlyTrendsList = rawMonthly.map((m: any) => ({
    month: m.month || m.monthKey || '',
    label: m.label || m.monthLabel || m.month || m.monthKey || '',
    reports: Number(m.reports ?? m.newReports ?? 0),
    resolved: Number(m.resolved ?? m.resolvedCount ?? 0),
  }));

  const maxMonthlyCount = monthlyTrendsList.reduce(
    (max: number, item: any) => Math.max(max, item.reports, item.resolved),
    0
  ) || 1;

  return (
    <div className="min-h-screen bg-[#faf8f4] dark:bg-[#0e1512] flex">
      {/* Sidebar Navigation */}
      <Sidebar
        collapsed={sidebarCollapsed}
        onToggleCollapse={() => setSidebarCollapsed(!sidebarCollapsed)}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-y-auto">
        {/* Top Header */}
        <header className="sticky top-0 z-20 bg-white/95 dark:bg-[#141d19]/95 backdrop-blur-md border-b border-[#e5e1d8] dark:border-[#24312b] px-7 sm:px-8 py-3.5 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div>
              <div className="flex items-center gap-2">
                <h1 className="font-heading text-[26px] font-medium text-[#14201c] dark:text-[#ece9e1]">
                  Analytics
                </h1>
                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[12px] font-semibold uppercase tracking-[0.08em] bg-[#e3f0ea] text-[#0f6b4f] dark:bg-[#173026] dark:text-[#5cc9a0]">
                  Live Pulse
                </span>
              </div>
              <p className="text-[14px] text-[#5d6b65] dark:text-[#9aa8a1] mt-0.5">
                Comprehensive municipal reporting trends, turnaround metrics, and geographic breakdowns
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Time Range Filter Pills */}
            <div className="inline-flex items-center bg-[#f0ede6] dark:bg-[#1b2621] p-1 rounded-xl border border-[#e6e2dc] dark:border-[#22352b]">
              <Calendar className="w-3.5 h-3.5 ml-2 text-[#78716c] dark:text-[#a8a29e]" />
              <div className="flex items-center gap-1 px-1">
                {TIME_RANGES.map((range) => (
                  <button
                    key={range.value}
                    type="button"
                    onClick={() => setSelectedRange(range.value)}
                    className={cn(
                      'px-3 py-1 text-xs font-medium rounded-lg transition-all',
                      selectedRange === range.value
                        ? 'bg-white dark:bg-[#25362e] text-[#1c1917] dark:text-[#ece9e1] shadow-xs'
                        : 'text-[#78716c] dark:text-[#a8a29e] hover:text-[#1c1917] dark:hover:text-[#ece9e1]'
                    )}
                  >
                    {range.label}
                  </button>
                ))}
              </div>
            </div>

            <Button
              variant="secondary"
              size="sm"
              onClick={() => fetchAnalyticsData(selectedRange)}
              disabled={isLoading}
              className="gap-2 border-[#e6e2dc] dark:border-[#22352b]"
            >
              <RefreshCw className={cn('w-4 h-4', isLoading && 'animate-spin')} />
              <span>Refresh</span>
            </Button>
          </div>
        </header>

        {/* Page Content */}
        <main className="p-6 max-w-7xl w-full mx-auto space-y-6">
          {error && (
            <ErrorMessage
              message={error}
              onRetry={() => fetchAnalyticsData(selectedRange)}
            />
          )}

          {isLoading && !data ? (
            <div className="py-24 flex items-center justify-center">
              <Loading text="Compiling civic analytics..." size="lg" />
            </div>
          ) : !data ? null : (
            <>
              {/* Top KPI Cards Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {/* Total Reports */}
                <Card className="p-5 bg-white dark:bg-[#141d19] border border-[#e6e2dc] dark:border-[#22352b] shadow-xs">
                  <div className="flex items-center justify-between gap-4">
                    <div>
                      <span className="text-xs font-medium text-[#78716c] dark:text-[#a8a29e] uppercase tracking-wider">
                        Total Reports
                      </span>
                      <div className="text-3xl font-heading font-bold text-[#1c1917] dark:text-[#ece9e1] mt-1">
                        {data.summary.totalProblems}
                      </div>
                      <p className="text-xs text-[#78716c] dark:text-[#a8a29e] mt-1 flex items-center gap-1">
                        <Activity className="w-3.5 h-3.5 text-blue-500" />
                        <span>Active backlog: <strong className="text-[#1c1917] dark:text-[#ece9e1]">{data.summary.activeBacklog}</strong></span>
                      </p>
                    </div>
                    <div className="w-12 h-12 rounded-xl bg-blue-500/10 flex items-center justify-center shrink-0">
                      <FileText className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                    </div>
                  </div>
                </Card>

                {/* Resolution Rate */}
                <Card className="p-5 bg-white dark:bg-[#141d19] border border-[#e6e2dc] dark:border-[#22352b] shadow-xs">
                  <div className="flex items-center justify-between gap-4">
                    <div className="w-full">
                      <span className="text-xs font-medium text-[#78716c] dark:text-[#a8a29e] uppercase tracking-wider">
                        Resolution Rate
                      </span>
                      <div className="text-3xl font-heading font-bold text-[#0f6b4f] dark:text-[#5cc9a0] mt-1">
                        {data.summary.resolutionRate}%
                      </div>
                      <div className="w-full bg-[#f0ede6] dark:bg-[#202d26] h-1.5 rounded-full overflow-hidden mt-2">
                        <div
                          className="bg-[#0f6b4f] dark:bg-[#5cc9a0] h-full rounded-full transition-all duration-500"
                          style={{ width: `${Math.min(100, Math.max(0, data.summary.resolutionRate))}%` }}
                        />
                      </div>
                      <p className="text-xs text-[#78716c] dark:text-[#a8a29e] mt-1.5">
                        {data.summary.resolvedCount ?? data.summary.resolvedTotal ?? 0} of {data.summary.totalProblems} issues resolved
                      </p>
                    </div>
                    <div className="w-12 h-12 rounded-xl bg-[#0f6b4f]/10 flex items-center justify-center shrink-0">
                      <CheckCircle2 className="w-6 h-6 text-[#0f6b4f] dark:text-[#5cc9a0]" />
                    </div>
                  </div>
                </Card>

                {/* Avg Resolution Turnaround */}
                <Card className="p-5 bg-white dark:bg-[#141d19] border border-[#e6e2dc] dark:border-[#22352b] shadow-xs">
                  <div className="flex items-center justify-between gap-4">
                    <div>
                      <span className="text-xs font-medium text-[#78716c] dark:text-[#a8a29e] uppercase tracking-wider">
                        Avg Resolution Time
                      </span>
                      <div className="text-3xl font-heading font-bold text-[#1c1917] dark:text-[#ece9e1] mt-1">
                        {(data.summary.avgResolutionTimeHours ?? data.summary.avgResolutionHours ?? 0) > 0
                          ? `${data.summary.avgResolutionTimeHours ?? data.summary.avgResolutionHours}h`
                          : 'N/A'}
                      </div>
                      <p className="text-xs text-[#78716c] dark:text-[#a8a29e] mt-1">
                        {(data.summary.avgResolutionTimeDays ?? Math.round(((data.summary.avgResolutionHours ?? 0) / 24) * 10) / 10) > 0
                          ? `~${data.summary.avgResolutionTimeDays ?? Math.round(((data.summary.avgResolutionHours ?? 0) / 24) * 10) / 10} days from submit to fix`
                          : 'No completed resolutions yet'}
                      </p>
                    </div>
                    <div className="w-12 h-12 rounded-xl bg-amber-500/10 flex items-center justify-center shrink-0">
                      <Clock className="w-6 h-6 text-amber-600 dark:text-amber-400" />
                    </div>
                  </div>
                </Card>

                {/* Top Concentration */}
                <Card className="p-5 bg-white dark:bg-[#141d19] border border-[#e6e2dc] dark:border-[#22352b] shadow-xs">
                  <div className="flex items-center justify-between gap-4">
                    <div>
                      <span className="text-xs font-medium text-[#78716c] dark:text-[#a8a29e] uppercase tracking-wider">
                        Highest Volume
                      </span>
                      <div className="text-xl font-heading font-bold text-[#1c1917] dark:text-[#ece9e1] mt-1 truncate max-w-[170px]">
                        {data.summary.topCategory}
                      </div>
                      <p className="text-xs text-[#78716c] dark:text-[#a8a29e] mt-1 flex items-center gap-1">
                        <MapPin className="w-3.5 h-3.5 text-stone-500" />
                        <span className="truncate max-w-[150px]">{data.summary.topArea}</span>
                      </p>
                    </div>
                    <div className="w-12 h-12 rounded-xl bg-purple-500/10 flex items-center justify-center shrink-0">
                      <Layers className="w-6 h-6 text-purple-600 dark:text-purple-400" />
                    </div>
                  </div>
                </Card>
              </div>

              {/* Monthly Trend & Performance Ratio */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Reports Per Month Trend (2 cols) */}
                <Card className="lg:col-span-2 p-6 bg-white dark:bg-[#141d19] border border-[#e6e2dc] dark:border-[#22352b]">
                  <div className="flex items-center justify-between mb-6">
                    <div>
                      <h2 className="text-base font-heading font-bold text-[#1c1917] dark:text-[#ece9e1] flex items-center gap-2">
                        <TrendingUp className="w-4 h-4 text-[#0f6b4f] dark:text-[#5cc9a0]" />
                        Reports vs Resolutions Over Time
                      </h2>
                      <p className="text-xs text-[#78716c] dark:text-[#a8a29e] mt-0.5">
                        Monthly intake volume compared to verified municipal resolutions
                      </p>
                    </div>
                    <div className="flex items-center gap-4 text-xs">
                      <div className="flex items-center gap-1.5">
                        <div className="w-3 h-3 rounded-xs bg-[#0f6b4f]" />
                        <span className="text-[#57534e] dark:text-[#a8a29e]">Reports Submitted</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <div className="w-3 h-3 rounded-xs bg-emerald-400" />
                        <span className="text-[#57534e] dark:text-[#a8a29e]">Resolved</span>
                      </div>
                    </div>
                  </div>

                  {monthlyTrendsList.length === 0 ? (
                    <div className="h-48 flex items-center justify-center text-xs text-[#78716c] dark:text-[#a8a29e]">
                      No historical reports logged for this period.
                    </div>
                  ) : (
                    <div className="space-y-4 pt-2">
                      <div className="grid grid-cols-1 gap-4">
                        {monthlyTrendsList.map((m) => {
                          const reportPercent = Math.max(4, Math.round((m.reports / maxMonthlyCount) * 100));
                          const resolvedPercent = Math.max(0, Math.round((m.resolved / maxMonthlyCount) * 100));

                          return (
                            <div key={m.month} className="space-y-1.5">
                              <div className="flex items-center justify-between text-xs">
                                <span className="font-semibold text-[#1c1917] dark:text-[#ece9e1]">
                                  {m.label}
                                </span>
                                <span className="text-[#78716c] dark:text-[#a8a29e]">
                                  <strong>{m.reports}</strong> submitted &bull; <strong className="text-[#0f6b4f] dark:text-[#5cc9a0]">{m.resolved}</strong> resolved
                                </span>
                              </div>
                              <div className="space-y-1">
                                {/* Intake bar */}
                                <div className="w-full bg-[#f0ede6] dark:bg-[#1f2c25] h-3 rounded-md overflow-hidden flex">
                                  <div
                                    className="bg-[#0f6b4f] h-full rounded-md transition-all duration-500 flex items-center justify-end pr-1.5"
                                    style={{ width: `${reportPercent}%` }}
                                    title={`${m.reports} reports`}
                                  />
                                </div>
                                {/* Resolved bar */}
                                <div className="w-full bg-[#f0ede6] dark:bg-[#1f2c25] h-2 rounded-md overflow-hidden flex">
                                  <div
                                    className="bg-emerald-400 dark:bg-emerald-500 h-full rounded-md transition-all duration-500"
                                    style={{ width: `${resolvedPercent}%` }}
                                    title={`${m.resolved} resolved`}
                                  />
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </Card>

                {/* Resolved vs Unresolved Ratio Card (1 col) */}
                <Card className="p-6 bg-white dark:bg-[#141d19] border border-[#e6e2dc] dark:border-[#22352b] flex flex-col justify-between">
                  <div>
                    <h2 className="text-base font-heading font-bold text-[#1c1917] dark:text-[#ece9e1] flex items-center gap-2 mb-1">
                      <CheckCircle className="w-4 h-4 text-[#0f6b4f] dark:text-[#5cc9a0]" />
                      Resolution Efficiency
                    </h2>
                    <p className="text-xs text-[#78716c] dark:text-[#a8a29e] mb-6">
                      Proportion of reported problems cleared vs pending municipal remediation
                    </p>

                    <div className="space-y-4">
                      {/* Big Meter */}
                      <div className="p-4 rounded-xl bg-[#f7f5f0] dark:bg-[#18231e] border border-[#e6e2dc] dark:border-[#22352b] text-center">
                        <div className="text-4xl font-heading font-extrabold text-[#0f6b4f] dark:text-[#5cc9a0]">
                          {data.resolutionRatio.resolutionRate ?? data.resolutionRatio.ratePercentage ?? data.summary.resolutionRate ?? 0}%
                        </div>
                        <p className="text-xs text-[#78716c] dark:text-[#a8a29e] mt-1">
                          Overall Clearance Ratio
                        </p>
                        {/* Dual Bar */}
                        <div className="w-full bg-red-100 dark:bg-red-950/40 h-3 rounded-full overflow-hidden mt-3 flex">
                          <div
                            className="bg-[#0f6b4f] dark:bg-[#5cc9a0] h-full transition-all duration-500"
                            style={{ width: `${Math.min(100, Math.max(0, data.resolutionRatio.resolutionRate ?? data.resolutionRatio.ratePercentage ?? data.summary.resolutionRate ?? 0))}%` }}
                          />
                        </div>
                        <div className="flex justify-between items-center text-[11px] text-[#78716c] dark:text-[#a8a29e] mt-1.5">
                          <span className="text-[#0f6b4f] dark:text-[#5cc9a0] font-medium">
                            {data.resolutionRatio.resolved} Resolved
                          </span>
                          <span className="text-red-600 dark:text-red-400 font-medium">
                            {data.resolutionRatio.unresolved} Backlog
                          </span>
                        </div>
                      </div>

                      {/* Summary list */}
                      <div className="space-y-2 text-xs">
                        <div className="flex items-center justify-between p-2.5 rounded-lg bg-[#f0ede6]/60 dark:bg-[#1b2621]">
                          <span className="text-[#57534e] dark:text-[#a8a29e]">Total Intake</span>
                          <strong className="text-[#1c1917] dark:text-[#ece9e1]">
                            {data.resolutionRatio.total}
                          </strong>
                        </div>
                        <div className="flex items-center justify-between p-2.5 rounded-lg bg-[#f0ede6]/60 dark:bg-[#1b2621]">
                          <span className="text-[#57534e] dark:text-[#a8a29e]">Fully Fixed &amp; Closed</span>
                          <strong className="text-[#0f6b4f] dark:text-[#5cc9a0]">
                            {data.resolutionRatio.resolved}
                          </strong>
                        </div>
                        <div className="flex items-center justify-between p-2.5 rounded-lg bg-[#f0ede6]/60 dark:bg-[#1b2621]">
                          <span className="text-[#57534e] dark:text-[#a8a29e]">Pending Dispatch / Review</span>
                          <strong className="text-amber-600 dark:text-amber-400">
                            {data.resolutionRatio.unresolved}
                          </strong>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="pt-4 border-t border-[#e6e2dc] dark:border-[#22352b] mt-4">
                    <Link href="/admin/problems?status=IN_PROGRESS">
                      <Button variant="outline" size="sm" className="w-full justify-between">
                        <span>Review Open Backlog</span>
                        <ArrowRight className="w-4 h-4 ml-1" />
                      </Button>
                    </Link>
                  </div>
                </Card>
              </div>

              {/* Category Breakdown & Priority Distribution */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Problems by Category */}
                <Card className="p-6 bg-white dark:bg-[#141d19] border border-[#e6e2dc] dark:border-[#22352b]">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h2 className="text-base font-heading font-bold text-[#1c1917] dark:text-[#ece9e1] flex items-center gap-2">
                        <Layers className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                        Problems by Category
                      </h2>
                      <p className="text-xs text-[#78716c] dark:text-[#a8a29e] mt-0.5">
                        Breakdown of civic reports across infrastructure sectors
                      </p>
                    </div>
                  </div>

                  <div className="space-y-4">
                    {data.byCategory.map((cat) => {
                      const style = CATEGORY_COLORS[cat.category] || CATEGORY_COLORS.OTHER;
                      const catResolvedRate = cat.count > 0 ? Math.round((cat.resolvedCount / cat.count) * 100) : 0;

                      return (
                        <div key={cat.category} className="space-y-1.5">
                          <div className="flex items-center justify-between text-xs">
                            <div className="flex items-center gap-2">
                              <span className={cn('px-2 py-0.5 rounded-md font-semibold text-[11px]', style.bg, style.text)}>
                                {cat.category}
                              </span>
                              <span className="text-[#78716c] dark:text-[#a8a29e]">
                                {cat.count} {cat.count === 1 ? 'issue' : 'issues'} ({cat.percentage}%)
                              </span>
                            </div>
                            <span className="text-xs font-medium text-[#57534e] dark:text-[#9aa8a1]">
                              {cat.resolvedCount} resolved ({catResolvedRate}%)
                            </span>
                          </div>

                          <div className="w-full bg-[#f0ede6] dark:bg-[#1f2c25] h-2.5 rounded-full overflow-hidden">
                            <div
                              className={cn('h-full rounded-full transition-all duration-500', style.fill)}
                              style={{ width: `${Math.max(2, cat.percentage)}%` }}
                            />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </Card>

                {/* Problems by Priority */}
                <Card className="p-6 bg-white dark:bg-[#141d19] border border-[#e6e2dc] dark:border-[#22352b]">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h2 className="text-base font-heading font-bold text-[#1c1917] dark:text-[#ece9e1] flex items-center gap-2">
                        <ShieldAlert className="w-4 h-4 text-red-600 dark:text-red-400" />
                        Problems by Priority
                      </h2>
                      <p className="text-xs text-[#78716c] dark:text-[#a8a29e] mt-0.5">
                        Severity distribution factoring in automated scoring and administrator overrides
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-6">
                    {data.byPriority.map((p) => {
                      const badge = PRIORITY_BADGES[p.priority] || PRIORITY_BADGES.LOW;
                      return (
                        <div
                          key={p.priority}
                          className={cn(
                            'p-4 rounded-xl border text-center transition-all',
                            badge.bg,
                            badge.border
                          )}
                        >
                          <div className={cn('text-xs font-bold uppercase tracking-wider', badge.text)}>
                            {p.priority}
                          </div>
                          <div className="text-2xl font-heading font-bold text-[#1c1917] dark:text-[#ece9e1] mt-1">
                            {p.count}
                          </div>
                          <div className="text-xs text-[#78716c] dark:text-[#a8a29e] mt-0.5">
                            {p.percentage}% of total
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {/* Priority Bar distribution */}
                  <div className="space-y-2">
                    <span className="text-xs font-medium text-[#78716c] dark:text-[#a8a29e]">
                      Priority Share Ratio
                    </span>
                    <div className="w-full bg-[#f0ede6] dark:bg-[#1f2c25] h-3.5 rounded-full overflow-hidden flex">
                      {data.byPriority.map((p) => {
                        const bg =
                          p.priority === 'CRITICAL'
                            ? 'bg-red-500'
                            : p.priority === 'MAJOR'
                            ? 'bg-amber-500'
                            : 'bg-blue-500';
                        return (
                          <div
                            key={p.priority}
                            className={cn('h-full transition-all duration-500', bg)}
                            style={{ width: `${p.percentage}%` }}
                            title={`${p.priority}: ${p.count} (${p.percentage}%)`}
                          />
                        );
                      })}
                    </div>
                    <div className="flex justify-between text-[11px] text-[#78716c] dark:text-[#a8a29e] pt-1">
                      <span className="text-red-600 dark:text-red-400 font-medium">
                        Critical: {data.byPriority.find(p => p.priority === 'CRITICAL')?.count || 0}
                      </span>
                      <span className="text-amber-600 dark:text-amber-400 font-medium">
                        Major: {data.byPriority.find(p => p.priority === 'MAJOR')?.count || 0}
                      </span>
                      <span className="text-blue-600 dark:text-blue-400 font-medium">
                        Low: {data.byPriority.find(p => p.priority === 'LOW')?.count || 0}
                      </span>
                    </div>
                  </div>
                </Card>
              </div>

              {/* Geographic Area Breakdown & Lifecycle Status Grid */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Problems by Area */}
                <Card className="p-6 bg-white dark:bg-[#141d19] border border-[#e6e2dc] dark:border-[#22352b]">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h2 className="text-base font-heading font-bold text-[#1c1917] dark:text-[#ece9e1] flex items-center gap-2">
                        <MapPin className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                        Problems by Area
                      </h2>
                      <p className="text-xs text-[#78716c] dark:text-[#a8a29e] mt-0.5">
                        Geographic density and resolution rate sorted by complaint volume
                      </p>
                    </div>
                  </div>

                  {data.byArea.length === 0 ? (
                    <div className="py-8 text-center text-xs text-[#78716c] dark:text-[#a8a29e]">
                      No area reports recorded yet.
                    </div>
                  ) : (
                    <div className="divide-y divide-[#f0ede6] dark:divide-[#202d26] max-h-80 overflow-y-auto pr-1">
                      {data.byArea.map((item) => (
                        <div key={item.area} className="py-2.5 flex items-center justify-between gap-3">
                          <div className="min-w-0">
                            <p className="text-sm font-semibold text-[#1c1917] dark:text-[#ece9e1] truncate">
                              {item.area}
                            </p>
                            <p className="text-xs text-[#78716c] dark:text-[#a8a29e]">
                              {item.count} {item.count === 1 ? 'report' : 'reports'} &bull; {item.resolvedCount} resolved
                            </p>
                          </div>
                          <div className="text-right shrink-0">
                            <span
                              className={cn(
                                'inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold',
                                item.resolutionRate >= 70
                                  ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                                  : item.resolutionRate >= 40
                                  ? 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                                  : 'bg-stone-100 text-stone-800 dark:bg-stone-800 dark:text-stone-300'
                              )}
                            >
                              {item.resolutionRate}% fixed
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </Card>

                {/* Problems by Status (Lifecycle Breakdown) */}
                <Card className="p-6 bg-white dark:bg-[#141d19] border border-[#e6e2dc] dark:border-[#22352b]">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h2 className="text-base font-heading font-bold text-[#1c1917] dark:text-[#ece9e1] flex items-center gap-2">
                        <Activity className="w-4 h-4 text-[#0f6b4f] dark:text-[#5cc9a0]" />
                        Problems by Status
                      </h2>
                      <p className="text-xs text-[#78716c] dark:text-[#a8a29e] mt-0.5">
                        Current stage of all citizen reports across the municipal lifecycle
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 max-h-80 overflow-y-auto pr-1">
                    {data.byStatus.map((s) => {
                      const meta = STATUS_LABELS[s.status] || {
                        label: s.status,
                        badge: 'bg-stone-100 text-stone-800',
                      };
                      return (
                        <div
                          key={s.status}
                          className="flex items-center justify-between p-2.5 rounded-xl bg-[#f7f5f0] dark:bg-[#1b2621] border border-[#e6e2dc] dark:border-[#22352b]"
                        >
                          <span className={cn('px-2 py-0.5 rounded-md text-[11px] font-semibold', meta.badge)}>
                            {meta.label}
                          </span>
                          <div className="text-right">
                            <span className="text-sm font-bold text-[#1c1917] dark:text-[#ece9e1]">
                              {s.count}
                            </span>
                            <span className="text-[11px] text-[#78716c] dark:text-[#a8a29e] ml-1">
                              ({s.percentage}%)
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </Card>
              </div>
            </>
          )}
        </main>
      </div>
    </div>
  );
}
