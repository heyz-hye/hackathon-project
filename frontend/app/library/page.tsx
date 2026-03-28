"use client";

import dynamic from "next/dynamic";
import LibraryCard from "@/components/LibraryCard";
import PageHeader from "@/components/PageHeader";
import type { LibrarySpot } from "@/lib/data";
import { WTC_DEFAULT } from "@/lib/geo";
import {
  fetchNearbyLibraries,
  searchLibraries,
  wtcCenterTuple,
} from "@/lib/libraryPlacesApi";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";

type LatLng = { lat: number; lng: number };

const MapLoader = dynamic(() => import("@/components/MapView"), {
  ssr: false,
  loading: () => (
    <div className="flex h-[min(420px,55vh)] min-h-[320px] items-center justify-center rounded-xl border border-[rgba(192,57,43,0.25)] bg-[#120A0A] font-mono text-sm text-[#A89090] sm:h-[480px]">
      Initializing map…
    </div>
  ),
});

const NEARBY_RADIUS_M = 4000;
const SEARCH_DEBOUNCE_MS = 450;
const MIN_SEARCH_LEN = 3;

export default function LibraryPage() {
  const [libraries, setLibraries] = useState<LibrarySpot[]>([]);
  const [mapCenter, setMapCenter] = useState<[number, number]>(wtcCenterTuple);
  const [mapZoom, setMapZoom] = useState(13);
  /** Center used for “nearby” when the area search box is cleared. */
  const [referenceCenter, setReferenceCenter] = useState<LatLng>(WTC_DEFAULT);
  const referenceCenterRef = useRef<LatLng>(WTC_DEFAULT);
  const [areaQuery, setAreaQuery] = useState("");
  const [filterText, setFilterText] = useState("");
  const [vibe, setVibe] = useState<string>("all");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [placesConfigured, setPlacesConfigured] = useState(true);
  const [locationPrompted, setLocationPrompted] = useState(false);
  const [userPosition, setUserPosition] = useState<LatLng | null>(null);
  const [locationSharing, setLocationSharing] = useState(false);
  const skipEmptyDebounce = useRef(true);
  const ignoreNextEmptyAreaFetch = useRef(false);
  /** Ignore stale responses when a newer area search was started. */
  const areaSearchGeneration = useRef(0);

  useEffect(() => {
    referenceCenterRef.current = referenceCenter;
  }, [referenceCenter]);

  useEffect(() => {
    if (!locationSharing || !navigator.geolocation) return;
    const watchId = navigator.geolocation.watchPosition(
      (pos) => {
        setUserPosition({
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
        });
      },
      () => {
        setLocationSharing(false);
        setUserPosition(null);
      },
      { enableHighAccuracy: true, maximumAge: 15_000, timeout: 25_000 }
    );
    return () => navigator.geolocation.clearWatch(watchId);
  }, [locationSharing]);

  const loadNearby = useCallback(async (lat: number, lng: number) => {
    const gen = ++areaSearchGeneration.current;
    setLoading(true);
    setError(null);
    try {
      const result = await fetchNearbyLibraries(lat, lng, NEARBY_RADIUS_M);
      if (gen !== areaSearchGeneration.current) return;
      if (!result.placesConfigured) {
        setPlacesConfigured(false);
        setLibraries([]);
        setMapCenter([lat, lng]);
        setMapZoom(13);
        return;
      }
      setPlacesConfigured(true);
      setLibraries(result.libraries);
      setMapCenter([result.center.lat, result.center.lng]);
      setMapZoom(13);
    } catch (e) {
      if (gen !== areaSearchGeneration.current) return;
      setError(e instanceof Error ? e.message : "Failed to load libraries");
      setLibraries([]);
    } finally {
      if (gen === areaSearchGeneration.current) setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadNearby(WTC_DEFAULT.lat, WTC_DEFAULT.lng);
  }, [loadNearby]);

  const runAreaSearch = useCallback(async (q: string) => {
    const gen = ++areaSearchGeneration.current;
    setLoading(true);
    setError(null);
    try {
      const result = await searchLibraries(q);
      if (gen !== areaSearchGeneration.current) return;
      if (!result.placesConfigured) {
        setPlacesConfigured(false);
        setLibraries([]);
        return;
      }
      setPlacesConfigured(true);
      setLibraries(result.libraries);
      if (result.center) {
        setMapCenter([result.center.lat, result.center.lng]);
        setMapZoom(12);
      }
    } catch (e) {
      if (gen !== areaSearchGeneration.current) return;
      setError(e instanceof Error ? e.message : "Search failed");
      setLibraries([]);
    } finally {
      if (gen === areaSearchGeneration.current) setLoading(false);
    }
  }, []);

  useEffect(() => {
    const q = areaQuery.trim();
    const timer = window.setTimeout(() => {
      if (q.length >= MIN_SEARCH_LEN) {
        runAreaSearch(q);
        return;
      }
      if (q.length === 0) {
        if (skipEmptyDebounce.current) {
          skipEmptyDebounce.current = false;
          return;
        }
        if (ignoreNextEmptyAreaFetch.current) {
          ignoreNextEmptyAreaFetch.current = false;
          return;
        }
        const { lat, lng } = referenceCenterRef.current;
        loadNearby(lat, lng);
      }
    }, SEARCH_DEBOUNCE_MS);
    return () => window.clearTimeout(timer);
  }, [areaQuery, loadNearby, runAreaSearch]);

  const requestUserLocation = () => {
    setLocationPrompted(true);
    if (!navigator.geolocation) {
      setError("Geolocation is not supported in this browser.");
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const lat = pos.coords.latitude;
        const lng = pos.coords.longitude;
        const next = { lat, lng };
        setUserPosition(next);
        setLocationSharing(true);
        setReferenceCenter(next);
        referenceCenterRef.current = next;
        ignoreNextEmptyAreaFetch.current = true;
        setAreaQuery("");
        loadNearby(lat, lng);
        setMapCenter([lat, lng]);
        setMapZoom(14);
      },
      () => {
        setLocationSharing(false);
        setUserPosition(null);
        setError(
          "Location permission denied — showing libraries near the default NYC (WTC) area instead."
        );
      },
      { enableHighAccuracy: true, timeout: 15000, maximumAge: 60_000 }
    );
  };

  const filtered = useMemo(() => {
    let list = libraries;
    const s = filterText.trim().toLowerCase();
    if (s) {
      list = list.filter(
        (l) =>
          l.name.toLowerCase().includes(s) ||
          l.address.toLowerCase().includes(s) ||
          l.wifi.toLowerCase().includes(s)
      );
    }
    if (vibe !== "all") {
      list = list.filter((l) => l.vibe === vibe);
    }
    return list;
  }, [libraries, filterText, vibe]);

  return (
    <main className="pb-16">
      <PageHeader
        backgroundWord="LIBRARY"
        title="Libraries & study spots"
        subtitle="Live library search via Google Places: addresses, hours when available, and Wi‑Fi status when Places lists it (often unknown)."
      />

      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <div className="mb-4 flex flex-col gap-3 rounded-xl border border-[rgba(192,57,43,0.2)] bg-[rgba(26,13,13,0.45)] p-4 sm:flex-row sm:items-center sm:justify-between">
          <p className="font-sans text-sm text-[#A89090]">
            By default we show libraries near the{" "}
            <span className="text-[#F5F5F5]">World Trade Center</span> area. Use
            your location to center the map nearby, or search another city or
            neighborhood below.
          </p>
          <button
            type="button"
            onClick={requestUserLocation}
            className="shrink-0 rounded-lg border border-[rgba(255,107,107,0.45)] bg-[rgba(192,57,43,0.2)] px-4 py-2 font-mono text-xs uppercase tracking-wider text-[#FF6B6B] transition hover:border-[rgba(255,107,107,0.8)] hover:bg-[rgba(192,57,43,0.35)]"
          >
            {locationPrompted ? "Retry location" : "Use my location"}
          </button>
        </div>

        <div className="relative">
          {loading ? (
            <div className="pointer-events-none absolute inset-0 z-[500] flex items-center justify-center rounded-xl bg-[rgba(10,10,15,0.35)] font-mono text-sm text-[#A89090]">
              Loading libraries…
            </div>
          ) : null}
          <MapLoader
            variant="library"
            libraries={libraries}
            center={mapCenter}
            zoom={mapZoom}
            userPosition={userPosition}
          />
        </div>

        {!placesConfigured ? (
          <div className="mt-4 rounded-lg border border-[rgba(231,76,60,0.35)] bg-[rgba(192,57,43,0.12)] px-4 py-3 font-sans text-sm text-[#E8C4C4]">
            Google Places is not configured on the backend. Add{" "}
            <code className="rounded bg-[#1A0D0D] px-1.5 py-0.5 font-mono text-[#FF6B6B]">
              GOOGLE_PLACES_API_KEY
            </code>{" "}
            to <code className="font-mono text-[#FF6B6B]">backend/.env</code>{" "}
            (see <code className="font-mono text-[#FF6B6B]">backend/.env.example</code>
            ) and restart the API.
          </div>
        ) : null}

        {error ? (
          <p className="mt-4 font-sans text-sm text-[#E74C3C]">{error}</p>
        ) : null}

        <div className="my-10 h-px w-full bg-gradient-to-r from-transparent via-[rgba(192,57,43,0.45)] to-transparent" />

        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <h2 className="font-sans text-xl font-semibold text-[#F5F5F5]">
              Spots
            </h2>
            <p className="mt-1 font-sans text-sm text-[#A89090]">
              {filtered.length} listing{filtered.length === 1 ? "" : "s"}
              {areaQuery.trim().length >= MIN_SEARCH_LEN
                ? " (area search)"
                : ""}
            </p>
          </div>
          <div className="flex w-full flex-col gap-3 sm:flex-row sm:items-end">
            <label className="flex flex-1 flex-col gap-2">
              <span className="font-mono text-xs uppercase tracking-wider text-[#FF6B6B]">
                Search other areas
              </span>
              <input
                type="search"
                value={areaQuery}
                onChange={(e) => setAreaQuery(e.target.value)}
                placeholder="City, neighborhood, or address (min. 3 characters)…"
                className="input-hud w-full"
              />
            </label>
            <label className="flex flex-1 flex-col gap-2">
              <span className="font-mono text-xs uppercase tracking-wider text-[#A89090]">
                Filter this list
              </span>
              <input
                type="search"
                value={filterText}
                onChange={(e) => setFilterText(e.target.value)}
                placeholder="Name, address, Wi‑Fi…"
                className="input-hud w-full"
              />
            </label>
            <label className="flex w-full flex-col gap-2 sm:max-w-[200px]">
              <span className="font-mono text-xs uppercase tracking-wider text-[#A89090]">
                Vibe
              </span>
              <select
                value={vibe}
                onChange={(e) => setVibe(e.target.value)}
                className="input-hud w-full cursor-pointer appearance-none bg-[#1A0D0D]"
              >
                <option value="all">All</option>
                <option value="Solo Focus">Solo Focus</option>
                <option value="Group Friendly">Group Friendly</option>
                <option value="Café Energy">Café Energy</option>
              </select>
            </label>
          </div>
        </div>

        <div className="mt-8 grid gap-6 sm:grid-cols-2">
          {filtered.map((spot) => (
            <LibraryCard key={spot.id} spot={spot} />
          ))}
        </div>
        {filtered.length === 0 && !loading ? (
          <p className="mt-8 text-center font-sans text-sm text-[#A89090]">
            {placesConfigured
              ? "No matches. Try another area search or adjust filters."
              : "Configure the Places API key to load libraries."}
          </p>
        ) : null}
      </div>
    </main>
  );
}
