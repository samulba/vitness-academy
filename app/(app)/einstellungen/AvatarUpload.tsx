"use client";

import { useRef, useState, useTransition } from "react";
import { Camera, Trash2, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { avatarUrlFuerPfad } from "@/lib/storage";
import { avatarHochladen, avatarEntfernen } from "./avatar-actions";

type Props = {
  initialPfad: string | null;
  fullName: string | null;
};

function initialen(name: string | null): string {
  if (!name) return "VA";
  return (
    name
      .split(/\s+/)
      .filter(Boolean)
      .slice(0, 2)
      .map((p) => p[0]?.toUpperCase())
      .join("") || "VA"
  );
}

export function AvatarUpload({ initialPfad, fullName }: Props) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [pfad, setPfad] = useState(initialPfad);
  const url = avatarUrlFuerPfad(pfad);

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
      const res = await avatarHochladen(fd);
      if (res.ok) setPfad(res.pfad);
      else setError(res.message);
    });
  }

  function entfernen() {
    setError(null);
    startTransition(async () => {
      const res = await avatarEntfernen();
      if (res.ok) setPfad(null);
      else setError(res.message);
    });
  }

  return (
    <div className="flex flex-wrap items-center gap-5">
      <div className="relative">
        {url ? (
          <span className="block h-20 w-20 overflow-hidden rounded-full ring-2 ring-border">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={url}
              alt={fullName ?? "Profilbild"}
              className="h-full w-full object-cover"
            />
          </span>
        ) : (
          <span
            className="flex h-20 w-20 items-center justify-center rounded-full text-2xl font-semibold text-white shadow-[inset_0_-1px_0_rgba(0,0,0,0.2)]"
            style={{ backgroundColor: "hsl(331, 70%, 50%)" }}
          >
            {fullName ? initialen(fullName) : <User className="h-8 w-8" />}
          </span>
        )}
        <button
          type="button"
          onClick={pickFile}
          disabled={pending}
          className="absolute -bottom-1 -right-1 inline-flex h-7 w-7 items-center justify-center rounded-full border border-border bg-background text-foreground shadow-sm transition-colors hover:bg-accent disabled:opacity-50"
          aria-label="Profilbild ändern"
        >
          <Camera className="h-3.5 w-3.5" />
        </button>
      </div>

      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        onChange={onChange}
        className="hidden"
      />

      <div className="space-y-2">
        <div className="flex flex-wrap gap-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={pickFile}
            disabled={pending}
            className="gap-1.5"
          >
            <Camera className="h-3.5 w-3.5" />
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
        </div>
        <p className="text-xs text-muted-foreground">
          {pending
            ? "Lädt …"
            : "Quadratisch, JPG/PNG/WebP, max 10 MB."}
        </p>
        {error && (
          <p className="rounded-md bg-[hsl(var(--destructive)/0.1)] px-2.5 py-1.5 text-xs font-medium text-[hsl(var(--destructive))]">
            {error}
          </p>
        )}
      </div>
    </div>
  );
}
