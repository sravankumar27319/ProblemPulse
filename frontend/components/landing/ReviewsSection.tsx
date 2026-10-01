'use client';

import React from 'react';
import { Star, Quote, CheckCircle2 } from 'lucide-react';

export const ReviewsSection: React.FC = () => {
  const reviews = [
    {
      name: 'Priya Sharma',
      role: 'Ward 14 Resident',
      avatar: 'PS',
      content:
        'A hazardous open drainage manhole had been ignored near our school for two months. After 43 neighbors supported the report on ProblemPulse, municipal workers arrived and sealed it within 48 hours.',
      category: 'Water & Drainage',
      stars: 5,
    },
    {
      name: 'Karthik Verma',
      role: 'Civic Volunteer & Commuter',
      avatar: 'KV',
      content:
        'The ability to back and support other citizens’ pothole reports on the main road meant the municipal road cell merged duplicate complaints and fixed the entire arterial stretch at once.',
      category: 'Roads & Transit',
      stars: 5,
    },
    {
      name: 'Ananya Deshmukh',
      role: 'Neighborhood Association Lead',
      avatar: 'AD',
      content:
        'Our colony had broken streetlights causing severe safety concerns. ProblemPulse made the issue visible, and the timeline tracker kept all of us updated until the electrical department replaced the fixtures.',
      category: 'Electricity & Safety',
      stars: 5,
    },
  ];

  return (
    <section className="py-16 sm:py-24 border-b border-[#e5e1d8] dark:border-[#24312b] bg-[#faf8f4] dark:bg-[#0e1512]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Heading matching Wireframe 'Review Section' */}
        <div className="text-center max-w-3xl mx-auto mb-12 sm:mb-16">
          <div className="inline-block mb-3">
            <h2 className="font-heading text-3xl sm:text-4xl font-bold text-[#14201c] dark:text-[#ece9e1] tracking-tight">
              Community Voices
            </h2>
            <div className="h-1 w-20 bg-[#0f6b4f] dark:bg-[#5cc9a0] mx-auto mt-2.5 rounded-full" />
          </div>
          <p className="text-base sm:text-lg text-[#5d6b65] dark:text-[#9aa8a1] leading-relaxed mt-2">
            Real stories from residents and community leaders driving civic improvements in their neighborhoods.
          </p>
        </div>

        {/* 3 Review Cards Grid matching Wireframe */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8">
          {reviews.map((rev, idx) => (
            <div
              key={idx}
              className="flex flex-col justify-between p-6 sm:p-7 rounded-2xl bg-white dark:bg-[#141d19] border border-[#e5e1d8] dark:border-[#24312b] shadow-2xs hover:shadow-md transition-all duration-200"
            >
              <div>
                {/* 5 Stars */}
                <div className="flex items-center gap-1 text-amber-500 mb-4">
                  {[...Array(rev.stars)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-amber-500 text-amber-500" />
                  ))}
                </div>

                {/* Review Text */}
                <p className="text-sm text-[#5d6b65] dark:text-[#9aa8a1] leading-relaxed mb-6 italic">
                  &ldquo;{rev.content}&rdquo;
                </p>
              </div>

              {/* Author Info matching Wireframe */}
              <div className="pt-4 border-t border-[#e5e1d8] dark:border-[#24312b] flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-[#0f6b4f] dark:bg-[#5cc9a0] text-white dark:text-[#0e1512] font-heading font-bold text-xs flex items-center justify-center shrink-0">
                  {rev.avatar}
                </div>
                <div>
                  <div className="flex items-center gap-1.5">
                    <h4 className="font-heading font-bold text-sm text-[#14201c] dark:text-[#ece9e1]">
                      {rev.name}
                    </h4>
                    <CheckCircle2 className="w-3.5 h-3.5 text-[#0f6b4f] dark:text-[#5cc9a0]" />
                  </div>
                  <p className="text-xs text-[#7e8b85] dark:text-[#889891]">
                    {rev.role} • {rev.category}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
