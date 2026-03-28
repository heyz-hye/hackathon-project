"use client";

import dynamic from "next/dynamic";
import LibraryCard from "@/components/LibraryCard";
import PageHeader from "@/components/PageHeader";
import { libraries } from "@/lib/data";
import { useMemo, useState } from "react";

const MapLoader = dynamic(() => import("@/components/MapView"), {
  ssr: false,
  loading: () => (
    <div className="flex h-[min(420px,55vh)] min-h-[320px] items-center justify-center rounded-xl border border-[rgba(192,57,43,0.25)] bg-[#120A0A] font-mono text-sm text-[#A89090] sm:h-[480px]">
      Initializing map…
    </div>
  ),
});

export default function LibraryPage() {
  const [q, setQ] = useState("");
  const [vibe, setVibe] = useState<string>("all");

  const filtered = useMemo(() => {
    let list = libraries;
    const s = q.trim().toLowerCase();
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
  }, [q, vibe]);

  return (
    <main className="pb-16">
      <PageHeader
        backgroundWord="LIBRARY"
        title="Libraries & study spots"
        subtitle="Mock NYC locations with Wi‑Fi, noise level, and vibe tags. Markers pulse on the map."
      />

      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <MapLoader
          variant="library"
          libraries={libraries}
          center={[40.74, -73.92]}
          zoom={11}
        />

        <div className="my-10 h-px w-full bg-gradient-to-r from-transparent via-[rgba(192,57,43,0.45)] to-transparent" />

        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <h2 className="font-sans text-xl font-semibold text-[#F5F5F5]">
              Spots
            </h2>
            <p className="mt-1 font-sans text-sm text-[#A89090]">
              {filtered.length} listing{filtered.length === 1 ? "" : "s"}
            </p>
          </div>
          <div className="flex w-full flex-col gap-3 sm:flex-row sm:items-end">
            <label className="flex flex-1 flex-col gap-2">
              <span className="font-mono text-xs uppercase tracking-wider text-[#FF6B6B]">
                Search
              </span>
              <input
                type="search"
                value={q}
                onChange={(e) => setQ(e.target.value)}
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
        {filtered.length === 0 ? (
          <p className="mt-8 text-center font-sans text-sm text-[#A89090]">
            No matches. Adjust filters.
          </p>
        ) : null}
      </div>
    </main>
  );
}
