'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { useAuth } from '../../../hooks/useAuth';
import { adminService } from '../../../services/admin.service';
import {
  AdminProblemItem,
  AdminProblemsFilter,
} from '../../../types/admin';
import { Sidebar } from '../../../components/Sidebar';
import { ProblemFiltersBar } from '../../../components/admin/ProblemFiltersBar';
import { AdminProblemsTable } from '../../../components/admin/AdminProblemsTable';
import { Loading } from '../../../components/ui/Loading';
import { ErrorMessage } from '../../../components/ui/ErrorMessage';
import { Button } from '../../../components/ui/Button';
import { Card } from '../../../components/ui/Card';
import {
  Lock,
  RefreshCw,
  LayoutDashboard,
  ShieldCheck,
} from 'lucide-react';

export default function AdminProblemsPage() {
  const { user, isLoading: authLoading } = useAuth();
  const [problems, setProblems] = useState<AdminProblemItem[]>([]);
  const [total, setTotal] = useState<number>(0);
  const [totalPages, setTotalPages] = useState<number>(1);
  const [availableAreas, setAvailableAreas] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [sidebarCollapsed, setSidebarCollapsed] = useState<boolean>(false);

  // Filters State
  const [filters, setFilters] = useState<AdminProblemsFilter>({
    page: 1,
    limit: 15,
    priority: 'ALL',
    status: 'ALL',
    category: 'ALL',
    area: 'ALL',
    date: 'all',
    search: '',
    sort: 'date_desc',
  });

  const loadProblems = useCallback(async (currentFilters: AdminProblemsFilter) => {
    try {
      setIsLoading(true);
      setError(null);
      const res = await adminService.fetchProblems(currentFilters);
      if (res.success) {
        setProblems(res.data.problems);
        setTotal(res.data.total);
        setTotalPages(res.data.totalPages);
        if (res.data.areas && res.data.areas.length > 0) {
          setAvailableAreas(res.data.areas);
        }
      }
    } catch (err: unknown) {
      const axiosError = err as { response?: { data?: { message?: string } } };
      setError(
        axiosError?.response?.data?.message ||
          'Failed to load problems. Please try refreshing.'
      );
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!authLoading && user && user.role === 'ADMIN') {
      loadProblems(filters);
    } else if (!authLoading && (!user || user.role !== 'ADMIN')) {
      setIsLoading(false);
    }
  }, [user, authLoading, filters, loadProblems]);

  const handleFilterChange = (updates: Partial<AdminProblemsFilter>) => {
    setFilters((prev) => ({
      ...prev,
      ...updates,
    }));
  };

  const handleResetFilters = () => {
    setFilters({
      page: 1,
      limit: 15,
      priority: 'ALL',
      status: 'ALL',
      category: 'ALL',
      area: 'ALL',
      date: 'all',
      startDate: undefined,
      endDate: undefined,
      search: '',
      sort: 'date_desc',
    });
  };

  // Auth loading state
  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#faf8f4] dark:bg-[#0e1512]">
        <Loading size="lg" text="Authenticating municipal admin..." />
      </div>
    );
  }

  // Not logged in or not admin
  if (!user || user.role !== 'ADMIN') {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-[#faf8f4] dark:bg-[#0e1512] text-[#14201c] dark:text-[#ece9e1]">
        <Card className="max-w-md w-full p-8 text-center bg-white dark:bg-[#141d19] border border-[#e6e2dc] dark:border-[#24312b] space-y-6 shadow-xs">
          <div className="w-12 h-12 rounded-2xl bg-red-500/10 text-red-600 dark:text-red-400 flex items-center justify-center mx-auto">
            <Lock className="w-6 h-6" />
          </div>
          <div className="space-y-2">
            <h2 className="font-heading text-2xl font-bold">
              Admin Access Required
            </h2>
            <p className="text-xs text-[#57534e] dark:text-[#a8a29e] leading-relaxed">
              Problem Management is restricted to authorized municipal officers and emergency triage administrators.
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

  return (
    <div className="min-h-screen bg-[#faf8f4] dark:bg-[#0e1512] flex flex-row font-body text-[#1c1917] dark:text-[#ece9e1]">
      {/* Admin Sidebar */}
      <Sidebar
        collapsed={sidebarCollapsed}
        onToggleCollapse={() => setSidebarCollapsed(!sidebarCollapsed)}
      />

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col min-w-0 overflow-y-auto">
        {/* Top Sticky Header */}
        <header className="sticky top-0 z-20 bg-white/95 dark:bg-[#141d19]/95 backdrop-blur-md border-b border-[#e5e1d8] dark:border-[#24312b] px-7 sm:px-8 py-3.5 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div>
              <h1 className="font-heading text-[26px] font-medium text-[#14201c] dark:text-[#ece9e1] leading-tight">
                Problems
              </h1>
              <p className="text-[14px] text-[#5d6b65] dark:text-[#9aa8a1] mt-0.5">
                Municipal problem catalog, multi-criteria filtering, and dispatch queue
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 sm:gap-3">
            <Link href="/admin/dashboard">
              <Button
                variant="outline"
                size="sm"
                className="hidden sm:inline-flex items-center gap-1.5 text-xs py-1.5 px-3 h-auto"
              >
                <LayoutDashboard className="w-3.5 h-3.5" />
                Dashboard
              </Button>
            </Link>

            <Button
              variant="outline"
              size="sm"
              onClick={() => loadProblems(filters)}
              disabled={isLoading}
              className="inline-flex items-center gap-1.5 text-xs py-1.5 px-3 h-auto"
              aria-label="Refresh problems list"
            >
              <RefreshCw
                className={`w-3.5 h-3.5 text-[#78716c] ${
                  isLoading ? 'animate-spin' : ''
                }`}
              />
              <span className="hidden sm:inline">Refresh</span>
            </Button>
          </div>
        </header>

        {/* Page Body */}
        <div className="p-4 sm:p-6 lg:p-8 space-y-6 max-w-7xl mx-auto w-full">
          {/* Error Banner */}
          {error && (
            <ErrorMessage
              message={error}
              onRetry={() => loadProblems(filters)}
            />
          )}

          {/* Filters Bar */}
          <ProblemFiltersBar
            filters={filters}
            onChange={handleFilterChange}
            onReset={handleResetFilters}
            availableAreas={availableAreas}
            totalResults={total}
          />

          {/* Problem Management Table */}
          <AdminProblemsTable
            problems={problems}
            isLoading={isLoading}
            page={filters.page || 1}
            totalPages={totalPages}
            total={total}
            limit={filters.limit || 15}
            sort={filters.sort}
            onPageChange={(newPage) => handleFilterChange({ page: newPage })}
            onLimitChange={(newLimit) => handleFilterChange({ limit: newLimit, page: 1 })}
            onSortChange={(newSort) => handleFilterChange({ sort: newSort, page: 1 })}
          />
        </div>
      </main>
    </div>
  );
}
