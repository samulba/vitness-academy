"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

export function StickyNav() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 16);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={cn(
        "fixed inset-x-0 top-0 z-50 transition-colors duration-200",
        scrolled
          ? "border-b border-white/[0.08] bg-[hsl(var(--brand-ink)/0.78)] backdrop-blur-md"
          : "border-b border-transparent bg-transparent",
      )}
    >
      <div className="flex w-full items-center justify-between px-6 py-4 lg:px-12 2xl:px-20">
        <Link
          href="/"
          className="flex items-center gap-2.5 text-[hsl(var(--brand-cream))]"
        >
          <span className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-[hsl(var(--brand-lime))] text-sm font-bold text-[hsl(var(--brand-ink))]">
            VA
          </span>
          <span className="text-[15px] font-semibold tracking-tight">
            Vitness Academy
          </span>
        </Link>

        <nav className="hidden items-center gap-8 text-sm text-[hsl(var(--brand-cream)/0.7)] md:flex">
          <a
            href="#story"
            className="transition-colors hover:text-[hsl(var(--brand-cream))]"
          >
            Wie das läuft
          </a>
        </nav>

        <Link
          href="/login"
          className="inline-flex items-center gap-1.5 rounded-full bg-[hsl(var(--brand-lime))] px-4 py-2 text-sm font-semibold text-[hsl(var(--brand-ink))] transition-transform hover:scale-[1.02]"
        >
          Anmelden
        </Link>
      </div>
    </header>
  );
}
