"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { requireProfile } from "@/lib/auth";

export type AktionsErgebnis = {
  ok: boolean;
  message?: string;
};

export async function profilAktualisieren(
  _prevState: AktionsErgebnis | null,
  formData: FormData,
): Promise<AktionsErgebnis> {
  const profile = await requireProfile();
  const fullName = String(formData.get("full_name") ?? "").trim();

  if (fullName.length < 2) {
    return {
      ok: false,
      message: "Bitte gib deinen Namen ein (mindestens 2 Zeichen).",
    };
  }
  if (fullName.length > 80) {
    return { ok: false, message: "Name ist zu lang (maximal 80 Zeichen)." };
  }

  const supabase = await createClient();
  const { error } = await supabase
    .from("profiles")
    .update({ full_name: fullName })
    .eq("id", profile.id);

  if (error) {
    return { ok: false, message: "Speichern hat nicht geklappt: " + error.message };
  }

  revalidatePath("/einstellungen");
  revalidatePath("/dashboard");
  return { ok: true, message: "Name aktualisiert." };
}

export async function passwortAendern(
  _prevState: AktionsErgebnis | null,
  formData: FormData,
): Promise<AktionsErgebnis> {
  await requireProfile();

  const neu = String(formData.get("neu") ?? "");
  const wiederholung = String(formData.get("wiederholung") ?? "");

  if (neu.length < 8) {
    return {
      ok: false,
      message: "Neues Passwort muss mindestens 8 Zeichen haben.",
    };
  }
  if (neu !== wiederholung) {
    return { ok: false, message: "Die beiden Passwörter stimmen nicht überein." };
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.updateUser({ password: neu });

  if (error) {
    return {
      ok: false,
      message: "Passwort konnte nicht gesetzt werden: " + error.message,
    };
  }

  return { ok: true, message: "Passwort geändert." };
}
