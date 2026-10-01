'use client';

import React, { useState } from 'react';
import { MediaItem } from '../../types/problem';
import { ImageIcon, ExternalLink, AlertCircle } from 'lucide-react';

const FALLBACK_IMAGE =
  'https://images.unsplash.com/photo-1541888946425-d0fbb18615f3?auto=format&fit=crop&w=1200&q=80';

export const MediaGallery: React.FC<{ media?: MediaItem[] }> = ({ media = [] }) => {
  const [selectedIdx, setSelectedIdx] = useState(0);
  const [imageErrorMap, setImageErrorMap] = useState<Record<number, boolean>>({});

  if (!media || media.length === 0) {
    return (
      <div className="p-8 text-center bg-[#faf8f4] dark:bg-[#0e1512] rounded-xl border border-dashed border-[#e6e2dc] dark:border-[#24312b] text-xs text-[#78716c] dark:text-[#9aa8a1]">
        No photo or video evidence uploaded with this report.
      </div>
    );
  }

  const currentMedia = media[selectedIdx] || media[0];
  const isCurrentError = imageErrorMap[selectedIdx];

  const handleImageError = (index: number) => {
    setImageErrorMap((prev) => ({ ...prev, [index]: true }));
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="font-heading text-lg font-medium text-[#14201c] dark:text-[#ece9e1] flex items-center gap-2">
          <ImageIcon className="w-5 h-5 text-[#0f6b4f] dark:text-[#5cc9a0]" />
          <span>Evidence & Media ({media.length})</span>
        </h3>
        {currentMedia?.url && !isCurrentError && (
          <a
            href={currentMedia.url}
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs text-[#0f6b4f] dark:text-[#5cc9a0] hover:underline flex items-center gap-1"
          >
            <span>Open Full Size</span>
            <ExternalLink className="w-3 h-3" />
          </a>
        )}
      </div>

      {/* Main Media Display */}
      <div className="relative w-full h-80 sm:h-96 rounded-2xl overflow-hidden bg-[#e5e1d8] dark:bg-[#24312b] border border-[#e5e1d8] dark:border-[#24312b] flex items-center justify-center">
        {currentMedia?.mediaType === 'video' ? (
          <video
            src={currentMedia.url}
            controls
            className="w-full h-full object-contain bg-black"
          />
        ) : (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={isCurrentError ? FALLBACK_IMAGE : currentMedia?.url}
            alt="Problem evidence"
            onError={() => handleImageError(selectedIdx)}
            className="w-full h-full object-cover"
          />
        )}

        {isCurrentError && (
          <div className="absolute bottom-3 left-3 right-3 p-2 rounded-lg bg-black/70 backdrop-blur-xs text-white text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-amber-400 shrink-0" />
            <span>Uploaded image preview expired — showing representative archive view</span>
          </div>
        )}
      </div>

      {/* Thumbnails if multiple */}
      {media.length > 1 && (
        <div className="flex items-center gap-2.5 overflow-x-auto pb-1">
          {media.map((item, idx) => (
            <button
              key={item.id || idx}
              type="button"
              onClick={() => setSelectedIdx(idx)}
              className={`relative w-20 h-16 rounded-lg overflow-hidden border-2 transition-all shrink-0 cursor-pointer ${
                selectedIdx === idx
                  ? 'border-[#0f6b4f] dark:border-[#5cc9a0] scale-105'
                  : 'border-[#e5e1d8] dark:border-[#24312b] opacity-70 hover:opacity-100'
              }`}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={imageErrorMap[idx] ? FALLBACK_IMAGE : item.url}
                alt={`Thumbnail ${idx + 1}`}
                onError={() => handleImageError(idx)}
                className="w-full h-full object-cover"
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
};
