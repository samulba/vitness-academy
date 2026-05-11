"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import {
  getCurrentProfile,
  istAdmin,
  istFuehrungskraftOderHoeher,
  requirePermission,
} from "@/lib/auth";
import { istUUID } from "@/lib/utils";
import type { Rolle } from "@/lib/rollen";

async function ensureAdmin() {
  const p = await getCurrentProfile();
  if (!p || !istAdmin(p.role)) throw new Error("Nicht autorisiert");
  return p;
}

const VALIDE_ROLLEN: Rolle[] = [
  "mitarbeiter",
  "fuehrungskraft",
  "admin",
  "superadmin",
];

const VALIDE_VERTRAGSARTEN = [
  "vollzeit",
  "teilzeit",
  "minijob",
  "aushilfe",
  "selbstaendig",
  "praktikant",
  "sonstiges",
];

function nullbarString(raw: FormDataEntryValue | null): string | null {
  const t = String(raw ?? "").trim();
  return t.length > 0 ? t : null;
}

function nullbarDate(raw: FormDataEntryValue | null): string | null {
  const s = String(raw ?? "").trim();
  return /^\d{4}-\d{2}-\d{2}$/.test(s) ? s : null;
}

function nullbarNumber(raw: FormDataEntryValue | null): number | null {
  const s = String(raw ?? "").trim().replace(",", ".");
  if (s.length === 0) return null;
  const n = parseFloat(s);
  return Number.isFinite(n) && n >= 0 ? n : null;
}

/**
 * Aktualisiert die Stammdaten (persönliche Daten, Vertrag).
 * Rolle + Custom-Rollen + Heim-Standort + Provisionen-Flag werden
 * separat in profilRollenAktualisieren behandelt.
 *
 * Tags und interne_notiz werden hier NICHT mehr gepflegt -- die Felder
 * sind aus der UI entfernt; in der DB bleiben sie unangetastet.
 */
export async function profilStammdatenAktualisieren(
  benutzerId: string,
  formData: FormData,
): Promise<void> {
  await ensureAdmin();
  const full_name = nullbarString(formData.get("full_name"));
  const first_name = nullbarString(formData.get("first_name"));
  const last_name = nullbarString(formData.get("last_name"));
  const phone = nullbarString(formData.get("phone"));
  const personalnummer = nullbarString(formData.get("personalnummer"));

  const geburtsdatum = nullbarDate(formData.get("geburtsdatum"));
  const eintritt_am = nullbarDate(formData.get("eintritt_am"));
  const austritt_am = nullbarDate(formData.get("austritt_am"));
  const vertragsartRaw = nullbarString(formData.get("vertragsart"));
  const vertragsart =
    vertragsartRaw && VALIDE_VERTRAGSARTEN.includes(vertragsartRaw)
      ? vertragsartRaw
      : null;
  const wochenstunden = nullbarNumber(formData.get("wochenstunden"));

  const supabase = await createClient();
  const voll = {
    full_name, first_name, last_name, phone, personalnummer,
    geburtsdatum, eintritt_am, austritt_am, vertragsart, wochenstunden,
  };
  const ohneNeu = { full_name, first_name, last_name, phone, personalnummer };
  const basis = { full_name };

  // 3-Stufen-Fallback für Migrations-Lag.
  const erst = await supabase.from("profiles").update(voll).eq("id", benutzerId);
  if (erst.error) {
    const zweit = await supabase
      .from("profiles")
      .update(ohneNeu)
      .eq("id", benutzerId);
    if (zweit.error) {
      await supabase.from("profiles").update(basis).eq("id", benutzerId);
    }
  }

  revalidatePath("/admin/benutzer");
  revalidatePath(`/admin/benutzer/${benutzerId}`);
  redirect(`/admin/benutzer/${benutzerId}?toast=saved&tab=profil`);
}

/**
 * Aktualisiert Rolle + Custom-Rollen + Heim-Standort + Provisionen-Flag.
 * Custom-Rollen werden in der profile_roles-Junction (Migration 0066)
 * gespeichert -- mehrere möglich.
 */
