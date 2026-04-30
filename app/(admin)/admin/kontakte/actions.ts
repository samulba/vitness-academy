"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { requireRole } from "@/lib/auth";

function parseTags(raw: string): string[] {
  return raw
    .split(",")
    .map((t) => t.trim())
    .filter((t) => t.length > 0)
    .slice(0, 12);
}

function buildPayload(formData: FormData): {
  first_name: string | null;
  last_name: string | null;
  role_tags: string[];
  phone: string | null;
  email: string | null;
  notes: string | null;
  sort_order: number;
} {
  const first = String(formData.get("first_name") ?? "").trim();
  const last = String(formData.get("last_name") ?? "").trim();
  const tagsRaw = String(formData.get("role_tags") ?? "").trim();
  const phone = String(formData.get("phone") ?? "").trim();
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const notes = String(formData.get("notes") ?? "").trim();
  const sortRaw = String(formData.get("sort_order") ?? "0").trim();
  return {
    first_name: first.length > 0 ? first : null,
    last_name: last.length > 0 ? last : null,
    role_tags: parseTags(tagsRaw),
    phone: phone.length > 0 ? phone : null,
    email: email.length > 0 ? email : null,
    notes: notes.length > 0 ? notes : null,
    sort_order: Number.parseInt(sortRaw, 10) || 0,
  };
}

export async function kontaktAnlegen(formData: FormData): Promise<void> {
  const profile = await requireRole(["admin", "superadmin"]);
  const payload = buildPayload(formData);

  if (
    !payload.first_name &&
    !payload.last_name &&
    !payload.email &&
    !payload.phone
  ) {
    return;
  }

  const supabase = await createClient();
  const { data } = await supabase
    .from("studio_contacts")
    .insert({ ...payload, created_by: profile.id })
    .select("id")
    .single();

  revalidatePath("/admin/kontakte");
  revalidatePath("/kontakte");
  if (data?.id) redirect(`/admin/kontakte/${data.id}?toast=created`);
}

export async function kontaktAktualisieren(
  id: string,
  formData: FormData,
): Promise<void> {
  await requireRole(["admin", "superadmin"]);
  const payload = buildPayload(formData);

  const supabase = await createClient();
  await supabase.from("studio_contacts").update(payload).eq("id", id);

  revalidatePath("/admin/kontakte");
  revalidatePath(`/admin/kontakte/${id}`);
  revalidatePath("/kontakte");
  redirect(`/admin/kontakte/${id}?toast=saved`);
}

export async function kontaktLoeschen(id: string): Promise<void> {
  await requireRole(["admin", "superadmin"]);
  const supabase = await createClient();
  await supabase.from("studio_contacts").delete().eq("id", id);

  revalidatePath("/admin/kontakte");
  revalidatePath("/kontakte");
  redirect("/admin/kontakte?toast=deleted");
}
