"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireRole } from "@/lib/auth";
import { createAdminClient } from "@/lib/supabase/admin";
import type { Rolle } from "@/lib/rollen";

export type OnboardingErgebnis = {
  ok: boolean;
  message?: string;
  userId?: string;
};

/**
 * Legt einen neuen Mitarbeiter an:
 * 1. Auth-User via inviteUserByEmail (sendet Welcome-Mail mit
 *    Magic-Link, der User setzt Passwort selbst)
 * 2. Profile-Update (first_name, last_name, role)
 * 3. Lernpfad-Zuweisungen
 *
 * Voraussetzung: SUPABASE_SERVICE_ROLE_KEY in Env-Vars.
 */
export async function mitarbeiterAnlegen(
  _prev: OnboardingErgebnis | null,
  formData: FormData,
): Promise<OnboardingErgebnis> {
  const aktuellerAdmin = await requireRole(["admin", "superadmin"]);

  const firstName = String(formData.get("first_name") ?? "").trim();
  const lastName = String(formData.get("last_name") ?? "").trim();
  const email = String(formData.get("email") ?? "")
    .trim()
    .toLowerCase();
  const role = String(formData.get("role") ?? "mitarbeiter") as Rolle;
  const lernpfadIds = formData.getAll("lernpfade").map((v) => String(v));

  if (firstName.length === 0 && lastName.length === 0) {
    return {
      ok: false,
      message: "Bitte gib mindestens einen Vor- oder Nachnamen ein.",
    };
  }
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return { ok: false, message: "Bitte gib eine gültige E-Mail-Adresse ein." };
  }
  if (!["mitarbeiter", "fuehrungskraft"].includes(role)) {
    return { ok: false, message: "Ungültige Rolle." };
  }

  const admin = createAdminClient();
  const fullName = [firstName, lastName].filter(Boolean).join(" ") || null;

  // 1) Invite via Auth Admin API
  const { data: inviteData, error: inviteError } =
    await admin.auth.admin.inviteUserByEmail(email, {
      data: { full_name: fullName, first_name: firstName, last_name: lastName },
    });

  if (inviteError || !inviteData.user) {
    return {
      ok: false,
      message:
        "Anlegen fehlgeschlagen: " +
        (inviteError?.message ?? "Unbekannter Fehler"),
    };
  }

  const userId = inviteData.user.id;

  // 2) Profile-Update (handle_new_user-Trigger hat schon ein Default-Profil
  // angelegt; wir aktualisieren first_name/last_name/role)
  const { error: profileError } = await admin
    .from("profiles")
    .update({
      first_name: firstName.length > 0 ? firstName : null,
      last_name: lastName.length > 0 ? lastName : null,
      full_name: fullName,
      role,
    })
    .eq("id", userId);
  if (profileError) {
    return {
      ok: false,
      message:
        "Profil konnte nicht gesetzt werden: " + profileError.message,
      userId,
    };
  }

  // 3) Lernpfad-Zuweisungen
  if (lernpfadIds.length > 0) {
    const rows = lernpfadIds.map((pfadId) => ({
      user_id: userId,
      learning_path_id: pfadId,
      assigned_by: aktuellerAdmin.id,
    }));
    await admin.from("user_learning_path_assignments").insert(rows);
  }

  revalidatePath("/admin/benutzer");
  redirect(`/admin/benutzer/${userId}`);
}
