'use client';

import React from 'react';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';

export const CategorySection: React.FC = () => {
  const categories = [
    {
      id: 'WATER',
      index: '01',
      name: 'Water Supply & Plumbing',
      badge: 'Critical Infrastructure',
      description: 'Pipeline leakages, contaminated water supplies, irregular water timings, and municipal tap repairs.',
      href: '/problems?category=WATER',
    },
    {
      id: 'ROAD',
      index: '02',
      name: 'Roads & Pavement',
      badge: 'High Transit',
      description: 'Potholes, broken tarmac, cave-ins, hazardous speed breakers, and unpaved pedestrian pathways.',
      href: '/problems?category=ROAD',
    },
    {
      id: 'ELECTRICITY',
      index: '03',
      name: 'Electricity & Streetlights',
      badge: 'Public Safety',
      description: 'Dark streets, exposed hanging wires, frequent transformer tripping, and faulty pole lighting.',
      href: '/problems?category=ELECTRICITY',
    },
    {
      id: 'GARBAGE',
      index: '04',
      name: 'Sanitation & Waste',
      badge: 'Hygiene & Health',
      description: 'Overflowing public bins, delayed garbage collection, illegal roadside dumping, and debris clearance.',
      href: '/problems?category=GARBAGE',
    },
    {
      id: 'DRAINAGE',
      index: '05',
      name: 'Drainage & Sewage',
      badge: 'Monsoon Ready',
      description: 'Blocked stormwater drains, stagnant water puddles, open manholes, and sewage backups.',
      href: '/problems?category=WATER',
    },
    {
      id: 'TRAFFIC',
      index: '06',
      name: 'Traffic & Signage',
      badge: 'Mobility',
      description: 'Malfunctioning traffic signals, broken pedestrian crossings, damaged barriers, and blind corners.',
      href: '/problems?category=TRAFFIC',
    },
  ];

  return (
    <section className="py-16 sm:py-24 border-b border-[#e5e1d8] dark:border-[#24312b] bg-white dark:bg-[#111915]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header matching Wireframe */}
        <div className="text-center max-w-3xl mx-auto mb-12 sm:mb-16">
          <div className="inline-block mb-3">
            <h2 className="font-heading text-3xl sm:text-4xl font-bold text-[#14201c] dark:text-[#ece9e1] tracking-tight">
              Problems That Matter
            </h2>
            <div className="h-1 w-20 bg-[#0f6b4f] dark:bg-[#5cc9a0] mx-auto mt-2.5 rounded-full" />
          </div>
          <p className="text-base sm:text-lg text-[#5d6b65] dark:text-[#9aa8a1] leading-relaxed mt-2">
            Discover and support real problems reported by people in your community across core civic services.
          </p>
        </div>

        {/* Feature / Category Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
          {categories.map((cat) => (
            <Link
              key={cat.id}
              href={cat.href}
              className="group relative flex flex-col justify-between p-6 sm:p-7 rounded-2xl bg-[#faf8f4] dark:bg-[#141d19] border border-[#e5e1d8] dark:border-[#24312b] hover:border-[#0f6b4f]/40 dark:hover:border-[#5cc9a0]/40 shadow-2xs hover:shadow-md transition-all duration-200 cursor-pointer"
            >
              <div>
                <div className="flex items-center justify-between gap-2 mb-4">
                  <span className="font-heading font-semibold text-lg text-[#0f6b4f] dark:text-[#5cc9a0]">
                    {cat.index}
                  </span>
                  <span className="text-[11px] font-semibold uppercase tracking-wider text-[#5d6b65] dark:text-[#9aa8a1] bg-[#ede8dc] dark:bg-[#1f2b25] px-2.5 py-0.5 rounded-full">
                    {cat.badge}
                  </span>
                </div>

                <h3 className="font-heading text-[22px] font-bold text-[#14201c] dark:text-[#ece9e1] mb-2 group-hover:text-[#0f6b4f] dark:group-hover:text-[#5cc9a0] transition-colors leading-snug">
                  {cat.name}
                </h3>

                <p className="text-sm text-[#5d6b65] dark:text-[#9aa8a1] leading-relaxed mb-6">
                  {cat.description}
                </p>
              </div>

              <div className="pt-4 border-t border-[#e5e1d8] dark:border-[#24312b] flex items-center justify-between text-xs font-bold text-[#0f6b4f] dark:text-[#5cc9a0]">
                <span>Explore Reports</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </div>
            </Link>
          ))}
        </div>

        {/* View All Categories Action */}
        <div className="mt-12 text-center">
          <Link
            href="/problems"
            className="inline-flex items-center gap-2 text-sm font-semibold text-[#14201c] dark:text-[#ece9e1] hover:text-[#0f6b4f] dark:hover:text-[#5cc9a0] px-5 py-2.5 rounded-xl border border-[#d6d0c4] dark:border-[#2a3832] bg-[#faf8f4] dark:bg-[#141d19] hover:bg-[#ede8dc] dark:hover:bg-[#1b2621] transition-colors"
          >
            <span>View All Reported Problems in Every Category</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </section>
  );
};
