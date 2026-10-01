'use client';

import React from 'react';
import { ProblemCategory } from '../../types/problem';
import { CheckCircle2 } from 'lucide-react';

export interface CategoryOption {
  value: ProblemCategory;
  label: string;
  description: string;
  examples: string;
}

export const CATEGORY_OPTIONS: CategoryOption[] = [
  {
    value: 'ROAD',
    label: 'Road & Pavements',
    description: 'Potholes, broken asphalt, damaged footpaths, uncovered manholes',
    examples: 'Deep pothole on main road, missing drainage cover, sidewalk cave-in',
  },
  {
    value: 'WATER',
    label: 'Water & Sewage',
    description: 'Pipeline leakages, contamination, low pressure, drainage overflow',
    examples: 'Burst municipal water pipe, sewage backflow on residential lane',
  },
  {
    value: 'GARBAGE',
    label: 'Garbage & Sanitation',
    description: 'Overflowing public bins, illegal waste dumping, uncollected litter',
    examples: 'Community garbage bin overflowing for 3+ days, open dumping site',
  },
  {
    value: 'ELECTRICITY',
    label: 'Electricity & Lighting',
    description: 'Broken streetlights, hanging live wires, sparking transformers',
    examples: 'Dark street due to non-functioning lamps, exposed wiring hazard',
  },
  {
    value: 'TRAFFIC',
    label: 'Traffic & Signage',
    description: 'Defective signals, missing stop signs, unsafe lane obstructions',
    examples: 'Traffic signal stuck on red, missing hazard marker at intersection',
  },
  {
    value: 'OTHER',
    label: 'Other Civic Hazards',
    description: 'Encroachments, fallen tree branches, damaged public park equipment',
    examples: 'Uprooted tree blocking lane, damaged playground safety barrier',
  },
];

export interface StepCategoryProps {
  selectedCategory: ProblemCategory | null;
  onSelect: (category: ProblemCategory) => void;
}

export const StepCategory: React.FC<StepCategoryProps> = ({
  selectedCategory,
  onSelect,
}) => {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-heading text-xl sm:text-2xl font-bold text-[#14201c] dark:text-[#ece9e1]">
          Select the Problem Category
        </h2>
        <p className="text-sm text-[#5d6b65] dark:text-[#9aa8a1] mt-1">
          Choose the category that best matches the civic issue you are reporting. This helps route your report to the appropriate municipal department.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {CATEGORY_OPTIONS.map((cat) => {
          const isSelected = selectedCategory === cat.value;

          return (
            <button
              key={cat.value}
              type="button"
              onClick={() => onSelect(cat.value)}
              className={`relative p-5 rounded-xl border text-left transition-all duration-200 cursor-pointer flex flex-col justify-between ${
                isSelected
                  ? 'border-[#0f6b4f] dark:border-[#5cc9a0] bg-[#eef7f3] dark:bg-[#132720] ring-2 ring-[#0f6b4f]/20 dark:ring-[#5cc9a0]/30 shadow-sm transform scale-[1.01]'
                  : 'border-[#e5e1d8] dark:border-[#24312b] bg-white dark:bg-[#141d19] hover:border-[#b8ccbf] dark:hover:border-[#384c42] hover:bg-[#fbfaf7] dark:hover:bg-[#18231e]'
              }`}
            >
              <div>
                <div className="flex items-start justify-between gap-3 mb-2">
                  <h3 className="font-heading font-bold text-[18px] text-[#14201c] dark:text-[#ece9e1] leading-snug">
                    {cat.label}
                  </h3>

                  <div className="w-5 h-5 flex items-center justify-center shrink-0 mt-0.5">
                    {isSelected ? (
                      <CheckCircle2 className="w-5 h-5 text-[#0f6b4f] dark:text-[#5cc9a0]" />
                    ) : (
                      <div className="w-4 h-4 rounded-full border border-[#d6d0c4] dark:border-[#44524c]" />
                    )}
                  </div>
                </div>

                <p className="text-xs text-[#5d6b65] dark:text-[#9aa8a1] mt-1 line-clamp-2">
                  {cat.description}
                </p>
              </div>

              <div className="mt-4 pt-3 border-t border-[#e5e1d8]/60 dark:border-[#24312b]/60">
                <span className="text-[11px] font-medium text-[#78716c] dark:text-[#84948c] block truncate">
                  <span className="font-semibold text-[#14201c] dark:text-[#ece9e1]">Examples:</span> {cat.examples}
                </span>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};
