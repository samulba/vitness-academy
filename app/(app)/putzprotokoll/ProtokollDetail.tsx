import { ProtokollSectionsAnzeige } from "@/components/putzprotokoll/ProtokollSectionsAnzeige";
import { ladeTemplateMitSections } from "@/lib/putzprotokoll";
import type { CleaningProtocol } from "@/lib/putzprotokoll-types";

/**
 * Detail-Anzeige eines bereits eingereichten Protokolls auf der
 * Mitarbeiter-Seite. Zeigt alle Sections mit gehakten/offenen Tasks,
 * Mängeln, Fotos.
 */
export async function ProtokollDetail({
  protokoll,
}: {
  protokoll: CleaningProtocol;
}) {
  // Original-Aufgabenliste aus aktuellem Template (fuer "alle Aufgaben"-Anzeige)
  const tpl = await ladeTemplateMitSections(protokoll.location_id);
  const aufgabenMap = new Map<string, string[]>();
  if (tpl) {
    for (const s of tpl.sections) {
      aufgabenMap.set(s.id, s.aufgaben);
    }
  }
  return (
    <ProtokollSectionsAnzeige
      protokoll={protokoll}
      alleAufgabenProSection={aufgabenMap}
    />
  );
}
