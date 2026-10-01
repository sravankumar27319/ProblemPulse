'use client';

import React from 'react';
import { Input } from '../ui/Input';
import {
  FileText,
  AlertTriangle,
  Users,
  Flame,
  Info,
} from 'lucide-react';

export interface DetailsData {
  title: string;
  description: string;
  severity: number;
  peopleAffected: number;
}

export interface StepDetailsProps {
  data: DetailsData;
  onChange: (data: DetailsData) => void;
}

const SEVERITY_LEVELS: { [key: number]: { label: string; desc: string; color: string; bg: string } } = {
  1: { label: 'Negligible', desc: 'Minor cosmetic flaw, no safety risk', color: '#16a34a', bg: '#dcfce7' },
  2: { label: 'Minor', desc: 'Small inconvenience to pedestrians', color: '#16a34a', bg: '#dcfce7' },
  3: { label: 'Low Impact', desc: 'Noticeable issue, normal flow slowed', color: '#16a34a', bg: '#dcfce7' },
  4: { label: 'Moderate', desc: 'Recurring disturbance or mild hazard', color: '#ca8a04', bg: '#fef9c3' },
  5: { label: 'Substantial', desc: 'Direct hindrance to transit or water supply', color: '#ca8a04', bg: '#fef9c3' },
  6: { label: 'High Priority', desc: 'Significant disruption across the neighborhood', color: '#ea580c', bg: '#ffedd5' },
  7: { label: 'Major Hazard', desc: 'Risk of vehicle damage or water contamination', color: '#ea580c', bg: '#ffedd5' },
  8: { label: 'Severe Danger', desc: 'Imminent injury risk or large-scale utility outage', color: '#dc2626', bg: '#fee2e2' },
  9: { label: 'Urgent Crisis', desc: 'Severe structural danger or public health risk', color: '#dc2626', bg: '#fee2e2' },
  10: { label: 'Critical Emergency', desc: 'Immediate catastrophic danger to life or safety', color: '#991b1b', bg: '#fee2e2' },
};

const PEOPLE_PRESETS = [
  { label: 'A few (~5)', value: 5 },
  { label: 'Street (~25)', value: 25 },
  { label: 'Block (~100)', value: 100 },
  { label: 'Sector (~500)', value: 500 },
  { label: 'Entire Area (1000+)', value: 1000 },
];

