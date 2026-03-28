import { Router } from "express";
import {
  searchNearbyLibraries,
  searchLibrariesByText,
} from "../services/googlePlacesLibraries.js";
import {
  GOOGLE_PLACES_API_KEY,
  DEFAULT_MAP_LAT,
  DEFAULT_MAP_LNG,
} from "../config.js";

export function createLibraryPlacesRouter() {
  const router = Router();

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
        latRaw != null && latRaw !== ""
          ? Number(latRaw)
          : DEFAULT_MAP_LAT;
      const lng =
        lngRaw != null && lngRaw !== ""
          ? Number(lngRaw)
          : DEFAULT_MAP_LNG;
      if (!Number.isFinite(lat) || !Number.isFinite(lng)) {
        return res.status(400).json({ error: "Invalid lat or lng" });
      }
      const radiusMeters = req.query.radiusMeters
        ? Number(req.query.radiusMeters)
        : 4000;
      const payload = await searchNearbyLibraries({
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
      const payload = await searchLibrariesByText({
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
