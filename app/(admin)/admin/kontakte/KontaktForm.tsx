"use client";

import { useState } from "react";
import Link from "next/link";
import { Settings2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { ContactRole } from "@/lib/contact-roles";

type Initial = {
  first_name: string | null;
  last_name: string | null;
  role_tags: string[];
  phone: string | null;
  email: string | null;
  notes: string | null;
};

export function KontaktForm({
  action,
  initial,
  modus,
  rollen,
}: {
  action: (formData: FormData) => Promise<void>;
  initial?: Initial;
  modus: "neu" | "bearbeiten";
  rollen: ContactRole[];
}) {
  const i = initial;
  const [ausgewaehlt, setAusgewaehlt] = useState<Set<string>>(
    new Set(i?.role_tags ?? []),
  );

  // Auch Rollen rendern, die der Kontakt schon hat, aber nicht mehr im
  // Katalog sind (verhindert stilles Verschwinden).
  const alleNamen = new Set<string>(rollen.map((r) => r.name));
  const extraRollen = (i?.role_tags ?? []).filter((r) => !alleNamen.has(r));

  function toggle(name: string) {
    setAusgewaehlt((alt) => {
      const neu = new Set(alt);
      if (neu.has(name)) neu.delete(name);
      else neu.add(name);
      return neu;
    });
  }

  return (
    <form action={action} className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="first_name">Vorname</Label>
          <Input
            id="first_name"
            name="first_name"
            defaultValue={i?.first_name ?? ""}
            maxLength={60}
            autoComplete="given-name"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="last_name">Nachname</Label>
          <Input
            id="last_name"
            name="last_name"
            defaultValue={i?.last_name ?? ""}
            maxLength={60}
            autoComplete="family-name"
          />
        </div>
      </div>

      <div className="space-y-2">
        <div className="flex items-center justify-between gap-3">
          <Label>Rollen</Label>
          <Link
            href="/admin/kontakte/rollen"
            className="inline-flex items-center gap-1 text-[11px] font-medium text-muted-foreground transition-colors hover:text-foreground"
          >
            <Settings2 className="h-3 w-3" />
            Rollen verwalten
          </Link>
        </div>
        {rollen.length === 0 && extraRollen.length === 0 ? (
          <p className="rounded-md border border-dashed border-border bg-muted/30 px-3 py-3 text-xs text-muted-foreground">
            Noch keine Rollen im Katalog.{" "}
            <Link
              href="/admin/kontakte/rollen"
              className="font-medium underline-offset-2 hover:underline"
            >
              Erste Rolle anlegen
            </Link>
            .
          </p>
        ) : (
          <div className="flex flex-wrap gap-2">
            {rollen.map((r) => {
              const aktiv = ausgewaehlt.has(r.name);
              return (
                <button
                  key={r.id}
                  type="button"
                  onClick={() => toggle(r.name)}
                  className={
                    aktiv
                      ? "rounded-full border-2 border-[hsl(var(--primary))] bg-[hsl(var(--primary)/0.08)] px-3 py-1 text-xs font-semibold text-[hsl(var(--primary))]"
                      : "rounded-full border border-border bg-card px-3 py-1 text-xs font-medium text-muted-foreground transition-colors hover:border-[hsl(var(--primary)/0.4)] hover:text-foreground"
                  }
                >
                  {r.name}
                </button>
              );
            })}
            {extraRollen.map((name) => {
              const aktiv = ausgewaehlt.has(name);
              return (
                <button
                  key={`extra-${name}`}
                  type="button"
                  onClick={() => toggle(name)}
                  title="Nicht mehr im Katalog – aktuell zugewiesen"
                  className={
                    aktiv
                      ? "rounded-full border-2 border-amber-500 bg-amber-50 px-3 py-1 text-xs font-semibold text-amber-700 dark:bg-amber-950/40"
                      : "rounded-full border border-amber-300 bg-card px-3 py-1 text-xs font-medium text-amber-600 transition-colors hover:bg-amber-50"
                  }
                >
                  {name}
                </button>
              );
            })}
          </div>
        )}
        {/* Hidden inputs fuer FormData */}
        {Array.from(ausgewaehlt).map((name) => (
          <input
            key={name}
            type="hidden"
            name="role_tags"
            value={name}
          />
        ))}
        <p className="text-[11px] text-muted-foreground">
          Klick zum Auswählen — mehrere möglich.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="phone">Telefon</Label>
          <Input
            id="phone"
            name="phone"
            type="tel"
            defaultValue={i?.phone ?? ""}
            placeholder="+49 …"
            autoComplete="tel"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="email">E-Mail</Label>
          <Input
            id="email"
            name="email"
            type="email"
            defaultValue={i?.email ?? ""}
            autoComplete="email"
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="notes">Notiz (optional)</Label>
        <textarea
          id="notes"
          name="notes"
          rows={3}
          defaultValue={i?.notes ?? ""}
          className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          placeholder="Erreichbar Mo–Fr, vertretungsweise …"
        />
      </div>

      <div className="flex items-center gap-3 border-t border-border pt-4">
        <Button
          type="submit"
          className="bg-[hsl(var(--primary))] text-[hsl(var(--primary-foreground))] hover:bg-[hsl(var(--primary)/0.9)]"
        >
          {modus === "neu" ? "Kontakt anlegen" : "Änderungen speichern"}
        </Button>
      </div>
    </form>
  );
}
