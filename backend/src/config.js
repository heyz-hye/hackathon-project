import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export const PORT = Number(process.env.PORT) || 4001;

/** Writable JSON file for dev/temp persistence (gitignored). */
export const DATA_FILE = process.env.DATA_FILE
  ? path.resolve(process.env.DATA_FILE)
  : path.join(__dirname, "..", "data", "data.json");

/** Google Cloud API key with Places API (New) enabled (server-side only). */
export const GOOGLE_PLACES_API_KEY = process.env.GOOGLE_PLACES_API_KEY ?? "";

/**
 * Default map anchor when the user does not share location (World Trade Center area).
 * Override with DEFAULT_MAP_LAT / DEFAULT_MAP_LNG in .env if needed.
 */
export const DEFAULT_MAP_LAT = Number(process.env.DEFAULT_MAP_LAT) || 40.712746;
export const DEFAULT_MAP_LNG = Number(process.env.DEFAULT_MAP_LNG) || -74.013427;

/** SerpApi key for Google Events (`engine=google_events`). */
export const SERPAPI_API_KEY = process.env.SERPAPI_API_KEY ?? "";

/** Supabase (server-side service role for API routes). */
export const SUPABASE_URL = process.env.SUPABASE_URL ?? "";
export const SUPABASE_SERVICE_ROLE_KEY =
  process.env.SUPABASE_SERVICE_ROLE_KEY ?? "";

/** JWT for session tokens returned by /api/auth/* */
export const JWT_SECRET = process.env.JWT_SECRET ?? "dev-only-change-me";
export const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || "7d";

/** Default events search when the client does not send a query. */
export const DEFAULT_EVENTS_QUERY =
  process.env.DEFAULT_EVENTS_QUERY || "Events in New York";

/**
 * Search radius on the map / geocode filter (miles).
 * Overridable per request via query param `radiusMiles`.
 */
export const DEFAULT_EVENTS_RADIUS_MILES = Number(
  process.env.DEFAULT_EVENTS_RADIUS_MILES || "8"
);
