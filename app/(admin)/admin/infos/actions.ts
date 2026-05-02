"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { requireRole } from "@/lib/auth";
import { istValideKategorie } from "@/lib/infos";

function buildPayload(formData: FormData) {
  const title = String(formData.get("title") ?? "").trim();
  const body = String(formData.get("body") ?? "").trim();
  const importance = String(formData.get("importance") ?? "info");
  const categoryRaw = String(formData.get("category") ?? "allgemein");
  const locationRaw = String(formData.get("location_id") ?? "").trim();
  const pinned = formData.get("pinned") === "on";
  const published = formData.get("published") === "on";
  return {
    title,
    body,
    importance: ["info", "warning", "critical"].includes(importance)
      ? importance
      : "info",
    category: istValideKategorie(categoryRaw) ? categoryRaw : "allgemein",
    location_id: locationRaw.length > 0 ? locationRaw : null,
    pinned,
    published,
  };
}

export async function infoAnlegen(formData: FormData): Promise<void> {
  const profile = await requireRole(["admin", "superadmin"]);
  const payload = buildPayload(formData);
  if (!payload.title) return;

  const supabase = await createClient();
  const { data } = await supabase
    .from("studio_announcements")
    .insert({ ...payload, author_id: profile.id })
    .select("id")
    .single();
  revalidatePath("/admin/infos");
  revalidatePath("/infos");
  revalidatePath("/dashboard");
  if (data?.id) redirect(`/admin/infos/${data.id}?toast=created`);
}

export async function infoAktualisieren(
  id: string,
  formData: FormData,
): Promise<void> {
  await requireRole(["admin", "superadmin"]);
  const payload = buildPayload(formData);
  if (!payload.title) return;
  const supabase = await createClient();
  await supabase.from("studio_announcements").update(payload).eq("id", id);
  revalidatePath("/admin/infos");
  revalidatePath(`/admin/infos/${id}`);
  revalidatePath("/infos");
  revalidatePath("/dashboard");
  redirect(`/admin/infos/${id}?toast=saved`);
}

export async function infoLoeschen(id: string): Promise<void> {
  await requireRole(["admin", "superadmin"]);
  const supabase = await createClient();
  await supabase.from("studio_announcements").delete().eq("id", id);
  revalidatePath("/admin/infos");
  revalidatePath("/infos");
  redirect("/admin/infos?toast=deleted");
}
