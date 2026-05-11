"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requirePermission } from "@/lib/auth";
import { createAdminClient } from "@/lib/supabase/admin";
import { istUUID } from "@/lib/utils";
import type { Rolle } from "@/lib/rollen";

export type OnboardingErgebnis = {
  ok: boolean;
  message?: string;
  userId?: string;
};

/**
 * Legt einen neuen Mitarbeiter an:
 * 1. Auth-User via inviteUserByEmail (sendet Magic-Link-Mail — das
 *    Email-Template wird in Supabase Dashboard custom gestylt)
 * 2. Profile-Update (first_name, last_name, role)
 * 3. Lernpfad-Zuweisungen
 *
 * Voraussetzung: SUPABASE_SERVICE_ROLE_KEY in Env-Vars.
 */
export async function mitarbeiterAnlegen(
  _prev: OnboardingErgebnis | null,
  formData: FormData,
): Promise<OnboardingErgebnis> {
  const aktuellerAdmin = await requirePermission("benutzer", "create");

  const firstName = String(formData.get("first_name") ?? "").trim();
  const lastName = String(formData.get("last_name") ?? "").trim();
  const email = String(formData.get("email") ?? "")
    .trim()
    .toLowerCase();
  // Neue Zwei-Stufen-Auswahl: bereich + rolle_id. Aus der rolle_id leiten
  // wir base_level (-> profiles.role) UND ggf. einen Eintrag in
  // profile_roles ab (wenn Custom-Rolle, !is_system).
  const rolleId = (() => {
    const v = String(formData.get("rolle_id") ?? "").trim();
    return istUUID(v) ? v : null;
  })();
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
  if (!rolleId) {
    return { ok: false, message: "Bitte eine Rolle auswählen." };
  }

  const admin = createAdminClient();

  // Rolle aus DB laden, base_level und is_system bestimmen.
  const { data: rolleRow, error: rolleErr } = await admin
    .from("roles")
    .select("id, base_level, is_system, archived_at")
    .eq("id", rolleId)
    .maybeSingle();
  if (rolleErr || !rolleRow) {
    return { ok: false, message: "Die gewählte Rolle existiert nicht." };
  }
  if (rolleRow.archived_at) {
    return {
      ok: false,
      message: "Die gewählte Rolle ist archiviert und kann nicht zugewiesen werden.",
    };
  }
  const baseLevel = String(rolleRow.base_level);
  if (!["mitarbeiter", "fuehrungskraft", "admin"].includes(baseLevel)) {
    return {
      ok: false,
      message: "Diese Rolle kann nicht über das Onboarding zugewiesen werden.",
    };
  }
  const role = baseLevel as Rolle;
  const istCustomRolle = !rolleRow.is_system;
  const fullName = [firstName, lastName].filter(Boolean).join(" ") || null;

  // 1) Invite via Auth Admin API — sendet die branded Magic-Link-Mail
  // über Supabase-Auth-SMTP (Resend). Template wird im Supabase
  // Dashboard gepflegt, kein zweiter Mail-Versand vom Code aus.
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

  // 2) Profile-Update
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

  // 3) Custom-Rolle in profile_roles-Junction eintragen
  //    System-Rollen werden NICHT als Junction-Eintrag persistiert -- die
  //    Permissions kommen dann ueber SYSTEM_ROLE_IDS[role] in
  //    getCurrentProfile(). Custom-Rollen muessen explizit verknuepft sein.
  if (istCustomRolle) {
    const { error: prError } = await admin
      .from("profile_roles")
      .insert({
        profile_id: userId,
        role_id: rolleId,
      });
    if (prError) {
      return {
        ok: false,
        message:
          "Custom-Rolle konnte nicht zugewiesen werden: " + prError.message,
        userId,
      };
    }

    // kann_provisionen automatisch aus den Permissions der Custom-Rolle
    // ableiten: wenn sie mitarbeiter-provisionen:view enthaelt, ist die
    // Person Vertrieb und das RLS-Flag wird gesetzt. Damit ist die
    // frueher separate Checkbox im RollenPicker obsolet.
    const { data: provPerms } = await admin
      .from("role_permissions")
      .select("role_id")
      .eq("role_id", rolleId)
      .eq("modul", "mitarbeiter-provisionen")
      .eq("aktion", "view")
      .limit(1);
    if ((provPerms ?? []).length > 0) {
      await admin
        .from("profiles")
        .update({ kann_provisionen: true })
        .eq("id", userId);
    }
  }

  // 4) Lernpfad-Zuweisungen
  if (lernpfadIds.length > 0) {
    const rows = lernpfadIds.map((pfadId) => ({
      user_id: userId,
      learning_path_id: pfadId,
      assigned_by: aktuellerAdmin.id,
    }));
    await admin.from("user_learning_path_assignments").insert(rows);
  }

  // 5) Standort-Memberships
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

  revalidatePath("/admin/benutzer");
  redirect(`/admin/benutzer/${userId}?toast=invited`);
}
