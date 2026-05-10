/**
 * Aggregator-Loader für das Putzprotokoll-Auswertungs-Bundle.
 * Pattern lehnt sich an lib/quiz_stats.ts an: Server-async-Funktion
 * laedt rohe Daten aus DB + cleaning_protocols.sections-jsonb,
 * map/reduce zu mehreren Aggregaten, gibt typisiertes Bundle zurueck.
 */
import { createClient } from "@/lib/supabase/server";
import { istNextJsControlFlow } from "@/lib/admin/safe-loader";

import type { ProtocolSectionEntry } from "@/lib/putzprotokoll-types";

export type BereichCompliance = {
  /** Section-Titel (Original aus Template, Snapshot aus Protokoll) */
  titel: string;
  /** Total Aufgaben-Eintraege uber alle Tage im Range (= Sum von tasks_total) */
  total: number;
  /** Davon erledigt */
  erledigt: number;
  /** quote = erledigt / total in [0..1], -1 wenn total=0 */
  quote: number;
};

export type TopVergessen = {
  aufgabe: string;
  bereich: string;
  /** Wie oft war die Aufgabe NICHT abgehakt (= Anzahl Tage wo sie auf
   *  der Liste war aber nicht erledigt) */
  anzahl: number;
};

export type TagesPunkt = {
  /** YYYY-MM-DD */
  datum: string;
  /** Aufgaben-Quote des Tages in [0..1], null wenn kein Protokoll */
  quote: number | null;
  protokollVorhanden: boolean;
};

export type AuswertungBundle = {
  /** Anzahl der Tage mit eingereichtem Protokoll im Range */
  protokolleAnzahl: number;
  /** Anzahl der Tage im Range insgesamt (range-bisDatum + 1) */
  tageImRange: number;
  /** = protokolleAnzahl / tageImRange in [0..1] */
  abdeckungQuote: number;
  /** Durchschnittliche Aufgaben-Quote ueber alle eingereichten Protokolle */
  aufgabenQuote: number;
  /** Total der Maengel-Eintraege (text != "" pro Section) im Range */
  maengelTotal: number;
  /** Total der Photos im Range */
  photosTotal: number;
  bereicheCompliance: BereichCompliance[];
  topVergessen: TopVergessen[];
  tagesverlauf: TagesPunkt[];
  /** Map<YYYY-MM-DD, count> fuer AktivitaetsHeatmap */
  maengelHeatmap: Record<string, number>;
};

