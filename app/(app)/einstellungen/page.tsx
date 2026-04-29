import { LogOut, Mail, Phone, Shield, User } from "lucide-react";
import { requireProfile } from "@/lib/auth";
import { rolleLabel } from "@/lib/format";
import { createClient } from "@/lib/supabase/server";
import { abmelden } from "@/app/login/actions";
import { ProfilForm } from "./ProfilForm";
import { PasswortForm } from "./PasswortForm";
import { EmailForm } from "./EmailForm";

export default async function EinstellungenPage() {
  const profile = await requireProfile();
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const aktuelleEmail = user?.email ?? "";

  return (
    <div className="space-y-12 pb-12">
      {/* Header */}
      <header>
        <p className="text-[11px] font-medium uppercase tracking-[0.18em] text-[hsl(var(--brand-pink))]">
          Mein Konto
        </p>
        <h1 className="mt-3 text-balance font-semibold leading-[1.1] tracking-[-0.025em] text-[clamp(1.875rem,3vw,2.75rem)]">
          Einstellungen
        </h1>
        <p className="mt-3 max-w-xl text-base leading-relaxed text-muted-foreground">
          Hier verwaltest du deine Daten, Login-Sicherheit und Kontakt.
        </p>
      </header>

      {/* Übersicht (Read-only) */}
      <Section
        eyebrow="Konto"
        titel="Übersicht"
        beschreibung="So bist du in der Academy hinterlegt."
      >
        <dl className="grid gap-x-8 gap-y-5 sm:grid-cols-2 lg:grid-cols-4">
          <Stat
            icon={<User className="h-3.5 w-3.5" />}
            label="Aktueller Name"
            wert={profile.full_name ?? "—"}
          />
          <Stat
            icon={<Mail className="h-3.5 w-3.5" />}
            label="E-Mail"
            wert={aktuelleEmail}
          />
          <Stat
            icon={<Shield className="h-3.5 w-3.5" />}
            label="Rolle"
            wert={rolleLabel(profile.role)}
          />
          <Stat
            icon={<Phone className="h-3.5 w-3.5" />}
            label="Telefon"
            wert={profile.phone ?? "—"}
          />
        </dl>
        <p className="mt-6 text-xs text-muted-foreground">
          Rolle wird vom Studio verwaltet — wenn da etwas falsch ist, sag
          deiner Studioleitung Bescheid.
        </p>
      </Section>

      {/* Persönliche Daten */}
      <Section
        eyebrow="Persönliches"
        titel="Persönliche Daten"
        beschreibung="Vor- und Nachname, optional eine Telefonnummer."
      >
        <ProfilForm
          initialFirstName={profile.first_name ?? ""}
          initialLastName={profile.last_name ?? ""}
          initialPhone={profile.phone ?? ""}
        />
      </Section>

      {/* E-Mail */}
      <Section
        eyebrow="Sicherheit"
        titel="E-Mail-Adresse"
        beschreibung="Mit dieser E-Mail meldest du dich an."
      >
        <EmailForm aktuelleEmail={aktuelleEmail} />
      </Section>

      {/* Passwort */}
      <Section
        eyebrow="Sicherheit"
        titel="Passwort"
        beschreibung="Mindestens 8 Zeichen. Wähl etwas, das du dir merken kannst."
      >
        <PasswortForm />
      </Section>

      {/* Abmelden */}
      <Section
        eyebrow="Sitzung"
        titel="Abmelden"
        beschreibung="Du wirst auf den Login geleitet."
      >
        <form action={abmelden}>
          <button
            type="submit"
            className="inline-flex items-center gap-2 rounded-full border border-border bg-background px-5 py-2.5 text-sm font-medium text-foreground transition-colors hover:bg-muted"
          >
            <LogOut className="h-4 w-4" />
            Abmelden
          </button>
        </form>
      </Section>
    </div>
  );
}

function Section({
  eyebrow,
  titel,
  beschreibung,
  children,
}: {
  eyebrow: string;
  titel: string;
  beschreibung: string;
  children: React.ReactNode;
}) {
  return (
    <section className="grid gap-6 lg:grid-cols-12 lg:gap-12">
      <div className="lg:col-span-4">
        <p className="text-[11px] font-medium uppercase tracking-[0.18em] text-[hsl(var(--brand-pink))]">
          {eyebrow}
        </p>
        <h2 className="mt-2 text-xl font-semibold tracking-tight">{titel}</h2>
        <p className="mt-1.5 text-sm text-muted-foreground">{beschreibung}</p>
      </div>
      <div className="lg:col-span-8">
        <div className="rounded-2xl border border-border bg-card p-6 sm:p-8">
          {children}
        </div>
      </div>
    </section>
  );
}

function Stat({
  icon,
  label,
  wert,
}: {
  icon: React.ReactNode;
  label: string;
  wert: string;
}) {
  return (
    <div>
      <dt className="flex items-center gap-1.5 text-xs text-muted-foreground">
        {icon}
        {label}
      </dt>
      <dd className="mt-1 break-words text-sm font-medium">{wert}</dd>
    </div>
  );
}
