'use client';

import React from 'react';
import { ProblemCategory } from '../../types/problem';
import { UploadedMediaItem } from '../../services/media.service';
import { LocationData } from './StepLocation';
import { DetailsData } from './StepDetails';
import { CATEGORY_OPTIONS } from './StepCategory';
import {
  Edit3,
  Video,
  Users,
} from 'lucide-react';
import { NearbyProblemMatch } from '../../types/problem';
import { DuplicateInlineAlert } from './DuplicateInlineAlert';
import { Button } from '../ui/Button';

export interface StepReviewProps {
  category: ProblemCategory | null;
  mediaList: UploadedMediaItem[];
  location: LocationData;
  details: DetailsData;
  onJumpToStep: (step: number) => void;
  verifiedDeclaration: boolean;
  onToggleDeclaration: (val: boolean) => void;
  duplicates?: NearbyProblemMatch[];
  isLoadingDuplicates?: boolean;
  onReviewDuplicates?: () => void;
}

export const StepReview: React.FC<StepReviewProps> = ({
  category,
  mediaList,
  location,
  details,
  onJumpToStep,
  verifiedDeclaration,
  onToggleDeclaration,
  duplicates = [],
  isLoadingDuplicates = false,
  onReviewDuplicates,
}) => {
  const categoryInfo = CATEGORY_OPTIONS.find((c) => c.value === category);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-heading text-xl sm:text-2xl font-bold text-[#14201c] dark:text-[#ece9e1]">
          Review Your Problem Report
        </h2>
        <p className="text-sm text-[#5d6b65] dark:text-[#9aa8a1] mt-1">
          Please review all details before final submission. You can jump directly into any section to make edits.
        </p>
      </div>

      {/* Real-time Duplicate Alert if found nearby */}
      {onReviewDuplicates && (
        <DuplicateInlineAlert
          duplicates={duplicates}
          isLoading={isLoadingDuplicates}
          onReviewDuplicates={onReviewDuplicates}
        />
      )}

      <div className="space-y-4">
        {/* 1. Category Review Card */}
        <div className="bg-white dark:bg-[#141d19] p-5 rounded-2xl border border-[#e5e1d8] dark:border-[#24312b] shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="text-xs font-bold text-[#0f6b4f] dark:text-[#5cc9a0] uppercase tracking-wider mb-1">
              Step 1: Category
            </div>
            <h4 className="font-heading font-bold text-lg text-[#14201c] dark:text-[#ece9e1]">
              {categoryInfo?.label || 'Not Selected'}
            </h4>
            <p className="text-xs text-[#5d6b65] dark:text-[#9aa8a1] line-clamp-1 mt-0.5">
              {categoryInfo?.description}
            </p>
          </div>

          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => onJumpToStep(1)}
            leftIcon={<Edit3 className="w-3.5 h-3.5" />}
            className="self-end sm:self-auto shrink-0"
          >
            Edit
          </Button>
        </div>

        {/* 2. Evidence Review Card */}
        <div className="bg-white dark:bg-[#141d19] p-5 rounded-2xl border border-[#e5e1d8] dark:border-[#24312b] shadow-2xs space-y-3">
          <div className="flex items-center justify-between">
            <div className="text-xs font-bold text-[#0f6b4f] dark:text-[#5cc9a0] uppercase tracking-wider">
              Step 2: Evidence ({mediaList.length} Attached)
            </div>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => onJumpToStep(2)}
              leftIcon={<Edit3 className="w-3.5 h-3.5" />}
            >
              Edit
            </Button>
          </div>

          {mediaList.length === 0 ? (
            <p className="text-xs text-[#78716c] dark:text-[#84948c] italic">
              No photo or video evidence attached. (Evidence is optional but highly recommended).
            </p>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-5 gap-3 pt-1">
              {mediaList.map((media) => (
                <div
                  key={media.id}
                  className="relative rounded-lg overflow-hidden border border-[#e5e1d8] dark:border-[#24312b] bg-[#faf8f4] dark:bg-[#1a2520] h-20 flex items-center justify-center group"
                >
                  {media.mediaType === 'video' ? (
                    <div className="relative w-full h-full bg-black/80 flex items-center justify-center">
                      <video src={media.url} className="w-full h-full object-cover opacity-75" />
                      <Video className="w-5 h-5 text-white absolute" />
                    </div>
                  ) : (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={media.url}
                      alt={media.originalName}
                      className="w-full h-full object-cover"
                    />
                  )}
                  <span className="absolute bottom-1 right-1 text-[9px] px-1 py-0.2 bg-black/70 text-white rounded">
                    {media.mediaType}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* 3. Location Review Card */}
        <div className="bg-white dark:bg-[#141d19] p-5 rounded-2xl border border-[#e5e1d8] dark:border-[#24312b] shadow-2xs space-y-3">
          <div className="flex items-center justify-between">
            <div className="text-xs font-bold text-[#0f6b4f] dark:text-[#5cc9a0] uppercase tracking-wider">
              Step 3: Location
            </div>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => onJumpToStep(3)}
              leftIcon={<Edit3 className="w-3.5 h-3.5" />}
            >
              Edit
            </Button>
          </div>

          <div className="space-y-1">
            <p className="font-heading font-semibold text-sm text-[#14201c] dark:text-[#ece9e1]">
              {location.address || 'Address not specified'}
            </p>
            <p className="text-xs text-[#5d6b65] dark:text-[#9aa8a1]">
              {location.area}, {location.city}, {location.state}
            </p>
            <div className="pt-1 text-[11px] text-[#78716c] dark:text-[#84948c] font-mono">
              GPS: {location.latitude.toFixed(5)}, {location.longitude.toFixed(5)}
            </div>
          </div>
        </div>

        {/* 4. Details Review Card */}
        <div className="bg-white dark:bg-[#141d19] p-5 rounded-2xl border border-[#e5e1d8] dark:border-[#24312b] shadow-2xs space-y-4">
          <div className="flex items-center justify-between">
            <div className="text-xs font-bold text-[#0f6b4f] dark:text-[#5cc9a0] uppercase tracking-wider">
              Step 4: Details & Impact
            </div>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => onJumpToStep(4)}
              leftIcon={<Edit3 className="w-3.5 h-3.5" />}
            >
              Edit
            </Button>
          </div>

          <div className="space-y-2">
            <h3 className="font-heading font-bold text-base text-[#14201c] dark:text-[#ece9e1]">
              {details.title || 'Untitled Problem'}
            </h3>
            <p className="text-xs text-[#5d6b65] dark:text-[#9aa8a1] leading-relaxed whitespace-pre-line">
              {details.description || 'No description provided.'}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-4 pt-3 border-t border-[#e5e1d8] dark:border-[#24312b] text-xs">
            <div className="flex items-center gap-1.5">
              <span className="font-semibold text-[#14201c] dark:text-[#ece9e1]">Severity:</span>
              <span className="px-2 py-0.5 rounded-md bg-[#faf8f4] dark:bg-[#1a2520] border border-[#e5e1d8] dark:border-[#24312b] font-bold text-[#0f6b4f] dark:text-[#5cc9a0]">
                {details.severity} / 10
              </span>
            </div>

            <div className="flex items-center gap-1.5">
              <Users className="w-3.5 h-3.5 text-[#5d6b65] dark:text-[#9aa8a1]" />
              <span className="font-semibold text-[#14201c] dark:text-[#ece9e1]">People Affected:</span>
              <span>~{details.peopleAffected.toLocaleString()} citizens</span>
            </div>
          </div>
        </div>
      </div>

      {/* Citizen Verification Declaration */}
      <div className="p-4 bg-[#fbfaf7] dark:bg-[#121b17] rounded-xl border border-[#e5e1d8] dark:border-[#24312b] flex items-start gap-3 cursor-pointer select-none"
        onClick={() => onToggleDeclaration(!verifiedDeclaration)}
      >
        <input
          type="checkbox"
          id="verification-declaration"
          checked={verifiedDeclaration}
          onChange={(e) => onToggleDeclaration(e.target.checked)}
          className="mt-1 w-4 h-4 rounded accent-[#0f6b4f] dark:accent-[#5cc9a0] cursor-pointer"
        />
        <label
          htmlFor="verification-declaration"
          className="text-xs text-[#5d6b65] dark:text-[#9aa8a1] leading-snug cursor-pointer"
        >
          <span className="font-semibold text-[#14201c] dark:text-[#ece9e1] block">
            Citizen Good-Faith Declaration
          </span>
          I confirm that all photos, coordinates, and details submitted represent an accurate and genuine civic issue requiring public works intervention.
        </label>
      </div>
    </div>
  );
};
