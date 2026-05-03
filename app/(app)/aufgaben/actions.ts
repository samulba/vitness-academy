"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { requireProfile } from "@/lib/auth";

export type AufgabenErgebnis =
  | { ok: true }
  | { ok: false; message: string };

export async function aufgabeAbhaken(
  id: string,
  istErledigt: boolean,
): Promise<AufgabenErgebnis> {
  const profile = await requireProfile();
  const supabase = await createClient();
  const { error } = await supabase
    .from("studio_tasks")
    .update({
      completed_by: istErledigt ? null : profile.id,
      completed_at: istErledigt ? null : new Date().toISOString(),
    })
    .eq("id", id);

  if (error) {
    return { ok: false, message: error.message };
  }

  revalidatePath("/aufgaben");
  revalidatePath("/dashboard");
  return { ok: true };
}
