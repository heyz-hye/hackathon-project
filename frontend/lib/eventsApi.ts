import { API_BASE } from "@/lib/api";

export type EventPin = {
  title: string;
  description: string;
  link: string;
  thumbnail: string | null;
  date: string;
  address: string;
  venue: string | null;
  ticket_info: { source?: string; link?: string; link_type?: string }[];
  lat: number;
  lng: number;
  distanceMiles?: number;
};

export type EventsMapResponse = {
  query: string;
  center: { lat: number; lng: number };
  radiusMiles: number;
  events: EventPin[];
  rawCount: number;
};

export async function fetchMapEvents(params: {
  query?: string;
  lat: number;
  lng: number;
  radiusMiles: number;
}): Promise<EventsMapResponse> {
  const sp = new URLSearchParams({
    lat: String(params.lat),
    lng: String(params.lng),
    radiusMiles: String(params.radiusMiles),
  });
  if (params.query?.trim()) {
    sp.set("query", params.query.trim());
  }
  const res = await fetch(`${API_BASE}/api/events?${sp.toString()}`);
  const data = (await res.json()) as EventsMapResponse & { error?: string };
  if (!res.ok) {
    throw new Error(data.error || `Events request failed (${res.status})`);
  }
  return data as EventsMapResponse;
}
