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
 * Relevant = global (template_id null) ODER passend zu profile.template_id.
 * Damit sieht ein "Trainer"-Mitarbeiter nur die Trainer-Items, nicht die
 * vom Service-Template.
 */
export async function ladeChecklistFuerMitarbeiter(
  mitarbeiterId: string,
): Promise<ChecklistItemMitProgress[]> {
  try {
    const supabase = await createClient();

    // Profile holen damit wir das aktive Template kennen.
    // Defensive: bei fehlender Spalte (Migration 0050 nicht eingespielt)
    // fallen wir auf "alle Items zusammen" zurueck.
    let templateId: string | null = null;
    const { data: prof } = await supabase
      .from("profiles")
      .select("template_id")
      .eq("id", mitarbeiterId)
      .maybeSingle();
    if (prof) {
      templateId = (prof.template_id as string | null) ?? null;
    }

    // Items: globale (template_id NULL) plus die zum aktiven Template.
    let q = supabase
      .from("onboarding_checklist_items")
      .select("id, template_id, label, beschreibung, sort_order")
      .order("sort_order", { ascending: true });
    if (templateId) {
      q = q.or(`template_id.is.null,template_id.eq.${templateId}`);
    } else {
      q = q.is("template_id", null);
    }
    const { data: items, error: e1 } = await q;
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
 * Mitarbeiter:in? Pro Mitarbeiter individueller Gesamt-Count, weil
 * jeder ein anderes Template haben kann.
 */
export async function ladeChecklistStatusBatch(
  mitarbeiterIds: string[],
): Promise<Map<string, { erledigt: number; gesamt: number }>> {
  const map = new Map<string, { erledigt: number; gesamt: number }>();
  if (mitarbeiterIds.length === 0) return map;
  try {
    const supabase = await createClient();

    // Alle Items einmal laden (deutlich kleiner als Mitarbeiter × Items)
    const { data: itemsRaw } = await supabase
      .from("onboarding_checklist_items")
      .select("id, template_id");
    type ItemRoh = { id: string; template_id: string | null };
    const items = (itemsRaw ?? []) as ItemRoh[];
    if (items.length === 0) {
      for (const id of mitarbeiterIds) map.set(id, { erledigt: 0, gesamt: 0 });
      return map;
    }

    const globaleItemIds = new Set(
      items.filter((i) => !i.template_id).map((i) => i.id),
    );
    const itemsProTemplate = new Map<string, Set<string>>();
    for (const i of items) {
      if (!i.template_id) continue;
      if (!itemsProTemplate.has(i.template_id)) {
        itemsProTemplate.set(i.template_id, new Set());
      }
      itemsProTemplate.get(i.template_id)!.add(i.id);
    }

    // Profile-Templates fuer alle Mitarbeiter laden (defensive bei
    // fehlender Spalte: behandeln als "kein Template" -> globale Items)
    const profileTemplate = new Map<string, string | null>();
    const profRes = await supabase
      .from("profiles")
      .select("id, template_id")
      .in("id", mitarbeiterIds);
    type ProfRoh = { id: string; template_id: string | null };
    for (const p of ((profRes.data ?? []) as ProfRoh[])) {
      profileTemplate.set(p.id, p.template_id ?? null);
    }
    for (const id of mitarbeiterIds) {
      if (!profileTemplate.has(id)) profileTemplate.set(id, null);
    }

    // Pro Mitarbeiter: gesamt = globale Items + Items des Templates
    function gesamtFuer(mitarbeiterId: string): { ids: Set<string>; count: number } {
      const ids = new Set<string>(globaleItemIds);
      const tid = profileTemplate.get(mitarbeiterId);
      if (tid) {
        const tplItems = itemsProTemplate.get(tid);
        if (tplItems) for (const x of tplItems) ids.add(x);
      }
      return { ids, count: ids.size };
    }

    const { data: progress } = await supabase
      .from("mitarbeiter_onboarding_progress")
      .select("mitarbeiter_id, item_id, erledigt_am")
      .in("mitarbeiter_id", mitarbeiterIds)
      .not("erledigt_am", "is", null);
    type ProgRoh = {
      mitarbeiter_id: string;
      item_id: string;
      erledigt_am: string | null;
    };

    // Init
    const relevantPerMa = new Map<string, Set<string>>();
    for (const id of mitarbeiterIds) {
      const { ids, count } = gesamtFuer(id);
      relevantPerMa.set(id, ids);
      map.set(id, { erledigt: 0, gesamt: count });
    }
    // Erledigt-Zaehler nur fuer Items die fuer den Mitarbeiter relevant sind
    for (const p of (progress ?? []) as ProgRoh[]) {
      const cur = map.get(p.mitarbeiter_id);
      const rel = relevantPerMa.get(p.mitarbeiter_id);
      if (cur && rel && rel.has(p.item_id)) cur.erledigt += 1;
    }
    return map;
  } catch (e) {
    if (istNextJsControlFlow(e)) throw e;
    console.error("[ladeChecklistStatusBatch] unexpected:", e);
    return map;
  }
}
