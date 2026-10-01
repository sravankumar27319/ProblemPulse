'use client';

import React, { useEffect, useMemo } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMapEvents, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import Link from 'next/link';
import { AdminMapMarkerItem } from '../../types/admin';
import { PriorityBadge } from '../ui/PriorityBadge';
import { StatusPill } from '../ui/StatusPill';
import { PriorityLevel } from '../../types/problem';

export interface AdminMapContainerProps {
  markers: AdminMapMarkerItem[];
  selectedMarkerId?: string | null;
  onSelectMarker?: (marker: AdminMapMarkerItem) => void;
  onBoundsChange?: (boundsStr: string) => void;
  center?: [number, number];
  zoom?: number;
  onQuickAssign?: (marker: AdminMapMarkerItem) => void;
  onQuickStatus?: (marker: AdminMapMarkerItem) => void;
  onQuickVerify?: (marker: AdminMapMarkerItem) => void;
}

const createAdminMarkerIcon = (marker: AdminMapMarkerItem, isSelected: boolean) => {
  const priority = marker.priority;
  const isCritical = priority === 'CRITICAL';
  const isUnassigned = !marker.departmentId;

  const colorMap: Record<PriorityLevel, string> = {
    CRITICAL: '#dc2626',
    MAJOR: '#ea580c',
    LOW: '#16a34a',
  };

  const bg = colorMap[priority] || '#16a34a';
  const size = isSelected ? 32 : isCritical ? 28 : 24;

  const pulseRing = isCritical
    ? `<div style="
        position: absolute;
        width: 100%;
        height: 100%;
        border-radius: 50%;
        border: 2px solid #dc2626;
        animation: ping 1.8s cubic-bezier(0, 0, 0.2, 1) infinite;
        opacity: 0.6;
      "></div>`
    : '';

  const selectedRing = isSelected
    ? `<div style="
        position: absolute;
        inset: -4px;
        border-radius: 50%;
        border: 2.5px solid #0f6b4f;
        box-shadow: 0 0 10px rgba(15, 107, 79, 0.5);
      "></div>`
    : '';

  const unassignedBadge = isUnassigned
    ? `<div style="
        position: absolute;
        top: -2px;
        right: -2px;
        width: 8px;
        height: 8px;
        background-color: #f59e0b;
        border: 1.5px solid #ffffff;
        border-radius: 50%;
      " title="Department unassigned"></div>`
    : '';

  const svgHtml = `
    <div style="position: relative; width: ${size}px; height: ${size}px; display: flex; align-items: center; justify-content: center; cursor: pointer;">
      ${pulseRing}
      ${selectedRing}
      <div style="
        background-color: ${bg};
        width: 100%;
        height: 100%;
        border-radius: 50%;
        border: 2.5px solid #ffffff;
        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.25);
        display: flex;
        align-items: center;
        justify-content: center;
        transition: transform 0.15s ease;
      ">
        <div style="width: 6px; height: 6px; background-color: #ffffff; border-radius: 50%;"></div>
      </div>
      ${unassignedBadge}
    </div>
  `;

  return L.divIcon({
    html: svgHtml,
    className: 'custom-admin-marker',
    iconSize: [size, size],
    iconAnchor: [size / 2, size / 2],
    popupAnchor: [0, -size / 2],
  });
};

function MapStabilizer() {
  const map = useMap();

  useEffect(() => {
    // Invalidate map size to prevent gray tiles or initial load jumps
    map.invalidateSize();
    const timer = setTimeout(() => {
      map.invalidateSize();
    }, 150);

    const container = map.getContainer();
    if (typeof ResizeObserver !== 'undefined' && container) {
      const observer = new ResizeObserver(() => {
        map.invalidateSize();
      });
      observer.observe(container);
      return () => {
        clearTimeout(timer);
        observer.disconnect();
      };
    }
    return () => clearTimeout(timer);
  }, [map]);

  return null;
}

function MapBoundsController({ markers }: { markers: AdminMapMarkerItem[] }) {
  const map = useMap();
  const prevMarkersSignatureRef = React.useRef<string>('');

  useEffect(() => {
    // Bounds-fitting must only run when markers first load, or when the filtered marker set changes, NEVER on hover/pointer events
    if (!markers || markers.length === 0) {
      return;
    }

    // Only refit bounds if the set of marker IDs actually changed
    const signature = markers.map((m) => m.id).join(',');
    if (signature === prevMarkersSignatureRef.current) {
      return;
    }
    prevMarkersSignatureRef.current = signature;

    try {
      const validCoords = markers
        .filter(
          (m) =>
            typeof m.latitude === 'number' &&
            typeof m.longitude === 'number' &&
            !isNaN(m.latitude) &&
            !isNaN(m.longitude)
        )
        .map((m) => [m.latitude, m.longitude] as [number, number]);

      if (validCoords.length > 0) {
        const bounds = L.latLngBounds(validCoords);
        if (bounds.isValid()) {
          map.fitBounds(bounds, { padding: [40, 40], maxZoom: 16 });
        }
      }
    } catch (err) {
      console.warn('Leaflet fitBounds safely caught error:', err);
    }
  }, [markers, map]);

  return null;
}

