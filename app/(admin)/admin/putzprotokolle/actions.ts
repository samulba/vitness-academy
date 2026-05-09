"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { requireRole } from "@/lib/auth";

export async function protokollReviewen(
  id: string,
  formData: FormData,
): Promise<void> {
  const profile = await requireRole(["fuehrungskraft", "admin", "superadmin"]);
  const note = String(formData.get("review_note") ?? "").trim();

  const supabase = await createClient();
  const { error } = await supabase
    .from("cleaning_protocols")
    .update({
      status: "reviewed",
      reviewed_by: profile.id,
      reviewed_at: new Date().toISOString(),
      review_note: note || null,
    })
    .eq("id", id);

  if (error) {
    redirect(`/admin/putzprotokolle/${id}?toast=fehler`);
    return;
  }

  revalidatePath(`/admin/putzprotokolle/${id}`);
  revalidatePath("/admin/putzprotokolle");
  redirect(`/admin/putzprotokolle/${id}?toast=reviewed`);
}

export async function protokollLoeschen(id: string): Promise<void> {
  await requireRole(["fuehrungskraft", "admin", "superadmin"]);
  const supabase = await createClient();
  const { error } = await supabase
    .from("cleaning_protocols")
    .delete()
    .eq("id", id);
  if (error) {
    redirect(`/admin/putzprotokolle/${id}?toast=fehler`);
    return;
  }
  revalidatePath("/admin/putzprotokolle");
  redirect("/admin/putzprotokolle?toast=geloescht");
}
