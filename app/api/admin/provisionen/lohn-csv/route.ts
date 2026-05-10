import { NextResponse } from "next/server";
import { requirePermission } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { ladePayouts } from "@/lib/provisionen";

function csvEscape(v: string | number | null | undefined): string {
  if (v === null || v === undefined) return "";
  const s = String(v);
  if (/[",;\n]/.test(s)) return `"${s.replace(/"/g, '""')}"`;
  return s;
}

function fmtNum(n: number): string {
  return n.toFixed(2).replace(".", ",");
}

/**
 * Lohn-CSV: eine Zeile pro Vertriebler:in für einen Monat. Format
 * ist auf Lohnbuchhaltung optimiert (Personalnummer + Total +
 * Auszahlungs-Status). Anders als der normale Provisionen-CSV, der
 * eine Zeile pro Eintrag liefert.
 */
export async function GET(request: Request) {
  await requirePermission("provisionen", "view");

  const url = new URL(request.url);
  const monat = url.searchParams.get("monat");
  if (!monat || !/^\d{4}-\d{2}$/.test(monat)) {
    return new NextResponse("monat-Parameter fehlt oder ist ungültig", {
      status: 400,
    });
  }

  const payouts = await ladePayouts({ monatYYYYMM: monat });

  // Personalnummern in einem Schwung laden (best-effort: Migration 0042
  // muss eingespielt sein; sonst leer)
  const supabase = await createClient();
  const ids = Array.from(new Set(payouts.map((p) => p.vertriebler_id)));
  const personalnummerById = new Map<string, string | null>();
  if (ids.length > 0) {
    const { data, error } = await supabase
      .from("profiles")
      .select("id, personalnummer")
      .in("id", ids);
    if (!error && data) {
      for (const r of data as { id: string; personalnummer: string | null }[]) {
        personalnummerById.set(r.id, r.personalnummer);
      }
    }
  }

  const header = [
    "Personalnummer",
    "Vertriebler",
    "Monat",
    "Abschluesse",
    "Provision",
    "Bonus",
    "Total",
    "Status",
    "Ausgezahlt am",
    "Methode",
    "Notiz",
  ];
  const rows = payouts.map((p) =>
    [
      personalnummerById.get(p.vertriebler_id) ?? "",
      p.vertriebler_name ?? "",
      p.monat_yyyymm,
      String(p.abschluesse_anzahl),
      fmtNum(p.provision_summe),
      fmtNum(p.bonus_summe),
      fmtNum(p.total),
      p.status,
      p.ausgezahlt_am ?? "",
      p.ausgezahlt_via ?? "",
      p.ausgezahlt_note ?? "",
    ]
      .map(csvEscape)
      .join(";"),
  );

  // BOM für Excel-UTF8-Erkennung
  const csv = "﻿" + [header.join(";"), ...rows].join("\r\n");
  const filename = `lohn-provisionen-${monat}.csv`;

  return new NextResponse(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="${filename}"`,
    },
  });
}
