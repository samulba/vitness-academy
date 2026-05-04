"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireRole } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { istUUID } from "@/lib/utils";
import type { Rolle } from "@/lib/rollen";

const VALIDE_ROLLEN: Rolle[] = [
  "mitarbeiter",
  "fuehrungskraft",
  "admin",
  "superadmin",
];

function payload(formData: FormData) {
  const name = String(formData.get("name") ?? "").trim();
  const beschreibung =
    String(formData.get("beschreibung") ?? "").trim() || null;
  const role = String(formData.get("role") ?? "mitarbeiter") as Rolle;
  const lernpfad_ids = formData
    .getAll("lernpfade")
    .map((v) => String(v))
    .filter(istUUID);
  return { name, beschreibung, role, lernpfad_ids };
}

export async function templateAnlegen(formData: FormData): Promise<void> {
  const profile = await requireRole(["admin", "superadmin"]);
  const p = payload(formData);
  if (!p.name) redirect("/admin/onboarding-templates/neu?fehler=name");
  if (!VALIDE_ROLLEN.includes(p.role))
    redirect("/admin/onboarding-templates/neu?fehler=rolle");

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("onboarding_templates")
    .insert({ ...p, created_by: profile.id })
    .select("id")
    .maybeSingle();
  if (error || !data?.id) {
    redirect("/admin/onboarding-templates?toast=error");
  }

  revalidatePath("/admin/onboarding-templates");
  revalidatePath("/admin/benutzer/neu");
  redirect(`/admin/onboarding-templates/${data.id}?toast=created`);
}

export async function templateAktualisieren(
  id: string,
  formData: FormData,
): Promise<void> {
  await requireRole(["admin", "superadmin"]);
  const p = payload(formData);
  if (!p.name) redirect(`/admin/onboarding-templates/${id}?fehler=name`);
  if (!VALIDE_ROLLEN.includes(p.role))
    redirect(`/admin/onboarding-templates/${id}?fehler=rolle`);

  const supabase = await createClient();
  const { error } = await supabase
    .from("onboarding_templates")
    .update(p)
    .eq("id", id);
  if (error) redirect(`/admin/onboarding-templates/${id}?toast=error`);

  revalidatePath("/admin/onboarding-templates");
  revalidatePath(`/admin/onboarding-templates/${id}`);
  revalidatePath("/admin/benutzer/neu");
  redirect(`/admin/onboarding-templates/${id}?toast=saved`);
}

export async function templateLoeschen(id: string): Promise<void> {
  await requireRole(["admin", "superadmin"]);
  const supabase = await createClient();
  const { error } = await supabase
    .from("onboarding_templates")
    .delete()
    .eq("id", id);
  if (error) {
    redirect(`/admin/onboarding-templates/${id}?toast=error`);
  }
  revalidatePath("/admin/onboarding-templates");
  revalidatePath("/admin/benutzer/neu");
  redirect("/admin/onboarding-templates?toast=deleted");
}
