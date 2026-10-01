'use client';

import React, { useState, useRef } from 'react';
import { ResolveProblemInput } from '../../types/admin';
import { mediaService } from '../../services/media.service';
import { Button } from '../ui/Button';
import {
  CheckCircle2,
  X,
  Upload,
  Video as VideoIcon,
  Trash2,
  AlertTriangle,
  Loader2,
  Sparkles,
} from 'lucide-react';

export interface ResolveModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (payload: ResolveProblemInput) => Promise<void>;
  problemTitle: string;
  problemCategory: string;
  departmentName?: string | null;
}

export const ResolveModal: React.FC<ResolveModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  problemTitle,
  problemCategory,
  departmentName,
}) => {
  const [description, setDescription] = useState<string>('');
  const [proofMedia, setProofMedia] = useState<Array<{
    url: string;
    publicId?: string;
    mediaType: 'image' | 'video';
    originalName?: string;
  }>>([]);
  const [isUploading, setIsUploading] = useState<boolean>(false);
  const [uploadProgress, setUploadProgress] = useState<number>(0);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setError(null);
    setIsUploading(true);
    setUploadProgress(0);

    try {
      const newItems: typeof proofMedia = [];
      const fileList = Array.from(files);

      for (let i = 0; i < fileList.length; i++) {
        const file = fileList[i];
        const uploaded = await mediaService.uploadDirectToCloudinary(file, (percent) => {
          setUploadProgress(percent);
        });

        newItems.push({
          url: uploaded.url,
          publicId: uploaded.publicId,
          mediaType: uploaded.mediaType,
          originalName: uploaded.originalName,
        });
      }

      setProofMedia((prev) => [...prev, ...newItems]);
    } catch {
      setError('Failed to upload proof media. Please try again.');
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleRemoveMedia = (index: number) => {
    setProofMedia((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!description.trim()) {
      setError('Please provide a resolution description.');
      return;
    }

    if (description.trim().length < 10) {
      setError('Resolution description must be at least 10 characters.');
      return;
    }

    try {
      setIsSubmitting(true);
      setError(null);
      await onConfirm({
        description: description.trim(),
        proofMedia: proofMedia.map((m) => ({
          url: m.url,
          publicId: m.publicId,
          mediaType: m.mediaType,
        })),
      });
      onClose();
    } catch (err: unknown) {
      const axiosError = err as { response?: { data?: { message?: string } } };
      setError(axiosError?.response?.data?.message || 'Failed to submit problem resolution.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="bg-white dark:bg-[#141d19] border border-[#e6e2dc] dark:border-[#24312b] rounded-2xl max-w-xl w-full p-6 shadow-xl space-y-5 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
              <CheckCircle2 className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-heading font-bold text-lg text-[#1c1917] dark:text-[#ece9e1]">
                Mark Problem Resolved
              </h3>
              <p className="text-xs text-[#78716c] dark:text-[#9aa8a1]">
                Phase 23 Resolution System: Submit proof of work and completed repair details
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
        <div className="p-3.5 rounded-xl bg-[#faf8f4] dark:bg-[#0e1512] border border-[#e6e2dc] dark:border-[#24312b] space-y-1">
          <div className="flex items-center justify-between gap-2">
            <span className="text-[11px] font-semibold text-[#78716c] dark:text-[#9aa8a1] uppercase tracking-wider">
              Resolving Problem
            </span>
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 rounded-md bg-[#0f6b4f]/10 text-[#0f6b4f] dark:text-[#5cc9a0] text-xs font-semibold">
                {problemCategory}
              </span>
              {departmentName && (
                <span className="text-xs text-[#78716c] dark:text-[#9aa8a1]">
                  • {departmentName}
                </span>
              )}
            </div>
          </div>
          <p className="text-xs font-semibold text-[#1c1917] dark:text-[#ece9e1] line-clamp-1">
            {problemTitle}
          </p>
        </div>

        {error && (
          <div className="p-3 rounded-lg bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900 text-xs text-red-700 dark:text-red-300 flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Resolution Description */}
          <div className="space-y-1">
            <label className="text-xs font-semibold text-[#1c1917] dark:text-[#ece9e1] flex items-center justify-between">
              <span>Resolution Summary & Work Description *</span>
              <span className="text-[11px] text-[#78716c] dark:text-[#9aa8a1] font-normal">
                Min 10 characters
              </span>
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={4}
              required
              placeholder="Detail the repairs completed by municipal crews, equipment used, and current safe condition of the area..."
              className="w-full px-3 py-2 text-xs rounded-xl border border-[#e6e2dc] dark:border-[#24312b] bg-white dark:bg-[#0e1512] text-[#1c1917] dark:text-[#ece9e1] placeholder-[#78716c] focus:outline-none focus:ring-1 focus:ring-[#0f6b4f]"
            />
            <p className="text-[11px] text-[#78716c] dark:text-[#9aa8a1]">
              This description will be published on the problem page and shared with reporters for community verification.
            </p>
          </div>

          {/* Proof of Work Media Upload */}
          <div className="space-y-2">
            <label className="text-xs font-semibold text-[#1c1917] dark:text-[#ece9e1] flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
                <span>Upload After-Photos / Video Proof</span>
              </span>
              <span className="text-[11px] text-[#78716c] dark:text-[#9aa8a1] font-normal">
                Photos or videos showing repaired site
              </span>
            </label>

            {/* Dropzone */}
            <div
              onClick={() => fileInputRef.current?.click()}
              className="border-2 border-dashed border-[#e6e2dc] dark:border-[#24312b] rounded-xl p-4 text-center cursor-pointer hover:border-[#0f6b4f] dark:hover:border-[#0fa56c] transition-colors bg-[#faf8f4]/60 dark:bg-[#0e1512]/60"
            >
              <input
                ref={fileInputRef}
                type="file"
                multiple
                accept="image/*,video/*"
                onChange={handleFileChange}
                className="hidden"
              />
              <div className="flex flex-col items-center gap-1.5">
                <div className="w-8 h-8 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
                  {isUploading ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Upload className="w-4 h-4" />
                  )}
                </div>
                <span className="text-xs font-semibold text-[#1c1917] dark:text-[#ece9e1]">
                  {isUploading
                    ? `Uploading proof (${uploadProgress}%)...`
                    : 'Click to upload proof photos or video'}
                </span>
                <span className="text-[10px] text-[#78716c] dark:text-[#9aa8a1]">
                  Supports JPG, PNG, WebP, MP4, MOV (max 50MB)
                </span>
              </div>
            </div>

            {/* Uploaded Proof Preview List */}
            {proofMedia.length > 0 && (
              <div className="space-y-1.5 pt-1">
                <span className="text-[11px] font-semibold text-[#78716c] dark:text-[#9aa8a1] uppercase tracking-wider block">
                  Attached Proof Evidence ({proofMedia.length})
                </span>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {proofMedia.map((m, idx) => (
                    <div
                      key={idx}
                      className="group relative rounded-xl border border-[#e6e2dc] dark:border-[#24312b] overflow-hidden bg-white dark:bg-[#141d19] shadow-xs"
                    >
                      {m.mediaType === 'video' ? (
                        <div className="h-20 bg-black flex items-center justify-center">
                          <VideoIcon className="w-6 h-6 text-white/80" />
                        </div>
                      ) : (
                        <div
                          className="h-20 bg-cover bg-center"
                          style={{ backgroundImage: `url(${m.url})` }}
                        />
                      )}
                      <div className="p-1.5 flex items-center justify-between text-[10px]">
                        <span className="truncate max-w-[80px] text-[#78716c] dark:text-[#9aa8a1]">
                          {m.originalName || `Proof #${idx + 1}`}
                        </span>
                        <button
                          type="button"
                          onClick={() => handleRemoveMedia(idx)}
                          className="p-1 text-red-500 hover:text-red-700 rounded transition-colors"
                          title="Remove media"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Footer Actions */}
          <div className="flex items-center justify-end gap-2 pt-3 border-t border-[#e6e2dc] dark:border-[#24312b]">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={onClose}
              disabled={isSubmitting || isUploading}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              size="sm"
              disabled={isSubmitting || isUploading || description.trim().length < 10}
              className="bg-emerald-600 hover:bg-emerald-700 text-white gap-1.5 shadow-xs"
            >
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>{isSubmitting ? 'Resolving...' : 'Confirm Resolution'}</span>
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};
