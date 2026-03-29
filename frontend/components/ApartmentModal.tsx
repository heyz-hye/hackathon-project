"use client";

import type { Apartment } from "@/lib/data";
import { useEffect } from "react";

type ApartmentModalProps = {
  apt: Apartment | null;
  onClose: () => void;
};

export default function ApartmentModal({ apt, onClose }: ApartmentModalProps) {
  useEffect(() => {
    if (!apt) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [apt, onClose]);

  if (!apt) return null;

  return (
    <div
      className="fixed inset-0 z-[100] flex items-end justify-center p-4 sm:items-center"
      role="dialog"
      aria-modal="true"
      aria-labelledby="apt-modal-title"
    >
      <button
        type="button"
        className="absolute inset-0 bg-black/75 backdrop-blur-sm transition"
        aria-label="Close dialog"
        onClick={onClose}
      />
      <div className="min-h-[400px] glass-card relative z-10 max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-xl border border-[rgba(192,57,43,0.35)] p-6 shadow-[0_0_40px_rgba(255,45,45,0.15)]">
        <div className="mb-4 h-1 w-16 rounded-full bg-gradient-to-r from-[#C0392B] to-[#FF2D2D]" />
        <h2
          id="apt-modal-title"
          className="font-sans text-xl font-bold text-[#F5F5F5]"
        >
          {apt.address} · {apt.bedrooms} Bedroom · {apt.bathrooms} Bathroom
        </h2>
        <p className="mt-2 font-mono text-2xl text-[#F5F5F5] [text-shadow:0_0_12px_rgba(255,45,45,0.45)]">
          ${apt.rent}
          <span className="text-sm font-normal text-[#A89090]">/month</span>
        </p>
        <p className="mt-4 font-sans text-sm leading-relaxed text-[#A89090]">
          
        </p>
        <div className="min-h-[200px] flex flex-1" style={({
          backgroundImage: `url(${apt.image})`
        })}>

        </div>
        <button type="button" className="btn-primary mt-6 w-full" onClick={onClose}>
          Close
        </button>
      </div>
    </div>
  );
}
