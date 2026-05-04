import { createClient } from "@/lib/supabase/server";
import type { Rolle } from "@/lib/rollen";

export type OnboardingTemplate = {
  id: string;
  name: string;
  beschreibung: string | null;
  role: Rolle;
  lernpfad_ids: string[];
  created_at: string;
  updated_at: string;
};

export type TemplateMitMeta = OnboardingTemplate & {
  lernpfad_count: number;
  lernpfad_titles: string[];
};

export async function ladeTemplates(): Promise<TemplateMitMeta[]> {
  const supabase = await createClient();
  const { data: rows } = await supabase
    .from("onboarding_templates")
    .select("id, name, beschreibung, role, lernpfad_ids, created_at, updated_at")
    .order("name", { ascending: true });

  const templates = ((rows ?? []) as OnboardingTemplate[]) ?? [];
  if (templates.length === 0) return [];

  const alleIds = Array.from(
    new Set(templates.flatMap((t) => t.lernpfad_ids ?? [])),
  );
  let titelMap = new Map<string, string>();
  if (alleIds.length > 0) {
    const { data: pfade } = await supabase
      .from("learning_paths")
      .select("id, title")
      .in("id", alleIds);
    titelMap = new Map(
      ((pfade ?? []) as { id: string; title: string }[]).map((p) => [
        p.id,
        p.title,
      ]),
    );
  }

  return templates.map((t) => ({
    ...t,
    lernpfad_count: t.lernpfad_ids.length,
    lernpfad_titles: t.lernpfad_ids
      .map((id) => titelMap.get(id))
      .filter((s): s is string => Boolean(s)),
  }));
}

export async function ladeTemplate(
  id: string,
): Promise<OnboardingTemplate | null> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("onboarding_templates")
    .select("id, name, beschreibung, role, lernpfad_ids, created_at, updated_at")
    .eq("id", id)
    .maybeSingle();
  return data ? (data as OnboardingTemplate) : null;
}

export async function ladeTemplatesFuerForm(): Promise<
  { id: string; name: string; role: string; lernpfad_ids: string[] }[]
> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("onboarding_templates")
    .select("id, name, role, lernpfad_ids")
    .order("name", { ascending: true });
  return (data ?? []) as {
    id: string;
    name: string;
    role: string;
    lernpfad_ids: string[];
  }[];
}
