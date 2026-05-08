"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export type SetPasswordErgebnis =
  | { ok: true }
  | { ok: false; message: string };

/**
 * Setzt das Passwort des aktuell eingeloggten Users (z.B. nach
 * Invite-Magic-Link oder Passwort-Reset). Erwartet eine aktive
 * Session — sonst Redirect auf Login.
 */
export async function passwortSetzen(
  _prev: SetPasswordErgebnis | null,
  formData: FormData,
): Promise<SetPasswordErgebnis> {
  const passwort = String(formData.get("passwort") ?? "");
  const wiederholung = String(formData.get("wiederholung") ?? "");

  if (passwort.length < 8) {
    return { ok: false, message: "Passwort muss mindestens 8 Zeichen lang sein." };
  }
  if (passwort !== wiederholung) {
    return { ok: false, message: "Die beiden Passwörter stimmen nicht überein." };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    redirect("/login?fehler=session-abgelaufen");
  }

  const { error } = await supabase.auth.updateUser({ password: passwort });
  if (error) {
    return {
      ok: false,
      message: "Passwort konnte nicht gesetzt werden: " + error.message,
    };
  }

  // Erfolg → ins Dashboard
  redirect("/dashboard?toast=passwort-gesetzt");
}
