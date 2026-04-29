"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { requireProfile } from "@/lib/auth";

export type QuizErgebnis = {
  ok: boolean;
  istRichtig: boolean;
  message?: string;
};

/**
 * Prueft serverseitig die Auswahl gegen den Block-Content
 * (Client darf nicht entscheiden was richtig ist).
 * Wenn alles richtig: persistierter Eintrag in
 * user_inline_quiz_attempts -> Lektion kann abgeschlossen werden.
 */
export async function inlineQuizPruefen(
  blockId: string,
  lessonId: string,
  indices: number[],
): Promise<QuizErgebnis> {
  const profile = await requireProfile();
  const supabase = await createClient();

  const { data: block } = await supabase
    .from("lesson_content_blocks")
    .select("id, lesson_id, block_type, content")
    .eq("id", blockId)
    .maybeSingle();

  if (!block) return { ok: false, istRichtig: false, message: "Block nicht gefunden." };
  if (block.block_type !== "inline_quiz") {
    return { ok: false, istRichtig: false, message: "Block ist kein Quiz." };
  }
  if (block.lesson_id !== lessonId) {
    return { ok: false, istRichtig: false, message: "Lektion stimmt nicht." };
  }

  const optionen = ((block.content as { optionen?: { korrekt: boolean }[] })
    .optionen ?? []) as { korrekt: boolean }[];

  const auswahl = new Set(indices);
  const istRichtig =
    optionen.length > 0 &&
    optionen.every((opt, i) => opt.korrekt === auswahl.has(i));

  if (istRichtig) {
    await supabase
      .from("user_inline_quiz_attempts")
      .upsert(
        {
          user_id: profile.id,
          lesson_id: lessonId,
          block_id: blockId,
        },
        { onConflict: "user_id,block_id", ignoreDuplicates: true },
      );
    revalidatePath(`/lektionen/${lessonId}`);
  }

  return { ok: true, istRichtig };
}
