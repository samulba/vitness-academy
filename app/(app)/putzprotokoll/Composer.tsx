"use client";

import {
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";
import {
  AlertCircle,
  Camera,
  Check,
  ImageIcon,
  Loader2,
  Sparkles,
  Trash2,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { SubmitOverlay } from "@/components/ui/submit-overlay";
import { useFormAction } from "@/lib/hooks/use-form-action";
import { cn } from "@/lib/utils";
import { createClient as createBrowserClient } from "@/lib/supabase/client";
import { formatDatumUhrzeitBerlin } from "@/lib/format";
import { protokollEinreichen } from "./actions";
import {
  cleaningPhotoUrl,
  type CleaningSection,
} from "@/lib/putzprotokoll-types";

type Props = {
  sections: CleaningSection[];
  locationId: string;
  locationName: string;
  userName: string;
  datum: string; // YYYY-MM-DD
  datumDeutsch: string;
  supabasePublicUrl: string;
};

export function Composer({
  sections,
  locationId,
  locationName,
  userName,
  datum,
  datumDeutsch,
  supabasePublicUrl,
}: Props) {
  const [confirmOpen, setConfirmOpen] = useState(false);

  const { run, pending, state, formRef } = useFormAction(protokollEinreichen, {
    successToast: "Putzprotokoll erfolgreich eingereicht",
    // Cache-Buster-Query erzwingt einen echten RSC-Reload, damit die
    // Server-Page sofort die Detail-View statt Composer zeigt.
    pushTo: () => `/putzprotokoll?t=${Date.now()}`,
  });

  // Pro Section meldet ihre uploading-Anzahl hierher zurueck — Submit
  // bleibt disabled solange irgendwo ein Upload laeuft.
  const [uploads, setUploads] = useState<Record<string, number>>({});
  const reportUploads = useCallback((sectionId: string, count: number) => {
    setUploads((prev) => {
      if (count === 0 && !(sectionId in prev)) return prev;
      const next = { ...prev };
      if (count === 0) delete next[sectionId];
      else next[sectionId] = count;
      return next;
    });
  }, []);
  const totalUploading = Object.values(uploads).reduce((a, b) => a + b, 0);

  const message = state && !state.ok ? state.message : null;
  const erfolgreich = state?.ok === true;
  const submitDisabled = pending || totalUploading > 0 || erfolgreich;

  // Submit-Click öffnet zuerst den Bestätigungs-Modal — Form wird
  // erst nach Confirm via formRef.requestSubmit() abgeschickt.
  function oeffneBestaetigung() {
    if (submitDisabled) return;
    setConfirmOpen(true);
  }
  function bestaetigen() {
    setConfirmOpen(false);
    formRef.current?.requestSubmit();
  }

  // Stats für den Modal: Anzahl gehakte Aufgaben + Mängel-Notizen + Photos
  const summary = () => {
    if (typeof document === "undefined") {
      return { tasks: 0, maengel: 0, fotos: 0 };
    }
    let tasks = 0;
    let maengel = 0;
    let fotos = 0;
    for (const sec of sections) {
      const cbs = document.querySelectorAll<HTMLInputElement>(
        `input[name^="section_${sec.id}__task_"]:checked`,
      );
      tasks += cbs.length;
      const m = document.querySelector<HTMLTextAreaElement>(
        `textarea[name="section_${sec.id}__maengel"]`,
      );
      if (m && m.value.trim().length > 0) maengel += 1;
      const fs = document.querySelectorAll(
        `input[type="hidden"][name="section_${sec.id}__photo_path"]`,
      );
      fotos += fs.length;
    }
    return { tasks, maengel, fotos };
  };

  return (
    <form ref={formRef} action={run} className="space-y-5">
      <SubmitOverlay
        pending={pending || erfolgreich}
        message={
          erfolgreich
            ? "Wird angezeigt …"
            : "Protokoll wird eingereicht …"
        }
      />
      {sections.map((sec, idx) => (
        <SectionCard
          key={sec.id}
          section={sec}
          idx={idx + 1}
          locationId={locationId}
          datum={datum}
          sectionIdx={idx}
          supabasePublicUrl={supabasePublicUrl}
          reportUploads={reportUploads}
        />
      ))}

      {/* Allgemeine Notiz */}
      <section className="rounded-2xl border border-border bg-card p-5 sm:p-6">
        <label
          htmlFor="general_note"
          className="text-sm font-semibold tracking-tight"
        >
          Allgemeine Notiz (optional)
        </label>
        <p className="mt-1 text-xs text-muted-foreground">
          Etwas, was nicht zu einem bestimmten Bereich passt? Hier rein.
        </p>
        <textarea
          id="general_note"
          name="general_note"
          rows={3}
          placeholder="z.B. Heute keine Probleme · Reinigungsmittel ausgegangen …"
          className="mt-3 w-full rounded-lg border border-input bg-background px-3.5 py-2.5 shadow-sm transition-colors focus-visible:border-[hsl(var(--primary)/0.5)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[hsl(var(--primary)/0.15)]"
        />
      </section>

      {message && (
        <p className="inline-flex items-start gap-2 rounded-lg border border-[hsl(var(--destructive)/0.3)] bg-[hsl(var(--destructive)/0.08)] px-3 py-2 text-xs font-medium text-[hsl(var(--destructive))]">
          <AlertCircle className="mt-0.5 h-3.5 w-3.5 shrink-0" />
          {message}
        </p>
      )}

      <div className="sticky bottom-20 z-10 flex flex-col items-stretch gap-2 rounded-2xl border border-border bg-card/95 p-4 shadow-lg backdrop-blur lg:bottom-4">
        {totalUploading > 0 && (
          <p className="inline-flex items-center gap-2 text-[11px] font-medium text-[hsl(var(--brand-pink))]">
            <Loader2 className="h-3 w-3 animate-spin" />
            {totalUploading}{" "}
            {totalUploading === 1 ? "Foto wird" : "Fotos werden"} noch
            hochgeladen…
          </p>
        )}
        <Button
          type="button"
          onClick={oeffneBestaetigung}
          disabled={submitDisabled}
          className="flex-1 gap-2 bg-[hsl(var(--primary))] py-2.5 text-[hsl(var(--primary-foreground))] shadow-[0_8px_24px_-6px_hsl(var(--primary)/0.55)] transition-all hover:bg-[hsl(var(--primary)/0.9)] hover:shadow-[0_16px_40px_-10px_hsl(var(--primary)/0.7)] disabled:opacity-60"
        >
          {erfolgreich ? (
            <>
              <Check className="h-4 w-4" />
              Eingereicht — wird angezeigt …
            </>
          ) : pending ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Speichere …
            </>
          ) : totalUploading > 0 ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Warte auf Foto-Upload …
            </>
          ) : (
            <>
              <Sparkles className="h-4 w-4" />
              Protokoll absenden
            </>
          )}
        </Button>
      </div>

      {confirmOpen && (
        <BestaetigungsModal
          locationName={locationName}
          datumDeutsch={datumDeutsch}
          userName={userName}
          summary={summary()}
          onClose={() => setConfirmOpen(false)}
          onConfirm={bestaetigen}
        />
      )}
    </form>
  );
}

