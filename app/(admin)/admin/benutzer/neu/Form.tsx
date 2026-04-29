"use client";

import { useActionState } from "react";
import { AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  mitarbeiterAnlegen,
  type OnboardingErgebnis,
} from "../onboarding-actions";

type Pfad = { id: string; title: string; description: string | null };

export function NeuerBenutzerForm({ lernpfade }: { lernpfade: Pfad[] }) {
  const [state, action, pending] = useActionState<
    OnboardingErgebnis | null,
    FormData
  >(mitarbeiterAnlegen, null);

  return (
    <form action={action} className="space-y-10">
      {/* Persoenliche Daten */}
      <Section
        eyebrow="Schritt 1"
        titel="Persönliche Daten"
        beschreibung="Vor- und Nachname, dienstliche E-Mail."
      >
        <div className="grid gap-5 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="first_name">Vorname</Label>
            <Input
              id="first_name"
              name="first_name"
              required
              maxLength={60}
              autoComplete="given-name"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="last_name">Nachname</Label>
            <Input
              id="last_name"
              name="last_name"
              required
              maxLength={60}
              autoComplete="family-name"
            />
          </div>
        </div>
        <div className="space-y-2 max-w-md">
          <Label htmlFor="email">Dienstliche E-Mail</Label>
          <Input
            id="email"
            name="email"
            type="email"
            required
            autoComplete="email"
            placeholder="vorname.nachname@vitness.de"
          />
        </div>
      </Section>

      {/* Rolle */}
      <Section
        eyebrow="Schritt 2"
        titel="Rolle"
        beschreibung="Mitarbeiter:innen sehen nur ihren eigenen Bereich. Führungskräfte sehen auch Praxisfreigaben."
      >
        <div className="space-y-3">
          <RoleOption
            value="mitarbeiter"
            label="Mitarbeiter:in"
            beschreibung="Standard-Rolle: eigenes Dashboard, eigene Lernpfade, Praxisfreigaben einreichen."
            defaultChecked
          />
          <RoleOption
            value="fuehrungskraft"
            label="Führungskraft"
            beschreibung="Zusätzlich Praxisfreigaben anderer Mitarbeiter:innen einsehen und freigeben."
          />
        </div>
      </Section>

      {/* Lernpfade */}
      <Section
        eyebrow="Schritt 3"
        titel="Lernpfade zuweisen"
        beschreibung="Mehrere möglich. Jeder zugewiesene Pfad erscheint sofort auf dem Dashboard."
      >
        {lernpfade.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            Noch keine aktiven Lernpfade vorhanden.
          </p>
        ) : (
          <ul className="space-y-2">
            {lernpfade.map((p) => (
              <li key={p.id}>
                <label className="flex cursor-pointer items-start gap-3 rounded-lg border border-border bg-background px-4 py-3 transition-colors hover:border-[hsl(var(--primary))] hover:bg-[hsl(var(--primary)/0.04)]">
                  <input
                    type="checkbox"
                    name="lernpfade"
                    value={p.id}
                    className="mt-1 h-4 w-4 accent-[hsl(var(--primary))]"
                  />
                  <span className="flex-1">
                    <span className="block text-sm font-semibold">
                      {p.title}
                    </span>
                    {p.description && (
                      <span className="mt-0.5 block text-xs text-muted-foreground">
                        {p.description}
                      </span>
                    )}
                  </span>
                </label>
              </li>
            ))}
          </ul>
        )}
      </Section>

      {state?.message && !state.ok && (
        <p className="inline-flex items-center gap-2 rounded-md bg-[hsl(var(--destructive)/0.1)] px-3 py-2 text-sm font-medium text-[hsl(var(--destructive))]">
          <AlertCircle className="h-4 w-4" />
          {state.message}
        </p>
      )}

      <div className="flex items-center gap-3 border-t border-border pt-6">
        <Button
          type="submit"
          disabled={pending}
          className="bg-[hsl(var(--primary))] text-[hsl(var(--primary-foreground))] hover:bg-[hsl(var(--primary)/0.9)]"
        >
          {pending ? "Anlegen…" : "Mitarbeiter:in anlegen + Mail senden"}
        </Button>
        <p className="text-xs text-muted-foreground">
          Die Welcome-Mail mit Magic-Link wird automatisch versendet.
        </p>
      </div>
    </form>
  );
}

function Section({
  eyebrow,
  titel,
  beschreibung,
  children,
}: {
  eyebrow: string;
  titel: string;
  beschreibung: string;
  children: React.ReactNode;
}) {
  return (
    <section className="grid gap-6 lg:grid-cols-12 lg:gap-12">
      <div className="lg:col-span-4">
        <p className="text-[11px] font-medium uppercase tracking-[0.18em] text-[hsl(var(--brand-pink))]">
          {eyebrow}
        </p>
        <h2 className="mt-2 text-xl font-semibold tracking-tight">{titel}</h2>
        <p className="mt-1.5 text-sm text-muted-foreground">{beschreibung}</p>
      </div>
      <div className="lg:col-span-8">
        <div className="space-y-5 rounded-2xl border border-border bg-card p-6">
          {children}
        </div>
      </div>
    </section>
  );
}

function RoleOption({
  value,
  label,
  beschreibung,
  defaultChecked,
}: {
  value: string;
  label: string;
  beschreibung: string;
  defaultChecked?: boolean;
}) {
  return (
    <label className="flex cursor-pointer items-start gap-3 rounded-lg border border-border bg-background px-4 py-3 transition-colors hover:border-[hsl(var(--primary))] hover:bg-[hsl(var(--primary)/0.04)] has-[:checked]:border-[hsl(var(--primary))] has-[:checked]:bg-[hsl(var(--primary)/0.06)]">
      <input
        type="radio"
        name="role"
        value={value}
        defaultChecked={defaultChecked}
        className="mt-1 h-4 w-4 accent-[hsl(var(--primary))]"
        required
      />
      <span className="flex-1">
        <span className="block text-sm font-semibold">{label}</span>
        <span className="mt-0.5 block text-xs text-muted-foreground">
          {beschreibung}
        </span>
      </span>
    </label>
  );
}
