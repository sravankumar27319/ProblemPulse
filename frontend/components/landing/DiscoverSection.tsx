import React from 'react';

export const DiscoverSection: React.FC = () => {
  return (
    <section id="discover" className="py-12 sm:py-16 md:py-20 border-b border-[#e5e1d8] dark:border-[#24312b]">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="grid grid-cols-1 min-[860px]:grid-cols-12 gap-10 min-[860px]:gap-12 items-start">
          {/* Left Column */}
          <div className="min-[860px]:col-span-5 space-y-6">
            <span className="text-xs font-semibold uppercase tracking-wider text-[#0f6b4f] dark:text-[#5cc9a0]">
              DISCOVER
            </span>

            <h2 className="font-heading text-3xl sm:text-4xl font-normal text-[#14201c] dark:text-[#ece9e1] tracking-tight leading-snug">
              Explore Problems in Your Area
            </h2>

            <p className="text-base text-[#5d6b65] dark:text-[#9aa8a1] leading-relaxed">
              See what your community is facing right now, through the feed, the map or what's trending. Every issue has a public page you can follow from report to resolution.
            </p>

            <div>
              <a
                href="/discover"
                className="inline-flex items-center justify-center text-sm font-medium bg-[#14221c] dark:bg-[#ece9e1] text-white dark:text-[#0e1512] px-5 py-2.5 rounded-lg hover:opacity-90 transition-opacity"
              >
                Explore Problems
              </a>
            </div>
          </div>

          {/* Right Column: 3 Cards */}
          <div className="min-[860px]:col-span-7 space-y-4">
            {/* Card 01 - Feed */}
            <div className="bg-white dark:bg-[#141d19] border border-[#e5e1d8] dark:border-[#24312b] rounded-2xl p-5 sm:p-6 transition-all">
              <div className="flex items-start gap-4">
                <div className="w-8 h-8 rounded-md bg-[#e3f0ea] dark:bg-[#173026] text-[#0f6b4f] dark:text-[#5cc9a0] font-semibold text-xs flex items-center justify-center shrink-0">
                  01
                </div>
                <div className="space-y-1.5 flex-1">
                  <h3 className="font-heading text-xl font-normal text-[#14201c] dark:text-[#ece9e1]">
                    Feed
                  </h3>
                  <p className="text-sm text-[#5d6b65] dark:text-[#9aa8a1] leading-relaxed">
                    Browse recent problems with photos, location and details from your area, sorted by latest, most supported or highest priority.
                  </p>
                  <div className="pt-1">
                    <a
                      href="/discover"
                      className="inline-flex items-center text-sm font-medium text-[#0f6b4f] dark:text-[#5cc9a0] hover:underline"
                    >
                      View Feed →
                    </a>
                  </div>
                </div>
              </div>
            </div>

            {/* Card 02 - Map (with id="map") */}
            <div
              id="map"
              className="bg-white dark:bg-[#141d19] border border-[#e5e1d8] dark:border-[#24312b] rounded-2xl p-5 sm:p-6 transition-all"
            >
              <div className="flex items-start gap-4">
                <div className="w-8 h-8 rounded-md bg-[#e3f0ea] dark:bg-[#173026] text-[#0f6b4f] dark:text-[#5cc9a0] font-semibold text-xs flex items-center justify-center shrink-0">
                  02
                </div>
                <div className="space-y-1.5 flex-1">
                  <h3 className="font-heading text-xl font-normal text-[#14201c] dark:text-[#ece9e1]">
                    Map
                  </h3>
                  <p className="text-sm text-[#5d6b65] dark:text-[#9aa8a1] leading-relaxed">
                    See every open problem plotted on an interactive map with colour-coded priority markers and a hover preview.
                  </p>
                  <div className="pt-1">
                    <a
                      href="/map"
                      className="inline-flex items-center text-sm font-medium text-[#0f6b4f] dark:text-[#5cc9a0] hover:underline"
                    >
                      View Map →
                    </a>
                  </div>
                </div>
              </div>
            </div>

            {/* Card 03 - Trending */}
            <div className="bg-white dark:bg-[#141d19] border border-[#e5e1d8] dark:border-[#24312b] rounded-2xl p-5 sm:p-6 transition-all">
              <div className="flex items-start gap-4">
                <div className="w-8 h-8 rounded-md bg-[#e3f0ea] dark:bg-[#173026] text-[#0f6b4f] dark:text-[#5cc9a0] font-semibold text-xs flex items-center justify-center shrink-0">
                  03
                </div>
                <div className="space-y-1.5 flex-1">
                  <h3 className="font-heading text-xl font-normal text-[#14201c] dark:text-[#ece9e1]">
                    Trending
                  </h3>
                  <p className="text-sm text-[#5d6b65] dark:text-[#9aa8a1] leading-relaxed">
                    Discover the problems gaining the most reports and support this week, so the right issues rise to the top.
                  </p>
                  <div className="pt-1">
                    <a
                      href="/discover?sort=trending"
                      className="inline-flex items-center text-sm font-medium text-[#0f6b4f] dark:text-[#5cc9a0] hover:underline"
                    >
                      View Trending →
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

