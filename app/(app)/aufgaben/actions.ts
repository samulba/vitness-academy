"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { requireProfile } from "@/lib/auth";

export async function aufgabeAbhaken(
  id: string,
  istErledigt: boolean,
): Promise<void> {
  const profile = await requireProfile();
  const supabase = await createClient();
  await supabase
    .from("studio_tasks")
    .update({
      completed_by: istErledigt ? null : profile.id,
      completed_at: istErledigt ? null : new Date().toISOString(),
    })
    .eq("id", id);
  revalidatePath("/aufgaben");
  revalidatePath("/dashboard");
}
