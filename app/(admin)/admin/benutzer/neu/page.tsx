import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { requireRole } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { NeuerBenutzerForm } from "./Form";

export default async function NeuerBenutzerPage() {
  await requireRole(["admin", "superadmin"]);

  const supabase = await createClient();
  const { data: pfade } = await supabase
    .from("learning_paths")
    .select("id, title, description")
    .eq("status", "aktiv")
    .order("sort_order", { ascending: true });

  return (
    <div className="mx-auto max-w-3xl space-y-10">
      <Link
        href="/admin/benutzer"
        className="inline-flex items-center gap-1.5 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4" />
        Zurück zur Benutzerliste
      </Link>

      <header>
        <p className="text-[11px] font-medium uppercase tracking-[0.18em] text-[hsl(var(--brand-pink))]">
          Onboarding
        </p>
        <h1 className="mt-3 text-balance font-semibold leading-[1.1] tracking-[-0.025em] text-[clamp(1.875rem,3vw,2.75rem)]">
          Neue:r Mitarbeiter:in
        </h1>
        <p className="mt-3 max-w-xl text-base leading-relaxed text-muted-foreground">
          Wir legen den Account an, weisen die Lernpfade zu und schicken eine
          Welcome-Mail mit Magic-Link — die Person setzt ihr Passwort selbst.
        </p>
      </header>

      <NeuerBenutzerForm
        lernpfade={(pfade ?? []) as { id: string; title: string; description: string | null }[]}
      />
    </div>
  );
}
