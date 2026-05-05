"use client";

import { useEffect, useRef, useState, useTransition } from "react";
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
import { ColoredAvatar } from "@/components/admin/ColoredAvatar";
import { mangelMelden } from "./actions";

const FELD = "h-10 rounded-lg";

const SEVERITY_DOT: Record<string, string> = {
  niedrig: "bg-zinc-400",
  normal: "bg-blue-500",
  kritisch: "bg-red-500",
};

const SEVERITY_LABEL: Record<string, string> = {
  niedrig: "Niedrig",
  normal: "Normal",
  kritisch: "Kritisch",
};

export function Composer({
  fullName,
  avatarPath,
  vorname,
}: {
  fullName: string | null;
  avatarPath: string | null;
  vorname: string | null;
}) {
  const router = useRouter();
  const formRef = useRef<HTMLFormElement>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const titleRef = useRef<HTMLInputElement>(null);
  const [expanded, setExpanded] = useState(false);
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [erfolg, setErfolg] = useState(false);
  const [fotos, setFotos] = useState<File[]>([]);
  const [severity, setSeverity] = useState<string>("normal");

  const FOTO_MAX_ANZAHL = 5;

  useEffect(() => {
    if (expanded) titleRef.current?.focus();
  }, [expanded]);

  function abbrechen() {
    setExpanded(false);
    setError(null);
    setFotos([]);
    setSeverity("normal");
    if (fileRef.current) fileRef.current.value = "";
    formRef.current?.reset();
  }

  function onChangeFile(e: React.ChangeEvent<HTMLInputElement>) {
    const neue = Array.from(e.target.files ?? []);
    setFotos((prev) => {
      const kombiniert = [...prev, ...neue];
      // Dedupe nach Name+Size, max FOTO_MAX_ANZAHL
      const seen = new Set<string>();
      const ergebnis: File[] = [];
      for (const f of kombiniert) {
        const key = `${f.name}-${f.size}`;
        if (seen.has(key)) continue;
        seen.add(key);
        ergebnis.push(f);
        if (ergebnis.length >= FOTO_MAX_ANZAHL) break;
      }
      return ergebnis;
    });
    if (fileRef.current) fileRef.current.value = "";
  }

  function removeFoto(idx: number) {
    setFotos((prev) => prev.filter((_, i) => i !== idx));
  }

  function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    const fd = new FormData(e.currentTarget);
    fd.set("severity", severity);
    // Fotos aus State (FormData-Einträge aus dem leeren Input ueberschreiben)
    fd.delete("foto");
    for (const f of fotos) {
      fd.append("foto", f);
    }
    startTransition(async () => {
      const res = await mangelMelden(fd);
      if (res.ok) {
        setErfolg(true);
        formRef.current?.reset();
        setFotos([]);
        setSeverity("normal");
        setTimeout(() => {
          router.refresh();
          setErfolg(false);
          setExpanded(false);
        }, 1200);
      } else {
        setError(res.message);
      }
    });
  }

  return (
    <div className="rounded-2xl border border-border bg-card transition-all">
      {!expanded ? (
        <button
          type="button"
          onClick={() => setExpanded(true)}
          className="flex w-full items-center gap-3 px-5 py-4 text-left"
        >
          <ColoredAvatar
            name={fullName}
            avatarPath={avatarPath}
            size="md"
          />
          <span className="flex-1 truncate rounded-full bg-muted/50 px-4 py-2.5 text-sm text-muted-foreground">
            Was ist los
            {vorname ? `, ${vorname}` : ""}? Mangel beschreiben …
          </span>
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[hsl(var(--primary))] text-[hsl(var(--primary-foreground))]">
            <Wrench className="h-4 w-4" strokeWidth={2} />
          </span>
        </button>
      ) : (
        <form
          ref={formRef}
          onSubmit={onSubmit}
          className="space-y-5 p-5 sm:p-6"
        >
          <div className="flex items-start gap-3">
            <ColoredAvatar
              name={fullName}
              avatarPath={avatarPath}
              size="md"
              className="mt-1"
            />
            <div className="flex-1 space-y-1">
              <Label
                htmlFor="mangel-title"
                className="text-xs font-medium text-muted-foreground"
              >
                Was ist los?
              </Label>
              <Input
                ref={titleRef}
                id="mangel-title"
                name="title"
                required
                minLength={3}
                maxLength={120}
                placeholder='z.B. „Beinpresse 3 wackelt"'
                className={FELD}
              />
            </div>
          </div>

          <div className="space-y-1">
            <Label
              htmlFor="mangel-description"
              className="text-xs font-medium text-muted-foreground"
            >
              Beschreibung
              <span className="ml-1 font-normal opacity-70">(optional)</span>
            </Label>
            <textarea
              id="mangel-description"
              name="description"
              rows={3}
              className="w-full rounded-lg border border-border bg-background px-3 py-2.5 text-sm shadow-sm transition-colors focus-visible:border-[hsl(var(--primary)/0.5)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[hsl(var(--primary)/0.2)]"
              placeholder="Wo? Was? Wie oft?"
            />
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <div className="space-y-1">
              <Label className="text-xs font-medium text-muted-foreground">
                Wie dringend?
              </Label>
              <Select value={severity} onValueChange={setSeverity}>
                <SelectTrigger className={FELD}>
                  <SelectValue>
                    <span className="inline-flex items-center gap-2">
                      <span
                        className={`h-2 w-2 rounded-full ${SEVERITY_DOT[severity]}`}
                      />
                      {SEVERITY_LABEL[severity]}
                    </span>
                  </SelectValue>
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="niedrig">
                    <span className="inline-flex items-center gap-2">
                      <span className="h-2 w-2 rounded-full bg-zinc-400" />
                      Niedrig — kann warten
                    </span>
                  </SelectItem>
                  <SelectItem value="normal">
                    <span className="inline-flex items-center gap-2">
                      <span className="h-2 w-2 rounded-full bg-blue-500" />
                      Normal — bei Gelegenheit
                    </span>
                  </SelectItem>
                  <SelectItem value="kritisch">
                    <span className="inline-flex items-center gap-2">
                      <span className="h-2 w-2 rounded-full bg-red-500" />
                      Kritisch — sofort kümmern
                    </span>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1">
              <Label className="text-xs font-medium text-muted-foreground">
                Fotos
                <span className="ml-1 font-normal opacity-70">
                  (optional, max. {FOTO_MAX_ANZAHL})
                </span>
              </Label>
              <input
                ref={fileRef}
                type="file"
                name="foto"
                accept="image/jpeg,image/png,image/webp"
                multiple
                onChange={onChangeFile}
                className="hidden"
              />
              <Button
                type="button"
                variant="outline"
                onClick={() => fileRef.current?.click()}
                disabled={fotos.length >= FOTO_MAX_ANZAHL}
                className="h-10 w-full justify-start gap-2 rounded-lg font-normal text-muted-foreground"
              >
                <Camera className="h-4 w-4" />
                {fotos.length === 0
                  ? "Fotos hinzufügen"
                  : fotos.length >= FOTO_MAX_ANZAHL
                    ? "Maximum erreicht"
                    : "Weiteres Foto hinzufügen"}
              </Button>
            </div>
          </div>

          {fotos.length > 0 && (
            <ul className="space-y-1.5">
              {fotos.map((f, i) => (
                <li
                  key={`${f.name}-${f.size}-${i}`}
                  className="flex h-9 items-center gap-2 rounded-lg border border-border bg-muted/40 px-3 text-sm"
                >
                  <Check className="h-3.5 w-3.5 shrink-0 text-[hsl(var(--success))]" />
                  <span className="flex-1 truncate">{f.name}</span>
                  <span className="shrink-0 text-[11px] text-muted-foreground">
                    {(f.size / 1024 / 1024).toFixed(1)} MB
                  </span>
                  <button
                    type="button"
                    onClick={() => removeFoto(i)}
                    className="text-muted-foreground transition-colors hover:text-destructive"
                    aria-label="Foto entfernen"
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                </li>
              ))}
            </ul>
          )}

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

          <div className="flex items-center justify-end gap-2 border-t border-border pt-4">
            <Button
              type="button"
              variant="ghost"
              onClick={abbrechen}
              disabled={pending}
              className="h-10 gap-1 rounded-lg text-muted-foreground"
            >
              <X className="h-3.5 w-3.5" />
              Abbrechen
            </Button>
            <Button
              type="submit"
              disabled={pending}
              className="h-10 gap-2 rounded-lg bg-[hsl(var(--primary))] font-medium text-[hsl(var(--primary-foreground))] hover:bg-[hsl(var(--primary)/0.9)]"
            >
              <Wrench className="h-4 w-4" />
              {pending ? "Sende …" : "Mangel melden"}
            </Button>
          </div>
        </form>
      )}
    </div>
  );
}
