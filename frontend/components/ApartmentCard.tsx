import type { Apartment } from "@/lib/data";

type ApartmentCardProps = {
  id: string;
  address?: string;
  image?: string;
  rent?: number | null;
  bedrooms?: number;
  bathrooms?: number;
  onViewDetails: (apt: Apartment) => void;
};

export default function ApartmentCard(props: ApartmentCardProps) {
  const rent = props.rent ?? 0;
  const addr = props.address ?? "";
  const img = props.image ?? "";
  const beds = props.bedrooms ?? 0;
  const baths = props.bathrooms ?? 0;

  return (
    <article className="glass-card group relative flex min-h-[350px] flex-col overflow-hidden rounded-xl border border-[rgba(192,57,43,0.25)] transition duration-300 hover:border-[rgba(255,45,45,0.45)] hover:shadow-[0_0_12px_rgba(255,45,45,0.4)]">
      <span className="absolute left-0 top-0 z-[1] h-1 w-full bg-gradient-to-r from-[#C0392B] via-[#FF2D2D] to-[#C0392B] opacity-90" />
      <div className="relative h-36 w-full overflow-hidden bg-[#1A0D0D]">
        <div
          className="absolute inset-0 bg-gradient-to-br from-[#C0392B]/40 via-[#120A0A] to-[#0A0A0F]"
          aria-hidden
        />
        <div
          className="absolute inset-0 flex flex-1 bg-cover opacity-100"
          style={{
            backgroundImage: `url(${img})`,
            backgroundSize: "100% 100%, 12px 12px",
          }}
          aria-hidden
        />
        <span className="absolute left-3 top-3 rounded-full border border-[rgba(192,57,43,0.45)] bg-[rgba(18,10,10,0.85)] px-2.5 py-1 font-mono text-[11px] text-[#FF6B6B] backdrop-blur-sm">
          {addr}
        </span>
      </div>
      <div className="mt-auto flex flex-col p-5">
        <p className="font-mono text-2xl font-semibold text-[#F5F5F5] [text-shadow:0_0_12px_rgba(255,45,45,0.45)]">
          ${rent}
          <span className="text-sm font-normal text-[#A89090]">/mo</span>
        </p>
        <div className="mt-2 flex flex-wrap gap-3 font-mono text-xs text-[#A89090]">
          <span>{beds} Bedroom</span>
          <span>·</span>
          <span>{baths} Bathroom</span>
        </div>
        <button
          type="button"
          onClick={() =>
            props.onViewDetails({
              id: props.id,
              address: addr,
              image: img,
              rent,
              bedrooms: beds,
              bathrooms: baths,
            })
          }
          className="btn-ghost mt-4 w-full py-2.5 text-sm"
        >
          View Details
        </button>
      </div>
    </article>
  );
}
