"use client";

import { useActionState, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { AlertCircle, FileText, Upload } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import {
  lohnabrechnungHochladen,
  type Ergebnis,
} from "../actions";

/**
 * Upload-Form fuer Lohnabrechnungs-PDF + optional Brutto/Netto.
 * Zeigt File-Picker mit Drag-Drop-Optik (analog Mängel-Foto-Upload).
 */
export function UploadForm({
  userId,
  monat,
  existing,
}: {
  userId: string;
  monat: string;
  existing: { brutto_cents: number | null; netto_cents: number | null } | null;
}) {
  const router = useRouter();
  const formRef = useRef<HTMLFormElement>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const [datei, setDatei] = useState<File | null>(null);

  const [state, runAction, pending] = useActionState<Ergebnis | null, FormData>(
    async (_prev, fd) => lohnabrechnungHochladen(fd),
    null,
  );

  useEffect(() => {
    if (state?.ok) {
      toast.success(
        existing ? "Lohnabrechnung aktualisiert" : "Lohnabrechnung hochgeladen",
      );
      formRef.current?.reset();
      setDatei(null);
      router.refresh();
    }
  }, [state, router, existing]);

  const message = state && !state.ok ? state.message : null;

  const bruttoDefault =
    existing?.brutto_cents !== null && existing?.brutto_cents !== undefined
      ? (existing.brutto_cents / 100).toFixed(2).replace(".", ",")
      : "";
  const nettoDefault =
    existing?.netto_cents !== null && existing?.netto_cents !== undefined
      ? (existing.netto_cents / 100).toFixed(2).replace(".", ",")
      : "";

  return (
    <form
      ref={formRef}
      action={runAction}
      className="space-y-4 rounded-2xl border border-border bg-card p-5"
    >
      <input type="hidden" name="user_id" value={userId} />
      <input type="hidden" name="monat" value={monat} />

      {/* PDF-Upload */}
      <div>
        <Label className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
          PDF-Datei *
        </Label>
        <input
          ref={fileRef}
          id="pdf"
          name="pdf"
          type="file"
          accept="application/pdf"
          required
          onChange={(e) => setDatei(e.target.files?.[0] ?? null)}
          className="hidden"
        />
        <label
          htmlFor="pdf"
          className={cn(
            "mt-2 flex cursor-pointer flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed bg-background/40 px-4 py-6 text-center transition-colors hover:border-[hsl(var(--primary)/0.5)] hover:bg-[hsl(var(--primary)/0.04)]",
            datei ? "border-[hsl(var(--primary))] bg-[hsl(var(--primary)/0.04)]" : "border-input",
          )}
        >
          {datei ? (
            <>
              <span className="flex h-10 w-10 items-center justify-center rounded-full bg-[hsl(var(--primary)/0.12)] text-[hsl(var(--primary))]">
                <FileText className="h-4 w-4" />
              </span>
              <p className="text-sm font-semibold">{datei.name}</p>
              <p className="text-[11px] text-muted-foreground">
                {(datei.size / 1024 / 1024).toFixed(2)} MB
              </p>
            </>
          ) : (
            <>
              <span className="flex h-10 w-10 items-center justify-center rounded-full bg-muted text-muted-foreground">
                <Upload className="h-4 w-4" />
              </span>
              <p className="text-sm font-medium">
                PDF wählen oder hier ablegen
              </p>
              <p className="text-[11px] text-muted-foreground">
                Max. 10 MB
              </p>
            </>
          )}
        </label>
      </div>

      {/* Brutto / Netto optional */}
      <div className="grid grid-cols-2 gap-3">
        <div>
          <Label
            htmlFor="brutto_euro"
            className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground"
          >
            Brutto (optional, €)
          </Label>
          <Input
            id="brutto_euro"
            name="brutto_euro"
            type="text"
            inputMode="decimal"
            placeholder="2.450,00"
            defaultValue={bruttoDefault}
            className="mt-1 h-10 rounded-lg"
          />
        </div>
        <div>
          <Label
            htmlFor="netto_euro"
            className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground"
          >
            Netto (optional, €)
          </Label>
          <Input
            id="netto_euro"
            name="netto_euro"
            type="text"
            inputMode="decimal"
            placeholder="1.789,42"
            defaultValue={nettoDefault}
            className="mt-1 h-10 rounded-lg"
          />
        </div>
      </div>

      {message && (
        <p className="inline-flex items-center gap-2 rounded-lg border border-[hsl(var(--destructive)/0.3)] bg-[hsl(var(--destructive)/0.08)] px-3 py-2 text-xs font-medium text-[hsl(var(--destructive))]">
          <AlertCircle className="h-3.5 w-3.5" />
          {message}
        </p>
      )}

      <div className="flex items-center justify-end">
        <Button
          type="submit"
          disabled={pending || !datei}
          className="bg-[hsl(var(--primary))] text-[hsl(var(--primary-foreground))] hover:bg-[hsl(var(--primary)/0.9)]"
        >
          {pending
            ? "Lade hoch …"
            : existing
              ? "Aktualisieren"
              : "Hochladen"}
        </Button>
      </div>
    </form>
  );
}
