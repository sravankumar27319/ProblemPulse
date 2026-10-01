'use client';

import React, { useState, useRef } from 'react';
import { mediaService, UploadedMediaItem } from '../../services/media.service';
import {
  UploadCloud,
  X,
  FileImage,
  Video,
  AlertCircle,
  Loader2,
  CheckCircle,
  ShieldAlert,
} from 'lucide-react';
import { Button } from '../ui/Button';

export interface StepEvidenceProps {
  mediaList: UploadedMediaItem[];
  onChange: (mediaList: UploadedMediaItem[]) => void;
}

interface UploadProgressItem {
  id: string;
  name: string;
  size: number;
  progress: number;
  error?: string;
}

export const StepEvidence: React.FC<StepEvidenceProps> = ({
  mediaList,
  onChange,
}) => {
  const [uploadingFiles, setUploadingFiles] = useState<UploadProgressItem[]>([]);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isDragOver, setIsDragOver] = useState<boolean>(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const MAX_FILES = 5;
  const MAX_IMAGE_SIZE = 15 * 1024 * 1024; // 15MB
  const MAX_VIDEO_SIZE = 50 * 1024 * 1024; // 50MB

  const handleFiles = async (files: FileList | File[]) => {
    setErrorMessage(null);
    const fileArray = Array.from(files);

    if (mediaList.length + fileArray.length > MAX_FILES) {
      setErrorMessage(`You can upload a maximum of ${MAX_FILES} evidence photos or videos.`);
      return;
    }

    let currentList = [...mediaList];

    for (const file of fileArray) {
      const isImage = file.type.startsWith('image/');
      const isVideo = file.type.startsWith('video/');

      if (!isImage && !isVideo) {
        setErrorMessage(`File "${file.name}" is not a supported image or video format.`);
        continue;
      }

      if (isImage && file.size > MAX_IMAGE_SIZE) {
        setErrorMessage(`Image "${file.name}" exceeds the 15MB limit.`);
        continue;
      }

      if (isVideo && file.size > MAX_VIDEO_SIZE) {
        setErrorMessage(`Video "${file.name}" exceeds the 50MB limit.`);
        continue;
      }

      const tempId = `upload_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
      
      // Track in uploading list
      setUploadingFiles((prev) => [
        ...prev,
        { id: tempId, name: file.name, size: file.size, progress: 10 },
      ]);

      try {
        const uploadedItem = await mediaService.uploadDirectToCloudinary(
          file,
          (percent) => {
            setUploadingFiles((prev) =>
              prev.map((item) =>
                item.id === tempId ? { ...item, progress: percent } : item
              )
            );
          }
        );

        // Remove from progress list and append to mediaList
        setUploadingFiles((prev) => prev.filter((item) => item.id !== tempId));
        currentList = [...currentList, uploadedItem];
        onChange(currentList);
      } catch (err: any) {
        setUploadingFiles((prev) => prev.filter((item) => item.id !== tempId));
        setErrorMessage(err.message || 'Upload failed. Please try another file.');
      }
    }
  };

  const handleRemoveMedia = (id: string) => {
    onChange(mediaList.filter((m) => m.id !== id));
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFiles(e.dataTransfer.files);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024 * 1024) {
      return `${(bytes / 1024).toFixed(1)} KB`;
    }
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-heading text-xl sm:text-2xl font-bold text-[#14201c] dark:text-[#ece9e1]">
          Upload Photo or Video Evidence
        </h2>
        <p className="text-sm text-[#5d6b65] dark:text-[#9aa8a1] mt-1">
          Visual evidence accelerates verification by 4x. Upload photos or short videos clearly showing the problem and its surroundings.
        </p>
      </div>

      {errorMessage && (
        <div className="p-3 bg-[#fdf2f2] dark:bg-[#2d1716] border border-[#f8b4b4] dark:border-[#5c2423] rounded-lg text-xs text-[#c8371d] dark:text-[#ff8a70] flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* Upload Drag & Drop Area */}
      <div
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onClick={() => fileInputRef.current?.click()}
        className={`border-2 border-dashed rounded-2xl p-8 text-center cursor-pointer transition-all duration-200 flex flex-col items-center justify-center min-h-[200px] ${
          isDragOver
            ? 'border-[#0f6b4f] dark:border-[#5cc9a0] bg-[#eef7f3] dark:bg-[#132720]'
            : 'border-[#d6d0c4] dark:border-[#384c42] bg-white dark:bg-[#141d19] hover:border-[#0f6b4f] dark:hover:border-[#5cc9a0] hover:bg-[#faf8f4] dark:hover:bg-[#18231e]'
        }`}
      >
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept="image/*,video/*"
          className="hidden"
          onChange={(e) => {
            if (e.target.files) handleFiles(e.target.files);
          }}
        />

        <div className="w-14 h-14 rounded-2xl bg-[#e3f0ea] dark:bg-[#173026] text-[#0f6b4f] dark:text-[#5cc9a0] flex items-center justify-center mb-3 shadow-xs">
          <UploadCloud className="w-7 h-7" />
        </div>

        <p className="font-heading font-semibold text-base text-[#14201c] dark:text-[#ece9e1]">
          Click to upload or drag & drop files here
        </p>
        <p className="text-xs text-[#5d6b65] dark:text-[#9aa8a1] mt-1 max-w-md">
          Supports PNG, JPG, WEBP (up to 15MB) and MP4, WEBM (up to 50MB). Direct signed upload from browser to Cloudinary.
        </p>

        <div className="mt-4 flex items-center gap-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={(e) => {
              e.stopPropagation();
              fileInputRef.current?.click();
            }}
          >
            Browse Device Files
          </Button>
          <span className="text-[11px] text-[#78716c] dark:text-[#84948c]">
            ({mediaList.length}/{MAX_FILES} attached)
          </span>
        </div>
      </div>

      {/* In-flight Uploading Progress */}
      {uploadingFiles.length > 0 && (
        <div className="space-y-2">
          <h4 className="text-xs font-semibold text-[#5d6b65] dark:text-[#9aa8a1] uppercase tracking-wider">
            Uploading directly to Cloudinary...
          </h4>
          <div className="space-y-2">
            {uploadingFiles.map((f) => (
              <div
                key={f.id}
                className="p-3 bg-white dark:bg-[#141d19] border border-[#e5e1d8] dark:border-[#24312b] rounded-xl flex items-center justify-between gap-3 text-xs"
              >
                <div className="flex items-center gap-2 truncate">
                  <Loader2 className="w-4 h-4 text-[#0f6b4f] dark:text-[#5cc9a0] animate-spin shrink-0" />
                  <span className="truncate font-medium text-[#14201c] dark:text-[#ece9e1]">
                    {f.name}
                  </span>
                  <span className="text-[11px] text-[#78716c] dark:text-[#84948c] shrink-0">
                    ({formatFileSize(f.size)})
                  </span>
                </div>

                <div className="flex items-center gap-2 shrink-0 w-32">
                  <div className="w-full bg-[#e5e1d8] dark:bg-[#24312b] rounded-full h-1.5 overflow-hidden">
                    <div
                      className="bg-[#0f6b4f] dark:bg-[#5cc9a0] h-full rounded-full transition-all duration-200"
                      style={{ width: `${f.progress}%` }}
                    />
                  </div>
                  <span className="font-semibold text-[11px] text-[#0f6b4f] dark:text-[#5cc9a0]">
                    {f.progress}%
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Uploaded Media Gallery List */}
      {mediaList.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="text-xs font-semibold text-[#14201c] dark:text-[#ece9e1] uppercase tracking-wider flex items-center gap-1.5">
              <CheckCircle className="w-3.5 h-3.5 text-[#0f6b4f] dark:text-[#5cc9a0]" />
              Attached Evidence ({mediaList.length})
            </h4>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {mediaList.map((item) => (
              <div
                key={item.id}
                className="group relative bg-white dark:bg-[#141d19] border border-[#e5e1d8] dark:border-[#24312b] rounded-xl overflow-hidden shadow-2xs hover:shadow-xs transition-shadow"
              >
                <div className="h-32 w-full bg-[#f0ede6] dark:bg-[#1a2520] relative overflow-hidden flex items-center justify-center">
                  {item.mediaType === 'video' ? (
                    <div className="relative w-full h-full flex items-center justify-center bg-black/80">
                      <video
                        src={item.url}
                        className="w-full h-full object-cover opacity-80"
                        controls={false}
                      />
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div className="w-10 h-10 rounded-full bg-black/60 text-white flex items-center justify-center backdrop-blur-xs">
                          <Video className="w-5 h-5" />
                        </div>
                      </div>
                    </div>
                  ) : (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={item.url}
                      alt={item.originalName || 'Evidence preview'}
                      className="w-full h-full object-cover"
                    />
                  )}

                  {/* Badge */}
                  <div className="absolute top-2 left-2 px-2 py-0.5 rounded-md bg-black/60 text-white text-[10px] font-medium backdrop-blur-xs flex items-center gap-1">
                    {item.mediaType === 'video' ? (
                      <>
                        <Video className="w-3 h-3" />
                        <span>VIDEO</span>
                      </>
                    ) : (
                      <>
                        <FileImage className="w-3 h-3" />
                        <span>PHOTO</span>
                      </>
                    )}
                  </div>

                  {/* Remove Button */}
                  <button
                    type="button"
                    onClick={() => handleRemoveMedia(item.id)}
                    className="absolute top-2 right-2 w-7 h-7 rounded-full bg-black/60 hover:bg-red-600 text-white flex items-center justify-center backdrop-blur-xs transition-colors cursor-pointer"
                    title="Remove evidence"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                <div className="p-2.5 flex items-center justify-between text-xs">
                  <span className="font-medium text-[#14201c] dark:text-[#ece9e1] truncate max-w-[170px]">
                    {item.originalName || 'Evidence file'}
                  </span>
                  {item.size ? (
                    <span className="text-[11px] text-[#78716c] dark:text-[#84948c] shrink-0">
                      {formatFileSize(item.size)}
                    </span>
                  ) : null}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Helpful Guidelines Card */}
      <div className="p-4 bg-[#fbfaf7] dark:bg-[#121b17] border border-[#e5e1d8] dark:border-[#24312b] rounded-xl flex items-start gap-3">
        <ShieldAlert className="w-5 h-5 text-[#0f6b4f] dark:text-[#5cc9a0] shrink-0 mt-0.5" />
        <div className="text-xs text-[#5d6b65] dark:text-[#9aa8a1] space-y-1">
          <p className="font-semibold text-[#14201c] dark:text-[#ece9e1]">
            Tips for effective evidence:
          </p>
          <ul className="list-disc list-inside space-y-0.5">
            <li>Take at least one wide-angle shot showing the landmark/street sign.</li>
            <li>Take one close-up shot showing the exact severity or depth of damage.</li>
            <li>Ensure photos are well-lit and avoid blurred motion.</li>
          </ul>
        </div>
      </div>
    </div>
  );
};
