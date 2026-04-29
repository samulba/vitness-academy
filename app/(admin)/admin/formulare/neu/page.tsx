import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { requireRole } from "@/lib/auth";
import { TemplateForm } from "../TemplateForm";
import { templateAnlegen } from "../actions";

export default async function NeuesTemplatePage() {
  await requireRole(["admin", "superadmin"]);
  return (
    <div className="mx-auto max-w-3xl space-y-8">
      <Link
        href="/admin/formulare"
        className="inline-flex items-center gap-1.5 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4" />
        Zurück zur Übersicht
      </Link>
      <header>
        <p className="text-[11px] font-medium uppercase tracking-[0.18em] text-[hsl(var(--brand-pink))]">
          Studio · Formulare
        </p>
        <h1 className="mt-3 text-3xl font-semibold tracking-tight">
          Neues Formular
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Felder definieren — die Mitarbeiter sehen das fertige Formular dann
          unter „Formulare einreichen“.
        </p>
      </header>
      <TemplateForm action={templateAnlegen} modus="neu" />
    </div>
  );
}
