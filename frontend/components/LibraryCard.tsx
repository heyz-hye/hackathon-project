import type { LibrarySpot } from "@/lib/data";

const vibeStyles: Record<
  LibrarySpot["vibe"],
  string
> = {
  "Solo Focus":
    "border-[rgba(192,57,43,0.5)] bg-[rgba(26,13,13,0.9)] text-[#FF6B6B]",
  "Group Friendly":
    "border-[rgba(231,76,60,0.45)] bg-[rgba(192,57,43,0.12)] text-[#E74C3C]",
  "Café Energy":
    "border-[rgba(255,45,45,0.55)] bg-[rgba(255,45,45,0.08)] text-[#FF2D2D]",
};

type LibraryCardProps = {
  spot: LibrarySpot;
};

export default function LibraryCard({ spot }: LibraryCardProps) {
  return (
    <article className="group glass-card relative flex flex-col rounded-xl border border-[rgba(192,57,43,0.25)] p-5 transition duration-300 hover:border-[rgba(255,45,45,0.45)] hover:shadow-[0_0_12px_rgba(255,45,45,0.4)]">
      <span className="absolute left-0 top-0 h-1 w-full rounded-t-xl bg-gradient-to-r from-[#C0392B] via-[#FF2D2D] to-[#C0392B] opacity-90" />
      <div className="flex flex-wrap items-start justify-between gap-2">
        <h3 className="font-sans text-lg font-semibold text-[#F5F5F5]">
          {spot.name}
        </h3>
        <span
          className={`shrink-0 rounded-full border px-3 py-1 font-mono text-[11px] uppercase tracking-wide ${vibeStyles[spot.vibe]}`}
        >
          {spot.vibe}
        </span>
      </div>
      <p className="mt-2 font-sans text-sm text-[#A89090]">{spot.address}</p>
      <p className="mt-3 font-mono text-xs text-[#FF6B6B]">{spot.hours}</p>
      <div className="mt-3 flex flex-wrap gap-3 border-t border-[rgba(192,57,43,0.25)] pt-3 font-mono text-xs text-[#A89090]">
        <span>Wi‑Fi: {spot.wifi}</span>
        <span>Noise: {spot.noise}</span>
      </div>
    </article>
  );
}
