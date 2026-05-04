"use client";

import { useActionState, useState } from "react";
import { AlertCircle, Sparkles } from "lucide-react";
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
import {
  mitarbeiterAnlegen,
  type OnboardingErgebnis,
} from "../onboarding-actions";

type Pfad = { id: string; title: string; description: string | null };

type Template = {
  id: string;
  name: string;
  role: string;
  lernpfad_ids: string[];
};

export function NeuerBenutzerForm({
  lernpfade,
  templates,
}: {
  lernpfade: Pfad[];
  templates: Template[];
}) {
  const [state, action, pending] = useActionState<
    OnboardingErgebnis | null,
    FormData
  >(mitarbeiterAnlegen, null);

  const [role, setRole] = useState<string>("mitarbeiter");
  const [pfadIds, setPfadIds] = useState<Set<string>>(new Set());
  const [aktivesTemplate, setAktivesTemplate] = useState<string>("__leer");

  function templateAnwenden(templateId: string) {
    setAktivesTemplate(templateId);
    if (templateId === "__leer") {
      setRole("mitarbeiter");
      setPfadIds(new Set());
      return;
    }
    const t = templates.find((x) => x.id === templateId);
    if (!t) return;
    setRole(t.role);
    setPfadIds(new Set(t.lernpfad_ids));
  }

  function togglePfad(id: string) {
    setPfadIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
    setAktivesTemplate("__leer");
  }

  return (
    <form action={action} className="space-y-10">
      {/* Template-Quick-Start */}
      {templates.length > 0 && (
        <div className="rounded-2xl border border-[hsl(var(--brand-pink)/0.25)] bg-[hsl(var(--brand-pink)/0.04)] p-5">
          <div className="flex flex-wrap items-end gap-4">
            <div className="flex-1 min-w-[240px]">
              <div className="flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-[hsl(var(--brand-pink))]" />
                <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[hsl(var(--brand-pink))]">
                  Quick-Start
                </p>
              </div>
              <h2 className="mt-1 text-base font-semibold tracking-tight">
                Onboarding-Template anwenden
              </h2>
              <p className="mt-0.5 text-xs text-muted-foreground">
                Rolle + Lernpfade werden automatisch vorausgewählt. Du kannst
                danach noch alles ändern.
              </p>
            </div>
            <div className="w-full sm:w-72">
              <Select
                value={aktivesTemplate}
                onValueChange={templateAnwenden}
              >
                <SelectTrigger className="h-10 rounded-lg bg-card">
                  <SelectValue placeholder="Template wählen …" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="__leer">— Kein Template —</SelectItem>
                  {templates.map((t) => (
                    <SelectItem key={t.id} value={t.id}>
                      {t.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
      )}

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
            checked={role === "mitarbeiter"}
            onChange={() => setRole("mitarbeiter")}
          />
          <RoleOption
            value="fuehrungskraft"
            label="Führungskraft"
            beschreibung="Zusätzlich Praxisfreigaben anderer Mitarbeiter:innen einsehen und freigeben."
            checked={role === "fuehrungskraft"}
            onChange={() => setRole("fuehrungskraft")}
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
            {lernpfade.map((p) => {
              const aktiv = pfadIds.has(p.id);
              return (
                <li key={p.id}>
                  <label className="flex cursor-pointer items-start gap-3 rounded-lg border border-border bg-background px-4 py-3 transition-colors hover:border-[hsl(var(--primary))] hover:bg-[hsl(var(--primary)/0.04)] has-[:checked]:border-[hsl(var(--primary))] has-[:checked]:bg-[hsl(var(--primary)/0.06)]">
                    <input
                      type="checkbox"
                      name="lernpfade"
                      value={p.id}
                      checked={aktiv}
                      onChange={() => togglePfad(p.id)}
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
              );
            })}
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
  checked,
  onChange,
}: {
  value: string;
  label: string;
  beschreibung: string;
  checked: boolean;
  onChange: () => void;
}) {
  return (
    <label className="flex cursor-pointer items-start gap-3 rounded-lg border border-border bg-background px-4 py-3 transition-colors hover:border-[hsl(var(--primary))] hover:bg-[hsl(var(--primary)/0.04)] has-[:checked]:border-[hsl(var(--primary))] has-[:checked]:bg-[hsl(var(--primary)/0.06)]">
      <input
        type="radio"
        name="role"
        value={value}
        checked={checked}
        onChange={onChange}
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
