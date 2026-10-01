'use client';

import React from 'react';

export const PartnersSection: React.FC = () => {
  const partners = [
    'Water & Sewage Board',
    'Metro Roads Authority',
    'Urban Power Grid',
    'Sanitation Council',
    'Municipal Ward Alliance',
  ];

  return (
    <section className="py-8 sm:py-10 border-b border-[#e5e1d8] dark:border-[#24312b] bg-[#faf8f4] dark:bg-[#0e1512]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <p className="text-xs font-semibold uppercase tracking-wider text-[#5d6b65] dark:text-[#9aa8a1] mb-5">
          Partnered with municipal cells, local wards & community taskforces
        </p>

        <div className="flex flex-wrap items-center justify-center gap-6 sm:gap-10 md:gap-14 opacity-85">
          {partners.map((partnerName, idx) => (
            <div
              key={idx}
              className="text-xs sm:text-sm font-semibold text-[#5d6b65] dark:text-[#9aa8a1] hover:text-[#14201c] dark:hover:text-[#ece9e1] transition-colors"
            >
              <span>{partnerName}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
