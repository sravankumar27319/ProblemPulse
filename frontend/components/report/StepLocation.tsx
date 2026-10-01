'use client';

import React, { useState, useRef, useCallback, useEffect } from 'react';
import dynamic from 'next/dynamic';
import { LocationCoordinates } from './ReportLocationPicker';
import { Button } from '../ui/Button';
import { Loading } from '../ui/Loading';
import {
  MapPin,
  Navigation,
  Compass,
  CheckCircle2,
  Search,
  Loader2,
  X,
  ChevronDown,
  ChevronUp,
  Sparkles,
} from 'lucide-react';
import { geocodingService, GeocodeAddress } from '../../services/geocoding.service';
import { NearbyProblemMatch } from '../../types/problem';
import { DuplicateInlineAlert } from './DuplicateInlineAlert';
import { useDebounce } from '../../hooks/useDebounce';

const DynamicLocationPickerMap = dynamic(
  () => import('./ReportLocationPicker'),
  {
    ssr: false,
    loading: () => (
      <div className="w-full h-full min-h-[350px] bg-[#faf8f4] dark:bg-[#141d19] rounded-2xl border border-[#e5e1d8] dark:border-[#24312b] flex items-center justify-center">
        <Loading size="md" text="Loading Interactive Pin Map..." />
      </div>
    ),
  }
);

export interface LocationData {
  latitude: number;
  longitude: number;
  address: string;
  area: string;
  city: string;
  state: string;
}

export interface StepLocationProps {
  data: LocationData;
  onChange: (data: LocationData) => void;
  duplicates?: NearbyProblemMatch[];
  isLoadingDuplicates?: boolean;
  onReviewDuplicates?: () => void;
}

