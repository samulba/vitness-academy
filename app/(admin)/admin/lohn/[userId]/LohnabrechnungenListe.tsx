"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { FileText, Trash2 } from "lucide-react";
import {
  formatEuro,
  monatLabel,
  type Lohnabrechnung,
} from "@/lib/lohn-types";
import { formatDatum } from "@/lib/format";
import { lohnabrechnungLoeschen } from "../actions";

/**
 * Liste aller bisherigen Abrechnungen mit Monat / Brutto / Netto /
 * Hochgeladen + Loesch-Button.
 */
export function LohnabrechnungenListe({
  abrechnungen,
  userId,
}: {
  abrechnungen: Lohnabrechnung[];
  userId: string;
}) {
  if (abrechnungen.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-border bg-card p-6 text-center text-sm text-muted-foreground">
        Noch keine Abrechnungen hochgeladen.
      </div>
    );
  }

  return (
    <ul className="overflow-hidden rounded-2xl border border-border bg-card">
      {abrechnungen.map((a, i) => (
        <li
          key={a.id}
          className={i > 0 ? "border-t border-border" : ""}
        >
          <div className="flex items-center gap-3 px-4 py-3 sm:gap-5 sm:px-5">
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[hsl(var(--primary)/0.12)] text-[hsl(var(--primary))]">
              <FileText className="h-4 w-4" />
            </span>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-semibold">
                {monatLabel(a.monat)}
              </p>
              <p className="truncate text-[11px] text-muted-foreground">
                Hochgeladen{" "}
                {formatDatum(a.hochgeladen_am)}
                {a.brutto_cents !== null && (
                  <>
                    {" · Brutto "}
                    {formatEuro(a.brutto_cents)}
                  </>
                )}
                {a.netto_cents !== null && (
                  <>
                    {" · Netto "}
                    <span className="font-semibold text-[hsl(var(--success))]">
                      {formatEuro(a.netto_cents)}
                    </span>
                  </>
                )}
              </p>
            </div>
            <Link
              href={`?monat=${a.monat}`}
              className="hidden rounded-lg border border-border bg-background px-3 py-1.5 text-xs font-medium transition-colors hover:bg-muted sm:inline-flex"
            >
              Bearbeiten
            </Link>
            <DeleteButton id={a.id} userId={userId} monat={a.monat} />
          </div>
        </li>
      ))}
    </ul>
  );
}

function DeleteButton({
  id,
  monat,
}: {
  id: string;
  userId: string;
  monat: string;
}) {
  const router = useRouter();
  const [pending, setPending] = useState(false);

  async function handle() {
    if (
      !confirm(
        `Lohnabrechnung ${monatLabel(monat)} wirklich löschen? PDF wird ebenfalls aus dem Speicher entfernt.`,
      )
    )
      return;
    setPending(true);
    try {
      await lohnabrechnungLoeschen(id);
      toast.success("Lohnabrechnung gelöscht");
      router.refresh();
    } catch (e) {
      // Server-Action wirft NEXT_REDIRECT — als Cleanup kein Echo
      const msg = (e as Error).message;
      if (!/NEXT_REDIRECT/.test(msg)) {
        toast.error("Fehler beim Löschen: " + msg);
      }
    } finally {
      setPending(false);
    }
  }

  return (
    <button
      type="button"
      onClick={handle}
      disabled={pending}
      aria-label="Löschen"
      className="inline-flex h-8 w-8 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-[hsl(var(--destructive)/0.08)] hover:text-[hsl(var(--destructive))] disabled:opacity-50"
    >
      <Trash2 className="h-3.5 w-3.5" />
    </button>
  );
}