export async function profilRollenAktualisieren(
  benutzerId: string,
  formData: FormData,
): Promise<void> {
  const aktuell = await ensureAdmin();
  const role = String(formData.get("role") ?? "mitarbeiter") as Rolle;
  if (!VALIDE_ROLLEN.includes(role)) return;
  if (role === "superadmin" && aktuell.role !== "superadmin") return;
  const location_id = nullbarString(formData.get("location_id"));

  // Custom-Rollen (Multi, Migration 0066): FormData liefert mehrere
  // "role_ids" Felder. Nicht-UUIDs verwerfen (Form-Tampering).
  // Dedup via Set, archivierte Rollen vom Loader sind ohnehin nicht
  // in der Dropdown-Liste -- die UUIDs hier müssen aber gegen die
  // DB geprüft werden, sonst kann ein Tamperer eine fremde Rolle
  // setzen. Wir filtern unten gegen die roles-Tabelle.
  const roleIdsRoh = formData.getAll("role_ids").map((v) => String(v).trim());
  const customRoleIdsCandidates = Array.from(
    new Set(roleIdsRoh.filter((s) => s.length > 0 && istUUID(s))),
  );

  const supabase = await createClient();

  // Custom-Rollen-Validierung gegen DB: nur aktive, nicht-archivierte
  // Rollen akzeptieren. Verhindert Form-Tampering mit fremden UUIDs.
  let gueltigeRoleIds: string[] = [];
  if (customRoleIdsCandidates.length > 0) {
    const { data: rolePruefung } = await supabase
      .from("roles")
      .select("id")
      .in("id", customRoleIdsCandidates)
      .is("archived_at", null);
    gueltigeRoleIds = ((rolePruefung ?? []) as { id: string }[]).map(
      (r) => r.id,
    );
  }

  // kann_provisionen wird aus den zugewiesenen Custom-Rollen automatisch
  // abgeleitet: wenn eine der ausgewaehlten Rollen das Modul
  // "mitarbeiter-provisionen" mit Aktion "view" hat, ist die Person
  // Vertrieb. Damit verschwindet die frueher hardcoded Doppel-Checkbox
  // im RollenPicker -- die Quelle der Wahrheit ist die Rollen-Verwaltung.
  let kann_provisionen = false;
  if (gueltigeRoleIds.length > 0) {
    const { data: provPerms } = await supabase
      .from("role_permissions")
      .select("role_id")
      .in("role_id", gueltigeRoleIds)
      .eq("modul", "mitarbeiter-provisionen")
      .eq("aktion", "view")
      .limit(1);
    kann_provisionen = (provPerms ?? []).length > 0;
  }

  await supabase
    .from("profiles")
    .update({ role, location_id, kann_provisionen })
    .eq("id", benutzerId);

  // profile_roles atomar ersetzen: delete + insert. Wenn die
  // Junction-Tabelle noch fehlt (Migration 0066 nicht gelaufen),
  // schlucken wir die Fehler und arbeiten mit dem alten Single-
  // Custom-Role-Modell (Update der profiles.custom_role_id-Spalte).
  const deleteRes = await supabase
    .from("profile_roles")
    .delete()
    .eq("profile_id", benutzerId);
  if (deleteRes.error) {
    const fallback = gueltigeRoleIds[0] ?? null;
    await supabase
      .from("profiles")
      .update({ custom_role_id: fallback })
      .eq("id", benutzerId);
  } else if (gueltigeRoleIds.length > 0) {
    const rows = gueltigeRoleIds.map((role_id) => ({
      profile_id: benutzerId,
      role_id,
    }));
    await supabase.from("profile_roles").insert(rows);
  }

  revalidatePath("/admin/benutzer");
  revalidatePath(`/admin/benutzer/${benutzerId}`);
  redirect(`/admin/benutzer/${benutzerId}?toast=saved&tab=rolle`);
}

export async function lernpfadZuweisen(
  benutzerId: string,
  formData: FormData,
): Promise<void> {
  const profile = await ensureAdmin();
  const learning_path_id = String(formData.get("learning_path_id") ?? "").trim();
  if (!learning_path_id) return;

  const supabase = await createClient();
  await supabase.from("user_learning_path_assignments").insert({
    user_id: benutzerId,
    learning_path_id,
    assigned_by: profile.id,
  });

  revalidatePath(`/admin/benutzer/${benutzerId}`);
  revalidatePath("/dashboard");
}

