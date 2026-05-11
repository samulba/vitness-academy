"use client";

import { useRouter } from "next/navigation";

/**
 * Mobile-friendly Monats-Picker fuer /provisionen. Ersetzt den
 * 12-Pill-Wrap durch ein natives <select> -- iOS-Picker auf Mobile,
 * sauber auf Desktop. Wechselt Route bei onChange.
 *
 * WICHTIG: Labels werden serverseitig vorberechnet (Plain-Data), keine
 * Funktion als Prop -- RSC verbietet Function-Props auf Client-Components.
 */
export function MonatsPicker({
  aktiv,
  optionen,
}: {
  aktiv: string;
  optionen: { value: string; label: string }[];
}) {
  const router = useRouter();
  return (
    <div className="flex items-center gap-2">
      <label
        htmlFor="monat-select"
        className="text-[11px] uppercase tracking-wider text-muted-foreground"
      >
        Monat
      </label>
      <select
        id="monat-select"
        value={aktiv}
        onChange={(e) => router.push(`/provisionen?monat=${e.target.value}`)}
        className="h-9 rounded-full border border-border bg-card px-3 text-sm font-medium"
      >
        {optionen.map((m) => (
          <option key={m.value} value={m.value}>
            {m.label}
          </option>
        ))}
      </select>
    </div>
  );
}