function MapBoundsListener({
  onBoundsChange,
}: {
  onBoundsChange?: (boundsStr: string) => void;
}) {
  const map = useMapEvents({
    moveend: () => {
      if (!onBoundsChange) return;
      try {
        const bounds = map.getBounds();
        if (bounds && bounds.isValid()) {
          const sw = bounds.getSouthWest();
          const ne = bounds.getNorthEast();
          const boundsStr = `${sw.lat},${sw.lng},${ne.lat},${ne.lng}`;
          onBoundsChange(boundsStr);
        }
      } catch (err) {
        console.warn('Map bounds read error:', err);
      }
    },
  });

  return null;
}

function MapPanController({ selectedMarker }: { selectedMarker?: AdminMapMarkerItem | null }) {
  const map = useMap();
  const prevSelectedIdRef = React.useRef<string | null>(null);

  useEffect(() => {
    if (selectedMarker && selectedMarker.id !== prevSelectedIdRef.current) {
      prevSelectedIdRef.current = selectedMarker.id;
      try {
        if (
          typeof selectedMarker.latitude === 'number' &&
          typeof selectedMarker.longitude === 'number' &&
          !isNaN(selectedMarker.latitude) &&
          !isNaN(selectedMarker.longitude)
        ) {
          map.flyTo([selectedMarker.latitude, selectedMarker.longitude], Math.max(map.getZoom(), 15), {
            animate: true,
            duration: 0.8,
          });
        }
      } catch (err) {
        console.warn('Map pan error safely caught:', err);
      }
    }
  }, [selectedMarker, map]);
  return null;
}

