"use client";

import { useRef, useState, useTransition } from "react";
import { Image as ImageIcon, Trash2, Upload } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { bildHochladen, bildEntfernen } from "@/lib/admin/upload";
import { bildUrlFuerPfad } from "@/lib/storage";

type Props = {
  scope: "module" | "lesson" | "path";
  id: string;
  aktuellerPfad: string | null;
  /** Anzeigename ("Modul"/"Lektion"/"Lernpfad") für Texte */
  label?: string;
};

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
  const url = bildUrlFuerPfad(pfad);

  function pickFile() {
    inputRef.current?.click();
  }

  function onChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setError(null);
    const fd = new FormData();
    fd.append("datei", file);
    startTransition(async () => {
      const res = await bildHochladen(scope, id, fd);
      if (res.ok) setPfad(res.pfad);
      else setError(res.message);
    });
  }

  function entfernen() {
    setError(null);
    startTransition(async () => {
      const res = await bildEntfernen(scope, id);
      if (res.ok) setPfad(null);
      else setError(res.message);
    });
  }

  return (
    <div className="space-y-3">
      <Label>Hero-Bild</Label>
      <div className="overflow-hidden rounded-xl border border-border bg-muted/30">
        {url ? (
          <div className="relative aspect-[16/9] w-full">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={url}
              alt={`Hero-Bild für ${label}`}
              className="h-full w-full object-cover"
            />
          </div>
        ) : (
          <div className="flex aspect-[16/9] w-full flex-col items-center justify-center gap-2 text-center text-muted-foreground">
            <ImageIcon className="h-6 w-6" strokeWidth={1.5} />
            <p className="text-xs">
              Noch kein Bild — JPG, PNG oder WebP, max 5 MB.
            </p>
          </div>
        )}
      </div>

      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        onChange={onChange}
        className="hidden"
      />

      <div className="flex flex-wrap items-center gap-2">
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={pickFile}
          disabled={pending}
          className="gap-1.5"
        >
          <Upload className="h-3.5 w-3.5" />
          {pfad ? "Bild ersetzen" : "Bild hochladen"}
        </Button>
        {pfad && (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={entfernen}
            disabled={pending}
            className="gap-1.5 text-muted-foreground hover:text-destructive"
          >
            <Trash2 className="h-3.5 w-3.5" />
            Entfernen
          </Button>
        )}
        {pending && (
          <span className="text-xs text-muted-foreground">Lädt …</span>
        )}
      </div>

      {error && (
        <p className="rounded-md bg-[hsl(var(--destructive)/0.1)] px-3 py-2 text-xs font-medium text-[hsl(var(--destructive))]">
          {error}
        </p>
      )}
    </div>
  );
}