export async function lernpfadEntziehen(
  benutzerId: string,
  assignmentId: string,
): Promise<void> {
  await ensureAdmin();
  const supabase = await createClient();
  await supabase
    .from("user_learning_path_assignments")
    .delete()
    .eq("id", assignmentId)
    .eq("user_id", benutzerId);

  revalidatePath(`/admin/benutzer/${benutzerId}`);
  revalidatePath("/dashboard");
}

export async function mitarbeiterArchivieren(benutzerId: string): Promise<void> {
  const aktuell = await ensureAdmin();
  if (benutzerId === aktuell.id) return;
  const supabase = await createClient();
  const { data: ziel } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", benutzerId)
    .maybeSingle();
  if (ziel?.role === "superadmin" && aktuell.role !== "superadmin") return;

  await supabase
    .from("profiles")
    .update({ archived_at: new Date().toISOString() })
    .eq("id", benutzerId);

  revalidatePath("/admin/benutzer");
  revalidatePath(`/admin/benutzer/${benutzerId}`);
  redirect(`/admin/benutzer/${benutzerId}?toast=archived`);
}

export async function mitarbeiterReaktivieren(benutzerId: string): Promise<void> {
  await ensureAdmin();
  const supabase = await createClient();
  await supabase
    .from("profiles")
    .update({ archived_at: null })
    .eq("id", benutzerId);

  revalidatePath("/admin/benutzer");
  revalidatePath(`/admin/benutzer/${benutzerId}`);
  redirect(`/admin/benutzer/${benutzerId}?toast=restored`);
}

/**
 * Endgueltiges Löschen eines Mitarbeiters (Auth-User + cascadet auf
 * profiles via FK). NUR für Test-User die noch nie eingeloggt waren
 * ODER bereits archiviert sind.
 */
export async function mitarbeiterEndgueltigLoeschen(
  benutzerId: string,
): Promise<void> {
  const aktuell = await ensureAdmin();
  if (!istUUID(benutzerId)) {
    redirect(`/admin/benutzer?toast=error`);
  }
  if (benutzerId === aktuell.id) {
    redirect(`/admin/benutzer/${benutzerId}?toast=error`);
  }

  const admin = createAdminClient();
  const { data: userData } = await admin.auth.admin.getUserById(benutzerId);
  if (!userData?.user) {
    redirect(`/admin/benutzer?toast=error`);
  }

  const { data: profil } = await admin
    .from("profiles")
    .select("archived_at, role")
    .eq("id", benutzerId)
    .maybeSingle();

  if (profil?.role === "superadmin" && aktuell.role !== "superadmin") {
    redirect(`/admin/benutzer/${benutzerId}?toast=error`);
  }

  const istArchiviert = profil?.archived_at != null;
  const nieEingeloggt = !userData.user.last_sign_in_at;

  if (!nieEingeloggt && !istArchiviert) {
    redirect(`/admin/benutzer/${benutzerId}?toast=error`);
  }

  const { error } = await admin.auth.admin.deleteUser(benutzerId);
  if (error) {
    console.error("[mitarbeiterEndgueltigLoeschen]", error);
    redirect(`/admin/benutzer/${benutzerId}?toast=error`);
  }

  revalidatePath("/admin/benutzer");
  redirect("/admin/benutzer?toast=deleted");
}

export async function fortschrittZuruecksetzen(
  benutzerId: string,
  lessonId: string,
): Promise<void> {
  const aktuell = await getCurrentProfile();
  if (!aktuell || !istFuehrungskraftOderHoeher(aktuell.role)) return;
  const supabase = await createClient();
  await supabase
    .from("user_lesson_progress")
    .delete()
    .eq("user_id", benutzerId)
    .eq("lesson_id", lessonId);

  revalidatePath(`/admin/benutzer/${benutzerId}`);
}

