import { Plus } from "lucide-react";
import { PageHeader } from "@/components/ui/page-header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { requireRole } from "@/lib/auth";
import {
  LAUFZEIT_OPTIONS,
  ladeRates,
  laufzeitLabel,
} from "@/lib/provisionen";
import { formatDatum } from "@/lib/format";
import { satzAnlegen, satzLoeschen } from "./actions";
import { LoeschenButton } from "./LoeschenButton";

export default async function ProvisionsSaetzePage() {
  await requireRole(["admin", "superadmin"]);
  const rates = await ladeRates();
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
        description="Versioniert: neue Sätze gelten ab valid_from. Alte Eintraege werden mit den damals gueltigen Saetzen berechnet — historische Provisionen bleiben unveraendert."
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
            Aktuelle + historische Sätze
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
    </div>
  );
}
