"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { requireProfile } from "@/lib/auth";

export async function bookmarkUmschalten(
  articleId: string,
  istAktuellGesetzt: boolean,
): Promise<void> {
  const profile = await requireProfile();
  const supabase = await createClient();

  if (istAktuellGesetzt) {
    await supabase
      .from("user_article_bookmarks")
      .delete()
      .eq("user_id", profile.id)
      .eq("article_id", articleId);
  } else {
    await supabase
      .from("user_article_bookmarks")
      .insert({ user_id: profile.id, article_id: articleId });
  }

  revalidatePath("/wissen");
  revalidatePath("/wissen/[slug]", "page");
}
