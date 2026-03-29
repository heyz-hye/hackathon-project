import type { Pantry } from "@/lib/data";
import { WTC_DEFAULT } from "@/lib/geo";

const API_BASE =
  process.env.NEXT_PUBLIC_API_BASE_URL?.replace(/\/$/, "") ||
  "http://localhost:4001";

export type NearbyPantriesResponse = {
  pantries: Pantry[];
  center: { lat: number; lng: number };
  radiusMeters: number;
  defaultCenter: { lat: number; lng: number };
};

export type SearchPantriesResponse = {
  pantries: Pantry[];
  center: { lat: number; lng: number } | null;
  query: string;
  textQueryUsed?: string;
};

export type NearbyPantriesResult =
  | { placesConfigured: false }
  | ({ placesConfigured: true } & NearbyPantriesResponse);

export type SearchPantriesResult =
  | { placesConfigured: false }
  | ({ placesConfigured: true } & SearchPantriesResponse);

export async function fetchNearbyPantries(
  lat: number,
  lng: number,
  radiusMiles = 2
): Promise<NearbyPantriesResult> {
  const params = new URLSearchParams({
    lat: String(lat),
    lng: String(lng),
    radiusMiles: String(radiusMiles),
  });
  const res = await fetch(
    `${API_BASE}/api/pantry/places/nearby?${params.toString()}`
  );
  const data = (await res.json()) as NearbyPantriesResponse & {
    error?: string;
    code?: string;
  };
  if (res.status === 503 && data.code === "PLACES_NOT_CONFIGURED") {
    return { placesConfigured: false };
  }
  if (!res.ok) {
    throw new Error(data.error || `Request failed (${res.status})`);
  }
  return { placesConfigured: true, ...(data as NearbyPantriesResponse) };
}

export async function searchPantries(
  q: string
): Promise<SearchPantriesResult> {
  const params = new URLSearchParams({ q: q.trim() });
  const res = await fetch(
    `${API_BASE}/api/pantry/places/search?${params.toString()}`
  );
  const data = (await res.json()) as SearchPantriesResponse & {
    error?: string;
    code?: string;
  };
  if (res.status === 503 && data.code === "PLACES_NOT_CONFIGURED") {
    return { placesConfigured: false };
  }
  if (!res.ok) {
    throw new Error(data.error || `Request failed (${res.status})`);
  }
  return { placesConfigured: true, ...(data as SearchPantriesResponse) };
}

export function wtcCenterTuple(): [number, number] {
  return [WTC_DEFAULT.lat, WTC_DEFAULT.lng];
}
