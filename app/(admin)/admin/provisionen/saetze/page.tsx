import Link from "next/link";
import { ArrowRight, Plus, Sparkles, Trash2, User } from "lucide-react";
import { PageHeader } from "@/components/ui/page-header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ColoredAvatar } from "@/components/admin/ColoredAvatar";
import { StatusPill } from "@/components/admin/StatusPill";
import { requirePermission } from "@/lib/auth";
import {
  LAUFZEIT_OPTIONS,
  ladeBonusStufen,
  ladeRates,
  ladeVertriebler,
  laufzeitLabel,
} from "@/lib/provisionen";
import { formatDatum } from "@/lib/format";
import {
  bonusStufeAnlegen,
  bonusStufeLoeschen,
  satzAnlegen,
  satzLoeschen,
} from "./actions";
import { LoeschenButton } from "./LoeschenButton";

export default async function ProvisionsSaetzePage() {
  await requirePermission("provisionen", "view");
  const [allRates, vertriebler, bonusStufen] = await Promise.all([
    ladeRates(),
    ladeVertriebler(),
    ladeBonusStufen(),
  ]);
  // Default-Sätze: vertriebler_id null
  const rates = allRates.filter(
    (r) => r.vertriebler_id === null || r.vertriebler_id === undefined,
  );
  // Pro-Vertriebler: zähle Anzahl persönlicher Sätze
  const personalProVertriebler = new Map<string, number>();
  for (const r of allRates) {
    if (r.vertriebler_id) {
      personalProVertriebler.set(
        r.vertriebler_id,
        (personalProVertriebler.get(r.vertriebler_id) ?? 0) + 1,
      );
    }
  }
  const defaultBonusStufen = bonusStufen.filter(
    (s) => s.vertriebler_id === null,
  );
  const heute = new Date().toISOString().slice(0, 10);

  return (
    <div className="space-y-6">
      <PageHeader
        breadcrumbs={[
          { label: "Verwaltung", href: "/admin" },
          { label: "Provisionen", href: "/admin/provisionen" },
          { label: "Sätze" },
        ]}
        eyebrow="Verkauf"
        title="Provisions-Sätze"
        description="Versioniert: neue Sätze gelten ab valid_from. Alte Einträge werden mit den damals gueltigen Saetzen berechnet — historische Provisionen bleiben unverändert."
      />

      <section className="rounded-2xl border border-border bg-card p-6 sm:p-8">
        <header className="mb-5">
          <h2 className="text-base font-semibold tracking-tight">
            Neuer Satz
          </h2>
          <p className="mt-1 text-xs text-muted-foreground">
            Pro Laufzeit ein Satz. „Prozent Beitrag&ldquo; wird auf Beitrag Netto
            angewendet, „Prozent Startpaket&ldquo; auf Startpaket-Wert.
          </p>
        </header>
        <form
          action={satzAnlegen}
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
              placeholder="z.B. 50"
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

      <section className="overflow-hidden rounded-2xl border border-border bg-card">
        <header className="border-b border-border px-5 py-3">
          <h2 className="text-sm font-semibold tracking-tight">
            Default-Sätze (für alle Vertriebler ohne Override)
          </h2>
        </header>
        {rates.length === 0 ? (
          <div className="px-5 py-8 text-center text-sm text-muted-foreground">
            Noch keine Sätze definiert.
          </div>
        ) : (
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
              {rates.map((r) => (
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
                      action={satzLoeschen.bind(null, r.id)}
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </section>

      {/* Pro-Vertriebler-Sätze */}
      <section className="overflow-hidden rounded-2xl border border-border bg-card">
        <header className="flex flex-wrap items-end justify-between gap-3 border-b border-border px-5 py-4">
          <div>
            <h2 className="text-sm font-semibold tracking-tight">
              Persönliche Sätze pro Vertriebler:in
            </h2>
            <p className="mt-0.5 text-xs text-muted-foreground">
              Override für einzelne Vertriebler:innen. Wenn ein persönlicher Satz
              gilt, ignoriert die App den Default für diesen Eintrag.
            </p>
          </div>
        </header>
        {vertriebler.length === 0 ? (
          <div className="px-5 py-8 text-center text-sm text-muted-foreground">
            Noch keine Vertriebler:innen mit Provisions-Berechtigung.
          </div>
        ) : (
          <ul className="divide-y divide-border">
            {vertriebler.map((v) => {
              const count = personalProVertriebler.get(v.id) ?? 0;
              return (
                <li key={v.id}>
                  <Link
                    href={`/admin/provisionen/saetze/${v.id}`}
                    className="flex items-center gap-3 px-5 py-3 transition-colors hover:bg-muted/40"
                  >
                    <ColoredAvatar name={v.full_name} size="sm" />
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium">
                        {v.full_name ?? "—"}
                      </p>
                      <p className="text-[11px] text-muted-foreground">
                        {count === 0
                          ? "Standard-Sätze"
                          : `${count} persönliche Sätze + Bonus-Stufen`}
                      </p>
                    </div>
                    {count > 0 && (
                      <StatusPill ton="primary">
                        <User className="h-3 w-3" />
                        Personalisiert
                      </StatusPill>
                    )}
                    <ArrowRight className="h-4 w-4 text-muted-foreground" />
                  </Link>
                </li>
              );
            })}
          </ul>
        )}
      </section>

      {/* Default-Bonus-Stufen */}
      <section className="rounded-2xl border border-border bg-card p-6 sm:p-8">
        <header className="mb-5">
          <h2 className="text-base font-semibold tracking-tight">
            <Sparkles className="mr-2 inline h-4 w-4 text-[hsl(var(--brand-pink))]" />
            Default-Bonus-Stufen
          </h2>
          <p className="mt-1 text-xs text-muted-foreground">
            Gilt für alle Vertriebler:innen ohne eigene Stufen. „Ab N
            Abschlüssen pro Monat zahlen wir X&nbsp;% extra auf die
            Provisions-Summe des Monats.&ldquo;
          </p>
        </header>
        <form
          action={bonusStufeAnlegen}
          className="grid gap-3 sm:grid-cols-[1fr_1fr_1fr_auto] sm:items-end"
        >
          <div className="space-y-1.5">
            <Label htmlFor="ab_abschluessen">Ab Abschlüssen</Label>
            <Input
              id="ab_abschluessen"
              name="ab_abschluessen"
              required
              inputMode="numeric"
              placeholder="z.B. 10"
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
              placeholder="z.B. 5"
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

        {defaultBonusStufen.length > 0 && (
          <ul className="mt-5 divide-y divide-border rounded-xl border border-border">
            {defaultBonusStufen.map((s) => (
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
    </div>
  );
}
