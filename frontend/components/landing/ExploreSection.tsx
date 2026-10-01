'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { MapPin, ArrowRight, Filter, Flame } from 'lucide-react';
import { Card } from '../ui/Card';
import { PriorityBadge } from '../ui/PriorityBadge';
import { StatusPill } from '../ui/StatusPill';
import { Button } from '../ui/Button';
import { CommunityEngagementStats } from '../ui/CommunityEngagementStats';
import { FEATURED_PROBLEMS } from '../../constants/landing';
import { formatDate } from '../../utils/formatters';

export const ExploreSection: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'feed' | 'map' | 'trending'>('feed');

  return (
    <section className="py-16 md:py-24 bg-[#faf8f5]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-10 gap-4 border-b border-[#e6e2dc] pb-6">
          <div>
            <h2 className="text-3xl md:text-4xl font-bold font-heading text-[#1c1917]">
              Explore Active Problems
            </h2>
            <p className="text-sm text-[#78716c] mt-2">
              Browse issues reported across sectors, track their resolution status, or back issues in your neighborhood.
            </p>
          </div>

          {/* View Mode Toggle Buttons */}
          <div className="flex items-center gap-2 bg-[#f5f2eb] p-1 rounded-xl border border-[#e6e2dc] self-start md:self-auto">
            <button
              onClick={() => setActiveTab('feed')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                activeTab === 'feed'
                  ? 'bg-white text-[#0f6b4f] shadow-xs'
                  : 'text-[#78716c] hover:text-[#1c1917]'
              }`}
            >
              Latest Feed
            </button>
            <button
              onClick={() => setActiveTab('trending')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1 ${
                activeTab === 'trending'
                  ? 'bg-white text-[#0f6b4f] shadow-xs'
                  : 'text-[#78716c] hover:text-[#1c1917]'
              }`}
            >
              <Flame className="w-3.5 h-3.5 text-[#ea580c]" />
              Trending
            </button>
            <button
              onClick={() => setActiveTab('map')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                activeTab === 'map'
                  ? 'bg-white text-[#0f6b4f] shadow-xs'
                  : 'text-[#78716c] hover:text-[#1c1917]'
              }`}
            >
              Map View
            </button>
          </div>
        </div>

        {/* Tab 1 & 2: Feed & Trending Problem Cards */}
        {activeTab !== 'map' ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {FEATURED_PROBLEMS.map((problem) => (
              <Card
                key={problem.id}
                hoverable
                className="flex flex-col justify-between h-full"
              >
                <div>
                  {/* Badges Row */}
                  <div className="flex items-center justify-between gap-2 mb-3">
                    <PriorityBadge priority={problem.priority} size="sm" />
                    <StatusPill status={problem.status} size="sm" />
                  </div>

                  {/* Title */}
                  <h3 className="font-heading font-semibold text-lg text-[#1c1917] leading-snug line-clamp-2 mb-2">
                    {problem.title}
                  </h3>

                  {/* Location */}
                  <div className="flex items-center gap-1.5 text-xs text-[#78716c] mb-3">
                    <MapPin className="w-3.5 h-3.5 text-[#0f6b4f] shrink-0" />
                    <span className="truncate">{problem.address}</span>
                  </div>

                  {/* Description */}
                  <p className="text-xs text-[#44403c] line-clamp-3 leading-relaxed mb-4">
                    {problem.description}
                  </p>
                </div>

                <div>
                  {/* Stats Row (Phase 12: Surfaced Combined Metric + Breakdown) */}
                  <div className="mb-4">
                    <CommunityEngagementStats
                      reportCount={problem.reportCount}
                      supportCount={problem.supportCount}
                      variant="compact"
                    />
                  </div>

                  {/* Action Link */}
                  <div className="flex items-center justify-between text-xs pt-1 border-t border-[#f5f2eb]">
                    <span className="text-[#a8a29e]">{formatDate(problem.createdAt)}</span>
                    <Link
                      href={`/problems/${problem.id}`}
                      className="text-[#0f6b4f] font-semibold hover:underline flex items-center gap-1"
                    >
                      <span>View Details</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        ) : (
          /* Tab 3: Interactive Map Preview Card */
          <Card className="p-8 text-center bg-gradient-to-br from-white to-[#f5f2eb] border border-[#e6e2dc] rounded-2xl">
            <div className="w-12 h-12 rounded-2xl bg-[#e6f4ef] text-[#0f6b4f] flex items-center justify-center mx-auto mb-4">
              <MapPin className="w-6 h-6" />
            </div>
            <h3 className="font-heading text-2xl font-bold text-[#1c1917] mb-2">
              Interactive Map Explorer
            </h3>
            <p className="text-sm text-[#78716c] max-w-md mx-auto mb-6">
              View color-coded markers for critical, major, and low priority issues clustered across your city in real time.
            </p>
            <Link href="/map">
              <Button
                variant="primary"
                size="md"
                rightIcon={<ArrowRight className="w-4 h-4" />}
              >
                Open Fullscreen Map View
              </Button>
            </Link>
          </Card>
        )}

        {/* View All Discover Link */}
        <div className="mt-10 text-center">
          <Link href="/discover">
            <Button variant="outline" size="md" rightIcon={<Filter className="w-4 h-4" />}>
              Browse All Reported Problems in Discover Feed
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
};
