"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import { Check, ChevronsUpDown, MapPin } from "lucide-react";
import { cn } from "@/lib/utils";
import { setAktiverStandort } from "@/lib/standort-context";

type Standort = { id: string; name: string; is_primary: boolean };

/**
 * Switcher-Pill in Topbar/Sidebar. Zeigt aktuellen Standort + Dropdown
 * zum Wechseln. Sichtbar nur wenn der User >=2 Studios hat -- single-
 * location User sehen ihn nicht (waere stumpf).
 *
 * Variant "compact" für Topbar (mobile), "row" für Sidebar (desktop).
 */
export function StandortSwitcher({
  aktiv,
  optionen,
  variant = "compact",
}: {
  aktiv: Standort | null;
  optionen: Standort[];
  variant?: "compact" | "row";
}) {
  const [open, setOpen] = useState(false);
  const [pending, startTransition] = useTransition();
  const wrapperRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    function onClickOutside(e: MouseEvent) {
      if (!wrapperRef.current) return;
      if (!wrapperRef.current.contains(e.target as Node)) setOpen(false);
    }
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    document.addEventListener("mousedown", onClickOutside);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onClickOutside);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  // Switcher immer sichtbar wenn der User mindestens einem Studio
  // zugeordnet ist -- auch bei nur 1 Studio. So weiss der Mitarbeiter
  // visuell in welchem Studio er gerade ist und das Element ist
  // vertraut wenn weitere Studios dazukommen.
  if (!aktiv) return null;
  const nurEinStudio = optionen.length < 2;

  function waehlen(id: string) {
    if (id === aktiv?.id) {
      setOpen(false);
      return;
    }
    setOpen(false);
    startTransition(async () => {
      await setAktiverStandort(id);
    });
  }

  const trigger =
    variant === "row" ? (
      <button
        type="button"
        onClick={() => !nurEinStudio && setOpen((o) => !o)}
        disabled={pending || nurEinStudio}
        className={cn(
          "flex w-full items-center gap-2 rounded-lg border border-border bg-card px-2.5 py-1.5 text-left text-[13px] transition-colors",
          !nurEinStudio && "hover:border-[hsl(var(--brand-pink)/0.4)]",
          nurEinStudio && "cursor-default opacity-90",
          pending && "opacity-60",
        )}
        title={nurEinStudio ? "Aktuelles Studio" : "Studio wechseln"}
      >
        <MapPin className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
        <span className="min-w-0 flex-1 truncate font-medium">
          {aktiv.name}
        </span>
        {!nurEinStudio && (
          <ChevronsUpDown className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
        )}
      </button>
    ) : (
      <button
        type="button"
        onClick={() => !nurEinStudio && setOpen((o) => !o)}
        disabled={pending || nurEinStudio}
        className={cn(
          "inline-flex h-9 items-center gap-1.5 rounded-md border border-border bg-background px-2.5 text-[12px] font-medium transition-colors",
          !nurEinStudio && "hover:border-[hsl(var(--brand-pink)/0.4)]",
          nurEinStudio && "cursor-default opacity-90",
          pending && "opacity-60",
        )}
        title={nurEinStudio ? "Aktuelles Studio" : "Studio wechseln"}
      >
        <MapPin className="h-3.5 w-3.5 text-muted-foreground" />
        <span className="max-w-[120px] truncate">{aktiv.name}</span>
        {!nurEinStudio && (
          <ChevronsUpDown className="h-3 w-3 text-muted-foreground" />
        )}
      </button>
    );

  return (
    <div ref={wrapperRef} className="relative">
      {trigger}
      {open && (
        <div
          className={cn(
            "absolute z-50 mt-2 w-56 overflow-hidden rounded-lg border border-border bg-popover shadow-lg",
            variant === "row" ? "left-0" : "right-0",
          )}
        >
          <div className="border-b border-border px-3 py-2">
            <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
              Studio wechseln
            </p>
          </div>
          <ul className="py-1">
            {optionen.map((s) => {
              const istAktiv = s.id === aktiv.id;
              return (
                <li key={s.id}>
                  <button
                    type="button"
                    onClick={() => waehlen(s.id)}
                    className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm transition-colors hover:bg-muted"
                  >
                    <MapPin
                      className={cn(
                        "h-3.5 w-3.5 shrink-0",
                        istAktiv
                          ? "text-[hsl(var(--primary))]"
                          : "text-muted-foreground",
                      )}
                    />
                    <span
                      className={cn(
                        "flex-1 truncate",
                        istAktiv && "font-semibold",
                      )}
                    >
                      {s.name}
                      {s.is_primary && (
                        <span className="ml-1.5 text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
                          · Heim
                        </span>
                      )}
                    </span>
                    {istAktiv && (
                      <Check className="h-3.5 w-3.5 shrink-0 text-[hsl(var(--primary))]" />
                    )}
                  </button>
                </li>
              );
            })}
          </ul>
        </div>
      )}
    </div>
  );
}
