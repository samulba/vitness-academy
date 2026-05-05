import { createClient } from "@/lib/supabase/server";

/**
 * Helper für Auswahl-Listen in Admin-Formularen.
 */
export async function ladePfadOptionen() {
  const supabase = await createClient();
  const { data } = await supabase
    .from("learning_paths")
    .select("id, title")
    .order("sort_order", { ascending: true });
  return (data ?? []) as { id: string; title: string }[];
}

export async function ladeModulOptionen() {
  const supabase = await createClient();
  const { data } = await supabase
    .from("modules")
    .select("id, title, learning_path_id")
    .order("sort_order", { ascending: true });
  return (data ?? []) as {
    id: string;
    title: string;
    learning_path_id: string;
  }[];
}

export async function ladeLektionOptionen() {
  const supabase = await createClient();
  const { data } = await supabase
    .from("lessons")
    .select("id, title, module_id")
    .order("sort_order", { ascending: true });
  return (data ?? []) as {
    id: string;
    title: string;
    module_id: string;
  }[];
}
