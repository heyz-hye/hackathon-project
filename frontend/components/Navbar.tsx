"use client";

import { useAuth } from "@/contexts/AuthContext";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

const nav = [
  { href: "/", label: "Home" },
  { href: "/pantry", label: "Pantry" },
  { href: "/library", label: "Library" },
  { href: "/events", label: "Find Events" },
  { href: "/budget", label: "Rent & Budget" },
];

export default function Navbar() {
  const pathname = usePathname() ?? "";
  const { user, loading, logout } = useAuth();
  const [open, setOpen] = useState(false);
  const isAuthPage = pathname === "/login" || pathname === "/signup";
  const showFullNav = !isAuthPage && !loading && user;

  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [open]);

  if (isAuthPage || (!user && !loading)) {
    return (
      <nav
        className="sticky top-0 z-50 border-b border-[rgba(192,57,43,0.3)] backdrop-blur-md"
        style={{ background: "rgba(10, 10, 15, 0.65)" }}
      >
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3 sm:px-6">
          <Link
            href="/"
            className="font-sans text-lg font-bold tracking-tight text-[#F5F5F5] transition hover:text-[#FF6B6B]"
          >
            Campus<span className="text-[#FF2D2D]">◆</span>Compass
          </Link>
          {isAuthPage ? (
            <Link
              href="/"
              className="font-mono text-xs text-[#A89090] hover:text-[#FF6B6B]"
            >
              Back to app
            </Link>
          ) : null}
        </div>
      </nav>
    );
  }

  if (!showFullNav) {
    return (
      <nav
        className="sticky top-0 z-50 border-b border-[rgba(192,57,43,0.3)] backdrop-blur-md"
        style={{ background: "rgba(10, 10, 15, 0.65)" }}
      >
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3 sm:px-6">
          <Link
            href="/"
            className="font-sans text-lg font-bold tracking-tight text-[#F5F5F5]"
          >
            Campus<span className="text-[#FF2D2D]">◆</span>Compass
          </Link>
          <span className="font-mono text-xs text-[#A89090]">Loading…</span>
        </div>
      </nav>
    );
  }

  return (
    <>
      <nav
        className="sticky top-0 z-50 border-b border-[rgba(192,57,43,0.3)] backdrop-blur-md"
        style={{ background: "rgba(10, 10, 15, 0.65)" }}
      >
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-3 sm:px-6">
          <Link
            href="/"
            className="font-sans text-lg font-bold tracking-tight text-[#F5F5F5] transition hover:text-[#FF6B6B]"
          >
            Campus<span className="text-[#FF2D2D]">◆</span>Compass
          </Link>

          <ul className="hidden flex-1 flex-wrap items-center justify-end gap-1 md:flex">
            {nav.map(({ href, label }) => {
              const active =
                href === "/"
                  ? pathname === "/"
                  : pathname.startsWith(href);
              return (
                <li key={href}>
                  <Link
                    href={href}
                    className={`group relative px-3 py-2 text-sm font-medium transition ${
                      active
                        ? "text-[#FF6B6B]"
                        : "text-[#A89090] hover:text-[#F5F5F5]"
                    }`}
                  >
                    {label}
                    <span
                      className={`absolute bottom-0 left-3 right-3 h-0.5 rounded-full transition ${
                        active
                          ? "bg-[#FF2D2D] shadow-[0_0_12px_rgba(255,45,45,0.6)]"
                          : "bg-transparent group-hover:bg-[#C0392B]/40"
                      }`}
                    />
                  </Link>
                </li>
              );
            })}
            <li>
              <button
                type="button"
                onClick={() => logout()}
                className="ml-2 rounded-lg border border-[rgba(192,57,43,0.45)] px-3 py-2 font-mono text-xs text-[#FF6B6B] transition hover:border-[#FF2D2D] hover:text-[#F5F5F5]"
              >
                Log out
              </button>
            </li>
          </ul>

          <button
            type="button"
            className="flex h-10 w-10 items-center justify-center rounded border border-[rgba(192,57,43,0.35)] text-[#F5F5F5] shadow-[0_0_0_0_rgba(255,45,45,0)] transition hover:border-[#FF2D2D] hover:shadow-[0_0_12px_rgba(255,45,45,0.35)] focus:outline-none focus:ring-2 focus:ring-[#FF2D2D]/50 md:hidden"
            aria-expanded={open}
            aria-controls="mobile-drawer"
            onClick={() => setOpen((v) => !v)}
          >
            <span className="sr-only">Open menu</span>
            <svg
              className="h-5 w-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              {open ? (
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              ) : (
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 6h16M4 12h16M4 18h16"
                />
              )}
            </svg>
          </button>
        </div>
      </nav>

      <div
        id="mobile-drawer"
        className={`fixed inset-0 z-[60] md:hidden ${
          open ? "pointer-events-auto" : "pointer-events-none"
        }`}
        aria-hidden={!open}
      >
        <button
          type="button"
          className={`absolute inset-0 bg-black/70 backdrop-blur-sm transition-opacity ${
            open ? "opacity-100" : "opacity-0"
          }`}
          onClick={() => setOpen(false)}
          tabIndex={open ? 0 : -1}
          aria-label="Close menu"
        />
        <aside
          className={`absolute right-0 top-0 flex h-full w-[min(100%,20rem)] flex-col border-l border-[rgba(192,57,43,0.35)] bg-[#120A0A]/95 shadow-[-8px_0_24px_rgba(0,0,0,0.5)] backdrop-blur-xl transition-transform duration-300 ease-out ${
            open ? "translate-x-0" : "translate-x-full"
          }`}
        >
          <div className="border-b border-[rgba(192,57,43,0.25)] px-4 py-4">
            <p className="font-mono text-xs uppercase tracking-widest text-[#FF6B6B]">
              Navigate
            </p>
          </div>
          <nav className="flex flex-1 flex-col gap-1 p-4">
            {nav.map(({ href, label }) => {
              const active =
                href === "/"
                  ? pathname === "/"
                  : pathname.startsWith(href);
              return (
                <Link
                  key={href}
                  href={href}
                  className={`rounded-lg border px-4 py-3 text-sm font-medium transition ${
                    active
                      ? "border-[#FF2D2D] bg-[rgba(192,57,43,0.15)] text-[#FF6B6B] shadow-[0_0_12px_rgba(255,45,45,0.25)]"
                      : "border-transparent text-[#A89090] hover:border-[rgba(192,57,43,0.4)] hover:bg-[#1A0D0D] hover:text-[#F5F5F5]"
                  }`}
                >
                  {label}
                </Link>
              );
            })}
            <button
              type="button"
              onClick={() => {
                logout();
                setOpen(false);
              }}
              className="mt-4 rounded-lg border border-[rgba(192,57,43,0.45)] px-4 py-3 text-left font-mono text-sm text-[#FF6B6B]"
            >
              Log out
            </button>
          </nav>
        </aside>
      </div>
    </>
  );
}
