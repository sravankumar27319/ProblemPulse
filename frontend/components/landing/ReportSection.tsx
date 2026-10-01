import React from 'react';

export const ReportSection: React.FC = () => {
  return (
    <section
      id="report"
      className="py-12 sm:py-16 md:py-20 bg-[#e3f0ea] dark:bg-[#173026] border-b border-[#e5e1d8] dark:border-[#24312b] transition-colors"
    >
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="space-y-8">
          {/* Header */}
          <div className="space-y-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-[#0f6b4f] dark:text-[#5cc9a0]">
              REPORT
            </span>
            <h2 className="font-heading text-3xl sm:text-4xl font-normal text-[#14201c] dark:text-[#ece9e1] tracking-tight">
              Report a problem in three steps
            </h2>
          </div>

          {/* 3 Cards Grid */}
          <div className="grid grid-cols-1 min-[860px]:grid-cols-3 gap-6">
            {/* Step 01 */}
            <div className="bg-white dark:bg-[#141d19] border border-[#e5e1d8] dark:border-[#24312b] rounded-2xl p-6 space-y-3">
              <div className="w-8 h-8 rounded-md bg-[#e3f0ea] dark:bg-[#173026] text-[#0f6b4f] dark:text-[#5cc9a0] font-semibold text-xs flex items-center justify-center">
                01
              </div>
              <h3 className="font-heading text-xl font-normal text-[#14201c] dark:text-[#ece9e1]">
                Evidence
              </h3>
              <p className="text-sm text-[#5d6b65] dark:text-[#9aa8a1] leading-relaxed">
                Add a photo or short video showing exactly what's wrong.
              </p>
            </div>

            {/* Step 02 */}
            <div className="bg-white dark:bg-[#141d19] border border-[#e5e1d8] dark:border-[#24312b] rounded-2xl p-6 space-y-3">
              <div className="w-8 h-8 rounded-md bg-[#e3f0ea] dark:bg-[#173026] text-[#0f6b4f] dark:text-[#5cc9a0] font-semibold text-xs flex items-center justify-center">
                02
              </div>
              <h3 className="font-heading text-xl font-normal text-[#14201c] dark:text-[#ece9e1]">
                Location
              </h3>
              <p className="text-sm text-[#5d6b65] dark:text-[#9aa8a1] leading-relaxed">
                Drop a pin on the exact spot so the right department can find it.
              </p>
            </div>

            {/* Step 03 */}
            <div className="bg-white dark:bg-[#141d19] border border-[#e5e1d8] dark:border-[#24312b] rounded-2xl p-6 space-y-3">
              <div className="w-8 h-8 rounded-md bg-[#e3f0ea] dark:bg-[#173026] text-[#0f6b4f] dark:text-[#5cc9a0] font-semibold text-xs flex items-center justify-center">
                03
              </div>
              <h3 className="font-heading text-xl font-normal text-[#14201c] dark:text-[#ece9e1]">
                Details
              </h3>
              <p className="text-sm text-[#5d6b65] dark:text-[#9aa8a1] leading-relaxed">
                Describe the severity and how many people are affected, then review and submit.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

