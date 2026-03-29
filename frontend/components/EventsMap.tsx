"use client";

import L from "leaflet";
import { useEffect, useMemo } from "react";
import {
  Circle,
  MapContainer,
  Marker,
  Popup,
  TileLayer,
  useMap,
} from "react-leaflet";
import "leaflet/dist/leaflet.css";
import type { EventPin } from "@/lib/eventsApi";

const TILE =
  "https://cartodb-basemaps-a.global.ssl.fastly.net/dark_all/{z}/{x}/{y}.png";

/** Statute miles → meters for Leaflet.Circle */
const MILES_TO_METERS = 1609.344;

function MapCenterUpdater({
  center,
  zoom,
}: {
  center: [number, number];
  zoom: number;
}) {
  const map = useMap();
  const lat = center[0];
  const lng = center[1];
  useEffect(() => {
    map.setView([lat, lng], zoom, { animate: true });
  }, [lat, lng, zoom, map]);
  return null;
}

/** Leaflet often mis-measures tiles when the container height is set by CSS; this reflows the map. */
function MapInvalidateSize() {
  const map = useMap();
  useEffect(() => {
    const id = requestAnimationFrame(() => {
      map.invalidateSize();
    });
    const t = window.setTimeout(() => map.invalidateSize(), 200);
    return () => {
      cancelAnimationFrame(id);
      window.clearTimeout(t);
    };
  }, [map]);
  return null;
}

function createEventIcon() {
  return L.divIcon({
    className: "campuscompass-marker event-marker",
    html: `<div class="event-pin-inner"></div>`,
    iconSize: [30, 30],
    iconAnchor: [15, 15],
    popupAnchor: [0, -12],
  });
}

function createUserLocationIcon() {
  return L.divIcon({
    className: "campuscompass-marker user-location-marker",
    html: `<div class="user-location-stack"><div class="user-location-pulse-ring" aria-hidden="true"></div><div class="user-location-pin-inner"></div></div>`,
    iconSize: [32, 32],
    iconAnchor: [16, 16],
    popupAnchor: [0, -14],
  });
}

export type EventsMapProps = {
  center: [number, number];
  zoom: number;
  radiusMiles: number;
  events: EventPin[];
  userPosition?: { lat: number; lng: number } | null;
};

export default function EventsMap({
  center,
  zoom,
  radiusMiles,
  events,
  userPosition = null,
}: EventsMapProps) {
  const eventIcon = useMemo(() => createEventIcon(), []);
  const userIcon = useMemo(() => createUserLocationIcon(), []);
  const radiusM = Math.max(50, radiusMiles * MILES_TO_METERS);

  return (
    <div className="map-shell relative h-[300px] w-full min-h-0 overflow-hidden rounded-xl border border-[rgba(192,57,43,0.25)] shadow-[inset_0_0_40px_rgba(0,0,0,0.45)] sm:h-[360px]">
      <div
        className="pointer-events-none absolute inset-0 z-[400] rounded-xl bg-[rgba(10,10,15,0.25)]"
        aria-hidden
      />
      <MapContainer
        center={center}
        zoom={zoom}
        className="z-0 h-full w-full min-h-[240px]"
        scrollWheelZoom
      >
        <MapCenterUpdater center={center} zoom={zoom} />
        <MapInvalidateSize />
        <TileLayer attribution='&copy; <a href="https://carto.com/">CARTO</a>' url={TILE} />
        <Circle
          center={center}
          radius={radiusM}
          pathOptions={{
            color: "#FF2D2D",
            weight: 2,
            fillColor: "#C0392B",
            fillOpacity: 0.08,
          }}
        />
        {events.map((ev) => (
          <Marker
            key={`${ev.title}-${ev.lat}-${ev.lng}`}
            position={[ev.lat, ev.lng]}
            icon={eventIcon}
          >
            <Popup className="campuscompass-popup max-w-xs">
              <div className="popup-inner space-y-2 p-1">
                <p className="font-sans text-sm font-semibold text-[#F5F5F5]">
                  {ev.title}
                </p>
                <p className="font-mono text-[11px] text-[#FF6B6B]">{ev.date}</p>
                <p className="font-sans text-xs text-[#A89090]">{ev.address}</p>
                {ev.description ? (
                  <p className="line-clamp-4 border-t border-[rgba(192,57,43,0.35)] pt-2 font-sans text-xs text-[#CFCFCF]">
                    {ev.description}
                  </p>
                ) : null}
                {ev.link ? (
                  <a
                    href={ev.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-block font-mono text-xs text-[#7dd3fc] underline"
                  >
                    More info / tickets
                  </a>
                ) : null}
              </div>
            </Popup>
          </Marker>
        ))}
        {userPosition ? (
          <Marker
            position={[userPosition.lat, userPosition.lng]}
            icon={userIcon}
            zIndexOffset={1000}
          >
            <Popup className="campuscompass-popup">
              <div className="popup-inner p-1">
                <p className="font-sans text-sm font-semibold text-[#F5F5F5]">
                  Your location
                </p>
                <p className="mt-1 font-mono text-[11px] text-[#7dd3fc]">
                  Sharing is on — marker updates as you move
                </p>
              </div>
            </Popup>
          </Marker>
        ) : null}
      </MapContainer>
    </div>
  );
}