export async function standortHinzufuegen(
  benutzerId: string,
  formData: FormData,
): Promise<void> {
  await ensureAdmin();
  const locationId = String(formData.get("location_id") ?? "").trim();
  if (!istUUID(locationId)) return;

  const supabase = await createClient();
  await supabase
    .from("user_locations")
    .upsert(
      { user_id: benutzerId, location_id: locationId, is_primary: false },
      { onConflict: "user_id,location_id", ignoreDuplicates: true },
    );

  revalidatePath(`/admin/benutzer/${benutzerId}`);
  redirect(`/admin/benutzer/${benutzerId}?toast=saved`);
}

export async function standortEntfernen(
  benutzerId: string,
  locationId: string,
): Promise<void> {
  await ensureAdmin();
  if (!istUUID(locationId)) return;
  const supabase = await createClient();

  const { data: profil } = await supabase
    .from("profiles")
    .select("location_id")
    .eq("id", benutzerId)
    .maybeSingle();
  if (profil?.location_id === locationId) {
    await supabase
      .from("profiles")
      .update({ location_id: null })
      .eq("id", benutzerId);
  }

  await supabase
    .from("user_locations")
    .delete()
    .eq("user_id", benutzerId)
    .eq("location_id", locationId);

  revalidatePath(`/admin/benutzer/${benutzerId}`);
  redirect(`/admin/benutzer/${benutzerId}?toast=saved`);
}

export async function standortAlsPrimary(
  benutzerId: string,
  locationId: string,
): Promise<void> {
  await ensureAdmin();
  if (!istUUID(locationId)) return;
  const supabase = await createClient();

  const { error } = await supabase
    .from("profiles")
    .update({ location_id: locationId })
    .eq("id", benutzerId);
  if (error) {
    redirect(`/admin/benutzer/${benutzerId}?toast=error`);
  }

  revalidatePath(`/admin/benutzer/${benutzerId}`);
  redirect(`/admin/benutzer/${benutzerId}?toast=saved`);
}

export async function notizAnlegen(
  benutzerId: string,
  formData: FormData,
): Promise<void> {
  const aktuell = await requirePermission("benutzer", "edit");
  const body = String(formData.get("body") ?? "").trim();
  if (body.length === 0) {
    redirect(`/admin/benutzer/${benutzerId}?toast=error`);
  }

  const supabase = await createClient();
  const { error } = await supabase.from("mitarbeiter_notizen").insert({
    mitarbeiter_id: benutzerId,
    autor_id: aktuell.id,
    body,
  });
  if (error) {
    redirect(`/admin/benutzer/${benutzerId}?toast=error`);
  }

  revalidatePath(`/admin/benutzer/${benutzerId}`);
  redirect(`/admin/benutzer/${benutzerId}?toast=saved`);
}

export async function notizLoeschen(
  notizId: string,
  benutzerId: string,
): Promise<void> {
  await requirePermission("benutzer", "edit");

  const supabase = await createClient();
  await supabase.from("mitarbeiter_notizen").delete().eq("id", notizId);

  revalidatePath(`/admin/benutzer/${benutzerId}`);
  redirect(`/admin/benutzer/${benutzerId}?toast=deleted`);
}

export async function checklistTogglen(
  itemId: string,
  benutzerId: string,
): Promise<void> {
  const aktuell = await requirePermission("benutzer", "edit");

  const supabase = await createClient();
  const { data: existing } = await supabase
    .from("mitarbeiter_onboarding_progress")
    .select("id, erledigt_am")
    .eq("mitarbeiter_id", benutzerId)
    .eq("item_id", itemId)
    .maybeSingle();

  if (existing) {
    if (existing.erledigt_am) {
      await supabase
        .from("mitarbeiter_onboarding_progress")
        .update({ erledigt_am: null, erledigt_von: null })
        .eq("id", existing.id);
    } else {
      await supabase
        .from("mitarbeiter_onboarding_progress")
        .update({
          erledigt_am: new Date().toISOString(),
          erledigt_von: aktuell.id,
        })
        .eq("id", existing.id);
    }
  } else {
    await supabase.from("mitarbeiter_onboarding_progress").insert({
      mitarbeiter_id: benutzerId,
      item_id: itemId,
      erledigt_am: new Date().toISOString(),
      erledigt_von: aktuell.id,
    });
  }

  revalidatePath(`/admin/benutzer/${benutzerId}`);
  revalidatePath("/admin/benutzer");
}

