"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { ArrowRight, Menu, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { Logo } from "@/components/brand/Logo";

const NAV_LINKS = [
  { href: "#story", label: "Wie das läuft" },
  { href: "#bausteine", label: "Bausteine" },
  { href: "#studio", label: "Studio" },
];

export function StickyNav() {
  const [scrolled, setScrolled] = useState(false);
  const [menuOffen, setMenuOffen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 16);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Body-Scroll lock wenn Mobile-Menü offen
  useEffect(() => {
    if (menuOffen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [menuOffen]);

  return (
    <>
      <header
        className={cn(
          "fixed inset-x-0 top-0 z-50 transition-all duration-300",
          scrolled
            ? "border-b border-white/[0.08] bg-[hsl(var(--brand-ink)/0.82)] backdrop-blur-xl"
            : "border-b border-transparent bg-transparent",
        )}
      >
        {/* Magenta-Akzent-Linie unten beim Scrollen */}
        <div
          aria-hidden
          className={cn(
            "absolute inset-x-0 bottom-0 h-px origin-left transition-transform duration-500",
            scrolled ? "scale-x-100" : "scale-x-0",
          )}
          style={{
            background:
              "linear-gradient(90deg, transparent, hsl(var(--primary) / 0.45), transparent)",
          }}
        />

        <div className="flex w-full items-center justify-between px-6 py-4 lg:px-12 2xl:px-20">
          <Link
            href="/"
            className="group flex items-center gap-2.5 text-[hsl(var(--brand-cream))]"
            aria-label="Vitness Crew Startseite"
          >
            <span className="transition-transform duration-300 group-hover:scale-105">
              <Logo size={32} priority />
            </span>
            <span className="text-[15px] font-semibold tracking-tight">
              Vitness Crew
            </span>
          </Link>

          <nav className="hidden items-center gap-1 md:flex">
            {NAV_LINKS.map((link) => (
              <a
                key={link.href}
                href={link.href}
                className="rounded-full px-3.5 py-1.5 text-sm text-[hsl(var(--brand-cream)/0.65)] transition-colors hover:bg-white/[0.06] hover:text-[hsl(var(--brand-cream))]"
              >
                {link.label}
              </a>
            ))}
          </nav>

          <div className="flex items-center gap-2">
            <Link
              href="/login"
              className="group hidden items-center gap-1.5 rounded-full bg-[hsl(var(--primary))] px-4 py-2 text-sm font-semibold text-[hsl(var(--primary-foreground))] shadow-[0_4px_14px_-4px_hsl(var(--primary)/0.5)] transition-all duration-200 hover:bg-[hsl(var(--primary)/0.9)] hover:shadow-[0_10px_30px_-8px_hsl(var(--primary)/0.6)] sm:inline-flex"
            >
              Anmelden
              <ArrowRight className="h-3.5 w-3.5 transition-transform duration-300 group-hover:translate-x-1" />
            </Link>

            {/* Mobile-Menue-Button */}
            <button
              type="button"
              onClick={() => setMenuOffen(true)}
              className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-white/10 bg-white/[0.04] text-[hsl(var(--brand-cream))] transition-colors hover:bg-white/[0.08] md:hidden"
              aria-label="Menü öffnen"
            >
              <Menu className="h-4 w-4" />
            </button>
          </div>
        </div>
      </header>

      {/* Mobile-Sheet */}
      {menuOffen && (
        <div
          className="fixed inset-0 z-[60] flex flex-col bg-[hsl(var(--brand-ink))] text-[hsl(var(--brand-cream))] md:hidden"
          role="dialog"
          aria-modal="true"
        >
          <div className="flex items-center justify-between px-6 py-4">
            <Link
              href="/"
              className="flex items-center gap-2.5"
              onClick={() => setMenuOffen(false)}
            >
              <Logo size={32} />
              <span className="text-[15px] font-semibold tracking-tight">
                Vitness Crew
              </span>
            </Link>
            <button
              type="button"
              onClick={() => setMenuOffen(false)}
              className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-white/10 bg-white/[0.04]"
              aria-label="Menü schließen"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          <nav className="flex flex-1 flex-col justify-center gap-2 px-6">
            {NAV_LINKS.map((link, i) => (
              <a
                key={link.href}
                href={link.href}
                onClick={() => setMenuOffen(false)}
                className="block py-3 text-3xl font-semibold tracking-tight text-[hsl(var(--brand-cream))]"
                style={{
                  animation: `fadeUp 0.5s cubic-bezier(0.2,0.7,0.2,1) ${
                    i * 60
                  }ms both`,
                }}
              >
                {link.label}
                <span aria-hidden className="ml-2 text-[hsl(var(--primary))]">
                  →
                </span>
              </a>
            ))}
          </nav>

          <div className="px-6 pb-10">
            <Link
              href="/login"
              onClick={() => setMenuOffen(false)}
              className="flex w-full items-center justify-center gap-2 rounded-full bg-[hsl(var(--primary))] px-6 py-4 text-base font-semibold text-[hsl(var(--primary-foreground))]"
            >
              Anmelden
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>

          <style>{`
            @keyframes fadeUp {
              from { opacity: 0; transform: translateY(12px); }
              to   { opacity: 1; transform: translateY(0); }
            }
          `}</style>
        </div>
      )}
    </>
  );
}
