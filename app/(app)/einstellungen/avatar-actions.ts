"use server";

import { revalidatePath } from "next/cache";
import { requireProfile } from "@/lib/auth";
import { createAdminClient } from "@/lib/supabase/admin";

const BUCKET = "avatars";
const MAX_BYTES = 10 * 1024 * 1024; // 10 MB
const ERLAUBTE_TYPEN = ["image/jpeg", "image/png", "image/webp"];

export type AvatarErgebnis =
  | { ok: true; pfad: string | null }
  | { ok: false; message: string };

/**
 * Laedt ein Profilbild in den 'avatars'-Bucket hoch und schreibt
 * den Pfad in profiles.avatar_path. Pfad-Konvention <user_id>/<ts>.ext
 * — die RLS-Storage-Policy erlaubt Schreiben nur, wenn der erste
 * Pfad-Bestandteil der eigenen auth.uid entspricht.
 */
export async function avatarHochladen(
  formData: FormData,
): Promise<AvatarErgebnis> {
  const profile = await requireProfile();

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
  const pfad = `${profile.id}/${Date.now()}.${ext}`;

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

  const { error: updateError } = await admin
    .from("profiles")
    .update({ avatar_path: pfad })
    .eq("id", profile.id);
  if (updateError) {
    return {
      ok: false,
      message: "Profilbild gespeichert, aber DB-Update fehlgeschlagen: " +
        updateError.message,
    };
  }

  revalidatePath("/", "layout");
  return { ok: true, pfad };
}

export async function avatarEntfernen(): Promise<AvatarErgebnis> {
  const profile = await requireProfile();
  const admin = createAdminClient();

  const { error } = await admin
    .from("profiles")
    .update({ avatar_path: null })
    .eq("id", profile.id);
  if (error) {
    return { ok: false, message: error.message };
  }

  revalidatePath("/", "layout");
  return { ok: true, pfad: null };
}
