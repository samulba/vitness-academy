"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireRole } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";

const VALID_LAUFZEITEN = ["26", "52", "104", "sonst"];

function parseProzent(raw: FormDataEntryValue | null): number {
  if (raw === null) return 0;
  const s = String(raw).trim().replace(/,/g, ".");
  const n = parseFloat(s);
  return Number.isFinite(n) ? Math.max(0, Math.min(100, n)) : 0;
}

export async function satzAnlegen(formData: FormData): Promise<void> {
  await requireRole(["admin", "superadmin"]);
  const laufzeit = String(formData.get("laufzeit") ?? "");
  const prozent_beitrag = parseProzent(formData.get("prozent_beitrag"));
  const prozent_startpaket = parseProzent(formData.get("prozent_startpaket"));
  const valid_from = String(formData.get("valid_from") ?? "").trim();

  if (!VALID_LAUFZEITEN.includes(laufzeit)) {
    redirect("/admin/provisionen/sätze?toast=error");
  }
  if (!/^\d{4}-\d{2}-\d{2}$/.test(valid_from)) {
    redirect("/admin/provisionen/sätze?toast=error");
  }

  const supabase = await createClient();
  const { error } = await supabase.from("commission_rates").insert({
    laufzeit,
    prozent_beitrag,
    prozent_startpaket,
    valid_from,
  });
  if (error) {
    redirect("/admin/provisionen/sätze?toast=error");
  }
  revalidatePath("/admin/provisionen");
  revalidatePath("/admin/provisionen/sätze");
  revalidatePath("/provisionen");
  redirect("/admin/provisionen/sätze?toast=saved");
}

export async function satzLoeschen(id: string): Promise<void> {
  await requireRole(["admin", "superadmin"]);
  const supabase = await createClient();
  await supabase.from("commission_rates").delete().eq("id", id);
  revalidatePath("/admin/provisionen/sätze");
  revalidatePath("/provisionen");
  redirect("/admin/provisionen/sätze?toast=deleted");
}
