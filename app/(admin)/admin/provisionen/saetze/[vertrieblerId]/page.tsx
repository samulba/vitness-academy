import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Plus, Sparkles, Target as TargetIcon, Trash2 } from "lucide-react";
import { PageHeader } from "@/components/ui/page-header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ColoredAvatar } from "@/components/admin/ColoredAvatar";
import { LoeschenButton } from "@/components/admin/LoeschenButton";
import { requireRole } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import {
  formatEuro,
  LAUFZEIT_OPTIONS,
  ladeBonusStufen,
  ladeRates,
  ladeTargets,
  ladeVertriebler,
  laufzeitLabel,
} from "@/lib/provisionen";
import { formatDatum } from "@/lib/format";
import {
  bonusStufeAnlegen,
  bonusStufeLoeschen,
  personalSatzAnlegen,
  personalSatzLoeschen,
  targetLoeschen,
  targetSetzen,
} from "../actions";

function aktuellerMonat(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
}

function monatsLabel(yyyymm: string): string {
  const [y, m] = yyyymm.split("-").map(Number);
  const monate = [
    "Januar", "Februar", "März", "April", "Mai", "Juni",
    "Juli", "August", "September", "Oktober", "November", "Dezember",
  ];
  return `${monate[m - 1]} ${y}`;
}

