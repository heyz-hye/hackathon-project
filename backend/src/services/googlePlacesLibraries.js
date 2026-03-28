const NEARBY_URL = "https://places.googleapis.com/v1/places:searchNearby";
const TEXT_URL = "https://places.googleapis.com/v1/places:searchText";

/** Field mask required by Places API (New). */
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

/** Parses Places `weekdayDescriptions` like "Monday: 9:00 AM – 5:00 PM". */
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

/**
 * Maps a Places API place to our library shape.
 * Wi‑Fi is rarely exposed by Google Places for libraries; we surface "Unknown".
 */
export function mapGooglePlace(place) {
  const nameText =
    typeof place.displayName === "string"
      ? place.displayName
      : place.displayName?.text ?? "Library";
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
    wifi: "Unknown",
    noise: "Moderate",
    vibe: "Solo Focus",
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
  return places.map(mapGooglePlace).filter(Boolean);
}

/** Places Text Search needs library intent in the string; area-only queries like "The Bronx" fail with type-only filters. */
function libraryTextSearchQuery(userQuery) {
  const q = String(userQuery ?? "").trim();
  if (!q) return q;
  if (/\blibrar/i.test(q)) return q;
  return `libraries in ${q}`;
}

function isLibraryPlace(place) {
  if (place.primaryType === "library") return true;
  const types = place.types;
  return Array.isArray(types) && types.includes("library");
}

function centroidOf(libraries) {
  if (!libraries.length) return null;
  let lat = 0;
  let lng = 0;
  for (const lib of libraries) {
    lat += lib.lat;
    lng += lib.lng;
  }
  return {
    lat: lat / libraries.length,
    lng: lng / libraries.length,
  };
}

export async function searchNearbyLibraries({
  apiKey,
  lat,
  lng,
  radiusMeters = 4000,
}) {
  const radius = Math.min(50000, Math.max(500, Number(radiusMeters) || 4000));
  const data = await postPlaces(
    NEARBY_URL,
    {
      includedTypes: ["library"],
      maxResultCount: 20,
      locationRestriction: {
        circle: {
          center: { latitude: lat, longitude: lng },
          radius,
        },
      },
    },
    apiKey
  );
  const libraries = mapPlacesList(data.places);
  return {
    libraries,
    center: { lat, lng },
    radiusMeters: radius,
  };
}

export async function searchLibrariesByText({ apiKey, query }) {
  const q = String(query ?? "").trim();
  if (q.length < 2) {
    const err = new Error("Query must be at least 2 characters");
    err.status = 400;
    throw err;
  }
  const textQuery = libraryTextSearchQuery(q);
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
  const libraryPlaces = raw.filter(isLibraryPlace);
  const libraries = mapPlacesList(libraryPlaces);
  const center = centroidOf(libraries);
  return {
    libraries,
    center,
    query: q,
    textQueryUsed: textQuery,
  };
}
