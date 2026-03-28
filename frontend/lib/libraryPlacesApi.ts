import type { LibrarySpot } from "@/lib/data";
import { WTC_DEFAULT } from "@/lib/geo";

const API_BASE =
  process.env.NEXT_PUBLIC_API_BASE_URL?.replace(/\/$/, "") ||
  "http://localhost:4001";

export type NearbyLibrariesResponse = {
  libraries: LibrarySpot[];
  center: { lat: number; lng: number };
  radiusMeters: number;
  defaultCenter: { lat: number; lng: number };
};

export type SearchLibrariesResponse = {
  libraries: LibrarySpot[];
  center: { lat: number; lng: number } | null;
  query: string;
  /** Server may expand area-only queries (e.g. "libraries in The Bronx"). */
  textQueryUsed?: string;
};

export type NearbyLibrariesResult =
  | { placesConfigured: false }
  | ({ placesConfigured: true } & NearbyLibrariesResponse);

export type SearchLibrariesResult =
  | { placesConfigured: false }
  | ({ placesConfigured: true } & SearchLibrariesResponse);

export async function fetchNearbyLibraries(
  lat: number,
  lng: number,
  radiusMeters = 4000
): Promise<NearbyLibrariesResult> {
  const params = new URLSearchParams({
    lat: String(lat),
    lng: String(lng),
    radiusMeters: String(radiusMeters),
  });
  const res = await fetch(
    `${API_BASE}/api/libraries/places/nearby?${params.toString()}`
  );
  const data = (await res.json()) as NearbyLibrariesResponse & {
    error?: string;
    code?: string;
  };
  if (res.status === 503 && data.code === "PLACES_NOT_CONFIGURED") {
    return { placesConfigured: false };
  }
  if (!res.ok) {
    throw new Error(data.error || `Request failed (${res.status})`);
  }
  return { placesConfigured: true, ...(data as NearbyLibrariesResponse) };
}

export async function searchLibraries(
  q: string
): Promise<SearchLibrariesResult> {
  const params = new URLSearchParams({ q: q.trim() });
  const res = await fetch(
    `${API_BASE}/api/libraries/places/search?${params.toString()}`
  );
  const data = (await res.json()) as SearchLibrariesResponse & {
    error?: string;
    code?: string;
  };
  if (res.status === 503 && data.code === "PLACES_NOT_CONFIGURED") {
    return { placesConfigured: false };
  }
  if (!res.ok) {
    throw new Error(data.error || `Request failed (${res.status})`);
  }
  return { placesConfigured: true, ...(data as SearchLibrariesResponse) };
}

export function wtcCenterTuple(): [number, number] {
  return [WTC_DEFAULT.lat, WTC_DEFAULT.lng];
}
