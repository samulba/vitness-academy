import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { requireRole } from "@/lib/auth";
import { standortAnlegen } from "../actions";

export default async function NeuerStandortPage() {
  await requireRole(["admin", "superadmin"]);

  return (
    <div className="mx-auto max-w-xl space-y-8">
      <Link
        href="/admin/standorte"
        className="inline-flex items-center gap-1.5 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4" />
        Zurück zu allen Standorten
      </Link>

      <header>
        <p className="text-[11px] font-medium uppercase tracking-[0.18em] text-[hsl(var(--brand-pink))]">
          Verwaltung · Standorte
        </p>
        <h1 className="mt-3 text-balance font-semibold leading-[1.1] tracking-[-0.025em] text-[clamp(1.875rem,3vw,2.5rem)]">
          Neuer Standort
        </h1>
      </header>

      <form
        action={standortAnlegen}
        className="space-y-4 rounded-2xl border border-border bg-card p-6"
      >
        <div>
          <label htmlFor="name" className="text-sm font-medium">
            Name
          </label>
          <input
            id="name"
            name="name"
            type="text"
            required
            autoFocus
            placeholder="z.B. Studio Süd"
            className="mt-1.5 w-full rounded-md border border-input bg-background px-3 py-2 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          />
        </div>
        <button
          type="submit"
          className="rounded-full bg-[hsl(var(--primary))] px-5 py-2 text-sm font-semibold text-[hsl(var(--primary-foreground))] hover:bg-[hsl(var(--primary)/0.9)]"
        >
          Standort anlegen
        </button>
      </form>
    </div>
  );
}
