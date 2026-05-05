"use client";

import { useState, useTransition } from "react";
import { Check, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ColoredAvatar } from "@/components/admin/ColoredAvatar";
import { StatusPill } from "@/components/admin/StatusPill";
import { formatDatum } from "@/lib/format";
import {
  formatEuro,
  laufzeitLabel,
  type CommissionEntry,
} from "@/lib/provisionen-types";
import {
  abschlussAblehnen,
  abschlussGenehmigen,
} from "../actions";

export function InboxItem({ eintrag }: { eintrag: CommissionEntry }) {
  const [modus, setModus] = useState<"idle" | "ablehnen">("idle");
  const [pending, startTransition] = useTransition();
  const [note, setNote] = useState("");

  const genehmigen = () => {
    startTransition(async () => {
      const fd = new FormData();
      await abschlussGenehmigen(eintrag.id, fd);
    });
  };

  const ablehnen = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (note.trim().length < 3) return;
    startTransition(async () => {
      const fd = new FormData();
      fd.set("review_note", note);
      await abschlussAblehnen(eintrag.id, fd);
    });
  };

  return (
    <div className="overflow-hidden rounded-xl border border-border bg-card">
      <div className="border-b border-border px-5 py-4">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-center gap-3">
            <ColoredAvatar
              name={eintrag.vertriebler_name}
              size="md"
            />
            <div>
              <div className="flex items-center gap-2">
                <span className="font-semibold">
                  {eintrag.vertriebler_name ?? "Unbekannt"}
                </span>
                <StatusPill ton="warn" dot>
                  Eingereicht
                </StatusPill>
              </div>
              <p className="mt-0.5 text-xs text-muted-foreground">
                {formatDatum(eintrag.created_at)} · Eintrag für{" "}
                {formatDatum(eintrag.datum)}
              </p>
            </div>
          </div>
          <span className="text-xl font-bold text-[hsl(var(--brand-pink))]">
            {formatEuro(eintrag.provision)}
          </span>
        </div>
      </div>

      <dl className="grid gap-x-6 gap-y-3 px-5 py-4 text-[13px] sm:grid-cols-2">
        <div>
          <dt className="text-[11px] uppercase tracking-wider text-muted-foreground">
            Mitglied
          </dt>
          <dd className="mt-0.5 font-medium">
            {eintrag.mitglied_name}
            {eintrag.mitglied_nummer && (
              <span className="ml-1 text-muted-foreground">
                · {eintrag.mitglied_nummer}
              </span>
            )}
          </dd>
        </div>
        <div>
          <dt className="text-[11px] uppercase tracking-wider text-muted-foreground">
            Laufzeit
          </dt>
          <dd className="mt-0.5">{laufzeitLabel(eintrag.laufzeit)}</dd>
        </div>
        <div>
          <dt className="text-[11px] uppercase tracking-wider text-muted-foreground">
            Beitrag Netto
          </dt>
          <dd className="mt-0.5 tabular-nums">
            {formatEuro(eintrag.beitrag_netto)}
          </dd>
        </div>
        <div>
          <dt className="text-[11px] uppercase tracking-wider text-muted-foreground">
            Startpaket
          </dt>
          <dd className="mt-0.5 tabular-nums">
            {formatEuro(eintrag.startpaket)}
          </dd>
        </div>
        {eintrag.bemerkung && (
          <div className="sm:col-span-2">
            <dt className="text-[11px] uppercase tracking-wider text-muted-foreground">
              Bemerkung
            </dt>
            <dd className="mt-0.5 whitespace-pre-line text-muted-foreground">
              {eintrag.bemerkung}
            </dd>
          </div>
        )}
      </dl>

      {modus === "idle" ? (
        <div className="flex items-center justify-end gap-2 border-t border-border px-5 py-3">
          <Button
            type="button"
            variant="outline"
            onClick={() => setModus("ablehnen")}
            disabled={pending}
            className="border-destructive/40 text-destructive hover:bg-destructive/10"
          >
            <X className="h-4 w-4" />
            Ablehnen
          </Button>
          <Button
            type="button"
            onClick={genehmigen}
            disabled={pending}
            className="gap-2 bg-[hsl(var(--primary))] text-[hsl(var(--primary-foreground))] hover:bg-[hsl(var(--primary)/0.9)]"
          >
            <Check className="h-4 w-4" />
            {pending ? "Genehmige …" : "Genehmigen"}
          </Button>
        </div>
      ) : (
        <form
          onSubmit={ablehnen}
          className="space-y-3 border-t border-border bg-muted/30 px-5 py-4"
        >
          <label className="block">
            <span className="text-xs font-medium text-muted-foreground">
              Begründung (Pflicht, mindestens 3 Zeichen)
            </span>
            <textarea
              autoFocus
              required
              minLength={3}
              rows={2}
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="z.B. „Mitglied falsch zugeordnet"
              className="mt-1 w-full rounded-md border border-border bg-background px-3 py-2 text-sm focus-visible:border-[hsl(var(--ring))] focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
            />
          </label>
          <div className="flex items-center justify-end gap-2">
            <Button
              type="button"
              variant="ghost"
              onClick={() => {
                setModus("idle");
                setNote("");
              }}
              disabled={pending}
            >
              Abbrechen
            </Button>
            <Button
              type="submit"
              disabled={pending || note.trim().length < 3}
              variant="destructive"
            >
              {pending ? "Lehne ab …" : "Ablehnen"}
            </Button>
          </div>
        </form>
      )}
    </div>
  );
}
