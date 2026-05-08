import { notFound } from "next/navigation";
import { CheckCircle2, Circle } from "lucide-react";
import { requireProfile } from "@/lib/auth";
import {
  ladeProtokoll,
  ladeTemplateMitSections,
  cleaningPhotoUrl,
} from "@/lib/putzprotokoll";
import { formatDatum, formatUhrzeitBerlin } from "@/lib/format";
import { Logo } from "@/components/brand/Logo";
import { PrintButton } from "./PrintButton";

export const dynamic = "force-dynamic";

export default async function PrintProtokollPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await requireProfile();
  const { id } = await params;
  const protokoll = await ladeProtokoll(id);
  if (!protokoll) notFound();

  const tpl = await ladeTemplateMitSections(protokoll.location_id);
  const aufgabenMap = new Map<string, string[]>();
  if (tpl) {
    for (const s of tpl.sections) aufgabenMap.set(s.id, s.aufgaben);
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
  return (
    <main className="theme-light-locked min-h-screen bg-background text-foreground">
      <div className="mx-auto max-w-4xl px-6 py-10 print:py-0">
        {/* Print-Toolbar (im Print versteckt) */}
        <div className="mb-6 flex items-center justify-between print:hidden">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Logo size={28} />
            <span className="font-semibold">Vitness Crew</span>
            <span>· Druck-Ansicht</span>
          </div>
          <PrintButton />
        </div>

        {/* Header */}
        <header className="border-b-2 border-foreground pb-5">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold tracking-tight">
                Putzprotokoll
              </h1>
              <p className="mt-1 text-sm text-muted-foreground">
                Tägliches Reinigungsprotokoll · {protokoll.location_name ?? "—"}
              </p>
            </div>
            <div className="flex items-center gap-2 print:hidden">
              <Logo size={36} />
            </div>
          </div>
          <dl className="mt-5 grid grid-cols-2 gap-x-6 gap-y-2 text-sm sm:grid-cols-4">
            <div>
              <dt className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                Datum
              </dt>
              <dd className="font-medium tabular-nums">
                {formatDatum(protokoll.datum)}
              </dd>
            </div>
            <div>
              <dt className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                Geprüft von
              </dt>
              <dd className="font-medium">
                {protokoll.submitted_by_name ?? "—"}
              </dd>
            </div>
            <div>
              <dt className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                Uhrzeit
              </dt>
              <dd className="font-medium tabular-nums">
                {formatUhrzeitBerlin(protokoll.submitted_at)}{" "}
                Uhr
              </dd>
            </div>
            <div>
              <dt className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                Status
              </dt>
              <dd className="font-medium">
                {protokoll.status === "reviewed" ? "Reviewed" : "Eingereicht"}
              </dd>
            </div>
          </dl>
        </header>

        {/* Sections */}
        <div className="mt-6 space-y-5">
          {protokoll.sections.map((sec, idx) => {
            const alle = aufgabenMap.get(sec.section_id) ?? sec.tasks_done;
            const ist = (a: string) => sec.tasks_done.includes(a);
            return (
              <section
                key={sec.section_id || idx}
                className="protokoll-section break-inside-avoid border border-border p-4"
              >
                <h2 className="text-base font-bold tracking-tight">
                  {idx + 1}. {sec.titel}
                </h2>

                <p className="mt-2 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                  Aufgaben
                </p>
                <ul className="mt-1 space-y-0.5 text-sm">
                  {alle.map((a, i) => (
                    <li
                      key={`${idx}-${i}`}
                      className="flex items-start gap-2"
                    >
                      {ist(a) ? (
                        <CheckCircle2 className="mt-0.5 h-3.5 w-3.5 shrink-0" />
                      ) : (
                        <Circle className="mt-0.5 h-3.5 w-3.5 shrink-0 text-muted-foreground/50" />
                      )}
                      <span
                        className={
                          ist(a) ? "" : "text-muted-foreground"
                        }
                      >
                        {a}
                      </span>
                    </li>
                  ))}
                </ul>

                {sec.maengel.trim().length > 0 && (
                  <div className="mt-3">
                    <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                      Mängel / Bemerkungen
                    </p>
                    <p className="mt-1 whitespace-pre-wrap text-sm">
                      {sec.maengel}
                    </p>
                  </div>
                )}

                {sec.photo_paths.length > 0 && (
                  <div className="mt-3">
                    <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                      {sec.photo_paths.length}{" "}
                      {sec.photo_paths.length === 1 ? "Foto" : "Fotos"}
                    </p>
                    <div className="mt-1 grid grid-cols-2 gap-2 sm:grid-cols-3">
                      {sec.photo_paths.map((p) => {
                        const url = cleaningPhotoUrl(p, supabaseUrl);
                        if (!url) return null;
                        return (
                          <div
                            key={p}
                            className="aspect-[4/3] overflow-hidden border border-border"
                          >
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img
                              src={url}
                              alt=""
                              className="h-full w-full object-cover"
                            />
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </section>
            );
          })}

          {protokoll.general_note && (
            <section className="break-inside-avoid border border-border p-4">
              <h3 className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                Allgemeine Notiz
              </h3>
              <p className="mt-1 whitespace-pre-wrap text-sm">
                {protokoll.general_note}
              </p>
            </section>
          )}
        </div>

        <footer className="mt-8 border-t border-border pt-4 text-xs text-muted-foreground">
          Erstellt mit Vitness Crew · {protokoll.location_name ?? ""}
        </footer>
      </div>

      <style>{`
        @media print {
          @page { size: A4; margin: 1.2cm; }
          html, body { background: white !important; }
          .protokoll-section { page-break-inside: avoid; }
        }
      `}</style>
    </main>
  );
}
