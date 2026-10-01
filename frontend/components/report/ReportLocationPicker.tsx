'use client';

import React, { useMemo, useEffect, useRef } from 'react';
import { MapContainer, TileLayer, Marker, useMapEvents, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

export interface LocationCoordinates {
  latitude: number;
  longitude: number;
}

export interface ReportLocationPickerProps {
  coordinates: LocationCoordinates;
  onChange: (coords: LocationCoordinates) => void;
  flyToTrigger?: number;
}

const customPinIcon = L.divIcon({
  html: `
    <div style="
      position: relative;
      width: 36px;
      height: 36px;
      display: flex;
      align-items: center;
      justify-content: center;
      transform: translate(-50%, -100%);
    ">
      <div style="
        width: 32px;
        height: 32px;
        background-color: #0f6b4f;
        border-radius: 50% 50% 50% 0;
        transform: rotate(-45deg);
        border: 3px solid #ffffff;
        box-shadow: 0 4px 12px rgba(0,0,0,0.35);
        display: flex;
        align-items: center;
        justify-content: center;
      ">
        <div style="
          width: 10px;
          height: 10px;
          background-color: #ffffff;
          border-radius: 50%;
          transform: rotate(45deg);
        "></div>
      </div>
      <div style="
        position: absolute;
        bottom: -4px;
        width: 12px;
        height: 4px;
        background-color: rgba(0,0,0,0.25);
        border-radius: 50%;
        filter: blur(1px);
      "></div>
    </div>
  `,
  className: 'report-custom-marker',
  iconSize: [36, 36],
  iconAnchor: [18, 36],
});

function MapStabilizer() {
  const map = useMap();

  useEffect(() => {
    map.invalidateSize();
    const timer = setTimeout(() => {
      map.invalidateSize();
    }, 200);
    return () => clearTimeout(timer);
  }, [map]);

  return null;
}

function MapFlyController({
  coordinates,
  flyToTrigger,
}: {
  coordinates: LocationCoordinates;
  flyToTrigger?: number;
}) {
  const map = useMap();
  const prevTriggerRef = useRef<number | undefined>(flyToTrigger);

  useEffect(() => {
    const isNewTrigger = flyToTrigger !== undefined && flyToTrigger !== prevTriggerRef.current;
    prevTriggerRef.current = flyToTrigger;

    const currentCenter = map.getCenter();
    const latDiff = Math.abs(currentCenter.lat - coordinates.latitude);
    const lngDiff = Math.abs(currentCenter.lng - coordinates.longitude);

    // Fly if trigger explicitly signaled (forward geocoding / GPS detection / suggestion click)
    // or if coordinates shifted significantly (> ~50m)
    if (isNewTrigger || latDiff > 0.0005 || lngDiff > 0.0005) {
      map.flyTo([coordinates.latitude, coordinates.longitude], Math.max(map.getZoom(), 16), {
        duration: 0.8,
        easeLinearity: 0.25,
      });
    }
  }, [coordinates.latitude, coordinates.longitude, flyToTrigger, map]);

  return null;
}

function MapClickHandler({
  onCoordinatesChange,
}: {
  onCoordinatesChange: (coords: LocationCoordinates) => void;
}) {
  const map = useMapEvents({
    click: (e) => {
      onCoordinatesChange({
        latitude: Number(e.latlng.lat.toFixed(6)),
        longitude: Number(e.latlng.lng.toFixed(6)),
      });
      map.panTo(e.latlng);
    },
  });

  return null;
}

export const ReportLocationPicker: React.FC<ReportLocationPickerProps> = ({
  coordinates,
  onChange,
  flyToTrigger,
}) => {
  const position: [number, number] = useMemo(
    () => [coordinates.latitude, coordinates.longitude],
    [coordinates.latitude, coordinates.longitude]
  );

  const eventHandlers = useMemo(
    () => ({
      dragend(e: any) {
        const marker = e.target;
        if (marker != null) {
          const latLng = marker.getLatLng();
          onChange({
            latitude: Number(latLng.lat.toFixed(6)),
            longitude: Number(latLng.lng.toFixed(6)),
          });
        }
      },
    }),
    [onChange]
  );

  return (
    <div className="w-full h-full relative rounded-2xl overflow-hidden border border-[#e5e1d8] dark:border-[#24312b] shadow-xs">
      <MapContainer
        center={position}
        zoom={14}
        scrollWheelZoom={true}
        className="w-full h-full z-10"
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        <MapStabilizer />
        <MapFlyController coordinates={coordinates} flyToTrigger={flyToTrigger} />
        <MapClickHandler onCoordinatesChange={onChange} />

        <Marker
          position={position}
          draggable={true}
          eventHandlers={eventHandlers}
          icon={customPinIcon}
        />
      </MapContainer>
    </div>
  );
};

export default ReportLocationPicker;
