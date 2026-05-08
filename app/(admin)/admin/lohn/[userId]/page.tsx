import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { requireRole } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { ColoredAvatar } from "@/components/admin/ColoredAvatar";
import {
  ladeAlleLohnabrechnungen,
  ladeShiftsImMonat,
} from "@/lib/lohn";
import {
  aktuellerMonat,
  formatStunden,
  monatLabel,
  shiftStunden,
} from "@/lib/lohn-types";
import { formatDatum } from "@/lib/format";
import { UploadForm } from "./UploadForm";
import { LohnabrechnungenListe } from "./LohnabrechnungenListe";

export const dynamic = "force-dynamic";

export default async function MitarbeiterLohnPage({
  params,
  searchParams,
}: {
  params: Promise<{ userId: string }>;
  searchParams: Promise<{ monat?: string }>;
}) {
  await requireRole(["admin", "superadmin"]);
  const { userId } = await params;
  const sp = await searchParams;

  const supabase = await createClient();
  const { data: profile } = await supabase
    .from("profiles")
    .select("id, full_name, role, archived_at")
    .eq("id", userId)
    .maybeSingle();
  if (!profile) notFound();

  const monat =
    sp.monat && /^\d{4}-\d{2}$/.test(sp.monat) ? sp.monat : aktuellerMonat();

  const [shifts, abrechnungen] = await Promise.all([
    ladeShiftsImMonat(userId, monat),
    ladeAlleLohnabrechnungen(userId),
  ]);

  const stundenSumme = shifts.reduce((s, sh) => s + shiftStunden(sh), 0);
  const aktuelle = abrechnungen.find((a) => a.monat === monat) ?? null;

  return (
    <div className="space-y-6">
      <Link
        href="/admin/lohn"
        className="inline-flex items-center gap-1.5 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4" />
        Zurück zur Liste
      </Link>

      <header className="flex items-start gap-4 rounded-2xl border border-border bg-card p-5 sm:p-6">
        <ColoredAvatar name={profile.full_name} size="md" />
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[hsl(var(--brand-pink))]">
            Lohnabrechnungen
          </p>
          <h1 className="mt-1 text-2xl font-semibold tracking-tight sm:text-3xl">
            {profile.full_name ?? "—"}
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {abrechnungen.length} Abrechnung
            {abrechnungen.length === 1 ? "" : "en"} hochgeladen ·{" "}
            {monatLabel(monat)} aktuell
          </p>
        </div>
      </header>

      {/* Upload */}
      <section className="space-y-3">
        <div className="flex items-end justify-between gap-3">
          <h2 className="text-lg font-semibold tracking-tight">
            {aktuelle
              ? `${monatLabel(monat)} aktualisieren`
              : `${monatLabel(monat)} hochladen`}
          </h2>
          <span className="text-[11px] text-muted-foreground">
            {aktuelle
              ? "Bereits hochgeladen — Re-Upload überschreibt"
              : "Noch nicht hochgeladen"}
          </span>
        </div>
        <UploadForm
          userId={userId}
          monat={monat}
          existing={
            aktuelle
              ? {
                  brutto_cents: aktuelle.brutto_cents,
                  netto_cents: aktuelle.netto_cents,
                }
              : null
          }
        />
      </section>

      {/* Mitarbeiter-Schichten read-only */}
      <section className="space-y-3">
        <div className="flex items-end justify-between gap-3">
          <h2 className="text-lg font-semibold tracking-tight">
            Schichten {monatLabel(monat)}
          </h2>
          <span className="text-[11px] text-muted-foreground">
            {shifts.length} Schicht
            {shifts.length === 1 ? "" : "en"} · {formatStunden(stundenSumme)} gesamt
          </span>
        </div>
        {shifts.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-border bg-card p-6 text-center text-sm text-muted-foreground">
            Mitarbeiter:in hat in {monatLabel(monat)} keine Schichten eingetragen.
          </div>
        ) : (
          <div className="overflow-hidden rounded-2xl border border-border bg-card">
            <table className="w-full text-sm">
              <thead className="border-b border-border bg-muted/30 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                <tr>
                  <th className="px-4 py-2 text-left">Datum</th>
                  <th className="px-4 py-2 text-left">Von</th>
                  <th className="px-4 py-2 text-left">Bis</th>
                  <th className="px-4 py-2 text-right">Pause</th>
                  <th className="px-4 py-2 text-right">Stunden</th>
                  <th className="px-4 py-2 text-left">Notiz</th>
                </tr>
              </thead>
              <tbody>
                {shifts.map((s) => (
                  <tr key={s.id} className="border-b border-border last:border-b-0">
                    <td className="px-4 py-2 tabular-nums">
                      {formatDatum(s.datum)}
                    </td>
                    <td className="px-4 py-2 tabular-nums">
                      {s.von_zeit.slice(0, 5)}
                    </td>
                    <td className="px-4 py-2 tabular-nums">
                      {s.bis_zeit.slice(0, 5)}
                    </td>
                    <td className="px-4 py-2 text-right tabular-nums">
                      {s.pause_minuten} min
                    </td>
                    <td className="px-4 py-2 text-right font-semibold tabular-nums">
                      {formatStunden(shiftStunden(s))}
                    </td>
                    <td className="px-4 py-2 text-xs text-muted-foreground">
                      {s.notiz || "—"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {/* Bisherige Abrechnungen */}
      <section className="space-y-3">
        <h2 className="text-lg font-semibold tracking-tight">
          Bisherige Abrechnungen
        </h2>
        <LohnabrechnungenListe abrechnungen={abrechnungen} userId={userId} />
      </section>
    </div>
  );
}
