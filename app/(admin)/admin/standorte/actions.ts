"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { requireRole } from "@/lib/auth";

export async function standortAnlegen(formData: FormData): Promise<void> {
  await requireRole(["admin", "superadmin"]);
  const name = String(formData.get("name") ?? "").trim();
  if (!name) return;

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("locations")
    .insert({ name })
    .select("id")
    .single();
  if (error || !data) {
    redirect("/admin/standorte/neu?toast=error");
  }

  revalidatePath("/admin/standorte");
  revalidatePath("/admin");
  redirect(`/admin/standorte/${data.id}?toast=created`);
}

export async function standortAktualisieren(
  id: string,
  formData: FormData,
): Promise<void> {
  await requireRole(["admin", "superadmin"]);
  const name = String(formData.get("name") ?? "").trim();
  if (!name) return;

  const supabase = await createClient();
  await supabase.from("locations").update({ name }).eq("id", id);
  revalidatePath("/admin/standorte");
  revalidatePath(`/admin/standorte/${id}`);
  redirect(`/admin/standorte/${id}?toast=saved`);
}

export async function standortLoeschen(id: string): Promise<void> {
  await requireRole(["admin", "superadmin"]);
  const supabase = await createClient();
  await supabase.from("locations").delete().eq("id", id);
  revalidatePath("/admin/standorte");
  revalidatePath("/admin");
  redirect("/admin/standorte?toast=deleted");
}
