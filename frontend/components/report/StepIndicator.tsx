'use client';

import React from 'react';
import { Check } from 'lucide-react';

export interface StepIndicatorProps {
  currentStep: number;
  totalSteps?: number;
  onStepClick?: (step: number) => void;
}

const STEPS = [
  { step: 1, title: 'Category', description: 'Type of issue' },
  { step: 2, title: 'Evidence', description: 'Photos & video' },
  { step: 3, title: 'Location', description: 'Pin on map' },
  { step: 4, title: 'Details', description: 'Description & impact' },
  { step: 5, title: 'Review', description: 'Final check' },
];

export const StepIndicator: React.FC<StepIndicatorProps> = ({
  currentStep,
  onStepClick,
}) => {
  return (
    <div className="w-full">
      {/* Desktop Stepper */}
      <div className="hidden md:flex items-center justify-between relative">
        {/* Background connector line */}
        <div className="absolute top-5 left-8 right-8 h-0.5 bg-[#e5e1d8] dark:bg-[#24312b] -z-0" />
        
        {/* Active connector progress */}
        <div
          className="absolute top-5 left-8 h-0.5 bg-[#0f6b4f] dark:bg-[#5cc9a0] transition-all duration-300 -z-0"
          style={{
            width: `${((currentStep - 1) / (STEPS.length - 1)) * 100}%`,
          }}
        />

        {STEPS.map((item) => {
          const isCompleted = currentStep > item.step;
          const isCurrent = currentStep === item.step;
          const isAccessible = currentStep >= item.step;

          return (
            <button
              key={item.step}
              type="button"
              disabled={!isAccessible}
              onClick={() => onStepClick && isAccessible && onStepClick(item.step)}
              className={`flex flex-col items-center group relative z-10 transition-all ${
                isAccessible ? 'cursor-pointer' : 'cursor-not-allowed opacity-60'
              }`}
            >
              <div
                className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm transition-all duration-200 border-2 ${
                  isCompleted
                    ? 'bg-[#0f6b4f] dark:bg-[#5cc9a0] text-white dark:text-[#0e1512] border-[#0f6b4f] dark:border-[#5cc9a0] shadow-sm'
                    : isCurrent
                    ? 'bg-white dark:bg-[#14201c] text-[#0f6b4f] dark:text-[#5cc9a0] border-[#0f6b4f] dark:border-[#5cc9a0] ring-4 ring-[#0f6b4f]/15 dark:ring-[#5cc9a0]/20'
                    : 'bg-[#faf8f4] dark:bg-[#1a2520] text-[#78716c] dark:text-[#84948c] border-[#e5e1d8] dark:border-[#24312b]'
                }`}
              >
                {isCompleted ? (
                  <Check className="w-5 h-5 stroke-[2.5]" />
                ) : (
                  <span>{item.step}</span>
                )}
              </div>
              <div className="mt-2 text-center">
                <span
                  className={`block text-sm font-bold tracking-tight transition-colors ${
                    isCurrent
                      ? 'text-[#0f6b4f] dark:text-[#5cc9a0]'
                      : isCompleted
                      ? 'text-[#14201c] dark:text-[#ece9e1]'
                      : 'text-[#78716c] dark:text-[#84948c]'
                  }`}
                >
                  {item.title}
                </span>
                <span className="block text-xs text-[#78716c] dark:text-[#84948c]">
                  {item.description}
                </span>
              </div>
            </button>
          );
        })}
      </div>

      {/* Mobile Stepper */}
      <div className="md:hidden flex flex-col gap-2">
        <div className="flex items-center justify-between text-xs font-medium">
          <span className="text-[#78716c] dark:text-[#84948c]">
            Step {currentStep} of {STEPS.length}
          </span>
          <span className="font-semibold text-[#0f6b4f] dark:text-[#5cc9a0]">
            {STEPS[currentStep - 1]?.title} — {STEPS[currentStep - 1]?.description}
          </span>
        </div>
        <div className="w-full h-2 bg-[#e5e1d8] dark:bg-[#24312b] rounded-full overflow-hidden">
          <div
            className="h-full bg-[#0f6b4f] dark:bg-[#5cc9a0] transition-all duration-300 rounded-full"
            style={{ width: `${(currentStep / STEPS.length) * 100}%` }}
          />
        </div>
      </div>
    </div>
  );
};
