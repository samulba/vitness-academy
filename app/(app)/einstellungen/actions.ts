"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { requireProfile } from "@/lib/auth";

export type AktionsErgebnis = {
  ok: boolean;
  message?: string;
};

function joinName(first: string, last: string): string | null {
  const f = first.trim();
  const l = last.trim();
  const joined = `${f} ${l}`.trim();
  return joined.length > 0 ? joined : null;
}

export async function profilAktualisieren(
  _prevState: AktionsErgebnis | null,
  formData: FormData,
): Promise<AktionsErgebnis> {
  const profile = await requireProfile();

  const firstName = String(formData.get("first_name") ?? "").trim();
  const lastName = String(formData.get("last_name") ?? "").trim();
  const phoneRaw = String(formData.get("phone") ?? "").trim();
  const phone = phoneRaw.length > 0 ? phoneRaw : null;

  if (firstName.length > 60) {
    return { ok: false, message: "Vorname ist zu lang (maximal 60 Zeichen)." };
  }
  if (lastName.length > 60) {
    return { ok: false, message: "Nachname ist zu lang (maximal 60 Zeichen)." };
  }
  if (phone && phone.length > 40) {
    return {
      ok: false,
      message: "Telefonnummer ist zu lang (maximal 40 Zeichen).",
    };
  }
  if (firstName.length === 0 && lastName.length === 0) {
    return {
      ok: false,
      message: "Bitte gib mindestens einen Vor- oder Nachnamen ein.",
    };
  }

  const supabase = await createClient();
  const { error } = await supabase
    .from("profiles")
    .update({
      first_name: firstName.length > 0 ? firstName : null,
      last_name: lastName.length > 0 ? lastName : null,
      phone,
      full_name: joinName(firstName, lastName),
    })
    .eq("id", profile.id);

  if (error) {
    return {
      ok: false,
      message: "Speichern hat nicht geklappt: " + error.message,
    };
  }

  revalidatePath("/einstellungen");
  revalidatePath("/dashboard");
  return { ok: true, message: "Daten aktualisiert." };
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
    return {
      ok: false,
      message: "Die beiden Passwörter stimmen nicht überein.",
    };
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

export async function emailAendern(
  _prevState: AktionsErgebnis | null,
  formData: FormData,
): Promise<AktionsErgebnis> {
  await requireProfile();

  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return { ok: false, message: "Bitte gib eine gültige E-Mail-Adresse ein." };
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.updateUser({ email });

  if (error) {
    return {
      ok: false,
      message: "E-Mail konnte nicht geändert werden: " + error.message,
    };
  }

  return {
    ok: true,
    message:
      "Bestätigungsmail an deine alte UND neue Adresse gesendet. Beide klicken, dann ist die Änderung aktiv.",
  };
}
