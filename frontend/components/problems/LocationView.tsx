import React from 'react';
import { MapPin, Navigation } from 'lucide-react';
import { Card } from '../ui/Card';

export const LocationView: React.FC<{
  address: string;
  area: string;
  city: string;
  state?: string;
  latitude: number;
  longitude: number;
}> = ({ address, area, city, state, latitude, longitude }) => {
  return (
    <Card className="p-5 space-y-3 bg-white dark:bg-[#141d19] border border-[#e5e1d8] dark:border-[#24312b]">
      <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-[#0f6b4f] dark:text-[#5cc9a0]">
        <MapPin className="w-4 h-4" />
        <span>Location Details</span>
      </div>

      <div>
        <h4 className="font-semibold text-sm text-[#14201c] dark:text-[#ece9e1]">
          {address}
        </h4>
        <p className="text-xs text-[#5d6b65] dark:text-[#9aa8a1] mt-0.5">
          {area}, {city} {state ? `• ${state}` : ''}
        </p>
      </div>

      <div className="pt-2 border-t border-[#e5e1d8] dark:border-[#24312b] flex items-center justify-between text-xs text-[#5d6b65] dark:text-[#9aa8a1]">
        <span className="font-mono text-[11px]">
          GPS: {latitude.toFixed(4)}, {longitude.toFixed(4)}
        </span>
        <a
          href={`https://www.google.com/maps?q=${latitude},${longitude}`}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1 text-[#0f6b4f] dark:text-[#5cc9a0] font-semibold hover:underline"
        >
          <Navigation className="w-3.5 h-3.5" />
          <span>Open in Maps</span>
        </a>
      </div>
    </Card>
  );
};
