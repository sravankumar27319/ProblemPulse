'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { MapPin, ThumbsUp, ArrowRight, Check } from 'lucide-react';
import { PriorityBadge } from '../ui/PriorityBadge';
import { StatusPill } from '../ui/StatusPill';
import { ProblemStatus, PriorityLevel } from '../../types/problem';

interface CivicCase {
  id: string;
  category: string;
  title: string;
  location: string;
  ward: string;
  timeAgo: string;
  reporter: string;
  priority: PriorityLevel;
  status: ProblemStatus;
  progressPercent: number;
  currentStepIndex: number; // 0 to 4
  department: string;
  initialSupport: number;
}

const CASES: CivicCase[] = [
  {
    id: 'PR-2026-084',
    category: 'Water & Drainage',
    title: 'High-Pressure Pipe Burst & Lane Flooding',
    location: '4th Cross, MG Road Junction',
    ward: 'Ward 12 • Central Zone',
    timeAgo: '2h ago',
    reporter: 'Priya S.',
    priority: 'CRITICAL',
    status: 'IN_PROGRESS',
    progressPercent: 75,
    currentStepIndex: 3,
    department: 'Municipal Water Board (Crew #04)',
    initialSupport: 74,
  },
  {
    id: 'PR-2026-057',
    category: 'Roads & Pavements',
    title: 'Deep Cavity Pothole Near School Crossing',
    location: '12th Main, Indiranagar',
    ward: 'Ward 08 • East Sector',
    timeAgo: '4h ago',
    reporter: 'Arun K.',
    priority: 'MAJOR',
    status: 'ASSIGNED',
    progressPercent: 50,
    currentStepIndex: 2,
    department: 'Urban Road Maintenance Cell',
    initialSupport: 52,
  },
  {
    id: 'PR-2026-031',
    category: 'Electricity & Lighting',
    title: 'Streetlight Circuit Outage on Main Lane',
    location: 'Ring Road Flyover Underpass',
    ward: 'Ward 14 • South Corridor',
    timeAgo: '1d ago',
    reporter: 'Deepa M.',
    priority: 'LOW',
    status: 'RESOLVED',
    progressPercent: 100,
    currentStepIndex: 4,
    department: 'Electrical Division • Verified by 18 Residents',
    initialSupport: 89,
  },
];

const LIFECYCLE_STEPS = ['Submitted', 'Verified', 'Assigned', 'In Progress', 'Resolved'];

