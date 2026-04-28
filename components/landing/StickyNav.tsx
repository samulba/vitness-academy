"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

export function StickyNav() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={cn(
        "fixed inset-x-0 top-0 z-50 transition-all duration-300",
        scrolled
          ? "border-b border-white/10 bg-[hsl(var(--brand-ink)/0.8)] backdrop-blur"
          : "bg-transparent",
      )}
    >
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4 lg:px-8">
        <Link
          href="/"
          className="flex items-center gap-2 font-semibold tracking-tight text-[hsl(var(--brand-cream))]"
        >
          <span className="brand-gradient inline-flex h-9 w-9 items-center justify-center rounded-xl text-sm font-bold text-[hsl(var(--brand-ink))] shadow-lg">
            VA
          </span>
          <span>Vitness Academy</span>
        </Link>

        <nav className="hidden items-center gap-7 text-sm text-[hsl(var(--brand-cream)/0.8)] md:flex">
          <a href="#problem" className="hover:text-[hsl(var(--brand-lime))]">
            Warum
          </a>
          <a href="#features" className="hover:text-[hsl(var(--brand-lime))]">
            Was du bekommst
          </a>
          <a href="#prozess" className="hover:text-[hsl(var(--brand-lime))]">
            So läuft's
          </a>
        </nav>

        <Link
          href="/login"
          className="rounded-full bg-[hsl(var(--brand-lime))] px-4 py-2 text-sm font-semibold text-[hsl(var(--brand-ink))] shadow-md transition-colors hover:bg-[hsl(var(--brand-lime)/0.85)]"
        >
          Anmelden
        </Link>
      </div>
    </header>
  );
}
