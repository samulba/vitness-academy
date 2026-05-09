"use client";

import { useRef, useState, useTransition } from "react";
import { ImageIcon, Loader2, Trash2, Upload } from "lucide-react";
import { bildHochladen, bildEntfernen } from "@/lib/admin/upload";
import { bildUrlFuerPfad } from "@/lib/storage";
import { cn } from "@/lib/utils";

type Props = {
  scope: "module" | "lesson" | "path";
  id: string;
  aktuellerPfad: string | null;
  /** Anzeigename ("Modul"/"Lektion"/"Lernpfad") für Texte */
  label?: string;
};

const ERLAUBTE_TYPEN = ["image/jpeg", "image/png", "image/webp"];
const MAX_BYTES = 5 * 1024 * 1024;

function defaultLabel(scope: Props["scope"]): string {
  if (scope === "module") return "Modul";
  if (scope === "lesson") return "Lektion";
  return "Lernpfad";
}

export function BildUpload({
  scope,
  id,
  aktuellerPfad,
  label = defaultLabel(scope),
}: Props) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [pfad, setPfad] = useState(aktuellerPfad);
  const [dragOver, setDragOver] = useState(false);
  const url = bildUrlFuerPfad(pfad);

  function pickFile() {
    if (pending) return;
    inputRef.current?.click();
  }

  function clientValidieren(file: File): string | null {
    if (!ERLAUBTE_TYPEN.includes(file.type)) {
      return "Nur JPG, PNG oder WebP erlaubt.";
    }
    if (file.size > MAX_BYTES) {
      return `Datei ist zu groß (max ${MAX_BYTES / 1024 / 1024} MB).`;
    }
    return null;
  }

  function hochladen(file: File) {
    const fehler = clientValidieren(file);
    if (fehler) {
      setError(fehler);
      return;
    }
    setError(null);
    const fd = new FormData();
    fd.append("datei", file);
    startTransition(async () => {
      try {
        const res = await bildHochladen(scope, id, fd);
        if (res.ok) {
          setPfad(res.pfad);
        } else {
          setError(res.message);
        }
      } catch (e) {
        const msg =
          e instanceof Error
            ? e.message
            : "Unbekannter Fehler beim Hochladen.";
        setError(`Server-Fehler: ${msg}`);
      } finally {
        // File-Input zuruecksetzen, damit dieselbe Datei nochmal
        // gewaehlt werden kann.
        if (inputRef.current) inputRef.current.value = "";
      }
    });
  }

  function onChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) hochladen(file);
  }

  function onDrop(e: React.DragEvent) {
    e.preventDefault();
    setDragOver(false);
    if (pending) return;
    const file = e.dataTransfer.files?.[0];
    if (file) hochladen(file);
  }

  function entfernen() {
    setError(null);
    startTransition(async () => {
      try {
        const res = await bildEntfernen(scope, id);
        if (res.ok) setPfad(null);
        else setError(res.message);
      } catch (e) {
        const msg =
          e instanceof Error ? e.message : "Unbekannter Fehler";
        setError(`Server-Fehler: ${msg}`);
      }
    });
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between gap-3">
        <p className="text-sm font-semibold leading-none">Hero-Bild</p>
        {url && (
          <button
            type="button"
            onClick={entfernen}
            disabled={pending}
            className="inline-flex items-center gap-1 text-[11px] font-medium text-muted-foreground transition-colors hover:text-destructive disabled:opacity-50"
          >
            <Trash2 className="h-3 w-3" />
            Entfernen
          </button>
        )}
      </div>

      {/* Drop-Zone / Bild-Vorschau in einem klickbaren Container */}
      <button
        type="button"
        onClick={pickFile}
        onDragEnter={(e) => {
          e.preventDefault();
          if (!pending) setDragOver(true);
        }}
        onDragOver={(e) => {
          e.preventDefault();
          if (!pending) setDragOver(true);
        }}
        onDragLeave={() => setDragOver(false)}
        onDrop={onDrop}
        disabled={pending}
        className={cn(
          "group relative block aspect-[16/9] w-full overflow-hidden rounded-2xl border-2 border-dashed bg-card text-left transition-all",
          dragOver
            ? "border-[hsl(var(--brand-pink))] bg-[hsl(var(--brand-pink)/0.06)] scale-[1.01]"
            : "border-border hover:border-[hsl(var(--brand-pink)/0.5)] hover:bg-[hsl(var(--brand-pink)/0.03)]",
          pending && "cursor-wait opacity-70",
          !url && "flex flex-col items-center justify-center gap-3 p-6 text-center",
        )}
      >
        {url ? (
          <>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={url}
              alt={`Hero-Bild für ${label}`}
              className="h-full w-full object-cover transition-opacity group-hover:opacity-90"
            />
            {/* Hover-Overlay mit "Bild ersetzen"-CTA */}
            <div
              className={cn(
                "absolute inset-0 flex items-center justify-center bg-black/40 backdrop-blur-[2px] opacity-0 transition-opacity",
                !pending && "group-hover:opacity-100",
              )}
            >
              <span className="inline-flex items-center gap-2 rounded-full bg-white/95 px-4 py-2 text-xs font-semibold text-foreground shadow-lg">
                <Upload className="h-3.5 w-3.5" />
                Bild ersetzen
              </span>
            </div>
          </>
        ) : (
          <>
            <span
              className={cn(
                "flex h-12 w-12 items-center justify-center rounded-2xl transition-colors",
                dragOver
                  ? "bg-[hsl(var(--brand-pink)/0.15)] text-[hsl(var(--brand-pink))]"
                  : "bg-muted text-muted-foreground group-hover:bg-[hsl(var(--brand-pink)/0.1)] group-hover:text-[hsl(var(--brand-pink))]",
              )}
            >
              {pending ? (
                <Loader2 className="h-5 w-5 animate-spin" />
              ) : (
                <ImageIcon className="h-5 w-5" strokeWidth={1.75} />
              )}
            </span>
            <div className="space-y-0.5">
              <p className="text-sm font-semibold text-foreground">
                {pending
                  ? "Wird hochgeladen…"
                  : dragOver
                    ? "Datei hier ablegen"
                    : "Bild hochladen oder hierher ziehen"}
              </p>
              <p className="text-[11px] text-muted-foreground">
                JPG, PNG oder WebP · max. 5&nbsp;MB
              </p>
            </div>
          </>
        )}

        {/* Pending-Overlay wenn schon ein Bild da ist */}
        {pending && url && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/50 backdrop-blur-sm">
            <span className="inline-flex items-center gap-2 rounded-full bg-white/95 px-4 py-2 text-xs font-semibold text-foreground shadow-lg">
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
              Wird hochgeladen…
            </span>
          </div>
        )}
      </button>

      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        onChange={onChange}
        className="hidden"
      />

      {error && (
        <div className="rounded-lg border border-[hsl(var(--destructive)/0.3)] bg-[hsl(var(--destructive)/0.08)] px-3 py-2 text-xs font-medium text-[hsl(var(--destructive))]">
          {error}
        </div>
      )}
    </div>
  );
}
