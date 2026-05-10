"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { requireProfile, requirePermission } from "@/lib/auth";

const FOTO_MAX_BYTES = 5 * 1024 * 1024;
const FOTO_ERLAUBT = ["image/jpeg", "image/png", "image/webp"];
const FOTO_MAX_ANZAHL = 5;

export type Ergebnis =
  | { ok: true; id?: string }
  | { ok: false; message: string };

export async function mangelMelden(formData: FormData): Promise<Ergebnis> {
  const profile = await requireProfile();

  const title = String(formData.get("title") ?? "").trim();
  const description = String(formData.get("description") ?? "").trim();
  const severity = String(formData.get("severity") ?? "normal");
  const dateien = formData.getAll("foto");

  if (title.length < 3) {
    return { ok: false, message: "Bitte gib einen Titel ein (mindestens 3 Zeichen)." };
  }

  // Optional mehrere Fotos hochladen
  const photoPaths: string[] = [];
  const validFiles = dateien.filter(
    (d): d is File => d instanceof File && d.size > 0,
  );
  if (validFiles.length > FOTO_MAX_ANZAHL) {
    return {
      ok: false,
      message: `Maximal ${FOTO_MAX_ANZAHL} Fotos pro Mangel.`,
    };
  }
  const supabase = await createClient();
  if (validFiles.length > 0) {
    for (let i = 0; i < validFiles.length; i++) {
      const datei = validFiles[i];
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
      const path = `${profile.id}/${Date.now()}-${i}.${ext}`;
      const buffer = Buffer.from(await datei.arrayBuffer());
      const { error: uploadError } = await supabase.storage
        .from("issue-photos")
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
  }

  const { data, error } = await supabase
    .from("studio_issues")
    .insert({
      title,
      description: description.length > 0 ? description : null,
      severity: ["niedrig", "normal", "kritisch"].includes(severity)
        ? severity
        : "normal",
      photo_paths: photoPaths,
      reported_by: profile.id,
      status: "offen",
    })
    .select("id")
    .single();

  if (error) {
    return {
      ok: false,
      message: "Speichern fehlgeschlagen: " + error.message,
    };
  }

  revalidatePath("/maengel");
  revalidatePath("/admin/maengel");
  return { ok: true, id: data?.id };
}

export async function mangelStatusSetzen(
  id: string,
  status: "offen" | "in_bearbeitung" | "behoben" | "verworfen",
  formData: FormData,
): Promise<void> {
  await requirePermission("maengel", "edit");
  const note = String(formData.get("resolution_note") ?? "").trim();
  const supabase = await createClient();
  const { error } = await supabase
    .from("studio_issues")
    .update({
      status,
      resolution_note: note.length > 0 ? note : null,
      resolved_at:
        status === "behoben" || status === "verworfen"
          ? new Date().toISOString()
          : null,
    })
    .eq("id", id);
  if (error) {
    redirect(`/admin/maengel/${id}?toast=error`);
  }
  revalidatePath("/admin/maengel");
  revalidatePath(`/admin/maengel/${id}`);
  revalidatePath("/maengel");
  redirect(`/admin/maengel/${id}?toast=saved`);
}

export async function mangelLoeschen(id: string): Promise<void> {
  await requirePermission("maengel", "delete");
  const supabase = await createClient();
  const { error } = await supabase.from("studio_issues").delete().eq("id", id);
  if (error) {
    redirect(`/admin/maengel/${id}?toast=error`);
  }
  revalidatePath("/admin/maengel");
  revalidatePath("/maengel");
  redirect("/admin/maengel?toast=deleted");
}
