import { createClient } from "@/lib/supabase/server";
import { istNextJsControlFlow, joinName } from "@/lib/admin/safe-loader";
import type {
  ChecklistItem,
  ChecklistItemMitProgress,
} from "@/lib/onboarding-checklist-types";

export type {
  ChecklistItem,
  ChecklistItemMitProgress,
} from "@/lib/onboarding-checklist-types";

/**
 * Lädt alle Checklist-Items eines Templates (oder global wenn templateId=null).
 * Für die Admin-Verwaltung der Items.
 */
export async function ladeChecklistItems(
  templateId: string | null,
): Promise<ChecklistItem[]> {
  try {
    const supabase = await createClient();
    let q = supabase
      .from("onboarding_checklist_items")
      .select("id, template_id, label, beschreibung, sort_order")
      .order("sort_order", { ascending: true });
    if (templateId === null) q = q.is("template_id", null);
    else q = q.eq("template_id", templateId);
    const { data, error } = await q;
    if (error) {
      console.error("[ladeChecklistItems] supabase error:", error);
      return [];
    }
    return (data ?? []) as ChecklistItem[];
  } catch (e) {
    if (istNextJsControlFlow(e)) throw e;
    console.error("[ladeChecklistItems] unexpected error:", e);
    return [];
  }
}

/**
 * Lädt für eine:n Mitarbeiter:in alle relevanten Items + Progress.
 * Relevant = global (template_id null) — für Multi-Template-Setup
 * später kann man hier per profile.template_id filtern.
 */
export async function ladeChecklistFuerMitarbeiter(
  mitarbeiterId: string,
): Promise<ChecklistItemMitProgress[]> {
  try {
    const supabase = await createClient();

    // Alle Items (Template-spezifische + globale). Für Phase 13C nehmen
    // wir alle Items zusammen -- Studio kann eigene Templates später
    // pflegen, jetzt erstmal Defaults.
    const { data: items, error: e1 } = await supabase
      .from("onboarding_checklist_items")
      .select("id, template_id, label, beschreibung, sort_order")
      .order("sort_order", { ascending: true });
    if (e1) {
      console.error("[ladeChecklist] items error:", e1);
      return [];
    }

    const itemIds = (items ?? []).map((i) => i.id as string);
    if (itemIds.length === 0) return [];

    const { data: progress, error: e2 } = await supabase
      .from("mitarbeiter_onboarding_progress")
      .select(
        `id, item_id, erledigt_am, erledigt_von,
         erledigung:erledigt_von ( full_name )`,
      )
      .eq("mitarbeiter_id", mitarbeiterId)
      .in("item_id", itemIds);
    if (e2) {
      console.error("[ladeChecklist] progress error:", e2);
    }

    type ProgRoh = {
      id: string;
      item_id: string;
      erledigt_am: string | null;
      erledigt_von: string | null;
      erledigung: unknown;
    };
    const progByItem = new Map<string, ProgRoh>();
    for (const p of (progress ?? []) as unknown as ProgRoh[]) {
      progByItem.set(p.item_id, p);
    }

    return (items ?? []).map((i) => {
      const p = progByItem.get(i.id as string);
      return {
        id: i.id as string,
        template_id: (i.template_id as string | null) ?? null,
        label: i.label as string,
        beschreibung: (i.beschreibung as string | null) ?? null,
        sort_order:
          typeof i.sort_order === "number" ? i.sort_order : 0,
        erledigt_am: p?.erledigt_am ?? null,
        erledigt_von: p?.erledigt_von ?? null,
        erledigt_von_name: p ? joinName(p.erledigung) : null,
        progress_id: p?.id ?? null,
      };
    });
  } catch (e) {
    if (istNextJsControlFlow(e)) throw e;
    console.error("[ladeChecklistFuerMitarbeiter] unexpected:", e);
    return [];
  }
}

/**
 * Zähler-Helper für Liste: wie viele Items sind erledigt für diese:n
 * Mitarbeiter:in? Für Status-Pill in Liste.
 */
export async function ladeChecklistStatusBatch(
  mitarbeiterIds: string[],
): Promise<Map<string, { erledigt: number; gesamt: number }>> {
  const map = new Map<string, { erledigt: number; gesamt: number }>();
  if (mitarbeiterIds.length === 0) return map;
  try {
    const supabase = await createClient();
    const { data: items } = await supabase
      .from("onboarding_checklist_items")
      .select("id");
    const gesamt = (items ?? []).length;
    if (gesamt === 0) return map;
    const { data: progress } = await supabase
      .from("mitarbeiter_onboarding_progress")
      .select("mitarbeiter_id, erledigt_am")
      .in("mitarbeiter_id", mitarbeiterIds)
      .not("erledigt_am", "is", null);
    type R = { mitarbeiter_id: string; erledigt_am: string | null };
    for (const id of mitarbeiterIds) {
      map.set(id, { erledigt: 0, gesamt });
    }
    for (const p of (progress ?? []) as R[]) {
      const cur = map.get(p.mitarbeiter_id);
      if (cur) cur.erledigt += 1;
    }
    return map;
  } catch (e) {
    if (istNextJsControlFlow(e)) throw e;
    console.error("[ladeChecklistStatusBatch] unexpected:", e);
    return map;
  }
}
