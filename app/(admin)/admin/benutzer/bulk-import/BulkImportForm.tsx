"use client";

import Link from "next/link";
import { useState, useTransition } from "react";
import { CheckCircle2, FileText, Upload, XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  buildBulkRows,
  parseCsv,
  type BulkRow,
} from "@/lib/admin/csv_import";
import {
  bulkImportieren,
  type BulkErgebnis,
} from "./actions";

type Lernpfad = { id: string; title: string };

export function BulkImportForm({ lernpfade }: { lernpfade: Lernpfad[] }) {
  const [rows, setRows] = useState<BulkRow[]>([]);
  const [ergebnisse, setErgebnisse] = useState<BulkErgebnis[]>([]);
  const [pending, startTransition] = useTransition();

  const valide = rows.filter((r) => r.fehler.length === 0);
  const ungueltig = rows.length - valide.length;

  function handleFile(file: File) {
    const reader = new FileReader();
    reader.onload = (e) => {
      const text = String(e.target?.result ?? "");
      const parsed = parseCsv(text);
      const built = buildBulkRows(parsed, lernpfade);
      setRows(built);
      setErgebnisse([]);
    };
    reader.readAsText(file);
  }

  function handleImport() {
    if (valide.length === 0) return;
    startTransition(async () => {
      const result = await bulkImportieren(
        valide.map((r) => ({
          zeile: r.zeile,
          vorname: r.vorname,
          nachname: r.nachname,
          email: r.email,
          rolle: r.rolle,
          lernpfade: r.lernpfade,
        })),
      );
      setErgebnisse(result.ergebnisse);
    });
  }

  if (ergebnisse.length > 0) {
    const ok = ergebnisse.filter((e) => e.ok).length;
    const fail = ergebnisse.length - ok;
    return (
      <section className="rounded-2xl border border-border bg-card p-6">
        <div className="flex flex-wrap items-baseline gap-3">
          <h2 className="text-lg font-semibold tracking-tight">
            Import abgeschlossen
          </h2>
          <span className="rounded-full bg-[hsl(var(--success)/0.15)] px-3 py-1 text-xs font-bold text-[hsl(var(--success))]">
            {ok} erfolgreich
          </span>
          {fail > 0 && (
            <span className="rounded-full bg-destructive/10 px-3 py-1 text-xs font-bold text-destructive">
              {fail} fehlgeschlagen
            </span>
          )}
        </div>
        <ul className="mt-4 divide-y divide-border">
          {ergebnisse.map((e) => (
            <li
              key={e.zeile}
              className="flex items-start gap-3 py-2.5 text-sm"
            >
              <span
                className={
                  e.ok
                    ? "mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[hsl(var(--success)/0.15)] text-[hsl(var(--success))]"
                    : "mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-destructive/10 text-destructive"
                }
              >
                {e.ok ? (
                  <CheckCircle2 className="h-3.5 w-3.5" />
                ) : (
                  <XCircle className="h-3.5 w-3.5" />
                )}
              </span>
              <div className="min-w-0 flex-1">
                <p className="font-medium">{e.email}</p>
                {e.message && (
                  <p className="mt-0.5 text-xs text-destructive">{e.message}</p>
                )}
              </div>
              <span className="text-xs text-muted-foreground">Zeile {e.zeile}</span>
            </li>
          ))}
        </ul>
        <div className="mt-6 flex gap-2">
          <Button
            type="button"
            variant="outline"
            onClick={() => {
              setRows([]);
              setErgebnisse([]);
            }}
          >
            Weitere CSV importieren
          </Button>
          <Button asChild>
            <Link href="/admin/benutzer">Zur Benutzerliste</Link>
          </Button>
        </div>
      </section>
    );
  }

  return (
    <section className="space-y-4">
      <div className="rounded-2xl border-2 border-dashed border-border bg-card p-8">
        <label
          htmlFor="csv"
          className="flex cursor-pointer flex-col items-center gap-3 text-center"
        >
          <span className="flex h-12 w-12 items-center justify-center rounded-full bg-[hsl(var(--brand-pink)/0.12)] text-[hsl(var(--brand-pink))]">
            <Upload className="h-5 w-5" />
          </span>
          <span className="text-sm font-medium">
            CSV-Datei auswählen oder hier ablegen
          </span>
          <span className="text-xs text-muted-foreground">
            UTF-8, Komma- oder Semikolon-getrennt
          </span>
        </label>
        <input
          id="csv"
          type="file"
          accept=".csv,text/csv"
          className="sr-only"
          onChange={(e) => {
            const f = e.target.files?.[0];
            if (f) handleFile(f);
          }}
        />
      </div>

      {rows.length > 0 && (
        <div className="rounded-2xl border border-border bg-card">
          <div className="flex flex-wrap items-baseline justify-between gap-3 border-b border-border px-5 py-4">
            <div className="flex items-baseline gap-3">
              <h2 className="text-lg font-semibold tracking-tight">Vorschau</h2>
              <span className="text-sm text-muted-foreground">
                {valide.length} valide
                {ungueltig > 0 && ` · ${ungueltig} fehlerhaft`}
              </span>
            </div>
            <Button
              type="button"
              onClick={handleImport}
              disabled={pending || valide.length === 0}
            >
              <FileText className="h-4 w-4" />
              {pending
                ? "Importiert …"
                : `${valide.length} Mitarbeiter anlegen`}
            </Button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-muted/40 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                <tr>
                  <th className="px-3 py-2 text-left">Zeile</th>
                  <th className="px-3 py-2 text-left">Name</th>
                  <th className="px-3 py-2 text-left">E-Mail</th>
                  <th className="px-3 py-2 text-left">Rolle</th>
                  <th className="px-3 py-2 text-left">Lernpfade</th>
                  <th className="px-3 py-2 text-left">Status</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((r) => (
                  <tr
                    key={r.zeile}
                    className={`border-t border-border ${
                      r.fehler.length > 0 ? "bg-destructive/5" : ""
                    }`}
                  >
                    <td className="px-3 py-2 text-muted-foreground">
                      {r.zeile}
                    </td>
                    <td className="px-3 py-2">
                      {[r.vorname, r.nachname].filter(Boolean).join(" ") || "—"}
                    </td>
                    <td className="px-3 py-2">{r.email || "—"}</td>
                    <td className="px-3 py-2">{r.rolle}</td>
                    <td className="px-3 py-2 text-xs text-muted-foreground">
                      {r.lernpfade.length === 0
                        ? "—"
                        : `${r.lernpfade.length}`}
                    </td>
                    <td className="px-3 py-2 text-xs">
                      {r.fehler.length === 0 ? (
                        <span className="inline-flex items-center gap-1 text-[hsl(var(--success))]">
                          <CheckCircle2 className="h-3.5 w-3.5" />
                          OK
                        </span>
                      ) : (
                        <span className="text-destructive">
                          {r.fehler.join("; ")}
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </section>
  );
}
