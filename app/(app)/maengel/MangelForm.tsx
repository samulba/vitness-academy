"use client";

import { useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { AlertCircle, Camera, Check, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { mangelMelden } from "./actions";

export function MangelForm() {
  const router = useRouter();
  const formRef = useRef<HTMLFormElement>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [erfolg, setErfolg] = useState(false);
  const [fotoName, setFotoName] = useState<string | null>(null);

  function onChangeFile(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0];
    setFotoName(f ? f.name : null);
  }

  function clearFile() {
    if (fileRef.current) fileRef.current.value = "";
    setFotoName(null);
  }

  function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    const fd = new FormData(e.currentTarget);
    startTransition(async () => {
      const res = await mangelMelden(fd);
      if (res.ok) {
        setErfolg(true);
        formRef.current?.reset();
        setFotoName(null);
        setTimeout(() => {
          router.refresh();
          setErfolg(false);
        }, 1500);
      } else {
        setError(res.message);
      }
    });
  }

  return (
    <form ref={formRef} onSubmit={onSubmit} className="space-y-5">
      <div className="space-y-2">
        <Label htmlFor="title">Was ist los?</Label>
        <Input
          id="title"
          name="title"
          required
          minLength={3}
          maxLength={120}
          placeholder="z.B. „Beinpresse 3 wackelt“"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="description">Beschreibung (optional)</Label>
        <textarea
          id="description"
          name="description"
          rows={3}
          className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          placeholder="Genauer beschreiben — wo? was? wie oft?"
        />
      </div>

      <div className="space-y-2 max-w-xs">
        <Label htmlFor="severity">Wie dringend?</Label>
        <select
          id="severity"
          name="severity"
          defaultValue="normal"
          className="h-9 w-full rounded-md border border-input bg-background px-3 text-sm"
        >
          <option value="niedrig">Niedrig — kann warten</option>
          <option value="normal">Normal — bei Gelegenheit</option>
          <option value="kritisch">Kritisch — sofort kümmern</option>
        </select>
      </div>

      <div className="space-y-2">
        <Label>Foto (optional)</Label>
        <input
          ref={fileRef}
          type="file"
          name="foto"
          accept="image/jpeg,image/png,image/webp"
          onChange={onChangeFile}
          className="hidden"
          id="mangel-foto"
        />
        {fotoName ? (
          <div className="inline-flex items-center gap-2 rounded-md border border-border bg-muted/40 px-3 py-1.5 text-sm">
            <Check className="h-3.5 w-3.5 text-[hsl(var(--success))]" />
            <span className="truncate max-w-[180px]">{fotoName}</span>
            <button
              type="button"
              onClick={clearFile}
              className="text-muted-foreground hover:text-destructive"
              aria-label="Foto entfernen"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          </div>
        ) : (
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => fileRef.current?.click()}
            className="gap-1.5"
          >
            <Camera className="h-3.5 w-3.5" />
            Foto hinzufügen
          </Button>
        )}
        <p className="text-xs text-muted-foreground">
          JPG, PNG oder WebP, max 5 MB.
        </p>
      </div>

      {error && (
        <p className="inline-flex items-center gap-2 rounded-md bg-[hsl(var(--destructive)/0.1)] px-3 py-2 text-xs font-medium text-[hsl(var(--destructive))]">
          <AlertCircle className="h-3.5 w-3.5" />
          {error}
        </p>
      )}
      {erfolg && (
        <p className="inline-flex items-center gap-2 rounded-md bg-[hsl(var(--success)/0.12)] px-3 py-2 text-xs font-medium text-[hsl(var(--success))]">
          <Check className="h-3.5 w-3.5" />
          Mangel gemeldet — danke!
        </p>
      )}

      <div className="flex items-center gap-3 border-t border-border pt-4">
        <Button
          type="submit"
          disabled={pending}
          className="bg-[hsl(var(--primary))] text-[hsl(var(--primary-foreground))] hover:bg-[hsl(var(--primary)/0.9)]"
        >
          {pending ? "Sende …" : "Mangel melden"}
        </Button>
      </div>
    </form>
  );
}
