"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { requireProfile } from "@/lib/auth";
import { getAktiverStandort } from "@/lib/standort-context";
import {
  ladeTemplateMitSections,
  heuteISO,
  type ProtocolSectionEntry,
} from "@/lib/putzprotokoll";

export type Ergebnis =
  | { ok: true; id: string }
  | { ok: false; message: string };

/**
 * Frühschicht reicht das Putzprotokoll fuer heute ein.
 *
 * FormData-Format (Photos werden direkt vom Browser zu Storage
 * hochgeladen, hier kommen nur die Pfade):
 *   general_note: string
 *   section_<sectionId>__task_<taskIdx>: "on" wenn abgehakt
 *   section_<sectionId>__maengel: text
 *   section_<sectionId>__photo_path: string[] (bereits in Storage)
 */
export async function protokollEinreichen(
  formData: FormData,
): Promise<Ergebnis> {
  const profile = await requireProfile();
  const aktiv = await getAktiverStandort();
  if (!aktiv) {
    return { ok: false, message: "Kein aktiver Standort gewählt." };
  }

  const tpl = await ladeTemplateMitSections(aktiv.id);
  if (!tpl) {
    return {
      ok: false,
      message: "Für diesen Standort ist noch kein Putzprotokoll-Template angelegt.",
    };
  }

  const datum = heuteISO();
  const supabase = await createClient();

  // Doppel-Submit-Schutz
  const { data: existiert } = await supabase
    .from("cleaning_protocols")
    .select("id")
    .eq("location_id", aktiv.id)
    .eq("datum", datum)
    .maybeSingle();
  if (existiert) {
    return {
      ok: false,
      message: "Für heute wurde bereits ein Protokoll eingereicht.",
    };
  }

  // Pro Section: Tasks, Mängel, Photo-Pfade einlesen
  const sections: ProtocolSectionEntry[] = [];
  for (let i = 0; i < tpl.sections.length; i++) {
    const sec = tpl.sections[i];
    const tasksDone: string[] = [];
    for (let t = 0; t < sec.aufgaben.length; t++) {
      const v = formData.get(`section_${sec.id}__task_${t}`);
      if (v === "on") tasksDone.push(sec.aufgaben[t]);
    }
    const maengel = String(
      formData.get(`section_${sec.id}__maengel`) ?? "",
    ).trim();

    // Photo-Pfade (bereits in Storage hochgeladen vom Browser)
    const photoPaths = formData
      .getAll(`section_${sec.id}__photo_path`)
      .filter((v): v is string => typeof v === "string" && v.length > 0)
      // Sicherheits-Check: Pfad muss im richtigen Standort+Datum-Folder
      // liegen (verhindert Manipulation per DevTools)
      .filter((p) => p.startsWith(`${aktiv.id}/${datum}/${i}/`));

    sections.push({
      section_id: sec.id,
      titel: sec.titel,
      tasks_done: tasksDone,
      maengel,
      photo_paths: photoPaths,
    });
  }

  const general_note = String(formData.get("general_note") ?? "").trim();

  const { data, error } = await supabase
    .from("cleaning_protocols")
    .insert({
      location_id: aktiv.id,
      datum,
      sections,
      general_note: general_note || null,
      submitted_by: profile.id,
    })
    .select("id")
    .single();

  if (error || !data) {
    return {
      ok: false,
      message: "Fehler beim Speichern: " + (error?.message ?? "unbekannt"),
    };
  }

  // KEIN redirect() — der Client triggert router.refresh() bei ok=true.
  // Das vermeidet useActionState-Race-Conditions die manchmal in einem
  // "stecken" gebliebenen Pending-State enden.
  revalidatePath("/putzprotokoll");
  revalidatePath("/dashboard");
  revalidatePath("/aufgaben");
  revalidatePath("/admin/putzprotokolle");
  return { ok: true, id: data.id };
}
