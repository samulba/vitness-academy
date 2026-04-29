import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { requireRole } from "@/lib/auth";
import { KontaktForm } from "../KontaktForm";
import { kontaktAnlegen } from "../actions";

export default async function NeuerKontaktPage() {
  await requireRole(["admin", "superadmin"]);
  return (
    <div className="mx-auto max-w-2xl space-y-8">
      <Link
        href="/admin/kontakte"
        className="inline-flex items-center gap-1.5 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4" />
        Zurück zur Kontaktliste
      </Link>

      <header>
        <p className="text-[11px] font-medium uppercase tracking-[0.18em] text-[hsl(var(--brand-pink))]">
          Studio · Kontakte
        </p>
        <h1 className="mt-3 text-3xl font-semibold tracking-tight">
          Neuer Kontakt
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Mitarbeiter:innen, externe Trainer, Lieferanten — alles, was im
          Studio-Alltag erreichbar sein soll.
        </p>
      </header>

      <div className="rounded-2xl border border-border bg-card p-6 sm:p-8">
        <KontaktForm action={kontaktAnlegen} modus="neu" />
      </div>
    </div>
  );
}
