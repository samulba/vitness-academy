"use client";

import { useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { AlertCircle, Check, Megaphone } from "lucide-react";
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
import { INFO_KATEGORIEN } from "@/lib/infos-types";
import { infoPosten } from "./actions";

type Standort = { id: string; name: string };

const FELD = "h-11 rounded-lg";

export function NeueInfoForm({
  standorte,
  defaultLocationId,
}: {
  standorte: Standort[];
  defaultLocationId: string | null;
}) {
  const router = useRouter();
  const formRef = useRef<HTMLFormElement>(null);
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [erfolg, setErfolg] = useState(false);

  const [category, setCategory] = useState<string>("allgemein");
  const [importance, setImportance] = useState<string>("info");
  const [locationId, setLocationId] = useState<string>(defaultLocationId ?? "");

  function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    const fd = new FormData(e.currentTarget);
    fd.set("category", category);
    fd.set("importance", importance);
    fd.set("location_id", locationId);
    startTransition(async () => {
      const res = await infoPosten(fd);
      if (res.ok) {
        setErfolg(true);
        formRef.current?.reset();
        setCategory("allgemein");
        setImportance("info");
        setLocationId(defaultLocationId ?? "");
        setTimeout(() => {
          router.refresh();
          setErfolg(false);
        }, 1200);
      } else {
        setError(res.message);
      }
    });
  }

  return (
    <form ref={formRef} onSubmit={onSubmit} className="space-y-6">
      <div className="space-y-2">
        <Label htmlFor="title" className="text-sm font-medium">
          Worum geht&apos;s?
        </Label>
        <Input
          id="title"
          name="title"
          required
          minLength={3}
          maxLength={120}
          placeholder='z.B. „Sauna heute ab 18 Uhr außer Betrieb"'
          className={FELD}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="body" className="text-sm font-medium">
          Details{" "}
          <span className="font-normal text-muted-foreground">(optional)</span>
        </Label>
        <textarea
          id="body"
          name="body"
          rows={4}
          maxLength={4000}
          className="w-full rounded-lg border border-border bg-background px-3 py-2.5 text-sm shadow-sm transition-colors focus-visible:border-[hsl(var(--primary)/0.5)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[hsl(var(--primary)/0.2)]"
          placeholder="Kontext, Hintergrund, was zu tun ist …"
        />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label className="text-sm font-medium">Kategorie</Label>
          <Select value={category} onValueChange={setCategory}>
            <SelectTrigger className={FELD}>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {INFO_KATEGORIEN.map((k) => (
                <SelectItem key={k.value} value={k.value}>
                  {k.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label className="text-sm font-medium">Wichtigkeit</Label>
          <Select value={importance} onValueChange={setImportance}>
            <SelectTrigger className={FELD}>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="info">Info — gut zu wissen</SelectItem>
              <SelectItem value="warning">Wichtig — bitte beachten</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {standorte.length > 0 && (
        <div className="space-y-2">
          <Label className="text-sm font-medium">Standort</Label>
          <Select
            value={locationId === "" ? "__alle" : locationId}
            onValueChange={(v) => setLocationId(v === "__alle" ? "" : v)}
          >
            <SelectTrigger className={FELD}>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="__alle">Alle Standorte</SelectItem>
              {standorte.map((s) => (
                <SelectItem key={s.id} value={s.id}>
                  {s.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}

      <p className="text-xs leading-relaxed text-muted-foreground">
        „Dringend&ldquo; mit Dashboard-Banner setzt die Studioleitung.
      </p>

      {error && (
        <p className="inline-flex items-center gap-2 rounded-lg bg-[hsl(var(--destructive)/0.1)] px-3 py-2 text-xs font-medium text-[hsl(var(--destructive))]">
          <AlertCircle className="h-3.5 w-3.5" />
          {error}
        </p>
      )}
      {erfolg && (
        <p className="inline-flex items-center gap-2 rounded-lg bg-[hsl(var(--success)/0.12)] px-3 py-2 text-xs font-medium text-[hsl(var(--success))]">
          <Check className="h-3.5 w-3.5" />
          Info gepostet — danke!
        </p>
      )}

      <Button
        type="submit"
        disabled={pending}
        className="h-11 w-full gap-2 rounded-lg bg-[hsl(var(--primary))] font-medium text-[hsl(var(--primary-foreground))] hover:bg-[hsl(var(--primary)/0.9)] sm:w-auto"
      >
        <Megaphone className="h-4 w-4" />
        {pending ? "Sende …" : "Info posten"}
      </Button>
    </form>
  );
}
