'use client';

import React from 'react';

export const WhySection: React.FC = () => {
  const reasons = [
    {
      num: '01',
      title: 'Real Community Problems',
      description: 'Problems are reported directly by residents living through them, backed by actual photo evidence and authentic timestamps.',
    },
    {
      num: '02',
      title: 'Community Support',
      description: 'Users can support problems that matter to their community. High citizen backing drives automatic escalation to municipal teams.',
    },
    {
      num: '03',
      title: 'Location Based',
      description: 'Find problems based on their precise street location and category. Prevent duplicate tickets with intelligent geographic clustering.',
    },
    {
      num: '04',
      title: 'Transparent Activity',
      description: 'Track reported problems, department assignments, and resolution proofs with public accountability from start to finish.',
    },
  ];

  return (
    <section className="py-16 sm:py-24 border-b border-[#e5e1d8] dark:border-[#24312b] bg-white dark:bg-[#111915]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Heading matching Wireframe 'Why Us Section' */}
        <div className="text-center max-w-3xl mx-auto mb-12 sm:mb-16">
          <div className="inline-block mb-3">
            <h2 className="font-heading text-3xl sm:text-4xl font-bold text-[#14201c] dark:text-[#ece9e1] tracking-tight">
              Why ProblemPulse?
            </h2>
            <div className="h-1 w-20 bg-[#0f6b4f] dark:bg-[#5cc9a0] mx-auto mt-2.5 rounded-full" />
          </div>
          <p className="text-base sm:text-lg text-[#5d6b65] dark:text-[#9aa8a1] leading-relaxed mt-2">
            Built for civic impact: transparent, crowd-supported, and directly connected to municipal resolution teams.
          </p>
        </div>

        {/* 4 Cards Grid matching Wireframe */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {reasons.map((item, idx) => (
            <div
              key={idx}
              className="flex flex-col p-6 sm:p-7 rounded-2xl bg-[#faf8f4] dark:bg-[#141d19] border border-[#e5e1d8] dark:border-[#24312b] shadow-2xs hover:shadow-md transition-all duration-200"
            >
              <div className="font-heading text-sm font-bold text-[#0f6b4f] dark:text-[#5cc9a0] tracking-wider mb-4">
                {item.num}
              </div>
              <h3 className="font-heading text-[20px] font-bold text-[#14201c] dark:text-[#ece9e1] mb-2.5 leading-snug">
                {item.title}
              </h3>
              <p className="text-xs sm:text-sm text-[#5d6b65] dark:text-[#9aa8a1] leading-relaxed">
                {item.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
