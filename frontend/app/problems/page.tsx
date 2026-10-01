'use client';

import React, { useState, useEffect, useCallback, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { Navbar } from '../../components/Navbar';
import { Footer } from '../../components/Footer';
import { ProblemCard } from '../../components/problems/ProblemCard';
import { problemService } from '../../services/problem.service';
import { ProblemSummary, ProblemCategory, PriorityLevel, ProblemStatus } from '../../types/problem';
import { Search, Filter, RefreshCw, PlusCircle, AlertCircle, MapPin, X } from 'lucide-react';

function ExploreProblemsContent() {
  const searchParams = useSearchParams();
  const initialCategoryParam = searchParams.get('category') as ProblemCategory | null;

  const [problems, setProblems] = useState<ProblemSummary[]>([]);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [totalPages, setTotalPages] = useState<number>(1);
  const [totalRecords, setTotalRecords] = useState<number>(0);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Filters State
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<ProblemCategory | 'ALL'>(
    initialCategoryParam && ['ROAD', 'WATER', 'GARBAGE', 'ELECTRICITY', 'TRAFFIC', 'OTHER'].includes(initialCategoryParam)
      ? initialCategoryParam
      : 'ALL'
  );
  const [selectedPriority, setSelectedPriority] = useState<PriorityLevel | 'ALL'>('ALL');
  const [selectedSort, setSelectedSort] = useState<'latest' | 'most_supported' | 'most_reported' | 'highest_priority'>('latest');

  // Load problems from real backend API
  const loadProblems = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      const res = await problemService.fetchProblems({
        page: currentPage,
        limit: 9,
        category: selectedCategory,
        priority: selectedPriority,
        sort: selectedSort,
        search: searchQuery,
      });

      if (res && res.success) {
        setProblems(res.problems || []);
        setTotalPages(res.pagination?.totalPages || 1);
        setTotalRecords(res.pagination?.total || 0);
      } else {
        throw new Error('Failed to retrieve community problems from server.');
      }
    } catch (err: any) {
      console.error('Error fetching problems:', err);
      setError(err?.response?.data?.error?.message || 'Unable to load problems. Please try again.');
      setProblems([]);
    } finally {
      setIsLoading(false);
    }
  }, [currentPage, selectedCategory, selectedPriority, selectedSort, searchQuery]);

  useEffect(() => {
    loadProblems();
  }, [loadProblems]);

  // Support count updater callback to keep card synchronized
  const handleSupportChange = (problemId: string, newCount: number, isSupported: boolean) => {
    setProblems((prev) =>
      prev.map((prob) =>
        prob.id === problemId
          ? {
              ...prob,
              supportCount: newCount,
              isSupported,
              supported: isSupported,
            }
          : prob
      )
    );
  };

  const handleResetFilters = () => {
    setSearchQuery('');
    setSelectedCategory('ALL');
    setSelectedPriority('ALL');
    setSelectedSort('latest');
    setCurrentPage(1);
  };

  const hasActiveFilters =
    searchQuery.trim() !== '' ||
    selectedCategory !== 'ALL' ||
    selectedPriority !== 'ALL' ||
    selectedSort !== 'latest';

  return (
    <div className="min-h-screen flex flex-col bg-[#faf8f4] dark:bg-[#0e1512] text-[#14201c] dark:text-[#ece9e1] transition-colors">
      <Navbar />

      <main className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        {/* Top Header Section */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-8 border-b border-[#e5e1d8] dark:border-[#24312b]">
          <div className="space-y-2 max-w-2xl">
            <h1 className="font-heading text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight text-[#14201c] dark:text-[#ece9e1]">
              Explore Community Problems
            </h1>
            <p className="text-sm sm:text-base text-[#5d6b65] dark:text-[#9aa8a1] leading-relaxed">
              Discover problems reported by people around you and support the issues that matter. Backed issues receive elevated municipal priority.
            </p>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <Link
              href="/map"
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border border-[#d6d0c4] dark:border-[#2a3832] bg-white dark:bg-[#141d19] text-sm font-semibold hover:bg-[#ede8dc] dark:hover:bg-[#1b2621] transition-colors shadow-2xs"
            >
              <MapPin className="w-4 h-4 text-[#0f6b4f] dark:text-[#5cc9a0]" />
              <span>Map View</span>
            </Link>
            <Link
              href="/report"
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#0f6b4f] hover:bg-[#0b543d] dark:bg-[#5cc9a0] dark:hover:bg-[#4eb790] text-white dark:text-[#0e1512] text-sm font-semibold shadow-xs transition-colors"
            >
              <PlusCircle className="w-4 h-4" />
              <span>Report Problem</span>
            </Link>
          </div>
        </div>

        {/* Search & Filter Controls */}
        <div className="mt-8 p-5 rounded-2xl bg-white dark:bg-[#141d19] border border-[#e5e1d8] dark:border-[#24312b] shadow-2xs space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-3.5">
            {/* Search Input (5 cols on lg) */}
            <div className="lg:col-span-5 relative">
              <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[#9aa8a1] pointer-events-none" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setCurrentPage(1);
                }}
                placeholder="Search issues, road names, localities..."
                className="w-full pl-10 pr-9 py-2.5 rounded-xl text-sm bg-[#faf8f4] dark:bg-[#0e1512] border border-[#d6d0c4] dark:border-[#2a3832] text-[#14201c] dark:text-[#ece9e1] placeholder-[#9aa8a1] focus:outline-none focus:ring-2 focus:ring-[#0f6b4f]/30"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[#9aa8a1] hover:text-[#14201c] dark:hover:text-white"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>

            {/* Category Filter (3 cols on lg) */}
            <div className="lg:col-span-3">
              <select
                value={selectedCategory}
                onChange={(e) => {
                  setSelectedCategory(e.target.value as ProblemCategory | 'ALL');
                  setCurrentPage(1);
                }}
                className="w-full px-3.5 py-2.5 rounded-xl text-sm bg-[#faf8f4] dark:bg-[#0e1512] border border-[#d6d0c4] dark:border-[#2a3832] text-[#14201c] dark:text-[#ece9e1] focus:outline-none focus:ring-2 focus:ring-[#0f6b4f]/30 cursor-pointer"
              >
                <option value="ALL">All Categories</option>
                <option value="WATER">Water Supply & Leaks</option>
                <option value="ROAD">Roads & Potholes</option>
                <option value="ELECTRICITY">Electricity & Lighting</option>
                <option value="GARBAGE">Sanitation & Waste</option>
                <option value="TRAFFIC">Traffic & Signals</option>
                <option value="OTHER">Public Infrastructure</option>
              </select>
            </div>

            {/* Priority Filter (2 cols on lg) */}
            <div className="lg:col-span-2">
              <select
                value={selectedPriority}
                onChange={(e) => {
                  setSelectedPriority(e.target.value as PriorityLevel | 'ALL');
                  setCurrentPage(1);
                }}
                className="w-full px-3.5 py-2.5 rounded-xl text-sm bg-[#faf8f4] dark:bg-[#0e1512] border border-[#d6d0c4] dark:border-[#2a3832] text-[#14201c] dark:text-[#ece9e1] focus:outline-none focus:ring-2 focus:ring-[#0f6b4f]/30 cursor-pointer"
              >
                <option value="ALL">All Priorities</option>
                <option value="CRITICAL">Critical</option>
                <option value="MAJOR">Major</option>
                <option value="LOW">Low</option>
              </select>
            </div>

            {/* Sort Filter (2 cols on lg) */}
            <div className="lg:col-span-2">
              <select
                value={selectedSort}
                onChange={(e) => {
                  setSelectedSort(e.target.value as any);
                  setCurrentPage(1);
                }}
                className="w-full px-3.5 py-2.5 rounded-xl text-sm bg-[#faf8f4] dark:bg-[#0e1512] border border-[#d6d0c4] dark:border-[#2a3832] text-[#14201c] dark:text-[#ece9e1] focus:outline-none focus:ring-2 focus:ring-[#0f6b4f]/30 cursor-pointer"
              >
                <option value="latest">Latest</option>
                <option value="most_supported">Most Supported</option>
                <option value="most_reported">Most Reported</option>
                <option value="highest_priority">Highest Priority</option>
              </select>
            </div>
          </div>

          {/* Active Filter Bar & Results Count */}
          <div className="flex flex-wrap items-center justify-between gap-3 pt-2 text-xs text-[#5d6b65] dark:text-[#9aa8a1]">
            <div className="flex items-center gap-2">
              <span>Showing <strong className="text-[#14201c] dark:text-[#ece9e1] font-semibold">{totalRecords}</strong> reported issues</span>
              {hasActiveFilters && (
                <button
                  type="button"
                  onClick={handleResetFilters}
                  className="text-[#0f6b4f] dark:text-[#5cc9a0] font-semibold hover:underline flex items-center gap-1 cursor-pointer"
                >
                  <RefreshCw className="w-3 h-3" />
                  <span>Reset filters</span>
                </button>
              )}
            </div>

            <button
              type="button"
              onClick={() => loadProblems()}
              disabled={isLoading}
              className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium hover:bg-[#ede8dc] dark:hover:bg-[#1f2b25] transition-colors cursor-pointer"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
              <span>Refresh list</span>
            </button>
          </div>
        </div>

        {/* Content Area */}
        <div className="mt-8">
          {/* 1. Loading Skeletons */}
          {isLoading && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
              {[...Array(6)].map((_, i) => (
                <div
                  key={i}
                  className="p-6 rounded-2xl bg-white dark:bg-[#141d19] border border-[#e5e1d8] dark:border-[#24312b] animate-pulse space-y-4"
                >
                  <div className="flex items-center justify-between">
                    <div className="h-5 w-24 bg-[#ede8dc] dark:bg-[#24312b] rounded-full" />
                    <div className="h-5 w-16 bg-[#ede8dc] dark:bg-[#24312b] rounded-full" />
                  </div>
                  <div className="h-6 w-3/4 bg-[#ede8dc] dark:bg-[#24312b] rounded-md" />
                  <div className="h-4 w-1/2 bg-[#ede8dc] dark:bg-[#24312b] rounded-md" />
                  <div className="space-y-2">
                    <div className="h-3 w-full bg-[#ede8dc] dark:bg-[#24312b] rounded-md" />
                    <div className="h-3 w-4/5 bg-[#ede8dc] dark:bg-[#24312b] rounded-md" />
                  </div>
                  <div className="pt-4 border-t border-[#e5e1d8] dark:border-[#24312b] flex items-center justify-between">
                    <div className="h-8 w-28 bg-[#ede8dc] dark:bg-[#24312b] rounded-xl" />
                    <div className="h-4 w-20 bg-[#ede8dc] dark:bg-[#24312b] rounded-md" />
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* 2. Error State */}
          {!isLoading && error && (
            <div className="p-8 sm:p-12 text-center rounded-2xl bg-white dark:bg-[#141d19] border border-rose-200 dark:border-rose-900/50 space-y-4 max-w-lg mx-auto">
              <div className="w-12 h-12 rounded-full bg-rose-50 dark:bg-rose-950/50 text-rose-600 dark:text-rose-400 flex items-center justify-center mx-auto">
                <AlertCircle className="w-6 h-6" />
              </div>
              <h3 className="font-heading text-lg font-bold text-[#14201c] dark:text-[#ece9e1]">
                Unable to load problems
              </h3>
              <p className="text-sm text-[#5d6b65] dark:text-[#9aa8a1]">
                {error}
              </p>
              <button
                type="button"
                onClick={() => loadProblems()}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#0f6b4f] dark:bg-[#5cc9a0] text-white dark:text-[#0e1512] font-semibold text-sm cursor-pointer shadow-xs"
              >
                <RefreshCw className="w-4 h-4" />
                <span>Try Again</span>
              </button>
            </div>
          )}

          {/* 3. Empty State */}
          {!isLoading && !error && problems.length === 0 && (
            <div className="p-10 sm:p-16 text-center rounded-2xl bg-white dark:bg-[#141d19] border border-[#e5e1d8] dark:border-[#24312b] space-y-4 max-w-lg mx-auto">
              <div className="w-12 h-12 rounded-full bg-[#f0ede6] dark:bg-[#1f2b25] text-[#5d6b65] dark:text-[#9aa8a1] flex items-center justify-center mx-auto">
                <Filter className="w-6 h-6" />
              </div>
              <h3 className="font-heading text-xl font-bold text-[#14201c] dark:text-[#ece9e1]">
                No problems found
              </h3>
              <p className="text-sm text-[#5d6b65] dark:text-[#9aa8a1] leading-relaxed">
                {hasActiveFilters
                  ? 'No community problems match your search criteria. Try adjusting or clearing your filters.'
                  : 'No problems reported in your area yet. Be the first to report an issue to your municipal council!'}
              </p>
              <div className="pt-2 flex items-center justify-center gap-3">
                {hasActiveFilters && (
                  <button
                    type="button"
                    onClick={handleResetFilters}
                    className="px-4 py-2 rounded-xl border border-[#d6d0c4] dark:border-[#2a3832] text-sm font-semibold hover:bg-[#ede8dc] dark:hover:bg-[#1b2621] transition-colors"
                  >
                    Clear Filters
                  </button>
                )}
                <Link
                  href="/report"
                  className="px-4 py-2 rounded-xl bg-[#0f6b4f] text-white dark:bg-[#5cc9a0] dark:text-[#0e1512] text-sm font-semibold shadow-xs"
                >
                  Report a Problem
                </Link>
              </div>
            </div>
          )}

          {/* 4. Problems Grid */}
          {!isLoading && !error && problems.length > 0 && (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
                {problems.map((problem) => (
                  <ProblemCard
                    key={problem.id}
                    problem={problem}
                    onSupportChange={handleSupportChange}
                  />
                ))}
              </div>

              {/* Pagination Controls */}
              {totalPages > 1 && (
                <div className="mt-12 flex items-center justify-center gap-2">
                  <button
                    type="button"
                    onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                    disabled={currentPage === 1}
                    className="px-4 py-2 rounded-xl border border-[#d6d0c4] dark:border-[#2a3832] bg-white dark:bg-[#141d19] text-xs font-semibold disabled:opacity-50 disabled:cursor-not-allowed hover:bg-[#ede8dc] dark:hover:bg-[#1b2621] transition-colors cursor-pointer"
                  >
                    Previous
                  </button>

                  <div className="flex items-center gap-1">
                    {[...Array(totalPages)].map((_, i) => {
                      const pageNum = i + 1;
                      return (
                        <button
                          key={pageNum}
                          type="button"
                          onClick={() => setCurrentPage(pageNum)}
                          className={`w-9 h-9 rounded-xl text-xs font-bold transition-colors cursor-pointer ${
                            currentPage === pageNum
                              ? 'bg-[#0f6b4f] text-white dark:bg-[#5cc9a0] dark:text-[#0e1512]'
                              : 'bg-white dark:bg-[#141d19] border border-[#d6d0c4] dark:border-[#2a3832] hover:bg-[#ede8dc] dark:hover:bg-[#1b2621]'
                          }`}
                        >
                          {pageNum}
                        </button>
                      );
                    })}
                  </div>

                  <button
                    type="button"
                    onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                    disabled={currentPage === totalPages}
                    className="px-4 py-2 rounded-xl border border-[#d6d0c4] dark:border-[#2a3832] bg-white dark:bg-[#141d19] text-xs font-semibold disabled:opacity-50 disabled:cursor-not-allowed hover:bg-[#ede8dc] dark:hover:bg-[#1b2621] transition-colors cursor-pointer"
                  >
                    Next
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}

export default function ExploreProblemsPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-[#faf8f4] dark:bg-[#0e1512]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#0f6b4f]" />
      </div>
    }>
      <ExploreProblemsContent />
    </Suspense>
  );
}