export const StepDetails: React.FC<StepDetailsProps> = ({
  data,
  onChange,
}) => {
  const currentSeverity = SEVERITY_LEVELS[data.severity] || SEVERITY_LEVELS[5];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-heading text-xl sm:text-2xl font-bold text-[#14201c] dark:text-[#ece9e1]">
          Problem Details & Impact
        </h2>
        <p className="text-sm text-[#5d6b65] dark:text-[#9aa8a1] mt-1">
          Provide a clear title and description. Calibrate the severity and estimated number of affected citizens.
        </p>
      </div>

      <div className="bg-white dark:bg-[#141d19] p-6 rounded-2xl border border-[#e5e1d8] dark:border-[#24312b] shadow-xs space-y-6">
        {/* Title Input */}
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label className="text-sm font-semibold text-[#14201c] dark:text-[#ece9e1]">
              Problem Title <span className="text-[#0f6b4f] dark:text-[#5cc9a0]">*</span>
            </label>
            <span className="text-xs text-[#78716c] dark:text-[#84948c]">
              {data.title.length}/100 characters
            </span>
          </div>
          <Input
            placeholder="e.g. Broken road, street light not working, water leakage"
            value={data.title}
            onChange={(e) => onChange({ ...data, title: e.target.value })}
            maxLength={100}
            required
          />
          <p className="text-[11px] text-[#78716c] dark:text-[#84948c] mt-1">
            A quick summary of the issue.
          </p>
        </div>

        {/* Description Textarea */}
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label className="text-sm font-semibold text-[#14201c] dark:text-[#ece9e1]">
              Description <span className="text-[#0f6b4f] dark:text-[#5cc9a0]">*</span>
            </label>
            <span className="text-xs text-[#78716c] dark:text-[#84948c]">
              {data.description.length}/1000 characters
            </span>
          </div>
          <textarea
            rows={4}
            placeholder="Explain what is happening, how long it has persisted, visible risks to pedestrians or vehicles, and any previous attempts to resolve..."
            value={data.description}
            onChange={(e) => onChange({ ...data, description: e.target.value })}
            maxLength={1000}
            className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-[#d6d0c4] dark:border-[#384c42] bg-[#faf8f4] dark:bg-[#101915] text-[#14201c] dark:text-[#ece9e1] placeholder-[#9aa8a1] focus:outline-hidden focus:ring-2 focus:ring-[#0f6b4f] focus:border-transparent transition-all resize-y"
          />
        </div>

        {/* Severity Scale 1 - 10 */}
        <div className="pt-4 border-t border-[#e5e1d8] dark:border-[#24312b] space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Flame className="w-4 h-4 text-[#ea580c]" />
              <label className="text-sm font-semibold text-[#14201c] dark:text-[#ece9e1]">
                Problem Severity Level
              </label>
            </div>

            <div
              className="px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 border"
              style={{
                backgroundColor: currentSeverity.bg,
                color: currentSeverity.color,
                borderColor: `${currentSeverity.color}40`,
              }}
            >
              <span>Score {data.severity}/10</span>
              <span>—</span>
              <span>{currentSeverity.label}</span>
            </div>
          </div>

          <p className="text-xs text-[#5d6b65] dark:text-[#9aa8a1]">
            {currentSeverity.desc}
          </p>

          {/* 1-10 Button Grid */}
          <div className="grid grid-cols-10 gap-1.5 pt-1">
            {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((num) => {
              const isSelected = data.severity === num;
              return (
                <button
                  key={num}
                  type="button"
                  onClick={() => onChange({ ...data, severity: num })}
                  className={`py-2 rounded-lg font-bold text-xs transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-[#0f6b4f] dark:bg-[#5cc9a0] text-white dark:text-[#0e1512] shadow-sm transform scale-105 ring-2 ring-[#0f6b4f]/30'
                      : 'bg-[#faf8f4] dark:bg-[#1a2520] text-[#5d6b65] dark:text-[#84948c] border border-[#e5e1d8] dark:border-[#24312b] hover:bg-[#eae6dc] dark:hover:bg-[#25362e]'
                  }`}
                >
                  {num}
                </button>
              );
            })}
          </div>

          {/* Slider input */}
          <input
            type="range"
            min={1}
            max={10}
            step={1}
            value={data.severity}
            onChange={(e) => onChange({ ...data, severity: parseInt(e.target.value, 10) })}
            className="w-full accent-[#0f6b4f] dark:accent-[#5cc9a0] cursor-pointer"
          />
        </div>

        {/* People Affected Estimator */}
        <div className="pt-4 border-t border-[#e5e1d8] dark:border-[#24312b] space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Users className="w-4 h-4 text-[#0f6b4f] dark:text-[#5cc9a0]" />
              <label className="text-sm font-semibold text-[#14201c] dark:text-[#ece9e1]">
                Estimated People Affected
              </label>
            </div>
            <span className="font-heading font-bold text-base text-[#0f6b4f] dark:text-[#5cc9a0]">
              ~{data.peopleAffected.toLocaleString()} citizens
            </span>
          </div>

          {/* Preset Buttons */}
          <div className="flex flex-wrap gap-2">
            {PEOPLE_PRESETS.map((preset) => (
              <button
                key={preset.value}
                type="button"
                onClick={() => onChange({ ...data, peopleAffected: preset.value })}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer ${
                  data.peopleAffected === preset.value
                    ? 'bg-[#0f6b4f] text-white dark:bg-[#5cc9a0] dark:text-[#0e1512] font-semibold'
                    : 'bg-[#faf8f4] dark:bg-[#1a2520] border border-[#e5e1d8] dark:border-[#24312b] text-[#5d6b65] dark:text-[#84948c] hover:bg-[#eae6dc] dark:hover:bg-[#25362e]'
                }`}
              >
                {preset.label}
              </button>
            ))}
          </div>

          {/* Custom numeric input */}
          <div className="pt-1">
            <Input
              type="number"
              min={1}
              max={100000}
              placeholder="Or enter custom number of affected people"
              value={data.peopleAffected || ''}
              onChange={(e) =>
                onChange({
                  ...data,
                  peopleAffected: Math.max(1, parseInt(e.target.value, 10) || 1),
                })
              }
            />
          </div>
        </div>
      </div>
    </div>
  );
};