export const StepLocation: React.FC<StepLocationProps> = ({
  data,
  onChange,
  duplicates = [],
  isLoadingDuplicates = false,
  onReviewDuplicates,
}) => {
  const [isLocating, setIsLocating] = useState<boolean>(false);
  const [isReverseGeocoding, setIsReverseGeocoding] = useState<boolean>(false);
  const [isSearching, setIsSearching] = useState<boolean>(false);
  const [geoNotice, setGeoNotice] = useState<string | null>(null);
  const [suggestions, setSuggestions] = useState<GeocodeAddress[]>([]);
  const [isDropdownOpen, setIsDropdownOpen] = useState<boolean>(false);
  const [flyToTrigger, setFlyToTrigger] = useState<number>(0);
  const [showAdvancedFields, setShowAdvancedFields] = useState<boolean>(false);
  const [locationStatus, setLocationStatus] = useState<string | null>(null);

  const dropdownRef = useRef<HTMLDivElement>(null);
  const lastReverseGeocodedRef = useRef<string>('');
  const userTypedAddressRef = useRef<string>(data.address || '');

  // Debounced address search (600ms) for smooth hands-free pin placement
  const debouncedAddress = useDebounce<string>(data.address, 600);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // 1. FORWARD GEOCODING: Auto-position pin when user types
  useEffect(() => {
    const query = debouncedAddress?.trim();
    if (!query || query.length < 3) {
      setSuggestions([]);
      setIsDropdownOpen(false);
      return;
    }

    // Skip if query was just populated from a map pin drag
    if (query.toLowerCase() === lastReverseGeocodedRef.current.toLowerCase()) {
      return;
    }

    let isSubscribed = true;

    const autoLocate = async () => {
      try {
        setIsSearching(true);
        const searchContext =
          query.includes(',') || !data.city || data.city === 'Metro City'
            ? query
            : `${query}, ${data.city}`;

        const results = await geocodingService.search(searchContext, 4);

        if (!isSubscribed) return;

        if (results.length > 0) {
          const best = results[0];
          lastReverseGeocodedRef.current = query.toLowerCase();

          // Smoothly position map pin without wiping out user's typed text
          onChange({
            latitude: best.latitude,
            longitude: best.longitude,
            address: userTypedAddressRef.current || best.address,
            area: best.area || data.area || 'Central Ward',
            city: best.city || data.city || 'Bengaluru',
            state: best.state || data.state || 'Karnataka',
          });

          setFlyToTrigger(Date.now());
          setLocationStatus(`📍 Map pin placed at ${best.displayName.split(',')[0]}`);

          if (results.length > 1) {
            setSuggestions(results);
            setIsDropdownOpen(true);
          } else {
            setIsDropdownOpen(false);
          }
        } else {
          // If no specific street match in OSM, keep the current pin position comfortably!
          setLocationStatus('📍 Location pinned on map. Feel free to drag the pin to adjust.');
        }
      } catch {
        // Never show intimidating errors to the user
        setLocationStatus('📍 Location pinned on map. Feel free to drag the pin to adjust.');
      } finally {
        if (isSubscribed) {
          setIsSearching(false);
        }
      }
    };

    autoLocate();

    return () => {
      isSubscribed = false;
    };
  }, [debouncedAddress, data.city]);

  // Explicit Locate click / Enter press
  const handleManualLocate = async () => {
    const query = (data.address || '').trim();
    if (!query) return;

    try {
      setIsSearching(true);
      const searchContext =
        query.includes(',') || !data.city || data.city === 'Metro City'
          ? query
          : `${query}, ${data.city}`;

      const results = await geocodingService.search(searchContext, 4);

      if (results.length > 0) {
        const best = results[0];
        lastReverseGeocodedRef.current = query.toLowerCase();

        onChange({
          latitude: best.latitude,
          longitude: best.longitude,
          address: userTypedAddressRef.current || best.address,
          area: best.area || data.area || 'Central Ward',
          city: best.city || data.city || 'Bengaluru',
          state: best.state || data.state || 'Karnataka',
        });

        setFlyToTrigger(Date.now());
        setLocationStatus(`📍 Map pin placed at ${best.displayName.split(',')[0]}`);

        if (results.length > 1) {
          setSuggestions(results);
          setIsDropdownOpen(true);
        }
      } else {
        setLocationStatus('📍 Location pinned on map. Feel free to drag the pin to adjust.');
      }
    } finally {
      setIsSearching(false);
    }
  };

  // 2. SELECTION FROM SUGGESTIONS DROPDOWN
  const handleSelectSuggestion = (suggestion: GeocodeAddress) => {
    const chosenAddress = suggestion.address || suggestion.displayName.split(',')[0];
    userTypedAddressRef.current = chosenAddress;
    lastReverseGeocodedRef.current = chosenAddress.toLowerCase();

    onChange({
      latitude: suggestion.latitude,
      longitude: suggestion.longitude,
      address: chosenAddress,
      area: suggestion.area || data.area || 'Central Ward',
      city: suggestion.city || data.city || 'Bengaluru',
      state: suggestion.state || data.state || 'Karnataka',
    });

    setFlyToTrigger(Date.now());
    setIsDropdownOpen(false);
    setSuggestions([]);
    setLocationStatus(`📍 Map pin placed at ${chosenAddress}`);
  };

  // 3. REVERSE GEOCODING: When user drags pin or clicks on map
  const reverseGeocode = useCallback(
    async (lat: number, lng: number) => {
      try {
        setIsReverseGeocoding(true);
        setIsDropdownOpen(false);

        const rev = await geocodingService.reverse(lat, lng, data.city || 'Bengaluru', data.state || 'Karnataka');

        if (rev) {
          lastReverseGeocodedRef.current = (rev.address || '').toLowerCase();
          userTypedAddressRef.current = rev.address || data.address || 'Selected Location';

          onChange({
            latitude: lat,
            longitude: lng,
            address: rev.address || data.address || 'Selected Location',
            area: rev.area || data.area || 'Central Ward',
            city: rev.city || data.city || 'Bengaluru',
            state: rev.state || data.state || 'Karnataka',
          });
          setLocationStatus(`📍 Updated from map pin: ${rev.address || 'Pinned location'}`);
        } else {
          onChange({
            ...data,
            latitude: lat,
            longitude: lng,
            area: data.area || 'Central Ward',
            city: data.city || 'Bengaluru',
            state: data.state || 'Karnataka',
          });
          setLocationStatus('📍 Map pin updated.');
        }
      } catch {
        onChange({
          ...data,
          latitude: lat,
          longitude: lng,
          area: data.area || 'Central Ward',
          city: data.city || 'Bengaluru',
          state: data.state || 'Karnataka',
        });
      } finally {
        setIsReverseGeocoding(false);
      }
    },
    [data, onChange]
  );

  const handleCoordinatesChange = (coords: LocationCoordinates) => {
    reverseGeocode(coords.latitude, coords.longitude);
  };

  // 4. GPS GEOLOCATION
  const handleGetCurrentLocation = () => {
    if (!navigator.geolocation) {
      setGeoNotice('Geolocation is not supported by your browser.');
      return;
    }

    setIsLocating(true);
    setGeoNotice(null);

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const lat = Number(pos.coords.latitude.toFixed(6));
        const lng = Number(pos.coords.longitude.toFixed(6));
        setIsLocating(false);
        setFlyToTrigger(Date.now());
        reverseGeocode(lat, lng);
      },
      (err) => {
        setIsLocating(false);
        setGeoNotice(`Could not fetch GPS: ${err.message}. You can drag the map pin.`);
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  return (
    <div className="space-y-6">
      {/* Header Row */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="font-heading text-xl sm:text-2xl font-bold text-[#14201c] dark:text-[#ece9e1]">
            Pin Problem Location
          </h2>
          <p className="text-sm text-[#5d6b65] dark:text-[#9aa8a1] mt-1">
            Type any landmark or simply drag the map pin. No complicated ward details required.
          </p>
        </div>

        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={handleGetCurrentLocation}
          isLoading={isLocating}
          leftIcon={<Navigation className="w-4 h-4 text-[#0f6b4f] dark:text-[#5cc9a0]" />}
          className="shrink-0"
        >
          {isLocating ? 'Detecting GPS...' : 'Use My Current Location'}
        </Button>
      </div>

      {geoNotice && (
        <div className="p-3 bg-[#fefce8] dark:bg-[#2c2211] border border-[#fde047] dark:border-[#715416] rounded-lg text-xs text-[#854d0e] dark:text-[#fef08a] flex items-center gap-2">
          <MapPin className="w-4 h-4 shrink-0 text-[#ca8a04]" />
          <span>{geoNotice}</span>
        </div>
      )}

      {/* Duplicate alert if found */}
      {onReviewDuplicates && (
        <DuplicateInlineAlert
          duplicates={duplicates}
          isLoading={isLoadingDuplicates}
          onReviewDuplicates={onReviewDuplicates}
        />
      )}

      {/* Main Grid Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left: Interactive Map */}
        <div className="lg:col-span-7 h-[380px] sm:h-[430px] flex flex-col">
          <div className="flex-1 relative rounded-2xl overflow-hidden border border-[#e5e1d8] dark:border-[#24312b] shadow-xs">
            <DynamicLocationPickerMap
              coordinates={{ latitude: data.latitude, longitude: data.longitude }}
              onChange={handleCoordinatesChange}
              flyToTrigger={flyToTrigger}
            />

            {/* In-Map Helper Badge */}
            <div className="absolute top-3 right-3 z-20 bg-white/95 dark:bg-[#141d19]/95 backdrop-blur-xs px-3 py-1.5 rounded-lg border border-[#e5e1d8] dark:border-[#24312b] text-[11px] font-medium text-[#14201c] dark:text-[#ece9e1] shadow-xs flex items-center gap-1.5">
              <Compass className="w-3.5 h-3.5 text-[#0f6b4f] dark:text-[#5cc9a0]" />
              <span>Tap or drag pin to position</span>
            </div>

            {/* Reverse Geocoding Status Badge */}
            {isReverseGeocoding && (
              <div className="absolute bottom-3 left-3 z-20 bg-white/95 dark:bg-[#141d19]/95 backdrop-blur-xs px-3 py-1.5 rounded-lg border border-[#e5e1d8] dark:border-[#24312b] text-[11px] font-medium text-[#0f6b4f] dark:text-[#5cc9a0] shadow-xs flex items-center gap-1.5">
                <Loading size="sm" />
                <span>Reading pin location...</span>
              </div>
            )}
          </div>

          <div className="mt-2.5 flex items-center justify-between text-xs text-[#5d6b65] dark:text-[#9aa8a1] px-1">
            <div className="flex items-center gap-2">
              <span className="font-semibold text-[#14201c] dark:text-[#ece9e1]">Coordinates:</span>
              <span className="font-mono bg-[#faf8f4] dark:bg-[#1a2520] px-2 py-0.5 rounded border border-[#e5e1d8] dark:border-[#24312b]">
                {data.latitude.toFixed(5)}, {data.longitude.toFixed(5)}
              </span>
            </div>
            <span className="text-[11px] text-[#78716c] dark:text-[#84948c]">
              GPS precision ~5m
            </span>
          </div>
        </div>

        {/* Right: Simple, Low-Friction Location Input */}
        <div className="lg:col-span-5 bg-white dark:bg-[#141d19] p-5 sm:p-6 rounded-2xl border border-[#e5e1d8] dark:border-[#24312b] shadow-xs space-y-5">
          <div className="flex items-center justify-between pb-3 border-b border-[#e5e1d8] dark:border-[#24312b]">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-emerald-500/10 flex items-center justify-center text-[#0f6b4f] dark:text-[#5cc9a0]">
                <MapPin className="w-4 h-4" />
              </div>
              <h3 className="font-heading font-semibold text-sm text-[#14201c] dark:text-[#ece9e1]">
                Problem Location
              </h3>
            </div>
            <span className="text-[11px] font-medium text-emerald-700 dark:text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded flex items-center gap-1">
              <Sparkles className="w-3 h-3" /> Auto-Synced
            </span>
          </div>

          {/* Primary Friendly Input */}
          <div className="space-y-2 relative" ref={dropdownRef}>
            <label className="block text-xs font-semibold text-[#14201c] dark:text-[#ece9e1]">
              Where is the problem located?
            </label>
            <p className="text-[11px] text-[#5d6b65] dark:text-[#9aa8a1]">
              Type a street name, nearby building, or landmark (or simply drag the pin).
            </p>

            <div className="relative flex items-center mt-1">
              <input
                type="text"
                placeholder="e.g. MG Road, Near Metro Station, or 5th Cross"
                value={data.address}
                onChange={(e) => {
                  userTypedAddressRef.current = e.target.value;
                  onChange({
                    ...data,
                    address: e.target.value,
                    area: data.area || 'Central Ward',
                    city: data.city || 'Bengaluru',
                    state: data.state || 'Karnataka',
                  });
                }}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleManualLocate();
                  }
                }}
                className="w-full bg-white dark:bg-[#1a2520] text-[#1c1917] dark:text-[#ece9e1] placeholder:text-[#a8a29e] text-sm rounded-xl border border-[#e6e2dc] dark:border-[#24312b] px-3.5 py-3 pr-20 transition-all focus:outline-none focus:border-[#0f6b4f] focus:ring-2 focus:ring-[#0f6b4f]/20 shadow-2xs"
              />

              <button
                type="button"
                onClick={handleManualLocate}
                disabled={isSearching || !data.address?.trim()}
                title="Locate this spot on map"
                className="absolute right-2 px-3 py-1.5 bg-[#0f6b4f] hover:bg-[#0b543d] disabled:opacity-40 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                {isSearching ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <Search className="w-3.5 h-3.5" />
                )}
                <span>Locate</span>
              </button>
            </div>

            {/* Location status badge */}
            {locationStatus && (
              <div className="text-[11px] text-[#0f6b4f] dark:text-[#5cc9a0] font-medium flex items-center gap-1 pt-1 animate-in fade-in">
                <span>{locationStatus}</span>
              </div>
            )}

            {/* Multiple suggestions dropdown if found */}
            {isDropdownOpen && suggestions.length > 0 && (
              <div className="absolute left-0 right-0 top-[102%] z-50 mt-1 bg-white dark:bg-[#141d19] border border-[#e5e1d8] dark:border-[#24312b] rounded-xl shadow-xl overflow-hidden divide-y divide-[#f0ede6] dark:divide-[#1f2b25]">
                <div className="px-3 py-2 bg-[#faf8f4] dark:bg-[#0e1512] flex items-center justify-between text-[11px] font-semibold text-[#5d6b65] dark:text-[#9aa8a1]">
                  <span>Suggested Locations</span>
                  <button
                    type="button"
                    onClick={() => setIsDropdownOpen(false)}
                    className="text-[#8a9992] hover:text-[#14201c] dark:hover:text-[#ece9e1]"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>

                <div className="max-h-52 overflow-y-auto">
                  {suggestions.map((item, idx) => (
                    <button
                      key={`${item.latitude}-${item.longitude}-${idx}`}
                      type="button"
                      onClick={() => handleSelectSuggestion(item)}
                      className="w-full text-left px-3.5 py-2.5 hover:bg-[#ede8dc]/50 dark:hover:bg-[#1a2520] transition-colors flex items-start gap-2.5 group cursor-pointer"
                    >
                      <MapPin className="w-4 h-4 text-[#0f6b4f] dark:text-[#5cc9a0] shrink-0 mt-0.5" />
                      <div className="min-w-0 flex-1">
                        <div className="text-xs font-semibold text-[#14201c] dark:text-[#ece9e1] truncate">
                          {item.address || item.displayName.split(',')[0]}
                        </div>
                        <div className="text-[11px] text-[#5d6b65] dark:text-[#9aa8a1] truncate">
                          {item.displayName}
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Optional Collapsible Details */}
          <div className="pt-2 border-t border-[#f0ede6] dark:border-[#24312b]">
            <button
              type="button"
              onClick={() => setShowAdvancedFields(!showAdvancedFields)}
              className="w-full flex items-center justify-between text-xs font-semibold text-[#5d6b65] dark:text-[#9aa8a1] hover:text-[#14201c] dark:hover:text-[#ece9e1] py-1 cursor-pointer"
            >
              <span>More location details (Auto-filled)</span>
              {showAdvancedFields ? (
                <ChevronUp className="w-4 h-4" />
              ) : (
                <ChevronDown className="w-4 h-4" />
              )}
            </button>

            {showAdvancedFields && (
              <div className="space-y-3 pt-3 animate-in fade-in">
                <div>
                  <label className="text-[11px] font-medium text-[#78716c] dark:text-[#9aa8a1]">
                    Area / Ward / Neighborhood
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Central Ward"
                    value={data.area}
                    onChange={(e) => onChange({ ...data, area: e.target.value })}
                    className="w-full bg-[#faf8f4] dark:bg-[#1a2520] text-xs rounded-lg border border-[#e6e2dc] dark:border-[#24312b] px-3 py-2 mt-1"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-[11px] font-medium text-[#78716c] dark:text-[#9aa8a1]">
                      City
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Bengaluru"
                      value={data.city}
                      onChange={(e) => onChange({ ...data, city: e.target.value })}
                      className="w-full bg-[#faf8f4] dark:bg-[#1a2520] text-xs rounded-lg border border-[#e6e2dc] dark:border-[#24312b] px-3 py-2 mt-1"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] font-medium text-[#78716c] dark:text-[#9aa8a1]">
                      State
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Karnataka"
                      value={data.state}
                      onChange={(e) => onChange({ ...data, state: e.target.value })}
                      className="w-full bg-[#faf8f4] dark:bg-[#1a2520] text-xs rounded-lg border border-[#e6e2dc] dark:border-[#24312b] px-3 py-2 mt-1"
                    />
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="p-3 bg-[#eef7f3] dark:bg-[#132720] rounded-xl border border-[#0f6b4f]/20 text-xs text-[#0f6b4f] dark:text-[#5cc9a0] flex items-start gap-2">
            <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5" />
            <span>
              You're good to proceed! The map pin coordinates will guide municipal dispatch teams to the exact spot.
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
