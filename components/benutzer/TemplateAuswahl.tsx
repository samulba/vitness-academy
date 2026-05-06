"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";
import { templateZuweisen } from "@/app/(admin)/admin/benutzer/actions";

type Template = {
  id: string;
  name: string;
};

/**
 * Dropdown auf der Mitarbeiter-Detail-Page um das aktive Onboarding-
 * Template zu wechseln. Bei Auswahl: Server-Action speichert
 * profiles.template_id, Page reloaded -> ladeChecklistFuerMitarbeiter
 * filtert die sichtbaren Items neu.
 */
export function TemplateAuswahl({
  benutzerId,
  aktivesTemplate,
  templates,
}: {
  benutzerId: string;
  aktivesTemplate: string | null;
  templates: Template[];
}) {
  const [pending, startTransition] = useTransition();
  const router = useRouter();

  function aendern(neuerWert: string) {
    const id = neuerWert === "" ? null : neuerWert;
    if (id === aktivesTemplate) return;
    startTransition(async () => {
      await templateZuweisen(benutzerId, id);
      router.refresh();
    });
  }

  const aktiv = templates.find((t) => t.id === aktivesTemplate);

  return (
    <div className="flex flex-wrap items-center gap-2">
      {aktiv ? (
        <span className="inline-flex items-center gap-1.5 rounded-full bg-[hsl(var(--primary)/0.1)] px-2.5 py-1 text-[11px] font-medium text-[hsl(var(--primary))]">
          <Sparkles className="h-3 w-3" />
          {aktiv.name}
        </span>
      ) : (
        <span className="inline-flex items-center gap-1.5 rounded-full border border-border bg-background px-2.5 py-1 text-[11px] font-medium text-muted-foreground">
          Kein Template
        </span>
      )}
      <select
        value={aktivesTemplate ?? ""}
        onChange={(e) => aendern(e.target.value)}
        disabled={pending}
        className={cn(
          "h-7 rounded-md border border-input bg-background px-2 text-xs",
          pending && "opacity-60",
        )}
        aria-label="Template wechseln"
      >
        <option value="">— Kein Template (nur Standard) —</option>
        {templates.map((t) => (
          <option key={t.id} value={t.id}>
            {t.name}
          </option>
        ))}
      </select>
      {pending && (
        <span className="text-[11px] text-muted-foreground">Aktualisiert…</span>
      )}
    </div>
  );
}
