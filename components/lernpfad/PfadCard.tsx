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

/**
 * Mappt einen Lernpfad-Titel auf einen Bild-Slug.
 * Bilder erwartet unter /public/lernpfade/<slug>.jpg
 * Wenn das Bild fehlt, faellt der Card-Background zurueck auf
 * den Magenta-Verlauf -- die Karte sieht trotzdem gut aus.
 */
function bildSlugFuerTitel(title: string): {
  slug: string;
  nummer: string;
  kategorie: string;
} {
  const t = title.toLowerCase();
  if (t.includes("magicline")) {
    return { slug: "02-magicline", nummer: "02", kategorie: "Magicline" };
  }
  if (t.includes("reha") || t.includes("präv")) {
    return { slug: "03-reha", nummer: "03", kategorie: "Reha" };
  }
  if (t.includes("trainer")) {
    return { slug: "04-trainer", nummer: "04", kategorie: "Trainer" };
  }
  // Default: Service / Theke / Empfang
  return { slug: "01-service", nummer: "01", kategorie: "Service" };
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
  const { slug, nummer, kategorie } = bildSlugFuerTitel(title);

  return (
    <Link
      href={`/lernpfade/${id}`}
      className="group relative block overflow-hidden rounded-2xl border border-border bg-card transition-all duration-300 hover:-translate-y-1 hover:border-[hsl(var(--primary))] hover:shadow-[0_24px_60px_-24px_hsl(var(--primary)/0.4)]"
    >
      {/* Hero-Image */}
      <div className="relative aspect-[5/3] w-full overflow-hidden bg-[hsl(var(--brand-ink))]">
        {/* Fallback-Gradient -- liegt unter dem Bild, scheint durch wenn Bild fehlt */}
        <div
          aria-hidden
          className="absolute inset-0"
          style={{
            background: `linear-gradient(135deg, hsl(var(--brand-ink)) 0%, hsl(var(--primary)) 60%, hsl(var(--brand-pink)) 100%)`,
          }}
        />
        {/* Subtiles Grid-Pattern */}
        <div
          aria-hidden
          className="absolute inset-0 opacity-[0.10]"
          style={{
            backgroundImage:
              "linear-gradient(hsl(var(--brand-cream)) 1px, transparent 1px), linear-gradient(90deg, hsl(var(--brand-cream)) 1px, transparent 1px)",
            backgroundSize: "40px 40px",
          }}
        />
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={`/lernpfade/${slug}.jpg`}
          alt=""
          loading="lazy"
          aria-hidden
          className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 group-hover:scale-[1.04]"
          onError={(e) => {
            // Bild fehlt -> verstecken, Gradient drunter scheint durch
            (e.currentTarget as HTMLImageElement).style.display = "none";
          }}
        />

        {/* Dunkler Verlauf unten fuer Lesbarkeit */}
        <div
          aria-hidden
          className="absolute inset-x-0 bottom-0 h-2/3 bg-gradient-to-t from-[hsl(var(--brand-ink))] via-[hsl(var(--brand-ink)/0.5)] to-transparent"
        />

        {/* Kapitel-Nummer oben links */}
        <div className="absolute left-5 top-5 flex items-center gap-3">
          <span className="rounded-full border border-white/30 bg-white/10 px-2.5 py-1 font-mono text-[11px] font-semibold uppercase tracking-wider text-white backdrop-blur">
            Kap. {nummer}
          </span>
          <span className="text-[11px] font-medium uppercase tracking-[0.18em] text-white/75">
            {kategorie}
          </span>
        </div>

        {/* Status-Pill oben rechts */}
        <div className="absolute right-5 top-5">
          {fertig ? (
            <span className="inline-flex items-center gap-1 rounded-full bg-[hsl(var(--success))] px-2.5 py-1 text-[11px] font-semibold text-white">
              <CheckCircle2 className="h-3 w-3" />
              Abgeschlossen
            </span>
          ) : prozent > 0 ? (
            <span className="rounded-full bg-[hsl(var(--primary))] px-2.5 py-1 text-[11px] font-semibold text-[hsl(var(--primary-foreground))]">
              {formatProzent(prozent)}
            </span>
          ) : (
            <span className="rounded-full bg-white/15 px-2.5 py-1 text-[11px] font-semibold text-white backdrop-blur">
              Neu
            </span>
          )}
        </div>

        {/* Titel + Pfeil unten im Bild */}
        <div className="absolute inset-x-0 bottom-0 flex items-end justify-between gap-4 p-5">
          <h3 className="text-balance text-2xl font-semibold leading-tight tracking-tight text-white sm:text-3xl">
            {title}
          </h3>
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-white text-[hsl(var(--brand-ink))] transition-transform group-hover:translate-x-1 group-hover:-translate-y-1">
            <ArrowUpRight className="h-4 w-4" />
          </span>
        </div>
      </div>

      {/* Footer mit Beschreibung + Progress */}
      <div className="space-y-4 p-5">
        {description && (
          <p className="line-clamp-2 text-sm leading-relaxed text-muted-foreground">
            {description}
          </p>
        )}

        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <span className="inline-flex items-center gap-1.5">
            <BookOpen className="h-3.5 w-3.5" />
            {modulAnzahl} {modulAnzahl === 1 ? "Modul" : "Module"}
          </span>
          <span className="font-medium tabular-nums text-foreground">
            {abgeschlossen} / {gesamt} Lektionen
          </span>
        </div>

        <div className="h-1 overflow-hidden rounded-full bg-muted">
          <div
            className="h-full rounded-full bg-[hsl(var(--primary))] transition-[width] duration-500"
            style={{ width: `${Math.max(0, Math.min(100, prozent))}%` }}
          />
        </div>
      </div>
    </Link>
  );
}
