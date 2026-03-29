"use client";

import PageHeader from "@/components/PageHeader";
import { WTC_DEFAULT } from "@/lib/geo";
import { fetchMapEvents, type EventPin } from "@/lib/eventsApi";
import dynamic from "next/dynamic";
import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

function CircularSpinner({ label }: { label?: string }) {
  return (
    <div
      className="h-12 w-12 animate-spin rounded-full border-2 border-[rgba(192,57,43,0.35)] border-t-[#FF2D2D]"
      role="status"
      aria-label={label || "Loading"}
    />
  );
}

const EventsMapLoader = dynamic(() => import("@/components/EventsMap"), {
  ssr: false,
  loading: () => (
    <div className="flex h-[300px] w-full min-h-0 items-center justify-center rounded-xl border border-[rgba(192,57,43,0.25)] bg-[#120A0A] sm:h-[360px]">
      <CircularSpinner label="Loading map" />
    </div>
  ),
});

const DEFAULT_QUERY = "Events in New York";
/** Default search radius in miles (matches backend default). */
const DEFAULT_RADIUS_MILES = 8;

function RefreshIcon() {
  return (
    <svg
      className="h-5 w-5"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      aria-hidden
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
      />
    </svg>
  );
}

export default function EventsPage() {
  const [searchDraft, setSearchDraft] = useState(DEFAULT_QUERY);
  const [searchApplied, setSearchApplied] = useState(DEFAULT_QUERY);
  const [radiusDraft, setRadiusDraft] = useState(String(DEFAULT_RADIUS_MILES));

  const [mapCenter, setMapCenter] = useState<[number, number]>([
    WTC_DEFAULT.lat,
    WTC_DEFAULT.lng,
  ]);
  const [mapZoom, setMapZoom] = useState(12);
  const [userPosition, setUserPosition] = useState<{
    lat: number;
    lng: number;
  } | null>(null);
  const [locationSharing, setLocationSharing] = useState(false);

  const [events, setEvents] = useState<EventPin[]>([]);
  const [apiRadiusMiles, setApiRadiusMiles] = useState(DEFAULT_RADIUS_MILES);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selected, setSelected] = useState<EventPin | null>(null);

  const enableLocation = useCallback(() => {
    if (!navigator.geolocation) {
      setError("Geolocation is not supported in this browser.");
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const next = {
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
        };
        setUserPosition(next);
        setMapCenter([next.lat, next.lng]);
        setMapZoom(12);
        setLocationSharing(true);
        setError(null);
      },
      () => {
        setError(
          "Could not access your location. Check permissions and try again."
        );
      },
      { enableHighAccuracy: true, timeout: 20_000, maximumAge: 0 }
    );
  }, []);

  const disableLocation = useCallback(() => {
    setLocationSharing(false);
    setUserPosition(null);
    setMapCenter([WTC_DEFAULT.lat, WTC_DEFAULT.lng]);
    setMapZoom(12);
  }, []);

  useEffect(() => {
    if (!locationSharing || !navigator.geolocation) return;
    const watchId = navigator.geolocation.watchPosition(
      (pos) => {
        const next = {
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
        };
        setUserPosition(next);
        setMapCenter([next.lat, next.lng]);
      },
      () => {
        setLocationSharing(false);
        setUserPosition(null);
      },
      { enableHighAccuracy: true, maximumAge: 10_000, timeout: 25_000 }
    );
    return () => navigator.geolocation.clearWatch(watchId);
  }, [locationSharing]);

  const runSearch = useCallback(async () => {
    const r = Math.min(
      125,
      Math.max(
        1,
        Number(radiusDraft.replace(/[^0-9.]/g, "")) || DEFAULT_RADIUS_MILES
      )
    );
    setRadiusDraft(String(r));

    const centerLat = mapCenter[0];
    const centerLng = mapCenter[1];

    setLoading(true);
    setError(null);
    try {
      const data = await fetchMapEvents({
        query: searchApplied.trim() || undefined,
        lat: centerLat,
        lng: centerLng,
        radiusMiles: r,
      });
      setEvents(data.events);
      setApiRadiusMiles(data.radiusMiles);
      setSelected(data.events[0] ?? null);
    } catch (e) {
      setEvents([]);
      setError(e instanceof Error ? e.message : "Could not load events");
    } finally {
      setLoading(false);
    }
  }, [mapCenter, radiusDraft, searchApplied]);

  const runSearchRef = useRef(runSearch);
  runSearchRef.current = runSearch;

  useEffect(() => {
    void runSearchRef.current();
  }, [searchApplied]);

  const radiusLabel = useMemo(
    () =>
      `${apiRadiusMiles} mi search radius (circle on map — distances use statute miles)`,
    [apiRadiusMiles]
  );

  return (
    <main className="pb-16">
      <PageHeader
        backgroundWord="EVENTS"
        title="Find events"
        subtitle="Search Google Events via SerpApi; pins fall inside your mile radius. The map defaults to the World Trade Center until you share your location."
      />

      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <div className="flex flex-col gap-4 rounded-xl border border-[rgba(192,57,43,0.25)] bg-[rgba(18,10,10,0.5)] p-4 backdrop-blur-md sm:flex-row sm:flex-wrap sm:items-end">
          <label className="flex min-w-[min(100%,18rem)] flex-1 flex-col gap-2">
            <span className="font-mono text-xs uppercase tracking-wider text-[#FF6B6B]">
              Search (SerpApi Google Events)
            </span>
            <input
              type="text"
              value={searchDraft}
              onChange={(e) => setSearchDraft(e.target.value)}
              className="input-hud w-full font-mono text-sm"
              placeholder={DEFAULT_QUERY}
            />
          </label>
          <label className="flex w-full flex-col gap-2 sm:w-36">
            <span className="font-mono text-xs uppercase tracking-wider text-[#A89090]">
              Radius (mi)
            </span>
            <input
              type="text"
              inputMode="decimal"
              value={radiusDraft}
              onChange={(e) => setRadiusDraft(e.target.value)}
              className="input-hud w-full font-mono"
            />
          </label>
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              className="btn-primary"
              onClick={() => {
                setSearchApplied(searchDraft.trim() || DEFAULT_QUERY);
              }}
            >
              Apply search text
            </button>
            <button
              type="button"
              className="btn-ghost inline-flex h-10 w-10 items-center justify-center p-0"
              onClick={() => void runSearch()}
              disabled={loading}
              title="Refresh map"
              aria-label="Refresh map"
            >
              <RefreshIcon />
            </button>
            <button
              type="button"
              className={`btn-ghost ${locationSharing ? "border-[#38bdf8] text-[#7dd3fc]" : ""}`}
              onClick={() => {
                if (locationSharing) {
                  disableLocation();
                } else {
                  enableLocation();
                }
              }}
            >
              {locationSharing ? "Stop sharing location" : "Use my location"}
            </button>
          </div>
        </div>

        <p className="mt-3 font-mono text-xs text-[#A89090]">{radiusLabel}</p>
        <p className="mt-1 font-mono text-[11px] text-[#7dd3fc]/90">
          Geocoding runs server-side and may take a moment. Your position appears
          as the blue pulsing pin when sharing is on.
        </p>

        {error ? (
          <p className="mt-4 font-mono text-sm text-[#FF6B6B]" role="alert">
            {error}
          </p>
        ) : null}

        <div className="mt-8 grid min-h-0 gap-8 lg:grid-cols-[1fr_380px] lg:items-start">
          <div className="relative min-w-0 overflow-hidden rounded-xl">
            {loading ? (
              <div className="absolute inset-0 z-[500] flex items-center justify-center rounded-xl bg-[#0A0A0F]/80 backdrop-blur-[2px]">
                <CircularSpinner label="Finding events" />
              </div>
            ) : null}
            <EventsMapLoader
              center={mapCenter}
              zoom={mapZoom}
              radiusMiles={apiRadiusMiles}
              events={events}
              userPosition={locationSharing ? userPosition : null}
            />
          </div>

          <aside className="min-h-0 space-y-3 lg:max-h-[360px] lg:overflow-y-auto">
            <h2 className="font-sans text-lg font-semibold text-[#F5F5F5]">
              In range ({events.length})
            </h2>
            <ul className="max-h-[min(360px,45vh)] space-y-2 overflow-y-auto pr-1 lg:max-h-none">
              {events.map((ev) => (
                <li key={`${ev.title}-${ev.lat}-${ev.lng}`}>
                  <button
                    type="button"
                    onClick={() => {
                      setSelected(ev);
                      setMapCenter([ev.lat, ev.lng]);
                      setMapZoom(14);
                    }}
                    className={`w-full rounded-lg border px-3 py-3 text-left transition ${
                      selected?.title === ev.title &&
                      selected?.lat === ev.lat &&
                      selected?.lng === ev.lng
                        ? "border-[#FF2D2D] bg-[rgba(192,57,43,0.2)]"
                        : "border-[rgba(192,57,43,0.25)] bg-[rgba(18,10,10,0.6)] hover:border-[rgba(255,45,45,0.45)]"
                    }`}
                  >
                    <p className="font-sans text-sm font-semibold text-[#F5F5F5]">
                      {ev.title}
                    </p>
                    <p className="mt-1 font-mono text-[11px] text-[#FF6B6B]">
                      {ev.date}
                    </p>
                    <p className="mt-1 line-clamp-2 font-sans text-xs text-[#A89090]">
                      {ev.address}
                    </p>
                  </button>
                </li>
              ))}
            </ul>
            {selected ? (
              <div className="glass-card rounded-xl border border-[rgba(192,57,43,0.25)] p-4">
                <p className="font-sans text-base font-semibold text-[#F5F5F5]">
                  {selected.title}
                </p>
                <p className="mt-2 font-mono text-xs text-[#FF6B6B]">
                  {selected.date}
                </p>
                <p className="mt-2 font-sans text-sm text-[#A89090]">
                  {selected.address}
                </p>
                {selected.description ? (
                  <p className="mt-3 border-t border-[rgba(192,57,43,0.35)] pt-3 font-sans text-sm leading-relaxed text-[#CFCFCF]">
                    {selected.description}
                  </p>
                ) : null}
                {selected.link ? (
                  <a
                    href={selected.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-4 inline-block font-mono text-sm text-[#7dd3fc] underline"
                  >
                    Open details / tickets
                  </a>
                ) : null}
              </div>
            ) : null}
          </aside>
        </div>
      </div>
    </main>
  );
}
