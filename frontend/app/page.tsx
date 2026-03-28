import Link from "next/link";

const features = [
  {
    href: "/pantry",
    title: "Food Pantries",
    desc: "Locate free groceries and meals near campus.",
    icon: (
      <svg className="h-14 w-14" viewBox="0 0 24 24" fill="none" aria-hidden>
        <path
          d="M12 3L4 8v6c0 5 3.5 9 8 10 4.5-1 8-5 8-10V8l-8-5z"
          stroke="currentColor"
          strokeWidth="1.25"
          className="text-[rgba(192,57,43,0.35)]"
        />
        <path
          d="M12 8v5M9 11h6"
          stroke="currentColor"
          strokeWidth="1.25"
          className="text-[#FF2D2D]/80"
        />
      </svg>
    ),
  },
  {
    href: "/library",
    title: "Study Spaces",
    desc: "Libraries and cafés with Wi‑Fi and the right vibe.",
    icon: (
      <svg className="h-14 w-14" viewBox="0 0 24 24" fill="none" aria-hidden>
        <path
          d="M4 19V5a2 2 0 012-2h12a2 2 0 012 2v14"
          stroke="currentColor"
          strokeWidth="1.25"
          className="text-[rgba(192,57,43,0.35)]"
        />
        <path
          d="M8 7h8M8 11h5"
          stroke="currentColor"
          strokeWidth="1.25"
          className="text-[#FF2D2D]/80"
        />
      </svg>
    ),
  },
  {
    href: "/budget#rent",
    title: "Rent Finder",
    desc: "Filter mock listings by monthly budget and neighborhood.",
    icon: (
      <svg className="h-14 w-14" viewBox="0 0 24 24" fill="none" aria-hidden>
        <rect
          x="3"
          y="6"
          width="18"
          height="14"
          rx="2"
          stroke="currentColor"
          strokeWidth="1.25"
          className="text-[rgba(192,57,43,0.35)]"
        />
        <path
          d="M7 12h10M7 16h6"
          stroke="currentColor"
          strokeWidth="1.25"
          className="text-[#FF2D2D]/80"
        />
      </svg>
    ),
  },
  {
    href: "/budget#tracker",
    title: "Budget Tracker",
    desc: "Live expenses vs income with usage bars and status.",
    icon: (
      <svg className="h-14 w-14" viewBox="0 0 24 24" fill="none" aria-hidden>
        <path
          d="M12 21s7-4.5 7-11a7 7 0 10-14 0c0 6.5 7 11 7 11z"
          stroke="currentColor"
          strokeWidth="1.25"
          className="text-[rgba(192,57,43,0.35)]"
        />
        <circle
          cx="12"
          cy="10"
          r="2"
          stroke="currentColor"
          strokeWidth="1.25"
          className="text-[#FF2D2D]/80"
        />
      </svg>
    ),
  },
];

const stats = [
  { value: "50+", label: "Resources Mapped" },
  { value: "Real-Time", label: "Budget Tracking" },
  { value: "NYC", label: "Built for NYC Students" },
];

export default function HomePage() {
  return (
    <main>
      <section className="hero-grid-bg relative flex min-h-[calc(100vh-56px)] flex-col justify-center px-4 pb-16 pt-12 sm:px-6">
        <div
          className="pointer-events-none absolute inset-0 bg-gradient-to-b from-[rgba(192,57,43,0.12)] via-transparent to-transparent"
          aria-hidden
        />
        <div className="relative z-10 mx-auto max-w-6xl text-center">
          <p className="font-mono text-xs uppercase tracking-[0.35em] text-[#FF6B6B]">
            Urban student ops // MVP
          </p>
          <h1 className="mt-4 font-sans text-4xl font-bold leading-tight tracking-tight text-[#F5F5F5] sm:text-5xl md:text-6xl">
            Everything a college student needs,{" "}
            <span className="text-[#FF6B6B]">in one place</span>
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-base text-[#A89090] sm:text-lg">
            CampusCompass helps you find housing, pantries, and study spots—plus
            a live budget snapshot—without switching apps. Built as a hackathon
            MVP with mock NYC data.
          </p>
          <div className="mt-10 flex flex-wrap justify-center gap-4">
            <Link href="/pantry" className="btn-primary inline-flex items-center gap-2 px-8 py-3">
              Explore Resources
            </Link>
            <Link href="/budget" className="btn-ghost inline-flex items-center gap-2 px-8 py-3">
              Open Budget Lab
            </Link>
          </div>
        </div>

        <div className="relative z-10 mx-auto mt-16 grid w-full max-w-6xl gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {features.map((f) => (
            <Link
              key={f.title}
              href={f.href}
              className="glass-card group flex flex-col rounded-xl border border-[rgba(192,57,43,0.25)] p-6 text-left transition hover:border-[rgba(255,45,45,0.45)] hover:shadow-[0_0_12px_rgba(255,45,45,0.4)]"
            >
              <div className="opacity-80 transition group-hover:opacity-100 group-hover:drop-shadow-[0_0_12px_rgba(255,45,45,0.35)]">
                {f.icon}
              </div>
              <h2 className="mt-4 font-sans text-lg font-semibold text-[#F5F5F5]">
                {f.title}
              </h2>
              <p className="mt-2 font-sans text-sm text-[#A89090]">{f.desc}</p>
            </Link>
          ))}
        </div>
      </section>

      <div className="h-px w-full bg-gradient-to-r from-transparent via-[rgba(192,57,43,0.45)] to-transparent" />

      <section className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
        <h2 className="text-center font-sans text-2xl font-bold text-[#F5F5F5] sm:text-3xl">
          Why CampusCompass?
        </h2>
        <p className="mx-auto mt-3 max-w-2xl text-center text-sm text-[#A89090]">
          One HUD for essentials—so you spend less time searching and more time
          studying.
        </p>
        <div className="mt-12 grid gap-8 sm:grid-cols-3">
          {stats.map((s) => (
            <div
              key={s.label}
              className="glass-card rounded-xl border border-[rgba(192,57,43,0.25)] px-6 py-8 text-center"
            >
              <p className="font-mono text-3xl font-semibold text-[#F5F5F5] [text-shadow:0_0_14px_rgba(255,45,45,0.45)] sm:text-4xl">
                {s.value}
              </p>
              <p className="mt-2 font-sans text-sm text-[#A89090]">{s.label}</p>
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}
