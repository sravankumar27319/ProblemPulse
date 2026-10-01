'use client';

import React from 'react';
import { Search, RotateCcw, Calendar, MapPin, Tag, AlertCircle, Clock } from 'lucide-react';
import { AdminProblemsFilter } from '../../types/admin';
import { Button } from '../ui/Button';

export interface ProblemFiltersBarProps {
  filters: AdminProblemsFilter;
  onChange: (newFilters: Partial<AdminProblemsFilter>) => void;
  onReset: () => void;
  availableAreas: string[];
  totalResults: number;
}

export const ProblemFiltersBar: React.FC<ProblemFiltersBarProps> = ({
  filters,
  onChange,
  onReset,
  availableAreas,
  totalResults,
}) => {
  const isCustomDate = filters.date === 'custom';

  const hasActiveFilters = Boolean(
    (filters.search && filters.search.trim().length > 0) ||
      (filters.priority && filters.priority !== 'ALL') ||
      (filters.status && filters.status !== 'ALL') ||
      (filters.category && filters.category !== 'ALL') ||
      (filters.area && filters.area !== 'ALL') ||
      (filters.date && filters.date !== 'all')
  );

  return (
    <div className="bg-white dark:bg-[#141d19] border border-[#e6e2dc] dark:border-[#24312b] rounded-xl p-4 sm:p-5 shadow-xs space-y-4">
      {/* Top Row: Search & Reset */}
      <div className="flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between">
        {/* Search */}
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-[#78716c] dark:text-[#9aa8a1] absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search problems by title, keyword, address, or area..."
            value={filters.search || ''}
            onChange={(e) => onChange({ search: e.target.value, page: 1 })}
            className="w-full pl-10 pr-4 py-2 text-xs sm:text-sm rounded-lg border border-[#e6e2dc] dark:border-[#24312b] bg-[#faf8f4] dark:bg-[#0e1512] text-[#1c1917] dark:text-[#ece9e1] placeholder-[#78716c] focus:outline-none focus:ring-1 focus:ring-[#0f6b4f]"
          />
        </div>

        {/* Results Counter & Reset */}
        <div className="flex items-center gap-3 justify-between md:justify-end">
          <div className="text-xs text-[#78716c] dark:text-[#9aa8a1] whitespace-nowrap">
            Found <span className="font-semibold text-[#1c1917] dark:text-[#ece9e1]">{totalResults}</span> problems
          </div>

          {hasActiveFilters && (
            <Button
              variant="outline"
              size="sm"
              onClick={onReset}
              className="text-xs py-1.5 px-3 h-auto border-[#e6e2dc] dark:border-[#24312b] text-[#dc2626] hover:bg-[#fef2f2] dark:hover:bg-[#2c1414] hover:text-[#b91c1c] gap-1.5"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              Reset Filters
            </Button>
          )}
        </div>
      </div>

      {/* Filter Selectors Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 pt-1">
        {/* Priority Filter */}
        <div className="flex flex-col gap-1">
          <label className="text-[11px] font-semibold text-[#78716c] dark:text-[#9aa8a1] uppercase tracking-wider flex items-center gap-1">
            <AlertCircle className="w-3 h-3 text-[#dc2626]" />
            Priority
          </label>
          <select
            value={filters.priority || 'ALL'}
            onChange={(e) => onChange({ priority: e.target.value, page: 1 })}
            className="w-full py-2 px-2.5 rounded-lg border border-[#e6e2dc] dark:border-[#24312b] bg-[#faf8f4] dark:bg-[#0e1512] text-[#1c1917] dark:text-[#ece9e1] text-xs focus:outline-none focus:ring-1 focus:ring-[#0f6b4f] cursor-pointer"
          >
            <option value="ALL">All Priorities</option>
            <option value="CRITICAL">Critical</option>
            <option value="MAJOR">Major</option>
            <option value="LOW">Low</option>
          </select>
        </div>

        {/* Status Filter */}
        <div className="flex flex-col gap-1">
          <label className="text-[11px] font-semibold text-[#78716c] dark:text-[#9aa8a1] uppercase tracking-wider flex items-center gap-1">
            <Clock className="w-3 h-3 text-[#0f6b4f]" />
            Status
          </label>
          <select
            value={filters.status || 'ALL'}
            onChange={(e) => onChange({ status: e.target.value, page: 1 })}
            className="w-full py-2 px-2.5 rounded-lg border border-[#e6e2dc] dark:border-[#24312b] bg-[#faf8f4] dark:bg-[#0e1512] text-[#1c1917] dark:text-[#ece9e1] text-xs focus:outline-none focus:ring-1 focus:ring-[#0f6b4f] cursor-pointer"
          >
            <option value="ALL">All Statuses</option>
            <option value="SUBMITTED">Submitted</option>
            <option value="UNDER_REVIEW">Under Review</option>
            <option value="VERIFIED">Verified</option>
            <option value="ASSIGNED">Assigned</option>
            <option value="IN_PROGRESS">In Progress</option>
            <option value="RESOLVED">Resolved</option>
            <option value="COMMUNITY_VERIFIED">Community Verified</option>
            <option value="CLOSED">Closed</option>
            <option value="REJECTED">Rejected</option>
            <option value="REOPENED">Reopened</option>
          </select>
        </div>

        {/* Category Filter */}
        <div className="flex flex-col gap-1">
          <label className="text-[11px] font-semibold text-[#78716c] dark:text-[#9aa8a1] uppercase tracking-wider flex items-center gap-1">
            <Tag className="w-3 h-3 text-amber-600" />
            Category
          </label>
          <select
            value={filters.category || 'ALL'}
            onChange={(e) => onChange({ category: e.target.value, page: 1 })}
            className="w-full py-2 px-2.5 rounded-lg border border-[#e6e2dc] dark:border-[#24312b] bg-[#faf8f4] dark:bg-[#0e1512] text-[#1c1917] dark:text-[#ece9e1] text-xs focus:outline-none focus:ring-1 focus:ring-[#0f6b4f] cursor-pointer"
          >
            <option value="ALL">All Categories</option>
            <option value="ROAD">Roads & Sidewalks</option>
            <option value="WATER">Water & Drainage</option>
            <option value="GARBAGE">Garbage & Waste</option>
            <option value="ELECTRICITY">Streetlights & Electrical</option>
            <option value="TRAFFIC">Traffic & Mobility</option>
            <option value="OTHER">Other / Sanitation</option>
          </select>
        </div>

        {/* Area Filter */}
        <div className="flex flex-col gap-1">
          <label className="text-[11px] font-semibold text-[#78716c] dark:text-[#9aa8a1] uppercase tracking-wider flex items-center gap-1">
            <MapPin className="w-3 h-3 text-sky-600" />
            Area
          </label>
          <select
            value={filters.area || 'ALL'}
            onChange={(e) => onChange({ area: e.target.value, page: 1 })}
            className="w-full py-2 px-2.5 rounded-lg border border-[#e6e2dc] dark:border-[#24312b] bg-[#faf8f4] dark:bg-[#0e1512] text-[#1c1917] dark:text-[#ece9e1] text-xs focus:outline-none focus:ring-1 focus:ring-[#0f6b4f] cursor-pointer"
          >
            <option value="ALL">All Areas</option>
            {availableAreas.map((areaName) => (
              <option key={areaName} value={areaName}>
                {areaName}
              </option>
            ))}
          </select>
        </div>

        {/* Date Filter */}
        <div className="flex flex-col gap-1 col-span-2 sm:col-span-1">
          <label className="text-[11px] font-semibold text-[#78716c] dark:text-[#9aa8a1] uppercase tracking-wider flex items-center gap-1">
            <Calendar className="w-3 h-3 text-purple-600" />
            Date Range
          </label>
          <select
            value={filters.date || 'all'}
            onChange={(e) => onChange({ date: e.target.value, page: 1 })}
            className="w-full py-2 px-2.5 rounded-lg border border-[#e6e2dc] dark:border-[#24312b] bg-[#faf8f4] dark:bg-[#0e1512] text-[#1c1917] dark:text-[#ece9e1] text-xs focus:outline-none focus:ring-1 focus:ring-[#0f6b4f] cursor-pointer"
          >
            <option value="all">All Time</option>
            <option value="today">Today</option>
            <option value="7days">Past 7 Days</option>
            <option value="30days">Past 30 Days</option>
            <option value="custom">Custom Range...</option>
          </select>
        </div>
      </div>

      {/* Custom Date Range Row (Shown when "Custom Range" is chosen) */}
      {isCustomDate && (
        <div className="pt-2 border-t border-[#e6e2dc] dark:border-[#24312b] flex flex-col sm:flex-row items-start sm:items-center gap-3">
          <div className="flex items-center gap-2">
            <span className="text-xs text-[#78716c] dark:text-[#9aa8a1]">From:</span>
            <input
              type="date"
              value={filters.startDate || ''}
              onChange={(e) => onChange({ startDate: e.target.value, page: 1 })}
              className="py-1 px-2.5 rounded-lg border border-[#e6e2dc] dark:border-[#24312b] bg-[#faf8f4] dark:bg-[#0e1512] text-[#1c1917] dark:text-[#ece9e1] text-xs focus:outline-none focus:ring-1 focus:ring-[#0f6b4f]"
            />
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs text-[#78716c] dark:text-[#9aa8a1]">To:</span>
            <input
              type="date"
              value={filters.endDate || ''}
              onChange={(e) => onChange({ endDate: e.target.value, page: 1 })}
              className="py-1 px-2.5 rounded-lg border border-[#e6e2dc] dark:border-[#24312b] bg-[#faf8f4] dark:bg-[#0e1512] text-[#1c1917] dark:text-[#ece9e1] text-xs focus:outline-none focus:ring-1 focus:ring-[#0f6b4f]"
            />
          </div>
        </div>
      )}
    </div>
  );
};
