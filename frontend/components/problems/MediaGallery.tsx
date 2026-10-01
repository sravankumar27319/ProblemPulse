'use client';

import React, { useState } from 'react';
import { MediaItem } from '../../types/problem';
import { ImageIcon, ExternalLink, Camera, Video as VideoIcon, FileImage } from 'lucide-react';

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
  const isCurrentError = imageErrorMap[selectedIdx] || !currentMedia?.url;

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
        {currentMedia?.url && !isCurrentError && !currentMedia.url.startsWith('data:') && (
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
      <div className="relative w-full h-80 sm:h-96 rounded-2xl overflow-hidden bg-[#faf8f4] dark:bg-[#121c17] border border-[#e5e1d8] dark:border-[#24312b] flex items-center justify-center">
        {isCurrentError ? (
          <div className="flex flex-col items-center justify-center p-6 text-center space-y-3">
            <div className="w-16 h-16 rounded-2xl bg-[#e3f0ea] dark:bg-[#173026] text-[#0f6b4f] dark:text-[#5cc9a0] flex items-center justify-center shadow-xs">
              {currentMedia?.mediaType === 'video' ? (
                <VideoIcon className="w-8 h-8" />
              ) : (
                <Camera className="w-8 h-8" />
              )}
            </div>
            <div>
              <p className="font-heading font-semibold text-base text-[#14201c] dark:text-[#ece9e1]">
                {currentMedia?.mediaType === 'video' ? 'Video Evidence Recorded' : 'Photo Evidence Attached'}
              </p>
              <p className="text-xs text-[#5d6b65] dark:text-[#9aa8a1] mt-1 max-w-sm">
                Evidence was captured with this problem submission. (Session preview expired for this earlier report; future submissions retain persistent Base64/Cloudinary images).
              </p>
            </div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#ede8dc] dark:bg-[#1f2b25] text-[11px] font-medium text-[#5d6b65] dark:text-[#9aa8a1]">
              <FileImage className="w-3.5 h-3.5" />
              <span>Media ID: {currentMedia?.id?.slice(0, 16) || 'attached'}</span>
            </div>
          </div>
        ) : currentMedia?.mediaType === 'video' ? (
          <video
            src={currentMedia.url}
            controls
            onError={() => handleImageError(selectedIdx)}
            className="w-full h-full object-contain bg-black"
          />
        ) : (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={currentMedia?.url}
            alt="Problem evidence"
            onError={() => handleImageError(selectedIdx)}
            className="w-full h-full object-cover"
          />
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
              className={`relative w-20 h-16 rounded-lg overflow-hidden border-2 transition-all shrink-0 cursor-pointer flex items-center justify-center bg-[#faf8f4] dark:bg-[#121c17] ${
                selectedIdx === idx
                  ? 'border-[#0f6b4f] dark:border-[#5cc9a0] scale-105'
                  : 'border-[#e5e1d8] dark:border-[#24312b] opacity-70 hover:opacity-100'
              }`}
            >
              {imageErrorMap[idx] ? (
                <Camera className="w-5 h-5 text-[#0f6b4f] dark:text-[#5cc9a0]" />
              ) : (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={item.url}
                  alt={`Thumbnail ${idx + 1}`}
                  onError={() => handleImageError(idx)}
                  className="w-full h-full object-cover"
                />
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

