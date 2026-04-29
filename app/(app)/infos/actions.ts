"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { requireProfile } from "@/lib/auth";

export async function infoAlsGelesenMarkieren(
  announcementId: string,
): Promise<void> {
  const profile = await requireProfile();
  const supabase = await createClient();
  await supabase
    .from("user_announcement_reads")
    .upsert(
      { user_id: profile.id, announcement_id: announcementId },
      { onConflict: "user_id,announcement_id", ignoreDuplicates: true },
    );
  revalidatePath("/infos");
  revalidatePath("/dashboard");
}

export async function alleInfosAlsGelesen(): Promise<void> {
  const profile = await requireProfile();
  const supabase = await createClient();
  const { data } = await supabase
    .from("studio_announcements")
    .select("id")
    .eq("published", true);
  const rows = ((data ?? []) as { id: string }[]).map((a) => ({
    user_id: profile.id,
    announcement_id: a.id,
  }));
  if (rows.length > 0) {
    await supabase
      .from("user_announcement_reads")
      .upsert(rows, {
        onConflict: "user_id,announcement_id",
        ignoreDuplicates: true,
      });
  }
  revalidatePath("/infos");
  revalidatePath("/dashboard");
}
