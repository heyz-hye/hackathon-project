import { Router } from "express";
import {
  searchNearbyPantries,
  searchPantriesByText,
} from "../services/googlePlacesPantry.js";
import {
  GOOGLE_PLACES_API_KEY,
  DEFAULT_MAP_LAT,
  DEFAULT_MAP_LNG,
} from "../config.js";

const METERS_PER_MILE = 1609.344;

export function createPantryPlacesRouter() {
  const router = Router();

  /**
   * GET /api/pantry/places/nearby?lat=&lng=&radiusMiles=
   * radiusMiles defaults to 2 (max ~31 mi → capped by Places API 50km).
   */
  router.get("/nearby", async (req, res, next) => {
    try {
      if (!GOOGLE_PLACES_API_KEY) {
        return res.status(503).json({
          error: "Google Places is not configured",
          code: "PLACES_NOT_CONFIGURED",
          hint: "Set GOOGLE_PLACES_API_KEY in backend/.env (see .env.example).",
        });
      }
      const latRaw = req.query.lat;
      const lngRaw = req.query.lng;
      const lat =
        latRaw != null && latRaw !== "" ? Number(latRaw) : DEFAULT_MAP_LAT;
      const lng =
        lngRaw != null && lngRaw !== "" ? Number(lngRaw) : DEFAULT_MAP_LNG;
      if (!Number.isFinite(lat) || !Number.isFinite(lng)) {
        return res.status(400).json({ error: "Invalid lat or lng" });
      }

      let radiusMeters;
      if (req.query.radiusMeters != null && req.query.radiusMeters !== "") {
        radiusMeters = Number(req.query.radiusMeters);
      } else {
        const milesRaw = req.query.radiusMiles;
        const miles =
          milesRaw != null && milesRaw !== "" ? Number(milesRaw) : 2;
        if (!Number.isFinite(miles) || miles <= 0 || miles > 31) {
          return res.status(400).json({
            error: "radiusMiles must be a number between 0 and 31",
          });
        }
        radiusMeters = miles * METERS_PER_MILE;
      }
      if (!Number.isFinite(radiusMeters) || radiusMeters < 500) {
        return res.status(400).json({
          error: "Invalid radius (minimum ~0.2 miles)",
        });
      }

      const payload = await searchNearbyPantries({
        apiKey: GOOGLE_PLACES_API_KEY,
        lat,
        lng,
        radiusMeters,
      });
      res.json({
        ...payload,
        defaultCenter: { lat: DEFAULT_MAP_LAT, lng: DEFAULT_MAP_LNG },
      });
    } catch (e) {
      next(e);
    }
  });

  router.get("/search", async (req, res, next) => {
    try {
      if (!GOOGLE_PLACES_API_KEY) {
        return res.status(503).json({
          error: "Google Places is not configured",
          code: "PLACES_NOT_CONFIGURED",
          hint: "Set GOOGLE_PLACES_API_KEY in backend/.env (see .env.example).",
        });
      }
      const q = req.query.q;
      const payload = await searchPantriesByText({
        apiKey: GOOGLE_PLACES_API_KEY,
        query: q,
      });
      res.json(payload);
    } catch (e) {
      next(e);
    }
  });

  return router;
}