export async function templateZuweisen(
  benutzerId: string,
  templateId: string | null,
): Promise<void> {
  await ensureAdmin();
  const tid =
    templateId !== null && templateId !== "" && istUUID(templateId)
      ? templateId
      : null;

  const supabase = await createClient();
  const { error } = await supabase
    .from("profiles")
    .update({ template_id: tid })
    .eq("id", benutzerId);
  if (error) {
    console.error("[templateZuweisen]", error);
  }
  revalidatePath(`/admin/benutzer/${benutzerId}`);
  revalidatePath("/admin/benutzer");
}

export async function checklistItemAnlegen(
  formData: FormData,
): Promise<void> {
  await ensureAdmin();
  const label = String(formData.get("label") ?? "").trim();
  const beschreibung = String(formData.get("beschreibung") ?? "").trim() || null;
  const templateIdRaw = String(formData.get("template_id") ?? "").trim();
  const template_id = istUUID(templateIdRaw) ? templateIdRaw : null;
  const sortRaw = String(formData.get("sort_order") ?? "0").trim();
  const sort_order = parseInt(sortRaw, 10) || 0;

  if (label.length === 0) {
    redirect("/admin/onboarding-templates?toast=error");
  }

  const supabase = await createClient();
  const { error } = await supabase
    .from("onboarding_checklist_items")
    .insert({ template_id, label, beschreibung, sort_order });
  if (error) {
    redirect("/admin/onboarding-templates?toast=error");
  }

  revalidatePath("/admin/onboarding-templates");
  if (template_id) revalidatePath(`/admin/onboarding-templates/${template_id}`);
  revalidatePath("/admin/benutzer");
  redirect(
    template_id
      ? `/admin/onboarding-templates/${template_id}?toast=saved`
      : "/admin/onboarding-templates?toast=saved",
  );
}

export async function checklistItemLoeschen(id: string): Promise<void> {
  await ensureAdmin();
  const supabase = await createClient();
  const { data: item } = await supabase
    .from("onboarding_checklist_items")
    .select("template_id")
    .eq("id", id)
    .maybeSingle();
  const tid = item?.template_id as string | null | undefined;

  await supabase.from("onboarding_checklist_items").delete().eq("id", id);

  revalidatePath("/admin/onboarding-templates");
  if (tid) revalidatePath(`/admin/onboarding-templates/${tid}`);
  revalidatePath("/admin/benutzer");
  redirect(
    tid
      ? `/admin/onboarding-templates/${tid}?toast=deleted`
      : "/admin/onboarding-templates?toast=deleted",
  );
}

/**
 * Sendet die Magic-Link-Mail (Supabase Auth) erneut an einen
 * Mitarbeiter — z.B. wenn die urspruengliche Mail im Spam landet.
 * Das Email-Template wird im Supabase Dashboard gepflegt.
 */
export async function einladungErneutSenden(
  benutzerId: string,
): Promise<void> {
  await ensureAdmin();
  if (!istUUID(benutzerId)) {
    redirect(`/admin/benutzer?toast=error`);
  }

  const admin = createAdminClient();
  const { data: userData, error: getUserErr } = await admin.auth.admin
    .getUserById(benutzerId);
  if (getUserErr || !userData.user) {
    redirect(`/admin/benutzer/${benutzerId}?toast=error`);
  }
  const email = userData.user.email;
  if (!email) {
    redirect(`/admin/benutzer/${benutzerId}?toast=error`);
  }

  const { error: inviteErr } = await admin.auth.admin.inviteUserByEmail(
    email,
    { data: { full_name: userData.user.user_metadata?.full_name } },
  );
  if (inviteErr) {
    console.error("[einladungErneutSenden] inviteUserByEmail:", inviteErr);
    redirect(`/admin/benutzer/${benutzerId}?toast=error`);
  }

  revalidatePath(`/admin/benutzer/${benutzerId}`);
  revalidatePath("/admin/benutzer");
  redirect(`/admin/benutzer/${benutzerId}?toast=invited`);
}
