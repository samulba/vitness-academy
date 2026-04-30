"use client";

import { useEffect } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

import { toast } from "@/components/ui/toast";

/**
 * Liest den ?toast=<key>-Query-Parameter aus der URL und zeigt einen
 * passenden Toast an. Danach wird der Param entfernt (replace, kein
 * History-Eintrag).
 *
 * Server-Actions koennen so User-Feedback geben:
 *   redirect("/admin/standorte?toast=created");
 *
 * Bekannte Keys:
 *   - "created"    -> Erfolgreich angelegt
 *   - "saved"      -> Erfolgreich gespeichert
 *   - "deleted"    -> Erfolgreich geloescht
 *   - "archived"   -> Erfolgreich archiviert
 *   - "restored"   -> Reaktiviert
 *   - "submitted"  -> Eingereicht
 *   - "approved"   -> Freigegeben
 *   - "rejected"   -> Abgelehnt
 *   - "imported:N" -> N Eintraege importiert
 *   - "error"      -> Generischer Fehler (zeigt error-toast)
 *
 * Eingebunden ist die Komponente einmalig im Root-Layout.
 */
const SUCCESS: Record<string, string> = {
  created: "Erfolgreich angelegt",
  saved: "Gespeichert",
  deleted: "Gelöscht",
  archived: "Archiviert",
  restored: "Reaktiviert",
  submitted: "Eingereicht",
  approved: "Freigegeben",
  rejected: "Abgelehnt",
  invited: "Magic-Link verschickt",
};

export function ToastFlash() {
  const router = useRouter();
  const sp = useSearchParams();
  const pathname = usePathname();
  const t = sp.get("toast");

  useEffect(() => {
    if (!t) return;

    if (t === "error") {
      toast.error("Etwas ist schiefgelaufen", {
        description: "Bitte erneut versuchen.",
      });
    } else if (t.startsWith("imported:")) {
      const n = t.split(":")[1];
      toast.success(`${n} Einträge importiert`);
    } else {
      toast.success(SUCCESS[t] ?? t);
    }

    // Param wegnehmen ohne neue History-Entry und ohne Scroll
    const params = new URLSearchParams(sp.toString());
    params.delete("toast");
    const url = `${pathname}${params.toString() ? "?" + params.toString() : ""}`;
    router.replace(url, { scroll: false });
  }, [t, router, sp, pathname]);

  return null;
}
