import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { requireRole } from "@/lib/auth";
import { InfoForm } from "../InfoForm";
import { infoAnlegen } from "../actions";

export default async function NeueInfoPage() {
  await requireRole(["admin", "superadmin"]);
  return (
    <div className="mx-auto max-w-2xl space-y-8">
      <Link
        href="/admin/infos"
        className="inline-flex items-center gap-1.5 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4" />
        Zurück zu allen Infos
      </Link>

      <header>
        <p className="text-[11px] font-medium uppercase tracking-[0.18em] text-[hsl(var(--brand-pink))]">
          Studio · Wichtige Infos
        </p>
        <h1 className="mt-3 text-3xl font-semibold tracking-tight">
          Neue Info
        </h1>
      </header>

      <div className="rounded-2xl border border-border bg-card p-6 sm:p-8">
        <InfoForm action={infoAnlegen} modus="neu" />
      </div>
    </div>
  );
}