export const HeroCivicHub: React.FC = () => {
  const [selectedCaseIdx, setSelectedCaseIdx] = useState<number>(0);
  const [supportOverrides, setSupportOverrides] = useState<Record<number, { count: number; supported: boolean }>>({
    0: { count: CASES[0].initialSupport, supported: false },
    1: { count: CASES[1].initialSupport, supported: false },
    2: { count: CASES[2].initialSupport, supported: false },
  });

  const activeCase = CASES[selectedCaseIdx];
  const activeSupport = supportOverrides[selectedCaseIdx] || { count: activeCase.initialSupport, supported: false };

  const handleToggleSupport = (idx: number) => {
    setSupportOverrides((prev) => {
      const current = prev[idx] || { count: CASES[idx].initialSupport, supported: false };
      const newSupported = !current.supported;
      const newCount = newSupported ? current.count + 1 : current.count - 1;
      return {
        ...prev,
        [idx]: { count: newCount, supported: newSupported },
      };
    });
  };

  return (
    <div className="w-full relative">
      {/* Decorative ambient backdrop */}
      <div className="absolute -inset-1.5 bg-gradient-to-r from-[#0f6b4f]/15 to-[#5cc9a0]/20 rounded-3xl blur-xl opacity-75 dark:opacity-40 -z-10" />

      {/* Main Container Card */}
      <div className="rounded-3xl border border-[#d6d0c4] dark:border-[#2a3832] bg-white dark:bg-[#141d19] shadow-xl overflow-hidden transition-all duration-300">
        {/* Top Header Bar: Case selector tabs */}
        <div className="bg-[#faf8f4] dark:bg-[#101814] px-4 sm:px-6 py-3.5 border-b border-[#e5e1d8] dark:border-[#24312b] flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-[#0f6b4f] dark:bg-[#5cc9a0] animate-pulse" />
            <span className="text-[11px] font-bold uppercase tracking-wider text-[#0f6b4f] dark:text-[#5cc9a0]">
              Live Civic Case Tracker
            </span>
          </div>

          {/* Case Switcher Tabs */}
          <div className="flex items-center gap-1 bg-[#ede8dc]/70 dark:bg-[#19241f] p-1 rounded-xl">
            {CASES.map((item, idx) => (
              <button
                key={item.id}
                type="button"
                onClick={() => setSelectedCaseIdx(idx)}
                className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                  selectedCaseIdx === idx
                    ? 'bg-white dark:bg-[#202f28] text-[#0f6b4f] dark:text-[#5cc9a0] shadow-xs'
                    : 'text-[#78716c] dark:text-[#84948c] hover:text-[#14201c] dark:hover:text-[#ece9e1]'
                }`}
              >
                {item.category.split(' ')[0]}
              </button>
            ))}
          </div>
        </div>

        {/* Case Body */}
        <div className="p-5 sm:p-6 space-y-4">
          {/* Header Row: ID + Priority + Status */}
          <div className="flex items-center justify-between gap-2 flex-wrap">
            <div className="flex items-center gap-2">
              <span className="font-mono text-xs font-bold text-[#0f6b4f] dark:text-[#5cc9a0] bg-[#eef7f3] dark:bg-[#182a22] px-2.5 py-0.5 rounded-md">
                #{activeCase.id}
              </span>
              <span className="text-xs text-[#78716c] dark:text-[#84948c]">
                Reported {activeCase.timeAgo} by {activeCase.reporter}
              </span>
            </div>

            <div className="flex items-center gap-2">
              <PriorityBadge priority={activeCase.priority} size="sm" />
              <StatusPill status={activeCase.status} size="sm" />
            </div>
          </div>

          {/* Problem Title */}
          <div>
            <h3 className="font-heading text-lg sm:text-xl font-bold text-[#14201c] dark:text-[#ece9e1] leading-snug">
              {activeCase.title}
            </h3>
            <div className="flex items-center gap-1.5 text-xs text-[#5d6b65] dark:text-[#9aa8a1] mt-1.5">
              <MapPin className="w-3.5 h-3.5 text-[#0f6b4f] dark:text-[#5cc9a0] shrink-0" />
              <span>{activeCase.location} • {activeCase.ward}</span>
            </div>
          </div>

          {/* Lifecycle Stepper Bar */}
          <div className="pt-2 space-y-2">
            <div className="flex items-center justify-between text-xs font-semibold">
              <span className="text-[#0f6b4f] dark:text-[#5cc9a0]">
                {activeCase.department}
              </span>
              <span className="font-mono text-[#78716c] dark:text-[#84948c]">
                {activeCase.progressPercent}% Processed
              </span>
            </div>

            {/* Visual Progress Bar */}
            <div className="h-2 w-full bg-[#e5e1d8] dark:bg-[#24312b] rounded-full overflow-hidden">
              <div
                className="h-full bg-[#0f6b4f] dark:bg-[#5cc9a0] rounded-full transition-all duration-500"
                style={{ width: `${activeCase.progressPercent}%` }}
              />
            </div>

            {/* Stepper Label Grid */}
            <div className="grid grid-cols-5 text-center text-[10px] font-semibold text-[#78716c] dark:text-[#84948c] pt-0.5">
              {LIFECYCLE_STEPS.map((stepName, sIdx) => {
                const isPassed = sIdx <= activeCase.currentStepIndex;
                const isCurrent = sIdx === activeCase.currentStepIndex;
                return (
                  <span
                    key={stepName}
                    className={
                      isCurrent
                        ? 'text-[#0f6b4f] dark:text-[#5cc9a0] font-bold'
                        : isPassed
                        ? 'text-[#14201c] dark:text-[#ece9e1]'
                        : 'opacity-50'
                    }
                  >
                    {stepName}
                  </span>
                );
              })}
            </div>
          </div>

          {/* Bottom Card Footer: Citizen Support & Action */}
          <div className="pt-4 border-t border-[#e5e1d8] dark:border-[#24312b] flex items-center justify-between gap-3 flex-wrap">
            {/* Citizens Endorsements Stack */}
            <div className="flex items-center gap-2">
              <div className="flex -space-x-2">
                <div className="w-6 h-6 rounded-full bg-[#0f6b4f] text-white flex items-center justify-center text-[10px] font-bold ring-2 ring-white dark:ring-[#141d19]">
                  PS
                </div>
                <div className="w-6 h-6 rounded-full bg-[#d97706] text-white flex items-center justify-center text-[10px] font-bold ring-2 ring-white dark:ring-[#141d19]">
                  AK
                </div>
                <div className="w-6 h-6 rounded-full bg-[#0284c7] text-white flex items-center justify-center text-[10px] font-bold ring-2 ring-white dark:ring-[#141d19]">
                  DM
                </div>
              </div>
              <span className="text-xs text-[#5d6b65] dark:text-[#9aa8a1] font-medium">
                {activeSupport.count} Community Backers
              </span>
            </div>

            {/* Interactive Support Button */}
            <button
              type="button"
              onClick={() => handleToggleSupport(selectedCaseIdx)}
              className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                activeSupport.supported
                  ? 'bg-[#0f6b4f] text-white dark:bg-[#5cc9a0] dark:text-[#0e1512] shadow-xs'
                  : 'border border-[#d6d0c4] dark:border-[#2a3832] bg-white dark:bg-[#1a2520] text-[#14201c] dark:text-[#ece9e1] hover:bg-[#ede8dc] dark:hover:bg-[#202f28]'
              }`}
            >
              {activeSupport.supported ? (
                <Check className="w-3.5 h-3.5 stroke-[2.5]" />
              ) : (
                <ThumbsUp className="w-3.5 h-3.5" />
              )}
              <span>{activeSupport.supported ? 'Supported' : 'Support Issue'}</span>
              <span className="opacity-80">({activeSupport.count})</span>
            </button>
          </div>
        </div>

        {/* Bottom Explorer Strip */}
        <div className="bg-[#faf8f4] dark:bg-[#101814] px-5 py-3 border-t border-[#e5e1d8] dark:border-[#24312b] flex items-center justify-between text-xs">
          <div className="flex items-center gap-3">
            <span className="font-semibold text-[#14201c] dark:text-[#ece9e1]">
              142 Active Civic Tickets
            </span>
            <span className="text-[#78716c] dark:text-[#84948c] hidden sm:inline">•</span>
            <span className="text-[#78716c] dark:text-[#84948c] hidden sm:inline">
              Avg. 48h Resolution SLA
            </span>
          </div>

          <Link
            href="/problems"
            className="inline-flex items-center gap-1 font-bold text-[#0f6b4f] dark:text-[#5cc9a0] hover:underline"
          >
            <span>Explore Live Feed</span>
            <ArrowRight className="w-3 h-3" />
          </Link>
        </div>
      </div>
    </div>
  );
};
