import { NextRequest, NextResponse } from 'next/server';

const NOMINATIM_BASE = 'https://nominatim.openstreetmap.org';
const USER_AGENT = 'ProblemPulse-CivicApp/1.0 (contact: support@problempulse.local)';

// In-memory cache for geocoding queries
const queryCache = new Map<string, any>();
const reverseCache = new Map<string, any>();

// Rate-limiting timestamp: ensure at least 1000ms between calls to Nominatim
let lastCallTimestamp = 0;

async function rateLimitedFetch(url: string): Promise<Response> {
  const now = Date.now();
  const timeSinceLastCall = now - lastCallTimestamp;
  if (timeSinceLastCall < 1000) {
    await new Promise((resolve) => setTimeout(resolve, 1000 - timeSinceLastCall));
  }
  lastCallTimestamp = Date.now();

  return fetch(url, {
    headers: {
      'User-Agent': USER_AGENT,
      Accept: 'application/json',
    },
  });
}

// Comprehensive civic landmarks, localities, and roads for instant resolution
const KNOWN_PLACES: Record<string, { lat: number; lon: number; display_name: string; address: any }> = {
  'mg road': {
    lat: 12.975526,
    lon: 77.606790,
    display_name: 'Mahatma Gandhi Road, Ashok Nagar, Bengaluru, Karnataka, 560001, India',
    address: { road: 'MG Road', suburb: 'Ashok Nagar', city: 'Bengaluru', state: 'Karnataka' },
  },
  'brigade road': {
    lat: 12.971950,
    lon: 77.607020,
    display_name: 'Brigade Road, Shanthala Nagar, Bengaluru, Karnataka, 560025, India',
    address: { road: 'Brigade Road', suburb: 'Shanthala Nagar', city: 'Bengaluru', state: 'Karnataka' },
  },
  'commercial street': {
    lat: 12.982230,
    lon: 77.608300,
    display_name: 'Commercial Street, Tasker Town, Bengaluru, Karnataka, 560001, India',
    address: { road: 'Commercial Street', suburb: 'Tasker Town', city: 'Bengaluru', state: 'Karnataka' },
  },
  'indiranagar': {
    lat: 12.978369,
    lon: 77.640836,
    display_name: 'Indiranagar, Bengaluru, Bangalore East, Karnataka, 560038, India',
    address: { road: '100 Feet Rd', suburb: 'Indiranagar', city: 'Bengaluru', state: 'Karnataka' },
  },
  '100 feet road': {
    lat: 12.971600,
    lon: 77.641200,
    display_name: '100 Feet Road, Indiranagar, Bengaluru, Karnataka, 560038, India',
    address: { road: '100 Feet Road', suburb: 'Indiranagar', city: 'Bengaluru', state: 'Karnataka' },
  },
  'cmh road': {
    lat: 12.978900,
    lon: 77.644100,
    display_name: 'Chinmaya Mission Hospital Road, Indiranagar, Bengaluru, Karnataka, 560038, India',
    address: { road: 'CMH Road', suburb: 'Indiranagar', city: 'Bengaluru', state: 'Karnataka' },
  },
  'koramangala': {
    lat: 12.935193,
    lon: 77.624481,
    display_name: 'Koramangala, Bengaluru, Bangalore South, Karnataka, 560034, India',
    address: { road: '80 Feet Rd', suburb: 'Koramangala', city: 'Bengaluru', state: 'Karnataka' },
  },
  '80 feet road': {
    lat: 12.937200,
    lon: 77.626900,
    display_name: '80 Feet Road, Koramangala 4th Block, Bengaluru, Karnataka, 560034, India',
    address: { road: '80 Feet Road', suburb: 'Koramangala', city: 'Bengaluru', state: 'Karnataka' },
  },
  'whitefield': {
    lat: 12.969819,
    lon: 77.749977,
    display_name: 'Whitefield, Bengaluru, Bangalore East, Karnataka, 560066, India',
    address: { road: 'ITPL Main Rd', suburb: 'Whitefield', city: 'Bengaluru', state: 'Karnataka' },
  },
  'marathahalli': {
    lat: 12.959172,
    lon: 77.697419,
    display_name: 'Marathahalli, Bengaluru, Karnataka, 560037, India',
    address: { road: 'Varthur Rd', suburb: 'Marathahalli', city: 'Bengaluru', state: 'Karnataka' },
  },
  'hsr layout': {
    lat: 12.912118,
    lon: 77.644555,
    display_name: 'HSR Layout, Bengaluru, Karnataka, 560102, India',
    address: { road: '27th Main Rd', suburb: 'HSR Layout', city: 'Bengaluru', state: 'Karnataka' },
  },
  'btm layout': {
    lat: 12.916576,
    lon: 77.610116,
    display_name: 'BTM Layout, Bengaluru, Karnataka, 560068, India',
    address: { road: 'Outer Ring Rd', suburb: 'BTM Layout', city: 'Bengaluru', state: 'Karnataka' },
  },
  'electronic city': {
    lat: 12.839939,
    lon: 77.677003,
    display_name: 'Electronic City, Bengaluru, Karnataka, 560100, India',
    address: { road: 'Hosur Rd', suburb: 'Electronic City', city: 'Bengaluru', state: 'Karnataka' },
  },
  'jayanagar': {
    lat: 12.930774,
    lon: 77.583830,
    display_name: 'Jayanagar, Bengaluru, Karnataka, 560011, India',
    address: { road: '9th Main Rd', suburb: 'Jayanagar', city: 'Bengaluru', state: 'Karnataka' },
  },
  'jp nagar': {
    lat: 12.906343,
    lon: 77.585689,
    display_name: 'JP Nagar, Bengaluru, Karnataka, 560078, India',
    address: { road: '24th Main Rd', suburb: 'JP Nagar', city: 'Bengaluru', state: 'Karnataka' },
  },
  'banashankari': {
    lat: 12.925453,
    lon: 77.546757,
    display_name: 'Banashankari, Bengaluru, Karnataka, 560085, India',
    address: { road: '100 Feet Ring Rd', suburb: 'Banashankari', city: 'Bengaluru', state: 'Karnataka' },
  },
  'basavanagudi': {
    lat: 12.942120,
    lon: 77.575310,
    display_name: 'Basavanagudi, Bengaluru, Karnataka, 560004, India',
    address: { road: 'DVG Road', suburb: 'Basavanagudi', city: 'Bengaluru', state: 'Karnataka' },
  },
  'malleshwaram': {
    lat: 12.998845,
    lon: 77.570325,
    display_name: 'Malleshwaram, Bengaluru, Karnataka, 560003, India',
    address: { road: 'Sampige Rd', suburb: 'Malleshwaram', city: 'Bengaluru', state: 'Karnataka' },
  },
  'rajajinagar': {
    lat: 12.998184,
    lon: 77.553045,
    display_name: 'Rajajinagar, Bengaluru, Karnataka, 560010, India',
    address: { road: 'Dr Rajkumar Rd', suburb: 'Rajajinagar', city: 'Bengaluru', state: 'Karnataka' },
  },
  'hebbal': {
    lat: 13.035870,
    lon: 77.597022,
    display_name: 'Hebbal, Bengaluru, Karnataka, 560024, India',
    address: { road: 'Bellary Rd', suburb: 'Hebbal', city: 'Bengaluru', state: 'Karnataka' },
  },
  'yeshwanthpur': {
    lat: 13.028045,
    lon: 77.540902,
    display_name: 'Yeshwanthpur, Bengaluru, Karnataka, 560022, India',
    address: { road: 'Tumkur Rd', suburb: 'Yeshwanthpur', city: 'Bengaluru', state: 'Karnataka' },
  },
  'bellandur': {
    lat: 12.926031,
    lon: 77.676246,
    display_name: 'Bellandur, Bengaluru, Karnataka, 560103, India',
    address: { road: 'Outer Ring Rd', suburb: 'Bellandur', city: 'Bengaluru', state: 'Karnataka' },
  },
  'sarjapur': {
    lat: 12.911600,
    lon: 77.674400,
    display_name: 'Sarjapur Road, Bengaluru, Karnataka, 560035, India',
    address: { road: 'Sarjapur Main Rd', suburb: 'Sarjapur', city: 'Bengaluru', state: 'Karnataka' },
  },
  'domlur': {
    lat: 12.960986,
    lon: 77.638732,
    display_name: 'Domlur, Bengaluru, Karnataka, 560071, India',
    address: { road: 'Intermediate Ring Rd', suburb: 'Domlur', city: 'Bengaluru', state: 'Karnataka' },
  },
  'majestic': {
    lat: 12.976690,
    lon: 77.571255,
    display_name: 'Kempegowda Bus Station (Majestic), Bengaluru, Karnataka, 560009, India',
    address: { road: 'Gubbi Thotadappa Rd', suburb: 'Majestic', city: 'Bengaluru', state: 'Karnataka' },
  },
  'bangalore': {
    lat: 12.971599,
    lon: 77.594566,
    display_name: 'Bengaluru, Bangalore Urban, Karnataka, India',
    address: { city: 'Bengaluru', state: 'Karnataka', country: 'India' },
  },
  'bengaluru': {
    lat: 12.971599,
    lon: 77.594566,
    display_name: 'Bengaluru, Bangalore Urban, Karnataka, India',
    address: { city: 'Bengaluru', state: 'Karnataka', country: 'India' },
  },
};

