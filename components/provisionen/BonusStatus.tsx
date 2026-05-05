import { Sparkles, TrendingUp } from "lucide-react";
import {
  findeBonusStufe,
  type BonusStufe,
} from "@/lib/provisionen-types";

/**
 * Zeigt aktuelle Bonus-Stufe + nächste Stufe (wenn vorhanden) für
 * einen Vertriebler im laufenden Monat.
 */
export function BonusStatus({
  abschluesseAktuell,
  monatYYYYMM,
  vertrieblerId,
  stufen,
}: {
  abschluesseAktuell: number;
  monatYYYYMM: string;
  vertrieblerId: string;
  stufen: BonusStufe[];
}) {
  const aktuelleStufe = findeBonusStufe(
    abschluesseAktuell,
    monatYYYYMM,
    stufen,
    vertrieblerId,
  );

  const monatsEnde = `${monatYYYYMM}-31`;
  const passend = stufen.filter(
    (s) =>
      s.valid_from <= monatsEnde &&
      (s.vertriebler_id === vertrieblerId || s.vertriebler_id === null),
  );
  // nächste Stufe = die mit dem nächsthöheren ab_abschluessen
  const nextStufen = passend.filter(
    (s) => s.ab_abschluessen > abschluesseAktuell,
  );
  const naechste = nextStufen.sort(
    (a, b) => a.ab_abschluessen - b.ab_abschluessen,
  )[0];

  if (!aktuelleStufe && !naechste) return null;

  return (
    <div className="space-y-2 rounded-xl border border-border bg-card p-4">
      <div className="flex items-center gap-2">
        <Sparkles className="h-4 w-4 text-[hsl(var(--brand-pink))]" />
        <h3 className="text-sm font-semibold">Bonus-Stufen</h3>
      </div>
      {aktuelleStufe ? (
        <p className="text-sm">
          <strong className="text-[hsl(var(--brand-pink))]">
            +{aktuelleStufe.bonus_prozent}&nbsp;%
          </strong>{" "}
          aktiv ab {aktuelleStufe.ab_abschluessen} Abschlüssen — du hast bereits{" "}
          <strong>{abschluesseAktuell}</strong>.
        </p>
      ) : (
        <p className="text-sm text-muted-foreground">
          Noch keine Bonus-Stufe erreicht.
        </p>
      )}
      {naechste && (
        <p className="inline-flex items-center gap-1.5 text-xs text-muted-foreground">
          <TrendingUp className="h-3 w-3" />
          Nächste Stufe: noch{" "}
          <strong className="text-foreground">
            {naechste.ab_abschluessen - abschluesseAktuell}
          </strong>{" "}
          Abschlüsse bis +{naechste.bonus_prozent}&nbsp;%
        </p>
      )}
    </div>
  );
}
