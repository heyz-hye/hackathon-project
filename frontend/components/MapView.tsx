"use client";

import type { Pantry, LibrarySpot } from "@/lib/data";
import L from "leaflet";
import { useMemo } from "react";
import {
  MapContainer,
  Marker,
  Popup,
  TileLayer,
} from "react-leaflet";
import "leaflet/dist/leaflet.css";

const TILE =
  "https://cartodb-basemaps-a.global.ssl.fastly.net/dark_all/{z}/{x}/{y}.png";

function createPantryIcon() {
  return L.divIcon({
    className: "campuscompass-marker pantry-marker",
    html: `<div class="pantry-pin-inner"></div>`,
    iconSize: [28, 28],
    iconAnchor: [14, 14],
    popupAnchor: [0, -12],
  });
}

function createLibraryIcon() {
  return L.divIcon({
    className: "campuscompass-marker library-marker",
    html: `<div class="library-pin-inner"></div>`,
    iconSize: [32, 32],
    iconAnchor: [16, 16],
    popupAnchor: [0, -14],
  });
}

export type MapViewProps = {
  variant: "pantry" | "library";
  pantries?: Pantry[];
  libraries?: LibrarySpot[];
  center?: [number, number];
  zoom?: number;
};

export default function MapView({
  variant,
  pantries = [],
  libraries = [],
  center = [40.75, -73.88],
  zoom = 12,
}: MapViewProps) {
  const pantryIcon = useMemo(() => createPantryIcon(), []);
  const libraryIcon = useMemo(() => createLibraryIcon(), []);

  return (
    <div className="map-shell relative overflow-hidden rounded-xl border border-[rgba(192,57,43,0.25)] shadow-[inset_0_0_40px_rgba(0,0,0,0.45)]">
      <div
        className="pointer-events-none absolute inset-0 z-[400] rounded-xl bg-[rgba(10,10,15,0.25)]"
        aria-hidden
      />
      <MapContainer
        center={center}
        zoom={zoom}
        className="z-0 h-[min(420px,55vh)] w-full min-h-[320px] sm:h-[480px]"
        scrollWheelZoom
      >
        <TileLayer attribution='&copy; <a href="https://carto.com/">CARTO</a>' url={TILE} />
        {variant === "pantry" &&
          pantries.map((p) => (
            <Marker key={p.id} position={[p.lat, p.lng]} icon={pantryIcon}>
              <Popup className="campuscompass-popup">
                <div className="popup-inner space-y-1.5 p-1">
                  <p className="font-sans text-sm font-semibold text-[#F5F5F5]">
                    {p.name}
                  </p>
                  <p className="font-sans text-xs text-[#A89090]">{p.address}</p>
                  <p className="font-mono text-xs text-[#FF6B6B]">{p.hours}</p>
                  <p className="border-t border-[rgba(192,57,43,0.35)] pt-2 font-sans text-xs text-[#A89090]">
                    {p.note}
                  </p>
                </div>
              </Popup>
            </Marker>
          ))}
        {variant === "library" &&
          libraries.map((lib) => (
            <Marker key={lib.id} position={[lib.lat, lib.lng]} icon={libraryIcon}>
              <Popup className="campuscompass-popup">
                <div className="popup-inner space-y-1.5 p-1">
                  <p className="font-sans text-sm font-semibold text-[#F5F5F5]">
                    {lib.name}
                  </p>
                  <p className="font-sans text-xs text-[#A89090]">{lib.address}</p>
                  <p className="font-mono text-xs text-[#FF6B6B]">{lib.hours}</p>
                  <div className="flex flex-wrap gap-2 border-t border-[rgba(192,57,43,0.35)] pt-2 font-mono text-[11px] text-[#A89090]">
                    <span>Wi‑Fi: {lib.wifi}</span>
                    <span>·</span>
                    <span>Noise: {lib.noise}</span>
                  </div>
                </div>
              </Popup>
            </Marker>
          ))}
      </MapContainer>
    </div>
  );
}
