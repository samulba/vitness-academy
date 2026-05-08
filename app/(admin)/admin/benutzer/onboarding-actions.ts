"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireRole } from "@/lib/auth";
import { createAdminClient } from "@/lib/supabase/admin";
import { istUUID } from "@/lib/utils";
import { appUrl, sendEmail } from "@/lib/email";
import { welcomeMail } from "@/lib/email-templates/welcome";
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
  const lernpfadIds = formData
    .getAll("lernpfade")
    .map((v) => String(v))
    .filter(istUUID);
  const standortIds = formData
    .getAll("standorte")
    .map((v) => String(v))
    .filter(istUUID);
  const primaryStandort = (() => {
    const v = String(formData.get("primary_standort") ?? "").trim();
    return istUUID(v) && standortIds.includes(v) ? v : null;
  })();
  const templateId = (() => {
    const v = String(formData.get("template_id") ?? "").trim();
    return istUUID(v) ? v : null;
  })();

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
  const profileUpdate: Record<string, unknown> = {
    first_name: firstName.length > 0 ? firstName : null,
    last_name: lastName.length > 0 ? lastName : null,
    full_name: fullName,
    role,
  };
  if (primaryStandort) {
    profileUpdate.location_id = primaryStandort;
  }
  if (templateId) {
    profileUpdate.template_id = templateId;
  }
  let { error: profileError } = await admin
    .from("profiles")
    .update(profileUpdate)
    .eq("id", userId);
  // Defensive: wenn Migration 0050 noch nicht eingespielt -> ohne template_id retry
  if (profileError && templateId) {
    const { template_id: _ignore, ...ohneTemplate } = profileUpdate;
    void _ignore;
    const retry = await admin
      .from("profiles")
      .update(ohneTemplate)
      .eq("id", userId);
    profileError = retry.error;
  }
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

  // 4) Standort-Memberships -- primary wird über Trigger gesetzt
  // wenn profile.location_id gesetzt ist. Zusaetzliche werden hier
  // hinzugefuegt.
  const zusatzStandorte = standortIds.filter((s) => s !== primaryStandort);
  if (zusatzStandorte.length > 0) {
    const rows = zusatzStandorte.map((locId) => ({
      user_id: userId,
      location_id: locId,
      is_primary: false,
    }));
    await admin
      .from("user_locations")
      .upsert(rows, {
        onConflict: "user_id,location_id",
        ignoreDuplicates: true,
      });
  }

  // 5) Welcome-Mail (zusaetzlich zum Auth-Magic-Link) — schoene
  // branded Begruessung mit Login-Hinweis. Fehler beim Mailversand
  // brechen das Anlegen NICHT ab, weil der Account schon erfolgreich
  // ist und der Auth-Magic-Link separat ueber Supabase-SMTP rausgeht.
  try {
    const base = appUrl();
    const loginUrl = base ? `${base}/login` : "https://www.vitness-crew.de/login";
    const { subject, html, text } = welcomeMail({
      vorname: firstName || fullName || "im Team",
      loginUrl,
      studioleitung: aktuellerAdmin.full_name ?? undefined,
    });
    const r = await sendEmail({ to: email, subject, html, text });
    if (!r.ok) {
      console.warn("[mitarbeiterAnlegen] Welcome-Mail nicht versendet:", r.message);
    }
  } catch (e) {
    console.warn("[mitarbeiterAnlegen] Welcome-Mail crashte (ignoriert):", e);
  }

  revalidatePath("/admin/benutzer");
  redirect(`/admin/benutzer/${userId}?toast=invited`);
}
