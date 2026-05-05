import { Target as TargetIcon } from "lucide-react";
import { formatEuro, type Target } from "@/lib/provisionen-types";

/**
 * Visueller Progress-Tracker für Monats-Ziele. Zeigt Provision und/oder
 * Abschluss-Anzahl je nachdem was als Ziel gesetzt ist.
 */
export function TargetTracker({
  target,
  istProvision,
  istAbschluesse,
}: {
  target: Target;
  istProvision: number;
  istAbschluesse: number;
}) {
  const provisionProzent =
    target.ziel_provision && target.ziel_provision > 0
      ? Math.min(100, (istProvision / target.ziel_provision) * 100)
      : null;
  const abschluesseProzent =
    target.ziel_abschluesse && target.ziel_abschluesse > 0
      ? Math.min(100, (istAbschluesse / target.ziel_abschluesse) * 100)
      : null;

  if (provisionProzent === null && abschluesseProzent === null) return null;

  return (
    <div className="rounded-xl border border-[hsl(var(--brand-pink)/0.4)] bg-[hsl(var(--brand-pink)/0.04)] p-5">
      <div className="mb-3 flex items-center gap-2">
        <TargetIcon className="h-4 w-4 text-[hsl(var(--brand-pink))]" />
        <h3 className="text-sm font-semibold">Mein Monats-Ziel</h3>
      </div>

      <div className="space-y-3">
        {target.ziel_provision !== null && target.ziel_provision > 0 && (
          <ZielRow
            label="Provision"
            ist={formatEuro(istProvision)}
            ziel={formatEuro(target.ziel_provision)}
            prozent={provisionProzent ?? 0}
          />
        )}
        {target.ziel_abschluesse !== null && target.ziel_abschluesse > 0 && (
          <ZielRow
            label="Abschlüsse"
            ist={String(istAbschluesse)}
            ziel={String(target.ziel_abschluesse)}
            prozent={abschluesseProzent ?? 0}
          />
        )}
      </div>

      {target.notiz && (
        <p className="mt-3 text-[11px] text-muted-foreground">{target.notiz}</p>
      )}
    </div>
  );
}

function ZielRow({
  label,
  ist,
  ziel,
  prozent,
}: {
  label: string;
  ist: string;
  ziel: string;
  prozent: number;
}) {
  const farbe =
    prozent >= 100
      ? "bg-[hsl(var(--success))]"
      : prozent >= 70
        ? "bg-[hsl(var(--brand-pink))]"
        : "bg-[hsl(var(--primary))]";
  return (
    <div>
      <div className="mb-1 flex items-baseline justify-between gap-2 text-xs">
        <span className="font-medium">{label}</span>
        <span className="tabular-nums">
          <strong>{ist}</strong>{" "}
          <span className="text-muted-foreground">/ {ziel}</span>{" "}
          <span className="text-[10px] text-muted-foreground">
            ({Math.round(prozent)} %)
          </span>
        </span>
      </div>
      <div className="h-2 overflow-hidden rounded-full bg-muted">
        <div
          className={`h-full transition-all ${farbe}`}
          style={{ width: `${Math.min(100, prozent)}%` }}
        />
      </div>
    </div>
  );
}
