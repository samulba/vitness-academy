"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { requirePermission } from "@/lib/auth";
import type { FormField, SubmissionStatus } from "@/lib/formulare";

function slugify(input: string): string {
  return input
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/ä/g, "ae")
    .replace(/ö/g, "oe")
    .replace(/ü/g, "ue")
    .replace(/ß/g, "ss")
    .replace(/[^a-z0-9-]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 60);
}

function buildPayload(formData: FormData) {
  const title = String(formData.get("title") ?? "").trim();
  const description = String(formData.get("description") ?? "").trim();
  const status = String(formData.get("status") ?? "aktiv");
  const sortOrder = Number.parseInt(
    String(formData.get("sort_order") ?? "0"),
    10,
  );
  const fieldsJson = String(formData.get("fields_json") ?? "[]");

  let fields: FormField[];
  try {
    const parsed = JSON.parse(fieldsJson);
    fields = Array.isArray(parsed) ? (parsed as FormField[]) : [];
  } catch {
    fields = [];
  }
  // Cleanup: stelle sicher dass alle Felder einen sauberen `name`
  // haben (bei leerem Name -> aus Label generieren).
  fields = fields
    .map((f) => ({
      ...f,
      name: f.name?.trim() || slugify(f.label || "feld"),
      label: f.label?.trim() || "Feld",
      type: f.type ?? "text",
      required: !!f.required,
    }))
    .filter((f) => f.label.length > 0);

  return {
    title,
    description: description.length > 0 ? description : null,
    status: ["entwurf", "aktiv", "archiviert"].includes(status)
      ? status
      : "aktiv",
    sort_order: Number.isFinite(sortOrder) ? sortOrder : 0,
    fields,
  };
}

export async function templateAnlegen(formData: FormData): Promise<void> {
  const profile = await requirePermission("formulare", "create");
  const payload = buildPayload(formData);
  if (!payload.title) return;

  const supabase = await createClient();
  // unique slug, ggf. mit Suffix
  const baseSlug = slugify(payload.title) || "formular";
  let slug = baseSlug;
  for (let i = 2; i < 100; i++) {
    const { data: clash } = await supabase
      .from("form_templates")
      .select("id")
      .eq("slug", slug)
      .maybeSingle();
    if (!clash) break;
    slug = `${baseSlug}-${i}`;
  }

  const { data, error: insError } = await supabase
    .from("form_templates")
    .insert({ ...payload, slug, created_by: profile.id })
    .select("id")
    .maybeSingle();
  revalidatePath("/admin/formulare");
  revalidatePath("/formulare");
  if (insError || !data?.id) {
    redirect("/admin/formulare?toast=error");
  }
  redirect(`/admin/formulare/${data.id}?toast=created`);
}

export async function templateAktualisieren(
  id: string,
  formData: FormData,
): Promise<void> {
  await requirePermission("formulare", "edit");
  const payload = buildPayload(formData);
  if (!payload.title) return;
  const supabase = await createClient();
  const { error } = await supabase
    .from("form_templates")
    .update(payload)
    .eq("id", id);
  if (error) {
    redirect(`/admin/formulare/${id}?toast=error`);
  }
  revalidatePath("/admin/formulare");
  revalidatePath(`/admin/formulare/${id}`);
  revalidatePath("/formulare");
  redirect(`/admin/formulare/${id}?toast=saved`);
}

export async function templateLoeschen(id: string): Promise<void> {
  await requirePermission("formulare", "delete");
  const supabase = await createClient();
  const { error } = await supabase
    .from("form_templates")
    .delete()
    .eq("id", id);
  if (error) {
    redirect(`/admin/formulare/${id}?toast=error`);
  }
  revalidatePath("/admin/formulare");
  revalidatePath("/formulare");
  redirect("/admin/formulare?toast=deleted");
}

export async function submissionStatusSetzen(
  id: string,
  status: SubmissionStatus,
  formData: FormData,
): Promise<void> {
  const profile = await requirePermission("formulare", "edit");
  const note = String(formData.get("admin_note") ?? "").trim();
  const supabase = await createClient();
  const { error } = await supabase
    .from("form_submissions")
    .update({
      status,
      admin_note: note.length > 0 ? note : null,
      processed_by: profile.id,
      processed_at:
        status === "erledigt" || status === "abgelehnt"
          ? new Date().toISOString()
          : null,
    })
    .eq("id", id);
  if (error) {
    redirect(`/admin/formulare/eingaenge/${id}?toast=error`);
  }
  revalidatePath("/admin/formulare");
  revalidatePath(`/admin/formulare/eingaenge/${id}`);
  redirect(`/admin/formulare/eingaenge/${id}?toast=saved`);
}
