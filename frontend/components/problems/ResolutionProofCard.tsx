'use client';

import React, { useState } from 'react';
import { ResolutionDetail } from '../../types/problem';
import { Card } from '../ui/Card';
import { formatDate } from '../../utils/formatters';
import {
  CheckCircle2,
  Calendar,
  Sparkles,
  ExternalLink,
  RotateCcw,
  CheckCheck,
} from 'lucide-react';

export interface ResolutionProofCardProps {
  resolution: ResolutionDetail;
  className?: string;
}

export const ResolutionProofCard: React.FC<ResolutionProofCardProps> = ({
  resolution,
  className = '',
}) => {
  const [selectedMedia, setSelectedMedia] = useState<string | null>(null);

  return (
    <Card
      className={`p-6 bg-gradient-to-br from-emerald-50/70 via-white to-emerald-50/30 dark:from-emerald-950/20 dark:via-[#141d19] dark:to-emerald-950/10 border-2 border-emerald-500/30 shadow-xs space-y-4 ${className}`}
    >
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-emerald-200/60 dark:border-emerald-900/60 pb-3">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
            <CheckCircle2 className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-heading text-base font-bold text-emerald-950 dark:text-emerald-200">
                Municipal Resolution & Proof of Work
              </h3>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800">
                RESOLVED
              </span>
            </div>
            <p className="text-[11px] text-[#78716c] dark:text-[#9aa8a1]">
              Official public record of completed municipal field repairs
            </p>
          </div>
        </div>

        {/* Resolved Date */}
        <div className="flex items-center gap-1.5 text-xs text-[#78716c] dark:text-[#9aa8a1] self-start sm:self-auto">
          <Calendar className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
          <span>Resolved {formatDate(resolution.resolvedAt)}</span>
        </div>
      </div>

      {/* Reopened or Verified Badges */}
      {resolution.isReopened && (
        <div className="p-3 rounded-xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900 text-xs text-amber-800 dark:text-amber-300 flex items-center gap-2">
          <RotateCcw className="w-4 h-4 shrink-0" />
          <span>This issue was previously marked resolved but reopened following field or citizen review.</span>
        </div>
      )}

      {resolution.communityVerifiedAt && (
        <div className="p-3 rounded-xl bg-teal-50 dark:bg-teal-950/30 border border-teal-200 dark:border-teal-900 text-xs text-teal-800 dark:text-teal-300 flex items-center gap-2">
          <CheckCheck className="w-4 h-4 shrink-0 text-teal-600" />
          <span>Citizen community verified this resolution on {formatDate(resolution.communityVerifiedAt)}.</span>
        </div>
      )}

      {/* Description of Work Done */}
      <div className="space-y-1.5">
        <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-800 dark:text-emerald-400 flex items-center gap-1">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Work Report & Repairs Description</span>
        </span>
        <p className="text-xs sm:text-sm text-[#1c1917] dark:text-[#ece9e1] leading-relaxed bg-white/80 dark:bg-[#0e1512]/60 p-4 rounded-xl border border-emerald-100 dark:border-emerald-900/40">
          {resolution.description}
        </p>
      </div>

      {/* Proof Media Gallery */}
      {resolution.proofMedia && resolution.proofMedia.length > 0 && (
        <div className="space-y-2 pt-2 border-t border-emerald-200/40 dark:border-emerald-900/30">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-800 dark:text-emerald-400">
              After-Repair Proof Evidence ({resolution.proofMedia.length})
            </span>
            <span className="text-[10px] text-[#78716c] dark:text-[#9aa8a1]">
              Uploaded by municipal field team
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
            {resolution.proofMedia.map((media, idx) => {
              const isVideo = media.mediaType === 'video' || media.url.endsWith('.mp4');

              return (
                <div
                  key={media.id || idx}
                  onClick={() => setSelectedMedia(media.url)}
                  className="group relative rounded-xl border border-emerald-200 dark:border-emerald-900 overflow-hidden bg-white dark:bg-[#0e1512] cursor-pointer hover:shadow-md transition-all aspect-video flex items-center justify-center"
                >
                  {isVideo ? (
                    <video
                      src={media.url}
                      className="w-full h-full object-cover"
                      muted
                      preload="metadata"
                    />
                  ) : (
                    <img
                      src={media.url}
                      alt={`Resolution Proof #${idx + 1}`}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                    />
                  )}

                  <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white text-xs font-semibold gap-1">
                    <ExternalLink className="w-3.5 h-3.5" />
                    <span>View Proof</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Lightbox Modal */}
      {selectedMedia && (
        <div
          onClick={() => setSelectedMedia(null)}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xs animate-in fade-in"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="relative max-w-3xl w-full max-h-[85vh] bg-[#141d19] rounded-2xl overflow-hidden p-2 flex flex-col items-center"
          >
            <button
              onClick={() => setSelectedMedia(null)}
              className="absolute top-3 right-3 z-10 p-1.5 rounded-full bg-black/60 text-white hover:bg-black"
            >
              ✕
            </button>
            {selectedMedia.endsWith('.mp4') ? (
              <video src={selectedMedia} controls autoPlay className="max-h-[80vh] w-auto rounded-lg" />
            ) : (
              <img src={selectedMedia} alt="Resolution Proof" className="max-h-[80vh] w-auto object-contain rounded-lg" />
            )}
          </div>
        </div>
      )}
    </Card>
  );
};
