"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { requireProfile } from "@/lib/auth";

/**
 * Setzt onboarding_done = true. Wird vom OnboardingDialog am
 * Ende der drei Slides oder beim "Ueberspringen"-Klick aufgerufen.
 * Idempotent.
 */
export async function onboardingAbschliessen(): Promise<void> {
  const profile = await requireProfile();
  if (profile.onboarding_done) return;

  const supabase = await createClient();
  await supabase
    .from("profiles")
    .update({ onboarding_done: true })
    .eq("id", profile.id);

  revalidatePath("/", "layout");
}
