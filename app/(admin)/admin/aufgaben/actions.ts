"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { requireRole } from "@/lib/auth";

function buildPayload(formData: FormData) {
  const title = String(formData.get("title") ?? "").trim();
  const description = String(formData.get("description") ?? "").trim();
  const assignedTo = String(formData.get("assigned_to") ?? "").trim();
  const dueDate = String(formData.get("due_date") ?? "").trim();
  const priority = String(formData.get("priority") ?? "normal");
  const recurrence = String(formData.get("recurrence") ?? "none");
  const active = formData.get("active") === "on";
  return {
    title,
    description: description.length > 0 ? description : null,
    assigned_to: assignedTo.length > 0 ? assignedTo : null,
    due_date: dueDate.length > 0 ? dueDate : null,
    priority: ["low", "normal", "high"].includes(priority) ? priority : "normal",
    recurrence: ["none", "daily", "weekly"].includes(recurrence)
      ? recurrence
      : "none",
    active,
  };
}

export async function aufgabeAnlegen(formData: FormData): Promise<void> {
  const profile = await requireRole(["admin", "superadmin"]);
  const payload = buildPayload(formData);
  if (!payload.title) return;

  const supabase = await createClient();
  const { data } = await supabase
    .from("studio_tasks")
    .insert({ ...payload, created_by: profile.id })
    .select("id")
    .single();
  revalidatePath("/admin/aufgaben");
  revalidatePath("/aufgaben");
  revalidatePath("/dashboard");
  if (data?.id) redirect(`/admin/aufgaben/${data.id}`);
}

export async function aufgabeAktualisieren(
  id: string,
  formData: FormData,
): Promise<void> {
  await requireRole(["admin", "superadmin"]);
  const payload = buildPayload(formData);
  if (!payload.title) return;
  const supabase = await createClient();
  await supabase.from("studio_tasks").update(payload).eq("id", id);
  revalidatePath("/admin/aufgaben");
  revalidatePath(`/admin/aufgaben/${id}`);
  revalidatePath("/aufgaben");
}

export async function aufgabeLoeschen(id: string): Promise<void> {
  await requireRole(["admin", "superadmin"]);
  const supabase = await createClient();
  await supabase.from("studio_tasks").delete().eq("id", id);
  revalidatePath("/admin/aufgaben");
  revalidatePath("/aufgaben");
  redirect("/admin/aufgaben");
}
