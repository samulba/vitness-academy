"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { getCurrentProfile, istFuehrungskraftOderHoeher } from "@/lib/auth";

async function entscheide(
  signoffId: string,
  formData: FormData,
  status: "freigegeben" | "abgelehnt",
): Promise<void> {
  const profile = await getCurrentProfile();
  if (!profile || !istFuehrungskraftOderHoeher(profile.role)) return;

  const note = String(formData.get("reviewer_note") ?? "").trim() || null;

  const supabase = await createClient();
  await supabase
    .from("user_practical_signoffs")
    .update({
      status,
      reviewer_note: note,
      approved_by: profile.id,
      approved_at: new Date().toISOString(),
    })
    .eq("id", signoffId);

  revalidatePath("/admin/praxisfreigaben");
  revalidatePath("/praxisfreigaben");
}

export async function praxisFreigeben(signoffId: string, formData: FormData) {
  await entscheide(signoffId, formData, "freigegeben");
}

export async function praxisAblehnen(signoffId: string, formData: FormData) {
  await entscheide(signoffId, formData, "abgelehnt");
}
