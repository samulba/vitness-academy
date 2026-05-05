"use server";

import { revalidatePath } from "next/cache";
import { requireProfile } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { istUUID } from "@/lib/utils";

export type KudosErgebnis = { ok: true } | { ok: false; message: string };

export async function kudosSenden(formData: FormData): Promise<KudosErgebnis> {
  const profile = await requireProfile();

  const toUser = String(formData.get("to_user") ?? "").trim();
  const message = String(formData.get("message") ?? "").trim();

  if (!istUUID(toUser)) {
    return { ok: false, message: "Bitte einen Empfänger wählen." };
  }
  if (toUser === profile.id) {
    return { ok: false, message: "Selber loben geht leider nicht." };
  }
  if (message.length < 3 || message.length > 500) {
    return {
      ok: false,
      message: "Lob-Text bitte zwischen 3 und 500 Zeichen.",
    };
  }

  const supabase = await createClient();
  const { error } = await supabase.from("kudos").insert({
    from_user: profile.id,
    to_user: toUser,
    message,
    location_id: profile.location_id,
  });
  if (error) {
    return { ok: false, message: "Speichern fehlgeschlagen: " + error.message };
  }

  revalidatePath("/kudos");
  revalidatePath("/dashboard");
  // Notification für Empfaenger -- Layout muss sich neu rendern, damit Bell-
  // Counter aktualisiert.
  revalidatePath("/", "layout");
  return { ok: true };
}

export async function kudosLoeschen(id: string): Promise<KudosErgebnis> {
  const profile = await requireProfile();
  const supabase = await createClient();
  const { error } = await supabase
    .from("kudos")
    .delete()
    .eq("id", id)
    .eq("from_user", profile.id);
  if (error) {
    return { ok: false, message: "Löschen fehlgeschlagen: " + error.message };
  }
  revalidatePath("/kudos");
  revalidatePath("/dashboard");
  return { ok: true };
}
