import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { requireRole } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { AufgabeForm } from "../AufgabeForm";
import { aufgabeAnlegen } from "../actions";

export default async function NeueAufgabePage() {
  await requireRole(["admin", "superadmin"]);

  const supabase = await createClient();
  const { data } = await supabase
    .from("profiles")
    .select("id, full_name, role")
    .in("role", ["mitarbeiter", "fuehrungskraft"])
    .order("full_name", { ascending: true });
  const mitarbeiter = ((data ?? []) as { id: string; full_name: string | null }[])
    .map((m) => ({ id: m.id, name: m.full_name ?? "—" }));

  return (
    <div className="mx-auto max-w-2xl space-y-8">
      <Link
        href="/admin/aufgaben"
        className="inline-flex items-center gap-1.5 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4" />
        Zurück zu allen Aufgaben
      </Link>

      <header>
        <p className="text-[11px] font-medium uppercase tracking-[0.18em] text-[hsl(var(--brand-pink))]">
          Studio · Aufgaben
        </p>
        <h1 className="mt-3 text-3xl font-semibold tracking-tight">
          Neue Aufgabe
        </h1>
      </header>

      <div className="rounded-2xl border border-border bg-card p-6 sm:p-8">
        <AufgabeForm
          action={aufgabeAnlegen}
          modus="neu"
          mitarbeiter={mitarbeiter}
        />
      </div>
    </div>
  );
}
