"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { getCurrentProfile, istAdmin, istFuehrungskraftOderHoeher } from "@/lib/auth";
import { istUUID } from "@/lib/utils";
import { appUrl, sendEmail } from "@/lib/email";
import { welcomeMail } from "@/lib/email-templates/welcome";
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

function tagsParsen(raw: FormDataEntryValue | null): string[] {
  const s = String(raw ?? "").trim();
  if (s.length === 0) return [];
  return Array.from(
    new Set(
      s
        .split(",")
        .map((t) => t.trim())
        .filter((t) => t.length > 0 && t.length <= 32),
    ),
  ).slice(0, 12);
}

export async function profilAktualisieren(
  benutzerId: string,
  formData: FormData,
): Promise<void> {
  const aktuell = await ensureAdmin();
  const full_name = nullbarString(formData.get("full_name"));
  const first_name = nullbarString(formData.get("first_name"));
  const last_name = nullbarString(formData.get("last_name"));
  const phone = nullbarString(formData.get("phone"));
  const role = String(formData.get("role") ?? "mitarbeiter") as Rolle;
  if (!VALIDE_ROLLEN.includes(role)) return;
  if (role === "superadmin" && aktuell.role !== "superadmin") return;
  const location_id = nullbarString(formData.get("location_id"));
  const kann_provisionen = formData.get("kann_provisionen") === "on";
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
  const tags = tagsParsen(formData.get("tags"));
  const interne_notiz = nullbarString(formData.get("interne_notiz"));

  const supabase = await createClient();
  const voll = {
    full_name, first_name, last_name, phone, role, location_id,
    kann_provisionen, personalnummer, geburtsdatum, eintritt_am, austritt_am,
    vertragsart, wochenstunden, tags, interne_notiz,
  };
  const ohneNeu = {
    full_name, first_name, last_name, phone, role, location_id,
    kann_provisionen, personalnummer,
  };
  const basis = { full_name, role, location_id, kann_provisionen };

  const erst = await supabase.from("profiles").update(voll).eq("id", benutzerId);
  if (erst.error) {
    const zweit = await supabase.from("profiles").update(ohneNeu).eq("id", benutzerId);
    if (zweit.error) {
      await supabase.from("profiles").update(basis).eq("id", benutzerId);
    }
  }

  revalidatePath("/admin/benutzer");
  revalidatePath(`/admin/benutzer/${benutzerId}`);
  redirect(`/admin/benutzer/${benutzerId}?toast=saved`);
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
  const aktuell = await getCurrentProfile();
  if (!aktuell || !(istAdmin(aktuell.role) || istFuehrungskraftOderHoeher(aktuell.role))) {
    redirect("/admin");
  }
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
  const aktuell = await getCurrentProfile();
  if (!aktuell) redirect("/admin");

  const supabase = await createClient();
  await supabase.from("mitarbeiter_notizen").delete().eq("id", notizId);

  revalidatePath(`/admin/benutzer/${benutzerId}`);
  redirect(`/admin/benutzer/${benutzerId}?toast=deleted`);
}

export async function checklistTogglen(
  itemId: string,
  benutzerId: string,
): Promise<void> {
  const aktuell = await getCurrentProfile();
  if (!aktuell || !(istAdmin(aktuell.role) || istFuehrungskraftOderHoeher(aktuell.role))) {
    redirect("/admin");
  }

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
 * Sendet die Einladungs-Mail (Magic-Link via Supabase + Welcome-Mail
 * via Resend) erneut an einen Mitarbeiter.
 */
export async function einladungErneutSenden(
  benutzerId: string,
): Promise<void> {
  const aktuellerAdmin = await ensureAdmin();
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

  try {
    const base = appUrl();
    const loginUrl = base
      ? `${base}/login`
      : "https://www.vitness-crew.de/login";
    const vorname =
      (userData.user.user_metadata?.first_name as string | undefined) ??
      (userData.user.user_metadata?.full_name as string | undefined) ??
      "im Team";
    const { subject, html, text } = welcomeMail({
      vorname,
      loginUrl,
      studioleitung: aktuellerAdmin.full_name ?? undefined,
    });
    await sendEmail({ to: email, subject, html, text });
  } catch (e) {
    console.warn("[einladungErneutSenden] Welcome-Mail nicht versendet:", e);
  }

  revalidatePath(`/admin/benutzer/${benutzerId}`);
  revalidatePath("/admin/benutzer");
  redirect(`/admin/benutzer/${benutzerId}?toast=invited`);
}
