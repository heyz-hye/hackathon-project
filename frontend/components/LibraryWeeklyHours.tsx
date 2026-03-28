"use client";

import type { LibraryDayHours } from "@/lib/data";
import { useEffect, useMemo, useState } from "react";

type LibraryWeeklyHoursProps = {
  hours: string;
  hoursByDay?: LibraryDayHours[] | null;
  /** Card vs compact map popup */
  compact?: boolean;
};

function todayWeekdayEn(): string {
  return new Intl.DateTimeFormat("en-US", { weekday: "long" }).format(
    new Date()
  );
}

function defaultDayIndex(days: LibraryDayHours[]): number {
  const today = todayWeekdayEn().toLowerCase();
  const idx = days.findIndex((d) => d.day.toLowerCase() === today);
  return idx >= 0 ? idx : 0;
}

function ChevronDownIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 12 12"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden
    >
      <path
        d="M2.5 4.25L6 7.75L9.5 4.25"
        stroke="currentColor"
        strokeWidth="1.25"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export default function LibraryWeeklyHours({
  hours,
  hoursByDay,
  compact = false,
}: LibraryWeeklyHoursProps) {
  const list = hoursByDay?.length ? hoursByDay : null;
  const initial = useMemo(
    () => (list ? defaultDayIndex(list) : 0),
    [hoursByDay]
  );
  const [selectedIndex, setSelectedIndex] = useState(initial);

  useEffect(() => {
    const days = hoursByDay?.length ? hoursByDay : null;
    setSelectedIndex(days ? defaultDayIndex(days) : 0);
  }, [hours, hoursByDay]);

  if (!list) {
    return (
      <p
        className={
          compact
            ? "font-mono text-[11px] leading-snug text-[#FF6B6B]"
            : "mt-3 font-mono text-xs text-[#FF6B6B]"
        }
      >
        {hours}
      </p>
    );
  }

  const labelClass = compact
    ? "font-mono text-[9px] uppercase tracking-wider text-[#A89090]"
    : "font-mono text-[10px] uppercase tracking-wider text-[#A89090]";

  const selectClass = compact
    ? "input-hud w-full max-w-[200px] cursor-pointer appearance-none bg-[#1A0D0D] py-1.5 pl-2 pr-8 text-[11px]"
    : "input-hud w-full max-w-[240px] cursor-pointer appearance-none bg-[#1A0D0D] pr-9";

  const hoursClass = compact
    ? "font-mono text-[11px] text-[#FF6B6B]"
    : "font-mono text-xs text-[#FF6B6B]";

  const selected = list[selectedIndex];

  const chevronClass = compact
    ? "h-3 w-3 shrink-0 text-[#FF6B6B]"
    : "h-3.5 w-3.5 shrink-0 text-[#FF6B6B]";

  return (
    <div className={compact ? "space-y-1.5" : "mt-3 space-y-2"}>
      <label className="flex flex-col gap-1">
        <span
          className={`${labelClass} inline-flex items-center gap-1.5`}
        >
          Hours by day
          <ChevronDownIcon className={chevronClass} />
        </span>
        <div
          className={
            compact ? "relative w-full max-w-[200px]" : "relative w-full max-w-[240px]"
          }
        >
          <select
            className={selectClass}
            value={selectedIndex}
            onChange={(e) => setSelectedIndex(Number(e.target.value))}
            aria-label="Select day to view opening hours"
          >
            {list.map((d, i) => (
              <option key={`${d.day}-${i}`} value={i}>
                {d.day}
              </option>
            ))}
          </select>
          <span
            className={`pointer-events-none absolute text-[#FF6B6B] ${
              compact
                ? "right-2 top-1/2 -translate-y-1/2"
                : "right-2.5 top-1/2 -translate-y-1/2"
            }`}
            aria-hidden
          >
            <ChevronDownIcon
              className={compact ? "h-3 w-3" : "h-3.5 w-3.5"}
            />
          </span>
        </div>
      </label>
      <p className={hoursClass}>{selected?.hours?.trim() || "—"}</p>
    </div>
  );
}
