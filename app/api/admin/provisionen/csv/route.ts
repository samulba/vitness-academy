import { NextResponse } from "next/server";
import { requirePermission } from "@/lib/auth";
import {
  ladeEntries,
  laufzeitLabel,
} from "@/lib/provisionen";

function csvEscape(v: string | number | null | undefined): string {
  if (v === null || v === undefined) return "";
  const s = String(v);
  if (/[",;\n]/.test(s)) return `"${s.replace(/"/g, '""')}"`;
  return s;
}

function fmtNum(n: number): string {
  return n.toFixed(2).replace(".", ",");
}

export async function GET(request: Request) {
  await requirePermission("provisionen", "view");

  const url = new URL(request.url);
  const monat = url.searchParams.get("monat") ?? undefined;
  const monatSafe =
    monat && /^\d{4}-\d{2}$/.test(monat) ? monat : undefined;

  const entries = await ladeEntries({
    monatYYYYMM: monatSafe,
    limit: 5000,
  });

  const header = [
    "Datum",
    "Vertriebler",
    "Mitglied",
    "Mitgliedsnummer",
    "Laufzeit",
    "Beitrag 14-taegig",
    "Beitrag Netto",
    "Startpaket",
    "Getraenke + Soli",
    "Provision",
    "Bemerkung",
  ];
  const rows = entries.map((e) =>
    [
      e.datum,
      e.vertriebler_name ?? "",
      e.mitglied_name,
      e.mitglied_nummer ?? "",
      laufzeitLabel(e.laufzeit),
      fmtNum(e.beitrag_14taegig),
      fmtNum(e.beitrag_netto),
      fmtNum(e.startpaket),
      fmtNum(e.getraenke_soli),
      fmtNum(e.provision),
      e.bemerkung ?? "",
    ].map(csvEscape).join(";"),
  );

  // BOM für Excel-UTF8-Erkennung
  const csv = "﻿" + [header.join(";"), ...rows].join("\r\n");
  const filename = `provisionen-${monatSafe ?? "alle"}.csv`;

  return new NextResponse(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="${filename}"`,
    },
  });
}
