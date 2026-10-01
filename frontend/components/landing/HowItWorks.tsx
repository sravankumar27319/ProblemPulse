'use client';

import React from 'react';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';

export const HowItWorks: React.FC = () => {
  const steps = [
    {
      step: '01',
      title: 'Report',
      subtitle: 'Submit a Real Problem',
      description:
        'Residents submit real community problems with photos, GPS coordinates, and clear details in under 2 minutes.',
      actionText: 'Report Issue',
      actionHref: '/report',
    },
    {
      step: '02',
      title: 'Discover',
      subtitle: 'Uncover Local Issues',
      description:
        'Neighbors discover unresolved problems in their locality through the live interactive map and neighborhood feed.',
      actionText: 'Discover Issues',
      actionHref: '/discover',
    },
    {
      step: '03',
      title: 'Support',
      subtitle: 'Back Issues That Matter',
      description:
        'Community members endorse and support critical issues. Duplicate reports are automatically merged to amplify urgency.',
      actionText: 'Support Problems',
      actionHref: '/problems',
    },
    {
      step: '04',
      title: 'Act',
      subtitle: 'Drive Municipal Action',
      description:
        'Highly supported problems gain elevated priority on municipal dispatch dashboards, triggering verified field resolution.',
      actionText: 'Track Resolution',
      actionHref: '/problems',
    },
  ];

  return (
    <section className="py-16 sm:py-24 border-b border-[#e5e1d8] dark:border-[#24312b] bg-[#faf8f4] dark:bg-[#0e1512]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Heading */}
        <div className="text-center max-w-3xl mx-auto mb-12 sm:mb-16">
          <div className="inline-block mb-3">
            <h2 className="font-heading text-3xl sm:text-4xl font-bold text-[#14201c] dark:text-[#ece9e1] tracking-tight">
              How ProblemPulse Works
            </h2>
            <div className="h-1 w-20 bg-[#0f6b4f] dark:bg-[#5cc9a0] mx-auto mt-2.5 rounded-full" />
          </div>
          <p className="text-base sm:text-lg text-[#5d6b65] dark:text-[#9aa8a1] leading-relaxed mt-2">
            A simple, transparent 4-step workflow connecting citizen observations with accountable municipal execution.
          </p>
        </div>

        {/* 4 Steps Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {steps.map((item, idx) => (
            <div
              key={idx}
              className="relative flex flex-col justify-between p-6 sm:p-7 rounded-2xl bg-white dark:bg-[#141d19] border border-[#e5e1d8] dark:border-[#24312b] shadow-2xs hover:shadow-md transition-all duration-200"
            >
              <div>
                {/* Step Number in Fraunces */}
                <div className="mb-4">
                  <span className="font-heading text-3xl font-black text-[#0f6b4f] dark:text-[#5cc9a0] tracking-tight">
                    {item.step}
                  </span>
                </div>

                <h3 className="font-heading text-[22px] font-bold text-[#14201c] dark:text-[#ece9e1] mb-1 leading-snug">
                  {item.title}
                </h3>
                <p className="text-xs font-semibold text-[#0f6b4f] dark:text-[#5cc9a0] mb-3">
                  {item.subtitle}
                </p>
                <p className="text-xs sm:text-sm text-[#5d6b65] dark:text-[#9aa8a1] leading-relaxed mb-4">
                  {item.description}
                </p>
              </div>

              <div className="pt-3 border-t border-[#e5e1d8] dark:border-[#24312b]">
                <Link
                  href={item.actionHref}
                  className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#0f6b4f] dark:text-[#5cc9a0] hover:underline"
                >
                  <span>{item.actionText}</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
