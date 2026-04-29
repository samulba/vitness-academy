"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { getCurrentProfile, istAdmin, istFuehrungskraftOderHoeher } from "@/lib/auth";
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

export async function profilAktualisieren(
  benutzerId: string,
  formData: FormData,
): Promise<void> {
  const aktuell = await ensureAdmin();
  const full_name =
    String(formData.get("full_name") ?? "").trim() || null;
  const role = String(formData.get("role") ?? "mitarbeiter") as Rolle;
  if (!VALIDE_ROLLEN.includes(role)) return;
  // Superadmin-Rolle nur durch Superadmin vergeben
  if (role === "superadmin" && aktuell.role !== "superadmin") return;
  const location_id =
    String(formData.get("location_id") ?? "").trim() || null;

  const supabase = await createClient();
  await supabase
    .from("profiles")
    .update({ full_name, role, location_id })
    .eq("id", benutzerId);

  revalidatePath("/admin/benutzer");
  revalidatePath(`/admin/benutzer/${benutzerId}`);
}

export async function lernpfadZuweisen(
  benutzerId: string,
  formData: FormData,
): Promise<void> {
  const profile = await ensureAdmin();
  const learning_path_id = String(formData.get("learning_path_id") ?? "").trim();
  if (!learning_path_id) return;

  const supabase = await createClient();
  await supabase
    .from("user_learning_path_assignments")
    .insert({
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
  // Sich selbst nicht archivieren
  if (benutzerId === aktuell.id) return;
  const supabase = await createClient();
  // Pruefen ob Ziel ein Superadmin ist -- den darf nur ein Superadmin archivieren
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
}

// Fortschritt einer User-Lektion zurücksetzen (nuetzlich beim Testen)
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
