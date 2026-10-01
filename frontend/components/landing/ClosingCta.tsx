import React from 'react';

export const ClosingCta: React.FC = () => {
  return (
    <section className="py-16 sm:py-20 md:py-24 text-center border-b border-[#e5e1d8] dark:border-[#24312b]">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 space-y-4">
        <h2 className="font-heading text-3xl sm:text-4xl font-normal text-[#14201c] dark:text-[#ece9e1] tracking-tight">
          See a problem? Put it on the record.
        </h2>
        <p className="text-base text-[#5d6b65] dark:text-[#9aa8a1]">
          It takes about two minutes.
        </p>
        <div className="pt-2">
          <a
            href="/report"
            className="inline-flex items-center justify-center text-sm font-medium bg-[#14221c] dark:bg-[#ece9e1] text-white dark:text-[#0e1512] px-6 py-3 rounded-lg hover:opacity-90 transition-opacity"
          >
            Report a Problem
          </a>
        </div>
      </div>
    </section>
  );
};

