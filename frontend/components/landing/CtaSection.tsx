'use client';

import React from 'react';
import Link from 'next/link';
import { PlusCircle, ArrowRight } from 'lucide-react';

export const CtaSection: React.FC = () => {
  return (
    <section className="py-16 sm:py-24 bg-[#faf8f4] dark:bg-[#0e1512]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="relative overflow-hidden rounded-3xl bg-[#0f6b4f] dark:bg-[#14231d] text-white p-8 sm:p-12 md:p-16 border border-[#0f6b4f] dark:border-[#5cc9a0]/30 shadow-xl">
          {/* Subtle civic pattern backdrop */}
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(255,255,255,0.15),transparent_60%)] pointer-events-none" />

          <div className="relative z-10 max-w-3xl space-y-6">
            <h2 className="font-heading text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight text-white leading-tight">
              Ready to Fix a Problem in Your Neighborhood?
            </h2>

            <p className="text-base sm:text-lg text-[#d0eadf] leading-relaxed max-w-2xl">
              Report water leaks, road potholes, streetlight outages, or sanitation issues in under 2 minutes. Add your support to existing community issues and track progress in real time.
            </p>

            <div className="pt-2 flex flex-wrap items-center gap-4">
              <Link
                href="/report"
                className="inline-flex items-center justify-center gap-2 text-sm sm:text-base font-bold bg-white text-[#0f6b4f] px-6 py-3.5 rounded-xl shadow-lg hover:bg-[#faf8f5] transition-all"
              >
                <PlusCircle className="w-4 h-4" />
                <span>Report a Problem Now</span>
              </Link>
              <Link
                href="/problems"
                className="inline-flex items-center justify-center gap-2 text-sm sm:text-base font-semibold border border-white/30 text-white px-6 py-3.5 rounded-xl hover:bg-white/10 transition-colors"
              >
                <span>Explore Community Reports</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