/** ISO-Date-Helper (UTC, deterministisch) */
function isoDate(d: Date): string {
  const yyyy = d.getUTCFullYear();
  const mm = String(d.getUTCMonth() + 1).padStart(2, "0");
  const dd = String(d.getUTCDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
}

function tagesDifferenz(vonISO: string, bisISO: string): number {
  const von = new Date(`${vonISO}T00:00:00Z`).getTime();
  const bis = new Date(`${bisISO}T00:00:00Z`).getTime();
  return Math.max(0, Math.round((bis - von) / (24 * 60 * 60 * 1000))) + 1;
}

/**
 * Hauptloader: alle Aggregate für den Zeitraum + Standort in einem
 * Bundle. Liest cleaning_protocols + cleaning_protocol_sections
 * (für aktuelle Aufgaben-Listen pro Bereich) + leitet ab.
 */
export async function auswertungZeitraum(opts: {
  locationId: string | null;
  vonDatum: string; // YYYY-MM-DD
  bisDatum: string; // YYYY-MM-DD (inklusiv)
}): Promise<AuswertungBundle> {
  const empty: AuswertungBundle = {
    protokolleAnzahl: 0,
    tageImRange: tagesDifferenz(opts.vonDatum, opts.bisDatum),
    abdeckungQuote: 0,
    aufgabenQuote: 0,
    maengelTotal: 0,
    photosTotal: 0,
    bereicheCompliance: [],
    topVergessen: [],
    tagesverlauf: [],
    maengelHeatmap: {},
  };

  if (!opts.locationId) return empty;

  const supabase = await createClient();
  try {
    const { data: rohe, error } = await supabase
      .from("cleaning_protocols")
      .select("datum, sections")
      .eq("location_id", opts.locationId)
      .gte("datum", opts.vonDatum)
      .lte("datum", opts.bisDatum)
      .order("datum", { ascending: true });

    if (error || !rohe) return empty;

    type Roh = { datum: string; sections: ProtocolSectionEntry[] | null };
    const protokolle = rohe as unknown as Roh[];

    // Tagesverlauf-Map: alle Tage im Range mit null-Default
    const tagesMap = new Map<string, TagesPunkt>();
    const startD = new Date(`${opts.vonDatum}T00:00:00Z`);
    const endD = new Date(`${opts.bisDatum}T00:00:00Z`);
    const cur = new Date(startD);
    while (cur <= endD) {
      const iso = isoDate(cur);
      tagesMap.set(iso, {
        datum: iso,
        quote: null,
        protokollVorhanden: false,
      });
      cur.setUTCDate(cur.getUTCDate() + 1);
    }

    // Aggregat-Strukturen
    let maengelTotal = 0;
    let photosTotal = 0;
    const maengelHeatmap: Record<string, number> = {};

    // bereichSums: Map<titel, {total, erledigt}>
    const bereichSums = new Map<string, { total: number; erledigt: number }>();
    // forgottenCounts: Map<`${titel}::${aufgabe}`, count>
    const forgottenCounts = new Map<string, number>();

    for (const p of protokolle) {
      const sections = Array.isArray(p.sections) ? p.sections : [];

      // Tagesweise Quote
      let dayDone = 0;

      for (const s of sections) {
        // Wir brauchen die Original-Aufgaben-Liste für "total".
        // Snapshot aus dem Protokoll-Eintrag enthält nur tasks_done.
        // Workaround: total = Anzahl der Aufgaben die wir ableiten
        // koennen — wir vereinen tasks_done + Aufgaben aus AKTUELLEM
        // Template (siehe unten). Wenn das nicht klappt (Section
        // im Template gelöscht), faellt total auf tasks_done.length.
        // Für V1 nehmen wir den Snapshot-Done-Count in tasks_done
        // und annehmen, dass die Aufgabenzahl pro Section konstant
        // ist via Template-Snapshot, den wir unten gleich laden.
        const erledigt = (s.tasks_done ?? []).length;
        dayDone += erledigt;
        // Bereich-Sums vorlaeufig nur für "erledigt" — total kommt
        // unten aus aktuellem Template (Heuristik).
        const cur = bereichSums.get(s.titel) ?? { total: 0, erledigt: 0 };
        cur.erledigt += erledigt;
        bereichSums.set(s.titel, cur);

        // Mängel zählen
        if ((s.maengel ?? "").trim().length > 0) {
          maengelTotal += 1;
          maengelHeatmap[p.datum] = (maengelHeatmap[p.datum] ?? 0) + 1;
        }
        // Photos
        photosTotal += (s.photo_paths ?? []).length;

      }

      // Tages-Eintrag setzen (vorlaeufig nur done — total kommt unten)
      const eintrag = tagesMap.get(p.datum);
      if (eintrag) {
        eintrag.protokollVorhanden = true;
        // quote wird unten gesetzt sobald total bekannt
        eintrag.quote = dayDone === 0 ? 0 : 1; // Placeholder
        // Wir merken dayDone für den 2. Pass via Closure
        (eintrag as TagesPunkt & { _done?: number; _sections?: ProtocolSectionEntry[] })._done = dayDone;
        (eintrag as TagesPunkt & { _done?: number; _sections?: ProtocolSectionEntry[] })._sections = sections;
      }

    }

    // 2. Pass: aktuelles Template laden, total/forgottenCounts berechnen
    const { data: tplRows } = await supabase
      .from("cleaning_protocol_templates")
      .select("id")
      .eq("location_id", opts.locationId)
      .maybeSingle();
    const templateAufgaben: Map<string, string[]> = new Map(); // titel → aufgaben
    if (tplRows?.id) {
      const { data: secs } = await supabase
        .from("cleaning_protocol_sections")
        .select("titel, aufgaben")
        .eq("template_id", tplRows.id);
      for (const s of (secs ?? []) as { titel: string; aufgaben: string[] }[]) {
        templateAufgaben.set(
          s.titel,
          Array.isArray(s.aufgaben) ? s.aufgaben : [],
        );
      }
    }

    // bereichSums.total nachtragen (= Anzahl Aufgaben in Template ×
    // Anzahl Tage im Range mit Protokoll)
    for (const [titel, sums] of bereichSums) {
      const tplAufg = templateAufgaben.get(titel) ?? [];
      // Anzahl Tage mit Protokoll, die DIESE Section enthielten:
      let tageMitSection = 0;
      for (const p of protokolle) {
        const has = (p.sections ?? []).some((s) => s.titel === titel);
        if (has) tageMitSection += 1;
      }
      sums.total = tplAufg.length * tageMitSection;
    }

    // Tagesverlauf-Quote korrigieren (jetzt mit total)
    let summeQuote = 0;
    let countQuote = 0;
    for (const p of protokolle) {
      const eintrag = tagesMap.get(p.datum);
      if (!eintrag) continue;
      const sections = Array.isArray(p.sections) ? p.sections : [];
      // Total: Sum über alle Sections der tplAufgaben.length
      let total = 0;
      let done = 0;
      for (const s of sections) {
        const tplAufg = templateAufgaben.get(s.titel) ?? [];
        total += tplAufg.length || (s.tasks_done?.length ?? 0);
        done += (s.tasks_done ?? []).length;

        // Top-Vergessen: die Aufgaben aus dem Template, die NICHT
        // in tasks_done sind
        const doneSet = new Set(s.tasks_done ?? []);
        for (const a of tplAufg) {
          if (!doneSet.has(a)) {
            const key = `${s.titel}::${a}`;
            forgottenCounts.set(key, (forgottenCounts.get(key) ?? 0) + 1);
          }
        }
      }
      const q = total > 0 ? done / total : 0;
      eintrag.quote = q;
      summeQuote += q;
      countQuote += 1;
    }
    const aufgabenQuote = countQuote > 0 ? summeQuote / countQuote : 0;

    // bereiche-Compliance Liste
    const bereicheCompliance: BereichCompliance[] = [];
    for (const [titel, sums] of bereichSums) {
      bereicheCompliance.push({
        titel,
        total: sums.total,
        erledigt: sums.erledigt,
        quote: sums.total > 0 ? sums.erledigt / sums.total : -1,
      });
    }
    bereicheCompliance.sort((a, b) => b.total - a.total);

    // Top-vergessen
    const topVergessen: TopVergessen[] = [];
    for (const [key, count] of forgottenCounts) {
      const [bereich, aufgabe] = key.split("::", 2);
      topVergessen.push({ bereich, aufgabe, anzahl: count });
    }
    topVergessen.sort((a, b) => b.anzahl - a.anzahl);

    const tagesverlauf = Array.from(tagesMap.values()).sort((a, b) =>
      a.datum.localeCompare(b.datum),
    );

    return {
      protokolleAnzahl: protokolle.length,
      tageImRange: tagesMap.size,
      abdeckungQuote:
        tagesMap.size > 0 ? protokolle.length / tagesMap.size : 0,
      aufgabenQuote,
      maengelTotal,
      photosTotal,
      bereicheCompliance,
      topVergessen: topVergessen.slice(0, 10),
      tagesverlauf,
      maengelHeatmap,
    };
  } catch (e) {
    if (istNextJsControlFlow(e)) throw e;
    console.error("[auswertungZeitraum]", e);
    return empty;
  }
}

/**
 * Hilfs-Funktion: Schnell-Filter-Range zu (von, bis) konvertieren.
 * Wird in der Auswertungs-Page genutzt um URL-Param zu Werten zu
 * mappen.
 */
export type RangeKey = "week" | "30days" | "90days" | "year" | "custom";

export function rangeAusKey(
  key: RangeKey,
  custom?: { von?: string; bis?: string },
): { vonDatum: string; bisDatum: string } {
  const heute = new Date();
  heute.setUTCHours(0, 0, 0, 0);
  const bisDatum = isoDate(heute);

  if (key === "custom" && custom?.von && custom?.bis) {
    return { vonDatum: custom.von, bisDatum: custom.bis };
  }

  let tage = 30;
  if (key === "week") tage = 7;
  else if (key === "30days") tage = 30;
  else if (key === "90days") tage = 90;
  else if (key === "year") tage = 365;

  const von = new Date(heute);
  von.setUTCDate(von.getUTCDate() - (tage - 1));
  return { vonDatum: isoDate(von), bisDatum };
}
