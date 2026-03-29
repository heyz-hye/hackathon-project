"use client";

import ApartmentCard from "@/components/ApartmentCard";
import ApartmentModal from "@/components/ApartmentModal";
import BudgetTracker from "@/components/BudgetTracker";
import PageHeader from "@/components/PageHeader";
import { apartments, type Apartment } from "@/lib/data";
import { headers } from "next/headers";
import { useEffect, useMemo, useState } from "react";

type Tab = "rent" | "tracker";

export default function BudgetPage() {
  const [tab, setTab] = useState<Tab>("rent");
  const [budgetDraft, setBudgetDraft] = useState("2000");
  const [budgetApplied, setBudgetApplied] = useState("2000");
  const [locationDraft, setLocationDraft]  = useState("New York");
  const [locationApplied, setLocationApplied] = useState("New York");
  const [locationToUse, setLocationToUse] = useState("New York")
  const [modalApt, setModalApt] = useState<Apartment | null>(null);

  const [listings, setListings] = useState([])


  const maxN = useMemo(() => {
    const n = parseFloat(budgetApplied.replace(/[^0-9.]/g, ""));
    return Number.isFinite(n) && n > 0 ? n : Infinity;
  }, [budgetApplied]);



 
  useEffect(() => {
  const applyHash = () => {
    const h = window.location.hash.replace("#", "");
    if (h === "tracker") setTab("tracker");
    if (h === "rent") setTab("rent");
  };

  applyHash();
  window.addEventListener("hashchange", applyHash);
  return () => window.removeEventListener("hashchange", applyHash);
}, []); // Only runs ONCE on mount

useEffect(() => {
  const getData = async () => {
    // If location is empty, don't bother fetching
    if (!locationApplied.trim()) return;

    try {
      // maxN is now guaranteed to be updated because this effect 
      // runs AFTER the budgetApplied state change has settled.
      const url = `http://localhost:4001/api/places-to-rent/${maxN}/${locationApplied.trim()}`;
      const response = await fetch(url);
      const data = await response.json();
      
      // Note: your data structure seems to have a .properties key
      const results = data.properties || [];
      setListings(results);
      console.log(results)
      
    } catch (err) {
      console.error("Fetch error:", err);
      setListings([]);
    }
  };

  getData();
}, [maxN, locationApplied]); // This is your "Trigger"

 
return (
    <main className="pb-16">
      <PageHeader
        backgroundWord="BUDGET"
        title="Rent & budget"
        subtitle="Mock apartment cards and a live budget tracker—no backend required."
      />

      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <div
          className="flex flex-wrap justify-center gap-2 rounded-xl border border-[rgba(192,57,43,0.25)] bg-[rgba(18,10,10,0.5)] p-2 backdrop-blur-md"
          role="tablist"
          aria-label="Rent or budget"
        >
          <button
            type="button"
            role="tab"
            aria-selected={tab === "rent"}
            className={`min-w-[140px] rounded-lg px-5 py-2.5 font-mono text-sm font-medium transition ${
              tab === "rent"
                ? "border border-[#FF2D2D] bg-[rgba(192,57,43,0.25)] text-[#F5F5F5] shadow-[0_0_12px_rgba(255,45,45,0.35)]"
                : "border border-transparent text-[#A89090] hover:border-[rgba(192,57,43,0.35)] hover:text-[#F5F5F5]"
            }`}
            onClick={() => {
              setTab("rent");
              window.history.replaceState(null, "", "#rent");
            }}
          >
            Rent finder
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={tab === "tracker"}
            className={`min-w-[140px] rounded-lg px-5 py-2.5 font-mono text-sm font-medium transition ${
              tab === "tracker"
                ? "border border-[#FF2D2D] bg-[rgba(192,57,43,0.25)] text-[#F5F5F5] shadow-[0_0_12px_rgba(255,45,45,0.35)]"
                : "border border-transparent text-[#A89090] hover:border-[rgba(192,57,43,0.35)] hover:text-[#F5F5F5]"
            }`}
            onClick={() => {
              setTab("tracker");
              window.history.replaceState(null, "", "#tracker");
            }}
          >
            Budget tracker
          </button>
        </div>

        <div className="mt-12 h-px w-full bg-gradient-to-r from-transparent via-[rgba(192,57,43,0.45)] to-transparent" />

        {tab === "rent" ? (
          <section id="rent" className="scroll-mt-28 pt-10">
            <h2 className="font-sans text-2xl font-bold text-[#F5F5F5]">
              Rent finder
            </h2>
            <p className="mt-2 max-w-2xl font-sans text-sm text-[#A89090]">
              Enter a monthly max to filter mock listings. Prices use monospace
              styling with a red glow.
            </p>
            <div className="mt-6 flex flex-col gap-4 sm:flex-row sm:items-end">
              <label className="flex flex-col gap-2">
                <span className="font-mono text-xs uppercase tracking-wider text-[#FF6B6B]">
                  Monthly budget (max)
                </span>
                <input
                  type="text"
                  inputMode="numeric"
                  value={budgetDraft}
                  onChange={(e) => setBudgetDraft(e.target.value)}
                  className="input-hud max-w-xs font-mono"
                  placeholder="2000"
                />
              </label>

               <label className="flex flex-col gap-2">
                <span className="font-mono text-xs uppercase tracking-wider text-[#FF6B6B]">
                  Location
                </span>
                <input
                  type="text"
                  inputMode="numeric"
                  value={locationDraft}
                  onChange={(e) => setLocationDraft(e.target.value)}
                  className="input-hud max-w-xs font-mono"
                  placeholder="New York"
                />
              </label>
              <button
                type="button"
                className="btn-primary sm:mb-0.5"
                onClick={(e) => 
                {
                  setBudgetApplied(budgetDraft);
                  setLocationApplied(locationDraft);

                  
                       }
                      }
              >
                Apply filter
              </button>
            </div>
            <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">

              {
              listings.filter((a) =>{
                return a.rentZestimate != null
              }).map((apt) => (
                <ApartmentCard
                  key={apt.id}
                  address={apt.addressRaw}
                  image={apt.image}
                  rent={apt.rentZestimate}
                  bedrooms={apt.beds}
                  bathrooms={apt.baths}

                  onViewDetails={setModalApt}
                />
              ))
              }
            </div>
            {listings.length === 0 ? (
              <p className="mt-8 font-sans text-sm text-[#A89090]">
                No listings under that budget. Raise the cap to see more mock
                units.
              </p>
            ) : null}
          </section>
        ) : null}

        {tab === "tracker" ? (
          <section id="tracker" className="scroll-mt-28 pt-10">
            <h2 className="font-sans text-2xl font-bold text-[#F5F5F5]">
              Budget tracker
            </h2>
            <p className="mt-2 max-w-2xl font-sans text-sm text-[#A89090]">
              Adjust inputs to see remaining budget and a usage bar with status
              colors.
            </p>
            <div className="mt-8">
              <BudgetTracker />
            </div>
          </section>
        ) : null}
      </div>

      <ApartmentModal apt={modalApt} onClose={() => setModalApt(null)} />
    </main>
  );
}
