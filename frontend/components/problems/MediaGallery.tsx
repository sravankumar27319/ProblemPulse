'use client';

import React, { useState } from 'react';
import { MediaItem } from '../../types/problem';
import { ImageIcon } from 'lucide-react';

export const MediaGallery: React.FC<{ media?: MediaItem[] }> = ({ media = [] }) => {
  const [selectedIdx, setSelectedIdx] = useState(0);

  if (!media || media.length === 0) {
    return null;
  }

  const currentMedia = media[selectedIdx] || media[0];

  return (
    <div className="space-y-3">
      <h3 className="font-heading text-lg font-medium text-[#14201c] dark:text-[#ece9e1] flex items-center gap-2">
        <ImageIcon className="w-5 h-5 text-[#0f6b4f] dark:text-[#5cc9a0]" />
        <span>Evidence & Media</span>
      </h3>

      {/* Main Image Display */}
      <div className="relative w-full h-80 sm:h-96 rounded-2xl overflow-hidden bg-[#e5e1d8] dark:bg-[#24312b] border border-[#e5e1d8] dark:border-[#24312b]">
        {currentMedia?.mediaType === 'video' ? (
          <video
            src={currentMedia.url}
            controls
            className="w-full h-full object-cover"
          />
        ) : (
          <img
            src={currentMedia?.url}
            alt="Problem evidence"
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
              onClick={() => setSelectedIdx(idx)}
              className={`relative w-20 h-16 rounded-lg overflow-hidden border-2 transition-all shrink-0 ${
                selectedIdx === idx
                  ? 'border-[#0f6b4f] dark:border-[#5cc9a0] scale-105'
                  : 'border-[#e5e1d8] dark:border-[#24312b] opacity-70 hover:opacity-100'
              }`}
            >
              <img src={item.url} alt={`Thumbnail ${idx + 1}`} className="w-full h-full object-cover" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
};
