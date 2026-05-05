"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { requireRole } from "@/lib/auth";

function buildPayload(formData: FormData): {
  first_name: string | null;
  last_name: string | null;
  role_tags: string[];
  phone: string | null;
  email: string | null;
  notes: string | null;
} {
  const first = String(formData.get("first_name") ?? "").trim();
  const last = String(formData.get("last_name") ?? "").trim();
  const phone = String(formData.get("phone") ?? "").trim();
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const notes = String(formData.get("notes") ?? "").trim();

  // Multi-Select: Rollen kommen als wiederholte FormData-Eintraege.
  const rohRollen = formData.getAll("role_tags");
  const role_tags = Array.from(
    new Set(
      rohRollen
        .map((v) => (typeof v === "string" ? v.trim() : ""))
        .filter((v) => v.length > 0),
    ),
  ).slice(0, 12);

  return {
    first_name: first.length > 0 ? first : null,
    last_name: last.length > 0 ? last : null,
    role_tags,
    phone: phone.length > 0 ? phone : null,
    email: email.length > 0 ? email : null,
    notes: notes.length > 0 ? notes : null,
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
    redirect("/admin/kontakte/neu?toast=error");
  }

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("studio_contacts")
    .insert({ ...payload, created_by: profile.id })
    .select("id")
    .maybeSingle();

  revalidatePath("/admin/kontakte");
  revalidatePath("/kontakte");

  if (error || !data?.id) {
    redirect("/admin/kontakte/neu?toast=error");
  }
  redirect(`/admin/kontakte/${data.id}?toast=created`);
}

export async function kontaktAktualisieren(
  id: string,
  formData: FormData,
): Promise<void> {
  await requireRole(["admin", "superadmin"]);
  const payload = buildPayload(formData);

  const supabase = await createClient();
  const { error } = await supabase
    .from("studio_contacts")
    .update(payload)
    .eq("id", id);

  revalidatePath("/admin/kontakte");
  revalidatePath(`/admin/kontakte/${id}`);
  revalidatePath("/kontakte");

  if (error) {
    redirect(`/admin/kontakte/${id}?toast=error`);
  }
  redirect(`/admin/kontakte/${id}?toast=saved`);
}

export async function kontaktLoeschen(id: string): Promise<void> {
  await requireRole(["admin", "superadmin"]);
  const supabase = await createClient();
  const { error } = await supabase
    .from("studio_contacts")
    .delete()
    .eq("id", id);

  revalidatePath("/admin/kontakte");
  revalidatePath("/kontakte");

  if (error) {
    redirect(`/admin/kontakte/${id}?toast=error`);
  }
  redirect("/admin/kontakte?toast=deleted");
}

// =============================================================
// Rollen-Katalog (studio_contact_roles)
// =============================================================

export async function rolleAnlegen(formData: FormData): Promise<void> {
  await requireRole(["admin", "superadmin"]);
  const name = String(formData.get("name") ?? "").trim().slice(0, 40);
  if (name.length === 0) {
    redirect("/admin/kontakte/rollen?toast=error");
  }

  const supabase = await createClient();
  const { error } = await supabase
    .from("studio_contact_roles")
    .insert({ name, sort_order: 50 });

  revalidatePath("/admin/kontakte/rollen");
  revalidatePath("/admin/kontakte");

  if (error) {
    // Unique-Conflict oder Tabelle fehlt -> sauberer Toast statt Crash
    redirect("/admin/kontakte/rollen?toast=error");
  }
  redirect("/admin/kontakte/rollen?toast=created");
}

export async function rolleLoeschen(id: string): Promise<void> {
  await requireRole(["admin", "superadmin"]);
  const supabase = await createClient();
  const { error } = await supabase
    .from("studio_contact_roles")
    .delete()
    .eq("id", id);

  revalidatePath("/admin/kontakte/rollen");
  revalidatePath("/admin/kontakte");

  if (error) {
    redirect("/admin/kontakte/rollen?toast=error");
  }
  redirect("/admin/kontakte/rollen?toast=deleted");
}