function BestaetigungsModal({
  locationName,
  datumDeutsch,
  userName,
  summary,
  onClose,
  onConfirm,
}: {
  locationName: string;
  datumDeutsch: string;
  userName: string;
  summary: { tasks: number; maengel: number; fotos: number };
  onClose: () => void;
  onConfirm: () => void;
}) {
  const jetzt = new Date();
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4"
      role="dialog"
      aria-modal="true"
      onClick={onClose}
    >
      <div
        className="w-full max-w-md overflow-hidden rounded-2xl border border-border bg-card shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <header className="flex items-start justify-between gap-3 border-b border-border p-5">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-[hsl(var(--brand-pink))]">
              Bestätigen
            </p>
            <h2 className="mt-1 text-xl font-semibold tracking-tight">
              Protokoll wirklich einreichen?
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Schließen"
            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
          >
            <X className="h-4 w-4" />
          </button>
        </header>

        <dl className="grid grid-cols-1 gap-x-6 gap-y-3 p-5 sm:grid-cols-2">
          <div>
            <dt className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
              Eingereicht von
            </dt>
            <dd className="mt-0.5 text-sm font-medium">{userName}</dd>
          </div>
          <div>
            <dt className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
              Studio
            </dt>
            <dd className="mt-0.5 text-sm font-medium">{locationName}</dd>
          </div>
          <div>
            <dt className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
              Datum
            </dt>
            <dd className="mt-0.5 text-sm font-medium tabular-nums">
              {datumDeutsch}
            </dd>
          </div>
          <div>
            <dt className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
              Uhrzeit (jetzt)
            </dt>
            <dd className="mt-0.5 text-sm font-medium tabular-nums">
              {formatDatumUhrzeitBerlin(jetzt).split(", ")[1] ?? "—"} Uhr
            </dd>
          </div>
        </dl>

        <div className="border-t border-border bg-muted/30 px-5 py-4">
          <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
            Zusammenfassung
          </p>
          <ul className="mt-2 grid grid-cols-3 gap-2 text-center">
            <li className="rounded-lg bg-card p-3">
              <p className="text-2xl font-bold tabular-nums">
                {summary.tasks}
              </p>
              <p className="text-[10px] text-muted-foreground">
                Aufgaben gehakt
              </p>
            </li>
            <li className="rounded-lg bg-card p-3">
              <p className="text-2xl font-bold tabular-nums">
                {summary.maengel}
              </p>
              <p className="text-[10px] text-muted-foreground">
                Mängel-Notizen
              </p>
            </li>
            <li className="rounded-lg bg-card p-3">
              <p className="text-2xl font-bold tabular-nums">
                {summary.fotos}
              </p>
              <p className="text-[10px] text-muted-foreground">Fotos</p>
            </li>
          </ul>
          <p className="mt-3 text-[11px] leading-relaxed text-muted-foreground">
            Nach dem Einreichen können nur noch Studioleitung/Admin Änderungen
            machen. Stell sicher dass alles passt.
          </p>
        </div>

        <footer className="flex items-center justify-end gap-2 border-t border-border p-4">
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg border border-border bg-background px-4 py-2 text-sm font-medium transition-colors hover:bg-muted"
          >
            Zurück
          </button>
          <button
            type="button"
            onClick={onConfirm}
            className="inline-flex items-center gap-1.5 rounded-lg bg-[hsl(var(--primary))] px-4 py-2 text-sm font-semibold text-[hsl(var(--primary-foreground))] shadow-[0_4px_14px_-4px_hsl(var(--primary)/0.5)] transition-all hover:bg-[hsl(var(--primary)/0.9)]"
          >
            <Check className="h-4 w-4" />
            Ja, einreichen
          </button>
        </footer>
      </div>
    </div>
  );
}

