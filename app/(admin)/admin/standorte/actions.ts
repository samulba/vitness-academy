"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { requirePermission } from "@/lib/auth";

export async function standortAnlegen(formData: FormData): Promise<void> {
  await requirePermission("standorte", "create");
  const name = String(formData.get("name") ?? "").trim();
  if (!name) redirect("/admin/standorte/neu?toast=name-fehlt");

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("locations")
    .insert({ name })
    .select("id")
    .single();
  if (error || !data) {
    console.error("[standortAnlegen]", error);
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
  await requirePermission("standorte", "edit");
  const name = String(formData.get("name") ?? "").trim();
  if (!name) redirect(`/admin/standorte/${id}?toast=name-fehlt`);

  const supabase = await createClient();
  const { error } = await supabase
    .from("locations")
    .update({ name })
    .eq("id", id);
  if (error) {
    console.error("[standortAktualisieren]", error);
    redirect(`/admin/standorte/${id}?toast=error`);
  }
  revalidatePath("/admin/standorte");
  revalidatePath(`/admin/standorte/${id}`);
  redirect(`/admin/standorte/${id}?toast=saved`);
}

export async function standortLoeschen(id: string): Promise<void> {
  await requirePermission("standorte", "delete");
  const supabase = await createClient();
  const { error } = await supabase.from("locations").delete().eq("id", id);
  if (error) {
    console.error("[standortLoeschen]", error);
    redirect(`/admin/standorte/${id}?toast=error`);
  }
  revalidatePath("/admin/standorte");
  revalidatePath("/admin");
  redirect("/admin/standorte?toast=deleted");
}
