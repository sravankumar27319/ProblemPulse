/**
 * Geocoding Service for ProblemPulse
 * 
 * Provides forward geocoding (address text -> coordinates) and reverse geocoding
 * (coordinates -> address text) using OpenStreetMap's Nominatim API.
 * 
 * ============================================================================
 * PRODUCTION NOTE & RATE LIMIT NOTICE:
 * Nominatim is free to use for development and moderate civic community use,
 * but enforces a strict usage policy of max 1 request/second and requires a
 * descriptive User-Agent header. For high-volume production traffic, switch
 * this provider to a commercial geocoding provider such as:
 *   1. Mapbox Geocoding API (https://docs.mapbox.com/api/search/geocoding/)
 *   2. Google Maps Geocoding API (https://developers.google.com/maps/documentation/geocoding)
 * ============================================================================
 */

export interface GeocodeAddress {
  address: string;
  area: string;
  city: string;
  state: string;
  latitude: number;
  longitude: number;
  displayName: string;
}

export interface NominatimRawResult {
  place_id: number;
  lat: string;
  lon: string;
  display_name: string;
  name?: string;
  address?: {
    road?: string;
    pedestrian?: string;
    highway?: string;
    street?: string;
    residential?: string;
    house_number?: string;
    suburb?: string;
    neighbourhood?: string;
    quarter?: string;
    district?: string;
    city_district?: string;
    city?: string;
    town?: string;
    municipality?: string;
    village?: string;
    hamlet?: string;
    county?: string;
    state?: string;
    province?: string;
    state_district?: string;
    postcode?: string;
    country?: string;
    [key: string]: string | undefined;
  };
}

const NOMINATIM_BASE_URL = 'https://nominatim.openstreetmap.org';
const NOMINATIM_USER_AGENT = 'ProblemPulse-CivicApp/1.0';

/**
 * Parse a raw Nominatim API response item into standard ProblemPulse Location fields.
 */
export function parseNominatimResult(
  item: NominatimRawResult,
  fallbackCity = 'Metro City',
  fallbackState = 'Metro State'
): GeocodeAddress {
  const addressObj = item.address || {};

  const road =
    addressObj.road ||
    addressObj.pedestrian ||
    addressObj.highway ||
    addressObj.street ||
    addressObj.residential ||
    item.name ||
    '';
  const houseNumber = addressObj.house_number || '';
  const derivedAddress =
    [houseNumber, road].filter(Boolean).join(' ') ||
    item.name ||
    item.display_name?.split(',')[0] ||
    '';

  const derivedArea =
    addressObj.suburb ||
    addressObj.neighbourhood ||
    addressObj.quarter ||
    addressObj.residential ||
    addressObj.city_district ||
    addressObj.district ||
    addressObj.county ||
    '';

  const derivedCity =
    addressObj.city ||
    addressObj.town ||
    addressObj.municipality ||
    addressObj.village ||
    addressObj.hamlet ||
    fallbackCity;

  const derivedState =
    addressObj.state ||
    addressObj.province ||
    addressObj.state_district ||
    fallbackState;

  return {
    address: derivedAddress,
    area: derivedArea,
    city: derivedCity,
    state: derivedState,
    latitude: Number(parseFloat(item.lat).toFixed(6)),
    longitude: Number(parseFloat(item.lon).toFixed(6)),
    displayName: item.display_name,
  };
}

export const geocodingService = {
  /**
   * Forward Geocoding: converts an address / place string into coordinates & address details.
   * Calls: https://nominatim.openstreetmap.org/search?q={query}&format=json&limit={limit}&addressdetails=1
   */
  async search(query: string, limit = 5): Promise<GeocodeAddress[]> {
    const trimmed = query.trim();
    if (!trimmed || trimmed.length < 3) {
      return [];
    }

    try {
      const isBrowser = typeof window !== 'undefined';
      const url = isBrowser
        ? `/api/geocode?q=${encodeURIComponent(trimmed)}&limit=${limit}`
        : `${NOMINATIM_BASE_URL}/search?q=${encodeURIComponent(
            trimmed
          )}&format=json&limit=${limit}&addressdetails=1`;

      const headers: Record<string, string> = isBrowser
        ? { Accept: 'application/json' }
        : { 'User-Agent': NOMINATIM_USER_AGENT, Accept: 'application/json' };

      const response = await fetch(url, { headers });

      if (!response.ok) {
        return [];
      }

      const data = await response.json();
      const results: NominatimRawResult[] = Array.isArray(data)
        ? data
        : data?.results || [];

      if (!Array.isArray(results) || results.length === 0) {
        return [];
      }

      return results.map((r) => parseNominatimResult(r));
    } catch (err) {
      console.warn('[Geocoding] Non-blocking search notice:', err);
      return [];
    }
  },

  /**
   * Reverse Geocoding: converts coordinates (lat, lon) into human-readable address fields.
   */
  async reverse(
    latitude: number,
    longitude: number,
    fallbackCity = 'Metro City',
    fallbackState = 'Metro State'
  ): Promise<GeocodeAddress | null> {
    try {
      const isBrowser = typeof window !== 'undefined';
      const url = isBrowser
        ? `/api/geocode?lat=${latitude}&lon=${longitude}`
        : `${NOMINATIM_BASE_URL}/reverse?lat=${latitude}&lon=${longitude}&format=json&addressdetails=1`;

      const headers: Record<string, string> = isBrowser
        ? { Accept: 'application/json' }
        : { 'User-Agent': NOMINATIM_USER_AGENT, Accept: 'application/json' };

      const response = await fetch(url, { headers });

      if (!response.ok) {
        return null;
      }

      const data = await response.json();
      const raw: NominatimRawResult = data?.result || data;

      if (!raw || !raw.lat || !raw.lon) {
        return null;
      }

      return parseNominatimResult(raw, fallbackCity, fallbackState);
    } catch (err) {
      console.warn('[Geocoding] Non-blocking reverse notice:', err);
      return null;
    }
  },
};
