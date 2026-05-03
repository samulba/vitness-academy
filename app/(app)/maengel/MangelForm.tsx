"use client";

import { useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { AlertCircle, Camera, Check, Wrench, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { mangelMelden } from "./actions";

const FELD = "h-11 rounded-lg";

export function MangelForm() {
  const router = useRouter();
  const formRef = useRef<HTMLFormElement>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [erfolg, setErfolg] = useState(false);
  const [fotoName, setFotoName] = useState<string | null>(null);
  const [severity, setSeverity] = useState<string>("normal");

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
    fd.set("severity", severity);
    startTransition(async () => {
      const res = await mangelMelden(fd);
      if (res.ok) {
        setErfolg(true);
        formRef.current?.reset();
        setFotoName(null);
        setSeverity("normal");
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
    <form ref={formRef} onSubmit={onSubmit} className="space-y-6">
      <div className="space-y-2">
        <Label htmlFor="title" className="text-sm font-medium">
          Was ist los?
        </Label>
        <Input
          id="title"
          name="title"
          required
          minLength={3}
          maxLength={120}
          placeholder='z.B. „Beinpresse 3 wackelt"'
          className={FELD}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="description" className="text-sm font-medium">
          Beschreibung{" "}
          <span className="font-normal text-muted-foreground">(optional)</span>
        </Label>
        <textarea
          id="description"
          name="description"
          rows={4}
          className="w-full rounded-lg border border-border bg-background px-3 py-2.5 text-sm shadow-sm transition-colors focus-visible:border-[hsl(var(--primary)/0.5)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[hsl(var(--primary)/0.2)]"
          placeholder="Genauer beschreiben — wo? was? wie oft?"
        />
      </div>

      <div className="space-y-2">
        <Label className="text-sm font-medium">Wie dringend?</Label>
        <Select value={severity} onValueChange={setSeverity}>
          <SelectTrigger className={FELD}>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="niedrig">Niedrig — kann warten</SelectItem>
            <SelectItem value="normal">Normal — bei Gelegenheit</SelectItem>
            <SelectItem value="kritisch">Kritisch — sofort kümmern</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label className="text-sm font-medium">
          Foto{" "}
          <span className="font-normal text-muted-foreground">(optional)</span>
        </Label>
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
          <div className="inline-flex max-w-full items-center gap-2 rounded-lg border border-border bg-muted/40 px-3 py-2 text-sm">
            <Check className="h-3.5 w-3.5 shrink-0 text-[hsl(var(--success))]" />
            <span className="truncate">{fotoName}</span>
            <button
              type="button"
              onClick={clearFile}
              className="text-muted-foreground transition-colors hover:text-destructive"
              aria-label="Foto entfernen"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          </div>
        ) : (
          <Button
            type="button"
            variant="outline"
            onClick={() => fileRef.current?.click()}
            className="h-11 gap-2 rounded-lg"
          >
            <Camera className="h-4 w-4" />
            Foto hinzufügen
          </Button>
        )}
        <p className="text-xs text-muted-foreground">
          JPG, PNG oder WebP, max 5 MB.
        </p>
      </div>

      {error && (
        <p className="inline-flex items-center gap-2 rounded-lg bg-[hsl(var(--destructive)/0.1)] px-3 py-2 text-xs font-medium text-[hsl(var(--destructive))]">
          <AlertCircle className="h-3.5 w-3.5" />
          {error}
        </p>
      )}
      {erfolg && (
        <p className="inline-flex items-center gap-2 rounded-lg bg-[hsl(var(--success)/0.12)] px-3 py-2 text-xs font-medium text-[hsl(var(--success))]">
          <Check className="h-3.5 w-3.5" />
          Mangel gemeldet — danke!
        </p>
      )}

      <Button
        type="submit"
        disabled={pending}
        className="h-11 w-full gap-2 rounded-lg bg-[hsl(var(--primary))] font-medium text-[hsl(var(--primary-foreground))] hover:bg-[hsl(var(--primary)/0.9)] sm:w-auto"
      >
        <Wrench className="h-4 w-4" />
        {pending ? "Sende …" : "Mangel melden"}
      </Button>
    </form>
  );
}
