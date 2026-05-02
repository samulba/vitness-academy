"use client";

import { useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { AlertCircle, Check, Megaphone } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { INFO_KATEGORIEN } from "@/lib/infos-types";
import { infoPosten } from "./actions";

type Standort = { id: string; name: string };

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

  function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    const fd = new FormData(e.currentTarget);
    startTransition(async () => {
      const res = await infoPosten(fd);
      if (res.ok) {
        setErfolg(true);
        formRef.current?.reset();
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
    <form ref={formRef} onSubmit={onSubmit} className="space-y-5">
      <div className="space-y-2">
        <Label htmlFor="title">Worum geht&apos;s?</Label>
        <Input
          id="title"
          name="title"
          required
          minLength={3}
          maxLength={120}
          placeholder="z.B. „Sauna heute ab 18 Uhr außer Betrieb"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="body">Details (optional)</Label>
        <textarea
          id="body"
          name="body"
          rows={3}
          maxLength={4000}
          className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          placeholder="Kontext, Hintergrund, was zu tun ist …"
        />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="category">Kategorie</Label>
          <select
            id="category"
            name="category"
            defaultValue="allgemein"
            className="h-9 w-full rounded-md border border-input bg-background px-3 text-sm"
          >
            {INFO_KATEGORIEN.map((k) => (
              <option key={k.value} value={k.value}>
                {k.label}
              </option>
            ))}
          </select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="importance">Wichtigkeit</Label>
          <select
            id="importance"
            name="importance"
            defaultValue="info"
            className="h-9 w-full rounded-md border border-input bg-background px-3 text-sm"
          >
            <option value="info">Info — gut zu wissen</option>
            <option value="warning">Wichtig — bitte beachten</option>
          </select>
          <p className="text-[11px] text-muted-foreground">
            „Dringend&ldquo; mit Dashboard-Banner setzt die Studioleitung.
          </p>
        </div>
      </div>

      {standorte.length > 0 && (
        <div className="space-y-2 max-w-xs">
          <Label htmlFor="location_id">Standort</Label>
          <select
            id="location_id"
            name="location_id"
            defaultValue={defaultLocationId ?? ""}
            className="h-9 w-full rounded-md border border-input bg-background px-3 text-sm"
          >
            <option value="">Alle Standorte</option>
            {standorte.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name}
              </option>
            ))}
          </select>
        </div>
      )}

      {error && (
        <p className="inline-flex items-center gap-2 rounded-md bg-[hsl(var(--destructive)/0.1)] px-3 py-2 text-xs font-medium text-[hsl(var(--destructive))]">
          <AlertCircle className="h-3.5 w-3.5" />
          {error}
        </p>
      )}
      {erfolg && (
        <p className="inline-flex items-center gap-2 rounded-md bg-[hsl(var(--success)/0.12)] px-3 py-2 text-xs font-medium text-[hsl(var(--success))]">
          <Check className="h-3.5 w-3.5" />
          Info gepostet — danke!
        </p>
      )}

      <div className="flex items-center gap-3 border-t border-border pt-4">
        <Button
          type="submit"
          disabled={pending}
          className="gap-1.5 bg-[hsl(var(--primary))] text-[hsl(var(--primary-foreground))] hover:bg-[hsl(var(--primary)/0.9)]"
        >
          <Megaphone className="h-3.5 w-3.5" />
          {pending ? "Sende …" : "Info posten"}
        </Button>
      </div>
    </form>
  );
}
