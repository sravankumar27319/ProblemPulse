'use client';

import React, { useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import Link from 'next/link';
import { MapMarkerItem } from '../../services/problem.service';
import { PriorityBadge } from '../ui/PriorityBadge';
import { StatusPill } from '../ui/StatusPill';
import { PriorityLevel } from '../../types/problem';
import { Users, MapPin } from 'lucide-react';

export interface ProblemMapContainerProps {
  markers: MapMarkerItem[];
  onBoundsChange?: (boundsStr: string) => void;
  center?: [number, number];
  zoom?: number;
}

const createCustomIcon = (priority: PriorityLevel) => {
  const colorMap: Record<PriorityLevel, string> = {
    CRITICAL: '#dc2626',
    MAJOR: '#ea580c',
    LOW: '#16a34a',
  };

  const color = colorMap[priority] || '#16a34a';

  const svgHtml = `
    <div style="
      background-color: ${color};
      width: 28px;
      height: 28px;
      border-radius: 50%;
      border: 3px solid #ffffff;
      box-shadow: 0 4px 10px rgba(0,0,0,0.3);
      display: flex;
      align-items: center;
      justify-content: center;
      color: white;
      font-weight: bold;
    ">
      <div style="width: 8px; height: 8px; background-color: white; border-radius: 50%;"></div>
    </div>
  `;

  return L.divIcon({
    html: svgHtml,
    className: 'custom-leaflet-marker',
    iconSize: [28, 28],
    iconAnchor: [14, 14],
  });
};

function MapBoundsListener({
  onBoundsChange,
}: {
  onBoundsChange?: (boundsStr: string) => void;
}) {
  const map = useMapEvents({
    moveend: () => {
      if (!onBoundsChange) return;
      const bounds = map.getBounds();
      const sw = bounds.getSouthWest();
      const ne = bounds.getNorthEast();
      const boundsStr = `${sw.lat},${sw.lng},${ne.lat},${ne.lng}`;
      onBoundsChange(boundsStr);
    },
  });

  useEffect(() => {
    if (!onBoundsChange) return;
    const bounds = map.getBounds();
    const sw = bounds.getSouthWest();
    const ne = bounds.getNorthEast();
    onBoundsChange(`${sw.lat},${sw.lng},${ne.lat},${ne.lng}`);
  }, [map, onBoundsChange]);

  return null;
}

export const ProblemMapContainer: React.FC<ProblemMapContainerProps> = ({
  markers,
  onBoundsChange,
  center = [12.9716, 77.5946],
  zoom = 13,
}) => {
  return (
    <div className="w-full h-full relative rounded-2xl overflow-hidden border border-[#e5e1d8] dark:border-[#24312b] shadow-xs">
      <MapContainer
        center={center}
        zoom={zoom}
        scrollWheelZoom={true}
        className="w-full h-full z-10"
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {onBoundsChange && <MapBoundsListener onBoundsChange={onBoundsChange} />}

        {markers.map((marker) => (
          <Marker
            key={marker.id}
            position={[marker.latitude, marker.longitude]}
            icon={createCustomIcon(marker.priority)}
          >
            <Popup className="custom-leaflet-popup">
              <div className="p-1 space-y-2 max-w-xs font-sans">
                {/* Badges */}
                <div className="flex items-center justify-between gap-2">
                  <PriorityBadge priority={marker.priority} size="sm" />
                  <StatusPill status={marker.status} size="sm" />
                </div>

                {/* Title */}
                <h4 className="font-heading font-semibold text-base text-[#14201c] leading-snug">
                  {marker.title}
                </h4>

                {/* Address */}
                <div className="flex items-center gap-1 text-xs text-[#5d6b65]">
                  <MapPin className="w-3 h-3 text-[#0f6b4f] shrink-0" />
                  <span className="truncate">{marker.address || `${marker.area}, ${marker.city}`}</span>
                </div>

                {/* Stats (Phase 12: Surfaced Combined Metric + Breakdown) */}
                <div className="flex items-center justify-between py-1.5 px-2 bg-[#faf8f4] rounded-md border border-[#e5e1d8] text-[11px] text-[#5d6b65]">
                  <div className="flex items-center gap-1 font-semibold text-[#14201c]">
                    <Users className="w-3 h-3 text-[#0f6b4f]" />
                    <span>{marker.reportCount + marker.supportCount} Backers</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-[10px] text-[#78716c]">
                    <span>{marker.reportCount} Reps</span>
                    <span>•</span>
                    <span className="text-[#0f6b4f] font-medium">{marker.supportCount} Sups</span>
                  </div>
                </div>

                {/* Link */}
                <div className="pt-1 text-right">
                  <Link
                    href={`/problems/${marker.id}`}
                    className="inline-flex items-center gap-1 text-xs font-semibold text-[#0f6b4f] hover:underline"
                  >
                    <span>View Problem →</span>
                  </Link>
                </div>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
};

export default ProblemMapContainer;
