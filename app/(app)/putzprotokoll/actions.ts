"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { requireProfile } from "@/lib/auth";
import { getAktiverStandort } from "@/lib/standort-context";
import {
  ladeTemplateMitSections,
  heuteISO,
  PROTOKOLL_PHOTOS_MAX,
  type ProtocolSectionEntry,
} from "@/lib/putzprotokoll";

const FOTO_MAX_BYTES = 5 * 1024 * 1024;
const FOTO_ERLAUBT = ["image/jpeg", "image/png", "image/webp"];

export type Ergebnis =
  | { ok: true; id: string }
  | { ok: false; message: string };

/**
 * Frühschicht reicht das Putzprotokoll fuer heute ein.
 * FormData-Format:
 *   general_note: string
 *   section_<sectionId>__task_<taskIdx>: "on" wenn abgehakt
 *   section_<sectionId>__maengel: text
 *   section_<sectionId>__photo: File[] (multiple, max 5)
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

  // Doppel-Submit-Schutz: existiert schon ein Protokoll heute?
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

  // Pro Section: Tasks, Mängel, Photos einlesen
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

    // Photos hochladen
    const dateien = formData.getAll(`section_${sec.id}__photo`);
    const validFiles = dateien.filter(
      (d): d is File => d instanceof File && d.size > 0,
    );
    if (validFiles.length > PROTOKOLL_PHOTOS_MAX) {
      return {
        ok: false,
        message: `Bereich „${sec.titel}": max. ${PROTOKOLL_PHOTOS_MAX} Fotos.`,
      };
    }
    const photoPaths: string[] = [];
    for (let p = 0; p < validFiles.length; p++) {
      const datei = validFiles[p];
      if (datei.size > FOTO_MAX_BYTES) {
        return {
          ok: false,
          message: `Foto „${datei.name}" ist zu groß (max 5 MB).`,
        };
      }
      if (!FOTO_ERLAUBT.includes(datei.type)) {
        return {
          ok: false,
          message: `„${datei.name}": Nur JPG, PNG oder WebP erlaubt.`,
        };
      }
      const ext = datei.type.split("/")[1].replace("jpeg", "jpg");
      const path = `${aktiv.id}/${datum}/${i}/${Date.now()}-${p}.${ext}`;
      const buffer = Buffer.from(await datei.arrayBuffer());
      const { error: uploadError } = await supabase.storage
        .from("cleaning-photos")
        .upload(path, buffer, {
          contentType: datei.type,
          upsert: false,
        });
      if (uploadError) {
        return {
          ok: false,
          message: "Foto-Upload fehlgeschlagen: " + uploadError.message,
        };
      }
      photoPaths.push(path);
    }

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

  revalidatePath("/putzprotokoll");
  redirect("/putzprotokoll?toast=eingereicht");
}
