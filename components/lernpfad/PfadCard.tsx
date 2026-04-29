import Link from "next/link";
import { ArrowUpRight, BookOpen, CheckCircle2 } from "lucide-react";
import { formatProzent } from "@/lib/format";

type Props = {
  id: string;
  title: string;
  description: string | null;
  modulAnzahl: number;
  abgeschlossen: number;
  gesamt: number;
  prozent: number;
};

function bildSlugFuerTitel(title: string): {
  slug: string;
  kategorie: string;
} {
  const t = title.toLowerCase();
  if (t.includes("magicline")) {
    return { slug: "02-magicline", kategorie: "Magicline" };
  }
  if (t.includes("reha") || t.includes("präv")) {
    return { slug: "03-reha", kategorie: "Reha" };
  }
  if (t.includes("trainer")) {
    return { slug: "04-trainer", kategorie: "Trainer" };
  }
  return { slug: "01-service", kategorie: "Service" };
}

export function PfadCard({
  id,
  title,
  description,
  modulAnzahl,
  abgeschlossen,
  gesamt,
  prozent,
}: Props) {
  const fertig = gesamt > 0 && abgeschlossen === gesamt;
  const { slug, kategorie } = bildSlugFuerTitel(title);
  const sicherProzent = Math.max(0, Math.min(100, prozent));

  return (
    <Link
      href={`/lernpfade/${id}`}
      className="group relative flex flex-col overflow-hidden rounded-3xl border border-border bg-card transition-all duration-300 hover:-translate-y-1 hover:border-[hsl(var(--primary))] hover:shadow-[0_30px_70px_-25px_hsl(var(--primary)/0.45)]"
    >
      {/* === Hero-Image === */}
      <div className="relative aspect-[16/9] w-full overflow-hidden bg-[hsl(var(--brand-ink))]">
        {/* Fallback-Verlauf */}
        <div
          aria-hidden
          className="absolute inset-0"
          style={{
            background:
              "linear-gradient(135deg, hsl(var(--brand-ink)) 0%, hsl(var(--primary)) 60%, hsl(var(--brand-pink)) 100%)",
          }}
        />
        {/* Hero-Bild */}
        <div
          className="absolute inset-0 bg-cover bg-center transition-transform duration-700 group-hover:scale-[1.05]"
          style={{ backgroundImage: `url(/lernpfade/${slug}.jpg)` }}
        />

        {/* Top-Verlauf — nur leicht, fuer Pill-Lesbarkeit */}
        <div
          aria-hidden
          className="absolute inset-x-0 top-0 h-28 bg-gradient-to-b from-[hsl(var(--brand-ink)/0.55)] to-transparent"
        />
        {/* Bottom-Verlauf — kraeftiger, fuer Titel */}
        <div
          aria-hidden
          className="absolute inset-x-0 bottom-0 h-3/4 bg-gradient-to-t from-[hsl(var(--brand-ink))] via-[hsl(var(--brand-ink)/0.55)] to-transparent"
        />

        {/* Kategorie-Pill (links oben) — KEINE Kapitel-Nr mehr */}
        <span className="absolute left-5 top-5 inline-flex items-center gap-2 rounded-full bg-[hsl(var(--brand-ink)/0.6)] px-3 py-1 text-[10px] font-bold uppercase tracking-[0.2em] text-white backdrop-blur-md ring-1 ring-white/20">
          <span className="h-1 w-1 rounded-full bg-[hsl(var(--primary))]" />
          {kategorie}
        </span>

        {/* Status-Pill (rechts oben) */}
        <div className="absolute right-5 top-5">
          {fertig ? (
            <span className="inline-flex items-center gap-1 rounded-full bg-[hsl(var(--success))] px-2.5 py-1 text-[11px] font-semibold text-white shadow-md">
              <CheckCircle2 className="h-3 w-3" />
              Fertig
            </span>
          ) : sicherProzent > 0 ? (
            <span className="rounded-full bg-[hsl(var(--primary))] px-2.5 py-1 text-[11px] font-semibold text-[hsl(var(--primary-foreground))] shadow-md">
              {formatProzent(sicherProzent)}
            </span>
          ) : (
            <span className="rounded-full bg-[hsl(var(--brand-ink)/0.6)] px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wider text-white backdrop-blur-md ring-1 ring-white/20">
              Neu
            </span>
          )}
        </div>

        {/* Titel + Pfeil unten im Bild */}
        <div className="absolute inset-x-0 bottom-0 flex items-end justify-between gap-4 p-6">
          <h3 className="text-balance text-2xl font-semibold leading-[1.1] tracking-tight text-white sm:text-3xl">
            {title}
          </h3>
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-white text-[hsl(var(--brand-ink))] shadow-md transition-all duration-300 group-hover:translate-x-1 group-hover:-translate-y-1 group-hover:bg-[hsl(var(--primary))] group-hover:text-[hsl(var(--primary-foreground))]">
            <ArrowUpRight className="h-4 w-4" />
          </span>
        </div>
      </div>

      {/* === Magenta-Progress-Linie als Verbindung === */}
      <div className="relative h-[3px] bg-muted">
        <div
          aria-hidden
          className="absolute inset-y-0 left-0 bg-[hsl(var(--primary))] transition-[width] duration-500"
          style={{ width: `${sicherProzent}%` }}
        />
      </div>

      {/* === Footer kompakt === */}
      <div className="flex flex-1 flex-col gap-4 p-6">
        {description && (
          <p className="line-clamp-2 text-sm leading-relaxed text-muted-foreground">
            {description}
          </p>
        )}

        <div className="mt-auto flex items-center justify-between gap-3 pt-2 text-xs">
          <div className="flex items-center gap-1.5 text-muted-foreground">
            <BookOpen className="h-3.5 w-3.5" />
            <span className="font-medium">
              {modulAnzahl} {modulAnzahl === 1 ? "Modul" : "Module"}
            </span>
          </div>
          <div className="flex items-center gap-3 tabular-nums">
            <span className="text-muted-foreground">
              {abgeschlossen} / {gesamt} Lektionen
            </span>
            <span className="font-bold text-[hsl(var(--primary))]">
              {formatProzent(sicherProzent)}
            </span>
          </div>
        </div>
      </div>
    </Link>
  );
}
