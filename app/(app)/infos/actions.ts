"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { requireProfile } from "@/lib/auth";
import { istValideKategorie } from "@/lib/infos";

export type InfoErgebnis = { ok: true } | { ok: false; message: string };

/**
 * Mitarbeiter postet selbst eine Wichtige Info.
 * RLS erlaubt nur importance in (info, warning) und pinned = false
 * für Nicht-Admins -- wir validieren hier zusätzlich, damit der
 * Fehlerfall freundlich abgefangen wird.
 */
export async function infoPosten(formData: FormData): Promise<InfoErgebnis> {
  const profile = await requireProfile();

  const title = String(formData.get("title") ?? "").trim();
  const body = String(formData.get("body") ?? "").trim();
  const importanceRaw = String(formData.get("importance") ?? "info");
  const categoryRaw = String(formData.get("category") ?? "allgemein");
  const locationRaw = String(formData.get("location_id") ?? "").trim();

  if (title.length < 3 || title.length > 120) {
    return {
      ok: false,
      message: "Bitte gib einen Titel ein (3–120 Zeichen).",
    };
  }
  if (body.length > 4000) {
    return { ok: false, message: "Text ist zu lang (max 4000 Zeichen)." };
  }
  if (!["info", "warning"].includes(importanceRaw)) {
    return {
      ok: false,
      message:
        'Ungültige Wichtigkeit. „Dringend" ist der Studioleitung vorbehalten.',
    };
  }
  if (!istValideKategorie(categoryRaw)) {
    return { ok: false, message: "Ungültige Kategorie." };
  }
  const location_id = locationRaw.length > 0 ? locationRaw : null;

  const supabase = await createClient();
  const { error } = await supabase.from("studio_announcements").insert({
    title,
    body,
    importance: importanceRaw,
    category: categoryRaw,
    location_id,
    author_id: profile.id,
    pinned: false,
    published: true,
  });
  if (error) {
    return { ok: false, message: "Speichern fehlgeschlagen: " + error.message };
  }

  revalidatePath("/infos");
  revalidatePath("/dashboard");
  revalidatePath("/admin/infos");
  return { ok: true };
}

/**
 * Mitarbeiter löscht eigene Info. RLS-Policy "infos_user_delete_own"
 * erzwingt author_id = auth.uid(). Admins können über /admin/infos
 * weiterhin alles löschen.
 */
export async function eigeneInfoLoeschen(id: string): Promise<InfoErgebnis> {
  const profile = await requireProfile();
  const supabase = await createClient();

  const { error } = await supabase
    .from("studio_announcements")
    .delete()
    .eq("id", id)
    .eq("author_id", profile.id);
  if (error) {
    return { ok: false, message: "Löschen fehlgeschlagen: " + error.message };
  }

  revalidatePath("/infos");
  revalidatePath("/dashboard");
  revalidatePath("/admin/infos");
  return { ok: true };
}

export async function infoAlsGelesenMarkieren(
  announcementId: string,
): Promise<void> {
  const profile = await requireProfile();
  const supabase = await createClient();
  const { error } = await supabase
    .from("user_announcement_reads")
    .upsert(
      { user_id: profile.id, announcement_id: announcementId },
      { onConflict: "user_id,announcement_id", ignoreDuplicates: true },
    );
  if (error) {
    console.error("[infoAlsGelesenMarkieren]", error.message);
    return;
  }
  revalidatePath("/infos");
  revalidatePath("/dashboard");
}

export async function alleInfosAlsGelesen(): Promise<void> {
  const profile = await requireProfile();
  const supabase = await createClient();
  const { data } = await supabase
    .from("studio_announcements")
    .select("id")
    .eq("published", true);
  const rows = ((data ?? []) as { id: string }[]).map((a) => ({
    user_id: profile.id,
    announcement_id: a.id,
  }));
  if (rows.length > 0) {
    const { error } = await supabase
      .from("user_announcement_reads")
      .upsert(rows, {
        onConflict: "user_id,announcement_id",
        ignoreDuplicates: true,
      });
    if (error) {
      console.error("[alleInfosAlsGelesen]", error.message);
      return;
    }
  }
  revalidatePath("/infos");
  revalidatePath("/dashboard");
}
