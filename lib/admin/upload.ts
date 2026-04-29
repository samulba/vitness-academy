"use server";

import { revalidatePath } from "next/cache";
import { requireRole } from "@/lib/auth";
import { createAdminClient } from "@/lib/supabase/admin";

const BUCKET = "lesson-images";
const MAX_BYTES = 5 * 1024 * 1024; // 5 MB
const ERLAUBTE_TYPEN = ["image/jpeg", "image/png", "image/webp"];

export type UploadErgebnis =
  | { ok: true; pfad: string }
  | { ok: false; message: string };

/**
 * Laedt ein Bild in den lesson-images Bucket hoch und schreibt
 * den Pfad in die DB-Spalte hero_image_path des angegebenen
 * Scopes (module/lesson).
 *
 * Voraussetzung: Bucket "lesson-images" existiert in Supabase
 * (siehe Migration 0012).
 */
export async function bildHochladen(
  scope: "module" | "lesson",
  id: string,
  formData: FormData,
): Promise<UploadErgebnis> {
  await requireRole(["admin", "superadmin"]);

  const datei = formData.get("datei");
  if (!(datei instanceof File) || datei.size === 0) {
    return { ok: false, message: "Keine Datei ausgewählt." };
  }
  if (datei.size > MAX_BYTES) {
    return {
      ok: false,
      message: `Datei ist zu groß (max ${MAX_BYTES / 1024 / 1024} MB).`,
    };
  }
  if (!ERLAUBTE_TYPEN.includes(datei.type)) {
    return {
      ok: false,
      message: "Nur JPG, PNG oder WebP erlaubt.",
    };
  }

  const ext = datei.type.split("/")[1].replace("jpeg", "jpg");
  const pfad = `${scope}/${id}/${Date.now()}.${ext}`;

  const admin = createAdminClient();

  const buffer = Buffer.from(await datei.arrayBuffer());
  const { error: uploadError } = await admin.storage
    .from(BUCKET)
    .upload(pfad, buffer, {
      contentType: datei.type,
      upsert: false,
    });
  if (uploadError) {
    return {
      ok: false,
      message: "Upload fehlgeschlagen: " + uploadError.message,
    };
  }

  // DB-Spalte aktualisieren
  const tabelle = scope === "module" ? "modules" : "lessons";
  const { error: updateError } = await admin
    .from(tabelle)
    .update({ hero_image_path: pfad })
    .eq("id", id);
  if (updateError) {
    // Bild im Bucket lassen (kein Cleanup-Roll-back) -- die DB-Update
    // schlaegt selten fehl, ist aber kein Datenverlust.
    return {
      ok: false,
      message:
        "Bild hochgeladen, aber DB-Update fehlgeschlagen: " +
        updateError.message,
    };
  }

  revalidatePath(`/admin/${scope === "module" ? "module" : "lektionen"}/${id}`);
  return { ok: true, pfad };
}

/**
 * Entfernt das Hero-Bild eines Moduls/Lektion (loescht die DB-
 * Referenz, das File im Bucket bleibt fuer Audit-Zwecke).
 */
export async function bildEntfernen(
  scope: "module" | "lesson",
  id: string,
): Promise<UploadErgebnis> {
  await requireRole(["admin", "superadmin"]);
  const admin = createAdminClient();
  const tabelle = scope === "module" ? "modules" : "lessons";
  const { error } = await admin
    .from(tabelle)
    .update({ hero_image_path: null })
    .eq("id", id);
  if (error) {
    return { ok: false, message: error.message };
  }
  revalidatePath(`/admin/${scope === "module" ? "module" : "lektionen"}/${id}`);
  return { ok: true, pfad: "" };
}

