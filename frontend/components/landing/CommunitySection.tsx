import React from 'react';

export const CommunitySection: React.FC = () => {
  return (
    <section
      id="community"
      className="py-12 sm:py-16 md:py-20 border-b border-[#e5e1d8] dark:border-[#24312b]"
    >
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="grid grid-cols-1 min-[860px]:grid-cols-2 gap-10 min-[860px]:gap-12 items-center">
          {/* Left Column */}
          <div className="space-y-6">
            <span className="text-xs font-semibold uppercase tracking-wider text-[#0f6b4f] dark:text-[#5cc9a0]">
              COMMUNITY
            </span>

            <h2 className="font-heading text-3xl sm:text-4xl font-normal text-[#14201c] dark:text-[#ece9e1] tracking-tight leading-snug">
              More voices, faster attention.
            </h2>

            <p className="text-base text-[#5d6b65] dark:text-[#9aa8a1] leading-relaxed">
              When many people back the same problem, its priority rises. Add your support or share what you've seen, and help the right issues reach the top of the queue.
            </p>

            <div>
              <a
                href="/discover"
                className="inline-flex items-center justify-center text-sm font-medium bg-[#14221c] dark:bg-[#ece9e1] text-white dark:text-[#0e1512] px-5 py-2.5 rounded-lg hover:opacity-90 transition-opacity"
              >
                Join the discussion
              </a>
            </div>
          </div>

          {/* Right Column: Sample Comment Card */}
          <div className="w-full">
            <div className="bg-white dark:bg-[#141d19] border border-[#e5e1d8] dark:border-[#24312b] rounded-2xl p-7 shadow-xs max-w-lg mx-auto min-[860px]:ml-auto">
              <h3 className="font-heading text-xl font-normal text-[#14201c] dark:text-[#ece9e1] mb-3">
                Large road damage · 342 supporters
              </h3>
              <p className="text-sm text-[#5d6b65] dark:text-[#9aa8a1] italic leading-relaxed">
                &ldquo;Two-wheelers slip here every morning. It has been like this for weeks.&rdquo; — Ravi K., 2 days ago
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