function findKnownPlace(query: string) {
  const q = query.toLowerCase().trim();
  for (const [key, val] of Object.entries(KNOWN_PLACES)) {
    // Exact or substring match for known locality/road
    if (q === key || q.includes(key)) {
      return [{
        place_id: 999900 + Math.floor(Math.random() * 100),
        lat: String(val.lat),
        lon: String(val.lon),
        display_name: val.display_name,
        name: key.toUpperCase(),
        address: val.address,
      }];
    }
  }
  return null;
}

/**
 * Intelligent query relaxation: cleans descriptive landmark tokens
 * ("pothole", "near metro station", "opp hospital", "gate 2", "door 42")
 * to extract the actual searchable street, cross, main, or area.
 */
function generateQueryCandidates(raw: string): string[] {
  const candidates: string[] = [];
  const trimmed = raw.trim();
  candidates.push(trimmed);

  // Clean stop words and descriptors
  const cleanRegex = /\b(pothole|potholes|broken|damaged|leak|leakage|garbage|trash|waste|light|street light|problem|issue|damage|overflow|drainage|water|near|next to|opposite to|opposite|opp|behind|beside|in front of|close to|around|adjacent to|at|on|the|a|an|gate \d+|door \d+|flat \d+|shop \d+|pillar \d+|no \d+|house no|metro station|bus stop|bus stand|signal|junction|circle)\b/gi;

  const cleaned = trimmed.replace(cleanRegex, ' ').replace(/\s+/g, ' ').trim();
  if (cleaned && cleaned !== trimmed && cleaned.length >= 3) {
    candidates.push(cleaned);
  }

  // Comma split handling
  if (trimmed.includes(',')) {
    const parts = trimmed.split(',').map((p) => p.trim()).filter(Boolean);
    const validParts = parts.filter(
      (p) => !/^(near|opp|opposite|behind|in front of|beside|gate|door|flat|pillar)\b/i.test(p)
    );

    if (validParts.length > 0) {
      const combined = validParts.join(', ');
      if (combined !== trimmed && combined.length >= 3) {
        candidates.push(combined);
      }

      for (const part of validParts) {
        const cleanedPart = part.replace(cleanRegex, ' ').replace(/\s+/g, ' ').trim();
        if (cleanedPart.length >= 3) {
          candidates.push(cleanedPart);
          // If part doesn't mention Bengaluru/Bangalore, also try appending it
          if (!cleanedPart.toLowerCase().includes('bengaluru') && !cleanedPart.toLowerCase().includes('bangalore')) {
            candidates.push(`${cleanedPart}, Bengaluru`);
          }
        }
      }
    }
  }

  // Deduplicate while preserving priority order
  return Array.from(new Set(candidates)).filter((c) => c.length >= 3);
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const q = searchParams.get('q');
  const lat = searchParams.get('lat');
  const lon = searchParams.get('lon');
  const limit = searchParams.get('limit') || '5';

  try {
    // 1. Forward Geocoding
    if (q) {
      const cacheKey = q.trim().toLowerCase();
      if (queryCache.has(cacheKey)) {
        return NextResponse.json({ success: true, results: queryCache.get(cacheKey) });
      }

      // Check known places dictionary first
      const localMatch = findKnownPlace(cacheKey);
      if (localMatch) {
        queryCache.set(cacheKey, localMatch);
        return NextResponse.json({ success: true, results: localMatch });
      }

      // Generate relaxed candidate queries
      const candidates = generateQueryCandidates(q);

      for (const candidate of candidates) {
        // Check candidate against known places
        const candLocal = findKnownPlace(candidate);
        if (candLocal) {
          queryCache.set(cacheKey, candLocal);
          return NextResponse.json({ success: true, results: candLocal });
        }

        try {
          const nominatimUrl = `${NOMINATIM_BASE}/search?q=${encodeURIComponent(
            candidate
          )}&format=json&limit=${limit}&addressdetails=1`;

          const res = await rateLimitedFetch(nominatimUrl);

          if (res.ok) {
            const data = await res.json();
            if (Array.isArray(data) && data.length > 0) {
              queryCache.set(cacheKey, data);
              return NextResponse.json({ success: true, results: data });
            }
          }
        } catch {
          // Continue to next candidate
        }
      }

      // If all candidates yielded 0 in Nominatim, check if any token matches an area
      for (const [key, val] of Object.entries(KNOWN_PLACES)) {
        if (cacheKey.includes(key)) {
          const fallback = [{
            place_id: 999950,
            lat: String(val.lat),
            lon: String(val.lon),
            display_name: `${q.trim()}, ${val.display_name}`,
            name: key.toUpperCase(),
            address: val.address,
          }];
          queryCache.set(cacheKey, fallback);
          return NextResponse.json({ success: true, results: fallback });
        }
      }

      return NextResponse.json({ success: true, results: [] });
    }

    // 2. Reverse Geocoding
    if (lat && lon) {
      const roundedLat = Number(parseFloat(lat).toFixed(4));
      const roundedLon = Number(parseFloat(lon).toFixed(4));
      const cacheKey = `${roundedLat},${roundedLon}`;

      if (reverseCache.has(cacheKey)) {
        return NextResponse.json({ success: true, result: reverseCache.get(cacheKey) });
      }

      try {
        const nominatimUrl = `${NOMINATIM_BASE}/reverse?lat=${roundedLat}&lon=${roundedLon}&format=json&addressdetails=1`;
        const res = await rateLimitedFetch(nominatimUrl);

        if (res.ok) {
          const data = await res.json();
          reverseCache.set(cacheKey, data);
          return NextResponse.json({ success: true, result: data });
        }

        return NextResponse.json({
          success: true,
          result: {
            lat: String(roundedLat),
            lon: String(roundedLon),
            display_name: 'Pinned Location on Map',
            address: {
              road: 'Pinned Location',
              suburb: 'Central Ward',
              city: 'Bengaluru',
              state: 'Karnataka',
            },
          },
        });
      } catch {
        return NextResponse.json({
          success: true,
          result: {
            lat: String(roundedLat),
            lon: String(roundedLon),
            display_name: 'Pinned Location on Map',
            address: {
              road: 'Pinned Location',
              suburb: 'Central Ward',
              city: 'Bengaluru',
              state: 'Karnataka',
            },
          },
        });
      }
    }

    return NextResponse.json(
      { success: false, message: 'Missing "q" or "lat" & "lon" parameters.' },
      { status: 400 }
    );
  } catch (error: any) {
    return NextResponse.json(
      { success: true, results: [], result: null, error: error.message },
      { status: 200 }
    );
  }
}
