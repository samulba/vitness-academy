import { createClient } from "@/lib/supabase/server";
import { ladeMeineLernpfade } from "@/lib/lernpfade";

export type Zertifikat = {
  id: string;
  user_id: string;
  learning_path_id: string;
  certificate_number: string;
  generated_at: string;
};

export type ZertifikatDetail = Zertifikat & {
  user_name: string | null;
  path_title: string;
  path_description: string | null;
};

/**
 * Holt das (max. eine) Zertifikat für User × Pfad.
 */
export async function ladeZertifikat(
  userId: string,
  pfadId: string,
): Promise<Zertifikat | null> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("user_path_certificates")
    .select("id, user_id, learning_path_id, certificate_number, generated_at")
    .eq("user_id", userId)
    .eq("learning_path_id", pfadId)
    .maybeSingle();
  return (data as Zertifikat | null) ?? null;
}

/**
 * Zertifikats-Detail mit User-Name + Pfad-Titel für die Druck-Seite.
 * Liest auch zugänglich für fremde User-IDs IF auth.uid() === userId
 * (durch RLS abgesichert).
 */
export async function ladeZertifikatDetail(
  certId: string,
): Promise<ZertifikatDetail | null> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("user_path_certificates")
    .select(
      `id, user_id, learning_path_id, certificate_number, generated_at,
       profiles:user_id ( full_name, first_name, last_name ),
       learning_paths:learning_path_id ( title, description )`,
    )
    .eq("id", certId)
    .maybeSingle();

  if (!data) return null;

  type Roh = {
    id: string;
    user_id: string;
    learning_path_id: string;
    certificate_number: string;
    generated_at: string;
    profiles: {
      full_name: string | null;
      first_name: string | null;
      last_name: string | null;
    } | null;
    learning_paths: {
      title: string;
      description: string | null;
    } | null;
  };
  const r = data as unknown as Roh;
  const name =
    [r.profiles?.first_name, r.profiles?.last_name].filter(Boolean).join(" ") ||
    r.profiles?.full_name ||
    null;

  return {
    id: r.id,
    user_id: r.user_id,
    learning_path_id: r.learning_path_id,
    certificate_number: r.certificate_number,
    generated_at: r.generated_at,
    user_name: name,
    path_title: r.learning_paths?.title ?? "",
    path_description: r.learning_paths?.description ?? null,
  };
}

/**
 * Erzeugt ein Zertifikat falls der Pfad zu 100% abgeschlossen ist
 * und noch keins existiert. Idempotent — Aufruf nach jedem
 * `lektionAbschliessen` ist sicher.
 */
export async function zertifikatErzeugenWennFertig(
  userId: string,
  pfadId: string,
): Promise<Zertifikat | null> {
  // Existiert schon eins?
  const existing = await ladeZertifikat(userId, pfadId);
  if (existing) return existing;

  // Pfad-Fortschritt holen
  const pfade = await ladeMeineLernpfade(userId);
  const pfad = pfade.find((p) => p.id === pfadId);
  if (!pfad || pfad.gesamt === 0 || pfad.abgeschlossen < pfad.gesamt) {
    return null;
  }

  // Anlegen
  const supabase = await createClient();
  const { data } = await supabase
    .from("user_path_certificates")
    .insert({ user_id: userId, learning_path_id: pfadId })
    .select("id, user_id, learning_path_id, certificate_number, generated_at")
    .single();
  return (data as Zertifikat | null) ?? null;
}
