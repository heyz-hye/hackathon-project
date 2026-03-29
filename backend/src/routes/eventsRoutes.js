import { Router } from "express";
import {
  DEFAULT_EVENTS_RADIUS_MILES,
  DEFAULT_MAP_LAT,
  DEFAULT_MAP_LNG,
} from "../config.js";
import { fetchGoogleEventsForMap } from "../services/serpApiGoogleEvents.js";

export function createEventsRouter() {
  const router = Router();

  /**
   * GET /api/events?query=&lat=&lng=&radiusMiles=
   * Public endpoint (map is useful before login); can be protected later if needed.
   */
  router.get("/", async (req, res, next) => {
    try {
      const query = req.query.query ?? req.query.q;
      const lat = Number(req.query.lat ?? DEFAULT_MAP_LAT);
      const lng = Number(req.query.lng ?? DEFAULT_MAP_LNG);
      const radiusMiles = Number(
        req.query.radiusMiles ?? DEFAULT_EVENTS_RADIUS_MILES
      );

      if (!Number.isFinite(lat) || !Number.isFinite(lng)) {
        return res.status(400).json({ error: "lat and lng must be numbers" });
      }
      if (!Number.isFinite(radiusMiles) || radiusMiles <= 0 || radiusMiles > 125) {
        return res.status(400).json({
          error: "radiusMiles must be a number between 0 and 125",
        });
      }

      const payload = await fetchGoogleEventsForMap({
        query: query ? String(query) : undefined,
        centerLat: lat,
        centerLng: lng,
        radiusMiles,
      });

      return res.json(payload);
    } catch (e) {
      const code = e.statusCode || 500;
      if (code >= 400 && code < 500) {
        return res.status(code).json({ error: e.message });
      }
      if (e.statusCode === 503) {
        return res.status(503).json({ error: e.message });
      }
      next(e);
    }
  });

  return router;
}
