import {
  DEFAULT_EVENTS_QUERY,
  DEFAULT_EVENTS_RADIUS_MILES,
  SERPAPI_API_KEY,
} from "../config.js";
import {
  geocodeAddressLine,
  haversineMiles,
} from "./geocodeAddress.js";

const NOMINATIM_DELAY_MS = 1100;
const MAX_EVENTS_TO_GEOCODE = 18;

function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

function normalizeEvent(raw) {
  const addressParts = Array.isArray(raw.address)
    ? raw.address
    : raw.address
      ? [String(raw.address)]
      : [];
  const addressLine = addressParts.join(", ").trim();
  const dateWhen = raw.date?.when ?? raw.date?.start_date ?? "";
  return {
    title: raw.title ?? "Event",
    description: raw.description ?? "",
    link: raw.link ?? "",
    thumbnail: raw.thumbnail ?? raw.image ?? null,
    date: dateWhen,
    address: addressLine,
    venue: raw.venue?.name ?? null,
    ticket_info: Array.isArray(raw.ticket_info) ? raw.ticket_info : [],
  };
}

/**
 * Fetch Google Events via SerpApi, geocode addresses, keep pins within radius of center.
 */
export async function fetchGoogleEventsForMap({
  query,
  centerLat,
  centerLng,
  radiusMiles = DEFAULT_EVENTS_RADIUS_MILES,
}) {
  if (!SERPAPI_API_KEY) {
    const err = new Error("SERPAPI_API_KEY is not set");
    err.statusCode = 503;
    throw err;
  }

  const q = (query && String(query).trim()) || DEFAULT_EVENTS_QUERY;
  const url = new URL("https://serpapi.com/search.json");
  url.searchParams.set("engine", "google_events");
  url.searchParams.set("q", q);
  url.searchParams.set("hl", "en");
  url.searchParams.set("gl", "us");
  url.searchParams.set("api_key", SERPAPI_API_KEY);

  const res = await fetch(url);
  if (!res.ok) {
    const err = new Error(`SerpApi error: ${res.status}`);
    err.statusCode = 502;
    throw err;
  }
  const json = await res.json();
  const results = Array.isArray(json.events_results) ? json.events_results : [];

  const normalized = results.map(normalizeEvent);
  const withCoords = [];

  for (let i = 0; i < Math.min(normalized.length, MAX_EVENTS_TO_GEOCODE); i++) {
    const ev = normalized[i];
    if (i > 0) await sleep(NOMINATIM_DELAY_MS);
    const pos = await geocodeAddressLine(ev.address);
    if (!pos) continue;
    const dist = haversineMiles(centerLat, centerLng, pos.lat, pos.lng);
    if (dist <= radiusMiles) {
      withCoords.push({
        ...ev,
        lat: pos.lat,
        lng: pos.lng,
        distanceMiles: dist,
      });
    }
  }

  return {
    query: q,
    center: { lat: centerLat, lng: centerLng },
    radiusMiles,
    events: withCoords,
    rawCount: results.length,
  };
}