function SectionCard({
  section,
  idx,
  locationId,
  datum,
  sectionIdx,
  supabasePublicUrl,
  reportUploads,
}: {
  section: CleaningSection;
  idx: number;
  locationId: string;
  datum: string;
  sectionIdx: number;
  supabasePublicUrl: string;
  reportUploads: (sectionId: string, count: number) => void;
}) {
  return (
    <section className="rounded-2xl border border-border bg-card p-5 sm:p-6">
      <header className="flex items-start gap-3 border-b border-border pb-4">
        <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[hsl(var(--brand-pink)/0.12)] text-sm font-bold tabular-nums text-[hsl(var(--brand-pink))]">
          {idx}
        </span>
        <div className="flex-1">
          <h2 className="text-base font-semibold tracking-tight sm:text-lg">
            {section.titel}
          </h2>
          <p className="text-[11px] text-muted-foreground">
            {section.aufgaben.length} Aufgaben
          </p>
        </div>
      </header>

      {/* Aufgaben-Checkliste */}
      <div className="mt-4 space-y-1.5">
        {section.aufgaben.map((aufgabe, t) => (
          <TaskCheckbox
            key={`${section.id}-${t}`}
            name={`section_${section.id}__task_${t}`}
            label={aufgabe}
          />
        ))}
      </div>

      {/* Mängel-Notiz */}
      <div className="mt-5 space-y-2">
        <label
          htmlFor={`section_${section.id}__maengel`}
          className="text-xs font-semibold uppercase tracking-wider text-muted-foreground"
        >
          Mängel / Bemerkungen
        </label>
        <textarea
          id={`section_${section.id}__maengel`}
          name={`section_${section.id}__maengel`}
          rows={2}
          placeholder="z.B. Staub auf Fensterbrett · Seifenspender defekt …"
          className="w-full rounded-lg border border-input bg-background px-3 py-2 shadow-sm transition-colors focus-visible:border-[hsl(var(--primary)/0.5)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[hsl(var(--primary)/0.15)]"
        />
      </div>

      {/* Photo-Upload (Direct-to-Storage) */}
      <div className="mt-4">
        <SectionPhotoUploader
          sectionId={section.id}
          locationId={locationId}
          datum={datum}
          sectionIdx={sectionIdx}
          supabasePublicUrl={supabasePublicUrl}
          reportUploads={reportUploads}
        />
      </div>
    </section>
  );
}

