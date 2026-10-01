'use client';

import React, { useState } from 'react';
import { PriorityBadge } from '../ui/PriorityBadge';
import { StatusPill } from '../ui/StatusPill';
import { MapPin, ThumbsUp, Users, CheckCircle2, Clock, Shield } from 'lucide-react';
import { Button } from '../ui/Button';

export const HeroCardPreview: React.FC = () => {
  const [supportCount, setSupportCount] = useState(86);
  const [hasSupported, setHasSupported] = useState(false);

  const handleSupportToggle = () => {
    if (hasSupported) {
      setSupportCount((prev) => prev - 1);
      setHasSupported(false);
    } else {
      setSupportCount((prev) => prev + 1);
      setHasSupported(true);
    }
  };

  return (
    <div className="w-full max-w-lg mx-auto bg-white rounded-2xl border border-[#e6e2dc] shadow-xl overflow-hidden text-left transform transition-all duration-300 hover:shadow-2xl">
      {/* Top Header Bar */}
      <div className="bg-[#faf8f5] px-5 py-3.5 border-b border-[#e6e2dc] flex items-center justify-between">
        <div className="flex items-center gap-2 text-xs font-semibold text-[#0f6b4f]">
          <Shield className="w-4 h-4" />
          <span>Municipal Case #PR-2026-042</span>
        </div>
        <div className="flex items-center gap-2">
          <PriorityBadge priority="CRITICAL" size="sm" />
          <StatusPill status="IN_PROGRESS" size="sm" />
        </div>
      </div>

      {/* Main Content */}
      <div className="p-5 space-y-4">
        <div>
          <span className="text-[11px] font-bold text-[#78716c] uppercase tracking-wider">
            Water & Sanitation Sector
          </span>
          <h3 className="font-heading font-bold text-xl text-[#1c1917] mt-0.5 leading-snug">
            Severe Water Pipe Leak & Street Flooding
          </h3>
        </div>

        {/* Location Badge */}
        <div className="flex items-center gap-2 text-xs text-[#44403c] bg-[#f5f2eb] px-3 py-2 rounded-lg border border-[#e6e2dc]">
          <MapPin className="w-4 h-4 text-[#0f6b4f] shrink-0" />
          <span className="font-medium truncate">
            452 Commerce Blvd, Central Market • Sector 4
          </span>
        </div>

        {/* Lifecycle Timeline Visual Bar */}
        <div className="space-y-1.5 pt-1">
          <div className="flex items-center justify-between text-[11px] font-semibold text-[#78716c]">
            <span className="text-[#0f6b4f] flex items-center gap-1">
              <Clock className="w-3 h-3" /> Step 5 of 8: Field Repair
            </span>
            <span>Est. Completion: 4 hours</span>
          </div>

          {/* Progress Bar */}
          <div className="h-2 w-full bg-[#e6e2dc] rounded-full overflow-hidden flex">
            <div className="h-full bg-[#0f6b4f] w-[62%] rounded-full transition-all duration-500" />
          </div>

          <div className="flex items-center justify-between text-[10px] text-[#a8a29e] pt-0.5">
            <span className="text-[#0f6b4f] font-semibold">Submitted</span>
            <span className="text-[#0f6b4f] font-semibold">Verified</span>
            <span className="text-[#0f6b4f] font-semibold">Assigned</span>
            <span className="text-[#1c1917] font-bold">In Progress</span>
            <span>Resolved</span>
          </div>
        </div>

        {/* Footer Interaction Bar */}
        <div className="pt-3 border-t border-[#e6e2dc] flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs text-[#78716c]">
            <div className="flex -space-x-1.5 overflow-hidden">
              <div className="w-6 h-6 rounded-full bg-[#0f6b4f] text-white flex items-center justify-center text-[10px] font-bold ring-2 ring-white">
                JD
              </div>
              <div className="w-6 h-6 rounded-full bg-[#ea580c] text-white flex items-center justify-center text-[10px] font-bold ring-2 ring-white">
                SK
              </div>
              <div className="w-6 h-6 rounded-full bg-[#16a34a] text-white flex items-center justify-center text-[10px] font-bold ring-2 ring-white">
                AM
              </div>
            </div>
            <span className="font-medium text-[#44403c]">14 Citizens Reported</span>
          </div>

          {/* Interactive Support Button */}
          <Button
            variant={hasSupported ? 'primary' : 'secondary'}
            size="sm"
            onClick={handleSupportToggle}
            leftIcon={<ThumbsUp className={`w-3.5 h-3.5 ${hasSupported ? 'fill-current' : ''}`} />}
          >
            {hasSupported ? 'Supported' : 'Support Issue'} ({supportCount})
          </Button>
        </div>
      </div>
    </div>
  );
};
