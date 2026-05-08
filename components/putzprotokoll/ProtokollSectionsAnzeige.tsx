import { Camera, CheckCircle2, Circle } from "lucide-react";
import {
  cleaningPhotoUrl,
  type CleaningProtocol,
  type ProtocolSectionEntry,
} from "@/lib/putzprotokoll-types";

/**
 * Render der Sections eines eingereichten Protokolls. Wird sowohl
 * auf der Mitarbeiter-Detail-Page als auch auf der Admin-Detail-
 * Page verwendet (read-only). Photos werden als Klick-bare Thumbs
 * gerendert (oeffnen in neuem Tab via Public-URL).
 */
export function ProtokollSectionsAnzeige({
  protokoll,
  alleAufgabenProSection,
}: {
  protokoll: CleaningProtocol;
  /**
   * Original-Aufgabenliste pro Section (aus Template-Loader).
   * Wenn nicht vorhanden, wird nur tasks_done angezeigt (haken-only).
   */
  alleAufgabenProSection?: Map<string, string[]>;
}) {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
  return (
    <div className="space-y-4">
      {protokoll.sections.map((sec, idx) => (
        <SectionCard
          key={sec.section_id || idx}
          sec={sec}
          idx={idx + 1}
          alleAufgaben={alleAufgabenProSection?.get(sec.section_id) ?? null}
          supabaseUrl={supabaseUrl}
        />
      ))}
      {protokoll.general_note && (
        <section className="rounded-2xl border border-border bg-card p-5">
          <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
            Allgemeine Notiz
          </p>
          <p className="mt-2 whitespace-pre-wrap text-sm leading-relaxed">
            {protokoll.general_note}
          </p>
        </section>
      )}
    </div>
  );
}

function SectionCard({
  sec,
  idx,
  alleAufgaben,
  supabaseUrl,
}: {
  sec: ProtocolSectionEntry;
  idx: number;
  alleAufgaben: string[] | null;
  supabaseUrl: string;
}) {
  // Wenn die original Liste verfuegbar ist, alle Aufgaben mit
  // Haken/Kreis anzeigen. Sonst nur die abgehakten.
  const aufgabenZuZeigen = alleAufgaben ?? sec.tasks_done;
  const istErledigt = (a: string) => sec.tasks_done.includes(a);
  const erledigtAnzahl = sec.tasks_done.length;
  const gesamtAnzahl = alleAufgaben?.length ?? sec.tasks_done.length;

  return (
    <section className="rounded-2xl border border-border bg-card p-5 sm:p-6">
      <header className="flex items-start justify-between gap-3 border-b border-border pb-4">
        <div className="flex items-start gap-3">
          <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[hsl(var(--brand-pink)/0.12)] text-sm font-bold tabular-nums text-[hsl(var(--brand-pink))]">
            {idx}
          </span>
          <div>
            <h3 className="text-base font-semibold tracking-tight sm:text-lg">
              {sec.titel}
            </h3>
            <p className="text-[11px] text-muted-foreground">
              {erledigtAnzahl} / {gesamtAnzahl} Aufgaben erledigt
            </p>
          </div>
        </div>
      </header>

      <ul className="mt-4 space-y-1.5">
        {aufgabenZuZeigen.map((a, i) => {
          const ok = istErledigt(a);
          return (
            <li
              key={`${idx}-${i}`}
              className="flex items-start gap-2.5 rounded-md px-2 py-1.5"
            >
              {ok ? (
                <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-[hsl(var(--success))]" />
              ) : (
                <Circle className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground/40" />
              )}
              <span
                className={
                  ok
                    ? "text-sm text-muted-foreground line-through"
                    : "text-sm"
                }
              >
                {a}
              </span>
            </li>
          );
        })}
      </ul>

      {sec.maengel && sec.maengel.trim().length > 0 && (
        <div className="mt-5 rounded-xl border border-[hsl(var(--brand-pink)/0.3)] bg-[hsl(var(--brand-pink)/0.05)] p-3">
          <p className="text-[10px] font-bold uppercase tracking-wider text-[hsl(var(--brand-pink))]">
            Mängel / Bemerkungen
          </p>
          <p className="mt-1 whitespace-pre-wrap text-sm leading-relaxed">
            {sec.maengel}
          </p>
        </div>
      )}

      {sec.photo_paths.length > 0 && (
        <div className="mt-4">
          <p className="mb-2 inline-flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
            <Camera className="h-3.5 w-3.5" />
            {sec.photo_paths.length}{" "}
            {sec.photo_paths.length === 1 ? "Foto" : "Fotos"}
          </p>
          <ul className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-4">
            {sec.photo_paths.map((p, i) => {
              const url = cleaningPhotoUrl(p, supabaseUrl);
              if (!url) return null;
              return (
                <li
                  key={p}
                  className="aspect-square overflow-hidden rounded-lg border border-border bg-muted"
                >
                  <a
                    href={url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block h-full w-full"
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={url}
                      alt={`Foto ${i + 1} aus ${sec.titel}`}
                      className="h-full w-full object-cover transition-transform hover:scale-105"
                    />
                  </a>
                </li>
              );
            })}
          </ul>
        </div>
      )}
    </section>
  );
}
