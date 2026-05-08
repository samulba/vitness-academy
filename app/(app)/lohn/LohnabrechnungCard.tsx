import Link from "next/link";
import { Download, FileText, Inbox } from "lucide-react";
import {
  formatEuro,
  monatLabel,
  type Lohnabrechnung,
} from "@/lib/lohn-types";
import { lohnabrechnungSignedUrl } from "@/lib/lohn";
import { formatDatumUhrzeitBerlin } from "@/lib/format";

/**
 * Anzeige der Lohnabrechnung fuer den aktuellen Monat. Wenn vorhanden:
 * Card mit Download-Link (Signed-URL aus Storage) + Brutto/Netto-Box.
 * Wenn nicht: dezenter Empty-State.
 */
export async function LohnabrechnungCard({
  lohn,
  monat,
}: {
  lohn: Lohnabrechnung | null;
  monat: string;
}) {
  if (!lohn) {
    return (
      <div className="flex items-start gap-3 rounded-2xl border border-dashed border-border bg-card p-5">
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-muted text-muted-foreground">
          <Inbox className="h-5 w-5" />
        </span>
        <div>
          <p className="text-sm font-semibold">
            Noch nicht hochgeladen
          </p>
          <p className="mt-0.5 text-xs text-muted-foreground">
            Sobald die Studioleitung die Abrechnung für{" "}
            {monatLabel(monat)} hochlädt, erscheint sie hier.
          </p>
        </div>
      </div>
    );
  }

  const url = await lohnabrechnungSignedUrl(lohn.pdf_path);

  return (
    <div className="rounded-2xl border border-border bg-card p-5">
      <div className="flex items-start gap-4">
        <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-[hsl(var(--primary)/0.12)] text-[hsl(var(--primary))]">
          <FileText className="h-6 w-6" />
        </span>
        <div className="min-w-0 flex-1">
          <p className="text-sm font-semibold">
            Lohnabrechnung {monatLabel(lohn.monat)}
          </p>
          <p className="mt-0.5 text-xs text-muted-foreground">
            Hochgeladen von{" "}
            <span className="font-medium text-foreground">
              {lohn.hochgeladen_von_name ?? "Studioleitung"}
            </span>{" "}
            am {formatDatumUhrzeitBerlin(lohn.hochgeladen_am)}
          </p>
        </div>
        {url && (
          <Link
            href={url}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex shrink-0 items-center gap-1.5 rounded-lg bg-[hsl(var(--primary))] px-3 py-2 text-sm font-semibold text-[hsl(var(--primary-foreground))] shadow-[0_4px_14px_-4px_hsl(var(--primary)/0.5)] transition-all hover:bg-[hsl(var(--primary)/0.9)]"
          >
            <Download className="h-4 w-4" />
            PDF
          </Link>
        )}
      </div>

      {(lohn.brutto_cents !== null || lohn.netto_cents !== null) && (
        <div className="mt-4 grid grid-cols-2 gap-3 border-t border-border pt-4">
          {lohn.brutto_cents !== null && (
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                Brutto
              </p>
              <p className="mt-0.5 text-lg font-bold tabular-nums">
                {formatEuro(lohn.brutto_cents)}
              </p>
            </div>
          )}
          {lohn.netto_cents !== null && (
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                Netto
              </p>
              <p className="mt-0.5 text-lg font-bold tabular-nums text-[hsl(var(--success))]">
                {formatEuro(lohn.netto_cents)}
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
