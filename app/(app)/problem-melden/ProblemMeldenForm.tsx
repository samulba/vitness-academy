"use client";

import { useEffect } from "react";
import { CheckCircle2, Send } from "lucide-react";
import { bugManuellMelden } from "@/app/(app)/bug-reports/actions";
import { useFormAction } from "@/lib/hooks/use-form-action";
import {
  BUG_KATEGORIE_LABEL,
  BUG_PRIORITAET_LABEL,
  type BugKategorie,
  type BugPrioritaet,
} from "@/lib/bug-reports-types";

const KATEGORIEN: BugKategorie[] = ["bug", "ui", "vorschlag", "sonstiges"];
const PRIORITAETEN: BugPrioritaet[] = ["niedrig", "normal", "hoch"];

export function ProblemMeldenForm() {
  const { run, pending, state, formRef } = useFormAction(bugManuellMelden, {
    successToast: "Danke! Dein Bericht ist bei uns angekommen.",
    resetForm: true,
  });

  // Browser-Kontext (Pfad + UA) in versteckte Felder spiegeln, damit
  // Admin diese Info beim Bug-Report mitbekommt. useEffect, damit nichts
  // SSR-mismatched.
  useEffect(() => {
    const form = formRef.current;
    if (!form) return;
    const pfad = form.elements.namedItem("pfad");
    const ua = form.elements.namedItem("user_agent");
    if (pfad instanceof HTMLInputElement) {
      pfad.value =
        typeof window !== "undefined" ? window.location.pathname : "";
    }
    if (ua instanceof HTMLInputElement) {
      ua.value = typeof navigator !== "undefined" ? navigator.userAgent : "";
    }
  }, [formRef]);

  if (state?.ok) {
    return (
      <div className="rounded-2xl border border-[hsl(var(--success)/0.3)] bg-[hsl(var(--success)/0.06)] p-6 text-center">
        <CheckCircle2 className="mx-auto h-10 w-10 text-[hsl(var(--success))]" />
        <h2 className="mt-3 text-lg font-semibold">Danke für deinen Bericht!</h2>
        <p className="mt-1.5 text-sm text-muted-foreground">
          Wir kümmern uns drum. Du kannst gerne noch was melden:
        </p>
        <button
          type="button"
          onClick={() => {
            window.location.reload();
          }}
          className="mt-4 inline-flex items-center gap-1.5 rounded-full bg-[hsl(var(--primary))] px-4 py-2 text-sm font-semibold text-[hsl(var(--primary-foreground))]"
        >
          Noch eins melden
        </button>
      </div>
    );
  }

  return (
    <form
      ref={formRef}
      action={run}
      className="space-y-5 rounded-2xl border border-border bg-card p-6"
    >
      <input type="hidden" name="pfad" defaultValue="" />
      <input type="hidden" name="user_agent" defaultValue="" />

      <div className="space-y-2">
        <label htmlFor="kategorie" className="text-sm font-medium">
          Kategorie
        </label>
        <select
          id="kategorie"
          name="kategorie"
          defaultValue="bug"
          className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          {KATEGORIEN.map((k) => (
            <option key={k} value={k}>
              {BUG_KATEGORIE_LABEL[k]}
            </option>
          ))}
        </select>
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium">Priorität</label>
        <div className="grid grid-cols-3 gap-2">
          {PRIORITAETEN.map((p, idx) => (
            <label
              key={p}
              className="cursor-pointer rounded-lg border border-border bg-background px-3 py-2 text-center text-sm transition-colors has-[:checked]:border-[hsl(var(--primary))] has-[:checked]:bg-[hsl(var(--primary)/0.06)] has-[:checked]:font-semibold"
            >
              <input
                type="radio"
                name="prioritaet"
                value={p}
                defaultChecked={idx === 1}
                className="sr-only"
              />
              {BUG_PRIORITAET_LABEL[p]}
            </label>
          ))}
        </div>
      </div>

      <div className="space-y-2">
        <label htmlFor="beschreibung" className="text-sm font-medium">
          Beschreibung
          <span className="ml-1 text-destructive">*</span>
        </label>
        <textarea
          id="beschreibung"
          name="beschreibung"
          rows={6}
          required
          minLength={5}
          placeholder="Was ist passiert? Was wolltest du tun? Auf welcher Seite warst du?"
          className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        />
      </div>

      <div className="space-y-2">
        <label htmlFor="screenshot" className="text-sm font-medium">
          Screenshot (optional)
        </label>
        <input
          id="screenshot"
          name="screenshot"
          type="file"
          accept="image/jpeg,image/png,image/webp"
          className="block w-full text-sm file:mr-3 file:rounded-md file:border-0 file:bg-muted file:px-3 file:py-2 file:text-sm file:font-medium file:text-foreground hover:file:bg-muted/80"
        />
        <p className="text-xs text-muted-foreground">
          Max 5 MB. JPG, PNG oder WebP.
        </p>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3 border-t border-border pt-4">
        <p className="text-xs text-muted-foreground">
          Wir bekommen automatisch den Pfad und ein paar technische Infos mit.
        </p>
        <button
          type="submit"
          disabled={pending}
          className="inline-flex items-center gap-1.5 rounded-full bg-[hsl(var(--primary))] px-5 py-2.5 text-sm font-semibold text-[hsl(var(--primary-foreground))] transition-colors hover:bg-[hsl(var(--primary)/0.9)] disabled:opacity-60"
        >
          <Send className="h-4 w-4" />
          {pending ? "Wird gesendet…" : "Absenden"}
        </button>
      </div>
    </form>
  );
}
