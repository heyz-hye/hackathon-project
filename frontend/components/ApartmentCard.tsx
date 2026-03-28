import type { Apartment } from "@/lib/data";

type ApartmentCardProps = {
  apt: Apartment;
  onViewDetails: (apt: Apartment) => void;
};

export default function ApartmentCard({
  apt,
  onViewDetails,
}: ApartmentCardProps) {
  return (
    <article className="group glass-card relative flex flex-col overflow-hidden rounded-xl border border-[rgba(192,57,43,0.25)] transition duration-300 hover:border-[rgba(255,45,45,0.45)] hover:shadow-[0_0_12px_rgba(255,45,45,0.4)]">
      <span className="absolute left-0 top-0 z-[1] h-1 w-full bg-gradient-to-r from-[#C0392B] via-[#FF2D2D] to-[#C0392B] opacity-90" />
      <div className="relative h-36 w-full overflow-hidden bg-[#1A0D0D]">
        <div
          className="absolute inset-0 bg-gradient-to-br from-[#C0392B]/40 via-[#120A0A] to-[#0A0A0F]"
          aria-hidden
        />
        <div
          className="absolute inset-0 opacity-30 mix-blend-overlay"
          style={{
            backgroundImage:
              "linear-gradient(135deg, rgba(255,45,45,0.3) 0%, transparent 50%), linear-gradient(45deg, #1a0d0d 25%, transparent 25%)",
            backgroundSize: "100% 100%, 12px 12px",
          }}
          aria-hidden
        />
        <span className="absolute left-3 top-3 rounded-full border border-[rgba(192,57,43,0.45)] bg-[rgba(18,10,10,0.85)] px-2.5 py-1 font-mono text-[11px] text-[#FF6B6B] backdrop-blur-sm">
          {apt.neighborhood}
        </span>
      </div>
      <div className="flex flex-1 flex-col p-5">
        <p className="font-mono text-2xl font-semibold text-[#F5F5F5] [text-shadow:0_0_12px_rgba(255,45,45,0.45)]">
          ${apt.price.toLocaleString()}
          <span className="text-sm font-normal text-[#A89090]">/mo</span>
        </p>
        <div className="mt-2 flex flex-wrap gap-3 font-mono text-xs text-[#A89090]">
          <span>{apt.bedrooms} BR</span>
          <span>·</span>
          <span>{apt.distanceMiles} mi to campus</span>
        </div>
        <button
          type="button"
          onClick={() => onViewDetails(apt)}
          className="btn-ghost mt-4 w-full py-2.5 text-sm"
        >
          View Details
        </button>
      </div>
    </article>
  );
}
