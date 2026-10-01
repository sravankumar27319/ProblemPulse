'use client';

import React, { useState } from 'react';
import { AdminDepartment, AssignProblemInput } from '../../types/admin';
import { ProblemCategory } from '../../types/problem';
import { Button } from '../ui/Button';
import {
  Building2,
  X,
  AlertTriangle,
  Send,
  Sparkles,
  MapPin,
  Users,
} from 'lucide-react';

export interface AssignDepartmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (payload: AssignProblemInput) => Promise<void>;
  problemTitle: string;
  problemCategory: ProblemCategory;
  currentDepartmentId?: string | null;
  departments: AdminDepartment[];
}

const CATEGORY_DEPARTMENT_CODE_MAP: Record<ProblemCategory, string> = {
  ROAD: 'ROADS',
  WATER: 'WATER',
  GARBAGE: 'GARBAGE',
  ELECTRICITY: 'ELECTRICITY',
  TRAFFIC: 'TRAFFIC',
  OTHER: 'SANIS',
};

export const AssignDepartmentModal: React.FC<AssignDepartmentModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  problemTitle,
  problemCategory,
  currentDepartmentId,
  departments,
}) => {
  const recommendedCode = CATEGORY_DEPARTMENT_CODE_MAP[problemCategory];
  const recommendedDept = departments.find((d) => d.code === recommendedCode);
  const defaultDeptId = currentDepartmentId || recommendedDept?.id || (departments.length > 0 ? departments[0].id : '');

  const [selectedDeptId, setSelectedDeptId] = useState<string>('');
  const effectiveDeptId = selectedDeptId || defaultDeptId;
  const [zone, setZone] = useState<string>('');
  const [team, setTeam] = useState<string>('');
  const [note, setNote] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!effectiveDeptId) {
      setError('Please select a municipal department to assign.');
      return;
    }

    try {
      setIsSubmitting(true);
      setError(null);
      await onConfirm({
        departmentId: effectiveDeptId,
        zone: zone.trim() || undefined,
        team: team.trim() || undefined,
        note: note.trim() || undefined,
      });
      onClose();
    } catch (err: unknown) {
      const axiosError = err as { response?: { data?: { message?: string } } };
      setError(axiosError?.response?.data?.message || 'Failed to assign department.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="bg-white dark:bg-[#141d19] border border-[#e6e2dc] dark:border-[#24312b] rounded-2xl max-w-xl w-full p-6 shadow-xl space-y-5">
        {/* Header */}
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-purple-500/10 text-purple-600 dark:text-purple-400 flex items-center justify-center shrink-0">
              <Building2 className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-heading font-bold text-lg text-[#1c1917] dark:text-[#ece9e1]">
                Assign Department
              </h3>
              <p className="text-xs text-[#78716c] dark:text-[#9aa8a1]">
                Transition problem from VERIFIED to ASSIGNED and dispatch field crew
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-[#78716c] hover:bg-[#faf8f4] dark:hover:bg-[#1a2621] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Problem Target Preview */}
        <div className="p-3 rounded-lg bg-[#faf8f4] dark:bg-[#0e1512] border border-[#e6e2dc] dark:border-[#24312b] flex items-center justify-between gap-3">
          <div className="min-w-0">
            <span className="text-[11px] font-semibold text-[#78716c] dark:text-[#9aa8a1] uppercase tracking-wider block">
              Problem to Assign
            </span>
            <p className="text-xs font-semibold text-[#1c1917] dark:text-[#ece9e1] truncate">
              {problemTitle}
            </p>
          </div>
          <span className="px-2 py-0.5 rounded-md bg-[#0f6b4f]/10 text-[#0f6b4f] dark:text-[#5cc9a0] text-xs font-semibold shrink-0">
            {problemCategory}
          </span>
        </div>

        {error && (
          <div className="p-3 rounded-lg bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900 text-xs text-red-700 dark:text-red-300 flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Department Selection */}
          <div className="space-y-2">
            <label className="text-xs font-semibold text-[#1c1917] dark:text-[#ece9e1] flex items-center justify-between">
              <span>Select Municipal Department *</span>
              {recommendedDept && (
                <span className="inline-flex items-center gap-1 text-[11px] text-[#0f6b4f] dark:text-[#5cc9a0] font-normal">
                  <Sparkles className="w-3 h-3" />
                  Recommended: {recommendedDept.name}
                </span>
              )}
            </label>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-52 overflow-y-auto pr-1">
              {departments.map((dept) => {
                const isRecommended = dept.code === recommendedCode;
                const isSelected = effectiveDeptId === dept.id;

                return (
                  <div
                    key={dept.id}
                    onClick={() => setSelectedDeptId(dept.id)}
                    className={`p-3 rounded-xl border cursor-pointer text-xs transition-all ${
                      isSelected
                        ? 'border-[#0f6b4f] bg-[#0f6b4f]/10 text-[#0f6b4f] dark:text-[#5cc9a0] shadow-xs'
                        : 'border-[#e6e2dc] dark:border-[#24312b] bg-white dark:bg-[#141d19] hover:bg-[#faf8f4]'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-1 mb-1">
                      <span className="font-semibold text-[#1c1917] dark:text-[#ece9e1] truncate">
                        {dept.name}
                      </span>
                      {isRecommended && (
                        <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-sm bg-[#0f6b4f] text-white shrink-0">
                          Match
                        </span>
                      )}
                    </div>
                    {dept.description && (
                      <p className="text-[11px] text-[#78716c] dark:text-[#9aa8a1] line-clamp-2 leading-relaxed">
                        {dept.description}
                      </p>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Optional Team / Zone Details (e.g. Road damage → Road Maintenance → Zone 3) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
            <div className="space-y-1">
              <label className="text-xs font-semibold text-[#1c1917] dark:text-[#ece9e1] flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5 text-[#78716c]" />
                <span>Zone / Sector <span className="text-[#78716c] font-normal">(optional)</span></span>
              </label>
              <input
                type="text"
                value={zone}
                onChange={(e) => setZone(e.target.value)}
                placeholder="e.g. Zone 3, East Sector"
                className="w-full p-2.5 text-xs rounded-xl border border-[#e6e2dc] dark:border-[#24312b] bg-[#faf8f4] dark:bg-[#0e1512] text-[#1c1917] dark:text-[#ece9e1] placeholder-[#78716c] focus:outline-none focus:ring-1 focus:ring-[#0f6b4f]"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-[#1c1917] dark:text-[#ece9e1] flex items-center gap-1">
                <Users className="w-3.5 h-3.5 text-[#78716c]" />
                <span>Field Team <span className="text-[#78716c] font-normal">(optional)</span></span>
              </label>
              <input
                type="text"
                value={team}
                onChange={(e) => setTeam(e.target.value)}
                placeholder="e.g. Asphalt Rapid Unit"
                className="w-full p-2.5 text-xs rounded-xl border border-[#e6e2dc] dark:border-[#24312b] bg-[#faf8f4] dark:bg-[#0e1512] text-[#1c1917] dark:text-[#ece9e1] placeholder-[#78716c] focus:outline-none focus:ring-1 focus:ring-[#0f6b4f]"
              />
            </div>
          </div>

          {/* Optional Dispatch Note */}
          <div className="space-y-1">
            <label className="text-xs font-semibold text-[#1c1917] dark:text-[#ece9e1] block">
              Dispatch Instructions <span className="text-[#78716c] font-normal">(optional)</span>
            </label>
            <textarea
              rows={2}
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="e.g. Severe sinkhole depth exceeding 40cm. Priority equipment dispatched."
              className="w-full p-2.5 text-xs rounded-xl border border-[#e6e2dc] dark:border-[#24312b] bg-[#faf8f4] dark:bg-[#0e1512] text-[#1c1917] dark:text-[#ece9e1] placeholder-[#78716c] focus:outline-none focus:ring-1 focus:ring-[#0f6b4f]"
            />
          </div>

          <p className="text-[11px] text-[#78716c] dark:text-[#9aa8a1]">
            Status will advance to <strong className="text-[#6b21a8] dark:text-[#d8b4fe]">ASSIGNED</strong> and a notification will be dispatched to citizen stakeholders.
          </p>

          {/* Action Buttons */}
          <div className="flex items-center justify-end gap-3 pt-2">
            <Button
              type="button"
              variant="outline"
              size="md"
              onClick={onClose}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              size="md"
              disabled={isSubmitting || !selectedDeptId}
              className="bg-[#0f6b4f] hover:bg-[#0d5942] text-white gap-1.5"
            >
              <Send className="w-4 h-4" />
              <span>{isSubmitting ? 'Assigning...' : 'Assign & Dispatch'}</span>
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};