function TaskCheckbox({ name, label }: { name: string; label: string }) {
  return (
    <label className="group flex cursor-pointer items-start gap-3 rounded-lg border border-transparent px-3 py-2 transition-colors has-[:checked]:border-[hsl(var(--primary)/0.3)] has-[:checked]:bg-[hsl(var(--primary)/0.04)] hover:bg-muted/40">
      <span className="relative mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-md border-2 border-input bg-background transition-colors group-has-[:checked]:border-[hsl(var(--primary))] group-has-[:checked]:bg-[hsl(var(--primary))]">
        <input
          type="checkbox"
          name={name}
          className="absolute inset-0 cursor-pointer opacity-0"
        />
        <Check
          className="h-3 w-3 text-white opacity-0 transition-opacity group-has-[:checked]:opacity-100"
          strokeWidth={3}
        />
      </span>
      <span className="text-sm leading-snug group-has-[:checked]:text-muted-foreground group-has-[:checked]:line-through">
        {label}
      </span>
    </label>
  );
}

const FOTO_MAX_BYTES = 5 * 1024 * 1024;
const FOTO_ERLAUBT = ["image/jpeg", "image/png", "image/webp"];

type UploadedPhoto = {
  /** Storage-Pfad im cleaning-photos-Bucket */
  path: string;
  /** Original-Dateiname (zur Anzeige) */
  name: string;
  /** Local Blob-URL fuer Vorschau, fallback Public-URL */
  previewUrl: string;
};

/**
 * Photo-Uploader mit Direct-to-Storage-Pattern.
 * Photos werden BEIM HINZUFUEGEN sofort zu Supabase-Storage hochgeladen
 * (anonymer Browser-Client + RLS via cleaning-photos Bucket-Policy).
 * Server-Action bekommt nur die Pfade als hidden-inputs — Form-Body
 * bleibt winzig, Foto-Anzahl praktisch unbegrenzt.
 */
