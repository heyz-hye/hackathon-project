"use client";

import dynamic from "next/dynamic";
import PageHeader from "@/components/PageHeader";
import PantryCard from "@/components/PantryCard";
import { pantries } from "@/lib/data";
import { useMemo, useState } from "react";

const MapLoader = dynamic(
  () => import("@/components/MapView"),
  {
    ssr: false,
    loading: () => (
      <div className="flex h-[min(420px,55vh)] min-h-[320px] items-center justify-center rounded-xl border border-[rgba(192,57,43,0.25)] bg-[#120A0A] font-mono text-sm text-[#A89090] sm:h-[480px]">
        Initializing map…
      </div>
    ),
  }
);

export default function PantryPage() {
  const [q, setQ] = useState("");

  const filtered = useMemo(() => {
    const s = q.trim().toLowerCase();
    if (!s) return pantries;
    return pantries.filter(
      (p) =>
        p.name.toLowerCase().includes(s) ||
        p.address.toLowerCase().includes(s) ||
        p.note.toLowerCase().includes(s)
    );
  }, [q]);

  return (
    <main className="pb-16">
      <PageHeader
        backgroundWord="PANTRY"
        title="Food pantries"
        subtitle="NYC / Queens–focused mock locations on a dark basemap. Verify hours before visiting."
      />

      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <div className="relative z-0">
          <MapLoader variant="pantry" pantries={pantries} center={[40.75, -73.88]} zoom={12} />
        </div>

        <div className="my-10 h-px w-full bg-gradient-to-r from-transparent via-[rgba(192,57,43,0.45)] to-transparent" />

        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h2 className="font-sans text-xl font-semibold text-[#F5F5F5]">
              Directory
            </h2>
            <p className="mt-1 font-sans text-sm text-[#A89090]">
              {filtered.length} location{filtered.length === 1 ? "" : "s"}
            </p>
          </div>
          <label className="flex w-full max-w-md flex-col gap-2 sm:w-auto">
            <span className="font-mono text-xs uppercase tracking-wider text-[#FF6B6B]">
              Search
            </span>
            <input
              type="search"
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Name, address, note…"
              className="input-hud w-full min-w-[240px]"
            />
          </label>
        </div>

        <div className="mt-8 grid gap-6 sm:grid-cols-2">
          {filtered.map((p) => (
            <PantryCard key={p.id} pantry={p} />
          ))}
        </div>
        {filtered.length === 0 ? (
          <p className="mt-8 text-center font-sans text-sm text-[#A89090]">
            No matches. Clear the search to see all pantries.
          </p>
        ) : null}
      </div>
    </main>
  );
}