export default async function PersoenlicheSaetzePage({
  params,
}: {
  params: Promise<{ vertrieblerId: string }>;
}) {
  await requireRole(["admin", "superadmin"]);
  const { vertrieblerId } = await params;

  const [vertriebler, rates, bonusStufen, targets] = await Promise.all([
    ladeVertriebler(),
    ladeRates(),
    ladeBonusStufen(),
    ladeTargets(vertrieblerId),
  ]);
  const v = vertriebler.find((x) => x.id === vertrieblerId);
  if (!v) notFound();

  // Hole personalnummer optional
  const supabase = await createClient();
  const { data: profilExtra } = await supabase
    .from("profiles")
    .select("first_name, last_name")
    .eq("id", vertrieblerId)
    .maybeSingle();

  const personalSaetze = rates.filter(
    (r) => r.vertriebler_id === vertrieblerId,
  );
  const defaultSaetze = rates.filter(
    (r) => r.vertriebler_id === null || r.vertriebler_id === undefined,
  );
  const persoenlicheStufen = bonusStufen.filter(
    (s) => s.vertriebler_id === vertrieblerId,
  );
  const defaultStufen = bonusStufen.filter((s) => s.vertriebler_id === null);
  const heute = new Date().toISOString().slice(0, 10);

  // Aktive Default-Sätze pro Laufzeit zur Anzeige
  const aktiverDefaultProLaufzeit = new Map<
    string,
    { prozent_beitrag: number; prozent_startpaket: number; valid_from: string }
  >();
  for (const r of defaultSaetze) {
    const cur = aktiverDefaultProLaufzeit.get(r.laufzeit);
    if (!cur || r.valid_from > cur.valid_from) {
      aktiverDefaultProLaufzeit.set(r.laufzeit, {
        prozent_beitrag: r.prozent_beitrag,
        prozent_startpaket: r.prozent_startpaket,
        valid_from: r.valid_from,
      });
    }
  }

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <PageHeader
        breadcrumbs={[
          { label: "Verwaltung", href: "/admin" },
          { label: "Provisionen", href: "/admin/provisionen" },
          { label: "Sätze", href: "/admin/provisionen/saetze" },
          { label: v.full_name ?? "Vertriebler:in" },
        ]}
        eyebrow="Verkauf"
        title={
          v.full_name ??
          (`${profilExtra?.first_name ?? ""} ${profilExtra?.last_name ?? ""}`.trim() ||
            "Vertriebler:in")
        }
        description="Persönliche Provisions-Sätze + Bonus-Stufen. Persönliche Sätze gewinnen gegen den Default."
      />

      <Link
        href="/admin/provisionen/saetze"
        className="inline-flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4" />
        Zurück zur Übersicht
      </Link>

      {/* Avatar-Header */}
      <div className="flex items-center gap-4 rounded-xl border border-border bg-card px-5 py-4">
        <ColoredAvatar name={v.full_name} size="lg" />
        <div className="min-w-0 flex-1">
          <p className="text-base font-semibold">{v.full_name ?? "—"}</p>
          <p className="text-xs text-muted-foreground">
            {personalSaetze.length === 0
              ? "Verwendet Default-Sätze"
              : `${personalSaetze.length} persönliche Sätze · ${persoenlicheStufen.length} eigene Bonus-Stufen`}
          </p>
        </div>
      </div>

      {/* Default-Sätze zur Referenz */}
      <section className="rounded-xl border border-dashed border-border bg-muted/30 p-5">
        <h2 className="text-sm font-semibold tracking-tight">
          Aktive Default-Sätze (zur Referenz)
        </h2>
        <p className="mt-1 text-xs text-muted-foreground">
          Sobald hier ein persönlicher Satz angelegt ist, gewinnt er gegen
          diesen Default.
        </p>
        <ul className="mt-3 grid gap-2 sm:grid-cols-2">
          {LAUFZEIT_OPTIONS.map((opt) => {
            const def = aktiverDefaultProLaufzeit.get(opt.value);
            return (
              <li
                key={opt.value}
                className="rounded-lg bg-background px-3 py-2 text-sm"
              >
                <span className="font-medium">{opt.label}</span>
                <span className="ml-2 text-muted-foreground">
                  {def
                    ? `${def.prozent_beitrag.toLocaleString("de-DE")} % auf Beitrag · ${def.prozent_startpaket.toLocaleString("de-DE")} % auf Startpaket`
                    : "kein Default-Satz"}
                </span>
              </li>
            );
          })}
        </ul>
      </section>

      {/* Persönlicher Satz anlegen */}
      <section className="rounded-2xl border border-border bg-card p-6 sm:p-8">
        <header className="mb-5">
          <h2 className="text-base font-semibold tracking-tight">
            Persönlichen Satz anlegen
          </h2>
        </header>
        <form
          action={personalSatzAnlegen.bind(null, vertrieblerId)}
          className="grid gap-3 sm:grid-cols-[1fr_1fr_1fr_1fr_auto] sm:items-end"
        >
          <div className="space-y-1.5">
            <Label htmlFor="laufzeit">Laufzeit</Label>
            <select
              id="laufzeit"
              name="laufzeit"
              defaultValue="104"
              required
              className="h-10 w-full rounded-lg border border-border bg-background px-3 text-sm"
            >
              {LAUFZEIT_OPTIONS.map((l) => (
                <option key={l.value} value={l.value}>
                  {l.label}
                </option>
              ))}
            </select>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="prozent_beitrag">Prozent Beitrag</Label>
            <Input
              id="prozent_beitrag"
              name="prozent_beitrag"
              required
              inputMode="decimal"
              placeholder="z.B. 55"
              className="h-10 rounded-lg"
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="prozent_startpaket">Prozent Startpaket</Label>
            <Input
              id="prozent_startpaket"
              name="prozent_startpaket"
              required
              inputMode="decimal"
              placeholder="z.B. 8.10"
              className="h-10 rounded-lg"
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="valid_from">Gültig ab</Label>
            <Input
              id="valid_from"
              name="valid_from"
              type="date"
              required
              defaultValue={heute}
              className="h-10 rounded-lg"
            />
          </div>
          <Button
            type="submit"
            className="h-10 gap-2 rounded-lg bg-[hsl(var(--primary))] font-medium text-[hsl(var(--primary-foreground))] hover:bg-[hsl(var(--primary)/0.9)]"
          >
            <Plus className="h-4 w-4" />
            Anlegen
          </Button>
        </form>
      </section>

      {/* Persönliche Sätze Tabelle */}
      {personalSaetze.length > 0 && (
        <section className="overflow-hidden rounded-2xl border border-border bg-card">
          <header className="border-b border-border px-5 py-3">
            <h2 className="text-sm font-semibold tracking-tight">
              Persönliche Sätze ({personalSaetze.length})
            </h2>
          </header>
          <table className="w-full text-sm">
            <thead className="bg-muted/40">
              <tr>
                <th className="px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                  Laufzeit
                </th>
                <th className="px-4 py-3 text-right text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                  Prozent Beitrag
                </th>
                <th className="px-4 py-3 text-right text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                  Prozent Startpaket
                </th>
                <th className="px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                  Gültig ab
                </th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {personalSaetze.map((r) => (
                <tr key={r.id}>
                  <td className="px-4 py-3 font-medium">
                    {laufzeitLabel(r.laufzeit)}
                  </td>
                  <td className="px-4 py-3 text-right tabular-nums">
                    {r.prozent_beitrag.toLocaleString("de-DE", {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    })}{" "}
                    %
                  </td>
                  <td className="px-4 py-3 text-right tabular-nums">
                    {r.prozent_startpaket.toLocaleString("de-DE", {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    })}{" "}
                    %
                  </td>
                  <td className="px-4 py-3 text-xs text-muted-foreground">
                    {formatDatum(r.valid_from)}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <LoeschenButton
                      action={personalSatzLoeschen.bind(
                        null,
                        r.id,
                        vertrieblerId,
                      )}
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>
      )}

      {/* Persönliche Bonus-Stufen */}
      <section className="rounded-2xl border border-border bg-card p-6 sm:p-8">
        <header className="mb-5">
          <h2 className="text-base font-semibold tracking-tight">
            <Sparkles className="mr-2 inline h-4 w-4 text-[hsl(var(--brand-pink))]" />
            Persönliche Bonus-Stufen
          </h2>
          <p className="mt-1 text-xs text-muted-foreground">
            Zusätzlich zu den Default-Stufen ({defaultStufen.length} aktiv).
            Persönliche Stufen gewinnen, wenn beide passen.
          </p>
        </header>
        <form
          action={bonusStufeAnlegen}
          className="grid gap-3 sm:grid-cols-[1fr_1fr_1fr_auto] sm:items-end"
        >
          <input type="hidden" name="vertriebler_id" value={vertrieblerId} />
          <div className="space-y-1.5">
            <Label htmlFor="ab_abschluessen">Ab Abschlüssen</Label>
            <Input
              id="ab_abschluessen"
              name="ab_abschluessen"
              required
              inputMode="numeric"
              placeholder="z.B. 8"
              className="h-10 rounded-lg"
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="bonus_prozent">Bonus-Prozent</Label>
            <Input
              id="bonus_prozent"
              name="bonus_prozent"
              required
              inputMode="decimal"
              placeholder="z.B. 7"
              className="h-10 rounded-lg"
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="valid_from_bs">Gültig ab</Label>
            <Input
              id="valid_from_bs"
              name="valid_from"
              type="date"
              required
              defaultValue={heute}
              className="h-10 rounded-lg"
            />
          </div>
          <Button
            type="submit"
            className="h-10 gap-2 rounded-lg bg-[hsl(var(--primary))] font-medium text-[hsl(var(--primary-foreground))] hover:bg-[hsl(var(--primary)/0.9)]"
          >
            <Plus className="h-4 w-4" />
            Stufe anlegen
          </Button>
        </form>

        {persoenlicheStufen.length > 0 && (
          <ul className="mt-5 divide-y divide-border rounded-xl border border-border">
            {persoenlicheStufen.map((s) => (
              <li
                key={s.id}
                className="flex items-center justify-between gap-3 px-4 py-2 text-sm"
              >
                <span>
                  Ab <strong>{s.ab_abschluessen}</strong> Abschlüssen ·{" "}
                  <span className="font-bold text-[hsl(var(--brand-pink))]">
                    +
                    {s.bonus_prozent.toLocaleString("de-DE", {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    })}{" "}
                    %
                  </span>{" "}
                  <span className="text-xs text-muted-foreground">
                    · gültig ab {formatDatum(s.valid_from)}
                  </span>
                </span>
                <form action={bonusStufeLoeschen.bind(null, s.id)}>
                  <button
                    type="submit"
                    className="text-xs text-muted-foreground transition-colors hover:text-destructive"
                    aria-label="Bonus-Stufe entfernen"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </form>
              </li>
            ))}
          </ul>
        )}
      </section>

      {/* Monatsziele */}
      <section className="rounded-2xl border border-border bg-card p-6 sm:p-8">
        <header className="mb-5">
          <h2 className="text-base font-semibold tracking-tight">
            <TargetIcon className="mr-2 inline h-4 w-4 text-[hsl(var(--brand-pink))]" />
            Monatsziele
          </h2>
          <p className="mt-1 text-xs text-muted-foreground">
            Optional. Wenn gesetzt, sieht der/die Vertriebler:in im
            Dashboard einen Progress-Bar (Ist gegen Ziel).
          </p>
        </header>
        <form
          action={targetSetzen.bind(null, vertrieblerId)}
          className="grid gap-3 sm:grid-cols-[1fr_1fr_1fr_auto] sm:items-end"
        >
          <div className="space-y-1.5">
            <Label htmlFor="monat_yyyymm">Monat</Label>
            <Input
              id="monat_yyyymm"
              name="monat_yyyymm"
              type="month"
              required
              defaultValue={aktuellerMonat()}
              className="h-10 rounded-lg"
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="ziel_abschluesse">Ziel: Abschlüsse</Label>
            <Input
              id="ziel_abschluesse"
              name="ziel_abschluesse"
              inputMode="numeric"
              placeholder="z.B. 15"
              className="h-10 rounded-lg"
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="ziel_provision">Ziel: Provision (€)</Label>
            <Input
              id="ziel_provision"
              name="ziel_provision"
              inputMode="decimal"
              placeholder="z.B. 2500"
              className="h-10 rounded-lg"
            />
          </div>
          <Button
            type="submit"
            className="h-10 gap-2 rounded-lg bg-[hsl(var(--primary))] font-medium text-[hsl(var(--primary-foreground))] hover:bg-[hsl(var(--primary)/0.9)]"
          >
            <Plus className="h-4 w-4" />
            Speichern
          </Button>
        </form>

        {targets.length > 0 && (
          <ul className="mt-5 divide-y divide-border rounded-xl border border-border">
            {targets.map((t) => (
              <li
                key={t.id}
                className="flex items-center justify-between gap-3 px-4 py-2 text-sm"
              >
                <span>
                  <strong>{monatsLabel(t.monat_yyyymm)}</strong>{" "}
                  <span className="text-muted-foreground">·</span>{" "}
                  {t.ziel_abschluesse !== null && (
                    <span>
                      {t.ziel_abschluesse} Abschlüsse
                    </span>
                  )}
                  {t.ziel_abschluesse !== null && t.ziel_provision !== null && (
                    <span className="text-muted-foreground"> · </span>
                  )}
                  {t.ziel_provision !== null && (
                    <span>{formatEuro(t.ziel_provision)}</span>
                  )}
                </span>
                <form action={targetLoeschen.bind(null, t.id, vertrieblerId)}>
                  <button
                    type="submit"
                    className="text-xs text-muted-foreground transition-colors hover:text-destructive"
                    aria-label="Ziel entfernen"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </form>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
