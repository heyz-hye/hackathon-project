"use client";

import dynamic from "next/dynamic";
import PageHeader from "@/components/PageHeader";
import PantryCard from "@/components/PantryCard";
import type { Pantry } from "@/lib/data";
import { WTC_DEFAULT } from "@/lib/geo";
import {
  fetchNearbyPantries,
  searchPantries,
  wtcCenterTuple,
} from "@/lib/pantryPlacesApi";
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

const SEARCH_DEBOUNCE_MS = 450;
const MIN_SEARCH_LEN = 3;

const RADIUS_OPTIONS = [1, 2, 5, 10] as const;

export default function PantryPage() {
  const [pantries, setPantries] = useState<Pantry[]>([]);
  const [mapCenter, setMapCenter] = useState<[number, number]>(wtcCenterTuple);
  const [mapZoom, setMapZoom] = useState(12);
  const [referenceCenter, setReferenceCenter] = useState<LatLng>(WTC_DEFAULT);
  const referenceCenterRef = useRef<LatLng>(WTC_DEFAULT);
  const [radiusMiles, setRadiusMiles] = useState(2);
  const [areaQuery, setAreaQuery] = useState("");
  const [filterText, setFilterText] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [placesConfigured, setPlacesConfigured] = useState(true);
  const [locationPrompted, setLocationPrompted] = useState(false);
  const [userPosition, setUserPosition] = useState<LatLng | null>(null);
  const [locationSharing, setLocationSharing] = useState(false);
  const skipEmptyDebounce = useRef(true);
  const ignoreNextEmptyAreaFetch = useRef(false);
  const areaSearchGeneration = useRef(0);
  const areaQueryRef = useRef(areaQuery);

  useEffect(() => {
    referenceCenterRef.current = referenceCenter;
  }, [referenceCenter]);

  areaQueryRef.current = areaQuery;

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
      const result = await fetchNearbyPantries(lat, lng, radiusMiles);
      if (gen !== areaSearchGeneration.current) return;
      if (!result.placesConfigured) {
        setPlacesConfigured(false);
        setPantries([]);
        setMapCenter([lat, lng]);
        setMapZoom(12);
        return;
      }
      setPlacesConfigured(true);
      setPantries(result.pantries);
      setMapCenter([result.center.lat, result.center.lng]);
      setMapZoom(12);
    } catch (e) {
      if (gen !== areaSearchGeneration.current) return;
      setError(e instanceof Error ? e.message : "Failed to load pantries");
      setPantries([]);
    } finally {
      if (gen === areaSearchGeneration.current) setLoading(false);
    }
  }, [radiusMiles]);

  useEffect(() => {
    if (areaQueryRef.current.trim().length >= MIN_SEARCH_LEN) return;
    const { lat, lng } = referenceCenterRef.current;
    loadNearby(lat, lng);
  }, [radiusMiles, loadNearby]);

  const runAreaSearch = useCallback(async (q: string) => {
    const gen = ++areaSearchGeneration.current;
    setLoading(true);
    setError(null);
    try {
      const result = await searchPantries(q);
      if (gen !== areaSearchGeneration.current) return;
      if (!result.placesConfigured) {
        setPlacesConfigured(false);
        setPantries([]);
        return;
      }
      setPlacesConfigured(true);
      setPantries(result.pantries);
      if (result.center) {
        setMapCenter([result.center.lat, result.center.lng]);
        setMapZoom(11);
      }
    } catch (e) {
      if (gen !== areaSearchGeneration.current) return;
      setError(e instanceof Error ? e.message : "Search failed");
      setPantries([]);
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
        setMapZoom(13);
      },
      () => {
        setLocationSharing(false);
        setUserPosition(null);
        setError(
          "Location permission denied — showing pantries near the default NYC (WTC) area instead."
        );
      },
      { enableHighAccuracy: true, timeout: 15000, maximumAge: 60_000 }
    );
  };

  const filtered = useMemo(() => {
    const s = filterText.trim().toLowerCase();
    if (!s) return pantries;
    return pantries.filter(
      (p) =>
        p.name.toLowerCase().includes(s) ||
        p.address.toLowerCase().includes(s) ||
        p.note.toLowerCase().includes(s)
    );
  }, [pantries, filterText]);

  return (
    <main className="pb-16">
      <PageHeader
        backgroundWord="PANTRY"
        title="Food pantries & soup kitchens"
        subtitle="Nearby food banks and assistance from Google Places—verify hours and eligibility before visiting."
      />

      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <div className="mb-4 flex flex-col gap-3 rounded-xl border border-[rgba(192,57,43,0.2)] bg-[rgba(26,13,13,0.45)] p-4 sm:flex-row sm:items-center sm:justify-between">
          <p className="font-sans text-sm text-[#A89090]">
            By default we search within{" "}
            <span className="text-[#F5F5F5]">{radiusMiles} miles</span> of the{" "}
            <span className="text-[#F5F5F5]">World Trade Center</span> area. Use
            your location to search around you, pick a radius, or search another
            city below.
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
              Loading places…
            </div>
          ) : null}
          <MapLoader
            variant="pantry"
            pantries={pantries}
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
              Directory
            </h2>
            <p className="mt-1 font-sans text-sm text-[#A89090]">
              {filtered.length} location{filtered.length === 1 ? "" : "s"}
              {areaQuery.trim().length >= MIN_SEARCH_LEN ? " (area search)" : ""}
            </p>
          </div>
          <div className="flex w-full flex-col gap-3 sm:flex-row sm:items-end">
            <label className="flex flex-col gap-2 sm:max-w-[140px]">
              <span className="font-mono text-xs uppercase tracking-wider text-[#FF6B6B]">
                Radius (mi)
              </span>
              <select
                value={radiusMiles}
                onChange={(e) => setRadiusMiles(Number(e.target.value))}
                disabled={areaQuery.trim().length >= MIN_SEARCH_LEN}
                className="input-hud w-full cursor-pointer appearance-none bg-[#1A0D0D] disabled:cursor-not-allowed disabled:opacity-50"
                title={
                  areaQuery.trim().length >= MIN_SEARCH_LEN
                    ? "Clear area search to use radius with your reference location"
                    : undefined
                }
              >
                {RADIUS_OPTIONS.map((m) => (
                  <option key={m} value={m}>
                    {m} mi
                  </option>
                ))}
              </select>
            </label>
            <label className="flex flex-1 flex-col gap-2">
              <span className="font-mono text-xs uppercase tracking-wider text-[#FF6B6B]">
                Search a place
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
                placeholder="Name, address, note…"
                className="input-hud w-full"
              />
            </label>
          </div>
        </div>

        <div className="mt-8 grid gap-6 sm:grid-cols-2">
          {filtered.map((p) => (
            <PantryCard key={p.id} pantry={p} />
          ))}
        </div>
        {filtered.length === 0 && !loading ? (
          <p className="mt-8 text-center font-sans text-sm text-[#A89090]">
            {placesConfigured
              ? "No matches. Try another area search, widen the radius, or adjust filters."
              : "Configure the Places API key to load pantries."}
          </p>
        ) : null}
      </div>
    </main>
  );
}
