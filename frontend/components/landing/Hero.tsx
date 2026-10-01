'use client';

import React from 'react';
import Link from 'next/link';
import { ArrowRight, PlusCircle } from 'lucide-react';

export const Hero: React.FC = () => {
  return (
    <section className="py-20 sm:py-28 md:py-36 flex items-center justify-center text-center">
      {/* Centered Content Container */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6 sm:space-y-8">
        {/* Large heading with sunset metaphor and highlighted span */}
        <h1
          className="font-heading text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold text-white tracking-tight leading-[1.14]"
          style={{ textShadow: '0 2px 8px rgba(0,0,0,0.65)' }}
        >
          Like the Sunset, Every Problem<br className="hidden sm:inline" />{' '}
          <span className="text-[#5cc9a0]">Fades Into Resolution</span>.
        </h1>

        {/* Supporting plain text */}
        <p
          className="text-base sm:text-lg md:text-xl text-white/95 leading-relaxed max-w-2xl mx-auto font-sans"
          style={{ textShadow: '0 1px 4px rgba(0,0,0,0.6)' }}
        >
          Just as the evening sky always gives way to a new day, the problems in your neighborhood don't have to stay unresolved. Report civic issues, rally your neighbors' support, and watch them move steadily toward a fix.
        </p>

        {/* Two buttons only (Report & Explore) */}
        <div className="flex flex-wrap items-center justify-center gap-4 pt-2">
          <Link
            href="/report"
            className="inline-flex items-center justify-center gap-2 text-base font-bold bg-[#0f6b4f] hover:bg-[#0b543d] text-white px-8 py-4 rounded-xl shadow-xl transition-all border border-[#5cc9a0]/30 hover:scale-[1.02]"
            style={{ textShadow: '0 1px 2px rgba(0,0,0,0.4)' }}
          >
            <PlusCircle className="w-5 h-5 text-white" />
            <span>Report a Problem</span>
          </Link>
          <Link
            href="/problems"
            className="inline-flex items-center justify-center gap-2 text-base font-bold bg-white/10 hover:bg-white/20 text-white px-8 py-4 rounded-xl shadow-xl transition-all border-2 border-white/80 hover:border-white hover:scale-[1.02] backdrop-blur-md"
            style={{ textShadow: '0 1px 3px rgba(0,0,0,0.5)' }}
          >
            <span>Explore Problems</span>
            <ArrowRight className="w-5 h-5 text-white" />
          </Link>
        </div>
      </div>
    </section>
  );
};
