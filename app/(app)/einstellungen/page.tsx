import { Mail, Shield, User } from "lucide-react";
import { requireProfile } from "@/lib/auth";
import { rolleLabel } from "@/lib/format";
import { createClient } from "@/lib/supabase/server";
import { ProfilForm } from "./ProfilForm";
import { PasswortForm } from "./PasswortForm";

export default async function EinstellungenPage() {
  const profile = await requireProfile();
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return (
    <div className="space-y-12">
      {/* Header */}
      <header>
        <p className="text-[11px] font-medium uppercase tracking-[0.18em] text-[hsl(var(--brand-pink))]">
          Mein Konto
        </p>
        <h1 className="mt-3 text-balance font-semibold leading-[1.1] tracking-[-0.025em] text-[clamp(1.875rem,3vw,2.75rem)]">
          Einstellungen
        </h1>
        <p className="mt-3 max-w-xl text-base leading-relaxed text-muted-foreground">
          Hier änderst du deinen Namen und dein Passwort.
        </p>
      </header>

      {/* Übersicht (Read-only) */}
      <section className="rounded-2xl border border-border bg-card p-6">
        <h2 className="text-sm font-semibold uppercase tracking-[0.15em] text-muted-foreground">
          Dein Profil
        </h2>
        <dl className="mt-5 grid gap-x-8 gap-y-4 sm:grid-cols-3">
          <div>
            <dt className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <Mail className="h-3.5 w-3.5" />
              E-Mail
            </dt>
            <dd className="mt-1 text-sm font-medium">
              {user?.email ?? "—"}
            </dd>
          </div>
          <div>
            <dt className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <Shield className="h-3.5 w-3.5" />
              Rolle
            </dt>
            <dd className="mt-1 text-sm font-medium">
              {rolleLabel(profile.role)}
            </dd>
          </div>
          <div>
            <dt className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <User className="h-3.5 w-3.5" />
              Aktueller Name
            </dt>
            <dd className="mt-1 text-sm font-medium">
              {profile.full_name ?? "—"}
            </dd>
          </div>
        </dl>
        <p className="mt-5 text-xs text-muted-foreground">
          E-Mail und Rolle werden vom Studio verwaltet — wenn da etwas falsch
          ist, sag deiner Studioleitung Bescheid.
        </p>
      </section>

      {/* Form: Name */}
      <section className="rounded-2xl border border-border bg-card p-6 sm:p-8">
        <h2 className="text-lg font-semibold tracking-tight">
          Persönliche Daten
        </h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Dein angezeigter Name in der Academy.
        </p>
        <div className="mt-6">
          <ProfilForm initialName={profile.full_name ?? ""} />
        </div>
      </section>

      {/* Form: Passwort */}
      <section className="rounded-2xl border border-border bg-card p-6 sm:p-8">
        <h2 className="text-lg font-semibold tracking-tight">Passwort</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Mindestens 8 Zeichen. Wähl etwas, das du dir merken kannst.
        </p>
        <div className="mt-6">
          <PasswortForm />
        </div>
      </section>
    </div>
  );
}
