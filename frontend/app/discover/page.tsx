'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Header } from '../../components/landing/Header';
import { Footer } from '../../components/landing/Footer';
import { ProblemCard } from '../../components/problems/ProblemCard';
import { Input } from '../../components/ui/Input';
import { Dropdown } from '../../components/ui/Dropdown';
import { Pagination } from '../../components/ui/Pagination';
import { Loading, Skeleton } from '../../components/ui/Loading';
import { ErrorMessage } from '../../components/ui/ErrorMessage';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { problemService } from '../../services/problem.service';
import { ProblemSummary, ProblemCategory, PriorityLevel } from '../../types/problem';
import { FEATURED_PROBLEMS } from '../../constants/landing';
import { Search, Filter, RefreshCw } from 'lucide-react';

export default function DiscoverPage() {
  const [problems, setProblems] = useState<ProblemSummary[]>([]);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [totalPages, setTotalPages] = useState<number>(1);
  const [totalRecords, setTotalRecords] = useState<number>(0);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Filters State
  const [selectedCategory, setSelectedCategory] = useState<ProblemCategory | 'ALL'>('ALL');
  const [selectedPriority, setSelectedPriority] = useState<PriorityLevel | 'ALL'>('ALL');
  const [selectedSort, setSelectedSort] = useState<'latest' | 'most_supported' | 'most_reported' | 'highest_priority'>('latest');
  const [searchQuery, setSearchQuery] = useState<string>('');

  const categoryOptions = [
    { value: 'ALL', label: 'All Categories' },
    { value: 'ROAD', label: 'Road & Potholes' },
    { value: 'WATER', label: 'Water & Sanitation' },
    { value: 'GARBAGE', label: 'Garbage & Waste' },
    { value: 'ELECTRICITY', label: 'Electricity & Lighting' },
    { value: 'TRAFFIC', label: 'Traffic & Signals' },
    { value: 'OTHER', label: 'Other Issues' },
  ];

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

      if (res.success) {
        setProblems(res.problems);
        setTotalPages(res.pagination.totalPages);
        setTotalRecords(res.pagination.total);
      } else {
        throw new Error('Failed to retrieve community problems from server.');
      }
    } catch (err: any) {
      console.error('Error loading problems:', err);
      setError(err?.response?.data?.error?.message || 'Unable to load problems. Please check that the server is running and try again.');
      setProblems([]);
    } finally {
      setIsLoading(false);
    }
  }, [currentPage, selectedCategory, selectedPriority, selectedSort, searchQuery]);

  useEffect(() => {
    loadProblems();
  }, [loadProblems]);

  const handleCategoryClick = (cat: ProblemCategory | 'ALL') => {
    setSelectedCategory(cat);
    setCurrentPage(1);
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#faf8f4] dark:bg-[#0e1512] text-[#14201c] dark:text-[#ece9e1]">
      {/* Header */}
      <Header />

      {/* Main Container */}
      <main className="flex-1 max-w-6xl mx-auto px-4 sm:px-6 py-8 sm:py-12 w-full space-y-8">
        {/* Page Title & Overview */}
        <div className="space-y-2 border-b border-[#e5e1d8] dark:border-[#24312b] pb-6">
          <span className="text-xs font-semibold uppercase tracking-wider text-[#0f6b4f] dark:text-[#5cc9a0]">
            COMMUNITY DISCOVER FEED
          </span>
          <h1 className="font-heading text-3xl sm:text-4xl font-medium text-[#14201c] dark:text-[#ece9e1] tracking-tight">
            Explore Reported Problems
          </h1>
          <p className="text-sm text-[#5d6b65] dark:text-[#9aa8a1] max-w-2xl">
            Browse and search active municipal issues reported by citizens. Filter by category, priority level, or sort by engagement metrics.
          </p>
        </div>

        {/* Filters & Controls */}
        <div className="space-y-4">
          {/* Top Row: Search & Dropdowns */}
          <div className="grid grid-cols-1 sm:grid-cols-12 gap-4 items-end">
            <div className="sm:col-span-6">
              <Input
                label="Search Keyword"
                placeholder="Search by title, location, description..."
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setCurrentPage(1);
                }}
                leftIcon={<Search className="w-4 h-4" />}
              />
            </div>

            <div className="sm:col-span-3">
              <Dropdown
                label="Priority Level"
                value={selectedPriority}
                onChange={(e) => {
                  setSelectedPriority(e.target.value as PriorityLevel | 'ALL');
                  setCurrentPage(1);
                }}
                options={[
                  { value: 'ALL', label: 'All Priorities' },
                  { value: 'CRITICAL', label: 'Critical' },
                  { value: 'MAJOR', label: 'Major' },
                  { value: 'LOW', label: 'Low' },
                ]}
              />
            </div>

            <div className="sm:col-span-3">
              <Dropdown
                label="Sort Order"
                value={selectedSort}
                onChange={(e) => {
                  setSelectedSort(e.target.value as any);
                  setCurrentPage(1);
                }}
                options={[
                  { value: 'latest', label: 'Latest First' },
                  { value: 'most_supported', label: 'Most Supported' },
                  { value: 'most_reported', label: 'Most Reported' },
                  { value: 'highest_priority', label: 'Highest Priority' },
                ]}
              />
            </div>
          </div>

          {/* Category Pills Bar */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar">
            {categoryOptions.map((cat) => (
              <button
                key={cat.value}
                onClick={() => handleCategoryClick(cat.value as any)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all border ${
                  selectedCategory === cat.value
                    ? 'bg-[#0f6b4f] dark:bg-[#5cc9a0] text-white dark:text-[#0e1512] border-[#0f6b4f] dark:border-[#5cc9a0]'
                    : 'bg-[#ffffff] dark:bg-[#141d19] text-[#5d6b65] dark:text-[#9aa8a1] border-[#e5e1d8] dark:border-[#24312b] hover:border-[#0f6b4f]'
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>
        </div>

        {/* Status / Count Summary */}
        <div className="flex items-center justify-between text-xs text-[#5d6b65] dark:text-[#9aa8a1] pt-2">
          <div>
            Showing <span className="font-bold text-[#14201c] dark:text-[#ece9e1]">{problems.length}</span> of{' '}
            <span className="font-bold text-[#14201c] dark:text-[#ece9e1]">{totalRecords}</span> problems
          </div>
          <button
            onClick={() => loadProblems()}
            className="flex items-center gap-1 text-[#0f6b4f] dark:text-[#5cc9a0] font-semibold hover:underline"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Refresh Feed</span>
          </button>
        </div>

        {/* Error Alert */}
        {error && (
          <ErrorMessage
            title="Failed to Load Feed"
            message={error}
            onRetry={loadProblems}
          />
        )}

        {/* Feed Grid */}
        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 6 }).map((_, i) => (
              <Card key={i} className="p-5 space-y-4">
                <div className="flex justify-between">
                  <Skeleton className="h-5 w-20" />
                  <Skeleton className="h-5 w-24" />
                </div>
                <Skeleton className="h-6 w-3/4" />
                <Skeleton className="h-4 w-1/2" />
                <Skeleton className="h-16 w-full" />
              </Card>
            ))}
          </div>
        ) : problems.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {problems.map((problem) => (
              <ProblemCard key={problem.id} problem={problem} />
            ))}
          </div>
        ) : (
          <Card className="p-12 text-center bg-white dark:bg-[#141d19] border border-[#e5e1d8] dark:border-[#24312b] space-y-3">
            <Filter className="w-8 h-8 text-[#5d6b65] dark:text-[#9aa8a1] mx-auto" />
            <h3 className="font-heading text-lg font-medium text-[#14201c] dark:text-[#ece9e1]">
              No Problems Found
            </h3>
            <p className="text-xs text-[#5d6b65] dark:text-[#9aa8a1] max-w-sm mx-auto">
              No problem reports match your selected filters. Try clearing your search term or selecting another category.
            </p>
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setSelectedCategory('ALL');
                setSelectedPriority('ALL');
                setSearchQuery('');
                setCurrentPage(1);
              }}
            >
              Reset All Filters
            </Button>
          </Card>
        )}

        {/* Pagination Controls */}
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={(page) => setCurrentPage(page)}
        />
      </main>

      {/* Footer */}
      <Footer />
    </div>
  );
}
