import path from "node:path";
import { fileURLToPath } from "node:url";
import dotenv from 'dotenv'

dotenv.config({path: '../.env'})

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