function SectionPhotoUploader({
  sectionId,
  locationId,
  datum,
  sectionIdx,
  supabasePublicUrl,
  reportUploads,
}: {
  sectionId: string;
  locationId: string;
  datum: string;
  sectionIdx: number;
  supabasePublicUrl: string;
  reportUploads: (sectionId: string, count: number) => void;
}) {
  const [photos, setPhotos] = useState<UploadedPhoto[]>([]);
  const [uploading, setUploading] = useState<number>(0);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Uploading-Counter an Composer melden, damit Submit-Button blockiert
  // werden kann solange Uploads laufen.
  useEffect(() => {
    reportUploads(sectionId, uploading);
  }, [sectionId, uploading, reportUploads]);

  async function dateienHinzufuegen(files: FileList | null) {
    if (!files || files.length === 0) return;
    setError(null);

    const supabase = createBrowserClient();
    const dateien = Array.from(files);

    setUploading((n) => n + dateien.length);

    for (const datei of dateien) {
      if (datei.size > FOTO_MAX_BYTES) {
        setError(`„${datei.name}" ist zu groß (max 5 MB pro Foto).`);
        setUploading((n) => Math.max(0, n - 1));
        continue;
      }
      if (!FOTO_ERLAUBT.includes(datei.type)) {
        setError(`„${datei.name}": Nur JPG, PNG oder WebP erlaubt.`);
        setUploading((n) => Math.max(0, n - 1));
        continue;
      }

      const ext = datei.type.split("/")[1].replace("jpeg", "jpg");
      const rand = Math.random().toString(36).slice(2, 8);
      const path = `${locationId}/${datum}/${sectionIdx}/${Date.now()}-${rand}.${ext}`;

      try {
        const { error: upErr } = await supabase.storage
          .from("cleaning-photos")
          .upload(path, datei, {
            contentType: datei.type,
            upsert: false,
          });
        if (upErr) {
          setError(`Upload fehlgeschlagen: ${upErr.message}`);
          setUploading((n) => Math.max(0, n - 1));
          continue;
        }
        const previewUrl =
          typeof URL !== "undefined" && URL.createObjectURL
            ? URL.createObjectURL(datei)
            : cleaningPhotoUrl(path, supabasePublicUrl) ?? "";
        setPhotos((prev) => [...prev, { path, name: datei.name, previewUrl }]);
      } catch (e) {
        setError(`Upload fehlgeschlagen: ${(e as Error).message}`);
      } finally {
        setUploading((n) => Math.max(0, n - 1));
      }
    }

    // Input-File-List zuruecksetzen damit gleicher Dateiname erneut
    // ausgewählt werden kann
    if (inputRef.current) inputRef.current.value = "";
  }

  function entfernen(idx: number) {
    // Hinweis: orphan-File bleibt im Bucket. Beim Submit-Abbruch okay,
    // bei "manchmal entfernt" akzeptabel — Cleanup-Job später möglich.
    setPhotos((prev) => prev.filter((_, i) => i !== idx));
  }

  const insgesamt = photos.length;

  return (
    <div className="space-y-2">
      <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
        Fotos
      </p>

      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        multiple
        onChange={(e) => dateienHinzufuegen(e.target.files)}
        className="hidden"
        id={`upload_${sectionId}`}
      />

      {/* Hidden inputs damit Server-Action die Pfade bekommt */}
      {photos.map((p) => (
        <input
          key={p.path}
          type="hidden"
          name={`section_${sectionId}__photo_path`}
          value={p.path}
        />
      ))}

      {photos.length === 0 && uploading === 0 ? (
        <label
          htmlFor={`upload_${sectionId}`}
          className="flex cursor-pointer items-center justify-center gap-2 rounded-lg border-2 border-dashed border-input bg-background/40 px-4 py-3 text-sm text-muted-foreground transition-colors hover:border-[hsl(var(--primary)/0.5)] hover:bg-[hsl(var(--primary)/0.04)] hover:text-foreground"
        >
          <Camera className="h-4 w-4" />
          <span>Fotos hinzufügen</span>
        </label>
      ) : (
        <>
          <ul className="grid grid-cols-2 gap-2 sm:grid-cols-3 md:grid-cols-4">
            {photos.map((p, i) => (
              <li
                key={p.path}
                className="group relative aspect-square overflow-hidden rounded-lg border border-border bg-muted"
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={p.previewUrl}
                  alt=""
                  className="h-full w-full object-cover"
                />
                <button
                  type="button"
                  onClick={() => entfernen(i)}
                  aria-label="Foto entfernen"
                  className="absolute right-1.5 top-1.5 inline-flex h-7 w-7 items-center justify-center rounded-full bg-black/70 text-white shadow-md transition-colors hover:bg-[hsl(var(--destructive))]"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </li>
            ))}
            {/* Live-Upload-Slots */}
            {Array.from({ length: uploading }).map((_, i) => (
              <li
                key={`up-${i}`}
                className="flex aspect-square items-center justify-center rounded-lg border border-border bg-muted"
              >
                <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
              </li>
            ))}
            {/* "+ weitere Fotos"-Tile */}
            <li>
              <label
                htmlFor={`upload_${sectionId}`}
                className="flex aspect-square cursor-pointer flex-col items-center justify-center gap-1 rounded-lg border-2 border-dashed border-input bg-background/40 text-xs text-muted-foreground transition-colors hover:border-[hsl(var(--primary)/0.5)] hover:bg-[hsl(var(--primary)/0.04)] hover:text-foreground"
              >
                <ImageIcon className="h-5 w-5" />
                <span>+ weitere</span>
              </label>
            </li>
          </ul>
          <p
            className={cn(
              "text-[11px]",
              uploading > 0
                ? "text-[hsl(var(--brand-pink))]"
                : "text-muted-foreground",
            )}
          >
            {uploading > 0
              ? `Lade ${uploading} ${uploading === 1 ? "Foto" : "Fotos"} hoch …`
              : `${insgesamt} ${insgesamt === 1 ? "Foto" : "Fotos"} hochgeladen`}
          </p>
        </>
      )}

      {error && (
        <p className="text-[11px] text-[hsl(var(--destructive))]">{error}</p>
      )}
    </div>
  );
}
