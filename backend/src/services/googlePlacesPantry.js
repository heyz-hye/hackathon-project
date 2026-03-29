const TEXT_URL = "https://places.googleapis.com/v1/places:searchText";

const FIELD_MASK = [
  "places.id",
  "places.name",
  "places.displayName",
  "places.formattedAddress",
  "places.location",
  "places.regularOpeningHours",
  "places.currentOpeningHours",
  "places.primaryType",
  "places.types",
].join(",");

function formatOpeningHours(place) {
  const rh = place.regularOpeningHours ?? place.currentOpeningHours;
  const lines = rh?.weekdayDescriptions;
  if (Array.isArray(lines) && lines.length > 0) {
    return lines.join(" · ");
  }
  if (typeof rh?.openNow === "boolean") {
    return rh.openNow
      ? "Open now (full hours not listed)"
      : "Closed now (full hours not listed)";
  }
  return "Hours not listed";
}

function buildHoursByDay(place) {
  const rh = place.regularOpeningHours ?? place.currentOpeningHours;
  const lines = rh?.weekdayDescriptions;
  if (!Array.isArray(lines) || lines.length === 0) return [];
  return lines.map((line) => {
    const s = String(line);
    const idx = s.indexOf(":");
    if (idx === -1) return { day: s.trim(), hours: "" };
    return {
      day: s.slice(0, idx).trim(),
      hours: s.slice(idx + 1).trim(),
    };
  });
}

function formatTypeNote(place) {
  const pt = place.primaryType;
  if (typeof pt === "string" && pt.length > 0) {
    return pt
      .split("_")
      .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
      .join(" ");
  }
  const types = place.types;
  if (Array.isArray(types) && types.includes("food_bank")) {
    return "Food bank";
  }
  return "Community food resource — verify hours before visiting.";
}

export function mapGooglePlaceToPantry(place) {
  const nameText =
    typeof place.displayName === "string"
      ? place.displayName
      : place.displayName?.text ?? "Food assistance location";
  const lat = place.location?.latitude;
  const lng = place.location?.longitude;
  if (typeof lat !== "number" || typeof lng !== "number") return null;
  const hoursByDay = buildHoursByDay(place);
  return {
    id: place.name || place.id,
    name: nameText,
    address: place.formattedAddress ?? "",
    hours: formatOpeningHours(place),
    ...(hoursByDay.length > 0 ? { hoursByDay } : {}),
    note: formatTypeNote(place),
    lat,
    lng,
  };
}

async function postPlaces(url, body, apiKey) {
  const res = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-Goog-Api-Key": apiKey,
      "X-Goog-FieldMask": FIELD_MASK,
    },
    body: JSON.stringify(body),
  });
  const text = await res.text();
  let data;
  try {
    data = text ? JSON.parse(text) : {};
  } catch {
    const err = new Error(`Places API returned non-JSON: ${text.slice(0, 200)}`);
    err.status = 502;
    throw err;
  }
  if (!res.ok) {
    const msg =
      data.error?.message || data.message || text || res.statusText || "Places API error";
    const err = new Error(msg);
    err.status = res.status >= 400 && res.status < 600 ? res.status : 502;
    throw err;
  }
  return data;
}

function mapPlacesList(places) {
  if (!Array.isArray(places)) return [];
  return places.map(mapGooglePlaceToPantry).filter(Boolean);
}

function centroidOf(items) {
  if (!items.length) return null;
  let lat = 0;
  let lng = 0;
  for (const p of items) {
    lat += p.lat;
    lng += p.lng;
  }
  return {
    lat: lat / items.length,
    lng: lng / items.length,
  };
}

function dist2(aLat, aLng, bLat, bLng) {
  const dLat = aLat - bLat;
  const dLng = aLng - bLng;
  return dLat * dLat + dLng * dLng;
}

function sortByDistanceFrom(pantries, centerLat, centerLng) {
  return [...pantries].sort(
    (a, b) =>
      dist2(centerLat, centerLng, a.lat, a.lng) -
      dist2(centerLat, centerLng, b.lat, b.lng)
  );
}

/** Haversine distance in meters (Earth sphere). */
function haversineMeters(lat1, lng1, lat2, lng2) {
  const R = 6371000;
  const toRad = (d) => (d * Math.PI) / 180;
  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) *
      Math.cos(toRad(lat2)) *
      Math.sin(dLng / 2) ** 2;
  return 2 * R * Math.asin(Math.min(1, Math.sqrt(a)));
}

/** Area-only queries need intent words so Places returns food assistance, not generic POIs. */
function pantryTextSearchQuery(userQuery) {
  const q = String(userQuery ?? "").trim();
  if (!q) return q;
  if (/\b(pantry|soup|kitchen|food\s*bank|meal|grocer|hunger)\b/i.test(q)) {
    return q;
  }
  return `food pantries soup kitchens and food banks near ${q}`;
}

function isPantryRelatedPlace(place) {
  const pt = place.primaryType ?? "";
  if (pt === "food_bank") return true;
  const types = place.types;
  if (Array.isArray(types) && types.includes("food_bank")) return true;
  const name = (
    typeof place.displayName === "string"
      ? place.displayName
      : place.displayName?.text ?? ""
  ).toLowerCase();
  if (
    /food pantry|soup kitchen|food bank|meal program|community kitchen|feeding|hunger|groceries for free/i.test(
      name
    )
  ) {
    return true;
  }
  return false;
}

const NEARBY_TEXT_QUERY =
  "food pantry food bank soup kitchen hunger relief meal assistance";

/**
 * Nearby search: `searchNearby` does not support `food_bank` ("Unsupported types:
 * food_bank"). Text Search `locationRestriction` only allows a **rectangle**, not
 * a circle — use `locationBias` + circle, then filter by radius on our side.
 */
export async function searchNearbyPantries({
  apiKey,
  lat,
  lng,
  radiusMeters,
}) {
  const radius = Math.min(50000, Math.max(500, Number(radiusMeters) || 3219));
  const data = await postPlaces(
    TEXT_URL,
    {
      textQuery: NEARBY_TEXT_QUERY,
      maxResultCount: 20,
      languageCode: "en",
      regionCode: "US",
      rankPreference: "DISTANCE",
      locationBias: {
        circle: {
          center: { latitude: lat, longitude: lng },
          radius,
        },
      },
    },
    apiKey
  );
  const raw = Array.isArray(data.places) ? data.places : [];
  const relevant = raw.filter(isPantryRelatedPlace);
  const toMap = relevant.length > 0 ? relevant : raw;
  let pantries = mapPlacesList(toMap);
  pantries = pantries.filter(
    (p) => haversineMeters(lat, lng, p.lat, p.lng) <= radius
  );
  pantries = sortByDistanceFrom(pantries, lat, lng);
  return {
    pantries,
    center: { lat, lng },
    radiusMeters: radius,
  };
}

export async function searchPantriesByText({ apiKey, query }) {
  const q = String(query ?? "").trim();
  if (q.length < 2) {
    const err = new Error("Query must be at least 2 characters");
    err.status = 400;
    throw err;
  }
  const textQuery = pantryTextSearchQuery(q);
  const data = await postPlaces(
    TEXT_URL,
    {
      textQuery,
      maxResultCount: 20,
      languageCode: "en",
      regionCode: "US",
    },
    apiKey
  );
  const raw = Array.isArray(data.places) ? data.places : [];
  const relevant = raw.filter(isPantryRelatedPlace);
  let pantries = mapPlacesList(relevant);
  const center = centroidOf(pantries);
  return {
    pantries,
    center,
    query: q,
    textQueryUsed: textQuery,
  };
}