export const AdminMapContainer: React.FC<AdminMapContainerProps> = ({
  markers,
  selectedMarkerId,
  onSelectMarker,
  onBoundsChange,
  center = [12.9716, 77.5946],
  zoom = 13,
  onQuickAssign,
  onQuickStatus,
  onQuickVerify,
}) => {
  const selectedMarker = useMemo(
    () => markers.find((m) => m.id === selectedMarkerId),
    [markers, selectedMarkerId]
  );

  return (
    <div className="w-full h-full min-h-[500px] relative rounded-[14px] overflow-hidden border border-[#e5e1d8] dark:border-[#24312b] shadow-xs bg-[#faf8f4] dark:bg-[#141d19]">
      <MapContainer
        center={center}
        zoom={zoom}
        scrollWheelZoom={true}
        className="w-full h-full z-10"
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        <MapStabilizer />
        <MapBoundsController markers={markers} />
        {onBoundsChange && <MapBoundsListener onBoundsChange={onBoundsChange} />}
        <MapPanController selectedMarker={selectedMarker} />

        {markers.map((marker) => {
          const isSelected = marker.id === selectedMarkerId;
          const isUnverified = ['SUBMITTED', 'UNDER_REVIEW'].includes(marker.status);

          return (
            <Marker
              key={marker.id}
              position={[marker.latitude, marker.longitude]}
              icon={createAdminMarkerIcon(marker, isSelected)}
              eventHandlers={{
                click: () => {
                  onSelectMarker?.(marker);
                },
              }}
            >
              <Popup className="custom-leaflet-popup min-w-[280px] max-w-[340px]">
                <div className="p-1 space-y-3 font-sans text-[#14201c]">
                  {/* Top Bar: Priority + Status */}
                  <div className="flex items-center justify-between gap-2 border-b border-[#e5e1d8] pb-2">
                    <div className="flex items-center gap-1.5">
                      <PriorityBadge priority={marker.priority} size="sm" />
                      {marker.adminPriority && (
                        <span className="text-[9px] px-1 py-0.5 rounded bg-purple-100 text-purple-800 font-bold uppercase tracking-wider">
                          Overridden
                        </span>
                      )}
                    </div>
                    <StatusPill status={marker.status} size="sm" />
                  </div>

                  {/* Problem Title & Category */}
                  <div>
                    <div className="text-[11px] font-semibold text-[#0f6b4f] uppercase tracking-wider">
                      {marker.category} Problem
                    </div>
                    <h4 className="font-heading font-medium text-sm text-[#14201c] leading-snug mt-0.5">
                      {marker.title}
                    </h4>
                  </div>

                  {/* Address & Coordinates */}
                  <div className="space-y-0.5 text-xs text-[#5d6b65]">
                    <div className="truncate">
                      {marker.address || `${marker.area}, ${marker.city}`}
                    </div>
                    <div className="text-[10px] text-[#78716c] font-mono">
                      {marker.latitude.toFixed(5)}, {marker.longitude.toFixed(5)} • {marker.area}
                    </div>
                  </div>

                  {/* Citizen Metrics: Reports vs Supports */}
                  <div className="grid grid-cols-2 gap-2 bg-[#f4f1ea] p-2 rounded-lg border border-[#e5e1d8] text-xs">
                    <div>
                      <div className="text-[10px] text-[#78716c] leading-none">Reports</div>
                      <div className="font-semibold text-[#14201c] text-sm mt-0.5">{marker.reportCount}</div>
                    </div>
                    <div>
                      <div className="text-[10px] text-[#78716c] leading-none">Supporters</div>
                      <div className="font-semibold text-[#14201c] text-sm mt-0.5">{marker.supportCount}</div>
                    </div>
                  </div>

                  {/* Assigned Department */}
                  <div className="flex items-center justify-between p-2 rounded-lg bg-white border border-[#e5e1d8] text-xs">
                    <div className="truncate">
                      <span className="text-[11px] text-[#78716c] mr-1">Dept:</span>
                      <span className="font-medium text-[#14201c] truncate">
                        {marker.department ? marker.department.name : 'Unassigned'}
                      </span>
                    </div>

                    {!marker.department && (
                      <span className="text-[10px] font-medium text-amber-700 bg-amber-100 px-1.5 py-0.5 rounded shrink-0">
                        Action Required
                      </span>
                    )}
                  </div>

                  {/* Admin Quick Actions */}
                  <div className="pt-1 flex items-center justify-between gap-2 border-t border-[#e5e1d8]">
                    <div className="flex items-center gap-1.5">
                      {isUnverified && onQuickVerify && (
                        <button
                          type="button"
                          onClick={() => onQuickVerify(marker)}
                          className="px-2.5 py-1 bg-[#0f6b4f] text-white rounded text-[11px] font-medium hover:bg-[#0c543e] transition-colors"
                        >
                          Verify
                        </button>
                      )}

                      {onQuickAssign && (
                        <button
                          type="button"
                          onClick={() => onQuickAssign(marker)}
                          className="px-2.5 py-1 bg-white border border-[#d6d0c4] text-[#14201c] rounded text-[11px] font-medium hover:bg-[#f4f1ea] transition-colors"
                        >
                          Assign
                        </button>
                      )}

                      {onQuickStatus && (
                        <button
                          type="button"
                          onClick={() => onQuickStatus(marker)}
                          className="px-2.5 py-1 bg-white border border-[#d6d0c4] text-[#14201c] rounded text-[11px] font-medium hover:bg-[#f4f1ea] transition-colors"
                        >
                          Status
                        </button>
                      )}
                    </div>

                    <Link
                      href={`/admin/problems/${marker.id}`}
                      className="text-xs font-medium text-[#0f6b4f] hover:underline ml-auto"
                    >
                      Review →
                    </Link>
                  </div>
                </div>
              </Popup>
            </Marker>
          );
        })}
      </MapContainer>

      {/* Floating Map Legend */}
      <div className="absolute bottom-4 left-4 z-20 bg-white/95 dark:bg-[#141d19]/95 backdrop-blur-md p-3 rounded-xl border border-[#e5e1d8] dark:border-[#24312b] shadow-xs text-xs space-y-2 pointer-events-auto max-w-[200px]">
        <div className="font-semibold text-[#14201c] dark:text-[#ece9e1] text-[11px] uppercase tracking-wider">
          Priority Tiers
        </div>
        <div className="space-y-1.5 text-[11px]">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-[#dc2626]"></span>
            <span className="text-[#14201c] dark:text-[#ece9e1]">Critical Priority</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-[#ea580c]"></span>
            <span className="text-[#14201c] dark:text-[#ece9e1]">Major Priority</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-[#16a34a]"></span>
            <span className="text-[#14201c] dark:text-[#ece9e1]">Low Priority</span>
          </div>
          <div className="flex items-center gap-2 pt-1 border-t border-[#e5e1d8] dark:border-[#24312b]">
            <span className="w-2 h-2 rounded-full bg-[#f59e0b]"></span>
            <span className="text-[#78716c] dark:text-[#9aa8a1]">Dept Unassigned</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminMapContainer;

