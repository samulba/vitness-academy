"use client";

import { useEffect, useState } from "react";
import { KeyRound, Mail, User } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";

type Tab = "profil" | "sicherheit";

const TABS: { id: Tab; label: string; icon: React.ReactNode }[] = [
  { id: "profil", label: "Profil", icon: <User className="h-3.5 w-3.5" /> },
  {
    id: "sicherheit",
    label: "Sicherheit",
    icon: <KeyRound className="h-3.5 w-3.5" />,
  },
];

function tabAusHash(hash: string): Tab {
  return hash === "#sicherheit" ? "sicherheit" : "profil";
}

export function EinstellungenTabs({
  profilFormSlot,
  emailFormSlot,
  passwortFormSlot,
}: {
  profilFormSlot: React.ReactNode;
  emailFormSlot: React.ReactNode;
  passwortFormSlot: React.ReactNode;
}) {
  const [aktiv, setAktiv] = useState<Tab>("profil");

  useEffect(() => {
    setAktiv(tabAusHash(window.location.hash));
    function onHash() {
      setAktiv(tabAusHash(window.location.hash));
    }
    window.addEventListener("hashchange", onHash);
    return () => window.removeEventListener("hashchange", onHash);
  }, []);

  function aktiviere(t: Tab) {
    setAktiv(t);
    if (typeof window !== "undefined") {
      const next = t === "profil" ? "" : `#${t}`;
      const url = `${window.location.pathname}${window.location.search}${next}`;
      window.history.replaceState(null, "", url);
    }
  }

  return (
    <div className="space-y-5">
      <div
        role="tablist"
        aria-label="Einstellungs-Bereiche"
        className="inline-flex items-center gap-1 rounded-full border border-border bg-muted/40 p-1"
      >
        {TABS.map((t) => {
          const isActive = aktiv === t.id;
          return (
            <button
              key={t.id}
              type="button"
              role="tab"
              id={`tab-${t.id}`}
              aria-selected={isActive}
              aria-controls={`panel-${t.id}`}
              onClick={() => aktiviere(t.id)}
              className={cn(
                "inline-flex h-8 items-center gap-1.5 rounded-full px-3.5 text-[13px] font-medium transition-colors",
                isActive
                  ? "bg-[hsl(var(--primary))] text-[hsl(var(--primary-foreground))] shadow-sm"
                  : "text-muted-foreground hover:text-foreground",
              )}
            >
              {t.icon}
              {t.label}
            </button>
          );
        })}
      </div>

      <div
        role="tabpanel"
        id="panel-profil"
        aria-labelledby="tab-profil"
        hidden={aktiv !== "profil"}
        className={cn(
          "rounded-2xl border border-border bg-card p-6 sm:p-8",
          aktiv !== "profil" && "hidden",
        )}
      >
        <header className="mb-5">
          <h3 className="text-base font-semibold tracking-tight">
            Persönliche Daten
          </h3>
          <p className="mt-1 text-sm text-muted-foreground">
            Vor- und Nachname, optional eine Telefonnummer.
          </p>
        </header>
        {profilFormSlot}
      </div>

      <div
        role="tabpanel"
        id="panel-sicherheit"
        aria-labelledby="tab-sicherheit"
        hidden={aktiv !== "sicherheit"}
        className={cn(
          "rounded-2xl border border-border bg-card p-6 sm:p-8",
          aktiv !== "sicherheit" && "hidden",
        )}
      >
        <header className="mb-5">
          <h3 className="flex items-center gap-2 text-base font-semibold tracking-tight">
            <Mail className="h-4 w-4 text-[hsl(var(--brand-pink))]" />
            E-Mail-Adresse
          </h3>
          <p className="mt-1 text-sm text-muted-foreground">
            Mit dieser E-Mail meldest du dich an.
          </p>
        </header>
        {emailFormSlot}

        <Separator className="my-8" />

        <header className="mb-5">
          <h3 className="flex items-center gap-2 text-base font-semibold tracking-tight">
            <KeyRound className="h-4 w-4 text-[hsl(var(--brand-pink))]" />
            Passwort
          </h3>
          <p className="mt-1 text-sm text-muted-foreground">
            Mindestens 8 Zeichen. Wähl etwas, das du dir merken kannst.
          </p>
        </header>
        {passwortFormSlot}
      </div>
    </div>
  );
}
