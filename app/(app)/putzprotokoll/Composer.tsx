"use client";

import { useActionState, useRef, useState } from "react";
import {
  AlertCircle,
  Camera,
  Check,
  ImageIcon,
  Sparkles,
  Trash2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  protokollEinreichen,
  type Ergebnis,
} from "./actions";
import {
  PROTOKOLL_PHOTOS_MAX,
  type CleaningSection,
} from "@/lib/putzprotokoll-types";

type Props = {
  sections: CleaningSection[];
  locationName: string;
  datumDeutsch: string;
};

export function Composer({ sections, locationName, datumDeutsch }: Props) {
  const [state, runAction, pending] = useActionState<Ergebnis | null, FormData>(
    async (_prev, fd) => protokollEinreichen(fd),
    null,
  );

  const message = state && !state.ok ? state.message : null;

  return (
    <form action={runAction} className="space-y-5">
      {/* Hero-Header */}
      <header className="rounded-2xl border border-border bg-card p-5 sm:p-6">
        <div className="flex flex-wrap items-center gap-2 text-[11px] font-medium uppercase tracking-[0.22em] text-[hsl(var(--brand-pink))]">
          <span className="h-px w-10 bg-[hsl(var(--primary))]" />
          <span>Tägliches Reinigungsprotokoll</span>
        </div>
        <h1 className="mt-3 text-balance text-2xl font-semibold tracking-tight sm:text-3xl">
          Putzprotokoll · {datumDeutsch}
        </h1>
        <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
          Studio: <span className="font-medium text-foreground">{locationName}</span>{" "}
          · Pro Bereich Aufgaben abhaken, Mängel notieren und ggf. Fotos
          hochladen.
        </p>
      </header>

      {sections.map((sec, idx) => (
        <SectionCard key={sec.id} section={sec} idx={idx + 1} />
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

      <div className="sticky bottom-20 z-10 flex items-center gap-3 rounded-2xl border border-border bg-card/95 p-4 shadow-lg backdrop-blur lg:bottom-4">
        <Button
          type="submit"
          disabled={pending}
          className="flex-1 gap-2 bg-[hsl(var(--primary))] py-2.5 text-[hsl(var(--primary-foreground))] shadow-[0_8px_24px_-6px_hsl(var(--primary)/0.55)] transition-all hover:bg-[hsl(var(--primary)/0.9)] hover:shadow-[0_16px_40px_-10px_hsl(var(--primary)/0.7)]"
        >
          {pending ? (
            <>Sende …</>
          ) : (
            <>
              <Sparkles className="h-4 w-4" />
              Protokoll absenden
            </>
          )}
        </Button>
      </div>
    </form>
  );
}

function SectionCard({
  section,
  idx,
}: {
  section: CleaningSection;
  idx: number;
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

      {/* Photo-Upload */}
      <div className="mt-4">
        <SectionPhotoUploader sectionId={section.id} />
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

function SectionPhotoUploader({ sectionId }: { sectionId: string }) {
  const [dateien, setDateien] = useState<File[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);

  function entfernen(idx: number) {
    setDateien((prev) => prev.filter((_, i) => i !== idx));
    if (inputRef.current) {
      // Re-build DataTransfer mit aktualisierten Files
      const dt = new DataTransfer();
      dateien
        .filter((_, i) => i !== idx)
        .forEach((f) => dt.items.add(f));
      inputRef.current.files = dt.files;
    }
  }

  function hinzufuegen(neu: FileList | null) {
    if (!neu || neu.length === 0) return;
    const seen = new Set(dateien.map((f) => `${f.name}-${f.size}`));
    const next = [...dateien];
    for (const f of Array.from(neu)) {
      const key = `${f.name}-${f.size}`;
      if (seen.has(key)) continue;
      seen.add(key);
      next.push(f);
      if (next.length >= PROTOKOLL_PHOTOS_MAX) break;
    }
    setDateien(next);
    if (inputRef.current) {
      const dt = new DataTransfer();
      next.forEach((f) => dt.items.add(f));
      inputRef.current.files = dt.files;
    }
  }

  const cap = dateien.length >= PROTOKOLL_PHOTOS_MAX;

  return (
    <div className="space-y-2">
      <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
        Fotos · max. {PROTOKOLL_PHOTOS_MAX}
      </p>

      <input
        ref={inputRef}
        type="file"
        name={`section_${sectionId}__photo`}
        accept="image/jpeg,image/png,image/webp"
        multiple
        onChange={(e) => hinzufuegen(e.target.files)}
        className="hidden"
        id={`upload_${sectionId}`}
      />

      {dateien.length === 0 ? (
        <label
          htmlFor={`upload_${sectionId}`}
          className="flex cursor-pointer items-center justify-center gap-2 rounded-lg border-2 border-dashed border-input bg-background/40 px-4 py-3 text-sm text-muted-foreground transition-colors hover:border-[hsl(var(--primary)/0.5)] hover:bg-[hsl(var(--primary)/0.04)] hover:text-foreground"
        >
          <Camera className="h-4 w-4" />
          <span>Fotos hinzufügen</span>
        </label>
      ) : (
        <>
          <ul className="grid grid-cols-2 gap-2 sm:grid-cols-3">
            {dateien.map((file, i) => (
              <li
                key={`${file.name}-${i}`}
                className="group relative aspect-square overflow-hidden rounded-lg border border-border bg-muted"
              >
                <PhotoVorschau file={file} />
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
            {!cap && (
              <li>
                <label
                  htmlFor={`upload_${sectionId}`}
                  className="flex aspect-square cursor-pointer flex-col items-center justify-center gap-1 rounded-lg border-2 border-dashed border-input bg-background/40 text-xs text-muted-foreground transition-colors hover:border-[hsl(var(--primary)/0.5)] hover:bg-[hsl(var(--primary)/0.04)] hover:text-foreground"
                >
                  <ImageIcon className="h-5 w-5" />
                  <span>+ weiteres</span>
                </label>
              </li>
            )}
          </ul>
          <p className={cn("text-[11px]", cap ? "text-[hsl(var(--brand-pink))]" : "text-muted-foreground")}>
            {cap
              ? `Max. ${PROTOKOLL_PHOTOS_MAX} Fotos erreicht.`
              : `${dateien.length} / ${PROTOKOLL_PHOTOS_MAX} Fotos`}
          </p>
        </>
      )}
    </div>
  );
}

function PhotoVorschau({ file }: { file: File }) {
  const [url, setUrl] = useState<string>("");
  const ref = useRef<string | null>(null);
  if (!ref.current) {
    ref.current = URL.createObjectURL(file);
    setTimeout(() => setUrl(ref.current!), 0);
  }
  return url ? (
    // eslint-disable-next-line @next/next/no-img-element
    <img src={url} alt="" className="h-full w-full object-cover" />
  ) : (
    <div className="h-full w-full bg-muted" />
  );
}
