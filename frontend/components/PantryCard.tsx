import LibraryWeeklyHours from "@/components/LibraryWeeklyHours";
import type { Pantry } from "@/lib/data";

type PantryCardProps = {
  pantry: Pantry;
};

export default function PantryCard({ pantry }: PantryCardProps) {
  return (
    <article className="group glass-card relative flex flex-col rounded-xl border border-[rgba(192,57,43,0.25)] p-5 transition duration-300 hover:border-[rgba(255,45,45,0.45)] hover:shadow-[0_0_12px_rgba(255,45,45,0.4)]">
      <span className="absolute left-0 top-0 h-1 w-full rounded-t-xl bg-gradient-to-r from-[#C0392B] via-[#FF2D2D] to-[#C0392B] opacity-90" />
      <h3 className="font-sans text-lg font-semibold text-[#F5F5F5]">
        {pantry.name}
      </h3>
      <p className="mt-2 font-sans text-sm text-[#A89090]">{pantry.address}</p>
      <LibraryWeeklyHours hours={pantry.hours} hoursByDay={pantry.hoursByDay} />
      <p className="mt-3 border-t border-[rgba(192,57,43,0.25)] pt-3 font-sans text-sm text-[#A89090]">
        {pantry.note}
      </p>
    </article>
  );
}
