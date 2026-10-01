'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Header } from '../../components/landing/Header';
import { Footer } from '../../components/landing/Footer';
import { ProblemCard } from '../../components/problems/ProblemCard';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Loading } from '../../components/ui/Loading';
import { ErrorMessage } from '../../components/ui/ErrorMessage';
import { useAuth } from '../../hooks/useAuth';
import { problemService } from '../../services/problem.service';
import { UserActivityResponse, ProblemSummary } from '../../types/problem';
import {
  FileText,
  ThumbsUp,
  CheckCircle2,
  PlusCircle,
  Compass,
  Lock,
  ArrowRight,
} from 'lucide-react';

type ActivityTab = 'reports' | 'supported' | 'resolved';

export default function MyActivityPage() {
  const { user, isLoading: authLoading } = useAuth();
  const [activeTab, setActiveTab] = useState<ActivityTab>('reports');
  const [activityData, setActivityData] = useState<UserActivityResponse | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!user && !authLoading) {
      setIsLoading(false);
      return;
    }

    if (user) {
      const loadActivity = async () => {
        try {
          setIsLoading(true);
          setError(null);
          const data = await problemService.fetchUserActivity();
          if (data.success) {
            setActivityData(data);
          }
        } catch (err: unknown) {
          const axiosError = err as { response?: { data?: { message?: string } } };
          setError(axiosError?.response?.data?.message || 'Failed to load your activity records.');
        } finally {
          setIsLoading(false);
        }
      };

      loadActivity();
    }
  }, [user, authLoading]);

  if (authLoading || (isLoading && user)) {
    return (
      <div className="min-h-screen flex flex-col bg-[#faf8f4] dark:bg-[#0e1512]">
        <Header />
        <main className="flex-1 flex items-center justify-center p-6">
          <Loading size="lg" text="Loading citizen activity hub..." />
        </main>
        <Footer />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen flex flex-col bg-[#faf8f4] dark:bg-[#0e1512]">
        <Header />
        <main className="flex-1 max-w-lg mx-auto px-4 py-16 flex flex-col items-center justify-center text-center">
          <Card className="p-8 bg-white dark:bg-[#141d19] border border-[#e5e1d8] dark:border-[#24312b] space-y-6 w-full shadow-xs">
            <div className="w-12 h-12 rounded-2xl bg-[#e3f0ea] dark:bg-[#173026] text-[#0f6b4f] dark:text-[#5cc9a0] flex items-center justify-center mx-auto">
              <Lock className="w-6 h-6" />
            </div>
            <div className="space-y-2">
              <h2 className="font-heading text-2xl font-semibold text-[#14201c] dark:text-[#ece9e1]">
                Citizen Sign-In Required
              </h2>
              <p className="text-sm text-[#5d6b65] dark:text-[#9aa8a1] leading-relaxed">
                Sign in with your verified citizen account to track reports you filed, problems you backed, and municipal resolution updates.
              </p>
            </div>
            <div className="flex flex-col gap-3">
              <Link href="/login?redirect=/my-activity">
                <Button fullWidth size="lg">
                  Sign In to Continue
                </Button>
              </Link>
              <Link href="/register">
                <Button variant="outline" fullWidth size="md">
                  Create New Account
                </Button>
              </Link>
            </div>
          </Card>
        </main>
        <Footer />
      </div>
    );
  }

  const summary = activityData?.summary || {
    reportedCount: 0,
    supportedCount: 0,
    resolvedCount: 0,
  };

  const getActiveList = (): ProblemSummary[] => {
    if (!activityData) return [];
    if (activeTab === 'reports') return activityData.reportedProblems || [];
    if (activeTab === 'supported') return activityData.supportedProblems || [];
    if (activeTab === 'resolved') return activityData.resolvedProblems || [];
    return [];
  };

  const activeProblems = getActiveList();

  return (
    <div className="min-h-screen flex flex-col bg-[#faf8f4] dark:bg-[#0e1512] text-[#14201c] dark:text-[#ece9e1]">
      <Header />

      <main className="flex-1 max-w-6xl mx-auto px-4 sm:px-6 py-8 sm:py-12 w-full space-y-8">
        {/* Page Top Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 border-b border-[#e5e1d8] dark:border-[#24312b] pb-6">
          <div className="space-y-1">
            <span className="text-xs font-semibold uppercase tracking-wider text-[#0f6b4f] dark:text-[#5cc9a0]">
              CITIZEN DASHBOARD
            </span>
            <h1 className="font-heading text-3xl font-semibold tracking-tight">
              My Civic Activity
            </h1>
            <p className="text-sm text-[#5d6b65] dark:text-[#9aa8a1]">
              Tracking reports, backing neighborhood priorities, and monitoring verified municipal resolutions.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Link href="/report">
              <Button leftIcon={<PlusCircle className="w-4 h-4" />}>
                Report Problem
              </Button>
            </Link>
          </div>
        </div>

        {/* Impact KPI Summary Row */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {/* KPI 1: Reports Logged */}
          <Card className="p-5 bg-white dark:bg-[#141d19] border border-[#e5e1d8] dark:border-[#24312b] flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0">
              <FileText className="w-6 h-6" />
            </div>
            <div>
              <div className="text-2xl font-bold font-heading">{summary.reportedCount}</div>
              <div className="text-xs text-[#5d6b65] dark:text-[#9aa8a1]">My Reports Filed</div>
            </div>
          </Card>

          {/* KPI 2: Problems Backed */}
          <Card className="p-5 bg-white dark:bg-[#141d19] border border-[#e5e1d8] dark:border-[#24312b] flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0">
              <ThumbsUp className="w-6 h-6" />
            </div>
            <div>
              <div className="text-2xl font-bold font-heading">{summary.supportedCount}</div>
              <div className="text-xs text-[#5d6b65] dark:text-[#9aa8a1]">Problems Backed</div>
            </div>
          </Card>

          {/* KPI 3: Resolved Solutions */}
          <Card className="p-5 bg-white dark:bg-[#141d19] border border-[#e5e1d8] dark:border-[#24312b] flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-[#0f6b4f]/10 text-[#0f6b4f] dark:text-[#5cc9a0] flex items-center justify-center shrink-0">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <div>
              <div className="text-2xl font-bold font-heading">{summary.resolvedCount}</div>
              <div className="text-xs text-[#5d6b65] dark:text-[#9aa8a1]">Resolved Solutions</div>
            </div>
          </Card>
        </div>

        {/* Error Alert */}
        {error && (
          <ErrorMessage
            title="Activity Feed Error"
            message={error}
          />
        )}

        {/* Tabs Bar */}
        <div className="flex border-b border-[#e5e1d8] dark:border-[#24312b] gap-2 overflow-x-auto pb-px">
          <button
            type="button"
            onClick={() => setActiveTab('reports')}
            className={`flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-colors whitespace-nowrap cursor-pointer ${
              activeTab === 'reports'
                ? 'border-[#0f6b4f] dark:border-[#5cc9a0] text-[#0f6b4f] dark:text-[#5cc9a0] font-semibold'
                : 'border-transparent text-[#5d6b65] dark:text-[#9aa8a1] hover:text-[#14201c] dark:hover:text-[#ece9e1]'
            }`}
          >
            <FileText className="w-4 h-4" />
            <span>My Reports</span>
            <span className="px-2 py-0.5 rounded-full text-xs bg-[#e5e1d8]/50 dark:bg-[#24312b] font-bold">
              {summary.reportedCount}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('supported')}
            className={`flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-colors whitespace-nowrap cursor-pointer ${
              activeTab === 'supported'
                ? 'border-[#0f6b4f] dark:border-[#5cc9a0] text-[#0f6b4f] dark:text-[#5cc9a0] font-semibold'
                : 'border-transparent text-[#5d6b65] dark:text-[#9aa8a1] hover:text-[#14201c] dark:hover:text-[#ece9e1]'
            }`}
          >
            <ThumbsUp className="w-4 h-4" />
            <span>Supported Problems</span>
            <span className="px-2 py-0.5 rounded-full text-xs bg-[#e5e1d8]/50 dark:bg-[#24312b] font-bold">
              {summary.supportedCount}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('resolved')}
            className={`flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-colors whitespace-nowrap cursor-pointer ${
              activeTab === 'resolved'
                ? 'border-[#0f6b4f] dark:border-[#5cc9a0] text-[#0f6b4f] dark:text-[#5cc9a0] font-semibold'
                : 'border-transparent text-[#5d6b65] dark:text-[#9aa8a1] hover:text-[#14201c] dark:hover:text-[#ece9e1]'
            }`}
          >
            <CheckCircle2 className="w-4 h-4" />
            <span>Resolved Problems</span>
            <span className="px-2 py-0.5 rounded-full text-xs bg-[#e5e1d8]/50 dark:bg-[#24312b] font-bold">
              {summary.resolvedCount}
            </span>
          </button>
        </div>

        {/* Problems Content Grid */}
        {activeProblems.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {activeProblems.map((problem) => (
              <ProblemCard
                key={problem.id}
                problem={problem}
                isSupported={activeTab === 'supported'}
              />
            ))}
          </div>
        ) : (
          /* Empty State for Current Tab */
          <Card className="p-12 text-center bg-white dark:bg-[#141d19] border border-[#e5e1d8] dark:border-[#24312b] space-y-4 max-w-md mx-auto my-8">
            <div className="w-12 h-12 rounded-2xl bg-[#faf8f4] dark:bg-[#0e1512] border border-[#e5e1d8] dark:border-[#24312b] flex items-center justify-center mx-auto text-[#5d6b65] dark:text-[#9aa8a1]">
              {activeTab === 'reports' && <FileText className="w-6 h-6" />}
              {activeTab === 'supported' && <ThumbsUp className="w-6 h-6" />}
              {activeTab === 'resolved' && <CheckCircle2 className="w-6 h-6" />}
            </div>

            <div className="space-y-1">
              <h3 className="font-heading text-lg font-medium text-[#14201c] dark:text-[#ece9e1]">
                {activeTab === 'reports' && 'No reports logged yet'}
                {activeTab === 'supported' && 'No supported problems yet'}
                {activeTab === 'resolved' && 'No resolved problems yet'}
              </h3>
              <p className="text-xs text-[#5d6b65] dark:text-[#9aa8a1] leading-relaxed">
                {activeTab === 'reports' &&
                  'Notice an issue in your street? Submit evidence to notify public works.'}
                {activeTab === 'supported' &&
                  'Explore neighborhood issues and back community reports to prioritize dispatch.'}
                {activeTab === 'resolved' &&
                  'Problems you report or back will appear here once verified resolved by the municipality.'}
              </p>
            </div>

            <div className="pt-2">
              {activeTab === 'reports' ? (
                <Link href="/report">
                  <Button size="sm" leftIcon={<PlusCircle className="w-4 h-4" />}>
                    Submit a Report
                  </Button>
                </Link>
              ) : (
                <Link href="/discover">
                  <Button size="sm" variant="outline" rightIcon={<ArrowRight className="w-4 h-4" />}>
                    Explore Discover Feed
                  </Button>
                </Link>
              )}
            </div>
          </Card>
        )}
      </main>

      <Footer />
    </div>
  );
}
